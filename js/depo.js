/* ============================================================================
   DEPO — Veri saklama katmanı
   Girilen tüm veriler tarayıcının kalıcı hafızasına (localStorage) otomatik
   kaydedilir. Yönetim Paneli'nden JSON yedeği alınabilir / geri yüklenebilir.
   Referans tablolarında (emisyon faktörleri vb.) yapılan düzenlemeler de
   burada saklanır ve data/ klasöründeki dosyaların önüne geçer.
   ============================================================================ */
"use strict";
window.Depo = (function () {
  var ANAHTAR_VERI = "KM3_VERI";
  var ANAHTAR_REF  = "KM3_REF";

  var bosVeri = function () {
    return {
      profil: {},
      faaliyet: [],   // Kapsam 1 & 3 faaliyet satırları
      sogutucu: [],   // Soğutucu akışkan / kaçak satırları
      elektrik: [],   // Kapsam 2 elektrik satırları
      moduller: {},   // TSRS modülleri: { modulId: { anlatilar:{}, kayitlar:[] } }
      sektorMetrik: {}, // Sektör cilt metrikleri: { metrikKodu: { deger, birim, yontem, not } }
      sayac: 1
    };
  };

  var d = {
    veri: bosVeri(),
    refOzel: {},          // { veriSetiAdi: [satırlar] }  — admin düzenlemeleri
    ayarOzel: {},         // ayar/metin düzenlemeleri
    listeOzel: {},        // açılır liste düzenlemeleri
    modulTanimOzel: null  // form alanı tanımı düzenlemeleri
  };

  function guvenliParse(metin, varsayilan) {
    try { var v = JSON.parse(metin); return v == null ? varsayilan : v; }
    catch (e) { return varsayilan; }
  }

  d.yukle = function () {
    var ham = null;
    try { ham = localStorage.getItem(ANAHTAR_VERI); } catch (e) {}
    if (ham) {
      var v = guvenliParse(ham, null);
      if (v && typeof v === "object") {
        d.veri = Object.assign(bosVeri(), v);
      }
    }
    var hamRef = null;
    try { hamRef = localStorage.getItem(ANAHTAR_REF); } catch (e) {}
    if (hamRef) {
      var r = guvenliParse(hamRef, {});
      d.refOzel        = r.ref      || {};
      d.ayarOzel       = r.ayar     || {};
      d.listeOzel      = r.liste    || {};
      d.modulTanimOzel = r.modulTanim || null;
    }
  };

  var kayitZamanlayici = null;
  d.kaydet = function (sessiz) {
    clearTimeout(kayitZamanlayici);
    kayitZamanlayici = setTimeout(function () {
      try {
        localStorage.setItem(ANAHTAR_VERI, JSON.stringify(d.veri));
        localStorage.setItem(ANAHTAR_REF, JSON.stringify({
          ref: d.refOzel, ayar: d.ayarOzel, liste: d.listeOzel, modulTanim: d.modulTanimOzel
        }));
        if (!sessiz && window.UI) UI.bildir("Kaydedildi");
      } catch (e) {
        if (window.UI) UI.bildir("Kaydetme hatası: tarayıcı depolaması kullanılamıyor", true);
      }
    }, 250);
  };

  /* ---- Veri setleri (referans tabloları) ---- */
  d.set = function (ad) {
    if (d.refOzel[ad]) return d.refOzel[ad];
    return (window.VERI && VERI[ad]) ? VERI[ad] : [];
  };
  d.setKaydet = function (ad, satirlar) { d.refOzel[ad] = satirlar; d.kaydet(); };
  d.setVarsayilan = function (ad) { delete d.refOzel[ad]; d.kaydet(); };
  d.setDegistiMi = function (ad) { return !!d.refOzel[ad]; };

  /* ---- Listeler ---- */
  d.liste = function (ad) {
    if (Array.isArray(ad)) return ad; // doğrudan seçenek dizisi
    if (d.listeOzel[ad]) return d.listeOzel[ad];
    var L = (VERI.listeler || {});
    return L[ad] || [];
  };
  d.birimler = function (kategori) {
    var b = (d.listeOzel.birimler || (VERI.listeler || {}).birimler || {});
    return b[kategori] || ["birim (serbest)"];
  };

  /* ---- Ayarlar ---- */
  d.ayar = function (anahtar) {
    if (d.ayarOzel.hasOwnProperty(anahtar)) return d.ayarOzel[anahtar];
    return (VERI.ayarlar || {})[anahtar];
  };

  /* ---- EF kaynakları ve belirsizlik (Sprint 3) ---- */
  d.efKaynaklari = function () {
    return (window.VERI && VERI.ef_kaynaklari) ? VERI.ef_kaynaklari : {};
  };
  d.efKaynak = function (setAdi) {
    return d.efKaynaklari()[setAdi] || null;
  };
  d.belirsizlikMetodolojisi = function () {
    return (window.VERI && VERI.belirsizlik_metodolojisi) ? VERI.belirsizlik_metodolojisi : null;
  };

  /* ---- Modül tanımları ---- */
  d.modulTanimlari = function () {
    return d.modulTanimOzel || VERI.tsrs_modulleri || [];
  };

  /* ---- Sektör-Cilt sistemi (TSRS 2 Ek Ciltleri) ---- */
  // Tüm ciltlerin kataloğu (data/sektor_ciltleri.js'ten)
  d.ciltler = function () {
    return (window.VERI && VERI.sektor_ciltleri) ? VERI.sektor_ciltleri : [];
  };
  // Sektör ailesi adları (CG, EM, ...)
  d.sektorAileleri = function () {
    return (window.VERI && VERI.sektor_aileleri) ? VERI.sektor_aileleri : {};
  };
  // Belirli bir cilt nesnesini numarasıyla getir
  d.cilt = function (no) {
    var bulunan = null;
    d.ciltler().forEach(function (c) { if (c.no === no) bulunan = c; });
    return bulunan;
  };
  // Profilde seçili cilt numaraları (kullanıcının sektör seçimi)
  d.seciliCiltNolari = function () {
    return (d.veri.profil && Array.isArray(d.veri.profil.ciltler)) ? d.veri.profil.ciltler : [];
  };
  // Seçili cilt nesneleri (numara sırasına göre)
  d.seciliCiltler = function () {
    var secili = d.seciliCiltNolari();
    return d.ciltler().filter(function (c) { return secili.indexOf(c.no) > -1; });
  };
  // Cilt seçimini kaydet (numara dizisi)
  d.ciltSec = function (noListesi) {
    if (!d.veri.profil) d.veri.profil = {};
    d.veri.profil.ciltler = (noListesi || []).slice().sort(function (a, b) { return a - b; });
    d.kaydet();
  };
  // "Uygulanabilir değil" işaretli metrik kodları (örn. taş/mermerde ahşap lifi)
  d.naMetrikler = function () {
    return (d.veri.profil && Array.isArray(d.veri.profil.naMetrikler)) ? d.veri.profil.naMetrikler : [];
  };
  d.naMetrikDegistir = function (kod, na) {
    if (!d.veri.profil) d.veri.profil = {};
    var liste = d.naMetrikler().slice();
    if (na) { if (liste.indexOf(kod) < 0) liste.push(kod); }
    else liste = liste.filter(function (k) { return k !== kod; });
    d.veri.profil.naMetrikler = liste;
    d.kaydet();
  };
  // Seçili ciltlerin TÜM metrikleri, ortak olanlar TEKİLLEŞTİRİLMİŞ (tek-hesap).
  // Döner: [{ kod, ad, tip, birim, kapsam, ortak, ciltler:[{no,prefix,ad}] }]
  // Ortak metrikler (ortak anahtarı olanlar) tek satırda birleşir; hangi ciltlerde
  // istendiği "ciltler" dizisinde toplanır. "Uygulanabilir değil" işaretliler hariç tutulmaz
  // (raporlamada "N/A" olarak gösterilir), sadece işaret bilgisi taşınır.
  d.aktifMetrikler = function () {
    var sonuc = [], ortakHarita = {};
    d.seciliCiltler().forEach(function (c) {
      c.metrikler.forEach(function (m) {
        var ciltBilgi = { no: c.no, prefix: c.prefix, ad: c.ad };
        if (m.ortak) {
          // Ortak metrik: anahtara göre birleştir
          if (!ortakHarita[m.ortak]) {
            var yeni = {
              kod: m.kod, ad: m.ad, tip: m.tip, birim: m.birim || "",
              kapsam: m.kapsam || null, ortak: m.ortak, ciltler: [ciltBilgi]
            };
            ortakHarita[m.ortak] = yeni;
            sonuc.push(yeni);
          } else {
            ortakHarita[m.ortak].ciltler.push(ciltBilgi);
          }
        } else {
          sonuc.push({
            kod: m.kod, ad: m.ad, tip: m.tip, birim: m.birim || "",
            kapsam: m.kapsam || null, ortak: null, ciltler: [ciltBilgi]
          });
        }
      });
    });
    return sonuc;
  };
  d.modulVeri = function (id) {
    if (!d.veri.moduller[id]) d.veri.moduller[id] = { anlatilar: {}, kayitlar: [] };
    if (!d.veri.moduller[id].anlatilar) d.veri.moduller[id].anlatilar = {};
    if (!d.veri.moduller[id].kayitlar)  d.veri.moduller[id].kayitlar  = [];
    return d.veri.moduller[id];
  };

  /* ---- Sektör metrik değerleri (dinamik form motoru — Sprint 2) ----
     Her metrik kodu için kullanıcının girdiği değer(ler) burada saklanır.
     Şekil: { deger, birim, yontem, not } veya anlatı metrikleri için { metin }.
     Ortak metrikler tek kod altında saklanır (tek-hesap); raporda çoklu cilde referansla gösterilir. */
  d.metrikVeri = function (kod) {
    if (!d.veri.sektorMetrik) d.veri.sektorMetrik = {};
    if (!d.veri.sektorMetrik[kod]) d.veri.sektorMetrik[kod] = {};
    return d.veri.sektorMetrik[kod];
  };
  d.metrikYaz = function (kod, alan, deger) {
    var v = d.metrikVeri(kod);
    v[alan] = deger;
    d.kaydet(true);
  };
  // Bir metriğin doldurulma durumu: "tam" | "kismi" | "bos"
  d.metrikDurum = function (metrik) {
    var v = (d.veri.sektorMetrik && d.veri.sektorMetrik[metrik.kod]) || {};
    if (metrik.tip === "ta") {
      return (v.metin && String(v.metin).trim()) ? "tam" : "bos";
    }
    // hesap/veri: deger alanı dolu mu
    var dolu = v.deger != null && String(v.deger).trim() !== "";
    return dolu ? "tam" : "bos";
  };
  // Seçili ciltlerdeki tüm metriklerin toplu doldurulma özeti
  d.metrikOzet = function () {
    var am = d.aktifMetrikler(), na = d.naMetrikler();
    var ozet = { toplam: 0, tam: 0, bos: 0, na: 0, hesap: 0, veri: 0, ta: 0 };
    am.forEach(function (m) {
      if (na.indexOf(m.kod) > -1) { ozet.na++; return; }
      ozet.toplam++;
      ozet[m.tip] = (ozet[m.tip] || 0) + 1;
      if (d.metrikDurum(m) === "tam") ozet.tam++; else ozet.bos++;
    });
    return ozet;
  };

  /* ---- Kayıt no üretici ---- */
  d.yeniNo = function (onek) {
    var n = d.veri.sayac++;
    return onek + "-" + String(n).padStart(3, "0");
  };

  /* ---- Yedekleme ---- */
  d.yedekAl = function () {
    var paket = {
      tur: "KarbonMotoru_Yedek", surum: 3, tarih: new Date().toISOString(),
      veri: d.veri,
      ref: d.refOzel, ayar: d.ayarOzel, liste: d.listeOzel, modulTanim: d.modulTanimOzel
    };
    d.dosyaIndir("karbon-motoru-yedek-" + new Date().toISOString().slice(0, 10) + ".json",
      JSON.stringify(paket, null, 1), "application/json");
  };
  d.yedekYukle = function (metin) {
    var p = guvenliParse(metin, null);
    if (!p || p.tur !== "KarbonMotoru_Yedek") return "Bu dosya bir Karbon Motoru yedeği değil.";
    d.veri = Object.assign(bosVeri(), p.veri || {});
    d.refOzel = p.ref || {}; d.ayarOzel = p.ayar || {};
    d.listeOzel = p.liste || {}; d.modulTanimOzel = p.modulTanim || null;
    d.kaydet(true);
    return null;
  };
  d.sifirla = function (neler) {
    if (neler === "girdiler" || neler === "hepsi") d.veri = bosVeri();
    if (neler === "referans" || neler === "hepsi") {
      d.refOzel = {}; d.ayarOzel = {}; d.listeOzel = {}; d.modulTanimOzel = null;
    }
    d.kaydet(true);
  };

  /* ---- Dosya indirme yardımcıları ---- */
  d.dosyaIndir = function (ad, icerik, tip) {
    var blob = new Blob([icerik], { type: (tip || "text/plain") + ";charset=utf-8" });
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a");
    a.href = url; a.download = ad;
    document.body.appendChild(a); a.click();
    setTimeout(function () { document.body.removeChild(a); URL.revokeObjectURL(url); }, 400);
  };

  /* Düzenlenen referans setini, data/ klasörüne koyulabilecek kalıcı .js
     dosyası olarak üretir (Yönetim Paneli → "Kalıcı dosya indir"). */
  d.refDosyaUret = function (ad, dosyaAdi, baslik) {
    var satirlar = d.set(ad);
    var icerik =
      "/* " + (baslik || ad) + " — Yönetim Paneli'nden dışa aktarıldı: " +
      new Date().toLocaleString("tr-TR") + "\n" +
      "   Bu dosyayı data/" + dosyaAdi + " üzerine kopyalarsanız düzenlemeler kalıcı olur. */\n" +
      "window.VERI = window.VERI || {};\n" +
      "VERI." + ad + " = " + JSON.stringify(satirlar, null, 1) + ";\n";
    d.dosyaIndir(dosyaAdi, icerik, "text/javascript");
  };

  /* ---- ŞİRKET VERİ PAKETİ (Sprint 7 — çok-şirketli taşıma) ----
     Bir şirketin TÜM verisini (profil + faaliyet + soğutucu + elektrik + modüller +
     sektör metrikleri) tek dosyada dışa aktarır. Şirketler arası taşıma ve
     input_cloud/output_cloud arşivleme için. Referans tablolarını İÇERMEZ (onlar ortak). */
  d.sirketPaketiAl = function () {
    var unvan = (d.veri.profil && d.veri.profil.unvan) ? d.veri.profil.unvan : "sirket";
    var yil = (d.veri.profil && d.veri.profil.yil) ? d.veri.profil.yil : "";
    var paket = {
      tur: "KarbonMotoru_SirketPaketi", surum: 1, tarih: new Date().toISOString(),
      sirket: unvan, yil: yil,
      veri: d.veri
    };
    var ad = "sirket-" + String(unvan).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") +
             (yil ? "-" + yil : "") + ".json";
    d.dosyaIndir(ad, JSON.stringify(paket, null, 1), "application/json");
  };
  d.sirketPaketiYukle = function (metin) {
    var p = guvenliParse(metin, null);
    if (!p || p.tur !== "KarbonMotoru_SirketPaketi") return "Bu dosya bir Şirket Veri Paketi değil.";
    d.veri = Object.assign(bosVeri(), p.veri || {});
    d.kaydet(true);
    return null;
  };

  /* ---- CSV FAALİYET İÇE AKTARMA (Sprint 7) ----
     Karışık formatlı müşteri verisini standart faaliyet kayıtlarına çevirir.
     Beklenen sütunlar (esnek, başlık satırından eşlenir):
     tesis, kategori, kaynak, miktar, birim, donem, aciklama
     Dönen: { eklenen, atlanan, hatalar:[] } */
  d.csvFaaliyetIceAktar = function (csvMetin) {
    var sonuc = { eklenen: 0, atlanan: 0, hatalar: [] };
    if (!csvMetin || !csvMetin.trim()) { sonuc.hatalar.push("Boş dosya"); return sonuc; }
    var satirlar = csvMetin.split(/\r?\n/).filter(function (s) { return s.trim(); });
    if (satirlar.length < 2) { sonuc.hatalar.push("En az başlık + 1 veri satırı gerekir"); return sonuc; }
    // Ayırıcı tespiti: noktalı virgül veya virgül
    var ayirici = (satirlar[0].split(";").length > satirlar[0].split(",").length) ? ";" : ",";
    function hucreler(satir) {
      return satir.split(ayirici).map(function (h) { return h.trim().replace(/^"|"$/g, ""); });
    }
    var basliklar = hucreler(satirlar[0]).map(function (h) { return h.toLocaleLowerCase("tr"); });
    function indeks(adlar) {
      for (var i = 0; i < adlar.length; i++) {
        var k = basliklar.indexOf(adlar[i]);
        if (k > -1) return k;
      }
      return -1;
    }
    var iTesis = indeks(["tesis", "tesis/faaliyet", "faaliyet", "ad"]);
    var iKat = indeks(["kategori", "emisyon kategorisi"]);
    var iKaynak = indeks(["kaynak", "yakıt", "yakit", "araç", "arac"]);
    var iMiktar = indeks(["miktar", "değer", "deger", "tüketim", "tuketim"]);
    var iBirim = indeks(["birim"]);
    var iDonem = indeks(["donem", "dönem", "ay", "tarih"]);
    var iAcik = indeks(["aciklama", "açıklama", "not", "dayanak"]);
    if (iKat < 0 || iMiktar < 0) {
      sonuc.hatalar.push("Zorunlu sütunlar bulunamadı: en az 'kategori' ve 'miktar' başlıkları olmalı");
      return sonuc;
    }
    for (var r = 1; r < satirlar.length; r++) {
      var h = hucreler(satirlar[r]);
      var miktar = (h[iMiktar] || "").replace(/\./g, "").replace(",", "."); // TR sayı → nokta
      if (!h[iKat] || !miktar || isNaN(parseFloat(miktar))) { sonuc.atlanan++; continue; }
      var kayit = {
        no: d.yeniNo("F"),
        tesis: iTesis > -1 ? h[iTesis] : "(CSV içe aktarım)",
        kategori: h[iKat],
        kaynak: iKaynak > -1 ? h[iKaynak] : "",
        miktar: miktar,
        birim: iBirim > -1 ? h[iBirim] : "",
        donem: iDonem > -1 ? h[iDonem] : "",
        aciklama: (iAcik > -1 ? h[iAcik] : "") + " [CSV içe aktarım]",
        bolge: "TR"
      };
      d.veri.faaliyet.push(kayit);
      sonuc.eklenen++;
    }
    if (sonuc.eklenen) d.kaydet(true);
    return sonuc;
  };

  return d;
})();
