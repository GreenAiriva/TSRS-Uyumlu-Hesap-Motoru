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
  "referans": "TSRS 1 md. 26-27 • TSRS 2 md. 5-7",
  "aciklama": "Sürdürülebilirlik ve iklimle ilgili risk/fırsatları gözeten organlar ile yönetimin rolünü açıklayın.",
  "tablo": {
   "etiket": "Gözetimden sorumlu organlar ve kişiler",
   "sutunlar": [
    {"anahtar": "organ", "etiket": "Organ / Kişi Adı", "tip": "metin"},
    {"anahtar": "tur", "etiket": "Tür", "tip": "secim", "liste": "organ_turu"},
    {"anahtar": "rapor_merci", "etiket": "Raporladığı Merci", "tip": "metin"},
    {"anahtar": "toplanti", "etiket": "Toplantı Sıklığı", "tip": "secim", "liste": ["Aylık", "Üç Aylık", "Altı Aylık", "Yıllık", "Gerektiğinde"]},
    {"anahtar": "bilgilendirme", "etiket": "İklim Bilgilendirme Sıklığı", "tip": "secim", "liste": ["Her toplantıda", "Üç Aylık", "Altı Aylık", "Yıllık"]},
    {"anahtar": "uzman", "etiket": "İklim Uzmanı Üye", "tip": "sayi"},
    {"anahtar": "toplam_uye", "etiket": "Toplam Üye", "tip": "sayi"},
    {"anahtar": "yetki_ref", "etiket": "Yetki Belgesi Ref.", "tip": "metin"},
    {"anahtar": "not", "etiket": "Notlar", "tip": "metin"}
   ]
  },
  "anlatilar": [
   {"anahtar": "sorumluluk", "etiket": "Sorumlulukların görev tanımlarına yansıtılması", "yardim": "TSRS 1 md. 27(a)(i) — İklim sorumlulukları yönetmelik, komite görev tanımı veya politikalarda nasıl yer alıyor?"},
   {"anahtar": "yetkinlik", "etiket": "Yetkinliklerin belirlenmesi ve geliştirilmesi", "yardim": "md. 27(a)(ii) — Organın iklim konusundaki yetkinliği nasıl sağlanıyor (eğitim, danışmanlık, işe alım)?"},
   {"anahtar": "bilgilendirme_sureci", "etiket": "Organın bilgilendirilme süreci", "yardim": "md. 27(a)(iii) — Organ, iklim risk ve fırsatları hakkında hangi süreçle ve sıklıkla bilgilendiriliyor?"},
   {"anahtar": "strateji_gozetim", "etiket": "Strateji ve büyük işlem kararlarında iklim gözetimi", "yardim": "md. 27(a)(iv) — Strateji, büyük işlemler ve risk yönetimi kararlarında iklim nasıl dikkate alınıyor?"},
   {"anahtar": "hedef_gozetim", "etiket": "Hedef belirleme ve ilerlemenin gözetimi", "yardim": "md. 27(a)(v) — Hedeflerin belirlenmesi ve izlenmesi organ tarafından nasıl gözetiliyor?"},
   {"anahtar": "ucretlendirme", "etiket": "Ücretlendirme bağlantısı", "yardim": "TSRS 2 md. 29(g) — Yönetici ücretlendirmesi iklim performansına bağlı mı? Nasıl?"},
   {"anahtar": "yonetim_rolu", "etiket": "Yönetimin rolü ve devredilen yetkiler", "yardim": "md. 27(b) — Üst yönetimin günlük yönetimdeki rolü, kullanılan kontroller ve prosedürler."}
  ]
 },
 {
  "id": "risk_firsat",
  "baslik": "İklim Risk ve Fırsatları",
  "referans": "TSRS 2 md. 9-13",
  "aciklama": "İşletmeyi makul olarak etkileyebilecek fiziksel ve geçiş riskleri ile fırsatları kaydedin. Risk skoru (olasılık × etki) otomatik hesaplanır.",
  "tablo": {
   "etiket": "Risk ve fırsat kaydı",
   "sutunlar": [
    {"anahtar": "rid", "etiket": "ID", "tip": "metin"},
    {"anahtar": "baslik", "etiket": "Başlık", "tip": "metin"},
    {"anahtar": "tur", "etiket": "Tür", "tip": "secim", "liste": "risk_turu"},
    {"anahtar": "zaman", "etiket": "Zaman Dilimi", "tip": "secim", "liste": "zaman_dilimi"},
    {"anahtar": "olasilik", "etiket": "Olasılık (1-5)", "tip": "sayi"},
    {"anahtar": "etki", "etiket": "Etki (1-5)", "tip": "sayi"},
    {"anahtar": "konum", "etiket": "Değer Zinciri Konumu", "tip": "secim", "liste": "deger_zinciri_konumu"},
    {"anahtar": "tutar", "etiket": "Niceliksel Etki (Bin TL)", "tip": "sayi"},
    {"anahtar": "aciklama", "etiket": "Açıklama", "tip": "uzun_metin"}
   ]
  },
  "anlatilar": [
   {"anahtar": "kisa_vade", "etiket": "Kısa vade tanımı ve gerekçesi", "yardim": "TSRS 2 md. 10(d) — örn. 3 yıla kadar; işletmenin planlama ufkuyla bağlantısı."},
   {"anahtar": "orta_vade", "etiket": "Orta vade tanımı ve gerekçesi", "yardim": "örn. 3-10 yıl."},
   {"anahtar": "uzun_vade", "etiket": "Uzun vade tanımı ve gerekçesi", "yardim": "örn. 10 yıldan uzun; madencilikte rezerv/ruhsat ömrüyle ilişkilendirilebilir."}
  ]
 },
 {
  "id": "strateji",
  "baslik": "Strateji ve Karar Alma",
  "referans": "TSRS 2 md. 13-22",
  "aciklama": "İklim risk ve fırsatlarının iş modeli, değer zinciri, strateji ve finansal durum üzerindeki etkilerini açıklayın.",
  "tablo": {
   "etiket": "İş modeli ve değer zinciri etkileri",
   "sutunlar": [
    {"anahtar": "alan", "etiket": "İş Modeli / Değer Zinciri Alanı", "tip": "secim", "liste": ["Operasyonlar / Üretim", "Girdiler / Hammaddeler", "Lojistik", "Satış Kanalları", "İnsan Kaynakları", "Finansman", "Diğer"]},
    {"anahtar": "etki", "etiket": "Etkinin Açıklaması", "tip": "uzun_metin"},
    {"anahtar": "risk_id", "etiket": "Bağlı Risk/Fırsat ID", "tip": "metin"},
    {"anahtar": "zaman", "etiket": "Zaman Dilimi", "tip": "secim", "liste": "zaman_dilimi"},
    {"anahtar": "yon", "etiket": "Etki Yönü", "tip": "secim", "liste": "etki_yonu"}
   ]
  },
  "anlatilar": [
   {"anahtar": "strateji_etki", "etiket": "Strateji ve karar almaya etkiler", "yardim": "md. 14 — İklim risk/fırsatlarına yanıt olarak strateji ve kaynak planlamasında yapılan/planlanan değişiklikler."},
   {"anahtar": "gecis_plani", "etiket": "İklim geçiş planı", "yardim": "md. 14(a)(iv) — Varsa geçiş planının temel varsayımları ve bağımlılıkları."},
   {"anahtar": "finansal_mevcut", "etiket": "Mevcut finansal etkiler", "yardim": "md. 16 — Raporlama dönemindeki finansal durum, performans ve nakit akışlarına etkiler (nicel/nitel)."},
   {"anahtar": "finansal_beklenen", "etiket": "Beklenen finansal etkiler", "yardim": "md. 16 — Kısa, orta ve uzun vadede beklenen etkiler."},
   {"anahtar": "yatirim", "etiket": "İklimle ilgili yatırım ve elden çıkarma planları", "yardim": "md. 14(a)(iii) — Yatırım programları, Ar-Ge, varlık satışları."}
  ]
 },
 {
  "id": "direnclilik",
  "baslik": "İklim Dirençliliği ve Senaryo Analizi",
  "referans": "TSRS 2 md. 22 • md. B1-B18",
  "aciklama": "Senaryo analizi kullanarak stratejinin iklim değişikliğine karşı dirençliliğini değerlendirin.",
  "tablo": {
   "etiket": "Kullanılan senaryolar",
   "sutunlar": [
    {"anahtar": "senaryo", "etiket": "Senaryo", "tip": "secim", "liste": "senaryo"},
    {"anahtar": "paris", "etiket": "Paris Uyumlu mu?", "tip": "secim", "liste": "evet_hayir"},
    {"anahtar": "sicaklik", "etiket": "Sıcaklık Varsayımı", "tip": "metin"},
    {"anahtar": "ufuk", "etiket": "Zaman Ufku", "tip": "metin"},
    {"anahtar": "varsayim", "etiket": "Temel Varsayımlar", "tip": "uzun_metin"},
    {"anahtar": "tutar", "etiket": "Niceliksel Etki (Bin TL)", "tip": "sayi"},
    {"anahtar": "sonuc", "etiket": "Sonuçlar", "tip": "uzun_metin"}
   ]
  },
  "anlatilar": [
   {"anahtar": "yaklasim", "etiket": "Analitik yaklaşımın seçimi", "yardim": "md. B2-B7 — Nitel mi nicel mi; kapsam ve yöntem seçiminin gerekçesi (maliyet/yetenek dengesi)."},
   {"anahtar": "degerlendirme", "etiket": "Dirençlilik değerlendirmesinin sonucu", "yardim": "md. 22(a) — Stratejinin senaryolardaki performansı; uyum kapasitesi."},
   {"anahtar": "belirsizlik", "etiket": "Önemli belirsizlik alanları", "yardim": "md. 22(a)(ii) — Analizde dikkate alınan önemli belirsizlikler."},
   {"anahtar": "tarih", "etiket": "Son değerlendirme tarihi ve sıklığı", "yardim": "md. B18 — Analizin yapıldığı tarih ve güncelleme sıklığı."}
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
