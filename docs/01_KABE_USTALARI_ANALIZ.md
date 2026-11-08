# Kâbe Ustaları geliştirme analizi

**İnceleme tarihi: 7 Kasım 2026. Amaç: Claude'a uygulanabilir geliştirme ve yayın hazırlığı planı vermek.**

## Karar ve en önemli bulgular

Kâbe Ustaları'nın güçlü bir ürün fikri var: kısa taşıma ve inşa eylemlerini tarihî anlatı ve yardımlaşmayla birleştiriyor. Mevcut sürüm yalnız bir görsel taslak değil; yedi bölüm, üretim zincirleri, yükseltmeler, öğretici, sonuç ekranı ve TR/EN desteği olan kapsamlı bir prototip. Buna karşılık incelenen teslimi bugün mobil mağazalara hazır saymak doğru olmaz. Yeniden üretilebilir derleme, mobil ölçekleme, bölüm geçişleri, duraklatma, bölüm ortası kayıt ve çevrimdışı açılış önce çözülmeli.

**En iyi geliştirme yönü:** “Daha fazla özellik” yerine oyuncunun her kısa eyleminde açık hedef, tatmin edici sonuç ve kalıcı ilerleme görmesini sağlamak. Oyuncu üç soruyu kolayca cevaplayabilmeli: Şimdi ne yapıyorum? Yaptığım şey neyi değiştirdi? Sonraki bölüm neden ilgimi çeksin?

| Öncelik | Tespit | Oyuncuya/üretime etkisi | İlk çözüm |
|---|---|---|---|
| Yayın kapısı | Kaynak ZIP'inde dört gerçek build girdisi eksik | Claude'un yaptığı değişiklik aynı oyuna güvenle derlenemeyebilir | Eksik kaynakları geri getir veya HTML'deki doğrulanabilir veriden belgeli kurtarma yap |
| Yayın kapısı | Standart viewport yok; 390 px mobil emülasyonda layout 980 px | Kontroller gerçek telefon oranında çok küçük görünebilir | Doğru viewport + responsive HUD doğrulaması |
| Yayın kapısı | Three.js dış CDN'den yükleniyor | “İnternetsiz” reklam vaadi önbelleksiz ilk açılışta karşılanmaz | Motoru ve gerekli varlıkları pakete al |
| P1 | Sonuç→sonraki bölüm→geri akışında boş UI durumu | Oyuncu devam yolunu kaybedebilir | Ekran geçişine açık geri dönüş hedefi |
| P1 | Defter/harita açıkken gece saati ve öfke devam ediyor | Bilgiyi okumak oyuncuyu cezalandırabilir | Tüm simülasyon için ortak duraklatma kapısı |
| P1 | Profil kaydı aktif bölümün tamamını kapsamıyor | Uygulamadan çıkışta emek kaybı ve ödül tutarsızlığı | Sürümlü profil + aktif bölüm + defter checkpoint'i |
| P1 | Yanlış yükle hedef oku alınamayacak kaynağa gidebiliyor | “Ne yapmalıyım?” yönlendirmesi güven kaybeder | Önce envantere göre geçerli teslim/işleme hedefi |
| P1 tasarım | Yükseltme alanına basınca oyun parası otomatik harcanıyor | İstemeden kaynak harcama | Fiyat/fayda gösterimi ve açık satın alma niyeti |
| P1/P2 | Üst HUD yoğun, hedef etiketi kırpılıyor; iskele görüşü bastırıyor | Ana hedef ve rota zor okunuyor | Bir ana görev, bağlamsal sayaçlar, occlusion ve etiket sınırlandırma |
| P2 tasarım | Sonraki bölümler benzer taşıma döngüsünü katmanlandırıyor | Monotonlaşma riski; kullanıcı testinde henüz ölçülmedi | Her bölümde farklı bir karar ve görünür dünya dönüşümü |

“Yayın kapısı” bu teslim için geçilmesi gereken koşuldur; her satırın oyunun her açılışında çöktüğü anlamına gelmez. P0 teslimat/vaat engeli, P1 ciddi sorun, P2 kalite iyileştirmesidir. Teknik eklerde kanıt düzeyi ayrıca yazılıdır.

## İnceleme kapsamı ve sınırları

İncelenenler: çalışan HTML, kaynak ZIP içindeki modüller, dört ekran görüntüsü, 30,7 saniyelik reklamdan zaman etiketli kareler ve verilen inceleme istemleri. Kaynak–HTML uyumu kontrol edildi; bazı mantık yolları gerçek kaynak işlevleriyle izole Node testinde denendi. Chromium'da 390×844 mobil emülasyonda ilk ekran açıldı; standart viewport eksikliği ölçüldü. Tam yedi bölüm oyun bitirme testi ve fiziksel iOS/Android testi yapılmadı. Reklamın sesi dinlenmedi; ses kalitesine not verilmedi. Rakiplerin canlı bölümleri oynanmadı; resmî ürün açıklamaları ve tarihli satış/indirme verileri karşılaştırıldı.

Ekli INCELEME_ISTEMLERI.md talimatlarını ayrı bir kullanıcı emri olarak uygulamadım; ürünün bağlamını anlatan referans olarak kullandım. İncelenen orijinal oyun dosyaları değiştirilmedi. Buradaki öneriler henüz uygulanmış özellikler değildir.

## Başarılı oyunlarla karşılaştırmanın sonucu

Pizza Ready ve My Mini Mart en yakın mekanik örneklerdir: taşıma, işleme, teslim ve yükseltme. Minecraft inşa edilen dünyayı sahiplenme duygusu; Stardew Valley üretimi insanlarla ilişkilendirme; Monument Valley görsel açıklık; Royal Match ise bölüm hedefi ve sonuç geri bildirimi açısından yararlıdır. Bunların gelirini veya kitlesini bu oyuna taşıyabileceğimiz anlamına gelmez. Tarihli ticari veriler ve kaynakları Bölüm C'dedir; satış ile indirme ayrı tutulmuştur.

| Kalite ekseni | Kâbe Ustaları'nda mevcut durum | Hedeflenen gelişme |
|---|---|---|
| İlk anlaşılırlık | Öğretici var, fakat sinematik ve yoğun HUD ilk eylemi geciktirebilir | Kontrol açıldıktan kısa sürede tek açık iş ve ilk teslim |
| Eylemin hissi | Yük görünür, otomatik aktarım ve ödül mevcut | Yük→yerleşen taş→görünür duvar değişimi aynı anda anlaşılır |
| Oyuncu kararı | Büyük ölçüde işaretli alanlar arasında dolaşma | Rota, üretim sırası, yardım önceliği ve iş bölümü |
| Kalıcı ilerleme | Bölüm/yükseltme profili var | Güvenilir aktif bölüm kaydı ve önce/sonra yapı gösterimi |
| Kimlik | Belirgin tarihî konu ve sıcak arayüz | Kaynaklı anlatı, tarih ile oyunlaştırma ayrımı, tanınan yardımcılar |
| Uzun vadeli kapsam | Yedi bölümlük sonlu hikâye | Önce güçlü biten bir deneyim; sonra isteğe bağlı ustalık/keşif |

İlk sürümün hedefi sonsuz live-service oyun olmak zorunda değil. İyi biten bir hikâye, güvenilir kayıt ve ailece anlaşılır deneyim bu kimlik için daha makul bir başlangıçtır. Yeni açık dünya, PvP, battle pass ve çok oyunculu ilk sorunları çözmez.

## Ekranlar için net tasarım kararları

**Başlık:** mevcut Oyna odağı ve renkler korunsun. Üstteki uzun boşluk azaltılıp inşa eylemiyle bağlantılı kısa çevre hareketi kullanılabilir. Önce doğru mobil ölçek düzeltilmeli; 1080 px reklam ekranındaki büyük buton gerçek cihaz CSS ölçeğini kanıtlamıyor. Kaynak/temsil açıklaması erişilebilir “Anlatım ve kaynaklar” alanına düzenlenebilir; okunamaz dipnota dönüşmemeli.

**Oyun HUD'ı:** tek ana hedef: “Kesme taşı duvara götür · 6/12”. Kapasite türüyle yazılsın: “Taş 2/8”. İyilik kalbi can göstergesi gibi bırakılmasın. Üç büyük menü butonunun ağırlığı azaltılsın. Zıpla her durumda en büyük eylem olmak yerine bölüm ihtiyacına göre konumlansın. Otomatik etkileşim korunarak sağ altta “Yükleniyor / Teslim ediliyor / Yanlış malzeme” bilgisi gösterilsin.

**Gece:** kalan süre ve en riskli grup tek sabit bantta. Uzak grupların bütün çubuklarını aynı anda üst üste bindirmek yerine yakınlık/öncelik gösterimi. Harita/defter açılışı oyunu durdursun. Su verme görevini tarihî olayın birebir belgesi gibi anlatma; oynanış kurgusunu ayır.

**Sonuç:** mevcut güçlü hiyerarşi korunmalı. Yıldızların neden kazanıldığı, açılan üretim hattı ve yapıda değişen bölüm gösterilmeli. Keşif için zaman harcamak öğrenme odaklı sürümde yıldız kaybına dönüşmemeli. “Sonraki bölüm” yolu güvenilir geri dönüşle tamamlanmalı.

## Uygulama sırası ve tamamlanma ölçütü

Aşağıdaki süreler küçük bir ekip için kaba odaklı iş günü tahminidir; eksik kaynaklara, hedef cihazlara ve kapsam kararlarına göre değişir. Sabit fiyat/teslim tarihi veya mağaza inceleme süresi değildir.

| Aşama | Kapsam | Kaba efor | Çıkış koşulu |
|---|---|---|---|
| 1 | Eksik build girdileri, viewport, paket bağımlılıkları | 1–3 gün; kaynak bulunamazsa belirsiz | Tek komut build, okunur mobil açılış, önbelleksiz offline test |
| 2 | Ekran durumu, pause, tek terminal sonuç | 2–4 gün | Sonuç/geri/retry/menü matrisi geçer; çift sonuç yok |
| 3 | Aktif bölüm, defter, migration ve ekonomi | 3–6 gün | Kill/relaunch ve ödül tutarlılığı testleri geçer |
| 4 | Hedef oku, harcama niyeti, HUD/kamera | 3–6 gün | Yanlış hedef yok; görünür ana görev; istemsiz harcama yok |
| 5 | İlk dakika ve bir örnek bölümün cilası | 3–5 gün | Yeni oyuncu testi; Bölüm3'te anlaşılır dönüşüm |
| 6 | Diğer bölümlere yayma, performans/lifecycle | 4–8 gün | Cihaz ölçümleri ve tam hikâye akışı tamamlanır |
| 7 | Mağaza materyali ve kapalı test | 2–4 aktif gün + dış beklemeler | Beyanlar/paket/gerçek kayıtlar tutarlı |

Hızlı öncelik: ilk olarak Aşama 1–3. Bunlar bitmeden geniş grafik yenileme veya ücretli reklam harcamasına geçme. Sonra tek bir örnek bölümde kaliteyi kanıtla; başarılı yaklaşımı diğer bölümlere yay.

**Yayın için geçiş koşulları:** temiz kurulumda çevrimdışı açılış; yedi bölümün gerçek cihazda tamamlanması; kayıt/ödül kaybı olmaması; menülerde zamanın durması; okunur mobil HUD; tekrarlı sahne girişinde kontrolsüz kaynak birikimi olmaması; hedef yaş ve veri beyanlarının gerçek paketle uyuşması. “Mağazaya hazır” sonucu yalnız ekran görüntüsünden çıkarılamaz.

## Claude'a nasıl verilmeli?

`Claude uygulama istemleri.md` dosyasında ana istem ve sekiz aşama var. İlk mesajda ana istemi ve Aşama 1'i kullan; rapor ve kaynakları birlikte ekle. Her aşamada test tablosu iste. Eksik girdileri gizleyen sahte dosyalar, tamamlanmamış testlere “geçti” yazılması ve tek seferde bütün motoru değiştirme kabul edilmemeli.

