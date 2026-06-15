/* ============================================================
   TOPLU TAŞIMA / İŞ SEYAHATİ EMİSYON FAKTÖRLERİ (Kapsam 3)
   ------------------------------------------------------------
   İş seyahati ve çalışan ulaşımı için yolcu-km / yolcu-mil bazlı emisyon faktörleri.
   KAYNAK: GHG Protocol — Emission Factors for Cross-Sector Tools V2.0 (Mart 2024),
   "Mobile Combustion - Public" sayfası, Tablo 1 (CO2, CH4, N2O).
   • UK: UK Government GHG Conversion Factors (hava 2022, diğer 2023). DEFRA yalnızca
     CO2e yayımladığı için CH4/N2O, AR5/AR4 GWP ile geri-hesaplanmıştır.
   • US: EPA Emission Factors Hub (2024), Tablo 10. Hava değerleri UK 2022'den.
   NOT: Hava CO2 değerleri RFI (radyatif zorlama) İÇERMEZ.
   NASIL DÜZENLENİR?
   • En kolay yol: Uygulamayı açın → Yönetim Paneli → ilgili tabloyu
     görsel olarak düzenleyin. Kod bilgisi gerekmez.
   • Bu dosyayı elle düzenlerseniz: her kayıt { } içindedir, kayıtlar
     virgülle ayrılır. Metinler "tırnak içinde", sayılar tırnaksız yazılır.
   ============================================================ */
