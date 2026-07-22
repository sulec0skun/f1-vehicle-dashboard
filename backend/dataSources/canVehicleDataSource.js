// Bu dosya, gelecekte Raspberry Pi üzerindeki gerçek CAN verisini dashboard modeline aktaracak veri kaynağını tanımlar.
// Amaç, CAN okuma ayrıntılarını sunucudan ayırmak ve geliştirme tamamlanana kadar örnek çözülmüş sinyaller kullanmaktır.
// OKUMA REHBERİ:
// require("../mappers/...") içindeki .. bir üst backend klasörüne çıkıp mappers klasörüne geçer.
// const { fonksiyon } nesne parçalama ile CommonJS dışa aktarımından yalnız gerekli mapper'ı alır.
// Fonksiyon içindeki /* ... */ çok satırlı yorumdur; JavaScript motoru bu metni çalıştırmaz.
// sampleDecodedEcumasterSignals nesnesi DBC çözücüsünün ileride üreteceği anahtarları örnekler.
// Anahtarlar ECU sinyal adları, iki noktadan sonraki sayılar ise bu anahtarlara ait geçici değerlerdir.
// return mapperFonksiyonu(nesne) önce mapper'ı çalıştırır, sonra mapper'ın sonucunu server.js dosyasına geri verir.
// module.exports içindeki getCanVehicleData kısa alan yazımıdır ve fonksiyonu başka dosyaların kullanımına açar.

// Mapper fonksiyonu, DBC ile çözülen ECU sinyallerini dashboard veri modeline çevirmek için içe aktarılır.
const {
  mapEcumasterSignalsToVehicleData,
} = require("../mappers/vehicleDataMapper");

// Bu fonksiyon, çözülmüş Ecumaster CAN sinyallerini mapper'a vererek standart vehicleData nesnesi döndürür.
// Gerçek CAN okuması henüz etkin olmadığı için şu anda bağlantısız durumu temsil eden örnek sinyaller kullanır.
function getCanVehicleData() {
  /*
    Aşağıdaki İngilizce TODO bloğunun Türkçe özeti:
    - Raspberry Pi üzerindeki can0 arayüzünden ham CAN çerçeveleri okunacaktır.
    - EMU Black DBC dosyası, ham baytları RPM, hız, sıcaklık, basınç, voltaj, vites ve hata sinyallerine çevirecektir.
    - Çözülen sinyaller mapEcumasterSignalsToVehicleData fonksiyonuyla frontend'in ortak modeline dönüştürülecektir.
    - Son vehicleData nesnesi WebSocket sunucusuna döndürülecektir.
    - Donanım ve Linux CAN kurulumu tamamlanmadığı için bu akış şu anda örnek sinyallerle temsil edilmektedir.
  */
  /*
    TODO:
    This function will be responsible for reading real CAN data.

    Planned real flow on Raspberry Pi:

    1. Read CAN frames from can0 interface.
       Example raw frame:
       CAN ID: 0x602
       DATA: 10 20 30 40 50 60 70 80

    2. Decode CAN frames using the EMU Black DBC file.
       DBC signals we need:
       - RPM
       - VSPD
       - CLT
       - OILP
       - OILT
       - BATT
       - GEAR
       - ERR_ALARM

    3. Convert decoded Ecumaster signals to the dashboard vehicleData model
       using mapEcumasterSignalsToVehicleData().

    4. Return the final vehicleData object to the WebSocket server.

    Current status:
    Real CAN reading is not active yet because MCP2515/TJA1050 hardware,
    Raspberry SPI configuration, can0 setup and vehicle CAN test are not completed.
  */

  // Bu geçici nesne, gerçek can0 okuması eklenene kadar çözülmüş ECU sinyallerinin şeklini temsil eder.
  const sampleDecodedEcumasterSignals = {
    RPM: 0, // Motor devri okunmadığı için başlangıç değerini sıfır verir.
    VSPD: 0, // Araç hızı okunmadığı için başlangıç değerini sıfır verir.
    CLT: 0, // Soğutma sıvısı sıcaklığı okunmadığı için sıfır kullanır.
    OILP: 0, // Yağ basıncı okunmadığı için sıfır kullanır.
    OILT: 0, // Yağ sıcaklığı okunmadığı için sıfır kullanır.
    BATT: 0, // Batarya gerilimi okunmadığı için sıfır kullanır.
    GEAR: 0, // Sıfır vites değeri mapper tarafından boş vites anlamındaki N değerine çevrilir.
    ERR_ALARM: 1, // Bir değeri ECU verisinin henüz hazır olmadığını ERROR durumu olarak gösterir.
  };

  // Örnek çözülmüş sinyalleri ortak vehicleData biçimine çevirip WebSocket sunucusuna döndürür.
  return mapEcumasterSignalsToVehicleData(sampleDecodedEcumasterSignals);
} // getCanVehicleData fonksiyon gövdesini bitirir.

// CommonJS dışa aktarımı, WebSocket sunucusunun CAN veri kaynağı fonksiyonunu çağırabilmesini sağlar.
module.exports = {
  getCanVehicleData, // Fonksiyonu bu modülün dışından erişilebilir hale getirir.
}; // module.exports nesnesini ve dışa aktarım atamasını bitirir.