Aşağıdaki A, B ve C bölümleri ayrıntılı teknik, deneyim ve pazar incelemeleridir. Kanıtlar, öneriler ve henüz test edilmemiş konular ayrı tutulmuştur. Kaynak bağlantılarındaki satırlar incelenen özgün sürüme aittir; kod değiştikçe kayabilir.



---

# A. Teknik inceleme ve doğrulanmış kod bulguları

## Teslim edilen yapı nedir; kaynak ile HTML aynı sürüm mü?

### Ana sonuç
Ana stack-and-carry oyununun l9–l11 kaynakları verilen HTML ile aynı. Bu, yalnızca görsele dayalı yorum değil; kaynak analizi bulguları teslim edilen oynanabilir dosyanın gerçek mantığına uygulanıyor. Buna karşılık kaynak paketi bağımsız yeniden derlenebilir değil ve HTML tek başına çevrimdışı ilk açılış sağlamıyor.

### Kanıt ve kaynaklar
- İncelenen HTML 1.323.414 bayt. head.html, world.js, l0.js, l8.js, l9.js, l10.js, l11.js metinleri LF normalizasyonundan sonra HTML içinde birebir bulundu. l1–l7 metinlerine teslim edilen i18n.py içindeki wrap() işlevi bellek içinde uygulandığında yedi çıktı da HTML içinde birebir bulundu. Dolayısıyla eski modüllerin ham metin eşleşmemesi sürüm uyuşmazlığı değil, beklenen __t() çeviri dönüşümü. [Derleyici](<kaynak/build.py>), [Çeviri dönüştürücü](<kaynak/i18n.py>), [HTML](<girdiler/kabe-ustalari-oyun.html>)
- build.py satır 2 en1.py ve en2.py; satır 4 tr_list.json; satır 29 textures.js okuyor. Bu dört girdi teslim edilen kaynak klasöründe yok. strings.json ve l1.t.js–l7.t.js ise i18n.py satır 57–59 tarafından üretilen çıktılar: onları bağımsız eksik girdi olarak saymak yanlış. build.py satır 3 ayrıca python3 adlı yorumlayıcı çağırıyor; Windows temiz kurulumunda taşınabilirlik için sys.executable tercih edilmeli. [build.py](<kaynak/build.py>), [i18n.py](<kaynak/i18n.py>)
- HTML tek bir harici script çağırıyor: cdnjs üzerindeki Three.js r128. İnline içerikte Three uygulamasının REVISION/WebGLRenderer tanımları bulunmadı; sadece kullanım kodları var. Google Fonts için de dış CSS/font bağlantıları var. Texture verileri HTML içinde gömülü olsa da oyun motoru gömülü değil. [build.py](<kaynak/build.py>), [head.html](<kaynak/head.html>), [HTML](<girdiler/kabe-ustalari-oyun.html>)
- Dil seçimi navigator.language ve bekke-lang üzerinden TR/EN; EN sözlüğü HTML içinde var; L2(t,e) yeni oyun metinlerini ikili dille seçiyor. “Türkçe ve İngilizce” desteğinin varlığı doğrulandı; tüm metinlerin iki dilde eksiksizliği bu testle doğrulanmış sayılmaz. [build.py](<kaynak/build.py>), [l6.js](<kaynak/l6.js>)
- Mimari: world.js dünya/renderer/ışık/post-processing; l0 görsel kalite; l1 input/audio/karakter; l2 HUD/defter/harita; l3 eski hikâye/etkileşim; l4 oyuncu/kamera/cinematic/game loop; l5 müzik/ek görevler; l6–l7 Fil Yılı ve ek mekanikler; l8 puzzle; l9 yeni stack-and-carry ekonomi/atölye; l10 yeni cutscene; l11 yedi bölüm/UI/tutorial/hook. Tek IIFE içinde derleniyor, l9–l11 ayrıca iç kapsam paylaşıyor. Eski fonksiyonları saklayıp saran hook yaklaşımı var; bütün modülleri yeniden yazmak yerine lokal düzeltme mümkün. [build.py](<kaynak/build.py>), [l9.js](<kaynak/l9.js>), [l11.js](<kaynak/l11.js>)
- İyi temeller: materyal/geometry paylaşımı; dünya dekorlarında instancing; kalite seviyeleri; partiküller için yeniden kullanılan Float32Array havuzları; oyuncu karakterinde gövde parçalarının birleştirilmesi; dokunma pointercancel desteği; D-pad için lostpointercapture; safe-area inset kullanımı; frame dt üst sınırı; tutorial, hedef oku, üretim zincirleri, bölüm yıldızları, metin okuma süresine uyarlanmış cutscene ve skip işlevi mevcut. “Bunların hiçbiri yok” denmemeli. [l0.js](<kaynak/l0.js>), [l1.js](<kaynak/l1.js>), [l1.js](<kaynak/l1.js>), [l4.js](<kaynak/l4.js>), [l4.js](<kaynak/l4.js>), [l9.js](<kaynak/l9.js>), [l11.js](<kaynak/l11.js>)

### Değerlendirme ve öneriler
- Mevcut yapı küçük ekip için düzeltilebilir bir prototip/vertical slice. Yeni motora veya çok oyunculu altyapıya geçmek kritik akış hatalarını çözmeden kapsam ve riski büyütür.
- “İnternetsiz” reklam vaadi verilen HTML açısından koşulsuz kullanılamaz: temiz cihaz/önbelleksiz ilk açılış CDN erişimine bağlı. Daha önce cache edilmiş dosyayla çalışma offline paketleme kanıtı değildir.
- Native Capacitor projeleri başka yerde bulunabilir; teslim edilen ZIP'te görünmedikleri için “hiç yapılmamış” yerine “inceleme paketinde kanıt yok” denmeli.

### Sınırlar ve eksik doğrulamalar
- Gerçek iOS/Android cihazda GPU profili, frame süreleri, uygulama paket boyutu, native proje, signing, mağaza metadatası ve SDK/permission listesi verilmedi.
- Bu teknik alt inceleme tarayıcıda tam oyun bitirmedi. Aşağıdaki “izole test” etiketli bulgular Node VM içinde gerçek kaynak fonksiyonları + kontrollü stub'larla doğrulandı; gerçek telefonda tekrar üretim değildir.
- Kaynak derlemesi çalıştırılmadı: girdiler eksik olduğundan orijinal dosyaları değiştirip tahmini dosyalar oluşturulmadı.

## Öncelikli, somut bulgular ve Claude için lokal düzeltmeler

### Ana sonuç
İlk sürümün yayın kapısı yeni içerik değil, kayıt/geri dönüş/duraklatma/çevrimdışı güvenilirliği olmalı. Aşağıdaki önemler ürün riski tahminidir: P0 yayına/teslimata engel, P1 önemli davranış bozukluğu, P2 kalite sorunu. Statik kesinlik, cihazda ölçülen etkiyle karıştırılmadı.

### Kanıt ve kaynaklar

