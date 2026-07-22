// Bu dosya, WebSocket backend'inden gelen canlı araç verisini React bileşenlerinin kullanabileceği state'e taşır.
// Amaç, bağlantı kurma ve mesaj dinleme ayrıntılarını dashboard'un görsel bileşenlerinden ayrı tutmaktır.
// OKUMA REHBERİ:
// const INITIAL_VEHICLE_DATA = {...} yeniden atanmayacak bir nesne tanımlar; anahtar: değer satırları veri alanlarıdır.
// const [vehicleData, setVehicleData] = useState(...) dizi parçalama ile state ve güncelleme fonksiyonunu ayırır.
// new WebSocket(adres) ws:// adresine bağlantı kuran yeni tarayıcı WebSocket nesnesi oluşturur.
// socket.onopen = () => {...} gibi atamalar, olay olduğunda çalışacak callback fonksiyonlarını nesneye bağlar.
// (event) callback'e backend mesajıyla ilgili olay nesnesinin parametre olarak geleceğini belirtir.
// JSON.parse(event.data) JSON metnini JavaScript nesnesine çevirir; nokta olay nesnesinin data alanına erişir.
// setVehicleData(...) state'i değiştirir ve React ilgili bileşenleri yeni veriyle yeniden çizer.
// Effect içinden dönen () => socket.close() fonksiyonu bileşen kaldırılırken bağlantıyı temizler.
// Effect sonundaki [] boş bağımlılık dizisidir; bağlantının her çizimde yeniden kurulmasını engeller.
// Callback sonlarındaki }; işareti fonksiyon gövdesini kapatır ve olay alanına yapılan atamayı bitirir.
// export default sayesinde App.jsx bu Hook'u süslü parantezsiz varsayılan import ile alabilir.

import { useEffect, useState } from "react"; // WebSocket yaşam döngüsünü yönetmek ve araç verisini state'te saklamak için React Hook'larını getirir.

// INITIAL_VEHICLE_DATA, backend'den ilk mesaj gelene kadar arayüzde kullanılacak güvenli başlangıç değerlerini tutar.
const INITIAL_VEHICLE_DATA = {
  rpm: 1000, // Motor devrini başlangıçta rölantiye yakın 1000 RPM kabul eder.
  gear: 1, // İlk görüntülemede vites alanında 1 değerini gösterir.
  speedKmh: 0, // Bağlantı kurulmadan önce araç hızını sıfır kabul eder.
  engineTempC: 92, // Motor suyu sıcaklığı için başlangıç gösterim değerini santigrat cinsinden belirler.
  oilPressureBar: 4.3, // Yağ basıncı için başlangıç gösterim değerini bar cinsinden belirler.
  batteryVoltage: 13.8, // Elektrik sistemi için başlangıç voltajını belirler.
  oilTempC: 104, // Motor yağı sıcaklığı için başlangıç gösterim değerini belirler.
  ecuStatus: "DISCONNECTED", // İlk WebSocket mesajından önce ECU bağlantısının kurulmadığını belirtir.
};

// Bu özel Hook, başlangıç araç verisini saklar ve backend'den her yeni mesaj geldiğinde state'i günceller.
// Dışarıya yalnızca güncel vehicleData nesnesini vererek bağlantı ayrıntılarını kullanan bileşenden gizler.
function useVehicleData() {
  // vehicleData mevcut araç verisini, setVehicleData ise yeni WebSocket verisini kaydedecek fonksiyonu temsil eder.
  const [vehicleData, setVehicleData] = useState(INITIAL_VEHICLE_DATA);

  // Bu effect callback'i, Hook ilk kullanıldığında WebSocket bağlantısını kurar ve olay dinleyicilerini tanımlar.
  useEffect(() => {
    // Yerel bilgisayardaki 3001 portuna bağlanarak backend ile çift yönlü WebSocket kanalı açar.
    const socket = new WebSocket("ws://127.0.0.1:3001");

    // Bu olay callback'i, WebSocket bağlantısı başarıyla açıldığında geliştirici konsoluna bilgi verir.
    socket.onopen = () => {
      // Bağlantının hazır olduğunu yalnızca geliştirici takibi için tarayıcı konsoluna yazar.
      console.log("Connected to WebSocket backend.");
    };

    // Bu olay callback'i, backend'den gelen JSON mesajını araç verisine dönüştürüp state'i yeniler.
    socket.onmessage = (event) => {
      // event.data içindeki JSON metnini JavaScript vehicleData nesnesine dönüştürür.
      const incomingVehicleData = JSON.parse(event.data);
      // Yeni nesneyi state'e yazarak dashboard bileşenlerinin güncel verilerle yeniden çizilmesini sağlar.
      setVehicleData(incomingVehicleData);
    };

    // Bu olay callback'i, WebSocket sırasında oluşan bağlantı hatasını geliştirici konsoluna yazar.
    socket.onerror = (error) => {
      // Hata nesnesini kaydederek bağlantı sorunlarının geliştirme sırasında incelenebilmesini sağlar.
      console.error("WebSocket error:", error);
    };

    // Bu olay callback'i, WebSocket bağlantısı kapandığında geliştirici konsoluna bilgi verir.
    socket.onclose = () => {
      // Bağlantının artık veri göndermediğini geliştirici konsolunda görünür hale getirir.
      console.log("WebSocket connection closed.");
    };

    // Bu temizleme callback'i, Hook'u kullanan bileşen kaldırıldığında açık WebSocket bağlantısını kapatır.
    return () => {
      // Bağlantıyı kapatmak, kullanılmayan soketin ve olay dinleyicilerinin bellekte kalmasını önler.
      socket.close();
    };
  }, []); // Boş bağımlılık dizisi, her yeniden çizimde yeni WebSocket açılmasını engeller.

  // Hook dışına yalnızca arayüzün ihtiyaç duyduğu güncel araç veri nesnesini verir.
  return vehicleData;
} // Süslü parantez useVehicleData Hook fonksiyonunun gövdesini bitirir.

export default useVehicleData; // Hook'u App.jsx tarafından içe aktarılabilecek varsayılan değer olarak dışa açar.
