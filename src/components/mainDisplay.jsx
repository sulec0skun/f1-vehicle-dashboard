// Bu dosya, sürücünün en sık baktığı vites ve hız değerlerini dashboard'un merkezinde gösterir.
// Amaç, kritik sürüş bilgilerinin büyük ve kolay okunabilir biçimde sunulmasını sağlamaktır.
// OKUMA REHBERİ:
// MainDisplay({ gear, speedKmh }) yazımı, üst bileşenden gelen props nesnesini iki değişkene parçalar.
// return ile dönen JSX'te her iç div, bir üst div'in çocuğudur; girinti bu aile ilişkisini gösterir.
// {gear} ve {speedKmh} süslü parantezleri JSX metni içinde JavaScript değerlerini görünür hale getirir.
// <span> satır içi bir HTML öğesidir; hızın km/h birimine sayıyla aynı satırda ayrı stil uygulanmasını sağlar.
// style={styles.gearBox} ifadesinde {} JavaScript'e geçer, nokta ise styles nesnesinin alanını seçer.
// styles içindeki anahtarlar CSS sınıfı değildir; doğrudan JSX style prop'una verilen JavaScript nesneleridir.
// CSS-in-JS özellikleri font-size yerine fontSize gibi camelCase biçiminde yazılır.

// Bu bileşen, gear ve speedKmh değerlerini iki sütunlu ana gösterge alanına yerleştirir.
// gear seçili vitesi, speedKmh ise kilometre/saat cinsinden araç hızını temsil eder.
function MainDisplay({ gear, speedKmh }) {
  // Fonksiyon, vites ve hız kutularını içeren merkez bölümün JSX yapısını döndürür.
  return (
    // mainSection stili, vites ile hız kutularını eşit iki sütuna böler.
    <div style={styles.mainSection}>
      {/* gearBox alanı, vites başlığını ve güncel vites değerini birlikte tutar. */}
      <div style={styles.gearBox}>
        {/* Sabit başlık, büyük sayının vites bilgisi olduğunu sürücüye açıklar. */}
        <div style={styles.sectionTitle}>GEAR</div>
        {/* gear prop'undan gelen güncel vites veya N değeri büyük karakterle gösterilir. */}
        <div style={styles.gearValue}>{gear}</div>
      </div>

      {/* speedBox alanı, hız başlığını, sayısal değeri ve ölçü birimini birlikte tutar. */}
      <div style={styles.speedBox}>
        {/* Sabit başlık, aşağıdaki büyük sayının araç hızı olduğunu belirtir. */}
        <div style={styles.sectionTitle}>SPEED</div>
        {/* speedKmh prop'u sayısal hız olarak, içindeki span ise km/h birimi olarak gösterilir. */}
        <div style={styles.speedValue}>
          {speedKmh} <span style={styles.speedUnit}>km/h</span>
          {/* Aşağıdaki kapanış etiketi, hız ve birimi tutan speedValue div'ini bitirir. */}
        </div>
        {/* Aşağıdaki kapanış etiketi, SPEED başlığı ile değerini tutan speedBox div'ini bitirir. */}
      </div>
      {/* Aşağıdaki kapanış etiketi, vites ve hız sütunlarının ortak mainSection div'ini bitirir. */}
    </div>
  ); // Çok satırlı JSX dönüş ifadesini bitirir.
} // MainDisplay fonksiyon gövdesini kapatır.

// styles nesnesi, merkez göstergenin bütün yerleşim ve yazı kurallarını anahtarlar halinde toplar.
const styles = {
  // mainSection, merkez alanın genel iki sütunlu yerleşimini kontrol eder.
  mainSection: {
    flex: 1, // Üst ve alt bölümlerden kalan dikey alanın tamamını kullanır.
    display: "grid", // Vites ve hız kutularını CSS Grid ile konumlandırır.
    gridTemplateColumns: "1fr 1fr", // Kullanılabilir genişliği iki eşit sütuna ayırır.
  },

  // gearBox, sol sütundaki vites bilgisinin hizasını ve ayırıcı çizgisini belirler.
  gearBox: {
    display: "flex", // Başlık ile değeri esnek kutu sistemiyle hizalar.
    flexDirection: "column", // Vites başlığını değerin üstüne yerleştirir.
    alignItems: "center", // İçeriği yatay eksende ortalar.
    justifyContent: "center", // İçeriği dikey eksende ortalar.
    borderRight: "1px solid #444444", // Vites ve hız sütunları arasına ince bir ayırıcı çizer.
  },

  // speedBox, sağ sütundaki hız bilgisinin merkezde görünmesini sağlar.
  speedBox: {
    display: "flex", // Başlık ile hız değerini esnek kutu sistemiyle hizalar.
    flexDirection: "column", // Hız başlığını sayısal değerin üstüne yerleştirir.
    alignItems: "center", // İçeriği yatay eksende ortalar.
    justifyContent: "center", // İçeriği dikey eksende ortalar.
  },

  // sectionTitle, GEAR ve SPEED başlıklarının ortak yazı görünümünü tanımlar.
  sectionTitle: {
    fontSize: "26px", // Başlık metnini ana değerlerden küçük ama belirgin gösterir.
    fontWeight: "800", // Başlığı kalınlaştırarak hızlı okunmasını sağlar.
    letterSpacing: "3px", // Büyük harfli başlıkların karakterleri arasını açar.
    marginBottom: "14px", // Başlık ile altındaki değer arasında boşluk bırakır.
  },

  // gearValue, vites değerinin ekrandaki en büyük bilgilerden biri olmasını sağlar.
  gearValue: {
    fontSize: "170px", // Vites değerini sürücünün tek bakışta görebileceği büyüklüğe getirir.
    fontWeight: "900", // Vites karakterini mümkün olduğunca kalın gösterir.
    lineHeight: 1, // Büyük karakterin çevresinde gereksiz satır yüksekliği oluşmasını önler.
  },

  // speedValue, sayısal hızın güçlü ve merkezi görünümünü tanımlar.
  speedValue: {
    fontSize: "120px", // Hız değerini uzaktan okunabilecek büyüklükte gösterir.
    fontWeight: "900", // Sayısal hızın yüksek kontrastla belirginleşmesini sağlar.
    lineHeight: 1, // Büyük sayının çevresindeki dikey boşluğu sınırlar.
  },

  // speedUnit, hız değerinin yanındaki km/h metnini daha küçük biçimde gösterir.
  speedUnit: {
    fontSize: "36px", // Ölçü birimini değerden küçük tutarak görsel hiyerarşi kurar.
    fontWeight: "700", // Birimi okunaklı kalacak kadar kalın gösterir.
  }, // speedUnit alt stil nesnesini ve styles içindeki son alanı bitirir.
}; // Ana styles nesnesini ve const bildirimini bitirir.

export default MainDisplay; // Bileşeni App.jsx tarafından kullanılmak üzere dışa aktarır.