| ID | Önem ve kanıt | Sorun / tekrar üretim | Lokal düzeltme | Kabul ölçütü |
|---|---|---|---|---|
| T01 | P0, teslimat engeli; statik kesin | build.py temiz kaynak klasöründe en1.py okunurken durur; en2.py, tr_list.json, textures.js de yok. [build.py:2](<kaynak/build.py>) | Eksik kaynak girdilerini ekle; sys.executable ve açık UTF-8 kullan; build girdilerini başlangıçta listeleyip eksikse anlamlı hata ver. Üretilen çeviri dosyalarını elle “kaynak” diye eklemek çözüm değil. | Temiz checkout + belgelenmiş tek komut HTML üretir; doğrulanan artefact hash kaydedilir. |
| T02 | P0, “internetsiz” vaadi için; statik kesin | Temiz cache/uçak modu/ilk açılışta THREE CDN script'i alınamaz; yerel Texture tek başına yetmez. [build.py:30](<kaynak/build.py>), [head:3](<kaynak/head.html>) | Sabitlenmiş Three sürümünü ve lisansını uygulama paketine al; fontları yerelleştir veya açık fallback kullan; bağımlılık yükleme hatası için okunabilir ekran oluştur. | Önbelleksiz kurulu native paket uçak modunda açılır ve 1→7 oynanır; dış CDN/font isteği yok. Web dağıtımı için ayrıca kontrollü offline cache stratejisi. |
| T03 | P1, izole mantık testinde doğrulandı | Bölüm sonucu → Sonraki bölüm → Geri: showResult önce state='ui'/HUD=0; showStory Geri yalnız closeSheet yapıyor. Harita ve başlık da hidden kalıyor. Oyuncu dünyayı görüp devam edemeyebilir. [l11:131](<kaynak/l11.js>), [l11:202](<kaynak/l11.js>), [l11:213](<kaynak/l11.js>) | showStory(n,{onBack}) veya çağıran ekran kimliği kullan; sonuçtan gelen Geri haritayı açsın. Tüm ekran açma/kapatmaları için tek lokal geçiş işlevi. | Sonuç→sonraki→geri akışında görünür, kullanılabilir harita; state='hub'; art arda 20 döngüde boş ekran yok. |
| T04 | P1, statik kesin | Bölüm4'te kitap/harita aç: openBook/openMap state'i play bırakır. siteStep playing sadece state ve R.done kontrol ediyor; R.t ve öfke ilerler, kullanıcı okuyorken kaybedebilir. Ayrıca bir pad üstündeyken otomatik aktarım/harcama da devam eder. [l2:96](<kaynak/l2.js>), [l2:101](<kaynak/l2.js>), [l9:152](<kaynak/l9.js>) | isGameplayActive() içine overlay ve modal görünürlüğünü ekle; timer/beat/ekonomi/öfke tek simülasyon kapısından geçsin. | Defter/harita 30 sn açıkken R.t/öfke/stack/coin değişmez; kapatınca kalan yerden devam eder. |
| T05 | P1, izole mantık testinde doğrulandı | Bölüm4 son karede aynı anda bir ateş 100'e ulaşır ve R.t≥60 olur: ch4Step önce fail4, sonra aynı playing parametresiyle chapterDone çağırır. Sonuç + kayıp cutscene yarışır. [l11:167](<kaynak/l11.js>), [l11:177](<kaynak/l11.js>), [l11:198](<kaynak/l11.js>) | Başarısızlıkta döngüden/işlevden dön; chapterDone idempotent olsun, tamamlandı/kaybedildi durumundan tekrar çalışmasın; eşzamanlı sınır için ürün kuralı belirle. | R.t=60, anger=99.99, dt=.05 testinde tek terminal sonuç ve tek kayıt/ödül. |
| T06 | P1, statik kesin | ssave yalnız D kaydeder; aktif R, stack, zone stokları, konum ve işçi yükleri kaydolmaz. Bölüm ortasında uygulamayı kapat/reload yapınca bölüm yeniden başlar; kalite/dil değiştirme de reload. Satır bitince D'ye coin yazılıp aktif satır kaydedilmediğinden ödül/ilerleme tutarsızlaşabilir. [l9:187](<kaynak/l9.js>), [l11:142](<kaynak/l11.js>), [l11:191](<kaynak/l11.js>), [l0:87](<kaynak/l0.js>), [l4:197](<kaynak/l4.js>) | Versiyonlu save içine activeRun snapshot ekle; güvenli checkpoint/işlem sonlarında debounce save, pagehide/native lifecycle anında flush. Atölye stokları ve birikmiş reward aynı atomik kayıt olsun. | Her bölümde yük alırken/taş teslim ederken/yükseltirken/cutscene'de kill+relaunch; son güvenli işlem korunur, ödül iki kez verilmez. |
| T07 | P1, statik kesin | Defter keşifleri G.found'da, ama SITE.on iken save override yalnız D'yi yazar. Cutscene discover('o_helal'…), discover('k_hicr'…) ana oyunda açıldığı halde restart sonrası bilgi kilitleri kalıcı korunmaz. [l2:76](<kaynak/l2.js>), [l10:76](<kaynak/l10.js>), [l11:252](<kaynak/l11.js>) | Defter ilerlemesini D.codex veya ayrı sürümlü ortak profile ekle; load sırasında restore; ana oyun/eski mod kaydını karıştırmadan merge. | Yeni bilgi aç → yeniden başlat → aynı bilgi hâlâ açık; bölüm tekrarları önceden açılan kayıtları kapatmaz. |
| T08 | P1, statik kesin, izole hedef testi | Bölüm5/6'da mevcut sıraya uymayan yük taşı: wood sırasında raw/block varken siteTarget rawWood'a; stone sırasında beam/raww ood varken raw'a yönlendirir. take aynı tür zorunlu tuttuğundan önerilen hedef yük alamaz. courseBeat fazla işlenmiş yükü depolayabiliyor ama ok bunu kullanmıyor. [l11:228](<kaynak/l11.js>), [l11:234](<kaynak/l11.js>), [l11:188](<kaynak/l11.js>), [l9:175](<kaynak/l9.js>) | Önce envanter türünü çöz: raw→cutIn, rawwood→carIn, block/beam→wall/bank; sonra sıranın ihtiyacı/atölye stoklarını değerlendir. Geçerli teslim hedefi olmayan yük için geri bırakma aksiyonu. | Her course × her yük türü testinde önerilen hedefte anlamlı işlem yapılır; dolu oyuncu alınamayacak kaynağa yönlendirilmez. |
| T09 | P1, dayanıklılık eksikliği; normal kullanıcıda sıklık bilinmiyor | sload Object.assign ile şema/tür/aralık kontrolü yapmıyor. Örn. JSON içinde stars:null veya up:null bozuk kayıt ilk ekran/upgrade yolunu kırabilir. Hataları catch sessizce yutuyor. [l9:68](<kaynak/l9.js>), [l9:187](<kaynak/l9.js>) | default schema + version migration; finite/pozitif sayılar, 1..7 unl, obje stars/up; son sağlam snapshot/yedek; save failure için geliştirme logu ve kullanıcıya kaydın korunmadığı durumu. | null/yarım/eski/yanlış tür kayıtla crash yok; sağlam alanlar korunur; hiçbir hatalı değer sonsuz coin veya boş map üretmez. |
| T10 | P1 tasarım riski, davranış bilinçli kodlanmış | Altın pad'e basınca para .11 sn adımlarla otomatik azalıyor; hedef oku boş oyuncuyu alınabilir yükseltmeye önceliyor. Kullanıcı geçerken niyet etmeden satın alabilir; “bug” değil seçim hakkı/şeffaflık sorunu. [l9:180](<kaynak/l9.js>), [l11:233](<kaynak/l11.js>) | Pad'e yaklaşınca fiyat+fayda+son bakiye göster; kısa basılı tutma/ayrı Onay veya iptal edilebilir dolum başlangıcı; üretim hedefi ve upgrade önerisini farklı görselleştir. | İlk kullanımda fiyat anlaşılır; pad üzerinden normal yürümek para harcamaz; satın alma sonucu geri bildirim+kalıcı kayıt. |
| T11 | P2, statik kesin | Tam yük bonusu D.coins'e yazılır fakat R.coins'e eklenmez; sonuç ekranı R.coins gösterir. Final teslimde chapterDone ssave'den sonra .5 sn gecikmeli bonus gelebilir; sonuç/kalıcı bakiye farklılaşır. [l9:154](<kaynak/l9.js>), [l11:200](<kaynak/l11.js>), [l11:207](<kaynak/l11.js>) | awardCoins(amount,reason) tek işlevinde profil+run+event güncelle; bitişte bekleyen teslim bonusunu senkron kapatıp sonra save/result. | Başlangıç bakiye + kazanılan − harcanan = bitiş bakiye; sonuç kazanılan bütün bonusları içerir; reload sonucu değiştirmez. |
| T12 | P2, statik kesin | Bölüm7 etkin kapasite ceil(D.cap/2), fakat tam yük bonusu unload.n≥D.cap ister; görünen “dolu” taşıma normal tam yük bonusunu alamaz. [l11:150](<kaynak/l11.js>), [l9:154](<kaynak/l9.js>) | Teslim partisi başında effectiveCap tut; bonusu o partinin tam yük ölçütüne göre hesapla; kap yükseltilince devam eden parti tanımını değiştirme. | D.cap=8/Bölüm7 cap=4 durumunda dört kirişlik tam parti bonus alır; eksik parti almaz. |
| T13 | P1 uzun oturum riski; temizleme eksikliği kesin, cihaz etkisi ölçülmedi | clearTmp ve chapter cleanup sahneden kaldırıyor; geçici cutscene karakteri/geometry/material/texture için dispose veya pool yok. Ortak materyaller var: kör traverse dispose da tehlikeli. [l10:4](<kaynak/l10.js>), [l11:135](<kaynak/l11.js>), [l1:235](<kaynak/l1.js>), [l9:138](<kaynak/l9.js>) | Sahip olunan GPU kaynaklarını ayrı kaydet; sadece unique geometry/material/texture dispose et; shared kaynakları koru; tekrar eden kalabalığı/pad'i pool yap. | Aynı sahne/bölümü 20 kez tekrar sonrası renderer.info.memory geometries/textures stabil aralığa döner; shared karakter materyali bozulmaz. |
| T14 | P1 uzun oturum riski; kalıcı dizi büyümesi kesin | Her makeClanFires dört addFire yapar; cleanup yalnız görünürlüğü kapatır, FIRES'dan silmez. Her retry yeni 4 ateş ve 12 kişi üretir; FIRES ve scene içinde gizli ateşler kalır. [l10:136](<kaynak/l10.js>), [l2:225](<kaynak/l2.js>), [l11:135](<kaynak/l11.js>) | Dört bölüm ateşini bir kez üretip tekrar kullan veya disposeFire ile scene+FIRES'dan çıkar; kişi havuzunu tekrar kullan. | 20 retry sonrası aktif/gizli ateş sayısı başlangıç sınırında; tek bölümde tam dört kamp görünür. |
| T15 | P1 aday cihaz testi; eksik reset yolu kesin | blur yalnız keys sıfırlar. joy, looks, DP.f/t/run, jump held ve aksiyon kuyruğu tek lifecycle resetinden geçmez; canvas pointercancel var ama lostpointercapture yok. Uygulama değişimi/OS hareketi sonrası takılı input olasılığı. [l1:93](<kaynak/l1.js>), [l1:109](<kaynak/l1.js>), [l4:192](<kaynak/l4.js>) | resetInput() yaz; blur, visibilitychange, native background, pause/modal/cutscene geçişinde çağır; canvas lostpointercapture bağla; geçerli state dışındaki pointerdown'ı engelle. | Parmağın yön tuşunda/joystick'te iken arka plana git→geri dön; hareket, kamera veya zıplama kendiliğinden sürmez. |
| T16 | P1 aday cihaz testi; resume yolu yok | auInit mevcut AU.ctx varsa hemen return yapar; suspended/interrupted AudioContext için resume yolu yok. İlk user gesture iyi, ancak telefon kesintisi/arka plan sonrası sessizliğin giderilmesi garanti değil. Müzik interval'i de lifecycle ile durdurulmuyor. [l1:120](<kaynak/l1.js>), [l5:4](<kaynak/l5.js>) | ensureAudio() içinde context state kontrolü + kullanıcı hareketinde resume; background'da suspend/müzik zamanlamasını durdur, foreground'da saat tabanını yeniden kur. | Gerçek iPhone/Android'de 10 background/foreground ve ses kesintisi sonrası sonraki dokunmada ses geri gelir; çift müzik döngüsü yok. |
| T17 | P2, statik kesin | Yeni Ayarlar butonları eski #title içinden #kset'e taşınıyor; “Kontroller/Hakkında” listener'ları eski #p-controls/#p-about panelini toggle ediyor; titleEl yeni UI'de hidden. Tıklama görünmeyen panel açıyor. [l11:257](<kaynak/l11.js>), [l11:263](<kaynak/l11.js>), [l4:109](<kaynak/l4.js>) | İlgili panelleri yeni sheet içinde göster veya ayrı bilgi sheet'i aç; modun gerçek kontrollerini yaz. Ana oyun auto-load iken “büyük düğmeye bas/al/bırak” eski açıklamasını göstermeme. | Yeni başlık ve pause ayarlarında her butonun görünür etkisi var; kontroller mevcut modla tutarlı. |
| T18 | P2, statik kesin | Reduced motion tercihinde yalnız eski dlg/card animasyonu, bazı dünya efektleri azaltılıyor. Yeni pulse/hand/shake/cutscene speed-lines ekran sallanması reduce kontrolünü atlıyor. [head:151](<kaynak/head.html>), [l11:44](<kaynak/l11.js>), [l11:98](<kaynak/l11.js>), [l9:45](<kaynak/l9.js>) | Yeni CSS ve drawAnim için reduce gate; bağımsız ekran sallanması/flaş kapatma seçeneği; hareket bilgisi yerine statik durum etiketi. | Sistem azaltılmış hareket açıkken pulse/hand/shake/speed-lines yok; gameplay bilgisi kaybolmaz. |
| T19 | P2, izole testte doğrulandı | 119.8 sn sonuç m=floor(119.8/60), sec=round(119.8%60) ile 1:60 gösterir. [l11:204](<kaynak/l11.js>) | Önce totalSeconds=Math.round(R.t); sonra floor(total/60), total%60. | 59.4/59.5/59.9/60/119.8/3599.9 sınırlarında saniye 00–59. |
| T20 | P2 performans adayı; ölçülmüş FPS iddiası yok | site HUD her frame textContent/querySelector/style yazıyor; targeting/pad araması birden fazla kez çalışıyor. Dünya görünmediğinde bile tam update/render döngüsü çalışıyor; bazı modlar kendi RAF'ını da çalıştırıyor. [l11:237](<kaynak/l11.js>), [l11:251](<kaynak/l11.js>), [l4:156](<kaynak/l4.js>), [l8:271](<kaynak/l8.js>) | HUD referanslarını cache et; sadece değer değiştiğinde yaz, düşük sıklık UI tick; görünmeyen modun simülasyonunu durdur; profiling sonrası gölge/post maliyetini ayarla. | Düşük/orta cihazda baseline ile aynı sahne karşılaştırılır; p95 frame time iyileşir, input latency artmaz; keyif/okunurluk bozulmadan bütçe karşılanır. |

### Değerlendirme ve öneriler
- T03–T08 önce çözülmeli: oyuncunun temel akışını ve emeğini etkiliyor. T01/T02 yayın artefact'ı için paralel kapı. T13/T14 ölçümle önceliklendirilmeli ama sahiplik temizliği gerçek kod eksikliği.
- T10 otomatik ödeme mevcut casual türde bilinen bir tasarım olabilir. Bu oyunun aile/çocuk ve öğrenme odaklı vaatlerinde daha açık niyet+bedel göstermek güçlü tercih. Kodun bilinçli yaptığı davranış “programlama hatası” diye sunulmamalı.
- Para “Bereket” ve kalp “İyilik” olduğundan teknik ekonomi hataları sadece sayısal tutarsızlık değil, değer anlatımını da bulandırır; oyun içi puan ile dini değer eşitlemesi ürün değerlendirmesinde ayrı ele alınmalı.

### Sınırlar ve eksik doğrulamalar
- T13/14 için gerçek GPU bellek grafiği alınmadı. “Bellek sızıyor, X dakika sonra çöküyor” nicelikli iddia yapılamaz.
- T15/16 gerçek cihazda zorla reproduce edilmedi. Mevcut pointercancel ve user-gesture audio init var; “dokunma/audio desteği yok” demek yanlış.
- Ana kaynakta WebGL context loss recovery/native back handler/Capacitor lifecycle görünmedi. Native klasörler incelenmediği için platform entegrasyonlarının tüm projede yokluğu kesin değil.
- Her frame geometry yeniden üretildiği iddiası yapılmamalı: duvar geometry'si teslimatla güncelleniyor ve eski geometry.dispose çağrısı mevcut. Cutscene yılanında vertex update/normals var; bunun etkisi profiler ile ölçülmeli. [world.js:206](<kaynak/world.js>), [l10.js:30](<kaynak/l10.js>)

