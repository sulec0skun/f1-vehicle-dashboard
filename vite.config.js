// Bu dosya, React arayüzünün Vite tarafından nasıl geliştirilip derleneceğini yapılandırır.
// Amaç, React eklentisini Vite'a tanıtarak JSX dosyalarının doğru biçimde işlenmesini sağlamaktır.
// OKUMA REHBERİ:
// import ... from ... başka bir paketin dışa açtığı değeri bu dosyada kullanılabilir bir isme bağlar.
// Süslü parantezli import, paketten adı belirtilmiş bir değeri; parantezsiz import ise varsayılan değeri alır.
// defineConfig({...}) ifadesindeki () fonksiyonu çalıştırır, {...} ise fonksiyona verilen ayar nesnesidir.
// plugins: [react()] satırında plugins bir nesne alanı, [...] bir dizi, react() ise çalışan eklenti fabrikasıdır.
// export default, oluşan yapılandırmanın bu dosyanın ana dışa aktarımı olduğunu Vite'a bildirir.

import { defineConfig } from 'vite' // Yapılandırma nesnesine editör desteği ve standart Vite biçimi kazandıran yardımcıyı içe aktarır.
import react from '@vitejs/plugin-react' // Vite'ın JSX ve React Fast Refresh özelliklerini kullanmasını sağlayan eklentiyi içe aktarır.

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()], // React eklentisini etkin eklentiler listesine ekleyerek .jsx dosyalarının işlenmesini sağlar.
})
