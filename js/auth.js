/* ============================================================================
   APP / AUTH — Bootstrap, kimlik doğrulama, müşteri seçimi
   Akış: oturum kontrol → (yoksa) giriş/kayıt → (onaysızsa) onay bekleniyor →
         müşteri seç/oluştur → Depo.yukle(id) → UI.basla()
   Mevcut UI/Depo/Motor mimarisine dokunmadan üstüne oturur.
   ============================================================================ */
"use strict";
window.App = (function () {
  var App = {};
  var el = function () { return UI.el.apply(null, arguments); };
  var profil = null;

  var OKSIT = "#B4642D", YESIL = "#1F7A63", KOYU = "#23282D", SOLUK = "#6b7280";

  /* ---- Ortak: tam ekran ortalanmış kabuk ---- */
  function kabuk(icerik, genis) {
    var k = document.getElementById("uygulama");
    k.className = "";              // sidebar flex düzenini geçici kapat
    k.innerHTML = "";
    var kutu = el("div", { style:
      "width:100%;max-width:" + (genis || 420) + "px;background:#fff;border:1px solid #e3e0d8;" +
      "border-radius:14px;box-shadow:0 10px 40px rgba(0,0,0,.08);padding:34px 32px" }, [icerik]);
    var sar = el("div", { style:
      "min-height:100vh;display:flex;align-items:center;justify-content:center;" +
      "padding:32px 16px;background:linear-gradient(135deg,#f6f4ef,#eceae3)" }, [kutu]);
    k.appendChild(sar);
    return kutu;
  }

  function marka() {
    return el("div", { style: "text-align:center;margin-bottom:22px" }, [
      el("div", { style: "display:inline-flex;gap:3px;margin-bottom:12px" }, [
        el("span", { style: "width:11px;height:34px;background:" + OKSIT + ";border-radius:2px" }),
        el("span", { style: "width:11px;height:34px;background:" + YESIL + ";border-radius:2px" }),
        el("span", { style: "width:11px;height:34px;background:#5B6B7C;border-radius:2px" }),
        el("span", { style: "width:11px;height:34px;background:" + KOYU + ";border-radius:2px" })
      ]),
      el("h1", { style: "margin:0;font-size:20px;color:" + KOYU }, ["Karbon Motoru"]),
      el("div", { style: "font-size:12.5px;color:" + SOLUK + ";margin-top:3px" },
        ["TSRS Uyumlu Sürdürülebilirlik Raporlama"])
    ]);
  }

  function girdi(etiket, tip, oto) {
    var i = el("input", { type: tip, autocomplete: oto || "off", style:
      "width:100%;padding:11px 13px;border:1px solid #cfccc3;border-radius:9px;font:inherit;font-size:14px;margin-top:5px" });
    var sar = el("label", { style: "display:block;margin-bottom:14px;font-size:12.5px;font-weight:600;color:#444" },
      [etiket, i]);
    sar.girdi = i;
    return sar;
  }

  function dugme(metin, renk) {
    return el("button", { type: "button", style:
      "width:100%;padding:12px;border:0;border-radius:9px;background:" + (renk || YESIL) +
      ";color:#fff;font:inherit;font-size:14.5px;font-weight:600;cursor:pointer" }, [metin]);
  }

  function uyari(govde, hataMi) {
    return el("div", { style:
      "padding:10px 12px;border-radius:8px;font-size:13px;margin-bottom:14px;line-height:1.5;" +
      (hataMi ? "background:#fcebe9;color:#92302a;border:1px solid #f3c9c4"
              : "background:#eaf5f1;color:#1F7A63;border:1px solid #c9e6dc") }, [govde]);
  }

  /* Supabase'in İngilizce hata mesajlarını kullanıcıya Türkçe göster */
  function trHata(msg) {
    var m = String(msg || "");
    var tablo = [
      [/invalid login credentials/i, "E-posta veya şifre hatalı."],
      [/email not confirmed/i, "E-posta adresiniz henüz doğrulanmamış."],
      [/user already registered|already been registered/i, "Bu e-posta ile zaten bir hesap var; giriş yapmayı deneyin."],
      [/password should be at least|at least 6 characters/i, "Şifre en az 6 karakter olmalı."],
      [/new password should be different/i, "Yeni şifre eskisinden farklı olmalı."],
      [/rate limit|too many requests|security purposes/i, "Çok fazla deneme yapıldı; lütfen biraz bekleyip yeniden deneyin."],
      [/failed to fetch|networkerror|network request failed|load failed/i, "Sunucuya ulaşılamadı; internet bağlantınızı kontrol edin."],
      [/invalid email/i, "Geçerli bir e-posta adresi girin."]
    ];
    for (var i = 0; i < tablo.length; i++) if (tablo[i][0].test(m)) return tablo[i][1];
    return "İşlem tamamlanamadı: " + m;
  }

  function yukleniyor(metin) {
    return el("div", { style: "text-align:center;padding:18px 0;color:" + SOLUK + ";font-size:13.5px" }, [
      el("span", { class: "spin", style:
        "display:inline-block;width:18px;height:18px;border:2px solid #cfccc3;border-top-color:" + YESIL +
        ";border-radius:50%;vertical-align:-4px;margin-right:9px;animation:kmspin .8s linear infinite" }),
      metin || "Yükleniyor…"
    ]);
  }

  /* ============================================================
     BOOTSTRAP
     ============================================================ */
  App.basla = function () {
    if (!window.SB) {
      kabuk(el("div", null, [marka(),
        uyari("Bulut bağlantısı kurulamadı. İnternet bağlantınızı kontrol edip sayfayı yenileyin. " +
          "(Supabase istemci kütüphanesi yüklenemedi.)", true)]));
      return;
    }
    SB.auth.onAuthStateChange(function (olay) {
      if (olay === "SIGNED_OUT") App.girisEkrani();
      if (olay === "PASSWORD_RECOVERY") App.yeniSifreEkrani();   // e-postadaki sıfırlama bağlantısıyla gelindi
    });
    // Oturum denetlenirken boş beyaz ekran yerine yükleme göstergesi
    kabuk(el("div", null, [marka(), yukleniyor("Oturum denetleniyor…")]));
    SB.auth.getSession().then(function (r) {
      var oturum = r.data && r.data.session;
      if (!oturum) { App.girisEkrani(); return; }
      App.profilYukleVeYonlendir();
    })["catch"](function (e) {
      App.hataEkrani("Oturum denetlenemedi: " + trHata(e && e.message), App.basla);
    });
  };

  /* Geçici hata ekranı: yanlış "onay bekleniyor" yerine gerçek durumu söyler + yeniden dene */
  App.hataEkrani = function (mesaj, tekrar) {
    var dene = dugme("↻ Yeniden Dene");
    dene.onclick = function () { if (tekrar) tekrar(); else location.reload(); };
    var cikis = dugme("Çıkış Yap", "#5B6B7C");
    cikis.onclick = function () { SB.auth.signOut()["catch"](function () {}); App.girisEkrani(); };
    kabuk(el("div", null, [marka(), uyari(mesaj, true), dene, el("div", { style: "height:10px" }), cikis]));
  };

  App.profilYukleVeYonlendir = function () {
    kabuk(el("div", null, [marka(), yukleniyor("Profil yükleniyor…")]));
    SB.auth.getUser().then(function (u) {
      var kullanici = u.data && u.data.user;
      if (!kullanici) { App.girisEkrani(); return; }
      return SB.from("profiles").select("id,email,ad_soyad,rol,onayli")
        .eq("id", kullanici.id).single().then(function (q) {
          // Sorgu HATASI onaysız kullanıcıyla karıştırılmaz: geçici hatada hata ekranı gösterilir
          if (q.error) {
            App.hataEkrani("Profil bilgisi alınamadı: " + trHata(q.error.message), App.profilYukleVeYonlendir);
            return;
          }
          profil = (q.data) ? q.data : { id: kullanici.id, email: kullanici.email, rol: "kullanici", onayli: false };
          Depo.aktifKullanici = profil;
          if (!profil.onayli) { App.onayBekleniyorEkrani(); return; }
          App.musteriSecimEkrani();
        });
    })["catch"](function (e) {
      App.hataEkrani("Bağlantı sorunu: " + trHata(e && e.message), App.profilYukleVeYonlendir);
    });
  };

  /* ============================================================
     GİRİŞ / KAYIT
     ============================================================ */
  App.girisEkrani = function (kayitMi) {
    var ePosta = girdi("E-posta", "email", "username");
    var sifre = girdi("Şifre", "password", "current-password");
    var ad = kayitMi ? girdi("Ad Soyad", "text", "name") : null;
    var mesajKap = el("div");
    var anaDugme = dugme(kayitMi ? "Kayıt Ol" : "Giriş Yap");

    function gonder() {
      mesajKap.innerHTML = "";
      var e = ePosta.girdi.value.trim(), s = sifre.girdi.value;
      if (!e || !s) { mesajKap.appendChild(uyari("E-posta ve şifre gerekli.", true)); return; }
      anaDugme.disabled = true; anaDugme.textContent = "Lütfen bekleyin…";
      var bitti = function () { anaDugme.disabled = false; anaDugme.textContent = kayitMi ? "Kayıt Ol" : "Giriş Yap"; };

      if (kayitMi) {
        if (s.length < 6) { mesajKap.appendChild(uyari("Şifre en az 6 karakter olmalı.", true)); bitti(); return; }
        SB.auth.signUp({ email: e, password: s, options: { data: { ad_soyad: ad.girdi.value.trim() } } })
          .then(function (r) {
            if (r.error) { mesajKap.appendChild(uyari(trHata(r.error.message), true)); bitti(); return; }
            if (r.data.session) { App.profilYukleVeYonlendir(); }
            else {
              kabuk(el("div", null, [marka(),
                uyari("Kaydınız alındı. E-posta onayı açıksa gelen kutunuzu kontrol edin. " +
                  "Ardından bir yönetici hesabınızı onaylayınca giriş yapabilirsiniz."),
                dugme("Giriş ekranına dön", "#5B6B7C")
              ])).querySelector("button").onclick = function () { App.girisEkrani(); };
            }
          });
      } else {
        SB.auth.signInWithPassword({ email: e, password: s }).then(function (r) {
          if (r.error) { mesajKap.appendChild(uyari(trHata(r.error.message), true)); bitti(); return; }
          App.profilYukleVeYonlendir();
        });
      }
    }
    anaDugme.type = "submit";   // form içinde Enter her alandan çalışsın

    var altLink = el("div", { style: "text-align:center;margin-top:16px;font-size:13px;color:" + SOLUK }, [
      kayitMi ? "Zaten hesabınız var mı? " : "Hesabınız yok mu? ",
      el("a", { href: "#", style: "color:" + YESIL + ";font-weight:600;text-decoration:none",
        onclick: function (ev) { ev.preventDefault(); App.girisEkrani(!kayitMi); } },
        [kayitMi ? "Giriş yapın" : "Kayıt olun"])
    ]);
    var unutLink = kayitMi ? null : el("div", { style: "text-align:center;margin-top:10px;font-size:12.5px" }, [
      el("a", { href: "#", style: "color:" + SOLUK + ";text-decoration:underline",
        onclick: function (ev) { ev.preventDefault(); App.sifreSifirlaEkrani(ePosta.girdi.value.trim()); } },
        ["Şifremi unuttum"])
    ]);

    // <form> öğesi: Enter ile gönderme + tarayıcı şifre yöneticisi uyumu
    var form = el("form", { onsubmit: function (ev) { ev.preventDefault(); gonder(); } },
      [mesajKap, ad, ePosta, sifre, anaDugme]);
    kabuk(el("div", null, [marka(), form, unutLink, altLink]));
    ePosta.girdi.focus();
  };

  /* ============================================================
     ŞİFRE SIFIRLAMA
     1) sifreSifirlaEkrani: e-postaya sıfırlama bağlantısı gönderir
     2) yeniSifreEkrani: bağlantıyla gelindiğinde (PASSWORD_RECOVERY) yeni şifre alır
     ============================================================ */
  App.sifreSifirlaEkrani = function (onDoluEposta) {
    var ePosta = girdi("E-posta", "email", "username");
    if (onDoluEposta) ePosta.girdi.value = onDoluEposta;
    var mesajKap = el("div");
    var gonderB = dugme("Sıfırlama Bağlantısı Gönder");
    var form = el("form", { onsubmit: function (ev) {
      ev.preventDefault();
      var e = ePosta.girdi.value.trim();
      mesajKap.innerHTML = "";
      if (!e) { mesajKap.appendChild(uyari("E-posta adresinizi girin.", true)); return; }
      gonderB.disabled = true; gonderB.textContent = "Gönderiliyor…";
      SB.auth.resetPasswordForEmail(e, { redirectTo: location.origin + location.pathname }).then(function (r) {
        gonderB.disabled = false; gonderB.textContent = "Sıfırlama Bağlantısı Gönder";
        mesajKap.innerHTML = "";
        if (r.error) { mesajKap.appendChild(uyari(trHata(r.error.message), true)); return; }
        mesajKap.appendChild(uyari("Sıfırlama bağlantısı e-postanıza gönderildi. Gelen kutunuzu " +
          "(ve gereksiz/spam klasörünü) kontrol edin; bağlantı sizi yeni şifre ekranına getirecek."));
      });
    } }, [mesajKap, ePosta, gonderB]);
    gonderB.type = "submit";
    var geri = el("div", { style: "text-align:center;margin-top:16px;font-size:13px" }, [
      el("a", { href: "#", style: "color:" + YESIL + ";font-weight:600;text-decoration:none",
        onclick: function (ev) { ev.preventDefault(); App.girisEkrani(); } }, ["← Giriş ekranına dön"])
    ]);
    kabuk(el("div", null, [marka(), form, geri]));
    ePosta.girdi.focus();
  };

  App.yeniSifreEkrani = function () {
    var s1 = girdi("Yeni Şifre (en az 6 karakter)", "password", "new-password");
    var s2 = girdi("Yeni Şifre (tekrar)", "password", "new-password");
    var mesajKap = el("div");
    var kaydetB = dugme("Şifreyi Güncelle");
    var form = el("form", { onsubmit: function (ev) {
      ev.preventDefault();
      mesajKap.innerHTML = "";
      var a = s1.girdi.value, b = s2.girdi.value;
      if (a.length < 6) { mesajKap.appendChild(uyari("Şifre en az 6 karakter olmalı.", true)); return; }
      if (a !== b) { mesajKap.appendChild(uyari("Şifreler birbiriyle aynı değil.", true)); return; }
      kaydetB.disabled = true; kaydetB.textContent = "Güncelleniyor…";
      SB.auth.updateUser({ password: a }).then(function (r) {
        kaydetB.disabled = false; kaydetB.textContent = "Şifreyi Güncelle";
        mesajKap.innerHTML = "";
        if (r.error) { mesajKap.appendChild(uyari(trHata(r.error.message), true)); return; }
        var devam = dugme("Uygulamaya devam et");
        devam.onclick = function () { App.profilYukleVeYonlendir(); };
        kabuk(el("div", null, [marka(), uyari("Şifreniz güncellendi."), devam]));
      });
    } }, [mesajKap, s1, s2, kaydetB]);
    kaydetB.type = "submit";
    kabuk(el("div", null, [marka(),
      el("p", { style: "text-align:center;color:" + SOLUK + ";font-size:13px;margin:0 0 14px" },
        ["Hesabınız için yeni bir şifre belirleyin."]), form]));
    s1.girdi.focus();
  };

  /* ============================================================
     ONAY BEKLENİYOR
     ============================================================ */
  App.onayBekleniyorEkrani = function () {
    var cikis = dugme("Çıkış Yap", "#5B6B7C");
    cikis.onclick = function () { SB.auth.signOut(); };
    var yenile = dugme("Onayımı kontrol et");
    yenile.onclick = function () { App.profilYukleVeYonlendir(); };
    kabuk(el("div", null, [marka(),
      el("div", { style: "text-align:center;font-size:38px;margin-bottom:8px" }, ["⏳"]),
      el("h2", { style: "text-align:center;margin:0 0 10px;font-size:17px;color:" + KOYU }, ["Hesabınız onay bekliyor"]),
      el("p", { style: "text-align:center;color:" + SOLUK + ";font-size:13.5px;line-height:1.6;margin:0 0 20px" },
        ["Kaydınız alındı (" + UI.kacir(profil ? profil.email : "") + "). Bir yönetici hesabınızı onayladıktan sonra " +
         "müşteri verilerine erişebilir ve rapor hazırlayabilirsiniz."]),
      yenile,
      el("div", { style: "height:10px" }),
      cikis
    ]));
  };

  /* ============================================================
     MÜŞTERİ SEÇİMİ
     ============================================================ */
  App.musteriSecimEkrani = function () {
    Depo.musteriKapat();
    var k = document.getElementById("uygulama");
    k.className = "";
    k.innerHTML = "";

    var ustBar = el("div", { style:
      "display:flex;justify-content:space-between;align-items:center;padding:16px 26px;" +
      "background:#fff;border-bottom:1px solid #e3e0d8" }, [
      el("div", { style: "display:flex;align-items:center;gap:12px" }, [
        el("div", { style: "display:inline-flex;gap:2px" }, [
          el("span", { style: "width:7px;height:22px;background:" + OKSIT + ";border-radius:1px" }),
          el("span", { style: "width:7px;height:22px;background:" + YESIL + ";border-radius:1px" }),
          el("span", { style: "width:7px;height:22px;background:#5B6B7C;border-radius:1px" }),
          el("span", { style: "width:7px;height:22px;background:" + KOYU + ";border-radius:1px" })
        ]),
        el("b", { style: "color:" + KOYU + ";font-size:15px" }, ["Karbon Motoru"])
      ]),
      el("div", { style: "display:flex;align-items:center;gap:14px;font-size:13px;color:" + SOLUK }, [
        el("span", null, [UI.kacir(profil.email) + (profil.rol === "admin" ? "  •  yönetici" : "")]),
        (function () { var b = el("button", { class: "btn ikincil kucuk", type: "button" }, ["Çıkış"]);
          b.onclick = function () { SB.auth.signOut(); }; return b; })()
      ])
    ]);

    var icerik = el("div", { style: "max-width:920px;margin:0 auto;padding:34px 22px" });
    var baslikSatir = el("div", { style: "display:flex;justify-content:space-between;align-items:center;margin-bottom:18px" }, [
      el("h2", { style: "margin:0;font-size:20px;color:" + KOYU }, ["Müşteriler"]),
      (function () { var b = dugme("+ Yeni Müşteri Oluştur"); b.style.width = "auto"; b.style.padding = "10px 18px";
        b.onclick = App.yeniMusteriModal; return b; })()
    ]);
    var liste = el("div", { style: "display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:14px" });
    liste.appendChild(el("div", { style: "color:" + SOLUK + ";font-size:13px" }, ["Yükleniyor…"]));

    icerik.appendChild(baslikSatir);
    icerik.appendChild(el("p", { style: "color:" + SOLUK + ";font-size:13px;margin:0 0 18px;line-height:1.6" },
      ["Çalışmak istediğiniz müşteriyi açın ya da yeni bir müşteri oluşturun. Tüm değişiklikler otomatik kaydedilir " +
       "ve ekipteki herkes en güncel hâli görür."]));
    icerik.appendChild(liste);
    k.appendChild(ustBar);
    k.appendChild(icerik);

    Depo.musteriListele().then(function (sonuc) {
      liste.innerHTML = "";
      // Ağ/yetki hatası "boş liste" ile karıştırılmaz: yeniden-dene kartı gösterilir
      if (sonuc.hata) {
        var dene = el("button", { class: "btn birincil kucuk", type: "button", style: "margin-top:12px" }, ["↻ Yeniden Dene"]);
        dene.onclick = function () { App.musteriSecimEkrani(); };
        liste.appendChild(el("div", { style:
          "grid-column:1/-1;padding:32px;text-align:center;color:#92302a;border:1px solid #f3c9c4;background:#fcebe9;border-radius:12px" },
          [el("div", { style: "margin-bottom:6px;font-weight:600" }, ["Müşteri listesi alınamadı"]),
           el("div", { style: "font-size:12.5px" }, [trHata(sonuc.hata)]), dene]));
        return;
      }
      var musteriler = sonuc.satirlar;
      if (!musteriler.length) {
        liste.appendChild(el("div", { style:
          "grid-column:1/-1;padding:40px;text-align:center;color:" + SOLUK + ";border:2px dashed #ddd9cf;border-radius:12px" },
          ["Henüz müşteri yok. “+ Yeni Müşteri Oluştur” ile başlayın."]));
        return;
      }
      musteriler.forEach(function (m) {
        var ac = el("button", { class: "btn birincil kucuk", type: "button" }, ["Aç →"]);
        ac.onclick = function () { App.musteriAc(m.id, ac); };
        var dugmeler = [ac];
        if (profil.rol === "admin") {
          var sil = el("button", { class: "btn tehlike kucuk", type: "button" }, ["Sil"]);
          sil.onclick = function () {
            UI.onayla("“" + (m.unvan || "Müşteri") + "” müşterisi ve tüm verisi kalıcı olarak silinsin mi?", function () {
              Depo.musteriSil(m.id).then(function (hata) {
                if (hata) UI.bildir(hata, true); else { UI.bildir("Müşteri silindi"); App.musteriSecimEkrani(); }
              });
            });
          };
          dugmeler.push(sil);
        }
        var kart = el("div", { style:
          "background:#fff;border:1px solid #e3e0d8;border-radius:12px;padding:18px;display:flex;flex-direction:column;gap:8px" }, [
          el("div", { style: "font-weight:700;font-size:15px;color:" + KOYU }, [m.unvan || "(unvansız)"]),
          el("div", { style: "font-size:12px;color:" + SOLUK }, [
            (m.yil ? "Dönem: " + UI.kacir(m.yil) : "Dönem belirtilmemiş") +
            (m.nace ? "  •  NACE " + UI.kacir(m.nace) : "")]),
          el("div", { style: "font-size:11.5px;color:#9aa0a6" }, ["Güncelleme: " + tarih(m.updated_at)]),
          el("div", { style: "display:flex;gap:8px;margin-top:6px" }, dugmeler)
        ]);
        liste.appendChild(kart);
      });
    });
  };

  App.yeniMusteriModal = function () {
    var unvan = UI.alan({ anahtar: "unvan", etiket: "Ticari Unvan", tip: "metin", zorunlu: true });
    var yil = UI.alan({ anahtar: "yil", etiket: "Raporlama Yılı", tip: "sayi" });
    var nace = UI.alan({ anahtar: "nace", etiket: "NACE Kodu", tip: "metin",
      yardim: "örn. 07.29 — Diğer demir dışı metal cevherleri madenciliği" });
    var izgara = el("div", { class: "form-izgara" }, [unvan, yil, nace]);
    UI.modal("Yeni Müşteri", izgara, [
      { etiket: "Vazgeç" },
      { etiket: "Oluştur ve Aç", sinif: "birincil", tik: function (kapat) {
        var u = unvan.girdi.value.trim();
        if (!u) { UI.bildir("Ticari unvan gerekli", true); return; }
        Depo.musteriOlustur(u, { yil: yil.girdi.value.trim(), nace: nace.girdi.value.trim() }).then(function (r) {
          if (r.hata) { UI.bildir("Oluşturulamadı: " + r.hata, true); return; }
          kapat(); App.musteriAc(r.id);
        });
      } }
    ], 640);
  };

  App.musteriAc = function (id, dugmeEl) {
    // Açılırken düğme tepkisiz görünmesin: durum bildirilir
    if (dugmeEl) { dugmeEl.disabled = true; dugmeEl.textContent = "Açılıyor…"; }
    Depo.yukle(id).then(function () {
      App.uygulamaGoster();
      Depo.gercekZamanliIzle(id, App.uzaktanGuncelleme);   // eşzamanlı düzenleme farkındalığı
      UI.bildir("Müşteri açıldı");
    }).catch(function (e) {
      if (dugmeEl) { dugmeEl.disabled = false; dugmeEl.textContent = "Aç →"; }
      UI.bildir("Müşteri açılamadı: " + trHata(e.message || e), true);
    });
  };

  /* Başka bir kullanıcı açık müşteriyi güncellediğinde çağrılır (Realtime) */
  App.uzaktanGuncelleme = function (surum) {
    UI.bildir("Bu müşteriyi başka bir kullanıcı güncelledi (sürüm " + surum + "). En güncel veri için yenileyin.", true);
    var altlik = document.querySelector("#uygulama .kenar .kenar-altlik");
    if (!altlik || altlik.querySelector(".uzak-guncelleme")) return;
    var yenile = el("button", { class: "btn kucuk uzak-guncelleme", type: "button",
      style: "width:100%;margin-top:8px;background:" + OKSIT + ";color:#fff;border:0" }, ["⟳ Başkası güncelledi — Yenile"]);
    yenile.onclick = function () {
      if (!Depo.aktifMusteriId) return;
      Depo.yukle(Depo.aktifMusteriId).then(function () { UI.bildir("Yenilendi"); UI.ciz(); App.kenarAltligiEkle(); });
    };
    altlik.appendChild(yenile);
  };

  /* ============================================================
     UYGULAMAYI GÖSTER (mevcut UI) + kenar çubuğu altlığı
     ============================================================ */
  App.uygulamaGoster = function () {
    var k = document.getElementById("uygulama");
    k.className = "uygulama";       // sidebar flex düzenini geri ver
    UI.basla();
    App.kenarAltligiEkle();
  };

  App.kenarAltligiEkle = function () {
    var kenar = document.querySelector("#uygulama .kenar");
    if (!kenar) return;
    var unvan = (Depo.veri.profil && Depo.veri.profil.unvan) ? Depo.veri.profil.unvan : "(unvansız müşteri)";

    var geriAl = el("button", { class: "btn ikincil kucuk", type: "button", style: "width:100%;margin-bottom:6px" }, ["↶ Geri Al"]);
    geriAl.onclick = function () {
      geriAl.disabled = true;
      Depo.geriAl().then(function (hata) {
        geriAl.disabled = false;
        if (hata) { UI.bildir(hata, true); }
        else { UI.bildir("Son işlem geri alındı"); UI.ciz(); App.kenarAltligiEkle(); }
      });
    };
    var degistir = el("button", { class: "btn ikincil kucuk", type: "button", style: "width:100%;margin-bottom:6px" }, ["⇄ Müşteri Değiştir"]);
    degistir.onclick = function () { App.musteriSecimEkrani(); };
    var cikis = el("button", { class: "btn ikincil kucuk", type: "button", style: "width:100%" }, ["⏻ Çıkış"]);
    cikis.onclick = function () { SB.auth.signOut(); };

    var altlik = el("div", { class: "kenar-altlik", style:
      "padding:12px;border-top:1px solid rgba(255,255,255,.12);margin-top:8px" }, [
      el("div", { style: "font-size:11px;opacity:.7;margin-bottom:2px" }, ["AÇIK MÜŞTERİ"]),
      el("div", { style: "font-size:13px;font-weight:600;margin-bottom:10px;line-height:1.3" }, [unvan]),
      geriAl, degistir, cikis,
      el("div", { style: "font-size:11px;opacity:.6;margin-top:10px" },
        [UI.kacir(profil.email) + (profil.rol === "admin" ? " • yönetici" : "")])
    ]);
    // varsa eski altlığı kaldır (yeniden render)
    var eski = kenar.querySelector(".kenar-altlik");
    if (eski) eski.remove();
    kenar.appendChild(altlik);
  };

  function tarih(iso) {
    if (!iso) return "—";
    try { return new Date(iso).toLocaleString("tr-TR", { dateStyle: "medium", timeStyle: "short" }); }
    catch (e) { return iso; }
  }

  return App;
})();