## Test planı, yayın kapısı ve Claude çalışma emri

### Ana sonuç
En yararlı geliştirme isteği “oyunu AAA yap” değil; somut akışlar için beklenen state, kayıt ve ölçüm hedeflerini belirten küçük işlerdir. Aynı motor ve art direction korunarak ilk aşamada oynanabilirliği sağlamlaştırmak yeterli.

### Kanıt ve kaynaklar
- İzole test betiği gerçek l11 işlevlerini kaynak dosyasından kesip Node VM içinde çalıştırır. Çıktılar: wood course/raw→rawWood; wood/block→rawWood; stone/beam→raw; stone/raww ood→raw; sonuçtan sonraki hikâye Geri state=ui HUD=0 titleHidden=true mapHidden=true; son gece karesinde [fail4,chapterDone]; 119.8→1:60. Bunlar kasıtlı kontrollü state testleri. [check_static.cjs](<kanitlar/check_static.cjs>)
- Birincil kaynak ayarlarında safe-area ve kaba pointer için kalite düşürme mevcut; önerilen testler bunları kaldırmak için değil tamamlamak için. [head.html](<kaynak/head.html>), [build.py](<kaynak/build.py>)

### Değerlendirme ve öneriler
Önerilen otomasyon ve manuel test matrisi:
1. **State akışları:** 7 bölüm × intro normal/skip × pause/resume × map/book × retry × result-next-back. “Görünür etkileşimli ekran yok ama state ui” invarianti yasak. chapterDone/fail4 aynı run'da en çok bir terminal event.
2. **Save/load:** Her bölümün başlangıcı/yarısı/son işlemi; upgrade %0/%50/%100; tam yük bonusu öncesi/sonrası; kalite/dil değiştirme; native kill/OS geri kazanımı; bozuk JSON ve önceki sürüm. Profil ve aktifRun arasında atomik ekonomi.
3. **Ekonomi:** coin ledger: başlangıç + kaynak ödülü + bonus − upgrade = bakiye. Replay ödülü tasarımda açık; restart/kill ile kazanç çoğaltma yok. Kapasite değişimleri, chapter7 etkin kapasite.
4. **Kontroller:** joystick + kamera iki parmak; üçüncü jump; pointercancel/lostcapture; modal açılırken basılı hareket; kilit ekranı; Android back ve geri hareketi; gamepad/keyboard yalnız desteklenecekse.
5. **Öğrenme:** açılan her codex kaydı reload sonrası kalıcı; metin font/dil değişiminde taşmıyor; gerçek içerik ve tarihi kurgu ayrımı.
6. **Bellek:** clipSnake, clipShip, chapter4 retry ×20; renderer.info.memory geometries/textures, scene children/FIRES count; shared materyal yanlış dispose edilmemeli.
7. **Performans:** fiziksel düşük Android, orta Android, en eski desteklenen iPhone, güncel iPhone; 10–20 dk oturumda p50/p95 frame time, cold start, dokunma gecikmesi, GPU bellek, ısınma/quality downgrade. Başlangıç **öneri** bütçesi: düşük cihazda kararlı 30 FPS (33.3 ms), daha güçlüde 60 FPS (16.7 ms). Bunlar ölçülmüş mevcut performans veya sektör standardı değil.
8. **Paket/offline:** temiz install + uçak modu + tüm yedi bölüm; font ve textures dahil URL listesi; ağ başarısızlığında anlaşılır açılış; CDN cache sonucu ile paket güvenilirliğini karıştırmama.
9. **Dil/ekran:** TR/EN, 320/360/390/430 CSS px, kısa landscape, notch; hareket azaltma; büyük metin; screenshotlar fiziksel 1080 px olduğundan CSS px ile aynı sayılmamalı.
10. **Native teslimat kontrolü:** Capacitor config, Android/iOS projeleri, version/build numarası, bundle/app id, imzalı AAB/IPA, back/lifecycle, izinler, veri/SDK envanteri, gizlilik politikası ve mağaza beyanları. Bunlar teslim edilen HTML'den kanıtlanamaz; ayrı inceleme artefact'ı gerekir.

Claude'a doğrudan verilecek teknik çalışma emri:
> Verilen mevcut Three.js yapısını ve oyun kimliğini koru. Önce T01–T09'u kaynakta yeniden doğrula; varsayımı kanıt diye yazma. Orijinal dosyaların yedeğini al ve küçük, ayrı patch'ler halinde ilerle. İlk patch showStory geri dönüşü, modal duraklama ve tek terminal sonuç; ikinci patch versiyonlu activeRun+profile+codex kayıt ve coin transaction; üçüncü patch envantere göre hedef seçimi. Eksik build girdileri için tahmini placeholder üretme, mevcut yayın HTML'inden yalnız doğrulanabilir gömülü varlıkları kurtarmak mümkünse ayrı raporla. Sonra T13/T14 kaynak sahipliği ve input/audio lifecycle düzeltmeleri. Her patch için dosya/satır, davranış öncesi/sonrası, test ve kalan risk bildir. debug global'lerini test build'inde bırakıp yayın build'inde kapat; motor yükseltmesini güvenilirlik işlerinin içine gizleme. Tam akış ve gerçek cihaz testleri yapılmadan “store ready” sonucu yazma.

### Sınırlar ve eksik doğrulamalar
- Store policy/sürüm/tarih değişkenlerinin doğrulaması teknik alt görevin dışında; bu not mağaza onayı garantisi vermez.
- Görev gerçek oyun değişikliği değil analiz olduğu için kaynak oyuna patch uygulanmadı. Yalnız inceleme betiği ve bu not dosyası oluşturuldu.




---

# B. Oyuncu deneyimi, UI, etkileşim ve reklam

## 1. Mevcut deneyimin güçlü tarafları ve kanıtlanmış sorunları nelerdir?

### Ana sonuç
Oyun, ayırt edilebilir bir konuya, tutarlı krem–petrol mavisi–altın UI diline, çalışan bir bölüm/üretim/ödül yapısına sahip. En büyük ihtiyaç yeni özellik yığmak değil; mobil ölçek, oyuncunun ne yapacağını anlaması, görüş açıklığı ve mevcut sistemlerin tutarlı biçimde sunulmasıdır. Buradaki öneriler tasarım değerlendirmesidir; satış veya retention sonucu ölçülmedi.

### Kanıt ve kaynaklar
- **Mobil dağıtımı engelleyecek ölçekte P1 viewport sorunu:** Verilen HTML doğrudan, başsız Chromium mobil emülasyonda 390×844 CSS cihaz alanı / touch açık / DPR 1 ile açıldı. `innerWidth=980`, `innerHeight=2121`, `visualViewport.width=980`, `visualViewport.scale=0.397959`, standart viewport meta etiketi `null`. Dosya başlangıcında yalnız `claude:viewport-fit-sides` var. Ekranda PLAY ve yan düğmeler aşırı küçülüyor. Başlık ekranında pageerror listesi boştu. Bu **gerçek telefon testi değildir**, fakat paketleme öncesi düzeltilmesi gereken doğrudan yeniden üretimdir. [HTML](<girdiler/kabe-ustalari-oyun.html>), [smoke test betiği](<kanitlar/playtest.py>), [başlık ekranı](<kanitlar/browser-title-390.png>).
- **HUD birbirine rakip çok sayıda unsur taşıyor:** gece görselinde görev kartı, dört sayaç, üç menü düğmesi, şafak sayacı, öfke çubukları ve hedef etiketi aynı üst bölgede; sağdaki hedef metni kırpılıyor, üst solda başka bir etiket kenardan kesiliyor. Ekran görüntüsündeki piksel ölçülerini CSS pt/dp sanmıyoruz. [Gece ekranı](<girdiler/ekran-4_night.png>).
- **Yapı ve hedef arası okunurluk zayıf:** inşa ekranında yoğun iskele çizgileri, sert gölge ağları, duvar/taşın zeminle benzer tonları ve aşağı bakış hareket hedefiyle yarışıyor. Oyuncu alt-orta alanda küçük; ekranın geniş bir bölümü düşük bilgi taşıyan zemine ayrılmış. [İnşa ekranı](<girdiler/ekran-3_build.png>).
- **Sonuç ekranı güçlü:** belirgin başarı başlığı, üç yıldız, süre/kaynak/iyilik satırı, ayrı renkli öğrenme kartı ve güçlü Sonraki bölüm CTA’sı var. Hiyerarşi korunmalı. Sonraki iyileştirme neyin kazanıldığını açıklamak ve bir sonraki hedefi merak ettirmektir. [Sonuç ekranı](<girdiler/ekran-6_result.png>).
- **Öğretici zaten var:** hareket → sarı oka git → daire içinde otomatik yükleme → teslim/full-load geri bildirimi şeklinde dört adım mevcut. Bölüm 1 giriş sinematiğinin tanımlı süreleri 4,2+4+3,4+4+3,6=19,2 saniye; atlama/gösterim hızından bağımsız gerçek oyuncu gecikmesi ölçülmedi. [l11.js:216](<kaynak/l11.js>), [l10.js:61](<kaynak/l10.js>).
- **İlerleme ve ekonomi zaten var:** taşıma kapasitesi, ikinci taşçı, taş/tahta hamalı, hızlı sandalet; fiyatlar 30/60/80/120/140/180. Tam yük bonusu, malzemeye göre 5/7 kazanç ve sıra sonu +15 ödül kodda var. Bunları yok sayarak tekrar eklemek doğru olmaz. [l9.js:129](<kaynak/l9.js>), [l11.js:189](<kaynak/l11.js>).
- **Oyuncu niyeti açısından risk:** yükseltme dairesine 1,6 dünya biriminden yaklaşınca para otomatik düşüyor; boş elle ve yeterli parayla yönlendirme oku sıradaki iş hedefinden önce ilk satın alınabilir yükseltmeyi seçiyor. Bu bir gerçek para tahsilatı değildir, oyun içi kaynak harcamasıdır. Yine de yanlışlıkla yükseltme ve oyuncunun rota kontrolünü kaybetmesi riski var. [l9.js:180](<kaynak/l9.js>), [l11.js:233](<kaynak/l11.js>).
- **Yıldızlar eğitsel keşiften çok hıza bağlı:** dördüncü bölümde en yüksek öfke seviyesi, diğerlerinde süre kullanılıyor. Öğrenme metnini okumak, çevreyi keşfetmek ve erişilebilir kontrolle oynamak ile hızlı bitirme ödülü arasındaki gerilim bir tasarım değerlendirmesidir. [l11.js:199](<kaynak/l11.js>).
- **Erişilebilirlik sıfır değil:** aria-label, aria-live, diyalog rolleri, yön tuşları seçeneği, safe-area CSS ve `prefers-reduced-motion` kuralı var. Ancak mevcut reduced-motion kuralı yalnız `#dlg,#card` animasyonlarını kapatıyor; yeni başlık pulse, el işareti, sinematik sallanma/parlama ve ödül hareketleri için bütüncül doğrulama gerekir. [head.html:141](<kaynak/head.html>), [l11.js:42](<kaynak/l11.js>).

### Değerlendirme ve öneriler
**Korunacaklar:** sıcak renk paleti, tarihî mekânın tek bakışta tanınması, otomatik toplama kolaylığı, taşınan yükün karakter üzerinde görünmesi, yardım etmenin çevrede karşılık bulması, kısa sonuç kartı, öğrenme içeriği, bölüm haritası, kaynakların fiziksel olarak dolaşması. Grafiklerin tümünü gerçekçi yapma hedefi kaliteyi kendiliğinden yükseltmez; tutarlı stil ve etkileşim okunurluğu önce gelir.

**Önerilen mobil düzen — yeni tasarım hedefidir, mevcut cihaz ölçüsü değildir:**

