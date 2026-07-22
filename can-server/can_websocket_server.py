# Bu dosya, Raspberry Pi üzerindeki can0 arayüzünden gerçek araç verisini okuyup React dashboard'a WebSocket ile gönderir.
# Amaç, mevcut frontend ve Node.js mock backend'i değiştirmeden gerçek Ecumaster CAN verisi için ayrı bir veri sağlayıcısı eklemektir.
# Bu sunucu yalnız gerçek araç modunda çalıştırılmalıdır; aynı 3001 portunu kullanan Node.js mock backend aynı anda açık olmamalıdır.
# Windows ortamında SocketCAN ve can0 bulunmadığı için gerçek CAN okuma çalışmaz; gerçek kullanım Linux/Raspberry Pi üzerindedir.

# asyncio, WebSocket bağlantılarını ve düzenli JSON yayınını aynı olay döngüsünde eş zamanlı yönetir.
import asyncio
# json, Python sözlüklerini frontend'in okuyabileceği JSON metnine dönüştürür.
import json
# logging, normal bilgi ve hata mesajlarını tarih-saat bilgisiyle terminale yazdırır.
import logging
# platform, programın Linux üzerinde çalışıp çalışmadığını güvenli biçimde kontrol eder.
import platform
# threading, bloklayan CAN okumasını WebSocket asyncio döngüsünden bağımsız bir arka plan thread'inde çalıştırır.
import threading
# time.monotonic(), sistem saati değişse bile sinyal yaşını güvenli biçimde ölçen sürekli artan bir sayaç sağlar.
import time
# datetime ve timezone, JSON içine UTC tabanlı ISO-8601 zaman damgası eklemek için kullanılır.
from datetime import datetime, timezone
# Path, DBC dosyasının yolunu işletim sisteminden bağımsız ve Python dosyasına göre hesaplar.
from pathlib import Path
# Any ve Optional, fonksiyonların alıp döndürdüğü veri türlerini okuyucuya açıklayan type hint'ler sağlar.
from typing import Any, Optional

# python-can paketi, Linux SocketCAN katmanındaki can0 arayüzünden ham CAN frame'lerini okur.
import can
# cantools paketi, DBC dosyasını yükler ve ham CAN byte'larını anlamlı ECU sinyallerine dönüştürür.
import cantools
# ServerConnection, bağlı tek bir WebSocket istemcisinin türünü; serve ise asyncio WebSocket sunucusunu temsil eder.
from websockets.asyncio.server import ServerConnection, serve
# ConnectionClosed, frontend bağlantısı normal veya hatalı biçimde kapandığında bunu güvenli şekilde yakalamayı sağlar.
from websockets.exceptions import ConnectionClosed


# LOG_FORMAT, terminalde her kaydın zaman, önem seviyesi ve mesajla gösterilmesini belirler.
LOG_FORMAT = "%(asctime)s | %(levelname)s | %(message)s"
# INFO seviyesi normal çalışma bilgisini gösterir; çok ayrıntılı DEBUG kayıtlarını varsayılan olarak gizler.
logging.basicConfig(level=logging.INFO, format=LOG_FORMAT)
# LOGGER, bu dosyadaki bütün log mesajlarının ortak ve isimlendirilmiş kayıt aracıdır.
LOGGER = logging.getLogger("can_websocket_server")


