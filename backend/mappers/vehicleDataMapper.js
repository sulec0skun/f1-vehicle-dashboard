// Bu dosya, Ecumaster ECU'dan çözülen ham sinyal adlarını frontend'in beklediği vehicleData modeline dönüştürür.
// Amaç, CAN/DBC alan adları ile arayüz veri modeli arasındaki çeviri ve normalleştirme kurallarını tek yerde toplamaktır.
// OKUMA REHBERİ:
// Fonksiyon parantezindeki signals, çağıran veri kaynağının gönderdiği ECU sinyal nesnesi parametresidir.
// return {...} frontend alan adlarına sahip yeni bir nesne üretip çağıran koda geri verir.
// rpm: ifade yazımında soldaki rpm yeni alan adı, sağdaki ifade bu alana hesaplanacak değerdir.
// signals.RPM nokta ile gelen nesnenin RPM alanını okur; küçük ve büyük harfler JavaScript'te farklıdır.
// değer ?? 0 nullish coalescing operatörüdür; değer null veya undefined ise güvenli olarak 0 seçer.
// Math.round(...) en yakın tam sayıyı, roundToOneDecimal(...) ise bu dosyadaki yardımcı fonksiyon sonucunu verir.
// normalizeGear ve getEcuStatus fonksiyonları tanımlanmadan önce çağrılabilir; function bildirimleri yukarı taşınır.
// === kesin eşitlik, || mantıksal VEYA, return ise sonucu verip fonksiyonu hemen bitirme anlamına gelir.
// value * 10 ve sonuç / 10 işlemi sayıyı tek ondalık basamakta yuvarlamak için birlikte kullanılır.
// module.exports yalnız ana mapper'ı dışa açar; yardımcı fonksiyonlar bu dosyanın içinde özel kalır.

// Bu fonksiyon, Ecumaster sinyallerini güvenli varsayılanlarla okuyup standart araç verisi alanlarına eşler.
// signals parametresi çözülmüş ECU değerlerini içerir; sonuç WebSocket ile gönderilebilecek vehicleData nesnesidir.
function mapEcumasterSignalsToVehicleData(signals) {
  // Dönüş nesnesi, backend ve frontend arasında kullanılan ortak alan adlarını tek yapıda toplar.
  return {
    rpm: Math.round(signals.RPM ?? 0), // Eksik RPM'i sıfır kabul eder ve gösterim için en yakın tam sayıya yuvarlar.
    gear: normalizeGear(signals.GEAR), // Ham vites değerini N veya sayısal vites biçimine normalleştirir.
    speedKmh: Math.round(signals.VSPD ?? 0), // Eksik hızı sıfır kabul edip kilometre/saat değerini tam sayıya yuvarlar.
    engineTempC: Math.round(signals.CLT ?? 0), // Soğutma sıvısı sıcaklığını tam santigrat dereceye yuvarlar.
    oilPressureBar: roundToOneDecimal(signals.OILP ?? 0), // Yağ basıncını dashboard için tek ondalık basamakta tutar.
    batteryVoltage: roundToOneDecimal(signals.BATT ?? 0), // Batarya gerilimini tek ondalık basamakla gösterime hazırlar.
    oilTempC: Math.round(signals.OILT ?? 0), // Motor yağı sıcaklığını en yakın tam santigrat dereceye yuvarlar.
    ecuStatus: getEcuStatus(signals), // ERR_ALARM sinyalinden kullanıcıya gösterilecek OK veya ERROR durumunu üretir.
    timestamp: new Date().toISOString(), // Dönüşümün yapıldığı anı standart ISO zaman metni olarak pakete ekler.
    source: "can", // Bu veri paketinin CAN veri kaynağı üzerinden üretildiğini belirtir.
  };
} // mapEcumasterSignalsToVehicleData fonksiyon gövdesini bitirir.

// Bu yardımcı fonksiyon, eksik, null veya sıfır vites değerini boş vites anlamındaki "N" metnine dönüştürür.
// Diğer vites değerlerini değiştirmeden döndürerek ekrandaki gösterimi standartlaştırır.
function normalizeGear(gearValue) {
  // ECU vites sinyalini hiç göndermediyse güvenli ve anlaşılır bir boş vites değeri kullanır.
  if (gearValue === undefined || gearValue === null) {
    // N metni, eksik vites bilgisinin arayüzde sayı gibi görünmesini önler.
    return "N";
  }

  // Ecumaster protokolündeki sıfır değeri boş vitesi temsil ettiği için özel olarak ele alınır.
  if (gearValue === 0) {
    // Dashboard'da sıfır yerine sürücünün anlayacağı N harfini gösterir.
    return "N";
  }

  // Sıfır dışındaki geçerli vites değerlerini değiştirmeden frontend'e aktarır.
  return gearValue;
} // normalizeGear yardımcı fonksiyonunun gövdesini bitirir.

// Bu yardımcı fonksiyon, ECU hata alarmı sinyaline bakarak bağlantı durumunun ERROR veya OK metnini üretir.
// signals parametresi içinde ERR_ALARM değeri 1 olduğunda hata durumu döndürülür.
function getEcuStatus(signals) {
  // ERR_ALARM sinyalinin bir olması ECU'nun aktif hata bildirdiği anlamına gelir.
  if (signals.ERR_ALARM === 1) {
    // ERROR metni, alt bilgi bileşeninde hata durumunun açıkça görünmesini sağlar.
    return "ERROR";
  }

  // Aktif alarm bulunmadığında ECU durumunu normal çalışma anlamındaki OK olarak döndürür.
  return "OK";
} // getEcuStatus yardımcı fonksiyonunun gövdesini bitirir.

// Bu yardımcı fonksiyon, ondalıklı sensör değerini virgülden sonra tek basamak kalacak şekilde yuvarlar.
// Böylece basınç ve voltaj gibi değerler dashboard'da gereksiz uzunlukta gösterilmez.
function roundToOneDecimal(value) {
  // Önce 10 ile çarpıp tam sayıya yuvarlamak, sonra 10'a bölmek tek ondalık basamak bırakır.
  return Math.round(value * 10) / 10;
} // roundToOneDecimal yardımcı fonksiyonunun gövdesini bitirir.

// CommonJS dışa aktarımı, veri kaynaklarının ana dönüşüm fonksiyonuna erişmesini sağlar.
module.exports = {
  mapEcumasterSignalsToVehicleData, // Yalnızca dışarıdan kullanılması gereken ana mapper fonksiyonunu yayınlar.
}; // module.exports nesnesini ve dışa aktarım atamasını bitirir.
