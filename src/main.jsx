// Bu dosya, React dashboard uygulamasını tarayıcıdaki root HTML alanına bağlayan başlangıç noktasıdır.
// Amaç, ana App bileşenini React StrictMode denetimleriyle birlikte ekrana yerleştirmektir.
// OKUMA REHBERİ:
// import { X } adı belirtilmiş bir dışa aktarımı, import X ise varsayılan dışa aktarımı getirir.
// import './index.css' bir isim üretmez; yalnızca CSS dosyasının stillerini uygulamaya yükler.
// document tarayıcının HTML belgesidir; getElementById('root') id'si root olan öğeyi bulur.
// Nokta işareti bir nesnenin özelliğine veya metoduna erişir; () metodu gerçekten çalıştırır.
// createRoot(...).render(...) zinciri önce React kökünü oluşturur, sonra JSX ağacını o köke çizer.
// Büyük harfle başlayan <StrictMode> ve <App /> etiketleri HTML değil, React bileşenleridir.
// <App /> sonundaki / işareti, bileşenin ayrıca kapanış etiketi gerektirmediğini gösterir.

import { StrictMode } from 'react' // Geliştirme sırasında olası yan etkileri fark etmeye yardımcı olan React denetim bileşenini getirir.
import { createRoot } from 'react-dom/client' // React bileşen ağacını gerçek DOM içindeki bir alana bağlayan fonksiyonu getirir.
import './index.css' // Tüm uygulamaya uygulanacak tam ekran ve sıfırlama stillerini yükler.
import App from './App.jsx' // Ekranda gösterilecek ana dashboard bileşenini getirir.

// HTML içindeki root öğesini React kökü yapar ve aşağıdaki bileşen ağacını bu alana çizer.
createRoot(document.getElementById('root')).render(
  // StrictMode, geliştirme sırasında güvenli olmayan React kullanımlarını görünür hale getirir.
  <StrictMode>
    {/* App bileşeni, dashboard ekranının tamamını oluşturan en üst seviye bileşendir. */}
    <App />
  </StrictMode>,
)