# WEBSOCKET_HOST yalnız aynı Raspberry Pi üzerindeki tarayıcının bağlanacağı yerel adresi ifade eder.
WEBSOCKET_HOST = "127.0.0.1"
# WEBSOCKET_PORT mevcut useVehicleData.js adresiyle uyumlu kalmak için 3001 olarak seçilmiştir.
WEBSOCKET_PORT = 3001
# CAN_INTERFACE, python-can tarafından kullanılacak Linux donanım arayüz türünü belirtir.
CAN_INTERFACE = "socketcan"
# CAN_CHANNEL, MCP2515 sürücüsü doğru kurulduğunda Linux'ta oluşması beklenen CAN ağ arayüzüdür.
CAN_CHANNEL = "can0"
# BROADCAST_FREQUENCY_HZ, frontend'e saniyede kaç vehicleData paketi gönderileceğini belirler.
BROADCAST_FREQUENCY_HZ = 10
# BROADCAST_INTERVAL_SECONDS, 10 Hz yayın için iki paket arasında beklenecek 0.1 saniyeyi hesaplar.
BROADCAST_INTERVAL_SECONDS = 1 / BROADCAST_FREQUENCY_HZ
# CAN_RECEIVE_TIMEOUT_SECONDS, CAN mesajı yokken thread'in durdurma isteğini düzenli kontrol etmesini sağlar.
CAN_RECEIVE_TIMEOUT_SECONDS = 1.0
# SIGNAL_STALE_AFTER_SECONDS, bu süreden eski bir sinyalin güvenli varsayılan değere dönmesini sağlar.
SIGNAL_STALE_AFTER_SECONDS = 2.0
# CLIENT_SEND_TIMEOUT_SECONDS, yavaş bir WebSocket istemcisinin yayın döngüsünü uzun süre durdurmasını önler.
CLIENT_SEND_TIMEOUT_SECONDS = 0.08
# CAN_THREAD_JOIN_TIMEOUT_SECONDS, kapanışta CAN thread'inin kendiliğinden bitmesi için beklenecek üst sınırdır.
CAN_THREAD_JOIN_TIMEOUT_SECONDS = CAN_RECEIVE_TIMEOUT_SECONDS + 1.0
# DBC_PATH, bu Python dosyasının yanındaki dbc klasöründe beklenen Ecumaster DBC dosyasının tam yolunu üretir.
DBC_PATH = Path(__file__).resolve().parent / "dbc" / "emu_black.dbc"


class LatestSignalStore:
    """Farklı CAN frame'lerinden gelen son sinyal değerlerini thread-safe biçimde saklar."""

    def __init__(self) -> None:
        """Boş sinyal sözlüklerini, son mesaj zamanını ve thread kilidini oluşturur."""

        # _latest_signals, RPM ve VSPD gibi her sinyal adının en son çözülen değerini tutar.
        self._latest_signals: dict[str, Any] = {}
        # _signal_timestamps, her sinyalin en son hangi monotonic zamanda güncellendiğini tutar.
        self._signal_timestamps: dict[str, float] = {}
        # _last_valid_message_at, en son başarılı DBC decode işleminin zamanını tutar; başlangıçta veri yoktur.
        self._last_valid_message_at: Optional[float] = None
        # Lock, CAN thread'i yazarken WebSocket döngüsünün yarım güncellenmiş veri okumasını engeller.
        self._lock = threading.Lock()

    def update(self, decoded_signals: dict[str, Any]) -> None:
        """Bir frame'den çözülen sinyalleri mevcut son değerlerle birleştirir ve zamanlarını günceller."""

        # Boş decode sonucu yeni bilgi taşımadığı için store üzerinde gereksiz işlem yapılmaz.
        if not decoded_signals:
            # return, fonksiyonun kalan satırlarını çalıştırmadan çağıran koda geri döner.
            return

        # Aynı frame içindeki bütün sinyaller için ortak ve karşılaştırılabilir güncelleme zamanı alınır.
        update_time = time.monotonic()

        # with bloğu sırasında kilit alınır; blok bittiğinde hata olsa bile kilit otomatik bırakılır.
        with self._lock:
            # update(), yalnız gelen frame'deki alanları yeniler; diğer frame'lerden saklanan sinyalleri korur.
            self._latest_signals.update(decoded_signals)
            # Döngü, bu frame içinde çözülen her sinyal adına aynı güncelleme zamanını yazar.
            for signal_name in decoded_signals:
                # Köşeli parantez, sözlükte signal_name anahtarına karşılık gelen alanı seçer veya oluşturur.
                self._signal_timestamps[signal_name] = update_time
            # En az bir sinyal başarıyla çözüldüğü için genel son geçerli CAN zamanı yenilenir.
            self._last_valid_message_at = update_time

    def snapshot(self) -> tuple[dict[str, Any], dict[str, float], Optional[float]]:
        """WebSocket tarafına değişmez bir anlık kopya vererek kilidin uzun süre tutulmasını önler."""

        # Kilit, üç ilişkili veri yapısının aynı güncelleme anını temsil eden tutarlı kopyalarını garanti eder.
        with self._lock:
            # dict(), iç sözlüklerin kopyasını üretir; çağıran kod store'un gerçek verisini değiştiremez.
            signal_values = dict(self._latest_signals)
            # Sinyal zamanları da bağımsız bir sözlük olarak kopyalanır.
            signal_timestamps = dict(self._signal_timestamps)
            # float veya None değişmez değer olduğu için doğrudan yerel isme alınabilir.
            last_valid_message_at = self._last_valid_message_at

        # tuple, değerler, sinyal zamanları ve son mesaj zamanını tek dönüşte çağıran koda verir.
        return signal_values, signal_timestamps, last_valid_message_at