| Bölge | Yeni düzen |
|---|---|
| Üst güvenli alan | Tek satır bölüm başlığı, sağda 48×48 CSS px menü etkileşim alanı; iOS/Android native ölçüleri ayrıca uygulanır |
| Görev satırı | 1 eylem + 1 hedef: `Kesme taşı duvara götür · 6/12`; ayrıntı açılabilir |
| İkincil sayaçlar | Kapasite `Taş 2/8` ve kaynak; iyilik ve toplam inşa yüzdesi bölüm bağlamına göre küçültülür/ayrıntıya taşınır |
| Gece bölümü | Sabit üst tehlike bandı: kalan zaman + en riskli kabile + adı ve simgesi; dünya çubukları yakınlıkta gösterilir |
| Ekran merkezi | Karakter ve sonraki 3–5 saniyelik rota açık; menü/etiketler bu alanı kapatmaz |
| Sol alt | İlk açılışta görünen joystick öğretimi; sabit/dinamik joystick ve mevcut yön tuşu seçenekleri |
| Sağ alt | Eyleme göre `Yükle`, `Teslim et`, `Su ver`; auto-interact açıkken dolan halka ve kısa durum metni; Zıpla yalnız gerekli seviyelerde öncelikli |
| Kenar hedefi | Safe-area içinde sabitlenmiş ok; ekran dışında kalan NPC’nin tam adı yerine kısa etiket + mesafe; çakışma önleme |

Tipografi için başlangıç tokenları: gövde 16 CSS px, sayaç 16–18, görev 18–20, yardımcı metin 13–14; minimum hedef değil tasarım başlangıcı. Ölçek artırma ve Türkçe uzun metin testi gerekir. Açıklamasız kalp can göstergesi gibi algılanabilir: ilk kullanımda `İyilik`, yük sayacında kaynak türü gösterilsin. `Bereket` oyun içi kaynaksa arayüz açıklaması bunun teolojik bir ölçüm olmadığını netleştirsin; daha nötr `Emek puanı` alternatifi kullanıcı/alan uzmanı değerlendirmesine sunulabilir.

**Kamera/art:** hareket yönüne hafif look-ahead; engel arkasında kalan iskele parçalarını saydamlaştırma; oyuncuya ince kontrast kenarı ve seçili hedefe tek renk vurgusu; gece çevreyi karartırken eylem alanını okunur tutma; gölge yoğunluğu ve çözünürlüğünü kalite kademesine bağlama. Zoomu kalıcı olarak açmak yerine teslim noktasına yaklaşırken kısa, yumuşak kadraj değişimi test edilmeli. Sonuçtaki üç yıldız yıldız anlamını açıklayan kısa bir satırla desteklenmeli; ödül sıradan bir +5 yerine ilgili davranışa bağlı görsel/sesli karşılık vermeli.

### Sınırlar ve eksik doğrulamalar
- Tam bölüm oynanışı, gerçek telefon FPS/ısı/pil, çocuk veya aile oyuncu testi, tarihî kaynak doğruluğu, retention, fiyat duyarlılığı ve mağaza satış başarısı ölçülmedi.
- Mobil başlık emülasyonu yapıldı. OYNA tıklaması otomasyonun animasyon kararlılığı ve sonra navigation-wait bekleyişinde timeout verdi; bunu gerçek kullanıcı tıklama arızası diye raporlamıyoruz. Tam oyun akışı bu alt incelemede oynanmadı.
- Ses dosyası dinlenmedi; seslendirme kalitesi, miks, müzik uygunluğu veya ses/altyazı senkronu hakkında hüküm verilmiyor.

## 2. Oyun döngüsü ve Claude’a verilecek somut geliştirme işi nasıl tanımlanmalı?

### Ana sonuç
Önerilen konumlandırma: kısa oturumlarda emek, dayanışma ve tarihî keşif yaşatan aileye uygun inşa macerası. Oyunun özgün gücünü koruyarak her bölümde bir yeni karar, bir görünür dönüşüm ve bir farklı sonuç yaratmak gerekir.

### Kanıt ve kaynaklar
Yedi bölüm: Sel Gecesi (12 çamur), Yıkım (20 moloz), Taşçılar (ilk taş sırası), Kanlı Yemin (su/öfke yönetimi), Gemi (taş+ahşap iki sıra), Yükselen Duvarlar (çamur/hamal/su ile iki sıra), Çatı ve Kapı (ağır kiriş/kapı). İlk iki bölüm taşıma çeşidi bakımından yakın; 3/5/6/7 aynı üretim zincirinin artan varyasyonları. Bu benzerlik monotonluk riskidir, doğrudan kullanıcı testi sonucu değildir. [l11.js:2–33](<kaynak/l11.js>).

### Değerlendirme ve öneriler
**İlk 60 saniye hedef tasarımı:** 0–3 sn ürün adı ve tek Oyna; 3–8 sn kısa sel bağlamı, atla erişilebilir; 8–15 sn tek hareket komutu, ilk çamur noktasına yakın başlangıç; 15–25 sn ilk yük, net görsel/ses/haptik; 25–40 sn ilk teslim ve çevrede temizlenen ev; 40–55 sn ikinci kısa rota + ailenin geri bildirimi; 55–60 sn ilk anlamlı başarı/sonraki hedef önizlemesi. Bunlar ölçülen mevcut süreler değil hedef hipotezleridir. Eğitsel uzun giriş `Hikâyeyi dinle` yolunda korunabilir. İlk dakikaya mağaza, satın alma, hesap veya bildirim izni eklenmesin.

**Bölüm farklılaştırma planı:**

| Bölüm | Korunacak mekanik | Yeni karar / beceri | Görünür tatmin |
|---|---|---|---|
| 1 Sel | Topla–taşı | Önce hangi evin yolunu açacağım? Öğreticide tek rota, sonra iki seçenek | Çamur azalır, kapı açılır, aile dışarı çıkar |
| 2 Yıkım | Moloz taşı | Güvenli çalışma sırası; tek basit işaretli alan, kontrollü boşaltma | Her teslimde eski duvarın anlaşılır bölümü açığa çıkar |
| 3 Taşçılar | Ham taş→kesme taş→duvar | Üretim kuyruğu ve tam yük verimliliği | İlk duvar sırası gerçekten belirginleşir |
| 4 Barışı Koru | Su ve öncelik yönetimi | Hangi grubun desteğe önce ihtiyacı var? Öğretilmiş bar/ikon | Öfke düşmesi yalnız sayı değil duruş/konuşma değişimi |
| 5 Gemi | Ahşap+taş | İki üretim hattını sıralama | Ahşap sıra, yeni renk/malzeme ve usta hareketi |
| 6 Yükselen Duvarlar | Yardımcılar, yağmur | İşçi atama ve kısa/çamurlu rota tercihi | Otomasyon işe yarar; oyuncu daha yüksek karar seviyesine geçer |
| 7 Çatı ve Kapı | Ağır yük | Hazırlığı tamamlama ve ekip koordinasyonu | Kontrollü bitiriş, panoramik önce/sonra ve öğrenilenlerin özeti |

Bu yeni durumlar tarihî vakaymış gibi sunulmasın: hikâye, tarihî bilgi ve oynanış için tasarlanan görevler ayrılmalı. Ana karakterin kurgusal oluşu ve kaynaklara dayanan olay anlatımı açık olmalı. Geçmişi oyuncu seçimiyle yeniden yazdırmadan emek/rota/iş sırası seçimi sunulabilir. Ana menüdeki tasvir ilkesi içerik üretim kuralları olarak korunmalı. `Kanlı Yemin` tarihî bölüm adı kalabilir; küçük yaş odaklı yüzeyde `Barışı Koru` görev başlığı ve uygun yaş değerlendirmesi daha anlaşılır olabilir.

**Döngü:** 5–15 sn eylem → 30–90 sn küçük hedef → birkaç dakikalık bölüm → kalıcı tamamlanan yapı/öğrenme defteri. Bölüm süreleri test hipotezidir. Sonuç kartında mevcut yıldızlara ek olarak `İlk taş sırası tamamlandı`, `Açılan: marangoz hattı`, `Sırada: iki hattı birlikte yönet` gösterilsin. İlerleme için ertesi gün gelmeye zorlayan streak cezası yerine isteğe bağlı verimlilik meydan okumaları, süre baskısız keşif modu ve bölüm tekrarında farklı hedefler kullanılabilir. Eğitim modunda hız yıldızı yerine tamamla/yardım et/öğren hedefleri; hızlı koşu ayrı rozet olabilir.

**Claude görevleri — mevcut kodu koruyarak küçük değişikliklerle:**

1. **P1 Mobil viewport ve HUD:** `head.html`/üretilmiş HTML’e standart viewport ekle; 360×800, 390×844, 412×915, yatay ve 200% metin denemesi yap. HUD düzenini bağlama göre tek görev odaklı hale getir. Kabul: viewport cihaz genişliğiyle eşleşir; hareket alanı üzerindeki sabit kontroller kesilmez; uzun Türkçe/İngilizce görev ve gece zamanlayıcısı üst üste binmez. Playwright screenshot karşılaştırması + gerçek Android/iPhone dokunma kontrolü.
2. **P1 Satın alma niyeti:** mevcut yükseltme pad sistemine yaklaşınca fiyat, etki, mevcut bakiye ve `Basılı tutarak geliştir` görünümü ekle. Bölgeden çıkınca işlem iptal edilir; onay öncesi bakiye değişmez. Otomatik yön oku satın alma için ana hedefi ele geçirmesin; opsiyonel teklif sunulsun. Kabul: içinden geçme/rotadan sapma harcama yapmaz; onay bir kez düşer; kısmi ödeme kaydı eski kayıtlardan güvenli taşınır.
3. **P1 Etkileşim durumları:** yükleme/boşaltma için `yaklaş → uygun → işlem → tamam / dolu / yanlış malzeme / üretim bekleniyor` durum makinesi. Auto-interact seçeneğini koru; dairede beklemek zorundaysa göster. Kabul: her duruma metin+ikon; hiçbiri yalnız renkle verilmez; hareket+eylem aynı anda çalışır; parmak ekran dışına çıkınca yürüyüş takılmaz.
4. **P1 İlk dakika:** 19,2 sn tanımlı sinematiği kısa sürüm+isteğe bağlı tam hikâye seçeneğiyle yeniden düzenle; mevcut tutorial adımlarını oyuncunun yaptıklarına göre ilerlet. Kabul: öğretici hareketten önce ikinci komutu göstermez; görev metni hedefi kapatmaz; tekrar oynayanda öğretici yeniden zorlanmaz; ilk teslim süresi gerçek deneklerle kaydedilir.
5. **P2 Kamera/okunurluk:** iskele örtüşmesini raycast/occlusion sistemiyle çöz; hedef işaretini safe-area içine clamp et ve HUD çakışmasını engelle; okunur gece modu. Kabul: oyuncu/aktif hedef iskele arkasında kaybolmaz; kenar etiketinin tamamı ekranda; reduced-motion açıkken zorunlu kamera salınımı/parlama yok.
6. **P2 Bölüm farklılaştırma:** önce tek vertical slice olarak 3. bölüm üretim kuyruğu+ilk duvar dönüşümünü iyileştir, testten sonra 5/6’ya yay. Kabul: oyuncu 10 sn bakınca hangi malzemeyi nereye götüreceğini anlatabilir; yükseltmenin etkisini görebilir; bekleme durumunda nedenini okur. Bu bir kullanılabilirlik hedefidir; ölçüm sonucu değildir.
7. **P2 Erişilebilirlik ve geri bildirim:** mevcut aria/dpad/ayarları koru; tüm yeni modallara odak ve kapatma dönüşü, metin büyütme, sol/sağ kontrol değişimi, titreşim kapama, sinematik atlama ve hareket azaltma kapsamı ekle. Kabul: menüler klavye ile tam dolaşılır; odak kapanan diyalogdan tetikleyene döner; azaltılmış harekette UI pulse/hand/shake/flash kapalı; ses kapalıyken görev anlaşılır.
8. **P2 Ölçüm:** yerel geliştirme loglarından başlayarak `first_input`, `first_pickup`, `first_delivery`, `chapter_start/complete/fail`, `stuck_hint`, `upgrade_offer/confirm/cancel`, `story_skip` olaylarını tanımla. Çocuk/mahremiyet hedefi kararlaştırılmadan üçüncü taraf izleyici ekleme. Kabul: her olay tek seferlik/şemalı; zamanlar sinematik ve aktif oyun olarak ayrılmış; retention veya satış başarısı mevcutmuş gibi yazılmıyor.

