import useVehicleData from "./hooks/useVehicleData";
import useCurrentTime from "./hooks/useCurrentTime";
import MetricsPanel from "./components/MetricsPanel";
import RpmBar from "./components/RpmBar";
import DashboardFooter from "./components/DashboardFooter";
import MainDisplay from "./components/MainDisplay";

function App() { // App isimli ana React componentimizi tanımlıyoruz.
const vehicleData = useVehicleData();
const currentTime = useCurrentTime();
  return ( // Bu componentin ekrana hangi HTML/JSX yapısını basacağını söylüyoruz.
    <div style={styles.page}> {/* Tüm ekranı kaplayan ana siyah dashboard alanı. */}
      <div style={styles.dashboard}> {/* Beyaz kenarlıklı ana gösterge paneli kutusu. */}
<RpmBar rpm={vehicleData.rpm} />
<MainDisplay gear={vehicleData.gear} speedKmh={vehicleData.speedKmh} />
<MetricsPanel vehicleData={vehicleData} />
<DashboardFooter
  ecuStatus={vehicleData.ecuStatus}
  currentTime={currentTime}
/>
</div>
</div>
  ); // JSX dönüşünün bitişi.
} // App componentinin bitişi.
const styles = { // Bu dosyada kullandığımız tüm stilleri tek bir obje içinde topluyoruz.
  page: { // Tüm sayfanın stil ayarları.
    width: "100vw", // Sayfa genişliği ekranın tamamı kadar olsun.
    height: "100vh", // Sayfa yüksekliği ekranın tamamı kadar olsun.
    backgroundColor: "#000000", // Arka plan siyah olsun.
    display: "flex", // İçeriği hizalamak için flex kullanıyoruz.
    alignItems: "center", // Dashboard'u dikeyde ortaya alıyoruz.
    justifyContent: "center", // Dashboard'u yatayda ortaya alıyoruz.
    color: "#ffffff", // Varsayılan yazı rengi beyaz olsun.
    fontFamily: "Arial, sans-serif", // Şimdilik okunabilir basit bir font kullanıyoruz.
  }, // page stilinin bitişi.
  dashboard: { // Ana dashboard kutusunun stil ayarları.
    width: "95vw", // Dashboard ekran genişliğinin yüzde 95'ini kaplasın.
    height: "90vh", // Dashboard ekran yüksekliğinin yüzde 90'ını kaplasın.
    border: "2px solid #ffffff", // Dış çerçeve beyaz çizgi olsun.
    borderRadius: "18px", // Kenarlar hafif yuvarlak olsun.
    padding: "24px", // İçerikler kenarlara yapışmasın diye iç boşluk veriyoruz.
    boxSizing: "border-box", // Padding genişliğe/yüksekliğe dahil hesaplansın.
    display: "flex", // Dashboard içeriğini dikey sıralamak için flex kullanıyoruz.
    flexDirection: "column", // İçerikler yukarıdan aşağı dizilsin.
    gap: "22px", // Bölümler arasında boşluk olsun.
  }, // dashboard stilinin bitişi.
}; // styles objesinin bitişi.

export default App; // App componentini dışarı aktararak main.jsx tarafından kullanılabilir hale getiriyoruz.