class CanFrameDecoder:
    """Ham python-can mesajlarını DBC yardımıyla Ecumaster sinyal sözlüklerine dönüştürür."""

    def __init__(self, database: cantools.database.Database) -> None:
        """Önceden yüklenmiş DBC veritabanını ve kontrollü hata sayacını saklar."""

        # _database, her frame ID için mesaj ve sinyal tanımlarını içeren cantools veritabanıdır.
        self._database = database
        # _ignored_message_count, çok sayıda çözülemeyen frame olduğunda logların terminali doldurmasını önler.
        self._ignored_message_count = 0

    def decode(self, message: can.Message) -> Optional[dict[str, Any]]:
        """Tek bir CAN mesajını çözer; bilinmeyen veya bozuk mesajda sistemi durdurmak yerine None döndürür."""

        # try bloğu, üçüncü taraf DBC çözümlemesinden gelebilecek frame bazlı hataları sınırlar.
        try:
            # arbitration_id hangi DBC mesajının, data ise o mesajdaki ham byte'ların çözüleceğini belirtir.
            decoded_signals = self._database.decode_message(
                message.arbitration_id,
                message.data,
                # False seçimi, enum seçeneklerini yazı yerine mapper'ın değerlendirebileceği ham sayılar olarak tutar.
                decode_choices=False,
            )
            # dict(), cantools sonucunu normal ve bağımsız bir Python sözlüğüne dönüştürür.
            return dict(decoded_signals)
        # Exception burada yalnız tek frame sınırında yakalanır; beklenmeyen CAN mesajı bütün sunucuyu çökertmez.
        except Exception as error:  # noqa: BLE001 - CAN/DBC sınırında frame bazlı güvenli izolasyon amaçlanır.
            # Sayaç her yok sayılan mesajda bir artırılır.
            self._ignored_message_count += 1
            # İlk üç hata ve sonrasında her yüzüncü hata görünür yazılarak tekrar eden log gürültüsü azaltılır.
            if self._ignored_message_count <= 3 or self._ignored_message_count % 100 == 0:
                # %03X, CAN kimliğini kullanıcıların alışık olduğu üç haneli onaltılık biçimde gösterir.
                LOGGER.warning(
                    "CAN frame çözülemedi ve yok sayıldı: id=0x%03X, toplam=%s, hata=%s",
                    message.arbitration_id,
                    self._ignored_message_count,
                    error,
                )
            # None, çağıran CAN döngüsüne bu frame'den store'a yazılacak sinyal olmadığını bildirir.
            return None


