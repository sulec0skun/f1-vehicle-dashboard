// Bu dosya, araçtan gelen dört önemli sensör değerini yan yana ikaz kartları halinde gösterir.
// Amaç, motor sıcaklığı, yağ basıncı, batarya voltajı ve yağ sıcaklığını mevcut MetricCard yapısını bozmadan ekrana taşımaktır.
// Bu bileşen yalnız görünümü bir araya getirir; normal, uyarı ve kritik durum hesapları metricStatus.js dosyasında yapılır.
// OKUMA REHBERİ:
// import X from "./dosya" başka dosyanın varsayılan dışa aktarımını bu dosyada X adıyla kullanılabilir hale getirir.
// import { X, Y } yazımındaki süslü parantezler, adıyla dışa aktarılmış birden fazla fonksiyonu seçer.
// MetricsPanel({ vehicleData }) props nesnesinden yalnız vehicleData alanını ayıran nesne parçalama sözdizimidir.
// <MetricCard ... /> büyük harfle başladığı için gerçek HTML etiketi değil, bizim yazdığımız React bileşenidir.
// title, value, unit ve status alanları MetricCard bileşenine gönderilen prop değerleridir.
// vehicleData.engineTempC gibi noktalı yazımlar, araç veri nesnesinin ilgili sensör alanını okur.
// getEngineTempStatus(...) gibi fonksiyonlar sensör değerini alıp normal, warning veya critical metni döndürür.

// MetricCard, her sensörü aynı kart görünümü ve durum renkleriyle göstermek için tekrar kullanılan bileşendir.
import MetricCard from "./metricCard";
// Bu yardımcı fonksiyonlar, her sensörün kendi güvenli eşiklerine göre kart durumunu hesaplar.
import {
  getBatteryVoltageStatus,
  getEngineTempStatus,
  getOilPressureStatus,
  getOilTempStatus,
} from "../utils/metricStatus";

// Bu bileşen, App.jsx tarafından gönderilen vehicleData nesnesinden dört sensör değerini ilgili kartlara dağıtır.
// Parametre olarak alınan vehicleData; sıcaklık, basınç ve voltaj gibi frontend veri alanlarını içerir.
function MetricsPanel({ vehicleData }) {
  // return, dört MetricCard bileşeninden oluşan JSX görünümünü App.jsx dosyasına geri verir.
  return (
    // metricsGrid stili, dört ikaz kartını aynı satırda eşit genişliklerle konumlandırır.
    <div style={styles.metricsGrid}>
      {/* Motor sıcaklığı kartı, santigrat değerini gösterir ve motor sıcaklığı eşiklerini kullanır. */}
      <MetricCard
        title="ENGINE TEMP"
        value={vehicleData.engineTempC}
        unit="°C"
        status={getEngineTempStatus(vehicleData.engineTempC)}
      />

      {/* Yağ basıncı kartı, bar değerini gösterir ve düşük basınç eşiklerini kullanır. */}
      <MetricCard
        title="OIL PRESSURE"
        value={vehicleData.oilPressureBar}
        unit="bar"
        status={getOilPressureStatus(vehicleData.oilPressureBar)}
      />

      {/* Batarya kartı, voltaj değerini gösterir ve düşük/yüksek gerilim eşiklerini kullanır. */}
      <MetricCard
        title="BATTERY VOLTAGE"
        value={vehicleData.batteryVoltage}
        unit="V"
        status={getBatteryVoltageStatus(vehicleData.batteryVoltage)}
      />

      {/* Yağ sıcaklığı kartı, santigrat değerini gösterir ve yağ sıcaklığı eşiklerini kullanır. */}
      <MetricCard
        title="OIL TEMP"
        value={vehicleData.oilTempC}
        unit="°C"
        status={getOilTempStatus(vehicleData.oilTempC)}
      />
      {/* Aşağıdaki kapanış etiketi, dört kartı taşıyan metricsGrid alanını bitirir. */}
    </div>
  ); // Çok satırlı JSX dönüş ifadesini bitirir.
} // MetricsPanel fonksiyon gövdesini kapatır.

// styles nesnesi, ikaz panelinin yerleşimini bileşen mantığından ayrı bir yerde toplar.
const styles = {
  // metricsGrid, dört kartın dashboard içindeki ortak satır düzenini tanımlar.
  metricsGrid: {
    display: "grid", // Kartları düzenli sütunlara yerleştirmek için CSS Grid kullanır.
    gridTemplateColumns: "repeat(4, 1fr)", // Kullanılabilir genişliği dört eşit kart sütununa böler.
    gap: "16px", // Kartların birbirine yapışmaması için aralarında yatay boşluk bırakır.
    height: "24%", // İkaz kartları için dashboard yüksekliğinin yüzde 24'ünü ayırır.
    flexShrink: 0, // Diğer alanlar büyüdüğünde ikaz panelinin yüksekliğinin küçülmesini engeller.
  }, // metricsGrid stil alt nesnesini ve styles içindeki alan tanımını bitirir.
}; // Ana styles nesnesini ve const bildirimini bitirir.

// Varsayılan dışa aktarım, App.jsx dosyasının bu bileşeni MetricsPanel adıyla içe aktarabilmesini sağlar.
export default MetricsPanel;
