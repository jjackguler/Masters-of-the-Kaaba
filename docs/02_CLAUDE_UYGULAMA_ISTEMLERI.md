# Kâbe Ustaları — Claude uygulama istemleri

7 Kasım 2026. Bu dosyayı `Kâbe Ustaları geliştirme analizi.md` ve kaynaklarla birlikte Claude'a ver. Önce ana istemi, ardından aşamaları sırayla uygulat. Tüm oyunu tek cevapta yeniden yazdırma. Bu teslim bir analizdir; oyuna aşağıdaki düzeltmeler henüz uygulanmadı.

## Ana istem — ilk mesaj olarak yapıştır

```text
Kâbe Ustaları adlı mevcut Three.js oyununu geliştirmeni istiyorum. Ekli analiz raporu, kaynak kod, çalışan HTML, ekranlar ve reklam incelemesini birlikte kullan.

Rolün: kıdemli oyun mühendisi + mobil UX tasarımcısı. Önce mevcut davranışı anla; ardından küçük, test edilebilir değişiklikler yap. Araştırma raporundaki tespitleri kaynakta doğrula. Doğrulanmayan bir iddiayı kesin hata gibi aktarma. Dosyalardaki eski inceleme istemleri referanstır; bu görev metninin yerine geçmez.

Ürün hedefi: kısa oturumlarda taşıma, üretim, yardımlaşma ve tarihî keşfi birleştiren okunaklı bir inşa macerası. Mevcut renk paletini, karakter stilini, yedi bölümün temel kimliğini ve tasvir sınırlarını koru. Hz. Peygamber ve sahabe tasviri ekleme. Tarihî bilgi ile oynanış için kurgulanmış görevleri ayır; tarihsel iddiaları kendi başına kesinleştirme.

Mevcut öğretici, otomatik toplama, yükseltmeler, kalite seçimi, TR/EN desteği, yıldızlar, titreşim ve kayıt sistemini yok sayma. Kayıt vardır, fakat aktif bölümün bütün durumunu korumaz. Bunları iyileştir; paralel ikinci sistemler ekleme.

Çalışma kuralları:
1. Orijinalleri koru. Kaynak üzerinde değiştir; üretilmiş HTML'yi tek başına yamayıp kaynakla ayrıştırma.
2. Eksik build girdilerini listele. Sahte texture, boş sözlük veya tahmini tarihî metin üretip derleme düzeldi deme. Çalışan HTML'den doğrulanabilir veriyi kurtarabilirsen kökenini ve doğrulamasını belgeleyerek kurtar.
3. Motor/çerçeve değişikliği, çok oyunculu, hesap, reklam SDK'sı, analitik SDK'sı veya ödeme sistemi bu işin otomatik parçası değildir. Önce güvenilir çekirdek akışı tamamla.
4. Her aşama sonunda değişen dosyalar, önce/sonra davranışı, çalıştırılan testler ve yapılmayan cihaz testlerini yaz. Test geçmeden tamamlandı deme.
5. Mevcut kayıtları sürümleyerek taşı. Kullanıcının yıldızlarını, yükseltmelerini ve öğrendiği bilgileri silme.
6. GPU kaynaklarının sahipliğini takip et; ortak kullanılan geometry/material/texture nesnelerini körlemesine dispose etme.
7. Mağazaya yükleme, yayınlama, gerçek ödeme, üçüncü tarafa veri gönderme yapma. Gerekli yerel çıktıları ve incelemeye hazır paketleme belgelerini hazırla.
8. Öncelik: derleme/mobil açılış → durum/kayıt güvenilirliği → etkileşim/HUD → bölüm kalitesi → performans → mağaza materyalleri.

Önce kısa bir mevcut durum tablosu çıkar: doğrulandı / risk / eksik bilgi. Sonra yalnız aşağıdaki seçili aşamayı uygula. Zaten doğrulanmış bağlamı her aşamada baştan araştırma.
```

