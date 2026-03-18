/**
 * Script per poblar la taula it_durations amb diagnòstics i durades d'IT
 * Basat en les Taules de Durades Orientatives de l'INSS (2023) i guies SEMG/SEGO
 */
import { createConnection } from "mysql2/promise";
import * as dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dirname, "../.env") });

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error("ERROR: DATABASE_URL no definida");
  process.exit(1);
}

const diagnoses = [
  // ===== APARELL LOCOMOTOR =====
  { diagnosis: "Lumbalgia aguda inespecífica", cie10Code: "M54.5", category: "Aparell locomotor", minDays: 7, maxDays: 30, averageDays: 14, notes: "Sense irradiació. Tractament conservador. Valorar ergonomia laboral.", source: "INSS 2023" },
  { diagnosis: "Lumbalgia crònica", cie10Code: "M54.5", category: "Aparell locomotor", minDays: 15, maxDays: 90, averageDays: 45, notes: "Amb component crònic. Valorar comorbiditats i tipus de feina.", source: "INSS 2023" },
  { diagnosis: "Hèrnia discal lumbar sense cirurgia", cie10Code: "M51.1", category: "Aparell locomotor", minDays: 30, maxDays: 120, averageDays: 60, notes: "Tractament conservador. Valorar resposta al tractament.", source: "INSS 2023" },
  { diagnosis: "Hèrnia discal lumbar amb cirurgia (discectomia)", cie10Code: "M51.1", category: "Aparell locomotor", minDays: 45, maxDays: 120, averageDays: 75, notes: "Post-cirurgia. Depèn del tipus de feina (sedentària vs. física).", source: "INSS 2023" },
  { diagnosis: "Hèrnia discal cervical sense cirurgia", cie10Code: "M50.1", category: "Aparell locomotor", minDays: 21, maxDays: 90, averageDays: 45, notes: "Tractament conservador amb fisioteràpia.", source: "INSS 2023" },
  { diagnosis: "Hèrnia discal cervical amb cirurgia", cie10Code: "M50.1", category: "Aparell locomotor", minDays: 45, maxDays: 120, averageDays: 75, notes: "Post-cirurgia. Valorar recuperació neurològica.", source: "INSS 2023" },
  { diagnosis: "Cervicalgia", cie10Code: "M54.2", category: "Aparell locomotor", minDays: 7, maxDays: 21, averageDays: 10, notes: "Sense irradiació. Tractament conservador.", source: "INSS 2023" },
  { diagnosis: "Esguinç cervical (latigazo cervical)", cie10Code: "S13.4", category: "Aparell locomotor", minDays: 14, maxDays: 60, averageDays: 30, notes: "Valorar grau de lesió i resposta al tractament.", source: "INSS 2023" },
  { diagnosis: "Fractura de vèrtebra lumbar", cie10Code: "S32.0", category: "Aparell locomotor", minDays: 60, maxDays: 180, averageDays: 90, notes: "Depèn del tipus de fractura i tractament.", source: "INSS 2023" },
  { diagnosis: "Gonartrosi (artrosi de genoll)", cie10Code: "M17", category: "Aparell locomotor", minDays: 15, maxDays: 60, averageDays: 30, notes: "Valorar grau d'artrosi i tipus de feina.", source: "INSS 2023" },
  { diagnosis: "Artroplàstia de genoll (pròtesi)", cie10Code: "M17", category: "Aparell locomotor", minDays: 60, maxDays: 180, averageDays: 90, notes: "Post-cirurgia. Depèn de la rehabilitació i el tipus de feina.", source: "INSS 2023" },
  { diagnosis: "Artroplàstia de maluc (pròtesi)", cie10Code: "M16", category: "Aparell locomotor", minDays: 60, maxDays: 150, averageDays: 90, notes: "Post-cirurgia. Valorar rehabilitació.", source: "INSS 2023" },
  { diagnosis: "Coxartrosi (artrosi de maluc)", cie10Code: "M16", category: "Aparell locomotor", minDays: 15, maxDays: 60, averageDays: 30, notes: "Valorar grau d'artrosi i tipus de feina.", source: "INSS 2023" },
  { diagnosis: "Esguinç de turmell", cie10Code: "S93.4", category: "Aparell locomotor", minDays: 7, maxDays: 30, averageDays: 14, notes: "Grau I-II. Grau III pot requerir fins a 45 dies.", source: "INSS 2023" },
  { diagnosis: "Fractura de turmell", cie10Code: "S82.8", category: "Aparell locomotor", minDays: 45, maxDays: 120, averageDays: 75, notes: "Depèn del tipus de fractura i tractament (conservador vs. quirúrgic).", source: "INSS 2023" },
  { diagnosis: "Fractura de radi distal (Colles)", cie10Code: "S52.5", category: "Aparell locomotor", minDays: 30, maxDays: 90, averageDays: 45, notes: "Depèn del tipus de feina. Feines manuals poden requerir més temps.", source: "INSS 2023" },
  { diagnosis: "Síndrome del túnel carpià", cie10Code: "G56.0", category: "Aparell locomotor", minDays: 14, maxDays: 60, averageDays: 30, notes: "Post-cirurgia. Feines manuals poden requerir fins a 90 dies.", source: "INSS 2023" },
  { diagnosis: "Tendinitis del manegot dels rotadors", cie10Code: "M75.1", category: "Aparell locomotor", minDays: 14, maxDays: 60, averageDays: 30, notes: "Tractament conservador. Cirurgia pot requerir fins a 120 dies.", source: "INSS 2023" },
  { diagnosis: "Ruptura del manegot dels rotadors amb cirurgia", cie10Code: "M75.1", category: "Aparell locomotor", minDays: 60, maxDays: 180, averageDays: 120, notes: "Post-cirurgia. Rehabilitació llarga.", source: "INSS 2023" },
  { diagnosis: "Epicondilitis (colze de tennista)", cie10Code: "M77.1", category: "Aparell locomotor", minDays: 14, maxDays: 60, averageDays: 30, notes: "Tractament conservador. Valorar tipus de feina.", source: "INSS 2023" },
  { diagnosis: "Fascitis plantar", cie10Code: "M72.2", category: "Aparell locomotor", minDays: 14, maxDays: 60, averageDays: 30, notes: "Tractament conservador. Feines de peu poden requerir més temps.", source: "INSS 2023" },
  { diagnosis: "Fibromialgia", cie10Code: "M79.7", category: "Aparell locomotor", minDays: 30, maxDays: 180, averageDays: 90, notes: "Molt variable. Valorar intensitat del dolor i resposta al tractament.", source: "INSS 2023" },

  // ===== SISTEMA RESPIRATORI =====
  { diagnosis: "Pneumònia bacteriana", cie10Code: "J18.9", category: "Sistema respiratori", minDays: 14, maxDays: 45, averageDays: 21, notes: "Depèn de la gravetat i resposta al tractament antibiótic.", source: "INSS 2023" },
  { diagnosis: "Pneumònia per COVID-19", cie10Code: "U07.1", category: "Sistema respiratori", minDays: 14, maxDays: 60, averageDays: 28, notes: "Valorar gravetat i seqüeles (COVID persistent).", source: "INSS 2023" },
  { diagnosis: "Bronquitis aguda", cie10Code: "J20.9", category: "Sistema respiratori", minDays: 7, maxDays: 21, averageDays: 10, notes: "Tractament simptomàtic.", source: "INSS 2023" },
  { diagnosis: "Agudització de MPOC", cie10Code: "J44.1", category: "Sistema respiratori", minDays: 14, maxDays: 45, averageDays: 21, notes: "Depèn de la gravetat de la MPOC de base.", source: "INSS 2023" },
  { diagnosis: "Asma aguda (crisis asmàtica)", cie10Code: "J45.9", category: "Sistema respiratori", minDays: 7, maxDays: 21, averageDays: 10, notes: "Valorar gravetat de la crisi i control de base.", source: "INSS 2023" },
  { diagnosis: "Pleuritis / Pleuresia", cie10Code: "J90", category: "Sistema respiratori", minDays: 14, maxDays: 45, averageDays: 21, notes: "Tractament de la causa subjacent.", source: "INSS 2023" },
  { diagnosis: "Pneumotòrax espontani", cie10Code: "J93.1", category: "Sistema respiratori", minDays: 14, maxDays: 45, averageDays: 21, notes: "Primer episodi. Recidiva pot requerir cirurgia.", source: "INSS 2023" },
  { diagnosis: "Embòlia pulmonar", cie10Code: "I26.9", category: "Sistema respiratori", minDays: 21, maxDays: 90, averageDays: 45, notes: "Anticoagulació. Valorar gravetat i factors de risc.", source: "INSS 2023" },

  // ===== SISTEMA CARDIOVASCULAR =====
  { diagnosis: "Infart agut de miocardi (IAM)", cie10Code: "I21.9", category: "Sistema cardiovascular", minDays: 30, maxDays: 120, averageDays: 60, notes: "Depèn de la gravetat, tractament (angioplàstia vs. bypass) i tipus de feina.", source: "INSS 2023" },
  { diagnosis: "Angina de pit inestable", cie10Code: "I20.0", category: "Sistema cardiovascular", minDays: 14, maxDays: 60, averageDays: 30, notes: "Valorar tractament i resposta.", source: "INSS 2023" },
  { diagnosis: "Cirurgia de bypass coronari (CABG)", cie10Code: "Z95.1", category: "Sistema cardiovascular", minDays: 60, maxDays: 180, averageDays: 90, notes: "Post-cirurgia. Rehabilitació cardíaca.", source: "INSS 2023" },
  { diagnosis: "Insuficiència cardíaca aguda", cie10Code: "I50.9", category: "Sistema cardiovascular", minDays: 21, maxDays: 90, averageDays: 45, notes: "Depèn de la gravetat i resposta al tractament.", source: "INSS 2023" },
  { diagnosis: "Fibril·lació auricular (FA) de nova aparició", cie10Code: "I48.9", category: "Sistema cardiovascular", minDays: 7, maxDays: 30, averageDays: 14, notes: "Valorar cardioversió i anticoagulació.", source: "INSS 2023" },
  { diagnosis: "Trombosi venosa profunda (TVP)", cie10Code: "I82.4", category: "Sistema cardiovascular", minDays: 14, maxDays: 45, averageDays: 21, notes: "Anticoagulació. Valorar localització i extensió.", source: "INSS 2023" },
  { diagnosis: "Hipertensió arterial descompensada", cie10Code: "I10", category: "Sistema cardiovascular", minDays: 3, maxDays: 14, averageDays: 7, notes: "Ajust de tractament. Valorar complicacions.", source: "INSS 2023" },

  // ===== SISTEMA DIGESTIU =====
  { diagnosis: "Apendicitis aguda amb cirurgia (apendicectomia)", cie10Code: "K37", category: "Sistema digestiu", minDays: 14, maxDays: 45, averageDays: 21, notes: "Laparoscòpia: 14-21 dies. Laparotomia: 21-45 dies.", source: "INSS 2023" },
  { diagnosis: "Colecistitis aguda amb cirurgia (colecistectomia)", cie10Code: "K81.0", category: "Sistema digestiu", minDays: 14, maxDays: 45, averageDays: 21, notes: "Laparoscòpia: 14-21 dies. Laparotomia: 21-45 dies.", source: "INSS 2023" },
  { diagnosis: "Pancreatitis aguda lleu", cie10Code: "K85.9", category: "Sistema digestiu", minDays: 14, maxDays: 45, averageDays: 21, notes: "Pancreatitis lleu. Grau sever pot requerir mesos.", source: "INSS 2023" },
  { diagnosis: "Hèrnia inguinal amb cirurgia (herniorràfia)", cie10Code: "K40.9", category: "Sistema digestiu", minDays: 14, maxDays: 45, averageDays: 21, notes: "Laparoscòpia: 14-21 dies. Feines físiques: fins a 45 dies.", source: "INSS 2023" },
  { diagnosis: "Gastroenteritis aguda", cie10Code: "A09", category: "Sistema digestiu", minDays: 3, maxDays: 10, averageDays: 5, notes: "Tractament simptomàtic i hidratació.", source: "INSS 2023" },
  { diagnosis: "Malaltia inflamatòria intestinal (brot agut)", cie10Code: "K51.9", category: "Sistema digestiu", minDays: 14, maxDays: 60, averageDays: 30, notes: "Depèn de la gravetat del brot.", source: "INSS 2023" },
  { diagnosis: "Úlcera gàstrica o duodenal complicada", cie10Code: "K25.0", category: "Sistema digestiu", minDays: 14, maxDays: 45, averageDays: 21, notes: "Valorar complicació (hemorràgia, perforació).", source: "INSS 2023" },
  { diagnosis: "Hemorràgia digestiva alta", cie10Code: "K92.2", category: "Sistema digestiu", minDays: 7, maxDays: 30, averageDays: 14, notes: "Depèn de la gravetat i tractament endoscòpic.", source: "INSS 2023" },
  { diagnosis: "Cirrosi hepàtica descompensada", cie10Code: "K74.6", category: "Sistema digestiu", minDays: 21, maxDays: 90, averageDays: 45, notes: "Depèn de la complicació (ascites, encefalopatia).", source: "INSS 2023" },

  // ===== SALUT MENTAL =====
  { diagnosis: "Episodi depressiu major", cie10Code: "F32.1", category: "Salut mental", minDays: 30, maxDays: 180, averageDays: 90, notes: "Molt variable. Valorar gravetat, resposta al tractament i tipus de feina.", source: "INSS 2023" },
  { diagnosis: "Trastorn d'ansietat generalitzada", cie10Code: "F41.1", category: "Salut mental", minDays: 14, maxDays: 90, averageDays: 45, notes: "Valorar gravetat i resposta al tractament.", source: "INSS 2023" },
  { diagnosis: "Trastorn adaptatiu (reacció a l'estrès)", cie10Code: "F43.2", category: "Salut mental", minDays: 14, maxDays: 60, averageDays: 30, notes: "Valorar factor estressant i resposta al tractament.", source: "INSS 2023" },
  { diagnosis: "Burnout (síndrome d'esgotament professional)", cie10Code: "Z73.0", category: "Salut mental", minDays: 30, maxDays: 120, averageDays: 60, notes: "Valorar gravetat i factors laborals. Pot requerir canvi de feina.", source: "INSS 2023" },
  { diagnosis: "Trastorn de pànic", cie10Code: "F41.0", category: "Salut mental", minDays: 14, maxDays: 60, averageDays: 30, notes: "Tractament farmacològic i psicoteràpia.", source: "INSS 2023" },
  { diagnosis: "Episodi maníac o hipomaníac (trastorn bipolar)", cie10Code: "F31.1", category: "Salut mental", minDays: 21, maxDays: 90, averageDays: 45, notes: "Estabilització amb medicació. Valorar gravetat.", source: "INSS 2023" },
  { diagnosis: "Psicosi aguda", cie10Code: "F23.9", category: "Salut mental", minDays: 30, maxDays: 180, averageDays: 90, notes: "Depèn de la resposta al tractament antipsicòtic.", source: "INSS 2023" },
  { diagnosis: "Trastorn per estrès posttraumàtic (TEPT)", cie10Code: "F43.1", category: "Salut mental", minDays: 30, maxDays: 180, averageDays: 90, notes: "Psicoteràpia especialitzada. Molt variable.", source: "INSS 2023" },

  // ===== SISTEMA NERVIÓS =====
  { diagnosis: "Migranya (crisi incapacitant)", cie10Code: "G43.9", category: "Sistema nerviós", minDays: 1, maxDays: 7, averageDays: 3, notes: "Per crisi aguda. Migranya crònica pot requerir IT prolongada.", source: "INSS 2023" },
  { diagnosis: "Vèrtigen posicional paroxístic benigne (VPPB)", cie10Code: "H81.1", category: "Sistema nerviós", minDays: 3, maxDays: 14, averageDays: 7, notes: "Tractament amb maniobres de reposicionament.", source: "INSS 2023" },
  { diagnosis: "Neuritis vestibular (vèrtigen perifèric)", cie10Code: "H81.2", category: "Sistema nerviós", minDays: 7, maxDays: 30, averageDays: 14, notes: "Tractament simptomàtic i rehabilitació vestibular.", source: "INSS 2023" },
  { diagnosis: "Accident isquèmic transitori (AIT)", cie10Code: "G45.9", category: "Sistema nerviós", minDays: 7, maxDays: 30, averageDays: 14, notes: "Estudi i prevenció secundària.", source: "INSS 2023" },
  { diagnosis: "Ictus isquèmic (AVC)", cie10Code: "I63.9", category: "Sistema nerviós", minDays: 30, maxDays: 365, averageDays: 120, notes: "Molt variable. Depèn de la gravetat i seqüeles neurològiques.", source: "INSS 2023" },
  { diagnosis: "Esclerosi múltiple (brot agut)", cie10Code: "G35", category: "Sistema nerviós", minDays: 14, maxDays: 60, averageDays: 30, notes: "Tractament del brot amb corticoides. Valorar seqüeles.", source: "INSS 2023" },
  { diagnosis: "Síndrome de Guillain-Barré", cie10Code: "G61.0", category: "Sistema nerviós", minDays: 60, maxDays: 365, averageDays: 180, notes: "Molt variable. Depèn de la gravetat i recuperació neurològica.", source: "INSS 2023" },
  { diagnosis: "Neuropatia perifèrica", cie10Code: "G62.9", category: "Sistema nerviós", minDays: 14, maxDays: 60, averageDays: 30, notes: "Depèn de la causa i gravetat.", source: "INSS 2023" },
  { diagnosis: "Epilèpsia (crisi convulsiva)", cie10Code: "G40.9", category: "Sistema nerviós", minDays: 3, maxDays: 14, averageDays: 7, notes: "Per crisi aguda. Valorar control i tipus de feina (conducció, alçada).", source: "INSS 2023" },

  // ===== SISTEMA ENDOCRÍ =====
  { diagnosis: "Diabetis mellitus descompensada", cie10Code: "E11.9", category: "Sistema endocrí", minDays: 3, maxDays: 14, averageDays: 7, notes: "Ajust de tractament. Valorar complicacions.", source: "INSS 2023" },
  { diagnosis: "Cetoacidosi diabètica", cie10Code: "E10.1", category: "Sistema endocrí", minDays: 7, maxDays: 21, averageDays: 10, notes: "Hospitalització. Ajust d'insulina.", source: "INSS 2023" },
  { diagnosis: "Hipotiroïdisme descompensat", cie10Code: "E03.9", category: "Sistema endocrí", minDays: 7, maxDays: 30, averageDays: 14, notes: "Ajust de levotiroxina.", source: "INSS 2023" },
  { diagnosis: "Hipertiroïdisme (crisi tiroïdal)", cie10Code: "E05.9", category: "Sistema endocrí", minDays: 14, maxDays: 45, averageDays: 21, notes: "Tractament mèdic. Valorar tiroidectomia.", source: "INSS 2023" },

  // ===== SISTEMA GENITOURINARI =====
  { diagnosis: "Infecció urinària complicada (pielonefritis)", cie10Code: "N10", category: "Sistema genitourinari", minDays: 7, maxDays: 21, averageDays: 10, notes: "Tractament antibiótic. Valorar complicacions.", source: "INSS 2023" },
  { diagnosis: "Còlic nefrític (litiasi renal)", cie10Code: "N23", category: "Sistema genitourinari", minDays: 3, maxDays: 14, averageDays: 7, notes: "Tractament del dolor. Valorar necessitat de litotrícia.", source: "INSS 2023" },
  { diagnosis: "Insuficiència renal aguda", cie10Code: "N17.9", category: "Sistema genitourinari", minDays: 14, maxDays: 60, averageDays: 30, notes: "Depèn de la causa i gravetat.", source: "INSS 2023" },
  { diagnosis: "Prostatitis aguda bacteriana", cie10Code: "N41.0", category: "Sistema genitourinari", minDays: 14, maxDays: 30, averageDays: 21, notes: "Tractament antibiótic prolongat.", source: "INSS 2023" },

  // ===== GINECOLOGIA / OBSTETRÍCIA =====
  { diagnosis: "Dismenorrea incapacitant (menstruació incapacitant)", cie10Code: "N94.4", category: "Ginecologia", minDays: 1, maxDays: 3, averageDays: 2, notes: "Per cicle menstrual. Valorar endometriosi subjacent.", source: "INSS 2023" },
  { diagnosis: "Endometriosi", cie10Code: "N80.9", category: "Ginecologia", minDays: 3, maxDays: 30, averageDays: 14, notes: "Molt variable. Valorar gravetat i resposta al tractament.", source: "INSS 2023" },
  { diagnosis: "Quist ovàric complicat", cie10Code: "N83.2", category: "Ginecologia", minDays: 14, maxDays: 45, averageDays: 21, notes: "Post-cirurgia laparoscòpica.", source: "INSS 2023" },
  { diagnosis: "Histerectomia (extirpació d'úter)", cie10Code: "Z90.7", category: "Ginecologia", minDays: 21, maxDays: 60, averageDays: 45, notes: "Laparoscòpia: 21-30 dies. Laparotomia: 45-60 dies.", source: "INSS 2023" },
  { diagnosis: "Risc durant l'embaràs (gestació de risc)", cie10Code: "O26.9", category: "Ginecologia", minDays: 7, maxDays: 270, averageDays: 60, notes: "Fins al part. Depèn del motiu del risc.", source: "INSS 2023" },
  { diagnosis: "Interrupció voluntària de l'embaràs (IVE)", cie10Code: "O04.9", category: "Ginecologia", minDays: 3, maxDays: 14, averageDays: 7, notes: "Farmacològica: 3-7 dies. Quirúrgica: 7-14 dies.", source: "INSS 2023" },

  // ===== INFECCIONS =====
  { diagnosis: "Grip (influença)", cie10Code: "J11.1", category: "Infeccions", minDays: 5, maxDays: 14, averageDays: 7, notes: "Tractament simptomàtic. Valorar complicacions.", source: "INSS 2023" },
  { diagnosis: "COVID-19 (sense pneumònia)", cie10Code: "U07.1", category: "Infeccions", minDays: 7, maxDays: 21, averageDays: 10, notes: "Aïllament i tractament simptomàtic.", source: "INSS 2023" },
  { diagnosis: "Mononucleosi infecciosa", cie10Code: "B27.9", category: "Infeccions", minDays: 14, maxDays: 45, averageDays: 21, notes: "Repòs. Valorar esplenomegàlia.", source: "INSS 2023" },
  { diagnosis: "Herpes zòster (zona)", cie10Code: "B02.9", category: "Infeccions", minDays: 14, maxDays: 45, averageDays: 21, notes: "Tractament antiviral. Valorar neuràlgia postherpètica.", source: "INSS 2023" },
  { diagnosis: "Cel·lulitis / Erisipela", cie10Code: "L03.9", category: "Infeccions", minDays: 7, maxDays: 21, averageDays: 14, notes: "Tractament antibiótic. Valorar gravetat.", source: "INSS 2023" },
  { diagnosis: "Sepsi (sense xoc sèptic)", cie10Code: "A41.9", category: "Infeccions", minDays: 21, maxDays: 90, averageDays: 45, notes: "Hospitalització. Depèn del focus i gravetat.", source: "INSS 2023" },

  // ===== ONCOLOGIA =====
  { diagnosis: "Neoplàsia maligna en tractament (quimioteràpia)", cie10Code: "Z51.1", category: "Oncologia", minDays: 30, maxDays: 365, averageDays: 180, notes: "Molt variable. Depèn del tipus de càncer i protocol de tractament.", source: "INSS 2023" },
  { diagnosis: "Neoplàsia maligna en tractament (radioteràpia)", cie10Code: "Z51.0", category: "Oncologia", minDays: 30, maxDays: 180, averageDays: 90, notes: "Depèn de la localització i protocol.", source: "INSS 2023" },
  { diagnosis: "Post-cirurgia oncològica", cie10Code: "Z85.9", category: "Oncologia", minDays: 30, maxDays: 180, averageDays: 90, notes: "Depèn del tipus de cirurgia i recuperació.", source: "INSS 2023" },

  // ===== DERMATOLOGIA =====
  { diagnosis: "Psoriasi en placa (brot greu)", cie10Code: "L40.0", category: "Dermatologia", minDays: 14, maxDays: 60, averageDays: 30, notes: "Valorar extensió i resposta al tractament.", source: "INSS 2023" },
  { diagnosis: "Dermatitis atòpica greu", cie10Code: "L20.9", category: "Dermatologia", minDays: 14, maxDays: 60, averageDays: 30, notes: "Valorar extensió i resposta al tractament.", source: "INSS 2023" },
  { diagnosis: "Quemadura de 2n grau extensa", cie10Code: "T30.2", category: "Dermatologia", minDays: 21, maxDays: 90, averageDays: 45, notes: "Depèn de l'extensió (SCQ) i localització.", source: "INSS 2023" },

  // ===== TRAUMATOLOGIA =====
  { diagnosis: "Fractura de clavícula", cie10Code: "S42.0", category: "Traumatologia", minDays: 30, maxDays: 90, averageDays: 45, notes: "Tractament conservador. Feines manuals: fins a 90 dies.", source: "INSS 2023" },
  { diagnosis: "Fractura de costella (una o dues)", cie10Code: "S22.3", category: "Traumatologia", minDays: 21, maxDays: 60, averageDays: 30, notes: "Tractament del dolor. Feines físiques: fins a 60 dies.", source: "INSS 2023" },
  { diagnosis: "Fractura de fèmur (coll femoral)", cie10Code: "S72.0", category: "Traumatologia", minDays: 60, maxDays: 180, averageDays: 90, notes: "Post-cirurgia. Rehabilitació llarga.", source: "INSS 2023" },
  { diagnosis: "Fractura de rótula", cie10Code: "S82.0", category: "Traumatologia", minDays: 45, maxDays: 120, averageDays: 75, notes: "Depèn del tractament (conservador vs. quirúrgic).", source: "INSS 2023" },
  { diagnosis: "Ruptura del lligament creuat anterior (LCA)", cie10Code: "S83.5", category: "Traumatologia", minDays: 90, maxDays: 270, averageDays: 180, notes: "Post-cirurgia. Rehabilitació de 6-9 mesos.", source: "INSS 2023" },
  { diagnosis: "Ruptura del tendó d'Aquil·les", cie10Code: "S86.0", category: "Traumatologia", minDays: 60, maxDays: 180, averageDays: 120, notes: "Post-cirurgia o tractament conservador.", source: "INSS 2023" },
  { diagnosis: "Contusió greu (sense fractura)", cie10Code: "T14.0", category: "Traumatologia", minDays: 7, maxDays: 30, averageDays: 14, notes: "Depèn de la localització i gravetat.", source: "INSS 2023" },
];

async function main() {
  const connection = await createConnection(DATABASE_URL);
  console.log("Connectat a la base de dades");

  let inserted = 0;
  let errors = 0;

  for (const d of diagnoses) {
    try {
      await connection.execute(
        `INSERT INTO it_durations (diagnosis, cie10Code, category, minDays, maxDays, averageDays, notes, source)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [d.diagnosis, d.cie10Code, d.category, d.minDays, d.maxDays, d.averageDays, d.notes, d.source]
      );
      inserted++;
    } catch (err) {
      console.error(`Error inserint "${d.diagnosis}":`, err.message);
      errors++;
    }
  }

  console.log(`\nResultat: ${inserted} diagnòstics inserits, ${errors} errors`);
  await connection.end();
}

main().catch(console.error);
