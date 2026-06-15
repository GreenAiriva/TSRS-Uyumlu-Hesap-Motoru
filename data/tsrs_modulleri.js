/* ============================================================
   TSRS AÇIKLAMA MODÜLLERİ — FORM ALANI TANIMLARI
   ------------------------------------------------------------
   Excel'deki 10 nitel TSRS sayfasının karşılığı. Her modülün
   form alanları ve tablo sütunları BURADA tanımlıdır; uygulama
   formları bu tanımlardan otomatik üretir.
   Yani: buraya alan eklerseniz, ekranda yeni form alanı belirir.
   NASIL DÜZENLENİR?
   • En kolay yol: Yönetim Paneli → "Form Alanları" sekmesi.
   • tip seçenekleri: "metin", "uzun_metin", "sayi", "tarih",
     "secim" (secim ise "liste" özelliği bir liste adı veya
     ["Seçenek 1","Seçenek 2"] biçiminde olmalıdır).
   ============================================================ */
window.VERI = window.VERI || {};
VERI.tsrs_modulleri = [
 {
  "id": "yonetisim",
  "baslik": "Yönetişim Açıklamaları",
  "referans": "TSRS 1 md. 26-27 (sürdürülebilirlik) • TSRS 2 md. 5-7 (iklim)",
  "aciklama": "Yönetişim açıklamaları iki kapsamda ayrı verilir: (1) Sürdürülebilirlik — tüm sürdürülebilirlikle ilgili risk ve fırsatların gözetimi (TSRS 1); (2) İklim — özel olarak iklimle ilgili risk ve fırsatların gözetimi (TSRS 2). Aynı organ her ikisini de gözetebilir; yine de her iki kapsam için ayrı açıklama beklenir.",
  "gruplar": [
   {"id": "surdurulebilirlik", "baslik": "Sürdürülebilirlik Yönetişimi", "referans": "TSRS 1 md. 26-27 — sürdürülebilirlikle ilgili risk ve fırsatlar"},
   {"id": "iklim", "baslik": "İklim Yönetişimi", "referans": "TSRS 2 md. 5-7 — iklimle ilgili risk ve fırsatlar"}
  ],
  "tablo": {
   "etiket": "Gözetimden sorumlu organlar ve kişiler",
   "sutunlar": [
    {"anahtar": "organ", "etiket": "Organ / Kişi Adı", "tip": "metin"},
    {"anahtar": "kapsam", "etiket": "Kapsam", "tip": "secim", "liste": ["Sürdürülebilirlik", "İklim", "Her ikisi"]},
    {"anahtar": "tur", "etiket": "Tür", "tip": "secim", "liste": "organ_turu"},
    {"anahtar": "rapor_merci", "etiket": "Raporladığı Merci", "tip": "metin"},
    {"anahtar": "toplanti", "etiket": "Toplantı Sıklığı", "tip": "secim", "liste": ["Aylık", "Üç Aylık", "Altı Aylık", "Yıllık", "Gerektiğinde"]},
    {"anahtar": "bilgilendirme", "etiket": "Bilgilendirme Sıklığı", "tip": "secim", "liste": ["Her toplantıda", "Üç Aylık", "Altı Aylık", "Yıllık"]},
    {"anahtar": "uzman", "etiket": "Uzman Üye", "tip": "sayi"},
    {"anahtar": "toplam_uye", "etiket": "Toplam Üye", "tip": "sayi"},
    {"anahtar": "yetki_ref", "etiket": "Yetki Belgesi Ref.", "tip": "metin"},
    {"anahtar": "not", "etiket": "Notlar", "tip": "metin"}
   ]
  },
  "anlatilar": [
   {"anahtar": "s_sorumluluk", "grup": "surdurulebilirlik", "etiket": "Sorumlulukların görev tanımlarına yansıtılması", "yardim": "**TSRS 1 md. 27(a)(i)** — Standart, sürdürülebilirlik gözetiminden sorumlu organ(lar)ın bu sorumluluğunun yönetmelik, görev tanımı, kurul/komite tüzüğü veya benzeri belgelere nasıl yansıtıldığının açıklanmasını ister. NEDEN: Yatırımcı, sürdürülebilirliğin şirkette kimin resmi sorumluluğunda olduğunu ve bunun kağıt üzerinde değil gerçekten kurumsal yapıya işlenip işlenmediğini görmek ister. Örn. '… Kurumsal Yönetişim Komitesi tüzüğü md. X ile görevlendirilmiştir.'"},
   {"anahtar": "s_yetkinlik", "grup": "surdurulebilirlik", "etiket": "Yetkinliklerin belirlenmesi ve geliştirilmesi", "yardim": "**TSRS 1 md. 27(a)(ii)** — Organın uygun beceri ve yetkinliklere sahip olduğundan nasıl emin olunduğunun açıklanması. NEDEN: Gözetimin nitelikli olması için organın sürdürülebilirlik konularını anlama kapasitesi gerekir. Örn. eğitim programları, dış danışmanlık, konuya hâkim üye atama."},
   {"anahtar": "s_bilgilendirme_sureci", "grup": "surdurulebilirlik", "etiket": "Organın bilgilendirilme süreci", "yardim": "**TSRS 1 md. 27(a)(iii)** — Organın sürdürülebilirlik risk ve fırsatları hakkında hangi süreçle ve hangi sıklıkla bilgilendirildiğinin açıklanması. NEDEN: Gözetimin etkinliği, organa doğru ve zamanında bilgi akışına bağlıdır. Örn. 'Üç ayda bir yönetim raporu sunulur.'"},
   {"anahtar": "s_strateji_gozetim", "grup": "surdurulebilirlik", "etiket": "Strateji ve büyük işlem kararlarında gözetim", "yardim": "**TSRS 1 md. 27(a)(iv)** — Organın strateji, büyük işlemler (yatırım, devralma vb.) ve risk yönetimi süreçlerini gözetirken sürdürülebilirlik risk/fırsatlarını nasıl dikkate aldığı. NEDEN: Sürdürülebilirliğin stratejik kararlara gerçekten entegre edilip edilmediğini gösterir."},
   {"anahtar": "s_hedef_gozetim", "grup": "surdurulebilirlik", "etiket": "Hedef belirleme ve ilerlemenin gözetimi", "yardim": "**TSRS 1 md. 27(a)(v)** — Organın sürdürülebilirlik hedeflerinin belirlenmesini ve bu hedeflere ilişkin ilerlemeyi nasıl gözettiği; ilgili performans ölçütlerinin hedeflere dahil edilip edilmediği. NEDEN: Hedeflerin denetlendiğini ve sorumluluğun takip edildiğini kanıtlar."},
   {"anahtar": "s_yonetim_rolu", "grup": "surdurulebilirlik", "etiket": "Yönetimin rolü ve devredilen yetkiler", "yardim": "**TSRS 1 md. 27(b)** — Yönetimin (icra kademesinin) sürdürülebilirlik risk/fırsatlarını değerlendirme ve yönetmedeki rolü; bu rolün belirli pozisyonlara/komitelere devredilip devredilmediği ve kullanılan kontroller/prosedürler. NEDEN: Günlük yönetimde sürdürülebilirliğin kim tarafından ve nasıl yürütüldüğünü netleştirir."},
   {"anahtar": "i_sorumluluk", "grup": "iklim", "etiket": "Sorumlulukların görev tanımlarına yansıtılması", "yardim": "**TSRS 2 md. 6(a)(i)** — TSRS 1 md. 27(a)(i)'nin iklime özel karşılığı. İklimle ilgili risk ve fırsatların gözetiminden sorumlu organ(lar)ın bu sorumluluğunun görev tanımı, tüzük ve politikalara nasıl yansıtıldığı. NEDEN: İklim, sürdürülebilirliğin alt kümesi olsa da TSRS 2 ayrıca raporlanmasını ister; iklim sorumlusunun açıkça tanımlanması beklenir."},
   {"anahtar": "i_yetkinlik", "grup": "iklim", "etiket": "Yetkinliklerin belirlenmesi ve geliştirilmesi", "yardim": "**TSRS 2 md. 6(a)(ii)** — Organın iklim konularında (geçiş riskleri, fiziksel riskler, senaryo analizi vb.) uygun yetkinliğe sahip olduğundan nasıl emin olunduğu. NEDEN: İklim teknik bir alandır; gözetimin niteliği organın bu konudaki bilgisine bağlıdır."},
   {"anahtar": "i_bilgilendirme_sureci", "grup": "iklim", "etiket": "Organın bilgilendirilme süreci", "yardim": "**TSRS 2 md. 6(a)(iii)** — Organın iklim risk ve fırsatları hakkında hangi süreçle ve sıklıkla bilgilendirildiği. NEDEN: İklim verilerinin (emisyon, hedef ilerlemesi, senaryo sonuçları) organa düzenli ulaştığını gösterir."},
   {"anahtar": "i_strateji_gozetim", "grup": "iklim", "etiket": "Strateji ve büyük işlem kararlarında iklim gözetimi", "yardim": "**TSRS 2 md. 6(a)(iv)** — Organın strateji, büyük işlemler ve risk yönetimini gözetirken iklim risk/fırsatlarını nasıl dikkate aldığı; iklimle ilgili ödünleşimleri (trade-off) değerlendirip değerlendirmediği. NEDEN: İklimin sermaye tahsisi gibi kararlara entegre edildiğini gösterir."},
   {"anahtar": "i_hedef_gozetim", "grup": "iklim", "etiket": "Hedef belirleme ve ilerlemenin gözetimi", "yardim": "**TSRS 2 md. 6(a)(v)** — Organın iklim hedeflerinin (örn. emisyon azaltımı) belirlenmesini ve ilerlemeyi nasıl gözettiği. NEDEN: Net sıfır/azaltım taahhütlerinin denetlendiğini kanıtlar."},
   {"anahtar": "i_ucretlendirme", "grup": "iklim", "etiket": "Ücretlendirme bağlantısı", "yardim": "**TSRS 2 md. 6(a)(v) son cümle / md. 29(g)** — Yönetici ücretlendirmesinin iklim performansına bağlanıp bağlanmadığı ve nasıl. NEDEN: Teşviklerin iklim hedefleriyle hizalanması, taahhütlerin ciddiyetinin göstergesidir. Bağlantı yoksa bunu da belirtin."},
   {"anahtar": "i_yonetim_rolu", "grup": "iklim", "etiket": "Yönetimin rolü ve devredilen yetkiler", "yardim": "**TSRS 2 md. 6(b)** — Yönetimin iklim risk/fırsatlarını değerlendirme/yönetmedeki rolü, bu rolün belirli pozisyon veya komitelere devredilip devredilmediği ve kullanılan kontroller. NEDEN: İklimin günlük operasyonel yönetimde kim tarafından yürütüldüğünü netleştirir."}
  ]
 },
 {
  "id": "risk_firsat",
  "baslik": "Risk ve Fırsatlar",
  "referans": "TSRS 1 md. 30 (sürdürülebilirlik) • TSRS 2 md. 9-13 (iklim)",
  "aciklama": "İşletmeyi makul olarak etkileyebilecek risk ve fırsatlar iki kapsamda ayrı kaydedilir: (1) Sürdürülebilirlik — tüm sürdürülebilirlikle ilgili risk ve fırsatlar (TSRS 1 md. 30); (2) İklim — özel olarak iklimle ilgili fiziksel ve geçiş riskleri ile fırsatlar (TSRS 2 md. 9-13). Her satır tek bir risk veya fırsattır; risk skoru (olasılık × etki) otomatik hesaplanır.",
  "gruplar": [
   {"id": "surdurulebilirlik", "baslik": "Sürdürülebilirlik Risk ve Fırsatları", "referans": "TSRS 1 md. 30 — finansal yeterliliği etkilemesi beklenen sürdürülebilirlik risk ve fırsatları"},
   {"id": "iklim", "baslik": "İklim Risk ve Fırsatları", "referans": "TSRS 2 md. 9-13 — fiziksel ve geçiş riskleri ile iklim fırsatları"}
  ],
  "tablo": {
   "etiket": "Risk ve fırsat kaydı",
   "sutunlar": [
    {"anahtar": "kapsam", "etiket": "Kapsam", "tip": "secim", "liste": ["Sürdürülebilirlik (TSRS 1)", "İklim (TSRS 2)"], "yardim": "Bu kalem hangi standart kapsamında raporlanıyor? Sürdürülebilirlik genel kapsam (TSRS 1 md. 30), İklim ise özel iklim kapsamıdır (TSRS 2). Sayfadaki alt başlıklara göre ayrışır."},
    {"anahtar": "rid", "etiket": "ID (Kısa Kod)", "tip": "metin", "yardim": "Bu kalemi izlemek için verdiğiniz kısa benzersiz kod (örn. R-01, F-03). Strateji ve diğer sayfalarda bu kalemi referans verirken kullanılır."},
    {"anahtar": "risk_firsat", "etiket": "Risk mi, Fırsat mı?", "tip": "secim", "liste": ["Risk", "Fırsat"], "yardim": "Bu kalem işletme için olumsuz bir tehdit mi (risk) yoksa olumlu bir imkan mı (fırsat)? TSRS her ikisini de raporlamayı ister."},
    {"anahtar": "baslik", "etiket": "Başlık / Tanım", "tip": "metin", "yardim": "Risk veya fırsatın kısa adı (örn. 'Karbon vergisi maliyet artışı', 'Su kıtlığı üretim riski'). Ne olduğunu bir bakışta anlatan başlık."},
    {"anahtar": "tur", "etiket": "Risk Türü (Fiziksel / Geçiş)", "tip": "secim", "liste": "risk_turu", "yardim": "TSRS 2 md. 10(b): Her iklim riski fiziksel risk (akut/kronik iklim olayları — sel, kuraklık, sıcaklık) mi yoksa geçiş riski (politika, teknoloji, pazar, itibar değişimi) mi? Fırsatlar için boş bırakılabilir."},
    {"anahtar": "zaman", "etiket": "Zaman Dilimi", "tip": "secim", "liste": "zaman_dilimi", "yardim": "TSRS 2 md. 10(c): Bu kalemin etkisinin gerçekleşmesi ne zaman bekleniyor? Kısa / orta / uzun vade (tanımları aşağıdaki alt bölümde belirtilir)."},
    {"anahtar": "olasilik", "etiket": "Olasılık (1-5)", "tip": "sayi", "yardim": "Bu etkinin gerçekleşme olasılığı: 1 = çok düşük, 5 = çok yüksek. Etki ile çarpılarak önem skoru hesaplanır."},
    {"anahtar": "etki", "etiket": "Etki Büyüklüğü (1-5)", "tip": "sayi", "yardim": "Gerçekleşirse işletmeye etkisinin büyüklüğü: 1 = çok küçük, 5 = çok büyük. Finansal ve operasyonel önemi yansıtır."},
    {"anahtar": "konum", "etiket": "Değer Zinciri Konumu", "tip": "secim", "liste": "deger_zinciri_konumu", "yardim": "TSRS 2 md. 10: Bu risk/fırsat değer zincirinin neresinde yoğunlaşıyor? Kendi operasyonlarınız (doğrudan), yukarı akış (tedarikçiler) ya da aşağı akış (müşteriler/ürün kullanımı)."},
    {"anahtar": "tutar", "etiket": "Niceliksel Etki (Bin TL)", "tip": "sayi", "yardim": "Tahmin edilebiliyorsa etkinin parasal büyüklüğü (bin TL). Zorunlu değil; bilinmiyorsa boş bırakın, anlatı açıklamada niteliksel olarak belirtin."},
    {"anahtar": "aciklama", "etiket": "Ayrıntılı Açıklama", "tip": "uzun_metin", "yardim": "Bu risk/fırsatın nasıl ortaya çıktığı, işletmeyi hangi mekanizmayla etkilediği ve varsa alınan önlemler. Raporda bu metin kullanılır."}
   ]
  },
  "anlatilar": [
   {"anahtar": "s_tanim", "grup": "surdurulebilirlik", "etiket": "Sürdürülebilirlik risk ve fırsatlarının genel açıklaması", "yardim": "**TSRS 1 md. 30** — İşletmenin finansal yeterliliğini (nakit akışları, finansmana erişim, sermaye maliyeti) kısa, orta veya uzun vadede etkilemesi makul ölçüde beklenebilecek tüm sürdürülebilirlik (çevresel, sosyal, yönetişim) risk ve fırsatlarının genel özeti. NEDEN: Bu, tüm strateji bölümünün temelidir; yatırımcı şirketi neyin etkileyebileceğini buradan görür. Aşağıdaki tabloya tek tek girdiğiniz kalemlerin özetini burada anlatın."},
   {"anahtar": "s_kisa_vade", "grup": "surdurulebilirlik", "etiket": "Kısa vade tanımı ve gerekçesi", "yardim": "**TSRS 1 md. 30** — Şirketinizin 'kısa vade' olarak hangi süreyi kabul ettiği (örn. 0-3 yıl) ve bunun stratejik planlama döneminizle bağlantısı. NEDEN: Tablodaki 'Zaman Dilimi' seçimlerinin ne anlama geldiğini okuyucu için tanımlar; vade tanımları şirkete özgüdür."},
   {"anahtar": "s_orta_vade", "grup": "surdurulebilirlik", "etiket": "Orta vade tanımı ve gerekçesi", "yardim": "**TSRS 1 md. 30** — 'Orta vade' olarak kabul ettiğiniz süre (örn. 3-10 yıl) ve gerekçesi. NEDEN: Zaman dilimi tutarlılığı için; planlama ufkunuzla hizalı olmalı."},
   {"anahtar": "s_uzun_vade", "grup": "surdurulebilirlik", "etiket": "Uzun vade tanımı ve gerekçesi", "yardim": "**TSRS 1 md. 30** — 'Uzun vade' olarak kabul ettiğiniz süre (örn. 10+ yıl) ve gerekçesi. NEDEN: Uzun vadeli sürdürülebilirlik risklerinin (örn. kaynak tükenmesi) hangi ufukta değerlendirildiğini netleştirir."},
   {"anahtar": "i_tanim", "grup": "iklim", "etiket": "İklim risk ve fırsatlarının genel açıklaması", "yardim": "**TSRS 2 md. 10(a)** — Finansal yeterliliği etkilemesi makul ölçüde beklenebilecek iklimle ilgili risk ve fırsatların tanımlanması ve genel özeti. NEDEN: TSRS 2'nin tüm strateji analizinin çıkış noktası; fiziksel (sel, kuraklık) ve geçiş (karbon fiyatı, talep düşüşü) risklerini kapsar. Madencilikte ruhsat/rezerv ömrü bu değerlendirmeyi özellikle etkiler."},
   {"anahtar": "i_kisa_vade", "grup": "iklim", "etiket": "Kısa vade tanımı ve gerekçesi", "yardim": "**TSRS 2 md. 10(d)** — Şirketin 'kısa vade' tanımı (örn. 0-3 yıl) ve stratejik karar alma planlama dönemleriyle bağlantısı. NEDEN: TSRS 2, vade tanımlarının açıklanmasını ve planlama dönemleriyle ilişkilendirilmesini açıkça zorunlu kılar."},
   {"anahtar": "i_orta_vade", "grup": "iklim", "etiket": "Orta vade tanımı ve gerekçesi", "yardim": "**TSRS 2 md. 10(d)** — 'Orta vade' tanımı (örn. 3-10 yıl) ve gerekçesi. NEDEN: İklim etkilerinin çoğu orta-uzun vadede gerçekleşir; tanım okuyucu için zorunludur."},
   {"anahtar": "i_uzun_vade", "grup": "iklim", "etiket": "Uzun vade tanımı ve gerekçesi", "yardim": "**TSRS 2 md. 10(d)** — 'Uzun vade' tanımı (örn. 10+ yıl); madencilikte rezerv/ruhsat ömrüyle ilişkilendirilebilir. NEDEN: Paris uyumlu senaryoların ufku (2050) genellikle uzun vadeye düşer; tanım dirençlilik analiziyle tutarlı olmalıdır."}
  ]
 },
 {
  "id": "strateji",
  "baslik": "Strateji ve Karar Alma",
  "referans": "TSRS 1 md. 28-40 (sürdürülebilirlik) • TSRS 2 md. 8-21 (iklim)",
  "aciklama": "Risk ve fırsatların iş modeli, değer zinciri, strateji ve finansal durum üzerindeki etkileri iki kapsamda ayrı açıklanır: (1) Sürdürülebilirlik (TSRS 1 md. 28-40); (2) İklim (TSRS 2 md. 8-21). Her iki standart benzer başlıkları (iş modeli/değer zinciri, strateji, finansal etkiler) ister; iklim tarafında ek olarak geçiş planı bulunur. Aşağıdaki tabloya her etkiyi kapsamını seçerek girin; anlatılar alt başlıklara ayrılmıştır.",
  "gruplar": [
   {"id": "surdurulebilirlik", "baslik": "Sürdürülebilirlik Stratejisi", "referans": "TSRS 1 md. 28-40 — sürdürülebilirlik risk/fırsatlarının strateji ve finansal duruma etkileri"},
   {"id": "iklim", "baslik": "İklim Stratejisi", "referans": "TSRS 2 md. 13-21 — iklim risk/fırsatlarının strateji, geçiş planı ve finansal duruma etkileri"}
  ],
  "tablo": {
   "etiket": "İş modeli ve değer zinciri etkileri",
   "sutunlar": [
    {"anahtar": "kapsam", "etiket": "Kapsam", "tip": "secim", "liste": ["Sürdürülebilirlik (TSRS 1)", "İklim (TSRS 2)"], "yardim": "Bu etki sürdürülebilirlik genel kapsamında mı (TSRS 1 md. 32) yoksa özel iklim kapsamında mı (TSRS 2 md. 13) raporlanıyor?"},
    {"anahtar": "alan", "etiket": "İş Modeli / Değer Zinciri Alanı", "tip": "secim", "liste": ["Operasyonlar / Üretim", "Girdiler / Hammaddeler", "Lojistik", "Satış Kanalları", "İnsan Kaynakları", "Finansman", "Diğer"], "yardim": "Risk/fırsatın iş modelinin veya değer zincirinin hangi bölümünü etkilediği. Örn. üretim, hammadde tedariki, lojistik."},
    {"anahtar": "etki", "etiket": "Etkinin Açıklaması", "tip": "uzun_metin", "yardim": "Seçtiğiniz alanın nasıl etkilendiği. Örn. 'Kuraklık nedeniyle su temininde maliyet artışı ve üretim duruş riski.'"},
    {"anahtar": "risk_id", "etiket": "Bağlı Risk/Fırsat ID", "tip": "metin", "yardim": "Bu etkinin kaynağı olan risk/fırsat kalemi (Risk ve Fırsatlar sayfasındaki ID, örn. R-01). Kalemleri birbirine bağlar."},
    {"anahtar": "zaman", "etiket": "Zaman Dilimi", "tip": "secim", "liste": "zaman_dilimi", "yardim": "Bu etkinin ne zaman ortaya çıkması bekleniyor: kısa / orta / uzun vade."},
    {"anahtar": "yon", "etiket": "Etki Yönü", "tip": "secim", "liste": "etki_yonu", "yardim": "İşletme için olumlu (fırsat) mu yoksa olumsuz (tehdit) bir etki mi?"}
   ]
  },
  "anlatilar": [
   {"anahtar": "s_strateji_etki", "grup": "surdurulebilirlik", "etiket": "Strateji ve karar almaya etkiler", "yardim": "**TSRS 1 md. 33-34** — Sürdürülebilirlik risk ve fırsatlarına yanıt olarak iş modelinde, stratejide ve kaynak dağılımında yapılan veya planlanan değişiklikler. NEDEN: Yatırımcı, şirketin riskleri yalnızca tanımlamakla kalmayıp bunlara stratejik olarak nasıl yanıt verdiğini görmek ister. Örn. düşük karbonlu ürüne geçiş, tedarik zinciri çeşitlendirmesi."},
   {"anahtar": "s_finansal_mevcut", "grup": "surdurulebilirlik", "etiket": "Mevcut finansal etkiler", "yardim": "**TSRS 1 md. 35** — Sürdürülebilirlik risk/fırsatlarının raporlama dönemindeki finansal durum, finansal performans ve nakit akışları üzerindeki mevcut etkileri (nicel veya niteliksel). NEDEN: Etkilerin halihazırda finansal tablolara nasıl yansıdığını gösterir; soyut riski somut paraya bağlar."},
   {"anahtar": "s_finansal_beklenen", "grup": "surdurulebilirlik", "etiket": "Beklenen finansal etkiler", "yardim": "**TSRS 1 md. 36-39** — Kısa, orta ve uzun vadede beklenen finansal etkiler; finansman ve sermaye dağıtımı planlarıyla ilişkisi. NEDEN: Geleceğe bakış sunar; yatırımcı risklerin ileride bilançoyu nasıl etkileyeceğini değerlendirir. Belirsizse niteliksel açıklama kabul edilir."},
   {"anahtar": "s_yatirim", "grup": "surdurulebilirlik", "etiket": "Yatırım ve kaynak dağılımı planları", "yardim": "**TSRS 1 md. 33** — Sürdürülebilirlikle ilgili mevcut ve planlanan yatırımlar, Ar-Ge harcamaları ve kaynak tahsisi. NEDEN: Stratejinin sözde değil gerçek olduğunu para tahsisiyle kanıtlar."},
   {"anahtar": "i_strateji_etki", "grup": "iklim", "etiket": "Strateji ve karar almaya etkiler", "yardim": "**TSRS 2 md. 14** — İklim risk ve fırsatlarına yanıt olarak iş modeli, strateji ve kaynak dağılımında yapılan/planlanan değişiklikler. NEDEN: İklim yanıtının stratejiye gerçekten işlendiğini gösterir. Örn. düşük karbon teknolojisi yatırımı, enerji verimliliği projeleri."},
   {"anahtar": "i_gecis_plani", "grup": "iklim", "etiket": "İklim geçiş planı", "yardim": "**TSRS 2 md. 14(a)(iv)** — Varsa iklim geçiş planının temel varsayımları, bağımlılıkları ve hedefleri (düşük karbon ekonomisine geçiş yol haritası). NEDEN: TSRS 1'de bu özel madde YOKTUR — yalnızca iklime özgüdür. Net sıfır taahhüdü olan şirketler için kritik. Plan yoksa bunu da belirtin."},
   {"anahtar": "i_finansal_mevcut", "grup": "iklim", "etiket": "Mevcut finansal etkiler", "yardim": "**TSRS 2 md. 16** — İklim risk/fırsatlarının raporlama dönemindeki finansal durum, performans ve nakit akışları üzerindeki mevcut etkileri. NEDEN: İklimin bugünün rakamlarına etkisini somutlaştırır (örn. karbon maliyeti, hava olayı hasarı)."},
   {"anahtar": "i_finansal_beklenen", "grup": "iklim", "etiket": "Beklenen finansal etkiler", "yardim": "**TSRS 2 md. 17-21** — Kısa, orta ve uzun vadede beklenen iklim kaynaklı finansal etkiler; dirençlilik değerlendirmesiyle bağdaşıklığı. NEDEN: Gelecek finansal etkilerin büyüklüğünü/zamanlamasını yatırımcıya gösterir. Nicel tahmin yapılamıyorsa gerekçesiyle niteliksel açıklama yapılabilir."},
   {"anahtar": "i_yatirim", "grup": "iklim", "etiket": "İklimle ilgili yatırım ve elden çıkarma planları", "yardim": "**TSRS 2 md. 14(a)(iii)** — İklim kaynaklı yatırım programları, Ar-Ge, varlık alım/satımları ve sermaye dağılımı. NEDEN: İklim stratejisinin finansal taahhütle desteklenip desteklenmediğini gösterir."}
  ]
 },
 {
  "id": "direnclilik",
  "baslik": "Dirençlilik ve Senaryo Analizi",
  "referans": "TSRS 1 md. 41-42 (sürdürülebilirlik) • TSRS 2 md. 22, B1-B18 (iklim)",
  "aciklama": "Stratejinin dirençliliği iki kapsamda değerlendirilir ve aralarında önemli bir fark vardır: (1) Sürdürülebilirlik dirençliliği (TSRS 1 md. 41-42) genellikle niteliksel bir değerlendirmedir; (2) İklim dirençliliği (TSRS 2 md. 22, B1-B18) iklimle ilgili senaryo analizi kullanılarak yapılır ve daha ayrıntılıdır. Aşağıdaki senaryo tablosu ağırlıklı olarak iklim değerlendirmesi içindir; her iki kapsamın anlatıları alt başlıklara ayrılmıştır.",
  "gruplar": [
   {"id": "surdurulebilirlik", "baslik": "Sürdürülebilirlik Dirençliliği", "referans": "TSRS 1 md. 41-42 — stratejinin sürdürülebilirlik risklerine karşı dirençliliği (niteliksel değerlendirme)"},
   {"id": "iklim", "baslik": "İklim Dirençliliği (Senaryo Analizi)", "referans": "TSRS 2 md. 22, B1-B18 — iklim senaryo analizi ile dirençlilik değerlendirmesi"}
  ],
  "tablo": {
   "etiket": "Kullanılan iklim senaryoları (TSRS 2 md. 22)",
   "sutunlar": [
    {"anahtar": "senaryo", "etiket": "Senaryo", "tip": "secim", "liste": "senaryo", "yardim": "Dirençlilik testinde kullanılan iklim senaryosu (örn. NGFS, IEA, IPCC SSP). Genellikle en az bir düşük-emisyon (Paris uyumlu) senaryo gerekir."},
    {"anahtar": "paris", "etiket": "Paris Uyumlu mu?", "tip": "secim", "liste": "evet_hayir", "yardim": "Bu senaryo küresel ısınmayı 1,5-2°C ile sınırlayan Paris Anlaşması hedefiyle uyumlu mu? TSRS 2, iklimle bağdaşık bir senaryonun kullanılmasını ister."},
    {"anahtar": "sicaklik", "etiket": "Sıcaklık Varsayımı", "tip": "metin", "yardim": "Senaryonun öngördüğü küresel sıcaklık artışı (örn. '1,5°C', '2°C', '4°C')."},
    {"anahtar": "ufuk", "etiket": "Zaman Ufku", "tip": "metin", "yardim": "Analizin kapsadığı dönem (örn. '2030', '2050'). Madencilikte rezerv/ruhsat ömrüyle ilişkilendirilebilir."},
    {"anahtar": "varsayim", "etiket": "Temel Varsayımlar", "tip": "uzun_metin", "yardim": "Senaryoda kullanılan ana varsayımlar (karbon fiyatı, talep değişimi, teknoloji, düzenleme)."},
    {"anahtar": "tutar", "etiket": "Niceliksel Etki (Bin TL)", "tip": "sayi", "yardim": "Tahmin edilebiliyorsa bu senaryonun işletmeye finansal etkisi (bin TL). Zorunlu değil."},
    {"anahtar": "sonuc", "etiket": "Sonuçlar", "tip": "uzun_metin", "yardim": "Bu senaryo altında stratejinin nasıl performans gösterdiği; tespit edilen kırılganlıklar ve uyum kapasitesi."}
   ]
  },
  "anlatilar": [
   {"anahtar": "s_yaklasim", "grup": "surdurulebilirlik", "etiket": "Sürdürülebilirlik dirençlilik değerlendirmesi", "yardim": "**TSRS 1 md. 41** — İşletmenin stratejisinin ve iş modelinin sürdürülebilirlikle ilgili risklere karşı dirençliliğine ilişkin değerlendirme. NEDEN: TSRS 1, iklimden farklı olarak sürdürülebilirlik için şart bir senaryo yöntemi dayatmaz; niteliksel bir değerlendirme yeterlidir. Şirketin değişen koşullara karşı ne kadar dayanıklı olduğunu anlatın."},
   {"anahtar": "s_uyum", "grup": "surdurulebilirlik", "etiket": "Uyum kapasitesi ve esneklik", "yardim": "**TSRS 1 md. 42** — İşletmenin strateji ve iş modelini değişen koşullara göre ayarlama (uyum sağlama) kapasitesi. NEDEN: Dirençlilik yalnızca mevcut duruma değil, değişime tepki verebilme yeteneğine de bağlıdır. Örn. esnek tedarik, finansal tampon, ürün çeşitliliği."},
   {"anahtar": "i_yaklasim", "grup": "iklim", "etiket": "Analitik yaklaşımın seçimi", "yardim": "**TSRS 2 md. B2-B7** — Senaryo analizinin niteliksel mi niceliksel mi yapıldığı, kapsamı ve yönteminin gerekçesi. İşletme, kendi koşullarına (büyüklük, kaynak, maruziyet) göre uygun bir yaklaşım seçmelidir. NEDEN: TSRS 2, iklim dirençliliğinin senaryo analiziyle değerlendirilmesini ister; yöntemin gerekçesi şeffaflık için zorunludur."},
   {"anahtar": "i_degerlendirme", "grup": "iklim", "etiket": "Dirençlilik değerlendirmesinin sonucu", "yardim": "**TSRS 2 md. 22(a)** — Stratejinin ve iş modelinin kullanılan iklim senaryoları altındaki performansı; iklim değişikliğine uyum kapasitesi ve tespit edilen kırılganlıklar. NEDEN: Yukarıdaki senaryo tablosuyla birlikte okunur; senaryoların şirkete sonuçlarını özetler."},
   {"anahtar": "i_belirsizlik", "grup": "iklim", "etiket": "Önemli belirsizlik alanları", "yardim": "**TSRS 2 md. 22(a)(ii)** — Senaryo analizinde dikkate alınan önemli belirsizlikler, varsayımlar ve sınırlamalar. NEDEN: Senaryo sonuçları varsayımlara duyarlıdır; yatırımcının sonuçları doğru yorumlaması için belirsizliklerin açıklanması gerekir."},
   {"anahtar": "i_tarih", "grup": "iklim", "etiket": "Son değerlendirme tarihi ve sıklığı", "yardim": "**TSRS 2 md. B18** — Senaryo analizinin en son ne zaman yapıldığı ve hangi sıklıkla güncellendiği. NEDEN: Analizin güncelliği, sonuçların geçerliliği için önemlidir; eski bir analiz mevcut riskleri yansıtmayabilir."}
  ]
 },
 {
  "id": "risk_yonetimi",
  "baslik": "Risk Yönetimi Süreci",
  "referans": "TSRS 1 md. 43-44 • TSRS 2 md. 24-26",
  "aciklama": "İşletmenin sürdürülebilirlik ve iklim risk/fırsatlarını tanımlama, değerlendirme, önceliklendirme ve izleme sürecini açıklayın. Bu sürecin genel kurumsal risk yönetimi (ERM) ile nasıl bütünleştiği de belirtilir.",
  "tablo": {
   "etiket": "Süreçte kullanılan girdi ve kaynaklar",
   "sutunlar": [
    {"anahtar": "kaynak", "etiket": "Girdi / Kaynak", "tip": "metin", "yardim": "Risk değerlendirmede kullandığınız veri/bilgi kaynağı (örn. IPCC senaryoları, hava verileri, iç denetim raporları, paydaş görüşleri). NEDEN: **TSRS 2 md. 25(a)**, kullanılan girdi ve parametrelerin açıklanmasını ister."},
    {"anahtar": "referans", "etiket": "Referans / Versiyon", "tip": "metin", "yardim": "Kaynağın sürümü veya tarihi (örn. 'NGFS 2023', 'AR6'). NEDEN: Şeffaflık ve tekrar edilebilirlik için hangi versiyonun kullanıldığı önemlidir."},
    {"anahtar": "kullanim", "etiket": "Kullanım Alanı", "tip": "uzun_metin", "yardim": "Bu girdinin süreçte nasıl kullanıldığı (örn. 'fiziksel risk haritalamasında', 'geçiş riski fiyatlandırmasında'). NEDEN: Girdinin karar almaya nasıl katkı verdiğini gösterir."}
   ]
  },
  "anlatilar": [
   {"anahtar": "tanimlama", "etiket": "Riskleri tanımlama süreci ve parametreler", "yardim": "**TSRS 2 md. 25(a)** — Risk ve fırsatları tanımlamak için kullanılan süreç, girdiler ve parametreler. NEDEN: Yatırımcı, risklerin sistematik bir yöntemle mi yoksa gelişigüzel mi belirlendiğini bilmek ister. Örn. atölye çalışmaları, uzman görüşü, veri analizi."},
   {"anahtar": "senaryo_kullanimi", "etiket": "Senaryo analizinin risk belirlemede kullanımı", "yardim": "**TSRS 2 md. 25(a)(i)** — Senaryo analizinin risk tanımlama sürecini nasıl beslediği. NEDEN: İklim risklerinin geleceğe dönük doğası gereği senaryo analizi merkezi rol oynar; bağlantısı açıklanmalıdır."},
   {"anahtar": "degerlendirme", "etiket": "Etkilerin doğası, olasılığı ve büyüklüğünün değerlendirilmesi", "yardim": "**TSRS 2 md. 25(a)(ii)** — Risklerin büyüklüğünü değerlendirmek için kullanılan skorlama/derecelendirme yöntemi (örn. olasılık × etki matrisi). NEDEN: Risk önceliklerinin nasıl belirlendiğini nesnel bir temele oturtur."},
   {"anahtar": "onceliklendirme", "etiket": "Önceliklendirme ve diğer risklere göre konum", "yardim": "**TSRS 2 md. 25(a)(iii)** — İklim/sürdürülebilirlik risklerinin diğer iş riski türlerine göre nasıl önceliklendirildiği. NEDEN: Bu risklerin kurumsal gündemdeki ağırlığını gösterir."},
   {"anahtar": "izleme", "etiket": "İzleme süreci", "yardim": "**TSRS 2 md. 25(b)** — Risklerin izlenme sıklığı ve kullanılan göstergeler. NEDEN: Riskin bir kez değil sürekli yönetildiğini kanıtlar."},
   {"anahtar": "entegrasyon", "etiket": "Genel kurumsal risk yönetimine entegrasyon", "yardim": "**TSRS 2 md. 25(c)** — Bu sürecin işletmenin genel kurumsal risk yönetimi (ERM) süreciyle ne ölçüde bütünleştiği. NEDEN: İklim/sürdürülebilirlik riskinin ayrı bir silo mu yoksa bütünleşik mi yönetildiğini gösterir; bütünleşik yönetim olgunluk işaretidir."}
  ]
 },
 {
  "id": "metrikler",
  "baslik": "Sektörler Arası Metrikler",
  "referans": "TSRS 2 md. 29",
  "aciklama": "Kırılgan varlıklar, iklim yatırımları, iç karbon fiyatı gibi sektörler arası metrikleri girin. Emisyon metrikleri (md. 29(a)) veri giriş sayfalarından otomatik hesaplanır.",
  "tablo": {
   "etiket": "Metrik kayıtları",
   "sutunlar": [
    {"anahtar": "metrik", "etiket": "Metrik", "tip": "secim", "liste": "metrik_adi", "yardim": "**TSRS 2 md. 29(b)-(g)** — Raporlanması gereken sektörler arası metrik. Örn. geçiş/fiziksel riske maruz varlık yüzdesi, iklim fırsatlarına yönelik sermaye, iç karbon fiyatı. NEDEN: Bu metrikler tüm sektörler için karşılaştırılabilir iklim göstergeleridir."},
    {"anahtar": "deger", "etiket": "Değer", "tip": "sayi", "yardim": "Metriğin sayısal değeri. NEDEN: Niceliksel açıklama, ilerlemenin yıllar arası karşılaştırılmasını sağlar."},
    {"anahtar": "birim", "etiket": "Birim", "tip": "metin", "yardim": "Değerin birimi (örn. %, TL, tCO2e, TL/tCO2e). NEDEN: Birim olmadan değer yorumlanamaz."},
    {"anahtar": "yontem", "etiket": "Kapsam / Hesaplama Yöntemi", "tip": "uzun_metin", "yardim": "**TSRS 2 md. 29 son fıkra** — Metriğin nasıl hesaplandığı, hangi varlık/faaliyetleri kapsadığı ve kullanılan tanımlar. NEDEN: Şeffaflık; aynı metriğin farklı şirketlerce farklı hesaplanmasını önler."},
    {"anahtar": "yorum", "etiket": "Yorum", "tip": "metin", "yardim": "Değere ilişkin açıklama veya bağlam (örn. 'geçen yıla göre %12 artış'). NEDEN: Çıplak sayıya anlam katar."}
   ]
  },
  "anlatilar": []
 },
 {
  "id": "hedefler",
  "baslik": "İklim Hedefleri Takibi",
  "referans": "TSRS 2 md. 33-37",
  "aciklama": "İklimle ilgili hedefleri ve yıllık ilerlemeyi kaydedin. Başarım oranı otomatik hesaplanır.",
  "tablo": {
   "etiket": "Hedef kayıtları",
   "sutunlar": [
    {"anahtar": "hid", "etiket": "Hedef ID", "tip": "metin", "yardim": "Hedefe verdiğiniz kısa kod (örn. H-01). NEDEN: Hedefleri metriklere ve yıllar arası ilerlemeye bağlamak için."},
    {"anahtar": "ad", "etiket": "Hedef Adı", "tip": "metin", "yardim": "Hedefin açık tanımı (örn. '2030'a kadar Kapsam 1+2 emisyonlarını %42 azaltmak'). NEDEN: **TSRS 2 md. 33(a)** hedefin niteliğinin açıklanmasını ister."},
    {"anahtar": "tur", "etiket": "Tür", "tip": "secim", "liste": "hedef_turu", "yardim": "**TSRS 2 md. 33(b)** — Hedef mutlak mı (toplam ton) yoksa yoğunluk mu (birim başına)? NEDEN: İki tür farklı yorumlanır; mutlak hedef büyümeden bağımsız azaltımı gösterir."},
    {"anahtar": "metrik", "etiket": "Kullanılan Metrik", "tip": "metin", "yardim": "Hedefin ölçüldüğü birim (örn. tCO2e, tCO2e/ton cevher). NEDEN: Hedefin neyle takip edildiğini netleştirir."},
    {"anahtar": "kapsam", "etiket": "Hedefin Kapsamı", "tip": "metin", "yardim": "**TSRS 2 md. 33(c)-(d)** — Hedefin kapsadığı emisyon kapsamları (K1/K2/K3) ve faaliyet/coğrafya sınırı. NEDEN: Hedefin ne kadarını kapsadığı (örn. yalnızca K1 mi, K3 dahil mi) kritik bir ayrımdır."},
    {"anahtar": "baz_yil", "etiket": "Baz Yıl", "tip": "sayi", "yardim": "**TSRS 2 md. 33(e)** — Hedefin karşılaştırıldığı referans yıl. NEDEN: Azaltım yüzdesi bu yıla göre hesaplanır."},
    {"anahtar": "baz_deger", "etiket": "Baz Yıl Değeri", "tip": "sayi", "yardim": "Baz yıldaki emisyon/metrik değeri. NEDEN: İlerleme yüzdesinin paydası; ilerleme çubuğu bunu kullanır."},
    {"anahtar": "hedef_yil", "etiket": "Hedef Yılı", "tip": "sayi", "yardim": "Hedefe ulaşılması planlanan yıl (örn. 2030, 2050). NEDEN: Hedefin zaman ufkunu belirler."},
    {"anahtar": "hedef_deger", "etiket": "Hedef Değeri", "tip": "sayi", "yardim": "Hedef yılında ulaşılmak istenen değer. NEDEN: İlerleme çubuğunun hedef noktası."},
    {"anahtar": "mevcut", "etiket": "Mevcut Değer", "tip": "sayi", "yardim": "Bu raporlama dönemindeki güncel değer. NEDEN: Baz ve hedefe göre ilerleme yüzdesi bundan hesaplanır (otomatik)."},
    {"anahtar": "sbti", "etiket": "SBTi Onaylı mı?", "tip": "secim", "liste": "evet_hayir", "yardim": "Hedef Bilim Temelli Hedefler girişimi (SBTi) tarafından onaylandı mı? NEDEN: **TSRS 2 md. 33(f)** hedefin bilimsel bir gösterge/üçüncü taraf tarafından doğrulanıp doğrulanmadığını sorar; SBTi onayı güvenilirlik artırır."},
    {"anahtar": "not", "etiket": "Notlar", "tip": "metin", "yardim": "Hedefe ilişkin ek açıklama (örn. ara hedefler, revizyon geçmişi). NEDEN: Bağlam sağlar."}
   ]
  },
  "anlatilar": [
   {"anahtar": "yontem", "etiket": "Hedef belirleme yöntemi ve doğrulama", "yardim": "**TSRS 2 md. 33-34** — Hedefin nasıl belirlendiği, hangi bilimsel temele/senaryoya dayandığı, üçüncü taraf doğrulaması ve denkleştirme (karbon kredisi) kullanılıp kullanılmadığı. NEDEN: Hedefin ciddiyeti ve güvenilirliği için yöntem ve doğrulama şart kapsamındadır; denkleştirmeye bağımlılık ayrıca açıklanmalıdır."}
  ]
 },
 {
  "id": "onemlilik",
  "baslik": "Önemlilik Değerlendirmesi",
  "referans": "TSRS 1 md. 17-19 • B13-B37",
  "aciklama": "Hangi sürdürülebilirlik konularının raporlanacak kadar önemli (önemli/material) olduğunu belirleme sürecini ve sonuçlarını kaydedin. TSRS 1, bilginin atlanması/yanlış olması yatırımcı kararını etkileyecekse o bilgiyi 'önemli' sayar.",
  "tablo": {
   "etiket": "Değerlendirilen konular",
   "sutunlar": [
    {"anahtar": "kid", "etiket": "Kalem ID", "tip": "metin", "yardim": "Konuya verdiğiniz kısa kod (örn. K-01). NEDEN: Değerlendirilen konuları izlemek ve karar gerekçesine bağlamak için."},
    {"anahtar": "konu", "etiket": "Konu Açıklaması", "tip": "metin", "yardim": "Değerlendirilen sürdürülebilirlik konusu (örn. 'su tüketimi', 'iş sağlığı ve güvenliği', 'maden atığı yönetimi'). NEDEN: **TSRS 1 md. 17**, işletmeyi etkileyebilecek tüm konuların taranmasını ister."},
    {"anahtar": "kategori", "etiket": "Kategori", "tip": "secim", "liste": "konu_kategorisi", "yardim": "Konunun türü (çevresel, sosyal, yönetişim, ekonomik). NEDEN: Konuların sınıflandırılması raporun düzenli sunulmasını sağlar."},
    {"anahtar": "kaynak", "etiket": "Konunun Kaynağı", "tip": "metin", "yardim": "Bu konunun nasıl gündeme geldiği (örn. sektör cilt rehberi, paydaş görüşü, mevzuat, akran kıyaslama). NEDEN: **TSRS 1 B13-B37**, değerlendirme için kullanılan kaynakların izlenebilir olmasını ister."},
    {"anahtar": "olasilik", "etiket": "Olasılık (1-5)", "tip": "sayi", "yardim": "Konunun işletmeyi etkileme olasılığı: 1 = çok düşük, 5 = çok yüksek. NEDEN: Etki ile çarpılarak önemlilik skoru hesaplanır (otomatik)."},
    {"anahtar": "etki", "etiket": "Etki (1-5)", "tip": "sayi", "yardim": "Gerçekleşirse büyüklüğü: 1 = önemsiz, 5 = çok önemli. NEDEN: **TSRS 1 md. 18**, etkinin büyüklüğü ve olasılığının birlikte değerlendirilmesini ister."},
    {"anahtar": "onemli", "etiket": "Önemli mi?", "tip": "secim", "liste": "evet_hayir", "yardim": "Bu konu sonuçta 'önemli (material)' kabul edildi mi? NEDEN: **TSRS 1 md. 17-19**, yatırımcı kararını etkileyebilecek konuların raporlanmasını zorunlu kılar; bu kolon raporlama kararını gösterir."},
    {"anahtar": "karar", "etiket": "Karar / Açıklanacak Bilgi", "tip": "uzun_metin", "yardim": "Bu konuda hangi bilginin raporlanacağı veya neden raporlanmayacağı. NEDEN: Önemli bulunan konular raporda açıklanmalı; önemsiz bulunanların gerekçesi de izlenebilir olmalıdır."}
   ]
  },
  "anlatilar": [
   {"anahtar": "surec", "etiket": "Önemlilik değerlendirme süreci", "yardim": "**TSRS 1 md. 17-19 / B13-B37** — Önemli konuların nasıl belirlendiği: kullanılan eşikler, paydaş görüşlerinin rolü, değerlendirme yöntemi ve değerlendirmenin hangi sıklıkla gözden geçirildiği. NEDEN: Yatırımcı, raporda neyin yer alıp neyin dışarıda kaldığına nasıl karar verildiğini bilmek ister; sürecin şeffaflığı raporun güvenilirliğini belirler."}
  ]
 },
 {
  "id": "karsilastirma",
  "baslik": "Karşılaştırmalı Bilgi ve Yeniden Düzenleme",
  "referans": "TSRS 1 md. 70 • B50-B51",
  "aciklama": "Önceki dönem verilerinde yapılan revizyonları (yeniden düzenleme) ve karşılaştırmalı bilgileri kaydedin. Fark ve yüzde otomatik hesaplanır.",
  "tablo": {
   "etiket": "Yeniden düzenleme kayıtları",
   "sutunlar": [
    {"anahtar": "did", "etiket": "Düzeltme ID", "tip": "metin", "yardim": "Revizyona verdiğiniz kısa kod (örn. D-01). NEDEN: Hangi değerin neden değiştiğini izlemek için."},
    {"anahtar": "metrik", "etiket": "Etkilenen Metrik", "tip": "metin", "yardim": "Revize edilen veri kalemi (örn. '2024 Kapsam 1 toplamı'). NEDEN: **TSRS 1 md. 70**, karşılaştırmalı dönem bilgilerinin güncellenmesini gerektirir; hangi metriğin etkilendiği belirtilmelidir."},
    {"anahtar": "orijinal", "etiket": "Orijinal Değer", "tip": "sayi", "yardim": "Önceki raporda yayımlanan değer. NEDEN: Farkın hesaplanabilmesi ve şeffaflık için eski değer korunur."},
    {"anahtar": "revize", "etiket": "Revize Değer", "tip": "sayi", "yardim": "Düzeltilmiş yeni değer. NEDEN: Fark ve yüzde otomatik hesaplanır; okuyucu değişimin büyüklüğünü görür."},
    {"anahtar": "donem", "etiket": "Orijinal Dönem", "tip": "metin", "yardim": "Değerin ait olduğu raporlama dönemi (örn. '2024'). NEDEN: Hangi geçmiş dönemin düzeltildiğini netleştirir."},
    {"anahtar": "gerekce", "etiket": "Revizyon Gerekçesi", "tip": "uzun_metin", "yardim": "**TSRS 1 B50-B51** — Değerin neden değiştiği (örn. hata düzeltme, daha iyi EF, kapsam değişikliği, metodoloji güncellemesi). NEDEN: Yeniden düzenlemenin gerekçesi açıklanmadan karşılaştırma güvenilir olmaz; standart gerekçe açıklamasını zorunlu kılar."}
   ]
  },
  "anlatilar": [
   {"anahtar": "onceki_donem", "etiket": "Önceki dönem emisyon özeti", "yardim": "**TSRS 1 md. 70** — Karşılaştırma için önceki raporlama döneminin toplam değerleri (Kapsam 1/2/3, tCO2e). NEDEN: TSRS, her sayısal açıklama için önceki dönem karşılaştırmalı bilgisinin sunulmasını ister; bu özet, yıllık kıyaslamayı sağlar."}
  ]
 },
 {
  "id": "muhakemeler",
  "baslik": "Muhakemeler ve Belirsizlikler",
  "referans": "TSRS 1 md. 74-82 • md. 54-59",
  "aciklama": "Açıklamaların hazırlanmasında kullanılan önemli muhakemeler (yargılar), dikkate alınan kaynak/rehberler ve tahmin belirsizlikleri. Bu bölüm raporun şeffaflığını ve güvenilirliğini sağlar.",
  "tablo": {
   "etiket": "Dikkate alınan kaynak ve rehberler",
   "sutunlar": [
    {"anahtar": "kaynak", "etiket": "Kaynak / Rehber", "tip": "metin", "yardim": "Raporu hazırlarken başvurduğunuz rehber/standart (örn. GHG Protocol, IPCC 2006, SASB cilt rehberi). NEDEN: **TSRS 1 md. 54-59**, başka kaynakların nasıl dikkate alındığının açıklanmasını ister."},
    {"anahtar": "referans", "etiket": "Referans / Versiyon", "tip": "metin", "yardim": "Kaynağın versiyonu/yılı (örn. 'GHG Protocol 2015', 'AR6'). NEDEN: Hangi sürümün esas alındığı izlenebilirlik için önemlidir."},
    {"anahtar": "dikkate", "etiket": "Dikkate Alındı", "tip": "secim", "liste": "evet_hayir", "yardim": "Bu kaynağı değerlendirmeye aldınız mı? NEDEN: Standart, kaynakların bilinçli olarak dikkate alınıp alınmadığını göstermenizi bekler."},
    {"anahtar": "uygulandi", "etiket": "Uygulandı", "tip": "secim", "liste": "evet_hayir", "yardim": "Dikkate aldıktan sonra fiilen uyguladınız mı? NEDEN: Dikkate almak ile uygulamak farklıdır; uygulanmadıysa gerekçe beklenir."},
    {"anahtar": "gerekce", "etiket": "Uygulanmadıysa Gerekçe", "tip": "metin", "yardim": "Kaynak dikkate alınıp uygulanmadıysa nedeni. NEDEN: Şeffaflık; bir rehberin neden izlenmediği açıklanmalıdır."},
    {"anahtar": "alan", "etiket": "Uygulama Alanları", "tip": "metin", "yardim": "Kaynağın raporun hangi bölümünde kullanıldığı (örn. 'Kapsam 1 hesabı', 'senaryo analizi'). NEDEN: Kaynağın etkisini somutlaştırır."}
   ]
  },
  "anlatilar": [
   {"anahtar": "muhakeme", "etiket": "Önemli muhakemeler (yargılar)", "yardim": "**TSRS 1 md. 74** — Raporu hazırlarken verdiğiniz en önemli yargılar (örn. değer zinciri kapsamının sınırı, önemlilik eşikleri, hangi Kapsam 3 kategorilerinin dahil edildiği). NEDEN: Bu yargılar raporun içeriğini doğrudan belirler; yatırımcı bunları bilmeden rakamları doğru yorumlayamaz."},
   {"anahtar": "belirsizlik", "etiket": "Tahmin belirsizlikleri", "yardim": "**TSRS 1 md. 77-82** — Açıklanan tutarları etkileyen ölçüm belirsizliği kaynakları (örn. emisyon faktörü seçimi, veri boşlukları, tahmin yöntemleri). NEDEN: Hiçbir emisyon hesabı kesin değildir; belirsizlik kaynaklarının açıklanması raporun dürüstlüğünü ve güvenilirliğini artırır. Veri Kütüphanesi sayfasındaki belirsizlik aralıkları buraya dayanak olur."}
  ]
 }
];
