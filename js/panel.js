/* ============================================================================
   GÖSTERGE PANELİ — Tüm emisyon özetleri, kırılımlar ve TSRS uyum durumu
   Veriler her açılışta canlı hesaplanır; ayrı bir "hesapla" düğmesi yoktur.
   ============================================================================ */
"use strict";
window.Panel = (function () {
  var P = {};
  var el = function () { return UI.el.apply(null, arguments); };

  function kpi(etiket, deger, birim, sinif) {
    return el("div", { class: "kpi " + (sinif || "") }, [
      el("div", { class: "etiket" }, [etiket]),
      el("div", { class: "deger" }, [deger]),
      el("div", { class: "birim" }, [birim])
    ]);
  }

  function cubuklar(satirlar, renk, toplam) {
    var kap = el("div", { class: "cubuk-grafik" });
    var enb = 0;
    satirlar.forEach(function (s) { if (s.deger > enb) enb = s.deger; });
    satirlar.forEach(function (s) {
      var w = enb > 0 ? Math.max(1.5, s.deger / enb * 100) : 0;
      kap.appendChild(el("div", { class: "cubuk-satir" }, [
        el("div", null, [s.ad]),
        el("div", { class: "cubuk-ray" }, [
          el("div", { class: "cubuk-dolgu", style: "width:" + w + "%;background:" + renk })
        ]),
        el("div", { class: "cubuk-deger" }, [Motor.fmt(s.deger, 2) + (toplam > 0 ? "  (" + Motor.pct(s.deger, toplam) + ")" : "")])
      ]));
    });
    return kap;
  }

  P.ciz = function (kok) {
    var T = Motor.toplamlar();
    var p = Depo.veri.profil;

    /* Yazdır / hızlı erişim */
    UI.ustAksiyon(el("a", { class: "btn ikincil", href: "#/rapor" }, ["Raporu Aç ▤"]));

    /* Üst bilgi şeridi */
    if (p.unvan || p.yil) {
      kok.appendChild(el("div", { class: "bilgi yesil", style: "display:flex;justify-content:space-between;flex-wrap:wrap;gap:8px" }, [
        el("b", null, [(p.unvan || "Kuruluş") + (p.yil ? " — " + p.yil + " Raporlama Yılı" : "")]),
        el("span", null, [(p.sinir ? "Sınır: " + p.sinir : ""), (p.bazYil ? "  •  Baz Yıl: " + p.bazYil : "")])
      ]));
    }

    /* Hatalar */
    if (T.hatalar.length) {
      kok.appendChild(el("div", { class: "bilgi", style: "border-left-color:var(--oksit)" }, [
        el("b", null, ["Hesaplanamayan " + T.hatalar.length + " kayıt var: "]),
        UI.kisalt(T.hatalar.join("  •  "), 220),
        el("span", null, [" — ilgili sayfada \u201C!\u201D işaretli satırları düzeltin."])
      ]));
    }

    /* KPI dizisi */
    kok.appendChild(el("div", { class: "kpi-dizi" }, [
      kpi("Toplam (Lokasyon)", Motor.fmt(T.toplamLD, 2), "tCO2e — K1+K2(LD)+K3", "n"),
      kpi("Kapsam 1", Motor.fmt(T.k1.toplam, 2), "tCO2e — doğrudan", "k1"),
      kpi("Kapsam 2 (LD)", Motor.fmt(T.k2ld, 2), "tCO2e — lokasyona dayalı", "k2"),
      kpi("Kapsam 2 (PD)", Motor.fmt(T.k2pd, 2), "tCO2e — piyasaya dayalı", "k2"),
      kpi("Kapsam 3", Motor.fmt(T.k3.toplam, 2), "tCO2e — değer zinciri", "k3"),
      kpi("Yoğunluk", Motor.fmt(T.yogunlukFTE, 3), "tCO2e / çalışan (TZE)", "n")
    ]));

    /* Kapsam dağılımı — strata şeridi */
    var s1 = T.k1.toplam, s2 = T.k2ld, s3 = T.k3.toplam, st = s1 + s2 + s3;
    var strata = el("div", { class: "strata", style: "height:26px;border-radius:3px;overflow:hidden" }, [
      el("span", { class: "s1", style: "flex-grow:" + (st ? Math.max(s1 / st * 100, .5) : 1), title: "Kapsam 1" }),
      el("span", { class: "s2", style: "flex-grow:" + (st ? Math.max(s2 / st * 100, .5) : 1), title: "Kapsam 2 (LD)" }),
      el("span", { class: "s3", style: "flex-grow:" + (st ? Math.max(s3 / st * 100, .5) : 1), title: "Kapsam 3" })
    ]);
    function lejantSatir(renkDegiskeni, ad, deger) {
      return el("div", { class: "l-satir" }, [
        el("span", { class: "kutu", style: "background:var(--" + renkDegiskeni + ")" }),
        el("span", null, [ad + " — "]),
        el("b", null, [Motor.fmt(deger, 2) + " t (" + Motor.pct(deger, st) + ")"])
      ]);
    }
    kok.appendChild(UI.kart("Kapsam Dağılımı (Lokasyona Dayalı)", [
      strata,
      el("div", { style: "height:14px" }),
      el("div", { class: "lejant", style: "flex-direction:row;gap:26px;flex-wrap:wrap" }, [
        lejantSatir("bakir", "Kapsam 1", s1),
        lejantSatir("malakit", "Kapsam 2", s2),
        lejantSatir("arduvaz", "Kapsam 3", s3)
      ])
    ], { mini: "Toplam: " + Motor.fmt(st, 2) + " tCO2e" }));

    /* Kırılımlar yan yana */
    var izgara2 = el("div", { style: "display:grid;grid-template-columns:repeat(auto-fit,minmax(330px,1fr));gap:0 20px" });
    izgara2.appendChild(UI.kart("Kapsam 1 Kırılımı", [
      cubuklar([
        { ad: "Sabit Yanma", deger: T.k1.sabit },
        { ad: "Mobil Yanma", deger: T.k1.mobil },
        { ad: "Proses Emisyonları", deger: T.k1.proses },
        { ad: "Kaçak (F-gazlar)", deger: T.k1.kacak }
      ], "var(--bakir)", T.k1.toplam)
    ], { kapsam: "k1", mini: Motor.fmt(T.k1.toplam, 2) + " t" }));
    izgara2.appendChild(UI.kart("Kapsam 3 Kırılımı", [
      cubuklar([
        { ad: "Yük Taşıma (Yukarı Akış)", deger: T.k3.yukYukari },
        { ad: "Yük Taşıma (Aşağı Akış)", deger: T.k3.yukAsagi },
        { ad: "İş Seyahati", deger: T.k3.seyahat },
        { ad: "Çalışan Ulaşımı", deger: T.k3.ulasim },
        { ad: "Diğer Kapsam 3", deger: T.k3.diger }
      ], "var(--arduvaz)", T.k3.toplam)
    ], { kapsam: "k3", mini: Motor.fmt(T.k3.toplam, 2) + " t" }));
    kok.appendChild(izgara2);

    /* Kapsam 2 LD vs PD + elektrik bilgileri */
    kok.appendChild(UI.kart("Kapsam 2 — İkili Raporlama (TSRS 2 md. 29(a)(ii))", [
      cubuklar([
        { ad: "Lokasyona Dayalı", deger: T.k2ld },
        { ad: "Piyasaya Dayalı", deger: T.k2pd }
      ], "var(--malakit)", 0),
      el("p", { style: "margin:12px 0 0;font-size:12.5px;color:var(--soluk)" }, [
        "Toplam elektrik: " + Motor.fmt(T.k2.kwh, 0) + " kWh • REC/yeşil sertifikalı: " +
        Motor.fmt(T.k2.recKwh, 0) + " kWh (" + Motor.pct(T.k2.recKwh, T.k2.kwh) + ")" +
        (T.k2.isi ? " • Satın alınan ısı/buhar: " + Motor.fmt(T.k2.isi, 2) + " t" : "")
      ])
    ], { kapsam: "k2" }));

    /* Kirletici kütle dengesi */
    var g = T.gaz;
    var gwpCH4 = Motor.gwpCH4(), gwpN2O = Motor.gwpN2O();
    kok.appendChild(UI.kart("Sera Gazı Kütle Dengesi (TSRS 2 md. 29(a)(i) — gaz bazında)", [
      el("div", { class: "tablo-sar" }, [
        el("table", { class: "veri" }, [
          el("thead", null, [el("tr", null, [
            el("th", null, ["Gaz"]), el("th", { class: "sayi" }, ["Kütle (kg)"]),
            el("th", { class: "sayi" }, ["KIP (AR5)"]), el("th", { class: "sayi" }, ["tCO2e"])
          ])]),
          el("tbody", null, [
            el("tr", null, [el("td", null, ["CO2 — Karbondioksit"]), el("td", { class: "sayi" }, [Motor.fmt(g.co2kg, 1)]),
              el("td", { class: "sayi" }, ["1"]), el("td", { class: "sayi" }, [el("b", null, [Motor.fmt(g.co2kg / 1000, 3)])])]),
            el("tr", null, [el("td", null, ["CH4 — Metan (fosil)"]), el("td", { class: "sayi" }, [Motor.fmt(g.ch4kg, 3)]),
              el("td", { class: "sayi" }, [Motor.fmt(gwpCH4, 1)]), el("td", { class: "sayi" }, [el("b", null, [Motor.fmt(g.ch4kg * gwpCH4 / 1000, 3)])])]),
            el("tr", null, [el("td", null, ["N2O — Diazot monoksit"]), el("td", { class: "sayi" }, [Motor.fmt(g.n2okg, 3)]),
              el("td", { class: "sayi" }, [Motor.fmt(gwpN2O, 0)]), el("td", { class: "sayi" }, [el("b", null, [Motor.fmt(g.n2okg * gwpN2O / 1000, 3)])])]),
            el("tr", null, [el("td", null, ["F-gazlar (HFC, PFC, SF6 vb.)"]), el("td", { class: "sayi" }, [Motor.fmt(g.fgazkg, 3)]),
              el("td", { class: "sayi" }, ["gaza göre"]), el("td", { class: "sayi" }, [el("b", null, [Motor.fmt(g.fgazTco2e, 3)])])])
          ])
        ])
      ])
    ]));

    /* TSRS uyum matrisi */
    var rozet = { "Tamamlandı": "tam", "Devam ediyor": "kismi", "Başlanmadı": "bos" };
    kok.appendChild(UI.kart("TSRS Dört Temel İçerik — Uyum Durumu", [
      el("div", { class: "tablo-sar" }, [
        el("table", { class: "veri" }, [
          el("thead", null, [el("tr", null, [
            el("th", null, ["Temel İçerik"]), el("th", null, ["Standart Referansı"]),
            el("th", null, ["Veri Kaynağı"]), el("th", null, ["Durum"])
          ])]),
          el("tbody", null, Motor.uyumMatrisi().map(function (u) {
            return el("tr", null, [
              el("td", null, [el("b", null, [u.direk])]),
              el("td", null, [u.ref]),
              el("td", null, [u.kaynak]),
              el("td", null, [el("span", { class: "rozet " + rozet[u.durum] }, [u.durum])])
            ]);
          }))
        ])
      ])
    ]));

    /* Tamamlanma durumu listesi */
    var D = Motor.durumlar();
    var ogeler = [
      { ad: "Şirket Profili", yol: "#/profil", d: D.profil, ek: D.profilOran },
      { ad: "Faaliyet Verisi", yol: "#/faaliyet", d: D.faaliyet, ek: Depo.veri.faaliyet.length + " kayıt" },
      { ad: "Soğutucu / Kaçak", yol: "#/sogutucu", d: D.sogutucu, ek: Depo.veri.sogutucu.length + " kayıt" },
      { ad: "Kapsam 2 Elektrik", yol: "#/elektrik", d: D.elektrik, ek: Depo.veri.elektrik.length + " kayıt" }
    ];
    Depo.modulTanimlari().forEach(function (m) {
      ogeler.push({ ad: m.baslik, yol: "#/modul/" + m.id, d: D[m.id] });
    });
    var tamSay = ogeler.filter(function (o) { return o.d === "tam"; }).length;
    var oranYuzde = Math.round(tamSay / ogeler.length * 100);
    kok.appendChild(UI.kart("Rapor Hazırlık Durumu", [
      el("div", { class: "ilerleme-ray", style: "margin-bottom:16px" }, [
        el("div", { class: "ilerleme-dolgu", style: "width:" + oranYuzde + "%" })
      ]),
      el("div", { style: "display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:8px" },
        ogeler.map(function (o) {
          return el("a", { href: o.yol, style: "display:flex;align-items:center;gap:9px;padding:7px 10px;border:1px solid var(--cizgi);border-radius:var(--radius);background:var(--yuzey);color:var(--metin);font-size:13px" }, [
            el("span", { class: "nokta " + (o.d || "bos"), style: "width:8px;height:8px;border-radius:50%;flex:none;background:" +
              (o.d === "tam" ? "var(--malakit)" : o.d === "kismi" ? "var(--altin)" : "#C6C9C2") }),
            el("span", { style: "flex:1" }, [o.ad]),
            o.ek ? el("span", { style: "font-size:11px;color:var(--soluk)" }, [o.ek]) : null
          ]);
        }))
    ], { mini: tamSay + " / " + ogeler.length + " bölüm tamamlandı (%" + oranYuzde + ")" }));
  };

  return P;
})();
