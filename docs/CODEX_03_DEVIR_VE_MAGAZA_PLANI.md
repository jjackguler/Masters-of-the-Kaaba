# Claude devir notu ve mağazaya çıkış planı

Tarih: 7 Kasım 2026. Repo: https://github.com/jjackguler/Masters-of-the-Kaaba — main.

## Bu paketi nasıl okumalı?

1. **01_GUNCEL_KOD_KONTROLU.md:** d4cc5847769e3d30eb36cd3961e4e2879f5bb09e commit'i üzerinde son teknik inceleme. Önce CODEX_SON_KONTROL.md, sonra yalnız l9–l13 okundu. T03–T20 tek tek değerlendirildi. Seçili fonksiyonlarla kayıt, para ve saat mantığı izole denendi. Repo değiştirilmedi. Bu dosya güncel teknik sonuçlarda önceliklidir.
2. **02_GENIS_TASARIM_UX_PAZAR_RAPORU.md:** önceki teslim edilen HTML, kaynak ZIP, dört ekran ve reklam karelerine dayanır. Görsel dil, HUD, kamera, ilk dakika, yedi bölüm, etkileşimler, rakipler, gelir modeli, reklam ve mağaza metinleri ayrıntılıdır. Bu rapordaki eski teknik eksikleri güncel sürümde hâlâ var kabul etme; 01 ile uzlaştır. Örneğin eski eksik build dosyaları bulgusu yeni repoda yeniden doğrulanmadı.
3. **03_DEVIR_VE_MAGAZA_PLANI.md:** bu dosya; araştırmanın sınırlarını ve ürünü mağazaya götürme sırasını verir.

**Yapılmayanlar:** Son sürümün görsel ekran incelemesi, tam yedi bölüm + hizmet katmanı oynanışı, fiziksel iPhone/Android performans testi, ses dinleme, native paket/signing incelemesi, gerçek kullanıcı araştırması ve mağazaya yükleme. Eski ekranlara ilişkin görsel eleştiriler güncel arayüzde yeniden doğrulanmalıdır. Kısa son kontrolün hızı kapsamın beş kod dosyasıyla sınırlandırılmasından gelir; tam ürün sertifikasyonu değildir.

## Tasarım, görsel kalite ve UX için uygulanacak sıra

Bunlar yeni sürümde doğrulanmış görsel kusur listesi değil, önceki incelemeye dayalı tasarım hedefleridir.

| Alan | Somut hedef | Doğrulama |
|---|---|---|
| İlk 60 saniye | Kısa hikâye bağlamı; hareket, ilk yük, ilk teslim, dünyada görünen değişim | Yeni oyuncu sözlü yardım olmadan neyi nereye götüreceğini anlıyor mu? |
| HUD | Bir ana görev; yük türü/kapasite; ikincil sayaçlar daha hafif; gece için ayrı tehlike bandı | Küçük ekran, uzun TR/EN metin, çentik, büyük yazı; kesilme/çakışma yok |
| Kamera ve çevre | Oyuncu, teslim alanı ve kısa rota görünür; iskele/gölge hedefi bastırmıyor | Gündüz/gece gerçek cihaz kayıtları; örten nesne testleri |
| Etkileşim | Yaklaşma, yüklenme, teslim, dolu hedef ve yanlış malzeme açık; yükseltmede fiyat/fayda/onay | Ses kapalı ve renk ayırt etmeden anlaşılma; otomatik kaynak harcama yok |
| Eylem hissi | Taşın alınması, taşınması ve yerleşmesi görsel/ses/haptik olarak tutarlı | Kısa etki; azaltılmış hareket ve titreşim kapama seçenekleri |
| Hizmet katmanı | İlk su→servis→para turu için kısa öğretici; farklı mevsim hedefleri; yardımcının faydası görünür | Kuyruk ve stok anlaşılır; artan hedef yalnızca daha uzun bekleme yaratmıyor |
| Sonuç ekranı | Başarının nedeni, yapıdaki değişim ve sonraki açılan mekanik | Yıldız/ödül anlaşılır; öğrenme metnini okumak cezalandırılmıyor |

