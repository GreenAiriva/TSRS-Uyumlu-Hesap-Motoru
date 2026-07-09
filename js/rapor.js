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
  function dolu(x) { return x != null && String(x).trim() !== ""; }

  /* Zorunlu boş alan → [VERİ BEKLENİYOR] (baskıda da görünür). */
  var EKSIK_ET = "[VERİ BEKLENİYOR]";
  function deg(v, bicim) {
    if (v == null || v === "" || (typeof v === "number" && !isFinite(v)))
      return el("span", { class: "eksik-veri" }, [EKSIK_ET]);
    return bicim ? bicim(v) : v;
  }

  /* Uyum Kontrolü paneli (ekranda; baskıda gizli) */
  function uyumIkon(d) { return ({ gecti: "✓", uyari: "⚠", eksik: "✗", na: "–" })[d] || "•"; }
  function uyumRenk(d) { return ({ gecti: "#1F7A63", uyari: "#B4642D", eksik: "#B3402E", na: "#9aa0a6" })[d] || "#888"; }
  function uyumPaneli(u) {
    var o = u.ozet;
    var serit = el("div", { style: "display:flex;gap:14px;flex-wrap:wrap;align-items:center;margin-bottom:10px" }, [
      el("b", { style: "font-size:14px" }, ["TSRS Uyum Kontrolü"]),
      el("span", { style: "color:#1F7A63;font-size:12.5px" }, ["✓ " + o.gecen + " geçti"]),
      el("span", { style: "color:#B4642D;font-size:12.5px" }, ["⚠ " + o.uyari + " uyarı"]),
      el("span", { style: "color:#B3402E;font-size:12.5px" }, ["✗ " + o.eksik + " eksik"]),
      el("span", { style: "color:#9aa0a6;font-size:12.5px" }, ["– " + o.na + " N/A"]),
      el("span", { class: "rozet", style: "background:" + (u.uygunlukVerilebilir ? "#1F7A63" : "#B3402E") + ";color:#fff;font-size:11px" },
        [u.uygunlukVerilebilir ? "UYGUNLUK BEYANI VERİLEBİLİR" : "ZORUNLU AÇIKLAMA EKSİK"])
    ]);
    var liste = el("div");
    var oncelik = { eksik: 0, uyari: 1, gecti: 2, na: 3 };
    u.kurallar.slice().sort(function (a, b) { return oncelik[a.durum] - oncelik[b.durum]; }).forEach(function (k) {
      liste.appendChild(el("div", { style: "display:flex;gap:8px;align-items:baseline;font-size:12px;padding:3px 0;border-bottom:1px solid #eee" }, [
        el("span", { style: "color:" + uyumRenk(k.durum) + ";font-weight:700;min-width:14px" }, [uyumIkon(k.durum)]),
        el("span", { style: "min-width:32px;color:#999" }, [k.id]),
        el("span", { style: "flex:1" }, [k.aciklama, k.mesaj ? el("span", { style: "color:#B3402E" }, [" — " + k.mesaj]) : null]),
        el("span", { style: "color:#999;font-size:10.5px;white-space:nowrap" }, [k.tsrsRef])
      ]));
    });
    return el("div", { class: "uyum-panel yazdirma-gizle",
      style: "border:1px solid #e3e0d8;border-radius:10px;padding:14px 16px;margin-bottom:16px;background:#fbfaf7" },
      [serit, liste]);
  }

  R.ciz = function (kok) {
    var p = Depo.veri.profil;
    var T = Motor.toplamlar();
    var mod = function (id) { return Depo.modulVeri(id); };
    var seciliCiltler = Depo.seciliCiltler ? Depo.seciliCiltler() : [];
    var ciltAd = seciliCiltler.map(function (c) { return "Cilt " + c.no + " — " + c.ad; }).join(" • ");

    /* ---------- KGK biçim yardımcıları ---------- */
    function strata() {
      return el("div", { class: "strata", style: "height:8px;margin-bottom:22px" }, [
        el("span", { class: "s1" }), el("span", { class: "s2" }), el("span", { class: "s3" }), el("span", { class: "s0" })]);
    }
    var BOLUMLER = ["GİRİŞ", "YÖNETİŞİM", "STRATEJİ", "RİSK YÖNETİMİ", "METRİKLER VE HEDEFLER", "EKLER"];
    function serit(aktif) {
      return el("div", { class: "bolum-serit" }, BOLUMLER.map(function (b) {
        return el("span", { class: "serit-ad" + (b === aktif ? " aktif" : "") }, [b]);
      }));
    }
    function sayfa(aktif) { var d = el("div", { class: "rapor-sayfa" }); d.appendChild(serit(aktif)); return d; }
    function tarihUzun(t) {
      if (!t) return null;
      try { return new Date(t + "T00:00:00").toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" }); }
      catch (e) { return t; }
    }
    function donemAralik() {
      var bas = tarihUzun(p.donemBas), bit = tarihUzun(p.donemBit);
      if (bas && bit) return (bas + " – " + bit).toLocaleUpperCase("tr");
      if (p.yil) return ("1 Ocak " + p.yil + " – 31 Aralık " + p.yil).toLocaleUpperCase("tr");
      return null;
    }

    /* Bir TSRS modülünün anlatılarını verilen kaba yazar (KGK omurgası için container parametreli) */
    function anlatBolumu(kap, modulId, baslik) {
      var tanim = null;
      Depo.modulTanimlari().forEach(function (m) { if (m.id === modulId) tanim = m; });
      if (!tanim) return;
      if (baslik) kap.appendChild(el("h2", null, [baslik]));
      kap.appendChild(el("p", { style: "font-size:10.5px;color:var(--soluk);margin:0 0 6px" }, [tanim.referans || ""]));
      var mv = mod(modulId), doluAnlat = false;
      if (tanim.gruplar && tanim.gruplar.length) {
        tanim.gruplar.forEach(function (g) {
          var grupAnlatlari = (tanim.anlatilar || []).filter(function (a) { return a.grup === g.id; });
          var grupDolu = grupAnlatlari.some(function (a) { return ((mv.anlatilar || {})[a.anahtar] || "").trim(); });
          if (!grupDolu) return;
          doluAnlat = true;
          kap.appendChild(el("h3", { style: "margin:10px 0 2px;font-size:13px" }, [g.baslik]));
          kap.appendChild(el("p", { style: "font-size:10px;color:var(--soluk);margin:0 0 4px" }, [g.referans || ""]));
          grupAnlatlari.forEach(function (a) {
            var metin = (mv.anlatilar || {})[a.anahtar];
            if (metin && String(metin).trim()) {
              kap.appendChild(el("p", { style: "margin:6px 0 2px" }, [el("b", null, [a.etiket])]));
              kap.appendChild(anlat(metin));
            }
          });
        });
      } else {
        (tanim.anlatilar || []).forEach(function (a) {
          var metin = (mv.anlatilar || {})[a.anahtar];
          if (metin && String(metin).trim()) {
            doluAnlat = true;
            kap.appendChild(el("p", { style: "margin:8px 0 2px" }, [el("b", null, [a.etiket])]));
            kap.appendChild(anlat(metin));
          }
        });
      }
      if (!doluAnlat && !(mv.kayitlar || []).length) kap.appendChild(anlat(""));
    }

    /* ---------- Ekran düğmeleri + uyum paneli (baskıda gizli) ---------- */
    UI.ustAksiyon(el("button", { class: "btn birincil yazdirma-gizle", type: "button",
      onclick: function () { window.print(); } }, ["⎙ Yazdır / PDF Kaydet"]));
    UI.ustAksiyon(el("button", { class: "btn ikincil yazdirma-gizle", type: "button",
      onclick: function () { Motor.hesapDefteriIndir(); UI.bildir("Hesap defteri (JSON) indiriliyor"); } },
      ["⬇ Hesap Defteri (JSON)"]));
    UI.ustAksiyon(el("button", { class: "btn ikincil yazdirma-gizle", type: "button",
      onclick: function () { Depo.faaliyetXlsxIndir(); } }, ["⬇ Faaliyet Dökümü (XLSX)"]));
    UI.ustAksiyon(el("button", { class: "btn ikincil yazdirma-gizle", type: "button",
      onclick: function () { Depo.faaliyetCsvIndir(); UI.bildir("Faaliyet dökümü (CSV) indiriliyor"); } }, ["⬇ CSV"]));

    if (T.hatalar.length) {
      kok.appendChild(el("div", { class: "bilgi yazdirma-gizle", style: "border-left-color:var(--oksit)" },
        ["Dikkat: " + T.hatalar.length + " kayıt hesaplanamadı ve toplamlara dahil edilemedi. Yazdırmadan önce düzeltmeniz önerilir."]));
    }
    var uyum = (window.Motor && Motor.uyumDenetim) ? Motor.uyumDenetim() : null;
    if (uyum) {
      if (!uyum.uygunlukVerilebilir) {
        kok.appendChild(el("div", { class: "bilgi yazdirma-gizle", style: "border-left-color:#B3402E" },
          ["Bazı zorunlu TSRS açıklamaları eksik. Rapor yine de oluşturulur (eksikler [VERİ BEKLENİYOR] olarak görünür) ama koşulsuz uygunluk beyanı verilemez. Ayrıntılar aşağıdaki panelde."]));
      }
      kok.appendChild(uyumPaneli(uyum));
    }
    var ilkYil = (p.ilkRapor && /evet/i.test(p.ilkRapor)) ||
                 (p.muafiyetler || []).some(function (m) { return /karşılaştırmalı|ilk yıl|ilk uygulama/i.test(m); });

    /* ============ s0 — KAPAK ============ */
    var s0 = el("div", { class: "rapor-sayfa rapor-kapak" });
    s0.appendChild(strata());
    s0.appendChild(el("div", { class: "kapak-ust" },
      [dolu(p.donemBit) ? (tarihTR(p.donemBit) + " TARİHİNDE SONA EREN HESAP DÖNEMİNE İLİŞKİN") : deg(null)]));
    s0.appendChild(el("h1", { class: "kapak-baslik" }, ["TSRS UYUMLU SÜRDÜRÜLEBİLİRLİK RAPORU"]));
    s0.appendChild(el("div", { class: "kapak-unvan" }, [dolu(p.unvan) ? String(p.unvan).toLocaleUpperCase("tr") : deg(null)]));
    s0.appendChild(el("div", { class: "kapak-donem" }, [donemAralik() || deg(null)]));
    s0.appendChild(el("div", { class: "kapak-std" }, ["TSRS 1 ve TSRS 2 doğrultusunda hazırlanmıştır"]));
    s0.appendChild(el("div", { class: "kapak-alt" }, [
      (dolu(p.nace) ? "NACE " + p.nace : "") + (p.sektor ? " • " + p.sektor : "") + (ciltAd ? "  ·  " + ciltAd : "")]));
    kok.appendChild(s0);

    /* ============ s1 — GİRİŞ ============ */
    var s1 = sayfa("GİRİŞ");
    s1.appendChild(el("h1", null, ["1. Giriş"]));
    s1.appendChild(el("h2", null, ["1.1 Kuruluş Bilgileri (Künye)"]));
    s1.appendChild(el("table", null, [el("tbody", null, [
      trS(["Ticari Unvan", deg(p.unvan)]), trS(["Vergi / MERSİS No", deg(p.vergiNo)]),
      trS(["NACE Kodu / Sektör", dolu(p.nace) ? (p.nace + (p.sektor ? " — " + p.sektor : "")) : deg(null)]),
      trS(["Merkez Adresi", p.adres]), trS(["Ticaret Sicil No", p.ticaretSicilNo]),
      trS(["Rapor Sorumlusu", (p.iletisim || "—") + (p.iletisimEposta ? " — " + p.iletisimEposta : "")]),
      trS(["Web Sitesi", p.web]),
      trS(["Raporlama Dönemi", (dolu(p.donemBas) || dolu(p.donemBit)) ? (tarihTR(p.donemBas) + " — " + tarihTR(p.donemBit)) : deg(null)]),
      trS(["Konsolidasyon Yaklaşımı", p.sinir]),
      trS(["Baz Yıl", p.bazYil]), trS(["İlk TSRS Raporu", p.ilkRapor]),
      trS(["Çalışan Sayısı (TZE)", p.fte]),
      trS(["Net Hasılat (Bin " + (Depo.ayar("para_birimi") || "TL") + ")", p.hasilat && Motor.fmt(parseFloat(p.hasilat), 0)]),
      trS(["Güvence Durumu", (p.dogrulama || "—") + (p.guvenceSeviye ? " — " + p.guvenceSeviye : "") +
        (p.dogrulayici ? " • " + p.dogrulayici : "") + (p.dogrulamaStandart ? " (" + p.dogrulamaStandart + ")" : "")]),
      trS(["Raporlama Danışmanı", p.raporDanismani])
    ])]));
    s1.appendChild(anlat("Bu rapor, TSRS 2 İklimle İlgili Açıklamalar Standardı kapsamındaki hükümlere ve ilgili olduğu " +
      "ölçüde TSRS 1 Genel Hükümler'e uygun olarak hazırlanmıştır." +
      (ciltAd ? " TSRS 2'nin 32'nci paragrafı kapsamında " + (p.sektor || "ilgili sektör") + " faaliyetleri doğrultusunda " +
        ciltAd + " rehberi ve ilgili SASB Standartlarından yararlanılmıştır." : "")));
    s1.appendChild(el("h2", null, ["1.2 Organizasyonel Sınır"]));
    s1.appendChild(anlat((dolu(p.sinir) ? "Konsolidasyon yaklaşımı: " + p.sinir + ". " : "") +
      (p.konsolidasyon ? p.konsolidasyon + " " : "") +
      "Raporlama sınırı, ilgili finansal tabloların kapsadığı raporlayan işletmeyle uyumludur."));
    s1.appendChild(el("h2", null, ["1.3 Metodoloji Beyanı"]));
    s1.appendChild(anlat(Depo.ayar("metodoloji_beyani")));
    if ((p.muafiyetler || []).length) {
      s1.appendChild(el("h2", null, ["1.4 Kullanılan TSRS Geçiş Muafiyetleri"]));
      var ml = el("ul", { style: "margin:6px 0;padding-left:20px" });
      p.muafiyetler.forEach(function (m) { ml.appendChild(el("li", { style: "margin-bottom:4px" }, [m])); });
      s1.appendChild(ml);
    }
    s1.appendChild(el("h2", null, ["1.5 Uygunluk Beyanı"]));
    if (uyum && !uyum.uygunlukVerilebilir) {
      var eksikler = uyum.kurallar.filter(function (k) { return k.id !== "K05" && k.sertlik === "zorunlu" && k.durum === "eksik"; });
      s1.appendChild(el("div", { class: "eksik-veri", style: "padding:9px 11px;border-radius:6px;line-height:1.5" }, [
        "Koşulsuz TSRS uygunluk beyanı, aşağıdaki zorunlu açıklamalar tamamlandığında verilebilecektir: " +
        eksikler.map(function (k) { return k.id + " — " + k.aciklama; }).join("; ") + "."
      ]));
    } else {
      s1.appendChild(anlat("Bu rapor, TSRS 2 İklimle İlgili Açıklamalar Standardı kapsamında belirtilen hükümlere ve " +
        "ilgili olduğu ölçüde TSRS 1 Genel Hükümler'e açık ve koşulsuz biçimde uygun olarak hazırlanmıştır. " +
        (p.unvan || "Kuruluş") + ", bu standartların tüm zorunlu hükümlerine uyduğunu beyan eder."));
    }
    anlatBolumu(s1, "onemlilik", "1.6 Önemlilik Değerlendirmesi");
    kok.appendChild(s1);

    /* ============ s2 — YÖNETİŞİM ============ */
    var sYon = sayfa("YÖNETİŞİM");
    sYon.appendChild(el("h1", null, ["2. Yönetişim"]));
    anlatBolumu(sYon, "yonetisim", null);
    kok.appendChild(sYon);

    /* ============ s3 — STRATEJİ ============ */
    var sStr = sayfa("STRATEJİ");
    sStr.appendChild(el("h1", null, ["3. Strateji"]));
    anlatBolumu(sStr, "strateji", "3.1 Strateji, Karar Alma ve Geçiş Planı");
    anlatBolumu(sStr, "risk_firsat", "3.2 İklimle İlgili Risk ve Fırsatlar");
    var riskler = mod("risk_firsat").kayitlar || [];
    if (riskler.length) {
      sStr.appendChild(el("table", null, [
        th(["ID", "Başlık", "Tür", "Zaman", { t: "Skor", sinif: "sayi" }]),
        el("tbody", null, riskler.map(function (r) {
          var sk = (parseFloat(r.olasilik) || 0) * (parseFloat(r.etki) || 0);
          return trS([r.rid, UI.kisalt(r.baslik, 40), r.tur, r.zaman, { sayi: sk || "—" }]);
        }))
      ]));
    }
    anlatBolumu(sStr, "direnclilik", "3.3 İklim Dirençliliği ve Senaryo Analizi");
    var senaryolar = mod("direnclilik").kayitlar || [];
    if (senaryolar.length) {
      sStr.appendChild(el("h3", { style: "margin:10px 0 2px;font-size:13px" }, ["Kullanılan İklim Senaryoları (TSRS 2 md. 22)"]));
      sStr.appendChild(el("table", null, [
        th(["Senaryo", "Paris Uyumlu", "Sıcaklık", "Zaman Ufku", { t: "Nicel Etki (Bin TL)", sinif: "sayi" }, "Sonuç / Kırılganlık"]),
        el("tbody", null, senaryolar.map(function (s) {
          return trS([s.senaryo || "—", s.paris || "—", s.sicaklik || "—", s.ufuk || "—",
            { sayi: dolu(s.tutar) ? Motor.fmt(parseFloat(s.tutar), 0) : "—" }, UI.kisalt(s.sonuc, 56)]);
        }))
      ]));
    }
    kok.appendChild(sStr);

    /* ============ s4 — RİSK YÖNETİMİ ============ */
    var sRy = sayfa("RİSK YÖNETİMİ");
    sRy.appendChild(el("h1", null, ["4. Risk Yönetimi"]));
    anlatBolumu(sRy, "risk_yonetimi", null);
    kok.appendChild(sRy);

    /* ============ s5 — METRİKLER VE HEDEFLER ============ */
    var sMet = sayfa("METRİKLER VE HEDEFLER");
    sMet.appendChild(el("h1", null, ["5. Metrikler ve Hedefler"]));

    /* 5.1 Emisyon Özeti */
    sMet.appendChild(el("h2", null, ["5.1 Sera Gazı Emisyon Özeti"]));
    var oncK1 = parseFloat(p.oncekiK1), oncK2 = parseFloat(p.oncekiK2), oncK3 = parseFloat(p.oncekiK3);
    var oncTop = (isFinite(oncK1) ? oncK1 : 0) + (isFinite(oncK2) ? oncK2 : 0) + (isFinite(oncK3) ? oncK3 : 0);
    function oncH(v) {
      if (isFinite(v)) return { sayi: Motor.fmt(v, 2) };
      return { sayi: ilkYil ? el("span", { class: "bos" }, ["İlk yıl — muaf"]) : deg(null) };
    }
    sMet.appendChild(el("table", null, [
      th(["Kapsam", { t: "Cari Dönem (LD)", sinif: "sayi" }, { t: "Önceki Dönem (LD)", sinif: "sayi" }, { t: "Brüt Piyasa Bazlı", sinif: "sayi" }, { t: "Pay (LD)", sinif: "sayi" }]),
      el("tbody", null, [
        trS([el("b", null, ["Kapsam 1 — Doğrudan (brüt)"]), { sayi: Motor.fmt(T.k1.toplam, 2) }, oncH(oncK1), { sayi: Motor.fmt(T.k1.toplam, 2) }, { sayi: Motor.pct(T.k1.toplam, T.toplamLD) }]),
        trS([el("b", null, ["Kapsam 2 — Brüt Lokasyon Bazlı"]), { sayi: Motor.fmt(T.k2ld, 2) }, oncH(oncK2), { sayi: Motor.fmt(T.k2pd, 2) }, { sayi: Motor.pct(T.k2ld, T.toplamLD) }]),
        trS([el("b", null, ["Kapsam 3 — Diğer Dolaylı (brüt)"]), { sayi: Motor.fmt(T.k3.toplam, 2) }, oncH(oncK3), { sayi: Motor.fmt(T.k3.toplam, 2) }, { sayi: Motor.pct(T.k3.toplam, T.toplamLD) }]),
        trS([el("b", null, ["TOPLAM"]), { sayi: el("b", null, [Motor.fmt(T.toplamLD, 2)]) },
          { sayi: oncTop ? el("b", null, [Motor.fmt(oncTop, 2)]) : (ilkYil ? el("span", { class: "bos" }, ["—"]) : deg(null)) },
          { sayi: el("b", null, [Motor.fmt(T.toplamPD, 2)]) }, { sayi: "100%" }])
      ])
    ]));
    var g = T.gaz, c4 = Motor.gwpCH4(), n2 = Motor.gwpN2O();
    var gazToplamT = g.co2kg / 1000 + g.ch4kg * c4 / 1000 + g.n2okg * n2 / 1000 + g.fgazTco2e;
    sMet.appendChild(el("h3", { style: "margin:14px 0 2px;font-size:13px" }, ["Gaz Bazında Kütle ve CO2 Eşdeğeri (TSRS 2 md. 29(a)(i))"]));
    sMet.appendChild(el("table", null, [
      th(["Gaz", { t: "Kütle (kg)", sinif: "sayi" }, { t: "KIP (AR6 100 yıl)", sinif: "sayi" }, { t: "tCO2e", sinif: "sayi" }]),
      el("tbody", null, [
        trS(["CO2", { sayi: Motor.fmt(g.co2kg, 1) }, { sayi: "1" }, { sayi: Motor.fmt(g.co2kg / 1000, 3) }]),
        trS(["CH4 (fosil)", { sayi: Motor.fmt(g.ch4kg, 3) }, { sayi: Motor.fmt(c4, 1) }, { sayi: Motor.fmt(g.ch4kg * c4 / 1000, 3) }]),
        trS(["N2O", { sayi: Motor.fmt(g.n2okg, 3) }, { sayi: Motor.fmt(n2, 0) }, { sayi: Motor.fmt(g.n2okg * n2 / 1000, 3) }]),
        trS(["F-gazlar", { sayi: Motor.fmt(g.fgazkg, 3) }, { sayi: "gaza göre" }, { sayi: Motor.fmt(g.fgazTco2e, 3) }]),
        trS([el("b", null, ["TOPLAM (Kapsam 1+2 LD+3)"]), { sayi: "" }, { sayi: "" }, { sayi: el("b", null, [Motor.fmt(gazToplamT, 3)]) }])
      ])
    ]));
    sMet.appendChild(el("p", { style: "font-size:11px;color:var(--soluk);margin:4px 0 0" }, [
      "Tablo, Kapsam 1 ve 3 yakıt kaynaklı gazlar ile Kapsam 2 (lokasyona dayalı) elektrik gazlarını içerir."]));
    if (T.biyojenik && T.biyojenik.co2kg > 0) {
      sMet.appendChild(el("p", { style: "margin:6px 0 0" }, [
        el("b", null, ["Biyojenik CO2 (kapsamlar dışında ayrıca raporlanır): "]),
        Motor.fmt(T.biyojenik.tco2, 3) + " tCO2 (" + Motor.fmt(T.biyojenik.co2kg, 1) + " kg). " +
        "GHG Protokolü uyarınca biyokütle/biyoyakıt kaynaklı CO2, Kapsam 1-2-3 toplamlarına dahil edilmez; " +
        "yakıtların CH4 ve N2O emisyonları Kapsam 1'e dahildir."
      ]));
    }
    sMet.appendChild(el("h3", { style: "margin:14px 0 2px;font-size:13px" }, ["Yoğunluk Göstergeleri"]));
    sMet.appendChild(el("table", null, [
      th(["Gösterge", { t: "Değer", sinif: "sayi" }]),
      el("tbody", null, [
        trS(["tCO2e / Çalışan (TZE)", { sayi: Motor.fmt(T.yogunlukFTE, 3) }]),
        trS(["tCO2e / Bin " + (Depo.ayar("para_birimi") || "TL") + " Hasılat", { sayi: Motor.fmt(T.yogunlukHasilat, 4) }]),
        p.uretim ? trS(["tCO2e / Ton Üretim", { sayi: Motor.fmt(T.toplamLD / parseFloat(p.uretim), 4) }]) : null
      ].filter(Boolean))
    ]));
    sMet.appendChild(el("h3", { style: "margin:14px 0 2px;font-size:13px" }, ["Elektrik (Kapsam 2) ve İç Karbon Fiyatı"]));
    sMet.appendChild(el("p", { style: "margin:4px 0" }, [
      "Toplam tüketim " + Motor.fmt(T.k2.kwh, 0) + " kWh olup bunun " + Motor.fmt(T.k2.recKwh, 0) +
      " kWh'ı (" + Motor.pct(T.k2.recKwh, T.k2.kwh) + ") yenilenebilir enerji sertifikası (REC) ile belgelendirilmiştir. " +
      "Piyasaya dayalı yaklaşımda sertifikalı tüketime sıfır emisyon faktörü uygulanmıştır."
    ]));
    sMet.appendChild(el("p", { style: "margin:4px 0" }, [
      el("b", null, ["İç Karbon Fiyatı (TSRS 2 md. 29(f)): "]),
      dolu(p.icKarbonFiyati)
        ? ("Karar alma süreçlerinde her metrik ton emisyon için uygulanan iç karbon fiyatı: " + p.icKarbonFiyati + ".")
        : el("span", { class: "eksik-veri" }, [EKSIK_ET + " — uygulanıyorsa fiyatı Şirket Profili'nde belirtin; uygulanmıyorsa 'uygulanmamaktadır' olarak beyan edilmelidir."])
    ]));

    /* 5.2 Kategori Detayları */
    sMet.appendChild(el("h2", null, ["5.2 Kategori Detayları"]));
    sMet.appendChild(el("h3", { style: "margin:10px 0 2px;font-size:13px" }, ["Kapsam 1 Kırılımı (tCO2e)"]));
    sMet.appendChild(el("table", null, [
      th(["Kategori", { t: "tCO2e", sinif: "sayi" }, { t: "Pay", sinif: "sayi" }]),
      el("tbody", null, [
        trS(["Sabit Yanma", { sayi: Motor.fmt(T.k1.sabit, 2) }, { sayi: Motor.pct(T.k1.sabit, T.k1.toplam) }]),
        trS(["Mobil Yanma", { sayi: Motor.fmt(T.k1.mobil, 2) }, { sayi: Motor.pct(T.k1.mobil, T.k1.toplam) }]),
        trS(["Proses Emisyonları", { sayi: Motor.fmt(T.k1.proses, 2) }, { sayi: Motor.pct(T.k1.proses, T.k1.toplam) }]),
        trS(["Kaçak Emisyonlar (F-gazlar)", { sayi: Motor.fmt(T.k1.kacak, 2) }, { sayi: Motor.pct(T.k1.kacak, T.k1.toplam) }]),
        trS([el("b", null, ["Kapsam 1 Toplam"]), { sayi: el("b", null, [Motor.fmt(T.k1.toplam, 2)]) }, { sayi: "100%" }])
      ])
    ]));
    sMet.appendChild(el("h3", { style: "margin:10px 0 2px;font-size:13px" }, ["Kapsam 3 Kırılımı (tCO2e)"]));
    sMet.appendChild(el("table", null, [
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
    var kaynaklar = Depo.veri.faaliyet.map(function (s) {
      var h = Motor.hesapFaaliyet(s);
      return { s: s, t: h.hata ? 0 : h.tco2e };
    }).sort(function (a, b) { return b.t - a.t; }).slice(0, 12);
    if (kaynaklar.length) {
      sMet.appendChild(el("h3", { style: "margin:10px 0 2px;font-size:13px" }, ["Başlıca Emisyon Kaynakları (ilk " + kaynaklar.length + ")"]));
      sMet.appendChild(el("table", null, [
        th(["No", "Tesis / Faaliyet", "Kategori", { t: "Miktar", sinif: "sayi" }, { t: "tCO2e", sinif: "sayi" }]),
        el("tbody", null, kaynaklar.map(function (k) {
          return trS([k.s.no, UI.kisalt(k.s.tesis, 36), k.s.kategori,
            { sayi: Motor.fmt(parseFloat(k.s.miktar), 1) + " " + (k.s.birim || "") }, { sayi: Motor.fmt(k.t, 3) }]);
        }))
      ]));
    }

    /* 5.3 Sektöre Özgü Metrikler */
    if (seciliCiltler.length) {
      sMet.appendChild(el("h2", null, ["5.3 Sektöre Özgü Metrikler (TSRS 2 Ek Ciltleri)"]));
      sMet.appendChild(el("p", { style: "font-size:11px;color:var(--soluk);margin:0 0 8px" }, [
        "Kuruluşun faaliyet gösterdiği sektörlere ilişkin TSRS 2 Ek Cilt metrikleri. " +
        "Birden çok ciltte ortak istenen metrikler tek kez raporlanmış, ilgili tüm ciltlere referans verilmiştir."]));
      var am = Depo.aktifMetrikler(), na = Depo.naMetrikler(), ilkCiltNo = {};
      am.forEach(function (m) { ilkCiltNo[m.kod] = m.ciltler[0].no; });
      seciliCiltler.forEach(function (c) {
        var ciltMetrikleri = am.filter(function (m) { return ilkCiltNo[m.kod] === c.no; });
        if (!ciltMetrikleri.length) return;
        sMet.appendChild(el("h3", { style: "margin:10px 0 2px;font-size:13px" }, ["Cilt " + c.no + " — " + c.ad + " (" + c.prefix + ")"]));
        sMet.appendChild(el("table", null, [
          th(["Metrik Kodu", "Açıklama", { t: "Değer", sinif: "sayi" }, "Tip / Referans"]),
          el("tbody", null, ciltMetrikleri.map(function (m) {
            var naMi = na.indexOf(m.kod) > -1, v = Depo.metrikVeri(m.kod), deger;
            if (naMi) deger = { sayi: "N/A" };
            else if (m.tip === "ta") deger = (v.metin && v.metin.trim()) ? UI.kisalt(v.metin, 40) : el("span", { class: "bos" }, ["(boş)"]);
            else deger = { sayi: (v.deger != null && v.deger !== "") ? Motor.fmt(parseFloat(v.deger), 2) + " " + (v.birim || m.birim || "") : "—" };
            var ortakNot = m.ciltler.length > 1 ? " • ortak (" + m.ciltler.map(function (x) { return "C" + x.no; }).join(",") + ")" : "";
            return trS([el("b", null, [m.kod]), UI.kisalt(m.ad, 44), deger, m.tip + ortakNot]);
          }))
        ]));
      });
    }

    /* 5.4 İklim Hedefleri */
    anlatBolumu(sMet, "hedefler", "5.4 İklim Hedefleri");
    var hedefler = mod("hedefler").kayitlar || [];
    if (hedefler.length) {
      sMet.appendChild(el("table", null, [
        th(["Hedef", "Kapsam", "Tür", "Brüt/Net", { t: "Baz Yıl → Hedef Yılı", sinif: "sayi" }, { t: "Baz → Hedef Değer", sinif: "sayi" }, { t: "Mevcut", sinif: "sayi" }]),
        el("tbody", null, hedefler.map(function (h) {
          return trS([UI.kisalt(h.ad, 28), h.kapsam || "—", h.tur || "—", h.brut_net || "—",
            { sayi: (h.baz_yil || "—") + " → " + (h.hedef_yil || "—") },
            { sayi: Motor.fmt(parseFloat(h.baz_deger), 1) + " → " + Motor.fmt(parseFloat(h.hedef_deger), 1) },
            { sayi: Motor.fmt(parseFloat(h.mevcut), 1) }]);
        }))
      ]));
    }

    /* 5.5 Muhakemeler */
    anlatBolumu(sMet, "muhakemeler", "5.5 Önemli Muhakemeler ve Belirsizlikler");

    /* 5.6 Tahmin Belirsizliği */
    if (window.Motor && Motor.belirsizlikBilesik) {
      var kaynaklarB = [];
      if (T.k1.sabit) kaynaklarB.push({ ad: "Sabit Yanma", emisyon: T.k1.sabit, aktiviteBelirsizlik: 3, efBelirsizlik: 5 });
      if (T.k1.mobil) kaynaklarB.push({ ad: "Mobil Yanma", emisyon: T.k1.mobil, aktiviteBelirsizlik: 5, efBelirsizlik: 15 });
      if (T.k1.proses) kaynaklarB.push({ ad: "Proses", emisyon: T.k1.proses, aktiviteBelirsizlik: 5, efBelirsizlik: 20 });
      if (T.k1.kacak) kaynaklarB.push({ ad: "Kaçak (F-gaz)", emisyon: T.k1.kacak, aktiviteBelirsizlik: 10, efBelirsizlik: 50 });
      if (T.k2ld) kaynaklarB.push({ ad: "Kapsam 2", emisyon: T.k2ld, aktiviteBelirsizlik: 2, efBelirsizlik: 8 });
      if (T.k3.toplam) kaynaklarB.push({ ad: "Kapsam 3", emisyon: T.k3.toplam, aktiviteBelirsizlik: 15, efBelirsizlik: 30 });
      if (kaynaklarB.length) {
        var b = Motor.belirsizlikBilesik(kaynaklarB);
        sMet.appendChild(el("h2", null, ["5.6 Tahmin Belirsizliği (TSRS 1 md. 77-82)"]));
        sMet.appendChild(el("p", { style: "font-size:11px;color:var(--soluk);margin:0 0 6px" }, [
          "IPCC Tier 1 yaklaşımıyla, aktivite verisi ve emisyon faktörü belirsizlikleri karekök-kareler-toplamı " +
          "yöntemiyle birleştirilmiştir. Değerler varsayılan IPCC belirsizlik aralıklarına dayanır."]));
        sMet.appendChild(el("table", null, [
          th(["Toplam Emisyon (tCO2e)", { t: "Bileşik Belirsizlik", sinif: "sayi" }, { t: "%95 Güven Aralığı (tCO2e)", sinif: "sayi" }]),
          el("tbody", null, [
            trS([{ sayi: Motor.fmt(b.toplamEmisyon, 2) }, { sayi: "±" + Motor.fmt(b.bilesikBelirsizlikYuzde, 1) + "%" },
              { sayi: Motor.fmt(b.altSinir, 1) + " – " + Motor.fmt(b.ustSinir, 1) }])
          ])
        ]));
      }
    }
    kok.appendChild(sMet);

    /* ============ s6 — EKLER (TSRS İçerik İndeksi) ============ */
    var sEk = sayfa("EKLER");
    sEk.appendChild(el("h1", null, ["Ekler"]));
    if (uyum) {
      sEk.appendChild(el("h2", null, ["Ek 1: TSRS İçerik İndeksi"]));
      sEk.appendChild(el("p", { style: "font-size:11px;color:var(--soluk);margin:0 0 8px" }, [
        "Bu indeks, TSRS 1 ve TSRS 2 zorunlu açıklamalarının rapordaki konumunu ve karşılanma durumunu gösterir. " +
        "(Tarayıcı yazdırması sayfa numarası üretmediğinden 'Sayfa No' yerine ilgili bölüm adı verilmiştir.)"]));
      function indeksTablo(baslik, filtreFn) {
        var satirlar = uyum.kurallar.filter(filtreFn);
        if (!satirlar.length) return null;
        return el("div", null, [
          el("h3", { style: "margin:12px 0 4px;font-size:13px" }, [baslik]),
          el("table", null, [
            th(["TSRS Maddesi", "Açıklama", "İlgili Bölüm", { t: "Durum", sinif: "" }]),
            el("tbody", null, satirlar.map(function (k) {
              return el("tr", null, [
                el("td", null, [k.tsrsRef]),
                el("td", null, [k.aciklama]),
                el("td", null, [k.bolum || "—"]),
                el("td", { style: "text-align:center;color:" + uyumRenk(k.durum) + ";font-weight:700" }, [uyumIkon(k.durum)])
              ]);
            }))
          ])
        ]);
      }
      var ti1 = indeksTablo("TSRS 1 — Genel Hükümler", function (k) { return /TSRS 1/.test(k.tsrsRef); });
      var ti2 = indeksTablo("TSRS 2 — İklimle İlgili Açıklamalar", function (k) { return /TSRS 2/.test(k.tsrsRef); });
      var ti3 = indeksTablo("Sektör Rehberi — TSRS 2 Ek Cilt 10 (Metaller ve Madencilik)", function (k) { return /Cilt 10/.test(k.tsrsRef); });
      [ti1, ti2, ti3].forEach(function (t) { if (t) sEk.appendChild(t); });
    }
    sEk.appendChild(el("p", { style: "margin-top:24px;font-size:10.5px;color:var(--soluk);border-top:1px solid var(--cizgi);padding-top:8px" },
      [(Depo.ayar("rapor_dipnotu") || "") + " — Oluşturma: " + new Date().toLocaleDateString("tr-TR")]));
    kok.appendChild(sEk);
  };

  return R;
})();
