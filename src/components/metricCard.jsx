// Bu dosya, sıcaklık, basınç veya voltaj gibi tek bir araç ölçümünü kart biçiminde gösterir.
// Amaç, farklı metrikleri ortak bir görsel yapı ve normal, uyarı, kritik durum renkleriyle sunmaktır.
// OKUMA REHBERİ:
// Fonksiyon parametresindeki { title, value, unit, status }, props nesnesini dört ayrı yerel isme parçalar.
// const cardStyle ile oluşturulan nesne yalnızca bu bileşen çizimi sırasında hesaplanan birleşik stildir.
// ... spread operatörüdür; bir nesnenin alanlarını yeni nesnenin içine tek tek kopyalar.
// koşul ? değer1 : değer2 üçlü koşuldur; koşul doğruysa ilk, yanlışsa ikinci değeri seçer.
// status === "warning" üç eşittir ile hem değer hem tür bakımından kesin karşılaştırma yapar.
// {} boş nesnedir; durum eşleşmezse karta ek stil kopyalanmamasını sağlar.
// JSX içindeki {value}, {unit} ve {title} prop değerlerini metne yerleştirir.
// status.toUpperCase() nokta ile String metoduna erişir, () ile çalıştırır ve büyük harfli yeni metin döndürür.

// Bu bileşen, başlık, değer, birim ve durum bilgilerini kullanarak ölçüm kartını oluşturur.
// status değerine göre uygun uyarı stilini temel kart stiliyle birleştirir ve sonucu ekrana döndürür.
function MetricCard({ title, value, unit, status }) {
  // cardStyle, temel kart görünümünü duruma göre gelen uyarı veya kritik görünümüyle birleştirir.
  const cardStyle = {
    ...styles.metricCard, // Her durumda kullanılacak ortak kart stilini başlangıç olarak kopyalar.
    ...(status === "warning" ? styles.warningCard : {}), // Durum warning ise sarı uyarı renklerini karta ekler.
    ...(status === "critical" ? styles.criticalCard : {}), // Durum critical ise kırmızı kritik renklerini karta ekler.
  };

  // Fonksiyon, hesaplanan kart stilini ve ölçüm metinlerini içeren JSX yapısını döndürür.
  return (
    // cardStyle, bu kartın normal, uyarı veya kritik görünümünü belirler.
    <div style={cardStyle}>
      {/* Dolu daire, ölçüm kartının görsel işaretçisi olarak kullanılır. */}
      <div style={styles.metricIcon}>●</div>
      {/* title prop'u ENGINE TEMP gibi ölçümün ne olduğunu gösterir. */}
      <div style={styles.metricTitle}>{title}</div>

      {/* value ölçüm sonucunu, içteki span ise °C, bar veya V gibi birimini gösterir. */}
      <div style={styles.metricValue}>
        {value} <span style={styles.metricUnit}>{unit}</span>
      </div>

      {/* status metni büyük harfe çevrilerek kartın normal, warning veya critical durumu açıkça yazılır. */}
      <div style={styles.metricStatus}>{status.toUpperCase()}</div>
      {/* Aşağıdaki kapanış etiketi, cardStyle uygulanan ana metrik kartı div'ini bitirir. */}
    </div>
  ); // return ile başlayan JSX ifadesini bitirir.
} // MetricCard fonksiyon gövdesini kapatır.

// styles nesnesi, ortak kart görünümü ile duruma özel renk seçeneklerini aynı yerde toplar.
const styles = {
  // metricCard, bütün durumlarda paylaşılan temel kart yerleşimini ve görünümünü tanımlar.
  metricCard: {
    border: "2px solid #ffffff", // Normal kartın çevresine beyaz sınır çizer.
    borderRadius: "14px", // Kart köşelerini yumuşatarak yuvarlatır.
    padding: "14px", // Kart içeriğini kenarlardan uzak tutar.
    boxSizing: "border-box", // İç boşluk ve sınırı kartın toplam ölçüsüne dahil eder.
    display: "flex", // Kart içindeki parçaları esnek kutu sistemiyle düzenler.
    flexDirection: "column", // İkon, başlık, değer ve durumu yukarıdan aşağı sıralar.
    justifyContent: "space-between", // Kart bölümlerini kullanılabilir yüksekliğe dengeli dağıtır.
    backgroundColor: "#050505", // Normal durumda siyaha yakın bir arka plan kullanır.
  },

  // warningCard, dikkat gerektiren ölçümlerde temel stilin üzerine sarı uyarı renklerini uygular.
  warningCard: {
    borderColor: "#f5c400", // Kart sınırını sarıya çevirerek uyarıyı belirginleştirir.
    backgroundColor: "#3a3000", // Sarı metinle uyumlu koyu bir uyarı zemini kullanır.
    color: "#f5c400", // Kart içindeki yazı ve simge rengini sarıya çevirir.
  },

  // criticalCard, tehlikeli ölçümlerde temel stilin üzerine kırmızı kritik renklerini uygular.
  criticalCard: {
    borderColor: "#ff2b2b", // Kart sınırını kırmızıya çevirerek kritik durumu vurgular.
    backgroundColor: "#3a0000", // Kırmızı metinle uyumlu koyu kritik zemin kullanır.
    color: "#ff2b2b", // Kart içindeki yazı ve simgeleri kırmızı gösterir.
  },

  // metricIcon, kartın üst kısmındaki nokta işaretinin boyutunu belirler.
  metricIcon: {
    fontSize: "18px", // Görsel işaretçiyi başlıkla dengeli bir büyüklükte gösterir.
  },

  // metricTitle, ölçüm adının yazı görünümünü tanımlar.
  metricTitle: {
    fontSize: "18px", // Ölçüm adını kart içinde okunabilir büyüklükte gösterir.
    fontWeight: "800", // Ölçüm başlığını kalınlaştırarak değerden ayırt edilir kılar.
    letterSpacing: "1px", // Büyük harfli başlığın karakter aralığını hafifçe açar.
  },

  // metricValue, sensörden gelen sayısal değerin baskın görünümünü belirler.
  metricValue: {
    fontSize: "42px", // Sayısal ölçümü kartın en büyük metni yapar.
    fontWeight: "900", // Değeri yüksek kalınlıkta göstererek hızlı okunmasını sağlar.
  },

  // metricUnit, sayısal değerin yanındaki ölçü biriminin görünümünü belirler.
  metricUnit: {
    fontSize: "20px", // Birimi sayısal değerden küçük göstererek hiyerarşi kurar.
    fontWeight: "700", // Birimin okunaklı kalması için orta-yüksek kalınlık kullanır.
  },

  // metricStatus, kartın hesaplanan durum metninin görünümünü tanımlar.
  metricStatus: {
    fontSize: "13px", // Durum metnini ikincil bilgi olarak küçük gösterir.
    fontWeight: "800", // Küçük metnin okunaklı kalması için kalın yazı kullanır.
    opacity: 0.9, // Durum metnini hafif saydamlaştırarak ana değerden geri planda tutar.
  }, // metricStatus alt stil nesnesini ve styles içindeki son alanı bitirir.
}; // Ana styles nesnesini ve const bildirimini bitirir.

export default MetricCard; // Bileşeni metrik paneli gibi başka dosyaların kullanabilmesi için dışa aktarır.
