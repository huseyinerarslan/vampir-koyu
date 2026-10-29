import {randomInt} from 'node:crypto';
const event=(id,title,text,choices)=>({id,title,text,choices:choices.map(([label,result],i)=>({id:String(i),label,result}))});
export const stories=[
 event('door','Üç vuruş','Kapına üç kez vuruldu. Ses kesildi; eşikte ince bir ışık var.',[
 ['Kapıyı arala','Eşikte içi boş bir fener buldun. Camı hâlâ sıcaktı.'],['Pencereden bak','Bahçe kapısı rüzgârda sallanıyor. Sokak bomboş.'],['Kim olduğunu sor','Cevap yerine uzaktan üç çan sesi geldi.'],['Sessizce bekle','Işık söndü. Sabah bakmak için eşiğe bir taş koydun.']]),
 event('mill','Değirmendeki ışık','Çalışmayan değirmenin üst katında bir ışık geziniyor.',[
 ['Patikaya yaklaş','Un çuvallarının yanında yeni yakılmış bir mum gördün.'],['Uzaktan say','Işık dört kez görünüp kayboldu; sonra karanlık çöktü.'],['Kapıya bir işaret çiz','Tebeşir izinin altında eskiden çizilmiş bir daire vardı.'],['Köye geri dön','Arkana baktığında ışık pencereye bırakılmıştı.']]),
 event('letter','Mühürlü mektup','Kapının altından mor mumla mühürlenmiş bir mektup bırakılmış.',[
 ['Mührü aç','İçinde tek cümle var: “Köy hatırladığından daha eski.”'],['Işığa tut','Kâğıdın içinde kurutulmuş bir papatyanın gölgesi belirdi.'],['Cebine koy','Mumu çatlatmadan mektubu sakladın. Kâğıt yağmur kokuyor.'],['Eşiğe geri bırak','Rüzgâr mektubu çevirdi. Arkasında bir kuyu çizimi var.']]),
 event('well','Kuyunun yankısı','Kuyudan su sesi yerine ince bir tıkırtı geliyor.',[
 ['Bir taş bırak','Taş suya değmeden tıkırtı kesildi. Derinliği anlayamadın.'],['İpi çek','Kovada su ve paslı, dişsiz bir anahtar buldun.'],['İçeri seslen','Kendi sesin beklediğinden çok daha geç geri döndü.'],['Kapağını ört','Kapağın iç yüzünde eski bir çocuk oyunu çiziliydi.']]),
 event('inn','Boş handaki masa','Han kapalı ama içeride iki fincan ve yeni kesilmiş ekmek var.',[
 ['Fincanlara bak','Birinin dibinde çay yapraklarıyla oluşmuş bir halka gördün.'],['Sandalyeye otur','Masa sallandı; ayağının altında katlanmış bir harita vardı.'],['Ocağı kontrol et','Közlerin arasında yanmamış bir defne yaprağı buldun.'],['Kapıya not bırak','“Sabah uğrayacağım” yazdın. Mürekkep nemde dağıldı.']]),
 event('bell','Eksik çan','Çan kulesi gece yarısını bir vuruş eksik çaldı.',[
 ['Merdivenleri çık','Son basamak kırık. Yukarıda ip kendi kendine sallanıyor.'],['Vuruşları not et','Defterine on bir çizgi çizdin; birini yanlış saymış olabilirsin.'],['Avluda bekle','Bir baykuş kuleden çıkınca zincirin sesi duyuldu.'],['Kulaklarını kapat','Sessizlikte cebindeki bozuk paranın yere düştüğünü duydun.']]),
 event('tracks','Çamurdaki izler','Yağmurdan sonra patikada birbirine dolanan izler belirdi.',[
 ['İzleri takip et','Patika dereye çıktı. Su, devamındaki bütün izleri silmiş.'],['Birini kopyala','Kâğıda çıkardığın izin kenarında kırık bir nal şekli var.'],['Üzerini ört','Bir dal parçasıyla toprağı düzelttin. Yağmur yeniden başladı.'],['Feneri yere tut','İz sandığın bazı çukurların su damlalarından oluştuğunu gördün.']]),
 event('market','Unutulmuş tezgâh','Meydandaki bir tezgâhta herkesin gittiği hâlde bir terazi duruyor.',[
 ['Kefeye taş koy','Boş görünen öteki kefe ağır bastı; altında kurşun vardı.'],['Çekmeceyi aç','Eski bir alışveriş listesinde yalnızca “tuz” yazıyor.'],['Üzerine örtü ser','Örtünün köşesine işlenmiş bir nar deseni gördün.'],['Fiyat etiketini çevir','Arkasında “yarın tekrar gel” yazıyordu.']]),
 event('orchard','Bahçedeki kurdele','Çıplak bir elma ağacına kırmızı bir kurdele bağlanmış.',[
 ['Düğümü çöz','Kurdeleden küçük bir pirinç zil düştü; sesi çıkmıyor.'],['Ağacın çevresini dolaş','Köklerin yanında yeni açmış tek bir çiçek gördün.'],['Yanına kendi ipini bağla','İki ip rüzgârda aynı yönde sallanmaya başladı.'],['Dokunmadan geç','Dalların gölgesi bir an için patikayı kapattı.']]),
 event('bridge','Köprünün altı','Tahta köprünün altından belli aralıklarla bir sürtünme sesi geliyor.',[
 ['Korkuluktan eğil','Suya takılmış boş bir sepet köprünün ayağına sürtünüyor.'],['Tahtaları say','Bir tahtanın diğerlerinden daha yeni olduğunu fark ettin.'],['Kıyıya in','Çamurda sepetten düşmüş mavi bir düğme buldun.'],['Köprüyü geç','Ses arkanda kaldı, ama cebindeki anahtar da aynı ritimde sallanıyor.']]),
 event('bakery','Gece ekmeği','Fırının bacası tütüyor. Kepenklerin arkasından tarçın kokusu geliyor.',[
 ['Kepenge vur','Bir kepçe yere düştü. Sonra yalnızca odun çıtırtısı duyuldu.'],['Arka kapıya bak','Soğumaya bırakılmış dört çöreğin üstünde aynı işaret vardı.'],['Bir not bırak','“Bir somun ayır” yazdın. Notunu bir taşla sabitledin.'],['Kokuyu takip et','Tarçın kokusunun fırından değil yanındaki sandıktan geldiğini anladın.']]),
 event('mirror','Örtülü ayna','Tavan arasında örtülü bir aynanın altından bir köşe parlıyor.',[
 ['Örtüyü kaldır','Aynada kendini ve arkandaki açık sandığı gördün.'],['Çerçeveyi incele','Ahşaba oyulmuş baş harfler yıllar önce zımparalanmış.'],['Sandığı kapat','İçerideki cam parçaları birbirine değip ince bir ses çıkardı.'],['Örtüyü düzelt','Tozun arasında bir el izi bıraktın; yanında eski bir iz daha var.']]),
 event('map','Yarım harita','Han duvarından sökülen sıvanın altında bir köy haritası göründü.',[
 ['Meydanı bul','Bugünkü çeşmenin yerinde küçük bir bahçe çizilmiş.'],['Haritayı kopyala','Bir sokağın adı kazınmış; yalnızca son iki harfi kalmış.'],['Eksik köşeyi ara','Kopan parça duvarın dibindeki çatlakta sıkışmış.'],['Üzerini koru','Yağmur girmesin diye önüne tahta dayadın.']]),
 event('fountain','Çeşmedeki para','Çeşmenin kuru yalağında tek bir parlak para duruyor.',[
 ['Parayı al','Paranın iki yüzünde de aynı solmuş çiçek kabartması var.'],['Yanına para bırak','İki para birbirine değince çeşmeden bir damla düştü.'],['Yalağı temizle','Yosunun altında yıllar önce kazınmış bir tarih gördün.'],['Olduğu yerde bırak','Ay buluta girince paranın parıltısı da kayboldu.']]),
 event('laundry','İpteki gölge','Çamaşır ipinde tek bir beyaz gömlek rüzgârsız havada kıpırdıyor.',[
 ['Mandala bak','Gömleğin içine saklanmış küçük bir kuş havalandı.'],['Gömleği indir','Cebinde kıvrılmış, boş bir kâğıt parçası buldun.'],['İpi gevşet','İp çatının oluğuna takılmış; su biriktikçe çekiliyormuş.'],['Uzaktan bekle','Bir damla gömleğin yakasından yere düştü.']]),
 event('station','Gelmemiş araba','Eski durakta yeni bir yolculuk levhası asılı: “Şafakta kalkar.”',[
 ['Levhanın arkasına bak','Arkasında silinmiş başka bir varış yeri vardı.'],['Bankta otur','Bankın arasından eski bir bilet çıktı; tarihi okunmuyor.'],['Yolu dinle','Tekerlek sesi sandığın şey uzak bir su çarkıydı.'],['Kalkış saatini yaz','Saatin yanına soru işareti koyup köye döndün.']]),
 event('lantern','Sönmeyen fener','Sokak başındaki fenerin camı kırık ama alevi titremiyor.',[
 ['Fitile yaklaş','Camın arkasında ikinci, küçük bir cam fanus varmış.'],['Direğe bak','Direkte her biri başka yıldan kalma çiviler gördün.'],['Altında bekle','Işıkta uçuşan toz, kısa süreliğine bir yol çizdi.'],['Yönünü değiştir','Feneri sokağa çevirdin. Eski bir kapı numarası aydınlandı.']]),
 event('library','Açık kitap','Okuma odasında bir kitap rüzgârla aynı sayfaya dönüyor.',[
 ['Sayfayı oku','Metin, köyün ilk kuyusunu açan isimsiz bir ustayı anlatıyor.'],['Arasına ayraç koy','Ayraç koyunca sayfanın kenarındaki gizli çizimi fark ettin.'],['Kitabı kapat','Kapağın altında kurumuş bir yaprak kırıldı.'],['Pencereyi ört','Rüzgâr kesildi. Kitap artık kapandığı sayfada kaldı.']]),
 event('chest','Kilitsiz sandık','Ahırda kilidi açık bir sandık var. İçinden hafif bir çıngırak duyuluyor.',[
 ['Kapağı kaldır','İçinde eski oyuncaklar ve boynunda zil olan tahta bir at buldun.'],['Sandığı oynat','Altında saklanmış bir düğme yuvarlandı.'],['Üstünü sil','Tozun altında küçük bir güneş deseni ortaya çıktı.'],['Kapağı kapat','Çıngırak durdu. Sandığın menteşesi uzun uzun gıcırdadı.']]),
 event('river','Deredeki ışık','Derenin kıvrımında suyun üzerinde küçük ışıklar süzülüyor.',[
 ['Kıyıdan izle','Işıkların akıntıya bırakılmış mumlar olduğunu gördün.'],['Bir dal uzat','Dala takılan mumun tabanında balmumundan bir çiçek var.'],['Yukarı yürüyüşe çık','Kıyıda boş bir kutu ve nemli kibritler buldun.'],['Kendi dileğini fısılda','Su bir taşı aşıp sesini geri yuttu.']]),
 event('tailor','Terzinin iğnesi','Terzinin vitrininin önünde yere düşmüş gümüş bir iğne parlıyor.',[
 ['İğneyi kaldır','Ucunda koyu renkli, sıradan bir kumaş lifi var.'],['Kapıya bırak','İğneyi eşikteki dikiş kutusuna koydun.'],['Vitrine bak','Bir ceketin bütün düğmeleri farklı renkte dikilmiş.'],['Yanına işaret koy','Bir tebeşir halkası çizdin; sabah bulunması kolay olacak.']]),
 event('clock','Geri kalan saat','Meydandaki saat seninkinden yedi dakika geride.',[
 ['Kendi saatini ayarla','İki saati aynı yaptın. Çanın hangi saate göre çaldığı belirsiz.'],['Kuleyi dinle','Mekanizma iki tıkta bir duraksıyor.'],['Farkı not et','Defterine yedi küçük nokta koydun.'],['Saate dokunma','Bulutlar açılınca kadrandaki çatlağı gördün.']]),
 event('portrait','Duvardaki portre','Han koridorundaki eski portrenin yüzü duvara çevrilmiş.',[
 ['Portreyi çevir','Resimde kimsenin tanımadığı bir bahçıvan ve bir nar ağacı var.'],['Arkasını oku','Tuvalin arkasında “eve dönüş” yazıyor.'],['Çiviyi düzelt','Çerçeve yeniden yerine oturdu; içinden bir kâğıt kaydı.'],['Olduğu gibi bırak','Yanından geçerken çerçevenin duvara vurduğunu duydun.']]),
 event('snow','Soğuk eşik','Hava ılık ama kapının önündeki taş buz gibi.',[
 ['Taşı kaldır','Altındaki dar kanaldan soğuk kaynak suyu akıyor.'],['Elini üzerinde tut','Taşın bir tarafının diğerinden daha soğuk olduğunu fark ettin.'],['Üzerine yaprak bırak','Yaprak nemden taşa yapıştı.'],['İçeri dön','Ayakkabının tabanı ıslak taşta ince bir iz bıraktı.']]),
 event('rooftop','Çatıdaki tıkırtı','Çatıda bir şey düzenli aralıklarla yuvarlanıyor.',[
 ['Merdivene çık','Bir ceviz oluğun içinde ileri geri gidiyor.'],['Avluya bak','Ağaçtan yeni düşmüş üç ceviz daha buldun.'],['Çatıya seslen','Tıkırtı durdu; az sonra yağmur başladı.'],['Altına kova koy','Bir süre sonra kovaya küçük bir dal düştü.']]),
 event('garden','Açık bahçe kapısı','Terk edilmiş bahçenin kapısı bu gece ilk kez açık.',[
 ['İçeri adım at','Otların arasında hâlâ temiz bir taş yol var.'],['Kapıyı yağla','Gıcırtı kesilince uzaktan cırcır böceklerini duydun.'],['Çite bak','Birinin yıllar önce bağladığı kumaş parçası iyice solmuş.'],['Kapıyı kapat','Mandal yerine oturdu; rüzgâr artık kapıyı oynatmıyor.']]),
 event('music','Yarım kalan ezgi','Boş meydandan üç notalık bir ezgi duyuluyor; dördüncüsü gelmiyor.',[
 ['Ezginin devamını mırıldan','Kendi sesinden sonra meydan yeniden sessizleşti.'],['Sesi takip et','Rüzgâr, kırık bir şişenin ağzından geçiyor.'],['Notaları yaz','Üç çizgi çizdin; melodiyi sabah hatırlamayı umuyorsun.'],['Pencereyi kapat','Ses zayıfladı ama ritmini bir süre daha hatırladın.']]),
 event('smith','Soğuk örs','Demircinin dükkânında örsün üstünde katlanmış bir bez var.',[
 ['Bezi kaldır','Bez bir at nalını örtüyormuş; nalın bir deliği eksik.'],['Ocağa bak','Küllerde küçük bir yıldız şekli kalmış.'],['Kapıyı sabitle','Kapı rüzgârda çarpmayı bıraktı.'],['Bezi düzelt','Kenarına işlenmiş bir baş harf gördün ama tamamı sökülmüş.']]),
 event('jar','Etiketsiz kavanoz','Rafın arkasında etiketi düşmüş, içi kokulu bir kavanoz buldun.',[
 ['Kapağı arala','İçinden kurutulmuş lavanta kokusu yayıldı.'],['Etiketi ara','Rafın altında yalnızca “yaz” kelimesi kalmış bir etiket var.'],['Işığa tut','Camın dibinde saklı mavi bir boncuk gördün.'],['Rafa geri koy','Kavanozun izi raftaki tozda belirgin bir halka bıraktı.']]),
 event('kite','Gece uçurtması','Bir uçurtma kilisenin yanındaki ağaca takılmış; kuyruğu yere uzanıyor.',[
 ['İpini çöz','Kuyruğa bağlanmış küçük bir dilek kâğıdı buldun.'],['Dileği oku','Kâğıtta “bu yaz da burada olalım” yazıyor.'],['Dalı salla','Uçurtma kurtuldu, ama ipi avlunun öbür ucuna dolandı.'],['Sabaha bırak','İpi kimse takılmasın diye ağacın dibine sardın.']]),
 event('stairs','On üçüncü basamak','Mahzenin merdiveninde bir basamak diğerlerinden farklı ses çıkarıyor.',[
 ['Basamağı yokla','Ahşap gevşemiş. Altında yalnızca kuru toprak var.'],['Basamakları say','İnerken on üç, çıkarken on iki saydın; baştan saymak gerek.'],['Feneri yaklaştır','Tahtaya kazınmış eski bir boy ölçüsü gördün.'],['Bir işaret bırak','Gevşek basamağa kimse basmasın diye üstüne bez koydun.']]),
 event('chess','Bitmemiş oyun','Han köşesinde bir oyun tahtası açık kalmış; tek taş ters duruyor.',[
 ['Taşı düzelt','Altında küçük bir kâğıt var: “Sıra sende.”'],['Oyunu incele','İki tarafın da birer taşı eksik. Oyunun nasıl bittiği belli değil.'],['Tahtayı kapat','Taşlar kutuda birbirine çarptı.'],['Yanına sandalye çek','Sabah birinin gelip oyunu anlatmasını beklemek istedin.']])
];
export function storyDeck(exclude=[]){const recent=new Set(exclude);const deck=stories.map(s=>s.id);for(let i=deck.length-1;i>0;i--){const j=randomInt(i+1);[deck[i],deck[j]]=[deck[j],deck[i]];}return [...deck.filter(id=>!recent.has(id)),...deck.filter(id=>recent.has(id))];}
export function assignStory(p,round){if(!p.storyDeck?.length)p.storyDeck=storyDeck((p.journal||[]).slice(-6).map(s=>s.id));p.story={id:p.storyDeck.shift(),round,choice:null};}
export function chooseStory(p,id,choice){if(p.story?.id!==id)throw Error('Bu hikâye artık geçerli değil.');if(p.story.choice!==null)throw Error('Bu geceki hikâyeni zaten seçtin.');const e=stories.find(s=>s.id===id),c=e?.choices.find(c=>c.id===choice);if(!c)throw Error('Geçersiz hikâye seçimi.');p.story.choice=c.id;p.journal??=[];p.journal.push({id:e.id,round:p.story.round,title:e.title,label:c.label,result:c.result});p.journal=p.journal.slice(-64);}
export function storyView(p){const e=stories.find(s=>s.id===p.story?.id);if(!e)return null;const c=e.choices.find(c=>c.id===p.story.choice);return {id:e.id,round:p.story.round,title:e.title,text:e.text,choices:e.choices.map(c=>({id:c.id,label:c.label})),selected:p.story.choice,result:c?.result||null};}