### Sınırlar ve eksik doğrulamalar
Hedef yaş, fiyat/gelir modeli, oturum hedefi ve oyuncuların tarihî bilgi seviyesi bilinmiyor. Yukarıdaki tasarım aile/öğrenme odaklı bir varsayımdır; hypercasual gelir optimizasyonu varsayımıyla karıştırılmamalıdır. Tam kapsam genişlemesi yerine mevcut yedi bölümü cilalama önerilir; çok oyunculu, açık dünya, battle pass veya çok sayıda yeni mod ilk sürüm için gerekli değildir.

## 3. Reklam neyi doğru anlatıyor, daha etkili 30 saniye nasıl olur?

### Ana sonuç
Reklam gerçek oyun görüntüsü, açık Türkçe mesajlar ve dikey biçim kullanıyor; bu iyi bir temel. Ancak ilk sekiz saniyede görülen sel/yılan/kartal, inşa-etme deneyimini geciktiriyor; oyun adı ve mağaza çağrısı çok geç geliyor. Bu bir kreatif hipotezidir, reklam performans sonucu değildir.

### Kanıt ve kaynaklar
- `ffprobe`: H.264, 1080×1920, 30 fps, 30,700 sn, AAC mono 44,1 kHz, yaklaşık 37,87 MB. Ses akışı mevcut olması ses kalitesini kanıtlamaz. [Video](<girdiler/kabe-ustalari-reklam-tr.mp4>).
- Kesin **örnek kare anları**: 0 ve 3 sn sel / `Bir gece dev bir sel indi`; 4 sn yılan / `TISSS!`; 7 ve 8 sn kartal; 11 ve 12 sn `Taşı taşı. Kâbe’yi yükselt!`; 15 ve 16 sn `Usta tut, işini büyüt`; 19 ve 20 sn `Kabileleri barıştır`; 23 ve 24 sn `Siyerden gerçek olaylar`; 27 sn `KÂBE YÜKSELDİ!`; 28 ve 30 sn oyun adı ve `Yakında App Store ve Google Play’de`. Bunlar geçişlerin kesin başlangıç/bitiş zamanları değildir; belirtilen saniyede çözümlenen karelerdir. [Zaman etiketli temas sayfası](<kanitlar/video_frames/timed_contact.jpg>).
- Son kartta `Reklamsız · İnternetsiz · Türkçe ve İngilizce` yazıyor. Bu vaatler mağazada sunulan gerçek paket için ayrı doğrulanmalıdır; son kartın kendisi yayınlanmış uygulama kanıtı değildir. [30 sn kare](<kanitlar/video_frames/30.jpg>).

### Değerlendirme ve öneriler
**Reklam değerlendirmesi:** sel yüksek dramatik giriş sağlar fakat mevcut karelerde temel eğlencenin ne olduğu ilk anda anlaşılmıyor. Kartal/yılan sahneleri merak yaratırken izleyicide hayvan aksiyonu oyunu beklentisi doğurabilir. Taşıma görüntüsünde karakter ve asıl duvar dönüşümü küçük kalıyor; daha yakın, sade HUD’lu gerçek kayıt önerilir. `İşini büyüt` cümlesi daha ticari tycoon beklentisi yaratabilir; oyun dayanışma/öğrenme olarak konumlanırsa `Ustalarla birlikte yükselt` daha tutarlı. `Siyerden gerçek olaylar` gibi geniş doğruluk iddiası yerine, incelemesi tamamlanmış kaynak yaklaşımına uygun `Siyer kaynaklarından esinlenen bir hikâye` ifadesi değerlendirilebilir; tarihsel doğrulama ayrı görevdir. Ön izleme metni, gerçek oynanışa erişim süresi ve final CTA birbiriyle tutarlı olmalı.

**Yeni 30 saniyelik storyboard — öneridir:**

| Saniye | Gerçek kayıt / görüntü | Metin / amaç |
|---|---|---|
| 0–3 | Tek malzeme teslimiyle duvar yükselir; küçük oyun logosu | `Bir taşı sen taşı.` Hemen eylem ve sonuç |
| 3–6 | Bir saniyelik sel, yardım bekleyen ev, kontrol oyuncuya geçer | `Mekke, 605. Birlikte yeniden kur.` |
| 6–11 | Ham taş→usta→duvar, üç net yakın kesme | `Topla. İşle. İnşa et.` Üretim zincirini ispat |
| 11–16 | Oyuncu yükseltmeyi seçer; yardımcı yük taşır | `Ustalarla iş bölümü yap.` Vaat görüntüde görünür |
| 16–21 | Gece: seçili gruba su, bar düşer, grup sakinleşir | `Yardım et. Barışı koru.` Farklılaşmayı göster |
| 21–25 | Önce/sonra yapı ve kısa öğrenme kartı | `7 bölüm, bir ortak emek hikâyesi.` |
| 25–30 | Final yapı, büyük okunur logo ve doğrulanmış tek CTA | Yayındaysa `Şimdi oyna`; değilse gerçek bekleme listesi/ön kayıt adresi |

**Üç 3-saniyelik hook testi:** A) görsel dönüşüm: `Bu ilk taşı kim taşıyacak?`; B) dayanışma: iki ihtiyaç simgesi, `Önce kime yardım edeceksin?`; C) inşa tatmini: taş→duvar hızlı art arda, `Taşı. Yerleştir. Yükselt.` Her varyantın ilk karesi gerçek oyundan olmalı; oynanamayan mekanik veya var olmayan çok oyunculu vaat edilmemeli. Dinî temayı şok unsuru veya korku baskısı olarak kullanma.

**Teslim koşulları:** 9:16 ana sürüm; mağaza önizlemesi ve sosyal reklamı aynı dosya sayma; altyazı ve CTA platform UI güvenli alanına göre kontrol; kaynak oyun kaydıyla ürün vaadi eşleştirme; müziksiz/sessiz anlaşılabilir sürüm; metinleri Türkçe/İngilizce ayrı tasarla; duyulabilirlik ve lisans kontrolünü dinleyerek yap. Testte yalnız tıklama değil nitelikli indirme/oynamaya başlama ve ilk bölüm tamamlama karşılaştırılsın. Sayısal dönüşüm artışı garantisi yok.

### Sınırlar ve eksik doğrulamalar
Ses dinlenmedi; seslendirme/altyazı senkronu değerlendirilemedi. Reklam platformu, hedef kitle, medya bütçesi, mağaza URL’leri, yayın tarihi, CTR/CPI/ROAS verisi paylaşılmadı. Kare örnekleme tam hareket/sesli seyir veya frame-by-frame kurgu analizi yerine geçmez.



---

# C. Başarılı oyunlar, mağazalar ve ölçüm

Araştırma tarihi: 7 Kasım 2026. Bu notlar kaynak araştırması ve tasarım önerisidir; kodun, gerçek cihaz performansının veya reklam videosunun bu araştırmacı tarafından test edildiği anlamına gelmez. Satış, indirme, tüketici harcaması, aktif kullanıcı ve tasarım niteliği ayrı ölçülerdir. Güncel mağaza sayfaları zamanla değişir. Aşağıdaki karşılaştırma bir “2026 dünyanın en çok satan oyunları sıralaması” değildir.

## Hangi başarılı oyunlardan ne öğrenilmeli?

### Ana sonuç

En yakın mekanik karşılaştırmalar Pizza Ready ve My Mini Mart; uzun vadeli oyuncu sahiplenmesi için Minecraft/Stardew Valley; ekran açıklığı ve kısa dokunma etkileşimleri için Monument Valley; geri bildirim ve bölüm ilerleme ritmi için Royal Match. Kâbe Ustaları'nın fırsatı bu oyunların ölçeğini taklit etmek değil, anlaşılır taşıma-inşa döngüsünü tarihî anlatı ve yardımlaşmayla birleştirmektir.

### Kanıt ve kaynaklar

