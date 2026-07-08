/* ============================================================
   EKİPMAN TÜRÜNE GÖRE VARSAYILAN YILLIK KAÇAK ORANLARI
   ------------------------------------------------------------
   Tarama (basit) yönteminde kullanılan varsayılan kaçak oranları (0.02 = %2).
   KAYNAK: IPCC "hfc-pfc_1.xls" aracı, "Table 2. Default IPCC Values"
   (IPCC Good Practice Guidance). Araç her ekipman türü için bir ARALIK verir;
   burada aralığın ORTA NOKTASI varsayılan alınmıştır. Tesise özgü ölçüm/bakım
   kaydı varsa formdaki "kaçak oranı" alanına gerçek oranı girin — bu
   varsayılanlar yalnız tarama (screening) amaçlıdır.
   Araç dosyası: "IPCC Kaynak Excel Araçları/hfc-pfc_1.xls".
   NASIL DÜZENLENİR?
   • En kolay yol: Uygulamayı açın → Yönetim Paneli → ilgili tabloyu
     görsel olarak düzenleyin. Kod bilgisi gerekmez.
   • Bu dosyayı elle düzenlerseniz: her kayıt { } içindedir, kayıtlar
     virgülle ayrılır. Metinler "tırnak içinde", sayılar tırnaksız yazılır.
   ============================================================ */
window.VERI = window.VERI || {};
VERI.kacak_oranlari = [
 {
  "Ekipman_Turu": "Chiller (centralized AC)",
  "Varsayilan_Kacak_Orani": 0.085,
  "Kaynak": "IPCC GPG Tablo 2 — Chillers, aralık %2–15, orta nokta"
 },
 {
  "Ekipman_Turu": "Split AC / Heat Pump",
  "Varsayilan_Kacak_Orani": 0.03,
  "Kaynak": "IPCC GPG Tablo 2 — Residential and Commercial A/C, aralık %1–5, orta nokta"
 },
 {
  "Ekipman_Turu": "VRF System",
  "Varsayilan_Kacak_Orani": 0.06,
  "Kaynak": "EPA EF Hub (IPCC Tablo 2'de ayrı satırı yok; A/C aralığının üstü)"
 },
 {
  "Ekipman_Turu": "Commercial Refrigeration",
  "Varsayilan_Kacak_Orani": 0.2,
  "Kaynak": "IPCC GPG Tablo 2 — Medium and Large Commercial Refrigeration, aralık %10–30, orta nokta"
 },
 {
  "Ekipman_Turu": "Stand-Alone Commercial Refrigeration",
  "Varsayilan_Kacak_Orani": 0.055,
  "Kaynak": "IPCC GPG Tablo 2 — Stand-Alone Commercial Applications, aralık %1–10, orta nokta"
 },
 {
  "Ekipman_Turu": "Domestic Refrigeration",
  "Varsayilan_Kacak_Orani": 0.003,
  "Kaynak": "IPCC GPG Tablo 2 — Domestic Refrigeration, aralık %0,1–0,5, orta nokta"
 },
 {
  "Ekipman_Turu": "Refrigerated Transport",
  "Varsayilan_Kacak_Orani": 0.325,
  "Kaynak": "IPCC GPG Tablo 2 — Transport Refrigeration, aralık %15–50, orta nokta"
 },
 {
  "Ekipman_Turu": "Industrial Refrigeration",
  "Varsayilan_Kacak_Orani": 0.16,
  "Kaynak": "IPCC GPG Tablo 2 — Industrial Refrigeration incl. Food Processing, aralık %7–25, orta nokta"
 },
 {
  "Ekipman_Turu": "Mobile Air Conditioning",
  "Varsayilan_Kacak_Orani": 0.15,
  "Kaynak": "IPCC GPG Tablo 2 — Mobile Air Conditioners, aralık %10–20, orta nokta"
 },
 {
  "Ekipman_Turu": "Fire Suppression",
  "Varsayilan_Kacak_Orani": 0.02,
  "Kaynak": "EPA EF Hub (IPCC Tablo 2'de yok)"
 },
 {
  "Ekipman_Turu": "Diğer",
  "Varsayilan_Kacak_Orani": 0.05,
  "Kaynak": "Saha özelinde belirleyin"
 }
];
