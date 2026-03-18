/**
 * Script per corregir les durades d'IT basant-se en el Manual de Tiempos Óptimos de l'INSS (4a edició)
 * i afegir factors de correcció per grup d'ocupació (CNO-11) a les patologies més prevalents.
 *
 * Fonts:
 * - Manual de Tiempos Óptimos de IT, INSS 4a Edició (Castellano v4.0)
 * - Taules de Durades Estàndard per codi CIE-10
 * - Taula 15: Factors de correcció per capítols i ocupació
 *
 * Grups d'ocupació CNO-11 (17 grups EPA/INE):
 * G1:  Directors i gerents (CNO 11-15)
 * G2:  Tècnics professionals científics salut/ensenyament (CNO 21-23)
 * G3:  Altres tècnics professionals científics (CNO 24-29)
 * G4:  Tècnics i professionals de suport (CNO 31-38)
 * G5:  Empleats d'oficina sense atenció al públic (CNO 41-43)
 * G6:  Empleats d'oficina amb atenció al públic (CNO 44-45)
 * G7:  Treballadors serveis restauració i comerç (CNO 50-55)
 * G8:  Treballadors serveis salut i cura de persones (CNO 56-58)
 * G9:  Treballadors serveis protecció i seguretat (CNO 59)
 * G10: Treballadors qualificats sector agrícola/forestal (CNO 61-64)
 * G11: Treballadors qualificats construcció (CNO 71-72)
 * G12: Treballadors qualificats indústries manufactureres (CNO 73-78)
 * G13: Operadors instal·lacions i maquinària fixes (CNO 81-82)
 * G14: Conductors i operadors maquinària mòbil (CNO 83-84)
 * G15: Treballadors no qualificats serveis (CNO 91-94)
 * G16: Peons agricultura, pesca, construcció, indústria (CNO 95-98)
 * G17: Ocupacions militars (CNO 00)
 */

import mysql from 'mysql2/promise';

const conn = await mysql.createConnection(process.env.DATABASE_URL);

// ─────────────────────────────────────────────────────────────────────────────
// FACTORS DE CORRECCIÓ PER CAPÍTOL CIE-10 I GRUP D'OCUPACIÓ (Taula 15 INSS)
// Ordre: G1, G2, G3, G4, G5, G6, G7, G8, G9, G10, G11, G12, G13, G14, G15, G16, G17
// ─────────────────────────────────────────────────────────────────────────────
const OCCUPATION_FACTORS_BY_CHAPTER = {
  // Cap.1: Malalties infeccioses i parasitàries
  "infeccions": [1.02, 0.75, 1.09, 1.02, 0.97, 0.89, 1.06, 0.81, 1.02, 1.11, 1.29, 1.16, 1.03, 1.21, 0.91, 1.13, 0.41],
  // Cap.2: Neoplàsies
  "neoplasies": [1.02, 0.94, 1.02, 1.02, 0.99, 1.01, 1.03, 1.01, 1.02, 0.97, 0.99, 1.02, 1.04, 1.02, 0.99, 0.98, 0.79],
  // Cap.5: Trastorns mentals i del comportament
  "salut_mental": [1.11, 0.77, 0.99, 1.03, 0.96, 0.98, 1.08, 0.91, 1.11, 1.07, 1.13, 1.08, 1.00, 1.15, 0.98, 1.06, 0.54],
  // Cap.6: Malalties del sistema nerviós
  "sistema_nervios": [1.03, 0.83, 1.06, 1.04, 0.97, 1.02, 1.07, 0.94, 1.07, 0.96, 1.08, 1.06, 1.03, 1.09, 0.94, 0.99, 0.59],
  // Cap.9: Malalties del sistema circulatori
  "cardiovascular": [1.07, 0.74, 1.02, 1.09, 0.86, 0.87, 1.10, 0.98, 1.39, 1.05, 1.24, 1.29, 1.04, 1.13, 0.90, 1.03, 1.11],
  // Cap.13: Malalties de l'aparell musculoesquelètic
  "musculoesqueletic": [1.00, 0.70, 0.89, 1.00, 0.87, 0.89, 1.07, 0.92, 1.03, 1.03, 1.13, 1.11, 1.04, 1.12, 0.98, 1.00, 0.46],
  // Cap.12: Malalties de la pell
  "pell": [1.04, 0.81, 1.07, 1.03, 0.90, 0.95, 1.12, 0.90, 0.94, 0.95, 1.11, 1.07, 1.03, 1.09, 0.95, 0.97, 0.60],
  // Cap.14: Malalties de l'aparell genitourinari
  "genitourinari": [1.19, 0.73, 1.01, 1.06, 0.88, 0.94, 1.13, 0.90, 1.07, 1.12, 1.21, 1.13, 1.09, 1.23, 0.90, 1.09, 0.65],
  // Cap.11: Malalties del sistema digestiu (aproximació similar a genitourinari)
  "digestiu": [1.09, 0.73, 1.08, 1.06, 0.93, 0.97, 1.09, 0.92, 1.07, 1.04, 1.13, 1.08, 1.06, 1.13, 0.89, 1.01, 0.56],
  // Cap.10: Malalties del sistema respiratori (aproximació)
  "respiratori": [1.02, 0.75, 1.09, 1.02, 0.97, 0.89, 1.06, 0.81, 1.02, 1.11, 1.29, 1.16, 1.03, 1.21, 0.91, 1.13, 0.41],
};

