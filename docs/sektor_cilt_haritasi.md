# SEKTÖR-CİLT HARİTASI
**Tarih:** 2026-06-12 | **Statü:** v0.2 (Sprint 0 — 15/67 cilt tamamlandı) | **Hedef:** 67 cilt

> 67 TSRS 2 Ek Cildinin sektör adlarını ve metrik kodlarını listeler.
> Pattern doğrulandı; kalan ciltler head=80 ile (Tablo 1 + Tablo 2) okunuyor.

---

## PATTERN (tüm ciltlerde standart)
1. Giriş boilerplate → 2. Cilt başlığı → 3. Sektör Tanımı → 4. **Tablo 1** (Açıklama Konuları: KONU+METRİK+KATEGORİ+BİRİM+KOD) → 5. **Tablo 2** (Faaliyet Metrikleri) → 6. Metrik detayları (numaralı).

Kod prefiksleri SASB taksonomisinden: **CG**=Tüketim, **EM**=Çıkarım/Mineraller, **FN**=Finans, **SV**=Hizmetler, **IF**=Altyapı, **HC**=Sağlık, **TC**=Teknoloji-İletişim, **RT**=Perakende, **TR**=Ulaşım, **FB**=Gıda-İçecek, **RR**=Yenilenebilir, **CN**=Kimya, vb.

---

## TAMAMLANAN CİLTLER (1-15)

| Cilt | Sektör | Prefix | Açıklama metrikleri | Faaliyet metrikleri |
|---|---|---|---|---|
| **1** | Giyim, Aksesuar ve Ayakkabı | CG-AA | 440a.3 ham madde listesi+risk, 440a.4 satın alınan miktar+sertifika | 000.A tedarikçi sayısı (Kademe 1 / Kademe 1-dışı) |
| **3** | Yapı Ürünleri ve Mobilya *(TUREKS)* | CG-BF | *metrik detayı okunmadı* | — |
| **4** | E-Ticaret | CG-EC | 130a.1 enerji, 130a.2 su, 130a.3 veri merkezi stratejisi, 410a.1 sevkiyat GHG, 410a.2 teslimat stratejisi | 000.A kullanıcı etkinliği, 000.B veri işleme kapasitesi, 000.C sevkiyat sayısı |
| **5** | Ev ve Kişisel Bakım Ürünleri | CG-HP | 140a.1 su, 140a.2 su risk stratejisi, 430a.1 palm yağı+RSPO | 000.A satılan ürün adedi+ağırlık, 000.B üretim tesisi sayısı |
| **6** | Çok Hatlı/Özel Perakendeci ve Distribütör *(TUREKS)* | CG-MR | *metrik detayı okunmadı* | — |
| **7** | Kömür Faaliyetleri | EM-CO | 110a.1 K1+düzenleme%, 110a.2 K1 stratejisi, 140a.1 su, 140a.2 su uyumsuzluk, 420a.1 rezerv duyarlılığı, 420a.2 gömülü CO2, 420a.3 CAPEX stratejisi | 000.A termal kömür, 000.B metalurjik kömür (Mt) |
| **8** | İnşaat Malzemeleri *(TUREKS)* | EM-CM | *metrik detayı okunmadı* | — |
| **9** | Demir ve Çelik Üreticileri | EM-IS | 110a.1 K1+düzenleme%, 110a.2 K1 stratejisi, 130a.1 enerji, 130a.2 yakıt(kömür/gaz/yenilenebilir%), 140a.1 su, 430a.1 tedarik zinciri | 000.A ham çelik+BOF/EAF%, 000.B demir cevheri, 000.C kok kömürü |
| **10** | Metaller ve Madencilik *(TUREKS ANA)* | EM-MM | 110a.1 K1+düzenleme%, 110a.2 K1 stratejisi, 130a.1 enerji, 140a.1 su, 140a.2 su uyumsuzluk | 000.A cevher+bitmiş metal üretimi, 000.B çalışan+yüklenici% |
| **11** | Petrol ve Gaz – Arama ve Üretim | EM-EP | 110a.1 K1+metan%+düzenleme%, 110a.2 K1 kaynak dökümü (alev/yanma/süreç/baca/kaçak), 110a.3 K1 stratejisi, 140a.1-4 su+kırma, 420a.1-4 rezerv/CO2/yenilenebilir/CAPEX | 000.A petrol/gaz/sentetik üretim, 000.B deniz sahası, 000.C kara sahası |
| **12** | Petrol ve Gaz – Orta Akım | EM-MD | 110a.1 K1+metan%+düzenleme%, 110a.2 K1 stratejisi | 000.A taşıma ton-km (gaz/petrol/rafine) |
| **13** | Petrol ve Gaz – Rafineri ve Pazarlama | EM-RM | 110a.1 K1+düzenleme%, 110a.2 K1 stratejisi, 140a.1 su, 410a.2 gelişmiş biyoyakıt pazarı, 410a.3 yenilenebilir yakıt hacmi | 000.A rafine ham petrol (BOE), 000.B rafine kapasitesi |
| **14** | Petrol ve Gaz Hizmetleri | EM-SV | 110a.1 yakıt+yenilenebilir%, 110a.2 hava emisyon stratejisi, 110a.3 dizel motor standardı%, 140a.1 su+geri dönüşüm%, 140a.2 su stratejisi | 000.A teçhizat sahası, 000.B kuyu sahası, 000.C sondaj(m), 000.D çalışan saati |
| **15** | Varlık Yönetimi ve Saklama | FN-AC | 410a.1 ÇSY/sürdürülebilirlik/tarama AUM, 410a.2 ÇSY yaklaşımı, 410a.3 vekaleten oy politikası | 000.A yönetilen varlık, 000.B saklanan varlık |

