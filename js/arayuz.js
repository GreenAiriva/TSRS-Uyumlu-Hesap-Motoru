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
      el("label", { for: lid }, [t.etiket, t.zorunlu ? el("span", { class: "zorunlu" }, ["*"]) : null]),
      girdi,
      girdi.parentListe || null,
      t.yardim ? el("span", { class: "yardim" }, [t.yardim]) : null
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
      { grup: "Veri Girişi" },
      { yol: "profil",   ad: "Şirket Profili",            ikon: "▣", ciz: cizProfil, durum: "profil", ref: "TSRS 1 md. 20, 27, 60-69" },
      { yol: "faaliyet", ad: "Faaliyet Verisi (K1 ve K3)", ikon: "▲", ciz: cizFaaliyet, durum: "faaliyet", ref: "Kapsam 1 ve 3 — GHG Protokolü Böl. 4 ve 15" },
      { yol: "sogutucu", ad: "Soğutucu / Kaçak Gazlar",   ikon: "❄", ciz: cizSogutucu, durum: "sogutucu", ref: "Kapsam 1 — IPCC 2006 Cilt 3 Böl. 7" },
      { yol: "elektrik", ad: "Kapsam 2 — Elektrik",       ikon: "⚡", ciz: cizElektrik, durum: "elektrik", ref: "TSRS 2 md. 29(a)(ii)-(iii) — ikili raporlama" },
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

  /* Kart yardımcıları */
  UI.kart = function (baslik, ic, opts) {
    opts = opts || {};
    return el("section", { class: "kart" + (opts.kapsam ? " kapsam-serit " + opts.kapsam : "") }, [
      baslik ? el("div", { class: "kart-baslik" }, [
        el("h3", null, [baslik]),
        opts.sag || (opts.mini ? el("span", { class: "mini" }, [opts.mini]) : null)
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
        anahtar: su.anahtar, etiket: su.etiket, tip: su.tip, liste: su.liste,
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
      var alanlar = el("div", { style: "display:grid;gap:16px" });
      m.anlatilar.forEach(function (a) {
        var t = el("textarea", { value: mv.anlatilar[a.anahtar] || "", rows: "4" });
        t.addEventListener("input", function () {
          mv.anlatilar[a.anahtar] = t.value; Depo.kaydet(true);
        });
        t.addEventListener("change", function () { UI.bildir("Kaydedildi"); UI.navGuncelle(); });
        alanlar.appendChild(el("div", { class: "alan" }, [
          el("label", null, [a.etiket]),
          t,
          a.yardim ? el("span", { class: "yardim" }, [a.yardim]) : null
        ]));
      });
      kok.appendChild(UI.kart("Açıklama Metinleri", [
        el("p", { style: "margin:0 0 14px;font-size:12.5px;color:var(--soluk)" },
          ["Bu metinler raporun ilgili bölümünde aynen yer alır. Yazdıkça otomatik kaydedilir."]),
        alanlar
      ], { mini: m.referans }));
    }
  }

  return UI;
})();