const OCCUPATION_GROUPS = [
  { id: "G1",  label: "Directors i gerents", cnoCodes: "11-15" },
  { id: "G2",  label: "Tècnics professionals científics (salut/ensenyament)", cnoCodes: "21-23" },
  { id: "G3",  label: "Altres tècnics professionals científics", cnoCodes: "24-29" },
  { id: "G4",  label: "Tècnics i professionals de suport", cnoCodes: "31-38" },
  { id: "G5",  label: "Empleats d'oficina (sense atenció al públic)", cnoCodes: "41-43" },
  { id: "G6",  label: "Empleats d'oficina (amb atenció al públic)", cnoCodes: "44-45" },
  { id: "G7",  label: "Treballadors serveis restauració i comerç", cnoCodes: "50-55" },
  { id: "G8",  label: "Treballadors serveis salut i cura de persones", cnoCodes: "56-58" },
  { id: "G9",  label: "Treballadors serveis protecció i seguretat", cnoCodes: "59" },
  { id: "G10", label: "Treballadors qualificats sector agrícola/forestal", cnoCodes: "61-64" },
  { id: "G11", label: "Treballadors qualificats de la construcció", cnoCodes: "71-72" },
  { id: "G12", label: "Treballadors qualificats indústries manufactureres", cnoCodes: "73-78" },
  { id: "G13", label: "Operadors instal·lacions i maquinària fixes", cnoCodes: "81-82" },
  { id: "G14", label: "Conductors i operadors maquinària mòbil", cnoCodes: "83-84" },
  { id: "G15", label: "Treballadors no qualificats en serveis", cnoCodes: "91-94" },
  { id: "G16", label: "Peons agricultura, pesca, construcció, indústria", cnoCodes: "95-98" },
  { id: "G17", label: "Ocupacions militars", cnoCodes: "00" },
];

function buildOccupationAdjustment(chapterKey) {
  const factors = OCCUPATION_FACTORS_BY_CHAPTER[chapterKey];
  if (!factors) return null;
  return OCCUPATION_GROUPS.map((g, i) => ({
    type: g.label,
    cnoGroup: g.id,
    cnoCodes: g.cnoCodes,
    factor: factors[i]
  }));
}