class WebSocketHub:
    """WebSocket istemcilerini takip eder ve store'dan üretilen vehicleData JSON'unu 10 Hz yayınlar."""

    def __init__(self, signal_store: LatestSignalStore) -> None:
        """Ortak sinyal store'unu ve başlangıçta boş olan istemci kümesini saklar."""

        # _signal_store, her yayın anında güncel araç verisinin okunacağı ortak kaynaktır.
        self._signal_store = signal_store
        # set aynı istemciyi yalnız bir kez tutar ve bağlantı kapanınca hızlı silme sağlar.
        self._clients: set[ServerConnection] = set()

    async def handle_client(self, websocket: ServerConnection) -> None:
        """Yeni frontend bağlantısını kaydeder ve bağlantı kapanana kadar istemciyi takip eder."""

        # add(), yeni WebSocket bağlantısını yayın yapılacak istemci kümesine ekler.
        self._clients.add(websocket)
        # remote_address, bağlanan istemcinin ağ adresini geliştiriciye gösterir.
        LOGGER.info("WebSocket istemcisi bağlandı: %s", websocket.remote_address)

        # try/finally, bağlantı hangi nedenle biterse bitsin istemcinin kümeden çıkarılmasını garanti eder.
        try:
            # wait_closed(), frontend bağlantısı açık olduğu sürece bu handler coroutine'ini bekletir.
            await websocket.wait_closed()
        finally:
            # discard(), istemci zaten silinmiş olsa bile hata vermeden kümeden kaldırır.
            self._clients.discard(websocket)
            # Bağlantı kapanışı terminalde görünür hale getirilir.
            LOGGER.info("WebSocket istemcisi ayrıldı: %s", websocket.remote_address)

    async def broadcast_loop(self) -> None:
        """Bağlı istemci olmasa da düzenli çalışır; varsa güncel vehicleData paketini hepsine gönderir."""

        # while True sunucu görevi iptal edilene kadar devam eden sürekli yayın döngüsüdür.
        while True:
            # Mapper fonksiyonu farklı frame'lerden biriken sinyallerden eksiksiz frontend modelini üretir.
            vehicle_data = build_vehicle_data(self._signal_store)
            # dumps(), Python sözlüğünü WebSocket text frame olarak gönderilecek JSON string'e çevirir.
            payload = json.dumps(vehicle_data, ensure_ascii=False, separators=(",", ":"))

            # Küme boş değilse o anda bağlı istemciler için gönderim coroutine'leri hazırlanır.
            if self._clients:
                # tuple kopyası, gönderimler sürerken bir istemci ayrılırsa küme boyutu değişikliği hatasını önler.
                clients_snapshot = tuple(self._clients)
                # gather(), istemcilere gönderimleri aynı asyncio turunda eş zamanlı yürütür.
                await asyncio.gather(
                    # Her istemci için timeout ve bağlantı hatasını yöneten yardımcı coroutine çağrılır.
                    *(self._send_to_client(client, payload) for client in clients_snapshot),
                )

            # sleep(), olay döngüsünü bloklamadan 10 Hz için gereken süre kadar diğer görevlere zaman verir.
            await asyncio.sleep(BROADCAST_INTERVAL_SECONDS)

    async def _send_to_client(self, client: ServerConnection, payload: str) -> None:
        """Tek istemciye süre sınırlı gönderim yapar; yavaş veya kopmuş istemciyi güvenli biçimde çıkarır."""

        # try bloğu, bir istemcinin hatasının diğer istemcilere ve CAN okumasına yayılmasını önler.
        try:
            # wait_for(), send işlemi belirlenen sürede bitmezse asyncio.TimeoutError üretir.
            await asyncio.wait_for(
                client.send(payload),
                timeout=CLIENT_SEND_TIMEOUT_SECONDS,
            )
        # Normal bağlantı kapanışı veya süre aşımı aynı şekilde istemciyi yayın listesinden çıkarır.
        except (ConnectionClosed, asyncio.TimeoutError):
            # discard(), istemci kümede bulunmasa bile güvenle çalışır.
            self._clients.discard(client)
        # Beklenmeyen istemci hatası loglanır ancak ana yayın döngüsü çalışmaya devam eder.
        except Exception as error:  # noqa: BLE001 - istemci sınırındaki hata diğer bağlantılardan izole edilir.
            # warning seviyesi hatayı görünür kılar fakat sunucuyu durdurmaz.
            LOGGER.warning("WebSocket istemcisine veri gönderilemedi: %s", error)
            # Sorunlu istemci sonraki yayınlarda tekrar denenmemek üzere kümeden çıkarılır.
            self._clients.discard(client)


def ensure_linux_platform() -> None:
    """Gerçek SocketCAN kullanımının Linux üzerinde olduğunu doğrular ve Windows'ta anlaşılır hata üretir."""

    # platform.system(), Windows, Linux veya Darwin gibi işletim sistemi adını metin olarak verir.
    current_system = platform.system()
    # != karşılaştırması, işletim sistemi Linux değilse gerçek can0 bağlantısının mümkün olmadığını belirler.
    if current_system != "Linux":
        # RuntimeError teknik traceback yerine main fonksiyonunun kullanıcı dostu başlangıç hatası vermesini sağlar.
        raise RuntimeError(
            "Gerçek CAN sunucusu yalnız Linux/Raspberry Pi üzerinde SocketCAN ile çalışır. "
            f"Algılanan işletim sistemi: {current_system}. Windows geliştirmesinde Node mock backend'i kullanın."
        )


