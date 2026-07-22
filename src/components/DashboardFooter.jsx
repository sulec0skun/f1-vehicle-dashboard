// Bu dosya, dashboard'un alt bölümünde ECU bağlantı durumunu ve güncel saati gösteren bileşeni tanımlar.
// Amaç, sürücünün sistem bağlantısını ve zamanı ana göstergelerden bağımsız bir alanda takip edebilmesidir.
// OKUMA REHBERİ:
// DashboardFooter({ ecuStatus, currentTime }) parametresindeki {}, props nesnesinden iki alanı isimleriyle ayırır.
// Bu işleme nesne parçalama denir; props.ecuStatus yazmak yerine doğrudan ecuStatus kullanılmasını sağlar.
// return (...) içindeki yapı JSX'tir; küçük harfli div ve span gerçek HTML öğelerine dönüşür.
// JSX içindeki {ecuStatus} ve {currentTime}, JavaScript değerlerini görünen metnin arasına yerleştirir.
// style={styles.footer}, aşağıdaki styles nesnesinin footer alanını div öğesine uygular.
// const styles yeniden atanmayacak stil nesnesini, export default ise bileşenin başka dosyadan alınmasını tanımlar.
// Kapanış etiketleri ve süslü parantezler sırasıyla JSX öğelerini, stil nesnelerini ve fonksiyonu bitirir.

// Bu bileşen, kendisine verilen ECU durumunu ve saat bilgisini alt bilgi satırında yan yana gösterir.
// ecuStatus bağlantı durumunu, currentTime ise ekranda gösterilecek biçimlendirilmiş saati temsil eder.
function DashboardFooter({ ecuStatus, currentTime }) {
  // Fonksiyon, alt bilgi alanının JSX yapısını çağıran bileşene döndürür.
  return (
    // footer stili, durum ile saati aynı satırın iki ucuna yerleştirir.
    <div style={styles.footer}>
      {/* İlk metin alanı, ECU'dan gelen bağlantı veya hata durumunu sabit başlıkla birlikte gösterir. */}
      <span>ECU STATUS: {ecuStatus}</span>
      {/* İkinci metin alanı, useCurrentTime Hook'undan gelen güncel saat bilgisini gösterir. */}
      <span>{currentTime}</span>
      {/* Aşağıdaki kapanış etiketi, footer stilini kullanan dış div öğesini bitirir. */}
    </div>
  ); // Parantez ve noktalı virgül, return ile başlayan çok satırlı JSX ifadesini bitirir.
} // Süslü parantez, DashboardFooter fonksiyon gövdesini kapatır.

// styles nesnesi, JSX içine gömülü görünüm kurallarını bileşen işlevinden ayrı bir yerde toplar.
const styles = {
 // footer anahtarı, bileşenin dış kapsayıcısına uygulanacak görünüm kurallarını toplar.
 footer: {
  height: "42px", // Alt bilgi satırına sabit bir dikey alan ayırır.
  display: "flex", // Durum ve saat metinlerini esnek kutu yerleşimine geçirir.
  alignItems: "center", // İki metni kendi satırları içinde dikey olarak ortalar.
  justifyContent: "space-between", // ECU durumunu sola, saati sağa yaslar.
  fontSize: "16px", // Alt bilgi metinlerinin okunabilir temel büyüklüğünü belirler.
  paddingTop: "12px", // Üstteki dashboard içeriğiyle metinler arasına iç boşluk ekler.
  marginTop: "6px", // Alt bilgi kutusunu önceki bileşenden biraz uzaklaştırır.
  flexShrink: 0, // Dashboard daraldığında alt bilgi yüksekliğinin küçülmesini engeller.
 }, // Süslü parantez footer stil alt nesnesini, virgül ise nesne alanını bitirir.
}; // Süslü parantez styles nesnesini, noktalı virgül const bildirimini bitirir.

export default DashboardFooter; // Bileşeni App.jsx gibi başka dosyaların içe aktarabilmesi için dışa açar.
