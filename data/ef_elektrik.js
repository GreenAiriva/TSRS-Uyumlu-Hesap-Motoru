/* ============================================================
   ŞEBEKE ELEKTRİĞİ EMİSYON FAKTÖRLERİ (Kapsam 2 — Lokasyona Dayalı)
   ------------------------------------------------------------
   Ülke/şebeke bazında kg CO2e/kWh değerleri. Türkiye değerleri: T.C. ETKB EVÇED 2023 (dağıtım: 0,469 / iletim: 0,436 / üretim: 0,434).
   ABD ("ABD / ..." kayıtları): EPA eGRID 2022 alt-bölge faktörleri — GHG Protokol
   "Emission Factors for Cross-Sector Tools" V2.0, 'Electricity US' sayfası Tablo 1.
   Kaynaktaki birimler CO2: lb/MWh, CH4 ve N2O: lb/GWh olup buraya kg/kWh'e
   çevrilerek yazılmıştır (1 lb = 0,45359237 kg; MWh→kWh ÷1000, GWh→kWh ÷1000000).
   CH4 ve N2O gaz kütlesi olarak tutulur; CO2e'ye çevrim hesap anında AR5 KIP
   (kip_ar5.js) ile yapılır ve sonuç ton CO2e raporlanır (js/motor.js hesapElektrik).
   NASIL DÜZENLENİR?
   • En kolay yol: Uygulamayı açın → Yönetim Paneli → ilgili tabloyu
     görsel olarak düzenleyin. Kod bilgisi gerekmez.
   • Bu dosyayı elle düzenlerseniz: her kayıt { } içindedir, kayıtlar
     virgülle ayrılır. Metinler "tırnak içinde", sayılar tırnaksız yazılır.
   ============================================================ */