def load_dbc_database(dbc_path: Path) -> cantools.database.Database:
    """Ecumaster DBC dosyasını kontrol eder, yükler ve decode işlemlerinde kullanılacak veritabanını döndürür."""

    # exists(), planlanan dbc/emu_black.dbc dosyasının gerçekten oluşturulup oluşturulmadığını kontrol eder.
    if not dbc_path.exists():
        # DBC yoksa CAN byte'larının anlamı bilinmeyeceği için sunucu güvenli şekilde başlamaz.
        raise RuntimeError(
            f"DBC dosyası bulunamadı: {dbc_path}. "
            "backend/dbc/emu_black.dbc dosyasını can-server/dbc klasörüne kopyalayın."
        )

    # try bloğu bozuk veya desteklenmeyen DBC dosyasından gelen cantools hatasını anlaşılır hale getirir.
    try:
        # load_file(), dosyadaki mesaj, frame ID ve sinyal tanımlarını belleğe yükler.
        database = cantools.database.load_file(str(dbc_path))
    # Başlangıç sınırında bütün DBC okuma hataları tek ve kullanıcı dostu RuntimeError'a çevrilir.
    except Exception as error:  # noqa: BLE001 - üçüncü taraf DBC yükleme hataları başlangıçta tek mesajda sunulur.
        # from error özgün hatayı neden zincirinde korur; hata ayıklarken asıl sebep kaybolmaz.
        raise RuntimeError(f"DBC dosyası yüklenemedi: {dbc_path}. Hata: {error}") from error

    # Başarılı yükleme kaç CAN mesajı tanımı bulunduğunu terminalde gösterir.
    LOGGER.info("DBC yüklendi: %s | mesaj sayısı=%s", dbc_path, len(database.messages))
    # Hazır cantools veritabanı decoder sınıfına verilmek üzere çağıran koda döndürülür.
    return database


def open_can_bus() -> can.BusABC:
    """Linux can0 SocketCAN arayüzünü python-can üzerinden açar veya anlaşılır başlangıç hatası üretir."""

    # try bloğu can0 bulunmaması, kapalı arayüz veya desteklenmeyen interface hatalarını dönüştürür.
    try:
        # ignore_config=True, kullanıcı bilgisayarındaki başka python-can ayarlarının bu açık seçimi değiştirmesini engeller.
        bus = can.Bus(
            interface=CAN_INTERFACE,
            channel=CAN_CHANNEL,
            ignore_config=True,
        )
    # python-can farklı başlangıç sorunlarında CanError, OSError veya ValueError üretebilir.
    except (can.CanError, OSError, ValueError) as error:
        # Kullanıcıya hem beklenen arayüz hem de Linux tarafında kontrol edeceği komut açıkça söylenir.
        raise RuntimeError(
            f"{CAN_CHANNEL} CAN arayüzü açılamadı. "
            "Raspberry Pi SPI/MCP2515 ayarlarını ve `ip link show can0` çıktısını kontrol edin. "
            f"Hata: {error}"
        ) from error

    # channel_info, açılan SocketCAN kanalını terminalde doğrulamayı kolaylaştırır.
    LOGGER.info("CAN arayüzü açıldı: %s", bus.channel_info)
    # Açık bus nesnesi CAN okuma thread'ine verilmek üzere döndürülür.
    return bus


