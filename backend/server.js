// Bu dosya, araç verisini seçilen veri kaynağından alıp WebSocket üzerinden React dashboard'a gönderir.
// Amaç, mock ve gerçek CAN verisi arasında tek noktadan seçim yaparak frontend'e düzenli veri akışı sağlamaktır.
// OKUMA REHBERİ:
// Backend CommonJS kullanır; require("paket") başka modülün module.exports ile verdiği değeri içeri alır.
// const { WebSocketServer } = ... nesne parçalamadır; gelen nesneden yalnız WebSocketServer alanını ayırır.
// const yeniden atanmayacak isim, büyük harfli sabit adları ise proje genelinde ayar değeri olduğunu belirtir.
// new WebSocketServer({ port: ... }) belirtilen ayar nesnesiyle yeni bir sunucu örneği oluşturur.
// if (A === B) kesin eşitlik karşılaştırması yapar; doğruysa kendi süslü parantez bloğu çalışır.
// wss.on("connection", callback) bir olay dinleyicisidir; bağlantı olduğunda callback'e ws nesnesi verilir.
// () => {...} ok fonksiyonu kısa callback yazımıdır; parantezdeki isim varsa dışarıdan gelen parametredir.
// setInterval(callback, süre) callback'i tekrarlar; clearInterval kimliği kullanarak tekrarı durdurur.
// JSON.stringify(nesne) JavaScript nesnesini ağdan gönderilebilen JSON metnine çevirir.
// `...${değer}...` ters tırnaklı template literal'dır; ${} JavaScript değerini metnin içine yerleştirir.

const { WebSocketServer } = require("ws"); // Tarayıcılarla WebSocket bağlantısı kuracak sunucu sınıfını ws paketinden alır.

// Mock veri üreten fonksiyon, gerçek CAN donanımı olmadan dashboard'u beslemek için içe aktarılır.
const {
  generateMockVehicleData,
} = require("./dataSources/mockVehicleDataSource");

const { getCanVehicleData } = require("./dataSources/canVehicleDataSource"); // Gerçek CAN akışını temsil eden veri kaynağı fonksiyonunu getirir.

const WEBSOCKET_PORT = 3001; // Frontend'in bağlanacağı yerel WebSocket portunu tek noktada tanımlar.
const DATA_SEND_INTERVAL_MS = 500; // Bağlı istemciye iki veri paketi arasında beklenecek milisaniye süresini belirler.

// For now, use "mock".
// Later on Raspberry Pi, this can be changed to "can".
// Bu sabit "mock" iken simülasyonu, "can" olduğunda Raspberry Pi CAN kaynağını seçer.
const ACTIVE_DATA_SOURCE = "mock"; // String değer mock seçimini temsil eder; can yazılırsa getVehicleData diğer dala girer.

const wss = new WebSocketServer({ port: WEBSOCKET_PORT }); // Belirlenen portu dinlemeye başlayan WebSocket sunucusu örneğini oluşturur.

// Bu fonksiyon, etkin veri kaynağı ayarına göre CAN veya mock araç verisini seçip döndürür.
// Böylece WebSocket gönderim kodu, verinin hangi kaynaktan geldiğini bilmek zorunda kalmaz.
function getVehicleData() {
  // Veri kaynağı "can" seçildiyse gerçek araç akışını temsil eden CAN fonksiyonuna yönlenir.
  if (ACTIVE_DATA_SOURCE === "can") {
    // CAN kaynağının mapper'dan geçirdiği standart vehicleData nesnesini çağırana verir.
    return getCanVehicleData();
  }

  // Kaynak CAN değilse geliştirme için her çağrıda değişen mock araç verisini döndürür.
  return generateMockVehicleData();
} // getVehicleData fonksiyon gövdesini kapatır.

// Bu bağlantı callback'i, yeni bir dashboard istemcisi bağlandığında ilk veriyi ve periyodik veri akışını başlatır.
wss.on("connection", (ws) => {
  // Yeni istemcinin başarıyla bağlandığını backend terminalinde görünür hale getirir.
  console.log("Frontend dashboard connected.");
  // Hangi veri kaynağının kullanıldığını geliştirme ve hata ayıklama için terminale yazar.
  console.log(`Active data source: ${ACTIVE_DATA_SOURCE}`);

  // İstemcinin ilk 500 ms'yi beklememesi için bağlantı kurulur kurulmaz bir araç verisi paketi gönderir.
  ws.send(JSON.stringify(getVehicleData()));

  // Bu zamanlayıcı callback'i, belirlenen aralıkta güncel araç verisini bağlı istemciye gönderir.
  const intervalId = setInterval(() => {
    // Her zamanlayıcı çalışmasında veri kaynağından en güncel vehicleData nesnesini alır.
    const vehicleData = getVehicleData();
    // JavaScript nesnesini ağ üzerinden gönderilebilen JSON metnine çevirip istemciye yollar.
    ws.send(JSON.stringify(vehicleData));
  }, DATA_SEND_INTERVAL_MS); // Zamanlayıcının tekrar aralığını üstteki merkezi sabitten okur.

  // Bu olay callback'i, istemci bağlantısı kapandığında ona ait veri gönderme zamanlayıcısını temizler.
  ws.on("close", () => {
    // Dashboard istemcisinin ayrıldığını backend terminaline yazar.
    console.log("Frontend dashboard disconnected.");
    // Artık alıcısı olmayan veri paketlerinin üretilip gönderilmesini durdurur.
    clearInterval(intervalId);
  });

  // Bu olay callback'i, istemci bağlantısında hata oluştuğunda hatayı kaydeder ve zamanlayıcıyı durdurur.
  ws.on("error", (error) => {
    // Hata ayrıntısını terminale yazarak bağlantı sorununun incelenebilmesini sağlar.
    console.error("WebSocket client error:", error);
    // Hatalı bağlantı için veri üretmeye devam edilmesini önler.
    clearInterval(intervalId);
  }); // error olayına verilen callback'i ve ws.on çağrısını bitirir.
}); // connection callback'ini ve wss.on çağrısını bitirir.

console.log(`WebSocket backend running on ws://localhost:${WEBSOCKET_PORT}`); // Sunucunun hazır olduğunu ve bağlantı adresini terminalde bildirir.
