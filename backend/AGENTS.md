# AGENTS.md — F1 Dashboard Proje Talimatları ve Mimari Dokümantasyon

Bu dosya, bu projede çalışacak yapay zekâ ajanları/Codex oturumları için ana bağlam ve çalışma kurallarıdır.

Bu proje bir F1 / Formula Student tarzı araç dashboard projesidir. Amaç, Raspberry Pi 5 üzerinde çalışan bir dijital gösterge paneli geliştirmektir. Dashboard, araçtan gelen RPM, hız, vites, sıcaklık, yağ basıncı, batarya voltajı gibi verileri HDMI ekran üzerinde gösterecektir.

Proje şu anda geliştirme ortamında mock veri ile çalışmaktadır. Gerçek araç entegrasyonunda Ecumaster EMU Black ECU üzerinden CAN Bus verisi alınacak, MCP2515 + TJA1050 modülü üzerinden Raspberry Pi’ye aktarılacak, Linux tarafında `can0` arayüzü üzerinden okunacak, DBC dosyası ile decode edilecek ve frontend’in beklediği `vehicleData` modeline çevrilerek WebSocket üzerinden React dashboard’a gönderilecektir.

---

# 1. Ajan için temel davranış kuralları

Bu projede çalışan ajan aşağıdaki kurallara kesinlikle uymalıdır.

## 1.1 Kullanıcı onayı olmadan işlem yapma

Ajan, kullanıcı açıkça onay vermeden dosya değiştirmemeli, yeni dosya oluşturmamalı veya mevcut kodu yeniden düzenlememelidir.

Her adımda önce:

1. Ne yapılacağını açıklamalı.
2. Neden yapılacağını açıklamalı.
3. Hangi dosyalara dokunulacağını söylemeli.
4. Kullanıcıdan onay beklemelidir.

Kullanıcı onay verdikten sonra işlem adım adım yapılmalıdır.

---

## 1.2 Öğretici ilerle

Kullanıcı projeyi öğrenmek istiyor. Bu yüzden ajan, sadece kod yazan bir araç gibi davranmamalıdır.

Her açıklama şu düşünceyle yapılmalıdır:

> “Kullanıcı bu konuyu bilmiyor olabilir. Ben hem işi yapmalı hem de ona öğretmeliyim.”

Bu nedenle:

- Her yeni dosyanın amacı açıklanmalı.
- Her fonksiyonun amacı açıklanmalı.
- Kullanılan terimler sade Türkçe ile anlatılmalı.
- “Bu kod ne yapıyor?” sorusuna cevap verecek şekilde yorum ve dokümantasyon eklenmelidir.

---

## 1.3 Dosya başı yorumları zorunludur

Yeni oluşturulan her dosyanın en başına Türkçe açıklama yorum satırı eklenmelidir.

Örnek JavaScript/JSX dosyası için:

```js
// Bu dosya, araçtan gelen canlı veriyi WebSocket üzerinden alıp dashboard içinde kullanılabilir hale getirir.
// Amaç, App.jsx dosyasını veri alma detaylarından bağımsız tutmaktır.