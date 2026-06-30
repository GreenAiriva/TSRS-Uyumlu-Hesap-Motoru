/* ============================================================================
   SB — Supabase istemci başlatma
   Çok-kullanıcılı bulut altyapısı. URL + publishable (anon) anahtar istemciye
   gömülür; bu NORMALDİR — güvenlik Row Level Security (RLS) ile sağlanır.
   @supabase/supabase-js ve fast-json-patch index.html'de CDN'den yüklenir.
   ============================================================================ */
"use strict";

window.SBCFG = {
  url: "https://ifatjfbnegfyqwqotefq.supabase.co",
  anahtar: "sb_publishable_6SClWO4oQgmXJcCFWJ1Uag_5GfhP656"
};

window.SB = (function () {
  if (!window.supabase || !window.supabase.createClient) {
    console.error("supabase-js yüklenemedi — CDN engellenmiş ya da çevrimdışı olabilir.");
    return null;
  }
  return window.supabase.createClient(SBCFG.url, SBCFG.anahtar, {
    auth: {
      persistSession: true,        // oturum tarayıcıda kalıcı (sayfa yenilense de açık)
      autoRefreshToken: true,
      storageKey: "KM_OTURUM"
    }
  });
})();