def read_can_messages(
    bus: can.BusABC,
    decoder: CanFrameDecoder,
    signal_store: LatestSignalStore,
    stop_event: threading.Event,
) -> None:
    """Arka plan thread'inde CAN frame'lerini okur, decode eder ve son sinyal store'una birleştirir."""

    # Log, WebSocket istemcisi olmasa bile CAN okuma görevinin başladığını gösterir.
    LOGGER.info("CAN okuma görevi başladı: channel=%s", CAN_CHANNEL)
    # consecutive_read_errors, aynı donanım hatasının her döngüde terminali doldurmasını önler.
    consecutive_read_errors = 0

    # is_set() false olduğu sürece programdan kapanış isteği gelmemiş demektir.
    while not stop_event.is_set():
        # try bloğu çalışma sırasında can0 geçici hata verirse WebSocket sunucusunun hemen çökmesini önler.
        try:
            # recv timeout ile bloklar; mesaj yoksa None döner ve döngü stop_event kontrolüne geri gelir.
            message = bus.recv(timeout=CAN_RECEIVE_TIMEOUT_SECONDS)
        # CanError, arayüz kapanması veya düşük seviye CAN okuma sorunlarını temsil eder.
        except can.CanError as error:
            # Ardışık hata sayısı kontrollü loglama için artırılır.
            consecutive_read_errors += 1
            # İlk hata ve her onuncu tekrar görünür yazılır; diğer tekrarlar sessizce bekler.
            if consecutive_read_errors == 1 or consecutive_read_errors % 10 == 0:
                LOGGER.error("CAN okuma hatası, yeniden denenecek: %s", error)
            # wait(), bir saniye beklerken stop_event gelirse normal sleep'ten daha hızlı çıkabilir.
            stop_event.wait(1.0)
            # continue, bu döngü turunun decode bölümünü atlayıp yeni okuma denemesine geçer.
            continue

        # Başarılı recv çağrısı, önceki ardışık hata serisinin bittiğini gösterir.
        consecutive_read_errors = 0
        # None gerçek frame olmadığı anlamına gelir; timeout sonrası döngü yeniden stop_event kontrol eder.
        if message is None:
            continue

        # Decoder tek frame'i DBC sinyal sözlüğüne çevirmeye çalışır.
        decoded_signals = decoder.decode(message)
        # None çözülemeyen frame demektir; bu frame store'a yazılmadan güvenli biçimde atlanır.
        if decoded_signals is None:
            continue

        # update(), yalnız bu frame'de gelen sinyalleri günceller ve diğer son değerleri korur.
        signal_store.update(decoded_signals)

    # Döngü kapanış isteğiyle bittiğinde thread'in normal şekilde çıktığı loglanır.
    LOGGER.info("CAN okuma görevi durdu.")


def get_fresh_signal(
    signal_values: dict[str, Any],
    signal_timestamps: dict[str, float],
    signal_name: str,
    default_value: Any,
    current_time: float,
) -> Any:
    """Sinyal mevcut ve güncelse değerini, eksik veya bayatsa güvenli varsayılanı döndürür."""

    # get(), sinyal zamanı bulunamazsa exception yerine None döndürür.
    updated_at = signal_timestamps.get(signal_name)
    # Zaman yoksa bu sinyal henüz hiçbir CAN frame'inde görülmemiştir.
    if updated_at is None:
        return default_value

    # Sinyalin yaşı, şu anki monotonic zamandan son güncelleme zamanının çıkarılmasıyla bulunur.
    signal_age = current_time - updated_at
    # Sinyal izin verilen süreden eskiyse artık araca ait güvenilir canlı değer sayılmaz.
    if signal_age > SIGNAL_STALE_AFTER_SECONDS:
        return default_value

    # Zamanı güncel sinyalin değeri get() ile okunur; beklenmedik eksiklikte yine default kullanılır.
    return signal_values.get(signal_name, default_value)


def safe_float(value: Any, default_value: float = 0.0) -> float:
    """DBC değerini float'a dönüştürür; beklenmeyen türde güvenli varsayılanı döndürür."""

    try:
        # float(), int veya sayısal metin gibi değerleri ondalıklı Python sayısına dönüştürür.
        return float(value)
    # TypeError uygun olmayan nesneyi, ValueError ise sayıya çevrilemeyen metni temsil eder.
    except (TypeError, ValueError):
        return default_value


def safe_int(value: Any, default_value: int = 0) -> int:
    """DBC değerini önce sayıya sonra en yakın tam sayıya dönüştürür; hatada varsayılanı döndürür."""

    try:
        # float ara dönüşümü ondalıklı veya sayısal metin değerlerini kabul eder; round en yakın tam sayıyı seçer.
        return round(float(value))
    except (TypeError, ValueError):
        return default_value


def normalize_gear(gear_value: Any) -> Any:
    """Eksik veya sıfır vitesi N yapar; geçerli sayısal vitesi tam sayı olarak döndürür."""

    # None eksik sinyali, sayısal sıfır ise Ecumaster tarafındaki boş vitesi temsil eder.
    if gear_value is None or safe_float(gear_value) == 0:
        return "N"

    # Sayıya çevrilebilen vites değerleri dashboard'da 3.0 yerine 3 görünmesi için tam sayıya dönüştürülür.
    try:
        return int(float(gear_value))
    # Beklenmeyen metinsel bir DBC değeri varsa bilgi kaybı olmaması için olduğu gibi korunur.
    except (TypeError, ValueError):
        return gear_value


