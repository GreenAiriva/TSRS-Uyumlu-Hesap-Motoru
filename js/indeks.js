/* ============================================================================
   INDEKS — Kurumsal Veri Yönetim İndeksi (Excel 01_MASTER_INDEX'in web karşılığı)
   Alt sekmeli yapı: ilk sekme Organizasyon Hiyerarşisi (master data register).
   Veri müşteriye özeldir: Depo.veri.indeks altında saklanır ve customers.data
   ile birlikte buluta yazılır (her müşteri kendi ağacını kurar).
   ID standardı Excel Karar D-04 ile uyumlu: ORG- (tüzel), TES- (saha), DEP-
   (departman); ID'ler sabittir, silinse de yeniden kullanılmaz.
   ============================================================================ */
"use strict";
window.Indeks = (function () {
  var el = function () { return UI.el.apply(null, arguments); };

  /* ---- Sabit listeler (Excel 09_Listeler sayfasındaki karşılıkları) ---- */
  var TURLER = ["Holding", "İştirak", "Tesis", "Ocak", "Depo", "Ofis", "Showroom", "Departman"];
  var TUZEL  = { "Holding": 1, "İştirak": 1 };          // sahiplik % yalnız tüzel birimlerde anlamlı
  var DURUMLAR = ["Aktif", "Pasif", "Kapandı", "Teyit Bekliyor"];
  var ONEK = function (tur) {                            // ID öneki: tür → ORG / TES / DEP
    if (TUZEL[tur]) return "ORG";
    if (tur === "Departman") return "DEP";
    return "TES";
  };
  var TUR_SINIF = { "Holding": "k2", "İştirak": "k2", "Departman": "k3" }; // rozet rengi (vars: k1)

  /* ---- RFI sabitleri (Excel 03_RFI_Register + 09_Listeler: 9-durumlu yaşam döngüsü) ---- */
  var RFI_DURUMLAR = ["Henüz İstenmedi", "İstendi", "İstendi — Henüz Gelmedi", "Kısmen Teslim Edildi",
    "Tamamı Geldi", "Doğrulandı", "Revizyon Talep Edildi", "İstenmediği Halde Bulundu", "Kapsam Dışı"];
  var RFI_KAPALI = { "Tamamı Geldi": 1, "Doğrulandı": 1, "Kapsam Dışı": 1 };   // vade takibi dışı durumlar
  var RFI_ONCELIKLER = ["Kritik", "Yüksek", "Normal"];
  var RFI_DURUM_ROZET = { "Henüz İstenmedi": "bos", "İstendi": "kismi", "İstendi — Henüz Gelmedi": "kismi",
    "Kısmen Teslim Edildi": "kismi", "Tamamı Geldi": "tam", "Doğrulandı": "tam",
    "Revizyon Talep Edildi": "uyari", "İstenmediği Halde Bulundu": "k3", "Kapsam Dışı": "bos" };
  var RFI_ONCELIK_ROZET = { "Kritik": "uyari", "Yüksek": "kismi", "Normal": "bos" };

  /* ---- Kanıt sabitleri (Excel 09_Listeler: Kanıt Niteliği, Güven Düzeyi) ---- */
  var KANIT_NITELIKLER = ["Birincil (ölçüm/fatura)", "İkincil (hesap)", "Beyan"];
  var KANIT_GUVENLER = ["Yüksek", "Orta", "Düşük"];
  var NITELIK_ROZET = { "Birincil (ölçüm/fatura)": "tam", "İkincil (hesap)": "kismi", "Beyan": "bos" };
  var GUVEN_ROZET = { "Yüksek": "tam", "Orta": "kismi", "Düşük": "uyari" };

  /* ---- Sayfa durumu (çizimler arasında yaşar, veriye yazılmaz) ---- */
  var aktifSekme = "org";
  var daralt = {};        // { dugumId: true } → alt dalları gizli
  var seciliId = null;    // detay panelinde gösterilen birim

  /* ---- Veri kökü: eski müşterilerde alan yoksa oluşturur ---- */
  function veriKok() {
    var v = Depo.veri;
    if (!v.indeks) v.indeks = {};
    if (!v.indeks.org) v.indeks.org = [];
    if (!v.indeks.rfi) v.indeks.rfi = [];
    if (!v.indeks.dokuman) v.indeks.dokuman = [];
    if (!v.indeks.kanit) v.indeks.kanit = [];
    if (!v.indeks.sayac) v.indeks.sayac = {};
    return v.indeks;
  }
  function rfiListe() { return veriKok().rfi; }
  function dokumanListe() { return veriKok().dokuman; }
  function kanitListe() { return veriKok().kanit; }
  function dokumanBul(id) {
    var s = null;
    dokumanListe().forEach(function (d) { if (d.id === id) s = d; });
    return s;
  }
  /* Bir RFI kaleminin bir birimdeki gelen kanıt sayısı (Excel "Gelen Kanıt (oto)") */
  function kanitSayisi(rfiNo, tesisId) {
    var n = 0;
    kanitListe().forEach(function (k) { if (+k.rfiNo === +rfiNo && k.tesisId === tesisId) n++; });
    return n;
  }
  /* Tarih yardımcıları: kayıtta ISO (AAAA-AA-GG) tutulur, ekranda GG.AA.AAAA gösterilir */
  function tarihGoster(iso) {
    if (!iso) return "—";
    var p = String(iso).split("-");
    return p.length === 3 ? p[2] + "." + p[1] + "." + p[0] : iso;
  }
  /* Yerel takvim günü (toISOString UTC verir; gece yarısına yakın saatlerde gün kayar) */
  function bugunIso() {
    var d = new Date(), a = d.getMonth() + 1, g = d.getDate();
    return d.getFullYear() + "-" + (a < 10 ? "0" + a : a) + "-" + (g < 10 ? "0" + g : g);
  }
  /* Vade aşımı (Excel'de formül): açık durumdaki kalem vadeyi geçtiyse gün sayısı */
  function gecikmeGun(r) {
    if (!r.vadeTarihi || RFI_KAPALI[r.durum]) return 0;
    var fark = (new Date(bugunIso()) - new Date(r.vadeTarihi)) / 86400000;
    return fark > 0 ? Math.round(fark) : 0;
  }
  /* Birimin RFI özeti: ağaç rozetleri ve kimlik kartı için */
  function rfiOzet(orgId) {
    var t = 0, a = 0, g = 0;
    rfiListe().forEach(function (r) {
      if (r.tesisId !== orgId) return;
      t++;
      if (!RFI_KAPALI[r.durum]) a++;
      if (gecikmeGun(r) > 0) g++;
    });
    return { toplam: t, acik: a, gecikmis: g };
  }
  /* Yeni RFI No: Excel Karar D-04 — numaralar sabittir, silinse de yeniden kullanılmaz */
  function yeniRfiNo() {
    var kok = veriKok();
    if (!kok.sayac.RFI) {
      var enBuyuk = 0;
      rfiListe().forEach(function (r) { if (+r.no > enBuyuk) enBuyuk = +r.no; });
      kok.sayac.RFI = enBuyuk;
    }
    kok.sayac.RFI += 1;
    return kok.sayac.RFI;
  }
  /* Yeni kanıt kimliği (EV- öneki, D-04: yeniden kullanılmaz) */
  function yeniEvId() {
    var kok = veriKok();
    if (!kok.sayac.EV) {
      var enBuyuk = 0;
      kanitListe().forEach(function (k) {
        var e = /^EV-(\d+)$/.exec(k.id || "");
        if (e && +e[1] > enBuyuk) enBuyuk = +e[1];
      });
      kok.sayac.EV = enBuyuk;
    }
    kok.sayac.EV += 1;
    var n = kok.sayac.EV;
    return "EV-" + (n < 10 ? "0" + n : n);
  }
  /* Yeni doküman kimliği (DOC- öneki, D-04: yeniden kullanılmaz) */
  function yeniDocId() {
    var kok = veriKok();
    if (!kok.sayac.DOC) {
      var enBuyuk = 0;
      dokumanListe().forEach(function (d) {
        var e = /^DOC-(\d+)$/.exec(d.id || "");
        if (e && +e[1] > enBuyuk) enBuyuk = +e[1];
      });
      kok.sayac.DOC = enBuyuk;
    }
    kok.sayac.DOC += 1;
    var n = kok.sayac.DOC;
    return "DOC-" + (n < 10 ? "0" + n : n);
  }
  /* Benzersiz RFI kalemleri (no → ad): doküman-RFI eşlemesindeki işaret listesi.
     Aynı no birden çok birimde açık olabilir; kalem adı ilk bulunandan alınır. */
  function rfiKalemleri() {
    var m = {};
    rfiListe().forEach(function (r) { if (m[r.no] == null) m[r.no] = r.kalem || ""; });
    return Object.keys(m).map(function (n) { return { no: +n, kalem: m[n] }; })
      .sort(function (a, b) { return a.no - b.no; });
  }
  /* Rapor bölümü seçenekleri: sabit sayfalar + TSRS modül başlıkları (gerçek
     uygulamada Depo.modulTanimlari'ndan gelir; ön izlemede yedek liste) */
  function bolumSecenekleri() {
    var liste = ["Şirket Profili", "Emisyon Envanteri (Kapsam 1-2-3)", "Sektör Metrikleri"];
    if (Depo.modulTanimlari) {
      Depo.modulTanimlari().forEach(function (m) { liste.push(m.baslik); });
    } else {
      liste = liste.concat(["Yönetişim", "Strateji", "Risk Yönetimi", "Metrikler ve Hedefler"]);
    }
    return liste;
  }
  function orgListe() { return veriKok().org; }
  function bul(id) {
    var s = null;
    orgListe().forEach(function (k) { if (k.id === id) s = k; });
    return s;
  }
  function cocuklar(id) {
    return orgListe().filter(function (k) { return (k.ustId || "") === (id || ""); });
  }
  /* Yeni ID üret: sayaç yoksa mevcut kayıtlardan en büyüğü bulur (göç güvenli).
     Karar D-04: silinen ID yeniden kullanılmaz → sayaç hiç geri sarılmaz. */
  function yeniId(tur) {
    var kok = veriKok(), on = ONEK(tur);
    if (!kok.sayac[on]) {
      var enBuyuk = 0;
      orgListe().forEach(function (k) {
        var e = new RegExp("^" + on + "-(\\d+)$").exec(k.id || "");
        if (e && +e[1] > enBuyuk) enBuyuk = +e[1];
      });
      kok.sayac[on] = enBuyuk;
    }
    kok.sayac[on] += 1;
    var n = kok.sayac[on];
    return on + "-" + (n < 10 ? "0" + n : n);
  }
  function ehGoster(v) { return v === "E" ? "Evet" : (v === "H" ? "Hayır" : "—"); }
  /* Kök → birim yolu (kırıntı gezinme için): [holding, şirket, tesis] */
  function soyYolu(id) {
    var yol = [], k = bul(id), emniyet = 0;
    while (k && emniyet++ < 50) { yol.unshift(k); k = k.ustId ? bul(k.ustId) : null; }
    return yol;
  }
  /* Döngü koruması: aday üst, kaydın kendi alt soyundan olamaz */
  function altSoyunda(kayitId, adayUstId) {
    var k = adayUstId ? bul(adayUstId) : null, emniyet = 0;
    while (k && emniyet++ < 50) {
      if (k.id === kayitId) return true;
      k = k.ustId ? bul(k.ustId) : null;
    }
    return false;
  }

  /* ================= SEKME İSKELETİ ================= */
  /* Not: Excel'deki 02_Veri_Kategorileri ayrı sekme olarak taşınmadı — RFI kaydındaki
     "Bölüm" alanı gruplamayı karşılar; kategori taksonomisi ileride gerekirse
     (Veri Matrisi aşamasında) statik referans verisi olarak eklenir.
     RFI takibi ana sekme DEĞİLDİR: her organizasyon birimi kendi sekmesinde izlenir
     (ağaçtan birime tıklayarak açılır) — belgeler birim birim toplandığı için. */
  var SEKMELER = [
    { id: "org",     ad: "01 · Organizasyon Hiyerarşisi", ciz: sekmeOrg },
    { id: "dokuman", ad: "02 · Doküman Kaydı", ciz: sekmeDokuman },
    { id: "kanit",   ad: "03 · Kanıt Kaydı", ciz: sekmeKanit },
    { id: "matris",  ad: "04 · Veri Matrisi", ciz: sekmeMatris }
  ];

  /* ---- Dinamik birim sekmeleri (oturumluk; veriye yazılmaz) ---- */
  var birimSekmeler = [];   // açık birim sekmelerinin org ID listesi
  function birimSekmesiAc(id) {
    if (birimSekmeler.indexOf(id) < 0) birimSekmeler.push(id);
    aktifSekme = "birim:" + id;
    UI.ciz();
  }
  function birimSekmesiKapat(id) {
    var i = birimSekmeler.indexOf(id);
    if (i >= 0) birimSekmeler.splice(i, 1);
    if (aktifSekme === "birim:" + id) aktifSekme = "org";
    UI.ciz();
  }

  function ciz(kok) {
    var bar = el("div", { class: "sekmeler" }, SEKMELER.map(function (s) {
      return el("button", { class: "sekme" + (aktifSekme === s.id ? " aktif" : ""), type: "button",
        onclick: function () { aktifSekme = s.id; UI.ciz(); } }, [s.ad]);
    }));
    birimSekmeler.forEach(function (id) {
      var o = bul(id);
      if (!o) return;
      bar.appendChild(el("button", {
        class: "sekme idx-birim-sekme" + (aktifSekme === "birim:" + id ? " aktif" : ""),
        type: "button", title: o.ad + " — birim sekmesi (RFI takibi)",
        onclick: function () { aktifSekme = "birim:" + id; UI.ciz(); } }, [
        "▤ " + UI.kisalt(o.ad, 20),
        el("span", { class: "idx-sekme-kapat", title: "Sekmeyi kapat", role: "button", tabindex: "0",
          onclick: function (e) { e.stopPropagation(); birimSekmesiKapat(id); } }, ["×"])
      ]));
    });
    kok.appendChild(bar);
    var govde = el("div");
    kok.appendChild(govde);
    if (aktifSekme.indexOf("birim:") === 0) {
      var oid = aktifSekme.slice(6), org = bul(oid);
      if (org) { birimSekmesi(govde, org); return; }
      aktifSekme = "org";   // birim silinmiş — ağaca dön
    }
    var s = null;
    SEKMELER.forEach(function (x) { if (x.id === aktifSekme) s = x; });
    if (!s) { aktifSekme = "org"; s = SEKMELER[0]; }
    if (s.ciz) s.ciz(govde);
    else yakinda(govde, s.ad);
  }

  /* Henüz yapım aşamasındaki register sekmeleri için yer tutucu */
  function yakinda(kok, ad) {
    kok.appendChild(el("div", { class: "kart" }, [el("div", { class: "kart-ic" }, [
      el("div", { class: "bos-durum" }, [
        el("div", { class: "buyuk" }, ["◫"]),
        el("div", null, [el("b", null, [ad.replace(/^\d+ · /, "")]), " sekmesi bir sonraki aşamada eklenecek."]),
        el("div", { style: "font-size:12px;margin-top:6px" },
          ["Sıralama Excel MASTER_INDEX ile aynıdır: önce organizasyon ağacı ve RFI takibi kurulur, ",
           "doküman ve kanıt kayıtları bunlara bağlanır."])
      ])
    ])]));
  }

  /* ================= SEKME 1 — ORGANİZASYON HİYERARŞİSİ ================= */
  function sekmeOrg(kok) {
    var liste = orgListe();

    /* Boş durum: ilk kurulum yönlendirmesi */
    if (!liste.length) {
      kok.appendChild(el("div", { class: "bilgi" }, [
        "Organizasyon ağacı bu müşteriye özeldir. Önce en üst birimi (holding ya da ana şirket) ekleyin; ",
        "sonra her birimin satırındaki ", el("b", null, ["+"]), " ile iştirakleri, tesisleri ve ocakları bağlayın."]));
      kok.appendChild(el("div", { class: "kart" }, [el("div", { class: "kart-ic" }, [
        el("div", { class: "bos-durum" }, [
          el("div", { class: "buyuk" }, ["🏢"]),
          el("div", null, ["Henüz birim eklenmedi."]),
          el("div", { style: "margin-top:14px;display:flex;gap:10px;justify-content:center;flex-wrap:wrap" }, [
            el("button", { class: "btn birincil", type: "button",
              onclick: function () { orgFormu(null, ""); } }, ["+ Kök Birim Ekle"])
          ])
        ])
      ])]));
      return;
    }

    /* KPI şeridi */
    var say = { tuzel: 0, saha: 0, dep: 0, aktif: 0, bekliyor: 0 };
    liste.forEach(function (k) {
      if (TUZEL[k.tur]) say.tuzel++;
      else if (k.tur === "Departman") say.dep++;
      else say.saha++;
      if (k.durum === "Aktif") say.aktif++;
      if (k.durum === "Teyit Bekliyor") say.bekliyor++;
    });
    function kpi(sinif, etiket, deger, birim) {
      return el("div", { class: "kpi " + sinif }, [
        el("div", { class: "etiket" }, [etiket]),
        el("div", { class: "deger" }, [String(deger)]),
        el("div", { class: "birim" }, [birim])]);
    }
    kok.appendChild(el("div", { class: "kpi-dizi" }, [
      kpi("n",  "Toplam Birim", liste.length, "kayıtlı organizasyon birimi"),
      kpi("k2", "Tüzel Birim", say.tuzel, "holding + iştirak"),
      kpi("k1", "Tesis / Saha", say.saha, "tesis • ocak • depo • ofis"),
      kpi("k3", "Aktif", say.aktif, say.bekliyor ? say.bekliyor + " birim teyit bekliyor" : "faaliyet durumu")
    ]));

    /* Ağaç + detay: geniş ekranda yan yana, dar ekranda alt alta */
    var izgara = el("div", { class: "idx-izgara" });
    kok.appendChild(izgara);

    var agacKart = el("div", { class: "kart", style: "margin-bottom:0" }, [
      el("div", { class: "kart-baslik" }, [
        el("h3", null, ["Organizasyon Ağacı"]),
        el("div", { style: "display:flex;gap:8px;align-items:center" }, [
          el("button", { class: "btn kucuk ikincil", type: "button", onclick: function () {
            var hepsiAcik = !Object.keys(daralt).length;
            daralt = {};
            if (hepsiAcik) liste.forEach(function (k) { if (cocuklar(k.id).length) daralt[k.id] = true; });
            UI.ciz();
          } }, [Object.keys(daralt).length ? "⊞ Tümünü Aç" : "⊟ Tümünü Kapat"]),
          el("button", { class: "btn kucuk birincil", type: "button",
            onclick: function () { orgFormu(null, ""); } }, ["+ Kök Birim"])
        ])
      ]),
      el("div", { class: "kart-ic", style: "padding:10px 12px" }, [agacCiz()])
    ]);
    izgara.appendChild(agacKart);
    izgara.appendChild(detayPaneli());
  }

  /* ---- Ağaç çizimi (özyinelemeli) ---- */
  function agacCiz() {
    var kapsayici = el("div", { class: "idx-agac", role: "tree" });
    var kokler = cocuklar("");
    if (!kokler.length) {
      /* veri var ama kök yok (tümü hatalı üst ID) — kayıtları yine de listele */
      orgListe().forEach(function (k) { kapsayici.appendChild(dugumSatiri(k, 0)); });
      return kapsayici;
    }
    kokler.forEach(function (k) { dal(kapsayici, k, 0); });
    return kapsayici;
  }
  function dal(kap, kayit, seviye) {
    kap.appendChild(dugumSatiri(kayit, seviye));
    if (daralt[kayit.id]) return;
    cocuklar(kayit.id).forEach(function (c) { dal(kap, c, seviye + 1); });
  }
  function dugumSatiri(kayit, seviye) {
    var altSayi = cocuklar(kayit.id).length;
    var acKapa = el("button", {
      class: "idx-ac", type: "button",
      "aria-label": daralt[kayit.id] ? "Dalı aç" : "Dalı kapat",
      style: altSayi ? "" : "visibility:hidden",
      onclick: function (e) {
        e.stopPropagation();
        if (daralt[kayit.id]) delete daralt[kayit.id]; else daralt[kayit.id] = true;
        UI.ciz();
      }
    }, [daralt[kayit.id] ? "▸" : "▾"]);

    var etiketler = [
      el("span", { class: "rozet " + (TUR_SINIF[kayit.tur] || "k1") }, [kayit.tur || "—"]),
      el("a", { class: "idx-ad", href: "javascript:void(0)", title: "Birim sekmesini aç (RFI takibi)",
        onclick: function (e) { e.stopPropagation(); birimSekmesiAc(kayit.id); } }, [kayit.ad || "(adsız)"]),
      el("span", { class: "idx-id" }, [kayit.id])
    ];
    if (TUZEL[kayit.tur] && kayit.sahiplik != null && kayit.sahiplik !== "")
      etiketler.push(el("span", { class: "idx-mini" }, ["%" + kayit.sahiplik]));
    if (kayit.konum) etiketler.push(el("span", { class: "idx-mini" }, ["📍 " + kayit.konum]));
    if (kayit.durum && kayit.durum !== "Aktif")
      etiketler.push(el("span", { class: "rozet " + (kayit.durum === "Teyit Bekliyor" ? "kismi" : "uyari") }, [kayit.durum]));
    if (altSayi) etiketler.push(el("span", { class: "idx-mini" }, [altSayi + " alt birim"]));
    var rOzet = rfiOzet(kayit.id);
    if (rOzet.toplam) etiketler.push(el("span", { class: "idx-mini" + (rOzet.gecikmis ? " idx-mini-gec" : "") },
      ["▤ " + rOzet.toplam + " RFI" + (rOzet.gecikmis ? " • " + rOzet.gecikmis + " gecikmiş" : "")]));

    var satir = el("div", {
      class: "idx-dugum" + (seciliId === kayit.id ? " secili" : ""),
      style: "padding-left:" + (8 + seviye * 26) + "px",
      role: "treeitem", tabindex: "0",
      onclick: function () { seciliId = kayit.id; UI.ciz(); },
      onkeydown: function (e) { if (e.key === "Enter") { seciliId = kayit.id; UI.ciz(); } }
    }, [
      acKapa,
      el("span", { class: "idx-etiketler" }, etiketler),
      el("span", { class: "idx-islem" }, [
        el("button", { class: "btn kucuk ikincil", type: "button", title: "Birim sekmesi: RFI takibi",
          onclick: function (e) { e.stopPropagation(); birimSekmesiAc(kayit.id); } }, ["▤"]),
        el("button", { class: "btn kucuk ikincil", type: "button", title: "Alt birim ekle",
          onclick: function (e) { e.stopPropagation(); orgFormu(null, kayit.id); } }, ["+"]),
        el("button", { class: "btn kucuk ikincil", type: "button", title: "Düzenle",
          onclick: function (e) { e.stopPropagation(); orgFormu(kayit, null); } }, ["✎"]),
        el("button", { class: "btn kucuk tehlike", type: "button", title: "Sil",
          onclick: function (e) { e.stopPropagation(); sil(kayit); } }, ["✕"])
      ])
    ]);
    return satir;
  }

  /* ---- Detay paneli: seçilen birimin kimlik kartı ---- */
  function detayPaneli() {
    var k = seciliId ? bul(seciliId) : null;
    if (!k) {
      return el("div", { class: "kart idx-detay", style: "margin-bottom:0" }, [
        el("div", { class: "kart-ic" }, [el("div", { class: "bos-durum" }, [
          el("div", { class: "buyuk" }, ["◎"]),
          el("div", null, ["Detayını görmek için ağaçtan bir birime tıklayın."])
        ])])
      ]);
    }
    var yol = soyYolu(k.id);
    var kirinti = el("div", { class: "idx-kirinti" }, yol.map(function (p, i) {
      var son = i === yol.length - 1;
      return el("span", null, [
        son ? el("b", null, [p.ad]) :
          el("a", { href: "javascript:void(0)", onclick: function () { seciliId = p.id; UI.ciz(); } }, [p.ad]),
        son ? null : " › "
      ]);
    }));

    function satir(etiket, deger) {
      return el("div", { class: "idx-detay-satir" }, [
        el("span", { class: "idx-detay-etiket" }, [etiket]),
        el("span", null, [deger == null || deger === "" ? "—" : deger])]);
    }
    var altlar = cocuklar(k.id);

    return el("div", { class: "kart idx-detay", style: "margin-bottom:0" }, [
      el("div", { class: "kart-baslik" }, [
        el("h3", null, ["Birim Kimliği"]),
        el("span", { class: "mini" }, [k.id])
      ]),
      el("div", { class: "kart-ic" }, [
        kirinti,
        el("h4", { style: "margin:10px 0 2px;font-size:16px" }, [k.ad || "(adsız)"]),
        el("div", { style: "margin-bottom:12px" }, [
          el("span", { class: "rozet " + (TUR_SINIF[k.tur] || "k1") }, [k.tur || "—"]), " ",
          el("span", { class: "rozet " + (k.durum === "Aktif" ? "tam" : (k.durum === "Teyit Bekliyor" ? "kismi" : "uyari")) }, [k.durum || "—"])
        ]),
        satir("Üst birim", k.ustId ? el("a", { href: "javascript:void(0)",
          onclick: function () { seciliId = k.ustId; UI.ciz(); } }, [(bul(k.ustId) || {}).ad || k.ustId]) : "— (kök birim)"),
        TUZEL[k.tur] ? satir("Sahiplik payı", k.sahiplik != null && k.sahiplik !== "" ? "%" + k.sahiplik : "") : null,
        satir("Finansal kontrol", ehGoster(k.finKontrol)),
        satir("Operasyonel kontrol", ehGoster(k.opKontrol)),
        satir("Dahil — Op. kontrol", ehGoster(k.dahilOp)),
        satir("Dahil — Fin. kontrol", ehGoster(k.dahilFin)),
        satir("Dahil — Hisse payı", ehGoster(k.dahilHisse)),
        satir("Konum", k.konum),
        satir("Faaliyet türü / ana proses", k.faaliyetTuru),
        satir("RFI takibi", (function () {
          var o = rfiOzet(k.id);
          return o.toplam
            ? o.toplam + " kalem • " + o.acik + " açık" + (o.gecikmis ? " • " + o.gecikmis + " gecikmiş" : "")
            : "kayıt yok";
        })()),
        satir("Not", k.not),
        !altlar.length ? null : el("div", { style: "margin-top:14px" }, [
          el("div", { class: "idx-detay-etiket", style: "margin-bottom:6px" }, ["Alt birimler (" + altlar.length + ")"]),
          el("div", null, altlar.map(function (c) {
            return el("a", { class: "idx-alt-birim", href: "javascript:void(0)",
              onclick: function () { seciliId = c.id; UI.ciz(); } },
              [el("span", { class: "rozet " + (TUR_SINIF[c.tur] || "k1") }, [c.tur]), " " + c.ad]);
          }))
        ]),
        el("div", { style: "margin-top:16px;display:flex;gap:8px;flex-wrap:wrap" }, [
          el("button", { class: "btn kucuk birincil", type: "button",
            onclick: function () { birimSekmesiAc(k.id); } }, ["▤ RFI Takibi"]),
          el("button", { class: "btn kucuk ikincil", type: "button",
            onclick: function () { orgFormu(null, k.id); } }, ["+ Alt Birim"]),
          el("button", { class: "btn kucuk ikincil", type: "button",
            onclick: function () { orgFormu(k, null); } }, ["✎ Düzenle"])
        ])
      ])
    ]);
  }

  /* ---- Ekleme / düzenleme formu ----
     kayit=null → yeni kayıt (varsayilanUst ile açılır); kayit dolu → düzenleme */
  function orgFormu(kayit, varsayilanUst) {
    var yeni = !kayit;
    var f = {};

    /* Üst birim seçimi: mevcut birimlerden (girinti ile) — kendisi ve alt soyu hariç */
    var ustSecim = el("select", { "data-anahtar": "ustId", id: "idx_ust" });
    ustSecim.appendChild(el("option", { value: "" }, ["— Yok (kök birim) —"]));
    function secenekDal(k, seviye) {
      if (kayit && (k.id === kayit.id || altSoyunda(kayit.id, k.id))) return;
      ustSecim.appendChild(el("option", { value: k.id },
        [Array(seviye + 1).join(" ") + k.ad + "  (" + k.id + ")"]));
      cocuklar(k.id).forEach(function (c) { secenekDal(c, seviye + 1); });
    }
    cocuklar("").forEach(function (k) { secenekDal(k, 0); });
    ustSecim.value = kayit ? (kayit.ustId || "") : (varsayilanUst || "");

    function secimAlani(anahtar, etiket, secenekler, deger, yardim) {
      var g = el("select", { "data-anahtar": anahtar });
      g.appendChild(el("option", { value: "" }, ["— Seçin —"]));
      secenekler.forEach(function (s) {
        g.appendChild(el("option", { value: s.length === 1 ? s : s }, [s.length === 1 ? (s === "E" ? "Evet" : "Hayır") : s]));
      });
      if (deger != null) g.value = deger;
      var a = el("div", { class: "alan" }, [el("label", null, [etiket,
        yardim ? el("span", { class: "yardim" }, [" " + yardim]) : null]), g]);
      a.girdi = g;
      return a;
    }

    f.ad  = UI.alan({ anahtar: "ad", etiket: "Birim Adı", tip: "metin", zorunlu: true, deger: kayit ? kayit.ad : "" });
    f.tur = secimAlani("tur", "Tür", TURLER, kayit ? kayit.tur : "");
    f.sahiplik = UI.alan({ anahtar: "sahiplik", etiket: "Sahiplik %", tip: "sayi",
      yardim: "yalnız tüzel birim (0–100)", deger: kayit && kayit.sahiplik != null ? kayit.sahiplik : "" });
    f.fin = secimAlani("finKontrol", "Finansal Kontrol", ["E", "H"], kayit ? kayit.finKontrol : "");
    f.op  = secimAlani("opKontrol", "Operasyonel Kontrol", ["E", "H"], kayit ? kayit.opKontrol : "");
    f.dOp  = secimAlani("dahilOp", "Dahil — Op. Kontrol", ["E", "H"], kayit ? kayit.dahilOp : "", "(konsolidasyon)");
    f.dFin = secimAlani("dahilFin", "Dahil — Fin. Kontrol", ["E", "H"], kayit ? kayit.dahilFin : "", "(konsolidasyon)");
    f.dHis = secimAlani("dahilHisse", "Dahil — Hisse Payı", ["E", "H"], kayit ? kayit.dahilHisse : "", "(konsolidasyon)");
    f.konum = UI.alan({ anahtar: "konum", etiket: "Konum", tip: "metin", deger: kayit ? kayit.konum : "" });
    f.durum = secimAlani("durum", "Faaliyet Durumu", DURUMLAR, kayit ? kayit.durum : "Aktif");
    f.faal = UI.alan({ anahtar: "faaliyetTuru", etiket: "Faaliyet Türü / Ana Proses", tip: "metin", genis: true,
      deger: kayit ? kayit.faaliyetTuru : "" });
    f.not = UI.alan({ anahtar: "not", etiket: "Not", tip: "uzun_metin", deger: kayit ? kayit.not : "" });

    var ustAlan = el("div", { class: "alan" }, [el("label", { for: "idx_ust" }, ["Üst Birim"]), ustSecim]);
    var govde = el("div", { class: "form-izgara" },
      [ustAlan, f.ad, f.tur, f.sahiplik, f.fin, f.op, f.dOp, f.dFin, f.dHis, f.konum, f.durum, f.faal, f.not]);

    UI.modal(yeni ? "Yeni Organizasyon Birimi" : kayit.id + " — Düzenle", govde, [
      { etiket: "Vazgeç" },
      { etiket: yeni ? "Ekle" : "Kaydet", sinif: "birincil", tik: function (kapat) {
          UI.alanHatalariTemizle(govde);
          var v = UI.degerler(govde), hata = false;
          if (!v.ad.trim()) { UI.alanHata(f.ad, "Birim adı zorunludur"); hata = true; }
          if (!v.tur) { UI.alanHata(f.tur, "Tür seçin"); hata = true; }
          if (v.sahiplik !== "" && (isNaN(+v.sahiplik) || +v.sahiplik < 0 || +v.sahiplik > 100)) {
            UI.alanHata(f.sahiplik, "0 ile 100 arasında girin"); hata = true;
          }
          if (kayit && v.ustId && altSoyunda(kayit.id, v.ustId)) {
            UI.alanHata(ustAlan, "Bir birim kendi alt biriminin altına taşınamaz"); hata = true;
          }
          if (hata) return;
          var hedef = kayit || { id: yeniId(v.tur) };
          hedef.ustId = v.ustId || "";
          hedef.ad = v.ad.trim();
          hedef.tur = v.tur;
          hedef.sahiplik = v.sahiplik === "" ? null : +v.sahiplik;
          hedef.finKontrol = v.finKontrol; hedef.opKontrol = v.opKontrol;
          hedef.dahilOp = v.dahilOp; hedef.dahilFin = v.dahilFin; hedef.dahilHisse = v.dahilHisse;
          hedef.konum = v.konum.trim(); hedef.durum = v.durum || "Aktif";
          hedef.faaliyetTuru = v.faaliyetTuru.trim(); hedef.not = v.not.trim();
          if (yeni) orgListe().push(hedef);
          seciliId = hedef.id;
          Depo.kaydet();
          kapat();
          UI.bildir(yeni ? hedef.id + " eklendi" : hedef.id + " güncellendi");
          UI.ciz();
        } }
    ], 720);
  }

  /* ---- Silme: alt birimi ya da RFI kaydı olan birim korunur (önce taşı/sil) ---- */
  function sil(kayit) {
    var altSayi = cocuklar(kayit.id).length;
    if (altSayi) {
      UI.bildir(kayit.ad + " silinemedi: " + altSayi + " alt birimi var. Önce alt birimleri taşıyın ya da silin.", true);
      return;
    }
    var rfiSayi = rfiOzet(kayit.id).toplam;
    if (rfiSayi) {
      UI.bildir(kayit.ad + " silinemedi: birime bağlı " + rfiSayi + " RFI kaydı var. Önce birim sekmesinden kayıtları silin.", true);
      return;
    }
    var dokSayi = dokumanListe().filter(function (d) { return d.tesisId === kayit.id; }).length;
    var kanitSayi = kanitListe().filter(function (k) { return k.tesisId === kayit.id; }).length;
    if (dokSayi || kanitSayi) {
      UI.bildir(kayit.ad + " silinemedi: birime bağlı " + (dokSayi ? dokSayi + " doküman" : "") +
        (dokSayi && kanitSayi ? " ve " : "") + (kanitSayi ? kanitSayi + " kanıt kaydı" : "") +
        " var. Önce onları taşıyın ya da silin.", true);
      return;
    }
    UI.onayla("“" + kayit.ad + "” (" + kayit.id + ") silinecek. Bu işlem geri alınamaz. Devam edilsin mi?", function () {
      var L = orgListe(), i = L.indexOf(kayit);
      if (i >= 0) L.splice(i, 1);
      if (seciliId === kayit.id) seciliId = null;
      var bs = birimSekmeler.indexOf(kayit.id);      // açık birim sekmesi varsa kapat
      if (bs >= 0) birimSekmeler.splice(bs, 1);
      if (aktifSekme === "birim:" + kayit.id) aktifSekme = "org";
      Depo.kaydet();
      UI.bildir(kayit.id + " silindi");
      UI.ciz();
    });
  }

  /* ================= BİRİM SEKMESİ — birime özgü RFI takibi =================
     Excel 03_RFI_Register'ın web karşılığı; ancak kayıtlar organizasyon birimi
     bazında toplanır: her birim (holding / iştirak / tesis / ocak) kendi
     sekmesinde izlenir, sekme ağaçtan birime tıklanarak açılır. Grup geneli
     talepler ana raporlayan işletmeye (kök birime) yazılır.
     "Vade Aşımı" otomatik hesaplanır; "Gelen Kanıt / Kanıt Yeterlilik" Kanıt
     Kaydı sekmesi geldiğinde bağlanacaktır (şimdilik beklenen adet elle izlenir). */
  var rfiSuz = { ara: "", durum: "", oncelik: "", bolum: "" };

  function birimSekmesi(kok, org) {
    /* Birim kimlik şeridi: hangi birimin sekmesinde olduğumuz hep görünür */
    var yol = soyYolu(org.id);
    var rOzet = rfiOzet(org.id);
    kok.appendChild(el("div", { class: "kart" }, [el("div", { class: "kart-ic", style: "padding:14px 18px" }, [
      el("div", { class: "idx-kirinti" }, yol.map(function (p, i) {
        var son = i === yol.length - 1;
        return el("span", null, [
          son ? el("b", null, [p.ad]) :
            el("a", { href: "javascript:void(0)", onclick: function () { birimSekmesiAc(p.id); } }, [p.ad]),
          son ? null : " › "
        ]);
      })),
      el("div", { class: "idx-birim-ozet", style: "margin-top:8px" }, [
        el("span", { class: "rozet " + (TUR_SINIF[org.tur] || "k1") }, [org.tur || "—"]),
        el("span", { class: "rozet " + (org.durum === "Aktif" ? "tam" : (org.durum === "Teyit Bekliyor" ? "kismi" : "uyari")) }, [org.durum || "—"]),
        el("span", { class: "idx-id" }, [org.id]),
        org.konum ? el("span", { class: "idx-mini" }, ["📍 " + org.konum]) : null,
        el("span", { style: "flex:1" }),
        el("button", { class: "btn kucuk ikincil", type: "button", onclick: function () {
          seciliId = org.id; aktifSekme = "org"; UI.ciz();
        } }, ["◧ Ağaçta Gör"])
      ])
    ])]));

    var liste = rfiListe().filter(function (r) { return r.tesisId === org.id; });

    if (!liste.length) {
      kok.appendChild(el("div", { class: "kart" }, [el("div", { class: "kart-ic" }, [
        el("div", { class: "bos-durum" }, [
          el("div", { class: "buyuk" }, ["▤"]),
          el("div", null, ["Bu birim için henüz RFI kalemi yok."]),
          el("div", { style: "font-size:12px;margin-top:6px" },
            ["Belge/veri talepleri birim bazında izlenir; her kalem 9-durumlu yaşam döngüsüyle takip edilir, ",
             "vadesi geçen açık kalemler otomatik işaretlenir."]),
          el("div", { style: "margin-top:14px" }, [
            el("button", { class: "btn birincil", type: "button",
              onclick: function () { rfiFormu(null, org.id); } }, ["+ Yeni RFI"])
          ])
        ])
      ])]));
      return;
    }

    /* KPI şeridi (yalnız bu birimin kayıtları) */
    var acikKritik = 0, vadeAsan = 0, tamamlanan = 0, kapsamDisi = 0;
    liste.forEach(function (r) {
      if (!RFI_KAPALI[r.durum] && r.oncelik === "Kritik") acikKritik++;
      if (gecikmeGun(r) > 0) vadeAsan++;
      if (r.durum === "Tamamı Geldi" || r.durum === "Doğrulandı") tamamlanan++;
      if (r.durum === "Kapsam Dışı") kapsamDisi++;
    });
    var payda = liste.length - kapsamDisi;
    function kpi(sinif, etiket, deger, birim) {
      return el("div", { class: "kpi " + sinif }, [
        el("div", { class: "etiket" }, [etiket]),
        el("div", { class: "deger" }, [String(deger)]),
        el("div", { class: "birim" }, [birim])]);
    }
    kok.appendChild(el("div", { class: "kpi-dizi" }, [
      kpi("n", "Toplam Kalem", liste.length, kapsamDisi ? kapsamDisi + " kalem kapsam dışı" : "bu birimin RFI kaydı"),
      kpi("k1", "Açık Kritik", acikKritik, "kritik öncelikli bekleyen"),
      kpi("k3", "Vade Aşan", vadeAsan, vadeAsan ? "açık kalem vadeyi geçti" : "gecikme yok"),
      kpi("k2", "Tamamlanma", payda ? Math.round(100 * tamamlanan / payda) + "%" : "—",
        tamamlanan + " / " + payda + " kalem geldi ya da doğrulandı")
    ]));

    /* Filtre çubuğu */
    var bolumler = {};
    liste.forEach(function (r) { if (r.bolum) bolumler[r.bolum] = 1; });
    function suzSecim(anahtar, bosEtiket, secenekler) {
      var g = el("select", { "aria-label": bosEtiket });
      g.appendChild(el("option", { value: "" }, [bosEtiket]));
      secenekler.forEach(function (s) { g.appendChild(el("option", { value: s }, [s])); });
      g.value = rfiSuz[anahtar];
      g.addEventListener("change", function () { rfiSuz[anahtar] = g.value; UI.ciz(); });
      return g;
    }
    var araGirdi = el("input", { type: "search", placeholder: "Kalem / talep metni ara…",
      value: rfiSuz.ara, "aria-label": "RFI ara" });
    araGirdi.addEventListener("input", function () { rfiSuz.ara = araGirdi.value; ciztRfiTablo(); });
    kok.appendChild(el("div", { class: "admin-arac" }, [
      araGirdi,
      suzSecim("durum", "Durum (tümü)", RFI_DURUMLAR),
      suzSecim("oncelik", "Öncelik (tümü)", RFI_ONCELIKLER),
      suzSecim("bolum", "Bölüm (tümü)", Object.keys(bolumler).sort()),
      el("button", { class: "btn kucuk ikincil", type: "button", onclick: function () {
        rfiSuz = { ara: "", durum: "", oncelik: "", bolum: "" }; UI.ciz();
      } }, ["Temizle"])
    ]));

    var kartIc = el("div", { class: "kart-ic", style: "padding:0" });
    kok.appendChild(el("div", { class: "kart" }, [
      el("div", { class: "kart-baslik" }, [
        el("h3", null, ["RFI Kayıtları — " + org.ad]),
        el("button", { class: "btn kucuk birincil", type: "button",
          onclick: function () { rfiFormu(null, org.id); } }, ["+ Yeni RFI"])
      ]),
      kartIc
    ]));

    function suzgecUygula() {
      var ara = rfiSuz.ara.trim().toLowerCase();
      return liste.filter(function (r) {
        if (rfiSuz.durum && r.durum !== rfiSuz.durum) return false;
        if (rfiSuz.oncelik && r.oncelik !== rfiSuz.oncelik) return false;
        if (rfiSuz.bolum && r.bolum !== rfiSuz.bolum) return false;
        if (ara && ((r.no + " " + (r.kalem || "") + " " + (r.talep || "") + " " + (r.not || ""))
          .toLowerCase().indexOf(ara) < 0)) return false;
        return true;
      }).sort(function (a, b) { return (+a.no) - (+b.no); });
    }

    /* Tablo ayrıca çizilir: arama kutusunda her tuşta yalnız tablo tazelenir (odak kaybolmaz) */
    function ciztRfiTablo() {
      kartIc.innerHTML = "";
      var satirlar = suzgecUygula();
      if (!satirlar.length) {
        kartIc.appendChild(el("div", { class: "bos-durum" }, [
          el("div", { class: "buyuk" }, ["▤"]),
          el("div", null, ["Süzgeçle eşleşen kayıt yok."])]));
        return;
      }
      var thead = el("thead", null, [el("tr", null,
        ["No", "Bölüm", "RFI Kalemi", "Öncelik", "Durum", "Vade", "Kanıt"].map(function (b) {
          return el("th", null, [b]);
        }).concat([el("th", { class: "satir-islem" }, ["İşlem"])]))]);
      var tbody = el("tbody");
      satirlar.forEach(function (r) {
        var gec = gecikmeGun(r);
        var durumSec = el("select", { class: "idx-durum-sec", "aria-label": "RFI " + r.no + " durumu" });
        RFI_DURUMLAR.forEach(function (d) { durumSec.appendChild(el("option", { value: d }, [d])); });
        durumSec.value = r.durum || "Henüz İstenmedi";
        durumSec.addEventListener("change", function () {
          r.durum = durumSec.value;
          r.sonHareket = bugunIso();       // Excel Değişiklik Günlüğü kuralının hafif karşılığı
          Depo.kaydet();
          UI.bildir("RFI " + r.no + " → " + r.durum);
          UI.ciz();
        });
        var tr = el("tr", { class: gec ? "idx-gecikmis" : "" }, [
          el("td", { class: "sayi" }, [String(r.no)]),
          el("td", null, [r.bolum || "—"]),
          el("td", null, [
            el("div", { style: "font-weight:600" }, [r.kalem || "—"]),
            r.talep ? el("div", { class: "idx-talep" }, [UI.kisalt(r.talep, 90)]) : null
          ]),
          el("td", null, [el("span", { class: "rozet " + (RFI_ONCELIK_ROZET[r.oncelik] || "bos") }, [r.oncelik || "—"])]),
          el("td", null, [durumSec]),
          el("td", null, [
            el("div", null, [tarihGoster(r.vadeTarihi)]),
            gec ? el("div", { class: "idx-vade-uyari" }, ["⚠ " + gec + " gün gecikti"]) : null
          ]),
          el("td", { class: "sayi", title: "Gelen kanıt (Kanıt Kaydı'ndan otomatik)" +
            (r.beklenenKanit != null && r.beklenenKanit !== "" ? " / beklenen" : "") }, [
            String(kanitSayisi(r.no, org.id)) +
            (r.beklenenKanit != null && r.beklenenKanit !== "" ? " / " + r.beklenenKanit : "")
          ]),
          el("td", { class: "satir-islem" }, [
            el("button", { class: "btn kucuk ikincil", type: "button", style: "margin-left:6px",
              onclick: function () { rfiFormu(r, r.tesisId); } }, ["✎"]),
            el("button", { class: "btn kucuk tehlike", type: "button", style: "margin-left:6px",
              onclick: function () { rfiSil(r); } }, ["✕"])
          ])
        ]);
        tbody.appendChild(tr);
      });
      kartIc.appendChild(el("div", { class: "tablo-sar" }, [el("table", { class: "veri" }, [thead, tbody])]));
    }
    ciztRfiTablo();
  }

  /* ---- RFI ekleme / düzenleme formu ---- */
  function rfiFormu(kayit, tesisId) {
    var yeni = !kayit;
    var f = {};
    var birim = bul(tesisId) || {};

    function secimAlani(anahtar, etiket, secenekler, deger) {
      var g = el("select", { "data-anahtar": anahtar });
      g.appendChild(el("option", { value: "" }, ["— Seçin —"]));
      secenekler.forEach(function (s) { g.appendChild(el("option", { value: s }, [s])); });
      if (deger != null) g.value = deger;
      var a = el("div", { class: "alan" }, [el("label", null, [etiket]), g]);
      a.girdi = g;
      return a;
    }

    /* Birim sabittir: RFI kalemi, sekmesi açık olan birime kayıtlıdır (birim
       bazlı toplama modeli); başka birime taşıma o birimin sekmesinden yapılır */
    var tesisAlan = el("div", { class: "alan" }, [
      el("label", null, ["Birim"]),
      el("input", { type: "text", readonly: "readonly",
        value: (birim.ad || "—") + "  (" + (tesisId || "—") + ")" })
    ]);

    var bolumler = {};
    rfiListe().forEach(function (r) { if (r.bolum) bolumler[r.bolum] = 1; });

    f.bolum = UI.alan({ anahtar: "bolum", etiket: "Bölüm", tip: "metin",
      datalist: Object.keys(bolumler).sort(), yardim: "gruplama başlığı (ör. Kapsam 1 Faaliyet Verisi)",
      deger: kayit ? kayit.bolum : "" });
    f.kalem = UI.alan({ anahtar: "kalem", etiket: "RFI Kalemi", tip: "metin", zorunlu: true, genis: true,
      deger: kayit ? kayit.kalem : "" });
    f.talep = UI.alan({ anahtar: "talep", etiket: "Talep Metni", tip: "uzun_metin",
      yardim: "müşteriye iletilen talebin değişmez kopyası", deger: kayit ? kayit.talep : "" });
    f.oncelik = secimAlani("oncelik", "Öncelik", RFI_ONCELIKLER, kayit ? kayit.oncelik : "Normal");
    f.durum = secimAlani("durum", "Durum", RFI_DURUMLAR, kayit ? kayit.durum : "Henüz İstenmedi");
    f.sorD = UI.alan({ anahtar: "sorDanisman", etiket: "Sorumlu (Danışman)", tip: "metin", deger: kayit ? kayit.sorDanisman : "" });
    f.sorM = UI.alan({ anahtar: "sorMusteri", etiket: "Sorumlu (Müşteri)", tip: "metin", deger: kayit ? kayit.sorMusteri : "" });
    f.talepT = UI.alan({ anahtar: "talepTarihi", etiket: "Talep Tarihi", tip: "tarih", deger: kayit ? kayit.talepTarihi : "" });
    f.vadeT = UI.alan({ anahtar: "vadeTarihi", etiket: "Vade Tarihi", tip: "tarih", deger: kayit ? kayit.vadeTarihi : "" });
    f.kanit = UI.alan({ anahtar: "beklenenKanit", etiket: "Beklenen Kanıt (adet)", tip: "sayi",
      deger: kayit && kayit.beklenenKanit != null ? kayit.beklenenKanit : "" });
    f.not = UI.alan({ anahtar: "not", etiket: "Not", tip: "uzun_metin", deger: kayit ? kayit.not : "" });

    var govde = el("div", { class: "form-izgara" },
      [f.bolum, tesisAlan, f.kalem, f.talep, f.oncelik, f.durum, f.sorD, f.sorM, f.talepT, f.vadeT, f.kanit, f.not]);

    UI.modal(yeni ? "Yeni RFI — " + (birim.ad || "") : "RFI " + kayit.no + " — Düzenle", govde, [
      { etiket: "Vazgeç" },
      { etiket: yeni ? "Ekle" : "Kaydet", sinif: "birincil", tik: function (kapat) {
          UI.alanHatalariTemizle(govde);
          var v = UI.degerler(govde), hata = false;
          if (!v.kalem.trim()) { UI.alanHata(f.kalem, "RFI kalemi zorunludur"); hata = true; }
          if (v.beklenenKanit !== "" && (isNaN(+v.beklenenKanit) || +v.beklenenKanit < 0)) {
            UI.alanHata(f.kanit, "0 ya da pozitif bir sayı girin"); hata = true;
          }
          if (v.talepTarihi && v.vadeTarihi && v.vadeTarihi < v.talepTarihi) {
            UI.alanHata(f.vadeT, "Vade, talep tarihinden önce olamaz"); hata = true;
          }
          if (hata) return;
          var hedef = kayit || { no: yeniRfiNo() };
          var durumDegisti = !yeni && hedef.durum !== v.durum;
          hedef.bolum = v.bolum.trim(); hedef.kalem = v.kalem.trim(); hedef.talep = v.talep.trim();
          hedef.tesisId = tesisId; hedef.oncelik = v.oncelik || "Normal";
          hedef.durum = v.durum || "Henüz İstenmedi";
          hedef.sorDanisman = v.sorDanisman.trim(); hedef.sorMusteri = v.sorMusteri.trim();
          hedef.talepTarihi = v.talepTarihi; hedef.vadeTarihi = v.vadeTarihi;
          hedef.beklenenKanit = v.beklenenKanit === "" ? null : +v.beklenenKanit;
          hedef.not = v.not.trim();
          if (yeni || durumDegisti) hedef.sonHareket = bugunIso();
          if (yeni) rfiListe().push(hedef);
          Depo.kaydet();
          kapat();
          UI.bildir(yeni ? "RFI " + hedef.no + " eklendi" : "RFI " + hedef.no + " güncellendi");
          UI.ciz();
        } }
    ], 760);
  }

  function rfiSil(kayit) {
    var bagli = kanitSayisi(kayit.no, kayit.tesisId);
    if (bagli) {
      UI.bildir("RFI " + kayit.no + " silinemedi: bu birimde kaleme bağlı " + bagli +
        " kanıt kaydı var. Önce Kanıt Kaydı sekmesinden bağları silin.", true);
      return;
    }
    UI.onayla("RFI " + kayit.no + " (“" + UI.kisalt(kayit.kalem, 60) + "”) silinecek. " +
      "Numara yeniden kullanılmaz (Karar D-04). Devam edilsin mi?", function () {
      var L = rfiListe(), i = L.indexOf(kayit);
      if (i >= 0) L.splice(i, 1);
      Depo.kaydet();
      UI.bildir("RFI " + kayit.no + " silindi");
      UI.ciz();
    });
  }

  /* ================= SEKME 02 — DOKÜMAN KAYDI =================
     Excel 04_Dokuman_Register'ın web karşılığı (sadeleştirilmiş): gelen her
     belge tek satırdır — adı, drive bağlantısı, ait olduğu birim, kapsadığı
     RFI kalemleri (işaretlemeli), yüklenme tarihi ve raporun hangi
     bölümlerinin yazımında kullanıldığı (işaretlemeli). Belgeler drive'da
     yaşar (Karar D-03); burada yalnız kayıt ve iz tutulur. */
  var dokSuz = { ara: "", tesis: "", bolum: "" };

  function sekmeDokuman(kok) {
    var liste = dokumanListe();

    if (!liste.length) {
      kok.appendChild(el("div", { class: "bilgi" }, [
        "Doküman kaydı, müşteriden gelen her belgenin izini tutar: belge drive'da durur, ",
        "buraya adı ve bağlantısı yazılır; hangi birime ait olduğu, hangi RFI taleplerini ",
        "karşıladığı ve raporun hangi bölümlerinde kullanıldığı işaretlenir."]));
      kok.appendChild(el("div", { class: "kart" }, [el("div", { class: "kart-ic" }, [
        el("div", { class: "bos-durum" }, [
          el("div", { class: "buyuk" }, ["🗎"]),
          el("div", null, ["Henüz doküman kaydı yok."]),
          el("div", { style: "margin-top:14px" }, [
            el("button", { class: "btn birincil", type: "button",
              onclick: function () { dokumanFormu(null); } }, ["+ Yeni Doküman"])
          ])
        ])
      ])]));
      return;
    }

    /* KPI şeridi */
    var kapsananNo = {}, bolumluDoc = 0, sonTarih = "";
    liste.forEach(function (d) {
      (d.rfiNolar || []).forEach(function (n) { kapsananNo[n] = 1; });
      if ((d.bolumler || []).length) bolumluDoc++;
      if (d.tarih && d.tarih > sonTarih) sonTarih = d.tarih;
    });
    var toplamRfiNo = rfiKalemleri().length;
    function kpi(sinif, etiket, deger, birim) {
      return el("div", { class: "kpi " + sinif }, [
        el("div", { class: "etiket" }, [etiket]),
        el("div", { class: "deger" }, [String(deger)]),
        el("div", { class: "birim" }, [birim])]);
    }
    kok.appendChild(el("div", { class: "kpi-dizi" }, [
      kpi("n",  "Toplam Doküman", liste.length, "kayıtlı belge"),
      kpi("k1", "RFI Kapsaması", Object.keys(kapsananNo).length + " / " + toplamRfiNo,
        "en az bir belgeyle karşılanan kalem"),
      kpi("k2", "Bölümde Kullanılan", bolumluDoc, "rapor yazımına giren belge"),
      kpi("k3", "Son Yükleme", sonTarih ? tarihGoster(sonTarih) : "—", "en yeni kayıt tarihi")
    ]));

    /* Filtre çubuğu */
    function suzSecim(anahtar, bosEtiket, secenekler) {
      var g = el("select", { "aria-label": bosEtiket });
      g.appendChild(el("option", { value: "" }, [bosEtiket]));
      secenekler.forEach(function (s) {
        g.appendChild(el("option", { value: s.deger != null ? s.deger : s }, [s.ad != null ? s.ad : s]));
      });
      g.value = dokSuz[anahtar];
      g.addEventListener("change", function () { dokSuz[anahtar] = g.value; UI.ciz(); });
      return g;
    }
    var araGirdi = el("input", { type: "search", placeholder: "Doküman adı / not ara…",
      value: dokSuz.ara, "aria-label": "Doküman ara" });
    araGirdi.addEventListener("input", function () { dokSuz.ara = araGirdi.value; ciztDokTablo(); });
    kok.appendChild(el("div", { class: "admin-arac" }, [
      araGirdi,
      suzSecim("tesis", "Birim (tümü)", orgListe().map(function (o) { return { deger: o.id, ad: o.ad }; })),
      suzSecim("bolum", "Bölüm (tümü)", bolumSecenekleri()),
      el("button", { class: "btn kucuk ikincil", type: "button", onclick: function () {
        dokSuz = { ara: "", tesis: "", bolum: "" }; UI.ciz();
      } }, ["Temizle"])
    ]));

    var kartIc = el("div", { class: "kart-ic", style: "padding:0" });
    kok.appendChild(el("div", { class: "kart" }, [
      el("div", { class: "kart-baslik" }, [
        el("h3", null, ["Doküman Kayıtları"]),
        el("button", { class: "btn kucuk birincil", type: "button",
          onclick: function () { dokumanFormu(null); } }, ["+ Yeni Doküman"])
      ]),
      kartIc
    ]));

    function suzgecUygula() {
      var ara = dokSuz.ara.trim().toLowerCase();
      return liste.filter(function (d) {
        if (dokSuz.tesis && d.tesisId !== dokSuz.tesis) return false;
        if (dokSuz.bolum && (d.bolumler || []).indexOf(dokSuz.bolum) < 0) return false;
        if (ara && ((d.id + " " + (d.ad || "") + " " + (d.not || ""))
          .toLowerCase().indexOf(ara) < 0)) return false;
        return true;
      }).sort(function (a, b) { return (b.tarih || "").localeCompare(a.tarih || ""); });
    }

    function ciztDokTablo() {
      kartIc.innerHTML = "";
      var satirlar = suzgecUygula();
      if (!satirlar.length) {
        kartIc.appendChild(el("div", { class: "bos-durum" }, [
          el("div", { class: "buyuk" }, ["🗎"]),
          el("div", null, ["Süzgeçle eşleşen kayıt yok."])]));
        return;
      }
      var thead = el("thead", null, [el("tr", null,
        ["ID", "Doküman Adı", "Bağlantı", "Ait Olduğu Birim", "Kapsadığı RFI'lar", "Yüklenme", "Kullanıldığı Bölümler"]
          .map(function (b) { return el("th", null, [b]); })
          .concat([el("th", { class: "satir-islem" }, ["İşlem"])]))]);
      var tbody = el("tbody");
      satirlar.forEach(function (d) {
        var birim = d.tesisId ? bul(d.tesisId) : null;
        var nolar = (d.rfiNolar || []).slice().sort(function (a, b) { return a - b; });
        var rfiHucre;
        if (!nolar.length) rfiHucre = ["—"];
        else if (nolar.length <= 8) rfiHucre = nolar.map(function (n) {
          return el("span", { class: "idx-cip", title: "RFI " + n }, [String(n)]);
        });
        else rfiHucre = [el("span", { class: "idx-cip", title: nolar.join(", ") }, [nolar.length + " kalem"])];
        var tr = el("tr", null, [
          el("td", null, [el("span", { class: "idx-id" }, [d.id])]),
          el("td", null, [
            el("div", { style: "font-weight:600" }, [d.ad || "—"]),
            d.not ? el("div", { class: "idx-talep" }, [UI.kisalt(d.not, 80)]) : null
          ]),
          el("td", null, [/^https?:\/\//i.test(d.link || "")
            ? el("a", { href: d.link, target: "_blank", rel: "noopener noreferrer", title: d.link }, ["↗ Aç"])
            : (d.link ? UI.kisalt(d.link, 24) : "—")]),
          el("td", null, birim
            ? [el("a", { href: "javascript:void(0)", title: "Birim sekmesini aç",
                onclick: function () { birimSekmesiAc(birim.id); } }, [birim.ad])]
            : ["—"]),
          el("td", null, rfiHucre),
          el("td", null, [tarihGoster(d.tarih)]),
          el("td", null, (d.bolumler || []).length
            ? d.bolumler.map(function (b) { return el("span", { class: "idx-cip" }, [UI.kisalt(b, 26)]); })
            : ["—"]),
          el("td", { class: "satir-islem" }, [
            el("button", { class: "btn kucuk ikincil", type: "button", style: "margin-left:6px",
              onclick: function () { dokumanFormu(d); } }, ["✎"]),
            el("button", { class: "btn kucuk tehlike", type: "button", style: "margin-left:6px",
              onclick: function () { dokumanSil(d); } }, ["✕"])
          ])
        ]);
        tbody.appendChild(tr);
      });
      kartIc.appendChild(el("div", { class: "tablo-sar" }, [el("table", { class: "veri" }, [thead, tbody])]));
    }
    ciztDokTablo();
  }

  /* ---- Doküman ekleme / düzenleme formu ---- */
  function dokumanFormu(kayit) {
    var yeni = !kayit;
    var f = {};

    f.ad = UI.alan({ anahtar: "ad", etiket: "Doküman Adı", tip: "metin", zorunlu: true, genis: true,
      deger: kayit ? kayit.ad : "" });
    f.link = UI.alan({ anahtar: "link", etiket: "Drive Bağlantısı", tip: "metin", genis: true,
      yardim: "OneDrive/Drive paylaşım linki (belge drive'da yaşar — Karar D-03)",
      deger: kayit ? kayit.link : "" });

    /* Ait olduğu birim: organizasyon ağacından */
    var tesisSec = el("select", { "data-anahtar": "tesisId" });
    tesisSec.appendChild(el("option", { value: "" }, ["— Seçin —"]));
    orgListe().forEach(function (o) {
      tesisSec.appendChild(el("option", { value: o.id }, [o.ad + "  (" + o.id + ")"]));
    });
    tesisSec.value = kayit ? (kayit.tesisId || "") : "";
    var tesisAlan = el("div", { class: "alan" }, [
      el("label", null, ["Ait Olduğu Birim", el("span", { class: "zorunlu" }, ["*"])]), tesisSec]);

    f.tarih = UI.alan({ anahtar: "tarih", etiket: "Yüklenme Tarihi", tip: "tarih",
      deger: kayit ? kayit.tarih : bugunIso() });

    /* Kapsadığı RFI'lar: işaretlemeli liste (aramalı) */
    var seciliNolar = {};
    (kayit && kayit.rfiNolar ? kayit.rfiNolar : []).forEach(function (n) { seciliNolar[n] = true; });
    var rfiIzgara = el("div", { class: "idx-onay-izgara" });
    var rfiSatirlar = rfiKalemleri().map(function (k) {
      var kutu = el("input", { type: "checkbox", checked: !!seciliNolar[k.no] });
      kutu.addEventListener("change", function () {
        if (kutu.checked) seciliNolar[k.no] = true; else delete seciliNolar[k.no];
      });
      var etiket = el("label", { class: "idx-onay" }, [kutu,
        el("span", null, [el("b", null, [String(k.no)]), " — " + UI.kisalt(k.kalem, 46)])]);
      etiket._metin = (k.no + " " + k.kalem).toLowerCase();
      rfiIzgara.appendChild(etiket);
      return etiket;
    });
    var rfiAra = el("input", { type: "search", placeholder: "Kalem ara (no ya da ad)…",
      style: "margin-bottom:6px", "aria-label": "RFI kalemi ara" });
    rfiAra.addEventListener("input", function () {
      var ara = rfiAra.value.trim().toLowerCase();
      rfiSatirlar.forEach(function (l) { l.style.display = (!ara || l._metin.indexOf(ara) >= 0) ? "" : "none"; });
    });
    var rfiAlan = el("div", { class: "alan genis" }, [
      el("label", null, ["Kapsadığı RFI Kalemleri",
        el("span", { class: "yardim" }, [" birden çok işaretlenebilir"])]),
      rfiAra, rfiIzgara,
      rfiKalemleri().length ? null : el("div", { class: "yardim" },
        ["Henüz RFI kaydı yok — önce birim sekmelerinden RFI ekleyin."])
    ]);

    /* Kullanıldığı bölümler: işaretlemeli */
    var seciliBolumler = {};
    (kayit && kayit.bolumler ? kayit.bolumler : []).forEach(function (b) { seciliBolumler[b] = true; });
    var bolumIzgara = el("div", { class: "idx-onay-izgara", style: "max-height:none" });
    bolumSecenekleri().forEach(function (b) {
      var kutu = el("input", { type: "checkbox", checked: !!seciliBolumler[b] });
      kutu.addEventListener("change", function () {
        if (kutu.checked) seciliBolumler[b] = true; else delete seciliBolumler[b];
      });
      bolumIzgara.appendChild(el("label", { class: "idx-onay" }, [kutu, el("span", null, [b])]));
    });
    var bolumAlan = el("div", { class: "alan genis" }, [
      el("label", null, ["Raporun Hangi Bölümlerinde Kullanıldı",
        el("span", { class: "yardim" }, [" yazımda yararlanılan bölümleri işaretleyin"])]),
      bolumIzgara
    ]);

    f.not = UI.alan({ anahtar: "not", etiket: "Not", tip: "uzun_metin", deger: kayit ? kayit.not : "" });

    var govde = el("div", { class: "form-izgara" },
      [f.ad, f.link, tesisAlan, f.tarih, rfiAlan, bolumAlan, f.not]);

    UI.modal(yeni ? "Yeni Doküman Kaydı" : kayit.id + " — Düzenle", govde, [
      { etiket: "Vazgeç" },
      { etiket: yeni ? "Ekle" : "Kaydet", sinif: "birincil", tik: function (kapat) {
          UI.alanHatalariTemizle(govde);
          var v = UI.degerler(govde), hata = false;
          if (!v.ad.trim()) { UI.alanHata(f.ad, "Doküman adı zorunludur"); hata = true; }
          if (!v.tesisId) { UI.alanHata(tesisAlan, "Ait olduğu birimi seçin"); hata = true; }
          if (v.link.trim() && !/^https?:\/\//i.test(v.link.trim())) {
            UI.alanHata(f.link, "Bağlantı http:// ya da https:// ile başlamalı"); hata = true;
          }
          if (hata) return;
          var hedef = kayit || { id: yeniDocId() };
          hedef.ad = v.ad.trim();
          hedef.link = v.link.trim();
          hedef.tesisId = v.tesisId;
          hedef.tarih = v.tarih || bugunIso();
          hedef.rfiNolar = Object.keys(seciliNolar).map(Number).sort(function (a, b) { return a - b; });
          hedef.bolumler = bolumSecenekleri().filter(function (b) { return seciliBolumler[b]; });
          hedef.not = v.not.trim();
          if (yeni) dokumanListe().push(hedef);
          Depo.kaydet();
          kapat();
          UI.bildir(yeni ? hedef.id + " eklendi" : hedef.id + " güncellendi");
          UI.ciz();
        } }
    ], 820);
  }

  function dokumanSil(kayit) {
    var bagli = kanitListe().filter(function (k) { return k.docId === kayit.id; }).length;
    if (bagli) {
      UI.bildir(kayit.id + " silinemedi: belgeye bağlı " + bagli + " kanıt kaydı var. Önce Kanıt Kaydı sekmesinden bağları silin.", true);
      return;
    }
    UI.onayla("“" + UI.kisalt(kayit.ad, 60) + "” (" + kayit.id + ") kaydı silinecek; " +
      "drive'daki belgenin kendisi silinmez. Devam edilsin mi?", function () {
      var L = dokumanListe(), i = L.indexOf(kayit);
      if (i >= 0) L.splice(i, 1);
      Depo.kaydet();
      UI.bildir(kayit.id + " silindi");
      UI.ciz();
    });
  }

  /* ================= SEKME 03 — KANIT KAYDI =================
     Excel 05_Kanit_Register'ın web karşılığı. Karar D-08: Doküman ≠ Kanıt —
     bir kanıt satırı, bir belgenin BELLİ bir RFI kalemini BELLİ bir birim ve
     dönem için karşıladığını söyler. RFI tablolarındaki "gelen kanıt" sayacı
     buradan otomatik türetilir. */
  var kanitSuz = { ara: "", dok: "", tesis: "", nitelik: "" };

  function sekmeKanit(kok) {
    var liste = kanitListe();

    if (!liste.length) {
      kok.appendChild(el("div", { class: "bilgi" }, [
        "Kanıt kaydı, belge ile talebi birbirine bağlar (Doküman ≠ Kanıt — Karar D-08): ",
        "bir satır, bir belgenin belli bir RFI kalemini belli bir birim ve dönem için ",
        "karşıladığını gösterir. Birim sekmelerindeki “gelen kanıt” sayıları buradan otomatik hesaplanır."]));
      kok.appendChild(el("div", { class: "kart" }, [el("div", { class: "kart-ic" }, [
        el("div", { class: "bos-durum" }, [
          el("div", { class: "buyuk" }, ["⛓"]),
          el("div", null, ["Henüz kanıt bağı yok."]),
          dokumanListe().length
            ? el("div", { style: "margin-top:14px" }, [
                el("button", { class: "btn birincil", type: "button",
                  onclick: function () { kanitFormu(null); } }, ["+ Yeni Kanıt Bağı"])])
            : el("div", { style: "font-size:12px;margin-top:6px" },
                ["Önce Doküman Kaydı sekmesinden belge ekleyin; kanıt, kayıtlı bir belgeye bağlanır."])
        ])
      ])]));
      return;
    }

    /* KPI şeridi */
    var birincil = 0, dogrulanmis = 0, kanitliNo = {};
    liste.forEach(function (k) {
      if (k.nitelik === "Birincil (ölçüm/fatura)") birincil++;
      if (k.dogrulamaTarihi) dogrulanmis++;
      kanitliNo[k.rfiNo] = 1;
    });
    function kpi(sinif, etiket, deger, birim) {
      return el("div", { class: "kpi " + sinif }, [
        el("div", { class: "etiket" }, [etiket]),
        el("div", { class: "deger" }, [String(deger)]),
        el("div", { class: "birim" }, [birim])]);
    }
    kok.appendChild(el("div", { class: "kpi-dizi" }, [
      kpi("n",  "Toplam Kanıt", liste.length, "belge × RFI × birim bağı"),
      kpi("k2", "Birincil Nitelikli", birincil, "ölçüm / fatura dayanaklı"),
      kpi("k1", "Doğrulanmış", dogrulanmis, "doğrulama tarihi işlenen"),
      kpi("k3", "Kanıtlı Kalem", Object.keys(kanitliNo).length + " / " + rfiKalemleri().length,
        "en az bir kanıtı olan RFI")
    ]));

    /* Filtre çubuğu */
    function suzSecim(anahtar, bosEtiket, secenekler) {
      var g = el("select", { "aria-label": bosEtiket });
      g.appendChild(el("option", { value: "" }, [bosEtiket]));
      secenekler.forEach(function (s) {
        g.appendChild(el("option", { value: s.deger != null ? s.deger : s }, [s.ad != null ? s.ad : s]));
      });
      g.value = kanitSuz[anahtar];
      g.addEventListener("change", function () { kanitSuz[anahtar] = g.value; UI.ciz(); });
      return g;
    }
    var araGirdi = el("input", { type: "search", placeholder: "Belge adı / not / RFI no ara…",
      value: kanitSuz.ara, "aria-label": "Kanıt ara" });
    araGirdi.addEventListener("input", function () { kanitSuz.ara = araGirdi.value; ciztKanitTablo(); });
    kok.appendChild(el("div", { class: "admin-arac" }, [
      araGirdi,
      suzSecim("dok", "Doküman (tümü)", dokumanListe().map(function (d) { return { deger: d.id, ad: UI.kisalt(d.ad, 34) }; })),
      suzSecim("tesis", "Birim (tümü)", orgListe().map(function (o) { return { deger: o.id, ad: o.ad }; })),
      suzSecim("nitelik", "Nitelik (tümü)", KANIT_NITELIKLER),
      el("button", { class: "btn kucuk ikincil", type: "button", onclick: function () {
        kanitSuz = { ara: "", dok: "", tesis: "", nitelik: "" }; UI.ciz();
      } }, ["Temizle"])
    ]));

    var kartIc = el("div", { class: "kart-ic", style: "padding:0" });
    kok.appendChild(el("div", { class: "kart" }, [
      el("div", { class: "kart-baslik" }, [
        el("h3", null, ["Kanıt Bağları"]),
        el("button", { class: "btn kucuk birincil", type: "button",
          onclick: function () { kanitFormu(null); } }, ["+ Yeni Kanıt Bağı"])
      ]),
      kartIc
    ]));

    function suzgecUygula() {
      var ara = kanitSuz.ara.trim().toLowerCase();
      return liste.filter(function (k) {
        if (kanitSuz.dok && k.docId !== kanitSuz.dok) return false;
        if (kanitSuz.tesis && k.tesisId !== kanitSuz.tesis) return false;
        if (kanitSuz.nitelik && k.nitelik !== kanitSuz.nitelik) return false;
        if (ara) {
          var d = dokumanBul(k.docId);
          var metin = (k.id + " " + k.rfiNo + " " + (d ? d.ad : "") + " " + (k.not || "")).toLowerCase();
          if (metin.indexOf(ara) < 0) return false;
        }
        return true;
      }).sort(function (a, b) { return (a.id || "").localeCompare(b.id || ""); });
    }

    function ciztKanitTablo() {
      kartIc.innerHTML = "";
      var satirlar = suzgecUygula();
      if (!satirlar.length) {
        kartIc.appendChild(el("div", { class: "bos-durum" }, [
          el("div", { class: "buyuk" }, ["⛓"]),
          el("div", null, ["Süzgeçle eşleşen kayıt yok."])]));
        return;
      }
      var kalemAd = {};
      rfiKalemleri().forEach(function (k) { kalemAd[k.no] = k.kalem; });
      var thead = el("thead", null, [el("tr", null,
        ["ID", "Doküman", "RFI Kalemi", "Birim", "Dönem", "Nitelik", "Güven", "Doğrulama"]
          .map(function (b) { return el("th", null, [b]); })
          .concat([el("th", { class: "satir-islem" }, ["İşlem"])]))]);
      var tbody = el("tbody");
      satirlar.forEach(function (k) {
        var d = dokumanBul(k.docId), birim = k.tesisId ? bul(k.tesisId) : null;
        var tr = el("tr", null, [
          el("td", null, [el("span", { class: "idx-id" }, [k.id])]),
          el("td", null, [
            el("div", { style: "font-weight:600" }, [d ? UI.kisalt(d.ad, 42) : (k.docId || "—")]),
            d && /^https?:\/\//i.test(d.link || "")
              ? el("a", { href: d.link, target: "_blank", rel: "noopener noreferrer",
                  style: "font-size:11px" }, ["↗ Aç"]) : null
          ]),
          el("td", null, [
            el("div", null, [el("b", null, [String(k.rfiNo)]), " — " + UI.kisalt(kalemAd[k.rfiNo] || "", 38)])
          ]),
          el("td", null, birim
            ? [el("a", { href: "javascript:void(0)", title: "Birim sekmesini aç",
                onclick: function () { birimSekmesiAc(birim.id); } }, [UI.kisalt(birim.ad, 30)])]
            : ["—"]),
          el("td", null, [k.donem || "—"]),
          el("td", null, [el("span", { class: "rozet " + (NITELIK_ROZET[k.nitelik] || "bos") }, [k.nitelik || "—"])]),
          el("td", null, [el("span", { class: "rozet " + (GUVEN_ROZET[k.guven] || "bos") }, [k.guven || "—"])]),
          el("td", null, [k.dogrulamaTarihi
            ? el("span", null, ["✓ " + tarihGoster(k.dogrulamaTarihi) + (k.dogrulayan ? " · " + k.dogrulayan : "")])
            : el("span", { class: "idx-mini" }, ["bekliyor"])]),
          el("td", { class: "satir-islem" }, [
            el("button", { class: "btn kucuk ikincil", type: "button", style: "margin-left:6px",
              onclick: function () { kanitFormu(k); } }, ["✎"]),
            el("button", { class: "btn kucuk tehlike", type: "button", style: "margin-left:6px",
              onclick: function () { kanitSil(k); } }, ["✕"])
          ])
        ]);
        tbody.appendChild(tr);
      });
      kartIc.appendChild(el("div", { class: "tablo-sar" }, [el("table", { class: "veri" }, [thead, tbody])]));
    }
    ciztKanitTablo();
  }

  /* ---- Kanıt ekleme / düzenleme formu ---- */
  function kanitFormu(kayit) {
    var yeni = !kayit;
    var f = {};
    if (!dokumanListe().length) {
      UI.bildir("Önce Doküman Kaydı sekmesinden belge ekleyin; kanıt, kayıtlı bir belgeye bağlanır.", true);
      return;
    }

    /* Doküman seçimi — seçilince birim, belgenin birimine önerilir */
    var dokSec = el("select", { "data-anahtar": "docId" });
    dokSec.appendChild(el("option", { value: "" }, ["— Seçin —"]));
    dokumanListe().forEach(function (d) {
      dokSec.appendChild(el("option", { value: d.id }, [d.id + " — " + UI.kisalt(d.ad, 48)]));
    });
    dokSec.value = kayit ? (kayit.docId || "") : "";
    var dokAlan = el("div", { class: "alan genis" }, [
      el("label", null, ["Doküman", el("span", { class: "zorunlu" }, ["*"])]), dokSec]);

    var rfiSec = el("select", { "data-anahtar": "rfiNo" });
    rfiSec.appendChild(el("option", { value: "" }, ["— Seçin —"]));
    rfiKalemleri().forEach(function (k) {
      rfiSec.appendChild(el("option", { value: String(k.no) }, [k.no + " — " + UI.kisalt(k.kalem, 52)]));
    });
    rfiSec.value = kayit ? String(kayit.rfiNo || "") : "";
    var rfiAlan = el("div", { class: "alan genis" }, [
      el("label", null, ["Karşıladığı RFI Kalemi", el("span", { class: "zorunlu" }, ["*"])]), rfiSec]);

    var tesisSec = el("select", { "data-anahtar": "tesisId" });
    tesisSec.appendChild(el("option", { value: "" }, ["— Seçin —"]));
    orgListe().forEach(function (o) {
      tesisSec.appendChild(el("option", { value: o.id }, [o.ad + "  (" + o.id + ")"]));
    });
    tesisSec.value = kayit ? (kayit.tesisId || "") : "";
    var tesisAlan = el("div", { class: "alan" }, [
      el("label", null, ["Birim", el("span", { class: "zorunlu" }, ["*"])]), tesisSec]);
    dokSec.addEventListener("change", function () {
      var d = dokumanBul(dokSec.value);
      if (d && d.tesisId && !tesisSec.value) tesisSec.value = d.tesisId;
    });

    function secimAlani(anahtar, etiket, secenekler, deger) {
      var g = el("select", { "data-anahtar": anahtar });
      g.appendChild(el("option", { value: "" }, ["— Seçin —"]));
      secenekler.forEach(function (s) { g.appendChild(el("option", { value: s }, [s])); });
      if (deger != null) g.value = deger;
      var a = el("div", { class: "alan" }, [el("label", null, [etiket]), g]);
      a.girdi = g;
      return a;
    }
    f.donem = UI.alan({ anahtar: "donem", etiket: "Dönem", tip: "metin",
      yardim: "AAAA ya da AAAA-AA (ör. 2025, 2025-01)", deger: kayit ? kayit.donem : "2025" });
    f.nitelik = secimAlani("nitelik", "Kanıt Niteliği", KANIT_NITELIKLER, kayit ? kayit.nitelik : "Beyan");
    f.guven = secimAlani("guven", "Güven Düzeyi", KANIT_GUVENLER, kayit ? kayit.guven : "Orta");
    f.dogrulayan = UI.alan({ anahtar: "dogrulayan", etiket: "Doğrulayan Kişi", tip: "metin",
      deger: kayit ? kayit.dogrulayan : "" });
    f.dogrulamaT = UI.alan({ anahtar: "dogrulamaTarihi", etiket: "Doğrulama Tarihi", tip: "tarih",
      deger: kayit ? kayit.dogrulamaTarihi : "" });
    f.not = UI.alan({ anahtar: "not", etiket: "Not", tip: "uzun_metin", deger: kayit ? kayit.not : "" });

    var govde = el("div", { class: "form-izgara" },
      [dokAlan, rfiAlan, tesisAlan, f.donem, f.nitelik, f.guven, f.dogrulayan, f.dogrulamaT, f.not]);

    UI.modal(yeni ? "Yeni Kanıt Bağı" : kayit.id + " — Düzenle", govde, [
      { etiket: "Vazgeç" },
      { etiket: yeni ? "Ekle" : "Kaydet", sinif: "birincil", tik: function (kapat) {
          UI.alanHatalariTemizle(govde);
          var v = UI.degerler(govde), hata = false;
          if (!v.docId) { UI.alanHata(dokAlan, "Doküman seçin"); hata = true; }
          if (!v.rfiNo) { UI.alanHata(rfiAlan, "RFI kalemi seçin"); hata = true; }
          if (!v.tesisId) { UI.alanHata(tesisAlan, "Birim seçin"); hata = true; }
          if (v.dogrulamaTarihi && !v.dogrulayan.trim()) {
            UI.alanHata(f.dogrulayan, "Doğrulama tarihi girildiyse doğrulayan kişi de yazılmalı"); hata = true;
          }
          if (hata) return;
          var hedef = kayit || { id: yeniEvId() };
          hedef.docId = v.docId; hedef.rfiNo = +v.rfiNo; hedef.tesisId = v.tesisId;
          hedef.donem = v.donem.trim(); hedef.nitelik = v.nitelik; hedef.guven = v.guven;
          hedef.dogrulayan = v.dogrulayan.trim(); hedef.dogrulamaTarihi = v.dogrulamaTarihi;
          hedef.not = v.not.trim();
          if (yeni) kanitListe().push(hedef);
          Depo.kaydet();
          kapat();
          UI.bildir(yeni ? hedef.id + " eklendi" : hedef.id + " güncellendi");
          UI.ciz();
        } }
    ], 760);
  }

  function kanitSil(kayit) {
    UI.onayla(kayit.id + " kanıt bağı silinecek (belgenin kendisi silinmez). Devam edilsin mi?", function () {
      var L = kanitListe(), i = L.indexOf(kayit);
      if (i >= 0) L.splice(i, 1);
      Depo.kaydet();
      UI.bildir(kayit.id + " silindi");
      UI.ciz();
    });
  }

  /* ================= SEKME 04 — VERİ MATRİSİ =================
     Türetilmiş genel bakış (Excel 06_Veri_Matrisi'nin karşılığı): satırlar RFI
     kalemleri, sütunlar organizasyon birimleri; hücre rengi o birimdeki kaydın
     durumunu gösterir. Elle veri girilmez — RFI kayıtlarından hesaplanır;
     hücreye tıklanınca ilgili birim sekmesi açılır. */
  var matSuz = { ara: "", bolum: "" };

  function sekmeMatris(kok) {
    var kalemler = rfiKalemleri();
    if (!kalemler.length || !orgListe().length) {
      kok.appendChild(el("div", { class: "kart" }, [el("div", { class: "kart-ic" }, [
        el("div", { class: "bos-durum" }, [
          el("div", { class: "buyuk" }, ["▦"]),
          el("div", null, ["Matris için önce organizasyon ağacı ve RFI kayıtları gerekir."])
        ])
      ])]));
      return;
    }

    var durumHarita = {};   // "no|tesisId" → durum
    rfiListe().forEach(function (r) { durumHarita[r.no + "|" + r.tesisId] = r.durum; });
    var birimler = orgListe();

    /* Lejant + filtreler */
    var lejant = el("div", { class: "idx-lejant" }, [
      el("span", null, [el("span", { class: "idx-hucre tam" }), " Geldi / Doğrulandı"]),
      el("span", null, [el("span", { class: "idx-hucre kismi" }), " İstendi / Kısmen"]),
      el("span", null, [el("span", { class: "idx-hucre bos" }), " Henüz İstenmedi / Kapsam Dışı"]),
      el("span", null, [el("span", { class: "idx-hucre uyari" }), " Revizyon / Gecikme"]),
      el("span", null, [el("span", { class: "idx-hucre yok" }), " Kayıt yok"])
    ]);
    kok.appendChild(el("div", { class: "bilgi" }, [
      "Bu matris elle doldurulmaz: her hücre, kalemin o birimdeki güncel RFI durumunu gösterir ",
      "ve tıklanınca birimin sekmesini açar. Vadeyi geçen açık kalemler kırmızıya döner."]));

    var bolumler = {};
    kalemler.forEach(function (k) {
      rfiListe().forEach(function (r) { if (r.no === k.no && r.bolum) bolumler[r.bolum] = 1; });
    });
    var araGirdi = el("input", { type: "search", placeholder: "Kalem ara…", value: matSuz.ara,
      "aria-label": "Matris kalem ara" });
    araGirdi.addEventListener("input", function () { matSuz.ara = araGirdi.value; ciztMatris(); });
    var bolumSec = el("select", { "aria-label": "Bölüm süz" });
    bolumSec.appendChild(el("option", { value: "" }, ["Bölüm (tümü)"]));
    Object.keys(bolumler).sort().forEach(function (b) { bolumSec.appendChild(el("option", { value: b }, [b])); });
    bolumSec.value = matSuz.bolum;
    bolumSec.addEventListener("change", function () { matSuz.bolum = bolumSec.value; ciztMatris(); });
    kok.appendChild(el("div", { class: "admin-arac" }, [araGirdi, bolumSec, lejant]));

    var kartIc = el("div", { class: "kart-ic", style: "padding:0" });
    kok.appendChild(el("div", { class: "kart" }, [
      el("div", { class: "kart-baslik" }, [
        el("h3", null, ["RFI × Birim Durum Matrisi"]),
        el("span", { class: "mini" }, [kalemler.length + " kalem × " + birimler.length + " birim"])
      ]),
      kartIc
    ]));

    function hucreSinifi(no, birim) {
      var durum = durumHarita[no + "|" + birim.id];
      if (durum == null) return "yok";
      /* Gecikme kontrolü: o birimdeki kaydın vade aşımı varsa kırmızı */
      var kayit = null;
      rfiListe().forEach(function (r) { if (r.no === no && r.tesisId === birim.id) kayit = r; });
      if (kayit && gecikmeGun(kayit) > 0) return "uyari";
      var rozet = RFI_DURUM_ROZET[durum] || "bos";
      if (rozet === "k3") rozet = "kismi";   // "İstenmediği Halde Bulundu" → sarı ton
      return rozet;
    }

    function ciztMatris() {
      kartIc.innerHTML = "";
      var ara = matSuz.ara.trim().toLowerCase();
      var satirlar = kalemler.filter(function (k) {
        if (ara && ((k.no + " " + k.kalem).toLowerCase().indexOf(ara) < 0)) return false;
        if (matSuz.bolum) {
          var uydu = false;
          rfiListe().forEach(function (r) { if (r.no === k.no && r.bolum === matSuz.bolum) uydu = true; });
          if (!uydu) return false;
        }
        return true;
      });
      if (!satirlar.length) {
        kartIc.appendChild(el("div", { class: "bos-durum" }, [
          el("div", { class: "buyuk" }, ["▦"]),
          el("div", null, ["Süzgeçle eşleşen kalem yok."])]));
        return;
      }
      var thead = el("thead", null, [el("tr", null,
        [el("th", null, ["RFI Kalemi"])].concat(birimler.map(function (b) {
          return el("th", { class: "idx-mat-bas", title: b.ad }, [
            el("a", { href: "javascript:void(0)", style: "color:#fff",
              onclick: function () { birimSekmesiAc(b.id); } }, [b.id])
          ]);
        })))]);
      var tbody = el("tbody");
      satirlar.forEach(function (k) {
        var tr = el("tr", null, [el("td", { class: "idx-mat-kalem" }, [
          el("b", null, [String(k.no)]), " — " + UI.kisalt(k.kalem, 44)
        ])]);
        birimler.forEach(function (b) {
          var sinif = hucreSinifi(k.no, b);
          var durum = durumHarita[k.no + "|" + b.id];
          tr.appendChild(el("td", { class: "idx-mat-hucre" }, [
            el("button", { class: "idx-hucre " + sinif, type: "button",
              title: b.ad + " — " + (durum || "kayıt yok"),
              "aria-label": "RFI " + k.no + ", " + b.ad + ": " + (durum || "kayıt yok"),
              onclick: function () { birimSekmesiAc(b.id); } })
          ]));
        });
        tbody.appendChild(tr);
      });
      kartIc.appendChild(el("div", { class: "tablo-sar" }, [el("table", { class: "veri idx-matris" }, [thead, tbody])]));
    }
    ciztMatris();
  }

  return { ciz: ciz };
})();