---

## TUREKS İÇİN GEÇERLİ CİLTLER (4 cilt)
- **Cilt 10** — Metaller ve Madencilik (EM-MM) — ANA SEKTÖR
- **Cilt 8** — İnşaat Malzemeleri (EM-CM) — *metrik okunacak*
- **Cilt 3** — Yapı Ürünleri ve Mobilya (CG-BF) — *metrik okunacak*
- **Cilt 6** — Çok Hatlı Perakendeci/Distribütör (CG-MR) — *metrik okunacak*

> **Öncelik:** Sprint 0 devamında Cilt 3, 6, 8 metrik detayları okunmalı (TUREKS raporu için kritik).

---

## ORTAK METRİKLER (sektörler arası — tek-hesap mekanizması için)

| Metrik teması | Kod paterni | Görülen ciltler | Not |
|---|---|---|---|
| **Brüt K1 + düzenleme %** | XX-110a.1 | 7, 9, 10, 11, 12, 13 | Tüm EM (çıkarım) ciltlerinde neredeyse evrensel |
| **K1 yönetim stratejisi** | XX-110a.2/3 | 7, 9, 10, 11, 12, 13, 14 | 110a.1 ile çift |
| **Toplam enerji + yenilenebilir %** | XX-130a.1 | 4, 9, 10 | Enerji yoğun üretim |
| **Su çekme/tüketme + su stresi %** | XX-140a.1 | 4, 5, 7, 9, 10, 11, 13 | **En yaygın metrik — neredeyse evrensel** |
| **Su kalitesi uyumsuzluk** | XX-140a.2 | 7, 10, 11 | Çevre etkisi yüksek |
| **Rezerv duyarlılığı (IEA WEO)** | XX-420a.1 | 7, 11 | Fosil yakıt çıkarımı |
| **Gömülü CO2 (E=R×V×C)** | XX-420a.2 | 7, 11 | Rezerv bazlı |
| **Tedarik zinciri risk** | XX-430a.1 | 1, 9 | Çeşitli formlar |

**Tek-hesap kuralı:** TUREKS gibi çok-cilt şirketlerde, örneğin Su Yönetimi (140a.1) hem Cilt 10 hem (varsa) Cilt 8'de istenirse, motor **bir kez** hesaplar, raporda her iki cildin referansıyla gösterir. K1 emisyonu (110a.1) da aynı şekilde.

---

## METRİK TİP SINIFLANDIRMASI (motor tasarımı için)

Üç tip metrik var:
1. **Nicel-Hesaplanabilir** (motor hesaplar): K1/K2/K3 emisyonları, enerji GJ, su m³, üretim tonajı → mevcut hesap motoru + yeni modüller
2. **Nicel-Veri Girişi** (kullanıcı girer, motor toplar): tedarikçi sayısı, çalışan sayısı, tesis sayısı, sertifika % → form alanı
3. **Müzakere ve Analiz (T&A)** (anlatı metni): stratejiler, planlar, politikalar → rapor metni alanı + `[VERİ BEKLENİYOR]` (Y4)

---

## KALAN CİLTLER (52 adet)
16-50, 52-68 (Cilt 2 ve 51 mevcut değil)
+ Cilt 3, 6, 8 metrik detayları

## BATCH PLANI
- ✅ Batch 1: Cilt 1, 4, 5, 7, 9
- ✅ Batch 2: Cilt 11, 12, 13, 14, 15
- ⬜ Batch 3: Cilt 16-22
- ⬜ Batch 4: Cilt 23-30
- ⬜ Batch 5: Cilt 31-40
- ⬜ Batch 6: Cilt 41-50
- ⬜ Batch 7: Cilt 52-60
- ⬜ Batch 8: Cilt 61-68 + Cilt 3, 6, 8 detayları
