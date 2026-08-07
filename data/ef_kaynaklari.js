/* ============================================================
   EMİSYON FAKTÖRÜ KAYNAKLARI VE BELİRSİZLİK KATALOĞU
   ------------------------------------------------------------
   Sprint 3 çıktısı. Her EF tablosunun BİLİMSEL KAYNAĞINI ve IPCC Tier 1
   varsayılan BELİRSİZLİK aralığını (±%) tanımlar. TSRS 1 md. 77-82
   (ölçüm belirsizliği) ve metodoloji şeffaflığı için kullanılır.

   Bu dosya mevcut ef_*.js dosyalarını DEĞİŞTİRMEZ; onların üzerine
   bir "kaynak/şeffaflık katmanı" ekler. Rapor ve Veri Kütüphanesi
   sayfası bu bilgiyi okuyup her hesabın dayanağını gösterir.

   Belirsizlik değerleri IPCC 2006 Rehberi Cilt 1 Bölüm 3 (Belirsizlikler)
   ve Cilt 2 Tablo 2.x varsayılan aralıklarından alınmıştır. Tier 1
   yaklaşımında aktivite verisi ve EF belirsizlikleri root-sum-square
   (karekök-kareler-toplamı) ile birleştirilir (Sprint 4'te hesaplanacak).
   ============================================================ */
window.VERI = window.VERI || {};

