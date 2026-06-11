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

  /* ---- Modül tanımları ---- */
  d.modulTanimlari = function () {
    return d.modulTanimOzel || VERI.tsrs_modulleri || [];
  };
  d.modulVeri = function (id) {
    if (!d.veri.moduller[id]) d.veri.moduller[id] = { anlatilar: {}, kayitlar: [] };
    if (!d.veri.moduller[id].anlatilar) d.veri.moduller[id].anlatilar = {};
    if (!d.veri.moduller[id].kayitlar)  d.veri.moduller[id].kayitlar  = [];
    return d.veri.moduller[id];
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

  return d;
})();
