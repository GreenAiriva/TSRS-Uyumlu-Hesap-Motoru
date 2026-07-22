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
      indeks: { org: [], rfi: [], dokuman: [], kanit: [], sayac: {} }, // Kurumsal veri yönetim indeksi (js/indeks.js)
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

  /* ============================================================
     ÜÇ YOLLU BİRLEŞTİRME — eşzamanlı düzenleme desteği
     taban = iki kullanıcının ortak çıkış noktası (_sonKayit)
     yerel = bu ekrandaki veri, uzak = buluttaki güncel veri.
     Kayıtlar dizin numarasıyla değil KİMLİĞİYLE (no/id/kod) eşleştirilir;
     yalnız aynı kaydın aynı alanı iki yanda FARKLI değiştirildiyse çakışma
     üretilir, diğer tüm değişiklikler otomatik birleşir. Çakışma kayıtlarında
     yerel duruş sonuca yazılır; "uzak" tercihi yolaYaz ile sonradan uygulanır. */
  /* ===UCB-BASLA=== */
  function esitJSON(a, b) {
    if (a === b) return true;
    try { return JSON.stringify(a) === JSON.stringify(b); } catch (e) { return false; }
  }
  function duzNesneMi(x) { return x != null && typeof x === "object" && !Array.isArray(x); }
  var KIMLIK_ALANLARI = ["no", "id", "kod", "docNo", "belgeNo", "kimlik"];
  function kimlikAnahtari(x) {
    if (!duzNesneMi(x)) return null;
    for (var i = 0; i < KIMLIK_ALANLARI.length; i++) {
      var v = x[KIMLIK_ALANLARI[i]];
      if (v !== undefined && v !== null && String(v) !== "") return KIMLIK_ALANLARI[i] + ":" + String(v);
    }
    return null;
  }
  function yolEtiketi(yol) {
    var UST = { profil: "Şirket profili", faaliyet: "Faaliyet", sogutucu: "Soğutucu/kaçak",
                elektrik: "Elektrik", moduller: "TSRS modülleri", sektorMetrik: "Sektör metrikleri", indeks: "INDEX" };
    return (yol || []).map(function (p, i) {
      p = String(p);
      if (p.charAt(0) === "#") { var k = p.slice(1); return k.indexOf(":") >= 0 ? k.split(":").slice(1).join(":") : k; }
      return i === 0 ? (UST[p] || p) : p;
    }).join(" › ");
  }
  function cakismaEkle(cak, yol, yerel, uzak, tur) {
    cak.push({ yol: yol.slice(), tur: tur || "deger", etiket: yolEtiketi(yol),
               yerel: yerel === undefined ? undefined : derinKopya(yerel),
               uzak:  uzak  === undefined ? undefined : derinKopya(uzak) });
  }
  /* İlkel (string/sayı) dizileri: küme mantığı — iki yanın eklemeleri birleşir,
     bir yanın sildiği (diğeri dokunmadıysa) düşer. */
  function kumeBirlestir(taban, yerel, uzak) {
    function anah(v) { return typeof v + ":" + JSON.stringify(v); }
    function harita(dz) { var h = {}; (dz || []).forEach(function (v) { h[anah(v)] = true; }); return h; }
    var hT = harita(taban), hY = harita(yerel), hU = harita(uzak);
    var sonuc = [], eklendi = {};
    function ekle(v) { var k = anah(v); if (!eklendi[k]) { eklendi[k] = true; sonuc.push(derinKopya(v)); } }
    (taban || []).forEach(function (v) { var k = anah(v); if (hY[k] && hU[k]) ekle(v); });
    (yerel || []).forEach(function (v) { if (!harita(taban)[anah(v)]) ekle(v); });
    (uzak  || []).forEach(function (v) { if (!hT[anah(v)]) ekle(v); });
    return sonuc;
  }
  function diziBirlestir(taban, yerel, uzak, yol, cak) {
    var hepsi = [].concat(taban || [], yerel || [], uzak || []);
    var tumPrimitif = hepsi.every(function (x) { return x === null || typeof x !== "object"; });
    if (tumPrimitif) return kumeBirlestir(taban, yerel, uzak);
    var kimlikli = hepsi.every(function (x) { return kimlikAnahtari(x) !== null; });
    var tekrar = false;
    if (kimlikli) [taban, yerel, uzak].forEach(function (dz) {
      var g = {};
      (dz || []).forEach(function (x) { var k = kimlikAnahtari(x); if (g[k]) tekrar = true; g[k] = true; });
    });
    if (!kimlikli || tekrar) {           /* güvenli geri çekilme: diziyi bütün olarak sor */
      cakismaEkle(cak, yol, yerel, uzak, "dizi");
      return derinKopya(yerel);
    }
    function harita(dz) { var h = {}; (dz || []).forEach(function (x) { h[kimlikAnahtari(x)] = x; }); return h; }
    var hT = harita(taban), hU = harita(uzak);
    var sonuc = [], gorulen = {};
    (yerel || []).forEach(function (oge) {
      var k = kimlikAnahtari(oge); gorulen[k] = true;
      var t = hT[k], u = hU[k];
      if (u === undefined) {
        if (t === undefined) { sonuc.push(derinKopya(oge)); return; }           /* yerel ekledi */
        if (esitJSON(t, oge)) return;                                            /* uzak sildi, yerel dokunmadı */
        cakismaEkle(cak, yol.concat(["#" + k]), oge, undefined, "degistir-vs-sil");
        sonuc.push(derinKopya(oge));
        return;
      }
      sonuc.push(ucYollu(t, oge, u, yol.concat(["#" + k]), cak));
    });
    (uzak || []).forEach(function (oge) {
      var k = kimlikAnahtari(oge);
      if (gorulen[k]) return;
      var t = hT[k];
      if (t === undefined) { sonuc.push(derinKopya(oge)); return; }              /* uzak ekledi */
      if (esitJSON(t, oge)) return;                                              /* yerel sildi, uzak dokunmadı */
      cakismaEkle(cak, yol.concat(["#" + k]), undefined, oge, "sil-vs-degistir"); /* yerel duruş: silinmiş */
    });
    return sonuc;
  }
  function nesneBirlestir(taban, yerel, uzak, yol, cak) {
    taban = taban || {}; yerel = yerel || {}; uzak = uzak || {};
    var sonuc = {}, gorulen = {};
    Object.keys(yerel).concat(Object.keys(uzak), Object.keys(taban)).forEach(function (k) {
      if (gorulen[k]) return; gorulen[k] = true;
      var tVar = Object.prototype.hasOwnProperty.call(taban, k);
      var yVar = Object.prototype.hasOwnProperty.call(yerel, k);
      var uVar = Object.prototype.hasOwnProperty.call(uzak, k);
      var t = taban[k], y = yerel[k], u = uzak[k];
      if (!yVar && !uVar) return;
      if (!yVar) {                                                               /* yerel yok/silmiş */
        if (!tVar) { sonuc[k] = derinKopya(u); return; }                         /* uzak ekledi */
        if (esitJSON(t, u)) return;                                              /* uzak dokunmadı → silme geçerli */
        cakismaEkle(cak, yol.concat([k]), undefined, u, "sil-vs-degistir");
        return;
      }
      if (!uVar) {                                                               /* uzak yok/silmiş */
        if (!tVar) { sonuc[k] = derinKopya(y); return; }                         /* yerel ekledi */
        if (esitJSON(t, y)) return;                                              /* yerel dokunmadı → uzak silmesi geçerli */
        cakismaEkle(cak, yol.concat([k]), y, undefined, "degistir-vs-sil");
        sonuc[k] = derinKopya(y);
        return;
      }
      sonuc[k] = ucYollu(t, y, u, yol.concat([k]), cak);
    });
    return sonuc;
  }
  function ucYollu(taban, yerel, uzak, yol, cak) {
    if (esitJSON(yerel, uzak)) return derinKopya(yerel);
    if (esitJSON(taban, yerel)) return derinKopya(uzak);    /* yalnız uzak değişmiş */
    if (esitJSON(taban, uzak)) return derinKopya(yerel);    /* yalnız yerel değişmiş */
    /* Sayaç kuralları: numara üretiminde geri sarma olmasın — büyük olan kazanır */
    if (yol.length === 1 && yol[0] === "sayac" && typeof yerel === "number" && typeof uzak === "number")
      return Math.max(yerel, uzak);
    if (yol.length === 2 && yol[0] === "indeks" && yol[1] === "sayac" && duzNesneMi(yerel) && duzNesneMi(uzak)) {
      var s = {}, g = {};
      Object.keys(yerel).concat(Object.keys(uzak)).forEach(function (k) {
        if (g[k]) return; g[k] = true;
        var a = yerel[k], b = uzak[k];
        s[k] = (typeof a === "number" && typeof b === "number") ? Math.max(a, b) : (a !== undefined ? a : b);
      });
      return s;
    }
    if (Array.isArray(yerel) && Array.isArray(uzak))
      return diziBirlestir(Array.isArray(taban) ? taban : [], yerel, uzak, yol, cak);
    if (duzNesneMi(yerel) && duzNesneMi(uzak))
      return nesneBirlestir(duzNesneMi(taban) ? taban : {}, yerel, uzak, yol, cak);
    cakismaEkle(cak, yol, yerel, uzak, "deger");
    return derinKopya(yerel);
  }
  function ucYolluKok(taban, yerel, uzak) {
    var cak = [];
    var sonuc = nesneBirlestir(duzNesneMi(taban) ? taban : {}, duzNesneMi(yerel) ? yerel : {},
                               duzNesneMi(uzak) ? uzak : {}, [], cak);
    return { sonuc: sonuc, cakismalar: cak };
  }
  /* Kimlik-tabanlı yola değer yazma (çakışma tercihi uygularken).
     deger === undefined → sil. "#no:X" bölütleri dizi elemanını kimliğiyle bulur. */
  function yolaYaz(kok, yol, deger) {
    var n = kok;
    for (var i = 0; i < yol.length; i++) {
      var seg = String(yol[i]), son = (i === yol.length - 1);
      if (seg.charAt(0) === "#") {
        if (!Array.isArray(n)) return false;
        var kim = seg.slice(1), idx = -1;
        for (var j = 0; j < n.length; j++) if (kimlikAnahtari(n[j]) === kim) { idx = j; break; }
        if (son) {
          if (deger === undefined) { if (idx >= 0) n.splice(idx, 1); }
          else if (idx >= 0) n[idx] = derinKopya(deger);
          else n.push(derinKopya(deger));
          return true;
        }
        if (idx < 0) return false;
        n = n[idx];
      } else {
        if (son) {
          if (deger === undefined) delete n[seg]; else n[seg] = derinKopya(deger);
          return true;
        }
        if (n[seg] == null || typeof n[seg] !== "object") return false;
        n = n[seg];
      }
    }
    return false;
  }
  /* ===UCB-BITIR=== */
  d._ucYolluKok = ucYolluKok;   /* test/hata ayıklama kancası */
  d._yolaYaz = yolaYaz;
  /* Kaydedilmemiş yerel değişiklik var mı? (sessiz tazeleme güvenliği) */
  d.temizMi = function () {
    if (d._kayitBekliyor || d._kayitUcuyor || d._bekleyenCakisma) return false;
    try { return JSON.stringify(d.veri) === JSON.stringify(d._sonKayit); } catch (e) { return false; }
  };

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
      elektrik: "Kapsam 2 elektrik", moduller: "TSRS açıklamaları", sektorMetrik: "Sektör metrikleri",
      indeks: "INDEX (organizasyon/RFI/doküman/kanıt)"
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
    if (window.UI && UI.kayitDurumu) UI.kayitDurumu("kaydediliyor");
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
    var musteriId = d.aktifMusteriId;   // yanıt gelene dek müşteri değişebilir
    return SB.from("customers").update({ data: gonder, surum_no: yeniSurum })
      .eq("id", musteriId).eq("surum_no", d.surumNo).select("surum_no")
      .then(function (upd) {
        if (upd.error) throw upd.error;
        if (!upd.data || !upd.data.length) {
          d._kayitUcuyor = false;
          // Sürüm yarışı: pop-up yerine ÜÇ YOLLU BİRLEŞTİRME + otomatik yeniden kayıt.
          // Yalnız aynı alanda gerçek çakışma varsa kullanıcıya sorulur (banner).
          return d._otoBirlestir(musteriId, sessiz);
        }
        if (d.aktifMusteriId === musteriId) {   // müşteri bu arada değiştiyse bayat duruma yazma
          d.surumNo = yeniSurum;
          d._sonKayit = gonder;
        }
        d._kayitUcuyor = false;
        d._birlesimDeneme = 0;   // başarılı kayıt: birleştirme deneme sayacı sıfırlanır
        if (window.UI && UI.bannerKapat) { UI.bannerKapat("kayit-hata"); UI.bannerKapat("kayit-cakisma"); }
        if (window.UI && UI.kayitDurumu) UI.kayitDurumu("kaydedildi");
        if (!sessiz && window.UI) UI.bildir("Kaydedildi");
        if (patch && patch.length && window.jsonpatch) {
          SB.from("customer_versions").insert({
            customer_id: musteriId, surum_no: yeniSurum, ters_patch: patch, ozet: ozetUret(patch)
          }).then(function (vq) {
            if (vq && vq.error) { console.warn("Sürüm geçmişi yazılamadı: " + vq.error.message); return; }
            if (yeniSurum > 50) {
              SB.from("customer_versions").delete()
                .eq("customer_id", musteriId).lte("surum_no", yeniSurum - 50);
            }
          })["catch"](function (e) { console.warn("Sürüm geçmişi yazılamadı:", e); });
        }
      })["catch"](function (e) {
        d._kayitUcuyor = false;
        if (window.UI && UI.kayitDurumu) UI.kayitDurumu("hata");
        if (window.UI && UI.banner) {
          UI.banner("kayit-hata", "Kayıt buluta yazılamadı: " + (e.message || e) +
            " — verileriniz tarayıcıda duruyor, bağlantıyı kontrol edip yeniden deneyin.",
            [{ etiket: "Yeniden dene", tik: function () { d.kaydet(); } }]);
        } else if (window.UI) UI.bildir("Kayıt hatası: " + (e.message || e), true);
      });
  };

  /* ---- Otomatik birleştirme (sürüm yarışında) ----
     Uzaktaki güncel hali çeker, üç yollu birleştirir; gerçek çakışma yoksa
     kendiliğinden yeniden kaydeder (en çok 3 deneme). Gerçek çakışma varsa
     bağlamı saklar ve ayrıntılı banner gösterir. */
  d._birlesimDeneme = 0;
  d._bekleyenCakisma = null;
  d._otoBirlestir = function (musteriId, sessiz) {
    if (d.aktifMusteriId !== musteriId || !window.SB) return Promise.resolve();
    d._birlesimDeneme = (d._birlesimDeneme || 0) + 1;
    if (d._birlesimDeneme > 3) {                 // ağır eşzamanlı yarış (çok nadir): kullanıcıya bırak
      d._birlesimDeneme = 0;
      if (window.UI && UI.kayitCakismasi) UI.kayitCakismasi([]);
      else if (window.UI) UI.bildir("Eşzamanlı kayıt yoğunluğu; lütfen tekrar deneyin.", true);
      return Promise.resolve();
    }
    return SB.from("customers").select("data, surum_no").eq("id", musteriId).single()
      .then(function (q) {
        if (q.error) throw q.error;
        if (d.aktifMusteriId !== musteriId) return;          // bu arada müşteri değişti
        var uzak = Object.assign(bosVeri(), q.data.data || {});
        var uzakSurum = q.data.surum_no || 0;
        var taban = d._sonKayit ? derinKopya(d._sonKayit) : bosVeri();
        var m = ucYolluKok(taban, derinKopya(d.veri), uzak);
        if (m.cakismalar.length) {
          // Aynı alanda gerçek çakışma: bağlamı sakla, seçimli banner göster.
          d._bekleyenCakisma = { sonuc: m.sonuc, cakismalar: m.cakismalar, uzak: uzak, uzakSurum: uzakSurum };
          d._birlesimDeneme = 0;
          if (window.UI && UI.kayitCakismasi) UI.kayitCakismasi(m.cakismalar);
          else if (window.UI) UI.bildir("Aynı alanda çakışan değişiklikler var; lütfen seçim yapın.", true);
          return;
        }
        // Temiz birleşme: taban artık uzak hal → sürüm geçmişi yalnız bizim farkı içerir
        d._sonKayit = derinKopya(uzak);
        d.surumNo = uzakSurum;
        d.veri = Object.assign(bosVeri(), m.sonuc);
        if (window.UI) {
          if (UI.bannerKapat) UI.bannerKapat("kayit-cakisma");
          UI.bildir("Diğer kullanıcının değişiklikleriyle birleştirildi");
          if (UI.ciz) UI.ciz();                 // ekran birleşik veriyi göstersin
        }
        return d._flush(sessiz === undefined ? true : sessiz);
      })["catch"](function (e) {
        if (window.UI) UI.bildir("Birleştirme yapılamadı: " + (e.message || e), true);
      });
  };

  /* Çakışma çözümü — her iki seçenek de ÜÇ YOLLU BİRLEŞİK sonucu yazar; yalnız
     çakışan alanlarda tercih uygulanır. "uzak" = o alanlarda diğer kullanıcının
     değeri, "yerel" (eski adıyla "uzerine") = o alanlarda benim değerim.
     Çakışmayan hiçbir değişiklik hiçbir seçenekte kaybolmaz. */
  d.cakismaCoz = function (mod) {
    if (!d.aktifMusteriId || !window.SB) return Promise.resolve("Bağlantı yok");
    if (mod === "uzerine") mod = "yerel";       // eski API adı korunur
    var b = d._bekleyenCakisma;
    if (!b) {
      // Bekleyen birleştirme bağlamı yok (eski akış/yoğun yarış): güvenli yollar
      if (mod === "uzak") return d.yukle(d.aktifMusteriId).then(function () { return null; });
      return d._otoBirlestir(d.aktifMusteriId, true).then(function () { return null; });
    }
    var sonuc = derinKopya(b.sonuc);            // yerel tercihli birleşik taban
    if (mod === "uzak") b.cakismalar.forEach(function (c) { yolaYaz(sonuc, c.yol, c.uzak); });
    d._bekleyenCakisma = null;
    d._sonKayit = derinKopya(b.uzak);           // geri-al yaması yalnız bizim farkı içersin
    d.surumNo = b.uzakSurum;
    d.veri = Object.assign(bosVeri(), sonuc);
    return d._flush(true).then(function () { return null; });
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
  /* Dönen: { satirlar: [...], hata: null|mesaj } — hata boş listeyle KARIŞTIRILMAZ
     (auth.js hata durumunda "Henüz müşteri yok" yerine yeniden-dene ekranı gösterir) */
  d.musteriListele = function () {
    if (!window.SB) return Promise.resolve({ satirlar: [], hata: "Bulut bağlantısı yok" });
    return SB.from("customers").select("id, unvan, nace, yil, updated_at").order("updated_at", { ascending: false })
      .then(function (q) {
        if (q.error) return { satirlar: [], hata: q.error.message };
        return { satirlar: q.data || [], hata: null };
      })["catch"](function (e) { return { satirlar: [], hata: String(e && e.message || e) }; });
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
    // Bekleyen otokayıt varsa müşteri kapanmadan hemen gönder (sessiz veri kaybını önler)
    if (d._kayitBekliyor) { clearTimeout(kayitZamanlayici); d._flush(true); }
    d.izlemeyiBirak();
    d.aktifMusteriId = null; d.veri = bosVeri(); d.surumNo = 0; d._sonKayit = null;
    d._bekleyenCakisma = null; d._birlesimDeneme = 0;
  };

  /* ---- Gerçek zamanlı izleme (eşzamanlı düzenleme farkındalığı) ----
     Açık müşterinin satırı başka bir kullanıcı tarafından güncellenirse geriCagir(surum) tetiklenir. */
  d._kanal = null;
  d.gercekZamanliIzle = function (musteriId, geriCagir) {
    if (!window.SB || !SB.channel) return;
    d.izlemeyiBirak();
    d._kanal = SB.channel("musteri-" + musteriId)
      .on("postgres_changes",
        { event: "UPDATE", schema: "public", table: "customers", filter: "id=eq." + musteriId },
        function (payload) {
          var yeni = payload.new || {};
          if (yeni.surum_no > d.surumNo && yeni.updated_by &&
              (!d.aktifKullanici || yeni.updated_by !== d.aktifKullanici.id)) {
            if (typeof geriCagir === "function") geriCagir(yeni.surum_no);
          }
        })
      .subscribe();
  };
  d.izlemeyiBirak = function () {
    if (d._kanal && window.SB && SB.removeChannel) { try { SB.removeChannel(d._kanal); } catch (e) {} }
    d._kanal = null;
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
        // RLS engellerse hata değil 0 satır döner — sahte "kaydedildi" gösterme
        else if (!q.data || !q.data.length) {
          if (window.UI) UI.bildir("Ayar buluta YAZILAMADI: bu işlem yönetici yetkisi gerektirir. " +
            "Değişiklik yalnız bu oturumda geçerli kalır.", true);
        }
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

  /* ---- Kayıt no üretici ----
     dizi verilirse o listedeki mevcut no'larla çakışan numaralar atlanır
     (kullanıcı formdan elle no girebildiği için sayaç ile çakışma olabilir) */
  d.yeniNo = function (onek, dizi) {
    var no;
    do {
      no = onek + "-" + String(d.veri.sayac++).padStart(3, "0");
    } while (dizi && Array.isArray(d.veri[dizi]) &&
             d.veri[dizi].some(function (k) { return k && k.no === no; }));
    return no;
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
    // Referans/ayar düzenlemeleri yalnız yönetici hesabında app_config'e yazılabilir;
    // yönetici değilse yerelde de uygulanmaz (sunucudan sessiz ayrışmayı önler)
    if (p.ref || p.ayar || p.liste || p.modulTanim) {
      if (d.aktifKullanici && d.aktifKullanici.rol === "admin") {
        d.refOzel = p.ref || {}; d.ayarOzel = p.ayar || {};
        d.listeOzel = p.liste || {}; d.modulTanimOzel = p.modulTanim || null;
        d.konfigKaydet();
      } else if (window.UI) {
        UI.bildir("Yedekteki referans/ayar düzenlemeleri atlandı (yönetici yetkisi gerekir); müşteri verisi yüklendi.", true);
      }
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
  /* CSV hücresindeki sayıyı hem TR (1.234,56 / 10,5) hem EN (1,234.56 / 10.5)
     biçiminde güvenle çözer. Dönen: { deger: "nokta.ondalıklı metin", supheli: bool }
     ya da null (sayı değil). supheli=true → tek ayraç + tam 3 hane (1.234 / 1,234):
     binlik mi ondalık mı belirsiz; TR kuralı uygulanır ama kullanıcı uyarılır. */
  function csvSayiCoz(metin) {
    var t = String(metin == null ? "" : metin).trim().replace(/\s/g, "");
    if (!t) return null;
    var supheli = false;
    var sv = t.lastIndexOf(","), sn = t.lastIndexOf(".");
    if (sv > -1 && sn > -1) {
      // İki ayraç birden: son görünen ondalıktır
      t = (sv > sn) ? t.replace(/\./g, "").replace(/,/g, ".") : t.replace(/,/g, "");
    } else if (sv > -1) {
      var pv = t.split(",");
      if (pv.length > 2) t = t.replace(/,/g, "");            // 1,234,567 → binlik
      else {                                                  // tek virgül → ondalık (TR)
        if (pv[1] && pv[1].length === 3) supheli = true;      // "1,234" belirsiz
        t = t.replace(",", ".");
      }
    } else if (sn > -1) {
      var pn = t.split(".");
      if (pn.length > 2) t = t.replace(/\./g, "");            // 1.234.567 → binlik
      else if (pn[1] && pn[1].length === 3) {                 // "1.234" → TR binlik say, uyar
        supheli = true;
        t = t.replace(".", "");
      }
      // "10.5", "1234.56" → ondalık (dokunma)
    }
    var n = parseFloat(t);
    return isFinite(n) ? { deger: t, supheli: supheli } : null;
  }

  d.csvFaaliyetIceAktar = function (csvMetin) {
    var sonuc = { eklenen: 0, atlanan: 0, hatalar: [], uyarilar: [] };
    if (!csvMetin || !csvMetin.trim()) { sonuc.hatalar.push("Boş dosya"); return sonuc; }
    var satirlar = csvMetin.split(/\r?\n/).filter(function (s) { return s.trim(); });
    if (satirlar.length < 2) { sonuc.hatalar.push("En az başlık + 1 veri satırı gerekir"); return sonuc; }
    // Ayırıcı tespiti: noktalı virgül veya virgül
    var ayirici = (satirlar[0].split(";").length > satirlar[0].split(",").length) ? ";" : ",";
    function hucreler(satir) {
      return satir.split(ayirici).map(function (h) { return h.trim().replace(/^"|"$/g, ""); });
    }
    // Başlık normalizasyonu: Türkçe İ/I tuzağına düşme ("MIKTAR" da "MİKTAR" da eşleşsin)
    var basliklar = hucreler(satirlar[0]).map(function (h) {
      return h.replace(/İ/g, "i").replace(/I/g, "i").toLocaleLowerCase("tr").trim();
    });
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
      var hamMiktar = h[iMiktar] || "";
      var cozum = csvSayiCoz(hamMiktar);
      if (!h[iKat] || !cozum) {
        sonuc.atlanan++;
        sonuc.uyarilar.push("Satır " + (r + 1) + " atlandı: " +
          (!h[iKat] ? "kategori boş" : "miktar sayı olarak çözülemedi (“" + hamMiktar + "”)"));
        continue;
      }
      if (cozum.supheli) {
        sonuc.uyarilar.push("Satır " + (r + 1) + ": “" + hamMiktar + "” belirsiz biçim — " +
          parseFloat(cozum.deger).toLocaleString("tr-TR") + " olarak okundu; yanlışsa kaydı düzeltin.");
      }
      var kayit = {
        no: d.yeniNo("F", "faaliyet"),
        tesis: iTesis > -1 ? h[iTesis] : "(CSV içe aktarım)",
        kategori: h[iKat],
        kaynak: iKaynak > -1 ? h[iKaynak] : "",
        miktar: cozum.deger,
        birim: iBirim > -1 ? h[iBirim] : "",
        donem: iDonem > -1 ? h[iDonem] : "",
        aciklama: (iAcik > -1 ? h[iAcik] : "") + " [CSV içe aktarım]",
        bolge: "Other1"
      };
      d.veri.faaliyet.push(kayit);
      sonuc.eklenen++;
    }
    if (sonuc.eklenen) d.kaydet(true);
    return sonuc;
  };

  /* ============================================================
     BELGEDEN İÇE AKTARIM — "yalnız boş doldur" + kaynak izi
     ------------------------------------------------------------
     Dağınık müşteri belgeleri (PDF/Excel/MD) yerelde parse edilip
     "birleşik içe aktarım paketi" (tur: KarbonMotoru_IceAktarimPaketi)
     olarak üretilir. Bu paket açık müşteriye:
       • skaler alanları YALNIZ BOŞSA doldurur (mevcut veriyi ezmez),
       • faaliyet/elektrik/soğutucu ve modül kayıtlarını dedup ile EKLER,
       • her doldurulan alanın kaynağını d.veri.kaynaklar[yol]'da izler.
     Ham belge DB'ye GİRMEZ; yalnız yapılandırılmış paket girer.
     ============================================================ */

  // Bir değer "boş" mu? (undefined/null/boş metin/boş dizi/boş nesne)
  function bosMu(v) {
    if (v == null) return true;
    if (typeof v === "string") return v.trim() === "";
    if (Array.isArray(v)) return v.length === 0;
    if (typeof v === "object") return Object.keys(v).length === 0;
    return false;
  }
  // Nokta-yol ile oku: yolOku(obj, "profil.nace")
  function yolOku(kok, yol) {
    var p = String(yol).split("."), o = kok;
    for (var i = 0; i < p.length; i++) { if (o == null) return undefined; o = o[p[i]]; }
    return o;
  }
  // Nokta-yol ile yaz (ara nesneleri oluşturur): yolYaz(obj, "sektorMetrik.EM-MM-110a.1.deger", v)
  function yolYaz(kok, yol, deger) {
    var p = String(yol).split("."), o = kok;
    for (var i = 0; i < p.length - 1; i++) {
      if (o[p[i]] == null || typeof o[p[i]] !== "object") o[p[i]] = {};
      o = o[p[i]];
    }
    o[p[p.length - 1]] = deger;
  }

  /* ---- Profil (künye) skaler alan kataloğu ----
     KAYNAK: arayuz.js cizProfil formu. Form alanı eklerseniz buraya da ekleyin
     (modüller ve sektör metrikleri şemadan otomatik gelir; profil formu satır-içi
     olduğundan burada elle tutulur). */
  d.HEDEF_PROFIL = [
    { anahtar: "unvan", etiket: "Ticari Unvan", tip: "metin" },
    { anahtar: "vergiNo", etiket: "Vergi / MERSİS No", tip: "metin" },
    { anahtar: "nace", etiket: "NACE Kodu", tip: "metin" },
    { anahtar: "sektor", etiket: "Sektör", tip: "metin" },
    { anahtar: "adres", etiket: "Merkez Adresi", tip: "metin" },
    { anahtar: "iletisim", etiket: "Rapor Sorumlusu / İletişim", tip: "metin" },
    { anahtar: "yil", etiket: "Raporlama Yılı", tip: "sayi" },
    { anahtar: "donemBas", etiket: "Dönem Başlangıcı", tip: "tarih" },
    { anahtar: "donemBit", etiket: "Dönem Bitişi", tip: "tarih" },
    { anahtar: "bazYil", etiket: "Baz Yıl", tip: "sayi" },
    { anahtar: "ilkRapor", etiket: "İlk TSRS Raporu mu?", tip: "secim" },
    { anahtar: "sinir", etiket: "Konsolidasyon Yaklaşımı", tip: "secim" },
    { anahtar: "konsolidasyon", etiket: "Dahil edilen tesisler / iştirakler", tip: "uzun_metin" },
    { anahtar: "fte", etiket: "Çalışan Sayısı (TZE)", tip: "sayi" },
    { anahtar: "hasilat", etiket: "Net Hasılat (Bin TL)", tip: "sayi" },
    { anahtar: "uretim", etiket: "Yıllık Üretim (ton)", tip: "sayi" },
    { anahtar: "dogrulama", etiket: "Güvence Durumu", tip: "secim" },
    { anahtar: "dogrulayici", etiket: "Doğrulayıcı Kuruluş", tip: "metin" },
    { anahtar: "dogrulamaStandart", etiket: "Güvence Standardı", tip: "secim" },
    { anahtar: "guvenceSeviye", etiket: "Güvence Seviyesi", tip: "secim" },
    { anahtar: "ticaretSicilNo", etiket: "Ticaret Sicil No", tip: "metin" },
    { anahtar: "iletisimEposta", etiket: "İletişim E-postası", tip: "metin" },
    { anahtar: "raporDanismani", etiket: "Raporlama Danışmanı", tip: "metin" },
    { anahtar: "web", etiket: "Web Sitesi", tip: "metin" },
    { anahtar: "oncekiK1", etiket: "Önceki Dönem Kapsam 1 (tCO2e)", tip: "sayi" },
    { anahtar: "oncekiK2", etiket: "Önceki Dönem Kapsam 2 (tCO2e)", tip: "sayi" },
    { anahtar: "oncekiK3", etiket: "Önceki Dönem Kapsam 3 (tCO2e)", tip: "sayi" },
    { anahtar: "icKarbonFiyati", etiket: "İç Karbon Fiyatı", tip: "metin" }
  ];

  /* ---- HEDEF ALAN HARİTASI ----
     Uygulamanın TÜM doldurulabilir alanlarını ŞEMADAN üretir; elle liste tutulmaz.
     Döner: [{ yol, etiket, tip, grup, tur:"skaler"|"dizi", dolu, adet? , sutunlar? }] */
  d.hedefAlanlar = function () {
    var liste = [];
    // 1) Profil skalerleri
    d.HEDEF_PROFIL.forEach(function (a) {
      liste.push({ yol: "profil." + a.anahtar, etiket: a.etiket, tip: a.tip, grup: "Şirket Profili", tur: "skaler" });
    });
    // 2) Modül anlatıları + kayıt tabloları (data/tsrs_modulleri.js)
    d.modulTanimlari().forEach(function (m) {
      (m.anlatilar || []).forEach(function (al) {
        liste.push({
          yol: "moduller." + m.id + ".anlatilar." + al.anahtar,
          etiket: al.etiket, tip: al.tip || "uzun_metin", grup: m.baslik, tur: "skaler"
        });
      });
      if (m.tablo) {
        liste.push({
          yol: "moduller." + m.id + ".kayitlar", etiket: m.tablo.etiket + " (tablo)",
          tip: "tablo", grup: m.baslik, tur: "dizi", sutunlar: m.tablo.sutunlar || []
        });
      }
    });
    // 3) Sektör metrikleri (seçili ciltlerden — data/sektor_ciltleri.js)
    d.aktifMetrikler().forEach(function (mk) {
      var alan = (mk.tip === "ta") ? "metin" : "deger";
      liste.push({
        yol: "sektorMetrik." + mk.kod + "." + alan, etiket: (mk.kod + " — " + mk.ad),
        tip: mk.tip, grup: "Sektör Metrikleri", tur: "skaler"
      });
    });
    // 4) Veri dizileri
    liste.push({ yol: "faaliyet", etiket: "Faaliyet (Kapsam 1 & 3)", tip: "tablo", grup: "Veri Girişi", tur: "dizi" });
    liste.push({ yol: "elektrik", etiket: "Elektrik (Kapsam 2)", tip: "tablo", grup: "Veri Girişi", tur: "dizi" });
    liste.push({ yol: "sogutucu", etiket: "Soğutucu / Kaçak Gaz", tip: "tablo", grup: "Veri Girişi", tur: "dizi" });
    // 5) Doldurulma durumu
    liste.forEach(function (a) {
      if (a.tur === "dizi") {
        var arr = yolOku(d.veri, a.yol);
        a.adet = Array.isArray(arr) ? arr.length : 0;
        a.dolu = a.adet > 0;
      } else {
        a.dolu = !bosMu(yolOku(d.veri, a.yol));
      }
    });
    return liste;
  };

  /* ---- BOŞ ALAN MANİFESTOSU ----
     Açık müşteri için doldurulması gereken TÜM boşlukların listesi.
     Belge-arama kontrol listesi + "hepsini kapsadık mı" kanıtı. */
  d.bosAlanOzeti = function () {
    var h = d.hedefAlanlar();
    var ozet = { toplam: h.length, dolu: 0, bos: 0, gruplar: {} };
    h.forEach(function (a) {
      if (a.dolu) ozet.dolu++; else ozet.bos++;
      var g = ozet.gruplar[a.grup] || (ozet.gruplar[a.grup] = { toplam: 0, bos: 0 });
      g.toplam++; if (!a.dolu) g.bos++;
    });
    return ozet;
  };
  d.bosAlanManifestoIndir = function () {
    var h = d.hedefAlanlar(), sep = ";";
    function hucre(v) { v = String(v == null ? "" : v); return (v.indexOf(sep) > -1 || v.indexOf('"') > -1) ? '"' + v.replace(/"/g, '""') + '"' : v; }
    var satirlar = [["grup", "alan", "yol", "tip", "durum"].join(sep)];
    h.forEach(function (a) {
      satirlar.push([hucre(a.grup), hucre(a.etiket), hucre(a.yol), hucre(a.tip),
        a.tur === "dizi" ? (a.dolu ? a.adet + " kayıt" : "BOŞ") : (a.dolu ? "dolu" : "BOŞ")].join(sep));
    });
    var p = d.veri.profil || {};
    var ad = "bos-alan-manifestosu-" + dosyaSlug(p.unvan) + (p.yil ? "-" + p.yil : "") + ".csv";
    d.dosyaIndir(ad, "﻿" + satirlar.join("\r\n"), "text/csv");
  };

  // Dizi kaydı için dedup anahtarı (yeniden yüklemede tekrarı önler)
  function diziAnahtar(dizi, k) {
    k = k || {};
    if (dizi === "faaliyet") return [k.tesis, k.kategori, k.kaynak, k.miktar, k.birim, k.donem].join("|").toLocaleLowerCase("tr");
    if (dizi === "elektrik") return [k.tesis, k.sebeke, k.kwh, k.donem].join("|").toLocaleLowerCase("tr");
    if (dizi === "sogutucu") return [k.ekipman, k.gaz, k.donem].join("|").toLocaleLowerCase("tr");
    return JSON.stringify(k);
  }

  /* ---- İÇE AKTARIM ANALİZİ (kuru çalıştırma — YAZMAZ) ----
     Paketi açık müşteriyle karşılaştırır; ne olacağını önizleme için döner.
     { gecerli, dolacak:[], zatenDolu:[], cakisma:[], eklenecekKayit, dedupAtlanacak, hata } */
  d.iceAktarimAnaliz = function (paket) {
    if (typeof paket === "string") paket = guvenliParse(paket, null);
    var r = { gecerli: false, dolacak: [], zatenDolu: [], cakisma: [], eklenecekKayit: 0, dedupAtlanacak: 0, kaynakBelgeler: [], hata: null };
    if (!paket || paket.tur !== "KarbonMotoru_IceAktarimPaketi") { r.hata = "Bu dosya bir Karbon Motoru İçe Aktarım Paketi değil."; return r; }
    r.gecerli = true;
    r.kaynakBelgeler = paket.kaynakBelgeler || [];
    (paket.doldur || []).forEach(function (g) {
      if (!g || !g.yol) return;
      var mevcut = yolOku(d.veri, g.yol);
      if (bosMu(mevcut)) r.dolacak.push({ yol: g.yol, deger: g.deger, kaynak: g.kaynak || "", guven: g.guven || "" });
      else if (String(mevcut).trim() !== String(g.deger).trim()) r.cakisma.push({ yol: g.yol, mevcut: mevcut, yeni: g.deger, kaynak: g.kaynak || "" });
      else r.zatenDolu.push(g.yol);
    });
    ["faaliyet", "elektrik", "sogutucu"].forEach(function (dz) {
      var mevcutArr = d.veri[dz] || [], gorulen = {};
      (paket[dz] || []).forEach(function (kayit) {
        var ak = diziAnahtar(dz, kayit);
        if (gorulen[ak] || mevcutArr.some(function (x) { return diziAnahtar(dz, x) === ak; })) r.dedupAtlanacak++;
        else { gorulen[ak] = true; r.eklenecekKayit++; }
      });
    });
    (paket.modulKayit || []).forEach(function () { r.eklenecekKayit++; });
    return r;
  };

  /* ---- İÇE AKTARIM UYGULA (yazar) ----
     opts.cakismaYollari: kullanıcının "üzerine yaz" onayı verdiği yol dizisi (varsayılan yok).
     Döner: analiz sonucuna benzer gerçekleşme raporu. */
  d.iceAktarimUygula = function (paket, opts) {
    opts = opts || {};
    if (typeof paket === "string") paket = guvenliParse(paket, null);
    if (!paket || paket.tur !== "KarbonMotoru_IceAktarimPaketi") return { hata: "Geçersiz paket" };
    var cakismaYaz = {};
    (opts.cakismaYollari || []).forEach(function (y) { cakismaYaz[y] = true; });
    var sonuc = { dolduruldu: 0, cakismaYazildi: 0, cakismaAtlandi: 0, zatenDolu: 0, eklenenKayit: 0, dedupAtlanan: 0 };
    if (!d.veri.kaynaklar) d.veri.kaynaklar = {};
    var tarih = new Date().toISOString().slice(0, 10);
    function kaynakYaz(yol, g) { d.veri.kaynaklar[yol] = { kaynak: g.kaynak || "", guven: g.guven || "", tarih: tarih, belge: paket.kaynakBelgeler || [] }; }
    (paket.doldur || []).forEach(function (g) {
      if (!g || !g.yol) return;
      var mevcut = yolOku(d.veri, g.yol);
      if (bosMu(mevcut)) { yolYaz(d.veri, g.yol, g.deger); kaynakYaz(g.yol, g); sonuc.dolduruldu++; }
      else if (String(mevcut).trim() !== String(g.deger).trim()) {
        if (cakismaYaz[g.yol]) { yolYaz(d.veri, g.yol, g.deger); kaynakYaz(g.yol, g); sonuc.cakismaYazildi++; }
        else sonuc.cakismaAtlandi++;
      } else sonuc.zatenDolu++;
    });
    ["faaliyet", "elektrik", "sogutucu"].forEach(function (dz) {
      if (!Array.isArray(d.veri[dz])) d.veri[dz] = [];
      var onek = dz === "faaliyet" ? "F" : dz === "elektrik" ? "E" : "S";
      (paket[dz] || []).forEach(function (kayit) {
        var ak = diziAnahtar(dz, kayit);
        if (d.veri[dz].some(function (x) { return diziAnahtar(dz, x) === ak; })) { sonuc.dedupAtlanan++; return; }
        if (!kayit.no) kayit.no = d.yeniNo(onek, dz);
        // Belge dayanağı ayrı alanda (_kaynak); "kaynak" gerçek veri alanıdır (ör. yakıt adı)
        if (kayit._kaynak) { kayit.aciklama = (kayit.aciklama ? kayit.aciklama + " " : "") + "[Kaynak: " + kayit._kaynak + "]"; delete kayit._kaynak; }
        d.veri[dz].push(kayit);
        sonuc.eklenenKayit++;
      });
    });
    (paket.modulKayit || []).forEach(function (mk) {
      if (!mk || !mk.modul || !mk.kayit) return;
      var mv = d.modulVeri(mk.modul);
      if (mk.kayit._kaynak) { mk.kayit.dayanak = "[Kaynak: " + mk.kayit._kaynak + "]"; delete mk.kayit._kaynak; }
      mv.kayitlar.push(mk.kayit);
      sonuc.eklenenKayit++;
    });
    d.kaydet(true);
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