/* Her veri seti (data/ef_*.js dosyalarının VERI anahtarı) için kaynak künyesi */
VERI.ef_kaynaklari = {
 "ef_sabit_yanma": {
  "ad": "Sabit Yanma Emisyon Faktörleri",
  "kaynak": "IPCC 2006 Ulusal Sera Gazı Envanterleri Rehberi, Cilt 2 (Enerji), Bölüm 1-2; Tablo 1.4 (varsayılan CO2/CH4/N2O EF) ve Tablo 1.2 (NCV)",
  "guncelleme": "2019 İyileştirmesi",
  "belirsizlik": {
   "CO2": "±5% (kömür/petrol türevleri), ±2% (doğal gaz)",
   "CH4": "±50% ile ±150% (yakıt ve teknolojiye göre)",
   "N2O": "büyüklük mertebesi (order of magnitude); yüksek belirsizlik",
   "aktivite": "±2-5% (sayaç/fatura), ±10% (tahmin)"
  },
  "tsrs_ref": "TSRS 2 md. 29(a)(i) — Kapsam 1 doğrudan emisyonlar",
  "ipcc_arac": "Stationary_combustion_tool_Version4-2.xlsx"
 },
 "ef_mobil_yakit": {
  "ad": "Mobil Yanma — Yakıt Bazlı Emisyon Faktörleri",
  "kaynak": "US EPA Emission Factors for GHG Inventories (Tablo 2-3) ve DEFRA 2023; yakıt-bazlı CO2/CH4/N2O",
  "guncelleme": "2023",
  "belirsizlik": {
   "CO2": "±2-5%",
   "CH4": "±50% (motor/yaş/teknoloji)",
   "N2O": "±100% veya daha yüksek (katalitik dönüştürücüye bağlı)",
   "aktivite": "±2% (yakıt faturası)"
  },
  "tsrs_ref": "TSRS 2 md. 29(a)(i) — Kapsam 1 mobil yanma",
  "ipcc_arac": "Transport_Tool_v2_7.xlsx"
 },
 "ef_mobil_mesafe": {
  "ad": "Mobil Yanma — Mesafe Bazlı Emisyon Faktörleri",
  "kaynak": "DEFRA/BEIS 2023 GHG Conversion Factors; araç tipi ve yıla göre km-bazlı EF",
  "guncelleme": "2023",
  "belirsizlik": {
   "CO2": "±10-20% (gerçek sürüş koşulları, yük, yaş)",
   "CH4": "±50-100%",
   "N2O": "±100%+",
   "aktivite": "±5-15% (kilometre kaydı yöntemi)"
  },
  "tsrs_ref": "TSRS 2 md. 29(a)(i) / Kapsam 3 (kiralık/çalışan araçları)",
  "ipcc_arac": "Transport_Tool_v2_7.xlsx"
 },
 "ef_tasimacilik": {
  "ad": "Yük Taşımacılığı Emisyon Faktörleri",
  "kaynak": "DEFRA 2023 / GLEC Framework; ton-km bazlı taşıma modu EF",
  "guncelleme": "2023",
  "belirsizlik": {
   "genel": "±20-40% (yük faktörü, boş dönüş, rota varsayımları)",
   "aktivite": "±10-25% (ton-km tahmini)"
  },
  "tsrs_ref": "TSRS 2 md. 29(a)(i) — Kapsam 3 Kategori 4 ve 9 (taşıma)",
  "ipcc_arac": "Transport_Tool_v2_7.xlsx"
 },
 "ef_toplu_tasima": {
  "ad": "Toplu Taşıma / İş Seyahati Emisyon Faktörleri",
  "kaynak": "DEFRA 2023 GHG Conversion Factors; yolcu-km bazlı EF",
  "guncelleme": "2023",
  "belirsizlik": {
   "genel": "±20-30% (doluluk oranı varsayımı)",
   "aktivite": "±10-20%"
  },
  "tsrs_ref": "TSRS 2 md. 29(a)(i) — Kapsam 3 Kategori 6 ve 7 (iş seyahati, işe gidiş-geliş)",
  "ipcc_arac": "Transport_Tool_v2_7.xlsx"
 },
 "ef_elektrik": {
  "ad": "Şebeke Elektriği Emisyon Faktörleri (Kapsam 2)",
  "kaynak": "Türkiye: T.C. ETKB EVÇED 2023 (dağıtım 0,469 / iletim 0,436 / üretim 0,434 kg CO2e/kWh). UK: DEFRA 2023. ABD: EPA eGRID 2022 alt-bölge faktörleri (GHG Protokol Cross-Sector Tools V2.0) — lb/MWh (CO2) ve lb/GWh (CH4, N2O) değerleri kg/kWh'e çevrildi (1 lb = 0,45359237 kg); CO2e'ye çevrim AR5 KIP ile hesap anında yapılır.",
  "guncelleme": "2023 (TR/UK), 2022 (ABD eGRID)",
  "belirsizlik": {
   "CO2": "±5-10% (şebeke karışımı yıllık değişimi)",
   "aktivite": "±1-2% (elektrik faturası/sayaç)"
  },
  "tsrs_ref": "TSRS 2 md. 29(a)(ii) — Kapsam 2 ikili raporlama (lokasyon + piyasa)",
  "ipcc_arac": "—"
 },
 "kip_ar5": {
  "ad": "Küresel Isınma Potansiyelleri (KIP/GWP)",
  "kaynak": "IPCC Beşinci Değerlendirme Raporu (AR5), Çalışma Grubu I, Bölüm 8, Ek 8.A — 100 yıllık KIP değerleri",
  "guncelleme": "AR5 (2013)",
  "belirsizlik": {
   "genel": "CO2=1 (referans). CH4 ±%30, N2O ±%20, florlu gazlar ±%20-30 (AR5 Bölüm 8 güven aralıkları)"
  },
  "tsrs_ref": "TSRS 2 md. 29(a)(i) — tüm gazların CO2e'ye dönüştürülmesi",
  "ipcc_arac": "—"
 },
 "kacak_oranlari": {
  "ad": "Florlu Gaz Kaçak Oranları (Tarama Yöntemi)",
  "kaynak": "IPCC 2006 Rehberi, Cilt 3 (Endüstriyel Süreçler), Bölüm 7 (Soğutma ve Klima); ekipman tipine göre varsayılan yıllık kaçak (montaj/işletme/bertaraf)",
  "guncelleme": "2019 İyileştirmesi",
  "belirsizlik": {
   "genel": "±50% veya daha yüksek (Tarama yöntemi); Kütle Dengesi yöntemi ±%10-20"
  },
  "tsrs_ref": "TSRS 2 md. 29(a)(i) — Kapsam 1 kaçak emisyonlar",
  "ipcc_arac": "hfc-pfc_1.xls (gelişmiş envanter — Sprint 4)"
 },
 "yakit_ekonomisi": {
  "ad": "Yakıt Ekonomisi Değerleri",
  "kaynak": "DEFRA / US EPA araç yakıt ekonomisi varsayılanları",
  "guncelleme": "2023",
  "belirsizlik": { "genel": "±10-20%" },
  "tsrs_ref": "Mesafe → yakıt dönüşümü destek verisi",
  "ipcc_arac": "—"
 }
};

/* Genel metodoloji notu — rapor metodoloji bölümünde kullanılır */
VERI.belirsizlik_metodolojisi = {
 "yaklasim": "IPCC Tier 1 Belirsizlik Birleştirme",
 "aciklama": "Toplam emisyon belirsizliği, her kaynağın aktivite verisi belirsizliği ile emisyon faktörü belirsizliğinin karekök-kareler-toplamı (root-sum-square) yöntemiyle birleştirilmesiyle tahmin edilir. Bileşik belirsizlik: U_toplam = √(U_aktivite² + U_EF²). Kaynaklar arası toplama, emisyonla ağırlıklandırılmış karekök-kareler-toplamı ile yapılır.",
 "kaynak": "IPCC 2006 Rehberi Cilt 1 Bölüm 3 (Belirsizlikler), Denklem 3.1 ve 3.2",
 "tsrs_ref": "TSRS 1 md. 77-82 — ölçüm belirsizliği açıklaması",
 "durum": "Belirsizlik aralıkları bu sürümde referans olarak gösterilir; otomatik bileşik hesaplama Sprint 4'te eklenecektir."
};
