/* ============================================================
   TSRS 2 EK CİLTLERİ — SEKTÖR-METRİK KATALOĞU (66 cilt: 1-68, Cilt 2 ve 51 yok)
   ------------------------------------------------------------
   Sprint 0 çıktısı. Her cilt bir SASB/TSRS sektör rehberidir.
   Şirket profili oluşturulurken uygulanabilir ciltler seçilir;
   dinamik form motoru bu ciltlerin metriklerini forma ekler.
   metrik.tip: 'hesap' (motor hesaplar) | 'veri' (kullanıcı girer) | 'ta' (anlatı metni)
   metrik.ortak: birden çok cildde ortak metrik anahtarı (tek hesap)
   ============================================================ */
window.VERI = window.VERI || {};
VERI.sektor_aileleri = {
 "CG": "Tüketim Ürünleri",
 "EM": "Çıkarım ve Mineraller",
 "FB": "Gıda ve İçecek",
 "FN": "Finans",
 "HC": "Sağlık",
 "IF": "Altyapı",
 "RR": "Yenilenebilir Kaynaklar",
 "RT": "Kaynak Dönüşümü",
 "SV": "Hizmetler",
 "TC": "Teknoloji ve İletişim",
 "TR": "Ulaşım"
};
VERI.sektor_ciltleri = [
 {
  "no": 1,
  "ad": "Giyim, Aksesuar ve Ayakkabı",
  "prefix": "CG-AA",
  "tip": "orta",
  "metrikler": [
   {"kod": "CG-AA-440a.3", "ad": "Öncelikli ham madde çevresel/sosyal risk yönetimi", "tip": "ta"},
   {"kod": "CG-AA-440a.4", "ad": "Malzeme bazında satın alınan öncelikli ham madde + sertifika oranı", "tip": "veri", "birim": "ton, %"},
   {"kod": "CG-AA-000.A", "ad": "Kademe 1 ve Kademe 1-dışı tedarikçi sayısı", "tip": "veri", "birim": "sayı"}
  ]
 },
 {
  "no": 2,
  "ad": "Ev Aletleri İmalatı",
  "prefix": "CG-AM",
  "tip": "hafif",
  "metrikler": [
   {"kod": "CG-AM-410a.1", "ad": "Enerji verimliliği sertifikalı uygun ürün geliri %", "tip": "veri", "birim": "%"},
   {"kod": "CG-AM-410a.2", "ad": "Çevresel ürün yaşam döngüsü standardı sertifikalı uygun ürün geliri %", "tip": "veri", "birim": "%"},
   {"kod": "CG-AM-410a.3", "ad": "Ürün kullanım ömrü sonu etkilerini yönetme çabaları", "tip": "ta"},
   {"kod": "CG-AM-000.A", "ad": "Yıllık üretim (ürün kategorisine göre birim)", "tip": "veri", "birim": "birim sayısı"}
  ]
 },
 {
  "no": 3,
  "ad": "Yapı Ürünleri ve Mobilya",
  "prefix": "CG-BF",
  "tip": "orta",
  "onSecim": true,
  "metrikler": [
   {"kod": "CG-BF-130a.1", "ad": "Toplam enerji, şebeke %, yenilenebilir %", "tip": "hesap", "birim": "GJ, %", "ortak": "enerji"},
   {"kod": "CG-BF-410a.1", "ad": "Ürün yaşam döngüsü etkilerini yönetme + sürdürülebilir ürün talebi", "tip": "ta"},
   {"kod": "CG-BF-410a.2", "ad": "Geri kazanılan malzeme ağırlığı + geri dönüşüm %", "tip": "veri", "birim": "t, %"},
   {"kod": "CG-BF-430a.1", "ad": "Ahşap lifi tedarik + sertifika % (FSC/PEFC/SFI)", "tip": "veri", "birim": "t, %"},
   {"kod": "CG-BF-000.A", "ad": "Yıllık üretim", "tip": "veri", "birim": "birim/t/m²"},
   {"kod": "CG-BF-000.B", "ad": "Üretim tesisi alanı", "tip": "veri", "birim": "m²"}
  ]
 },
 {
  "no": 4,
  "ad": "E-Ticaret",
  "prefix": "CG-EC",
  "tip": "hafif",
  "metrikler": [
   {"kod": "CG-EC-130a.1", "ad": "Donanım altyapısı enerji: toplam, şebeke %, yenilenebilir %", "tip": "hesap", "birim": "GJ, %", "ortak": "enerji"},
   {"kod": "CG-EC-130a.2", "ad": "Su yönetimi: çekilen/tüketilen, su stresi %", "tip": "hesap", "birim": "bin m³, %", "ortak": "su"},
   {"kod": "CG-EC-130a.3", "ad": "Veri merkezi çevresel hususların stratejik planlamaya entegrasyonu", "tip": "ta"},
   {"kod": "CG-EC-410a.1", "ad": "Ürün sevkiyatlarının toplam GHG ayak izi", "tip": "hesap", "birim": "tCO2e", "kapsam": 3},
   {"kod": "CG-EC-410a.2", "ad": "Ürün teslimat çevresel etkisini azaltma stratejisi", "tip": "ta"},
   {"kod": "CG-EC-000.A", "ad": "Kullanıcı etkinliği ölçüsü", "tip": "veri"},
   {"kod": "CG-EC-000.B", "ad": "Veri işleme kapasitesi + dış kaynak %", "tip": "veri"},
   {"kod": "CG-EC-000.C", "ad": "Sevkiyat sayısı", "tip": "veri", "birim": "sayı"}
  ]
 },
 {
  "no": 5,
  "ad": "Ev ve Kişisel Bakım Ürünleri",
  "prefix": "CG-HP",
  "tip": "orta",
  "metrikler": [
   {"kod": "CG-HP-140a.1", "ad": "Su yönetimi: çekilen/tüketilen, su stresi %", "tip": "hesap", "birim": "bin m³, %", "ortak": "su"},
   {"kod": "CG-HP-140a.2", "ad": "Su yönetimi risk tanımı + strateji", "tip": "ta"},
   {"kod": "CG-HP-430a.1", "ad": "Palm yağı tedarik + RSPO sertifika oranı", "tip": "veri", "birim": "ton, %"},
   {"kod": "CG-HP-000.A", "ad": "Satılan ürün adedi + toplam ağırlık", "tip": "veri"},
   {"kod": "CG-HP-000.B", "ad": "Üretim tesisi sayısı", "tip": "veri", "birim": "sayı"}
  ]
 },
 {
  "no": 6,
  "ad": "Çok Hatlı ve Özel Perakendeciler ve Distribütörler",
  "prefix": "CG-MR",
  "tip": "hafif",
  "onSecim": true,
  "metrikler": [
   {"kod": "CG-MR-130a.1", "ad": "Toplam enerji, şebeke %, yenilenebilir %", "tip": "hesap", "birim": "GJ, %", "ortak": "enerji",
    "bilesen": [
     {"no": 1, "ad": "Tüketilen toplam enerji", "birim": "GJ", "kaynak": "motor", "motorAnahtar": "enerji.toplamGJ_gcv", "not": "Cilt 6 md. 1.3: brüt ısıl değer (GCV/HHV) esaslı. Kapsam: yakıt + satın alınan elektrik + ısı/buhar/soğutma + öz tüketilen kendi üretimi.", "kapsamUyarisi": "Tesis kütüğü kurulana kadar TÜM tesisleri kapsar; Cilt 6 yalnızca perakende satış ve dağıtım tesislerini ister."},
     {"no": 2, "ad": "Şebeke elektriği yüzdesi", "birim": "%", "kaynak": "motor", "motorAnahtar": "enerji.sebekeYuzde", "yuzde": true, "not": "md. 2.1: satın alınan şebeke elektriği / toplam enerji."},
     {"no": 3, "ad": "Yenilenebilir enerji yüzdesi", "birim": "%", "kaynak": "motor", "motorAnahtar": "enerji.yenilenebilirYuzde", "yuzde": true, "not": "md. 4.3.1: yerinde üretimde YEK-G/REC elde tutulmuş ve iptal edilmiş olmalı. md. 4.3.3: şebeke karışımının yenilenebilir payı iddia edilemez. Şebeke yüzdesiyle çakışabilir."}
    ]},
   {"kod": "CG-MR-000.A", "ad": "Perakende satış yeri + dağıtım merkezi sayısı", "tip": "veri", "birim": "sayı",
    "slot": "tesis",
    "bilesen": [
     {"no": 1, "ad": "Perakende satış yeri sayısı", "birim": "sayı", "kaynak": "motor", "motorAnahtar": "tesis.perakendeSayi", "not": "Aşağıdaki tesis tablosundan sayılır. Satırlar organizasyon hiyerarşisinden (indeks.org) canlı gelir; hiyerarşiye eklenen tesis tabloya düşer, çıkarılan sayımdan düşer."},
     {"no": 2, "ad": "Dağıtım merkezi sayısı", "birim": "sayı", "kaynak": "motor", "motorAnahtar": "tesis.dagitimSayi"}
    ]},
   {"kod": "CG-MR-000.B", "ad": "Perakende alanı + dağıtım merkezi alanı", "tip": "veri", "birim": "m²",
    "slot": "tesis",
    "bilesen": [
     {"no": 1, "ad": "Perakende alanı", "birim": "m²", "kaynak": "motor", "motorAnahtar": "tesis.perakendeM2", "not": "Tesis tablosundaki perakende alanlarının toplamı. DEPO+SHOWROOM tesislerde perakende ve dağıtım alanı ayrı girilir; aynı m² iki metrikte sayılmaz."},
     {"no": 2, "ad": "Dağıtım merkezlerinin toplam alanı", "birim": "m²", "kaynak": "motor", "motorAnahtar": "tesis.dagitimM2"}
    ]}
  ]
 },
 {
  "no": 7,
  "ad": "Kömür Faaliyetleri",
  "prefix": "EM-CO",
  "tip": "agir",
  "metrikler": [
   {"kod": "EM-CO-110a.1", "ad": "Brüt K1 + düzenleme kapsamı %", "tip": "hesap", "birim": "tCO2e, %", "ortak": "k1", "kapsam": 1},
   {"kod": "EM-CO-110a.2", "ad": "K1 emisyon stratejisi/planı + performans", "tip": "ta"},
   {"kod": "EM-CO-140a.1", "ad": "Su çekme/tüketme, su stresi %", "tip": "hesap", "birim": "bin m³, %", "ortak": "su"},
   {"kod": "EM-CO-140a.2", "ad": "Su kalitesi uyumsuzluk olayları", "tip": "veri", "birim": "sayı"},
   {"kod": "EM-CO-420a.1", "ad": "Kömür rezervlerinin fiyat senaryolarına duyarlılığı", "tip": "veri", "birim": "Mt"},
   {"kod": "EM-CO-420a.2", "ad": "Rezervlere gömülü tahmini CO2", "tip": "hesap", "birim": "tCO2e"},
   {"kod": "EM-CO-420a.3", "ad": "Kömür talebi/iklim düzenleme CAPEX etkisi", "tip": "ta"},
   {"kod": "EM-CO-000.A", "ad": "Termal kömür üretimi", "tip": "veri", "birim": "Mt"},
   {"kod": "EM-CO-000.B", "ad": "Metalurjik kömür üretimi", "tip": "veri", "birim": "Mt"}
  ]
 },
 {
  "no": 8,
  "ad": "İnşaat Malzemeleri",
  "prefix": "EM-CM",
  "tip": "agir",
  "onSecim": true,
  "metrikler": [
   {"kod": "EM-CM-110a.1", "ad": "Brüt K1 + emisyon sınırlayıcı düzenleme %", "tip": "hesap", "birim": "tCO2e, %", "ortak": "k1", "kapsam": 1,
    "bilesen": [
     {"no": 1, "ad": "Brüt toplam Kapsam 1 emisyonları", "birim": "tCO2e", "kaynak": "motor", "motorAnahtar": "k1.toplam", "not": "Kyoto Protokolü kapsamındaki yedi sera gazı (CO2, CH4, N2O, HFC, PFC, SF6, NF3)."},
     {"no": 2, "ad": "Emisyon sınırlayıcı düzenlemeler kapsamındaki yüzde", "birim": "%", "kaynak": "manuel", "yuzde": true, "not": "Türkiye ETS (7552 sayılı İklim Kanunu) 2026-2027 pilot dönemi çimento, demir-çelik, alüminyum ve gübre sektörlerinde 50.000 tCO2e/yıl üzeri tesisleri kapsar. Kapsam dışıysa gerekçeli 0 girin."}
    ]},
   {"kod": "EM-CM-110a.2", "ad": "K1 stratejisi/planı + performans", "tip": "ta"},
   {"kod": "EM-CM-120a.1", "ad": "Hava kalitesi: NOx, SOx, PM10, dioksin/furan, VOC, PAH, ağır metal", "tip": "hesap", "birim": "t",
    "bilesen": [
     {"no": 1, "ad": "NOx (N2O hariç)", "birim": "t", "kaynak": "manuel"},
     {"no": 2, "ad": "SOx", "birim": "t", "kaynak": "manuel"},
     {"no": 3, "ad": "Partikül madde (PM10)", "birim": "t", "kaynak": "manuel"},
     {"no": 4, "ad": "Dioksinler / furanlar", "birim": "t", "kaynak": "manuel"},
     {"no": 5, "ad": "Uçucu organik bileşikler (VOC)", "birim": "t", "kaynak": "manuel"},
     {"no": 6, "ad": "Polisiklik aromatik hidrokarbonlar (PAH)", "birim": "t", "kaynak": "manuel"},
     {"no": 7, "ad": "Ağır metaller", "birim": "t", "kaynak": "manuel"}
    ]},
   {"kod": "EM-CM-130a.1", "ad": "Toplam enerji, şebeke %, alternatif %, yenilenebilir %", "tip": "hesap", "birim": "GJ, %", "ortak": "enerji",
    "bilesen": [
     {"no": 1, "ad": "Tüketilen toplam enerji", "birim": "GJ", "kaynak": "motor", "motorAnahtar": "enerji.toplamGJ_gcv", "not": "Cilt 8 md. 1.3: brüt ısıl değer (GCV/HHV) esaslı.", "kapsamUyarisi": "Bu satır Cilt 6 ve Cilt 8'e birlikte hizmet ediyor ancak tesis kapsamları farklı: Cilt 8 üretim tesislerini, Cilt 6 yalnızca perakende satış ve dağıtım tesislerini ister. Tesis kütüğü kurulana kadar değer TÜM tesisleri kapsıyor."},
     {"no": 2, "ad": "Şebeke elektriği yüzdesi", "birim": "%", "kaynak": "motor", "motorAnahtar": "enerji.sebekeYuzde", "yuzde": true},
     {"no": 3, "ad": "Alternatif enerji yüzdesi", "birim": "%", "kaynak": "motor", "motorAnahtar": "enerji.alternatifYuzde", "yuzde": true, "not": "Atık türevli yakıtlar: kullanılmış lastik, atık yağ ve çözücü, işlenmiş belediye/evsel atık, tarımsal atık (pirinç-fıstık-kahve kabuğu), hayvan yemi, kanalizasyon çamuru. Yoksa gerekçeli 0."},
     {"no": 4, "ad": "Yenilenebilir enerji yüzdesi", "birim": "%", "kaynak": "motor", "motorAnahtar": "enerji.yenilenebilirYuzde", "yuzde": true, "not": "md. 4.3.1 YEK-G/REC elde tutulmuş ve iptal edilmiş olmalı; md. 4.3.3 şebeke karışımı iddia edilemez."}
    ]},
   {"kod": "EM-CM-140a.1", "ad": "Çekilen/tüketilen su + su stresi %", "tip": "hesap", "birim": "bin m³, %", "ortak": "su",
    "bilesen": [
     {"no": 1, "ad": "Çekilen toplam su", "birim": "bin m³", "kaynak": "manuel", "not": "Tüm kaynaklar: yüzey suyu, yer altı suyu, işletmenin topladığı yağmur suyu, belediye/su idaresi veya başka işletmelerden alınan su ve atık su. Yasal tanım yoksa tatlı su = <1.000 ppm çözünmüş katı."},
     {"no": 2, "ad": "Tüketilen toplam su", "birim": "bin m³", "kaynak": "manuel", "not": "Tüketim = buharlaşan su + ürün/hizmete katılan su + çekildiği toplama alanına geri dönmeyen su. Çekim eksi deşarj."},
     {"no": 3, "ad": "Su stresli bölgelerden çekim yüzdesi", "birim": "%", "kaynak": "manuel", "yuzde": true, "not": "WRI Su Riski Atlası: Yüksek (%40-80) veya Aşırı Yüksek (>%80) Temel Su Stresi. Atlas sürümü ve sorgu tarihi yazılmalı. Saha bazlı veri gerektirir."},
     {"no": 4, "ad": "Su stresli bölgelerde tüketim yüzdesi", "birim": "%", "kaynak": "manuel", "yuzde": true}
    ]},
   {"kod": "EM-CM-150a.1", "ad": "Atık: üretilen miktar + tehlikeli % + geri dönüşüm %", "tip": "veri", "birim": "t, %",
    "bilesen": [
     {"no": 1, "ad": "Üretilen toplam atık", "birim": "t", "kaynak": "manuel", "not": "Gaz atıklar kapsam dışıdır (md. 1.3)."},
     {"no": 2, "ad": "Tehlikeli atık yüzdesi", "birim": "%", "kaynak": "manuel", "yuzde": true, "not": "Türkiye'de Atık Yönetimi Yönetmeliği Ek-4 listesinde yıldızlı (*) kodlar tehlikelidir."},
     {"no": 3, "ad": "Geri dönüştürülen atık yüzdesi", "birim": "%", "kaynak": "manuel", "yuzde": true, "not": "md. 3.2: enerji geri kazanımı dâhil yakılan malzemeler (R1) geri dönüştürülmüş SAYILMAZ. Düzenli depolamaya gidenler (D kodları) de sayılmaz."}
    ]},
   {"kod": "EM-CM-410a.1", "ad": "Sürdürülebilir yapı sertifikası ürün geliri % (LEED/BREEAM)", "tip": "veri", "birim": "%",
    "bilesen": [
     {"no": 1, "ad": "Sertifikalı sürdürülebilir yapı ürünlerinden gelir yüzdesi", "birim": "%", "kaynak": "manuel", "yuzde": true}
    ]},
   {"kod": "EM-CM-410a.2", "ad": "Çevresel etki azaltan ürünler için pazar + pazar payı", "tip": "ta",
    "bilesen": [
     {"no": 1, "ad": "Toplam adreslenebilir pazar", "birim": "para birimi", "kaynak": "manuel", "not": "DİKKAT: bu metrik katalogda tip='ta' (anlatı) olarak sınıflanmış, ancak cilt nicel açıklama istiyor. Sınıflandırma kararı bekliyor."},
     {"no": 2, "ad": "Pazar payı", "birim": "%", "kaynak": "manuel", "yuzde": true}
    ]},
   {"kod": "EM-CM-000.A", "ad": "Ana ürün grubuna göre üretim", "tip": "veri", "birim": "t",
    "bilesenTipi": "dinamik",
    "satirSemasi": {"urunGrubu": "metin", "gelirPayi": "%", "miktar": "t"},
    "not": "Ana ürün hattının belirlenmesi gelir elde edilmesine dayalı olmalıdır; çok sayıda küçük gelir akışı 'diğer' kategorisinde birleştirilebilir. Bileşen sayısı sabit değildir."}
  ]
 },
 {
  "no": 9,
  "ad": "Demir ve Çelik Üreticileri",
  "prefix": "EM-IS",
  "tip": "agir",
  "metrikler": [
   {"kod": "EM-IS-110a.1", "ad": "Brüt K1 + düzenleme kapsamı %", "tip": "hesap", "birim": "tCO2e, %", "ortak": "k1", "kapsam": 1},
   {"kod": "EM-IS-110a.2", "ad": "K1 stratejisi/planı + performans", "tip": "ta"},
   {"kod": "EM-IS-130a.1", "ad": "Toplam enerji, şebeke %, yenilenebilir %", "tip": "hesap", "birim": "GJ, %", "ortak": "enerji"},
   {"kod": "EM-IS-130a.2", "ad": "Tüketilen yakıt + kömür/doğalgaz/yenilenebilir %", "tip": "hesap", "birim": "GJ, %"},
   {"kod": "EM-IS-140a.1", "ad": "Çekilen/tüketilen su + su stresi %", "tip": "hesap", "birim": "bin m³, %", "ortak": "su"},
   {"kod": "EM-IS-430a.1", "ad": "Demir cevheri/kok kömürü tedarik zinciri risk yönetimi", "tip": "ta"},
   {"kod": "EM-IS-000.A", "ad": "Ham çelik üretimi + BOF % + EAF %", "tip": "veri", "birim": "t, %"},
   {"kod": "EM-IS-000.B", "ad": "Demir cevheri üretimi", "tip": "veri", "birim": "t"},
   {"kod": "EM-IS-000.C", "ad": "Kok kömürü üretimi", "tip": "veri", "birim": "t"}
  ]
 },
 {
  "no": 10,
  "ad": "Metaller ve Madencilik",
  "prefix": "EM-MM",
  "tip": "agir",
  "onSecim": true,
  "ana": true,
  "metrikler": [
   {"kod": "EM-MM-110a.1", "ad": "Brüt K1 + emisyon sınırlayıcı düzenleme %", "tip": "hesap", "birim": "tCO2e, %", "ortak": "k1", "kapsam": 1},
   {"kod": "EM-MM-110a.2", "ad": "K1 stratejisi/planı + performans", "tip": "ta"},
   {"kod": "EM-MM-130a.1", "ad": "Toplam enerji, şebeke %, yenilenebilir %", "tip": "hesap", "birim": "GJ, %", "ortak": "enerji"},
   {"kod": "EM-MM-140a.1", "ad": "Çekilen/tüketilen su + su stresi %", "tip": "hesap", "birim": "bin m³, %", "ortak": "su"},
   {"kod": "EM-MM-140a.2", "ad": "Su kalitesi uyumsuzluk olayları", "tip": "veri", "birim": "sayı"},
   {"kod": "EM-MM-000.A", "ad": "Metal cevheri + bitmiş metal ürün üretimi", "tip": "veri", "birim": "t"},
   {"kod": "EM-MM-000.B", "ad": "Toplam çalışan sayısı + yüklenici %", "tip": "veri", "birim": "sayı, %"}
  ]
 },
 {
  "no": 11,
  "ad": "Petrol ve Gaz – Arama ve Üretim",
  "prefix": "EM-EP",
  "tip": "agir",
  "metrikler": [
   {"kod": "EM-EP-110a.1", "ad": "Brüt K1 + metan % + düzenleme %", "tip": "hesap", "birim": "tCO2e, %", "ortak": "k1", "kapsam": 1},
   {"kod": "EM-EP-110a.2", "ad": "K1 kaynak dökümü (alev/yanma/süreç/baca/kaçak)", "tip": "hesap", "birim": "tCO2e"},
   {"kod": "EM-EP-110a.3", "ad": "K1 stratejisi/planı", "tip": "ta"},
   {"kod": "EM-EP-140a.1", "ad": "Su çekme/tüketme + su stresi %", "tip": "hesap", "birim": "bin m³, %", "ortak": "su"},
   {"kod": "EM-EP-140a.2", "ad": "Üretilen su + geri akış", "tip": "veri", "birim": "bin m³"},
   {"kod": "EM-EP-420a.1", "ad": "Hidrokarbon rezerv duyarlılığı", "tip": "veri"},
   {"kod": "EM-EP-000.A", "ad": "Petrol/gaz/sentetik üretim", "tip": "veri"}
  ]
 },
 {
  "no": 12,
  "ad": "Petrol ve Gaz – Orta Akım",
  "prefix": "EM-MD",
  "tip": "agir",
  "metrikler": [
   {"kod": "EM-MD-110a.1", "ad": "Brüt K1 + metan % + düzenleme %", "tip": "hesap", "birim": "tCO2e, %", "ortak": "k1", "kapsam": 1},
   {"kod": "EM-MD-110a.2", "ad": "K1 stratejisi/planı", "tip": "ta"},
   {"kod": "EM-MD-000.A", "ad": "Taşıma ton-km (gaz/petrol/rafine)", "tip": "veri", "birim": "ton-km"}
  ]
 },
 {
  "no": 13,
  "ad": "Petrol ve Gaz – Rafineri ve Pazarlama",
  "prefix": "EM-RM",
  "tip": "agir",
  "metrikler": [
   {"kod": "EM-RM-110a.1", "ad": "Brüt K1 + düzenleme %", "tip": "hesap", "birim": "tCO2e, %", "ortak": "k1", "kapsam": 1},
   {"kod": "EM-RM-110a.2", "ad": "K1 stratejisi/planı", "tip": "ta"},
   {"kod": "EM-RM-140a.1", "ad": "Su çekme/tüketme + su stresi %", "tip": "hesap", "birim": "bin m³, %", "ortak": "su"},
   {"kod": "EM-RM-410a.2", "ad": "Gelişmiş biyoyakıt pazarı", "tip": "veri"},
   {"kod": "EM-RM-410a.3", "ad": "Yenilenebilir yakıt hacmi", "tip": "veri", "birim": "BOE"},
   {"kod": "EM-RM-000.A", "ad": "Rafine ham petrol", "tip": "veri", "birim": "BOE"}
  ]
 },
 {
  "no": 14,
  "ad": "Petrol ve Gaz Hizmetleri",
  "prefix": "EM-SV",
  "tip": "orta",
  "metrikler": [
   {"kod": "EM-SV-110a.1", "ad": "Tüketilen yakıt + yenilenebilir %", "tip": "hesap", "birim": "GJ, %"},
   {"kod": "EM-SV-110a.2", "ad": "Hava emisyonu stratejisi", "tip": "ta"},
   {"kod": "EM-SV-140a.1", "ad": "Kullanılan su + geri dönüşüm %", "tip": "hesap", "birim": "bin m³, %", "ortak": "su"},
   {"kod": "EM-SV-140a.2", "ad": "Su tüketimi/atık stratejisi", "tip": "ta"},
   {"kod": "EM-SV-000.A", "ad": "Aktif teçhizat sahası", "tip": "veri", "birim": "sayı"}
  ]
 },
 {
  "no": 15,
  "ad": "Varlık Yönetimi ve Saklama",
  "prefix": "FN-AC",
  "tip": "finansal",
  "metrikler": [
   {"kod": "FN-AC-410a.1", "ad": "ÇSY entegrasyonu/sürdürülebilirlik/tarama AUM", "tip": "veri"},
   {"kod": "FN-AC-410a.2", "ad": "ÇSY entegrasyon yaklaşımı", "tip": "ta"},
   {"kod": "FN-AC-410a.3", "ad": "Vekaleten oy + yatırım politikası", "tip": "ta"},
   {"kod": "FN-AC-000.A", "ad": "Yönetilen + saklanan varlık", "tip": "veri"}
  ]
 },
 {
  "no": 16,
  "ad": "Ticari Bankalar",
  "prefix": "FN-CB",
  "tip": "finansal",
  "metrikler": [
   {"kod": "FN-CB-410a.1", "ad": "ÇSY kredilendirme (sektör bazında)", "tip": "veri"},
   {"kod": "FN-CB-410a.2", "ad": "ÇSY kredi analizine dâhil", "tip": "ta"},
   {"kod": "FN-CB-000.A", "ad": "Kredi sayısı/değeri (sektör)", "tip": "veri"}
  ]
 },
 {
  "no": 17,
  "ad": "Sigortacılık",
  "prefix": "FN-IN",
  "tip": "finansal",
  "metrikler": [
   {"kod": "FN-IN-410a.2", "ad": "ÇSY yatırım yönetimi", "tip": "ta"},
   {"kod": "FN-IN-410b.1", "ad": "Enerji verimliliği/düşük karbon primleri", "tip": "veri"},
   {"kod": "FN-IN-450a.1", "ad": "Hava afeti Beklenen Azami Zarar (PML)", "tip": "veri"},
   {"kod": "FN-IN-450a.2", "ad": "İklim risk modelleme", "tip": "ta"},
   {"kod": "FN-IN-000.A", "ad": "Yazılan prim", "tip": "veri"}
  ]
 },
 {
  "no": 18,
  "ad": "Yatırım Bankacılığı ve Brokerlik",
  "prefix": "FN-IB",
  "tip": "finansal",
  "metrikler": [
   {"kod": "FN-IB-410a.1", "ad": "ÇSY (aracılık/danışmanlık geliri)", "tip": "veri"},
   {"kod": "FN-IB-410a.2", "ad": "ÇSY yaklaşımı", "tip": "ta"},
   {"kod": "FN-IB-000.A", "ad": "İşlem hacmi (sektör)", "tip": "veri"}
  ]
 },
 {
  "no": 19,
  "ad": "İpotek Finansmanı",
  "prefix": "FN-MF",
  "tip": "finansal",
  "metrikler": [
   {"kod": "FN-MF-450a.1", "ad": "Sel bölgesi ipotek sayısı/değeri", "tip": "veri"},
   {"kod": "FN-MF-450a.2", "ad": "İklim risk", "tip": "ta"},
   {"kod": "FN-MF-000.A", "ad": "İpotek portföyü", "tip": "veri"}
  ]
 },
 {
  "no": 20,
  "ad": "Tarımsal Ürünler",
  "prefix": "FB-AG",
  "tip": "agir",
  "metrikler": [
   {"kod": "FB-AG-110a.1", "ad": "Brüt K1 emisyon", "tip": "hesap", "birim": "tCO2e", "ortak": "k1", "kapsam": 1},
   {"kod": "FB-AG-110a.2", "ad": "K1 stratejisi", "tip": "ta"},
   {"kod": "FB-AG-110a.3", "ad": "Yakıt yönetimi", "tip": "hesap", "birim": "GJ"},
   {"kod": "FB-AG-130a.1", "ad": "Enerji yönetimi", "tip": "hesap", "birim": "GJ, %", "ortak": "enerji"},
   {"kod": "FB-AG-140a.1", "ad": "Su çekme + su stresi %", "tip": "hesap", "birim": "bin m³, %", "ortak": "su"},
   {"kod": "FB-AG-440a.1", "ad": "Ana mahsul iklim riski", "tip": "ta"},
   {"kod": "FB-AG-000.A", "ad": "Üretim/işleme tonajı", "tip": "veri", "birim": "t"}
  ]
 },
 {
  "no": 21,
  "ad": "Alkollü İçecekler",
  "prefix": "FB-AB",
  "tip": "orta",
  "metrikler": [
   {"kod": "FB-AB-130a.1", "ad": "Enerji yönetimi", "tip": "hesap", "birim": "GJ, %", "ortak": "enerji"},
   {"kod": "FB-AB-140a.1", "ad": "Su yönetimi", "tip": "hesap", "birim": "bin m³, %", "ortak": "su"},
   {"kod": "FB-AB-140a.2", "ad": "Su stresi içecek bileşeni %", "tip": "veri", "birim": "%"},
   {"kod": "FB-AB-430a.1", "ad": "Tedarikçi denetimi", "tip": "ta"},
   {"kod": "FB-AB-000.A", "ad": "Üretim hacmi", "tip": "veri"}
  ]
 },
 {
  "no": 22,
  "ad": "Gıda Perakendecileri ve Distribütörleri",
  "prefix": "FB-FR",
  "tip": "orta",
  "metrikler": [
   {"kod": "FB-FR-110a.1", "ad": "Filo yakıt + yenilenebilir %", "tip": "hesap", "birim": "GJ, %", "kapsam": 1},
   {"kod": "FB-FR-110b.1", "ad": "Soğutucu akışkan K1 emisyonu", "tip": "hesap", "birim": "tCO2e", "ortak": "sogutucu", "kapsam": 1},
   {"kod": "FB-FR-130a.1", "ad": "Enerji yönetimi", "tip": "hesap", "birim": "GJ, %", "ortak": "enerji"},
   {"kod": "FB-FR-430a.1", "ad": "Sürdürülebilir kaynak kullanımı", "tip": "ta"},
   {"kod": "FB-FR-000.A", "ad": "Mağaza/dağıtım metrikleri", "tip": "veri"}
  ]
 },
 {
  "no": 23,
  "ad": "Et, Kümes Hayvanları ve Süt Ürünleri",
  "prefix": "FB-MP",
  "tip": "agir",
  "metrikler": [
   {"kod": "FB-MP-110a.1", "ad": "Brüt K1", "tip": "hesap", "birim": "tCO2e", "ortak": "k1", "kapsam": 1},
   {"kod": "FB-MP-110a.2", "ad": "K1 stratejisi", "tip": "ta"},
   {"kod": "FB-MP-130a.1", "ad": "Enerji yönetimi", "tip": "hesap", "birim": "GJ, %", "ortak": "enerji"},
   {"kod": "FB-MP-140a.1", "ad": "Su yönetimi", "tip": "hesap", "birim": "bin m³, %", "ortak": "su"},
   {"kod": "FB-MP-160a.1", "ad": "Hayvan atığı/gübre besin yönetimi", "tip": "veri"},
   {"kod": "FB-MP-000.A", "ad": "Üretim ağırlığı", "tip": "veri", "birim": "t"}
  ]
 },
 {
  "no": 24,
  "ad": "Alkolsüz İçecekler",
  "prefix": "FB-NB",
  "tip": "orta",
  "metrikler": [
   {"kod": "FB-NB-110a.1", "ad": "Filo yakıt", "tip": "hesap", "birim": "GJ", "kapsam": 1},
   {"kod": "FB-NB-130a.1", "ad": "Enerji yönetimi", "tip": "hesap", "birim": "GJ, %", "ortak": "enerji"},
   {"kod": "FB-NB-140a.1", "ad": "Su yönetimi", "tip": "hesap", "birim": "bin m³, %", "ortak": "su"},
   {"kod": "FB-NB-000.A", "ad": "Üretim hacmi", "tip": "veri"}
  ]
 },
 {
  "no": 25,
  "ad": "İşlenmiş Gıdalar",
  "prefix": "FB-PF",
  "tip": "orta",
  "metrikler": [
   {"kod": "FB-PF-130a.1", "ad": "Enerji yönetimi", "tip": "hesap", "birim": "GJ, %", "ortak": "enerji"},
   {"kod": "FB-PF-140a.1", "ad": "Su yönetimi", "tip": "hesap", "birim": "bin m³, %", "ortak": "su"},
   {"kod": "FB-PF-430a.1", "ad": "Sertifikalı tedarik", "tip": "veri"},
   {"kod": "FB-PF-430a.2", "ad": "Palm yağı", "tip": "veri"},
   {"kod": "FB-PF-000.A", "ad": "Üretim ağırlığı", "tip": "veri", "birim": "t"}
  ]
 },
 {
  "no": 26,
  "ad": "Restoranlar",
  "prefix": "FB-RN",
  "tip": "hafif",
  "metrikler": [
   {"kod": "FB-RN-130a.1", "ad": "Enerji yönetimi", "tip": "hesap", "birim": "GJ, %", "ortak": "enerji"},
   {"kod": "FB-RN-140a.1", "ad": "Su yönetimi", "tip": "hesap", "birim": "bin m³, %", "ortak": "su"},
   {"kod": "FB-RN-430a.1", "ad": "Hayvan refahı/gıda tedarik", "tip": "ta"},
   {"kod": "FB-RN-000.A", "ad": "Restoran/öğün sayısı", "tip": "veri", "birim": "sayı"}
  ]
 },
 {
  "no": 27,
  "ad": "İlaç Perakendecileri",
  "prefix": "HC-DR",
  "tip": "hafif",
  "metrikler": [
   {"kod": "HC-DR-130a.1", "ad": "Enerji yönetimi", "tip": "hesap", "birim": "GJ, %", "ortak": "enerji"},
   {"kod": "HC-DR-000.A", "ad": "Eczane/reçete metrikleri", "tip": "veri"}
  ]
 },
 {
  "no": 28,
  "ad": "Sağlık Hizmeti Sunumu",
  "prefix": "HC-DY",
  "tip": "hafif",
  "metrikler": [
   {"kod": "HC-DY-130a.1", "ad": "Enerji yönetimi", "tip": "hesap", "birim": "GJ, %", "ortak": "enerji"},
   {"kod": "HC-DY-150a.1", "ad": "Tıbbi atık (yakılan/geri dönüşüm)", "tip": "veri", "birim": "t, %"},
   {"kod": "HC-DY-450a.1", "ad": "İklim afeti dayanıklılık politikası", "tip": "ta"},
   {"kod": "HC-DY-000.A", "ad": "Yatak/hasta sayısı", "tip": "veri", "birim": "sayı"}
  ]
 },
 {
  "no": 29,
  "ad": "Sağlık Hizmetleri Distribütörleri",
  "prefix": "HC-DI",
  "tip": "hafif",
  "metrikler": [
   {"kod": "HC-DI-110a.1", "ad": "Lojistik çevresel etki/filo", "tip": "hesap", "birim": "tCO2e", "kapsam": 1},
   {"kod": "HC-DI-000.A", "ad": "Dağıtım metrikleri", "tip": "veri"}
  ]
 },
 {
  "no": 30,
  "ad": "Yönetilen Sağlık/Bakım Hizmeti",
  "prefix": "HC-MC",
  "tip": "hafif",
  "metrikler": [
   {"kod": "HC-MC-450a.1", "ad": "İklim değişikliği ticari etki stratejisi", "tip": "ta"},
   {"kod": "HC-MC-000.A", "ad": "Üye sayısı", "tip": "veri", "birim": "sayı"}
  ]
 },
 {
  "no": 31,
  "ad": "Tıbbi Ekipman ve Malzemeler",
  "prefix": "HC-MS",
  "tip": "hafif",
  "metrikler": [
   {"kod": "HC-MS-410a.1", "ad": "Ürün yaşam döngüsü/tedarik", "tip": "ta"},
   {"kod": "HC-MS-000.A", "ad": "Üretim", "tip": "veri"}
  ]
 },
 {
  "no": 32,
  "ad": "Elektrik Tesisleri ve Güç Jeneratörleri",
  "prefix": "IF-EU",
  "tip": "agir",
  "metrikler": [
   {"kod": "IF-EU-110a.1", "ad": "Brüt K1 + düzenleme %", "tip": "hesap", "birim": "tCO2e, %", "ortak": "k1", "kapsam": 1},
   {"kod": "IF-EU-110a.2", "ad": "K1 stratejisi", "tip": "ta"},
   {"kod": "IF-EU-140a.1", "ad": "Su yönetimi", "tip": "hesap", "birim": "bin m³, %", "ortak": "su"},
   {"kod": "IF-EU-540a.1", "ad": "Nükleer güvenlik", "tip": "veri"},
   {"kod": "IF-EU-550a.1", "ad": "Şebeke kesinti/dayanıklılık", "tip": "veri"},
   {"kod": "IF-EU-000.A", "ad": "Elektrik üretimi/müşteri", "tip": "veri"}
  ]
 },
 {
  "no": 33,
  "ad": "Mühendislik ve İnşaat Hizmetleri",
  "prefix": "IF-EN",
  "tip": "agir",
  "metrikler": [
   {"kod": "IF-EN-160a.1", "ad": "Proje yaşam döngüsü çevre etkisi/uyumsuzluk", "tip": "veri", "birim": "sayı"},
   {"kod": "IF-EN-410a.1", "ad": "Faaliyet dönemi enerji/su verimliliği", "tip": "ta"},
   {"kod": "IF-EN-410b.1", "ad": "İklim risk proje", "tip": "ta"},
   {"kod": "IF-EN-000.A", "ad": "Proje bekleyen iş", "tip": "veri"}
  ]
 },
 {
  "no": 34,
  "ad": "Gaz Hizmetleri ve Distribütörleri",
  "prefix": "IF-GU",
  "tip": "orta",
  "metrikler": [
   {"kod": "IF-GU-420a.2", "ad": "Enerji verimlilik", "tip": "ta"},
   {"kod": "IF-GU-540a.1", "ad": "Boru hattı güvenliği/kaçak", "tip": "veri", "birim": "sayı"},
   {"kod": "IF-GU-000.A", "ad": "Gaz dağıtım/müşteri", "tip": "veri"}
  ]
 },
 {
  "no": 35,
  "ad": "Ev İnşaatçıları",
  "prefix": "IF-HB",
  "tip": "orta",
  "metrikler": [
   {"kod": "IF-HB-160a.1", "ad": "Arazi/su etkisi", "tip": "veri"},
   {"kod": "IF-HB-410a.1", "ad": "Enerji/kaynak verimli tasarım", "tip": "ta"},
   {"kod": "IF-HB-000.A", "ad": "Konut sayısı", "tip": "veri", "birim": "sayı"}
  ]
 },
 {
  "no": 36,
  "ad": "Gayrimenkul",
  "prefix": "IF-RE",
  "tip": "orta",
  "metrikler": [
   {"kod": "IF-RE-130a.1", "ad": "Bina enerji yönetimi (enerji yıldızı/sertifika)", "tip": "hesap", "birim": "GJ, %", "ortak": "enerji"},
   {"kod": "IF-RE-140a.1", "ad": "Su yönetimi", "tip": "hesap", "birim": "bin m³, %", "ortak": "su"},
   {"kod": "IF-RE-410a.1", "ad": "Kiracı sürdürülebilirlik", "tip": "ta"},
   {"kod": "IF-RE-450a.1", "ad": "İklim risk", "tip": "ta"},
   {"kod": "IF-RE-000.A", "ad": "Taban alanı/portföy", "tip": "veri", "birim": "m²"}
  ]
 },
 {
  "no": 37,
  "ad": "Gayrimenkul Hizmetleri",
  "prefix": "IF-RS",
  "tip": "hafif",
  "metrikler": [
   {"kod": "IF-RS-410a.1", "ad": "Sürdürülebilir gayrimenkul hizmeti/sertifika", "tip": "ta"},
   {"kod": "IF-RS-000.A", "ad": "Yönetilen alan", "tip": "veri", "birim": "m²"}
  ]
 },
 {
  "no": 38,
  "ad": "Atık Yönetimi",
  "prefix": "IF-WM",
  "tip": "agir",
  "metrikler": [
   {"kod": "IF-WM-110a.1", "ad": "Çöp gazı (yakılan/enerji %)", "tip": "hesap", "birim": "tCO2e, %", "kapsam": 1},
   {"kod": "IF-WM-110a.2", "ad": "K1 emisyon/strateji", "tip": "hesap", "birim": "tCO2e", "ortak": "k1", "kapsam": 1},
   {"kod": "IF-WM-110b.1", "ad": "Filo alternatif yakıt", "tip": "veri"},
   {"kod": "IF-WM-000.A", "ad": "Toplanan/işlenen atık", "tip": "veri", "birim": "t"}
  ]
 },
 {
  "no": 39,
  "ad": "Su İşletmeleri ve Hizmetleri",
  "prefix": "IF-WU",
  "tip": "orta",
  "metrikler": [
   {"kod": "IF-WU-130a.1", "ad": "Enerji yönetimi", "tip": "hesap", "birim": "GJ, %", "ortak": "enerji"},
   {"kod": "IF-WU-140a.1", "ad": "Su kaybı/arıtma", "tip": "hesap", "birim": "bin m³, %", "ortak": "su"},
   {"kod": "IF-WU-440a.1", "ad": "Su arzı", "tip": "veri"},
   {"kod": "IF-WU-450a.1", "ad": "İklim risk", "tip": "ta"},
   {"kod": "IF-WU-000.A", "ad": "Su hacmi/müşteri", "tip": "veri"}
  ]
 },
 {
  "no": 40,
  "ad": "Biyoyakıtlar",
  "prefix": "RR-BI",
  "tip": "orta",
  "metrikler": [
   {"kod": "RR-BI-140a.1", "ad": "Üretimde su", "tip": "hesap", "birim": "bin m³, %", "ortak": "su"},
   {"kod": "RR-BI-410a.1", "ad": "Biyoyakıt yaşam döngüsü GHG", "tip": "hesap", "birim": "tCO2e"},
   {"kod": "RR-BI-430a.1", "ad": "Hammadde tedarik", "tip": "ta"},
   {"kod": "RR-BI-000.A", "ad": "Biyoyakıt üretimi", "tip": "veri"}
  ]
 },
 {
  "no": 41,
  "ad": "Orman Yönetimi",
  "prefix": "RR-FM",
  "tip": "orta",
  "metrikler": [
   {"kod": "RR-FM-160a.1", "ad": "Orman sertifikası/karbon stoku (LULUCF)", "tip": "veri"},
   {"kod": "RR-FM-450a.1", "ad": "İklim risk", "tip": "ta"},
   {"kod": "RR-FM-000.A", "ad": "Orman alanı/hasat", "tip": "veri"}
  ]
 },
 {
  "no": 42,
  "ad": "Yakıt Pilleri ve Endüstriyel Bataryalar",
  "prefix": "RR-FC",
  "tip": "orta",
  "metrikler": [
   {"kod": "RR-FC-130a.1", "ad": "Enerji yönetimi", "tip": "hesap", "birim": "GJ, %", "ortak": "enerji"},
   {"kod": "RR-FC-410a.1", "ad": "Batarya enerji yoğunluğu/ömür/geri dönüşüm", "tip": "ta"},
   {"kod": "RR-FC-000.A", "ad": "Üretim", "tip": "veri"}
  ]
 },
 {
  "no": 43,
  "ad": "Kâğıt Hamuru ve Kâğıt Ürünleri",
  "prefix": "RR-PP",
  "tip": "agir",
  "metrikler": [
   {"kod": "RR-PP-110a.1", "ad": "Brüt K1 + düzenleme %", "tip": "hesap", "birim": "tCO2e, %", "ortak": "k1", "kapsam": 1},
   {"kod": "RR-PP-110a.2", "ad": "K1 stratejisi", "tip": "ta"},
   {"kod": "RR-PP-130a.1", "ad": "Enerji yönetimi", "tip": "hesap", "birim": "GJ, %", "ortak": "enerji"},
   {"kod": "RR-PP-140a.1", "ad": "Su yönetimi", "tip": "hesap", "birim": "bin m³, %", "ortak": "su"},
   {"kod": "RR-PP-430a.1", "ad": "Elyaf tedarik/sertifika", "tip": "veri"},
   {"kod": "RR-PP-000.A", "ad": "Üretim ağırlığı", "tip": "veri", "birim": "t"}
  ]
 },
 {
  "no": 44,
  "ad": "Güneş Teknolojisi ve Proje Geliştiriciler",
  "prefix": "RR-ST",
  "tip": "orta",
  "metrikler": [
   {"kod": "RR-ST-130a.1", "ad": "Enerji yönetimi", "tip": "hesap", "birim": "GJ, %", "ortak": "enerji"},
   {"kod": "RR-ST-140a.1", "ad": "Su yönetimi", "tip": "hesap", "birim": "bin m³, %", "ortak": "su"},
   {"kod": "RR-ST-410a.1", "ad": "Ürün yaşam döngüsü/geri dönüşüm", "tip": "ta"},
   {"kod": "RR-ST-000.A", "ad": "Üretim kapasitesi", "tip": "veri"}
  ]
 },
 {
  "no": 45,
  "ad": "Rüzgâr Teknolojisi ve Proje Geliştiricileri",
  "prefix": "RR-WT",
  "tip": "orta",
  "metrikler": [
   {"kod": "RR-WT-440b.1", "ad": "Türbin malzeme/ömür sonu", "tip": "ta"},
   {"kod": "RR-WT-000.A", "ad": "Türbin/kapasite", "tip": "veri"}
  ]
 },
 {
  "no": 46,
  "ad": "Havacılık ve Savunma",
  "prefix": "RT-AE",
  "tip": "orta",
  "metrikler": [
   {"kod": "RT-AE-130a.1", "ad": "Enerji yönetimi", "tip": "hesap", "birim": "GJ, %", "ortak": "enerji"},
   {"kod": "RT-AE-410a.1", "ad": "Yakıt verimli ürün/ömür sonu", "tip": "ta"},
   {"kod": "RT-AE-000.A", "ad": "Üretim", "tip": "veri"}
  ]
 },
 {
  "no": 47,
  "ad": "Kimyasallar",
  "prefix": "RT-CH",
  "tip": "agir",
  "metrikler": [
   {"kod": "RT-CH-110a.1", "ad": "Brüt K1 + düzenleme %", "tip": "hesap", "birim": "tCO2e, %", "ortak": "k1", "kapsam": 1},
   {"kod": "RT-CH-110a.2", "ad": "K1 stratejisi", "tip": "ta"},
   {"kod": "RT-CH-130a.1", "ad": "Enerji yönetimi", "tip": "hesap", "birim": "GJ, %", "ortak": "enerji"},
   {"kod": "RT-CH-140a.1", "ad": "Su yönetimi", "tip": "hesap", "birim": "bin m³, %", "ortak": "su"},
   {"kod": "RT-CH-410a.1", "ad": "Ürün sürdürülebilirlik", "tip": "ta"},
   {"kod": "RT-CH-000.A", "ad": "Üretim ağırlığı", "tip": "veri", "birim": "t"}
  ]
 },
 {
  "no": 48,
  "ad": "Kutu ve Ambalaj",
  "prefix": "RT-CP",
  "tip": "orta",
  "metrikler": [
   {"kod": "RT-CP-110a.1", "ad": "Brüt K1 + düzenleme %", "tip": "hesap", "birim": "tCO2e, %", "ortak": "k1", "kapsam": 1},
   {"kod": "RT-CP-110a.2", "ad": "K1 stratejisi", "tip": "ta"},
   {"kod": "RT-CP-130a.1", "ad": "Enerji yönetimi", "tip": "hesap", "birim": "GJ, %", "ortak": "enerji"},
   {"kod": "RT-CP-140a.1", "ad": "Su yönetimi", "tip": "hesap", "birim": "bin m³, %", "ortak": "su"},
   {"kod": "RT-CP-150a.1", "ad": "Atık/geri dönüşüm", "tip": "veri", "birim": "t, %"},
   {"kod": "RT-CP-000.A", "ad": "Üretim ağırlığı", "tip": "veri", "birim": "t"}
  ]
 },
 {
  "no": 49,
  "ad": "Elektrikli ve Elektronik Ekipman",
  "prefix": "RT-EE",
  "tip": "orta",
  "metrikler": [
   {"kod": "RT-EE-130a.1", "ad": "Enerji yönetimi", "tip": "hesap", "birim": "GJ, %", "ortak": "enerji"},
   {"kod": "RT-EE-410a.1", "ad": "Enerji verimli ürün geliri/ömür sonu", "tip": "ta"},
   {"kod": "RT-EE-000.A", "ad": "Üretim", "tip": "veri"}
  ]
 },
 {
  "no": 50,
  "ad": "Endüstriyel Makine ve Ürünler",
  "prefix": "RT-IG",
  "tip": "orta",
  "metrikler": [
   {"kod": "RT-IG-130a.1", "ad": "Enerji yönetimi", "tip": "hesap", "birim": "GJ, %", "ortak": "enerji"},
   {"kod": "RT-IG-410a.1", "ad": "Yakıt verimli ürün/emisyon", "tip": "ta"},
   {"kod": "RT-IG-000.A", "ad": "Üretim", "tip": "veri"}
  ]
 },
 {
  "no": 52,
  "ad": "Oteller ve Konaklama",
  "prefix": "SV-HL",
  "tip": "hafif",
  "metrikler": [
   {"kod": "SV-HL-130a.1", "ad": "Enerji yönetimi", "tip": "hesap", "birim": "GJ, %", "ortak": "enerji"},
   {"kod": "SV-HL-140a.1", "ad": "Su yönetimi", "tip": "hesap", "birim": "bin m³, %", "ortak": "su"},
   {"kod": "SV-HL-450a.1", "ad": "Taşkın bölgesi tesis", "tip": "veri", "birim": "sayı"},
   {"kod": "SV-HL-000.A", "ad": "Tesis/oda sayısı", "tip": "veri", "birim": "sayı"}
  ]
 },
 {
  "no": 53,
  "ad": "Eğlence Tesisleri",
  "prefix": "SV-LF",
  "tip": "hafif",
  "metrikler": [
   {"kod": "SV-LF-130a.1", "ad": "Enerji yönetimi", "tip": "hesap", "birim": "GJ, %", "ortak": "enerji"},
   {"kod": "SV-LF-000.A", "ad": "Tesis/ziyaretçi", "tip": "veri"}
  ]
 },
 {
  "no": 54,
  "ad": "Elektronik Üretim Hizmetleri (EMS/ODM)",
  "prefix": "TC-ES",
  "tip": "orta",
  "metrikler": [
   {"kod": "TC-ES-140a.1", "ad": "Su + geri dönüşüm", "tip": "hesap", "birim": "bin m³, %", "ortak": "su"},
   {"kod": "TC-ES-410a.1", "ad": "Ürün enerji verimliliği", "tip": "ta"},
   {"kod": "TC-ES-000.A", "ad": "Üretim", "tip": "veri"}
  ]
 },
 {
  "no": 55,
  "ad": "Donanım",
  "prefix": "TC-HW",
  "tip": "hafif",
  "metrikler": [
   {"kod": "TC-HW-410a.1", "ad": "Ürün enerji verimliliği/e-atık geri dönüşüm", "tip": "ta"},
   {"kod": "TC-HW-000.A", "ad": "Üretim", "tip": "veri"}
  ]
 },
 {
  "no": 56,
  "ad": "İnternet Medyası ve Hizmetleri",
  "prefix": "TC-IM",
  "tip": "hafif",
  "metrikler": [
   {"kod": "TC-IM-130a.1", "ad": "Veri merkezi enerji + yenilenebilir", "tip": "hesap", "birim": "GJ, %", "ortak": "enerji"},
   {"kod": "TC-IM-130a.2", "ad": "Veri merkezi su", "tip": "hesap", "birim": "bin m³, %", "ortak": "su"},
   {"kod": "TC-IM-000.A", "ad": "Kullanıcı/veri", "tip": "veri"}
  ]
 },
 {
  "no": 57,
  "ad": "Yarı İletkenler",
  "prefix": "TC-SC",
  "tip": "orta",
  "metrikler": [
   {"kod": "TC-SC-110a.1", "ad": "K1 + perflorlu bileşik (PFC) emisyonu", "tip": "hesap", "birim": "tCO2e", "ortak": "sogutucu", "kapsam": 1},
   {"kod": "TC-SC-110a.2", "ad": "K1 stratejisi", "tip": "ta"},
   {"kod": "TC-SC-130a.1", "ad": "Enerji yönetimi", "tip": "hesap", "birim": "GJ, %", "ortak": "enerji"},
   {"kod": "TC-SC-140a.1", "ad": "Su yönetimi", "tip": "hesap", "birim": "bin m³, %", "ortak": "su"},
   {"kod": "TC-SC-000.A", "ad": "Üretim", "tip": "veri"}
  ]
 },
 {
  "no": 58,
  "ad": "Yazılım ve BT Hizmetleri",
  "prefix": "TC-SI",
  "tip": "hafif",
  "metrikler": [
   {"kod": "TC-SI-130a.1", "ad": "Veri merkezi enerji + yenilenebilir", "tip": "hesap", "birim": "GJ, %", "ortak": "enerji"},
   {"kod": "TC-SI-130a.2", "ad": "Veri merkezi su", "tip": "hesap", "birim": "bin m³, %", "ortak": "su"},
   {"kod": "TC-SI-550a.1", "ad": "Sistemik risk/kesinti", "tip": "ta"},
   {"kod": "TC-SI-000.A", "ad": "Kullanıcı/veri", "tip": "veri"}
  ]
 },
 {
  "no": 59,
  "ad": "Telekomünikasyon Hizmetleri",
  "prefix": "TC-TL",
  "tip": "hafif",
  "metrikler": [
   {"kod": "TC-TL-130a.1", "ad": "Enerji yönetimi", "tip": "hesap", "birim": "GJ, %", "ortak": "enerji"},
   {"kod": "TC-TL-550a.1", "ad": "Sistemik risk/kesinti", "tip": "ta"},
   {"kod": "TC-TL-000.A", "ad": "Abone/veri", "tip": "veri"}
  ]
 },
 {
  "no": 60,
  "ad": "Hava Taşımacılığı ve Lojistik",
  "prefix": "TR-AF",
  "tip": "agir",
  "metrikler": [
   {"kod": "TR-AF-110a.1", "ad": "Brüt K1", "tip": "hesap", "birim": "tCO2e", "ortak": "k1", "kapsam": 1},
   {"kod": "TR-AF-110a.2", "ad": "K1 stratejisi", "tip": "ta"},
   {"kod": "TR-AF-110a.3", "ad": "Yakıt + yenilenebilir %", "tip": "hesap", "birim": "GJ, %"},
   {"kod": "TR-AF-430a.2", "ad": "Tedarik zinciri GHG", "tip": "ta"},
   {"kod": "TR-AF-000.A", "ad": "Taşıma hacmi", "tip": "veri"}
  ]
 },
 {
  "no": 61,
  "ad": "Havayolları",
  "prefix": "TR-AL",
  "tip": "agir",
  "metrikler": [
   {"kod": "TR-AL-110a.1", "ad": "Brüt K1", "tip": "hesap", "birim": "tCO2e", "ortak": "k1", "kapsam": 1},
   {"kod": "TR-AL-110a.2", "ad": "K1 stratejisi", "tip": "ta"},
   {"kod": "TR-AL-110a.3", "ad": "Yakıt + alternatif + sürdürülebilir %", "tip": "hesap", "birim": "GJ, %"},
   {"kod": "TR-AL-000.A", "ad": "ASK/RPK/RTK/kalkış/filo yaşı", "tip": "veri"}
  ]
 },
 {
  "no": 62,
  "ad": "Otomobil Parçaları",
  "prefix": "TR-AP",
  "tip": "orta",
  "metrikler": [
   {"kod": "TR-AP-130a.1", "ad": "Enerji yönetimi", "tip": "hesap", "birim": "GJ, %", "ortak": "enerji"},
   {"kod": "TR-AP-410a.1", "ad": "Yakıt verimli ürün geliri", "tip": "veri"},
   {"kod": "TR-AP-000.A", "ad": "Parça sayısı/ağırlık/tesis alanı", "tip": "veri"}
  ]
 },
 {
  "no": 63,
  "ad": "Otomobiller",
  "prefix": "TR-AU",
  "tip": "orta",
  "metrikler": [
   {"kod": "TR-AU-410a.1", "ad": "Filo yakıt ekonomisi", "tip": "veri"},
   {"kod": "TR-AU-410a.2", "ad": "ZEV/hibrit satış", "tip": "veri", "birim": "sayı"},
   {"kod": "TR-AU-410a.3", "ad": "Yakıt/emisyon stratejisi", "tip": "ta"},
   {"kod": "TR-AU-000.A", "ad": "Üretilen/satılan araç", "tip": "veri", "birim": "sayı"}
  ]
 },
 {
  "no": 64,
  "ad": "Araba Kiralama ve Leasing",
  "prefix": "TR-CR",
  "tip": "hafif",
  "metrikler": [
   {"kod": "TR-CR-410a.1", "ad": "Filo yakıt ekonomisi", "tip": "veri"},
   {"kod": "TR-CR-410a.2", "ad": "Filo kullanım oranı", "tip": "veri"},
   {"kod": "TR-CR-000.A", "ad": "Araç yaşı/kiralama günü/filo", "tip": "veri"}
  ]
 },
 {
  "no": 65,
  "ad": "Yolcu Gemileri",
  "prefix": "TR-CL",
  "tip": "agir",
  "metrikler": [
   {"kod": "TR-CL-110a.1", "ad": "Brüt K1", "tip": "hesap", "birim": "tCO2e", "ortak": "k1", "kapsam": 1},
   {"kod": "TR-CL-110a.2", "ad": "K1 stratejisi", "tip": "ta"},
   {"kod": "TR-CL-110a.3", "ad": "Enerji + ağır yakıt + OPS + yenilenebilir %", "tip": "hesap", "birim": "GJ, %"},
   {"kod": "TR-CL-110a.4", "ad": "EEDI (enerji verimlilik endeksi)", "tip": "veri"},
   {"kod": "TR-CL-000.A", "ad": "Rıhtım-km/yolculuk/yolcu", "tip": "veri"}
  ]
 },
 {
  "no": 66,
  "ad": "Deniz Taşımacılığı",
  "prefix": "TR-MT",
  "tip": "agir",
  "metrikler": [
   {"kod": "TR-MT-110a.1", "ad": "Brüt K1", "tip": "hesap", "birim": "tCO2e", "ortak": "k1", "kapsam": 1},
   {"kod": "TR-MT-110a.2", "ad": "K1 stratejisi", "tip": "ta"},
   {"kod": "TR-MT-110a.3", "ad": "Enerji + ağır yakıt + yenilenebilir %", "tip": "hesap", "birim": "GJ, %"},
   {"kod": "TR-MT-110a.4", "ad": "EEDI", "tip": "veri"},
   {"kod": "TR-MT-000.A", "ad": "Çalışan/mesafe/tonaj/TEU", "tip": "veri"}
  ]
 },
 {
  "no": 67,
  "ad": "Demiryolu Taşımacılığı",
  "prefix": "TR-RA",
  "tip": "agir",
  "metrikler": [
   {"kod": "TR-RA-110a.1", "ad": "Brüt K1", "tip": "hesap", "birim": "tCO2e", "ortak": "k1", "kapsam": 1},
   {"kod": "TR-RA-110a.2", "ad": "K1 stratejisi", "tip": "ta"},
   {"kod": "TR-RA-110a.3", "ad": "Yakıt + yenilenebilir %", "tip": "hesap", "birim": "GJ, %"},
   {"kod": "TR-RA-000.A", "ad": "Vagon/ray-km/RTK/çalışan", "tip": "veri"}
  ]
 },
 {
  "no": 68,
  "ad": "Karayolu Taşımacılığı",
  "prefix": "TR-RO",
  "tip": "agir",
  "metrikler": [
   {"kod": "TR-RO-110a.1", "ad": "Brüt K1", "tip": "hesap", "birim": "tCO2e", "ortak": "k1", "kapsam": 1},
   {"kod": "TR-RO-110a.2", "ad": "K1 stratejisi", "tip": "ta"},
   {"kod": "TR-RO-110a.3", "ad": "Yakıt + doğal gaz + yenilenebilir %", "tip": "hesap", "birim": "GJ, %"},
   {"kod": "TR-RO-000.A", "ad": "RTK/yük faktörü/şoför", "tip": "veri"}
  ]
 }
];
