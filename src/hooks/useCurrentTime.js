// Bu dosya, dashboard'da gösterilecek güncel saati saniyede bir yenileyen özel React Hook'unu tanımlar.
// Amaç, saat biçimlendirme ve zamanlayıcı yönetimini görsel bileşenlerden ayrı ve tekrar kullanılabilir tutmaktır.
// OKUMA REHBERİ:
// import { useEffect, useState } süslü parantezle React paketinin iki named export değerini getirir.
// Adı use ile başlayan fonksiyon React tarafından özel Hook kuralına göre değerlendirilir ve başka Hook'lar çağırabilir.
// const [değer, setter] = useState(ilkDeğer) dizi parçalamadır; ilk isim state'i, ikinci isim onu değiştiren fonksiyonu alır.
// new Date() yeni tarih-saat nesnesi oluşturur; noktalı metot zinciri bu nesneyi saat metnine dönüştürür.
// useEffect(() => {...}, []) içindeki ok fonksiyonu yan etkiyi, boş dizi yalnız ilk bağlanmada kurulmasını tanımlar.
// setInterval(callback, 1000) callback'i her 1000 ms'de çalıştırır ve iptal etmek için bir kimlik döndürür.
// Effect içinden return edilen ikinci fonksiyon ekrana veri değil, kaldırılma anında çalışacak cleanup işlemini verir.
// clearInterval(intervalId) saklanan kimliği kullanarak yalnız bu Hook'a ait zamanlayıcıyı durdurur.

import { useEffect, useState } from "react"; // Zamanlayıcı yan etkisini yönetmek ve güncel saati state'te tutmak için gerekli React Hook'larını getirir.

// Bu yardımcı fonksiyon, bilgisayarın o anki saatini Türkçe yerel ayarlarla saat:dakika:saniye biçimine dönüştürür.
// Parametre almaz ve ekranda doğrudan kullanılabilecek bir metin değeri döndürür.
function getFormattedCurrentTime() {
  // Yeni Date nesnesi bilgisayarın o anki yerel tarih ve saatini temsil eder.
  return new Date().toLocaleTimeString("tr-TR", {
    hour: "2-digit", // Saat bölümünün her zaman iki haneli gösterilmesini ister.
    minute: "2-digit", // Dakika bölümünün her zaman iki haneli gösterilmesini ister.
    second: "2-digit", // Saniye bölümünün her zaman iki haneli gösterilmesini ister.
  }); // }, ayar nesnesini; ) metot çağrısını; noktalı virgül return ifadesini bitirir.
} // getFormattedCurrentTime yardımcı fonksiyonunun gövdesini bitirir.

// Bu özel Hook, biçimlendirilmiş saat bilgisini React state içinde tutar ve her saniye günceller.
// Bileşen kaldırıldığında zamanlayıcıyı temizleyerek gereksiz arka plan işlemlerini önler.
function useCurrentTime() {
  // İlk state değeri hemen biçimlendirilerek bileşenin ilk çiziminde boş saat görünmesi önlenir.
  const [currentTime, setCurrentTime] = useState(getFormattedCurrentTime());

  // Bu effect callback'i, Hook ilk kullanıldığında saat güncelleme zamanlayıcısını başlatır.
  useEffect(() => {
    // Bu zamanlayıcı callback'i, her saniye yeni biçimlendirilmiş saati state içine yazar.
    const intervalId = setInterval(() => {
      // Yeni saat state'e yazıldığında React bu Hook'u kullanan bileşeni güncel değerle yeniden çizer.
      setCurrentTime(getFormattedCurrentTime());
    }, 1000); // 1000 milisaniye, güncellemenin saniyede bir yapılmasını sağlar.

    // Bu temizleme callback'i, bileşen kaldırıldığında çalışan zamanlayıcıyı durdurur.
    return () => {
      // Saklanan intervalId yalnızca bu Hook örneğine ait zamanlayıcının iptal edilmesini sağlar.
      clearInterval(intervalId);
    }; // Cleanup ok fonksiyonunun gövdesini ve return ifadesini bitirir.
  }, []); // Boş bağımlılık dizisi, effect'in her çizimde değil yalnızca ilk bağlanmada kurulmasını sağlar.

  // Hook'u kullanan bileşen yalnızca gösterime hazır güncel saat metnini alır.
  return currentTime;
} // useCurrentTime Hook fonksiyonunun gövdesini bitirir.

export default useCurrentTime; // Özel Hook'u DashboardFooter'a veri sağlayacak bileşenlerin içe aktarabilmesini sağlar.
