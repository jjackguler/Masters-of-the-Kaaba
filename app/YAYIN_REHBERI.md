# Kâbe Ustaları: App Store ve Google Play'e Yükleme Rehberi

Bu klasör, oyunun iOS ve Android için hazır Capacitor projesidir. İçeriği:
- `www/` oyunun kendisi. İnternetsiz çalışır: three.js ve yazı tipleri içinde.
- `android/` ve `ios/` yerel projeler.
- `assets/` ikon ve açılış ekranının kaynakları. Tüm boyutlar bunlardan üretildi.
- `store/` mağaza metinleri, gizlilik politikası ve ekran görüntüleri.

## 0. Önce şunlara karar verin (bir kez)
1. **Uygulama kimliği (bundle id).**
   - Şu an `com.kabeustalari.game`. Kendi alan adınıza göre değiştirin, örneğin `com.sizinadiniz.kabeustalari`.
   - Mağazaya ilk yüklemeden sonra **değiştirilemez**.
   - Değiştirmek için:
     1. `capacitor.config.json` içindeki `appId` alanını değiştirin.
     2. `npx cap sync` çalıştırın.
     3. Android'de ayrıca `android/app/build.gradle` içindeki `applicationId` ve `namespace` alanlarını değiştirin.
     4. iOS'ta Xcode'da *Signing & Capabilities* bölümünden Bundle Identifier'ı değiştirin.
2. **Gizlilik politikası adresi.**
   - `store/privacy-policy.html` dosyasında iki yerde e-postanızı yazın.
   - Dosyayı herkese açık bir adreste yayınlayın: GitHub Pages, Google Sites ya da kendi siteniz.
   - Her iki mağaza da bu adresi ister.

## 1. Hesaplar (ücretli, sizin adınıza açılmalı)
| | Apple App Store | Google Play |
|---|---|---|
| Hesap | Apple Developer Program | Google Play Console |
| Ücret | Yıllık 99 $ | Tek seferlik 25 $ |
| Onay süresi | Hesap: 1-2 gün. Her sürüm incelemesi: genelde 1-3 gün | İnceleme: birkaç saatten 7 güne |
| Özel şart | Derleme için Mac ve Xcode gerekir | **Yeni kişisel hesaplarda:** üretime çıkmadan önce en az **12 test kullanıcısıyla, 14 gün kesintisiz kapalı test** zorunludur. Kurumsal hesaplar (D-U-N-S numaralı şirket) bu kuraldan muaftır. |

> Google kuralı bu yüzden önemli: Kişisel hesapla ilerlerseniz Android'deki gerçek yayın en erken yaklaşık 2-3 hafta sonra olur. Hemen 12 kişilik bir test grubu (aile ve arkadaşlar) kurun ve kapalı testi bugün başlatın.

## 2. Gereken programlar
- Node.js 18 veya üstü
- **Android:** Android Studio (güncel sürüm, JDK 17 içinde gelir)
- **iOS:** macOS, Xcode 15 veya üstü, CocoaPods (`sudo gem install cocoapods`)

## 3. Kurulum (bilgisayarınızda, bu klasörde)
```bash
npm install
npx cap sync
```
`npx cap sync` komutu `www/` içeriğini Android ve iOS projelerine kopyalar.

## 4. Android: imzalı AAB üretme
1. `npx cap open android` komutuyla Android Studio'yu açın.
2. *Build › Generate Signed App Bundle / APK › Android App Bundle* seçin.
3. Yeni bir anahtar deposu (keystore) oluşturun. **Bu dosyayı ve şifresini kaybetmeyin; yedekleyin.**
4. *release* seçin. Çıkan dosya: `android/app/release/app-release.aab`.
5. Play Console'da sırasıyla:
   1. Uygulama oluşturun.
   2. *Test › Kapalı test* bölümünde bir kanal açın ve AAB'yi yükleyin.
   3. Test kullanıcılarının e-postalarını ekleyin, katılım bağlantısını onlarla paylaşın.
6. Mağaza girişini doldurun:
   - Metinler: `store/MAGAZA_METINLERI.md`
   - Ekran görüntüleri: `store/screenshots/android/`
   - Özellik grafiği (1024×500): `store/feature-graphic.png`
7. Ardından şu formları doldurun:
   - İçerik derecelendirme anketi
   - Veri güvenliği (Data safety): "Veri toplanmıyor"
   - Hedef kitle
8. 14 gün dolunca *Üretime erişim başvurusu* yapın.

## 5. iOS: Xcode'da arşivleyip yükleme
1. Mac'te `npx cap open ios` komutuyla Xcode'u açın.
2. *Signing & Capabilities* bölümünde Apple Developer takımınızı seçin.
3. Hedef cihaz olarak *Any iOS Device* seçin, sonra *Product › Archive*.
4. *Organizer › Distribute App › App Store Connect › Upload*.
5. App Store Connect'te şunları doldurun:
   - Yeni uygulama kaydı ve metinler
   - Ekran görüntüleri (`store/screenshots/ios/`)
   - Gizlilik: "Data Not Collected"
   - Yaş: 4+
   - İnceleme notu: `MAGAZA_METINLERI.md` dosyasının sonunda
6. İsterseniz önce TestFlight ile test edin, sonra *Submit for Review*.

## 6. Yüklemeden önce mutlaka
- **Gerçek telefonda deneyin:** eski bir Android ve bir iPhone. Akıcılık ayarı oyunda *Ayarlar › Kalite* bölümünde.
- **Hadis ve tarih metinlerini bir hocaya okutun.** Oyun bilgileri İbn Hişâm ve TDV İA'ya dayanıyor, ama dini içerikte uzman kontrolü şarttır.
- **İnceleme reddi riski.** Apple "web sitesini paketlemek" gerekçesiyle (Guideline 4.2) uygulama reddedebilir. Bu oyun tamamen yerel çalışan, internet istemeyen bir oyun olduğu için risk düşük. Yine de reddedilirse inceleme notunda "fully offline native game built with web technologies" diye açıklayın.

## 7. Güncelleme yaparken
1. Oyunu değiştirin.
2. `www/` klasörünü yenileyin.
3. Sürüm numarasını artırın:
   - Android: `android/app/build.gradle` içinde `versionCode` +1 ve `versionName`.
   - iOS: Xcode'da *Version* ve *Build* değerleri.
4. `npx cap sync` çalıştırın, sonra 4. veya 5. adımı tekrarlayın.