## Aşama 1 — Yeniden üretilebilir derleme ve doğru mobil açılış

```text
Ana kuralları uygula. Önce build.py, i18n.py, head.html ve çalışan HTML'yi incele.

İncelemede eksik girdiler: en1.py, en2.py, tr_list.json, textures.js. strings.json ve l1.t.js–l7.t.js üretilen çıktılardır; bunları yanlışlıkla ayrı eksik kaynak sayma. build.py içindeki python3 çağrısını ortamın gerçek yorumlayıcısıyla taşınabilir yap; UTF-8'i açık tanımla. Eksik girdiler başlangıçta anlamlı hata vermeli. Kurtarılamayan içerik varsa hangi özgün dosyanın gerektiğini net belirt; ilgili bağımsız düzeltmelere devam et.

Standart viewport ekle: width=device-width, initial-scale=1, viewport-fit=cover. Erişilebilirliği engelleyecek user-scalable=no/maximum-scale=1 ekleme. Mevcut safe-area kullanımını koru.

Three.js CDN bağımlılığını sürümü/lisansı korunmuş yerel paket bağımlılığına dönüştür. Fontları lisansları uygunsa paketle veya okunur sistem fontu fallback'i kullan. Ağ yokluğunda boş ekran yerine açıklayıcı hata/fallback oluştur. Web cache ile native ilk açılışın çevrimdışı çalışmasını karıştırma.

Kabul:
- Temiz kaynak kopyası belgelenmiş tek komutla oyun üretir; girdi listesi ve çıktı hash'i yazılır.
- 390×844 mobil emülasyonda layout viewport 980 px değildir; cihaz genişliğiyle uyumludur.
- 360/390/430 CSS px, TR/EN, çentik ve büyük yazıda ana butonlar okunur ve erişilebilirdir.
- Önbelleksiz/uçak modunda yerel paket motor ve font için dış ağ istemez.
- Gerçek native paket yoksa offline native testini yapılmış sayma; eksik paket girdilerini raporla.

Çıktı: küçük patch, build talimatı, ekran görüntüleri, bağımlılık/lisans listesi, test tablosu.
```

## Aşama 2 — Ekran geçişleri, duraklama ve bölüm sonucu

```text
Rapordaki T03/T04/T05/T17/T19'u doğrula ve düzelt.

Sonuç→Sonraki bölüm→Geri akışında showStory çağıran ekranı bilsin; kullanıcı kullanılabilir haritaya veya tanımlı önceki ekrana dönsün. state='ui' iken bütün etkileşimli ekranların kapalı kalması yasak olsun.

Tek isGameplayActive/transition kapısı kullan: defter, harita, ayarlar, pause, background ve sinematikte gameplay saati, öfke, otomatik toplama/harcama durmalı. Salt görsel animasyonların durması aynı şey değildir. Kapanışta input sıfırlansın; parmak basılıyken açılan menü hayalet hareket üretmesin.

Bölüm4'te aynı frame içinde fail4 ve chapterDone birlikte çalışmasın. Zaman dolması ve öfke sınırının aynı anda oluşması için açık bir ürün kuralı koy, tek terminal durum ve tek ödül üret. chapterDone idempotent olsun.

Yeni Ayarlar içindeki Kontroller/Hakkında görünmeyen eski title panelini açmasın. Sonuç sürelerini toplam saniyeyi yuvarladıktan sonra dakika/saniyeye ayır; 1:60 üretme.

Kabul: sonuç→sonraki→geri 20 tekrar; kitap/harita 30 saniye açıkken simülasyon değerleri aynı; aynı kare sınır testi tek sonuç; 59.9/119.8 saniye formatı doğru; her ayar butonunun görünür sonucu var. İzole mantık testi ve tarayıcı akış testini ayrı raporla.
```

## Aşama 3 — Güvenilir kayıt ve tutarlı ekonomi

