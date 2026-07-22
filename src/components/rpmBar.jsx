// Bu dosya, motor devrini sayısal ölçek ve dolan çubuk parçalarıyla görselleştiren RPM bileşenini tanımlar.
// Amaç, sürücünün motor devrini tek bakışta ve kademeli bir grafik üzerinden takip edebilmesini sağlamaktır.
// OKUMA REHBERİ:
// RpmBar({ rpm }) props nesnesinden yalnızca rpm alanını parçalayarak yerel değişken yapar.
// Array.from({ length: 13 }) length alanını okuyup 13 elemanlı geçici bir dizi üretir.
// .map(callback) dizinin her elemanı için callback fonksiyonunu çalıştırır ve yeni JSX elemanları döndürür.
// (_, index) => (...) bir ok fonksiyonudur; _ kullanılmayan elemanı, index sıfırdan başlayan sıra numarasını temsil eder.
// key={index}, React'in tekrar üretilen elemanları birbirinden ayırt etmesine yardım eden özel kimlik prop'udur.
// İkinci map callback'i süslü parantez kullandığı için hesap yapabilir ve sonucu açıkça return ile döndürür.
// const geçici hesap sonucunu yeniden atanmayacak isimde tutar; / bölme, * çarpma, < karşılaştırma yapar.
// ...styles.rpmSegment ortak stil alanlarını yeni stil nesnesine kopyalayan spread operatörüdür.
// isActive ? yeşil : beyaz üçlü koşulu, doğru ve yanlış durum için iki renkten birini seçer.
// JSX'teki <div /> kendini kapatan boş görsel segmenttir; iç metni olmadığı için ayrı kapanış etiketi gerekmez.

// Bu bileşen, rpm değerini 0-12 ölçeğine dönüştürerek etkin çubuk parçalarını yeşil renkte gösterir.
// Kendisine verilen rpm değeri değiştiğinde ölçek sabit kalır, dolu segmentlerin sayısı yeniden hesaplanır.
function RpmBar({ rpm }) {
  // Fonksiyon, ölçek etiketlerini ve doluluk segmentlerini içeren RPM göstergesini JSX olarak döndürür.
  return (
    // rpmSection stili, RPM başlığını ve grafik alanını aynı yatay bölümde tutar.
    <div style={styles.rpmSection}>
      {/* Sol etiket alanı, göstergenin adını ve ölçeğin bin devir cinsinden olduğunu açıklar. */}
      <div style={styles.rpmLabel}>
        {/* RPM başlığı, bu bölümün motor devrini gösterdiğini belirtir. */}
        <div style={styles.rpmTitle}>RPM</div>
        {/* x1000 alt başlığı, ölçek rakamlarının bin RPM ile çarpılması gerektiğini belirtir. */}
        <div style={styles.rpmSubtitle}>x1000</div>
      </div>

      {/* Sağ gösterge alanı, sayısal ölçeği ve renk değiştiren segment çubuğunu üst üste yerleştirir. */}
      <div style={styles.rpmDisplay}>
        {/* rpmScale kapsayıcısı, 0-12 arasındaki 13 etiketi eşit sütunlara dağıtır. */}
        <div style={styles.rpmScale}>
          {/* Bu map callback'i, 0 ile 12 arasındaki her değer için bir ölçek etiketi ve çizgisi üretir. */}
          {Array.from({ length: 13 }).map((_, index) => (
            // index hem React anahtarı hem de ekranda gösterilecek ölçek sayısı olarak kullanılır.
            <div key={index} style={styles.rpmScaleItem}>
              {/* Her sütunun üst kısmında o konuma ait RPM ölçek numarası gösterilir. */}
              <span style={styles.rpmScaleNumber}>{index}</span>
              {/* Dikey çizgi karakteri, ölçek numarasının çubuk üzerindeki karşılığını işaretler. */}
              <span style={styles.rpmScaleTick}>|</span>
              {/* Aşağıdaki etiket, tek ölçek numarası ile çizgisini taşıyan rpmScaleItem öğesini bitirir. */}
            </div>
          ))} {/* Buradaki iki parantez JSX ile map çağrısını, süslü parantez ise JavaScript alanını kapatır. */}
          {/* Aşağıdaki etiket, on üç ölçek öğesini taşıyan rpmScale kapsayıcısını bitirir. */}
        </div>

        {/* rpmBar kapsayıcısı, motor devrine göre renk değiştiren 48 ince segmenti yan yana dizer. */}
        <div style={styles.rpmBar}>
          {/* Bu map callback'i, her RPM segmentinin etkin olup olmadığını hesaplayıp ilgili çubuğu üretir. */}
          {Array.from({ length: 48 }).map((_, index) => {
            const rpmValueOnScale = rpm / 1000; // Ham RPM değerini grafikte kullanılan 0-12 ölçeğine dönüştürür.
            const segmentValue = (index / 48) * 12; // Mevcut segmentin 0-12 ölçeğinde temsil ettiği sınır değerini hesaplar.
            const isActive = segmentValue < rpmValueOnScale; // Segment motor devrinin altında kalıyorsa dolu gösterilmesine karar verir.

            // Callback, hesaplanan etkinlik durumuna göre tek bir RPM segmenti döndürür.
            return (
              // index benzersiz React anahtarıdır; birleştirilmiş stil ise segmentin rengini canlı RPM'e göre belirler.
              <div
                key={index}
                style={{
                  ...styles.rpmSegment, // Bütün segmentlerin ortak yükseklik, köşe ve eğim stilini kopyalar.
                  backgroundColor: isActive ? "#63d83d" : "#ffffff", // Etkin segmenti yeşil, henüz ulaşılmayan segmenti beyaz gösterir.
                }}
              />
            ); // Callback'in return ettiği JSX parantezini ve return ifadesini bitirir.
          })} {/* Buradaki işaretler callback ve map çağrısını kapatıp JSX JavaScript alanından çıkar. */}
          {/* Aşağıdaki etiket, kırk sekiz segmenti taşıyan rpmBar kapsayıcısını bitirir. */}
        </div>
        {/* Aşağıdaki etiket, ölçek ile segment çubuğunu tutan rpmDisplay alanını bitirir. */}
      </div>
      {/* Aşağıdaki etiket, bütün RPM bileşenini taşıyan rpmSection alanını bitirir. */}
    </div>
  ); // RpmBar fonksiyonunun JSX dönüşünü bitirir.
} // RpmBar fonksiyon gövdesini kapatır.

