/* ============================================================
   NACE → ATIK KODU ÖNERİ/FİLTRE TABLOSU
   ------------------------------------------------------------
   Atık giriş formunda, tesisin NACE koduna göre Ek-4 kod listesini
   (data/atik_kodlari.js) ilgili alt kümeye daraltır. "Tümünü göster"
   seçeneği her zaman açıktır; bu tablo yalnızca ön filtredir.

   ÖNEMLİ: Bu ÖNERİ tablosudur, resmî bir NACE-Ek-4 eşleştirmesi DEĞİLDİR.
   Mevzuatta tek/resmî böyle bir tablo yayımlanmamıştır. Bu set iki
   kaynaktan türetilmiştir: (1) Tureks tesislerinin TABS Atık Beyan
   Formları (kanıtlı, fiilen beyan edilen kodlar), (2) Ek-4 listesinin
   faaliyet temelli yapısı (mermer ocak + kesim/işleme sektör mantığı).
   Yeni bir tesis/kod çıktığında serbestçe genişletilebilir.

   Yapı: { "NACE.KODU": { ad, kodlar: ["NN NN NN", ...] } }
   ============================================================ */
window.VERI = window.VERI || {};
VERI.nace_atik = {
 "08.11.01": {
  "ad": "Süs ve yapı taşları ile kireç taşı, alçı taşı, tebeşir ve kayağan taşı ocakçılığı (mermer/traverten ocağı)",
  "kodlar": ["01 01 02", "01 04 08", "01 04 13", "01 04 09", "01 04 12", "13 02 05", "13 02 08", "15 01 06", "15 01 10", "15 02 02", "16 01 07", "16 06 01", "20 01 21", "20 03 01"]
 },
 "23.70.01": {
  "ad": "Taş ve mermerin kesilmesi, şekil verilmesi ve bitirilmesi",
  "kodlar": ["01 04 13", "01 04 09", "01 04 12", "13 02 05", "13 02 08", "15 01 06", "15 01 10", "15 02 02", "16 01 07", "20 01 21", "20 01 35", "20 03 01"]
 }
};