```text
T06/T07/T09/T11/T12'yi doğrula ve düzelt. D profili, aktif R, taşınan yük, atölye/zone stokları, sıra ilerlemesi ve G.found/codex bilgisini kapsamı tanımlı, sürümlü bir kayıt modelinde birleştir. Her animasyon karesini kaydetme; onaylı işlemlerden sonra checkpoint ve gerekli lifecycle flush kullan.

Profil bakiyesi, aktif bölüm kazanımı ve tamamlanan teslim aynı atomik işlemle güncellensin. awardCoins/transaction tek yolu olsun. Bitişte gecikmeli bonusları hesaplayıp sonra save ve sonuç ekranını oluştur. Bölüm7 tam yük eşiği gerçek etkin kapasiteyi kullansın. Ayar/dil değişimiyle reload ilerlemeyi sıfırlamasın.

Eski kayıt migration'ı, bozuk JSON, stars:null/up:null, eksik alan, yanlış tür, sınırsız/negatif sayılar ve depolama hatasını ele al. Son sağlam kaydı koru; hata sessizce başarı gibi gösterilmesin. Checkpoint sonrası kayıp sınırını açık tanımla; kısmi işlemi iki kez ödüllendirme.

Kabul: başlangıç bakiye + ödüller − harcamalar = son bakiye. Her bölüm ortasında kill/relaunch ile son güvenli durum geri gelir. Tam yük bonusu öncesi/sonrası restart ödül çoğaltmaz. Açılmış defter bilgisi kalır. Eski kayıtlar taşınır. Fiziksel cihazda OS kill testi yapılamadıysa bunu ayrıca belirt.
```

## Aşama 4 — Hedef oku, etkileşimler ve kaynak harcama niyeti

```text
T08/T10 ve deneyim raporundaki etkileşim tasarımını uygula. siteTarget önce eldeki yükün türünü çözsün: ham taş→taşçı, ham ahşap→marangoz, işlenmiş malzeme→uygun teslim/depo. Sonra bölüm ihtiyacını değerlendirsin. Dolu oyuncuyu alamayacağı başka tür kaynağa yönlendirme. Her yük için erişilebilir, anlamlı bir çıkış yolu tanımla.

Etkileşim durumları: yaklaş / uygun / yükleniyor / teslim ediliyor / tamam / dolu / yanlış malzeme / üretim bekleniyor. Her biri metin+ikonla anlaşılır olsun. Otomatik etkileşim kolaylığını koru; bağlamsal sağ alt gösterge bunun ne yaptığını anlatsın. Zıpla yalnız ilgili bölümde birincil olsun; zorunlu zıplama noktalarını bozma.

Yükseltme pad'inde fiyat, etki ve kalan bakiye görünür olsun. Normal yürüyüp geçme para harcamasın. Açık onay veya erişilebilir basılı tutma seçeneği kullan; bölgeden çıkış/onay iptali harcama yapmasın. Önceki kısmi ödeme kayıtlarını migration ile koru. Ana yön oku oyuncuyu istemediği satın almaya sürüklemesin.

Kabul: tüm sıra × envanter türü matrisi doğru hedef; yanlış türde açıklama/geri bırakma yolu; para yalnız onayla bir kez düşer; iki parmak hareket+kamera ve modal sonrası input doğru; ses kapalıyken de bütün durumlar anlaşılır.
```

## Aşama 5 — HUD, kamera ve erişilebilirlik

