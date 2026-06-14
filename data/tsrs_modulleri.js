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
   {"anahtar": "s_sorumluluk", "grup": "surdurulebilirlik", "etiket": "Sorumlulukların görev tanımlarına yansıtılması", "yardim": "TSRS 1 md. 27(a)(i) — Sürdürülebilirlik sorumlulukları yönetmelik, komite görev tanımı veya politikalarda nasıl yer alıyor?"},
   {"anahtar": "s_yetkinlik", "grup": "surdurulebilirlik", "etiket": "Yetkinliklerin belirlenmesi ve geliştirilmesi", "yardim": "md. 27(a)(ii) — Organın sürdürülebilirlik konusundaki yetkinliği nasıl sağlanıyor (eğitim, danışmanlık, işe alım)?"},
   {"anahtar": "s_bilgilendirme_sureci", "grup": "surdurulebilirlik", "etiket": "Organın bilgilendirilme süreci", "yardim": "md. 27(a)(iii) — Organ, sürdürülebilirlik risk ve fırsatları hakkında hangi süreçle ve sıklıkla bilgilendiriliyor?"},
   {"anahtar": "s_strateji_gozetim", "grup": "surdurulebilirlik", "etiket": "Strateji ve büyük işlem kararlarında gözetim", "yardim": "md. 27(a)(iv) — Strateji, büyük işlemler ve risk yönetimi kararlarında sürdürülebilirlik nasıl dikkate alınıyor?"},
   {"anahtar": "s_hedef_gozetim", "grup": "surdurulebilirlik", "etiket": "Hedef belirleme ve ilerlemenin gözetimi", "yardim": "md. 27(a)(v) — Sürdürülebilirlik hedeflerinin belirlenmesi ve izlenmesi organ tarafından nasıl gözetiliyor?"},
   {"anahtar": "s_yonetim_rolu", "grup": "surdurulebilirlik", "etiket": "Yönetimin rolü ve devredilen yetkiler", "yardim": "md. 27(b) — Üst yönetimin sürdürülebilirlik günlük yönetimindeki rolü, kullanılan kontroller ve prosedürler."},
   {"anahtar": "i_sorumluluk", "grup": "iklim", "etiket": "Sorumlulukların görev tanımlarına yansıtılması", "yardim": "TSRS 2 md. 6(a)(i) — İklim sorumlulukları yönetmelik, komite görev tanımı veya politikalarda nasıl yer alıyor?"},
   {"anahtar": "i_yetkinlik", "grup": "iklim", "etiket": "Yetkinliklerin belirlenmesi ve geliştirilmesi", "yardim": "TSRS 2 md. 6(a)(ii) — Organın iklim konusundaki yetkinliği nasıl sağlanıyor (eğitim, danışmanlık, işe alım)?"},
   {"anahtar": "i_bilgilendirme_sureci", "grup": "iklim", "etiket": "Organın bilgilendirilme süreci", "yardim": "TSRS 2 md. 6(a)(iii) — Organ, iklim risk ve fırsatları hakkında hangi süreçle ve sıklıkla bilgilendiriliyor?"},
   {"anahtar": "i_strateji_gozetim", "grup": "iklim", "etiket": "Strateji ve büyük işlem kararlarında iklim gözetimi", "yardim": "TSRS 2 md. 6(a)(iv) — Strateji, büyük işlemler ve risk yönetimi kararlarında iklim nasıl dikkate alınıyor?"},
   {"anahtar": "i_hedef_gozetim", "grup": "iklim", "etiket": "Hedef belirleme ve ilerlemenin gözetimi", "yardim": "TSRS 2 md. 6(a)(v) — İklim hedeflerinin belirlenmesi ve izlenmesi organ tarafından nasıl gözetiliyor?"},
   {"anahtar": "i_ucretlendirme", "grup": "iklim", "etiket": "Ücretlendirme bağlantısı", "yardim": "TSRS 2 md. 6(a)(v) son cümle / md. 29(g) — Yönetici ücretlendirmesi iklim performansına bağlı mı? Nasıl?"},
   {"anahtar": "i_yonetim_rolu", "grup": "iklim", "etiket": "Yönetimin rolü ve devredilen yetkiler", "yardim": "TSRS 2 md. 6(b) — Üst yönetimin iklim günlük yönetimindeki rolü, kullanılan kontroller ve prosedürler."}
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
   {"anahtar": "s_tanim", "grup": "surdurulebilirlik", "etiket": "Sürdürülebilirlik risk ve fırsatlarının genel açıklaması", "yardim": "TSRS 1 md. 30 — İşletmenin finansal yeterliliğini etkilemesi makul ölçüde beklenebilecek sürdürülebilirlik (çevresel, sosyal, yönetişim) risk ve fırsatlarının genel özeti."},
   {"anahtar": "s_kisa_vade", "grup": "surdurulebilirlik", "etiket": "Kısa vade tanımı ve gerekçesi", "yardim": "örn. 3 yıla kadar; işletmenin planlama ufkuyla bağlantısı."},
   {"anahtar": "s_orta_vade", "grup": "surdurulebilirlik", "etiket": "Orta vade tanımı ve gerekçesi", "yardim": "örn. 3-10 yıl."},
   {"anahtar": "s_uzun_vade", "grup": "surdurulebilirlik", "etiket": "Uzun vade tanımı ve gerekçesi", "yardim": "örn. 10 yıldan uzun."},
   {"anahtar": "i_tanim", "grup": "iklim", "etiket": "İklim risk ve fırsatlarının genel açıklaması", "yardim": "TSRS 2 md. 10(a) — Finansal yeterliliği etkilemesi beklenen iklimle ilgili risk ve fırsatların genel özeti ve tanımı."},
   {"anahtar": "i_kisa_vade", "grup": "iklim", "etiket": "Kısa vade tanımı ve gerekçesi", "yardim": "TSRS 2 md. 10(d) — örn. 3 yıla kadar; stratejik planlama dönemleriyle bağlantısı."},
   {"anahtar": "i_orta_vade", "grup": "iklim", "etiket": "Orta vade tanımı ve gerekçesi", "yardim": "TSRS 2 md. 10(d) — örn. 3-10 yıl."},
   {"anahtar": "i_uzun_vade", "grup": "iklim", "etiket": "Uzun vade tanımı ve gerekçesi", "yardim": "TSRS 2 md. 10(d) — örn. 10 yıldan uzun; madencilikte rezerv/ruhsat ömrüyle ilişkilendirilebilir."}
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
   {"anahtar": "s_strateji_etki", "grup": "surdurulebilirlik", "etiket": "Strateji ve karar almaya etkiler", "yardim": "TSRS 1 md. 33-34 — Sürdürülebilirlik risk/fırsatlarına yanıt olarak stratejide ve kaynak planlamasında yapılan/planlanan değişiklikler."},
   {"anahtar": "s_finansal_mevcut", "grup": "surdurulebilirlik", "etiket": "Mevcut finansal etkiler", "yardim": "TSRS 1 md. 35 — Raporlama dönemindeki finansal durum, performans ve nakit akışlarına etkiler (nicel/nitel)."},
   {"anahtar": "s_finansal_beklenen", "grup": "surdurulebilirlik", "etiket": "Beklenen finansal etkiler", "yardim": "TSRS 1 md. 36-39 — Kısa, orta ve uzun vadede beklenen finansal etkiler."},
   {"anahtar": "s_yatirim", "grup": "surdurulebilirlik", "etiket": "Yatırım ve kaynak dağılımı planları", "yardim": "TSRS 1 md. 33 — Sürdürülebilirlikle ilgili yatırım programları, Ar-Ge ve kaynak tahsisi."},
   {"anahtar": "i_strateji_etki", "grup": "iklim", "etiket": "Strateji ve karar almaya etkiler", "yardim": "TSRS 2 md. 14 — İklim risk/fırsatlarına yanıt olarak strateji ve kaynak planlamasında yapılan/planlanan değişiklikler."},
   {"anahtar": "i_gecis_plani", "grup": "iklim", "etiket": "İklim geçiş planı", "yardim": "TSRS 2 md. 14(a)(iv) — Varsa geçiş planının temel varsayımları, bağımlılıkları ve hedefleri (düşük karbon ekonomisine geçiş)."},
   {"anahtar": "i_finansal_mevcut", "grup": "iklim", "etiket": "Mevcut finansal etkiler", "yardim": "TSRS 2 md. 16 — Raporlama dönemindeki finansal durum, performans ve nakit akışlarına iklim etkileri (nicel/nitel)."},
   {"anahtar": "i_finansal_beklenen", "grup": "iklim", "etiket": "Beklenen finansal etkiler", "yardim": "TSRS 2 md. 17-21 — Kısa, orta ve uzun vadede beklenen iklim kaynaklı finansal etkiler."},
   {"anahtar": "i_yatirim", "grup": "iklim", "etiket": "İklimle ilgili yatırım ve elden çıkarma planları", "yardim": "TSRS 2 md. 14(a)(iii) — İklim yatırım programları, Ar-Ge, varlık satışları ve dağılımı."}
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
   {"anahtar": "s_yaklasim", "grup": "surdurulebilirlik", "etiket": "Sürdürülebilirlik dirençlilik değerlendirmesi", "yardim": "TSRS 1 md. 41 — İşletmenin stratejisi ve iş modelinin sürdürülebilirlikle ilgili risklere karşı dirençliliğine ilişkin niteliksel değerlendirme."},
   {"anahtar": "s_uyum", "grup": "surdurulebilirlik", "etiket": "Uyum kapasitesi ve esneklik", "yardim": "TSRS 1 md. 42 — İşletmenin değişen koşullara uyum sağlama (strateji/iş modelini ayarlama) kapasitesi."},
   {"anahtar": "i_yaklasim", "grup": "iklim", "etiket": "Analitik yaklaşımın seçimi", "yardim": "TSRS 2 md. B2-B7 — Nitel mi nicel mi; senaryo analizinin kapsam ve yönteminin gerekçesi (işletmenin koşullarına göre maliyet/yetenek dengesi)."},
   {"anahtar": "i_degerlendirme", "grup": "iklim", "etiket": "Dirençlilik değerlendirmesinin sonucu", "yardim": "TSRS 2 md. 22(a) — Stratejinin senaryolardaki performansı; iklim değişikliğine uyum kapasitesi ve tespit edilen kırılganlıklar."},
   {"anahtar": "i_belirsizlik", "grup": "iklim", "etiket": "Önemli belirsizlik alanları", "yardim": "TSRS 2 md. 22(a)(ii) — Senaryo analizinde dikkate alınan önemli belirsizlikler ve sınırlamalar."},
   {"anahtar": "i_tarih", "grup": "iklim", "etiket": "Son değerlendirme tarihi ve sıklığı", "yardim": "TSRS 2 md. B18 — Senaryo analizinin yapıldığı tarih ve güncelleme sıklığı."}
  ]
 },
 {
  "id": "risk_yonetimi",
  "baslik": "Risk Yönetimi Süreci",
  "referans": "TSRS 1 md. 43-44 • TSRS 2 md. 24-26",
  "aciklama": "İklim risklerinin nasıl tanımlandığını, değerlendirildiğini, önceliklendirildiğini ve izlendiğini açıklayın.",
  "tablo": {
   "etiket": "Süreçte kullanılan girdi ve kaynaklar",
   "sutunlar": [
    {"anahtar": "kaynak", "etiket": "Girdi / Kaynak", "tip": "metin"},
    {"anahtar": "referans", "etiket": "Referans", "tip": "metin"},
    {"anahtar": "kullanim", "etiket": "Kullanım Alanı", "tip": "uzun_metin"}
   ]
  },
  "anlatilar": [
   {"anahtar": "tanimlama", "etiket": "Riskleri tanımlama süreci ve parametreler", "yardim": "TSRS 2 md. 25(a) — Kullanılan girdiler, parametreler ve veri kaynakları."},
   {"anahtar": "senaryo_kullanimi", "etiket": "Senaryo analizinin risk belirlemede kullanımı", "yardim": "md. 25(a)(i) — Senaryo analizi risk tanımlamayı nasıl besliyor?"},
   {"anahtar": "degerlendirme", "etiket": "Etkilerin doğası, olasılığı ve büyüklüğünün değerlendirilmesi", "yardim": "md. 25(a)(ii) — Skorlama/derecelendirme yöntemi."},
   {"anahtar": "onceliklendirme", "etiket": "Önceliklendirme ve diğer risklere göre konum", "yardim": "md. 25(a)(iii) — İklim riskleri diğer risk türlerine göre nasıl önceliklendiriliyor?"},
   {"anahtar": "izleme", "etiket": "İzleme süreci", "yardim": "md. 25(b) — İzleme sıklığı ve kullanılan göstergeler."},
   {"anahtar": "entegrasyon", "etiket": "Genel kurumsal risk yönetimine entegrasyon", "yardim": "md. 25(c) — Sürecin ERM ile bütünleşme derecesi."}
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
    {"anahtar": "metrik", "etiket": "Metrik", "tip": "secim", "liste": "metrik_adi"},
    {"anahtar": "deger", "etiket": "Değer", "tip": "sayi"},
    {"anahtar": "birim", "etiket": "Birim", "tip": "metin"},
    {"anahtar": "yontem", "etiket": "Kapsam / Hesaplama Yöntemi", "tip": "uzun_metin"},
    {"anahtar": "yorum", "etiket": "Yorum", "tip": "metin"}
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
    {"anahtar": "hid", "etiket": "Hedef ID", "tip": "metin"},
    {"anahtar": "ad", "etiket": "Hedef Adı", "tip": "metin"},
    {"anahtar": "tur", "etiket": "Tür", "tip": "secim", "liste": "hedef_turu"},
    {"anahtar": "metrik", "etiket": "Kullanılan Metrik", "tip": "metin"},
    {"anahtar": "kapsam", "etiket": "Hedefin Kapsamı", "tip": "metin"},
    {"anahtar": "baz_yil", "etiket": "Baz Yıl", "tip": "sayi"},
    {"anahtar": "baz_deger", "etiket": "Baz Yıl Değeri", "tip": "sayi"},
    {"anahtar": "hedef_yil", "etiket": "Hedef Yılı", "tip": "sayi"},
    {"anahtar": "hedef_deger", "etiket": "Hedef Değeri", "tip": "sayi"},
    {"anahtar": "mevcut", "etiket": "Mevcut Değer", "tip": "sayi"},
    {"anahtar": "sbti", "etiket": "SBTi Onaylı mı?", "tip": "secim", "liste": "evet_hayir"},
    {"anahtar": "not", "etiket": "Notlar", "tip": "metin"}
   ]
  },
  "anlatilar": [
   {"anahtar": "yontem", "etiket": "Hedef belirleme yöntemi ve doğrulama", "yardim": "md. 33-34 — Hedefin nasıl belirlendiği, üçüncü taraf doğrulaması, denkleştirme/karbon kredisi kullanımı."}
  ]
 },
 {
  "id": "onemlilik",
  "baslik": "Önemlilik Değerlendirmesi",
  "referans": "TSRS 1 md. 17-19 • B13-B37",
  "aciklama": "Sürdürülebilirlik konularının önemlilik değerlendirmesini kaydedin.",
  "tablo": {
   "etiket": "Değerlendirilen konular",
   "sutunlar": [
    {"anahtar": "kid", "etiket": "Kalem ID", "tip": "metin"},
    {"anahtar": "konu", "etiket": "Konu Açıklaması", "tip": "metin"},
    {"anahtar": "kategori", "etiket": "Kategori", "tip": "secim", "liste": "konu_kategorisi"},
    {"anahtar": "kaynak", "etiket": "Konunun Kaynağı", "tip": "metin"},
    {"anahtar": "olasilik", "etiket": "Olasılık (1-5)", "tip": "sayi"},
    {"anahtar": "etki", "etiket": "Etki (1-5)", "tip": "sayi"},
    {"anahtar": "onemli", "etiket": "Önemli mi?", "tip": "secim", "liste": "evet_hayir"},
    {"anahtar": "karar", "etiket": "Karar / Açıklanacak Bilgi", "tip": "uzun_metin"}
   ]
  },
  "anlatilar": [
   {"anahtar": "surec", "etiket": "Önemlilik değerlendirme süreci", "yardim": "Paydaş görüşleri, eşikler ve kullanılan yöntem."}
  ]
 },
 {
  "id": "karsilastirma",
  "baslik": "Karşılaştırmalı Bilgi ve Yeniden Düzenleme",
  "referans": "TSRS 1 md. 70 • B50-B51",
  "aciklama": "Önceki dönem verilerindeki revizyonları ve karşılaştırmalı bilgileri kaydedin. Fark ve yüzde otomatik hesaplanır.",
  "tablo": {
   "etiket": "Yeniden düzenleme kayıtları",
   "sutunlar": [
    {"anahtar": "did", "etiket": "Düzeltme ID", "tip": "metin"},
    {"anahtar": "metrik", "etiket": "Etkilenen Metrik", "tip": "metin"},
    {"anahtar": "orijinal", "etiket": "Orijinal Değer", "tip": "sayi"},
    {"anahtar": "revize", "etiket": "Revize Değer", "tip": "sayi"},
    {"anahtar": "donem", "etiket": "Orijinal Dönem", "tip": "metin"},
    {"anahtar": "gerekce", "etiket": "Revizyon Gerekçesi", "tip": "uzun_metin"}
   ]
  },
  "anlatilar": [
   {"anahtar": "onceki_donem", "etiket": "Önceki dönem emisyon özeti", "yardim": "Karşılaştırma için önceki raporlama dönemi toplam değerleri (Kapsam 1/2/3, tCO2e)."}
  ]
 },
 {
  "id": "muhakemeler",
  "baslik": "Muhakemeler ve Belirsizlikler",
  "referans": "TSRS 1 md. 74-82 • md. 54-59",
  "aciklama": "Açıklamaların hazırlanmasında kullanılan önemli muhakemeler, kaynaklar ve tahmin belirsizlikleri.",
  "tablo": {
   "etiket": "Dikkate alınan kaynak ve rehberler",
   "sutunlar": [
    {"anahtar": "kaynak", "etiket": "Kaynak / Rehber", "tip": "metin"},
    {"anahtar": "referans", "etiket": "Referans", "tip": "metin"},
    {"anahtar": "dikkate", "etiket": "Dikkate Alındı", "tip": "secim", "liste": "evet_hayir"},
    {"anahtar": "uygulandi", "etiket": "Uygulandı", "tip": "secim", "liste": "evet_hayir"},
    {"anahtar": "gerekce", "etiket": "Uygulanmadıysa Gerekçe", "tip": "metin"},
    {"anahtar": "alan", "etiket": "Uygulama Alanları", "tip": "metin"}
   ]
  },
  "anlatilar": [
   {"anahtar": "muhakeme", "etiket": "Önemli muhakemeler", "yardim": "md. 74 — Değer zinciri kapsamı, önemlilik kararları gibi en önemli yargılar."},
   {"anahtar": "belirsizlik", "etiket": "Tahmin belirsizlikleri", "yardim": "md. 77-82 — Emisyon faktörü seçimi, veri boşlukları, ölçüm belirsizliği."}
  ]
 }
];
