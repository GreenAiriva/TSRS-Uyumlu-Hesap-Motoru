/* ============================================================
   EKİPMAN TÜRÜNE GÖRE VARSAYILAN YILLIK KAÇAK ORANLARI
   ------------------------------------------------------------
   Tarama (basit) yönteminde kullanılan varsayılan kaçak oranları (0.02 = %2).
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
  "Varsayilan_Kacak_Orani": 0.02,
  "Kaynak": "IPCC 2006 GL Vol 3 Ch 7"
 },
 {
  "Ekipman_Turu": "Split AC / Heat Pump",
  "Varsayilan_Kacak_Orani": 0.04,
  "Kaynak": "IPCC 2006 GL Vol 3 Ch 7"
 },
 {
  "Ekipman_Turu": "VRF System",
  "Varsayilan_Kacak_Orani": 0.06,
  "Kaynak": "EPA EF Hub"
 },
 {
  "Ekipman_Turu": "Commercial Refrigeration",
  "Varsayilan_Kacak_Orani": 0.15,
  "Kaynak": "IPCC 2006 GL Vol 3 Ch 7"
 },
 {
  "Ekipman_Turu": "Refrigerated Transport",
  "Varsayilan_Kacak_Orani": 0.02,
  "Kaynak": "EPA EF Hub"
 },
 {
  "Ekipman_Turu": "Industrial Refrigeration",
  "Varsayilan_Kacak_Orani": 0.17,
  "Kaynak": "IPCC 2006 GL Vol 3 Ch 7"
 },
 {
  "Ekipman_Turu": "Fire Suppression",
  "Varsayilan_Kacak_Orani": 0.02,
  "Kaynak": "EPA EF Hub"
 },
 {
  "Ekipman_Turu": "Diğer",
  "Varsayilan_Kacak_Orani": 0.05,
  "Kaynak": "Saha özelinde belirleyin"
 }
];