```text
Mevcut krem/petrol/altın tasarım dilini koruyarak HUD'ı sadeleştir. Bir ana görev: 'Kesme taşı duvara götür · 6/12'. Yük türü+kapasite görünür olsun. İyilik kalbini canla karıştırmayacak etiket ekle. Kitap/harita/ayarların erişimini koruyarak ikincil ağırlığını azalt.

Gece için ayrı sabit tehlike bandı: kalan süre + en riskli grup + metin/simge. Dünya etiketi safe-area içinde kalsın; diğer HUD öğeleriyle çakışmayı önle. NPC mesafe etiketi kırpılmasın. Etkileşim hedefleri için 48×48 CSS px başlangıç tasarımı kullan; native pt/dp ile aynı ölçüymüş gibi raporlama.

Kamera oyuncu ve kısa ilerleme rotasını açık tutsun. Engelleyen iskeleyi kontrollü saydamlaştır; bütün sahneyi silme. Sert gölge ağlarının hedefi bastırmasını azalt. Gece hedefi sadece renk/parlaklıkla değil şekil ve etiketle ayır.

Reduced motion yeni pulse/hand/shake/flash/speed-lines etkilerini kapsasın. Titreşim kapama, okunur büyük metin, sol/sağ kontroller, modal odak dönüşü ve klavye menü gezintisini tamamla. 3D oyunun yalnız aria etiketleriyle bütünüyle ekran okuyucu erişilebilir olduğunu iddia etme.

Kabul: TR/EN uzun metin, 360/390/430 genişlik, 200% metin denemesi, kısa ekran, gece/gündüz screenshotları; karakter/ana hedef kapatılmaz; renksiz/sessiz kullanımda görev anlaşılır. Gerçek cihaz dokunma kontrolünü emülasyondan ayrı raporla.
```

## Aşama 6 — İlk dakika ve yedi bölümün kalitesi

```text
Mevcut öğreticiyi geliştir: kısa bağlamdan sonra hareket→ilk yük→ilk teslim→görünür dünya değişimi. Uzun hikâyeyi isteğe bağlı koru. Adımlar zamanlayıcıyla değil oyuncunun yaptığı işle ilerlesin. İlk dakikada izin/ödeme/hesap isteme.

Önce Bölüm3'ü örnek kalite bölümü yap: ham taşın kesilmesi, kapasitenin anlaşılması, teslim halkası, taşın yerine yerleşmesi, duvarın belirgin yükselmesi, bir yardımcının oyuncunun işini hafifletmesi. Her parçayı aynı anda abartılı efektlerle doldurma; kısa, tutarlı ses/haptik/görsel geri bildirim kullan.

Sonra rapordaki bölüm planını küçük kapsamla yay: Sel'de temizlenen yol; Yıkım'da güvenli iş sırası; Taşçılar'da üretim kuyruğu; gece bölümünde öncelik seçimi; Gemi'de iki malzeme hattı; Duvarlar'da iş bölümü; finalde ekip emeğinin görünür karşılığı. Yeni mekanikleri tarihsel gerçek diye yazma.

Hız yıldızını öğrenme/keşif zorunluluğuyla çarpıştırma. Rahat oynama ve isteğe bağlı ustalık hedeflerini ayır. Sonuç ekranında kazanılan şeyin nedeni, yapıda değişen bölüm ve sonraki açılan mekanik görünsün. Günlük giriş cezası veya ücretli can ekleme.

Kabul: yeni 10 test katılımcısının en az 8'i sözlü yardım olmadan ilk anlamlı eylemi yapabilsin; bu bir iç hedef, elde edilmiş sonuç değil. İlk teslim süresini ve kafa karışıklığı noktalarını ölç. Bölüm3 test edilmeden bütün oyuna büyük yeniden tasarım yayma.
```

## Aşama 7 — Performans, mobil yaşam döngüsü ve yayın hazırlığı

