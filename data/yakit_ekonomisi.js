/* ============================================================
   ORTALAMA YAKIT EKONOMİSİ DEĞERLERİ
   ------------------------------------------------------------
   Mesafe verisinden yakıt tüketimi tahmini gerektiğinde kullanılır.
   NASIL DÜZENLENİR?
   • En kolay yol: Uygulamayı açın → Yönetim Paneli → ilgili tabloyu
     görsel olarak düzenleyin. Kod bilgisi gerekmez.
   • Bu dosyayı elle düzenlerseniz: her kayıt { } içindedir, kayıtlar
     virgülle ayrılır. Metinler "tırnak içinde", sayılar tırnaksız yazılır.
   ============================================================ */
window.VERI = window.VERI || {};
VERI.yakit_ekonomisi = [
 {
  "Vehicle_Type": "Passenger Cars",
  "Average_Fuel_Economy_mpg": 24.4,
  "Average_Fuel_Economy_km_per_L": 10.3741496599
 },
 {
  "Vehicle_Type": "Motorcycles",
  "Average_Fuel_Economy_mpg": 44,
  "Average_Fuel_Economy_km_per_L": 18.7074829932
 },
 {
  "Vehicle_Type": "Diesel Buses (Diesel Heavy-Duty Vehicles)",
  "Average_Fuel_Economy_mpg": 7.4,
  "Average_Fuel_Economy_km_per_L": 3.1462585034
 },
 {
  "Vehicle_Type": "Other 2-axle, 4-Tire Vehicles",
  "Average_Fuel_Economy_mpg": 17.8,
  "Average_Fuel_Economy_km_per_L": 7.5680272109
 },
 {
  "Vehicle_Type": "Single unit 2-Axle 6-Tire or More Trucks",
  "Average_Fuel_Economy_mpg": 7.7,
  "Average_Fuel_Economy_km_per_L": 3.2738095238
 },
 {
  "Vehicle_Type": "Combination Trucks",
  "Average_Fuel_Economy_mpg": 6.4,
  "Average_Fuel_Economy_km_per_L": 2.7210884354
 }
];