// styles nesnesi, RPM göstergesindeki başlık, ölçek ve segmentlerin bütün görünüm kurallarını toplar.
const styles = {
  // rpmSection, RPM göstergesinin dashboard içindeki genel yatay yerleşimini tanımlar.
  rpmSection: {
    display: "flex", // Başlık alanı ile grafik alanını yatay esnek kutu düzenine geçirir.
    alignItems: "center", // İki ana alanı dikey eksende ortalar.
    gap: "26px", // Başlık ile grafik arasında sabit yatay boşluk bırakır.
    height: "18%", // RPM bölümüne dashboard yüksekliğinin yüzde 18'ini ayırır.
    paddingBottom: "14px", // Altındaki ana göstergeyle arasında iç boşluk oluşturur.
  },

  // rpmLabel, RPM başlığı ile x1000 bilgisinin bulunduğu sol sütunu biçimlendirir.
  rpmLabel: {
    width: "110px", // Başlık alanına sabit genişlik vererek grafiğin başlangıç konumunu korur.
    flexShrink: 0, // Ekran daralsa bile başlık alanının küçülmesini önler.
  },

  // rpmTitle, RPM ana başlığının yazı görünümünü belirler.
  rpmTitle: {
    fontSize: "34px", // RPM metnini belirgin bir başlık büyüklüğünde gösterir.
    fontWeight: "900", // Başlığı en kalın yazı ağırlığıyla vurgular.
    letterSpacing: "2px", // Başlık harfleri arasına okunabilirlik için boşluk ekler.
  },

  // rpmSubtitle, ölçeğin çarpan bilgisini ana başlıktan daha geri planda gösterir.
  rpmSubtitle: {
    fontSize: "18px", // x1000 bilgisini ana RPM başlığından daha küçük gösterir.
    opacity: 0.75, // Alt başlığı hafif saydamlaştırarak ikincil bilgi olduğunu belirtir.
  },

  // rpmDisplay, ölçek ile segment çubuğunun bulunduğu sağ alanın yerleşimini yönetir.
  rpmDisplay: {
    flex: 1, // Başlıktan kalan yatay genişliğin tamamını grafik alanına verir.
    display: "flex", // Ölçek ve çubuğu esnek kutu sistemiyle düzenler.
    flexDirection: "column", // Sayısal ölçeği segment çubuğunun üstüne yerleştirir.
    justifyContent: "center", // Ölçek ile çubuğu ayrılan yükseklikte dikey olarak ortalar.
    gap: "6px", // Ölçek işaretleriyle segmentler arasına küçük boşluk bırakır.
  },

  // rpmScale, 13 ölçek değerini eşit genişlikte sütunlara ayırır.
  rpmScale: {
    display: "grid", // Ölçek etiketlerinin düzeni için CSS Grid kullanır.
    gridTemplateColumns: "repeat(13, 1fr)", // 0-12 değerleri için 13 eşit sütun oluşturur.
    alignItems: "end", // Etiketleri ölçek alanının alt kenarına hizalar.
    height: "34px", // Sayılar ve çizgiler için sabit bir ölçek yüksekliği ayırır.
  },

  // rpmScaleItem, tek bir ölçek sayısı ile çizgisinin kendi sütunundaki düzenini belirler.
  rpmScaleItem: {
    display: "flex", // Sayı ile çizgiyi esnek kutu sistemiyle hizalar.
    flexDirection: "column", // Sayıyı çizginin üzerine yerleştirir.
    alignItems: "center", // Sayı ile çizgiyi sütunun yatay merkezine alır.
    justifyContent: "flex-end", // İki parçayı sütunun alt kenarına yaslar.
    gap: "2px", // Sayı ile çizgi arasında küçük bir boşluk bırakır.
  },

  // rpmScaleNumber, 0-12 ölçek rakamlarının görünümünü tanımlar.
  rpmScaleNumber: {
    fontSize: "17px", // Ölçek sayılarını küçük fakat okunabilir büyüklükte gösterir.
    fontWeight: "700", // Rakamların ince segmentlerin üzerinde belirgin kalmasını sağlar.
    color: "#ffffff", // Siyah arka plan üzerinde yüksek kontrast için beyaz kullanır.
    lineHeight: 1, // Rakamların çevresindeki gereksiz dikey satır boşluğunu kaldırır.
  },

  // rpmScaleTick, her ölçek değerinin altındaki kısa çizgi işaretini biçimlendirir.
  rpmScaleTick: {
    fontSize: "14px", // Çizgi karakterinin ölçek sayısından biraz küçük görünmesini sağlar.
    color: "#ffffff", // Çizgiyi siyah zemin üzerinde beyaz gösterir.
    opacity: 0.85, // Çizgiyi rakamdan hafif daha geri planda tutar.
    lineHeight: 1, // Çizgi karakterinin dikey alanını sıkı tutar.
  },

  // rpmBar, 48 segmentin aynı satırda eşit genişliklerle dizilmesini sağlar.
  rpmBar: {
    display: "grid", // Segmentlerin hassas ve eşit dağılımı için CSS Grid kullanır.
    gridTemplateColumns: "repeat(48, 1fr)", // Motor devri çubuğu için 48 eşit sütun oluşturur.
    gap: "4px", // Her iki segment arasında görünür bir boşluk bırakır.
    height: "46px", // RPM çubuğunun ekrandaki sabit yüksekliğini belirler.
  },

  // rpmSegment, her bir ince devir çubuğunun ortak şeklini tanımlar.
  rpmSegment: {
    height: "100%", // Segmentin rpmBar alanının tüm yüksekliğini kullanmasını sağlar.
    borderRadius: "1px", // Segment köşelerini çok hafif yumuşatır.
    transform: "skewX(-10deg)", // Segmenti sola eğerek yarış göstergesi görünümü oluşturur.
  }, // rpmSegment alt stil nesnesini ve styles içindeki son alanı bitirir.
}; // Ana styles nesnesini ve const bildirimini bitirir.

export default RpmBar; // RPM bileşenini App.jsx tarafından kullanılabilmesi için dışa aktarır.
