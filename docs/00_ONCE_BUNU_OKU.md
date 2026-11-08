# Claude teslim paketi

7 Kasım 2026. Mevcut inceleme kaldığı yerden tamamlandı. Kaynak oyuna düzeltme uygulanmadı.

## Kullanım

1. Önce `01_KABE_USTALARI_ANALIZ.md` dosyasını oku: yönetici özeti, teknik bulgular, UX/oyun tasarımı, rakip karşılaştırması, reklam ve mağaza planı.
2. `02_CLAUDE_UYGULAMA_ISTEMLERI.md` içindeki ana istem + Aşama 1 ile başla; aşamaları sırayla uygula.
3. `kaynak/` kullanıcı ZIP'inden çıkarılan özgün kaynaklardır. `girdiler/` çalışan HTML, özgün reklam, ekranlar ve referans istem belgesidir.
4. `kanitlar/` mobil emülasyon görüntüsü, kare örnekleri ve inceleme betikleridir. Betikler özgün çalışma alanına göre yazılmış olabilir; yeniden çalıştırmadan yollarını kontrol et. Fiziksel cihaz veya tam oyun testi yerine geçmezler.

## Doğrulama düzeyleri

- Kaynak okuması, kaynak/bundle karşılaştırması ve izole mantık testleri yapıldı.
- Chromium 390×844 mobil ilk ekran denemesi yapıldı; tam yedi bölüm bitirilmedi.
- Reklamın zaman etiketli kareleri incelendi; ses dinlenmedi.
- Gerçek iOS/Android performansı ve native mağaza paketleri incelenmedi.
- Rakip satışları/indirmeleri tarihli kaynaklarla verildi; ticari başarı garantisi yok.

Önemli: en1.py, en2.py, tr_list.json ve textures.js kaynak tesliminde eksik. Paket bu eksikleri gizlemez veya tahmini içerikle doldurmaz. Çalışan HTML ayrıca korunmuştur. Kaynak içindeki/ekli belgelerdeki önceki istemler referanstır; yeni kullanıcı talimatı yerine geçmez.

İlk hedef görsel yeniden yazım değil: build + mobil viewport + çevrimdışı bağımlılıklar; ardından ekran geçişleri ve güvenilir kayıt.
