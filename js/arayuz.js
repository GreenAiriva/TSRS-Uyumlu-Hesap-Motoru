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
    if (!kap) {
      // aria-live: ekran okuyucular geçici bildirimleri de duysun
      kap = el("div", { class: "bildirim", role: "status", "aria-live": "polite" });
      document.body.appendChild(kap);
    }
    var n = el("div", { class: "not" + (hata ? " hata" : "") }, [mesaj]);
    kap.appendChild(n);
    setTimeout(function () { n.style.opacity = "0"; n.style.transition = "opacity .3s"; }, 2200);
    setTimeout(function () { if (n.parentNode) n.parentNode.removeChild(n); }, 2600);
  };

  /* ================= Kalıcı uyarı şeridi (banner) =================
     Toast'ın aksine kullanıcı kapatana ya da sorun çözülene dek ekranda kalır.
     Kayıt hatası / eşzamanlılık çakışması gibi KRİTİK durumlar için. */
  UI.banner = function (id, mesaj, dugmeler) {
    var kap = document.querySelector(".banner-kap");
    if (!kap) { kap = el("div", { class: "banner-kap", role: "alert" }); document.body.appendChild(kap); }
    UI.bannerKapat(id);
    kap.appendChild(el("div", { class: "banner", "data-banner": id }, [
      el("span", { class: "banner-metin" }, [mesaj]),
      el("span", { class: "banner-dugmeler" },
        (dugmeler || []).map(function (dg) {
          return el("button", { class: "btn kucuk", type: "button",
            onclick: function () { dg.tik(); } }, [dg.etiket]);
        }).concat([el("button", { class: "btn kucuk ikincil", type: "button", "aria-label": "Uyarıyı kapat",
          onclick: function () { UI.bannerKapat(id); } }, ["×"])]))
    ]));
  };
  UI.bannerKapat = function (id) {
    var b = document.querySelector('.banner[data-banner="' + id + '"]');
    if (b && b.parentNode) b.parentNode.removeChild(b);
  };

  /* Eşzamanlılık çakışması: yalnız GERÇEKTEN aynı alanda çakışan değişiklikler
     için sorulur (depo.js önce üç yollu birleştirmeyi dener). İki seçenek de
     birleşik sonucu yazar; çakışmayan hiçbir veri hiçbir seçenekte kaybolmaz. */
  UI.kayitCakismasi = function (cakismalar) {
    UI.kayitDurumu("hata");
    var mesaj;
    if (cakismalar && cakismalar.length) {
      var adlar = cakismalar.slice(0, 4).map(function (c) { return c.etiket || ""; }).join("  |  ");
      if (cakismalar.length > 4) adlar += "  (+" + (cakismalar.length - 4) + " daha)";
      mesaj = "Başka bir kullanıcıyla AYNI alanda farklı değişiklik yapıldı: " + adlar +
              " — Seçiminiz yalnız bu alanlara uygulanır; diğer tüm değişiklikler (sizin ve onun) korunur.";
    } else {
      mesaj = "Eşzamanlı kayıt yoğunluğu algılandı. Aşağıdaki seçeneklerden biriyle devam edin; çakışmayan değişiklikler korunur.";
    }
    UI.banner("kayit-cakisma", mesaj, [
      { etiket: "Benim değerlerim kalsın", tik: function () {
          Depo.cakismaCoz("yerel").then(function (h) {
            if (h) { UI.bildir(h, true); return; }
            UI.bannerKapat("kayit-cakisma");
            UI.bildir("Birleştirildi — çakışan alanlarda sizin değerleriniz");
            UI.ciz();
            if (window.App && App.kenarAltligiEkle) App.kenarAltligiEkle();
          });
        } },
      { etiket: "Diğer kullanıcınınki kalsın", tik: function () {
          Depo.cakismaCoz("uzak").then(function (h) {
            if (h) { UI.bildir(h, true); return; }
            UI.bannerKapat("kayit-cakisma");
            UI.bildir("Birleştirildi — çakışan alanlarda diğer kullanıcının değerleri");
            UI.ciz();
            if (window.App && App.kenarAltligiEkle) App.kenarAltligiEkle();
          });
        } }
    ]);
  };

  /* Üst bardaki gerçek kayıt durumu rozeti (iyimser "Kaydedildi" yerine) */
  var kayitRozet = null;
  UI.kayitDurumu = function (durum) {
    if (!kayitRozet) return;
    var m = { kaydediliyor: ["Kaydediliyor…", "bekliyor"],
              kaydedildi:   ["✓ Buluta kaydedildi", "tamam"],
              hata:         ["! Kayıt sorunu", "hata"] }[durum];
    if (!m) return;
    kayitRozet.className = "kayit-rozet " + m[1];
    kayitRozet.textContent = m[0];
  };

  /* ================= Modal pencere =================
     - Formda değişiklik varken dış tıklama / Esc / × onay ister (veri kaybı önlenir)
     - Enter (metin girdisinde) birincil düğmeyi tetikler → klavyeyle seri giriş
     - Odak modal içinde tutulur (focus trap) ve kapanınca eski öğeye iade edilir
     - Esc yalnız EN ÜSTTEKİ modalı kapatır (iç içe modallarda katman katman) */
  UI.modal = function (baslik, govde, dugmeler, genislik) {
    var fon = el("div", { class: "modal-fon" });
    var oncekiOdak = document.activeElement;
    var kirli = false;
    function kapat() {
      if (fon.parentNode) fon.parentNode.removeChild(fon);
      document.removeEventListener("keydown", tuslar);
      if (oncekiOdak && oncekiOdak.focus) { try { oncekiOdak.focus(); } catch (e) {} }
    }
    function kapatmayiDene() {
      if (!kirli) { kapat(); return; }
      UI.onayla("Formdaki girdiler kaydedilmedi ve kapatınca kaybolacak. Yine de kapatılsın mı?", kapat);
    }
    function ustModalMi() {
      var fonlar = document.querySelectorAll(".modal-fon");
      return fonlar.length && fonlar[fonlar.length - 1] === fon;
    }
    function tuslar(e) {
      if (!ustModalMi()) return;
      if (e.key === "Escape") { e.stopPropagation(); kapatmayiDene(); return; }
      if (e.key === "Enter" && e.target && e.target.tagName === "INPUT") {
        var birincil = kutu.querySelector(".m-alt .btn.birincil");
        if (birincil) { e.preventDefault(); birincil.click(); }
        return;
      }
      if (e.key === "Tab") {   // odak tuzağı: modal içinde döngü
        var odaklanabilir = kutu.querySelectorAll(
          "button, input, select, textarea, a[href], [tabindex]:not([tabindex='-1'])");
        if (!odaklanabilir.length) return;
        var ilkO = odaklanabilir[0], sonO = odaklanabilir[odaklanabilir.length - 1];
        if (e.shiftKey && document.activeElement === ilkO) { e.preventDefault(); sonO.focus(); }
        else if (!e.shiftKey && document.activeElement === sonO) { e.preventDefault(); ilkO.focus(); }
      }
    }
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
        el("button", { class: "kapat-x", type: "button", "aria-label": "Kapat", onclick: kapatmayiDene }, ["×"])
      ]),
      el("div", { class: "m-ic" }, [govde]),
      alt
    ]);
    if (genislik) kutu.style.maxWidth = genislik + "px";
    // Kullanıcı girdisi olduysa formu "kirli" say (programatik doldurmalar olay üretmez)
    kutu.addEventListener("input", function () { kirli = true; });
    fon.appendChild(kutu);
    fon.addEventListener("mousedown", function (e) { if (e.target === fon) kapatmayiDene(); });
    document.addEventListener("keydown", tuslar);
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

  /* Alanın altına satır-içi hata notu koyar (mesaj boşsa temizler).
     Kaybolan toast yerine hatayı alanın YANINDA gösterir. */
  UI.alanHata = function (alan, mesaj) {
    if (!alan) return;
    var eski = alan.querySelector(".hata-not");
    if (eski) eski.remove();
    alan.classList.remove("alan-hatali");
    if (mesaj) {
      alan.classList.add("alan-hatali");
      alan.appendChild(el("div", { class: "hata-not" }, [mesaj]));
    }
  };
  /* Kapsayıcıdaki tüm alan hatalarını temizle */
  UI.alanHatalariTemizle = function (kok) {
    kok.querySelectorAll(".hata-not").forEach(function (n) { n.remove(); });
    kok.querySelectorAll(".alan-hatali").forEach(function (a) { a.classList.remove("alan-hatali"); });
  };

  /* ================= Genel kayıt tablosu =================
     opts: { sutunlar:[{etiket, deger(satir), sinif}], satirlar,
             bosMesaj, islemler:[{etiket, sinif, tik(satir,i)}] } */
  UI.veriTablo = function (opts) {
    opts.sutunlar = opts.sutunlar.filter(Boolean);   // koşullu kolonlar null gelebilir
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
      { yol: "kutuphane", ad: "Veri Kütüphanesi", ikon: "▩", ciz: cizKutuphane, ref: "Emisyon faktörü kaynakları • belirsizlik • IPCC/DEFRA/AR5" },
      { yol: "araclar", ad: "IPCC Hesap Araçları", ikon: "⚙", ciz: cizAraclar, ref: "CHP (kojenerasyon) • gelişmiş HFC/PFC • belirsizlik" },
      { grup: "Veri Girişi" },
      { yol: "profil",   ad: "Şirket Profili",            ikon: "▣", ciz: cizProfil, durum: "profil", ref: "TSRS 1 md. 20, 27, 60-69" },
      { yol: "indeks",   ad: "INDEX", ikon: "▦", ciz: function (k) { Indeks.ciz(k); },
        ref: "Kurumsal veri yönetim indeksi — organizasyon hiyerarşisi • RFI takibi • doküman • kanıt • matris" },
      { yol: "faaliyet", ad: "Faaliyet Verisi (K1 ve K3)", ikon: "▲", ciz: cizFaaliyet, durum: "faaliyet", ref: "Kapsam 1 ve 3 — GHG Protokolü Böl. 4 ve 15" },
      { yol: "sogutucu", ad: "Soğutucu / Kaçak Gazlar",   ikon: "❄", ciz: cizSogutucu, durum: "sogutucu", ref: "Kapsam 1 — IPCC 2006 Cilt 3 Böl. 7" },
      { yol: "atik",     ad: "Atık",                       ikon: "♻", ciz: cizAtik, durum: "atik", ref: "Cilt 8 EM-CM-150a.1 • Atık Yön. Yön. Ek-4" },
      { yol: "elektrik", ad: "Kapsam 2 — Elektrik",       ikon: "⚡", ciz: cizElektrik, durum: "elektrik", ref: "TSRS 2 md. 29(a)(ii)-(iii) — ikili raporlama" },
      { yol: "sektormetrik", ad: "Sektör Metrikleri", ikon: "◈", ciz: cizSektorMetrikleri, durum: "sektormetrik", ref: "TSRS 2 Ek Ciltleri — seçili sektör metrikleri" },
      { yol: "veriaktarim", ad: "Veri Aktarımı", ikon: "⇄", ciz: cizVeriAktarim, ref: "CSV ile faaliyet içe aktarma • şirket paketi yedek/taşıma" },
      { grup: "TSRS Açıklamaları" }
    ];
    Depo.modulTanimlari().forEach(function (m) {
      R.push({ yol: "modul/" + m.id, ad: m.baslik, ikon: "•", durum: m.id, ref: m.referans,
               ciz: function (k) { cizModul(k, m.id); } });
    });
    // Yönetim Paneli yalnız yöneticilere görünür (normal kullanıcılar sadece veri girer + rapor alır).
    // Rota hiç eklenmediği için doğrudan #/admin'e gidilse de UI.ciz panele yönlendirir (çift güvenlik).
    if (window.Depo && Depo.aktifKullanici && Depo.aktifKullanici.rol === "admin") {
      R.push({ grup: "Yönetim" });
      R.push({ yol: "admin", ad: "Yönetim Paneli", ikon: "⚙", ciz: function (k) { Admin.ciz(k); },
               ref: "Referans tabloları • listeler • form alanları • kullanıcılar • yedekleme" });
    }
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

  var sonCizilenYol = null;
  UI.ciz = function () {
    var yol = aktifYol();
    var rota = null;
    rotalar().forEach(function (r) { if (r.yol === yol) rota = r; });
    if (!rota) { location.hash = "#/panel"; return; }
    // Aynı sayfada yeniden çizim (satır sil/düzenle vb.): kaydırma konumu korunur;
    // sayfa DEĞİŞTİYSE başa dönülür.
    var icerikEl = icerikKok.closest(".icerik");
    var ayniSayfa = (yol === sonCizilenYol);
    var eskiScroll = (ayniSayfa && icerikEl) ? icerikEl.scrollTop : 0;
    navCiz();
    ustBaslik.textContent = rota.ad;
    ustRef.textContent = rota.ref || "";
    ustAksiyon.innerHTML = "";
    icerikKok.innerHTML = "";
    rota.ciz(icerikKok);
    if (icerikEl) icerikEl.scrollTop = ayniSayfa ? eskiScroll : 0;
    if (!ayniSayfa) window.scrollTo(0, 0);
    sonCizilenYol = yol;
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
      el("div", { class: "surum" }, ["Sürüm " + (Depo.ayar("surum") || "3.0") + " — " + (Depo.ayar("kip_seti") || "IPCC AR5")])
    ]);
    ustBaslik = el("h2"); ustRef = el("div", { class: "ref" });
    ustAksiyon = el("div", { style: "display:flex;gap:10px;flex:none;align-items:center" });
    kayitRozet = el("span", { class: "kayit-rozet tamam", title: "Bulut kayıt durumu" }, ["✓ Buluta kaydedildi"]);
    icerikKok = el("div", { class: "govde" });
    var icerik = el("main", { class: "icerik" }, [
      el("header", { class: "ust-bar" }, [
        el("div", { class: "ic" }, [el("div", null, [ustBaslik, ustRef]),
          el("div", { style: "display:flex;gap:10px;align-items:center" }, [kayitRozet, ustAksiyon])])
      ]),
      icerikKok
    ]);
    kok.appendChild(kenar); kok.appendChild(icerik);
    sonCizilenYol = null;   // yeni müşteri/oturum: kaydırma koruması sıfırlansın
    // Dinleyiciler bir KEZ kurulur; her müşteri açılışında yeniden eklenip birikmez
    if (!UI._dinleyicilerKuruldu) {
      window.addEventListener("hashchange", UI.ciz);
      UI._dinleyicilerKuruldu = true;
    }
    UI.ciz();
    yedekKorumasiniKur();      // çıkış uyarısı + açılış hatırlatması
  };

  /* ============================================================
     YEDEK KORUMASI (revizyon: veri kaybı önleme)
     1) Çıkış uyarısı: yedeklenmemiş değişiklik varken sekme/pencere kapatılırsa
        tarayıcı "ayrılmak istediğinizden emin misiniz?" sorar.
     2) Açılış hatırlatması: son yedekten bu yana 7+ gün geçtiyse veya hiç
        yedek alınmamış ama veri varsa, nazik bir hatırlatma kartı gösterilir.
     ============================================================ */
  var cikisKorumasiKuruldu = false;
  function yedekKorumasiniKur() {
    // 1) Çıkış uyarısı — yalnızca yedeklenmemiş değişiklik varsa devreye girer.
    //    Bir KEZ kurulur; her müşteri açılışında yeniden eklenip birikmez.
    if (!cikisKorumasiKuruldu) {
      cikisKorumasiKuruldu = true;
      window.addEventListener("beforeunload", function (e) {
        if (window.Depo && Depo.yedeklenmemisDegisiklikVar && Depo.yedeklenmemisDegisiklikVar()) {
          e.preventDefault();
          e.returnValue = "";   // tarayıcılar standart "ayrılmak üzeresiniz" uyarısını gösterir
          return "";
        }
      });
    }

    // 2) Açılış hatırlatması — sayfa kurulduktan kısa süre sonra (bir kez)
    setTimeout(function () {
      try { yedekHatirlatmasiniGoster(); } catch (e) {}
    }, 1200);
  }

  function yedekHatirlatmasiniGoster() {
    if (!window.Depo) return;
    // Bu oturumda zaten gösterildiyse tekrar etme
    if (sessionStorage.getItem("KM3_HATIRLATMA_GOSTERILDI")) return;

    var gun = Depo.sonYedektenBuyanaGun();          // null = hiç yedek yok
    var degisiklikVar = Depo.sonDegisimZamani();    // null = hiç veri girilmemiş
    var mesaj = null;

    if (gun == null && degisiklikVar) {
      mesaj = "Henüz hiç yedek almadınız. Verileriniz yalnızca bu tarayıcıda saklanıyor; " +
              "tarayıcı verisi silinirse kaybolur. Düzenli JSON yedeği almanızı öneririz.";
    } else if (gun != null && gun >= 7 && Depo.yedeklenmemisDegisiklikVar()) {
      var g = Math.floor(gun);
      mesaj = "Son yedeğinizin üzerinden " + g + " gün geçti ve o tarihten sonra değişiklik yaptınız. " +
              "Güncel bir JSON yedeği almanızı öneririz.";
    }
    if (!mesaj) return;

    sessionStorage.setItem("KM3_HATIRLATMA_GOSTERILDI", "1");
    UI.modal("Yedek Hatırlatması", el("div", null, [
      el("p", { style: "margin:0 0 10px;line-height:1.6" }, [mesaj]),
      el("p", { style: "margin:0;font-size:12.5px;color:var(--soluk)" },
        ["Yedek dosyası, başka bir bilgisayara taşınabilen gerçek arşiv kopyanızdır."])
    ]), [
      { etiket: "Daha sonra" },
      { etiket: "⬇ Şimdi Yedek Al", sinif: "birincil", tik: function (kapat) {
        Depo.yedekAl(); UI.bildir("Yedek dosyası indiriliyor"); kapat();
      } }
    ], 480);
  }

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
      el("p", { style: "margin:0 0 8px" }, [
        "Girdiğiniz her şey, birkaç saniye içinde ekibin ortak bulut veritabanına (Supabase) otomatik kaydedilir; " +
        "üst bardaki “Buluta kaydedildi” rozeti güncel durumu gösterir. Aynı müşteriyi ekipteki herkes en güncel " +
        "hâliyle görür; başka bir kullanıcı aynı anda değişiklik yaparsa ekranda uyarı belirir."]),
      el("p", { style: "margin:0 0 8px" }, [
        "“Geri Al” düğmesi son 50 değişikliği tek tek geri alabilir. Ek güvence için Veri Aktarımı sayfasından " +
        "şirket paketini (JSON) indirerek dosya yedeği alabilirsiniz; bu dosya başka ortama da taşınabilir."]),
      el("p", { style: "margin:0;color:var(--soluk);font-size:12.5px" }, [
        "Emisyon faktörleri, açılır listeler ve form alanları tüm ekip için ortaktır; yalnızca yönetici hesapları " +
        "Yönetim Paneli'nden düzenleyebilir. Kaynak: GHG Protokol / IPCC araçları (Veri Kütüphanesi sayfasına bakın)."])
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
      var gazlar = Depo.set("kip_ar5").map(function (r) { return r.Gas_Name; }).filter(Boolean);
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
    kok.appendChild(UI.kart("Doğrulama (Güvence) ve Ek Künye", [
      el("p", { style: "margin:0 0 12px;font-size:12.5px;color:var(--soluk)" },
        ["Güvence beyanı ve iletişim künyesi rapor kapağı/künye bölümüne ve içerik indeksine yansır. Doldurulmayan alanlar raporda [VERİ BEKLENİYOR] olarak işaretlenir."]),
      el("div", { class: "form-izgara" }, [
        profilAlan({ anahtar: "dogrulama", etiket: "Güvence Durumu", tip: "secim", liste: "dogrulama_durumu" }),
        profilAlan({ anahtar: "dogrulayici", etiket: "Doğrulayıcı Kuruluş", tip: "metin" }),
        profilAlan({ anahtar: "dogrulamaStandart", etiket: "Güvence Standardı", tip: "secim",
          liste: ["ISO 14064-3:2019", "GDS 3000 / GDS 3410", "ISAE 3000 / 3410", "Diğer"], yardim: "Sera gazı doğrulama/güvence standardı" }),
        profilAlan({ anahtar: "guvenceSeviye", etiket: "Güvence Seviyesi", tip: "secim",
          liste: ["Makul (reasonable)", "Sınırlı (limited)", "Güvence alınmadı"], yardim: "TSRS 2 md. 29(a) güvence düzeyi" }),
        profilAlan({ anahtar: "ticaretSicilNo", etiket: "Ticaret Sicil No", tip: "metin" }),
        profilAlan({ anahtar: "iletisimEposta", etiket: "İletişim E-postası", tip: "metin", yardim: "Rapor sorumlusunun e-postası" }),
        profilAlan({ anahtar: "raporDanismani", etiket: "Raporlama Danışmanı", tip: "metin", yardim: "Varsa raporu hazırlayan danışman kuruluş" }),
        profilAlan({ anahtar: "web", etiket: "Web Sitesi", tip: "metin" })
      ])
    ]));

    kok.appendChild(UI.kart("Karşılaştırmalı Bilgi ve İç Karbon Fiyatı", [
      el("p", { style: "margin:0 0 12px;font-size:12.5px;color:var(--soluk)" },
        ["TSRS 1 md. 70 önceki dönem karşılaştırması ister (ilk uygulama yılında muaf). TSRS 2 md. 29(f) iç karbon fiyatı açıklaması ister — uygulanmıyorsa boş bırakın, rapor 'uygulanmamaktadır' yazar. Bu alanlar rapora ve uyum kontrolüne otomatik yansır."]),
      el("div", { class: "form-izgara" }, [
        profilAlan({ anahtar: "oncekiK1", etiket: "Önceki Dönem Kapsam 1 (tCO2e)", tip: "sayi", yardim: "Geçen yılın doğrudan emisyon toplamı" }),
        profilAlan({ anahtar: "oncekiK2", etiket: "Önceki Dönem Kapsam 2 (tCO2e)", tip: "sayi", yardim: "Geçen yılın enerji dolaylı emisyonu (lokasyona dayalı)" }),
        profilAlan({ anahtar: "oncekiK3", etiket: "Önceki Dönem Kapsam 3 (tCO2e)", tip: "sayi", yardim: "Geçen yılın diğer dolaylı emisyonu" }),
        profilAlan({ anahtar: "icKarbonFiyati", etiket: "İç Karbon Fiyatı", tip: "metin", yardim: "örn. 25 ₺/tCO2e — uygulanmıyorsa boş bırakın" })
      ])
    ]));

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
          var rozet = c.onSecim
            ? el("span", { class: "rozet", style: "background:#1F7A63;color:#fff;font-size:10px;margin-left:6px" }, ["ÖN SEÇİM"])
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
      tumCiltler.forEach(function (c) { if (c.onSecim && secili.indexOf(c.no) < 0) secili.push(c.no); });
      Depo.ciltSec(secili); ciztListe(); ozetGuncelle(); UI.navGuncelle();
      UI.bildir("Madencilik/yapı cilt seti (3, 6, 8, 10) seçildi");
    } }, ["Madencilik/yapı seti (3-6-8-10)"]);
    var temizleDugme = el("button", { class: "btn ikincil kucuk", type: "button", onclick: function () {
      secili = []; Depo.ciltSec(secili); ciztListe(); ozetGuncelle(); UI.navGuncelle();
    } }, ["Seçimi temizle"]);

    ozetGuncelle();
    ciztListe();

    kok.appendChild(UI.kart("Sektör ve Cilt Seçimi (TSRS 2 Ek Ciltleri)", [
      el("p", { style: "margin:0 0 12px;font-size:12.5px;color:var(--soluk)" },
        ["Şirketiniz hangi sektör(ler)de faaliyet gösteriyorsa o ciltleri seçin. Bir şirket birden çok cilt kapsayabilir " +
         "(örn. hem madencilik hem inşaat malzemesi). Seçtiğiniz ciltlerin tüm metrikleri raporlanacak; " +
         "birden çok ciltte ortak istenen metrikler (enerji, su, Kapsam 1 gibi) tek kez hesaplanıp ilgili tüm ciltlere referansla gösterilir."]),
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
  /* ---- Tesis slot tablosu (CG-MR-000.A / 000.B) --------------------------
     Satırlar organizasyon hiyerarşisinden canlı gelir. Hiyerarşiye tesis
     eklenirse tabloya düşer; çıkarılırsa sayımdan düşer ve kayıtlı alanı
     "hesaba katılmadı" notu olarak gösterilir. */
  var SLOT_SINIF = [
    ["perakende", "Perakende"], ["dagitim", "Dağıtım"],
    ["ikisi", "Perakende + Dağıtım"], ["disi", "Kapsam dışı"]
  ];
  function tesisSlotTablosu(m) {
    if (!(window.Motor && Motor.tesisSlotlari)) return null;
    var S = Motor.tesisSlotlari();
    var SOLUK = "var(--soluk,#6E7479)";
    var CIZGI = "1px solid var(--cizgi,#D9DBD4)";
    /* Mod, metriğin bileşen birimlerinden türer:
       m² bileşeni varsa alan modu (CG-MR-000.B), yoksa sayım modu (CG-MR-000.A).
       Sayım modunda m² kolonları hiç çizilmez — o metrik alan istemiyor. */
    var alanModu = (m && m.bilesen || []).some(function (b) { return b.birim === "m²"; });
    var IZ = "display:grid;grid-template-columns:66px minmax(0,1fr) 158px" +
      (alanModu ? " 86px 86px" : "") + ";gap:0 10px;align-items:center";
    var kok = el("div", { style: "margin-bottom:14px" }, []);

    kok.appendChild(el("div", { class: "bilgi", style: "margin:0 0 10px;font-size:11.5px" }, [
      "Satırlar organizasyon hiyerarşisinden geliyor. Yeni tesis eklemek veya çıkarmak için ",
      el("b", null, ["Organizasyon"]), " sekmesini kullanın — buradaki tablo kendiliğinden güncellenir."
    ]));

    if (!S.satir.length) {
      kok.appendChild(el("div", { class: "bos-durum", style: "padding:18px;font-size:12.5px" },
        ["Organizasyon hiyerarşisinde Showroom / Depo / Ofis türünde tesis kaydı yok."]));
      return kok;
    }

    kok.appendChild(el("div", { style: IZ + ";font-size:11px;color:" + SOLUK +
      ";padding-bottom:6px;border-bottom:" + CIZGI }, [
      el("span", null, ["Kod"]), el("span", null, ["Tesis"]), el("span", null, ["Sınıf"]),
      alanModu ? el("span", { style: "text-align:right" }, ["Perakende m²"]) : null,
      alanModu ? el("span", { style: "text-align:right" }, ["Dağıtım m²"]) : null
    ]));

    S.satir.forEach(function (s, ix) {
      var satir = el("div", { style: IZ + ";padding:8px 0" +
        (ix === S.satir.length - 1 ? "" : ";border-bottom:" + CIZGI) +
        (s.sinif === "disi" ? ";opacity:.55" : "") }, []);

      satir.appendChild(el("span", { style: "font-size:11px;color:" + SOLUK +
        ";font-variant-numeric:tabular-nums" }, [s.id]));

      var altBilgi = s.tur + (s.konum ? " · " + s.konum : "");
      if (s.durum && s.durum !== "Aktif") altBilgi += " · " + s.durum;
      satir.appendChild(el("div", null, [
        el("div", { style: "font-size:12.5px" }, [s.ad]),
        el("div", { style: "font-size:10.5px;color:" + SOLUK }, [altBilgi]),
        s.oneri === "ikisi" && s.orgNotu
          ? el("div", { style: "font-size:10.5px;color:#6E5710" }, ["org kaydı: " + s.orgNotu])
          : null
      ]));

      var sec = el("select", { style: "font-size:12px" }, SLOT_SINIF.map(function (p) {
        return el("option", p[0] === s.sinif ? { value: p[0], selected: "selected" } : { value: p[0] }, [p[1]]);
      }));
      sec.value = s.sinif;
      sec.addEventListener("change", function () {
        Depo.tesisSinifYaz(s.id, "sinif", sec.value);
        UI.bildir("Kaydedildi"); UI.ciz();
      });
      satir.appendChild(sec);

      function alanGirdi(alan, aktif, deger) {
        var g = el("input", { type: "number", step: "any", inputMode: "decimal",
          value: deger != null ? deger : "", placeholder: aktif ? "m²" : "—",
          style: "text-align:right;font-size:12px" });
        if (!aktif) { g.disabled = true; return g; }
        g.addEventListener("input", function () { Depo.tesisSinifYaz(s.id, alan, g.value); });
        g.addEventListener("change", function () { UI.bildir("Kaydedildi"); UI.navGuncelle(); });
        return g;
      }
      var p = s.sinif === "perakende" || s.sinif === "ikisi";
      var d = s.sinif === "dagitim"   || s.sinif === "ikisi";
      if (alanModu) {
        satir.appendChild(alanGirdi("m2p", p, s.m2p));
        satir.appendChild(alanGirdi("m2d", d, s.m2d));
      }
      kok.appendChild(satir);
    });

    /* ---- Çıktı bloku: metriğin iki bileşeni, tablonun hemen altında ---- */
    var t = S.toplam;
    function ciktiKutu(etiket, deger, birim) {
      return el("div", { style: "flex:1;background:var(--yuzey-2,#F2F1EC);border-radius:8px;padding:9px 12px" }, [
        el("div", { style: "font-size:10.5px;color:" + SOLUK + ";letter-spacing:.4px;text-transform:uppercase" }, [etiket]),
        el("div", { style: "font-size:19px;font-weight:700;font-variant-numeric:tabular-nums;line-height:1.25" },
          [deger + (birim ? " " : "")]),
        birim ? el("span", { style: "font-size:11px;color:" + SOLUK }, [birim]) : null
      ]);
    }
    kok.appendChild(el("div", { style: "display:flex;gap:10px;margin-top:12px;" +
      "border-top:2px solid var(--cizgi,#D9DBD4);padding-top:12px" },
      alanModu
        ? [ciktiKutu("Perakende alanı", Motor.fmt(t.perakendeM2, 0), "m²"),
           ciktiKutu("Dağıtım merkezi alanı", Motor.fmt(t.dagitimM2, 0), "m²")]
        : [ciktiKutu("Perakende satış yeri", String(t.perakendeSayi), "adet"),
           ciktiKutu("Dağıtım merkezi", String(t.dagitimSayi), "adet")]
    ));
    kok.appendChild(el("div", { style: "font-size:11px;color:" + SOLUK + ";margin-top:6px" },
      ["Kapsamda " + t.kapsamda + " tesis · sınıfı “Kapsam dışı” olanlar sayılmaz." +
       (alanModu ? "" : " Her tesis bir satış yeri sayılır; bir lokasyonda birden fazla birim varsa hiyerarşide ayrı kayıt açın.")]));

    if (alanModu && t.m2Eksik)
      kok.appendChild(el("div", { class: "bilgi", style: "margin:9px 0 0;font-size:11.5px" },
        [t.m2Eksik + " tesiste alan verisi girilmemiş — CG-MR-000.B eksik kalır."]));

    S.yetim.forEach(function (y) {
      kok.appendChild(el("div", { class: "bilgi", style: "margin:9px 0 0;font-size:11.5px;" +
        "background:#F8E8E4;border-color:#EBCFC7;border-left-color:var(--oksit,#A03E1E);color:#6B2E19" }, [
        y.id + " organizasyon hiyerarşisinde bulunmuyor; sayımdan ve toplamdan düşürüldü" +
          ((y.m2p || y.m2d) ? " (kayıtlı " + Motor.fmt((y.m2p || 0) + (y.m2d || 0), 0) + " m² hesaba katılmadı)" : "") + ". ",
        el("button", { class: "btn kucuk", type: "button", style: "margin-left:6px",
          onclick: function () {
            delete Depo.tesisSinif()[y.id]; Depo.kaydet(true);
            UI.bildir("Kayıt temizlendi"); UI.ciz();
          } }, ["Kaydı temizle"])
      ]));
    });
    return kok;
  }

  /* ---- Bileşen satırlı giriş alanı (Cilt 6 ve 8) ------------------------
     sektor_ciltleri.js -> bilesen[]. Motor bileşenleri kilitli ve canlı
     hesaplanır (saklanmaz); manuel bileşenler kanıt + gerekçe ister.
     Saklama anahtarları: bilesen_<no>, bilesen_<no>_kanit, bilesen_<no>_gerekce */
  function bilesenAlani(m, v) {
    var coz = (window.Motor && Motor.metrikBilesenleri) ? Motor.metrikBilesenleri(m) : null;
    if (!coz || !coz.length) return null;
    var IZGARA = "display:grid;grid-template-columns:26px minmax(0,1fr) 142px 78px;gap:0 8px;align-items:center";
    var CIZGI = "1px solid var(--cizgi,#D9DBD4)";
    var SOLUK = "var(--soluk,#6E7479)";
    var kok = el("div", null, []);

    // Slot tablolu metrikler: tesis satırları bileşenlerin ÜSTÜNDE
    if (m.slot === "tesis") {
      var tablo = tesisSlotTablosu(m);
      if (tablo) kok.appendChild(tablo);
    }

    // Ortak metrikte bileşen listesi başka cildin tanımından gelmiş olabilir
    if (m.bilesenKaynagiKod && m.bilesenKaynagiKod !== m.kod) {
      kok.appendChild(el("div", { style: "font-size:11px;color:" + SOLUK + ";margin:0 0 8px" },
        ["Bileşen listesi " + m.bilesenKaynagiKod + " tanımından alındı (ciltler arasında kapsayan liste)."]));
    }

    // Donmuş "Motordan al" kopyası uyarısı
    var ilkMotor = null, i;
    for (i = 0; i < coz.length; i++)
      if (coz[i].kaynak === "motor" && coz[i].motorDeger != null) { ilkMotor = coz[i]; break; }
    var eski = Motor.sayi(v.deger);
    if (ilkMotor && eski > 0 && ilkMotor.motorDeger > 0 &&
        Math.abs(eski - ilkMotor.motorDeger) / ilkMotor.motorDeger > 0.01) {
      kok.appendChild(el("div", { class: "bilgi", style: "margin:0 0 10px;font-size:12px;" +
        "background:#F8E8E4;border-color:#EBCFC7;border-left-color:var(--oksit,#A03E1E);color:#6B2E19" }, [
        el("b", null, ["Donmuş kopya: "]),
        "kayıtlı " + Motor.fmt(eski, 2) + ", canlı motor değeri " +
          Motor.fmt(ilkMotor.motorDeger, 2) + " " + (ilkMotor.birim || "") + " (%" +
          Motor.fmt(Math.abs(ilkMotor.motorDeger - eski) / eski * 100, 1) + " sapma). ",
        "Eski “Motordan al” kopyası artık kullanılmıyor; bileşenler her açılışta yeniden hesaplanır. ",
        el("button", { class: "btn kucuk", type: "button", style: "margin-left:6px",
          onclick: function () { Depo.metrikYaz(m.kod, "deger", ""); UI.bildir("Kopya temizlendi"); UI.ciz(); } },
          ["Kopyayı temizle"])
      ]));
    }

    kok.appendChild(el("div", { style: IZGARA + ";font-size:11px;color:" + SOLUK +
      ";padding-bottom:5px;border-bottom:" + CIZGI }, [
      el("span", null, [""]), el("span", null, ["Bileşen"]),
      el("span", { style: "text-align:right" }, ["Değer"]),
      el("span", { style: "text-align:right" }, ["Kaynak"])
    ]));

    coz.forEach(function (b, ix) {
      var son = ix === coz.length - 1;
      var satir = el("div", { style: IZGARA + ";padding:9px 0" + (son ? "" : ";border-bottom:" + CIZGI) }, []);
      satir.appendChild(el("span", { style: "font-size:11px;color:" + SOLUK }, [String(b.no)]));
      satir.appendChild(el("span", { style: "font-size:13px" }, [b.ad]));

      var alt = [];
      if (b.kaynak === "motor") {
        satir.appendChild(el("span", { style: "text-align:right;font-size:14px;font-weight:600;" +
          "font-variant-numeric:tabular-nums" },
          [b.motorDeger == null ? "—" : Motor.fmt(b.motorDeger, 2) + (b.yuzde ? " %" : "")]));
        satir.appendChild(el("span", { style: "text-align:right;font-size:11px;color:" + SOLUK }, ["kilitli · motor"]));
        if (b.motorKaynak) alt.push(el("div", { style: "font-size:11px;color:" + SOLUK + ";padding-top:3px" }, [b.motorKaynak]));
      } else {
        var ak = "bilesen_" + b.no;
        var g = el("input", { type: "number", step: "any", inputMode: "decimal",
          value: v[ak] != null ? v[ak] : "", placeholder: b.birim || "", style: "text-align:right" });
        g.addEventListener("input", function () { Depo.metrikYaz(m.kod, ak, g.value); });
        g.addEventListener("change", function () { UI.bildir("Kaydedildi"); UI.navGuncelle(); });
        satir.appendChild(g);
        satir.appendChild(el("span", { style: "text-align:right;font-size:11px;color:" + SOLUK }, ["manuel"]));

        var kanit = el("input", { type: "text", value: v[ak + "_kanit"] || "",
          placeholder: "Kanıt bağlantısı / belge no" });
        kanit.addEventListener("input", function () { Depo.metrikYaz(m.kod, ak + "_kanit", kanit.value); });
        var ger = el("input", { type: "text", value: v[ak + "_gerekce"] || "",
          placeholder: "Gerekçe / yöntem" });
        ger.addEventListener("input", function () { Depo.metrikYaz(m.kod, ak + "_gerekce", ger.value); });
        alt.push(el("div", { style: "display:flex;gap:8px;padding-top:7px" }, [kanit, ger]));

        if (v[ak] != null && String(v[ak]).trim() !== "" && !String(v[ak + "_kanit"] || "").trim())
          alt.push(el("div", { style: "font-size:11px;color:var(--oksit,#A03E1E);padding-top:4px" },
            ["Değer girildi ama kanıt bağlantısı boş — güvence denetiminde dayanaksız kalır."]));
      }
      if (b.eksik)         alt.push(el("div", { style: "font-size:11px;color:#6E5710;padding-top:4px" }, ["Eksik: " + b.eksik]));
      if (b.kapsamUyarisi) alt.push(el("div", { style: "font-size:11px;color:#6E5710;padding-top:4px" }, ["Kapsam: " + b.kapsamUyarisi]));
      if (b.not)           alt.push(el("div", { style: "font-size:11px;color:" + SOLUK + ";padding-top:4px" }, [b.not]));

      if (alt.length) {
        satir.appendChild(el("span", null, []));
        satir.appendChild(el("div", { style: "grid-column:2/-1" }, alt));
      }
      kok.appendChild(satir);
    });

    if (m.not) kok.appendChild(el("div", { class: "bilgi", style: "margin:12px 0 0;font-size:11.5px" }, [m.not]));
    return kok;
  }

  function metrikSatiri(m) {
    var na = Depo.naMetrikler().indexOf(m.kod) > -1;
    var v = Depo.metrikVeri(m.kod);

    // Cilt referans rozetleri (ortak metrikse birden çok)
    var ciltRozetleri = m.ciltler.map(function (c) {
      return el("span", { class: "rozet", style: "font-size:10px;margin-right:4px;" +
        (c.onSecim ? "" : "") }, ["Cilt " + c.no]);
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

    // Giriş alanı: bileşenli metrikler (Cilt 6 ve 8) yeni kart, diğerleri eski yol
    var girisAlani = (m.bilesen && m.bilesen.length) ? bilesenAlani(m, v) : null;
    if (girisAlani) { /* bileşen kartı kuruldu */ }
    else if (m.tip === "ta") {
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

      var rozet = c.onSecim
        ? el("span", { class: "mini", style: "color:#1F7A63" }, [c.prefix + " • ÖN SEÇİM"])
        : el("span", { class: "mini" }, [c.prefix]);
      kok.appendChild(UI.kart("Cilt " + c.no + " — " + c.ad, [govde], { sag: rozet }));
    });
  }

  /* ============================================================
     SAYFA: FAALİYET VERİSİ (Kapsam 1 ve 3)
     ============================================================ */
  var BOLGESIZ = { "Sabit Yanma": 1, "Proses Emisyonları": 1, "Satın Alınan Isı/Buhar": 1, "Diğer Kapsam 3": 1 };
  var MANUEL_EF_ZORUNLU = { "Proses Emisyonları": 1, "Satın Alınan Isı/Buhar": 1, "Diğer Kapsam 3": 1 };

  /* ============================================================
     INDEX BİRİM BAĞLARI — faaliyet / soğutucu / elektrik kayıtları INDEX
     organizasyon ağacındaki bir birime bağlanabilir (kayit.birimId).
     Sayfa üstündeki seçici oturumluktur (veriye yazılmaz): seçili birim
     tabloyu (alt birimler dahil) süzer ve yeni kayda otomatik damgalanır.
     Envanter raporundaki birim bazlı Kapsam 1-2 dağılımı bu bağla hesaplanır.
     ============================================================ */
  var aktifBirimId = "";          // "" = tüm birimler, "__yok__" = birime atanmamışlar
  function indeksBirimleri() { return ((Depo.veri.indeks || {}).org) || []; }
  function birimAdi(id) {
    var ad = null;
    indeksBirimleri().forEach(function (k) { if (k.id === id) ad = k.ad; });
    return ad;
  }
  /* Org ağacını girintili <option> listesi olarak doldurur */
  function birimSecenekleriDoldur(sec) {
    var L = indeksBirimleri();
    function cocuklar(id) { return L.filter(function (k) { return (k.ustId || "") === (id || ""); }); }
    var eklendi = {};
    function dal(k, seviye) {
      if (eklendi[k.id]) return;
      eklendi[k.id] = true;
      sec.appendChild(el("option", { value: k.id },
        [Array(seviye + 1).join(" ") + k.ad + "  (" + k.id + ")"]));
      cocuklar(k.id).forEach(function (c) { dal(c, seviye + 1); });
    }
    cocuklar("").forEach(function (k) { dal(k, 0); });
    L.forEach(function (k) { dal(k, 0); });   // üst bağı kopuk birimler de listelensin
  }
  /* Bir birim + tüm alt soyu (üst birim seçilince alt birimlerin kayıtları da görünür) */
  function birimVeAltlari(id) {
    var L = indeksBirimleri(), kume = {};
    (function ekle(x) {
      kume[x] = true;
      L.forEach(function (k) { if ((k.ustId || "") === x && !kume[k.id]) ekle(k.id); });
    })(id);
    return kume;
  }
  function birimSuz(kayitlar) {
    if (!aktifBirimId) return kayitlar;
    if (aktifBirimId === "__yok__") return kayitlar.filter(function (s) { return !s.birimId; });
    var kume = birimVeAltlari(aktifBirimId);
    return kayitlar.filter(function (s) { return kume[s.birimId]; });
  }
  /* Sayfa üstü birim seçici şeridi */
  function birimSeciciCiz(kok, kayitlar) {
    if (!indeksBirimleri().length) {
      kok.appendChild(el("div", { class: "bilgi" }, [
        "Birim bazlı giriş için önce ", el("a", { href: "#/indeks" }, ["INDEX → Organizasyon Hiyerarşisi"]),
        " sayfasında organizasyon ağacını kurun; kayıtlar o zamana dek birimsiz tutulur."]));
      return;
    }
    var sec = el("select", { "aria-label": "Organizasyon birimine göre süz" });
    sec.appendChild(el("option", { value: "" }, ["— Tüm birimler —"]));
    sec.appendChild(el("option", { value: "__yok__" }, ["— Birime atanmamış kayıtlar —"]));
    birimSecenekleriDoldur(sec);
    sec.value = aktifBirimId;
    if (sec.value !== aktifBirimId) { aktifBirimId = ""; sec.value = ""; }  // birim silinmişse tümüne dön
    sec.addEventListener("change", function () { aktifBirimId = sec.value; UI.ciz(); });
    var atanmis = kayitlar.filter(function (s) { return s.birimId; }).length;
    var secili = (aktifBirimId && aktifBirimId !== "__yok__") ? birimAdi(aktifBirimId) : null;
    kok.appendChild(el("div", { class: "admin-arac" }, [
      el("label", { style: "font-size:12.5px;font-weight:600;display:flex;align-items:center;gap:8px;flex-wrap:wrap" },
        ["Organizasyon Birimi:", sec]),
      secili ? el("span", { class: "rozet k2" }, ["Yeni kayıtlar → " + UI.kisalt(secili, 34)]) : null,
      el("span", { class: "veri-sayac" }, [atanmis + " / " + kayitlar.length + " kayıt birime atanmış"])
    ]));
  }
  /* Form için birim seçim alanı — deger null ise sayfadaki aktif birim önerilir */
  function birimAlaniOlustur(deger) {
    var sec = el("select", { "data-anahtar": "birimId" });
    sec.appendChild(el("option", { value: "" }, ["— Birimsiz (genel) —"]));
    birimSecenekleriDoldur(sec);
    var v = deger != null ? deger : ((aktifBirimId && aktifBirimId !== "__yok__") ? aktifBirimId : "");
    if (v) {
      sec.value = v;
      if (sec.value !== v) {   // kayıtlı birim ağaçta artık yok: bağ korunur, açıkça gösterilir
        sec.appendChild(el("option", { value: v }, [v + " (ağaçta yok)"]));
        sec.value = v;
      }
    }
    var alan = el("div", { class: "alan" }, [
      el("label", null, ["Organizasyon Birimi",
        el("span", { class: "yardim" }, [" INDEX ağacından"])]),
      sec]);
    alan.girdi = sec;
    return alan;
  }
  /* Kayıt No alanı: boş bırakılırsa kaydederken sayaçtan otomatik atanır */
  function noAlaniOlustur(deger, onek) {
    return UI.alan({ anahtar: "no", etiket: "Kayıt No", tip: "metin", deger: deger || "",
      yardim: "boş kalırsa otomatik: " + onek + "-" + String(Depo.veri.sayac).padStart(3, "0") });
  }
  /* Elle girilen no'nun çakışma denetimi (kaydetmeden önce; sayaç tüketilmez) */
  function noCakisiyor(ad, istenen, eskiNo) {
    istenen = String(istenen || "").trim();
    if (!istenen) return false;
    var ix = tazeIndeks(ad, istenen);
    return ix > -1 && istenen !== eskiNo;
  }
  /* Formdan gelen no'yu sonuçlandırır: elle girilmişse onu, boşsa otomatik üretir */
  function noBelirle(ad, onek, istenen) {
    istenen = String(istenen || "").trim();
    return istenen || Depo.yeniNo(onek, ad);
  }
  /* no değişmiş olabilir: kayıt ESKİ no ile bulunup yenisiyle değiştirilir */
  function tazeGuncelleNoIle(ad, eskiNo, v) {
    var ix = tazeIndeks(ad, eskiNo);
    if (ix > -1) tazeDizi(ad)[ix] = v;
    else {
      tazeDizi(ad).push(v);
      UI.bildir("Kayıt siz düzenlerken uzaktan yenilenmişti; değişikliğiniz listeye yeniden eklendi.", true);
    }
  }
  /* Tablolar için ortak Birim kolonu */
  function birimKolonu() {
    return { etiket: "Birim", deger: function (s) {
      if (!s.birimId) return el("span", { style: "color:var(--soluk)" }, ["—"]);
      var ad = birimAdi(s.birimId);
      return el("span", { title: s.birimId }, [UI.kisalt(ad || (s.birimId + " (ağaçta yok)"), 24)]);
    } };
  }

  function faaliyetFormu(kayit, bittiginde) {
    var s = Object.assign({ bolge: "Other1", veriKalite: "", manuelEF: "", isilDegerEsasi: "" }, kayit || {});
    var govde = el("div");
    var izgara = el("div", { class: "form-izgara" });
    var onizleme = el("div", { class: "bilgi", style: "margin:16px 0 0" });

    var aNo = noAlaniOlustur(s.no, "F");
    var aBirimSec = birimAlaniOlustur(kayit ? (s.birimId || "") : null);
    var aTesis = UI.alan({ anahtar: "tesis", etiket: "Tesis / Faaliyet Adı", tip: "metin", zorunlu: true, deger: s.tesis,
      yardim: "örn. Açık Ocak Jeneratörü, Konkasör Tesisi" });
    var aKategori = UI.alan({ anahtar: "kategori", etiket: "Emisyon Kategorisi", tip: "secim", liste: "faaliyet_kategorisi", zorunlu: true, deger: s.kategori });
    var aBolge = UI.alan({ anahtar: "bolge", etiket: "EF Kaynak Seti", tip: "secim", liste: "bolge", deger: s.bolge,
      yardim: "Coğrafi bölge değil, emisyon faktörü kaynak setidir: **Other1** = IPCC 2006 genel değerleri (Türkiye için önerilen), **UK** = DEFRA, **US** = EPA" });
    var aKaynak = UI.alan({ anahtar: "kaynak", etiket: "Yakıt / Araç Tipi", tip: "secim", liste: [], zorunlu: true, genis: true });
    var aMiktar = UI.alan({ anahtar: "miktar", etiket: "Miktar", tip: "sayi", zorunlu: true, deger: s.miktar });
    var aBirim = UI.alan({ anahtar: "birim", etiket: "Birim", tip: "secim", liste: [], deger: s.birim });
    /* Isıl değer esası — yalnızca sabit yanmada ve enerji birimlerinde (GJ/kWh/MWh) görünür.
       Kütle/hacim girişinde esas EF setinden gelir (NCV), seçim anlamsızdır. */
    var aIsilEsas = UI.alan({ anahtar: "isilDegerEsasi", etiket: "Isıl Değer Esası", tip: "secim", liste: [],
      yardim: "Girilen enerji miktarı hangi ısıl değerle hesaplandı? Emisyon faktörleri (IPCC 2006) **alt** ısıl değer (NCV) esaslıdır. " +
              "Türkiye'de doğal gaz faturasındaki kWh, EPDK faturalandırma esaslarına göre **üst** ısıl değerlidir (GCV) — bu durumda GCV seçin, " +
              "motor emisyon hesabında NCV'ye indirir. Boş bırakılırsa NCV varsayılır." });
    aIsilEsas.girdi.innerHTML = "";
    aIsilEsas.girdi.appendChild(el("option", { value: "" }, ["— Seçin (boşsa NCV varsayılır) —"]));
    aIsilEsas.girdi.appendChild(el("option", { value: "NCV" }, ["NCV — alt ısıl değer (EF setiyle aynı esas)"]));
    aIsilEsas.girdi.appendChild(el("option", { value: "GCV" }, ["GCV — üst ısıl değer (ör. doğal gaz faturası kWh)"]));
    if (s.isilDegerEsasi) aIsilEsas.girdi.value = s.isilDegerEsasi;
    var aManuel = UI.alan({ anahtar: "manuelEF", etiket: "Manuel EF (kg CO2e/birim)", tip: "sayi", deger: s.manuelEF,
      yardim: "Doluysa tablo yerine bu değer kullanılır" });
    var aKalite = UI.alan({ anahtar: "veriKalite", etiket: "Veri Kalitesi", tip: "secim", liste: "veri_kalitesi", deger: s.veriKalite });
    var aDonem = UI.alan({ anahtar: "donem", etiket: "Dönem / Ay", tip: "metin", deger: s.donem, yardim: "örn. 2025 yılı tamamı, Ocak 2025" });
    var aNot = UI.alan({ anahtar: "aciklama", etiket: "Açıklama / Dayanak", tip: "metin", deger: s.aciklama, genis: true,
      yardim: "Fatura no, sayaç, hesaplama dayanağı" });

    function kaynakDoldur() {
      var kat = aKategori.girdi.value, bolge = BOLGESIZ[kat] ? null : aBolge.girdi.value;
      var secs = Motor.kaynakSecenekleri(kat, bolge);
      // Seçilen kaynak sette bu kategori için kayıt yoksa TÜM setleri göster (boş liste bırakma)
      var tumSetler = false;
      if (!secs.length && bolge && !MANUEL_EF_ZORUNLU[kat]) {
        secs = Motor.kaynakSecenekleri(kat, null);
        tumSetler = true;
      }
      var onceki = aKaynak.girdi.value || s.kaynak;
      aKaynak.girdi.innerHTML = "";
      aKaynak.girdi.appendChild(el("option", { value: "" }, [secs.length ? "— Seçin —" : "(bu kategoride seçim gerekmez)"]));
      secs.forEach(function (o) { aKaynak.girdi.appendChild(el("option", { value: o.anahtar }, [o.etiket])); });
      if (onceki) aKaynak.girdi.value = onceki;
      UI.alanHata(aKaynak, tumSetler
        ? "Seçilen kaynak sette bu kategori için kayıt yok; tüm setler [etiketli] listelendi." : "");
      aKaynak.style.display = (MANUEL_EF_ZORUNLU[kat]) ? "none" : "";
      aBolge.style.display = BOLGESIZ[kat] ? "none" : "";
    }
    function birimDoldur() {
      var kat = aKategori.girdi.value;
      var onceki = aBirim.girdi.value || s.birim;
      var liste = Depo.birimler(kat);
      aBirim.girdi.innerHTML = "";
      // Sessizce ilk birime varsayılan atanmaz: kullanıcı bilinçli seçer (yanlış birim = yanlış emisyon)
      aBirim.girdi.appendChild(el("option", { value: "" }, ["— Seçin —"]));
      liste.forEach(function (b) { aBirim.girdi.appendChild(el("option", { value: b }, [b])); });
      if (onceki) {
        // Kayıtlı birim artık listede yoksa SİLİNMEZ: işaretli seçenek olarak korunur
        if (liste.indexOf(onceki) === -1) {
          aBirim.girdi.appendChild(el("option", { value: onceki }, [onceki + " (listede yok)"]));
          aBirim.girdi.value = onceki;
          UI.alanHata(aBirim, "Bu birim güncel listede yok; hesap yine de bu birimle denenir. Gerekirse listeden geçerli birim seçin.");
        } else {
          aBirim.girdi.value = onceki;
          UI.alanHata(aBirim, "");
        }
      }
    }
    var ENERJI_BIRIMI = { "gj": 1, "kwh": 1, "mwh": 1 };
    function isilEsasGoster() {
      var b = String(aBirim.girdi.value || "").toLowerCase();
      var gerekli = aKategori.girdi.value === "Sabit Yanma" && !!ENERJI_BIRIMI[b];
      aIsilEsas.style.display = gerekli ? "" : "none";
      if (!gerekli) { aIsilEsas.girdi.value = ""; UI.alanHata(aIsilEsas, ""); return; }
      // Gaz yakıt tespiti EF setinden türetilir (gaz 1,111111 / katı-sıvı 1,052632) — yakıt adı listesine bağlı değil
      var kyt = Motor.kaynakKaydi("Sabit Yanma", null, aKaynak.girdi.value);
      var gazMi = !!kyt && Motor.sayi(kyt.LHV_to_HHV_factor) >= 1.11;
      UI.alanHata(aIsilEsas, (gazMi && b === "kwh" && aIsilEsas.girdi.value !== "GCV")
        ? "Türkiye'de doğal gaz faturasındaki kWh üst ısıl değerle hesaplanır (EPDK). Bu kayıt için GCV seçilmeli; aksi halde emisyon yaklaşık %11 fazla çıkar."
        : "");
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
    aKategori.girdi.addEventListener("change", function () { kaynakDoldur(); birimDoldur(); isilEsasGoster(); onizle(); });
    aBolge.girdi.addEventListener("change", function () { kaynakDoldur(); isilEsasGoster(); onizle(); });
    [aKaynak, aBirim, aIsilEsas].forEach(function (a) {
      a.girdi.addEventListener("change", isilEsasGoster);
    });
    [aKaynak, aMiktar, aBirim, aManuel, aIsilEsas].forEach(function (a) {
      a.girdi.addEventListener("change", onizle);
      a.girdi.addEventListener("input", onizle);
    });

    [aNo, aBirimSec, aTesis, aKategori, aBolge, aKaynak, aMiktar, aBirim, aIsilEsas, aManuel, aKalite, aDonem, aNot]
      .forEach(function (a) { izgara.appendChild(a); });
    govde.appendChild(izgara); govde.appendChild(onizleme);
    kaynakDoldur(); birimDoldur(); isilEsasGoster(); onizle();

    UI.modal(kayit ? "Kaydı Düzenle — " + (kayit.no || "") : "Yeni Faaliyet Kaydı", govde, [
      { etiket: "Vazgeç" },
      { etiket: "Kaydet", sinif: "birincil", tik: function (kapat) {
        var v = UI.degerler(izgara);
        // Zorunlu alan denetimi — hatalar kaybolan toast yerine alanın yanında gösterilir
        UI.alanHatalariTemizle(izgara);
        var hataVar = false;
        function zorunlu(alan, kosul, mesaj) { if (kosul) { UI.alanHata(alan, mesaj); hataVar = true; } }
        zorunlu(aTesis, !String(v.tesis || "").trim(), "Tesis / faaliyet adı zorunludur");
        zorunlu(aKategori, !v.kategori, "Kategori seçin");
        zorunlu(aMiktar, !v.miktar || !(Motor.sayi(v.miktar) > 0), "Sıfırdan büyük bir miktar girin");
        zorunlu(aNo, noCakisiyor("faaliyet", v.no, kayit ? kayit.no : null),
          "Bu numara başka bir faaliyet kaydında kullanılıyor");
        var manuelYok = !(Motor.sayi(v.manuelEF) > 0);
        if (v.kategori && !MANUEL_EF_ZORUNLU[v.kategori] && manuelYok) {
          zorunlu(aKaynak, !v.kaynak, "Yakıt / araç tipi seçin (ya da Manuel EF girin)");
          zorunlu(aBirim, !v.birim, "Birim seçin");
        }
        if (v.kategori && MANUEL_EF_ZORUNLU[v.kategori]) {
          zorunlu(aManuel, manuelYok, "Bu kategori için Manuel EF (kg CO2e/birim) zorunludur");
        }
        if (hataVar) {
          var ilkHata = izgara.querySelector(".alan-hatali input, .alan-hatali select");
          if (ilkHata) ilkHata.focus();
          return;
        }
        // No formda sonuçlanır: elle girilmişse o, boşsa sayaçtan otomatik
        var h = Motor.hesapFaaliyet(v);
        if (h.hata) {
          UI.onayla("Bu kayıt şu nedenle HESAPLANAMIYOR: “" + h.hata + "”. Toplamlara girmeyecek. " +
            "Taslak olarak yine de kaydedilsin mi?", function () {
              v.no = noBelirle("faaliyet", "F", v.no);
              bittiginde(v); kapat();
            });
          return;
        }
        v.no = noBelirle("faaliyet", "F", v.no);
        bittiginde(v); kapat();
      } }
    ]);
  }

  /* ============================================================
     SAYFA: VERİ AKTARIMI (tüm kullanıcılara açık) — CSV içe aktarma + şirket paketi
     ============================================================ */
  function cizVeriAktarim(kok) {
    kok.appendChild(el("div", { class: "bilgi" }, [
      "Bu sayfadan müşteri verisini toplu içe aktarabilir, yedekleyebilir veya başka bir müşteriye/ortama taşıyabilirsiniz. " +
      "İşlemler açık olan müşteri üzerinde çalışır ve otomatik kaydedilir."]));

    /* ---- CSV ile Faaliyet İçe Aktarma ---- */
    var csvGirdi = el("input", { type: "file", accept: ".csv,text/csv", style: "font:inherit;font-size:13px" });
    var csvSonuc = el("div", { style: "margin-top:10px" });
    csvGirdi.addEventListener("change", function () {
      var f = csvGirdi.files[0];
      if (!f) return;
      var okuyucu = new FileReader();
      okuyucu.onload = function () {
        var r = Depo.csvFaaliyetIceAktar(String(okuyucu.result));
        csvSonuc.innerHTML = "";
        if (r.hatalar.length) {
          csvSonuc.appendChild(el("div", { class: "bilgi", style: "border-left-color:var(--oksit)" },
            ["İçe aktarım yapılamadı: " + r.hatalar.join(" • ")]));
        } else {
          csvSonuc.appendChild(el("div", { class: "bilgi yesil" },
            [el("b", null, [r.eklenen + " faaliyet kaydı eklendi"]),
             r.atlanan ? " • " + r.atlanan + " satır atlandı" : "",
             ". Faaliyet Verisi sayfasından kaynak/birim eşleştirmesini tamamlayabilirsiniz."]));
          // Satır bazlı uyarılar (atlanan satır numaraları + belirsiz sayı biçimleri) açıkça listelenir
          if (r.uyarilar && r.uyarilar.length) {
            csvSonuc.appendChild(el("div", { class: "bilgi", style: "border-left-color:var(--oksit);margin-top:8px;font-size:12.5px" },
              [el("b", null, ["Kontrol edilmesi gerekenler:"]),
               el("ul", { style: "margin:6px 0 0;padding-left:18px" },
                 r.uyarilar.slice(0, 20).map(function (u) { return el("li", null, [u]); })),
               r.uyarilar.length > 20 ? el("div", null, ["… ve " + (r.uyarilar.length - 20) + " uyarı daha"]) : null]));
          }
          UI.bildir(r.eklenen + " kayıt içe aktarıldı");
        }
        csvGirdi.value = "";
      };
      okuyucu.readAsText(f, "utf-8");
    });
    kok.appendChild(UI.kart("CSV ile Faaliyet İçe Aktarma", [
      el("p", { style: "margin:0 0 10px;font-size:13px" },
        ["Müşteriden gelen faaliyet verisini CSV dosyasından toplu yükleyin. Başlık satırı esnek eşlenir; " +
         "en az “kategori” ve “miktar” sütunları bulunmalıdır. Hem Türkçe (1.234,56) hem uluslararası (1,234.56 / 10.5) " +
         "sayı biçimi otomatik tanınır; belirsiz hücreler içe aktarım sonrası uyarı olarak listelenir. " +
         "Virgül ve noktalı virgül ayırıcıların ikisi de desteklenir; dosya UTF-8 olmalıdır."]),
      el("div", { class: "bilgi", style: "font-size:12px;margin-bottom:10px" },
        ["Tanınan başlıklar: tesis, kategori, kaynak, miktar, birim, donem, aciklama. Örnek: ",
         el("code", null, ["tesis;kategori;kaynak;miktar;birim;donem"])]),
      csvGirdi, csvSonuc
    ]));

    /* ---- Şirket Veri Paketi (yedek / taşıma) ---- */
    var paketGirdi = el("input", { type: "file", accept: ".json,application/json", style: "font:inherit;font-size:13px" });
    paketGirdi.addEventListener("change", function () {
      var f = paketGirdi.files[0];
      if (!f) return;
      var okuyucu = new FileReader();
      okuyucu.onload = function () {
        UI.onayla("Şirket paketi yüklenince açık müşterinin verisi (profil, faaliyet, metrikler) bu dosyadakilerle DEĞİŞTİRİLİR. Devam edilsin mi?", function () {
          var hata = Depo.sirketPaketiYukle(String(okuyucu.result));
          if (hata) UI.bildir(hata, true);
          else { UI.bildir("Şirket paketi yüklendi"); UI.ciz(); }
        });
      };
      okuyucu.readAsText(f, "utf-8");
    });
    kok.appendChild(UI.kart("Şirket Veri Paketi (yedek / taşıma)", [
      el("p", { style: "margin:0 0 12px;font-size:13px" },
        ["Açık müşterinin tüm verisini (profil + faaliyet + soğutucu + elektrik + TSRS modülleri + sektör metrikleri) tek JSON dosyasına " +
         "indirir. Yedekleme, arşivleme veya başka bir ortama taşıma için idealdir. Ortak emisyon faktörü tabloları dahil edilmez."]),
      el("div", { style: "display:flex;gap:10px;flex-wrap:wrap;align-items:center" }, [
        el("button", { class: "btn birincil", type: "button", onclick: function () {
          Depo.sirketPaketiAl(); UI.bildir("Şirket paketi indiriliyor");
        } }, ["⬇ Şirket Paketini İndir"]),
        el("span", { style: "font-size:12.5px;color:var(--soluk)" }, ["veya yükle:"]),
        paketGirdi
      ])
    ], { kapsam: "k1" }));

    /* ---- Boş Alan Manifestosu (kapsam kontrolü) ---- */
    (function () {
      var ozet = Depo.bosAlanOzeti();
      var satirlar = Object.keys(ozet.gruplar).map(function (g) {
        var x = ozet.gruplar[g];
        return el("tr", null, [
          el("td", { style: "padding:3px 8px" }, [g]),
          el("td", { style: "padding:3px 8px;text-align:right" }, [String(x.toplam)]),
          el("td", { style: "padding:3px 8px;text-align:right;font-weight:600;color:" + (x.bos ? "var(--oksit)" : "var(--soluk)") }, [String(x.bos)])
        ]);
      });
      kok.appendChild(UI.kart("Boş Alan Manifestosu (kapsam kontrolü)", [
        el("p", { style: "margin:0 0 10px;font-size:13px" },
          ["Bu müşteri için uygulamadaki TÜM doldurulabilir alanların (profil, 10 TSRS modülü, sektör metrikleri, veri dizileri) doldurulma durumu. " +
           "Belgelerden hangi bilgileri çıkarmamız gerektiğinin tam listesi ve “hepsini kapsadık mı” kontrolüdür."]),
        el("div", { class: "bilgi", style: "margin-bottom:10px" }, [
          el("b", null, [String(ozet.toplam)]), " hedef alan • ",
          el("b", { style: "color:var(--soluk)" }, [String(ozet.dolu) + " dolu"]), " • ",
          el("b", { style: "color:var(--oksit)" }, [String(ozet.bos) + " boş"])
        ]),
        el("div", { style: "overflow:auto;max-height:260px;border:1px solid var(--cizgi,#e0e0e0);border-radius:6px;margin-bottom:12px" }, [
          el("table", { style: "width:100%;border-collapse:collapse;font-size:12.5px" }, [
            el("thead", null, [el("tr", { style: "position:sticky;top:0;background:var(--yuzey,#fafafa)" }, [
              el("th", { style: "padding:5px 8px;text-align:left" }, ["Bölüm"]),
              el("th", { style: "padding:5px 8px;text-align:right" }, ["Alan"]),
              el("th", { style: "padding:5px 8px;text-align:right" }, ["Boş"])
            ])]),
            el("tbody", null, satirlar)
          ])
        ]),
        el("button", { class: "btn", type: "button", onclick: function () {
          Depo.bosAlanManifestoIndir(); UI.bildir("Boş alan manifestosu indiriliyor");
        } }, ["⬇ Boş Alan Manifestosunu İndir (CSV)"])
      ]));
    })();

    /* ---- Belgeden Çıkarılan Paketi Yükle (yalnız boş doldur) ---- */
    var ipGirdi = el("input", { type: "file", accept: ".json,application/json", style: "font:inherit;font-size:13px" });
    var ipOnizleme = el("div", { style: "margin-top:12px" });
    function ipOnizlemeCiz(paket, a) {
      ipOnizleme.innerHTML = "";
      var cakismaSecim = {};
      ipOnizleme.appendChild(el("div", { class: "bilgi" }, [
        el("b", null, [a.dolacak.length + " boş alan dolacak"]), " • " + a.zatenDolu.length + " zaten dolu (atlanır) • ",
        el("b", { style: a.cakisma.length ? "color:var(--oksit)" : "" }, [a.cakisma.length + " çakışma"]), " • ",
        el("b", null, [a.eklenecekKayit + " kayıt eklenecek"]), (a.dedupAtlanacak ? " • " + a.dedupAtlanacak + " tekrar atlanacak" : ""),
        a.kaynakBelgeler.length ? el("div", { style: "margin-top:6px;font-size:12px;color:var(--soluk)" }, ["Kaynak belgeler: " + a.kaynakBelgeler.join(", ")]) : ""
      ]));
      if (a.dolacak.length) {
        ipOnizleme.appendChild(el("div", { style: "font-weight:600;margin:10px 0 4px;font-size:13px" }, ["Dolacak boş alanlar:"]));
        ipOnizleme.appendChild(el("div", { style: "max-height:200px;overflow:auto;font-size:12px;border:1px solid var(--cizgi,#e0e0e0);border-radius:6px;padding:6px" },
          a.dolacak.map(function (x) {
            return el("div", { style: "padding:3px 0" }, [
              el("code", { style: "color:var(--vurgu,#1565c0)" }, [x.yol]), ": ", UI.kisalt(String(x.deger), 90),
              x.kaynak ? el("span", { style: "color:var(--soluk)" }, [" — " + x.kaynak]) : ""
            ]);
          })));
      }
      if (a.cakisma.length) {
        ipOnizleme.appendChild(el("div", { style: "font-weight:600;margin:12px 0 4px;font-size:13px;color:var(--oksit)" },
          ["Çakışmalar — mevcut veri KORUNUR; üzerine yazmak isterseniz işaretleyin:"]));
        a.cakisma.forEach(function (c) {
          var cb = el("input", { type: "checkbox", style: "margin-right:6px" });
          cb.addEventListener("change", function () { cakismaSecim[c.yol] = cb.checked; });
          ipOnizleme.appendChild(el("label", { style: "display:block;font-size:12px;padding:4px 0;cursor:pointer" }, [
            cb, el("code", { style: "color:var(--vurgu,#1565c0)" }, [c.yol]),
            el("div", { style: "margin-left:22px;color:var(--soluk)" }, ["Mevcut: " + UI.kisalt(String(c.mevcut), 60) + "  →  Yeni: " + UI.kisalt(String(c.yeni), 60)])
          ]));
        });
      }
      var uygulaBtn = el("button", { class: "btn birincil", type: "button", style: "margin-top:12px" }, ["✓ Boşları Doldur ve Kayıtları Ekle"]);
      uygulaBtn.addEventListener("click", function () {
        var yollar = Object.keys(cakismaSecim).filter(function (y) { return cakismaSecim[y]; });
        UI.onayla(a.dolacak.length + " boş alan doldurulacak, " + a.eklenecekKayit + " kayıt eklenecek" +
          (yollar.length ? ", " + yollar.length + " dolu alanın ÜZERİNE YAZILACAK" : "") +
          ". İşaretlenmeyen dolu veriler korunur. Devam edilsin mi?", function () {
          var s = Depo.iceAktarimUygula(paket, { cakismaYollari: yollar });
          UI.bildir(s.dolduruldu + " alan dolduruldu, " + s.eklenenKayit + " kayıt eklendi");
          UI.ciz();
        });
      });
      ipOnizleme.appendChild(uygulaBtn);
    }
    ipGirdi.addEventListener("change", function () {
      var f = ipGirdi.files[0]; if (!f) return;
      var okuyucu = new FileReader();
      okuyucu.onload = function () {
        var paket = null;
        try { paket = JSON.parse(String(okuyucu.result)); } catch (e) {}
        var a = Depo.iceAktarimAnaliz(paket);
        ipOnizleme.innerHTML = "";
        if (a.hata) ipOnizleme.appendChild(el("div", { class: "bilgi", style: "border-left-color:var(--oksit)" }, [UI.kacir(a.hata)]));
        else ipOnizlemeCiz(paket, a);
        ipGirdi.value = "";
      };
      okuyucu.readAsText(f, "utf-8");
    });
    kok.appendChild(UI.kart("Belgeden Çıkarılan Paketi Yükle (yalnız boş doldur)", [
      el("p", { style: "margin:0 0 10px;font-size:13px" },
        ["Yerelde belgelerden (PDF/Excel/MD) çıkarılıp hazırlanan “İçe Aktarım Paketi” JSON dosyasını yükleyin. " +
         "Yalnızca BOŞ alanları doldurur, mevcut verilerinizi EZMEZ; faaliyet/elektrik/soğutucu kayıtlarını tekrarsız ekler; " +
         "her değerin belge kaynağını (denetlenebilirlik için) saklar. Yükleme öncesi ne olacağını önizlersiniz."]),
      ipGirdi, ipOnizleme
    ], { kapsam: "k3" }));
  }

  /* Kayıt dizisi HER işlemde Depo.veri'den taze çözülür: modal açıkken veri
     uzaktan yenilendiyse (⟳ Yenile / Geri Al) bayat dizi referansına yazılıp
     değişikliğin sessizce kaybolması önlenir. */
  function tazeDizi(ad) {
    if (!Array.isArray(Depo.veri[ad])) Depo.veri[ad] = [];
    return Depo.veri[ad];
  }
  function tazeIndeks(ad, no) {
    var arr = tazeDizi(ad);
    for (var i = 0; i < arr.length; i++) if (arr[i] && arr[i].no === no) return i;
    return -1;
  }
  function tazeGuncelle(ad, v) {   // no'ya göre günceller; kayıt yoksa sona ekler + uyarır
    var ix = tazeIndeks(ad, v.no);
    if (ix > -1) tazeDizi(ad)[ix] = v;
    else {
      tazeDizi(ad).push(v);
      UI.bildir("Kayıt siz düzenlerken uzaktan yenilenmişti; değişikliğiniz listeye yeniden eklendi.", true);
    }
  }

  function cizFaaliyet(kok) {
    var liste = Depo.veri.faaliyet;
    function yenile() { UI.ciz(); }

    UI.ustAksiyon(el("button", { class: "btn birincil", type: "button", onclick: function () {
      faaliyetFormu(null, function (v) {
        tazeDizi("faaliyet").push(v); Depo.kaydet(); yenile();
      });
    } }, ["+ Yeni Kayıt"]));

    kok.appendChild(el("div", { class: "bilgi" },
      ["Kapsam 1 (sabit/mobil yanma, proses) ve Kapsam 3 (taşıma, seyahat, ulaşım) faaliyetleri tek listede tutulur; kapsam, kategoriden otomatik belirlenir. CO2e değeri kayıt sırasında canlı hesaplanır."]));

    var T = Motor.toplamlar();
    // Hesaplanamayan kayıtlar yalnız satırdaki "!" rozetine gizlenmez; sayfa başında açıkça duyurulur
    var fHatalar = T.hatalar.filter(function (h) { return /^F-/.test(h); });
    if (fHatalar.length) {
      kok.appendChild(el("div", { class: "bilgi", style: "border-left-color:var(--oksit,#B4642D)" }, [
        el("b", null, [fHatalar.length + " kayıt hesaplanamıyor ve toplamlara GİRMİYOR. "]),
        "Tabloda “!” rozetli satırları Düzenle ile açıp eksikleri tamamlayın. ",
        el("span", { style: "font-size:12px;color:var(--soluk)" }, [UI.kisalt(fHatalar.join(" • "), 220)])
      ]));
    }
    birimSeciciCiz(kok, liste);
    var gosterilen = birimSuz(liste);
    kok.appendChild(UI.kart("Faaliyet Kayıtları", [
      UI.veriTablo({
        satirlar: gosterilen,
        bosMesaj: liste.length ? "Seçili birimde (ve alt birimlerinde) kayıt yok." : "Henüz faaliyet kaydı yok. Sağ üstteki \u201C+ Yeni Kayıt\u201D düğmesiyle başlayın.",
        sutunlar: [
          { etiket: "No", deger: function (s) { return s.no; } },
          indeksBirimleri().length ? birimKolonu() : null,
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
          { etiket: "Düzenle", tik: function (s) {
            faaliyetFormu(s, function (v) { tazeGuncelleNoIle("faaliyet", s.no, v); Depo.kaydet(); yenile(); });
          } },
          { etiket: "Kopyala", tik: function (s) {
            var k = Object.assign({}, s, { no: Depo.yeniNo("F", "faaliyet") });
            tazeDizi("faaliyet").push(k); Depo.kaydet(); yenile();
          } },
          { etiket: "Sil", sinif: "tehlike", tik: function (s, i) {
            UI.onayla("\u201C" + (s.no || "") + " — " + (s.tesis || "") + "\u201D kaydı silinsin mi?", function () {
              var ix = tazeIndeks("faaliyet", s.no);
              if (ix > -1) { tazeDizi("faaliyet").splice(ix, 1); Depo.kaydet(); }
              yenile();
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

    var gazlar = Depo.set("kip_ar5").map(function (r) { return r.Gas_Name; }).filter(Boolean);
    var aNo = noAlaniOlustur(s.no, "S");
    var aBirimSec = birimAlaniOlustur(kayit ? (s.birimId || "") : null);
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
    [aNo, aBirimSec, aAd, aGaz, aYontem, aBas, aYeni, aCik, aSon, aTur, aKap, aOran, aNot].forEach(function (a) { izgara.appendChild(a); });
    var govde = el("div", null, [izgara, onizleme]);
    yontemGoster(); onizle();

    UI.modal(kayit ? "Kaydı Düzenle — " + (kayit.no || "") : "Yeni Soğutucu / Kaçak Kaydı", govde, [
      { etiket: "Vazgeç" },
      { etiket: "Kaydet", sinif: "birincil", tik: function (kapat) {
        var v = UI.degerler(izgara);
        UI.alanHatalariTemizle(izgara);
        var hataVar = false;
        if (!String(v.ekipman || "").trim()) { UI.alanHata(aAd, "Ekipman / sistem adı zorunludur"); hataVar = true; }
        if (!v.gaz) { UI.alanHata(aGaz, "Gaz seçin (KIP tablosundan)"); hataVar = true; }
        if (v.yontem === "Tarama (Basit)" && !(Motor.sayi(v.kapasite) > 0)) {
          UI.alanHata(aKap, "Tarama yönteminde ekipman kapasitesi (kg) zorunludur"); hataVar = true;
        }
        if (noCakisiyor("sogutucu", v.no, kayit ? kayit.no : null)) {
          UI.alanHata(aNo, "Bu numara başka bir soğutucu kaydında kullanılıyor"); hataVar = true;
        }
        if (hataVar) { var ilkH = izgara.querySelector(".alan-hatali input, .alan-hatali select"); if (ilkH) ilkH.focus(); return; }
        v.no = noBelirle("sogutucu", "S", v.no);
        bittiginde(v); kapat();
      } }
    ]);
  }

  function cizSogutucu(kok) {
    var liste = Depo.veri.sogutucu;
    UI.ustAksiyon(el("button", { class: "btn birincil", type: "button", onclick: function () {
      sogutucuFormu(null, function (v) { tazeDizi("sogutucu").push(v); Depo.kaydet(); UI.ciz(); });
    } }, ["+ Yeni Kayıt"]));

    kok.appendChild(el("div", { class: "bilgi" },
      ["Klima, soğutma ve yangın söndürme sistemlerindeki florlu gaz (HFC, PFC, SF6 vb.) kaçakları Kapsam 1'e dahildir. Kütle Dengesi yöntemi servis kayıtlarına, Tarama yöntemi ekipman kapasitesi × varsayılan kaçak oranına (IPCC aralıklarının orta noktası) dayanır."]));

    var sHatalar = Motor.toplamlar().hatalar.filter(function (h) { return /^S-/.test(h); });
    if (sHatalar.length) {
      kok.appendChild(el("div", { class: "bilgi", style: "border-left-color:var(--oksit,#B4642D)" }, [
        el("b", null, [sHatalar.length + " kayıt hesaplanamıyor ve toplamlara GİRMİYOR. "]),
        el("span", { style: "font-size:12px;color:var(--soluk)" }, [UI.kisalt(sHatalar.join(" • "), 220)])
      ]));
    }

    birimSeciciCiz(kok, liste);
    var gosterilen = birimSuz(liste);
    kok.appendChild(UI.kart("Soğutucu / Kaçak Gaz Kayıtları", [
      UI.veriTablo({
        satirlar: gosterilen,
        bosMesaj: liste.length
          ? "Seçili birimde (ve alt birimlerinde) kayıt yok."
          : "Henüz kayıt yok. Florlu gaz içeren ekipmanlarınızı ekleyin.",
        sutunlar: [
          { etiket: "No", deger: function (s) { return s.no; } },
          indeksBirimleri().length ? birimKolonu() : null,
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
          { etiket: "Düzenle", tik: function (s) {
            sogutucuFormu(s, function (v) { tazeGuncelleNoIle("sogutucu", s.no, v); Depo.kaydet(); UI.ciz(); });
          } },
          { etiket: "Sil", sinif: "tehlike", tik: function (s, i) {
            UI.onayla("\u201C" + (s.no || "") + " — " + (s.ekipman || "") + "\u201D silinsin mi?", function () {
              var ix = tazeIndeks("sogutucu", s.no);
              if (ix > -1) { tazeDizi("sogutucu").splice(ix, 1); Depo.kaydet(); }
              UI.ciz();
            });
          } }
        ]
      })
    ], { kapsam: "k1", mini: liste.length + " kayıt" }));
  }

  /* ============================================================
     SAYFA: ATIK (Cilt 8 EM-CM-150a.1 • Atık Yön. Yön. Ek-4)
     Şema girdiler: no, birimId, donem, atikKodu, atikAdi, miktar_t, miktarBirim,
     islemKodu, islemYeri, beyanKontrolNo, aliciTesisKodu, atikYagKategori,
     aciklama, veriKalite. Tehlikeli + geri dönüşüm sayımı motor türetir.
     ============================================================ */
  function ilkAtikKodu(str) {
    var m = String(str || "").match(/\d{2}\s*\d{2}\s*\d{2}/);
    return m ? m[0] : "";
  }
  function atikKodEtiketi(r) { return r.kod + " — " + UI.kisalt(r.ad, 60) + (r.tehlikeli ? "  (T)" : ""); }
  function atikKodDatalist(naceKodu) {
    var kat = Depo.set("atik_kodlari") || [];
    if (naceKodu && naceKodu !== "*") {
      var nk = (Depo.set("nace_atik") || {})[naceKodu];
      if (nk && nk.kodlar) {
        var izin = {}; nk.kodlar.forEach(function (k) { izin[String(k).replace(/[^0-9]/g, "")] = 1; });
        kat = kat.filter(function (r) { return izin[String(r.kod).replace(/[^0-9]/g, "")]; });
      }
    }
    return kat.map(atikKodEtiketi);
  }

  function atikFormu(kayit, bittiginde) {
    var s = Object.assign({ donem: "2025", islemYeri: "Tesis Dışı", miktarBirim: "kg", veriKalite: "" }, kayit || {});
    var izgara = el("div", { class: "form-izgara" });
    var onizleme = el("div", { class: "bilgi", style: "margin:16px 0 0" });

    var naceler = Object.keys(Depo.set("nace_atik") || {});
    var aNo = noAlaniOlustur(s.no, "A");
    var aBirimSec = birimAlaniOlustur(kayit ? (s.birimId || "") : null);
    var aNace = UI.alan({ anahtar: "_nace", etiket: "NACE Filtresi (öneri)", tip: "secim", liste: [],
      yardim: "Tesisin NACE'ine göre kod listesini daraltır. Öneri filtresidir; 'Tümü' ile 838 kodun tamamı görünür." });
    aNace.girdi.innerHTML = "";
    aNace.girdi.appendChild(el("option", { value: "*" }, ["Tümü (838 kod)"]));
    naceler.forEach(function (n) { aNace.girdi.appendChild(el("option", { value: n }, [n])); });

    var aKod = UI.alan({ anahtar: "_kodSecim", etiket: "Atık Kodu (Ek-4)", tip: "metin", zorunlu: true,
      datalist: atikKodDatalist("*"),
      deger: s.atikKodu ? (s.atikKodu + (s.atikAdi ? " — " + UI.kisalt(s.atikAdi, 60) : "")) : "",
      yardim: "Yazmaya başlayın: örn. 13 02 08 veya 130208. Tehlikelilik koddan otomatik gelir." });
    var aMiktar = UI.alan({ anahtar: "_miktar", etiket: "Miktar", tip: "sayi", zorunlu: true,
      deger: (s.miktar_t != null && s.miktar_t !== "")
        ? (s.miktarBirim === "ton" ? Motor.sayi(s.miktar_t) : Motor.sayi(s.miktar_t) * 1000) : "" });
    var aBirimOlcu = UI.alan({ anahtar: "_birimOlcu", etiket: "Birim", tip: "secim", liste: [] });
    aBirimOlcu.girdi.innerHTML = "";
    ["kg", "ton"].forEach(function (u) { aBirimOlcu.girdi.appendChild(el("option", { value: u }, [u])); });
    aBirimOlcu.girdi.value = s.miktarBirim || "kg";
    var aIslem = UI.alan({ anahtar: "islemKodu", etiket: "İşleme Yöntemi (R/D)", tip: "metin", zorunlu: true, deger: s.islemKodu,
      datalist: ["R1", "R2", "R3", "R4", "R5", "R6", "R7", "R8", "R9", "R10", "R11", "R12", "R13",
                 "D1", "D2", "D3", "D4", "D5", "D8", "D9", "D10", "D12", "D13", "D14", "D15"],
      yardim: "TABS beyanındaki işleme yöntemi. R2–R11 geri dönüşüm sayılır; R1/R12/R13 ve D kodları sayılmaz." });
    var aIslemYeri = UI.alan({ anahtar: "islemYeri", etiket: "İşlemin Yeri", tip: "secim", liste: [] });
    aIslemYeri.girdi.innerHTML = "";
    ["Tesis Dışı", "Tesis İçi"].forEach(function (u) { aIslemYeri.girdi.appendChild(el("option", { value: u }, [u])); });
    aIslemYeri.girdi.value = s.islemYeri || "Tesis Dışı";
    var aBeyan = UI.alan({ anahtar: "beyanKontrolNo", etiket: "Beyan Kontrol No", tip: "metin", deger: s.beyanKontrolNo,
      yardim: "TABS Atık Beyan Formundaki kontrol numarası — denetim kanıt çapası" });
    var aAlici = UI.alan({ anahtar: "aliciTesisKodu", etiket: "Alıcı İşleme Tesisi Kodu", tip: "metin", deger: s.aliciTesisKodu });
    var aYag = UI.alan({ anahtar: "atikYagKategori", etiket: "Atık Yağ Kategorisi", tip: "metin", deger: s.atikYagKategori,
      yardim: "Yalnızca atık yağlarda (13 xx): I / II / III. kategori" });
    var aDonem = UI.alan({ anahtar: "donem", etiket: "Dönem / Yıl", tip: "metin", deger: s.donem });
    var aKalite = UI.alan({ anahtar: "veriKalite", etiket: "Veri Kalitesi", tip: "secim", liste: "veri_kalitesi", deger: s.veriKalite });
    var aNot = UI.alan({ anahtar: "aciklama", etiket: "Açıklama / Dayanak", tip: "metin", deger: s.aciklama, genis: true });

    function naceDegisti() {
      var yeni = atikKodDatalist(aNace.girdi.value);
      var dl = aKod.girdi.parentListe;
      if (dl) { dl.innerHTML = ""; yeni.forEach(function (v) { dl.appendChild(el("option", { value: v })); }); }
    }
    function onizle() {
      var bilgi = Motor.atikKoduBilgi(ilkAtikKodu(aKod.girdi.value));
      var raw = Motor.sayi(aMiktar.girdi.value);
      var ton = aBirimOlcu.girdi.value === "ton" ? raw : raw / 1000;
      var sinif = Motor.atikIslemSinifi(aIslem.girdi.value);
      UI.alanHata(aKod, (aKod.girdi.value && !bilgi.bulundu)
        ? "Bu kod Ek-4 kataloğunda bulunamadı; kod 'NN NN NN' biçiminde olmalı." : "");
      onizleme.className = "bilgi" + (bilgi.bulundu ? " yesil" : "");
      onizleme.innerHTML = (bilgi.bulundu
        ? "<b>" + bilgi.kodNorm + "</b> — " + UI.kacir(bilgi.ad) + " • <b>" + (bilgi.tehlikeli ? "TEHLİKELİ" : "tehlikesiz") + "</b>"
        : "Atık kodu bekleniyor") +
        "<br>" + Motor.fmt(ton, 3) + " t • İşlem: <b>" + UI.kacir(sinif.durum) + "</b> — " +
        (sinif.sayilir ? "geri dönüşüme SAYILIR" + (sinif.isaretli ? " (işaretli/tartışmalı)" : "") : "geri dönüşüme sayılmaz") +
        (sinif.uyari ? "<br><span style='font-size:11.5px'>⚠ " + UI.kacir(sinif.uyari) + "</span>" : "");
    }
    aNace.girdi.addEventListener("change", naceDegisti);
    [aKod, aMiktar, aBirimOlcu, aIslem].forEach(function (a) {
      a.girdi.addEventListener("input", onizle); a.girdi.addEventListener("change", onizle);
    });
    [aNo, aBirimSec, aNace, aKod, aMiktar, aBirimOlcu, aIslem, aIslemYeri, aBeyan, aAlici, aYag, aDonem, aKalite, aNot]
      .forEach(function (a) { izgara.appendChild(a); });
    var govde = el("div", null, [izgara, onizleme]);
    onizle();

    UI.modal(kayit ? "Atık Kaydını Düzenle — " + (kayit.no || "") : "Yeni Atık Kaydı", govde, [
      { etiket: "Vazgeç" },
      { etiket: "Kaydet", sinif: "birincil", tik: function (kapat) {
        UI.alanHatalariTemizle(izgara);
        var hataVar = false;
        var bilgi = Motor.atikKoduBilgi(ilkAtikKodu(aKod.girdi.value));
        if (!bilgi.bulundu) { UI.alanHata(aKod, "Geçerli bir Ek-4 atık kodu seçin/girin (NN NN NN)"); hataVar = true; }
        var raw = Motor.sayi(aMiktar.girdi.value);
        if (!(raw > 0)) { UI.alanHata(aMiktar, "Sıfırdan büyük bir miktar girin"); hataVar = true; }
        if (!String(aIslem.girdi.value || "").trim()) { UI.alanHata(aIslem, "İşleme yöntemi (R/D) girin"); hataVar = true; }
        var v = UI.degerler(izgara);
        if (noCakisiyor("atik", v.no, kayit ? kayit.no : null)) { UI.alanHata(aNo, "Bu numara başka bir atık kaydında kullanılıyor"); hataVar = true; }
        if (hataVar) { var ilkH = izgara.querySelector(".alan-hatali input, .alan-hatali select"); if (ilkH) ilkH.focus(); return; }
        var unit = aBirimOlcu.girdi.value || "kg";
        var yeni = {
          no: noBelirle("atik", "A", v.no),
          birimId: v.birimId || "",
          donem: v.donem || "",
          atikKodu: bilgi.kodNorm,
          atikAdi: bilgi.ad,
          miktar_t: unit === "ton" ? raw : raw / 1000,
          miktarBirim: unit,
          islemKodu: String(aIslem.girdi.value || "").toUpperCase().replace(/\s+/g, ""),
          islemYeri: v.islemYeri || "",
          beyanKontrolNo: v.beyanKontrolNo || "",
          aliciTesisKodu: v.aliciTesisKodu || "",
          atikYagKategori: v.atikYagKategori || "",
          aciklama: v.aciklama || "",
          veriKalite: v.veriKalite || ""
        };
        bittiginde(yeni); kapat();
      } }
    ]);
  }

  /* TABS Atık Beyan Formu satırlarını yapıştırarak toplu içe aktarma */
  function atikBeyanIceAktar(bittiginde) {
    var aBirimSec = birimAlaniOlustur(null);
    var ta = el("textarea", { class: "form-izgara", rows: 8,
      style: "width:100%;min-height:170px;font-family:monospace;font-size:12px",
      placeholder: "Her satır: ATIK_KODU ; MİKTAR(kg) ; İŞLEM(R/D) ; BEYAN_NO ; ALICI_KODU\n130208 ; 400 ; R9 ; 9233650 ; 110216\n150106 ; 3060 ; R12 ; 9233651 ; 98928" });
    var ozet = el("div", { class: "bilgi", style: "margin-top:10px" }, ["Yapıştırın; geçerli satır sayısı burada görünür."]);
    function ayikla() {
      var satirlar = String(ta.value || "").split(/\r?\n/).map(function (l) { return l.trim(); }).filter(Boolean);
      var kayitlar = [], hata = 0;
      satirlar.forEach(function (l) {
        var p = l.split(/[;\t|]/).map(function (x) { return x.trim(); }).filter(Boolean);
        var kodTok = null, islemTok = null, miktarTok = null;
        p.forEach(function (x) {
          if (!kodTok && /^\d{2}\s?\d{2}\s?\d{2}$|^\d{6}$/.test(x)) kodTok = x;
          else if (!islemTok && /^[RD]\d{1,2}$/i.test(x)) islemTok = x;
          else if (!miktarTok && /^[\d.,]+$/.test(x)) miktarTok = x;
        });
        var bilgi = Motor.atikKoduBilgi(kodTok);
        if (!bilgi.bulundu || !islemTok || !(Motor.sayi(miktarTok) > 0)) { hata++; return; }
        var kalan = p.filter(function (x) { return x !== kodTok && x !== islemTok && x !== miktarTok; });
        kayitlar.push({
          atikKodu: bilgi.kodNorm, atikAdi: bilgi.ad,
          miktar_t: Motor.sayi(miktarTok) / 1000, miktarBirim: "kg",
          islemKodu: islemTok.toUpperCase(),
          beyanKontrolNo: kalan[0] || "", aliciTesisKodu: kalan[1] || ""
        });
      });
      return { kayitlar: kayitlar, hata: hata };
    }
    ta.addEventListener("input", function () {
      var r = ayikla();
      ozet.className = "bilgi" + (r.kayitlar.length ? " yesil" : "");
      ozet.innerHTML = "<b>" + r.kayitlar.length + "</b> geçerli satır" +
        (r.hata ? " • " + r.hata + " satır atlanacak (eksik/geçersiz kod, işlem ya da miktar)" : "");
    });
    var govde = el("div", null, [
      el("div", { class: "bilgi" }, ["TABS Atık Beyan Formu satırlarını yapıştırın. Ayraç noktalı virgül, sekme ya da | olabilir. " +
        "Miktar kg kabul edilir (tona çevrilir). Kod ve işleme yöntemi (R/D) zorunlu; Beyan Kontrol No denetim kanıtı olarak saklanır. " +
        "Tüm satırlar aşağıda seçtiğiniz tesise (birim) yazılır."]),
      aBirimSec, ta, ozet
    ]);
    UI.modal("Atık Beyanı İçe Aktar", govde, [
      { etiket: "Vazgeç" },
      { etiket: "İçe Aktar", sinif: "birincil", tik: function (kapat) {
        var r = ayikla();
        if (!r.kayitlar.length) { ozet.className = "bilgi"; ozet.innerHTML = "Geçerli satır bulunamadı."; return; }
        var g = aBirimSec.querySelector ? aBirimSec.querySelector("[data-anahtar]") : null;
        var birimId = g ? g.value : "";
        r.kayitlar.forEach(function (k) {
          k.no = Depo.yeniNo("A", "atik");
          k.birimId = birimId;
          k.donem = "2025";
          k.veriKalite = "Birincil (beyan)";
          k.islemYeri = "Tesis Dışı";
          k.atikYagKategori = "";
          k.aciklama = "TABS Atık Beyanı içe aktarıldı" + (k.beyanKontrolNo ? " • Beyan No " + k.beyanKontrolNo : "");
          tazeDizi("atik").push(k);
        });
        UI.bildir(r.kayitlar.length + " atık kaydı içe aktarıldı" + (r.hata ? " (" + r.hata + " satır atlandı)" : ""));
        bittiginde(); kapat();
      } }
    ]);
  }

  function cizAtik(kok) {
    var liste = Depo.veri.atik || [];
    function yenile() { UI.ciz(); }

    UI.ustAksiyon(el("div", null, [
      el("button", { class: "btn ikincil", type: "button", style: "margin-right:8px", onclick: function () {
        atikBeyanIceAktar(function () { yenile(); });
      } }, ["⇪ Beyan İçe Aktar"]),
      el("button", { class: "btn birincil", type: "button", onclick: function () {
        atikFormu(null, function (v) { tazeDizi("atik").push(v); Depo.kaydet(); yenile(); });
      } }, ["+ Yeni Kayıt"])
    ]));

    kok.appendChild(el("div", { class: "bilgi" }, [
      "Atık kayıtları tesis bazlıdır ve TABS Atık Beyan Formlarına dayanır (kanıt: Beyan Kontrol No). " +
      "Tehlikelilik atık kodundaki yıldızdan (Ek-4), geri dönüşüm sayımı işleme yönteminden (R/D) türetilir: " +
      "R2–R11 sayılır; R1/R12/R13 ve D kodları sayılmaz."
    ]));

    var T = Motor.toplamlar(), A = T.atik;
    if (A.uyari && A.uyari.length) {
      kok.appendChild(el("div", { class: "bilgi", style: "border-left-color:var(--oksit,#B4642D)" }, [
        el("b", null, [A.uyari.length + " kayıt işlem kodu uyarısı taşıyor (geri dönüşüme sayılmadı). "]),
        el("span", { style: "font-size:12px;color:var(--soluk)" }, [UI.kisalt(A.uyari.join(" • "), 260)])
      ]));
    }

    birimSeciciCiz(kok, liste);
    var gosterilen = birimSuz(liste);
    kok.appendChild(UI.kart("Atık Kayıtları", [
      UI.veriTablo({
        satirlar: gosterilen,
        bosMesaj: liste.length ? "Seçili birimde (ve alt birimlerinde) kayıt yok."
          : "Henüz atık kaydı yok. Sağ üstteki “+ Yeni Kayıt” veya “⇪ Beyan İçe Aktar” ile başlayın.",
        sutunlar: [
          { etiket: "No", deger: function (s) { return s.no; } },
          indeksBirimleri().length ? birimKolonu() : null,
          { etiket: "Kod", deger: function (s) { return s.atikKodu; } },
          { etiket: "Atık", deger: function (s) { return UI.kisalt(s.atikAdi || Motor.atikKoduBilgi(s.atikKodu).ad, 34); } },
          { etiket: "Miktar (t)", sinif: "sayi", deger: function (s) { return Motor.fmt(Motor.sayi(s.miktar_t), 3); } },
          { etiket: "Tehlikeli", deger: function (s) {
            return Motor.atikKoduBilgi(s.atikKodu).tehlikeli
              ? el("span", { class: "rozet uyari" }, ["T"]) : el("span", { style: "color:var(--soluk)" }, ["—"]);
          } },
          { etiket: "İşlem", deger: function (s) {
            var si = Motor.atikIslemSinifi(s.islemKodu);
            return el("span", { title: si.durum + (si.uyari ? " — " + si.uyari : "") }, [s.islemKodu || "—"]);
          } },
          { etiket: "Geri dön.", deger: function (s) {
            var si = Motor.atikIslemSinifi(s.islemKodu);
            return si.sayilir ? el("b", { title: si.durum }, [si.isaretli ? "✓!" : "✓"]) : el("span", { style: "color:var(--soluk)", title: si.durum }, ["✗"]);
          } }
        ],
        islemler: [
          { etiket: "Düzenle", tik: function (s) {
            atikFormu(s, function (v) { tazeGuncelleNoIle("atik", s.no, v); Depo.kaydet(); yenile(); });
          } },
          { etiket: "Sil", sinif: "tehlike", tik: function (s) {
            UI.onayla("“" + (s.no || "") + " — " + (s.atikKodu || "") + "” kaydı silinsin mi?", function () {
              var ix = tazeIndeks("atik", s.no);
              if (ix > -1) { tazeDizi("atik").splice(ix, 1); Depo.kaydet(); }
              yenile();
            });
          } }
        ]
      })
    ], { mini: liste.length + " kayıt • toplam " + Motor.fmt(A.toplam_t, 3) + " t" }));

    if (A.kayit) {
      var kodSatir = Object.keys(A.koda).map(function (k) { return { kod: k, t: A.koda[k] }; })
        .sort(function (a, b) { return b.t - a.t; });
      var tesisSatir = Object.keys(A.tesise).map(function (k) { return { t: k, v: A.tesise[k] }; })
        .sort(function (a, b) { return b.v - a.v; });
      kok.appendChild(UI.kart("Kırılımlar ve Yüzdeler", [
        el("div", { class: "bilgi" + (A.toplam_t > 0 ? " yesil" : "") }, [
          "Toplam " + Motor.fmt(A.toplam_t, 3) + " t • Tehlikeli %" +
          (A.toplam_t > 0 ? Motor.fmt(A.tehlikeli_t / A.toplam_t * 100, 1) : "0") + " (" + Motor.fmt(A.tehlikeli_t, 3) + " t) • Geri dönüşüm %" +
          (A.toplam_t > 0 ? Motor.fmt(A.geriDonusum_t / A.toplam_t * 100, 1) : "0") + " (" + Motor.fmt(A.geriDonusum_t, 3) + " t)" +
          (A.araIslem_t > 0 ? " • Ara işlemde (R12/R13, sayılmadı) " + Motor.fmt(A.araIslem_t, 3) + " t" : "") +
          (A.kodBulunamadi ? " • " + A.kodBulunamadi + " kayıtta kod katalogda yok" : "")
        ]),
        el("div", { style: "font-weight:600;margin:10px 0 4px" }, ["Atık koduna göre"]),
        UI.veriTablo({
          satirlar: kodSatir, bosMesaj: "—",
          sutunlar: [
            { etiket: "Kod", deger: function (r) { return r.kod; } },
            { etiket: "Ad", deger: function (r) { return UI.kisalt(Motor.atikKoduBilgi(r.kod).ad, 46); } },
            { etiket: "Miktar (t)", sinif: "sayi", deger: function (r) { return Motor.fmt(r.t, 3); } },
            { etiket: "Pay", sinif: "sayi", deger: function (r) { return A.toplam_t > 0 ? "%" + Motor.fmt(r.t / A.toplam_t * 100, 1) : "—"; } }
          ]
        }),
        el("div", { style: "font-weight:600;margin:14px 0 4px" }, ["Tesise göre"]),
        UI.veriTablo({
          satirlar: tesisSatir, bosMesaj: "—",
          sutunlar: [
            { etiket: "Tesis", deger: function (r) { return (birimAdi(r.t) || r.t); } },
            { etiket: "Miktar (t)", sinif: "sayi", deger: function (r) { return Motor.fmt(r.v, 3); } },
            { etiket: "Pay", sinif: "sayi", deger: function (r) { return A.toplam_t > 0 ? "%" + Motor.fmt(r.v / A.toplam_t * 100, 1) : "—"; } }
          ]
        })
      ], { mini: "kod / tesis / tehlikelilik" }));
    }
  }

  /* ============================================================
     SAYFA: KAPSAM 2 — ELEKTRİK
     ============================================================ */
  function elektrikFormu(kayit, bittiginde) {
    var s = Object.assign({ sebeke: "Türkiye Ulusal Şebeke (Dağıtım)" }, kayit || {});
    var izgara = el("div", { class: "form-izgara" });
    var onizleme = el("div", { class: "bilgi", style: "margin:16px 0 0" });

    var aNo = noAlaniOlustur(s.no, "E");
    var aBirimSec = birimAlaniOlustur(kayit ? (s.birimId || "") : null);
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
      // REC, tüketimden büyükse motor sessizce kırpar — kullanıcıya açıkça söylenir
      var kwhS = Motor.sayi(v.kwh), recS = Motor.sayi(v.recKwh);
      UI.alanHata(aRec, (recS > kwhS && kwhS > 0)
        ? "REC miktarı tüketimden büyük olamaz; hesapta " + Motor.fmt(kwhS, 0) + " kWh olarak kırpılacak." : "");
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
    [aNo, aBirimSec, aAd, aSeb, aKwh, aSoz, aRec, aTed, aDonem, aNot].forEach(function (a) { izgara.appendChild(a); });
    var govde = el("div", null, [izgara, onizleme]);
    onizle();

    UI.modal(kayit ? "Kaydı Düzenle — " + (kayit.no || "") : "Yeni Elektrik Kaydı", govde, [
      { etiket: "Vazgeç" },
      { etiket: "Kaydet", sinif: "birincil", tik: function (kapat) {
        var v = UI.degerler(izgara);
        UI.alanHatalariTemizle(izgara);
        var hataVar = false;
        if (!String(v.tesis || "").trim()) { UI.alanHata(aAd, "Tesis / sayaç adı zorunludur"); hataVar = true; }
        if (!v.sebeke) { UI.alanHata(aSeb, "Şebeke seçin"); hataVar = true; }
        if (!v.kwh || !(Motor.sayi(v.kwh) > 0)) { UI.alanHata(aKwh, "Sıfırdan büyük tüketim (kWh) girin"); hataVar = true; }
        if (noCakisiyor("elektrik", v.no, kayit ? kayit.no : null)) {
          UI.alanHata(aNo, "Bu numara başka bir elektrik kaydında kullanılıyor"); hataVar = true;
        }
        if (hataVar) { var ilkH = izgara.querySelector(".alan-hatali input, .alan-hatali select"); if (ilkH) ilkH.focus(); return; }
        v.no = noBelirle("elektrik", "E", v.no);
        bittiginde(v); kapat();
      } }
    ]);
  }

  function cizElektrik(kok) {
    var liste = Depo.veri.elektrik;
    UI.ustAksiyon(el("button", { class: "btn birincil", type: "button", onclick: function () {
      elektrikFormu(null, function (v) { tazeDizi("elektrik").push(v); Depo.kaydet(); UI.ciz(); });
    } }, ["+ Yeni Kayıt"]));

    kok.appendChild(el("div", { class: "bilgi" },
      ["TSRS 2 md. 29(a)(ii) uyarınca Kapsam 2 hem Lokasyona Dayalı (şebeke ortalama EF) hem Piyasaya Dayalı (sözleşmeye özgü EF; REC'li tüketim sıfır) yaklaşımla raporlanır. İki sütun da otomatik hesaplanır."]));

    var eHatalar = Motor.toplamlar().hatalar.filter(function (h) { return /^E-/.test(h); });
    if (eHatalar.length) {
      kok.appendChild(el("div", { class: "bilgi", style: "border-left-color:var(--oksit,#B4642D)" }, [
        el("b", null, [eHatalar.length + " kayıt hesaplanamıyor ve toplamlara GİRMİYOR. "]),
        el("span", { style: "font-size:12px;color:var(--soluk)" }, [UI.kisalt(eHatalar.join(" • "), 220)])
      ]));
    }

    birimSeciciCiz(kok, liste);
    var gosterilen = birimSuz(liste);
    kok.appendChild(UI.kart("Elektrik Tüketim Kayıtları", [
      UI.veriTablo({
        satirlar: gosterilen,
        bosMesaj: liste.length
          ? "Seçili birimde (ve alt birimlerinde) kayıt yok."
          : "Henüz kayıt yok. Tesis veya sayaç bazında elektrik tüketimlerini ekleyin.",
        sutunlar: [
          { etiket: "No", deger: function (s) { return s.no; } },
          indeksBirimleri().length ? birimKolonu() : null,
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
          { etiket: "Düzenle", tik: function (s) {
            elektrikFormu(s, function (v) { tazeGuncelleNoIle("elektrik", s.no, v); Depo.kaydet(); UI.ciz(); });
          } },
          { etiket: "Sil", sinif: "tehlike", tik: function (s, i) {
            UI.onayla("\u201C" + (s.no || "") + " — " + (s.tesis || "") + "\u201D silinsin mi?", function () {
              var ix = tazeIndeks("elektrik", s.no);
              if (ix > -1) { tazeDizi("elektrik").splice(ix, 1); Depo.kaydet(); }
              UI.ciz();
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
              // Kayıt anında taze modül verisi çözülür (uzaktan yenileme sonrası bayat referansa yazılmaz)
              modulKayitFormu(m, s, function (v) { Depo.modulVeri(m.id).kayitlar[i] = v; Depo.kaydet(); UI.ciz(); });
            } },
            { etiket: "Sil", sinif: "tehlike", tik: function (s, i) {
              UI.onayla("Bu kayıt silinsin mi?", function () { Depo.modulVeri(m.id).kayitlar.splice(i, 1); Depo.kaydet(); UI.ciz(); });
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
