/* ============================================================================
   ENVANTER RAPORU — Yazdırılabilir (A4) TSRS uyumlu karbon envanteri çıktısı
   "Yazdır / PDF Kaydet" düğmesi tarayıcının yazdırma penceresini açar;
   oradan doğrudan PDF olarak kaydedilebilir.
   ============================================================================ */
"use strict";
window.Rapor = (function () {
  var R = {};
  var el = function () { return UI.el.apply(null, arguments); };

  function ust(p) {
    return el("div", { class: "rapor-ust" }, [
      el("span", null, [(p.unvan || "Kuruluş") + " — Karbon Envanteri"]),
      el("span", null, ["Raporlama Yılı: " + (p.yil || "—")])
    ]);
  }
  function th(metinler) {
    return el("thead", null, [el("tr", null, metinler.map(function (m) {
      return el("th", { class: typeof m === "object" ? m.sinif : "" }, [typeof m === "object" ? m.t : m]);
    }))]);
  }
  function trS(hucreler) {
    return el("tr", null, hucreler.map(function (h) {
      if (h && h.sayi !== undefined) return el("td", { class: "sayi" }, [h.sayi]);
      return el("td", null, [h == null ? "—" : h]);
    }));
  }
  function anlat(metin) {
    return el("div", { class: "rapor-anlat" },
      [metin && String(metin).trim() ? metin : el("span", { class: "bos" }, ["(Bu bölüm henüz doldurulmadı.)"])]);
  }
  function tarihTR(t) {
    if (!t) return "—";
    try { return new Date(t + "T00:00:00").toLocaleDateString("tr-TR"); } catch (e) { return t; }
  }

  R.ciz = function (kok) {
    var p = Depo.veri.profil;
    var T = Motor.toplamlar();
    var mod = function (id) { return Depo.modulVeri(id); };

    UI.ustAksiyon(el("button", { class: "btn birincil yazdirma-gizle", type: "button",
      onclick: function () { window.print(); } }, ["⎙ Yazdır / PDF Kaydet"]));

    if (T.hatalar.length) {
      kok.appendChild(el("div", { class: "bilgi yazdirma-gizle", style: "border-left-color:var(--oksit)" },
        ["Dikkat: " + T.hatalar.length + " kayıt hesaplanamadı ve toplamlara dahil edilemedi. Yazdırmadan önce düzeltmeniz önerilir."]));
    }

    /* ============ SAYFA 1 — Kapak, profil, metodoloji ============ */
    var s1 = el("div", { class: "rapor-sayfa" });
    s1.appendChild(el("div", { class: "strata", style: "height:8px;margin-bottom:26px" }, [
      el("span", { class: "s1" }), el("span", { class: "s2" }), el("span", { class: "s3" }), el("span", { class: "s0" })
    ]));
    s1.appendChild(el("h1", null, ["Kurumsal Sera Gazı Envanteri ve TSRS İklim Açıklamaları"]));
    s1.appendChild(el("p", { style: "font-size:14px;margin-top:4px" }, [
      el("b", null, [p.unvan || "—"]),
      " • Raporlama Dönemi: " + tarihTR(p.donemBas) + " — " + tarihTR(p.donemBit) + " (" + (p.yil || "—") + ")"
    ]));
    s1.appendChild(el("h2", null, ["1. Kuruluş Bilgileri"]));
    var t1 = el("table", null, [el("tbody", null, [
      trS(["Ticari Unvan", p.unvan]), trS(["Vergi / MERSİS No", p.vergiNo]),
      trS(["NACE Kodu / Sektör", (p.nace || "—") + (p.sektor ? " — " + p.sektor : "")]),
      trS(["Merkez Adresi", p.adres]), trS(["Rapor Sorumlusu", p.iletisim]),
      trS(["Konsolidasyon Yaklaşımı", p.sinir]),
      trS(["Baz Yıl", p.bazYil]), trS(["İlk TSRS Raporu", p.ilkRapor]),
      trS(["Çalışan Sayısı (TZE)", p.fte]),
      trS(["Net Hasılat (Bin " + (Depo.ayar("para_birimi") || "TL") + ")", p.hasilat && Motor.fmt(parseFloat(p.hasilat), 0)]),
      trS(["Güvence Durumu", (p.dogrulama || "—") + (p.dogrulayici ? " — " + p.dogrulayici : "")])
    ])]);
    s1.appendChild(t1);
    if (p.konsolidasyon) {
      s1.appendChild(el("h2", null, ["2. Organizasyonel Sınır"]));
      s1.appendChild(anlat(p.konsolidasyon));
    }
    s1.appendChild(el("h2", null, [(p.konsolidasyon ? "3" : "2") + ". Metodoloji Beyanı"]));
    s1.appendChild(anlat(Depo.ayar("metodoloji_beyani")));
    if ((p.muafiyetler || []).length) {
      s1.appendChild(el("h2", null, ["Kullanılan TSRS Geçiş Muafiyetleri"]));
      var ml = el("ul", { style: "margin:6px 0;padding-left:20px" });
      p.muafiyetler.forEach(function (m) { ml.appendChild(el("li", { style: "margin-bottom:4px" }, [m])); });
      s1.appendChild(ml);
    }
    kok.appendChild(s1);

    /* ============ SAYFA 2 — Emisyon özeti ============ */
    var s2 = el("div", { class: "rapor-sayfa" });
    s2.appendChild(ust(p));
    s2.appendChild(el("h1", null, ["Sera Gazı Emisyon Özeti"]));
    s2.appendChild(el("h2", null, ["Kapsam Bazında Toplamlar (tCO2e)"]));
    var ozet = el("table", null, [
      th(["Kapsam", { t: "Lokasyona Dayalı", sinif: "sayi" }, { t: "Piyasaya Dayalı", sinif: "sayi" }, { t: "Pay (LD)", sinif: "sayi" }]),
      el("tbody", null, [
        trS([el("b", null, ["Kapsam 1 — Doğrudan"]), { sayi: Motor.fmt(T.k1.toplam, 2) }, { sayi: Motor.fmt(T.k1.toplam, 2) }, { sayi: Motor.pct(T.k1.toplam, T.toplamLD) }]),
        trS([el("b", null, ["Kapsam 2 — Enerji Dolaylı"]), { sayi: Motor.fmt(T.k2ld, 2) }, { sayi: Motor.fmt(T.k2pd, 2) }, { sayi: Motor.pct(T.k2ld, T.toplamLD) }]),
        trS([el("b", null, ["Kapsam 3 — Diğer Dolaylı"]), { sayi: Motor.fmt(T.k3.toplam, 2) }, { sayi: Motor.fmt(T.k3.toplam, 2) }, { sayi: Motor.pct(T.k3.toplam, T.toplamLD) }]),
        trS([el("b", null, ["TOPLAM"]), { sayi: el("b", null, [Motor.fmt(T.toplamLD, 2)]) }, { sayi: el("b", null, [Motor.fmt(T.toplamPD, 2)]) }, { sayi: "100%" }])
      ])
    ]);
    s2.appendChild(ozet);

    s2.appendChild(el("h2", null, ["Gaz Bazında Kütle ve CO2 Eşdeğeri (TSRS 2 md. 29(a)(i))"]));
    var g = T.gaz, c4 = Motor.gwpCH4(), n2 = Motor.gwpN2O();
    s2.appendChild(el("table", null, [
      th(["Gaz", { t: "Kütle (kg)", sinif: "sayi" }, { t: "KIP (AR6 100 yıl)", sinif: "sayi" }, { t: "tCO2e", sinif: "sayi" }]),
      el("tbody", null, [
        trS(["CO2", { sayi: Motor.fmt(g.co2kg, 1) }, { sayi: "1" }, { sayi: Motor.fmt(g.co2kg / 1000, 3) }]),
        trS(["CH4 (fosil)", { sayi: Motor.fmt(g.ch4kg, 3) }, { sayi: Motor.fmt(c4, 1) }, { sayi: Motor.fmt(g.ch4kg * c4 / 1000, 3) }]),
        trS(["N2O", { sayi: Motor.fmt(g.n2okg, 3) }, { sayi: Motor.fmt(n2, 0) }, { sayi: Motor.fmt(g.n2okg * n2 / 1000, 3) }]),
        trS(["F-gazlar", { sayi: Motor.fmt(g.fgazkg, 3) }, { sayi: "gaza göre" }, { sayi: Motor.fmt(g.fgazTco2e, 3) }])
      ])
    ]));

    s2.appendChild(el("h2", null, ["Yoğunluk Göstergeleri"]));
    s2.appendChild(el("table", null, [
      th(["Gösterge", { t: "Değer", sinif: "sayi" }]),
      el("tbody", null, [
        trS(["tCO2e / Çalışan (TZE)", { sayi: Motor.fmt(T.yogunlukFTE, 3) }]),
        trS(["tCO2e / Bin " + (Depo.ayar("para_birimi") || "TL") + " Hasılat", { sayi: Motor.fmt(T.yogunlukHasilat, 4) }]),
        p.uretim ? trS(["tCO2e / Ton Üretim", { sayi: Motor.fmt(T.toplamLD / parseFloat(p.uretim), 4) }]) : null
      ].filter(Boolean))
    ]));
    s2.appendChild(el("h2", null, ["Elektrik Bilgisi (Kapsam 2)"]));
    s2.appendChild(el("p", null, [
      "Toplam tüketim " + Motor.fmt(T.k2.kwh, 0) + " kWh olup bunun " + Motor.fmt(T.k2.recKwh, 0) +
      " kWh'ı (" + Motor.pct(T.k2.recKwh, T.k2.kwh) + ") yenilenebilir enerji sertifikası (REC) ile belgelendirilmiştir. " +
      "Piyasaya dayalı yaklaşımda sertifikalı tüketime sıfır emisyon faktörü uygulanmıştır."
    ]));
    kok.appendChild(s2);

    /* ============ SAYFA 3 — Kategori detayları ============ */
    var s3 = el("div", { class: "rapor-sayfa" });
    s3.appendChild(ust(p));
    s3.appendChild(el("h1", null, ["Kategori Detayları"]));
    s3.appendChild(el("h2", null, ["Kapsam 1 Kırılımı (tCO2e)"]));
    s3.appendChild(el("table", null, [
      th(["Kategori", { t: "tCO2e", sinif: "sayi" }, { t: "Pay", sinif: "sayi" }]),
      el("tbody", null, [
        trS(["Sabit Yanma", { sayi: Motor.fmt(T.k1.sabit, 2) }, { sayi: Motor.pct(T.k1.sabit, T.k1.toplam) }]),
        trS(["Mobil Yanma", { sayi: Motor.fmt(T.k1.mobil, 2) }, { sayi: Motor.pct(T.k1.mobil, T.k1.toplam) }]),
        trS(["Proses Emisyonları", { sayi: Motor.fmt(T.k1.proses, 2) }, { sayi: Motor.pct(T.k1.proses, T.k1.toplam) }]),
        trS(["Kaçak Emisyonlar (F-gazlar)", { sayi: Motor.fmt(T.k1.kacak, 2) }, { sayi: Motor.pct(T.k1.kacak, T.k1.toplam) }]),
        trS([el("b", null, ["Kapsam 1 Toplam"]), { sayi: el("b", null, [Motor.fmt(T.k1.toplam, 2)]) }, { sayi: "100%" }])
      ])
    ]));
    s3.appendChild(el("h2", null, ["Kapsam 3 Kırılımı (tCO2e)"]));
    s3.appendChild(el("table", null, [
      th(["Kategori (GHG Protokolü)", { t: "tCO2e", sinif: "sayi" }, { t: "Pay", sinif: "sayi" }]),
      el("tbody", null, [
        trS(["Kat. 4 — Yük Taşıma (Yukarı Akış)", { sayi: Motor.fmt(T.k3.yukYukari, 2) }, { sayi: Motor.pct(T.k3.yukYukari, T.k3.toplam) }]),
        trS(["Kat. 9 — Yük Taşıma (Aşağı Akış)", { sayi: Motor.fmt(T.k3.yukAsagi, 2) }, { sayi: Motor.pct(T.k3.yukAsagi, T.k3.toplam) }]),
        trS(["Kat. 6 — İş Seyahati", { sayi: Motor.fmt(T.k3.seyahat, 2) }, { sayi: Motor.pct(T.k3.seyahat, T.k3.toplam) }]),
        trS(["Kat. 7 — Çalışan Ulaşımı", { sayi: Motor.fmt(T.k3.ulasim, 2) }, { sayi: Motor.pct(T.k3.ulasim, T.k3.toplam) }]),
        trS(["Diğer Kapsam 3", { sayi: Motor.fmt(T.k3.diger, 2) }, { sayi: Motor.pct(T.k3.diger, T.k3.toplam) }]),
        trS([el("b", null, ["Kapsam 3 Toplam"]), { sayi: el("b", null, [Motor.fmt(T.k3.toplam, 2)]) }, { sayi: "100%" }])
      ])
    ]));

    /* En büyük 12 faaliyet kaynağı */
    var kaynaklar = Depo.veri.faaliyet.map(function (s) {
      var h = Motor.hesapFaaliyet(s);
      return { s: s, t: h.hata ? 0 : h.tco2e };
    }).sort(function (a, b) { return b.t - a.t; }).slice(0, 12);
    if (kaynaklar.length) {
      s3.appendChild(el("h2", null, ["Başlıca Emisyon Kaynakları (ilk " + kaynaklar.length + ")"]));
      s3.appendChild(el("table", null, [
        th(["No", "Tesis / Faaliyet", "Kategori", { t: "Miktar", sinif: "sayi" }, { t: "tCO2e", sinif: "sayi" }]),
        el("tbody", null, kaynaklar.map(function (k) {
          return trS([k.s.no, UI.kisalt(k.s.tesis, 36), k.s.kategori,
            { sayi: Motor.fmt(parseFloat(k.s.miktar), 1) + " " + (k.s.birim || "") },
            { sayi: Motor.fmt(k.t, 3) }]);
        }))
      ]));
    }
    kok.appendChild(s3);

    /* ============ SAYFA 4 — TSRS dört temel içerik ============ */
    var s4 = el("div", { class: "rapor-sayfa" });
    s4.appendChild(ust(p));
    s4.appendChild(el("h1", null, ["TSRS İklimle İlgili Açıklamalar — Dört Temel İçerik"]));

    function anlatBolumu(modulId, baslik) {
      var tanim = null;
      Depo.modulTanimlari().forEach(function (m) { if (m.id === modulId) tanim = m; });
      if (!tanim) return;
      s4.appendChild(el("h2", null, [baslik || tanim.baslik]));
      s4.appendChild(el("p", { style: "font-size:10.5px;color:var(--soluk);margin:0 0 6px" }, [tanim.referans || ""]));
      var mv = mod(modulId);
      (tanim.anlatilar || []).forEach(function (a) {
        var metin = (mv.anlatilar || {})[a.anahtar];
        if (metin && String(metin).trim()) {
          s4.appendChild(el("p", { style: "margin:8px 0 2px" }, [el("b", null, [a.etiket])]));
          s4.appendChild(anlat(metin));
        }
      });
      var doluAnlat = (tanim.anlatilar || []).some(function (a) { return ((mv.anlatilar || {})[a.anahtar] || "").trim(); });
      if (!doluAnlat && !(mv.kayitlar || []).length) s4.appendChild(anlat(""));
    }

    anlatBolumu("yonetisim", "Yönetişim");
    anlatBolumu("strateji", "Strateji");
    anlatBolumu("risk_firsat", "İklim Risk ve Fırsatları");
    /* Risk kayıt özeti tablosu */
    var riskler = mod("risk_firsat").kayitlar || [];
    if (riskler.length) {
      s4.appendChild(el("table", null, [
        th(["ID", "Başlık", "Tür", "Zaman", { t: "Skor", sinif: "sayi" }]),
        el("tbody", null, riskler.map(function (r) {
          var sk = (parseFloat(r.olasilik) || 0) * (parseFloat(r.etki) || 0);
          return trS([r.rid, UI.kisalt(r.baslik, 40), r.tur, r.zaman, { sayi: sk || "—" }]);
        }))
      ]));
    }
    anlatBolumu("direnclilik", "İklim Dirençliliği (Senaryo Analizi)");
    anlatBolumu("risk_yonetimi", "Risk Yönetimi");
    anlatBolumu("hedefler", "Metrikler ve Hedefler");
    /* Hedef özet tablosu */
    var hedefler = mod("hedefler").kayitlar || [];
    if (hedefler.length) {
      s4.appendChild(el("table", null, [
        th(["Hedef", "Tür", { t: "Baz Yıl → Hedef Yılı", sinif: "sayi" }, { t: "Baz → Hedef Değer", sinif: "sayi" }, { t: "Mevcut", sinif: "sayi" }]),
        el("tbody", null, hedefler.map(function (h) {
          return trS([UI.kisalt(h.ad, 34), h.tur,
            { sayi: (h.baz_yil || "—") + " → " + (h.hedef_yil || "—") },
            { sayi: Motor.fmt(parseFloat(h.baz_deger), 1) + " → " + Motor.fmt(parseFloat(h.hedef_deger), 1) },
            { sayi: Motor.fmt(parseFloat(h.mevcut), 1) }]);
        }))
      ]));
    }
    anlatBolumu("onemlilik", "Önemlilik Değerlendirmesi");
    anlatBolumu("muhakemeler", "Önemli Muhakemeler ve Belirsizlikler");

    s4.appendChild(el("p", { style: "margin-top:30px;font-size:10.5px;color:var(--soluk);border-top:1px solid var(--cizgi);padding-top:8px" },
      [(Depo.ayar("rapor_dipnotu") || "") + " — Oluşturma: " + new Date().toLocaleDateString("tr-TR")]));
    kok.appendChild(s4);
  };

  return R;
})();
