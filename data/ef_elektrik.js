/* ============================================================
   ŞEBEKE ELEKTRİĞİ EMİSYON FAKTÖRLERİ (Kapsam 2 — Lokasyona Dayalı)
   ------------------------------------------------------------
   Ülke/şebeke bazında kg CO2e/kWh değerleri. Türkiye değerleri: T.C. ETKB EVÇED 2023 (dağıtım: 0,469 / iletim: 0,436 / üretim: 0,434).
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
 }
];