def build_vehicle_data(signal_store: LatestSignalStore) -> dict[str, Any]:
    """Son ve güncel Ecumaster sinyallerini frontend'in beklediği vehicleData sözlüğüne dönüştürür."""

    # snapshot(), CAN thread'i çalışmaya devam ederken tutarlı ve bağımsız sözlük kopyaları verir.
    signal_values, signal_timestamps, last_valid_message_at = signal_store.snapshot()
    # Aynı vehicleData üretiminde bütün yaş hesaplarının ortak zamana göre yapılması için bir kez zaman alınır.
    current_time = time.monotonic()

    # get_fresh_signal, her alan için eksik veya bayat değer yerine güvenli varsayılan seçer.
    rpm = get_fresh_signal(signal_values, signal_timestamps, "RPM", 0, current_time)
    gear = get_fresh_signal(signal_values, signal_timestamps, "GEAR", None, current_time)
    speed = get_fresh_signal(signal_values, signal_timestamps, "VSPD", 0, current_time)
    engine_temperature = get_fresh_signal(signal_values, signal_timestamps, "CLT", 0, current_time)
    oil_pressure = get_fresh_signal(signal_values, signal_timestamps, "OILP", 0.0, current_time)
    battery_voltage = get_fresh_signal(signal_values, signal_timestamps, "BATT", 0.0, current_time)
    oil_temperature = get_fresh_signal(signal_values, signal_timestamps, "OILT", 0, current_time)
    error_alarm = get_fresh_signal(signal_values, signal_timestamps, "ERR_ALARM", 0, current_time)

    # Son geçerli mesaj hiç yoksa veya çok eskiyse CAN hattı bağlantısız kabul edilir.
    has_recent_can_data = (
        last_valid_message_at is not None
        and current_time - last_valid_message_at <= SIGNAL_STALE_AFTER_SECONDS
    )

    # Önce bağlantı yokluğu değerlendirilir; çünkü bayat ERR_ALARM değeri aktif hata gibi kullanılmamalıdır.
    if not has_recent_can_data:
        ecu_status = "DISCONNECTED"
    # Yakın zamanda CAN verisi varken ERR_ALARM bir ise ECU hata durumu bildirilir.
    elif safe_int(error_alarm) == 1:
        ecu_status = "ERROR"
    # CAN akışı güncel ve aktif alarm yoksa ECU normal kabul edilir.
    else:
        ecu_status = "OK"

    # return sözlüğü alan adlarını mevcut useVehicleData.js sözleşmesiyle birebir aynı tutar.
    return {
        "rpm": safe_int(rpm),
        "gear": normalize_gear(gear),
        "speedKmh": safe_int(speed),
        "engineTempC": safe_int(engine_temperature),
        "oilPressureBar": round(safe_float(oil_pressure), 1),
        "batteryVoltage": round(safe_float(battery_voltage), 1),
        "oilTempC": safe_int(oil_temperature),
        "ecuStatus": ecu_status,
        # timezone.utc saat dilimini açıkça UTC yapar; replace okunabilir Z UTC son ekini kullanır.
        "timestamp": datetime.now(timezone.utc).isoformat().replace("+00:00", "Z"),
        # source alanı frontend ve logların bu paketin gerçek CAN sunucusundan geldiğini anlamasını sağlar.
        "source": "can",
    }


async def run_websocket_server(signal_store: LatestSignalStore) -> None:
    """WebSocket sunucusunu başlatır ve iptal edilene kadar 10 Hz yayın görevini çalıştırır."""

    # Hub, istemci yönetimi ile vehicleData yayın sorumluluğunu tek nesnede toplar.
    websocket_hub = WebSocketHub(signal_store)

    # async with, sunucu görevi iptal olduğunda dinleme soketini ve istemcileri güvenli şekilde kapatır.
    async with serve(
        websocket_hub.handle_client,
        WEBSOCKET_HOST,
        WEBSOCKET_PORT,
    ):
        # Adres logu mevcut frontend'in hangi uç noktaya bağlanacağını açıkça gösterir.
        LOGGER.info(
            "Python CAN WebSocket sunucusu çalışıyor: ws://%s:%s | yayın=%s Hz",
            WEBSOCKET_HOST,
            WEBSOCKET_PORT,
            BROADCAST_FREQUENCY_HZ,
        )
        # Bu coroutine sürekli döndüğü için async with bloğu program kapanana kadar açık kalır.
        await websocket_hub.broadcast_loop()