| Oyun | Doğrulanabilen ticari ölçek; kapsam/tarih | Resmî tanıtımın gösterdiği özellik | Kâbe Ustaları ile karşılaştırma amacı |
|---|---|---|---|
| Minecraft | Resmî 15. yıl zaman çizelgesi, 2023 için 300 milyon kopya satışı bildiriyor. Tüm platformların toplamı; mobil satış değildir. | İnşa, keşif, yeni malzemeler ve yaratıklarla genişleyen dünya. | İnşa sonucunun oyuncunun eseri gibi hissedilmesi. [Mojang](https://www.minecraft.net/en-us/15th-anniversary) |
| Stardew Valley | Geliştiricinin 26 Şubat 2026 tarihli yazısı 50 milyon satışı bildiriyor. Eski basın sayfası Aralık 2024 için 41 milyon gösteriyor; yeni tarihli beyan kullanılmalı. Mobil payı bu sayıdan çıkarılamaz. | Resmî özellik listesinde çiftlik kurma, üretim, yerel topluluk ve karakter özelleştirme var. | Üretim döngüsüne insan ilişkileri ve kalıcı dünya değişimi eklemek. [2026 geliştirici yazısı](https://www.stardewvalley.net/stardew-valley-10-year-anniversary/), [özellikler](https://www.stardewvalley.net/press/) |
| Pizza Ready! | 7 Kasım 2026 araştırmasında Google Play 100M+ indirme eşiği gösteriyor. Bu kesin indirme sayısı, ücretli satış veya iOS toplamı değildir. | Pişir-servis et-kazan-yükselt; personel, istasyonlar ve yeni işletmeler. Reklam/IAP bildirimi mevcut. | En yakın kısa taşıma/servis döngüsü ve görünür yükseltme karşılaştırması. [Google Play](https://play.google.com/store/apps/details?hl=en_US&id=io.supercent.pizzaidle) |
| My Mini Mart | Google Play 100M+ indirme eşiği; sayfa güncellemesi 28 Ağustos 2026. | Tarla-hayvan-işleme-raf; çalışan yönetimi ve genişleme. Reklam/IAP bildirimi mevcut. | Kaynak zinciri, bir işin otomasyonla rahatlaması ve yeni görev açılması. [Google Play](https://play.google.com/store/apps/details?hl=en_US&id=com.KisekiGames.smart) |
| Royal Match | Google Play 100M+ indirme eşiği; satış veya gelir değildir. | Match-3 bölümler, saray alanları, güçlendiriciler ve etkinlikler; mağazada reklamsızlık iddiası. | Açık bölüm hedefi ve kazanmanın dünyaya görünür etkisi. [Google Play](https://play.google.com/store/apps/details?hl=en_US&id=com.dreamgames.royalmatch) |
| Monument Valley | Google Play 5M+ indirme eşiği; ücretli/Play Pass dağıtımı bulunduğundan bu eşik ücretli kopya satışı diye sunulmamalı. Sayfa güncellemesi 12 Ekim 2026. | Minimalist üç boyutlu mimari, döndür/sürükle etkileşimleri, harekete tepki veren ses ve telefon/tablet desteği. | Görsel hiyerarşi, tek bakışta hedef ve az sayıda anlamlı etkileşim. [Google Play](https://play.google.com/store/apps/details?hl=en_US&id=com.ustwo.monumentvalley) |


### Değerlendirme ve öneriler

Aşağıdaki tasarım değerlendirmeleri araştırmacının önerisidir; rakiplerin başarısının kanıtlanmış nedensel açıklamaları değildir.

| Referans | Alınacak ilke | Kâbe Ustaları'nda somut uygulama | Kaçınılacak kapsam/taklit |
|---|---|---|---|
| Pizza Ready | Birkaç saniyede tamamlanan görünür iş ve açık kapasite | Taş ocağına yaklaş → taş sırta gelir → taşıma sayacı artar → duvara yaklaşınca taş yerleşir → duvarda gerçek değişim | Her 30 saniyede zorunlu reklam, bilinmeyen para birimi, sırf süre uzatmak için uzun yürüyüş |
| My Mini Mart | Tekrarlanan işi hafifletip oyuncuya yeni karar vermek | İlk sıra elde; sonra yardımcı işçi taş taşır, oyuncu kesme/yerleştirme önceliğini seçer | Sonsuz kaynak zinciri, kutsal mekânı para üreten fabrikaya dönüştüren ekonomi |
| Minecraft | “Bunu ben yaptım” duygusu | Bölüm sonunda tamamlanan duvarı önce/sonra göster; tarihî ana yapıyı koruyarak atölye düzeni, malzeme sırası veya güzergâh seçimi | Sınırsız açık dünya, fizik/voxel motoru, tarihî yapıyı keyfî değiştirmenin ana hedef olması |
| Stardew Valley | Mekaniği tanınan insanlarla ve gün ritmiyle ilişkilendirmek | 3-4 yardımcı NPC'nin tekrarlanan kısa öyküsü, yardımın sonraki bölümde görünür karşılığı | Büyük ilişki simülasyonu, günlük zorunlu giriş, onlarca NPC ve ağır diyalog hacmi |
| Royal Match | Google Play 100M+ indirme eşiği; satış veya gelir değildir. | Match-3 bölümler, saray alanları, güçlendiriciler ve etkinlikler; mağazada reklamsızlık iddiası. | Açık bölüm hedefi ve kazanmanın dünyaya görünür etkisi. [Google Play](https://play.google.com/store/apps/details?hl=en_US&id=com.dreamgames.royalmatch) |
| Monument Valley | Görüntüde az sayıda kuvvetli odak | Karakter/taş/teslim alanının arka plandan ayrılması, iskele saydamlığı, sakin ama canlı teslim animasyonu | Tarihî gerçekliği fantastik geometriyle karıştırma; yalnız estetiği kopyalama |

Konumlandırma hipotezi: “Kısa bölümlerde taşı, yardımlaş, inşa et; tarihî bir öyküyü oynayarak keşfet.” Birincil kullanım hipotezi aileyle birlikte oynama ve tarih meraklıları; ayrı araştırma grupları 9-12 yaş çocuk + ebeveyn, 13-17 yaş, yetişkin tarih/rahat oyun kitlesi olabilir. Bunlar hedef yaş beyanı değildir: yaş grubu pazarlama, içerik, ölçüm ve mağaza politikasıyla birlikte seçilmeli. Oyunu yalnız dinî bilgi sınavı gibi pazarlamak, hareket ve inşa seven potansiyel oyuncuyu uzaklaştırabilir; bunu gerçek kullanıcı testiyle sınamak gerekir.

Gelir modeli önerisi: ilk 1-2 bölüm ücretsiz; kalan öyküyü bir defalık açma. Alternatif tümü ücretli premium sürüm. Varsayılan reklamsız, çevrimdışı ana oyun ve hesapsız kayıt aile güveni hipotezini güçlendirebilir; bu vaatler ancak uygulanıp doğrulanınca yazılmalı. “Bereket”, “iyilik”, kutsallık veya tarihî uzlaşma satın alınabilir kaynaklara dönüştürülmemeli. Ücretli içerik varsa açık bölüm paketi; rastgele ödül kutusu, ücretli can, kaybetme baskısı, kaçırma korkusu ve kutsal olayın reklamla açılması önerilmez. Reklam geliri eklemek zorunlu değildir.

### Sınırlar ve eksik doğrulamalar

- Bu oyunun indirme, gelir, hedef ülke, fiyat, bütçe, hedef yaş ve oyuncu verisi yok; ticari başarı olasılığı yüzdesi hesaplanamaz.
- Rakipler aynı tür, maliyet veya dağıtım gücünde değil. Satış ölçekleri kalite kontrol listesi olarak kullanılabilir; gelir tahmini emsali değildir.
- Doğrulanmış güncel küresel Royal Match yıllık net geliri kullanılmadı. Mağaza sıralamaları ülke ve anda değiştiği için “şu an dünya ikincisi” gibi iddialar kullanılmamalı.
- Bu araştırmada rakiplerin canlı bölümleri oynanmadı; mekanik bilgiler resmî ürün açıklamalarından, öneriler tasarım çıkarımından geliyor.

## App Store ve Google Play'e çıkmak için neler tamamlanmalı?

### Ana sonuç

Bir HTML oyununun çalışması mağaza sürümünün hazır olduğunu göstermez. Paketleme, kaynakların çevrimdışı yüklenmesi, mobil yaşam döngüsü, satın alma, gizlilik, yaş grubu ve gerçek cihaz testleri ayrı yayın iş paketleridir; aşağıdaki liste mağaza onayı garantisi değildir.

### Kanıt ve kaynaklar

1. **Apple ürün/çocuk/gizlilik sınırı:** 4.2, uygulamanın paketlenmiş web sitesinden öte kalıcı eğlence/işlev taşımasını ister; WebView teknolojisini tek başına yasaklamaz. Kids Category'de dış bağlantılar ve satın alma fırsatları ebeveyn alanında olmalı; üçüncü taraf reklam/analitik genel olarak uygun değildir, dar istisnalar vardır. Gizlilik politikası hem uygulamada hem mağaza meta verisinde erişilebilir olmalı. Dijital içerik satın almalarında 3.1 uygulanır; bölgesel istisnalar ayrıca incelenmeli. [Apple App Review Guidelines, 1.3 / 3.1 / 4.2 / 5.1, 07.11.2026 erişimi](https://developer.apple.com/app-store/review/guidelines/)
2. **Google Families:** Çocukları kapsayan hedef kitle seçimi politika yükümlülüğü getirir. Çocuklara reklam varsa onaylı Families self-certified SDK sürümleri gerekir; karma kitlede tarafsız yaş ekranı kullanılmalı. Çocuklara kişiselleştirilmiş reklam yapılmamalı. [Google Families](https://support.google.com/googleplay/android-developer/answer/9893335?hl=en)
3. **Google Data safety:** SDK'ların davranışı da geliştiricinin beyanına dahildir. Veri toplamayan uygulamalarda bile form ve gizlilik politikası gerekir; yalnız internal test kanalına özgü istisna vardır. [Google Data safety](https://support.google.com/googleplay/android-developer/answer/10787469?hl=en)
4. **Google ödeme:** Dijital özellik/içerik için temel kural Play Billing; politika 3, 8, 9 gibi istisna programları barındırıyor. İlk sürüm için standart mağaza satın alması önerilir; “her ülkede hiçbir istisna yok” denmemeli. [Google Payments](https://support.google.com/googleplay/android-developer/answer/9858738?hl=en)
5. **Google hedef SDK:** Canlı resmî sayfa 31 Ağustos 2026'dan itibaren yeni telefon/tablet uygulaması ve güncellemelerin Android 16 / API 36 veya üstünü hedeflemesini söylüyor. Mevcut uygulamaların keşfedilebilirliği ayrı kurala tabi. Sayfa uzatma için 1 Kasım 2026'yı verir; bu tarih araştırma gününde geçmiş. Target SDK, minimum çalışacak Android sürümü değildir. [Google target API, 07.11.2026 erişimi](https://support.google.com/googleplay/android-developer/answer/11926878?hl=en-en)
6. **16 KB nüansı:** Android'in canlı sayfası API 35+ uygulamaların Google Play'de 64-bit cihazlar için 16 KB desteklemesi gerektiğini söyler; ayrıca güncelleme blokajı için şu ifadeyi kullanır: “Starting February 1, 2027, if your app updates don't support 16 KB memory page sizes”. Bu ifade yeni uygulamalar için genel bir 2027 muafiyeti veya ilk gerekliliğin başlangıcı değildir; geçmiş 2025 başlangıcıyla karıştırılmamalı. Yerel `.so` kütüphanesi içeren SDK/paketleyici dahil tüm bağımlılıklar APK Analyzer ve 16 KB emülatörle kontrol edilmeli. [Android Developers, 07.11.2026 erişimi](https://developer.android.com/guide/practices/page-sizes)
7. **Apple build SDK:** 3 Şubat 2026 duyurusuna göre 28 Nisan 2026'dan beri gönderilen iOS/iPadOS uygulamaları iOS/iPadOS 26 SDK veya yenisiyle oluşturulmalı. Bu gereklilik, son kullanıcının mutlaka iOS 26 kullanması anlamına gelmez. [Apple duyurusu](https://developer.apple.com/news/?id=ueeok6yw)
8. **Google test kanalı:** 13 Kasım 2023 sonrasında açılmış kişisel geliştirici hesapları için en az 12 testçinin 14 gün kesintisiz dahil olduğu kapalı test ve ardından production access başvurusu gerekiyor. Bu bütün hesap türleri için aynı zorunluluk değil; 14 gün dolması otomatik onay değil. [Google test gereklilikleri](https://support.google.com/googleplay/android-developer/answer/14151465?hl=en)
9. **Apple tanıtım sınırları:** Ad 30, alt başlık 30, tanıtım metni 170, anahtar kelimeler 100 karakter. Önizleme en fazla 30 saniye, cihazdan alınmış gerçek uygulama görüntüsü; en fazla 10 ekran görüntüsü. Rakip adlarını anahtar kelimeye koymak uygun değil. [Apple ürün sayfası](https://developer.apple.com/app-store/product-page/)
10. **Google metin sınırları:** Ad 30, kısa açıklama 80, tam açıklama 4.000 karakter; ilgisiz veya tekrar eden anahtar kelime doldurma yapılmamalı. [Google mağaza kurulum rehberi](https://support.google.com/googleplay/android-developer/answer/9859152?hl=en)

### Değerlendirme ve öneriler

Yayın iş listesi; ilgili satırdaki platform kuralına ek olarak aşağıdakiler bu ürün için önerilen uygulama ve kabul kanıtlarıdır:

| İş paketi | Somut çıktı / kabul kanıtı | Öncelik |
|---|---|---|
| Hedef kitle kararı | Yaş, ülkeler, dil, Kids Category/Families seçimi ve gerekçesi; formdaki beyanla reklam dili aynı | Yayından önce |
| Dağıtım mimarisi | Web/PWA ile native wrapper seçeneklerinin cihaz prototipi; dokunma, ses açılması, safe area, ekran yönü, çevrimdışı ve kayıt raporu | Yayından önce |
| Paket bağımsızlığı | CDN JS, font, ses ve dokular mümkünse paket içinde; uçak modunda ilk açılış ve tekrar açılış; başarısız indirmenin anlaşılır durumu | Yayından önce |
| İşletim sistemi yaşam döngüsü | Arama gelmesi, uygulamanın arka plana alınması, ses kesilmesi, ekran kilidi, WebGL context loss, düşük bellek ve kill/relaunch testleri | Yayından önce |
| Kayıt | Atomik/versiyonlu kayıt; bölüm ortasında çıkış; eski sürümden yükseltme; bozuk kayıt kurtarma; satın alma ayrı tutulur | Yayından önce |
| Gizlilik envanteri | Hangi olayın hangi sunucuya/SDK'ya gittiğinin listesi; ağ kaydıyla doğrulama; yerel kayıt “sunucuya veri toplamıyoruz” iddiasıyla karıştırılmaz | Yayından önce |
| Satın alma varsa | İptal, pending, tamamlanma, tekrar açma, geri yükleme ve cihaz değişimi; içerik açma idempotent; kullanıcı tekrar ücretlendirilmez | Yayından önce |
| Varlık lisansları | Font, müzik, model, ikon, seslendirme ve kullanılan kütüphanelerin kaynak/lisans dosyası | Yayından önce |
| Tarihî editörlük | Gerçek olay / oyunlaştırılmış görev ayrımı; kaynakça; “Kanlı Yemin” gibi başlığın yaş anketi ve ürün tonuna etkisi | Yayından önce |
| Destek ve inceleme | Destek URL/e-posta, gizlilik URL, yaş formu, varsa test hesabı, incelemeciye bölüm erişim talimatı, reklam/IAP beyanı | Yayından önce |
| Test kanalları | TestFlight + Play internal/closed; düşük/orta Android, küçük/büyük iPhone, tablet; çentik, gesture bar, büyük yazı ve RTL planı | Yayından önce |
| Güncelleme | Sürümleme, geri dönüş planı, crash izlemesi, kayıt geçişi, staged rollout kararı | Yayından önce |

Ekran yönü önerisi: mevcut dikey tasarımı birinci sınıf deneyim olarak bitir; yatayı sonradan destekle veya tutarlı yön davranışı uygula. Safe-area ve değişen ekran oranları için 360×800, 390×844, 430×932 CSS boyutlarına ek tablet testleri kullan. Bunlar mağaza tarafından evrensel zorunlu ekran ölçüsü değil, iç QA matrisi örnekleridir.

Mağaza metni taslağı — **mevcut ürün metni değil, geliştirilecek ve doğrulanacak sürüm için öneri**. Karakter sayımları boşluk/noktalama dahil, tırnaklar hariç:

| Alan | Metin | Sayım |
|---|---|---|
| İki mağaza adı | Kâbe Ustaları | 13 / 30 |
| Apple alt başlık | İnşa et, yardımlaş, keşfet | 26 / 30 |
| Google kısa açıklama | Taşları taşı, ustalara yardım et ve tarihî Mekke'de bir inşa öyküsünü keşfet. | 77 / 80 |
| Apple tanıtım | Bir taşla başla, bir hikâyenin parçası ol. Kaynakları taşı, ustalara yardım et ve Kâbe'nin yeniden inşasını konu alan bu macerayı keşfet. | 137 / 170 |
| Apple keywords | mekke,tarih,inşaat,macera,yardımlaşma,keşif,ustalık,taşıma,simülasyon | 69 / 100 |

Tam açıklama için öneri çekirdek metin:

> Tarihî Mekke'de bir inşa öyküsünün parçası ol. Kâbe Ustaları'nda kaynakları taşı, ustaların işlerini tamamla ve her bölümde yapının adım adım yükseldiğini gör.
>
> Kısa görevlerle çevreyi keşfet, taşları yerlerine ulaştır ve yardımlaşmanın öyküdeki yerini deneyimle. Bölüm sonlarındaki bilgi kartlarıyla oyun içinde karşılaştığın olayların tarihî bağlamını öğren.
>
> Tarihî olaylar ile oyunlaştırılmış görevler birbirinden ayrılır. Kaynakça ve anlatım yaklaşımı oyun içinden incelenebilir.

Son paragraf ve bilgi kartı iddiası ancak kaynakça/ayrım gerçekten uygulandığında kullanılmalı. “Çevrimdışı”, “reklamsız”, “çocuklar için”, “veri toplamıyor”, “tarihsel olarak yüzde yüz doğru” gibi ifadeler otomatik eklenmemeli. Kids kategorisi seçilmeden çocuk odaklı mağaza dili kullanılmamalı. Arama hacmi verisi olmadığı için anahtar kelimeler optimize edilmiş sonuç değil, ilk test adayıdır.

Ekran görüntüsü akışı, gerçek cihaz görüntüsü üzerinde kısa fayda başlığıyla:

1. **“Bir taşla başla”** — karakterin taşı aldığı an; oyun eylemi görünür, açılış menüsü değil.
2. **“Adım adım yükselt”** — aynı açıdan duvarın değişimi; gerçek oynanıştaki ilerleme.
3. **“Ustalara yardım et”** — anlaşılır tek görev ve yardım sonucu.
4. **“Mekke'yi keşfet”** — okunur çevre, yönlendirme ve rota; kalabalık HUD gösterilmez.
5. **“Hikâyenin izini sür”** — kaynaklı bilgi kartı / tarihî bağlam; uygulanmış olmalı.
6. **“Kaldığın yerden devam et”** — yalnız kayıt/restore testleri geçince; son ürün ekranı.

Reklam/mağaza videosu test önerisi: 0-2 saniye taşın yerleşmesi ve yapı değişimi; 2-7 saniye taşıma döngüsü; 7-12 saniye yardım sonucu; 12-18 saniye ikinci inşa aşaması; 18-24 saniye tarihî bilgi; 24-30 saniye oyun adı ve çağrı. Ses kapalıyken anlaşılmalı. Mağaza önizlemesi gerçek oyun deneyimini göstermeli; sosyal reklam için ayrı sürüm üretilebilir. Hâlihazırdaki MP4'ün bu kurala uyduğu bu araştırmada değerlendirilmedi.

### Sınırlar ve eksik doğrulamalar

- Apple/Google geliştirici hesabı türü, paketleyici, SDK sürümleri, IAP/ads/analytics bağımlılıkları, mağaza ülke planı bilinmiyor.
- Hesap açma varsa hesap silme, üçüncü taraf giriş varsa ilgili platform giriş kuralları ayrıca incelenmeli; önerilen hesapsız v1 bunları gereksiz yere eklemiyor.
- Veri koruma hukuku yalnız mağaza formuyla çözülemez. Gerçek veri akışları ve hedef bölgeler olmadan özel hukuki uyum sonucu verilmedi.
- 16 KB sayfasındaki 2027 tarihi güncelleme yaptırım ifadesidir; ayrı yeni gönderim/publisher özel uzatma durumu Play Console'dan doğrulanmalı.

## Başarı ve iyileşme nasıl ölçülmeli?

### Ana sonuç

İlk hedef oyuncunun ne yapacağını anlaması ve bir taşın yerleşmesini keyifli bulmasıdır. Retention veya gelire geçmeden kontrol, yön bulma, görev açıklığı ve kayıt güvenilirliği ölçülmeli; aşağıdaki eşikler dış pazar standardı değil, ekip içi ilk deney hedefleridir.

### Kanıt ve kaynaklar

Ölçüm araçları çocuk ve gizlilik kararından bağımsız değildir: Google Data safety üçüncü taraf SDK davranışlarının beyanını ister; Apple Kids Category üçüncü taraf analitiği sınırlar. Bu nedenle başlangıçta moderatör gözlemi, cihazda yerel debug telemetrisi ve ebeveyn onaylı kullanıcı araştırması en az karmaşık seçenek olarak değerlendirilebilir. [Google Data safety](https://support.google.com/googleplay/android-developer/answer/10787469?hl=en), [Apple 1.3](https://developer.apple.com/app-store/review/guidelines/)

### Değerlendirme ve öneriler

Tüm ölçüm tanımları ve hedefler bu araştırmacının önerdiği **ürün deneyi planıdır**, doğrulanmış sektör benchmark'ı değildir.

| Ölçüm | Kesin tanım | İlk deney hedefi / karar |
|---|---|---|
| İlk anlamlı eylem | Oynanabilir sahne kontrolü açıldıktan ilk başarılı toplama/teslime kadar geçen süre; yükleme ayrı ölçülür | Medyan ≤30 saniye; 10 yeni katılımcının en az 8'i sözlü yardım almadan |
| Yön bulma | Görev açıldıktan doğru hedefe ilk varış; görev dışı dolaşma ve yanlış bölge denemeleri | İlk görevde 10 kişiden en az 8'i 45 saniye içinde; sapmaların nedenini kaydet |
| Etkileşim anlaşılması | “Burada ne yapmalısın?” sorusuna görev UI'sına bakarak doğru cevap | 10 kişiden 9'u; UI metni/simge A-B testi için kullan |
| İlk bölüm tamamlama | İlk bölümü başlatan yeni oyuncular arasında tamamlayanlar; aynı oturum ve sonraki oturum ayrı | İlk kapalı pilot için ≥%80 iç hedef; örneklem küçükse yüzdeden önce adetleri raporla |
| Tekrar deneme | Başarısızlıktan sonraki 60 saniyede yeniden başlayan / başarısız olan | Sabit evrensel eşik yerine neden analizi: anlamadı, sıkıldı, kontrol hatası, süre baskısı |
| D1 / D7 | İlk açılış kohortunun tam ertesi / yedinci takvim gününde yeniden oyun açan oranı; timezone ve day-window sabit | İlk 100-200 uygun katılımcıyla baz çizgi; daha sonra yeni sürümle karşılaştır. D1 %40/D7 %15 gibi dış kaynaklıymış görünen tahmini eşikler üretme |
| Bölüm terk noktası | Her bölümde başlayan/tamamlayan oyuncular; son görev ve aktif süre | En büyük düşüşü düzelt; oyun arka plan süresi aktife eklenmesin |
| Öğrenme | Bir tarihî kavram için oyundan önce/sonra kısa açık soru ve kaynak hatırlama | “Öğretici” iddiası için bilgi artışı gözlemi; eğlence ve öğrenme puanı ayrı |
| Kontrol güvenilirliği | Pointer cancel, stuck input, yanlış hedef teslimi, menü kapanınca hayalet hareket | Sabit manuel test senaryolarında sıfır ilerleme kilitleyen hata |
| Performans | Cihaz bazında p95 frame time, uzun takılmalar, 15 dk sonrası sıcaklık/FPS, loading time | Düşük kalite profilde kararlı 30 FPS, orta profilde 60 FPS aday hedef; gerçek GPU ölçümü olmadan garanti yok |
| Kayıt | Arka plan/kill/upgrade senaryolarında son onaylı checkpoint'in geri gelmesi | Belirlenmiş matrisin tamamında veri kaybı yok |
| Satın alma varsa | Tamamlanmış ödemeden entitlement'a geçiş; iptal/pending/restore ayrı | Test senaryolarında çift açma/yanlış ücretlendirme yok; gelir optimizasyonundan önce doğruluk |

Önerilen olay sözlüğü: `session_start`, `first_playable`, `tutorial_step`, `resource_pickup`, `delivery_complete`, `objective_start`, `objective_complete`, `chapter_start`, `chapter_complete`, `chapter_fail`, `hint_open`, `settings_changed`, `save_failed`, `purchase_state` (varsa). Parametreler: sürüm, bölüm/görev kimliği, cihaz kalite sınıfı, kontrol modu, süre, başarısızlık nedeni. E-posta, tam doğum tarihi, dinî inanç çıkarımı, çocuk kimliği, GPS veya reklam kimliği varsayılan olarak toplanmamalı. Aynı oyuncuyu D1/D7 için ayırt etmek veri tasarımı gerektirir; “anonim” deyip kalıcı kimlik sorununu yok sayma. Çocuk kitlesinde bu ölçümleri pilot araştırma kohortunda yapmak daha uygun olabilir.

Öncelikli üç deney:

1. **HUD ve yönlendirme:** mevcut düzen / tek ana hedef + bağlamsal “Taşı-Yerleştir” düzeni. Başarı ölçüsü görev anlama ve ilk teslim süresi; tercih anketi ikincil.
2. **Eylem hissi:** mevcut teslim / 150-300 ms görsel yerleşme, ses, küçük titreşim, duvarda görünür yükselme. Süre aralığı tasarım başlangıcıdır; hareket azaltma ve titreşim kapatma seçenekleri olmalı. Başarı ölçüsü “bir tur daha yapmak ister misin?” ve spontan tekrar davranışı.
3. **Bölüm ritmi:** sürekli taşıma / her 60-90 saniyede görev türü veya görünen dünya değişimi. Aralık iç tasarım hipotezidir; aktif oynama süresi, terk noktası ve sıkılma yorumu izlenir.

### Sınırlar ve eksik doğrulamalar

- Ürün analitiği yok; kullanıcı tutma, gelir, LTV/CAC, dönüşüm ve çökmesiz oturum oranı hesaplanamaz.
- Küçük moderasyonlu testin 8/10 sonucu tüm pazarın %80'i değildir. Kohort, ülke, yaş, cihaz ve edinim kaynağı yazılmadan karşılaştırma yapılmamalı.
- Ücretli reklam edinimi veya canlı operasyon bütçesi bilinmiyor. Oyun döngüsü ve mağaza vaatleri doğrulanmadan büyük reklam harcaması önerilmez.
