// Bu dosya, dashboard kartlarının değerlerine göre hangi durumda olduğunu hesaplar.
// Amaç, güvenli değer aralıklarını tek yerde tutarak görsel bileşenlerin yalnızca sonucu göstermesini sağlamaktır.
// OKUMA REHBERİ:
// export function birlikte yazıldığında fonksiyon adıyla dışa açılır; import eden dosya aynı adı {} içinde kullanır.
// Fonksiyon parantezindeki isim parametredir; çağıran kodun gönderdiği sayı fonksiyon içinde bu adla kullanılır.
// if (koşul) yalnız parantez içi true olduğunda kendisine ait süslü parantez bloğunu çalıştırır.
// >= büyük veya eşit, < küçük, > büyük karşılaştırması yapar ve true/false sonucu üretir.
// || mantıksal VEYA operatörüdür; iki koşuldan en az biri doğruysa bütün koşul doğru olur.
// return bir metni çağıran koda geri verir ve kalan satırları çalıştırmadan fonksiyonu bitirir.
// Bu yüzden önce kritik, sonra uyarı kontrol edilir; hiçbiri tutmazsa en alttaki normal sonucu döner.
// Tırnak içindeki critical, warning ve normal değerleri sayı değil JavaScript string metinleridir.
// Dönen değerler şunlar olacak:
// "normal"   → siyah/beyaz normal kart
// "warning"  → sarı uyarı kartı
// "critical" → kırmızı kritik kart

// Bu fonksiyon, motor suyu sıcaklığını eşiklerle karşılaştırıp normal, uyarı veya kritik durumunu döndürür.
// engineTempC parametresi santigrat derece cinsinden ölçülen motor sıcaklığıdır.
export function getEngineTempStatus(engineTempC) {
  // Motor sıcaklığı 111 °C ve üstündeyse kritik kabul ediyoruz.
  if (engineTempC >= 111) {
    // Kritik metni, kartın kırmızı kritik stilini seçmesini sağlar.
    return "critical";
  }

  // Motor sıcaklığı 101 °C ve üstündeyse uyarı kabul ediyoruz.
  if (engineTempC >= 101) {
    // Uyarı metni, kartın sarı uyarı stilini seçmesini sağlar.
    return "warning";
  }

  // Bunların dışındaki değerler normal kabul edilir.
  return "normal";
} // getEngineTempStatus fonksiyonunun gövdesini bitirir.

// Bu fonksiyon, yağ sıcaklığını tanımlı güvenlik eşikleriyle karşılaştırıp kartın durumunu belirler.
// oilTempC parametresi santigrat derece cinsinden ölçülen motor yağı sıcaklığıdır.
export function getOilTempStatus(oilTempC) {
  // Yağ sıcaklığı 116 °C ve üstündeyse kritik kabul ediyoruz.
  if (oilTempC >= 116) {
    // Kritik metni, yağ sıcaklığı kartının kırmızı görünmesini sağlar.
    return "critical";
  }

  // Yağ sıcaklığı 106 °C ve üstündeyse uyarı kabul ediyoruz.
  if (oilTempC >= 106) {
    // Uyarı metni, yağ sıcaklığı kartının sarı görünmesini sağlar.
    return "warning";
  }

  // Bunların dışındaki değerler normal kabul edilir.
  return "normal";
} // getOilTempStatus fonksiyonunun gövdesini bitirir.

// Bu fonksiyon, yağ basıncının güvenli seviyede olup olmadığını değerlendirip uygun durum metnini döndürür.
// oilPressureBar parametresi bar cinsinden ölçülen yağ basıncı değeridir.
export function getOilPressureStatus(oilPressureBar) {
  // Yağ basıncı 2.0 bar altına düşerse kritik kabul ediyoruz.
  if (oilPressureBar < 2.0) {
    // Kritik metni, tehlikeli düşük basıncın kırmızı kartla gösterilmesini sağlar.
    return "critical";
  }

  // Yağ basıncı 3.0 bar altına düşerse uyarı kabul ediyoruz.
  if (oilPressureBar < 3.0) {
    // Uyarı metni, düşmeye başlayan basıncın sarı kartla gösterilmesini sağlar.
    return "warning";
  }

  // 3.0 bar ve üstü şimdilik normal kabul edilir.
  return "normal";
} // getOilPressureStatus fonksiyonunun gövdesini bitirir.

// Bu fonksiyon, batarya voltajını alt ve üst sınırlarla karşılaştırıp normal, uyarı veya kritik sonucunu verir.
// batteryVoltage parametresi volt cinsinden ölçülen elektrik sistemi gerilimidir.
export function getBatteryVoltageStatus(batteryVoltage) {
  // Voltaj çok düşerse veya aşırı yükselirse kritik kabul ediyoruz.
  if (batteryVoltage < 12.2 || batteryVoltage > 15.2) {
    // Kritik metni, elektrik sistemi için tehlikeli gerilimin kırmızı gösterilmesini sağlar.
    return "critical";
  }

  // Voltaj normal aralığın dışına çıkmaya başlarsa uyarı kabul ediyoruz.
  if (batteryVoltage < 13.0 || batteryVoltage > 14.8) {
    // Uyarı metni, sınır dışına yaklaşan gerilimin sarı gösterilmesini sağlar.
    return "warning";
  }

  // 13.0 - 14.8 V arası şimdilik normal kabul edilir.
  return "normal";
} // getBatteryVoltageStatus fonksiyonunun gövdesini bitirir.