def main() -> int:
    """Bileşenleri doğru sırayla kurar, sunucuyu çalıştırır ve kapanış kaynaklarını temizler."""

    # bus ve thread başlangıçta None tutulur; kurulum yarıda hata verirse yalnız oluşan kaynaklar temizlenir.
    bus: Optional[can.BusABC] = None
    can_thread: Optional[threading.Thread] = None
    # stop_event, asyncio ana thread'inden CAN okuma thread'ine kapanış isteği iletir.
    stop_event = threading.Event()

    # try/finally, başlangıç veya çalışma sırasında hata olsa bile CAN kaynağının kapatılmasını garanti eder.
    try:
        # Gerçek can0 bağlantısından önce işletim sistemi desteği doğrulanır.
        ensure_linux_platform()
        # DBC yalnız başlangıçta bir kez yüklenir ve bütün frame decode işlemlerinde tekrar kullanılır.
        database = load_dbc_database(DBC_PATH)
        # SocketCAN bus açılır; can0 yoksa burada anlaşılır RuntimeError oluşur.
        bus = open_can_bus()
        # Store, CAN okuma thread'i ile WebSocket asyncio görevi arasında güvenli veri köprüsüdür.
        signal_store = LatestSignalStore()
        # Decoder, yüklenmiş DBC veritabanını tek frame çözme sorumluluğuyla sarar.
        decoder = CanFrameDecoder(database)

        # Thread hedefi olan read_can_messages için gerekli bağımlılıklar args tuple'ında sırayla verilir.
        can_thread = threading.Thread(
            target=read_can_messages,
            args=(bus, decoder, signal_store, stop_event),
            # Açıklayıcı ad, hata ayıklama araçlarında thread'in görevini görünür kılar.
            name="can-reader",
            # daemon True yedek güvenliktir; normal kapanış yine stop_event ve join ile yapılır.
            daemon=True,
        )
        # start(), CAN okuma döngüsünü WebSocket olay döngüsünü bloklamayan ayrı thread'de başlatır.
        can_thread.start()

        # asyncio.run(), WebSocket coroutine'ini yeni olay döngüsünde çalıştırır ve bitince döngüyü kapatır.
        asyncio.run(run_websocket_server(signal_store))
        # Sunucu beklenmedik biçimde normal dönerse sıfır başarılı çıkış kodu kullanılır.
        return 0
    # Ctrl+C, operatörün sunucuyu isteyerek kapattığı normal durumdur ve uzun traceback gösterilmez.
    except KeyboardInterrupt:
        LOGGER.info("Kapatma isteği alındı; CAN ve WebSocket kaynakları temizleniyor.")
        return 0
    # RuntimeError, işletim sistemi, DBC veya can0 başlangıç kontrollerindeki kullanıcı dostu hataları taşır.
    except RuntimeError as error:
        LOGGER.error("Sunucu başlatılamadı: %s", error)
        return 1
    # OSError çoğunlukla 3001 portunun Node mock backend veya başka süreç tarafından kullanıldığını belirtir.
    except OSError as error:
        LOGGER.error(
            "WebSocket portu açılamadı: %s. Node mock backend'in aynı anda çalışmadığını kontrol edin.",
            error,
        )
        return 1
    finally:
        # Event set edilince CAN okuma while döngüsü en geç recv timeout sonunda sona erer.
        stop_event.set()
        # Thread gerçekten başlatıldıysa kontrollü bitmesi için sınırlı süre beklenir.
        if can_thread is not None:
            can_thread.join(timeout=CAN_THREAD_JOIN_TIMEOUT_SECONDS)
        # Bus başarıyla açıldıysa işletim sistemi CAN soketi serbest bırakılır.
        if bus is not None:
            bus.shutdown()
        # Son log, kaynak temizleme aşamasının tamamlandığını gösterir.
        LOGGER.info("Python CAN sunucusu durduruldu.")


# __name__ yalnız bu dosya doğrudan `python can_websocket_server.py` ile çalıştırıldığında "__main__" olur.
if __name__ == "__main__":
    # SystemExit, main fonksiyonunun 0 veya 1 sonucunu işletim sisteminin süreç çıkış koduna dönüştürür.
    raise SystemExit(main())