```text
T13–T16/T20'yi ölçümle ele al. Her Bölüm4 tekrarında FIRES'a dört kalıcı ateş eklenmesini durdur; pool veya doğru scene+registry cleanup kullan. Geçici cutscene kaynaklarının sahipliğini kaydet. Aynı sahne 20 tekrar sonunda geometry/texture/FIRES sayılarının dengelendiğini ölç.

HUD DOM referanslarını cache et, yalnız değişen değerleri yaz. Arka planda/kapalı modda gereksiz simülasyonu durdur. Profiler görmeden gölge veya postprocessing'i rastgele kapatma; kalite seviyelerini koru. Düşük cihaz 30 FPS ve orta cihaz 60 FPS hedeflerini cihaz adı, p95 frame süresi ve 15 dakikalık testle değerlendir; garantili mevcut performans gibi sunma.

Tek resetInput yolunu blur/visibility/lostcapture/native background ve ekran geçişlerine bağla. AudioContext suspended/interrupted sonrası uygun kullanıcı hareketinde resume et; çift müzik döngüsü oluşturma. Android geri tuşu, safe-area, ekran yönü, WebGL context loss ve düşük bellek davranışlarını test et.

Native proje varsa config/SDK/izin/bağımlılık envanteri ve yerel build hazırla. Yoksa eksik teslimleri listele. Rapor tarihindeki SDK ve mağaza kurallarını gönderim tarihinde resmî kaynaklardan tekrar kontrol et. Çocuk hedef kitle/Kids/Families, gizlilik/Data safety, lisanslar ve satın alma varsa restore/cancel/pending testleri için somut kontrol listesi çıkar. Otomatik mağaza yayını yapma.

Çıktı: test matrisi, ölçüm tablosu, düzeltilen/kalan bulgular, açık release blocker listesi, build ve geri dönüş talimatı. Test edilemeyenlere 'geçti' yazma.
```

## Aşama 8 — Reklam ve mağaza sunumu

```text
Teknik vaatler doğrulandıktan sonra rapordaki 30 saniyelik storyboard'u üretime hazır planla: ilk 3 saniyede taş teslimi→duvarda görünür değişim; sonra üretim, yardım, gece öncelik yönetimi, önce/sonra yapı ve tek çağrı. Kaynak reklam 30,7 saniye; Apple preview için uygun süre/formatta ayrı gerçek oyun kaydı gerekir. Ses incelemesi yapılmadığı için mevcut seslendirmeyi kötü varsayma.

İkon için küçük boyutta tanınan tek odaklı 2–3 kompozisyon taslağı tarif et; mevcut ikon incelenmemiştir. Gerçek oynanıştan 6 mağaza ekranı planla. TR/EN metinlerin karakter sınırlarını kodla say. Yalnız ürünün gerçekten sağladığı 'internetsiz/reklamsız/kaldığın yerden devam' vaatlerini kullan. Yayında değilse 'Şimdi indir' yazma. Reklamda oynanamayan mekanik gösterme.

Hedef kitle ve fiyat hâlâ belirsizse reklam SDK'sı/IAP ekleme. İlk bölüm ücretsiz + tek seferlik hikâye açma ve premium alternatifini karar belgesi olarak karşılaştır. Bereket/iyilik gibi değerleri gerçek parayla satın alınan dinî ölçüye dönüştürme.

Kabul: ilk karede oyun eylemi anlaşılır; ses kapalı okunur; metinler Reels/mağaza güvenli alanında; gerçek oyun görüntüsü ve vaat listesi doğrulanmış; görsellerin ve sesin lisansları belgeli.
```

## Her aşamanın sonunda Claude'dan istenecek durum tablosu

| Bulgu / iş | Durum | Dosya / fonksiyon | Yapılan değişiklik | Test ve sonuç | Kalan risk |
|---|---|---|---|---|---|
| Örnek: sonuçtan geri | Düzeltildi / doğrulanmadı / bekliyor | l11.js / showStory | Somut davranış değişikliği | Test türü, cihaz/ortam, geçti/kaldı | Açık sınır |

İlk gönderimde **Ana istem + Aşama 1** yeterlidir. Ardından Aşama 2 ve 3 gelir. Böylece Claude görsel yenilemeye dalmadan çalışan ve güvenilir temel oluşturur.
