// Bu dosya, gerçek araç ve CAN bağlantısı olmadan dashboard'u geliştirmek için değişen örnek araç verileri üretir.
// Amaç, RPM, hız, vites ve uyarı değerlerini taklit ederek frontend veri akışının sürekli denenebilmesini sağlamaktır.
// OKUMA REHBERİ:
// let değeri daha sonra değiştirilecek isim tanımlar; const ise aynı isme yeniden değer atanmayacağını belirtir.
// Bu dört let modül seviyesindedir; fonksiyon her çağrıldığında sıfırlanmaz ve önceki çağrının değerini korur.
// += sağdaki sonucu mevcut değere ekleyip aynı değişkene geri yazar; direction -1 ise sonuç azalma olur.
// if ve else if koşulları yukarıdan aşağı değerlendirilir; ilk doğru dal çalışır, diğer dallar atlanır.
// Math.round(...) sayıyı en yakın tam sayıya yuvarlayan hazır JavaScript metodudur.
// / bölme, * çarpma, >= büyük-eşit ve < küçük karşılaştırma operatörleridir.
// koşul ? doğruDeğer : yanlışDeğer üçlü koşuldur ve tek satırda iki sonuçtan birini seçer.
// return {...} yeni vehicleData nesnesini çağıran server.js dosyasına geri verir.
// Nesne içindeki yalnız rpm, gear yazımı kısa alan sözdizimidir; rpm: rpm ile aynı anlama gelir.
// new Date().toISOString() yeni zamanı üretir ve ortak ISO metin biçimine dönüştürür.
// module.exports CommonJS modülünün başka dosyalara hangi değerleri sunacağını belirler.

let rpm = 1000; // Ardışık çağrılar arasında korunacak simüle edilmiş motor devrini rölanti değerinden başlatır.
let speedKmh = 0; // RPM'e bağlı hesaplanacak simüle edilmiş araç hızını sıfırdan başlatır.
let gear = 1; // Hız aralığına göre değişecek örnek vitesi birinci vitesten başlatır.
let direction = 1; // Pozitif bir değerin RPM'in ilk aşamada yükselmesini sağlaması için yönü belirler.

// Bu fonksiyon, RPM değerini ileri ve geri hareket ettirerek buna bağlı örnek hız, vites ve sensör verileri oluşturur.
// Parametre almaz; WebSocket üzerinden gönderilmeye hazır bir vehicleData nesnesi döndürür.
function generateMockVehicleData() {
  rpm += direction * 250; // Her çağrıda RPM'i seçili yönde 250 artırır veya azaltır.

  // RPM üst simülasyon sınırına ulaştığında sonraki çağrıların değeri düşürmesini sağlar.
  if (rpm >= 8500) {
    direction = -1; // Negatif yön, izleyen çağrılarda RPM'den 250 çıkarılacağı anlamına gelir.
  }

  // RPM alt simülasyon sınırına geri döndüğünde değerin yeniden yükselmesini sağlar.
  if (rpm <= 1000) {
    direction = 1; // Pozitif yön, izleyen çağrılarda RPM'e tekrar 250 ekleneceği anlamına gelir.
  }

  speedKmh = Math.round((rpm / 8500) * 180); // RPM oranını 0-180 km/h aralığına ölçekleyip tam sayıya yuvarlar.

  // 40 km/h altındaki örnek hızlarda birinci vitesi seçer.
  if (speedKmh < 40) {
    gear = 1; // Düşük hız aralığını birinci vites olarak gösterir.
  // 40 dahil, 80 km/h altındaki örnek hızlarda ikinci vitesi seçer.
  } else if (speedKmh < 80) {
    gear = 2; // İkinci hız aralığını ikinci vites olarak gösterir.
  // 80 dahil, 120 km/h altındaki örnek hızlarda üçüncü vitesi seçer.
  } else if (speedKmh < 120) {
    gear = 3; // Üçüncü hız aralığını üçüncü vites olarak gösterir.
  // 120 dahil, 160 km/h altındaki örnek hızlarda dördüncü vitesi seçer.
  } else if (speedKmh < 160) {
    gear = 4; // Dördüncü hız aralığını dördüncü vites olarak gösterir.
  // 160 km/h ve üzerindeki örnek hızlarda beşinci vitesi seçer.
  } else {
    gear = 5; // En yüksek hız aralığını beşinci vites olarak gösterir.
  }

  // Hesaplanan simülasyon değerlerini frontend'in beklediği ortak vehicleData biçiminde döndürür.
  return {
    rpm, // O anki simüle edilmiş motor devrini nesneye ekler.
    gear, // Hız aralığından seçilen simüle edilmiş vitesi nesneye ekler.
    speedKmh, // RPM oranından hesaplanan simüle edilmiş hızı nesneye ekler.
    engineTempC: 92, // Motor sıcaklığını normal aralıkta sabit bir örnek değer olarak verir.
    oilPressureBar: rpm > 7000 ? 2.4 : 4.3, // Yüksek RPM'de uyarıyı göstermek için yağ basıncını düşük, diğer durumda normal verir.
    batteryVoltage: 13.8, // Batarya gerilimini normal çalışma aralığında sabit tutar.
    oilTempC: rpm > 7500 ? 116 : 104, // Çok yüksek RPM'de kritik sıcaklık, diğer durumda normal sıcaklık üretir.
    ecuStatus: "OK", // Mock kaynağının ECU bağlantısını başarılı kabul ettiğini belirtir.
    timestamp: new Date().toISOString(), // Paketin üretildiği zamanı standart ISO metni olarak ekler.
    source: "mock", // Verinin gerçek CAN yerine simülasyondan geldiğini açıkça işaretler.
  };
} // generateMockVehicleData fonksiyon gövdesini bitirir.

// CommonJS dışa aktarımı, sunucunun mock veri fonksiyonuna modül üzerinden erişmesini sağlar.
module.exports = {
  generateMockVehicleData, // Fonksiyonu modülün dışından çağrılabilir hale getirir.
}; // module.exports nesnesini ve dışa aktarım atamasını bitirir.
