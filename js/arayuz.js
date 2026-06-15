/* ============================================================================
   ARAYÜZ — Sayfa yönlendirme, kenar çubuğu, formlar ve veri giriş ekranları
   Bu dosya uygulamanın "iskeletidir". Form alanları data/tsrs_modulleri.js ve
   data/listeler.js dosyalarından otomatik üretilir; içerik düzenlemek için
   genellikle bu dosyaya dokunmanız gerekmez.
   ============================================================================ */
"use strict";
window.UI = (function () {
  var UI = {};
  var idSayac = 0;

  /* ================= DOM yardımcıları ================= */
  UI.el = function (etiket, oz, cocuklar) {
    var n = document.createElement(etiket);
    if (oz) Object.keys(oz).forEach(function (k) {
      var v = oz[k];
      if (v == null) return;
      if (k === "class") n.className = v;
      else if (k === "html") n.innerHTML = v;
      else if (k.indexOf("on") === 0) n.addEventListener(k.slice(2), v);
      else if (k === "value") n.value = v;
      else if (k === "checked") n.checked = !!v;
      else n.setAttribute(k, v);
    });
    (cocuklar || []).forEach(function (c) {
      if (c == null || c === false) return;
      n.appendChild(typeof c === "string" || typeof c === "number"
        ? document.createTextNode(String(c)) : c);
    });
    return n;
  };
  var el = UI.el;

  UI.kacir = function (s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  };

  /* ================= Bildirim (toast) ================= */
  UI.bildir = function (mesaj, hata) {
    var kap = document.querySelector(".bildirim");
    if (!kap) { kap = el("div", { class: "bildirim" }); document.body.appendChild(kap); }
    var n = el("div", { class: "not" + (hata ? " hata" : "") }, [mesaj]);
    kap.appendChild(n);
    setTimeout(function () { n.style.opacity = "0"; n.style.transition = "opacity .3s"; }, 2200);
    setTimeout(function () { if (n.parentNode) n.parentNode.removeChild(n); }, 2600);
  };

  /* ================= Modal pencere ================= */
  UI.modal = function (baslik, govde, dugmeler, genislik) {
    var fon = el("div", { class: "modal-fon" });
    function kapat() { if (fon.parentNode) fon.parentNode.removeChild(fon); document.removeEventListener("keydown", esc); }
    function esc(e) { if (e.key === "Escape") kapat(); }
    var alt = el("div", { class: "m-alt" });
    (dugmeler || []).forEach(function (d) {
      alt.appendChild(el("button", {
        class: "btn " + (d.sinif || "ikincil"), type: "button",
        onclick: function () { d.tik ? d.tik(kapat) : kapat(); }
      }, [d.etiket]));
    });
    var kutu = el("div", { class: "modal", role: "dialog", "aria-modal": "true" }, [
      el("div", { class: "m-baslik" }, [
        el("h3", null, [baslik]),
        el("button", { class: "kapat-x", type: "button", "aria-label": "Kapat", onclick: kapat }, ["×"])
      ]),
      el("div", { class: "m-ic" }, [govde]),
      alt
    ]);
    if (genislik) kutu.style.maxWidth = genislik + "px";
    fon.appendChild(kutu);
    fon.addEventListener("mousedown", function (e) { if (e.target === fon) kapat(); });
    document.addEventListener("keydown", esc);
    document.body.appendChild(fon);
    var ilk = kutu.querySelector("input,select,textarea");
    if (ilk) setTimeout(function () { ilk.focus(); }, 60);
    return { kapat: kapat, kok: kutu };
  };

  UI.onayla = function (mesaj, tamam) {
    UI.modal("Onay", el("p", { style: "margin:4px 0" }, [mesaj]), [
      { etiket: "Vazgeç" },
      { etiket: "Evet, devam et", sinif: "tehlike", tik: function (kapat) { kapat(); tamam(); } }
    ], 460);
  };

  /* ================= Form alanı üreteci =================
     tanim: { anahtar, etiket, tip(metin|uzun_metin|sayi|tarih|secim),
              liste, yardim, zorunlu, genis, datalist, deger, degisti } */
  UI.alan = function (t) {
    var girdi, lid = "alan_" + (++idSayac);
    if (t.tip === "secim") {
      girdi = el("select", { "data-anahtar": t.anahtar, id: lid });
      girdi.appendChild(el("option", { value: "" }, ["— Seçin —"]));
      Depo.liste(t.liste).forEach(function (s) {
        girdi.appendChild(el("option", { value: s }, [s]));
      });
      if (t.deger != null) girdi.value = t.deger;
    } else if (t.tip === "uzun_metin") {
      girdi = el("textarea", { "data-anahtar": t.anahtar, id: lid, value: t.deger != null ? t.deger : "" });
    } else {
      var tip = t.tip === "sayi" ? "number" : (t.tip === "tarih" ? "date" : "text");
      girdi = el("input", { type: tip, "data-anahtar": t.anahtar, id: lid,
                            value: t.deger != null ? t.deger : "" });
      if (tip === "number") { girdi.step = "any"; girdi.inputMode = "decimal"; }
      if (t.datalist) {
        var dl = el("datalist", { id: lid + "_dl" });
        t.datalist.forEach(function (v) { dl.appendChild(el("option", { value: v })); });
        girdi.setAttribute("list", lid + "_dl");
        girdi.parentListe = dl;
      }
    }
    if (t.degisti) girdi.addEventListener("change", t.degisti);
    var sarici = el("div", { class: "alan" + ((t.genis || t.tip === "uzun_metin") ? " genis" : "") }, [
      el("label", { for: lid }, [t.etiket, t.zorunlu ? el("span", { class: "zorunlu" }, ["*"]) : null,
        t.yardim ? UI.yardimIkon(t.yardim) : null]),
      girdi,
      girdi.parentListe || null
    ]);
    sarici.girdi = girdi;
    return sarici;
  };

  /* Bir kapsayıcıdaki tüm data-anahtar girdilerini { anahtar: değer } okur */
  UI.degerler = function (kok) {
    var v = {};
    kok.querySelectorAll("[data-anahtar]").forEach(function (g) {
      v[g.getAttribute("data-anahtar")] = g.value;
    });
    return v;
  };

  /* ================= Genel kayıt tablosu =================
     opts: { sutunlar:[{etiket, deger(satir), sinif}], satirlar,
             bosMesaj, islemler:[{etiket, sinif, tik(satir,i)}] } */
  UI.veriTablo = function (opts) {
    if (!opts.satirlar.length) {
      return el("div", { class: "bos-durum" }, [
        el("div", { class: "buyuk" }, ["▦"]),
        el("div", null, [opts.bosMesaj || "Henüz kayıt yok. \u201CYeni Kayıt\u201D ile başlayın."])
      ]);
    }
    var thead = el("thead", null, [el("tr", null,
      opts.sutunlar.map(function (s) { return el("th", { class: s.sinif || "" }, [s.etiket]); })
        .concat(opts.islemler ? [el("th", { class: "satir-islem" }, ["İşlem"])] : []))]);
    var tbody = el("tbody");
    opts.satirlar.forEach(function (satir, i) {
      var tr = el("tr");
      opts.sutunlar.forEach(function (s) {
        var d = s.deger(satir, i);
        tr.appendChild(el("td", { class: s.sinif || "" },
          [d == null ? "—" : d]));
      });
      if (opts.islemler) {
        tr.appendChild(el("td", { class: "satir-islem" },
          opts.islemler.map(function (a) {
            return el("button", { class: "btn kucuk " + (a.sinif || "ikincil"), type: "button",
              onclick: function () { a.tik(satir, i); }, style: "margin-left:6px" }, [a.etiket]);
          })));
      }
      tbody.appendChild(tr);
    });
    return el("div", { class: "tablo-sar" }, [el("table", { class: "veri" }, [thead, tbody])]);
  };

  UI.kisalt = function (s, n) {
    s = String(s == null ? "" : s);
    return s.length > (n || 60) ? s.slice(0, n || 60) + "…" : s;
  };

  /* ================= YÖNLENDİRME ================= */
  var icerikKok, navKok, ustBaslik, ustRef, ustAksiyon;

  function rotalar() {
    var R = [
      { grup: "Genel" },
      { yol: "panel",   ad: "Gösterge Paneli",      ikon: "◧", ciz: function (k) { Panel.ciz(k); } },
      { yol: "kilavuz", ad: "Kılavuz",              ikon: "✦", ciz: cizKilavuz },
      { yol: "rapor",   ad: "Envanter Raporu",      ikon: "▤", ciz: function (k) { Rapor.ciz(k); }, ref: "TSRS 2 md. 29(a) • GHG Protokolü" },
      { yol: "kutuphane", ad: "Veri Kütüphanesi", ikon: "▩", ciz: cizKutuphane, ref: "Emisyon faktörü kaynakları • belirsizlik • IPCC/DEFRA/AR6" },
      { yol: "araclar", ad: "IPCC Hesap Araçları", ikon: "⚙", ciz: cizAraclar, ref: "CHP (kojenerasyon) • gelişmiş HFC/PFC • belirsizlik" },
      { grup: "Veri Girişi" },
      { yol: "profil",   ad: "Şirket Profili",            ikon: "▣", ciz: cizProfil, durum: "profil", ref: "TSRS 1 md. 20, 27, 60-69" },
      { yol: "faaliyet", ad: "Faaliyet Verisi (K1 ve K3)", ikon: "▲", ciz: cizFaaliyet, durum: "faaliyet", ref: "Kapsam 1 ve 3 — GHG Protokolü Böl. 4 ve 15" },
      { yol: "sogutucu", ad: "Soğutucu / Kaçak Gazlar",   ikon: "❄", ciz: cizSogutucu, durum: "sogutucu", ref: "Kapsam 1 — IPCC 2006 Cilt 3 Böl. 7" },
      { yol: "elektrik", ad: "Kapsam 2 — Elektrik",       ikon: "⚡", ciz: cizElektrik, durum: "elektrik", ref: "TSRS 2 md. 29(a)(ii)-(iii) — ikili raporlama" },
      { yol: "sektormetrik", ad: "Sektör Metrikleri", ikon: "◈", ciz: cizSektorMetrikleri, durum: "sektormetrik", ref: "TSRS 2 Ek Ciltleri — seçili sektör metrikleri" },
      { grup: "TSRS Açıklamaları" }
    ];
    Depo.modulTanimlari().forEach(function (m) {
      R.push({ yol: "modul/" + m.id, ad: m.baslik, ikon: "•", durum: m.id, ref: m.referans,
               ciz: function (k) { cizModul(k, m.id); } });
    });
    R.push({ grup: "Yönetim" });
    R.push({ yol: "admin", ad: "Yönetim Paneli", ikon: "⚙", ciz: function (k) { Admin.ciz(k); },
             ref: "Referans tabloları • listeler • form alanları • yedekleme" });
    return R;
  }

  function aktifYol() {
    var h = (location.hash || "").replace(/^#\/?/, "");
    return h || "panel";
  }

  function navCiz() {
    navKok.innerHTML = "";
    var D = Motor.durumlar();
    var grupKap = null;
    rotalar().forEach(function (r) {
      if (r.grup) {
        grupKap = el("div", { class: "nav-grup" }, [el("div", { class: "grup-ad" }, [r.grup])]);
        navKok.appendChild(grupKap);
        return;
      }
      var nokta = r.durum ? el("span", { class: "nokta " + (D[r.durum] || "bos"),
        title: { tam: "Tamamlandı", kismi: "Devam ediyor", bos: "Başlanmadı" }[D[r.durum] || "bos"] }) : el("span", { class: "ikon" }, [r.ikon]);
      var a = el("a", {
        class: "nav-link" + (aktifYol() === r.yol ? " aktif" : ""),
        href: "#/" + r.yol
      }, [nokta, r.ad]);
      (grupKap || navKok).appendChild(a);
    });
  }

  UI.navGuncelle = function () { if (navKok) navCiz(); };

  UI.ciz = function () {
    var yol = aktifYol();
    var rota = null;
    rotalar().forEach(function (r) { if (r.yol === yol) rota = r; });
    if (!rota) { location.hash = "#/panel"; return; }
    navCiz();
    ustBaslik.textContent = rota.ad;
    ustRef.textContent = rota.ref || "";
    ustAksiyon.innerHTML = "";
    icerikKok.innerHTML = "";
    rota.ciz(icerikKok);
    icerikKok.closest(".icerik").scrollTop = 0;
    window.scrollTo(0, 0);
  };

  UI.ustAksiyon = function (dugme) { ustAksiyon.appendChild(dugme); };

  UI.basla = function () {
    Depo.yukle();
    var kok = document.getElementById("uygulama");
    kok.innerHTML = "";
    navKok = el("nav");
    var kenar = el("aside", { class: "kenar" }, [
      el("div", { class: "marka" }, [
        el("div", { class: "strata", style: "margin-bottom:10px" }, [
          el("span", { class: "s1" }), el("span", { class: "s2" }),
          el("span", { class: "s3" }), el("span", { class: "s0" })
        ]),
        el("h1", null, [Depo.ayar("uygulama_adi") || "Karbon Motoru"]),
        el("div", { class: "alt" }, [Depo.ayar("alt_baslik") || ""])
      ]),
      navKok,
      el("div", { class: "surum" }, ["Sürüm " + (Depo.ayar("surum") || "3.0") + " — " + (Depo.ayar("kip_seti") || "IPCC AR6")])
    ]);
    ustBaslik = el("h2"); ustRef = el("div", { class: "ref" });
    ustAksiyon = el("div", { style: "display:flex;gap:10px;flex:none" });
    icerikKok = el("div", { class: "govde" });
    var icerik = el("main", { class: "icerik" }, [
      el("header", { class: "ust-bar" }, [
        el("div", { class: "ic" }, [el("div", null, [ustBaslik, ustRef]), ustAksiyon])
      ]),
      icerikKok
    ]);
    kok.appendChild(kenar); kok.appendChild(icerik);
    window.addEventListener("hashchange", UI.ciz);
    UI.ciz();
  };

  /* Yardım/kılavuz soru işareti: üzerine gelince TSRS madde dayanağı + açıklama tooltip'i.
     metin içinde **kalın** vurgu desteklenir (madde no'ları için). */
  UI.yardimIkon = function (metin) {
    if (!metin) return null;
    var tip = el("span", { class: "yardim-tip" });
    // **...** kısmını <b>...</b> yap (madde no vurgusu)
    tip.innerHTML = UI.kacir(metin).replace(/\*\*(.+?)\*\*/g, "<b>$1</b>");
    return el("span", { class: "yardim-ikon", tabindex: "0", role: "button",
      "aria-label": "Açıklama: " + metin, title: metin }, ["?", tip]);
  };

  /* Kart yardımcıları */
  UI.kart = function (baslik, ic, opts) {
    opts = opts || {};
    return el("section", { class: "kart" + (opts.kapsam ? " kapsam-serit " + opts.kapsam : "") }, [
      baslik ? el("div", { class: "kart-baslik" }, [
        el("h3", null, [baslik]),
        opts.sag || (opts.mini ? el("span", { class: "mini" }, [opts.mini]) : (opts.ref ? el("span", { class: "mini" }, [opts.ref]) : null))
      ]) : null,
      el("div", { class: "kart-ic" }, Array.isArray(ic) ? ic : [ic])
    ]);
  };

  /* ============================================================
     SAYFA: KILAVUZ
     ============================================================ */
  function cizKilavuz(kok) {
    var adimlar = Depo.ayar("kilavuz_adimlar") || [];
    kok.appendChild(UI.kart("Nasıl kullanılır?", [
      el("div", { class: "adim-dizi" }, adimlar.map(function (a) {
        return el("div", { class: "adim" }, [el("div", { style: "padding-top:3px" }, [a])]);
      }))
    ]));
    kok.appendChild(UI.kart("Metodoloji", [
      el("p", { style: "margin:0;line-height:1.65" }, [Depo.ayar("metodoloji_beyani") || ""])
    ], { mini: "Rapor kapağında otomatik yer alır" }));
    kok.appendChild(UI.kart("Verileriniz nerede saklanıyor?", [
      el("p", { style: "margin:0 0 8px" }, ["Girdiğiniz her şey bu tarayıcının kalıcı hafızasına otomatik kaydedilir; sayfayı kapatsanız da kaybolmaz. Yine de düzenli olarak Yönetim Paneli → Yedekleme sekmesinden JSON yedeği almanızı öneririz. Yedek dosyası başka bir bilgisayara da taşınabilir."]),
      el("p", { style: "margin:0;color:var(--soluk);font-size:12.5px" }, ["Emisyon faktörleri, açılır listeler ve form alanları data/ klasöründeki dosyalardan okunur ve Yönetim Paneli'nden kod yazmadan düzenlenebilir."])
    ]));
  }

  /* ============================================================
     SAYFA: VERİ KÜTÜPHANESİ (Sprint 3)
     Tüm emisyon faktörü tablolarının kaynağını, güncellemesini, belirsizliğini
     ve TSRS referansını şeffaf biçimde gösterir. TSRS 1 md. 77-82 (ölçüm
     belirsizliği) ve metodoloji şeffaflığı için. ============================================================ */
  function cizKutuphane(kok) {
    var kaynaklar = Depo.efKaynaklari();
    var anahtarlar = Object.keys(kaynaklar);

    kok.appendChild(el("div", { class: "bilgi" }, [
      "Bu sayfa, hesaplama motorunun kullandığı tüm emisyon faktörü tablolarının bilimsel kaynağını, güncelliğini ve " +
      "belirsizlik aralıklarını gösterir. Değerlerin kendisi Yönetim Paneli'nden düzenlenebilir; bu sayfa şeffaflık ve " +
      "TSRS 1 md. 77-82 (ölçüm belirsizliği açıklaması) için referans niteliğindedir."
    ]));

    // Belirsizlik metodolojisi kartı
    var met = Depo.belirsizlikMetodolojisi();
    if (met) {
      kok.appendChild(UI.kart(met.yaklasim, [
        el("p", { style: "margin:0 0 10px;line-height:1.6" }, [met.aciklama]),
        el("p", { style: "margin:0 0 6px;font-size:12.5px;color:var(--soluk)" }, ["Kaynak: " + met.kaynak]),
        el("p", { style: "margin:0 0 6px;font-size:12.5px" }, [
          el("b", { style: "color:var(--vurgu,#B4642D)" }, [met.tsrs_ref])]),
        el("div", { class: "bilgi", style: "margin:8px 0 0;font-size:12px" }, [met.durum])
      ], { mini: "Belirsizlik yaklaşımı" }));
    }

    // Her EF tablosu için kaynak kartı
    anahtarlar.forEach(function (anahtar) {
      var k = kaynaklar[anahtar];
      var satirlar = [];

      satirlar.push(el("div", { style: "margin-bottom:10px" }, [
        el("div", { style: "font-size:12px;color:var(--soluk,#888);margin-bottom:2px" }, ["K A Y N A K"]),
        el("div", { style: "line-height:1.55" }, [k.kaynak])
      ]));

      if (k.guncelleme) {
        satirlar.push(el("div", { style: "margin-bottom:10px" }, [
          el("span", { class: "rozet", style: "background:#5B6B7C;color:#fff;font-size:11px" }, ["Güncelleme: " + k.guncelleme])
        ]));
      }

      // Belirsizlik tablosu
      if (k.belirsizlik) {
        var bSatir = Object.keys(k.belirsizlik).map(function (gaz) {
          return el("div", { style: "display:flex;gap:10px;padding:4px 0;border-bottom:1px solid var(--cizgi,#eee);font-size:12.5px" }, [
            el("div", { style: "min-width:90px;font-weight:600;text-transform:uppercase;font-size:11px;color:var(--soluk)" }, [gaz]),
            el("div", { style: "flex:1" }, [k.belirsizlik[gaz]])
          ]);
        });
        satirlar.push(el("div", { style: "margin-bottom:10px" }, [
          el("div", { style: "font-size:12px;color:var(--soluk,#888);margin-bottom:4px" }, ["B E L İ R S İ Z L İ K   ( IPCC Tier 1 )"]),
          el("div", null, bSatir)
        ]));
      }

      // TSRS referansı
      if (k.tsrs_ref) {
        satirlar.push(el("div", { style: "margin-bottom:6px" }, [
          el("b", { style: "color:var(--vurgu,#B4642D);font-size:12.5px" }, [k.tsrs_ref])
        ]));
      }

      // İlgili IPCC aracı
      if (k.ipcc_arac && k.ipcc_arac !== "—") {
        satirlar.push(el("div", { style: "font-size:11.5px;color:var(--soluk)" }, [
          "İlgili IPCC aracı: " + k.ipcc_arac
        ]));
      }

      kok.appendChild(UI.kart(k.ad, satirlar, { mini: anahtar }));
    });
  }

  /* ============================================================
     SAYFA: IPCC HESAP ARAÇLARI (Sprint 4)
     CHP kojenerasyon, gelişmiş HFC/PFC ve belirsizlik hesaplayıcıları.
     Her araç canlı (girdi değiştikçe sonuç güncellenir). ============================================================ */
  function cizAraclar(kok) {
    kok.appendChild(el("div", { class: "bilgi" }, [
      "IPCC GHG Protokolü yardımcı araçları. Bu hesaplayıcılar bağımsız çalışır; sonuçları ilgili veri giriş " +
      "sayfalarına veya rapora elle aktarabilirsiniz. İleride (Sprint 5) hesaplama motoruna otomatik bağlanacaklar."
    ]));

    /* ---- ARAÇ 1: CHP (Kojenerasyon) ---- */
    (function () {
      var izgara = el("div", { class: "form-izgara" });
      var sonuc = el("div", { class: "bilgi", style: "margin:14px 0 0" });
      var aTop = UI.alan({ anahtar: "toplamTCO2e", etiket: "Toplam Yanma Emisyonu (tCO2e)", tip: "sayi",
        yardim: "Kojenerasyon tesisinin yakıt yanmasından toplam emisyonu" });
      var aE = UI.alan({ anahtar: "elektrikMWh", etiket: "Üretilen Elektrik (MWh)", tip: "sayi" });
      var aI = UI.alan({ anahtar: "isiMWh", etiket: "Üretilen Faydalı Isı (MWh)", tip: "sayi" });
      var aVE = UI.alan({ anahtar: "elektrikVerim", etiket: "Elektrik Verimi (η)", tip: "sayi",
        yardim: "Boş bırakılırsa 0,35 (tipik)" });
      var aVI = UI.alan({ anahtar: "isiVerim", etiket: "Isı Verimi (η)", tip: "sayi",
        yardim: "Boş bırakılırsa 0,80 (tipik)" });
      function hesapla() {
        var g = UI.degerler(izgara);
        var r = Motor.hesapCHP(g);
        if (r.hata) { sonuc.className = "bilgi"; sonuc.innerHTML = "<b>Hesap bekleniyor:</b> " + UI.kacir(r.hata); }
        else {
          sonuc.className = "bilgi yesil";
          sonuc.innerHTML = "<b>Elektriğe atfedilen:</b> " + Motor.fmt(r.elektrikPayi, 2) + " tCO2e (" +
            Motor.fmt(r.oranE * 100, 1) + "%) &nbsp;•&nbsp; <b>Isıya atfedilen:</b> " + Motor.fmt(r.isiPayi, 2) +
            " tCO2e (" + Motor.fmt(r.oranI * 100, 1) + "%)<br><span style='font-size:11.5px'>" + UI.kacir(r.aciklama) +
            " — elektrik payı genellikle Kapsam 2 (satış) veya Kapsam 1; ısı payı tesis Kapsam 1 olarak raporlanır.</span>";
        }
      }
      [aTop, aE, aI, aVE, aVI].forEach(function (a) {
        a.girdi.addEventListener("input", hesapla);
        izgara.appendChild(a);
      });
      hesapla();
      kok.appendChild(UI.kart("CHP — Kojenerasyon Emisyon Paylaşımı", [
        el("p", { style: "margin:0 0 12px;font-size:12.5px;color:var(--soluk)" },
          ["Tek yakıttan hem elektrik hem ısı üreten sistemlerde toplam emisyonu verimlilik yöntemiyle iki çıktıya bölüştürür. " +
           "GHG Protocol CHP Tool yöntemi. Maden sahasında kojenerasyon varsa kullanılır."]),
        izgara, sonuc
      ], { mini: "CHP_tool_v1.0" }));
    })();

    /* ---- ARAÇ 2: Gelişmiş HFC/PFC ---- */
    (function () {
      var izgara = el("div", { class: "form-izgara" });
      var sonuc = el("div", { class: "bilgi", style: "margin:14px 0 0" });
      var gazlar = Depo.set("kip_ar6").map(function (r) { return r.Gas_Name; }).filter(Boolean);
      var aGaz = UI.alan({ anahtar: "gaz", etiket: "Gaz", tip: "metin", datalist: gazlar,
        yardim: "örn. HFC-134a, R-410A, PFC-14" });
      var aMS = UI.alan({ anahtar: "montajSarj", etiket: "Yeni Ekipman İlk Dolum (kg)", tip: "sayi" });
      var aMK = UI.alan({ anahtar: "montajKayipOran", etiket: "Montaj Kayıp Oranı", tip: "sayi", yardim: "Boş=0,01" });
      var aIS = UI.alan({ anahtar: "isletmeSarj", etiket: "İşletmedeki Toplam Gaz (kg)", tip: "sayi" });
      var aIK = UI.alan({ anahtar: "isletmeKayipOran", etiket: "Yıllık İşletme Kayıp Oranı", tip: "sayi", yardim: "Boş=0,10" });
      var aBS = UI.alan({ anahtar: "bertarafSarj", etiket: "Sökülen Ekipmandaki Gaz (kg)", tip: "sayi" });
      var aBK = UI.alan({ anahtar: "bertarafGeriKazanimOran", etiket: "Bertaraf Geri Kazanım Oranı", tip: "sayi", yardim: "Boş=0,70" });
      function hesapla() {
        var g = UI.degerler(izgara);
        var r = Motor.hesapHFCgelismis(g);
        if (r.hata) { sonuc.className = "bilgi"; sonuc.innerHTML = "<b>Hesap bekleniyor:</b> " + UI.kacir(r.hata); }
        else {
          sonuc.className = "bilgi yesil";
          sonuc.innerHTML = "<b>" + Motor.fmt(r.tco2e, 3) + " tCO2e</b> &nbsp;•&nbsp; Toplam kaçak: " +
            Motor.fmt(r.kacakKg, 3) + " kg × KIP " + Motor.fmt(r.gwp, 0) + "<br><span style='font-size:11.5px'>Döküm — montaj: " +
            Motor.fmt(r.dokum.montaj, 2) + " kg • işletme: " + Motor.fmt(r.dokum.isletme, 2) + " kg • bertaraf: " +
            Motor.fmt(r.dokum.bertaraf, 2) + " kg</span>";
        }
      }
      [aGaz, aMS, aMK, aIS, aIK, aBS, aBK].forEach(function (a) {
        a.girdi.addEventListener("input", hesapla);
        izgara.appendChild(a);
      });
      hesapla();
      kok.appendChild(UI.kart("Gelişmiş HFC/PFC Envanteri (Yaşam Döngüsü)", [
        el("p", { style: "margin:0 0 12px;font-size:12.5px;color:var(--soluk)" },
          ["IPCC Tier 2 yaşam döngüsü yöntemi: yıllık kaçak = montaj kaybı + işletme kaybı + bertaraf kaybı. " +
           "Soğutucu/Kaçak sayfasındaki Kütle Dengesi ve Tarama yöntemlerine alternatiftir; daha ayrıntılı envanter sağlar."]),
        izgara, sonuc
      ], { mini: "hfc-pfc_1.xls", kapsam: "k1" }));
    })();

    /* ---- ARAÇ 3: Belirsizlik (mevcut envanterden) ---- */
    (function () {
      var sonuc = el("div", { class: "bilgi", style: "margin:0" });
      function hesapla() {
        // Mevcut envanterin toplamlarından kaynak listesi oluştur
        var T = Motor.toplamlar();
        var kaynaklar = [];
        if (T.k1.sabit) kaynaklar.push({ ad: "Sabit Yanma", emisyon: T.k1.sabit, aktiviteBelirsizlik: 3, efBelirsizlik: 5 });
        if (T.k1.mobil) kaynaklar.push({ ad: "Mobil Yanma", emisyon: T.k1.mobil, aktiviteBelirsizlik: 5, efBelirsizlik: 15 });
        if (T.k1.proses) kaynaklar.push({ ad: "Proses", emisyon: T.k1.proses, aktiviteBelirsizlik: 5, efBelirsizlik: 20 });
        if (T.k1.kacak) kaynaklar.push({ ad: "Kaçak (F-gaz)", emisyon: T.k1.kacak, aktiviteBelirsizlik: 10, efBelirsizlik: 50 });
        if (T.k2ld) kaynaklar.push({ ad: "Kapsam 2 Elektrik", emisyon: T.k2ld, aktiviteBelirsizlik: 2, efBelirsizlik: 8 });
        if (T.k3.toplam) kaynaklar.push({ ad: "Kapsam 3", emisyon: T.k3.toplam, aktiviteBelirsizlik: 15, efBelirsizlik: 30 });

        if (!kaynaklar.length) {
          sonuc.className = "bilgi";
          sonuc.innerHTML = "Henüz emisyon verisi girilmemiş. Faaliyet, Soğutucu ve Elektrik sayfalarına veri girdikçe " +
            "belirsizlik aralığı burada otomatik hesaplanacak.";
          return;
        }
        var b = Motor.belirsizlikBilesik(kaynaklar);
        var satirlar = kaynaklar.map(function (k) {
          var ub = Math.sqrt(Math.pow(k.aktiviteBelirsizlik / 100, 2) + Math.pow(k.efBelirsizlik / 100, 2)) * 100;
          return "<tr><td>" + UI.kacir(k.ad) + "</td><td style='text-align:right'>" + Motor.fmt(k.emisyon, 2) +
            "</td><td style='text-align:right'>±" + Motor.fmt(k.aktiviteBelirsizlik, 0) + "%</td><td style='text-align:right'>±" +
            Motor.fmt(k.efBelirsizlik, 0) + "%</td><td style='text-align:right'>±" + Motor.fmt(ub, 1) + "%</td></tr>";
        }).join("");
        sonuc.className = "";
        sonuc.innerHTML = "<div class='tablo-sar'><table class='veri'><thead><tr><th>Kaynak</th><th style='text-align:right'>tCO2e</th>" +
          "<th style='text-align:right'>Aktivite</th><th style='text-align:right'>EF</th><th style='text-align:right'>Bileşik</th></tr></thead><tbody>" +
          satirlar + "</tbody></table></div>" +
          "<div class='bilgi yesil' style='margin:14px 0 0'><b>Toplam: " + Motor.fmt(b.toplamEmisyon, 2) +
          " tCO2e ± " + Motor.fmt(b.bilesikBelirsizlikYuzde, 1) + "%</b><br>" +
          "%95 güven aralığı (yaklaşık): " + Motor.fmt(b.altSinir, 2) + " – " + Motor.fmt(b.ustSinir, 2) + " tCO2e" +
          "<br><span style='font-size:11.5px'>IPCC Tier 1 karekök-kareler-toplamı • TSRS 1 md. 77-82</span></div>";
      }
      hesapla();
      kok.appendChild(UI.kart("Belirsizlik Analizi (Tier 1)", [
        el("p", { style: "margin:0 0 12px;font-size:12.5px;color:var(--soluk)" },
          ["Mevcut envanterinizin toplam belirsizlik aralığını, her kaynak için varsayılan IPCC Tier 1 belirsizlik " +
           "değerleriyle hesaplar. Aktivite ve EF belirsizlikleri karekök-kareler-toplamı ile birleştirilir. " +
           "Varsayılan belirsizlik değerleri Veri Kütüphanesi sayfasında listelenmiştir."]),
        sonuc
      ], { mini: "ghg-uncertainty.xlsx • TSRS 1 md. 77-82" }));
    })();
  }

  /* ============================================================
     SAYFA: ŞİRKET PROFİLİ
     ============================================================ */
  function profilAlan(t) {
    t.deger = Depo.veri.profil[t.anahtar];
    t.degisti = function (e) {
      Depo.veri.profil[t.anahtar] = e.target.value;
      Depo.kaydet();
      UI.navGuncelle();
    };
    return UI.alan(t);
  }
  function cizProfil(kok) {
    kok.appendChild(el("div", { class: "bilgi" },
      ["Yıldızlı (*) alanlar TSRS raporu için zorunludur. Her alan, siz yazdıkça otomatik kaydedilir."]));
    kok.appendChild(UI.kart("Kuruluş Kimliği", [el("div", { class: "form-izgara" }, [
      profilAlan({ anahtar: "unvan", etiket: "Ticari Unvan", tip: "metin", zorunlu: true }),
      profilAlan({ anahtar: "vergiNo", etiket: "Vergi / MERSİS No", tip: "metin", zorunlu: true }),
      profilAlan({ anahtar: "nace", etiket: "NACE Kodu", tip: "metin", zorunlu: true, yardim: "örn. 07.29 — Diğer demir dışı metal cevherleri madenciliği" }),
      profilAlan({ anahtar: "sektor", etiket: "Sektör", tip: "metin", yardim: "örn. Madencilik ve Taş Ocakçılığı" }),
      profilAlan({ anahtar: "adres", etiket: "Merkez Adresi", tip: "metin" }),
      profilAlan({ anahtar: "iletisim", etiket: "Rapor Sorumlusu / İletişim", tip: "metin" })
    ])]));
    kok.appendChild(UI.kart("Raporlama Dönemi", [el("div", { class: "form-izgara" }, [
      profilAlan({ anahtar: "yil", etiket: "Raporlama Yılı", tip: "sayi", zorunlu: true }),
      profilAlan({ anahtar: "donemBas", etiket: "Dönem Başlangıcı", tip: "tarih", zorunlu: true }),
      profilAlan({ anahtar: "donemBit", etiket: "Dönem Bitişi", tip: "tarih", zorunlu: true }),
      profilAlan({ anahtar: "bazYil", etiket: "Baz Yıl", tip: "sayi", yardim: "Hedeflerin kıyaslandığı yıl" }),
      profilAlan({ anahtar: "ilkRapor", etiket: "İlk TSRS Raporu mu?", tip: "secim", liste: "evet_hayir", yardim: "Evet ise geçiş muafiyetleri kullanılabilir" })
    ])]));
    kok.appendChild(UI.kart("Organizasyonel Sınırlar", [el("div", { class: "form-izgara" }, [
      profilAlan({ anahtar: "sinir", etiket: "Konsolidasyon Yaklaşımı", tip: "secim", liste: "raporlama_siniri", zorunlu: true, yardim: "GHG Protokolü Bölüm 3" }),
      profilAlan({ anahtar: "konsolidasyon", etiket: "Dahil edilen tesisler / iştirakler", tip: "uzun_metin", yardim: "Sınıra dahil edilen ve hariç tutulan birimler, gerekçeleriyle" })
    ])]));
    kok.appendChild(UI.kart("Büyüklük Göstergeleri (yoğunluk hesabı için)", [el("div", { class: "form-izgara" }, [
      profilAlan({ anahtar: "fte", etiket: "Çalışan Sayısı (TZE)", tip: "sayi", zorunlu: true, yardim: "Tam zaman eşdeğeri" }),
      profilAlan({ anahtar: "hasilat", etiket: "Net Hasılat (Bin " + (Depo.ayar("para_birimi") || "TL") + ")", tip: "sayi", zorunlu: true }),
      profilAlan({ anahtar: "uretim", etiket: "Yıllık Üretim (ton cevher/ürün)", tip: "sayi", yardim: "Madenciliğe özgü yoğunluk göstergesi (isteğe bağlı)" })
    ])]));
    kok.appendChild(UI.kart("Doğrulama (Güvence)", [el("div", { class: "form-izgara" }, [
      profilAlan({ anahtar: "dogrulama", etiket: "Güvence Durumu", tip: "secim", liste: "dogrulama_durumu" }),
      profilAlan({ anahtar: "dogrulayici", etiket: "Doğrulayıcı Kuruluş", tip: "metin" })
    ])]));

    /* TSRS geçiş muafiyetleri — çoklu seçim */
    var secili = Depo.veri.profil.muafiyetler || [];
    var kutular = el("div", { style: "display:grid;gap:9px" },
      Depo.liste("tsrs_muafiyetleri").map(function (m) {
        var c = el("input", { type: "checkbox", checked: secili.indexOf(m) > -1, style: "margin-top:3px" });
        c.addEventListener("change", function () {
          var s = Depo.veri.profil.muafiyetler || [];
          if (c.checked) { if (s.indexOf(m) < 0) s.push(m); }
          else s = s.filter(function (x) { return x !== m; });
          Depo.veri.profil.muafiyetler = s;
          Depo.kaydet();
        });
        return el("label", { style: "display:flex;gap:9px;align-items:flex-start;font-size:13px;font-weight:400;cursor:pointer" }, [c, m]);
      }));
    kok.appendChild(UI.kart("Kullanılan TSRS Geçiş Muafiyetleri", [
      el("p", { style: "margin:0 0 12px;font-size:12.5px;color:var(--soluk)" },
        ["Yalnızca ilk raporlama yılında kullanılabilen kolaylıklar. İşaretledikleriniz raporda otomatik listelenir."]),
      kutular
    ]));

    /* ====== SEKTÖR VE CİLT SEÇİMİ (TSRS 2 Ek Ciltleri) ====== */
    cizCiltSecimi(kok);
  }

  /* Sektör/cilt seçim kartı — şirketin faaliyet alanına göre uygulanabilir TSRS 2
     Ek Ciltleri seçilir. Seçilen ciltlerin metrikleri dinamik form motoruna girdi olur. */
  function cizCiltSecimi(kok) {
    var aileler = Depo.sektorAileleri();
    var tumCiltler = Depo.ciltler();
    var secili = Depo.seciliCiltNolari().slice();

    var ozet = el("div", { class: "bilgi", style: "margin:0 0 14px" });
    function ozetGuncelle() {
      var n = secili.length;
      if (!n) {
        ozet.className = "bilgi";
        ozet.innerHTML = "Henüz cilt seçilmedi. Şirketinizin faaliyet alanına uyan sektörleri işaretleyin; " +
          "seçtiğiniz ciltlerin metrikleri otomatik olarak veri giriş formlarına eklenecek.";
      } else {
        var metrikSay = Depo.aktifMetrikler().length;
        ozet.className = "bilgi yesil";
        ozet.innerHTML = "<b>" + n + " cilt seçildi</b> — ortak metrikler tekilleştirildikten sonra <b>" +
          metrikSay + " metrik</b> raporlanacak. Seçili ciltler: " +
          UI.kacir(Depo.seciliCiltler().map(function (c) { return "Cilt " + c.no; }).join(", "));
      }
    }

    /* Arama kutusu */
    var arama = el("input", { type: "text", placeholder: "Cilt ara: ad veya kod (örn. madencilik, EM-MM)\u2026",
      style: "width:100%;margin-bottom:14px" });

    /* Aile aile gruplandırılmış cilt listesi */
    var listeKap = el("div");

    function ciztListe() {
      listeKap.innerHTML = "";
      var q = (arama.value || "").toLocaleLowerCase("tr");
      var aileSira = Object.keys(aileler);
      aileSira.forEach(function (aileKod) {
        var aileCiltleri = tumCiltler.filter(function (c) {
          if (c.prefix.split("-")[0] !== aileKod) return false;
          if (!q) return true;
          return (c.ad.toLocaleLowerCase("tr").indexOf(q) > -1) ||
                 (c.prefix.toLocaleLowerCase("tr").indexOf(q) > -1) ||
                 ("cilt " + c.no).indexOf(q) > -1;
        });
        if (!aileCiltleri.length) return;

        var grupBaslik = el("div", { style: "font-weight:600;font-size:12px;color:var(--vurgu,#B4642D);" +
          "text-transform:uppercase;letter-spacing:.04em;margin:16px 0 8px" },
          [aileKod + " — " + aileler[aileKod]]);
        listeKap.appendChild(grupBaslik);

        var izgara = el("div", { style: "display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:7px" });
        aileCiltleri.forEach(function (c) {
          var c0 = el("input", { type: "checkbox", checked: secili.indexOf(c.no) > -1, style: "margin-top:2px;flex:none" });
          c0.addEventListener("change", function () {
            if (c0.checked) { if (secili.indexOf(c.no) < 0) secili.push(c.no); }
            else secili = secili.filter(function (x) { return x !== c.no; });
            Depo.ciltSec(secili);
            ozetGuncelle();
            UI.navGuncelle();
          });
          var rozet = c.tureks
            ? el("span", { class: "rozet", style: "background:#1F7A63;color:#fff;font-size:10px;margin-left:6px" }, ["TUREKS"])
            : (c.ana ? el("span", { class: "rozet", style: "font-size:10px;margin-left:6px" }, ["ANA"]) : null);
          var etiket = el("label", { style: "display:flex;gap:8px;align-items:flex-start;font-size:12.5px;" +
            "font-weight:400;cursor:pointer;padding:7px 9px;border:1px solid var(--cizgi,#e0ddd6);border-radius:6px;" +
            (secili.indexOf(c.no) > -1 ? "background:rgba(31,122,99,.06);border-color:#1F7A63" : "") },
            [c0, el("span", null, [
              el("b", { style: "font-weight:600" }, ["Cilt " + c.no + " "]),
              c.ad, rozet,
              el("span", { style: "display:block;color:var(--soluk,#888);font-size:11px;margin-top:2px" },
                [c.prefix + " • " + c.metrikler.length + " metrik • " + ciltTipEtiket(c.tip)])
            ])]);
          izgara.appendChild(etiket);
        });
        listeKap.appendChild(izgara);
      });
      if (!listeKap.children.length) {
        listeKap.appendChild(el("div", { class: "bos-durum" }, [
          el("div", null, ["\u201C" + UI.kacir(arama.value) + "\u201D ile eşleşen cilt bulunamadı."])]));
      }
    }
    arama.addEventListener("input", ciztListe);

    /* Hızlı seçim düğmeleri */
    var turevDugme = el("button", { class: "btn ikincil kucuk", type: "button", onclick: function () {
      tumCiltler.forEach(function (c) { if (c.tureks && secili.indexOf(c.no) < 0) secili.push(c.no); });
      Depo.ciltSec(secili); ciztListe(); ozetGuncelle(); UI.navGuncelle();
      UI.bildir("TUREKS ciltleri (3, 6, 8, 10) seçildi");
    } }, ["TUREKS varsayılanı (3-6-8-10)"]);
    var temizleDugme = el("button", { class: "btn ikincil kucuk", type: "button", onclick: function () {
      secili = []; Depo.ciltSec(secili); ciztListe(); ozetGuncelle(); UI.navGuncelle();
    } }, ["Seçimi temizle"]);

    ozetGuncelle();
    ciztListe();

    kok.appendChild(UI.kart("Sektör ve Cilt Seçimi (TSRS 2 Ek Ciltleri)", [
      el("p", { style: "margin:0 0 12px;font-size:12.5px;color:var(--soluk)" },
        ["Şirketiniz hangi sektör(ler)de faaliyet gösteriyorsa o ciltleri seçin. Bir şirket birden çok cilt kapsayabilir " +
         "(örn. hem madencilik hem inşaat malzemesi). Seçtiğiniz ciltlerin tüm metrikleri raporlanacak; " +
         "birden çok cilttte ortak istenen metrikler (enerji, su, Kapsam 1 gibi) tek kez hesaplanıp ilgili tüm ciltlere referansla gösterilir."]),
      ozet,
      el("div", { style: "display:flex;gap:8px;margin-bottom:4px;flex-wrap:wrap" }, [turevDugme, temizleDugme]),
      arama,
      listeKap
    ], { ref: "TSRS 2 md. 29 • Sektöre özgü metrikler" }));
  }

  /* Cilt tipi etiketi (hesap yükü göstergesi) */
  function ciltTipEtiket(tip) {
    return ({ agir: "hesap-ağır", orta: "hesap-orta", hafif: "hesap-hafif", finansal: "anlatı (hesap yok)" })[tip] || tip || "";
  }

  /* ============================================================
     SAYFA: SEKTÖR METRİKLERİ (Dinamik form motoru — Sprint 2)
     Seçili ciltlerin tüm metriklerini, tipine göre uygun arayüzle döker.
     - hesap: motor tarafından hesaplanması beklenen; şimdilik manuel + bilgi rozeti
     - veri : kullanıcı sayı/yüzde girer
     - ta   : anlatı metni ([VERİ BEKLENİYOR] — Y4)
     Her metrik kartında TSRS kodu + hangi cilt(ler)de istendiği gösterilir. ============================================================ */
  // Tek bir metrik için giriş satırı üretir (tipine göre)
  function metrikSatiri(m) {
    var na = Depo.naMetrikler().indexOf(m.kod) > -1;
    var v = Depo.metrikVeri(m.kod);

    // Cilt referans rozetleri (ortak metrikse birden çok)
    var ciltRozetleri = m.ciltler.map(function (c) {
      return el("span", { class: "rozet", style: "font-size:10px;margin-right:4px;" +
        (c.tureks ? "" : "") }, ["Cilt " + c.no]);
    });
    var ortakNot = m.ciltler.length > 1
      ? el("span", { style: "font-size:11px;color:#1F7A63;font-weight:600;margin-left:4px" },
          ["◈ ortak metrik — tek kez girin, " + m.ciltler.length + " cilde işlenir"])
      : null;

    // Tip rozeti
    var tipRozet = ({
      hesap: el("span", { class: "rozet", style: "background:#B4642D;color:#fff;font-size:10px" }, ["hesaplanan"]),
      veri:  el("span", { class: "rozet", style: "background:#5B6B7C;color:#fff;font-size:10px" }, ["veri girişi"]),
      ta:    el("span", { class: "rozet", style: "background:#8A7A5C;color:#fff;font-size:10px" }, ["anlatı"])
    })[m.tip];

    // Giriş alanı (tipe göre)
    var girisAlani;
    if (m.tip === "ta") {
      var ta = el("textarea", { rows: "3", value: v.metin || "",
        placeholder: "[VERİ BEKLENİYOR: " + m.kod + "] — müşteriden gelecek açıklama metni buraya" });
      ta.addEventListener("input", function () { Depo.metrikYaz(m.kod, "metin", ta.value); });
      ta.addEventListener("change", function () { UI.bildir("Kaydedildi"); UI.navGuncelle(); });
      girisAlani = el("div", { class: "alan genis" }, [ta]);
    } else {
      // hesap + veri: sayı + birim + (hesap ise yöntem/not)
      var sayi = el("input", { type: "number", step: "any", inputMode: "decimal", value: v.deger != null ? v.deger : "",
        placeholder: m.tip === "hesap" ? "Motor hesaplayacak / manuel girilebilir" : "Değer girin" });
      sayi.addEventListener("input", function () { Depo.metrikYaz(m.kod, "deger", sayi.value); });
      sayi.addEventListener("change", function () { UI.bildir("Kaydedildi"); UI.navGuncelle(); });

      var birim = el("input", { type: "text", value: v.birim || m.birim || "", placeholder: "birim",
        style: "max-width:120px" });
      birim.addEventListener("input", function () { Depo.metrikYaz(m.kod, "birim", birim.value); });

      var notG = el("input", { type: "text", value: v.not || "", placeholder: "Kaynak / hesap dayanağı / açıklama" });
      notG.addEventListener("input", function () { Depo.metrikYaz(m.kod, "not", notG.value); });

      girisAlani = el("div", { style: "display:grid;grid-template-columns:1fr 130px;gap:10px" }, [
        el("div", { class: "alan" }, [el("label", null, ["Değer"]), sayi]),
        el("div", { class: "alan" }, [el("label", null, ["Birim"]), birim]),
        el("div", { class: "alan genis", style: "grid-column:1/-1" }, [el("label", null, ["Not / Dayanak"]), notG])
      ]);
      if (m.tip === "hesap") {
        var oneri = (window.Motor && Motor.metrikOnerilenDeger) ? Motor.metrikOnerilenDeger(m) : null;
        if (oneri && oneri.deger != null) {
          var oneriKutu = el("div", { class: "bilgi yesil", style: "grid-column:1/-1;margin:0 0 4px;font-size:12px" }, [
            el("span", null, ["Motor hesabı: ", el("b", null, [Motor.fmt(oneri.deger, 2) + " " + oneri.birim]),
              oneri.kismi ? " (kısmi)" : "", " — " + oneri.kaynak]),
            el("button", { class: "btn kucuk birincil", type: "button", style: "margin-left:10px",
              onclick: function () {
                Depo.metrikYaz(m.kod, "deger", String(Math.round(oneri.deger * 1000) / 1000));
                Depo.metrikYaz(m.kod, "birim", oneri.birim);
                UI.ciz();
              } }, ["Motordan al"])
          ]);
          girisAlani.insertBefore(oneriKutu, girisAlani.firstChild);
        } else {
          girisAlani.insertBefore(
            el("div", { class: "bilgi", style: "grid-column:1/-1;margin:0 0 4px;font-size:11.5px" },
              ["Bu metrik ileride hesaplama motoruna bağlanacak (Sprint 5). Şimdilik elle girebilir veya boş bırakabilirsiniz."]),
            girisAlani.firstChild);
        }
      }
    }

    var durum = Depo.metrikDurum(m);
    var nokta = el("span", { class: "nokta " + (na ? "bos" : durum), style: "flex:none" });

    // N/A işaret kutusu
    var naKutu = el("input", { type: "checkbox", checked: na, style: "margin:0" });
    naKutu.addEventListener("change", function () {
      Depo.naMetrikDegistir(m.kod, naKutu.checked);
      UI.ciz();
    });
    var naEtiket = el("label", { style: "display:flex;gap:5px;align-items:center;font-size:11px;" +
      "font-weight:400;color:var(--soluk,#888);cursor:pointer;white-space:nowrap" },
      [naKutu, "Uygulanabilir değil (N/A)"]);

    var baslik = el("div", { style: "display:flex;align-items:flex-start;gap:9px;margin-bottom:9px" }, [
      nokta,
      el("div", { style: "flex:1" }, [
        el("div", { style: "font-weight:600;font-size:13.5px;margin-bottom:3px" }, [m.ad]),
        el("div", { style: "font-size:11.5px;color:var(--soluk,#888)" }, [
          el("b", { style: "color:var(--vurgu,#B4642D);font-weight:600" }, [m.kod]), " • ",
          tipRozet, " ", ortakNot
        ])
      ]),
      naEtiket
    ]);

    return el("div", { class: "kart", style: "padding:14px 16px;margin-bottom:10px;" +
      (na ? "opacity:.55" : "") }, [baslik, na ? el("div", { class: "bilgi", style: "margin:0;font-size:12px" },
        ["Bu metrik şirketiniz için uygulanabilir değil olarak işaretlendi; raporda ‘N/A’ olarak belirtilecek."]) : girisAlani]);
  }

  function cizSektorMetrikleri(kok) {
    var secili = Depo.seciliCiltler();
    if (!secili.length) {
      kok.appendChild(UI.kart("Henüz sektör seçilmedi", [
        el("p", { style: "margin:0 0 14px" }, [
          "Bu sayfa, Şirket Profili'nde seçtiğiniz TSRS 2 Ek Ciltlerinin metriklerini otomatik olarak listeler. " +
          "Önce sektör(ler)inizi seçmelisiniz."]),
        el("a", { class: "btn birincil", href: "#/profil" }, ["Şirket Profiline git →"])
      ]));
      return;
    }

    var am = Depo.aktifMetrikler();
    var ozet = Depo.metrikOzet();

    // Üst özet
    kok.appendChild(el("div", { class: "bilgi yesil" }, [
      el("b", null, [secili.length + " cilt seçili • " + ozet.toplam + " metrik"]),
      " (" + ozet.tam + " dolu, " + ozet.bos + " boş" + (ozet.na ? ", " + ozet.na + " N/A" : "") + ") — ",
      "hesaplanan: " + (ozet.hesap || 0) + ", veri girişi: " + (ozet.veri || 0) + ", anlatı: " + (ozet.ta || 0)
    ]));
    kok.appendChild(el("div", { class: "bilgi", style: "font-size:12px" }, [
      "Metrikler cilt cilt gruplandırılmıştır. Ø Ortak metrikler (enerji, su, Kapsam 1 gibi) yalnızca bir kez, " +
      "ilk istendikleri cilt altında görünür; girdiğiniz değer ilgili tüm ciltlere otomatik işlenir."
    ]));

    // Hangi ortak metrikler hangi cilt altında “ev sahibi” olarak gösterilecek?
    // aktifMetrikler() zaten ortakları tek satıra indirdi; her metriği İLK cildine yerleştirelim.
    var ilkCiltNo = {};
    am.forEach(function (m) { ilkCiltNo[m.kod] = m.ciltler[0].no; });

    secili.forEach(function (c) {
      // Bu cilde ait gösterilecek metrikler: aktif metrik listesinde ev sahibi bu cilt olanlar
      var ciltMetrikleri = am.filter(function (m) { return ilkCiltNo[m.kod] === c.no; });
      if (!ciltMetrikleri.length) return;

      var govde = el("div");
      // Tip sırası: önce hesaplanan, sonra veri, sonra anlatı
      var sira = { hesap: 0, veri: 1, ta: 2 };
      ciltMetrikleri.sort(function (a, b) { return (sira[a.tip] || 9) - (sira[b.tip] || 9); });
      ciltMetrikleri.forEach(function (m) { govde.appendChild(metrikSatiri(m)); });

      var rozet = c.tureks
        ? el("span", { class: "mini", style: "color:#1F7A63" }, [c.prefix + " • TUREKS"])
        : el("span", { class: "mini" }, [c.prefix]);
      kok.appendChild(UI.kart("Cilt " + c.no + " — " + c.ad, [govde], { sag: rozet }));
    });
  }

  /* ============================================================
     SAYFA: FAALİYET VERİSİ (Kapsam 1 ve 3)
     ============================================================ */
  var BOLGESIZ = { "Sabit Yanma": 1, "Proses Emisyonları": 1, "Satın Alınan Isı/Buhar": 1, "Diğer Kapsam 3": 1 };
  var MANUEL_EF_ZORUNLU = { "Proses Emisyonları": 1, "Satın Alınan Isı/Buhar": 1, "Diğer Kapsam 3": 1 };

  function faaliyetFormu(kayit, bittiginde) {
    var s = Object.assign({ bolge: "TR", veriKalite: "", manuelEF: "" }, kayit || {});
    var govde = el("div");
    var izgara = el("div", { class: "form-izgara" });
    var onizleme = el("div", { class: "bilgi", style: "margin:16px 0 0" });

    var aTesis = UI.alan({ anahtar: "tesis", etiket: "Tesis / Faaliyet Adı", tip: "metin", zorunlu: true, deger: s.tesis,
      yardim: "örn. Açık Ocak Jeneratörü, Konkasör Tesisi" });
    var aKategori = UI.alan({ anahtar: "kategori", etiket: "Emisyon Kategorisi", tip: "secim", liste: "faaliyet_kategorisi", zorunlu: true, deger: s.kategori });
    var aBolge = UI.alan({ anahtar: "bolge", etiket: "EF Bölgesi", tip: "secim", liste: "bolge", deger: s.bolge,
      yardim: "Emisyon faktörü tablosunun bölgesi" });
    var aKaynak = UI.alan({ anahtar: "kaynak", etiket: "Yakıt / Araç Tipi", tip: "secim", liste: [], zorunlu: true, genis: true });
    var aMiktar = UI.alan({ anahtar: "miktar", etiket: "Miktar", tip: "sayi", zorunlu: true, deger: s.miktar });
    var aBirim = UI.alan({ anahtar: "birim", etiket: "Birim", tip: "secim", liste: [], deger: s.birim });
    var aManuel = UI.alan({ anahtar: "manuelEF", etiket: "Manuel EF (kg CO2e/birim)", tip: "sayi", deger: s.manuelEF,
      yardim: "Doluysa tablo yerine bu değer kullanılır" });
    var aKalite = UI.alan({ anahtar: "veriKalite", etiket: "Veri Kalitesi", tip: "secim", liste: "veri_kalitesi", deger: s.veriKalite });
    var aDonem = UI.alan({ anahtar: "donem", etiket: "Dönem / Ay", tip: "metin", deger: s.donem, yardim: "örn. 2025 yılı tamamı, Ocak 2025" });
    var aNot = UI.alan({ anahtar: "aciklama", etiket: "Açıklama / Dayanak", tip: "metin", deger: s.aciklama, genis: true,
      yardim: "Fatura no, sayaç, hesaplama dayanağı" });

    function kaynakDoldur() {
      var kat = aKategori.girdi.value, bolge = BOLGESIZ[kat] ? null : aBolge.girdi.value;
      var secs = Motor.kaynakSecenekleri(kat, bolge);
      var onceki = aKaynak.girdi.value || s.kaynak;
      aKaynak.girdi.innerHTML = "";
      aKaynak.girdi.appendChild(el("option", { value: "" }, [secs.length ? "— Seçin —" : "(bu kategoride seçim gerekmez)"]));
      secs.forEach(function (o) { aKaynak.girdi.appendChild(el("option", { value: o.anahtar }, [o.etiket])); });
      if (onceki) aKaynak.girdi.value = onceki;
      aKaynak.style.display = (MANUEL_EF_ZORUNLU[kat]) ? "none" : "";
      aBolge.style.display = BOLGESIZ[kat] ? "none" : "";
    }
    function birimDoldur() {
      var kat = aKategori.girdi.value;
      var onceki = aBirim.girdi.value || s.birim;
      aBirim.girdi.innerHTML = "";
      Depo.birimler(kat).forEach(function (b) { aBirim.girdi.appendChild(el("option", { value: b }, [b])); });
      if (onceki) aBirim.girdi.value = onceki;
      if (!aBirim.girdi.value) aBirim.girdi.selectedIndex = 0;
    }
    function onizle() {
      var v = UI.degerler(izgara);
      var h = Motor.hesapFaaliyet(v);
      if (h.hata) {
        onizleme.className = "bilgi";
        onizleme.innerHTML = "<b>Hesap bekleniyor:</b> " + UI.kacir(h.hata);
      } else {
        var kapsam = Motor.kategoriKapsami(v.kategori);
        onizleme.className = "bilgi yesil";
        onizleme.innerHTML = "<b>" + Motor.fmt(h.tco2e, 3) + " tCO2e</b> — Kapsam " + kapsam +
          " &nbsp;•&nbsp; CO2: " + Motor.fmt(h.co2kg, 1) + " kg • CH4: " + Motor.fmt(h.ch4kg, 3) +
          " kg • N2O: " + Motor.fmt(h.n2okg, 3) + " kg<br><span style='font-size:11.5px'>" + UI.kacir(h.aciklama) + "</span>";
      }
    }
    aKategori.girdi.addEventListener("change", function () { kaynakDoldur(); birimDoldur(); onizle(); });
    aBolge.girdi.addEventListener("change", function () { kaynakDoldur(); onizle(); });
    [aKaynak, aMiktar, aBirim, aManuel].forEach(function (a) {
      a.girdi.addEventListener("change", onizle);
      a.girdi.addEventListener("input", onizle);
    });

    [aTesis, aKategori, aBolge, aKaynak, aMiktar, aBirim, aManuel, aKalite, aDonem, aNot]
      .forEach(function (a) { izgara.appendChild(a); });
    govde.appendChild(izgara); govde.appendChild(onizleme);
    kaynakDoldur(); birimDoldur(); onizle();

    UI.modal(kayit ? "Kaydı Düzenle — " + (kayit.no || "") : "Yeni Faaliyet Kaydı", govde, [
      { etiket: "Vazgeç" },
      { etiket: "Kaydet", sinif: "birincil", tik: function (kapat) {
        var v = UI.degerler(izgara);
        if (!v.kategori) { UI.bildir("Kategori seçin", true); return; }
        if (!v.miktar) { UI.bildir("Miktar girin", true); return; }
        bittiginde(v); kapat();
      } }
    ]);
  }

  function cizFaaliyet(kok) {
    var liste = Depo.veri.faaliyet;
    function yenile() { UI.ciz(); }

    UI.ustAksiyon(el("button", { class: "btn birincil", type: "button", onclick: function () {
      faaliyetFormu(null, function (v) {
        v.no = Depo.yeniNo("F");
        liste.push(v); Depo.kaydet(); yenile();
      });
    } }, ["+ Yeni Kayıt"]));

    kok.appendChild(el("div", { class: "bilgi" },
      ["Kapsam 1 (sabit/mobil yanma, proses) ve Kapsam 3 (taşıma, seyahat, ulaşım) faaliyetleri tek listede tutulur; kapsam, kategoriden otomatik belirlenir. CO2e değeri kayıt sırasında canlı hesaplanır."]));

    var T = Motor.toplamlar();
    kok.appendChild(UI.kart("Faaliyet Kayıtları", [
      UI.veriTablo({
        satirlar: liste,
        bosMesaj: "Henüz faaliyet kaydı yok. Sağ üstteki \u201C+ Yeni Kayıt\u201D düğmesiyle başlayın.",
        sutunlar: [
          { etiket: "No", deger: function (s) { return s.no; } },
          { etiket: "Tesis / Faaliyet", deger: function (s) { return UI.kisalt(s.tesis, 34); } },
          { etiket: "Kategori", deger: function (s) { return s.kategori; } },
          { etiket: "Kaynak", deger: function (s) { return UI.kisalt(MANUEL_EF_ZORUNLU[s.kategori] ? "Manuel EF" : s.kaynak, 40); } },
          { etiket: "Miktar", sinif: "sayi", deger: function (s) { return Motor.fmt(parseFloat(s.miktar), 2) + " " + (s.birim || ""); } },
          { etiket: "Kapsam", deger: function (s) {
            var k = Motor.kategoriKapsami(s.kategori);
            return el("span", { class: "rozet k" + k }, ["K" + k]);
          } },
          { etiket: "CO2 (kg)", sinif: "sayi", deger: function (s) {
            var h = Motor.hesapFaaliyet(s);
            return h.hata ? "—" : Motor.fmt(h.co2kg, 2);
          } },
          { etiket: "CH4 (kg)", sinif: "sayi", deger: function (s) {
            var h = Motor.hesapFaaliyet(s);
            return h.hata ? "—" : Motor.fmt(h.ch4kg, 4);
          } },
          { etiket: "N2O (kg)", sinif: "sayi", deger: function (s) {
            var h = Motor.hesapFaaliyet(s);
            return h.hata ? "—" : Motor.fmt(h.n2okg, 4);
          } },
          { etiket: "tCO2e", sinif: "sayi", deger: function (s) {
            var h = Motor.hesapFaaliyet(s);
            return h.hata ? el("span", { class: "rozet uyari", title: h.hata }, ["!"]) : el("b", null, [Motor.fmt(h.tco2e, 3)]);
          } }
        ],
        islemler: [
          { etiket: "Düzenle", tik: function (s, i) {
            faaliyetFormu(s, function (v) { v.no = s.no; liste[i] = v; Depo.kaydet(); yenile(); });
          } },
          { etiket: "Kopyala", tik: function (s) {
            var k = Object.assign({}, s, { no: Depo.yeniNo("F") });
            liste.push(k); Depo.kaydet(); yenile();
          } },
          { etiket: "Sil", sinif: "tehlike", tik: function (s, i) {
            UI.onayla("\u201C" + (s.no || "") + " — " + (s.tesis || "") + "\u201D kaydı silinsin mi?", function () {
              liste.splice(i, 1); Depo.kaydet(); yenile();
            });
          } }
        ]
      })
    ], { mini: liste.length + " kayıt • K1: " + Motor.fmt(T.k1.sabit + T.k1.mobil + T.k1.proses, 2) + " t • K3: " + Motor.fmt(T.k3.toplam, 2) + " t" }));
  }

  /* ============================================================
     SAYFA: SOĞUTUCU AKIŞKAN VE KAÇAK GAZLAR
     ============================================================ */
  function sogutucuFormu(kayit, bittiginde) {
    var s = Object.assign({ yontem: "Kütle Dengesi" }, kayit || {});
    var izgara = el("div", { class: "form-izgara" });
    var onizleme = el("div", { class: "bilgi", style: "margin:16px 0 0" });

    var gazlar = Depo.set("kip_ar6").map(function (r) { return r.Gas_Name; }).filter(Boolean);
    var aAd = UI.alan({ anahtar: "ekipman", etiket: "Ekipman / Sistem Adı", tip: "metin", zorunlu: true, deger: s.ekipman,
      yardim: "örn. İdari Bina Chiller, Servis Aracı Kliması" });
    var aGaz = UI.alan({ anahtar: "gaz", etiket: "Gaz (KIP tablosundan)", tip: "metin", zorunlu: true, deger: s.gaz,
      datalist: gazlar, yardim: "Yazmaya başlayın: örn. HFC-134a, R-410A" });
    var aYontem = UI.alan({ anahtar: "yontem", etiket: "Hesap Yöntemi", tip: "secim", liste: "kacak_yontemi", zorunlu: true, deger: s.yontem });
    /* Kütle dengesi alanları */
    var aBas = UI.alan({ anahtar: "baslangic", etiket: "Dönem Başı Stok + Şarj (kg)", tip: "sayi", deger: s.baslangic });
    var aYeni = UI.alan({ anahtar: "yeniSarj", etiket: "Dönem İçi Yeni Şarj (kg)", tip: "sayi", deger: s.yeniSarj });
    var aCik = UI.alan({ anahtar: "cikarilan", etiket: "Geri Kazanılan / Çıkarılan (kg)", tip: "sayi", deger: s.cikarilan });
    var aSon = UI.alan({ anahtar: "sonSarj", etiket: "Dönem Sonu Stok + Şarj (kg)", tip: "sayi", deger: s.sonSarj });
    /* Tarama alanları */
    var aTur = UI.alan({ anahtar: "ekipmanTuru", etiket: "Ekipman Türü", tip: "secim", liste: "ekipman_turu", deger: s.ekipmanTuru,
      yardim: "Varsayılan kaçak oranı tablodan alınır" });
    var aKap = UI.alan({ anahtar: "kapasite", etiket: "Toplam Gaz Kapasitesi (kg)", tip: "sayi", deger: s.kapasite });
    var aOran = UI.alan({ anahtar: "kacakOrani", etiket: "Kaçak Oranı (örn. 0,10)", tip: "sayi", deger: s.kacakOrani,
      yardim: "Boş bırakılırsa varsayılan kullanılır" });
    var aNot = UI.alan({ anahtar: "aciklama", etiket: "Açıklama", tip: "metin", deger: s.aciklama, genis: true });

    function yontemGoster() {
      var kd = aYontem.girdi.value !== "Tarama (Basit)";
      [aBas, aYeni, aCik, aSon].forEach(function (a) { a.style.display = kd ? "" : "none"; });
      [aTur, aKap, aOran].forEach(function (a) { a.style.display = kd ? "none" : ""; });
    }
    function onizle() {
      var v = UI.degerler(izgara);
      var h = Motor.hesapSogutucu(v);
      if (h.hata) { onizleme.className = "bilgi"; onizleme.innerHTML = "<b>Hesap bekleniyor:</b> " + UI.kacir(h.hata); }
      else {
        onizleme.className = "bilgi yesil";
        onizleme.innerHTML = "<b>" + Motor.fmt(h.tco2e, 3) + " tCO2e</b> &nbsp;•&nbsp; Kaçak: " +
          Motor.fmt(h.kacakKg, 3) + " kg × KIP " + Motor.fmt(h.gwp, 0);
      }
    }
    aYontem.girdi.addEventListener("change", function () { yontemGoster(); onizle(); });
    [aGaz, aBas, aYeni, aCik, aSon, aTur, aKap, aOran].forEach(function (a) {
      a.girdi.addEventListener("input", onizle); a.girdi.addEventListener("change", onizle);
    });
    [aAd, aGaz, aYontem, aBas, aYeni, aCik, aSon, aTur, aKap, aOran, aNot].forEach(function (a) { izgara.appendChild(a); });
    var govde = el("div", null, [izgara, onizleme]);
    yontemGoster(); onizle();

    UI.modal(kayit ? "Kaydı Düzenle — " + (kayit.no || "") : "Yeni Soğutucu / Kaçak Kaydı", govde, [
      { etiket: "Vazgeç" },
      { etiket: "Kaydet", sinif: "birincil", tik: function (kapat) {
        var v = UI.degerler(izgara);
        if (!v.gaz) { UI.bildir("Gaz seçin", true); return; }
        bittiginde(v); kapat();
      } }
    ]);
  }

  function cizSogutucu(kok) {
    var liste = Depo.veri.sogutucu;
    UI.ustAksiyon(el("button", { class: "btn birincil", type: "button", onclick: function () {
      sogutucuFormu(null, function (v) { v.no = Depo.yeniNo("S"); liste.push(v); Depo.kaydet(); UI.ciz(); });
    } }, ["+ Yeni Kayıt"]));

    kok.appendChild(el("div", { class: "bilgi" },
      ["Klima, soğutma ve yangın söndürme sistemlerindeki florlu gaz (HFC, PFC, SF6 vb.) kaçakları Kapsam 1'e dahildir. Kütle Dengesi yöntemi servis kayıtlarına, Tarama yöntemi ekipman kapasitesi × varsayılan kaçak oranına dayanır."]));

    kok.appendChild(UI.kart("Soğutucu / Kaçak Gaz Kayıtları", [
      UI.veriTablo({
        satirlar: liste,
        bosMesaj: "Henüz kayıt yok. Florlu gaz içeren ekipmanlarınızı ekleyin.",
        sutunlar: [
          { etiket: "No", deger: function (s) { return s.no; } },
          { etiket: "Ekipman", deger: function (s) { return UI.kisalt(s.ekipman, 32); } },
          { etiket: "Gaz", deger: function (s) { return s.gaz; } },
          { etiket: "Yöntem", deger: function (s) { return s.yontem; } },
          { etiket: "Kaçak (kg)", sinif: "sayi", deger: function (s) {
            var h = Motor.hesapSogutucu(s); return h.hata ? "—" : Motor.fmt(h.kacakKg, 3);
          } },
          { etiket: "KIP", sinif: "sayi", deger: function (s) {
            var h = Motor.hesapSogutucu(s); return h.gwp == null ? "—" : Motor.fmt(h.gwp, 0);
          } },
          { etiket: "tCO2e", sinif: "sayi", deger: function (s) {
            var h = Motor.hesapSogutucu(s);
            return h.hata ? el("span", { class: "rozet uyari", title: h.hata }, ["!"]) : el("b", null, [Motor.fmt(h.tco2e, 3)]);
          } }
        ],
        islemler: [
          { etiket: "Düzenle", tik: function (s, i) {
            sogutucuFormu(s, function (v) { v.no = s.no; liste[i] = v; Depo.kaydet(); UI.ciz(); });
          } },
          { etiket: "Sil", sinif: "tehlike", tik: function (s, i) {
            UI.onayla("\u201C" + (s.no || "") + " — " + (s.ekipman || "") + "\u201D silinsin mi?", function () {
              liste.splice(i, 1); Depo.kaydet(); UI.ciz();
            });
          } }
        ]
      })
    ], { kapsam: "k1", mini: liste.length + " kayıt" }));
  }

  /* ============================================================
     SAYFA: KAPSAM 2 — ELEKTRİK
     ============================================================ */
  function elektrikFormu(kayit, bittiginde) {
    var s = Object.assign({ sebeke: "Türkiye Ulusal Şebeke (Dağıtım)" }, kayit || {});
    var izgara = el("div", { class: "form-izgara" });
    var onizleme = el("div", { class: "bilgi", style: "margin:16px 0 0" });

    var aAd = UI.alan({ anahtar: "tesis", etiket: "Tesis / Sayaç Adı", tip: "metin", zorunlu: true, deger: s.tesis });
    var aSeb = UI.alan({ anahtar: "sebeke", etiket: "Şebeke (Lokasyona Dayalı EF)", tip: "secim",
      liste: Motor.elektrikSebekeleri(), zorunlu: true, deger: s.sebeke, genis: true });
    var aKwh = UI.alan({ anahtar: "kwh", etiket: "Yıllık Tüketim (kWh)", tip: "sayi", zorunlu: true, deger: s.kwh });
    var aSoz = UI.alan({ anahtar: "sozlesme", etiket: "Sözleşme Türü", tip: "secim", liste: "sozlesme_turu", deger: s.sozlesme });
    var aRec = UI.alan({ anahtar: "recKwh", etiket: "REC / Yeşil Sertifikalı kWh", tip: "sayi", deger: s.recKwh,
      yardim: "Piyasaya dayalı hesapta 0 EF uygulanır" });
    var aTed = UI.alan({ anahtar: "tedarikciEF", etiket: "Tedarikçi EF (kg CO2e/kWh)", tip: "sayi", deger: s.tedarikciEF,
      yardim: "Boşsa şebeke EF kullanılır" });
    var aDonem = UI.alan({ anahtar: "donem", etiket: "Dönem", tip: "metin", deger: s.donem });
    var aNot = UI.alan({ anahtar: "aciklama", etiket: "Açıklama / Fatura Ref.", tip: "metin", deger: s.aciklama, genis: true });

    function onizle() {
      var v = UI.degerler(izgara);
      var h = Motor.hesapElektrik(v);
      if (h.hata) { onizleme.className = "bilgi"; onizleme.innerHTML = "<b>Hesap bekleniyor:</b> " + UI.kacir(h.hata); }
      else {
        onizleme.className = "bilgi yesil";
        onizleme.innerHTML = "Lokasyona Dayalı: <b>" + Motor.fmt(h.ld, 3) + " tCO2e</b> &nbsp;•&nbsp; " +
          "Piyasaya Dayalı: <b>" + Motor.fmt(h.pd, 3) + " tCO2e</b><br><span style='font-size:11.5px'>Şebeke EF: " +
          Motor.fmt(h.sebekeEF, 4) + " kg CO2e/kWh</span>";
      }
    }
    izgara.addEventListener("input", onizle);
    izgara.addEventListener("change", onizle);
    [aAd, aSeb, aKwh, aSoz, aRec, aTed, aDonem, aNot].forEach(function (a) { izgara.appendChild(a); });
    var govde = el("div", null, [izgara, onizleme]);
    onizle();

    UI.modal(kayit ? "Kaydı Düzenle — " + (kayit.no || "") : "Yeni Elektrik Kaydı", govde, [
      { etiket: "Vazgeç" },
      { etiket: "Kaydet", sinif: "birincil", tik: function (kapat) {
        var v = UI.degerler(izgara);
        if (!v.kwh) { UI.bildir("Tüketim (kWh) girin", true); return; }
        bittiginde(v); kapat();
      } }
    ]);
  }

  function cizElektrik(kok) {
    var liste = Depo.veri.elektrik;
    UI.ustAksiyon(el("button", { class: "btn birincil", type: "button", onclick: function () {
      elektrikFormu(null, function (v) { v.no = Depo.yeniNo("E"); liste.push(v); Depo.kaydet(); UI.ciz(); });
    } }, ["+ Yeni Kayıt"]));

    kok.appendChild(el("div", { class: "bilgi" },
      ["TSRS 2 md. 29(a)(ii) uyarınca Kapsam 2 hem Lokasyona Dayalı (şebeke ortalama EF) hem Piyasaya Dayalı (sözleşmeye özgü EF; REC'li tüketim sıfır) yaklaşımla raporlanır. İki sütun da otomatik hesaplanır."]));

    kok.appendChild(UI.kart("Elektrik Tüketim Kayıtları", [
      UI.veriTablo({
        satirlar: liste,
        bosMesaj: "Henüz kayıt yok. Tesis veya sayaç bazında elektrik tüketimlerini ekleyin.",
        sutunlar: [
          { etiket: "No", deger: function (s) { return s.no; } },
          { etiket: "Tesis / Sayaç", deger: function (s) { return UI.kisalt(s.tesis, 30); } },
          { etiket: "Şebeke", deger: function (s) { return UI.kisalt(s.sebeke, 34); } },
          { etiket: "kWh", sinif: "sayi", deger: function (s) { return Motor.fmt(parseFloat(s.kwh), 0); } },
          { etiket: "REC kWh", sinif: "sayi", deger: function (s) { return s.recKwh ? Motor.fmt(parseFloat(s.recKwh), 0) : "—"; } },
          { etiket: "LD tCO2e", sinif: "sayi", deger: function (s) {
            var h = Motor.hesapElektrik(s); return h.hata ? el("span", { class: "rozet uyari", title: h.hata }, ["!"]) : Motor.fmt(h.ld, 3);
          } },
          { etiket: "PD tCO2e", sinif: "sayi", deger: function (s) {
            var h = Motor.hesapElektrik(s); return h.hata ? "—" : el("b", null, [Motor.fmt(h.pd, 3)]);
          } }
        ],
        islemler: [
          { etiket: "Düzenle", tik: function (s, i) {
            elektrikFormu(s, function (v) { v.no = s.no; liste[i] = v; Depo.kaydet(); UI.ciz(); });
          } },
          { etiket: "Sil", sinif: "tehlike", tik: function (s, i) {
            UI.onayla("\u201C" + (s.no || "") + " — " + (s.tesis || "") + "\u201D silinsin mi?", function () {
              liste.splice(i, 1); Depo.kaydet(); UI.ciz();
            });
          } }
        ]
      })
    ], { kapsam: "k2", mini: liste.length + " kayıt" }));
  }

  /* ============================================================
     SAYFA: TSRS MODÜLLERİ (form tanımlarından otomatik üretilir)
     ============================================================ */
  var TURETILMIS = {
    risk_firsat: [{ etiket: "Skor", hesap: function (s) {
      var sk = (parseFloat(s.olasilik) || 0) * (parseFloat(s.etki) || 0);
      if (!sk) return "—";
      var sinif = sk >= 15 ? "uyari" : (sk >= 8 ? "kismi" : "bos");
      return el("span", { class: "rozet " + sinif }, [String(sk)]);
    } }],
    onemlilik: [{ etiket: "Skor", hesap: function (s) {
      var sk = (parseFloat(s.olasilik) || 0) * (parseFloat(s.etki) || 0);
      return sk ? String(sk) : "—";
    } }],
    hedefler: [{ etiket: "İlerleme", hesap: function (s) {
      var b = parseFloat(s.baz_deger), h = parseFloat(s.hedef_deger), m = parseFloat(s.mevcut);
      if (!isFinite(b) || !isFinite(h) || !isFinite(m) || b === h) return "—";
      var p = Math.max(0, Math.min(150, (b - m) / (b - h) * 100));
      return el("div", { style: "min-width:110px" }, [
        el("div", { class: "ilerleme-ray" }, [el("div", { class: "ilerleme-dolgu", style: "width:" + Math.min(100, p) + "%" })]),
        el("div", { style: "font-size:11px;margin-top:2px" }, [Motor.fmt(p, 1) + "%"])
      ]);
    } }],
    karsilastirma: [
      { etiket: "Fark", hesap: function (s) {
        var o = parseFloat(s.orijinal), r = parseFloat(s.revize);
        return (isFinite(o) && isFinite(r)) ? Motor.fmt(r - o, 2) : "—";
      } },
      { etiket: "%", hesap: function (s) {
        var o = parseFloat(s.orijinal), r = parseFloat(s.revize);
        return (isFinite(o) && isFinite(r) && o !== 0) ? Motor.fmt((r - o) / o * 100, 1) + "%" : "—";
      } }
    ]
  };

  function modulKayitFormu(m, kayit, bittiginde) {
    var izgara = el("div", { class: "form-izgara" });
    m.tablo.sutunlar.forEach(function (su) {
      izgara.appendChild(UI.alan({
        anahtar: su.anahtar, etiket: su.etiket, tip: su.tip, liste: su.liste, yardim: su.yardim,
        deger: kayit ? kayit[su.anahtar] : ""
      }));
    });
    UI.modal((kayit ? "Kaydı Düzenle" : "Yeni Kayıt") + " — " + m.tablo.etiket, izgara, [
      { etiket: "Vazgeç" },
      { etiket: "Kaydet", sinif: "birincil", tik: function (kapat) {
        bittiginde(UI.degerler(izgara)); kapat();
      } }
    ]);
  }

  function cizModul(kok, id) {
    var m = null;
    Depo.modulTanimlari().forEach(function (x) { if (x.id === id) m = x; });
    if (!m) { kok.appendChild(el("p", null, ["Modül bulunamadı."])); return; }
    var mv = Depo.modulVeri(id);

    kok.appendChild(el("div", { class: "bilgi" }, [m.aciklama || ""]));

    /* Kayıt tablosu */
    if (m.tablo && m.tablo.sutunlar && m.tablo.sutunlar.length) {
      var sutunlar = m.tablo.sutunlar.slice(0, 6).map(function (su) {
        return { etiket: su.etiket, sinif: su.tip === "sayi" ? "sayi" : "",
          deger: function (s) {
            var d = s[su.anahtar];
            return d === "" || d == null ? "—" : (su.tip === "uzun_metin" ? UI.kisalt(d, 56) : UI.kisalt(d, 36));
          } };
      });
      (TURETILMIS[id] || []).forEach(function (t) {
        sutunlar.push({ etiket: t.etiket + " ⚙", sinif: "sayi", deger: t.hesap });
      });
      var ekleDugme = el("button", { class: "btn birincil kucuk", type: "button", onclick: function () {
        modulKayitFormu(m, null, function (v) { mv.kayitlar.push(v); Depo.kaydet(); UI.ciz(); });
      } }, ["+ Kayıt Ekle"]);
      kok.appendChild(UI.kart(m.tablo.etiket, [
        UI.veriTablo({
          satirlar: mv.kayitlar,
          bosMesaj: "Henüz kayıt yok.",
          sutunlar: sutunlar,
          islemler: [
            { etiket: "Düzenle", tik: function (s, i) {
              modulKayitFormu(m, s, function (v) { mv.kayitlar[i] = v; Depo.kaydet(); UI.ciz(); });
            } },
            { etiket: "Sil", sinif: "tehlike", tik: function (s, i) {
              UI.onayla("Bu kayıt silinsin mi?", function () { mv.kayitlar.splice(i, 1); Depo.kaydet(); UI.ciz(); });
            } }
          ]
        })
      ], { sag: ekleDugme }));
    }

    /* Anlatı (serbest metin) alanları */
    if (m.anlatilar && m.anlatilar.length) {
      // Tek bir anlatı alanı için textarea + etiket üreten yardımcı
      var anlatAlani = function (a) {
        var t = el("textarea", { value: mv.anlatilar[a.anahtar] || "", rows: "4" });
        t.addEventListener("input", function () {
          mv.anlatilar[a.anahtar] = t.value; Depo.kaydet(true);
        });
        t.addEventListener("change", function () { UI.bildir("Kaydedildi"); UI.navGuncelle(); });
        return el("div", { class: "alan" }, [
          el("label", null, [a.etiket, a.yardim ? UI.yardimIkon(a.yardim) : null]),
          t
        ]);
      };

      if (m.gruplar && m.gruplar.length) {
        /* Gruplu modül (örn. Yönetişim → Sürdürülebilirlik + İklim alt başlıkları).
           Her grup ayrı bir kartta, kendi TSRS referansıyla gösterilir. */
        kok.appendChild(el("div", { class: "bilgi", style: "font-size:12px" }, [
          "Bu bölüm iki kapsamda ayrı doldurulur: " +
          m.gruplar.map(function (g) { return g.baslik; }).join(" ve ") +
          ". Her kapsam kendi standardına (TSRS 1 / TSRS 2) göre ayrı açıklanır."
        ]));
        m.gruplar.forEach(function (g) {
          var grupAnlatlari = m.anlatilar.filter(function (a) { return a.grup === g.id; });
          if (!grupAnlatlari.length) return;
          var galanlar = el("div", { style: "display:grid;gap:16px" });
          grupAnlatlari.forEach(function (a) { galanlar.appendChild(anlatAlani(a)); });
          kok.appendChild(UI.kart(g.baslik, [
            el("p", { style: "margin:0 0 14px;font-size:12.5px;color:var(--soluk)" },
              ["Bu metinler raporun ilgili bölümünde aynen yer alır. Yazdıkça otomatik kaydedilir."]),
            galanlar
          ], { mini: g.referans }));
        });
        /* Gruba atanmamış anlatılar varsa (geriye uyumluluk) düz listede göster */
        var grupsuz = m.anlatilar.filter(function (a) { return !a.grup; });
        if (grupsuz.length) {
          var ekAlanlar = el("div", { style: "display:grid;gap:16px" });
          grupsuz.forEach(function (a) { ekAlanlar.appendChild(anlatAlani(a)); });
          kok.appendChild(UI.kart("Diğer Açıklama Metinleri", [ekAlanlar], { mini: m.referans }));
        }
      } else {
        /* Grupsuz (standart) modül — düz liste */
        var alanlar = el("div", { style: "display:grid;gap:16px" });
        m.anlatilar.forEach(function (a) { alanlar.appendChild(anlatAlani(a)); });
        kok.appendChild(UI.kart("Açıklama Metinleri", [
          el("p", { style: "margin:0 0 14px;font-size:12.5px;color:var(--soluk)" },
            ["Bu metinler raporun ilgili bölümünde aynen yer alır. Yazdıkça otomatik kaydedilir."]),
          alanlar
        ], { mini: m.referans }));
      }
    }
  }

  return UI;
})();
