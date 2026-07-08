/* ============================================================
   AÇILIR LİSTELER (Formlardaki seçim kutuları)
   ------------------------------------------------------------
   Uygulamadaki tüm açılır listelerin seçenekleri burada tutulur.
   NASIL DÜZENLENİR?
   • En kolay yol: Yönetim Paneli → "Açılır Listeler" sekmesi.
   • Elle düzenleme: her seçenek "tırnak içinde" yazılır ve
     virgülle ayrılır. Yeni satır eklemek serbesttir.
   ============================================================ */
window.VERI = window.VERI || {};
VERI.listeler = {
 "raporlama_siniri": ["Operasyonel Kontrol", "Finansal Kontrol", "Hisse Payı"],
 "faaliyet_kategorisi": [
  "Sabit Yanma",
  "Mobil Yanma - Yakıt",
  "Mobil Yanma - Mesafe",
  "Proses Emisyonları",
  "Satın Alınan Isı/Buhar",
  "Yük Taşıma (Yukarı Akış)",
  "Yük Taşıma (Aşağı Akış)",
  "İş Seyahati - Toplu Taşıma",
  "Çalışan Ulaşımı",
  "Diğer Kapsam 3"
 ],
 "kacak_yontemi": ["Kütle Dengesi", "Tarama (Basit)"],
 "elektrik_yaklasimi": ["Lokasyona Dayalı", "Piyasaya Dayalı"],
 "sozlesme_turu": ["Şebeke (standart)", "Yeşil Tarife", "REC / I-REC", "İkili Anlaşma (PPA)", "Yerinde Üretim"],
 "dogrulama_durumu": ["Doğrulanmamış", "Sınırlı Güvence", "Makul Güvence"],
 /* EF tablolarındaki bölge/kaynak setleri (GHG Protokol Cross-Sector aracı):
    Other1 = IPCC 2006 genel değerleri (bölgeden bağımsız — TR için de bunu kullanın),
    UK = DEFRA, US = EPA. Coğrafi bölge DEĞİL, EF kaynak seti seçimidir. */
 "bolge": ["Other1", "UK", "US"],
 "evet_hayir": ["Evet", "Hayır"],
 "veri_kalitesi": ["Birincil (ölçüm/fatura)", "İkincil (hesaplama)", "Tahmin"],
 "ekipman_turu": [
  "Chiller (centralized AC)",
  "Split AC / Heat Pump",
  "VRF System",
  "Commercial Refrigeration",
  "Stand-Alone Commercial Refrigeration",
  "Domestic Refrigeration",
  "Refrigerated Transport",
  "Industrial Refrigeration",
  "Mobile Air Conditioning",
  "Fire Suppression",
  "Diğer"
 ],
 "zaman_dilimi": ["Kısa Vade (0-3 yıl)", "Orta Vade (3-10 yıl)", "Uzun Vade (10+ yıl)"],
 "risk_turu": [
  "Fiziksel — Akut",
  "Fiziksel — Kronik",
  "Geçiş — Politika ve Hukuk",
  "Geçiş — Teknoloji",
  "Geçiş — Pazar",
  "Geçiş — İtibar",
  "Fırsat"
 ],
 "etki_yonu": ["Negatif (risk)", "Pozitif (fırsat)", "Karma"],
 "deger_zinciri_konumu": ["Kendi Operasyonları", "Yukarı Akış (tedarik)", "Aşağı Akış (müşteri)", "Tüm Değer Zinciri"],
 "organ_turu": ["Yönetim Kurulu", "YK Komitesi", "Üst Yönetim / İcra", "Sürdürülebilirlik Komitesi", "Bireysel Yönetici"],
 "senaryo": [
  "NGFS — Net Zero 2050",
  "NGFS — Delayed Transition",
  "NGFS — Current Policies",
  "IEA — NZE (Net Zero Emissions)",
  "IEA — STEPS",
  "IPCC — RCP 2.6 / SSP1-2.6",
  "IPCC — RCP 4.5 / SSP2-4.5",
  "IPCC — RCP 8.5 / SSP5-8.5",
  "Diğer / Şirkete Özel"
 ],
 "hedef_turu": ["Mutlak Emisyon Azaltımı", "Yoğunluk Hedefi", "Net Sıfır", "Yenilenebilir Enerji", "Diğer"],
 "metrik_adi": [
  "Geçiş riskine kırılgan varlıkların oranı (%)",
  "Fiziksel riske kırılgan varlıkların oranı (%)",
  "İklim fırsatlarıyla uyumlu varlıkların oranı (%)",
  "İklim yatırım harcaması / toplam yatırım (%)",
  "İç karbon fiyatı (TL/ton CO2e)",
  "İklime bağlı ücretlendirme oranı (%)",
  "Diğer"
 ],
 "konu_kategorisi": ["İklim — Emisyonlar", "İklim — Fiziksel Risk", "İklim — Geçiş Riski", "Su", "Biyoçeşitlilik", "Atık / Döngüsellik", "İş Sağlığı ve Güvenliği", "Toplumsal Etki", "Yönetişim", "Diğer"],
 "tsrs_muafiyetleri": [
  "İlk raporlama yılında Kapsam 3 emisyonlarını açıklamama (TSRS 2 geçiş muafiyeti)",
  "İlk raporlama yılında karşılaştırmalı bilgi sunmama (TSRS 1 Ek E)",
  "İlk yıl yalnızca iklimle ilgili açıklamalara odaklanma (iklim öncelikli yaklaşım)",
  "Sera gazı ölçümünde GHG Protokolü dışındaki yöntemi sürdürme (geçiş dönemi)",
  "Raporlamayı finansal raporla eş zamanlı yayımlamama (ilk yıl zamanlama muafiyeti)"
 ],
 "birimler": {
  "Sabit Yanma": ["tonne", "kg", "L", "m3", "GJ", "kWh", "MWh"],
  "Mobil Yanma - Yakıt": ["L", "US Gallon", "m3", "scf"],
  "Mobil Yanma - Mesafe": ["km", "mil"],
  "Proses Emisyonları": ["tonne", "kg"],
  "Satın Alınan Isı/Buhar": ["kWh", "MWh", "GJ"],
  "Yük Taşıma (Yukarı Akış)": ["ton-km", "ton-mil (kısa)"],
  "Yük Taşıma (Aşağı Akış)": ["ton-km", "ton-mil (kısa)"],
  "İş Seyahati - Toplu Taşıma": ["yolcu-km", "yolcu-mil"],
  "Çalışan Ulaşımı": ["yolcu-km", "yolcu-mil", "km", "mil"],
  "Diğer Kapsam 3": ["birim (serbest)"]
 }
};