// ─────────────────────────────────────────────────────────────────────────────
// DADES CORREGIDES BASADES EN EL MANUAL INSS 4a EDICIÓ
// Camps: diagnosis, cie10Code, category, minDays, averageDays, maxDays,
//        standardTime (TE del manual), occupationChapter, notes
// ─────────────────────────────────────────────────────────────────────────────
const correctedDiagnoses = [
  // ── APARELL LOCOMOTOR ──────────────────────────────────────────────────────
  {
    diagnosis: "Lumbalgia inespecífica (dolor lumbar baix)",
    cie10Code: "M54.5",
    category: "Aparell locomotor",
    minDays: 7, averageDays: 20, maxDays: 45,
    standardTime: 20,
    occupationChapter: "musculoesqueletic",
    notes: "TE INSS: 20 dies. Augmenta significativament en treballs físics (G11 ×1,13, G12 ×1,11, G14 ×1,12). Redueix en professionals sanitaris (G2 ×0,70) i tècnics (G3 ×0,89)."
  },
  {
    diagnosis: "Lumbàlgia amb ciàtica",
    cie10Code: "M54.4",
    category: "Aparell locomotor",
    minDays: 14, averageDays: 30, maxDays: 60,
    standardTime: 30,
    occupationChapter: "musculoesqueletic",
    notes: "TE INSS: 30 dies. Ciàtica simple (M54.3): 30 dies. Amb trastorn discal associat (M51): factor comorbilitat 1,22."
  },
  {
    diagnosis: "Hèrnia discal lumbar amb radiculopatia",
    cie10Code: "M51.16",
    category: "Aparell locomotor",
    minDays: 30, averageDays: 60, maxDays: 120,
    standardTime: 60,
    occupationChapter: "musculoesqueletic",
    notes: "TE INSS: 60 dies (desplaçament disc lumbar). Sense cirurgia. Amb cirurgia (procediment): 60-90 dies addicionals. Treballs físics: fins a 90 dies (G11 ×1,13)."
  },
  {
    diagnosis: "Hèrnia discal cervical amb radiculopatia",
    cie10Code: "M50.12",
    category: "Aparell locomotor",
    minDays: 20, averageDays: 60, maxDays: 90,
    standardTime: 60,
    occupationChapter: "musculoesqueletic",
    notes: "TE INSS: 60 dies. Trastorn disc cervical amb radiculopatia (M50.1)."
  },
  {
    diagnosis: "Cervicàlgia / Síndrome cervicobraquial",
    cie10Code: "M54.2",
    category: "Aparell locomotor",
    minDays: 7, averageDays: 20, maxDays: 45,
    standardTime: 20,
    occupationChapter: "musculoesqueletic",
    notes: "TE INSS: 20 dies (M53.1 síndrome cervicobraquial). Dorsàlgia inespecífica (M54.9): 20 dies."
  },
  {
    diagnosis: "Esguinç de turmell",
    cie10Code: "S93.4",
    category: "Aparell locomotor",
    minDays: 7, averageDays: 21, maxDays: 45,
    standardTime: 21,
    occupationChapter: "musculoesqueletic",
    notes: "TE INSS: 21 dies. Un dels 30 diagnòstics més freqüents (33.759 processos/any). Treballs físics i construcció: fins a 30 dies."
  },
  {
    diagnosis: "Síndrome del túnel carpià",
    cie10Code: "G56.00",
    category: "Aparell locomotor",
    minDays: 14, averageDays: 30, maxDays: 60,
    standardTime: 30,
    occupationChapter: "sistema_nervios",
    notes: "TE INSS: 30 dies (conservador). Amb cirurgia: 30-45 dies addicionals. Freqüent en treballs manuals repetitius (G12, G13)."
  },
  {
    diagnosis: "Artrosi de genoll (gonartrosi)",
    cie10Code: "M17.1",
    category: "Aparell locomotor",
    minDays: 14, averageDays: 30, maxDays: 90,
    standardTime: 30,
    occupationChapter: "musculoesqueletic",
    notes: "TE INSS: 30 dies (conservador). Amb artroplàstia total de genoll (procediment): 90 dies. Treballs físics: factor fins a ×1,13."
  },
  {
    diagnosis: "Artrosi de maluc (coxartrosi)",
    cie10Code: "M16.1",
    category: "Aparell locomotor",
    minDays: 14, averageDays: 30, maxDays: 90,
    standardTime: 30,
    occupationChapter: "musculoesqueletic",
    notes: "TE INSS: 30 dies (conservador). Amb pròtesi total de maluc: 90 dies. Treballs físics: factor fins a ×1,13."
  },
  {
    diagnosis: "Fractura de cúbit i radi (avantbraç)",
    cie10Code: "S52",
    category: "Aparell locomotor",
    minDays: 30, averageDays: 60, maxDays: 90,
    standardTime: 60,
    occupationChapter: "musculoesqueletic",
    notes: "TE INSS: 60 dies. Treballs físics (G11, G12, G14): fins a 90 dies. Treballs sedentaris (G5, G6): 45 dies."
  },
  {
    diagnosis: "Fractura de vèrtebra lumbar",
    cie10Code: "S32.0",
    category: "Aparell locomotor",
    minDays: 60, averageDays: 90, maxDays: 180,
    standardTime: 90,
    occupationChapter: "musculoesqueletic",
    notes: "TE INSS: 90 dies. Sense complicació neurològica. Amb complicació: fins a 180 dies o més."
  },
  {
    diagnosis: "Fractura de maluc (coll fèmur)",
    cie10Code: "S72.0",
    category: "Aparell locomotor",
    minDays: 60, averageDays: 120, maxDays: 180,
    standardTime: 120,
    occupationChapter: "musculoesqueletic",
    notes: "TE INSS: 120 dies. Amb osteosíntesi o pròtesi. Treballs físics: fins a 150-180 dies."
  },
  {
    diagnosis: "Tendinitis / Tenosinovitis de De Quervain",
    cie10Code: "M65.4",
    category: "Aparell locomotor",
    minDays: 7, averageDays: 20, maxDays: 45,
    standardTime: 20,
    occupationChapter: "musculoesqueletic",
    notes: "TE INSS: 20 dies. Sinovitis i tenosinovitis (M65.9): 20 dies. Freqüent en treballs manuals."
  },
  {
    diagnosis: "Epicondilitis lateral (colze de tennista)",
    cie10Code: "M77.1",
    category: "Aparell locomotor",
    minDays: 14, averageDays: 30, maxDays: 60,
    standardTime: 30,
    occupationChapter: "musculoesqueletic",
    notes: "TE INSS: 30 dies. Entesopaties (M77): 30 dies. Freqüent en treballs manuals repetitius."
  },
  {
    diagnosis: "Lesió de menisc de genoll",
    cie10Code: "M23.2",
    category: "Aparell locomotor",
    minDays: 14, averageDays: 45, maxDays: 90,
    standardTime: 45,
    occupationChapter: "musculoesqueletic",
    notes: "TE INSS: 45 dies (amb meniscectomia artroscòpica). Sense cirurgia: 30 dies. Treballs físics: fins a 60 dies."
  },
  {
    diagnosis: "Patologia de manegot dels rotadors (espatlla)",
    cie10Code: "M75.1",
    category: "Aparell locomotor",
    minDays: 14, averageDays: 30, maxDays: 90,
    standardTime: 30,
    occupationChapter: "musculoesqueletic",
    notes: "TE INSS: 30 dies (conservador). Amb cirurgia (reparació manegot): 90 dies. Freqüent en treballs per sobre del cap."
  },
  {
    diagnosis: "Fibromialgia",
    cie10Code: "M79.7",
    category: "Aparell locomotor",
    minDays: 14, averageDays: 30, maxDays: 90,
    standardTime: 30,
    occupationChapter: "musculoesqueletic",
    notes: "TE INSS: 30 dies (M79 reumatisme no especificat). Processos recurrents. Treballs físics: factor fins a ×1,13."
  },

  // ── SALUT MENTAL ──────────────────────────────────────────────────────────
  {
    diagnosis: "Trastorn d'ansietat generalitzada",
    cie10Code: "F41.1",
    category: "Salut mental",
    minDays: 21, averageDays: 45, maxDays: 90,
    standardTime: 45,
    occupationChapter: "salut_mental",
    notes: "TE INSS: 45 dies. Un dels 30 diagnòstics més freqüents (61.013 processos/any). Directors i gerents: ×1,11. Professionals salut: ×0,91. Conductors: ×1,15."
  },
  {
    diagnosis: "Episodi depressiu moderat",
    cie10Code: "F32.1",
    category: "Salut mental",
    minDays: 30, averageDays: 60, maxDays: 120,
    standardTime: 60,
    occupationChapter: "salut_mental",
    notes: "TE INSS: 60 dies. Trastorn depressiu (F32): 60 dies. Distímia (F34.1): 45 dies. Un dels 30 diagnòstics més freqüents (27.450 processos/any)."
  },
  {
    diagnosis: "Episodi depressiu greu (amb o sense símptomes psicòtics)",
    cie10Code: "F32.2",
    category: "Salut mental",
    minDays: 60, averageDays: 90, maxDays: 180,
    standardTime: 90,
    occupationChapter: "salut_mental",
    notes: "TE INSS: 90 dies. Pot requerir hospitalització. Treballs d'alta exigència emocional (G7, G8): factor fins a ×1,08."
  },
  {
    diagnosis: "Trastorn adaptatiu (reacció a estrès greu)",
    cie10Code: "F43.2",
    category: "Salut mental",
    minDays: 14, averageDays: 30, maxDays: 60,
    standardTime: 30,
    occupationChapter: "salut_mental",
    notes: "TE INSS: 30 dies. Reacció a estrès agut (F43.0): 14 dies. Freqüent en professionals de serveis i salut."
  },
  {
    diagnosis: "Burnout / Síndrome d'esgotament professional",
    cie10Code: "Z73.0",
    category: "Salut mental",
    minDays: 30, averageDays: 60, maxDays: 120,
    standardTime: 60,
    occupationChapter: "salut_mental",
    notes: "TE INSS: 60 dies (codificat com trastorn adaptatiu F43.2 o trastorn depressiu F32). Molt freqüent en professionals sanitaris (G8) i educadors (G2)."
  },
  {
    diagnosis: "Trastorn de pànic",
    cie10Code: "F41.0",
    category: "Salut mental",
    minDays: 14, averageDays: 30, maxDays: 60,
    standardTime: 30,
    occupationChapter: "salut_mental",
    notes: "TE INSS: 30 dies. Trastorns d'ansietat (F41): 30-45 dies."
  },
  {
    diagnosis: "Trastorn per estrès posttraumàtic (TEPT)",
    cie10Code: "F43.1",
    category: "Salut mental",
    minDays: 30, averageDays: 90, maxDays: 180,
    standardTime: 90,
    occupationChapter: "salut_mental",
    notes: "TE INSS: 90 dies. Freqüent en forces de seguretat (G9 ×1,11) i professionals d'emergències."
  },

  // ── SISTEMA RESPIRATORI ───────────────────────────────────────────────────
  {
    diagnosis: "Bronquitis aguda",
    cie10Code: "J20",
    category: "Sistema respiratori",
    minDays: 7, averageDays: 14, maxDays: 21,
    standardTime: 14,
    occupationChapter: "respiratori",
    notes: "TE INSS: 14 dies. Un dels 30 diagnòstics més freqüents (39.667 processos/any). Faringitis aguda (J02): 7 dies. Amigdalitis aguda (J03): 7 dies."
  },
  {
    diagnosis: "Pneumònia (sense complicacions)",
    cie10Code: "J18.9",
    category: "Sistema respiratori",
    minDays: 14, averageDays: 30, maxDays: 60,
    standardTime: 30,
    occupationChapter: "respiratori",
    notes: "TE INSS: 30 dies. Pneumònia bacteriana: 30-45 dies. Pneumònia vírica: 21-30 dies. Treballs físics: fins a 45 dies."
  },
  {
    diagnosis: "Grip (influença) amb complicacions respiratòries",
    cie10Code: "J11.1",
    category: "Sistema respiratori",
    minDays: 7, averageDays: 14, maxDays: 21,
    standardTime: 14,
    occupationChapter: "respiratori",
    notes: "TE INSS: 14 dies. Un dels 30 diagnòstics més freqüents (51.670 processos/any). Grip sense complicacions: 7 dies."
  },
  {
    diagnosis: "MPOC (malaltia pulmonar obstructiva crònica) en agudització",
    cie10Code: "J44.1",
    category: "Sistema respiratori",
    minDays: 14, averageDays: 30, maxDays: 60,
    standardTime: 30,
    occupationChapter: "respiratori",
    notes: "TE INSS: 30 dies. Agudització moderada-greu. Treballs físics: fins a 45-60 dies. Treballadors exposats a pols i fums: factor ×1,29 (G11)."
  },
  {
    diagnosis: "Asma bronquial en agudització",
    cie10Code: "J45.9",
    category: "Sistema respiratori",
    minDays: 7, averageDays: 14, maxDays: 30,
    standardTime: 14,
    occupationChapter: "respiratori",
    notes: "TE INSS: 14 dies. Agudització moderada. Asma greu: fins a 30 dies. Treballadors exposats a al·lèrgens ocupacionals: factor ×1,29 (G11)."
  },

  // ── SISTEMA CARDIOVASCULAR ────────────────────────────────────────────────
  {
    diagnosis: "Infart agut de miocardi (IAM)",
    cie10Code: "I21",
    category: "Sistema cardiovascular",
    minDays: 60, averageDays: 90, maxDays: 120,
    standardTime: 90,
    occupationChapter: "cardiovascular",
    notes: "TE INSS: 90 dies. Treballs físics (G11 ×1,24, G14 ×1,13): fins a 120 dies. Professionals sanitaris (G8 ×0,98): 88 dies. Conductors (G14): requereix valoració específica per aptitud."
  },
  {
    diagnosis: "Angina de pit inestable",
    cie10Code: "I20.0",
    category: "Sistema cardiovascular",
    minDays: 21, averageDays: 45, maxDays: 90,
    standardTime: 45,
    occupationChapter: "cardiovascular",
    notes: "TE INSS: 45 dies. Treballs físics: fins a 60-90 dies. Conductors (G14 ×1,13): valoració d'aptitud obligatòria."
  },
  {
    diagnosis: "Accident vascular cerebral (AVC) isquèmic",
    cie10Code: "I63",
    category: "Sistema cardiovascular",
    minDays: 60, averageDays: 120, maxDays: 365,
    standardTime: 120,
    occupationChapter: "cardiovascular",
    notes: "TE INSS: 120 dies (sense seqüeles greus). Amb seqüeles neurològiques: pot arribar a IP. Treballs físics: fins a 180 dies."
  },
  {
    diagnosis: "Insuficiència cardíaca descompensada",
    cie10Code: "I50",
    category: "Sistema cardiovascular",
    minDays: 30, averageDays: 60, maxDays: 120,
    standardTime: 60,
    occupationChapter: "cardiovascular",
    notes: "TE INSS: 60 dies. Treballs físics (G11 ×1,24): fins a 90 dies. Conductors (G14 ×1,13): valoració d'aptitud."
  },
  {
    diagnosis: "Trombosi venosa profunda (TVP)",
    cie10Code: "I80.2",
    category: "Sistema cardiovascular",
    minDays: 21, averageDays: 45, maxDays: 90,
    standardTime: 45,
    occupationChapter: "cardiovascular",
    notes: "TE INSS: 45 dies. Amb tractament anticoagulant. Treballs que requereixen bipedestació prolongada: fins a 60-90 dies."
  },

  // ── SISTEMA DIGESTIU ──────────────────────────────────────────────────────
  {
    diagnosis: "Gastroenteritis aguda infecciosa",
    cie10Code: "A09",
    category: "Sistema digestiu",
    minDays: 3, averageDays: 7, maxDays: 14,
    standardTime: 4,
    occupationChapter: "infeccions",
    notes: "TE INSS: 4 dies. Un dels 30 diagnòstics més freqüents (71.561 processos/any). Manipuladors d'aliments: fins a 7 dies per criteris sanitaris."
  },
  {
    diagnosis: "Hèrnia inguinal (amb cirurgia)",
    cie10Code: "K40.9",
    category: "Sistema digestiu",
    minDays: 14, averageDays: 30, maxDays: 60,
    standardTime: 30,
    occupationChapter: "digestiu",
    notes: "TE INSS: 30 dies (post-herniorràfia). Treballs físics (G11 ×1,13, G12 ×1,08): fins a 45-60 dies. Treballs sedentaris (G5 ×0,93): 28 dies."
  },
  {
    diagnosis: "Còlic renal (nefrolitiasi)",
    cie10Code: "N20",
    category: "Sistema digestiu",
    minDays: 3, averageDays: 14, maxDays: 30,
    standardTime: 14,
    occupationChapter: "genitourinari",
    notes: "TE INSS: 14 dies. Un dels 30 diagnòstics més freqüents (31.861 processos/any). Amb litotrípsia: 14-21 dies."
  },
  {
    diagnosis: "Colecistitis aguda / Colecistectomia laparoscòpica",
    cie10Code: "K81.0",
    category: "Sistema digestiu",
    minDays: 14, averageDays: 21, maxDays: 45,
    standardTime: 21,
    occupationChapter: "digestiu",
    notes: "TE INSS: 21 dies (laparoscòpica). Cirurgia oberta: 30-45 dies. Treballs físics: fins a 45 dies."
  },

  // ── NEOPLÀSIES ────────────────────────────────────────────────────────────
  {
    diagnosis: "Neoplàsia maligna de mama",
    cie10Code: "C50",
    category: "Neoplàsies",
    minDays: 90, averageDays: 210, maxDays: 365,
    standardTime: 210,
    occupationChapter: "neoplasies",
    notes: "TE INSS: 210 dies. Inclou cirurgia (mastectomia/tumorectomia), quimioteràpia i/o radioteràpia. Factors de correcció per ocupació molt similars entre grups (0,94-1,04). Pot requerir pròrroga fins a 545 dies."
  },
  {
    diagnosis: "Neoplàsia maligna de còlon i recte",
    cie10Code: "C18",
    category: "Neoplàsies",
    minDays: 90, averageDays: 210, maxDays: 365,
    standardTime: 210,
    occupationChapter: "neoplasies",
    notes: "TE INSS: 210 dies. Inclou cirurgia, quimioteràpia i/o radioteràpia. Pot requerir pròrroga fins a 545 dies."
  },
  {
    diagnosis: "Neoplàsia maligna de pulmó",
    cie10Code: "C34",
    category: "Neoplàsies",
    minDays: 90, averageDays: 210, maxDays: 365,
    standardTime: 210,
    occupationChapter: "neoplasies",
    notes: "TE INSS: 210 dies. Inclou cirurgia (lobectomia/pneumonectomia), quimioteràpia i/o radioteràpia. Treballadors exposats a amiant (G11, G12): risc professional."
  },
  {
    diagnosis: "Neoplàsia maligna de pròstata",
    cie10Code: "C61",
    category: "Neoplàsies",
    minDays: 60, averageDays: 120, maxDays: 210,
    standardTime: 120,
    occupationChapter: "neoplasies",
    notes: "TE INSS: 120 dies. Prostatectomia radical: 90-120 dies. Radioteràpia: 60-90 dies. Vigilant activa: 30-60 dies."
  },
  {
    diagnosis: "Neoplàsia maligna de cèrvix uterí",
    cie10Code: "C53",
    category: "Neoplàsies",
    minDays: 30, averageDays: 90, maxDays: 210,
    standardTime: 90,
    occupationChapter: "neoplasies",
    notes: "TE INSS: 90 dies (estadi precoç). Histerectomia: 90 dies. Amb radioteràpia/quimioteràpia: 210 dies."
  },
  {
    diagnosis: "Neoplàsia maligna de cos d'úter (endometri)",
    cie10Code: "C54",
    category: "Neoplàsies",
    minDays: 60, averageDays: 120, maxDays: 210,
    standardTime: 120,
    occupationChapter: "neoplasies",
    notes: "TE INSS: 120 dies. Histerectomia laparoscòpica: 90 dies. Amb tractament adjuvant: 210 dies."
  },
  {
    diagnosis: "Neoplàsia maligna d'ovari",
    cie10Code: "C56",
    category: "Neoplàsies",
    minDays: 90, averageDays: 180, maxDays: 365,
    standardTime: 180,
    occupationChapter: "neoplasies",
    notes: "TE INSS: 180 dies. Cirurgia + quimioteràpia. Pot requerir pròrroga fins a 545 dies."
  },
  {
    diagnosis: "Linfoma de Hodgkin",
    cie10Code: "C81",
    category: "Neoplàsies",
    minDays: 90, averageDays: 180, maxDays: 365,
    standardTime: 180,
    occupationChapter: "neoplasies",
    notes: "TE INSS: 180 dies. Quimioteràpia ABVD: 6 cicles (6 mesos). Pot requerir pròrroga fins a 545 dies."
  },
  {
    diagnosis: "Leucèmia limfoblàstica aguda (LLA)",
    cie10Code: "C91.0",
    category: "Neoplàsies",
    minDays: 180, averageDays: 365, maxDays: 545,
    standardTime: 180,
    occupationChapter: "neoplasies",
    notes: "TE INSS: 180 dies. Tractament d'inducció + consolidació: 6-24 mesos. Pràcticament sempre requereix pròrroga fins a 545 dies i valoració d'IP."
  },
  {
    diagnosis: "Mieloma múltiple",
    cie10Code: "C90",
    category: "Neoplàsies",
    minDays: 180, averageDays: 365, maxDays: 545,
    standardTime: 180,
    occupationChapter: "neoplasies",
    notes: "TE INSS: 180 dies. Tractament amb bortezomib/lenalidomida ± trasplantament. Pràcticament sempre requereix pròrroga fins a 545 dies."
  },
  {
    diagnosis: "Neoplàsia maligna de laringe / orofaringe",
    cie10Code: "C32",
    category: "Neoplàsies",
    minDays: 90, averageDays: 180, maxDays: 365,
    standardTime: 180,
    occupationChapter: "neoplasies",
    notes: "TE INSS: 180 dies. Cirurgia ± radioteràpia/quimioteràpia. Pot requerir pròrroga fins a 545 dies."
  },
  {
    diagnosis: "Neoplàsia maligna de pell (melanoma maligne)",
    cie10Code: "C43",
    category: "Neoplàsies",
    minDays: 14, averageDays: 90, maxDays: 180,
    standardTime: 90,
    occupationChapter: "neoplasies",
    notes: "TE INSS: 90 dies. Estadi I-II: 30-60 dies (cirurgia local). Estadi III-IV amb immunoteràpia: 180 dies o més."
  },
  {
    diagnosis: "Carcinoma basocel·lular de pell",
    cie10Code: "C44.91",
    category: "Neoplàsies",
    minDays: 7, averageDays: 20, maxDays: 30,
    standardTime: 20,
    occupationChapter: "neoplasies",
    notes: "TE INSS: 20 dies. Cirurgia ambulatòria. Treballs a l'exterior (G10, G11): risc professional per exposició solar."
  },
  {
    diagnosis: "Neoplàsia maligna de tiroides",
    cie10Code: "C73",
    category: "Neoplàsies",
    minDays: 30, averageDays: 90, maxDays: 180,
    standardTime: 90,
    occupationChapter: "neoplasies",
    notes: "TE INSS: 90 dies. Tiroidectomia total + iode radioactiu. Tractament hormonal substitutiu posterior."
  },
  {
    diagnosis: "Neoplàsia maligna de bufeta urinària",
    cie10Code: "C67",
    category: "Neoplàsies",
    minDays: 14, averageDays: 60, maxDays: 180,
    standardTime: 60,
    occupationChapter: "neoplasies",
    notes: "TE INSS: 60 dies. RTU vesical (estadi Ta/T1): 30-60 dies. Cistectomia radical: 90-180 dies."
  },
  {
    diagnosis: "Neoplàsia maligna de ronyó",
    cie10Code: "C64",
    category: "Neoplàsies",
    minDays: 30, averageDays: 120, maxDays: 210,
    standardTime: 120,
    occupationChapter: "neoplasies",
    notes: "TE INSS: 120 dies. Nefrectomia laparoscòpica: 60-90 dies. Amb tractament sistèmic: 210 dies."
  },

  // ── SISTEMA NERVIÓS ───────────────────────────────────────────────────────
  {
    diagnosis: "Migranya (cefalea migranyosa)",
    cie10Code: "G43",
    category: "Sistema nerviós",
    minDays: 3, averageDays: 7, maxDays: 14,
    standardTime: 7,
    occupationChapter: "sistema_nervios",
    notes: "TE INSS: 7 dies per episodi. Migranya crònica amb incapacitat: 30 dies. Professionals sanitaris (G2 ×0,83): 5,8 dies."
  },
  {
    diagnosis: "Vèrtigen posicional paroxístic benigne (VPPB)",
    cie10Code: "H81.1",
    category: "Sistema nerviós",
    minDays: 7, averageDays: 14, maxDays: 30,
    standardTime: 14,
    occupationChapter: "sistema_nervios",
    notes: "TE INSS: 14 dies. Un dels 30 diagnòstics més freqüents (39.678 processos/any). Conductors (G14): valoració d'aptitud."
  },
  {
    diagnosis: "Paràlisi facial perifèrica (Bell)",
    cie10Code: "G51.0",
    category: "Sistema nerviós",
    minDays: 14, averageDays: 30, maxDays: 60,
    standardTime: 30,
    occupationChapter: "sistema_nervios",
    notes: "TE INSS: 30 dies. Recuperació completa en 2-3 mesos en la majoria de casos."
  },
  {
    diagnosis: "Esclerosi múltiple en brot",
    cie10Code: "G35",
    category: "Sistema nerviós",
    minDays: 30, averageDays: 60, maxDays: 180,
    standardTime: 60,
    occupationChapter: "sistema_nervios",
    notes: "TE INSS: 60 dies per brot. Brots greus: fins a 180 dies. Pot requerir valoració d'IP en formes progressives."
  },

  // ── MALALTIES INFECCIOSES ─────────────────────────────────────────────────
  {
    diagnosis: "COVID-19 (infecció per SARS-CoV-2)",
    cie10Code: "U07.1",
    category: "Malalties infeccioses",
    minDays: 7, averageDays: 21, maxDays: 60,
    standardTime: 21,
    occupationChapter: "infeccions",
    notes: "TE INSS: 21 dies (lleu-moderat). COVID llarg (post-COVID): fins a 90-180 dies. Professionals sanitaris (G8): risc professional, possible AT."
  },
  {
    diagnosis: "Mononucleosi infecciosa",
    cie10Code: "B27",
    category: "Malalties infeccioses",
    minDays: 14, averageDays: 30, maxDays: 60,
    standardTime: 30,
    occupationChapter: "infeccions",
    notes: "TE INSS: 30 dies. Treballs físics: fins a 45-60 dies (risc ruptura esplènica)."
  },
  {
    diagnosis: "Herpes zòster (sense complicacions)",
    cie10Code: "B02.9",
    category: "Malalties infeccioses",
    minDays: 14, averageDays: 21, maxDays: 45,
    standardTime: 21,
    occupationChapter: "infeccions",
    notes: "TE INSS: 21 dies. Neuràlgia postherpètica: fins a 90 dies. Professionals sanitaris: aïllament fins a cicatrització."
  },

  // ── MALALTIES ENDOCRINES ──────────────────────────────────────────────────
  {
    diagnosis: "Diabetis mellitus tipus 2 descompensada",
    cie10Code: "E11",
    category: "Malalties endocrines",
    minDays: 7, averageDays: 14, maxDays: 30,
    standardTime: 14,
    occupationChapter: "digestiu",
    notes: "TE INSS: 14 dies. Descompensació hiperglucèmica. Amb complicació aguda (cetoacidosi): 21-30 dies."
  },
  {
    diagnosis: "Hipotiroïdisme (descompensació)",
    cie10Code: "E03",
    category: "Malalties endocrines",
    minDays: 7, averageDays: 14, maxDays: 30,
    standardTime: 14,
    occupationChapter: "digestiu",
    notes: "TE INSS: 14 dies. Ajust de tractament hormonal."
  },

  // ── MALALTIES DE LA PELL ──────────────────────────────────────────────────
  {
    diagnosis: "Dermatitis de contacte al·lèrgica",
    cie10Code: "L23",
    category: "Malalties de la pell",
    minDays: 7, averageDays: 14, maxDays: 30,
    standardTime: 14,
    occupationChapter: "pell",
    notes: "TE INSS: 14 dies. Dermatitis de contacte irritativa (L24): 14 dies. Freqüent en professionals sanitaris (G8), perruquers (G7) i treballadors de la construcció (G11)."
  },
  {
    diagnosis: "Psoriasi en placa (agudització)",
    cie10Code: "L40.0",
    category: "Malalties de la pell",
    minDays: 14, averageDays: 30, maxDays: 60,
    standardTime: 30,
    occupationChapter: "pell",
    notes: "TE INSS: 30 dies. Psoriasi erítrodermica o pustulosa: fins a 90 dies."
  },

  // ── GINECOLOGIA I OBSTETRÍCIA ─────────────────────────────────────────────
  {
    diagnosis: "Dismenorrea incapacitant / Endometriosi",
    cie10Code: "N80",
    category: "Ginecologia",
    minDays: 1, averageDays: 3, maxDays: 7,
    standardTime: 3,
    occupationChapter: "genitourinari",
    notes: "TE INSS: 3 dies per episodi (dismenorrea). Endometriosi crònica incapacitant: 30-60 dies. Laparoscòpia diagnòstica/terapèutica: 14-21 dies."
  },
  {
    diagnosis: "Histerectomia (laparoscòpica o abdominal)",
    cie10Code: "Z90.71",
    category: "Ginecologia",
    minDays: 30, averageDays: 45, maxDays: 90,
    standardTime: 45,
    occupationChapter: "genitourinari",
    notes: "TE INSS: 45 dies (laparoscòpica). Histerectomia abdominal: 60-90 dies. Treballs físics: fins a 90 dies."
  },
  {
    diagnosis: "Amenaça de part prematur / Repòs per embaràs de risc",
    cie10Code: "O60",
    category: "Ginecologia",
    minDays: 14, averageDays: 30, maxDays: 90,
    standardTime: 30,
    occupationChapter: "genitourinari",
    notes: "TE INSS: 30 dies. Pot prolongar-se fins al part. Risc per al fetus: possible IT per risc durant l'embaràs (prestació específica)."
  },

  // ── CIRURGIA / PROCEDIMENTS ───────────────────────────────────────────────
  {
    diagnosis: "Apendicitis aguda (apendicectomia laparoscòpica)",
    cie10Code: "K35.8",
    category: "Sistema digestiu",
    minDays: 7, averageDays: 14, maxDays: 30,
    standardTime: 14,
    occupationChapter: "digestiu",
    notes: "TE INSS: 14 dies (laparoscòpica). Apendicectomia oberta: 21-30 dies. Treballs físics: fins a 30-45 dies."
  },
  {
    diagnosis: "Artroscòpia de genoll (meniscectomia)",
    cie10Code: "M23.2",
    category: "Aparell locomotor",
    minDays: 14, averageDays: 45, maxDays: 90,
    standardTime: 45,
    occupationChapter: "musculoesqueletic",
    notes: "TE INSS: 45 dies. Treballs físics (G11 ×1,13): fins a 60-90 dies. Treballs sedentaris (G5 ×0,87): 39 dies."
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// ACTUALITZAR LA BASE DE DADES
// ─────────────────────────────────────────────────────────────────────────────

console.log(`Actualitzant ${correctedDiagnoses.length} diagnòstics...`);

// Esborrar tots els registres existents i reinserir
await conn.execute('DELETE FROM it_durations');
console.log('Taula it_durations buidada.');

let inserted = 0;
for (const d of correctedDiagnoses) {
  const occupationAdj = buildOccupationAdjustment(d.occupationChapter);
  
  await conn.execute(
    `INSERT INTO it_durations 
     (diagnosis, cie10Code, category, minDays, averageDays, maxDays, occupationAdjustment, notes, source)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      d.diagnosis,
      d.cie10Code || null,
      d.category,
      d.minDays,
      d.averageDays,
      d.maxDays,
      JSON.stringify(occupationAdj),
      `TE INSS (4a ed.): ${d.standardTime} dies. ${d.notes}`,
      'Manual Tiempos Óptimos IT, INSS 4a Edició'
    ]
  );
  inserted++;
}

console.log(`✅ Inserits ${inserted} diagnòstics amb durades corregides i factors d'ocupació CNO-11.`);

// Verificació
const [rows] = await conn.execute('SELECT COUNT(*) as total FROM it_durations');
console.log(`Total registres a it_durations: ${rows[0].total}`);

await conn.end();
