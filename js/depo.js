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
  var ANAHTAR_YEDEK_ZAMAN  = "KM3_SON_YEDEK";      // en son yedek alınan an (ISO)
  var ANAHTAR_DEGISIM_ZAMAN = "KM3_SON_DEGISIM";   // en son veri değişikliği anı (ISO)

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

  /* ============================================================
     BULUT IO (Supabase) — localStorage yerine
     d.veri RAM'de senkron tutulur; yalnız yükle/kaydet ağ üzerinden async olur.
     Mevcut çağıranlar (UI/admin) imzaları aynı kaldığı için etkilenmez.
     ============================================================ */
  d.aktifMusteriId = null;     // o an açık müşteri (customers.id)
  d.aktifKullanici = null;     // giriş yapan profil { id, email, rol, onayli }
  d.surumNo = 0;               // iyimser kilit sürüm numarası
  d._sonKayit = null;          // en son kaydedilen verinin kopyası (diff/undo için)
  d._konfigYuklendi = false;
  d._kayitBekliyor = false;    // debounce kuyruğunda kayıt var mı
  d._kayitUcuyor = false;      // ağ kaydı sürüyor mu

  function derinKopya(x) { return JSON.parse(JSON.stringify(x)); }

  // Global referans/ayar düzenlemeleri (app_config — tek satır). Bir kez yüklenir.
  d.konfigYukle = function () {
    if (!window.SB) return Promise.resolve();
    return SB.from("app_config").select("ref_ozel, ayar_ozel, liste_ozel, modul_tanim").eq("id", 1).single()
      .then(function (q) {
        if (!q.error && q.data) {
          d.refOzel        = q.data.ref_ozel   || {};
          d.ayarOzel       = q.data.ayar_ozel  || {};
          d.listeOzel      = q.data.liste_ozel || {};
          d.modulTanimOzel = q.data.modul_tanim || null;
        }
        d._konfigYuklendi = true;
      })["catch"](function () { d._konfigYuklendi = true; });
  };

  // Müşteri verisini yükle. Argümansız çağrı (UI.basla'nın eski senkron çağrısı) no-op'tur.
  d.yukle = function (musteriId) {
    if (musteriId == null) return Promise.resolve();   // veri zaten bellekte
    if (!window.SB) return Promise.reject(new Error("Bulut bağlantısı yok"));
    var on = d._konfigYuklendi ? Promise.resolve() : d.konfigYukle();
    return on.then(function () {
      return SB.from("customers").select("data, surum_no").eq("id", musteriId).single();
    }).then(function (q) {
      if (q.error) throw q.error;
      d.veri = Object.assign(bosVeri(), q.data.data || {});
      d.aktifMusteriId = musteriId;
      d.surumNo = q.data.surum_no || 0;
      d._sonKayit = derinKopya(d.veri);
    });
  };

  /* ---- Otomatik kayıt (debounce) + sürüm geçmişi (geri al) ---- */
  var kayitZamanlayici = null;
  function ozetUret(patch) {
    var etiket = {
      profil: "Şirket profili", faaliyet: "Faaliyet verisi", sogutucu: "Soğutucu/kaçak",
      elektrik: "Kapsam 2 elektrik", moduller: "TSRS açıklamaları", sektorMetrik: "Sektör metrikleri"
    };
    var kokler = {};
    (patch || []).forEach(function (op) {
      var kk = String(op.path || "").split("/")[1];
      if (kk) kokler[kk] = true;
    });
    var adlar = Object.keys(kokler).map(function (kk) { return etiket[kk] || kk; });
    return adlar.length ? adlar.join(", ") + " değişti" : "Güncelleme";
  }

  d.kaydet = function (sessiz) {
    if (!d.aktifMusteriId) return;        // müşteri seçilmeden kayıt olmaz
    d._kayitBekliyor = true;
    clearTimeout(kayitZamanlayici);
    kayitZamanlayici = setTimeout(function () { d._flush(sessiz); }, 350);
  };

  d._flush = function (sessiz) {
    if (!d.aktifMusteriId || !window.SB) { d._kayitBekliyor = false; return Promise.resolve(); }
    // Önceki kayıt hâlâ ağdaysa eşzamanlı yazma yapma; kısa süre sonra yeniden dene
    if (d._kayitUcuyor) {
      d._kayitBekliyor = true;
      clearTimeout(kayitZamanlayici);
      kayitZamanlayici = setTimeout(function () { d._flush(sessiz); }, 200);
      return Promise.resolve();
    }
    var yeni = d.veri, eski = d._sonKayit || {};
    var patch = null;
    if (window.jsonpatch) {
      try { patch = jsonpatch.compare(yeni, eski); } catch (e) { patch = null; }   // yeni→eski = ters patch (undo)
      if (patch && patch.length === 0) { d._kayitBekliyor = false; return Promise.resolve(); }
    }
    d._kayitBekliyor = false; d._kayitUcuyor = true;
    var yeniSurum = d.surumNo + 1;
    var gonder = derinKopya(yeni);
    return SB.from("customers").update({ data: gonder, surum_no: yeniSurum })
      .eq("id", d.aktifMusteriId).eq("surum_no", d.surumNo).select("surum_no")
      .then(function (upd) {
        if (upd.error) throw upd.error;
        if (!upd.data || !upd.data.length) {
          d._kayitUcuyor = false;
          if (window.UI) UI.bildir("Bu müşteriyi başka bir kullanıcı değiştirdi. Sayfayı yenileyip tekrar deneyin.", true);
          return;
        }
        d.surumNo = yeniSurum;
        d._sonKayit = gonder;
        d._kayitUcuyor = false;
        if (!sessiz && window.UI) UI.bildir("Kaydedildi");
        if (patch && patch.length && window.jsonpatch) {
          SB.from("customer_versions").insert({
            customer_id: d.aktifMusteriId, surum_no: yeniSurum, ters_patch: patch, ozet: ozetUret(patch)
          }).then(function () {
            if (yeniSurum > 50) {
              SB.from("customer_versions").delete()
                .eq("customer_id", d.aktifMusteriId).lte("surum_no", yeniSurum - 50);
            }
          });
        }
      })["catch"](function (e) {
        d._kayitUcuyor = false;
        if (window.UI) UI.bildir("Kayıt hatası: " + (e.message || e), true);
      });
  };

  /* ---- Geri Al (son sürüme dönüş — ters JSON Patch uygulanır) ---- */
  d.geriAl = function () {
    if (!d.aktifMusteriId || !window.SB) return Promise.resolve("Bağlantı yok");
    if (!window.jsonpatch) return Promise.resolve("Geri alma kütüphanesi yüklenmedi");
    var on = Promise.resolve();
    if (d._kayitBekliyor) { clearTimeout(kayitZamanlayici); on = d._flush(true); }
    return on.then(function () {
      return SB.from("customer_versions").select("id, ters_patch")
        .eq("customer_id", d.aktifMusteriId).order("surum_no", { ascending: false }).limit(1);
    }).then(function (q) {
      if (q.error) return q.error.message;
      if (!q.data || !q.data.length) return "Geri alınacak işlem yok";
      var v = q.data[0], oncekiHal;
      try { oncekiHal = jsonpatch.applyPatch(derinKopya(d.veri), v.ters_patch).newDocument; }
      catch (e) { return "Geri alma uygulanamadı"; }
      var yeniSurum = d.surumNo + 1;
      return SB.from("customers").update({ data: oncekiHal, surum_no: yeniSurum })
        .eq("id", d.aktifMusteriId).eq("surum_no", d.surumNo).select("surum_no")
        .then(function (upd) {
          if (upd.error) return upd.error.message;
          if (!upd.data || !upd.data.length) return "Çakışma: başka kullanıcı değiştirdi, sayfayı yenileyin";
          return SB.from("customer_versions").delete().eq("id", v.id).then(function () {
            d.surumNo = yeniSurum;
            d.veri = Object.assign(bosVeri(), oncekiHal);
            d._sonKayit = derinKopya(d.veri);
            return null;   // başarı
          });
        });
    });
  };

  /* ---- Müşteri (şirket) yönetimi ---- */
  d.musteriListele = function () {
    if (!window.SB) return Promise.resolve([]);
    return SB.from("customers").select("id, unvan, nace, yil, updated_at").order("updated_at", { ascending: false })
      .then(function (q) {
        if (q.error) { if (window.UI) UI.bildir("Müşteri listesi alınamadı: " + q.error.message, true); return []; }
        return q.data || [];
      });
  };
  d.musteriOlustur = function (unvan, opts) {
    opts = opts || {};
    if (!window.SB) return Promise.resolve({ hata: "Bağlantı yok" });
    var veri = Object.assign(bosVeri(), { profil: { unvan: unvan, yil: opts.yil || "", nace: opts.nace || "" } });
    return SB.from("customers").insert({ unvan: unvan, nace: opts.nace || null, yil: opts.yil || null, data: veri })
      .select("id").single()
      .then(function (q) { return q.error ? { hata: q.error.message } : { id: q.data.id }; });
  };
  d.musteriSil = function (id) {
    if (!window.SB) return Promise.resolve("Bağlantı yok");
    return SB.from("customers").delete().eq("id", id).then(function (q) { return q.error ? q.error.message : null; });
  };
  d.musteriKapat = function () {
    d.aktifMusteriId = null; d.veri = bosVeri(); d.surumNo = 0; d._sonKayit = null;
  };

  /* ---- Global konfig (app_config) kaydı — RLS gereği yalnız admin yazabilir ---- */
  var konfigZamanlayici = null;
  d.konfigKaydet = function () {
    clearTimeout(konfigZamanlayici);
    konfigZamanlayici = setTimeout(function () {
      if (!window.SB) return;
      SB.from("app_config").update({
        ref_ozel: d.refOzel, ayar_ozel: d.ayarOzel, liste_ozel: d.listeOzel,
        modul_tanim: d.modulTanimOzel, updated_at: new Date().toISOString()
      }).eq("id", 1).select("id").then(function (q) {
        if (q.error) { if (window.UI) UI.bildir("Ayar kaydedilemedi (yönetici gerekir): " + q.error.message, true); }
        else if (window.UI) UI.bildir("Referans/ayar kaydedildi");
      });
    }, 350);
  };

  /* ---- Yedek/değişiklik takibi (bulut modelinde sadeleştirildi) ----
     Veri buluta otomatik kaydedildiği için yerel "yedek alın" hatırlatması susar;
     çıkış uyarısı yalnızca devam eden/bekleyen bir kayıt varsa devreye girer. */
  d.sonYedekZamani = function () { return null; };
  d.sonDegisimZamani = function () { return null; };
  d.yedekZamaniniIsaretle = function () {};
  d.yedeklenmemisDegisiklikVar = function () { return !!(d._kayitBekliyor || d._kayitUcuyor); };
  d.sonYedektenBuyanaGun = function () { return null; };

  /* ---- Veri setleri (referans tabloları) ---- */
  d.set = function (ad) {
    if (d.refOzel[ad]) return d.refOzel[ad];
    return (window.VERI && VERI[ad]) ? VERI[ad] : [];
  };
  d.setKaydet = function (ad, satirlar) { d.refOzel[ad] = satirlar; d.konfigKaydet(); };
  d.setVarsayilan = function (ad) { delete d.refOzel[ad]; d.konfigKaydet(); };
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
  // Dosya adı için tarih-saat damgası: 2026-06-15_14-30 (aynı gün üzerine yazmayı önler)
  function zamanDamgasi() {
    var t = new Date();
    function ik(n) { return String(n).padStart(2, "0"); }
    return t.getFullYear() + "-" + ik(t.getMonth() + 1) + "-" + ik(t.getDate()) +
           "_" + ik(t.getHours()) + "-" + ik(t.getMinutes());
  }
  d.yedekAl = function () {
    var paket = {
      tur: "KarbonMotoru_Yedek", surum: 3, tarih: new Date().toISOString(),
      veri: d.veri,
      ref: d.refOzel, ayar: d.ayarOzel, liste: d.listeOzel, modulTanim: d.modulTanimOzel
    };
    d.dosyaIndir("karbon-motoru-yedek-" + zamanDamgasi() + ".json",
      JSON.stringify(paket, null, 1), "application/json");
    d.yedekZamaniniIsaretle();   // yedek alındı: hatırlatma/çıkış uyarısı sıfırlanır
  };
  d.yedekYukle = function (metin) {
    var p = guvenliParse(metin, null);
    if (!p || p.tur !== "KarbonMotoru_Yedek") return "Bu dosya bir Karbon Motoru yedeği değil.";
    d.veri = Object.assign(bosVeri(), p.veri || {});
    d.kaydet(true);   // müşteri verisini buluta yaz
    // Referans/ayar düzenlemeleri yalnız yönetici hesabında app_config'e yazılabilir
    if (p.ref || p.ayar || p.liste || p.modulTanim) {
      d.refOzel = p.ref || {}; d.ayarOzel = p.ayar || {};
      d.listeOzel = p.liste || {}; d.modulTanimOzel = p.modulTanim || null;
      if (d.aktifKullanici && d.aktifKullanici.rol === "admin") d.konfigKaydet();
    }
    return null;
  };
  d.sifirla = function (neler) {
    if (neler === "girdiler" || neler === "hepsi") { d.veri = bosVeri(); d._sonKayit = null; d.kaydet(true); }
    if (neler === "referans" || neler === "hepsi") {
      d.refOzel = {}; d.ayarOzel = {}; d.listeOzel = {}; d.modulTanimOzel = null; d.konfigKaydet();
    }
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

  /* ---- FAALİYET DÖKÜMÜ DIŞA AKTARMA (CSV / XLSX) ----
     Tüm faaliyet/soğutucu/elektrik kayıtları kapsam'a göre sınıflandırılmış,
     detaylı kolonlarla. Motor.faaliyetDokumu() veriyi üretir. */
  function dosyaSlug(s) {
    return String(s || "sirket").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "sirket";
  }
  function dokumDosyaAdi(uzanti) {
    var p = d.veri.profil || {};
    return "faaliyet-dokumu-" + dosyaSlug(p.unvan) + (p.yil ? "-" + p.yil : "") + "." + uzanti;
  }
  d.faaliyetCsvIndir = function () {
    if (!window.Motor || !Motor.faaliyetDokumu) return;
    var dk = Motor.faaliyetDokumu(), sep = ";";
    function hucre(v) {
      if (v == null) v = "";
      else if (typeof v === "number") v = isFinite(v) ? String(v).replace(".", ",") : "";  // TR ondalık, gruplama yok
      v = String(v);
      if (v.indexOf(sep) > -1 || v.indexOf('"') > -1 || v.indexOf("\n") > -1) v = '"' + v.replace(/"/g, '""') + '"';
      return v;
    }
    var satir = function (hucreler) { return hucreler.join(sep); };
    var baslik = satir(dk.kolonlar.map(function (k) { return hucre(k.etiket); }));
    var govde = dk.satirlar.map(function (r) { return satir(dk.kolonlar.map(function (k) { return hucre(r[k.anahtar]); })); });
    var icerik = "﻿" + [baslik].concat(govde).join("\r\n");   // UTF-8 BOM (Excel'de Türkçe doğru)
    d.dosyaIndir(dokumDosyaAdi("csv"), icerik, "text/csv");
  };
  d.faaliyetXlsxIndir = function () {
    if (!window.Motor || !Motor.faaliyetDokumu) return;
    function uret() {
      if (!window.XLSX) { if (window.UI) UI.bildir("XLSX kütüphanesi yok; CSV indiriliyor", true); d.faaliyetCsvIndir(); return; }
      var dk = Motor.faaliyetDokumu();
      var aoa = [dk.kolonlar.map(function (k) { return k.etiket; })];
      dk.satirlar.forEach(function (r) {
        aoa.push(dk.kolonlar.map(function (k) { var x = r[k.anahtar]; return (typeof x === "number" && !isFinite(x)) ? "" : x; }));
      });
      var ws = XLSX.utils.aoa_to_sheet(aoa);
      ws["!cols"] = dk.kolonlar.map(function (k) { return { wch: Math.max(10, k.etiket.length + 2) }; });
      var wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Faaliyet Dökümü");
      XLSX.writeFile(wb, dokumDosyaAdi("xlsx"));
    }
    if (window.XLSX) { uret(); return; }
    if (window.UI) UI.bildir("XLSX hazırlanıyor…");
    var sc = document.createElement("script");
    sc.src = "https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js";
    sc.onload = uret;
    sc.onerror = function () { if (window.UI) UI.bildir("XLSX yüklenemedi (çevrimdışı olabilir); CSV indiriliyor", true); d.faaliyetCsvIndir(); };
    document.head.appendChild(sc);
  };

  return d;
})();
