/* ============================================================
   KÜRESEL ISINMA POTANSİYELLERİ — IPCC AR5 (100 yıl)
   ------------------------------------------------------------
   Her sera gazının CO2 eşdeğeri katsayısı (KIP/GWP). Soğutucu gaz hesapları bu tabloyu kullanır.
   Kaynak: IPCC Beşinci Değerlendirme Raporu (AR5, 2013) — EPA GWP tablosu (Ağustos 2024).
   NOT: AR5'te "<1" olarak verilen maddeler ihtiyatlılık gereği 1 alınmıştır.
   NASIL DÜZENLENİR?
   • En kolay yol: Uygulamayı açın → Yönetim Paneli → ilgili tabloyu
     görsel olarak düzenleyin. Kod bilgisi gerekmez.
   • Bu dosyayı elle düzenlerseniz: her kayıt { } içindedir, kayıtlar
     virgülle ayrılır. Metinler "tırnak içinde", sayılar tırnaksız yazılır.
   ============================================================ */
window.VERI = window.VERI || {};
VERI.kip_ar5 = [
 {
  "Category": "Major_Greenhouse_Gases",
  "Gas_Name": "Carbon dioxide",
  "Chemical_Formula": "CO2",
  "GWP_AR5_100yr": 1
 },
 {
  "Category": "Major_Greenhouse_Gases",
  "Gas_Name": "Methane – non-fossil",
  "Chemical_Formula": "CH4",
  "GWP_AR5_100yr": 28
 },
 {
  "Category": "Major_Greenhouse_Gases",
  "Gas_Name": "Methane – fossil",
  "Chemical_Formula": "CH4",
  "GWP_AR5_100yr": 30
 },
 {
  "Category": "Major_Greenhouse_Gases",
  "Gas_Name": "Nitrous oxide",
  "Chemical_Formula": "N2O",
  "GWP_AR5_100yr": 265
 },
 {
  "Category": "Major_Greenhouse_Gases",
  "Gas_Name": "Nitrogen trifluoride",
  "Chemical_Formula": "NF3",
  "GWP_AR5_100yr": 16100
 },
 {
  "Category": "Major_Greenhouse_Gases",
  "Gas_Name": "Sulfur hexafluoride",
  "Chemical_Formula": "SF6",
  "GWP_AR5_100yr": 23500
 },
 {
  "Category": "Hydrofluorocarbons",
  "Gas_Name": "HFC-23",
  "Chemical_Formula": "CHF3",
  "GWP_AR5_100yr": 12400
 },
 {
  "Category": "Hydrofluorocarbons",
  "Gas_Name": "HFC-32",
  "Chemical_Formula": "CH2F2",
  "GWP_AR5_100yr": 677
 },
 {
  "Category": "Hydrofluorocarbons",
  "Gas_Name": "HFC-41",
  "Chemical_Formula": "CH3F",
  "GWP_AR5_100yr": 116
 },
 {
  "Category": "Hydrofluorocarbons",
  "Gas_Name": "HFC-125",
  "Chemical_Formula": "CHF2CF3",
  "GWP_AR5_100yr": 3170
 },
 {
  "Category": "Hydrofluorocarbons",
  "Gas_Name": "HFC-134",
  "Chemical_Formula": "CHF2CHF2",
  "GWP_AR5_100yr": 1120
 },
 {
  "Category": "Hydrofluorocarbons",
  "Gas_Name": "HFC-134a",
  "Chemical_Formula": "CH2FCF3",
  "GWP_AR5_100yr": 1300
 },
 {
  "Category": "Hydrofluorocarbons",
  "Gas_Name": "HFC-143",
  "Chemical_Formula": "CH2FCHF2",
  "GWP_AR5_100yr": 328
 },
 {
  "Category": "Hydrofluorocarbons",
  "Gas_Name": "HFC-143a",
  "Chemical_Formula": "CH3CF3",
  "GWP_AR5_100yr": 4800
 },
 {
  "Category": "Hydrofluorocarbons",
  "Gas_Name": "HFC-152",
  "Chemical_Formula": "CH2FCH2F",
  "GWP_AR5_100yr": 16
 },
 {
  "Category": "Hydrofluorocarbons",
  "Gas_Name": "HFC-152a",
  "Chemical_Formula": "CH3CHF2",
  "GWP_AR5_100yr": 138
 },
 {
  "Category": "Hydrofluorocarbons",
  "Gas_Name": "HFC-161",
  "Chemical_Formula": "CH3CH2F",
  "GWP_AR5_100yr": 4
 },
 {
  "Category": "Hydrofluorocarbons",
  "Gas_Name": "HFC-227ca",
  "Chemical_Formula": "CF3CF2CHF2",
  "GWP_AR5_100yr": 2640
 },
 {
  "Category": "Hydrofluorocarbons",
  "Gas_Name": "HFC-227ea",
  "Chemical_Formula": "CF3CHFCF3",
  "GWP_AR5_100yr": 3350
 },
 {
  "Category": "Hydrofluorocarbons",
  "Gas_Name": "HFC-236cb",
  "Chemical_Formula": "CH2FCF2CF3",
  "GWP_AR5_100yr": 1210
 },
 {
  "Category": "Hydrofluorocarbons",
  "Gas_Name": "HFC-236ea",
  "Chemical_Formula": "CHF2CHFCF3",
  "GWP_AR5_100yr": 1330
 },
 {
  "Category": "Hydrofluorocarbons",
  "Gas_Name": "HFC-236fa",
  "Chemical_Formula": "CF3CH2CF3",
  "GWP_AR5_100yr": 8060
 },
 {
  "Category": "Hydrofluorocarbons",
  "Gas_Name": "HFC-245ca",
  "Chemical_Formula": "CH2FCF2CHF2",
  "GWP_AR5_100yr": 716
 },
 {
  "Category": "Hydrofluorocarbons",
  "Gas_Name": "HFC-245cb",
  "Chemical_Formula": "CF3CF2CH3",
  "GWP_AR5_100yr": 4620
 },
 {
  "Category": "Hydrofluorocarbons",
  "Gas_Name": "HFC-245ea",
  "Chemical_Formula": "CHF2CHFCHF2",
  "GWP_AR5_100yr": 235
 },
 {
  "Category": "Hydrofluorocarbons",
  "Gas_Name": "HFC-245eb",
  "Chemical_Formula": "CH2FCHFCF3",
  "GWP_AR5_100yr": 290
 },
 {
  "Category": "Hydrofluorocarbons",
  "Gas_Name": "HFC-245fa",
  "Chemical_Formula": "CHF2CH2CF3",
  "GWP_AR5_100yr": 858
 },
 {
  "Category": "Hydrofluorocarbons",
  "Gas_Name": "HFC-263fb",
  "Chemical_Formula": "CH3CH2CF3",
  "GWP_AR5_100yr": 76
 },
 {
  "Category": "Hydrofluorocarbons",
  "Gas_Name": "HFC-272ca",
  "Chemical_Formula": "CH3CF2CH3",
  "GWP_AR5_100yr": 144
 },
 {
  "Category": "Hydrofluorocarbons",
  "Gas_Name": "HFC-329p",
  "Chemical_Formula": "CHF2CF2CF2CF3",
  "GWP_AR5_100yr": 2360
 },
 {
  "Category": "Hydrofluorocarbons",
  "Gas_Name": "HFC-365mfc",
  "Chemical_Formula": "CH3CF2CH2CF3",
  "GWP_AR5_100yr": 804
 },
 {
  "Category": "Hydrofluorocarbons",
  "Gas_Name": "HFC-43-10mee",
  "Chemical_Formula": "CF3CHFCHFCF2CF3",
  "GWP_AR5_100yr": 1650
 },
 {
  "Category": "Hydrofluorocarbons",
  "Gas_Name": "HFO-1132a a",
  "Chemical_Formula": "CH2=CF2",
  "GWP_AR5_100yr": 1
 },
 {
  "Category": "Hydrofluorocarbons",
  "Gas_Name": "HFO-1141 a",
  "Chemical_Formula": "CH2=CHF",
  "GWP_AR5_100yr": 1
 },
 {
  "Category": "Hydrofluorocarbons",
  "Gas_Name": "HFO-1225ye(Z) a",
  "Chemical_Formula": "(Z)-CF3CF=CHF",
  "GWP_AR5_100yr": 1
 },
 {
  "Category": "Hydrofluorocarbons",
  "Gas_Name": "HFO-1225ye(E) a",
  "Chemical_Formula": "(E)-CF3CF=CHF",
  "GWP_AR5_100yr": 1
 },
 {
  "Category": "Hydrofluorocarbons",
  "Gas_Name": "HFO-1234ze(Z) a",
  "Chemical_Formula": "(Z)-CF3CH=CHF",
  "GWP_AR5_100yr": 1
 },
 {
  "Category": "Hydrofluorocarbons",
  "Gas_Name": "HFO-1234ze(E) a",
  "Chemical_Formula": "(E)-CF3CH=CHF",
  "GWP_AR5_100yr": 1
 },
 {
  "Category": "Hydrofluorocarbons",
  "Gas_Name": "HFO-1234yf a",
  "Chemical_Formula": "CF3CF=CH2",
  "GWP_AR5_100yr": 1
 },
 {
  "Category": "Hydrofluorocarbons",
  "Gas_Name": "HFO-1336mzz(Z)",
  "Chemical_Formula": "(Z)-CF3CH=CHCF3",
  "GWP_AR5_100yr": 2
 },
 {
  "Category": "Hydrofluorocarbons",
  "Gas_Name": "HFO-1243zf",
  "Chemical_Formula": "CF3CH=CH2",
  "GWP_AR5_100yr": 1
 },
 {
  "Category": "Hydrofluorocarbons",
  "Gas_Name": "HFO-1345zfc a",
  "Chemical_Formula": "CF3CF2CH=CH2",
  "GWP_AR5_100yr": 1
 },
 {
  "Category": "Hydrofluorocarbons",
  "Gas_Name": "3,3,4,4,5,5,6,6,6-nonafluorohex-1- ene",
  "Chemical_Formula": "n-C4F9CH=CH2",
  "GWP_AR5_100yr": 1
 },
 {
  "Category": "Hydrofluorocarbons",
  "Gas_Name": "3,3,4,4,5,5,6,6,7,7,8,8,8- tridecafluorooct-1-ene",
  "Chemical_Formula": "n-C6F13CH=CH2",
  "GWP_AR5_100yr": 1
 },
 {
  "Category": "Hydrofluorocarbons",
  "Gas_Name": "3,3,4,4,5,5,6,6,7,7,8,8,9,9,10,10,10- heptadecafluorodec-1-ene",
  "Chemical_Formula": "n-C8F17CH=CH2",
  "GWP_AR5_100yr": 1
 },
 {
  "Category": "Fully_Fluorinated_Species",
  "Gas_Name": "PFC-14",
  "Chemical_Formula": "CF4",
  "GWP_AR5_100yr": 6630
 },
 {
  "Category": "Fully_Fluorinated_Species",
  "Gas_Name": "PFC-116",
  "Chemical_Formula": "C2F6",
  "GWP_AR5_100yr": 11100
 },
 {
  "Category": "Fully_Fluorinated_Species",
  "Gas_Name": "PFC-218",
  "Chemical_Formula": "C3F8",
  "GWP_AR5_100yr": 8900
 },
 {
  "Category": "Fully_Fluorinated_Species",
  "Gas_Name": "PFC-c216",
  "Chemical_Formula": "c-C3F6",
  "GWP_AR5_100yr": 9200
 },
 {
  "Category": "Fully_Fluorinated_Species",
  "Gas_Name": "PFC-C-318 (PFC-318) b",
  "Chemical_Formula": "cyc (-CF2CF2CF2CF2-)",
  "GWP_AR5_100yr": 9540
 },
 {
  "Category": "Fully_Fluorinated_Species",
  "Gas_Name": "PFC-31-10 c",
  "Chemical_Formula": "n-C4F10",
  "GWP_AR5_100yr": 9200
 },
 {
  "Category": "Fully_Fluorinated_Species",
  "Gas_Name": "PFC-41-12 c",
  "Chemical_Formula": "n-C5F12",
  "GWP_AR5_100yr": 8550
 },
 {
  "Category": "Fully_Fluorinated_Species",
  "Gas_Name": "PFC-51-14 c",
  "Chemical_Formula": "n-C6F14",
  "GWP_AR5_100yr": 7910
 },
 {
  "Category": "Fully_Fluorinated_Species",
  "Gas_Name": "PFC-61-16",
  "Chemical_Formula": "n-C7F16",
  "GWP_AR5_100yr": 7820
 },
 {
  "Category": "Fully_Fluorinated_Species",
  "Gas_Name": "PFC-71-18",
  "Chemical_Formula": "n-C8F18",
  "GWP_AR5_100yr": 7620
 },
 {
  "Category": "Fully_Fluorinated_Species",
  "Gas_Name": "PFC-91-18 c",
  "Chemical_Formula": "C10F18",
  "GWP_AR5_100yr": 7190
 },
 {
  "Category": "Fully_Fluorinated_Species",
  "Gas_Name": "PFC-1114",
  "Chemical_Formula": "CF2=CF2",
  "GWP_AR5_100yr": 1
 },
 {
  "Category": "Fully_Fluorinated_Species",
  "Gas_Name": "PFC-1216",
  "Chemical_Formula": "CF3CF=CF2",
  "GWP_AR5_100yr": 1
 },
 {
  "Category": "Fully_Fluorinated_Species",
  "Gas_Name": "Trifluoromethylsulfur pentafluoride",
  "Chemical_Formula": "SF5CF3",
  "GWP_AR5_100yr": 17400
 },
 {
  "Category": "Fully_Fluorinated_Species",
  "Gas_Name": "Sulfuryl fluoride",
  "Chemical_Formula": "SO2F2",
  "GWP_AR5_100yr": 4090
 },
 {
  "Category": "Fully_Fluorinated_Species",
  "Gas_Name": "Octafluoro-cyclopentene (Perfluorocyclopentene)",
  "Chemical_Formula": "cyc (- CF=CFCF2CF2CF2-)",
  "GWP_AR5_100yr": 2
 },
 {
  "Category": "Fully_Fluorinated_Species",
  "Gas_Name": "1,1,2,2,3,3,4,4,4a,5,5,6,6,7,7,8,8,8a- octadecafluoronaphthalene (Perfluorodecalin (cis))",
  "Chemical_Formula": "(Z)-C10F18",
  "GWP_AR5_100yr": 7240
 },
 {
  "Category": "Fully_Fluorinated_Species",
  "Gas_Name": "1,1,2,2,3,3,4,4,4a,5,5,6,6,7,7,8,8,8a- octadecafluoronaphthalene (Perfluorodecalin (trans))",
  "Chemical_Formula": "(E)-C10F18",
  "GWP_AR5_100yr": 6290
 },
 {
  "Category": "Fully_Fluorinated_Species",
  "Gas_Name": "1,1,2,3,4,4-hexafluorobuta-1,3-diene",
  "Chemical_Formula": "CF2=CFCF=CF2",
  "GWP_AR5_100yr": 1
 },
 {
  "Category": "Fully_Fluorinated_Species",
  "Gas_Name": "Octafluoro-1-butene",
  "Chemical_Formula": "CF3CF2CF=CF2",
  "GWP_AR5_100yr": 1
 },
 {
  "Category": "Fully_Fluorinated_Species",
  "Gas_Name": "Octafluoro-2-butene",
  "Chemical_Formula": "CF3CF=CFCF3",
  "GWP_AR5_100yr": 2
 },
 {
  "Category": "Chlorofluorocarbons",
  "Gas_Name": "CFC-11",
  "Chemical_Formula": "CCl3F",
  "GWP_AR5_100yr": 4660
 },
 {
  "Category": "Chlorofluorocarbons",
  "Gas_Name": "CFC-12",
  "Chemical_Formula": "CCl2F2",
  "GWP_AR5_100yr": 10200
 },
 {
  "Category": "Chlorofluorocarbons",
  "Gas_Name": "CFC-13",
  "Chemical_Formula": "CClF3",
  "GWP_AR5_100yr": 13900
 },
 {
  "Category": "Chlorofluorocarbons",
  "Gas_Name": "CFC-113",
  "Chemical_Formula": "CCl2FCClF2",
  "GWP_AR5_100yr": 5820
 },
 {
  "Category": "Chlorofluorocarbons",
  "Gas_Name": "CFC-114",
  "Chemical_Formula": "CClF2CClF2",
  "GWP_AR5_100yr": 8590
 },
 {
  "Category": "Chlorofluorocarbons",
  "Gas_Name": "CFC-115",
  "Chemical_Formula": "CClF2CF3",
  "GWP_AR5_100yr": 7670
 },
 {
  "Category": "Hydrochlorofluorocarbon",
  "Gas_Name": "HCFC-21",
  "Chemical_Formula": "CHCl2F",
  "GWP_AR5_100yr": 148
 },
 {
  "Category": "Hydrochlorofluorocarbon",
  "Gas_Name": "HCFC-22",
  "Chemical_Formula": "CHClF2",
  "GWP_AR5_100yr": 1760
 },
 {
  "Category": "Hydrochlorofluorocarbon",
  "Gas_Name": "HCFC-122",
  "Chemical_Formula": "CHCl2CClF2",
  "GWP_AR5_100yr": 59
 },
 {
  "Category": "Hydrochlorofluorocarbon",
  "Gas_Name": "HCFC-122a",
  "Chemical_Formula": "CHClFCCl2F",
  "GWP_AR5_100yr": 258
 },
 {
  "Category": "Hydrochlorofluorocarbon",
  "Gas_Name": "HCFC-123",
  "Chemical_Formula": "CHCl2CF3",
  "GWP_AR5_100yr": 79
 },
 {
  "Category": "Hydrochlorofluorocarbon",
  "Gas_Name": "HCFC-123a",
  "Chemical_Formula": "CHClFCClF2",
  "GWP_AR5_100yr": 370
 },
 {
  "Category": "Hydrochlorofluorocarbon",
  "Gas_Name": "HCFC-124",
  "Chemical_Formula": "CHClFCF3",
  "GWP_AR5_100yr": 527
 },
 {
  "Category": "Hydrochlorofluorocarbon",
  "Gas_Name": "HCFC-132c",
  "Chemical_Formula": "CH2FCCl2F",
  "GWP_AR5_100yr": 338
 },
 {
  "Category": "Hydrochlorofluorocarbon",
  "Gas_Name": "HCFC-141b",
  "Chemical_Formula": "CH3CCl2F",
  "GWP_AR5_100yr": 782
 },
 {
  "Category": "Hydrochlorofluorocarbon",
  "Gas_Name": "HCFC-142b",
  "Chemical_Formula": "CH3CClF2",
  "GWP_AR5_100yr": 1980
 },
 {
  "Category": "Hydrochlorofluorocarbon",
  "Gas_Name": "HCFC-225ca",
  "Chemical_Formula": "CHCl2CF2CF3",
  "GWP_AR5_100yr": 127
 },
 {
  "Category": "Hydrochlorofluorocarbon",
  "Gas_Name": "HCFC-225cb",
  "Chemical_Formula": "CHClFCF2CClF2",
  "GWP_AR5_100yr": 525
 },
 {
  "Category": "Hydrochlorofluorocarbon",
  "Gas_Name": "(E)-1-chloro-3,3,3-trifluoroprop-1-ene",
  "Chemical_Formula": "trans-CF3CH=CHCl",
  "GWP_AR5_100yr": 1
 },
 {
  "Category": "Chlorocarbons_and_Hydrochlorocarbons",
  "Gas_Name": "Methyl chloroform",
  "Chemical_Formula": "CH3CCl3",
  "GWP_AR5_100yr": 160
 },
 {
  "Category": "Chlorocarbons_and_Hydrochlorocarbons",
  "Gas_Name": "Carbon tetrachloride",
  "Chemical_Formula": "CCl4",
  "GWP_AR5_100yr": 1730
 },
 {
  "Category": "Chlorocarbons_and_Hydrochlorocarbons",
  "Gas_Name": "Methyl chloride",
  "Chemical_Formula": "CH3Cl",
  "GWP_AR5_100yr": 12
 },
 {
  "Category": "Chlorocarbons_and_Hydrochlorocarbons",
  "Gas_Name": "Methylene chloride",
  "Chemical_Formula": "CH2Cl2",
  "GWP_AR5_100yr": 9
 },
 {
  "Category": "Chlorocarbons_and_Hydrochlorocarbons",
  "Gas_Name": "Chloroform",
  "Chemical_Formula": "CHCl3",
  "GWP_AR5_100yr": 16
 },
 {
  "Category": "Chlorocarbons_and_Hydrochlorocarbons",
  "Gas_Name": "1,2-dichloroethane",
  "Chemical_Formula": "CH2ClCH2Cl",
  "GWP_AR5_100yr": 1
 },
 {
  "Category": "Bromocarbons_Halons",
  "Gas_Name": "Methyl bromide",
  "Chemical_Formula": "CH3Br",
  "GWP_AR5_100yr": 2
 },
 {
  "Category": "Bromocarbons_Halons",
  "Gas_Name": "Methylene bromide",
  "Chemical_Formula": "CH2Br2",
  "GWP_AR5_100yr": 1
 },
 {
  "Category": "Bromocarbons_Halons",
  "Gas_Name": "Halon-1201",
  "Chemical_Formula": "CHBrF2",
  "GWP_AR5_100yr": 376
 },
 {
  "Category": "Bromocarbons_Halons",
  "Gas_Name": "Halon-1202",
  "Chemical_Formula": "CBr2F2",
  "GWP_AR5_100yr": 231
 },
 {
  "Category": "Bromocarbons_Halons",
  "Gas_Name": "Halon-1211",
  "Chemical_Formula": "CBrClF2",
  "GWP_AR5_100yr": 1750
 },
 {
  "Category": "Bromocarbons_Halons",
  "Gas_Name": "Halon-1301",
  "Chemical_Formula": "CBrF3",
  "GWP_AR5_100yr": 6290
 },
 {
  "Category": "Bromocarbons_Halons",
  "Gas_Name": "Halon-2301",
  "Chemical_Formula": "CH2BrCF3",
  "GWP_AR5_100yr": 173
 },
 {
  "Category": "Bromocarbons_Halons",
  "Gas_Name": "Halon-2311",
  "Chemical_Formula": "CHBrClCF3",
  "GWP_AR5_100yr": 41
 },
 {
  "Category": "Bromocarbons_Halons",
  "Gas_Name": "Halon-2401",
  "Chemical_Formula": "CHBrFCF3",
  "GWP_AR5_100yr": 184
 },
 {
  "Category": "Bromocarbons_Halons",
  "Gas_Name": "Halon-2402",
  "Chemical_Formula": "CBrF2CBrF2",
  "GWP_AR5_100yr": 1470
 },
 {
  "Category": "Halogenated_Alcohols_Ethers_etc",
  "Gas_Name": "HFE-125",
  "Chemical_Formula": "CHF2OCF3",
  "GWP_AR5_100yr": 12400
 },
 {
  "Category": "Halogenated_Alcohols_Ethers_etc",
  "Gas_Name": "HFE-134",
  "Chemical_Formula": "CHF2OCHF2",
  "GWP_AR5_100yr": 5560
 },
 {
  "Category": "Halogenated_Alcohols_Ethers_etc",
  "Gas_Name": "HFE-143a",
  "Chemical_Formula": "CH3OCF3",
  "GWP_AR5_100yr": 523
 },
 {
  "Category": "Halogenated_Alcohols_Ethers_etc",
  "Gas_Name": "HFE-227ea",
  "Chemical_Formula": "CF3CHFOCF3",
  "GWP_AR5_100yr": 6450
 },
 {
  "Category": "Halogenated_Alcohols_Ethers_etc",
  "Gas_Name": "HCFE-235ca2",
  "Chemical_Formula": "CHF2OCF2CHFCl",
  "GWP_AR5_100yr": 583
 },
 {
  "Category": "Halogenated_Alcohols_Ethers_etc",
  "Gas_Name": "HCFE-235da2",
  "Chemical_Formula": "CHF2OCHClCF3",
  "GWP_AR5_100yr": 491
 },
 {
  "Category": "Halogenated_Alcohols_Ethers_etc",
  "Gas_Name": "HFE-236ea2",
  "Chemical_Formula": "CHF2OCHFCF3",
  "GWP_AR5_100yr": 1790
 },
 {
  "Category": "Halogenated_Alcohols_Ethers_etc",
  "Gas_Name": "HFE-236fa",
  "Chemical_Formula": "CF3CH2OCF3",
  "GWP_AR5_100yr": 979
 },
 {
  "Category": "Halogenated_Alcohols_Ethers_etc",
  "Gas_Name": "HFE-245cb2",
  "Chemical_Formula": "CF3CF2OCH3",
  "GWP_AR5_100yr": 654
 },
 {
  "Category": "Halogenated_Alcohols_Ethers_etc",
  "Gas_Name": "HFE-245fa1",
  "Chemical_Formula": "CHF2CH2OCF3",
  "GWP_AR5_100yr": 828
 },
 {
  "Category": "Halogenated_Alcohols_Ethers_etc",
  "Gas_Name": "HFE-245fa2",
  "Chemical_Formula": "CHF2OCH2CF3",
  "GWP_AR5_100yr": 812
 },
 {
  "Category": "Halogenated_Alcohols_Ethers_etc",
  "Gas_Name": "2,2,3,3,3-pentafluoropropan-1-ol",
  "Chemical_Formula": "CF3CF2CH2OH",
  "GWP_AR5_100yr": 19
 },
 {
  "Category": "Halogenated_Alcohols_Ethers_etc",
  "Gas_Name": "HFE-254cb1",
  "Chemical_Formula": "CH3OCF2CHF2",
  "GWP_AR5_100yr": 301
 },
 {
  "Category": "Halogenated_Alcohols_Ethers_etc",
  "Gas_Name": "HFE-236ca",
  "Chemical_Formula": "CHF2OCF2CHF2",
  "GWP_AR5_100yr": 4240
 },
 {
  "Category": "Halogenated_Alcohols_Ethers_etc",
  "Gas_Name": "HFE-263mf (HFE-263fb2)",
  "Chemical_Formula": "CF3CH2OCH3",
  "GWP_AR5_100yr": 1
 },
 {
  "Category": "Halogenated_Alcohols_Ethers_etc",
  "Gas_Name": "HFE-263m1",
  "Chemical_Formula": "CF3OCH2CH3",
  "GWP_AR5_100yr": 29
 },
 {
  "Category": "Halogenated_Alcohols_Ethers_etc",
  "Gas_Name": "HFE-365mcf2",
  "Chemical_Formula": "CF3CF2OCH2CH3",
  "GWP_AR5_100yr": 58
 },
 {
  "Category": "Halogenated_Alcohols_Ethers_etc",
  "Gas_Name": "3,3,3-trifluoropropan-1-ol",
  "Chemical_Formula": "CF3CH2CH2OH",
  "GWP_AR5_100yr": 1
 },
 {
  "Category": "Halogenated_Alcohols_Ethers_etc",
  "Gas_Name": "HFE-329mcc2",
  "Chemical_Formula": "CHF2CF2OCF2CF3",
  "GWP_AR5_100yr": 3070
 },
 {
  "Category": "Halogenated_Alcohols_Ethers_etc",
  "Gas_Name": "HFE-338mmz1",
  "Chemical_Formula": "(CF3)2CHOCHF2",
  "GWP_AR5_100yr": 2620
 },
 {
  "Category": "Halogenated_Alcohols_Ethers_etc",
  "Gas_Name": "HFE-338mcf2",
  "Chemical_Formula": "CF3CH2OCF2CF3",
  "GWP_AR5_100yr": 929
 },
 {
  "Category": "Halogenated_Alcohols_Ethers_etc",
  "Gas_Name": "HFE-347mmz1",
  "Chemical_Formula": "(CF3)2CHOCH2F",
  "GWP_AR5_100yr": 216
 },
 {
  "Category": "Halogenated_Alcohols_Ethers_etc",
  "Gas_Name": "HFE-347mcc3",
  "Chemical_Formula": "CH3OCF2CF2CF3",
  "GWP_AR5_100yr": 530
 },
 {
  "Category": "Halogenated_Alcohols_Ethers_etc",
  "Gas_Name": "HFE-347mcf2",
  "Chemical_Formula": "CHF2CH2OCF2CF3",
  "GWP_AR5_100yr": 854
 },
 {
  "Category": "Halogenated_Alcohols_Ethers_etc",
  "Gas_Name": "HFE-347pcf2",
  "Chemical_Formula": "CHF2CF2OCH2CF3",
  "GWP_AR5_100yr": 889
 },
 {
  "Category": "Halogenated_Alcohols_Ethers_etc",
  "Gas_Name": "HFE-347mmy1",
  "Chemical_Formula": "(CF3)2CFOCH3",
  "GWP_AR5_100yr": 363
 },
 {
  "Category": "Halogenated_Alcohols_Ethers_etc",
  "Gas_Name": "HFE-356mec3",
  "Chemical_Formula": "CH3OCF2CHFCF3",
  "GWP_AR5_100yr": 387
 },
 {
  "Category": "Halogenated_Alcohols_Ethers_etc",
  "Gas_Name": "HFE-356mff2",
  "Chemical_Formula": "CF3CH2OCH2CF3",
  "GWP_AR5_100yr": 17
 },
 {
  "Category": "Halogenated_Alcohols_Ethers_etc",
  "Gas_Name": "HFE-356pcf2",
  "Chemical_Formula": "CHF2CH2OCF2CHF2",
  "GWP_AR5_100yr": 719
 },
 {
  "Category": "Halogenated_Alcohols_Ethers_etc",
  "Gas_Name": "HFE-356pcf3",
  "Chemical_Formula": "CHF2OCH2CF2CHF2",
  "GWP_AR5_100yr": 446
 },
 {
  "Category": "Halogenated_Alcohols_Ethers_etc",
  "Gas_Name": "HFE-356pcc3",
  "Chemical_Formula": "CH3OCF2CF2CHF2",
  "GWP_AR5_100yr": 413
 },
 {
  "Category": "Halogenated_Alcohols_Ethers_etc",
  "Gas_Name": "HFE-356mmz1",
  "Chemical_Formula": "(CF3)2CHOCH3",
  "GWP_AR5_100yr": 14
 },
 {
  "Category": "Halogenated_Alcohols_Ethers_etc",
  "Gas_Name": "HFE-365mcf3",
  "Chemical_Formula": "CF3CF2CH2OCH3",
  "GWP_AR5_100yr": 1
 },
 {
  "Category": "Halogenated_Alcohols_Ethers_etc",
  "Gas_Name": "HFE-374pc2",
  "Chemical_Formula": "CHF2CF2OCH2CH3",
  "GWP_AR5_100yr": 627
 },
 {
  "Category": "Halogenated_Alcohols_Ethers_etc",
  "Gas_Name": "4,4,4-trifluorobutan-1-ol",
  "Chemical_Formula": "CF3(CH2)2CH2OH",
  "GWP_AR5_100yr": 1
 },
 {
  "Category": "Halogenated_Alcohols_Ethers_etc",
  "Gas_Name": "2,2,3,3,4,4,5,5- octafluorocyclopentan-1-ol",
  "Chemical_Formula": "cyc (-(CF2)4CH(OH)-)",
  "GWP_AR5_100yr": 13
 },
 {
  "Category": "Halogenated_Alcohols_Ethers_etc",
  "Gas_Name": "HFE-43-10pccc124",
  "Chemical_Formula": "CHF2OCF2OCF2CF2OCHF2",
  "GWP_AR5_100yr": 2820
 },
 {
  "Category": "Halogenated_Alcohols_Ethers_etc",
  "Gas_Name": "HFE-449s1",
  "Chemical_Formula": "C4F9OCH3",
  "GWP_AR5_100yr": 421
 },
 {
  "Category": "Halogenated_Alcohols_Ethers_etc",
  "Gas_Name": "n-HFE-7100",
  "Chemical_Formula": "CF3CF2CF2CF2OCH3",
  "GWP_AR5_100yr": 486
 },
 {
  "Category": "Halogenated_Alcohols_Ethers_etc",
  "Gas_Name": "n-HFE-7200",
  "Chemical_Formula": "n-C4F9OC2H5",
  "GWP_AR5_100yr": 65
 },
 {
  "Category": "Halogenated_Alcohols_Ethers_etc",
  "Gas_Name": "i-HFE-7100",
  "Chemical_Formula": "(CF3)2CFCF2OCH3",
  "GWP_AR5_100yr": 407
 },
 {
  "Category": "Halogenated_Alcohols_Ethers_etc",
  "Gas_Name": "HFE-569sf2",
  "Chemical_Formula": "C4F9OC2H5",
  "GWP_AR5_100yr": 57
 },
 {
  "Category": "Halogenated_Alcohols_Ethers_etc",
  "Gas_Name": "i-HFE-7200",
  "Chemical_Formula": "(CF3)2CFCF2OCH2CH3",
  "GWP_AR5_100yr": 44
 },
 {
  "Category": "Halogenated_Alcohols_Ethers_etc",
  "Gas_Name": "HFE-236ca12",
  "Chemical_Formula": "CHF2OCF2OCHF2",
  "GWP_AR5_100yr": 5350
 },
 {
  "Category": "Halogenated_Alcohols_Ethers_etc",
  "Gas_Name": "HFE-338pcc13",
  "Chemical_Formula": "CHF2OCF2CF2OCHF2",
  "GWP_AR5_100yr": 2910
 },
 {
  "Category": "Halogenated_Alcohols_Ethers_etc",
  "Gas_Name": "1,1,1,3,3,3-hexafluoropropan-2-ol",
  "Chemical_Formula": "(CF3)2CHOH",
  "GWP_AR5_100yr": 182
 },
 {
  "Category": "Halogenated_Alcohols_Ethers_etc",
  "Gas_Name": "HG-02",
  "Chemical_Formula": "CHF2(OCF2CF2)2OCHF2",
  "GWP_AR5_100yr": 2730
 },
 {
  "Category": "Halogenated_Alcohols_Ethers_etc",
  "Gas_Name": "HG-03",
  "Chemical_Formula": "CHF2(OCF2CF2)3OCHF2",
  "GWP_AR5_100yr": 2850
 },
 {
  "Category": "Halogenated_Alcohols_Ethers_etc",
  "Gas_Name": "HG-20",
  "Chemical_Formula": "HF2C–(OCF2)2–OCF2H",
  "GWP_AR5_100yr": 5300
 },
 {
  "Category": "Halogenated_Alcohols_Ethers_etc",
  "Gas_Name": "HG-21",
  "Chemical_Formula": "HF2C–OCF2CF2OC-F2OCF2O–CF2H",
  "GWP_AR5_100yr": 3890
 },
 {
  "Category": "Halogenated_Alcohols_Ethers_etc",
  "Gas_Name": "HG-30",
  "Chemical_Formula": "HF2C–(OCF2)3–OCF2H",
  "GWP_AR5_100yr": 7330
 },
 {
  "Category": "Halogenated_Alcohols_Ethers_etc",
  "Gas_Name": "Fluroxene",
  "Chemical_Formula": "CF3CH2OCH=CH2",
  "GWP_AR5_100yr": 1
 },
 {
  "Category": "Halogenated_Alcohols_Ethers_etc",
  "Gas_Name": "1,1,2,2-tetrafluoro-1-(fluoromethoxy)ethane",
  "Chemical_Formula": "CH2FOCF2CF2H",
  "GWP_AR5_100yr": 871
 },
 {
  "Category": "Halogenated_Alcohols_Ethers_etc",
  "Gas_Name": "2-ethoxy-3,3,4,4,5- pentafluorotetrahydro-2,5- bis[1,2,2,2-tetrafluoro-1- (trifluoromethyl)ethyl]furan",
  "Chemical_Formula": "C12H5F19O2",
  "GWP_AR5_100yr": 56
 },
 {
  "Category": "Halogenated_Alcohols_Ethers_etc",
  "Gas_Name": "Difluoro(methoxy)methane",
  "Chemical_Formula": "CH3OCHF2",
  "GWP_AR5_100yr": 144
 },
 {
  "Category": "Halogenated_Alcohols_Ethers_etc",
  "Gas_Name": "HG’-01",
  "Chemical_Formula": "CH3OCF2CF2OCH3",
  "GWP_AR5_100yr": 222
 },
 {
  "Category": "Halogenated_Alcohols_Ethers_etc",
  "Gas_Name": "HG’-02",
  "Chemical_Formula": "CH3O(CF2CF2O)2CH3",
  "GWP_AR5_100yr": 236
 },
 {
  "Category": "Halogenated_Alcohols_Ethers_etc",
  "Gas_Name": "HG’-03",
  "Chemical_Formula": "CH3O(CF2CF2O)3CH3",
  "GWP_AR5_100yr": 221
 },
 {
  "Category": "Halogenated_Alcohols_Ethers_etc",
  "Gas_Name": "HFE-329me3",
  "Chemical_Formula": "CF3CFHCF2OCF3",
  "GWP_AR5_100yr": 4550
 },
 {
  "Category": "Halogenated_Alcohols_Ethers_etc",
  "Gas_Name": "3,3,4,4,5,5,6,6,7,7,7- undecafluoroheptan-1-ol",
  "Chemical_Formula": "CF3(CF2)4CH2CH2OH",
  "GWP_AR5_100yr": 1
 },
 {
  "Category": "Halogenated_Alcohols_Ethers_etc",
  "Gas_Name": "3,3,4,4,5,5,6,6,7,7,8,8,9,9,9- pentadecafluorononan-1-ol",
  "Chemical_Formula": "CF3(CF2)6CH2CH2OH",
  "GWP_AR5_100yr": 1
 },
 {
  "Category": "Halogenated_Alcohols_Ethers_etc",
  "Gas_Name": "3,3,4,4,5,5,6,6,7,7,8,8,9,9,10,10,11, 11,11-nonadecafluoroundecan-1-ol",
  "Chemical_Formula": "CF3(CF2)8CH2CH2OH",
  "GWP_AR5_100yr": 1
 },
 {
  "Category": "Halogenated_Alcohols_Ethers_etc",
  "Gas_Name": "2-chloro-1,1,2-trifluoro-1- methoxyethane",
  "Chemical_Formula": "CH3OCF2CHClF",
  "GWP_AR5_100yr": 122
 },
 {
  "Category": "Halogenated_Alcohols_Ethers_etc",
  "Gas_Name": "PFPMIE",
  "Chemical_Formula": "CF3OCF(CF3)CF2OCF2OCF 3",
  "GWP_AR5_100yr": 9710
 },
 {
  "Category": "Halogenated_Alcohols_Ethers_etc",
  "Gas_Name": "HFE-216",
  "Chemical_Formula": "CF3OCF=CF2",
  "GWP_AR5_100yr": 1
 },
 {
  "Category": "Halogenated_Alcohols_Ethers_etc",
  "Gas_Name": "Perfluoroethyl formate",
  "Chemical_Formula": "CF3CF2OCHO",
  "GWP_AR5_100yr": 580
 },
 {
  "Category": "Halogenated_Alcohols_Ethers_etc",
  "Gas_Name": "2,2,2-trifluoroethyl formate",
  "Chemical_Formula": "CF3CH2OCHO",
  "GWP_AR5_100yr": 33
 },
 {
  "Category": "Halogenated_Alcohols_Ethers_etc",
  "Gas_Name": "Ethyl 2,2,2-trifluoroacetate",
  "Chemical_Formula": "CF3COOCH2CH3",
  "GWP_AR5_100yr": 1
 },
 {
  "Category": "Halogenated_Alcohols_Ethers_etc",
  "Gas_Name": "Methyl 2,2,2-trifluoroacetate",
  "Chemical_Formula": "CF3COOCH3",
  "GWP_AR5_100yr": 52
 },
 {
  "Category": "Halogenated_Alcohols_Ethers_etc",
  "Gas_Name": "2,2,3,3,4,4,4-heptafluorobutan-1-ol",
  "Chemical_Formula": "CF3CF2CF2CH2OH",
  "GWP_AR5_100yr": 34
 },
 {
  "Category": "Halogenated_Alcohols_Ethers_etc",
  "Gas_Name": "1,1,2-trifluoro-2-(trifluoromethoxy)- ethane",
  "Chemical_Formula": "CHF2CHFOCF3",
  "GWP_AR5_100yr": 1240
 },
 {
  "Category": "Halogenated_Alcohols_Ethers_etc",
  "Gas_Name": "1-ethoxy-1,1,2,3,3,3- hexafluoropropane",
  "Chemical_Formula": "CF3CHFCF2OCH2CH3",
  "GWP_AR5_100yr": 23
 },
 {
  "Category": "Halogenated_Alcohols_Ethers_etc",
  "Gas_Name": "1,1,1,2,2,3,3-heptafluoro-3-(1,2,2,2- tetrafluoroethoxy)propane",
  "Chemical_Formula": "CF3CF2CF2OCHFCF3",
  "GWP_AR5_100yr": 6490
 },
 {
  "Category": "Halogenated_Alcohols_Ethers_etc",
  "Gas_Name": "2,2,3,3-tetrafluoropropan-1-ol",
  "Chemical_Formula": "CHF2CF2CH2OH",
  "GWP_AR5_100yr": 13
 },
 {
  "Category": "Halogenated_Alcohols_Ethers_etc",
  "Gas_Name": "2,2,3,4,4,4-hexafluorobutan-1-ol",
  "Chemical_Formula": "CF3CHFCF2CH2OH",
  "GWP_AR5_100yr": 17
 },
 {
  "Category": "Halogenated_Alcohols_Ethers_etc",
  "Gas_Name": "1,1,2,2-tetrafluoro-3- methoxypropane",
  "Chemical_Formula": "CHF2CF2CH2OCH3",
  "GWP_AR5_100yr": 1
 },
 {
  "Category": "Halogenated_Alcohols_Ethers_etc",
  "Gas_Name": "1-ethoxy-1,1,2,2,3,3,3-heptafluoropropane",
  "Chemical_Formula": "CF3CF2CF2OCH2CH3",
  "GWP_AR5_100yr": 61
 },
 {
  "Category": "Halogenated_Alcohols_Ethers_etc",
  "Gas_Name": "Fluoro(methoxy)methane",
  "Chemical_Formula": "CH3OCH2F",
  "GWP_AR5_100yr": 13
 },
 {
  "Category": "Halogenated_Alcohols_Ethers_etc",
  "Gas_Name": "Fluoro(fluoromethoxy)methane",
  "Chemical_Formula": "CH2FOCH2F",
  "GWP_AR5_100yr": 130
 },
 {
  "Category": "Halogenated_Alcohols_Ethers_etc",
  "Gas_Name": "Difluoro(fluoromethoxy)methane",
  "Chemical_Formula": "CH2FOCHF2",
  "GWP_AR5_100yr": 617
 },
 {
  "Category": "Halogenated_Alcohols_Ethers_etc",
  "Gas_Name": "Trifluoro(fluoromethoxy)methane",
  "Chemical_Formula": "CH2FOCF3",
  "GWP_AR5_100yr": 751
 },
 {
  "Category": "Halogenated_Alcohols_Ethers_etc",
  "Gas_Name": "Trifluoromethyl formate",
  "Chemical_Formula": "HCOOCF3",
  "GWP_AR5_100yr": 588
 },
 {
  "Category": "Halogenated_Alcohols_Ethers_etc",
  "Gas_Name": "Perfluoropropyl formate",
  "Chemical_Formula": "HCOOCF2CF2CF3",
  "GWP_AR5_100yr": 376
 },
 {
  "Category": "Halogenated_Alcohols_Ethers_etc",
  "Gas_Name": "Perfluorobutyl formate",
  "Chemical_Formula": "HCOOCF2CF2CF2CF3",
  "GWP_AR5_100yr": 392
 },
 {
  "Category": "Halogenated_Alcohols_Ethers_etc",
  "Gas_Name": "3,3,3-trifluoropropyl formate",
  "Chemical_Formula": "HCOOCH2CH2CF3",
  "GWP_AR5_100yr": 17
 },
 {
  "Category": "Halogenated_Alcohols_Ethers_etc",
  "Gas_Name": "1,2,2,2-tetrafluoroethyl formate",
  "Chemical_Formula": "HCOOCHFCF3",
  "GWP_AR5_100yr": 470
 },
 {
  "Category": "Halogenated_Alcohols_Ethers_etc",
  "Gas_Name": "1,1,1,3,3,3-hexafluoropropan-2-yl formate",
  "Chemical_Formula": "HCOOCH(CF3)2",
  "GWP_AR5_100yr": 333
 },
 {
  "Category": "Halogenated_Alcohols_Ethers_etc",
  "Gas_Name": "Perfluorobutyl acetate",
  "Chemical_Formula": "CH3COOCF2CF2CF2CF3",
  "GWP_AR5_100yr": 2
 },
 {
  "Category": "Halogenated_Alcohols_Ethers_etc",
  "Gas_Name": "Perfluoropropyl acetate",
  "Chemical_Formula": "CH3COOCF2CF2CF3",
  "GWP_AR5_100yr": 2
 },
 {
  "Category": "Halogenated_Alcohols_Ethers_etc",
  "Gas_Name": "Perfluoroethyl acetate",
  "Chemical_Formula": "CH3COOCF2CF3",
  "GWP_AR5_100yr": 2
 },
 {
  "Category": "Halogenated_Alcohols_Ethers_etc",
  "Gas_Name": "Trifluoromethyl acetate",
  "Chemical_Formula": "CH3COOCF3",
  "GWP_AR5_100yr": 2
 },
 {
  "Category": "Halogenated_Alcohols_Ethers_etc",
  "Gas_Name": "Methyl carbonofluoridate",
  "Chemical_Formula": "FCOOCH3",
  "GWP_AR5_100yr": 95
 },
 {
  "Category": "Halogenated_Alcohols_Ethers_etc",
  "Gas_Name": "1,1-difluoroethyl carbonofluoridate",
  "Chemical_Formula": "FCOOCF2CH3",
  "GWP_AR5_100yr": 27
 },
 {
  "Category": "Halogenated_Alcohols_Ethers_etc",
  "Gas_Name": "1,1-difluoroethyl 2,2,2-trifluoroacetate",
  "Chemical_Formula": "CF3COOCF2CH3",
  "GWP_AR5_100yr": 31
 },
 {
  "Category": "Halogenated_Alcohols_Ethers_etc",
  "Gas_Name": "2,2,2-trifluoroethyl 2,2,2-trifluoroacetate",
  "Chemical_Formula": "CF3COOCH2CF3",
  "GWP_AR5_100yr": 7
 },
 {
  "Category": "Halogenated_Alcohols_Ethers_etc",
  "Gas_Name": "Methyl 2,2-difluoroacetate",
  "Chemical_Formula": "HCF2COOCH3",
  "GWP_AR5_100yr": 3
 },
 {
  "Category": "Halogenated_Alcohols_Ethers_etc",
  "Gas_Name": "Difluoromethyl 2,2,2-trifluoroacetate",
  "Chemical_Formula": "CF3COOCHF2",
  "GWP_AR5_100yr": 27
 },
 {
  "Category": "Halogenated_Alcohols_Ethers_etc",
  "Gas_Name": "Perfluoro-2-methyl-3-pentanone",
  "Chemical_Formula": "CF3CF2C(O)CF(CF3)2",
  "GWP_AR5_100yr": 1
 },
 {
  "Category": "Halogenated_Alcohols_Ethers_etc",
  "Gas_Name": "1,1’-Oxybis[2-(difluoromethoxy)-1,1,2,2-tetrafluoroethane",
  "Chemical_Formula": "HCF2O(CF2CF2O)2CF2H",
  "GWP_AR5_100yr": 4920
 },
 {
  "Category": "Halogenated_Alcohols_Ethers_etc",
  "Gas_Name": "1,1,3,3,4,4,6,6,7,7,9,9,10,10,12,12-hexadecafluoro-2,5,8,11-Tetraoxadodecane",
  "Chemical_Formula": "HCF2O(CF2CF2O)3CF2H",
  "GWP_AR5_100yr": 4490
 },
 {
  "Category": "Halogenated_Alcohols_Ethers_etc",
  "Gas_Name": "1,1,3,3,4,4,6,6,7,7,9,9,10,10,12,12,13,13,15,15-eicosafluoro-2,5,8,11,14-pentaoxapentadecane",
  "Chemical_Formula": "HCF2O(CF2CF2O)4CF2H",
  "GWP_AR5_100yr": 3630
 },
 {
  "Category": "Halogenated_Alcohols_Ethers_etc",
  "Gas_Name": "3,3,3-trifluoropropanal",
  "Chemical_Formula": "CF3CH2CHO",
  "GWP_AR5_100yr": 1
 },
 {
  "Category": "Halogenated_Alcohols_Ethers_etc",
  "Gas_Name": "2-fluoroethanol",
  "Chemical_Formula": "CH2FCH2OH",
  "GWP_AR5_100yr": 1
 },
 {
  "Category": "Halogenated_Alcohols_Ethers_etc",
  "Gas_Name": "2,2-difluoroethanol",
  "Chemical_Formula": "CHF2CH2OH",
  "GWP_AR5_100yr": 3
 },
 {
  "Category": "Halogenated_Alcohols_Ethers_etc",
  "Gas_Name": "2,2,2-trifluoroethanol",
  "Chemical_Formula": "CF3CH2OH",
  "GWP_AR5_100yr": 20
 },
 /* --- Yaygın soğutucu karışımları (blend) ---
    KIP'ler, IPCC AR5 saf bileşen değerlerinden kütle oranıyla hesaplanmıştır.
    Tesisinizde farklı bir karışım varsa Yönetim Paneli'nden ekleyebilirsiniz. --- */
 {
  "Category": "Sogutucu_Karisim_Blend",
  "Gas_Name": "R-410A",
  "Chemical_Formula": "%50 HFC-32 + %50 HFC-125",
  "GWP_AR5_100yr": 1924
 },
 {
  "Category": "Sogutucu_Karisim_Blend",
  "Gas_Name": "R-404A",
  "Chemical_Formula": "%44 HFC-125 + %52 HFC-143a + %4 HFC-134a",
  "GWP_AR5_100yr": 3943
 },
 {
  "Category": "Sogutucu_Karisim_Blend",
  "Gas_Name": "R-407C",
  "Chemical_Formula": "%23 HFC-32 + %25 HFC-125 + %52 HFC-134a",
  "GWP_AR5_100yr": 1624
 },
 {
  "Category": "Sogutucu_Karisim_Blend",
  "Gas_Name": "R-407A",
  "Chemical_Formula": "%20 HFC-32 + %40 HFC-125 + %40 HFC-134a",
  "GWP_AR5_100yr": 1923
 },
 {
  "Category": "Sogutucu_Karisim_Blend",
  "Gas_Name": "R-407F",
  "Chemical_Formula": "%30 HFC-32 + %30 HFC-125 + %40 HFC-134a",
  "GWP_AR5_100yr": 1674
 },
 {
  "Category": "Sogutucu_Karisim_Blend",
  "Gas_Name": "R-507A",
  "Chemical_Formula": "%50 HFC-125 + %50 HFC-143a",
  "GWP_AR5_100yr": 3985
 },
 {
  "Category": "Sogutucu_Karisim_Blend",
  "Gas_Name": "R-417A",
  "Chemical_Formula": "%46,6 HFC-125 + %50 HFC-134a (+%3,4 bütan)",
  "GWP_AR5_100yr": 2127
 },
 {
  "Category": "Sogutucu_Karisim_Blend",
  "Gas_Name": "R-422D",
  "Chemical_Formula": "%65,1 HFC-125 + %31,5 HFC-134a (+%3,4 izobütan)",
  "GWP_AR5_100yr": 2473
 },
 {
  "Category": "Sogutucu_Karisim_Blend",
  "Gas_Name": "R-427A",
  "Chemical_Formula": "%15/%25/%10/%50 HFC-32/125/143a/134a",
  "GWP_AR5_100yr": 2024
 },
 {
  "Category": "Sogutucu_Karisim_Blend",
  "Gas_Name": "R-32 (saf HFC-32)",
  "Chemical_Formula": "Saf HFC-32 — yaygın ticari ad",
  "GWP_AR5_100yr": 677
 },
 {
  "Category": "Sogutucu_Karisim_Blend",
  "Gas_Name": "R-134a (saf HFC-134a)",
  "Chemical_Formula": "Saf HFC-134a — yaygın ticari ad",
  "GWP_AR5_100yr": 1300
 }
];
