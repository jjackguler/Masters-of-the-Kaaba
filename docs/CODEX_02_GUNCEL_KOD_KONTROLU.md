# Kâbe Ustaları — main son kontrol

**7 Kasım 2026 · [main: d4cc584](https://github.com/jjackguler/Masters-of-the-Kaaba/tree/d4cc5847769e3d30eb36cd3961e4e2879f5bb09e)**

Kapsam: önce `CODEX_SON_KONTROL.md`, ardından yalnız `kaynak/l9.js`–`l13.js` okundu; yasaklanan dosyalar açılmadı. Kod değiştirilmedi. Seçili kaynak fonksiyonları izole koşullarda denendi; tam oyun/cihaz testi yapılmadı. **doğrulandı** kod veya izole mantık kanıtı; **olası** koşula bağlı risk; **öneri** tasarım değişikliğidir. Aşağıdaki tüm JS referansları `kaynak/` altındadır. **Sonuç: T03–T20 tamamen kapanmış değil; kayıt/ekonomi önce düzeltilmeli.**

## 1. Öncelikli kalan/yeni sorunlar

| Önem / etiket | Bulgu, tekrar koşulu ve gerekli düzeltme | Dosya:satır |
|---|---|---|
| **P1 · doğrulandı** | **Aynı para yeniden alınabiliyor.** Tezgâhta kayıtlı 24'ü topla; 3 saniyelik meta snapshot'tan önce duraklat ve yeniden yükle. UI durumundaki dirty-save yeni bakiyeyi eski `meta.cash=24` ile yazıyor. İzole deney: bakiye 200→224; canlı tezgâh 0, kayıtlı tezgâh 24. Bakiye, stok ve tezgâhı birlikte kaydet. Hikâyede de sıra sonu +15 kaydolurken `D.run` eski kalıyor; sinematikte kapanış tamamlanan işi yeniden ödüllendirebilir. | `l13.js:183`, `l12.js:204`, `l13.js:175`, `l11.js:194`, `l12.js:53` |
| **P1 · doğrulandı** | **Saat istismarı açık.** Saka alınmışken saati +2 saat yap: +360; geri al: `lastT` geriye çekiliyor; yeniden +2 saat: tekrar +360. İki saat sınırı tek talebi kısıtlıyor. Geri giden saatte yüksek-su-işaretini koru; oturum içini monoton saatle ölç. Güvenilir dış zaman olmadan ileri saat hilesi bütünüyle engellenemez. | `l13.js:139`, `l13.js:140`, `l13.js:143` |
| **P1 · doğrulandı** | **Hizmet katmanında taşınan stok kayboluyor.** Kervandan yük al, kayıt oluşsun, kapat/aç: azalan kaynak korunuyor; oyuncunun yükü ve yardımcı yükleri kayıtta yok, girişte oyuncu yükü boşaltılıyor. Yardımcı da hedef doluysa yükünü siliyor. Transit envanteri kaydet; dolu hedefte beklet/geri taşı. | `l13.js:90`, `l13.js:147`, `l13.js:160`, `l13.js:161`, `l12.js:51` |
| **P1 · doğrulandı** | **T08 tam kapanmamış.** Ham taş taşırken hem taşçı girişi hem çıkışı doluysa ok dolu girişe gider; elde ham taş olduğu için çıkıştan kesme taş alınamaz. Giriş boşalmıyor, bırakma yolu yok. Kapasiteyi dikkate alan hedef + geri bırakma alanı gerekir. | `l12.js:109`, `l9.js:167`, `l9.js:181`, `l9.js:182` |
| **P1 · olası** | **Gecikmiş mevsim ekranı yanlış duruma döndürebilir.** Mevsim bitiminden sonraki 700 ms içinde duraklat→Bölümler: cleanup `R.ch` değerini 8 bırakıyor. Eski callback haritanın üstünde sonuç açabilir; “Sonraki” yalnız `state='play'` yapar, temizlenen hooks/gizlenen hizmet dünyasını kurmaz. Timer'ı iptal et veya oturum kimliğiyle doğrula. Kesin boş ekran cihazda yeniden üretilmedi. | `l13.js:124`, `l13.js:130`, `l11.js:135`, `l11.js:273` |
| **P2 · olası** | **Yardımcı engelde takılabilir:** hedefe düz hareket + çarpışma var; hacılardaki sıkışma kurtarması yardımcıda yok. Rota/ilerleme watchdog'u ekle. Hacıların sonsuz kuyruk büyütmesi ise sınırlandırılmış: stand başına 6, toplam havuz 8/12/14; bu, bütün rotaların sorunsuzluğunu kanıtlamaz. | `l13.js:88`, `l13.js:103`, `l13.js:46`, `l13.js:97` |

## 2. T03–T20 kontrolü — önem sırasıyla

| Bulgu | Etiket / sonuç | Kanıt veya kalan açık — dosya:satır |
|---|---|---|
| T06 kayıt | **doğrulandı · kısmi** | Snapshot/resume var; bakiye–run atomik değil, yardımcı yükü snapshot'ta yok. `l12.js:48`, `l12.js:53`, `l11.js:194` |
| T09 bozuk kayıt | **doğrulandı · kısmi** | Profil temizleniyor; `run.ch=1.5` kabul ediliyor, `CH[1.5]` yokken devam yolu kırılır. Tam sayı/şema kontrolü gerekli. `l9.js:205`, `l12.js:54`, `l11.js:142` |
| T08 hedef | **doğrulandı · kısmi** | Yük türü önceliği düzeldi; dolu atölye kilidi yukarıda. `l12.js:109` |
| T12 etkin kapasite | **doğrulandı · kısmi** | `hooks.cap()` alınıyor fakat `unload.n>=4` duruyor. Bölüm7 kapasite 2/3 iken tam parti bonusu yok; 2 yük deneyi: 0. `l9.js:152`, `l9.js:154`, `l11.js:150` |
| T13 kaynak temizliği | **doğrulandı · kısmi** | Cutscene dispose/paylaşım koruması var; kaldırılan yükseltme pad'lerinde geometry/material/texture dispose yok. Dinamik paylaşılan kaynakların tamamı bu kapsamda kanıtlanamaz. `l10.js:7`, `l12.js:207`, `l9.js:138`, `l13.js:71` |
| T03 geri dönüş | **doğrulandı · düzeldi** | Sonraki bölüm→Geri gerektiğinde haritayı açıyor. `l11.js:132` |
| T04 duraklama | **doğrulandı · düzeldi** | Defter/harita/sheet/hidden kapısı; hooks'a sıfır simülasyon süresi gidiyor. `l9.js:148`, `l9.js:158`, `l9.js:176` |
| T05 çift sonuç | **doğrulandı · düzeldi** | Şafak önceliği ve erken dönüş; `R.ended` koruması var. `l11.js:173`, `l11.js:180`, `l11.js:201` |
| T07 defter | **doğrulandı · düzeldi** | Codex kayda ekleniyor ve yüklemede birleşiyor. `l9.js:193`, `l9.js:204`, `l9.js:209` |
| T10 istemsiz harcama | **doğrulandı · düzeldi** | Otomatik pad ödemesi kalkmış; butonla alım var. `l9.js:186`, `l12.js:102` |
| T11 bonus hesabı | **doğrulandı · düzeldi*** | Ortak `award`; sonuçtan önce bonus kapatılıyor. *Kayıt atomikliği T06 altında hâlâ açık.* `l9.js:150`, `l11.js:201` |
| T14 ateş birikimi | **doğrulandı · düzeldi** | Dört ateş havuzu yeniden kullanılıyor. `l10.js:139`, `l10.js:145` |
| T15 input | **olası · kısmi doğrulama** | Reset/lostcapture/sheet/cine bağlantıları var; dış motor input alanlarının tamamı ve cihaz davranışı doğrulanmadı. `l12.js:34`, `l12.js:39`, `l12.js:78` |
| T16 ses | **olası · kısmi doğrulama** | Suspend/resume yolu var; Promise reddi yakalanmıyor, gerçek kesinti testi yok. `l12.js:43`, `l12.js:44` |
| T17 ayarlar | **doğrulandı · düzeldi** | Kontroller/Hakkında yeni sheet içine basılıyor. `l12.js:137`, `l12.js:140` |
| T18 azaltılmış hareket | **doğrulandı · büyük ölçüde** | CSS ve sinematik shake/flash kapısı var; yer oku hâlâ salınıyor. `l12.js:11`, `l12.js:41`, `l9.js:62` |
| T19 süre | **doğrulandı · düzeldi** | Önce toplam saniye yuvarlanıyor; `1:60` yolu kalkmış. `l11.js:207` |
| T20 HUD maliyeti | **doğrulandı · kısmi** | Ana HUD değişen değerleri yazıyor; gece çubukları hâlâ her kare DOM güncelliyor. `l12.js:5`, `l12.js:180`, `l11.js:170` |

## 3. Tasvir sınırı

**P1 · olası:** El-Emîn için beden/el modeli eklenmiyor; taşı hareket ettiren sahne anlatımla ilerliyor. Hacılar/yardımcılar isimlendirilmemiş. **Doğrudan Hz. Peygamber/sahâbe tasviri tespit edilmedi; kapsamlı uygunluk onayı değildir.** Bâkûm adı mevcut marangoz görüntüsüne bağlanıyor; bu şahsın kimliği/sahâbîlik eşleşmesi doğrulanmadan “bütün kişiler uygundur” denmemeli. `l10.js:158`, `l10.js:163`, `l10.js:168`, `l10.js:180`, `l13.js:83`, `l13.js:95`.

## 4. Tasarım — üç somut öneri

- **P2 · öneri:** İlk sel anlatısını kısa giriş + isteğe bağlı tam hikâye yap; mevcut öğreticide ilk teslimi ilk 60 saniyeye hedefle. Okuma süresi sahneleri tanımlı sürelerinden de uzatabiliyor. `l10.js:68`, `l9.js:34`, `l11.js:221`.
- **P2 · öneri:** Hizmete girişte “su al→standa bırak→bir hacıya servis→tezgâh parasını topla” öğreticisi ekle; şu an uzun giriş metninden doğrudan sisteme geçiliyor. `l13.js:196`, `l13.js:180`, `l13.js:183`.
- **P2 · öneri:** Mevsim hedefi 15→25→40→60 diye büyüyor; sadece artan sayı yerine dönüşümlü kısa ustalık hedefi ve sonraki yardımcının görünür faydasını göster. `l13.js:34`, `l13.js:123`, `l13.js:8`.
