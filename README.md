# Vampir Köyü

Mobil öncelikli, gerçek zamanlı Türkçe sosyal çıkarım oyunu. Node.js 22+ dışında bağımlılık gerektirmez.

## Çalıştırma

`node server.js` komutuyla başlatın. Bilgisayarda `http://localhost:3000`, aynı Wi-Fi üzerindeki telefonlarda `http://BILGISAYARIN_YEREL_IP_ADRESI:3000` adresini açın. Gerekirse güvenlik duvarında yalnızca özel ağ için izin verin. Her oyuncu ayrı cihaz veya tarayıcı profili kullanmalıdır; aynı tarayıcı profilindeki sekmeler aynı oyuncu oturumunu paylaşır.

## Oyun

4–16 oyuncu. Oda sahibi 60/90/120/180 saniyelik tartışma süresi seçer. Her 5 oyuncu için bir vampir (en az 1), bir doktor, bir kâhin; kalanlar köylüdür. Roller sunucuda güvenli rastgele dağıtılır. Oyun 12 saniyelik rol öğrenme aşamasıyla başlar.

Gece 60 saniyedir: vampirler ortak hedef için gizli seçim yapar, doktor korur (kendini seçebilir), kâhin araştırır, köylü kamuflaj seçer. Herkes seçerse gece erken tamamlanır. Vampir oylarında beraberlikte av olmaz. Süresi dolan eksik seçimler etkisiz kalır. Ölen kâhinin o geceki araştırması kendi ekranında görünür.

Sabah sonucu → tartışma → 45 saniye gizli oylama → eleme → yeni gece. Herkes oy verirse oylama erken tamamlanır. Beraberlikte veya tüm oylar çekimserse kimse elenmez. Süresinde oy vermeyenler çekimser sayılır. Elenenler izler. Oda sahibi yalnızca rol gösterimi ve sonuç ekranlarını erken geçebilir; geceyi ve gizli oylamayı zorla bitiremez.

Son vampir elenirse köy kazanır. Vampirlerin sayısı diğer yaşayanların sayısına eşit veya fazla olduğunda vampirler kazanır. Oyun sonunda tüm roller açılır. Aynı grupla yeniden oynanabilir.

## Mimari ve sınırlar

Sunucu otoriter HTTP + Server-Sent Events kullanır. İstemciye yalnızca kendi rolü ve kendi özel araştırması gönderilir; vampirler takım arkadaşlarını görebilir. Gizli seçimler ve oylar sunucuda tutulur. Rastgele oturum çerezi HttpOnly/SameSite=Strict, HTTPS proxy arkasında Secure kullanır. Sayfa yenileme ve kısa bağlantı kopmalarında oturum korunur.

V1 tek sunucu sürecinde bellekte çalışır. Sunucu yeniden başlatılırsa odalar kaybolur. Çoklu sunucu ölçeklemesi desteklenmez. Odalar 24 saat işlem görmeyince temizlenir. Bağlantısı kopan oyuncu hayatta kalır; süre dolunca seçimsiz devam edilir. Oda sahibi devri yoktur; fakat oyun aşamaları otomatik ilerler. Sohbet/sesli görüşme dahil değildir: aynı masada veya ayrı bir sesli aramada konuşun. Rekabetçi ölçekte kötüye kullanım koruması ve kalıcı depolama ileriki sürüm işidir.

## Doğrulama

## Sinematik arayüz güncellemesi

Kırmızı ay, yıldızlar, sis ve hafif köz animasyonları; gündüz/gece atmosferi, aşama şeridi ve son 10 saniye uyarısı eklendi. Efektler başlıktaki düğmeyle kapatılabilir. Azaltılmış hareket tercihi otomatik uygulanır. Rol kartı 8 saniye sonra, aşama değişince veya sayfa arka plana alınınca gizlenir. Lobi davet bağlantısı `?oda=KOD` biçimindedir; katılma formunu otomatik doldurur. Oyuncunun mevcut oturumu varsa önce mevcut odasını gösterir.

`node --test` — rol gizliliği, host yetkisi, tüm oyuncu sayıları, koruma/araştırma, gizli oylama, beraberlik, kazanma, döngü, HTTP oturumu ve SSE testleri.

## Render

Tek bir Node web service: build `node --version`, start `node server.js`, health `/health`, port Render'ın `PORT` değişkeninden alınır. Ek veri tabanı veya ücretli kaynak zorunlu değildir. Render yeniden başlatmaları/uyku durumları odaları sıfırlar; devam eden oyunlar için sürekli çalışan bir hizmet gerekir.
