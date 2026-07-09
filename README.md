# Karbon Motoru — TSRS Uyumlu Sürdürülebilirlik Raporlama Motoru

> Madencilik ve ilgili sektörler için TSRS 1 + TSRS 2 uyumlu, web tabanlı, tarayıcıda çalışan açık kaynaklı sürdürülebilirlik raporlama motoru.

[![Status](https://img.shields.io/badge/status-in--development-yellow)]()
[![Standard](https://img.shields.io/badge/standard-TSRS%201%20%2B%20TSRS%202-blue)]()
[![License](https://img.shields.io/badge/license-private-lightgrey)]()

---

## Nedir?

Bu uygulama; **TSRS 1** (Sürdürülebilirlikle İlgili Finansal Bilgilerin Açıklanması — Genel Hükümler) ve **TSRS 2** (İklimle İlgili Açıklamalar) standartlarına uygun bir sürdürülebilirlik raporu hazırlamak isteyen şirketler için tasarlanmıştır.

- **Çevrimdışı çalışır** — `index.html` çift tıkla, internet/sunucu/kurulum gerekmez
- **GHG Protokolü** + **IPCC AR6** + **TSRS 2 Ek Ciltleri** (sektör bazlı)
- **3 kapsam** sera gazı (Kapsam 1, 2, 3) emisyon hesabı
- **4 TSRS direği** — Yönetişim, Strateji, Risk Yönetimi, Metrikler ve Hedefler
- **Yönetim paneli** — kod yazmadan referans tabloları/listeler/form alanları/metinler düzenleme
- **JSON yedek** — şirket-yıl bazlı veri taşınabilirliği

## Klasör yapısı

```
KarbonMotoru_WebApp/
├── index.html              ← Ana giriş — çift tıkla aç
├── css/                    ← Tasarım sistemi
├── js/                     ← Hesap motoru + UI
├── data/                   ← Referans veriler (EF tabloları, KIP/AR6, vb.)
├── input_cloud/            ← [.gitignored] Müşteri ham verisi
├── output_cloud/           ← [.gitignored] Üretilen JSON yedek + raporlar
├── docs/                   ← Belgeler, kılavuzlar
├── betikler/               ← Otomasyon scriptleri (.bat / .ps1)
└── BENI_OKU.txt           ← Kullanım kılavuzu
```

## Hızlı başlangıç

1. Bu repoyu klonla veya zip indir
2. `index.html` dosyasına çift tıkla
3. Soldaki menüden **Şirket Profili** ile başla
4. Veri girişi sayfalarını doldur
5. **Gösterge Paneli**'nden sonuçları izle
6. **Rapor**'dan TSRS uyumlu çıktıyı yazdır/indir

## Standart referansları

- **TSRS 1** — Sürdürülebilirlikle İlgili Finansal Bilgilerin Açıklanması — Genel Hükümler (KGK, 1 Ocak 2024)
- **TSRS 2** — İklimle İlgili Açıklamalar (KGK, 1 Ocak 2024)
- **TSRS 2 Ek Ciltleri** — Sektör bazlı rehberlik (53 cilt, ISSB/SASB türetimli)
- **GHG Protokolü** — Kurumsal Muhasebe ve Raporlama Standardı (WRI/WBCSD, 2004)
- **IPCC AR6** — Altıncı Değerlendirme Raporu, 100-yıllık KIP değerleri

## Geliştirme

Bu repo aktif geliştirmededir. Yol haritası için `02_FAZ2_RAPOR_ANALIZI.md` dosyasına bakın (repo dışında, ana çalışma dizininde).

### Çalışma Yasaları (Anayasa)
1. **Y1** — Son kayıt esastır
2. **Y2** — Token optimizasyonu; hedefli okuma
3. **Y3** — Her rapor metni TSRS madde numarasıyla referanslanır
4. **Y4** — Veri yoksa uydurma yok; `[VERİ BEKLENİYOR: ...]` etiketi
5. **Y5** — Motor bütünlüğü korunur
6. **Y6** — Anayasa günceldir
7. **Y7** — Word/rapor senkronu komutla olur, canlı bağ yok
8. **Y8** — Referans tablolarının İngilizce gaz/yakıt adları orijinal kalır

## Lisans

Bu repo şimdilik genel görüntüleme amaçlıdır; veri ve müşteri dosyaları tamamen yereldir.

## İletişim

Sahibi: **Engin** — Madencilik özelinde TSRS uyumlu sürdürülebilirlik raporlaması üzerine çalışmaktadır.