window.VERI = window.VERI || {};
VERI.ef_toplu_tasima = [
 {
  "Region": "UK",
  "Vehicle": "Air",
  "Vehicle_Class": "Domestic, between UK airports (Average Passenger)",
  "Fuel": null,
  "CO2_EF": 0.12871,
  "CO2_Unit": "kg/passenger-kilometer",
  "CH4_EF": 0.004,
  "CH4_Unit": "g/passenger-kilometer",
  "N2O_EF": 0.004094,
  "N2O_Unit": "g/passenger-kilometer"
 },
 {
  "Region": "UK",
  "Vehicle": "Air",
  "Vehicle_Class": "Short Haul, up to 3700km (Average Passenger)",
  "Fuel": null,
  "CO2_EF": 0.0804,
  "CO2_Unit": "kg/passenger-kilometer",
  "CH4_EF": 0.0004,
  "CH4_Unit": "g/passenger-kilometer",
  "N2O_EF": 0.00255,
  "N2O_Unit": "g/passenger-kilometer"
 },
 {
  "Region": "UK",
  "Vehicle": "Air",
  "Vehicle_Class": "Short Haul, up to 3700km (Economy Class)",
  "Fuel": null,
  "CO2_EF": 0.07908,
  "CO2_Unit": "kg/passenger-kilometer",
  "CH4_EF": 0.0004,
  "CH4_Unit": "g/passenger-kilometer",
  "N2O_EF": 0.002517,
  "N2O_Unit": "g/passenger-kilometer"
 },
 {
  "Region": "UK",
  "Vehicle": "Air",
  "Vehicle_Class": "Short Haul, up to 3700km (Business Class)",
  "Fuel": null,
  "CO2_EF": 0.11863,
  "CO2_Unit": "kg/passenger-kilometer",
  "CH4_EF": 0.0004,
  "CH4_Unit": "g/passenger-kilometer",
  "N2O_EF": 0.003758,
  "N2O_Unit": "g/passenger-kilometer"
 },
 {
  "Region": "UK",
  "Vehicle": "Air",
  "Vehicle_Class": "Long Haul, over 3700km (Average Passenger)",
  "Fuel": null,
  "CO2_EF": 0.10111,
  "CO2_Unit": "kg/passenger-kilometer",
  "CH4_EF": 0.0004,
  "CH4_Unit": "g/passenger-kilometer",
  "N2O_EF": 0.003221,
  "N2O_Unit": "g/passenger-kilometer"
 },
 {
  "Region": "UK",
  "Vehicle": "Air",
  "Vehicle_Class": "Long Haul, over 3700km (Economy Class)",
  "Fuel": null,
  "CO2_EF": 0.07744,
  "CO2_Unit": "kg/passenger-kilometer",
  "CH4_EF": 0.0004,
  "CH4_Unit": "g/passenger-kilometer",
  "N2O_EF": 0.00245,
  "N2O_Unit": "g/passenger-kilometer"
 },
 {
  "Region": "UK",
  "Vehicle": "Air",
  "Vehicle_Class": "Long Haul, over 3700km (Premium Economy Class)",
  "Fuel": null,
  "CO2_EF": 0.1239,
  "CO2_Unit": "kg/passenger-kilometer",
  "CH4_EF": 0.0004,
  "CH4_Unit": "g/passenger-kilometer",
  "N2O_EF": 0.003926,
  "N2O_Unit": "g/passenger-kilometer"
 },
 {
  "Region": "UK",
  "Vehicle": "Air",
  "Vehicle_Class": "Long Haul, over 3700km (Business Class)",
  "Fuel": null,
  "CO2_EF": 0.22457,
  "CO2_Unit": "kg/passenger-kilometer",
  "CH4_EF": 0.0008,
  "CH4_Unit": "g/passenger-kilometer",
  "N2O_EF": 0.007114,
  "N2O_Unit": "g/passenger-kilometer"
 },
 {
  "Region": "UK",
  "Vehicle": "Air",
  "Vehicle_Class": "Long Haul, over 3700km (First Class)",
  "Fuel": null,
  "CO2_EF": 0.30975,
  "CO2_Unit": "kg/passenger-kilometer",
  "CH4_EF": 0.0008,
  "CH4_Unit": "g/passenger-kilometer",
  "N2O_EF": 0.009832,
  "N2O_Unit": "g/passenger-kilometer"
 },
 {
  "Region": "UK",
  "Vehicle": "Air",
  "Vehicle_Class": "International, over 3700km (Average Passenger)",
  "Fuel": null,
  "CO2_EF": 0.09616,
  "CO2_Unit": "kg/passenger-kilometer",
  "CH4_EF": 0.0004,
  "CH4_Unit": "g/passenger-kilometer",
  "N2O_EF": 0.003054,
  "N2O_Unit": "g/passenger-kilometer"
 },
 {
  "Region": "UK",
  "Vehicle": "Air",
  "Vehicle_Class": "International, over 3700km (Economy Class)",
  "Fuel": null,
  "CO2_EF": 0.07364,
  "CO2_Unit": "kg/passenger-kilometer",
  "CH4_EF": 0.0002,
  "CH4_Unit": "g/passenger-kilometer",
  "N2O_EF": 0.002349,
  "N2O_Unit": "g/passenger-kilometer"
 },
 {
  "Region": "UK",
  "Vehicle": "Air",
  "Vehicle_Class": "International, over 3700km (Premium Economy Class)",
  "Fuel": null,
  "CO2_EF": 0.11783,
  "CO2_Unit": "kg/passenger-kilometer",
  "CH4_EF": 0.0004,
  "CH4_Unit": "g/passenger-kilometer",
  "N2O_EF": 0.003725,
  "N2O_Unit": "g/passenger-kilometer"
 },
 {
  "Region": "UK",
  "Vehicle": "Air",
  "Vehicle_Class": "International, over 3700km (Business Class)",
  "Fuel": null,
  "CO2_EF": 0.21357,
  "CO2_Unit": "kg/passenger-kilometer",
  "CH4_EF": 0.0004,
  "CH4_Unit": "g/passenger-kilometer",
  "N2O_EF": 0.006779,
  "N2O_Unit": "g/passenger-kilometer"
 },
 {
  "Region": "UK",
  "Vehicle": "Air",
  "Vehicle_Class": "International, over 3700km (First Class)",
  "Fuel": null,
  "CO2_EF": 0.29458,
  "CO2_Unit": "kg/passenger-kilometer",
  "CH4_EF": 0.0008,
  "CH4_Unit": "g/passenger-kilometer",
  "N2O_EF": 0.009362,
  "N2O_Unit": "g/passenger-kilometer"
 },
 {
  "Region": "UK",
  "Vehicle": "Rail",
  "Vehicle_Class": "Light Rail and Tram",
  "Fuel": null,
  "CO2_EF": 0.02832,
  "CO2_Unit": "kg/passenger-kilometer",
  "CH4_EF": 0.0044,
  "CH4_Unit": "g/passenger-kilometer",
  "N2O_EF": 0.000604,
  "N2O_Unit": "g/passenger-kilometer"
 },
 {
  "Region": "UK",
  "Vehicle": "Rail",
  "Vehicle_Class": "National Rail",
  "Fuel": null,
  "CO2_EF": 0.0351,
  "CO2_Unit": "kg/passenger-kilometer",
  "CH4_EF": 0.0028,
  "CH4_Unit": "g/passenger-kilometer",
  "N2O_EF": 0.001074,
  "N2O_Unit": "g/passenger-kilometer"
 },
 {
  "Region": "UK",
  "Vehicle": "Taxi",
  "Vehicle_Class": "Taxi",
  "Fuel": null,
  "CO2_EF": 0.14742,
  "CO2_Unit": "kg/passenger-kilometer",
  "CH4_EF": 0.000118,
  "CH4_Unit": "g/passenger-kilometer",
  "N2O_EF": 0.004497,
  "N2O_Unit": "g/passenger-kilometer"
 },
 {
  "Region": "UK",
  "Vehicle": "Bus",
  "Vehicle_Class": "Local Bus",
  "Fuel": null,
  "CO2_EF": 0.11746,
  "CO2_Unit": "kg/passenger-kilometer",
  "CH4_EF": 0.0008,
  "CH4_Unit": "g/passenger-kilometer",
  "N2O_EF": 0.003322,
  "N2O_Unit": "g/passenger-kilometer"
 },
 {
  "Region": "UK",
  "Vehicle": "Bus",
  "Vehicle_Class": "Coach",
  "Fuel": null,
  "CO2_EF": 0.02669,
  "CO2_Unit": "kg/passenger-kilometer",
  "CH4_EF": 0.0004,
  "CH4_Unit": "g/passenger-kilometer",
  "N2O_EF": 0.001812,
  "N2O_Unit": "g/passenger-kilometer"
 },
 {
  "Region": "UK",
  "Vehicle": "Bus",
  "Vehicle_Class": "Average Local Bus",
  "Fuel": null,
  "CO2_EF": 0.10141,
  "CO2_Unit": "kg/passenger-kilometer",
  "CH4_EF": 0.0004,
  "CH4_Unit": "g/passenger-kilometer",
  "N2O_EF": 0.002752,
  "N2O_Unit": "g/passenger-kilometer"
 },
 {
  "Region": "UK",
  "Vehicle": "Ferry",
  "Vehicle_Class": "Average Ferry",
  "Fuel": null,
  "CO2_EF": 0.111313,
  "CO2_Unit": "kg/passenger-kilometer",
  "CH4_EF": 0.00132,
  "CH4_Unit": "g/passenger-kilometer",
  "N2O_EF": 0.005087,
  "N2O_Unit": "g/passenger-kilometer"
 },
 {
  "Region": "US",
  "Vehicle": "Air",
  "Vehicle_Class": "Short Haul (< 300 miles)",
  "Fuel": null,
  "CO2_EF": 0.207,
  "CO2_Unit": "kg/passenger-mile",
  "CH4_EF": 0.0064,
  "CH4_Unit": "g/passenger-mile",
  "N2O_EF": 0.0066,
  "N2O_Unit": "g/passenger-mile"
 },
 {
  "Region": "US",
  "Vehicle": "Air",
  "Vehicle_Class": "Medium Haul (>= 300 miles, < 2300 miles)",
  "Fuel": null,
  "CO2_EF": 0.129,
  "CO2_Unit": "kg/passenger-mile",
  "CH4_EF": 0.0006,
  "CH4_Unit": "g/passenger-mile",
  "N2O_EF": 0.0041,
  "N2O_Unit": "g/passenger-mile"
 },
 {
  "Region": "US",
  "Vehicle": "Air",
  "Vehicle_Class": "Long Haul (>= 2300 miles)",
  "Fuel": null,
  "CO2_EF": 0.163,
  "CO2_Unit": "kg/passenger-mile",
  "CH4_EF": 0.0006,
  "CH4_Unit": "g/passenger-mile",
  "N2O_EF": 0.0052,
  "N2O_Unit": "g/passenger-mile"
 },
 {
  "Region": "US",
  "Vehicle": "Rail",
  "Vehicle_Class": "Intercity Rail – Northeast Corridor",
  "Fuel": null,
  "CO2_EF": 0.058,
  "CO2_Unit": "kg/passenger-mile",
  "CH4_EF": 0.0055,
  "CH4_Unit": "g/passenger-mile",
  "N2O_EF": 0.0007,
  "N2O_Unit": "g/passenger-mile"
 },
 {
  "Region": "US",
  "Vehicle": "Rail",
  "Vehicle_Class": "Intercity Rail – Other Routes",
  "Fuel": null,
  "CO2_EF": 0.15,
  "CO2_Unit": "kg/passenger-mile",
  "CH4_EF": 0.0117,
  "CH4_Unit": "g/passenger-mile",
  "N2O_EF": 0.0038,
  "N2O_Unit": "g/passenger-mile"
 },
 {
  "Region": "US",
  "Vehicle": "Rail",
  "Vehicle_Class": "Intercity Rail – National Average",
  "Fuel": null,
  "CO2_EF": 0.113,
  "CO2_Unit": "kg/passenger-mile",
  "CH4_EF": 0.0092,
  "CH4_Unit": "g/passenger-mile",
  "N2O_EF": 0.0026,
  "N2O_Unit": "g/passenger-mile"
 },
 {
  "Region": "US",
  "Vehicle": "Rail",
  "Vehicle_Class": "Commuter Rail",
  "Fuel": null,
  "CO2_EF": 0.133,
  "CO2_Unit": "kg/passenger-mile",
  "CH4_EF": 0.0105,
  "CH4_Unit": "g/passenger-mile",
  "N2O_EF": 0.0026,
  "N2O_Unit": "g/passenger-mile"
 },
 {
  "Region": "US",
  "Vehicle": "Rail",
  "Vehicle_Class": "Transit Rail (Subway, Tram)",
  "Fuel": null,
  "CO2_EF": 0.093,
  "CO2_Unit": "kg/passenger-mile",
  "CH4_EF": 0.0075,
  "CH4_Unit": "g/passenger-mile",
  "N2O_EF": 0.001,
  "N2O_Unit": "g/passenger-mile"
 },
 {
  "Region": "US",
  "Vehicle": "Bus",
  "Vehicle_Class": "Bus",
  "Fuel": null,
  "CO2_EF": 0.071,
  "CO2_Unit": "kg/passenger-mile",
  "CH4_EF": 0,
  "CH4_Unit": "g/passenger-mile",
  "N2O_EF": 0.0021,
  "N2O_Unit": "g/passenger-mile"
 },
 {
  "Region": "US",
  "Vehicle": "Passenger Car (Vehicle-Distance)",
  "Vehicle_Class": "Passenger Car",
  "Fuel": null,
  "CO2_EF": 0.175,
  "CO2_Unit": "kg/vehicle-mile",
  "CH4_EF": 0.005,
  "CH4_Unit": "g/vehicle-mile",
  "N2O_EF": 0.003,
  "N2O_Unit": "g/vehicle-mile"
 },
 {
  "Region": "US",
  "Vehicle": "Light-Duty Truck (Vehicle-Distance)",
  "Vehicle_Class": "Light-Duty Truck",
  "Fuel": null,
  "CO2_EF": 0.955,
  "CO2_Unit": "kg/vehicle-mile",
  "CH4_EF": 0.026,
  "CH4_Unit": "g/vehicle-mile",
  "N2O_EF": 0.023,
  "N2O_Unit": "g/vehicle-mile"
 },
 {
  "Region": "US",
  "Vehicle": "Motorcycle (Vehicle-Distance)",
  "Vehicle_Class": "Motorcycle",
  "Fuel": null,
  "CO2_EF": 0.377,
  "CO2_Unit": "kg/vehicle-mile",
  "CH4_EF": 0,
  "CH4_Unit": "g/vehicle-mile",
  "N2O_EF": 0.019,
  "N2O_Unit": "g/vehicle-mile"
 }
];
