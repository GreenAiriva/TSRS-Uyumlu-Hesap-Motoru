/* ============================================================================
   MOTOR — Sera gazı hesaplama çekirdeği
   Excel'deki formüllerin JavaScript karşılığı. Emisyon faktörlerini ve KIP
   (GWP) değerlerini data/ klasöründeki tablolardan canlı okur; Yönetim
   Paneli'nde yapılan düzenlemeler hesaplara anında yansır.
   Metodoloji: GHG Protokolü • IPCC 2006 (2019 güncellemesi) • IPCC AR6 KIP.
   ============================================================================ */
"use strict";
window.Motor = (function () {
  var M = {};

  /* ---- Birim dönüşüm sabitleri ---- */
  var MIL_KM = 1.609344;
  var GALON_L = 3.785411784;
  var KISA_TONMIL_TONKM = 1.45997;   // 1 short ton-mile = 0.90718474 t × 1.609344 km
  var M3_L = 1000;
  var SCF_M3 = 0.028316846592;

  function sayi(v) { var n = parseFloat(v); return isFinite(n) ? n : 0; }

  /* ---- KIP (GWP) arama ---- */
  M.gwpBul = function (gazAdi) {
    if (!gazAdi) return null;
    var t = Depo.set("kip_ar6");
    var hedef = String(gazAdi).trim().toLowerCase();
    for (var i = 0; i < t.length; i++) {
      var r = t[i];
      if (String(r.Gas_Name || "").trim().toLowerCase() === hedef) return sayi(r.GWP_AR6_100yr);
      if (String(r.Chemical_Formula || "").trim().toLowerCase() === hedef) return sayi(r.GWP_AR6_100yr);
    }
    // kısmi eşleşme (örn. "HFC-134a")
    for (var j = 0; j < t.length; j++) {
      if (String(t[j].Gas_Name || "").toLowerCase().indexOf(hedef) === 0) return sayi(t[j].GWP_AR6_100yr);
    }
    return null;
  };
  M.gwpCH4 = function () { var g = M.gwpBul("Methane – fossil"); return g || 29.8; };
  M.gwpN2O = function () { var g = M.gwpBul("Nitrous oxide"); return g || 273; };

  /* ---- EF birimini, girilen miktar birimine çevirme katsayısı ----
     EF "kg gaz / EF-birimi" cinsindendir; miktar "giriş-birimi" cinsindendir.
     Dönen katsayı: girişBirimi → EF-birimi  (miktar × katsayı = EF biriminde miktar) */
  function birimKatsayi(girisBirimi, efBirimi) {
    var g = (girisBirimi || "").toLowerCase();
    var paydaP = (efBirimi || "").split("/")[1] || "";
    var e = paydaP.trim().toLowerCase();
    // hacim
    var hacimL = { "l": 1, "us gallon": GALON_L, "m3": M3_L, "scf": SCF_M3 * M3_L };
    function hacim(x) {
      if (x === "litre") x = "l";
      return hacimL.hasOwnProperty(x) ? hacimL[x] : null;
    }
    var gh = hacim(g), eh = hacim(e);
    if (gh != null && eh != null) return gh / eh;
    // mesafe
    var mesafeKm = { "km": 1, "mil": MIL_KM, "mile": MIL_KM, "kilometer": 1 };
    if (mesafeKm[g] != null && (e === "km" || e === "mile" || e === "kilometer" || e === "mil"))
      return mesafeKm[g] / mesafeKm[e === "mile" ? "mile" : e];
    // ton-km
    var tkm = { "ton-km": 1, "tonne-kilometer": 1, "ton-mil (kısa)": KISA_TONMIL_TONKM, "short ton-mile": KISA_TONMIL_TONKM };
    if (tkm[g] != null && tkm[e] != null) return tkm[g] / tkm[e];
    // yolcu-km
    var pkm = { "yolcu-km": 1, "passenger-kilometer": 1, "yolcu-mil": MIL_KM, "passenger-mile": MIL_KM };
    if (pkm[g] != null && pkm[e] != null) return pkm[g] / pkm[e];
    // araç-mil tabloları için km/mil girişi
    if (e === "vehicle-mile" && (g === "km" || g === "mil")) return (g === "km" ? 1 / MIL_KM : 1);
    return null;
  }

  /* ---- gaz EF'lerini kg cinsine indirger (g/.. → kg/..) ---- */
  function efKg(deger, birim) {
    var v = sayi(deger);
    if (!v) return 0;
    if ((birim || "").trim().toLowerCase().indexOf("g/") === 0) return v / 1000;
    return v;
  }

  /* ============================================================
     KAYNAK SEÇENEKLERİ — kategoriye (ve bölgeye) göre EF kayıtları
     Her seçenek: { anahtar, etiket, kayit }
     ============================================================ */
  M.kaynakSecenekleri = function (kategori, bolge) {
    var sec = [];
    function ekle(etiket, kayit) { sec.push({ anahtar: etiket, etiket: etiket, kayit: kayit }); }

    if (kategori === "Sabit Yanma") {
      Depo.set("ef_sabit_yanma").forEach(function (r) {
        if (r.Fuel_Name) ekle(r.Fuel_Name + "  [" + (r.Category || "—") + "]", r);
      });
    } else if (kategori === "Mobil Yanma - Yakıt") {
      Depo.set("ef_mobil_yakit").forEach(function (r) {
        if (bolge && r.Region !== bolge) return;
        var et = (r.Fuel || "") + (r.Vehicle_Engine_Type ? " — " + r.Vehicle_Engine_Type : "") +
                 (bolge ? "" : "  [" + r.Region + "]");
        ekle(et, r);
      });
    } else if (kategori === "Mobil Yanma - Mesafe") {
      Depo.set("ef_mobil_mesafe").forEach(function (r) {
        if (bolge && r.Region !== bolge) return;
        var et = (r.Vehicle_Type || "") +
                 (r.Vehicle_Detail ? " — " + r.Vehicle_Detail : "") +
                 (r.Vehicle_Year ? " (" + r.Vehicle_Year + ")" : "") +
                 (r.Fuel && !(r.Vehicle_Detail || "").includes(r.Fuel) ? " — " + r.Fuel : "") +
                 (bolge ? "" : "  [" + r.Region + "]");
        ekle(et, r);
      });
    } else if (kategori === "Yük Taşıma (Yukarı Akış)" || kategori === "Yük Taşıma (Aşağı Akış)") {
      Depo.set("ef_tasimacilik").forEach(function (r) {
        var et = (r.Type ? r.Type + " — " : "") + (r.Vehicle_Class || "") +
                 (r.Weight_Class ? " / " + r.Weight_Class : "") + (r.Fuel ? " / " + r.Fuel : "");
        ekle(et, r);
      });
    } else if (kategori === "İş Seyahati - Toplu Taşıma" || kategori === "Çalışan Ulaşımı") {
      Depo.set("ef_toplu_tasima").forEach(function (r) {
        if (bolge && r.Region && r.Region !== bolge) return;
        var et = (r.Vehicle ? r.Vehicle + " — " : "") + (r.Vehicle_Class || "") +
                 (r.Fuel ? " / " + r.Fuel : "") + (bolge ? "" : "  [" + (r.Region || "—") + "]");
        ekle(et, r);
      });
    }
    return sec;
  };
  M.kaynakKaydi = function (kategori, bolge, anahtar) {
    var sec = M.kaynakSecenekleri(kategori, bolge);
    for (var i = 0; i < sec.length; i++) if (sec[i].anahtar === anahtar) return sec[i].kayit;
    // bölge değişmiş olabilir; bölgesiz ara
    sec = M.kaynakSecenekleri(kategori, null);
    for (var j = 0; j < sec.length; j++) if (sec[j].anahtar === anahtar) return sec[j].kayit;
    return null;
  };

  /* ============================================================
     FAALİYET SATIRI HESABI (Kapsam 1 ve 3)
     Dönen: { tco2e, co2kg, ch4kg, n2okg, aciklama, hata }
     ============================================================ */
  M.hesapFaaliyet = function (s) {
    var bos = { tco2e: 0, co2kg: 0, ch4kg: 0, n2okg: 0, aciklama: "", hata: null };
    var miktar = sayi(s.miktar);
    if (!s.kategori) return Object.assign(bos, { hata: "Kategori seçilmedi" });
    if (!miktar) return Object.assign(bos, { hata: "Miktar girilmedi" });

    // Manuel EF girilmişse her kategoride doğrudan kullanılır
    if (sayi(s.manuelEF) > 0) {
      var t = miktar * sayi(s.manuelEF) / 1000;
      return { tco2e: t, co2kg: t * 1000, ch4kg: 0, n2okg: 0,
               aciklama: "Manuel EF: " + s.manuelEF + " kg CO2e/" + (s.birim || "birim"), hata: null };
    }

    var kat = s.kategori;
    if (kat === "Proses Emisyonları" || kat === "Satın Alınan Isı/Buhar" || kat === "Diğer Kapsam 3") {
      return Object.assign(bos, { hata: "Bu kategori için Manuel EF (kg CO2e/birim) girin" });
    }

    if (kat === "Sabit Yanma") return hesapSabit(s, miktar);

    var kayit = M.kaynakKaydi(kat, s.bolge, s.kaynak);
    if (!kayit) return Object.assign(bos, { hata: "Kaynak (yakıt/araç) seçilmedi" });

    var co2kg = 0, ch4kg = 0, n2okg = 0, ef, kts;
    if (kat === "Mobil Yanma - Yakıt") {
      kts = birimKatsayi(s.birim, kayit.EF_Unit);
      if (kts == null) return Object.assign(bos, { hata: "Birim (" + s.birim + ") bu EF ile uyumsuz: " + kayit.EF_Unit });
      var m = miktar * kts;
      co2kg = m * efKg(kayit.CO2_EF, kayit.EF_Unit);
      ch4kg = m * efKg(kayit.CH4_EF, "g/x");   // EPA tablosunda g cinsinden
      n2okg = m * efKg(kayit.N2O_EF, "g/x");
      ef = kayit.CO2_EF + " " + kayit.EF_Unit;
    } else { // mesafe / taşıma / toplu taşıma
      var co2u = kayit.CO2_Unit || "kg/km";
      kts = birimKatsayi(s.birim, co2u);
      if (kts == null) return Object.assign(bos, { hata: "Birim (" + s.birim + ") bu EF ile uyumsuz: " + co2u });
      var mm = miktar * kts;
      var co2ef = kayit.CO2_EF_Default != null ? kayit.CO2_EF_Default : kayit.CO2_EF;
      co2kg = mm * efKg(co2ef, co2u);
      ch4kg = mm * efKg(kayit.CH4_EF_Default != null ? kayit.CH4_EF_Default : kayit.CH4_EF, kayit.CH4_Unit || "g/x");
      n2okg = mm * efKg(kayit.N2O_EF_Default != null ? kayit.N2O_EF_Default : kayit.N2O_EF, kayit.N2O_Unit || "g/x");
      ef = co2ef + " " + co2u;
    }
    var tco2e = (co2kg * 1 + ch4kg * M.gwpCH4() + n2okg * M.gwpN2O()) / 1000;
    return { tco2e: tco2e, co2kg: co2kg, ch4kg: ch4kg, n2okg: n2okg,
             aciklama: "EF: " + ef + " (DEFRA/EPA)", hata: null };
  };

  /* Sabit yanma: IPCC 2006 — kütle (t/kg), hacim (L) veya enerji (GJ/kWh/MWh) */
  function hesapSabit(s, miktar) {
    var bos = { tco2e: 0, co2kg: 0, ch4kg: 0, n2okg: 0, aciklama: "", hata: null };
    var kayit = M.kaynakKaydi("Sabit Yanma", null, s.kaynak);
    if (!kayit) return Object.assign(bos, { hata: "Yakıt seçilmedi" });
    var b = (s.birim || "tonne").toLowerCase();
    var ton = null, tj = null;
    if (b === "tonne" || b === "ton") ton = miktar;
    else if (b === "kg") ton = miktar / 1000;
    else if (b === "l" || b === "litre") {
      var yog = sayi(kayit.Liquid_Density_kg_per_L);
      if (!yog) return Object.assign(bos, { hata: "Bu yakıt için yoğunluk (kg/L) tanımlı değil; tonne girin" });
      ton = miktar * yog / 1000;
    }
    else if (b === "gj") tj = miktar / 1000;
    else if (b === "kwh") tj = miktar * 3.6e-6;
    else if (b === "mwh") tj = miktar * 3.6e-3;
    else return Object.assign(bos, { hata: "Desteklenmeyen birim: " + s.birim });

    var ncv = sayi(kayit.NCV_TJ_per_Gg); // TJ / 1000 tonne
    if (tj == null) {
      if (!ncv) return Object.assign(bos, { hata: "NCV tanımlı değil; enerji birimi (GJ/kWh) kullanın" });
      tj = ton * ncv / 1000;
    }
    var co2kg = tj * sayi(kayit.CO2_kg_per_TJ);
    var ch4kg = tj * sayi(kayit.CH4_kg_per_TJ);
    var n2okg = tj * sayi(kayit.N2O_kg_per_TJ);
    // CO2 kg/TJ boşsa kütle bazlı yedek
    if (!co2kg && ton != null && sayi(kayit.CO2_kg_per_tonne)) co2kg = ton * sayi(kayit.CO2_kg_per_tonne);
    var tco2e = (co2kg + ch4kg * M.gwpCH4() + n2okg * M.gwpN2O()) / 1000;
    return { tco2e: tco2e, co2kg: co2kg, ch4kg: ch4kg, n2okg: n2okg, enerjiGJ: tj * 1000,
             aciklama: "IPCC 2006 — NCV " + ncv + " TJ/Gg", hata: null };
  }

  /* ============================================================
     SOĞUTUCU / KAÇAK GAZ HESABI
     Kütle Dengesi: kaçak = başlangıç + yeni şarj − çıkarılan − son
     Tarama:        kaçak = ekipman kapasitesi × yıllık kaçak oranı
     ============================================================ */
  M.hesapSogutucu = function (s) {
    var sonuc = { kacakKg: 0, gwp: null, tco2e: 0, hata: null };
    var gwp = M.gwpBul(s.gaz);
    if (!s.gaz) { sonuc.hata = "Gaz seçilmedi"; return sonuc; }
    if (gwp == null) { sonuc.hata = "KIP bulunamadı: " + s.gaz; return sonuc; }
    sonuc.gwp = gwp;
    if (s.yontem === "Tarama (Basit)") {
      var kapasite = sayi(s.kapasite);
      var oran = sayi(s.kacakOrani);
      if (!oran) {
        var tablo = Depo.set("kacak_oranlari");
        for (var i = 0; i < tablo.length; i++)
          if (tablo[i].Ekipman_Turu === s.ekipmanTuru) { oran = sayi(tablo[i].Varsayilan_Kacak_Orani); break; }
      }
      if (!kapasite) { sonuc.hata = "Ekipman kapasitesi (kg) girilmedi"; return sonuc; }
      if (!oran) { sonuc.hata = "Kaçak oranı bulunamadı"; return sonuc; }
      sonuc.kacakKg = kapasite * oran;
    } else { // Kütle Dengesi
      sonuc.kacakKg = sayi(s.baslangic) + sayi(s.yeniSarj) - sayi(s.cikarilan) - sayi(s.sonSarj);
      if (sonuc.kacakKg < 0) { sonuc.hata = "Negatif kaçak: şarj değerlerini kontrol edin"; sonuc.kacakKg = 0; return sonuc; }
    }
    sonuc.tco2e = sonuc.kacakKg * gwp / 1000;
    return sonuc;
  };

  /* ============================================================
     KAPSAM 2 ELEKTRİK — ikili raporlama
     ============================================================ */
  M.elektrikSebekeleri = function () {
    return Depo.set("ef_elektrik").map(function (r) { return r.Region; });
  };
  M.hesapElektrik = function (s) {
    var sonuc = { ld: 0, pd: 0, sebekeEF: 0, hata: null };
    var kwh = sayi(s.kwh);
    if (!kwh) { sonuc.hata = "Tüketim (kWh) girilmedi"; return sonuc; }
    var tablo = Depo.set("ef_elektrik"), g = null;
    for (var i = 0; i < tablo.length; i++) if (tablo[i].Region === s.sebeke) { g = tablo[i]; break; }
    if (!g) { sonuc.hata = "Şebeke EF bulunamadı: seçim yapın"; return sonuc; }
    var efKwh = sayi(g.CO2_EF_kg_per_kWh) +
                sayi(g.CH4_EF_kg_per_kWh) * M.gwpCH4() +
                sayi(g.N2O_EF_kg_per_kWh) * M.gwpN2O();
    sonuc.sebekeEF = efKwh;
    sonuc.ld = kwh * efKwh / 1000;
    var rec = Math.min(sayi(s.recKwh), kwh);
    var tedarikEF = sayi(s.tedarikciEF);
    var kalan = kwh - rec;
    sonuc.pd = (rec * 0 + kalan * (tedarikEF > 0 ? tedarikEF : efKwh)) / 1000;
    return sonuc;
  };

  /* ============================================================
     TOPLAMLAR — gösterge paneli ve rapor için tüm özetler
     ============================================================ */
  var K3_KATLAR = {
    "Yük Taşıma (Yukarı Akış)": "yukYukari",
    "Yük Taşıma (Aşağı Akış)": "yukAsagi",
    "İş Seyahati - Toplu Taşıma": "seyahat",
    "Çalışan Ulaşımı": "ulasim",
    "Diğer Kapsam 3": "diger"
  };
  M.kategoriKapsami = function (kat) {
    if (K3_KATLAR[kat]) return 3;
    if (kat === "Satın Alınan Elektrik" || kat === "Satın Alınan Isı/Buhar") return 2;
    return 1;
  };

  M.toplamlar = function () {
    var v = Depo.veri;
    var T = {
      k1: { sabit: 0, mobil: 0, proses: 0, kacak: 0, toplam: 0 },
      k2: { ld: 0, pd: 0, isi: 0, kwh: 0, recKwh: 0 },
      k3: { yukYukari: 0, yukAsagi: 0, seyahat: 0, ulasim: 0, diger: 0, toplam: 0 },
      gaz: { co2kg: 0, ch4kg: 0, n2okg: 0, fgazkg: 0, fgazTco2e: 0 },
      enerji: { yakitGJ: 0, elektrikGJ: 0, toplamGJ: 0 },
      hatalar: []
    };
    v.faaliyet.forEach(function (s) {
      var h = M.hesapFaaliyet(s);
      if (h.hata) { T.hatalar.push((s.no || "?") + ": " + h.hata); return; }
      T.gaz.co2kg += h.co2kg; T.gaz.ch4kg += h.ch4kg; T.gaz.n2okg += h.n2okg;
      var kat = s.kategori;
      if (kat === "Sabit Yanma") { T.k1.sabit += h.tco2e; if (h.enerjiGJ) T.enerji.yakitGJ += h.enerjiGJ; }
      else if (kat === "Mobil Yanma - Yakıt" || kat === "Mobil Yanma - Mesafe") T.k1.mobil += h.tco2e;
      else if (kat === "Proses Emisyonları") T.k1.proses += h.tco2e;
      else if (kat === "Satın Alınan Isı/Buhar") T.k2.isi += h.tco2e;
      else if (K3_KATLAR[kat]) T.k3[K3_KATLAR[kat]] += h.tco2e;
    });
    v.sogutucu.forEach(function (s) {
      var h = M.hesapSogutucu(s);
      if (h.hata) { T.hatalar.push((s.no || "?") + ": " + h.hata); return; }
      T.k1.kacak += h.tco2e;
      T.gaz.fgazkg += h.kacakKg; T.gaz.fgazTco2e += h.tco2e;
    });
    v.elektrik.forEach(function (s) {
      var h = M.hesapElektrik(s);
      if (h.hata) { T.hatalar.push((s.no || "?") + ": " + h.hata); return; }
      T.k2.ld += h.ld; T.k2.pd += h.pd;
      T.k2.kwh += sayi(s.kwh); T.k2.recKwh += Math.min(sayi(s.recKwh), sayi(s.kwh));
    });
    T.k1.toplam = T.k1.sabit + T.k1.mobil + T.k1.proses + T.k1.kacak;
    T.k3.toplam = T.k3.yukYukari + T.k3.yukAsagi + T.k3.seyahat + T.k3.ulasim + T.k3.diger;
    T.k2ld = T.k2.ld + T.k2.isi;
    T.k2pd = T.k2.pd + T.k2.isi;
    T.toplamLD = T.k1.toplam + T.k2ld + T.k3.toplam;
    T.toplamPD = T.k1.toplam + T.k2pd + T.k3.toplam;
    var fte = sayi(v.profil.fte), hasilat = sayi(v.profil.hasilat);
    T.yogunlukFTE = fte > 0 ? T.toplamLD / fte : 0;
    T.yogunlukHasilat = hasilat > 0 ? T.toplamLD / hasilat : 0;
    // Toplam enerji: sabit yanma yakıt enerjisi + elektrik tüketimi (kWh→GJ)
    T.enerji.elektrikGJ = T.k2.kwh * 0.0036;
    T.enerji.toplamGJ = T.enerji.yakitGJ + T.enerji.elektrikGJ;
    return T;
  };

  /* ---- Tamamlanma durumu (kenar çubuğu noktaları + panel) ---- */
  M.durumlar = function () {
    var v = Depo.veri, D = {};
    var p = v.profil, zorunlu = ["unvan", "vergiNo", "nace", "yil", "donemBas", "donemBit", "sinir", "fte", "hasilat"];
    var dolu = zorunlu.filter(function (k) { return p[k] !== undefined && p[k] !== "" && p[k] != null; }).length;
    D.profil = dolu === 0 ? "bos" : (dolu === zorunlu.length ? "tam" : "kismi");
    D.profilOran = dolu + "/" + zorunlu.length;
    D.faaliyet = v.faaliyet.length ? "tam" : "bos";
    D.sogutucu = v.sogutucu.length ? "tam" : "bos";
    D.elektrik = v.elektrik.length ? "tam" : "bos";
    // Sektör metrikleri durumu (seçili ciltlerin metrik doldurma oranı)
    if (Depo.seciliCiltNolari && Depo.seciliCiltNolari().length) {
      var mo = Depo.metrikOzet();
      D.sektormetrik = mo.tam === 0 ? "bos" : (mo.tam >= mo.toplam ? "tam" : "kismi");
      D.sektormetrikOran = mo.tam + "/" + mo.toplam;
    } else {
      D.sektormetrik = "bos";
    }
    Depo.modulTanimlari().forEach(function (m) {
      var mv = v.moduller[m.id] || { anlatilar: {}, kayitlar: [] };
      var anlatSay = Object.keys(mv.anlatilar || {}).filter(function (k) { return (mv.anlatilar[k] || "").trim(); }).length;
      var kayitSay = (mv.kayitlar || []).length;
      var hedefAnlat = (m.anlatilar || []).length;
      if (!anlatSay && !kayitSay) D[m.id] = "bos";
      else if ((hedefAnlat && anlatSay < hedefAnlat) || (!kayitSay && m.tablo)) D[m.id] = "kismi";
      else D[m.id] = "tam";
    });
    return D;
  };

  /* ---- TSRS dört direk uyum matrisi ---- */
  M.uyumMatrisi = function () {
    var D = M.durumlar();
    function durum(idler) {
      var s = idler.map(function (i) { return D[i] || "bos"; });
      if (s.every(function (x) { return x === "tam"; })) return "Tamamlandı";
      if (s.some(function (x) { return x !== "bos"; })) return "Devam ediyor";
      return "Başlanmadı";
    }
    return [
      { direk: "Yönetişim", ref: "TSRS 1 md. 26-27 • TSRS 2 md. 5-7", durum: durum(["yonetisim"]), kaynak: "Yönetişim Açıklamaları" },
      { direk: "Strateji", ref: "TSRS 1 md. 28-40 • TSRS 2 md. 8-21", durum: durum(["strateji", "direnclilik", "risk_firsat"]), kaynak: "Strateji • Dirençlilik • Risk ve Fırsatlar" },
      { direk: "Risk Yönetimi", ref: "TSRS 1 md. 43-44 • TSRS 2 md. 24-26", durum: durum(["risk_yonetimi"]), kaynak: "Risk Yönetimi Süreci" },
      { direk: "Metrikler ve Hedefler", ref: "TSRS 2 md. 29-37", durum: durum(["metrikler", "hedefler"]), kaynak: "Sektörler Arası Metrikler • İklim Hedefleri" }
    ];
  };

  /* ---- Sayı biçimleme ---- */
  M.fmt = function (n, ondalik) {
    if (n == null || !isFinite(n)) return "—";
    var o = ondalik == null ? 2 : ondalik;
    return n.toLocaleString("tr-TR", { minimumFractionDigits: o, maximumFractionDigits: o });
  };
  M.pct = function (pay, payda) {
    if (!payda) return "0%";
    return M.fmt(100 * pay / payda, 1) + "%";
  };

  /* ============================================================
     SPRINT 4 — IPCC ARAÇLARI ENTEGRASYONU
     CHP (kojenerasyon), gelişmiş HFC/PFC ve Tier 1 belirsizlik modülleri.
     Bu fonksiyonlar bağımsız hesaplayıcılardır; arayüz tarafından çağrılır.
     ============================================================ */

  /* ---- CHP (Kojenerasyon) — Verimlilik Yöntemi ----
     Tek yakıttan hem elektrik hem ısı üreten sistemde toplam yanma emisyonunu
     elektrik ve ısı çıktılarına verimlilik temelli pay eder (GHG Protocol CHP Tool yöntemi).
     Girdi: toplamTCO2e (yakıt yanması toplam emisyonu), elektrikMWh, isiMWh,
            elektrikVerim (varsayılan 0,35), isiVerim (varsayılan 0,80)
     Dönen: { elektrikPayi, isiPayi, oranE, oranI, hata } (tCO2e) */
  M.hesapCHP = function (g) {
    var bos = { elektrikPayi: 0, isiPayi: 0, oranE: 0, oranI: 0, hata: null };
    var toplam = sayi(g.toplamTCO2e);
    var eMWh = sayi(g.elektrikMWh), iMWh = sayi(g.isiMWh);
    if (!toplam) return Object.assign(bos, { hata: "Toplam yanma emisyonu (tCO2e) girilmedi" });
    if (!eMWh && !iMWh) return Object.assign(bos, { hata: "Elektrik veya ısı çıktısı girilmedi" });
    var nE = sayi(g.elektrikVerim) || 0.35;  // tipik elektrik verimi
    var nI = sayi(g.isiVerim) || 0.80;       // tipik ısı verimi
    // Verimlilik yöntemi: her çıktının "yakıt eşdeğeri" = çıktı / verim
    var yakitE = eMWh / nE;
    var yakitI = iMWh / nI;
    var toplamYakit = yakitE + yakitI;
    if (!toplamYakit) return Object.assign(bos, { hata: "Verim değerleri geçersiz" });
    var oranE = yakitE / toplamYakit;
    var oranI = yakitI / toplamYakit;
    return {
      elektrikPayi: toplam * oranE,
      isiPayi: toplam * oranI,
      oranE: oranE, oranI: oranI,
      hata: null,
      aciklama: "Verimlilik Yöntemi (elektrik η=" + nE + ", ısı η=" + nI + ")"
    };
  };

  /* ---- Gelişmiş HFC/PFC Envanteri — IPCC Tier 2 (yaşam döngüsü) ----
     hfc-pfc_1.xls yöntemi: yıl içindeki kaçak = montaj kaybı + işletme (yıllık) kaybı + bertaraf kaybı.
     Girdi: gaz, montajSarj (yeni ekipmana ilk dolum kg), montajKayipOran (varsayılan 0,01),
            isletmeSarj (mevcut bankada kg), isletmeKayipOran (yıllık, varsayılan 0,10),
            bertarafSarj (sökülen ekipmandaki kg), bertarafGeriKazanimOran (varsayılan 0,70)
     Dönen: { kacakKg, gwp, tco2e, dokum, hata } */
  M.hesapHFCgelismis = function (g) {
    var sonuc = { kacakKg: 0, gwp: null, tco2e: 0, dokum: {}, hata: null };
    var gwp = M.gwpBul(g.gaz);
    if (!g.gaz) { sonuc.hata = "Gaz seçilmedi"; return sonuc; }
    if (gwp == null) { sonuc.hata = "KIP bulunamadı: " + g.gaz; return sonuc; }
    sonuc.gwp = gwp;
    var montaj = sayi(g.montajSarj) * (sayi(g.montajKayipOran) || 0.01);
    var isletme = sayi(g.isletmeSarj) * (sayi(g.isletmeKayipOran) || 0.10);
    var bertarafKalan = sayi(g.bertarafSarj) * (1 - (sayi(g.bertarafGeriKazanimOran) || 0.70));
    sonuc.dokum = { montaj: montaj, isletme: isletme, bertaraf: bertarafKalan };
    sonuc.kacakKg = montaj + isletme + bertarafKalan;
    sonuc.tco2e = sonuc.kacakKg * gwp / 1000;
    sonuc.aciklama = "IPCC Tier 2 yaşam döngüsü (montaj+işletme+bertaraf)";
    return sonuc;
  };

  /* ---- Tier 1 Belirsizlik Birleştirme ----
     Bir kaynak için: bileşik = √(aktivite² + EF²)
     Çoklu kaynak için: emisyonla ağırlıklı karekök-kareler-toplamı
     Girdi: kaynaklar = [{ emisyon(tCO2e), aktiviteBelirsizlik(%), efBelirsizlik(%) }]
     Dönen: { toplamEmisyon, bilesikBelirsizlikYuzde, altSinir, ustSinir } */
  M.belirsizlikBilesik = function (kaynaklar) {
    if (!kaynaklar || !kaynaklar.length) return { toplamEmisyon: 0, bilesikBelirsizlikYuzde: 0, altSinir: 0, ustSinir: 0 };
    var toplamE = 0, agirlikliKareToplam = 0;
    kaynaklar.forEach(function (k) {
      var e = sayi(k.emisyon);
      var ua = sayi(k.aktiviteBelirsizlik) / 100;
      var ue = sayi(k.efBelirsizlik) / 100;
      var uBilesik = Math.sqrt(ua * ua + ue * ue); // kaynak bileşik belirsizliği (oran)
      toplamE += e;
      // emisyonla ağırlıklı: (E_i × U_i)²
      agirlikliKareToplam += Math.pow(e * uBilesik, 2);
    });
    if (!toplamE) return { toplamEmisyon: 0, bilesikBelirsizlikYuzde: 0, altSinir: 0, ustSinir: 0 };
    var toplamBelirsizlikMutlak = Math.sqrt(agirlikliKareToplam);
    var yuzde = (toplamBelirsizlikMutlak / toplamE) * 100;
    return {
      toplamEmisyon: toplamE,
      bilesikBelirsizlikYuzde: yuzde,
      altSinir: toplamE * (1 - yuzde / 100),
      ustSinir: toplamE * (1 + yuzde / 100)
    };
  };

  /* ============================================================
     SPRINT 5 — SEKTÖR METRİK HESAPLAMA KÖPRÜSÜ
     "hesap" tipli sektör metriklerini mevcut envanterden otomatik besler.
     Ortak metrik anahtarına (k1/su/enerji/sogutucu) göre motor değerini döner.
     Böylece kullanıcı aynı veriyi iki kez girmez: Faaliyet/Elektrik sayfalarına
     girilen veri, sektör metriklerine otomatik yansır (tek-hesap ilkesi).
     ============================================================ */
  // Bir ortak metrik anahtarı için motorun hesapladığı değeri döner.
  // Dönen: { deger, birim, kaynak } veya null (motor besleyemiyorsa)
  M.ortakMetrikDegeri = function (ortakAnahtar) {
    var T = M.toplamlar();
    switch (ortakAnahtar) {
      case "k1":
        return { deger: T.k1.toplam, birim: "tCO2e",
                 kaynak: "Faaliyet + Soğutucu sayfalarından (Kapsam 1 toplamı)" };
      case "sogutucu":
        return { deger: T.k1.kacak, birim: "tCO2e",
                 kaynak: "Soğutucu/Kaçak sayfasından (florlu gaz emisyonu)" };
      case "enerji":
        // Toplam enerji = sabit yanma yakıt enerjisi (GJ) + elektrik tüketimi (kWh→GJ)
        var toplamGJ = T.enerji.toplamGJ;
        var kismiMi = T.enerji.yakitGJ === 0 && T.enerji.elektrikGJ > 0; // yalnızca elektrik varsa kısmi
        return { deger: toplamGJ, birim: "GJ",
                 kaynak: "Sabit yanma yakıt enerjisi (" + M.fmt(T.enerji.yakitGJ, 0) + " GJ) + elektrik (" +
                         M.fmt(T.enerji.elektrikGJ, 0) + " GJ)",
                 kismi: kismiMi };
      case "su":
        return null; // Su verisi motor tarafından hesaplanmıyor; kullanıcı girer
      default:
        return null;
    }
  };

  // Bir sektör metriği için "önerilen" motor değerini döner (varsa).
  // metrik: aktifMetrikler() öğesi { kod, ortak, tip, ... }
  M.metrikOnerilenDeger = function (metrik) {
    if (metrik.tip !== "hesap" || !metrik.ortak) return null;
    return M.ortakMetrikDegeri(metrik.ortak);
  };

  /* ============================================================
     HESAP DEFTERİ (Formula Kaydı) — vizyon Bölüm 9
     Her hesaplanan büyüklüğü formülü, EF kaynağı, TSRS referansı ve
     belirsizliğiyle birlikte makine-okunur (ve denetlenebilir) biçimde üretir.
     output_cloud/<sirket>/<yil>-hesap-defteri.json olarak dışa aktarılır.
     ============================================================ */
  M.hesapDefteri = function () {
    var v = Depo.veri, T = M.toplamlar();
    var p = v.profil || {};
    var kayitlar = [];

    function ekle(o) { kayitlar.push(o); }

    // --- Kapsam 1: Sabit Yanma ---
    if (T.k1.sabit) ekle({
      metrik_kodu: "K1-SABIT", ad: "Kapsam 1 — Sabit Yanma", deger: T.k1.sabit, birim: "tCO2e",
      formul: "Σ (Yakıt_TJ × CO2_kg/TJ + CH4_kg/TJ × KIP_CH4 + N2O_kg/TJ × KIP_N2O) / 1000",
      ef_kaynak: "IPCC 2006 Cilt 2 (Enerji), NCV ve EF varsayılanları",
      tsrs_ref: ["TSRS 2 md. 29(a)(i)"],
      belirsizlik: { yontem: "Tier 1", aktivite: "±3%", ef: "±5%" }
    });
    if (T.k1.mobil) ekle({
      metrik_kodu: "K1-MOBIL", ad: "Kapsam 1 — Mobil Yanma", deger: T.k1.mobil, birim: "tCO2e",
      formul: "Σ (Miktar × EF_CO2 + EF_CH4 × KIP_CH4 + EF_N2O × KIP_N2O) / 1000",
      ef_kaynak: "DEFRA/US EPA mobil yanma EF",
      tsrs_ref: ["TSRS 2 md. 29(a)(i)"],
      belirsizlik: { yontem: "Tier 1", aktivite: "±5%", ef: "±15%" }
    });
    if (T.k1.proses) ekle({
      metrik_kodu: "K1-PROSES", ad: "Kapsam 1 — Proses Emisyonları", deger: T.k1.proses, birim: "tCO2e",
      formul: "Σ (Miktar × Manuel_EF) / 1000",
      ef_kaynak: "Kullanıcı tarafından girilen tesise özgü EF",
      tsrs_ref: ["TSRS 2 md. 29(a)(i)"],
      belirsizlik: { yontem: "Tier 1", aktivite: "±5%", ef: "±20%" }
    });
    if (T.k1.kacak) ekle({
      metrik_kodu: "K1-KACAK", ad: "Kapsam 1 — Kaçak (F-gaz)", deger: T.k1.kacak, birim: "tCO2e",
      formul: "Σ (Kaçak_kg × KIP_gaz) / 1000",
      ef_kaynak: "IPCC 2006 Cilt 3 Böl. 7 + AR6 KIP",
      tsrs_ref: ["TSRS 2 md. 29(a)(i)"],
      belirsizlik: { yontem: "Tier 1", aktivite: "±10%", ef: "±50%" }
    });
    // --- Kapsam 2 ---
    if (T.k2ld) ekle({
      metrik_kodu: "K2-LD", ad: "Kapsam 2 — Lokasyona Dayalı", deger: T.k2ld, birim: "tCO2e",
      formul: "Σ (kWh × Şebeke_EF) / 1000",
      ef_kaynak: "T.C. ETKB EVÇED 2023 (Türkiye şebekesi)",
      tsrs_ref: ["TSRS 2 md. 29(a)(ii)"],
      belirsizlik: { yontem: "Tier 1", aktivite: "±2%", ef: "±8%" }
    });
    if (T.k2pd && T.k2pd !== T.k2ld) ekle({
      metrik_kodu: "K2-PD", ad: "Kapsam 2 — Piyasaya Dayalı", deger: T.k2pd, birim: "tCO2e",
      formul: "Σ ((kWh − REC_kWh) × Tedarikçi_EF) / 1000",
      ef_kaynak: "Tedarikçi beyanı / REC sertifikaları",
      tsrs_ref: ["TSRS 2 md. 29(a)(iii)"],
      belirsizlik: { yontem: "Tier 1", aktivite: "±2%", ef: "±8%" }
    });
    // --- Kapsam 3 ---
    if (T.k3.toplam) ekle({
      metrik_kodu: "K3-TOPLAM", ad: "Kapsam 3 — Diğer Dolaylı", deger: T.k3.toplam, birim: "tCO2e",
      formul: "Σ (kategori bazlı faaliyet × EF)",
      ef_kaynak: "DEFRA / GLEC / kullanıcı EF'leri",
      tsrs_ref: ["TSRS 2 md. 29(a)(i) — Kapsam 3"],
      belirsizlik: { yontem: "Tier 1", aktivite: "±15%", ef: "±30%" }
    });
    // --- Toplam + yoğunluk ---
    ekle({
      metrik_kodu: "TOPLAM-LD", ad: "Toplam Emisyon (Lokasyona Dayalı)", deger: T.toplamLD, birim: "tCO2e",
      formul: "K1 + K2(LD) + K3", ef_kaynak: "—", tsrs_ref: ["TSRS 2 md. 29(a)"], belirsizlik: null
    });

    // --- Sektör metrikleri (seçili ciltler) ---
    var sektorKayitlari = [];
    if (Depo.aktifMetrikler) {
      var na = Depo.naMetrikler ? Depo.naMetrikler() : [];
      Depo.aktifMetrikler().forEach(function (m) {
        if (na.indexOf(m.kod) > -1) {
          sektorKayitlari.push({ metrik_kodu: m.kod, ad: m.ad, deger: "N/A", tip: m.tip,
            tsrs_ref: m.ciltler.map(function (c) { return "Cilt " + c.no + " (" + c.prefix + ")"; }) });
          return;
        }
        var mv = Depo.metrikVeri(m.kod);
        var deger = m.tip === "ta" ? (mv.metin || "") : (mv.deger != null ? mv.deger : "");
        sektorKayitlari.push({
          metrik_kodu: m.kod, ad: m.ad, deger: deger, birim: mv.birim || m.birim || "", tip: m.tip,
          ortak: m.ortak || null,
          tsrs_ref: m.ciltler.map(function (c) { return "Cilt " + c.no + " (" + c.prefix + ")"; }),
          not: mv.not || ""
        });
      });
    }

    // --- Belirsizlik özeti ---
    var belKaynaklar = [];
    if (T.k1.sabit) belKaynaklar.push({ emisyon: T.k1.sabit, aktiviteBelirsizlik: 3, efBelirsizlik: 5 });
    if (T.k1.mobil) belKaynaklar.push({ emisyon: T.k1.mobil, aktiviteBelirsizlik: 5, efBelirsizlik: 15 });
    if (T.k1.proses) belKaynaklar.push({ emisyon: T.k1.proses, aktiviteBelirsizlik: 5, efBelirsizlik: 20 });
    if (T.k1.kacak) belKaynaklar.push({ emisyon: T.k1.kacak, aktiviteBelirsizlik: 10, efBelirsizlik: 50 });
    if (T.k2ld) belKaynaklar.push({ emisyon: T.k2ld, aktiviteBelirsizlik: 2, efBelirsizlik: 8 });
    if (T.k3.toplam) belKaynaklar.push({ emisyon: T.k3.toplam, aktiviteBelirsizlik: 15, efBelirsizlik: 30 });
    var belirsizlik = M.belirsizlikBilesik(belKaynaklar);

    return {
      tur: "KarbonMotoru_HesapDefteri", surum: 1, tarih: new Date().toISOString(),
      sirket: p.unvan || "", yil: p.yil || "",
      ozet: {
        kapsam1: T.k1.toplam, kapsam2_ld: T.k2ld, kapsam2_pd: T.k2pd, kapsam3: T.k3.toplam,
        toplam_ld: T.toplamLD, toplam_pd: T.toplamPD,
        enerji_GJ: T.enerji.toplamGJ,
        yogunluk_fte: T.yogunlukFTE, yogunluk_hasilat: T.yogunlukHasilat
      },
      emisyon_kayitlari: kayitlar,
      sektor_metrikleri: sektorKayitlari,
      belirsizlik: belirsizlik,
      metodoloji: "GHG Protokolü • IPCC 2006 (2019 güncellemesi) • IPCC AR6 KIP • Tier 1 belirsizlik",
      hatalar: T.hatalar
    };
  };

  // Hesap defterini JSON dosyası olarak indir
  M.hesapDefteriIndir = function () {
    var d = M.hesapDefteri();
    var ad = "hesap-defteri-" + String(d.sirket || "sirket").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") +
             (d.yil ? "-" + d.yil : "") + ".json";
    Depo.dosyaIndir(ad, JSON.stringify(d, null, 1), "application/json");
  };

  /* ============================================================
     TSRS MEVZUAT UYUM DENETİMİ (rapor doğrulama katmanı)
     27 makine-uygulanabilir kural; rapor üreticisi bunları çalıştırıp
     "Uyum Kontrolü" paneli basar ve uygunluk beyanını şarta bağlar.
     Saf fonksiyondur (DOM bilmez); mevcut durumlar()/uyumMatrisi() korunur.
     ============================================================ */
  function PASS()  { return { durum: "gecti" }; }
  function FAIL(m) { return { durum: "eksik", mesaj: m }; }
  function WARN(m) { return { durum: "uyari", mesaj: m }; }
  function NA(m)   { return { durum: "na", mesaj: m || "Uygulanamaz" }; }
  function dolu(x) { return x != null && String(x).trim() !== ""; }
  function modDolu(ctx, modId) {
    var mv = ctx.mod(modId) || {};
    var a = mv.anlatilar || {};
    return Object.keys(a).some(function (k) { return (a[k] || "").trim(); }) || (mv.kayitlar || []).length > 0;
  }
  function ilkYilMuaf(ctx) {
    var p = ctx.p || {};
    if (p.ilkRapor && /evet/i.test(p.ilkRapor)) return true;
    return (p.muafiyetler || []).some(function (m) { return /karşılaştırmalı|ilk yıl|ilk uygulama/i.test(m); });
  }
  function cilt10Secili(ctx) {
    return (ctx.ciltler || []).some(function (c) { return c.no === 10; });
  }

  function metrikDoluKod(kod) { var v = Depo.metrikVeri ? Depo.metrikVeri(kod) : {}; return dolu(v.deger) || dolu(v.metin); }

  M.UYUM_KURALLARI = [
    { id: "K01", kategori: "Metrikler", sertlik: "zorunlu", tsrsRef: "TSRS 2 md.29(a)(i)", bolum: "5.1 Emisyon Özeti",
      aciklama: "Kapsam 1/2/3 ayrı ve brüt (tCO2e) raporlanmalı",
      kontrol: function (c) { return (c.T.k1.toplam > 0 || c.T.k2ld > 0 || c.T.k3.toplam > 0)
        ? PASS() : FAIL("Hiç emisyon verisi yok; Faaliyet/Elektrik sayfalarına veri girin."); } },
    { id: "K02", kategori: "Metrikler", sertlik: "zorunlu", tsrsRef: "TSRS 2 md.29(a)(v)", bolum: "5.1 Emisyon Özeti",
      aciklama: "Kapsam 2 lokasyona-dayalı ayrıca açıklanmalı",
      kontrol: function (c) { return c.T.k2.kwh > 0 ? PASS() : NA("Elektrik tüketimi girilmemiş"); } },
    { id: "K03", kategori: "Metrikler", sertlik: "oneri", tsrsRef: "TSRS 2 md.29(a)(iv)", bolum: "1.2 Organizasyonel Sınır",
      aciklama: "Kapsam 1/2 konsolide grup ile diğer yatırımlar arasında ayrıştırılmalı",
      kontrol: function (c) { return dolu(c.p.konsolidasyon)
        ? PASS() : WARN("Konsolide grup/diğer yatırım ayrıştırması veya sınır açıklaması girilmemiş (Şirket Profili)."); } },
    { id: "K04", kategori: "Metodoloji", sertlik: "zorunlu", tsrsRef: "TSRS 2 md.29(a)(ii)", bolum: "1.3 Metodoloji",
      aciklama: "Ölçüm çerçevesi / metodoloji beyanı (GHG Protokolü 2004)",
      kontrol: function (c) { return dolu(c.ayar("metodoloji_beyani")) ? PASS() : FAIL("Metodoloji beyanı boş (Yönetim Paneli → Görünüm ve Metinler)."); } },
    { id: "K05", kategori: "Genel", sertlik: "zorunlu", tsrsRef: "TSRS 1 md.72", bolum: "1.5 Uygunluk Beyanı",
      aciklama: "Açık ve koşulsuz uygunluk beyanı (tüm zorunlular sağlandığında)",
      kontrol: function () { return PASS(); } },   // durum uyumDenetim'de türetilir
    { id: "K06", kategori: "Dört Direk", sertlik: "zorunlu", tsrsRef: "TSRS 1 md.25-26", bolum: "2–5 (Dört Direk)",
      aciklama: "Dört temel içerik (Yönetişim, Strateji, Risk Yönetimi, Metrikler) doldurulmalı",
      kontrol: function (c) {
        var eksik = ["yonetisim", "strateji", "risk_yonetimi", "hedefler"].filter(function (m) { return !modDolu(c, m); });
        return eksik.length === 0 ? PASS() : FAIL("Eksik direk(ler): " + eksik.join(", ")); } },
    { id: "K07", kategori: "Strateji", sertlik: "zorunlu", tsrsRef: "TSRS 2 md.22", bolum: "3.3 Dirençlilik/Senaryo",
      aciklama: "İklim dirençliliği / senaryo analizi açıklanmalı",
      kontrol: function (c) { return modDolu(c, "direnclilik") ? PASS() : FAIL("Dirençlilik/Senaryo Analizi bölümü boş."); } },
    { id: "K08", kategori: "Metrikler", sertlik: "zorunlu", tsrsRef: "TSRS 2 md.29(f)", bolum: "5.1 İç Karbon Fiyatı",
      aciklama: "İç (dahili) karbon fiyatı kullanımı + fiyat açıklanmalı",
      kontrol: function (c) { return dolu(c.p.icKarbonFiyati)
        ? PASS() : WARN("İç karbon fiyatı belirtilmedi (Şirket Profili). Kullanılmıyorsa raporda 'uygulanmamaktadır' belirtin."); } },
    { id: "K09", kategori: "Hedefler", sertlik: "zorunlu", tsrsRef: "TSRS 2 md.33", bolum: "5.4 İklim Hedefleri",
      aciklama: "Her hedef için baz dönem, hedef dönem ve kapsam belirtilmeli",
      kontrol: function (c) {
        var h = (c.mod("hedefler").kayitlar) || [];
        if (!h.length) return WARN("Henüz iklim hedefi tanımlanmadı.");
        var eksik = h.filter(function (x) { return !dolu(x.baz_yil) || !dolu(x.hedef_yil) || !dolu(x.kapsam); });
        return eksik.length ? WARN(eksik.length + " hedefte baz/hedef yılı veya kapsam eksik.") : PASS(); } },
    { id: "K10", kategori: "Hedefler", sertlik: "oneri", tsrsRef: "TSRS 2 md.35", bolum: "5.4 İklim Hedefleri",
      aciklama: "Net hedef varsa ilgili brüt hedef de ayrıca verilmeli",
      kontrol: function (c) {
        var h = (c.mod("hedefler").kayitlar) || [];
        var net = h.some(function (x) { return /net/i.test(x.brut_net || ""); });
        return net ? WARN("Net hedef tespit edildi; brüt hedefin de ayrıca verildiğini doğrulayın.") : PASS(); } },
    { id: "K11", kategori: "Karşılaştırma", sertlik: "zorunlu", tsrsRef: "TSRS 1 md.70", bolum: "5.1 Emisyon Özeti",
      aciklama: "Önceki dönem karşılaştırmalı bilgisi verilmeli (ilk yıl muaf)",
      kontrol: function (c) {
        if (ilkYilMuaf(c)) return NA("İlk uygulama yılı — karşılaştırmalı bilgi muafiyeti (TSRS 1 E3-E4).");
        return (dolu(c.p.oncekiK1) || dolu(c.p.oncekiK2) || dolu(c.p.oncekiK3))
          ? PASS() : WARN("Önceki dönem emisyon verisi girilmemiş (Şirket Profili)."); } },
    { id: "K12", kategori: "Metodoloji", sertlik: "zorunlu", tsrsRef: "TSRS 1 md.77-82", bolum: "5.6 Tahmin Belirsizliği",
      aciklama: "Yüksek ölçüm/tahmin belirsizliği açıklanmalı",
      kontrol: function (c) { return c.T.toplamLD > 0 ? PASS() : NA("Emisyon verisi yok"); } },
    { id: "K13", kategori: "Strateji", sertlik: "zorunlu", tsrsRef: "TSRS 2 md.15-21", bolum: "3.1 Strateji",
      aciklama: "Finansal etkiler açıklanmalı (nicel veremiyorsa gerekçe + nitel)",
      kontrol: function (c) { return modDolu(c, "strateji") ? PASS() : FAIL("Strateji/finansal etki bölümü boş."); } },
    { id: "K14", kategori: "Genel", sertlik: "zorunlu", tsrsRef: "TSRS 1 md.64", bolum: "1.1 Künye",
      aciklama: "Raporlama dönemi (başlangıç/bitiş) belirtilmeli",
      kontrol: function (c) { return (dolu(c.p.donemBas) && dolu(c.p.donemBit)) ? PASS() : FAIL("Raporlama dönemi tarihleri eksik."); } },
    { id: "K15", kategori: "Genel", sertlik: "zorunlu", tsrsRef: "TSRS 1 md.20", bolum: "1.2 Organizasyonel Sınır",
      aciklama: "Raporlama (konsolidasyon) sınırı belirtilmeli",
      kontrol: function (c) { return dolu(c.p.sinir) ? PASS() : FAIL("Konsolidasyon yaklaşımı/sınırı seçilmemiş."); } },
    { id: "K16", kategori: "Genel", sertlik: "oneri", tsrsRef: "TSRS 1 md.23", bolum: "1.1 Künye",
      aciklama: "Para birimi finansal tablolarla tutarlı olmalı",
      kontrol: function (c) { return dolu(c.ayar("para_birimi")) ? PASS() : WARN("Para birimi tanımlı değil."); } },
    { id: "K17", kategori: "Genel", sertlik: "zorunlu", tsrsRef: "TSRS 1 md.20", bolum: "1.1 Künye",
      aciklama: "Şirket künyesi (unvan, vergi/MERSİS, NACE) tam olmalı",
      kontrol: function (c) {
        var eksik = ["unvan", "vergiNo", "nace"].filter(function (k) { return !dolu(c.p[k]); });
        return eksik.length ? FAIL("Künye eksik: " + eksik.join(", ")) : PASS(); } },
    { id: "K18", kategori: "Sektörel", sertlik: "zorunlu", tsrsRef: "TSRS 2 md.31 • Cilt 10", bolum: "5.3 Sektörel Metrikler",
      aciklama: "Madencilik (Cilt 10) seçiliyse sektörel metrikler doldurulmalı",
      kontrol: function (c) {
        if (!cilt10Secili(c)) return NA("Cilt 10 (Madencilik) seçili değil.");
        var ozet = Depo.metrikOzet ? Depo.metrikOzet() : { tam: 0, toplam: 0 };
        return ozet.tam > 0 ? PASS() : WARN("Sektör metrikleri henüz doldurulmadı (" + ozet.tam + "/" + ozet.toplam + ")."); } },
    { id: "K19", kategori: "Sektörel", sertlik: "zorunlu", tsrsRef: "Cilt 10 EM-MM-110a.1", bolum: "5.3 Sektörel Metrikler",
      aciklama: "EM-MM-110a.1: brüt Kapsam 1 + emisyon düzenlemesi kapsamındaki yüzde",
      kontrol: function (c) { if (!cilt10Secili(c)) return NA("Cilt 10 seçili değil.");
        return metrikDoluKod("EM-MM-110a.1") ? PASS() : WARN("EM-MM-110a.1 (brüt K1 + düzenleme %) girilmemiş."); } },
    { id: "K20", kategori: "Sektörel", sertlik: "zorunlu", tsrsRef: "Cilt 10 EM-MM-130a.1", bolum: "5.3 Sektörel Metrikler",
      aciklama: "EM-MM-130a.1: toplam enerji (GJ), şebeke %, yenilenebilir %",
      kontrol: function (c) { if (!cilt10Secili(c)) return NA("Cilt 10 seçili değil.");
        return metrikDoluKod("EM-MM-130a.1") ? PASS() : WARN("EM-MM-130a.1 (enerji) girilmemiş."); } },
    { id: "K21", kategori: "Sektörel", sertlik: "zorunlu", tsrsRef: "Cilt 10 EM-MM-140a.1", bolum: "5.3 Sektörel Metrikler",
      aciklama: "EM-MM-140a.1: çekilen/tüketilen su + su stresi %",
      kontrol: function (c) { if (!cilt10Secili(c)) return NA("Cilt 10 seçili değil.");
        return metrikDoluKod("EM-MM-140a.1") ? PASS() : WARN("EM-MM-140a.1 (su) girilmemiş."); } },
    { id: "K22", kategori: "Genel", sertlik: "oneri", tsrsRef: "TSRS 1 md.B29", bolum: "Genel",
      aciklama: "Veri olmayan zorunlu alanlar [VERİ BEKLENİYOR] ile işaretlenir (gizlenmez)",
      kontrol: function () { return PASS(); } },   // rapor üreticisi deg() ile sağlar
    { id: "K23", kategori: "Genel", sertlik: "oneri", tsrsRef: "TSRS 1 E3-E6", bolum: "1.4 Geçiş Muafiyetleri",
      aciklama: "Kullanılan geçiş muafiyetleri açıkça beyan edilmeli",
      kontrol: function (c) { return (c.p.muafiyetler || []).length ? PASS() : NA("Geçiş muafiyeti kullanılmıyor."); } },
    { id: "K24", kategori: "Genel", sertlik: "oneri", tsrsRef: "TSRS 1 md.37", bolum: "Genel",
      aciklama: "Aşırı maliyet/çaba veya orantılılıkla sınırlanan açıklamalar gerekçelenmeli",
      kontrol: function () { return PASS(); } },   // gerekçe serbest metinde; bilgilendirme
    { id: "K25", kategori: "Genel", sertlik: "zorunlu", tsrsRef: "TSRS 1 md.60-63", bolum: "Kapak / 1. Giriş",
      aciklama: "Rapor 'TSRS Uyumlu Sürdürülebilirlik Raporu' başlığıyla ayrı bölüm olarak sunulmalı",
      kontrol: function () { return PASS(); } },   // kapak/başlık üretici tarafından garanti
    { id: "K26", kategori: "Strateji", sertlik: "zorunlu", tsrsRef: "TSRS 2 md.10-12", bolum: "3.2 Risk ve Fırsatlar",
      aciklama: "Risk/fırsatlar fiziksel/geçiş ve zaman dilimiyle sınıflanmalı",
      kontrol: function (c) {
        var r = (c.mod("risk_firsat").kayitlar) || [];
        if (!r.length) return WARN("Risk/fırsat kaydı girilmemiş.");
        var eksik = r.filter(function (x) { return !dolu(x.tur) || !dolu(x.zaman); });
        return eksik.length ? WARN(eksik.length + " riskte tür/zaman dilimi eksik.") : PASS(); } },
    { id: "K27", kategori: "Strateji", sertlik: "oneri", tsrsRef: "TSRS 2 md.14", bolum: "3.1 Strateji (Geçiş Planı)",
      aciklama: "İklimle ilgili geçiş planı açıklanmalı",
      kontrol: function (c) { return modDolu(c, "strateji") ? PASS() : WARN("Geçiş planı / strateji bölümü boş."); } }
  ];

  M.uyumDenetim = function () {
    var ctx = {
      p: Depo.veri.profil || {},
      T: M.toplamlar(),
      mod: function (id) { return Depo.modulVeri(id); },
      ayar: function (k) { return Depo.ayar(k); },
      ciltler: Depo.seciliCiltler ? Depo.seciliCiltler() : []
    };
    var sonuc = M.UYUM_KURALLARI.map(function (k) {
      var r;
      try { r = k.kontrol(ctx); } catch (e) { r = { durum: "eksik", mesaj: "Kontrol hatası: " + (e.message || e) }; }
      return { id: k.id, aciklama: k.aciklama, tsrsRef: k.tsrsRef, sertlik: k.sertlik,
               kategori: k.kategori, bolum: k.bolum || "", durum: r.durum, mesaj: r.mesaj || "" };
    });
    // Zorunlu hata (K05 hariç — K05 bunun türevidir)
    var zorunluHata = sonuc.some(function (s) { return s.id !== "K05" && s.sertlik === "zorunlu" && s.durum === "eksik"; });
    // K05 (uygunluk beyanı) türetilir: tüm zorunlular sağlandıysa geçti, değilse eksik
    sonuc.forEach(function (s) {
      if (s.id === "K05") {
        s.durum = zorunluHata ? "eksik" : "gecti";
        s.mesaj = zorunluHata ? "Eksik zorunlu açıklamalar nedeniyle koşulsuz uygunluk beyanı verilemez." : "";
      }
    });
    return {
      kurallar: sonuc,
      ozet: {
        gecen: sonuc.filter(function (s) { return s.durum === "gecti"; }).length,
        uyari: sonuc.filter(function (s) { return s.durum === "uyari"; }).length,
        eksik: sonuc.filter(function (s) { return s.durum === "eksik"; }).length,
        na:    sonuc.filter(function (s) { return s.durum === "na"; }).length
      },
      uygunlukVerilebilir: !zorunluHata
    };
  };

  /* ============================================================
     FAALİYET DÖKÜMÜ — tüm faaliyet/soğutucu/elektrik kayıtlarını
     kapsam'a göre sınıflandırıp tek, detaylı tabloya toplar.
     CSV/XLSX dışa aktarımının veri kaynağıdır (depo.js export'ları kullanır).
     Dönen: { kolonlar:[{anahtar,etiket}], satirlar:[{...}] } — ham değerler.
     ============================================================ */
  M.faaliyetDokumu = function () {
    var v = Depo.veri;
    var kolonlar = [
      { anahtar: "no", etiket: "Kayıt No" },
      { anahtar: "kapsam", etiket: "Kapsam" },
      { anahtar: "tip", etiket: "Veri Tipi" },
      { anahtar: "ad", etiket: "Tesis / Ekipman / Sayaç" },
      { anahtar: "kategori", etiket: "Kategori" },
      { anahtar: "kaynak", etiket: "Kaynak / Yakıt / Gaz / Şebeke" },
      { anahtar: "miktar", etiket: "Miktar" },
      { anahtar: "birim", etiket: "Birim" },
      { anahtar: "donem", etiket: "Dönem" },
      { anahtar: "bolge", etiket: "Bölge" },
      { anahtar: "co2kg", etiket: "CO2 (kg)" },
      { anahtar: "ch4kg", etiket: "CH4 (kg)" },
      { anahtar: "n2okg", etiket: "N2O (kg)" },
      { anahtar: "tco2eLD", etiket: "tCO2e (Lokasyon)" },
      { anahtar: "tco2ePD", etiket: "tCO2e (Piyasa)" },
      { anahtar: "ef", etiket: "EF / Metodoloji" },
      { anahtar: "durum", etiket: "Durum" }
    ];
    var satirlar = [];
    function miktarSayi(x) { var n = parseFloat(x); return isFinite(n) ? n : (x || ""); }

    (v.faaliyet || []).forEach(function (s) {
      var h = M.hesapFaaliyet(s);
      var kapsam = M.kategoriKapsami(s.kategori);
      var kaynakAd = (sayi(s.manuelEF) > 0) ? ("Manuel EF: " + s.manuelEF + " kgCO2e/" + (s.birim || "birim")) : (s.kaynak || "");
      satirlar.push({
        no: s.no || "", kapsam: kapsam, tip: "Faaliyet", ad: s.tesis || "", kategori: s.kategori || "",
        kaynak: kaynakAd, miktar: miktarSayi(s.miktar), birim: s.birim || "", donem: s.donem || "", bolge: s.bolge || "",
        co2kg: h.hata ? "" : h.co2kg, ch4kg: h.hata ? "" : h.ch4kg, n2okg: h.hata ? "" : h.n2okg,
        tco2eLD: h.hata ? "" : h.tco2e, tco2ePD: h.hata ? "" : h.tco2e,
        ef: h.hata ? "" : (h.aciklama || ""), durum: h.hata ? ("Hata: " + h.hata) : "Hesaplandı"
      });
    });
    (v.sogutucu || []).forEach(function (s) {
      var h = M.hesapSogutucu(s);
      satirlar.push({
        no: s.no || "", kapsam: 1, tip: "Soğutucu/Kaçak", ad: s.ekipman || "", kategori: "Kaçak Emisyon (F-gaz)",
        kaynak: s.gaz || "", miktar: h.hata ? "" : h.kacakKg, birim: "kg (kaçak)", donem: s.donem || "", bolge: s.bolge || "",
        co2kg: "", ch4kg: "", n2okg: "", tco2eLD: h.hata ? "" : h.tco2e, tco2ePD: h.hata ? "" : h.tco2e,
        ef: h.hata ? "" : ("KIP " + M.fmt(h.gwp, 0) + " • " + (s.yontem || "")), durum: h.hata ? ("Hata: " + h.hata) : "Hesaplandı"
      });
    });
    (v.elektrik || []).forEach(function (s) {
      var h = M.hesapElektrik(s);
      var efMetin = h.hata ? "" : (M.fmt(h.sebekeEF, 4) + " kgCO2e/kWh" + (sayi(s.recKwh) ? (" • REC " + M.fmt(sayi(s.recKwh), 0) + " kWh") : ""));
      satirlar.push({
        no: s.no || "", kapsam: 2, tip: "Elektrik", ad: s.tesis || "", kategori: "Satın Alınan Elektrik",
        kaynak: s.sebeke || "", miktar: miktarSayi(s.kwh), birim: "kWh", donem: s.donem || "", bolge: s.sebeke || "",
        co2kg: "", ch4kg: "", n2okg: "", tco2eLD: h.hata ? "" : h.ld, tco2ePD: h.hata ? "" : h.pd,
        ef: efMetin, durum: h.hata ? ("Hata: " + h.hata) : "Hesaplandı"
      });
    });
    return { kolonlar: kolonlar, satirlar: satirlar };
  };

  return M;
})();
