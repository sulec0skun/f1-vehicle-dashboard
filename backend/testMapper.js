// Bu dosya, örnek Ecumaster sinyallerinin dashboard vehicleData modeline doğru biçimde çevrildiğini elle gözlemlemek için kullanılır.
// Amaç, gerçek CAN bağlantısı olmadan mapper çıktısını terminalde hızlıca kontrol edebilecek küçük bir deneme senaryosu sağlamaktır.
// OKUMA REHBERİ:
// require göreli yoldaki CommonJS modülünü çalıştırır ve module.exports nesnesini döndürür.
// const { mapEcumasterSignalsToVehicleData } nesne parçalama ile yalnız istenen fonksiyonu yerel isme alır.
// ./ mevcut backend klasöründen, /mappers ise onun alt klasöründen devam eden göreli yolu belirtir.
// sampleEcumasterSignals = {...} anahtar: değer çiftlerinden oluşan bir JavaScript nesnesidir.
// Büyük harfli RPM, VSPD gibi anahtarlar ECU/DBC sinyal adlarıyla aynı tutulmuştur.
// Fonksiyon çağrısındaki () içine sampleEcumasterSignals yazılması, nesnenin parametre olarak mapper'a gönderilmesidir.
// console.log(...) değeri değiştirmez; yalnız geliştiricinin terminalde görebilmesi için yazdırır.

// Testte kullanılacak dönüşüm fonksiyonunu mapper modülünden alır.
const {
  mapEcumasterSignalsToVehicleData,
} = require("./mappers/vehicleDataMapper");

// sampleEcumasterSignals, gerçek ECU bağlantısı olmadan dönüşümü denemek için örnek ham sinyalleri tutar.
const sampleEcumasterSignals = {
  RPM: 6420, // Motorun dakikadaki örnek devir sayısını temsil eder.
  VSPD: 118, // Aracın kilometre/saat cinsinden örnek hızını temsil eder.
  CLT: 92, // Motor soğutma sıvısının santigrat cinsinden örnek sıcaklığıdır.
  OILP: 4.3, // Motor yağının bar cinsinden örnek basıncıdır.
  OILT: 104, // Motor yağının santigrat cinsinden örnek sıcaklığıdır.
  BATT: 13.8, // Araç elektrik sisteminin volt cinsinden örnek gerilimidir.
  GEAR: 3, // Şanzımanın örnek olarak üçüncü viteste olduğunu belirtir.
  ERR_ALARM: 0, // Sıfır değeri, örnek ECU verisinde aktif hata alarmı olmadığını belirtir.
}; // Süslü parantez örnek sinyal nesnesini, noktalı virgül const bildirimini bitirir.

const vehicleData = mapEcumasterSignalsToVehicleData(sampleEcumasterSignals); // Ham örnek sinyalleri frontend'in beklediği araç veri modeline dönüştürür.

console.log(vehicleData); // Elde edilen nesneyi elle incelenebilmesi için terminale yazdırır.