Görsel tasarımın yenilendiğini doğrulamak için Claude'dan yeni sürümün başlık, ilk görev, inşa, gece, sonuç ve hizmet ekranlarını aynı cihaz ölçülerinde karşılaştırmasını iste. Mevcut dosya açma yasağı sürerken web/*.html veya test/*.png açılarak bu test yapılmış gibi yazılmamalı; gerekli ayrı görsel test kapsamı kullanıcıyla netleştirilmeli.

## Pazarlama ve satış önerisi

**Konumlandırma hipotezi:** “Taşı, yardımlaş, inşa et; tarihî Mekke'de bir öyküyü keşfet.” Hedef kitle araştırması yapılmadan yaş, fiyat ve satış beklentisi kesinleştirilmez. Geniş raporda Pizza Ready/My Mini Mart yakın mekanik örnekleri; Minecraft/Stardew Valley/Monument Valley/Royal Match farklı kalite ilkeleri için karşılaştırılmıştır. Satış ve indirme rakamları aynı ölçü değildir.

**İlk gelir modeli adayı:** İlk bölüm veya kısa demo ücretsiz, hikâyenin devamı ve hizmet katmanı tek seferlik satın alma. Alternatif: baştan ücretli premium oyun. Henüz bir model uygulanmış veya onaylanmış değildir. Sonlu hikâye + hizmet katmanı için abonelik ancak düzenli yeni içerik vaadi gerçekten sürdürülebilirse düşünülmeli. İyilik/bereket gibi kavramları gerçek parayla alınan dinî değere dönüştürme; zorunlu reklam veya ücretli can ekleme önerisi yok.

**Mağaza sunumu:** İkon küçük boyutta tanınmalı; altı gerçek ekran sırasıyla “Bir taşla başla”, “Adım adım yükselt”, “Ustalarla iş bölümü yap”, “Barışı koru”, “Hikâyeyi keşfet”, “Hacılara hizmet et” mesajlarını göstermeli. Uygulanmayan özellikler pazarlanmasın. İlk 3 saniyelik video denemesi: taş yerleşir ve duvar görünür biçimde yükselir. Ardından üretim, yardım ve hizmet katmanı; finalde tek çağrı. Mevcut reklamın ses kalitesi incelenmedi. “İnternetsiz”, “reklamsız” ve “kaldığın yerden devam” vaatleri son paket üzerinde test edilmeden kullanılmamalı.

**Lansman önerisi:** Önce küçük Türkçe pilot; kontrol, ilk teslim, bölüm tamamlama ve kayıt sorunlarını düzelt. Sonra Türkçe/İngilizce mağaza metinleri ve üç farklı gerçek oynanış açılışıyla küçük edinim denemesi. Bütçe belirtilmediği için reklam harcaması veya satış rakamı önerilmiyor. Ölç: mağaza sayfası→yükleme, ilk teslim, ilk bölüm bitişi, ertesi gün dönüş ve ödeme varsa demo→satın alma. Çocuk hedef kitle/veri kararı alınmadan otomatik izleyici SDK ekleme. Küçük test oranlarını tüm pazarın sonucu sayma.

## App Store ve Google Play'e nasıl yüklenmeli?

### Önce ortak hazırlık

