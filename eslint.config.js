// Bu dosya, projedeki JavaScript ve JSX kodlarının hangi kalite kurallarıyla denetleneceğini belirler.
// Amaç, React ve React Hook kullanımındaki olası hataları geliştirme sırasında erkenden yakalamaktır.
// OKUMA REHBERİ:
// import satırları npm paketlerinden hazır kural ve yardımcı fonksiyonları getirir.
// defineConfig([...]) içindeki köşeli parantez birden fazla yapılandırma parçasını sıralayan dizidir.
// {...} bir JavaScript nesnesi, anahtar: değer biçimindeki her satır bu nesnenin bir ayarıdır.
// js.configs.recommended gibi noktalı yazım, bir nesnenin içindeki alt alana adım adım erişir.
// '**/*.{js,jsx}' bir glob desenidir; alt klasörlerdeki bütün .js ve .jsx dosyalarını eşleştirir.
// Kapanan ], } ve ) işaretleri sırasıyla dizi, nesne ve fonksiyon çağrısının bittiğini gösterir.

import js from '@eslint/js' // ESLint'in önerilen temel JavaScript kurallarını getirir.
import globals from 'globals' // Tarayıcı ortamında hazır bulunan window ve document gibi küresel isimleri sağlar.
import reactHooks from 'eslint-plugin-react-hooks' // React Hook kullanım sırası ve bağımlılıklarını denetleyen kuralları getirir.
import reactRefresh from 'eslint-plugin-react-refresh' // Vite'ın hızlı yenileme özelliğiyle uyumlu React dışa aktarımlarını denetler.
import { defineConfig, globalIgnores } from 'eslint/config' // ESLint yapılandırmasını tanımlayan ve genel hariç tutma ekleyen yardımcıları getirir.

// Bu dışa aktarım, ESLint'in proje genelinde uygulayacağı yapılandırma parçalarını sıralı olarak birleştirir.
export default defineConfig([
  globalIgnores(['dist']), // Otomatik üretilen dist klasörünün lint taramasına dahil edilmesini önler.
  {
    files: ['**/*.{js,jsx}'], // Aşağıdaki kuralların bütün JavaScript ve JSX dosyalarına uygulanacağını belirtir.
    // extends listesi, hazır kural paketlerini bu proje yapılandırmasına dahil eder.
    extends: [
      js.configs.recommended, // Genel JavaScript hatalarını yakalayan ESLint önerilerini etkinleştirir.
      reactHooks.configs.flat.recommended, // Hook'ların React kurallarına uygun kullanılmasını denetler.
      reactRefresh.configs.vite, // Bileşen dışa aktarımlarını Vite Fast Refresh beklentilerine göre denetler.
    ],
    // languageOptions, kodun hangi çalışma ortamı ve sözdizimi özellikleriyle yorumlanacağını açıklar.
    languageOptions: {
      globals: globals.browser, // Tarayıcıda bulunan küresel değişkenlerin yanlışlıkla tanımsız sayılmasını önler.
      parserOptions: { ecmaFeatures: { jsx: true } }, // ESLint ayrıştırıcısının JSX etiketlerini geçerli sözdizimi kabul etmesini sağlar.
    },
  },
])
