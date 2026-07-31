/* ============================================================================
   YÖNETİM PANELİ — Kod yazmadan her şeyi düzenleme merkezi
   • Emisyon Faktörleri : referans tablolarına satır ekle / düzenle / sil
   • Açılır Listeler    : formlardaki seçeneklere ekleme / çıkarma
   • Form Alanları      : TSRS modüllerine sütun ve metin alanı ekleme
   • Görünüm ve Metinler: başlık, metodoloji beyanı, kılavuz adımları
   • Yedekleme          : JSON yedek alma / yükleme / sıfırlama
   Düzenlemeler tarayıcıda saklanır; "Kalıcı dosya indir" ile data/ klasörüne
   koyulabilir .js dosyası üretilir (böylece her bilgisayarda geçerli olur).
   ============================================================================ */
"use strict";
window.Admin = (function () {
  var A = {};
  var el = function () { return UI.el.apply(null, arguments); };
  var aktifSekme = "ef";
  var aktifSet = "ef_sabit_yanma";
  var aramaMetni = "";

  /* Düzenlenebilir veri setleri kataloğu */
  var SETLER = [
    { ad: "ef_sabit_yanma",  baslik: "Sabit Yanma Yakıtları (IPCC)",      dosya: "ef_sabit_yanma.js" },
    { ad: "ef_mobil_yakit",  baslik: "Mobil Yanma — Yakıt Bazlı EF",      dosya: "ef_mobil_yakit.js" },
    { ad: "ef_mobil_mesafe", baslik: "Mobil Yanma — Mesafe Bazlı EF",     dosya: "ef_mobil_mesafe.js" },
    { ad: "ef_tasimacilik",  baslik: "Yük Taşımacılığı EF",               dosya: "ef_tasimacilik.js" },
    { ad: "ef_toplu_tasima", baslik: "Toplu Taşıma / Yolcu EF",           dosya: "ef_toplu_tasima.js" },
    { ad: "ef_elektrik",     baslik: "Elektrik Şebeke EF",                dosya: "ef_elektrik.js" },
    { ad: "kip_ar5",         baslik: "KIP / GWP Değerleri (IPCC AR5)",    dosya: "kip_ar5.js" },
    { ad: "kacak_oranlari",  baslik: "Varsayılan Kaçak Oranları",         dosya: "kacak_oranlari.js" },
    { ad: "yakit_ekonomisi", baslik: "Yakıt Ekonomisi Varsayılanları",    dosya: "yakit_ekonomisi.js" }
  ];

  function kopya(x) { return JSON.parse(JSON.stringify(x)); }
  /* Hücre değerini sayıya çevirir; TR (1.234,56) ve EN (1,234.56) biçimlerini tanır.
     Sayı olmayan metinler (yakıt adı vb.) olduğu gibi kalır. Eski sürüm tuzağı:
     "1.234,56" NaN kalıp STRING kaydediliyor, motor bunu 1.234 okuyordu (~1000×). */
  function sayilastir(v) {
    if (typeof v !== "string") return v;
    var t = v.trim();
    if (t === "") return "";
    /* baştaki sıfırlı kodları (örn. "07.29") sayıya çevirme */
    if (/^0\d/.test(t)) return v;
    var norm = t.replace(/\s/g, "");
    if (norm.indexOf(",") > -1) {
      if (norm.lastIndexOf(",") > norm.lastIndexOf(".")) norm = norm.replace(/\./g, "").replace(/,/g, ".");
      else norm = norm.replace(/,/g, "");
    }
    var n = Number(norm);
    return (isFinite(n) && norm !== "") ? n : v;
  }

  function yonetici() { return !!(window.Depo && Depo.aktifKullanici && Depo.aktifKullanici.rol === "admin"); }

  A.ciz = function (kok) {
    var sekmeler = [
      { id: "ef",      ad: "Emisyon Faktörleri" },
      { id: "liste",   ad: "Açılır Listeler" },
      { id: "form",    ad: "Form Alanları" },
      { id: "gorunum", ad: "Görünüm ve Metinler" },
      { id: "yedek",   ad: "Yedekleme" }
    ];
    if (yonetici()) sekmeler.push({ id: "kullanicilar", ad: "Kullanıcılar" });

    // Referans/ayar düzenlemeleri tüm ekip için ortaktır ve yalnız yönetici kaydedebilir.
    if (!yonetici()) {
      kok.appendChild(el("div", { class: "bilgi", style: "border-left-color:var(--oksit,#B4642D)" }, [
        "Bu panel referans tablolarını, listeleri ve form alanlarını TÜM ekip için düzenler. " +
        "Değişiklikleri yalnızca yönetici hesapları kaydedebilir; sizde görüntüleme amaçlıdır. " +
        "Yedekleme ve şirket paketi işlemlerini kullanabilirsiniz."
      ]));
    }

    var gecerli = sekmeler.some(function (s) { return s.id === aktifSekme; });
    if (!gecerli) aktifSekme = "ef";

    var sekmeBari = el("div", { class: "sekmeler" }, sekmeler.map(function (s) {
      return el("button", { class: "sekme" + (aktifSekme === s.id ? " aktif" : ""), type: "button",
        onclick: function () { aktifSekme = s.id; UI.ciz(); } }, [s.ad]);
    }));
    kok.appendChild(sekmeBari);
    var govde = el("div");
    kok.appendChild(govde);
    ({ ef: sekmeEF, liste: sekmeListe, form: sekmeForm, gorunum: sekmeGorunum,
       yedek: sekmeYedek, kullanicilar: sekmeKullanicilar }[aktifSekme])(govde);
  };

  /* ============================================================
     SEKME 6 — KULLANICILAR (yalnız yönetici)
     Kayıt olan kullanıcıları onaylama / rol atama.
     ============================================================ */
  function sekmeKullanicilar(kok) {
    kok.appendChild(el("div", { class: "bilgi" }, [
      "Kayıt olan kullanıcıları buradan onaylayın. Onaysız kullanıcı giriş yapabilir ama müşteri verilerine erişemez. " +
      "Yönetici rolü; referans düzenleme, müşteri silme ve kullanıcı onaylama yetkisi verir."
    ]));
    var kart = UI.kart("Kayıtlı Kullanıcılar", [el("div", null, ["Yükleniyor…"])]);
    kok.appendChild(kart);
    var govde = kart.querySelector(".kart-ic");

    function yenile() {
      SB.from("profiles").select("id,email,ad_soyad,rol,onayli,created_at")
        .order("created_at", { ascending: true }).then(function (q) {
          govde.innerHTML = "";
          if (q.error) { govde.appendChild(el("div", { class: "bilgi", style: "border-left-color:var(--oksit)" },
            ["Liste alınamadı: " + UI.kacir(q.error.message)])); return; }
          var satirlar = q.data || [];
          govde.appendChild(UI.veriTablo({
            satirlar: satirlar,
            bosMesaj: "Henüz kayıtlı kullanıcı yok.",
            sutunlar: [
              { etiket: "E-posta", deger: function (u) { return u.email; } },
              { etiket: "Ad Soyad", deger: function (u) { return u.ad_soyad || "—"; } },
              { etiket: "Rol", deger: function (u) { return u.rol === "admin"
                  ? el("span", { class: "rozet", style: "background:#B4642D;color:#fff" }, ["yönetici"])
                  : "kullanıcı"; } },
              { etiket: "Durum", deger: function (u) { return u.onayli
                  ? el("span", { class: "rozet", style: "background:#1F7A63;color:#fff" }, ["onaylı"])
                  : el("span", { class: "rozet", style: "background:#9aa0a6;color:#fff" }, ["bekliyor"]); } }
            ],
            islemler: [
              { etiket: "Onayla/Kaldır", tik: function (u) {
                  SB.from("profiles").update({ onayli: !u.onayli }).eq("id", u.id).then(function (r) {
                    if (r.error) UI.bildir(r.error.message, true);
                    else { UI.bildir(u.onayli ? "Onay kaldırıldı" : "Kullanıcı onaylandı"); yenile(); }
                  });
                } },
              { etiket: "Rol değiştir", sinif: "ikincil", tik: function (u) {
                  var yeniRol = u.rol === "admin" ? "kullanici" : "admin";
                  UI.onayla("“" + UI.kacir(u.email) + "” için rol “" + yeniRol + "” olsun mu?", function () {
                    SB.from("profiles").update({ rol: yeniRol, onayli: true }).eq("id", u.id).then(function (r) {
                      if (r.error) UI.bildir(r.error.message, true);
                      else { UI.bildir("Rol güncellendi"); yenile(); }
                    });
                  });
                } }
            ]
          }));
        });
    }
    yenile();
  }

  /* ============================================================
     SEKME 1 — EMİSYON FAKTÖRLERİ
     ============================================================ */
  function sekmeEF(kok) {
    var setBilgi = SETLER.filter(function (s) { return s.ad === aktifSet; })[0] || SETLER[0];
    var satirlar = Depo.set(setBilgi.ad);
    var sutunlar = satirlar.length ? Object.keys(satirlar[0]) : [];
    /* tüm satırlardaki anahtarların birleşimi */
    satirlar.forEach(function (r) {
      Object.keys(r).forEach(function (k) { if (sutunlar.indexOf(k) < 0) sutunlar.push(k); });
    });

    kok.appendChild(el("div", { class: "bilgi" }, [
      "Buradaki değerler hesaplara anında yansır. Düzenlemeler bu tarayıcıda saklanır; tüm bilgisayarlarda geçerli olması için \u201CKalıcı dosya indir\u201D ile üretilen dosyayı uygulamanın data/ klasöründeki aynı adlı dosyanın üzerine kopyalayın."
    ]));

    var setSec = el("select", { style: "font:inherit;font-size:13px;padding:7px 10px;border:1px solid #C8CBC3;border-radius:var(--radius);background:var(--yuzey)" });
    SETLER.forEach(function (s) {
      setSec.appendChild(el("option", { value: s.ad }, [s.baslik + (Depo.setDegistiMi(s.ad) ? " (düzenlendi)" : "")]));
    });
    setSec.value = setBilgi.ad;
    setSec.addEventListener("change", function () { aktifSet = setSec.value; aramaMetni = ""; UI.ciz(); });

    var arama = el("input", { type: "search", placeholder: "Ara: yakıt, araç, gaz adı…", value: aramaMetni });
    arama.addEventListener("input", function () { aramaMetni = arama.value; tabloTazele(); });

    function satirDuzenle(satir, indeks) {
      var izgara = el("div", { class: "form-izgara" });
      sutunlar.forEach(function (k) {
        izgara.appendChild(UI.alan({ anahtar: k, etiket: k, tip: "metin",
          deger: satir ? (satir[k] == null ? "" : satir[k]) : "" }));
      });
      UI.modal((satir ? "Satırı Düzenle" : "Yeni Satır") + " — " + setBilgi.baslik, izgara, [
        { etiket: "Vazgeç" },
        { etiket: "Kaydet", sinif: "birincil", tik: function (kapat) {
          var v = UI.degerler(izgara), yeni = {};
          sutunlar.forEach(function (k) { yeni[k] = sayilastir(v[k]); });
          var tum = kopya(Depo.set(setBilgi.ad));
          if (satir) tum[indeks] = yeni; else tum.push(yeni);
          Depo.setKaydet(setBilgi.ad, tum);
          UI.bildir("Tablo güncellendi — hesaplara yansıdı");
          kapat(); UI.ciz();
        } }
      ], 980);
    }

    var tabloKap = el("div");
    function tabloTazele() {
      var q = aramaMetni.trim().toLowerCase();
      var gorunen = [];
      Depo.set(setBilgi.ad).forEach(function (r, i) {
        if (!q || Object.keys(r).some(function (k) {
          return String(r[k] == null ? "" : r[k]).toLowerCase().indexOf(q) > -1;
        })) gorunen.push({ r: r, i: i });
      });
      tabloKap.innerHTML = "";
      var gosterSutun = sutunlar.slice(0, 7);
      tabloKap.appendChild(UI.veriTablo({
        satirlar: gorunen,
        bosMesaj: q ? "Aramayla eşleşen satır yok." : "Bu tablo boş. \u201C+ Satır Ekle\u201D ile başlayın.",
        sutunlar: gosterSutun.map(function (k) {
          return { etiket: k, deger: function (g) {
            var d = g.r[k];
            return d == null || d === "" ? "—" : UI.kisalt(String(d), 26);
          } };
        }),
        islemler: [
          { etiket: "Düzenle", tik: function (g) { satirDuzenle(g.r, g.i); } },
          { etiket: "Sil", sinif: "tehlike", tik: function (g) {
            UI.onayla("Bu satır tablodan silinsin mi? (Hesaplar etkilenebilir)", function () {
              var tum = kopya(Depo.set(setBilgi.ad));
              tum.splice(g.i, 1);
              Depo.setKaydet(setBilgi.ad, tum);
              UI.ciz();
            });
          } }
        ]
      }));
      sayac.textContent = gorunen.length + " / " + Depo.set(setBilgi.ad).length + " satır" +
        (gosterSutun.length < sutunlar.length ? " • tabloda ilk " + gosterSutun.length + " sütun gösteriliyor, düzenlemede tümü açılır" : "");
    }

    var sayac = el("span", { class: "veri-sayac" });
    var araclar = el("div", { class: "admin-arac" }, [
      setSec, arama,
      el("button", { class: "btn birincil kucuk", type: "button", onclick: function () { satirDuzenle(null); } }, ["+ Satır Ekle"]),
      el("button", { class: "btn ikincil kucuk", type: "button", onclick: function () {
        Depo.refDosyaUret(setBilgi.ad, setBilgi.dosya, setBilgi.baslik);
        UI.bildir("Dosya indirildi: data/" + setBilgi.dosya + " üzerine kopyalayın");
      } }, ["⬇ Kalıcı dosya indir"]),
      Depo.setDegistiMi(setBilgi.ad) ? el("button", { class: "btn tehlike kucuk", type: "button", onclick: function () {
        UI.onayla("\u201C" + setBilgi.baslik + "\u201D tablosundaki düzenlemeleriniz silinip data/ klasöründeki orijinal değerlere dönülsün mü?", function () {
          Depo.setVarsayilan(setBilgi.ad); UI.ciz();
        });
      } }, ["Varsayılana dön"]) : null,
      sayac
    ]);

    kok.appendChild(UI.kart(setBilgi.baslik + (Depo.setDegistiMi(setBilgi.ad) ? "  •  düzenlendi" : ""), [araclar, tabloKap]));
    tabloTazele();
  }

  /* ============================================================
     SEKME 2 — AÇILIR LİSTELER
     ============================================================ */
  var aktifListe = "faaliyet_kategorisi";
  var aktifBirimKat = "";
  function sekmeListe(kok) {
    kok.appendChild(el("div", { class: "bilgi" }, [
      "Formlardaki seçim kutularının seçenekleri burada. Her satıra bir seçenek yazın; kaydettiğinizde formlara anında yansır. Not: Faaliyet kategorileri ve hesap yöntemleri hesaplama mantığına bağlıdır; bunlarda mevcut adları değiştirmek yerine yenilerini eklemeniz önerilir."
    ]));

    var L = VERI.listeler || {};
    var adlar = Object.keys(L).filter(function (k) { return k !== "birimler"; });

    /* --- normal listeler --- */
    var sec = el("select", { style: "font:inherit;font-size:13px;padding:7px 10px;border:1px solid #C8CBC3;border-radius:var(--radius);background:var(--yuzey)" });
    adlar.forEach(function (a) {
      sec.appendChild(el("option", { value: a }, [a + (Depo.listeOzel[a] ? " (düzenlendi)" : "")]));
    });
    if (adlar.indexOf(aktifListe) < 0) aktifListe = adlar[0];
    sec.value = aktifListe;
    var alanT = el("textarea", { rows: "10", style: "width:100%;font:inherit;font-size:13px;padding:10px;border:1px solid #C8CBC3;border-radius:var(--radius)",
      value: Depo.liste(aktifListe).join("\n") });
    sec.addEventListener("change", function () {
      aktifListe = sec.value;
      alanT.value = Depo.liste(aktifListe).join("\n");
    });

    kok.appendChild(UI.kart("Liste Düzenle", [
      el("div", { class: "admin-arac" }, [sec,
        el("button", { class: "btn birincil kucuk", type: "button", onclick: function () {
          var secenekler = alanT.value.split("\n").map(function (s) { return s.trim(); }).filter(Boolean);
          Depo.listeOzel[aktifListe] = secenekler;
          Depo.konfigKaydet(); UI.bildir("\u201C" + aktifListe + "\u201D listesi güncellendi");
        } }, ["Kaydet"]),
        el("button", { class: "btn tehlike kucuk", type: "button", onclick: function () {
          delete Depo.listeOzel[aktifListe]; Depo.konfigKaydet();
          alanT.value = Depo.liste(aktifListe).join("\n");
          UI.bildir("Varsayılana dönüldü");
        } }, ["Varsayılana dön"])
      ]),
      el("div", { class: "alan" }, [el("label", null, ["Seçenekler (her satıra bir tane)"]), alanT])
    ]));

    /* --- kategoriye göre birimler --- */
    var B = Object.assign({}, (L.birimler || {}), (Depo.listeOzel.birimler || {}));
    var katlar = Object.keys(B);
    if (!aktifBirimKat || katlar.indexOf(aktifBirimKat) < 0) aktifBirimKat = katlar[0];
    var bSec = el("select", { style: "font:inherit;font-size:13px;padding:7px 10px;border:1px solid #C8CBC3;border-radius:var(--radius);background:var(--yuzey)" });
    katlar.forEach(function (k) { bSec.appendChild(el("option", { value: k }, [k])); });
    bSec.value = aktifBirimKat;
    var bT = el("textarea", { rows: "5", style: "width:100%;font:inherit;font-size:13px;padding:10px;border:1px solid #C8CBC3;border-radius:var(--radius)",
      value: (B[aktifBirimKat] || []).join("\n") });
    bSec.addEventListener("change", function () {
      aktifBirimKat = bSec.value;
      var G = Object.assign({}, (VERI.listeler.birimler || {}), (Depo.listeOzel.birimler || {}));
      bT.value = (G[aktifBirimKat] || []).join("\n");
    });
    kok.appendChild(UI.kart("Kategoriye Göre Birimler", [
      el("p", { style: "margin:0 0 12px;font-size:12.5px;color:var(--soluk)" },
        ["Faaliyet formundaki birim seçenekleri kategoriye göre değişir. Yeni birim eklerseniz hesabın o birimi tanıması gerekir (km, mil, L, US Gallon, tonne, kg, GJ, kWh, MWh, ton-km, yolcu-km destekli)."]),
      el("div", { class: "admin-arac" }, [bSec,
        el("button", { class: "btn birincil kucuk", type: "button", onclick: function () {
          var G = kopya(Object.assign({}, (VERI.listeler.birimler || {}), (Depo.listeOzel.birimler || {})));
          G[aktifBirimKat] = bT.value.split("\n").map(function (s) { return s.trim(); }).filter(Boolean);
          Depo.listeOzel.birimler = G;
          Depo.konfigKaydet(); UI.bildir("Birimler güncellendi");
        } }, ["Kaydet"])
      ]),
      el("div", { class: "alan" }, [el("label", null, ["Birimler (her satıra bir tane)"]), bT])
    ]));
  }

  /* ============================================================
     SEKME 3 — FORM ALANLARI (TSRS modül tanımları)
     ============================================================ */
  var aktifModul = "yonetisim";
  function anahtarUret(etiket) {
    var donusum = { "ç": "c", "ğ": "g", "ı": "i", "ö": "o", "ş": "s", "ü": "u", "İ": "i" };
    return String(etiket || "alan").toLowerCase()
      .replace(/[çğıöşüİ]/g, function (c) { return donusum[c] || c; })
      .replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "").slice(0, 30) || "alan";
  }
  function tanimlariKlonla() {
    if (!Depo.modulTanimOzel) Depo.modulTanimOzel = kopya(VERI.tsrs_modulleri || []);
    return Depo.modulTanimOzel;
  }
  function sekmeForm(kok) {
    kok.appendChild(el("div", { class: "bilgi" }, [
      "TSRS modüllerinin tablolarına sütun, sayfalarına yeni metin alanı buradan eklenir. Eklediğiniz alan ilgili sayfada anında belirir; eski kayıtlardaki veriler kaybolmaz."
    ]));
    var tanimlar = Depo.modulTanimlari();
    var m = tanimlar.filter(function (x) { return x.id === aktifModul; })[0] || tanimlar[0];
    if (!m) { kok.appendChild(el("p", null, ["Modül tanımı bulunamadı."])); return; }
    aktifModul = m.id;

    var sec = el("select", { style: "font:inherit;font-size:13px;padding:7px 10px;border:1px solid #C8CBC3;border-radius:var(--radius);background:var(--yuzey)" });
    tanimlar.forEach(function (x) { sec.appendChild(el("option", { value: x.id }, [x.baslik])); });
    sec.value = m.id;
    sec.addEventListener("change", function () { aktifModul = sec.value; UI.ciz(); });

    kok.appendChild(UI.kart("Düzenlenecek Modül", [
      el("div", { class: "admin-arac" }, [sec,
        Depo.modulTanimOzel ? el("button", { class: "btn tehlike kucuk", type: "button", onclick: function () {
          UI.onayla("TÜM modüllerin form tanımları orijinal hâline döndürülsün mü? (Girilmiş veriler silinmez.)", function () {
            Depo.modulTanimOzel = null; Depo.konfigKaydet(); UI.ciz();
          });
        } }, ["Tüm tanımları varsayılana döndür"]) : null
      ])
    ]));

    /* başlık metinleri */
    function metaAlan(anahtar, etiket, tip) {
      return UI.alan({ anahtar: anahtar, etiket: etiket, tip: tip || "metin", deger: m[anahtar],
        degisti: function (e) {
          var t = tanimlariKlonla();
          t.forEach(function (x) { if (x.id === m.id) x[anahtar] = e.target.value; });
          Depo.konfigKaydet(); UI.bildir("Kaydedildi");
        } });
    }
    kok.appendChild(UI.kart("Sayfa Başlığı ve Açıklaması", [el("div", { class: "form-izgara" }, [
      metaAlan("baslik", "Sayfa Başlığı"),
      metaAlan("referans", "Standart Referansı"),
      metaAlan("aciklama", "Sayfa Üstü Açıklama", "uzun_metin")
    ])]));

    /* sütun düzenleme */
    function sutunFormu(su, indeks) {
      var izgara = el("div", { class: "form-izgara" }, [
        UI.alan({ anahtar: "etiket", etiket: "Sütun Başlığı", tip: "metin", zorunlu: true, deger: su ? su.etiket : "" }),
        UI.alan({ anahtar: "tip", etiket: "Alan Tipi", tip: "secim",
          liste: ["metin", "uzun_metin", "sayi", "tarih", "secim"], deger: su ? su.tip : "metin" }),
        UI.alan({ anahtar: "liste", etiket: "Liste Adı (tip 'secim' ise)", tip: "metin",
          deger: su && typeof su.liste === "string" ? su.liste : (su && Array.isArray(su.liste) ? su.liste.join(" | ") : ""),
          yardim: "Bir liste adı (örn. zaman_dilimi) ya da | ile ayrılmış seçenekler" })
      ]);
      UI.modal(su ? "Sütunu Düzenle" : "Yeni Sütun — " + (m.tablo.etiket || m.baslik), izgara, [
        { etiket: "Vazgeç" },
        { etiket: "Kaydet", sinif: "birincil", tik: function (kapat) {
          var v = UI.degerler(izgara);
          if (!v.etiket) { UI.bildir("Sütun başlığı girin", true); return; }
          var t = tanimlariKlonla();
          t.forEach(function (x) {
            if (x.id !== m.id) return;
            if (!x.tablo) x.tablo = { etiket: "Kayıtlar", sutunlar: [] };
            var yeni = {
              anahtar: su ? su.anahtar : anahtarUret(v.etiket),
              etiket: v.etiket, tip: v.tip || "metin"
            };
            if (yeni.tip === "secim" && v.liste) {
              yeni.liste = v.liste.indexOf("|") > -1
                ? v.liste.split("|").map(function (s) { return s.trim(); }).filter(Boolean)
                : v.liste.trim();
            }
            if (su) x.tablo.sutunlar[indeks] = yeni; else x.tablo.sutunlar.push(yeni);
          });
          Depo.konfigKaydet(); UI.bildir("Form güncellendi"); kapat(); UI.ciz();
        } }
      ]);
    }
    var sutunlar = (m.tablo && m.tablo.sutunlar) || [];
    kok.appendChild(UI.kart("Tablo Sütunları" + (m.tablo ? " — " + m.tablo.etiket : ""), [
      UI.veriTablo({
        satirlar: sutunlar,
        bosMesaj: "Bu modülde tablo yok. \u201C+ Sütun Ekle\u201D ile oluşturabilirsiniz.",
        sutunlar: [
          { etiket: "Başlık", deger: function (s) { return s.etiket; } },
          { etiket: "Tip", deger: function (s) { return s.tip; } },
          { etiket: "Liste", deger: function (s) { return s.liste ? (Array.isArray(s.liste) ? s.liste.join(", ") : s.liste) : "—"; } }
        ],
        islemler: [
          { etiket: "Düzenle", tik: function (s, i) { sutunFormu(s, i); } },
          { etiket: "Sil", sinif: "tehlike", tik: function (s, i) {
            UI.onayla("\u201C" + s.etiket + "\u201D sütunu kaldırılsın mı? (Eski kayıtlardaki değerler saklanır ama görünmez.)", function () {
              var t = tanimlariKlonla();
              t.forEach(function (x) { if (x.id === m.id && x.tablo) x.tablo.sutunlar.splice(i, 1); });
              Depo.konfigKaydet(); UI.ciz();
            });
          } }
        ]
      })
    ], { sag: el("button", { class: "btn birincil kucuk", type: "button", onclick: function () { sutunFormu(null); } }, ["+ Sütun Ekle"]) }));

    /* anlatı alanları */
    function anlatFormu(a, indeks) {
      var izgara = el("div", { class: "form-izgara" }, [
        UI.alan({ anahtar: "etiket", etiket: "Alan Başlığı", tip: "metin", zorunlu: true, deger: a ? a.etiket : "" }),
        UI.alan({ anahtar: "yardim", etiket: "Yardım Metni", tip: "uzun_metin", deger: a ? a.yardim : "" })
      ]);
      UI.modal(a ? "Metin Alanını Düzenle" : "Yeni Metin Alanı", izgara, [
        { etiket: "Vazgeç" },
        { etiket: "Kaydet", sinif: "birincil", tik: function (kapat) {
          var v = UI.degerler(izgara);
          if (!v.etiket) { UI.bildir("Alan başlığı girin", true); return; }
          var t = tanimlariKlonla();
          t.forEach(function (x) {
            if (x.id !== m.id) return;
            if (!x.anlatilar) x.anlatilar = [];
            var yeni = { anahtar: a ? a.anahtar : anahtarUret(v.etiket), etiket: v.etiket, yardim: v.yardim };
            if (a) x.anlatilar[indeks] = yeni; else x.anlatilar.push(yeni);
          });
          Depo.konfigKaydet(); UI.bildir("Form güncellendi"); kapat(); UI.ciz();
        } }
      ]);
    }
    kok.appendChild(UI.kart("Serbest Metin (Anlatı) Alanları", [
      UI.veriTablo({
        satirlar: m.anlatilar || [],
        bosMesaj: "Bu modülde metin alanı yok.",
        sutunlar: [
          { etiket: "Başlık", deger: function (s) { return s.etiket; } },
          { etiket: "Yardım", deger: function (s) { return UI.kisalt(s.yardim, 70); } }
        ],
        islemler: [
          { etiket: "Düzenle", tik: function (s, i) { anlatFormu(s, i); } },
          { etiket: "Sil", sinif: "tehlike", tik: function (s, i) {
            UI.onayla("\u201C" + s.etiket + "\u201D alanı kaldırılsın mı?", function () {
              var t = tanimlariKlonla();
              t.forEach(function (x) { if (x.id === m.id && x.anlatilar) x.anlatilar.splice(i, 1); });
              Depo.konfigKaydet(); UI.ciz();
            });
          } }
        ]
      })
    ], { sag: el("button", { class: "btn birincil kucuk", type: "button", onclick: function () { anlatFormu(null); } }, ["+ Metin Alanı Ekle"]) }));
  }

  /* ============================================================
     SEKME 4 — GÖRÜNÜM VE METİNLER
     ============================================================ */
  function sekmeGorunum(kok) {
    function ayarAlan(anahtar, etiket, tip, yardim) {
      var deger = Depo.ayar(anahtar);
      if (anahtar === "kilavuz_adimlar") deger = (deger || []).join("\n");
      return UI.alan({ anahtar: anahtar, etiket: etiket, tip: tip || "metin", deger: deger, yardim: yardim,
        degisti: function (e) {
          var v = e.target.value;
          Depo.ayarOzel[anahtar] = anahtar === "kilavuz_adimlar"
            ? v.split("\n").map(function (s) { return s.trim(); }).filter(Boolean) : v;
          Depo.konfigKaydet(); UI.bildir("Kaydedildi");
        } });
    }
    kok.appendChild(el("div", { class: "bilgi" }, ["Değişiklikler anında kaydedilir; kenar çubuğu ve raporda görmek için sayfayı değiştirmeniz yeterlidir."]));
    kok.appendChild(UI.kart("Uygulama Kimliği", [el("div", { class: "form-izgara" }, [
      ayarAlan("uygulama_adi", "Uygulama Adı"),
      ayarAlan("alt_baslik", "Alt Başlık"),
      ayarAlan("surum", "Sürüm Etiketi"),
      ayarAlan("para_birimi", "Para Birimi"),
      ayarAlan("kip_seti", "KIP Seti Etiketi")
    ])]));
    kok.appendChild(UI.kart("Rapor Metinleri", [el("div", { class: "form-izgara" }, [
      ayarAlan("metodoloji_beyani", "Metodoloji Beyanı (rapor kapağı)", "uzun_metin"),
      ayarAlan("rapor_dipnotu", "Rapor Dipnotu"),
      ayarAlan("kilavuz_adimlar", "Kılavuz Adımları (her satıra bir adım)", "uzun_metin")
    ])]));
    if (Object.keys(Depo.ayarOzel).length) {
      kok.appendChild(UI.kart(null, [
        el("button", { class: "btn tehlike kucuk", type: "button", onclick: function () {
          UI.onayla("Görünüm ve metin düzenlemeleri orijinal hâline döndürülsün mü?", function () {
            Depo.ayarOzel = {}; Depo.konfigKaydet(); UI.ciz();
          });
        } }, ["Metinleri varsayılana döndür"])
      ]));
    }
  }

  /* ============================================================
     SEKME 5 — YEDEKLEME VE SIFIRLAMA
     ============================================================ */
  function sekmeYedek(kok) {
    kok.appendChild(UI.kart("Yedek Al", [
      el("p", { style: "margin:0 0 12px;font-size:13px" },
        ["Girilen tüm veriler, referans tablosu düzenlemeleri ve ayarlar tek bir JSON dosyasına kaydedilir. Bu dosya başka bir bilgisayardaki uygulamaya da yüklenebilir."]),
      el("button", { class: "btn birincil", type: "button", onclick: function () {
        Depo.yedekAl(); UI.bildir("Yedek dosyası indiriliyor");
      } }, ["⬇ JSON Yedeği İndir"])
    ], { kapsam: "k2" }));

    var dosyaGirdi = el("input", { type: "file", accept: ".json,application/json", style: "font:inherit;font-size:13px" });
    dosyaGirdi.addEventListener("change", function () {
      var f = dosyaGirdi.files[0];
      if (!f) return;
      var okuyucu = new FileReader();
      okuyucu.onload = function () {
        UI.onayla("Yedek yüklenince mevcut tüm veriler bu dosyadakilerle DEĞİŞTİRİLİR. Devam edilsin mi?", function () {
          var hata = Depo.yedekYukle(String(okuyucu.result));
          if (hata) UI.bildir(hata, true);
          else { UI.bildir("Yedek yüklendi"); UI.ciz(); }
        });
      };
      okuyucu.readAsText(f, "utf-8");
    });
    kok.appendChild(UI.kart("Yedekten Geri Yükle", [
      el("p", { style: "margin:0 0 12px;font-size:13px" }, ["Daha önce indirilen yedek dosyasını seçin."]),
      dosyaGirdi
    ]));

    /* ---- ŞİRKET VERİ PAKETİ (Sprint 7) ---- */
    var paketGirdi = el("input", { type: "file", accept: ".json,application/json", style: "font:inherit;font-size:13px" });
    paketGirdi.addEventListener("change", function () {
      var f = paketGirdi.files[0];
      if (!f) return;
      var okuyucu = new FileReader();
      okuyucu.onload = function () {
        UI.onayla("Şirket paketi yüklenince mevcut şirket verisi (profil, faaliyet, metrikler) bu dosyadakilerle DEĞİŞTİRİLİR. Referans tabloları etkilenmez. Devam edilsin mi?", function () {
          var hata = Depo.sirketPaketiYukle(String(okuyucu.result));
          if (hata) UI.bildir(hata, true);
          else { UI.bildir("Şirket paketi yüklendi"); UI.ciz(); }
        });
      };
      okuyucu.readAsText(f, "utf-8");
    });
    kok.appendChild(UI.kart("Şirket Veri Paketi (çok-şirketli taşıma)", [
      el("p", { style: "margin:0 0 12px;font-size:13px" },
        ["Tek bir şirketin tüm verisini (profil + faaliyet + soğutucu + elektrik + TSRS modülleri + sektör metrikleri) " +
         "dışa aktarır. Ortak emisyon faktörü tabloları dahil edilmez. Birden fazla şirketi ayrı dosyalarda yönetmek veya " +
         "arşivlemek için idealdir."]),
      el("div", { style: "display:flex;gap:10px;flex-wrap:wrap;align-items:center" }, [
        el("button", { class: "btn birincil", type: "button", onclick: function () {
          Depo.sirketPaketiAl(); UI.bildir("Şirket paketi indiriliyor");
        } }, ["⬇ Şirket Paketini İndir"]),
        el("span", { style: "font-size:12.5px;color:var(--soluk)" }, ["veya yükle:"]),
        paketGirdi
      ])
    ], { kapsam: "k1" }));

    /* ---- CSV FAALİYET İÇE AKTARMA (Sprint 7) ---- */
    var csvGirdi = el("input", { type: "file", accept: ".csv,text/csv", style: "font:inherit;font-size:13px" });
    var csvSonuc = el("div", { style: "margin-top:10px" });
    csvGirdi.addEventListener("change", function () {
      var f = csvGirdi.files[0];
      if (!f) return;
      var okuyucu = new FileReader();
      okuyucu.onload = function () {
        var r = Depo.csvFaaliyetIceAktar(String(okuyucu.result));
        if (r.hatalar.length) {
          csvSonuc.innerHTML = "";
          csvSonuc.appendChild(el("div", { class: "bilgi", style: "border-left-color:var(--oksit)" },
            ["İçe aktarım yapılamadı: " + UI.kacir(r.hatalar.join(" • "))]));
        } else {
          csvSonuc.innerHTML = "";
          csvSonuc.appendChild(el("div", { class: "bilgi yesil" },
            [el("b", null, [r.eklenen + " faaliyet kaydı eklendi"]),
             r.atlanan ? " • " + r.atlanan + " satır atlandı (eksik/geçersiz veri)" : "",
             ". Faaliyet Verisi sayfasından kontrol edip kaynak/birim eşleştirmesini tamamlayabilirsiniz."]));
          UI.bildir(r.eklenen + " kayıt içe aktarıldı");
        }
        csvGirdi.value = "";
      };
      okuyucu.readAsText(f, "utf-8");
    });
    kok.appendChild(UI.kart("CSV ile Faaliyet İçe Aktarma", [
      el("p", { style: "margin:0 0 10px;font-size:13px" },
        ["Müşteriden gelen faaliyet verisini CSV dosyasından toplu yükleyin. Başlık satırı esnek eşlenir; " +
         "en az “kategori” ve “miktar” sütunları bulunmalıdır. Türkçe sayı biçimi (1.234,56) otomatik dönüştürülür; " +
         "ayırıcı olarak hem virgül hem noktalı virgül desteklenir."]),
      el("div", { class: "bilgi", style: "font-size:12px;margin-bottom:10px" },
        ["Tanınan başlıklar: tesis, kategori, kaynak, miktar, birim, donem, aciklama. " +
         "Örnek: ", el("code", null, ["tesis;kategori;kaynak;miktar;birim;donem"])]),
      csvGirdi, csvSonuc
    ]));

    function sifirlaDugme(etiket, neler, uyari) {
      return el("button", { class: "btn tehlike", type: "button", style: "margin-right:10px;margin-bottom:10px", onclick: function () {
        UI.onayla(uyari, function () { Depo.sifirla(neler); UI.bildir("Sıfırlandı"); UI.ciz(); });
      } }, [etiket]);
    }
    kok.appendChild(UI.kart("Sıfırlama (Dikkat!)", [
      el("p", { style: "margin:0 0 12px;font-size:13px;color:var(--oksit)" },
        ["Bu işlemler geri alınamaz. Öncesinde yedek almanız şiddetle önerilir."]),
      sifirlaDugme("Girilen verileri sıfırla", "girdiler",
        "Profil, faaliyet, soğutucu, elektrik ve TSRS modül verilerinin TAMAMI silinecek. Emin misiniz?"),
      sifirlaDugme("Referans düzenlemelerini sıfırla", "referans",
        "EF tabloları, listeler, form alanları ve metinlerdeki düzenlemeleriniz silinip varsayılanlara dönülecek. Emin misiniz?"),
      sifirlaDugme("Her şeyi sıfırla", "hepsi",
        "Uygulama tamamen ilk kurulum hâline dönecek; tüm veriler ve düzenlemeler silinecek. Emin misiniz?")
    ]));
  }

  return A;
})();