1. Son rapordaki para çoğaltma, kayıt kaybı ve durum geçişi sorunlarını çöz. Aday sürümü bir commit'e sabitle; cihaz test sonuçlarını o sürüme bağla.
2. Web oyununun Android/iOS uygulama paketlerini hazırla. Native proje başka yerde varsa onu kullan; son inceleme bu projelerin varlığını, derlenmesini veya imzalanmasını doğrulamadı. Oyunun HTML dosyası veya inceleme ZIP'i mağaza uygulama paketi yerine geçmez.
3. Motor, varlıklar, kayıt ve ses yaşam döngüsü; offline ilk açılış, arka plan/geri dönüş, düşük bellek ve 15 dakikalık oyun testleri. Android ve iOS sonuçlarını ayrı yaz.
4. Geliştirici kimliği, kalıcı uygulama kimliği, destek adresi, gizlilik politikası, lisanslar, hedef yaş/ülke/dil ve gelir modeli kararı. Çocuk kategorisi seçimiyle reklam/analitik ve ebeveyn alanı gereksinimlerini birlikte değerlendir. [Apple inceleme kuralları](https://developer.apple.com/app-store/review/guidelines/), [Google Families](https://support.google.com/googleplay/android-developer/answer/9893335?hl=en).

### Android / Google Play

1. Play Console geliştirici hesabıyla yeni uygulama kaydı aç: oyun, dil, ücretsiz/ücretli model, paket adı ve destek iletişimi.
2. Sürüm numarası ve imzalama düzenini tamamla; imzalı **Android App Bundle (.aab)** üret ve Play App Signing ayarını yap. Önce internal test kanalına gönder. Paket adı kalıcıdır; isim kararını erken netleştir. [Google kurulum ve paket rehberi](https://support.google.com/googleplay/android-developer/answer/9859152?hl=en).
3. Mağaza metinleri, ikon/gerçek ekranlar, içerik derecelendirmesi, hedef kitle, reklam beyanı, uygulama erişim talimatları ve Data safety formunu gerçek SDK/veri davranışına göre doldur. Veri toplamayan uygulama için de ilgili beyanlar gerekir. [Data safety rehberi](https://support.google.com/googleplay/android-developer/answer/10787469?hl=en).
4. Yeni kişisel hesap koşulu sana uygulanıyorsa, **en az 12 testçi 14 gün kesintisiz kapalı teste dahil** olmalı; ardından production erişimine başvurulur. Bu, bütün hesaplar için evrensel koşul veya otomatik onay değildir. [Resmî test şartları](https://support.google.com/googleplay/android-developer/answer/14151465?hl=en).
5. Bulguları düzelt, nihai paketi incelemeye gönder ve onaydan sonra seçili ülkelerde yayınla. Yayın sonrası sorunları takip et; güncellemeleri kontrollü dağıt.

### iPhone / Apple App Store

1. Apple Developer Program üyeliği, uygulama Bundle ID ve App Store Connect uygulama kaydı; ücretli satış varsa ilgili sözleşme/vergi/banka işlemleri. [Apple iş akışı](https://developer.apple.com/help/app-store-connect/get-started/app-store-connect-workflow).
2. İOS projesinin imzalama/provisioning ayarlarıyla bir dağıtım build'i oluştur. Xcode archive/upload veya desteklenen yükleme yoluyla App Store Connect'e gönder. Standart yerel Xcode derlemesi için Mac ortamı gerekir; uygun bir Mac build hizmeti de planlanabilir. [Apple Xcode yükleme rehberi](https://help.apple.com/xcode/mac/current/en.lproj/dev442d7f2ca.html), [build yükleme](https://developer.apple.com/help/app-store-connect/manage-builds/upload-builds).
3. Önce TestFlight'ta gerçek iPhone testleri. Dış test grubuna açma sürecinin beta inceleme adımlarını tamamla. [TestFlight rehberi](https://developer.apple.com/help/app-store-connect/test-a-beta-version/testflight-overview/).
4. Sürüm sayfasına gerçek ekranlar, açıklama/alt başlık, yaş derecesi, uygulama gizliliği, destek ve gizlilik URL'leri, inceleme notları; satın alma varsa ürün ve geri yükleme testleri ekle. İncelemeciye hizmet katmanına erişim yolunu açıkla.
5. İşlenmiş build'i sürüme bağla; gerekli metadata tamamlanınca App Review'a gönder. İlk yayın zamanını kontrol etmek için manuel yayın tercihi değerlendir. [Apple gönderim rehberi](https://developer.apple.com/help/app-store-connect/manage-submissions-to-app-review/submit-an-app).

SDK/target API ve paket uyumluluk kuralları gönderim tarihinde yeniden kontrol edilmeli. Başarılı derleme, mağaza onayı anlamına gelmez. Bu aşamada hesaplarda işlem, ödeme veya yayın yapılmadı.

## Claude'dan istenecek çıktı

Tek bir öncelikli tablo: **güncel kod bulgusu → kanıt/tekrar → önerilen düzeltme → kabul testi**. Ardından görsel/UX için **hâlâ geçerli / uygulanmış / yeniden görüntü gerekli** ayrımı; son olarak mağaza için **hazır / eksik / hesap sahibi kararı gereken** listesi. Önce analizi ve planı hazırlasın; kod değişikliği veya mağaza yayını yapmasın.