window.VERI = window.VERI || {};
VERI.ef_elektrik = [
 {
  "Region": "UK",
  "Year": 2023,
  "CO2_EF_kg_per_kWh": 0.20496,
  "CH4_EF_kg_per_kWh": 0.000032,
  "N2O_EF_kg_per_kWh": 0.000005,
  "EF_Unit": "kg/kWh"
 },
 {
  "Region": "Türkiye (Dağıtım bağlantılı)",
  "Year": 2023,
  "CO2_EF_kg_per_kWh": 0.469,
  "CH4_EF_kg_per_kWh": 0,
  "N2O_EF_kg_per_kWh": 0,
  "EF_Unit": "kg CO2e/kWh"
 },
 {
  "Region": "Türkiye (İletim bağlantılı)",
  "Year": 2023,
  "CO2_EF_kg_per_kWh": 0.436,
  "CH4_EF_kg_per_kWh": 0,
  "N2O_EF_kg_per_kWh": 0,
  "EF_Unit": "kg CO2e/kWh"
 },
 {
  "Region": "Türkiye (Üretim noktası)",
  "Year": 2023,
  "CO2_EF_kg_per_kWh": 0.434,
  "CH4_EF_kg_per_kWh": 0,
  "N2O_EF_kg_per_kWh": 0,
  "EF_Unit": "kg CO2e/kWh"
 },
 {
  "Region": "ABD / ASCC Alaska Grid",
  "Year": 2022,
  "CO2_EF_kg_per_kWh": 0.477224532,
  "CH4_EF_kg_per_kWh": 0.0000399161,
  "N2O_EF_kg_per_kWh": 0.0000054431,
  "EF_Unit": "kg/kWh"
 },
 {
  "Region": "ABD / ASCC Miscellaneous",
  "Year": 2022,
  "CO2_EF_kg_per_kWh": 0.224891097,
  "CH4_EF_kg_per_kWh": 0.0000104326,
  "N2O_EF_kg_per_kWh": 0.0000018144,
  "EF_Unit": "kg/kWh"
 },
 {
  "Region": "ABD / ERCOT All",
  "Year": 2022,
  "CO2_EF_kg_per_kWh": 0.349757365,
  "CH4_EF_kg_per_kWh": 0.000022226,
  "N2O_EF_kg_per_kWh": 0.0000031751,
  "EF_Unit": "kg/kWh"
 },
 {
  "Region": "ABD / FRCC All",
  "Year": 2022,
  "CO2_EF_kg_per_kWh": 0.369154336,
  "CH4_EF_kg_per_kWh": 0.0000217724,
  "N2O_EF_kg_per_kWh": 0.0000027216,
  "EF_Unit": "kg/kWh"
 },
 {
  "Region": "ABD / HICC Miscellaneous",
  "Year": 2022,
  "CO2_EF_kg_per_kWh": 0.524119633,
  "CH4_EF_kg_per_kWh": 0.0000562455,
  "N2O_EF_kg_per_kWh": 0.0000086183,
  "EF_Unit": "kg/kWh"
 },
 {
  "Region": "ABD / HICC Oahu",
  "Year": 2022,
  "CO2_EF_kg_per_kWh": 0.714592595,
  "CH4_EF_kg_per_kWh": 0.0000739356,
  "N2O_EF_kg_per_kWh": 0.0000113398,
  "EF_Unit": "kg/kWh"
 },
 {
  "Region": "ABD / MRO East",
  "Year": 2022,
  "CO2_EF_kg_per_kWh": 0.671144796,
  "CH4_EF_kg_per_kWh": 0.0000603278,
  "N2O_EF_kg_per_kWh": 0.0000086183,
  "EF_Unit": "kg/kWh"
 },
 {
  "Region": "ABD / MRO West",
  "Year": 2022,
  "CO2_EF_kg_per_kWh": 0.424782451,
  "CH4_EF_kg_per_kWh": 0.0000462664,
  "N2O_EF_kg_per_kWh": 0.0000068039,
  "EF_Unit": "kg/kWh"
 },
 {
  "Region": "ABD / NPCC Long Island",
  "Year": 2022,
  "CO2_EF_kg_per_kWh": 0.544631987,
  "CH4_EF_kg_per_kWh": 0.000061235,
  "N2O_EF_kg_per_kWh": 0.0000081647,
  "EF_Unit": "kg/kWh"
 },
 {
  "Region": "ABD / NPCC NYC/Westchester",
  "Year": 2022,
  "CO2_EF_kg_per_kWh": 0.401534934,
  "CH4_EF_kg_per_kWh": 0.0000104326,
  "N2O_EF_kg_per_kWh": 0.0000013608,
  "EF_Unit": "kg/kWh"
 },
 {
  "Region": "ABD / NPCC New England",
  "Year": 2022,
  "CO2_EF_kg_per_kWh": 0.243319648,
  "CH4_EF_kg_per_kWh": 0.0000285763,
  "N2O_EF_kg_per_kWh": 0.0000036287,
  "EF_Unit": "kg/kWh"
 },
 {
  "Region": "ABD / NPCC Upstate NY",
  "Year": 2022,
  "CO2_EF_kg_per_kWh": 0.124537868,
  "CH4_EF_kg_per_kWh": 0.0000068039,
  "N2O_EF_kg_per_kWh": 0.0000009072,
  "EF_Unit": "kg/kWh"
 },
 {
  "Region": "ABD / Puerto Rico Miscellaneous",
  "Year": 2022,
  "CO2_EF_kg_per_kWh": 0.722790823,
  "CH4_EF_kg_per_kWh": 0.0000394625,
  "N2O_EF_kg_per_kWh": 0.0000063503,
  "EF_Unit": "kg/kWh"
 },
 {
  "Region": "ABD / RFC East",
  "Year": 2022,
  "CO2_EF_kg_per_kWh": 0.298185274,
  "CH4_EF_kg_per_kWh": 0.0000204117,
  "N2O_EF_kg_per_kWh": 0.0000027216,
  "EF_Unit": "kg/kWh"
 },
 {
  "Region": "ABD / RFC Michigan",
  "Year": 2022,
  "CO2_EF_kg_per_kWh": 0.551751573,
  "CH4_EF_kg_per_kWh": 0.0000526167,
  "N2O_EF_kg_per_kWh": 0.0000072575,
  "EF_Unit": "kg/kWh"
 },
 {
  "Region": "ABD / RFC West",
  "Year": 2022,
  "CO2_EF_kg_per_kWh": 0.45361641,
  "CH4_EF_kg_per_kWh": 0.0000394625,
  "N2O_EF_kg_per_kWh": 0.0000054431,
  "EF_Unit": "kg/kWh"
 },
 {
  "Region": "ABD / SERC Midwest",
  "Year": 2022,
  "CO2_EF_kg_per_kWh": 0.621370291,
  "CH4_EF_kg_per_kWh": 0.0000684924,
  "N2O_EF_kg_per_kWh": 0.000009979,
  "EF_Unit": "kg/kWh"
 },
 {
  "Region": "ABD / SERC Mississippi Valley",
  "Year": 2022,
  "CO2_EF_kg_per_kWh": 0.363334292,
  "CH4_EF_kg_per_kWh": 0.0000181437,
  "N2O_EF_kg_per_kWh": 0.0000027216,
  "EF_Unit": "kg/kWh"
 },
 {
  "Region": "ABD / SERC South",
  "Year": 2022,
  "CO2_EF_kg_per_kWh": 0.405189528,
  "CH4_EF_kg_per_kWh": 0.0000290299,
  "N2O_EF_kg_per_kWh": 0.0000040823,
  "EF_Unit": "kg/kWh"
 },
 {
  "Region": "ABD / SERC Tennessee Valley",
  "Year": 2022,
  "CO2_EF_kg_per_kWh": 0.423232072,
  "CH4_EF_kg_per_kWh": 0.0000371946,
  "N2O_EF_kg_per_kWh": 0.0000054431,
  "EF_Unit": "kg/kWh"
 },
 {
  "Region": "ABD / SERC Virginia/Carolina",
  "Year": 2022,
  "CO2_EF_kg_per_kWh": 0.28258215,
  "CH4_EF_kg_per_kWh": 0.0000213188,
  "N2O_EF_kg_per_kWh": 0.0000031751,
  "EF_Unit": "kg/kWh"
 },
 {
  "Region": "ABD / SPP North",
  "Year": 2022,
  "CO2_EF_kg_per_kWh": 0.432080752,
  "CH4_EF_kg_per_kWh": 0.0000453592,
  "N2O_EF_kg_per_kWh": 0.0000063503,
  "EF_Unit": "kg/kWh"
 },
 {
  "Region": "ABD / SPP South",
  "Year": 2022,
  "CO2_EF_kg_per_kWh": 0.440165129,
  "CH4_EF_kg_per_kWh": 0.0000326587,
  "N2O_EF_kg_per_kWh": 0.0000045359,
  "EF_Unit": "kg/kWh"
 },
 {
  "Region": "ABD / WECC California",
  "Year": 2022,
  "CO2_EF_kg_per_kWh": 0.225636349,
  "CH4_EF_kg_per_kWh": 0.0000136078,
  "N2O_EF_kg_per_kWh": 0.0000018144,
  "EF_Unit": "kg/kWh"
 },
 {
  "Region": "ABD / WECC Northwest",
  "Year": 2022,
  "CO2_EF_kg_per_kWh": 0.273102523,
  "CH4_EF_kg_per_kWh": 0.0000254012,
  "N2O_EF_kg_per_kWh": 0.0000036287,
  "EF_Unit": "kg/kWh"
 },
 {
  "Region": "ABD / WECC Rockies",
  "Year": 2022,
  "CO2_EF_kg_per_kWh": 0.51024016,
  "CH4_EF_kg_per_kWh": 0.0000458128,
  "N2O_EF_kg_per_kWh": 0.0000063503,
  "EF_Unit": "kg/kWh"
 },
 {
  "Region": "ABD / WECC Southwest",
  "Year": 2022,
  "CO2_EF_kg_per_kWh": 0.351987679,
  "CH4_EF_kg_per_kWh": 0.0000231332,
  "N2O_EF_kg_per_kWh": 0.0000031751,
  "EF_Unit": "kg/kWh"
 }
];
