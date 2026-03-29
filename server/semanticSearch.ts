/**
 * Cerca semàntica de diagnòstics per a la Calculadora d'IT
 * 
 * Estratègia en 3 nivells:
 * 1. Cerca LIKE directa (ja existent)
 * 2. Cerca per sinònims locals (diccionari mèdic CA/ES/llatí)
 * 3. Fallback LLM: el model interpreta el terme i retorna sinònims mèdics
 */

import { getDb } from "./db";
import { itDurations } from "../drizzle/schema";
import { like, or, sql } from "drizzle-orm";
import { invokeLLM } from "./_core/llm";

// ===== DICCIONARI DE SINÒNIMS MÈDICS (CA/ES/llatí/col·loquial) =====
const SYNONYM_MAP: Record<string, string[]> = {
  // Aparell locomotor
  "mal d'esquena": ["lumbalgia", "lumbàlgia", "cervicàlgia", "dorsàlgia", "hèrnia discal"],
  "dolor d'esquena": ["lumbalgia", "lumbàlgia", "cervicàlgia", "dorsàlgia"],
  "dolor lumbar": ["lumbalgia", "lumbàlgia", "ciàtica"],
  "dolor de coll": ["cervicàlgia", "cervical", "esguinç cervical"],
  "dolor de genoll": ["gonartrosi", "artrosi genoll", "menisc", "lligament"],
  "dolor d'espatlla": ["tendinitis", "manegot", "bursitis", "luxació"],
  "dolor de peu": ["fascitis plantar", "metatarsians", "esguinç turmell"],
  "dolor de mà": ["túnel carpià", "metacarpians"],
  "dolor de colze": ["epicondilitis"],
  "ciàtica": ["lumbàlgia amb ciàtica", "hèrnia discal lumbar", "radiculopatia"],
  "lumbago": ["lumbalgia", "lumbàlgia"],
  "tortícolis": ["cervicàlgia", "cervical"],
  "reuma": ["artritis reumatoide", "artrosi", "espondilitis"],
  "gota": ["artritis", "artrosi"],
  "ossos trencats": ["fractura"],
  "huesos rotos": ["fractura"],
  "rotura": ["fractura", "ruptura"],
  "esguince": ["esguinç"],
  "hernia": ["hèrnia"],
  "tendinitis": ["tendinitis", "manegot"],
  "artritis": ["artritis reumatoide"],
  "artrosis": ["artrosi"],
  
  // Salut mental
  "depressió": ["episodi depressiu", "depressió major", "trastorn adaptatiu"],
  "depresión": ["episodi depressiu", "depressió major", "trastorn adaptatiu"],
  "ansietat": ["trastorn ansietat", "trastorn pànic", "trastorn adaptatiu"],
  "ansiedad": ["trastorn ansietat", "trastorn pànic", "trastorn adaptatiu"],
  "estrès": ["burnout", "trastorn adaptatiu", "estrès posttraumàtic", "TEPT"],
  "estrés": ["burnout", "trastorn adaptatiu", "estrès posttraumàtic"],
  "burnout": ["burnout", "esgotament professional"],
  "pànic": ["trastorn pànic"],
  "pánico": ["trastorn pànic"],
  "insomni": ["ansietat", "depressió", "trastorn adaptatiu"],
  "insomnio": ["ansietat", "depressió", "trastorn adaptatiu"],
  "bipolar": ["trastorn bipolar"],
  "esquizofrenia": ["esquizofrènia", "psicosi"],
  "anorexia": ["trastorn conducta alimentària"],
  "bulimia": ["trastorn conducta alimentària"],
  "toc": ["trastorn obsessiu-compulsiu", "TOC"],
  
  // Sistema cardiovascular
  "infart": ["infart agut miocardi", "IAM", "angina"],
  "infarto": ["infart agut miocardi", "IAM", "angina"],
  "cor": ["insuficiència cardíaca", "fibril·lació", "angina", "infart"],
  "corazón": ["insuficiència cardíaca", "fibril·lació", "angina", "infart"],
  "trombosi": ["trombosi venosa profunda", "TVP", "embòlia pulmonar"],
  "trombosis": ["trombosi venosa profunda", "TVP", "embòlia pulmonar"],
  "embòlia": ["embòlia pulmonar"],
  "embolia": ["embòlia pulmonar"],
  "arrítmia": ["fibril·lació auricular"],
  "arritmia": ["fibril·lació auricular"],
  "bypass": ["bypass coronari", "cirurgia bypass"],
  "hipertensió": ["hipertensió arterial"],
  "hipertensión": ["hipertensió arterial"],
  
  // Sistema respiratori
  "pneumònia": ["pneumònia bacteriana", "pneumònia"],
  "neumonía": ["pneumònia bacteriana", "pneumònia"],
  "pulmonía": ["pneumònia bacteriana", "pneumònia"],
  "bronquitis": ["bronquitis aguda", "MPOC"],
  "asma": ["asma aguda", "asma"],
  "covid": ["COVID-19", "COVID persistent", "pneumònia COVID"],
  "long covid": ["COVID persistent"],
  "mpoc": ["MPOC aguditzada", "MPOC"],
  "epoc": ["MPOC aguditzada", "MPOC"],
  
  // Sistema digestiu
  "pancreatitis": ["pancreatitis aguda"],
  "crohn": ["malaltia de Crohn"],
  "colitis": ["colitis ulcerosa"],
  "hèrnia inguinal": ["hèrnia inguinal"],
  "hernia inguinal": ["hèrnia inguinal"],
  "cirrosi": ["cirrosi hepàtica"],
  "cirrosis": ["cirrosi hepàtica"],
  "úlcera": ["úlcera gàstrica", "úlcera duodenal"],
  "úlcera estómac": ["úlcera gàstrica"],
  "apendicitis": ["apendicectomia"],
  "vesícula": ["colecistectomia", "colecistitis"],
  "hemorroides": ["hemorroides"],
  
  // Sistema nerviós
  "ictus": ["ictus isquèmic", "ictus hemorràgic", "AVC"],
  "derrame cerebral": ["ictus isquèmic", "ictus hemorràgic", "AVC"],
  "esclerosi múltiple": ["esclerosi múltiple"],
  "esclerosis múltiple": ["esclerosi múltiple"],
  "epilèpsia": ["epilèpsia"],
  "epilepsia": ["epilèpsia"],
  "migranya": ["migranya"],
  "migraña": ["migranya"],
  "mal de cap": ["migranya", "cefalea"],
  "dolor de cabeza": ["migranya", "cefalea"],
  "vèrtigen": ["vèrtigen", "VPPB", "Ménière", "neuritis vestibular"],
  "vértigo": ["vèrtigen", "VPPB", "Ménière", "neuritis vestibular"],
  "mareig": ["vèrtigen", "VPPB", "neuritis vestibular"],
  "mareo": ["vèrtigen", "VPPB", "neuritis vestibular"],
  "paràlisi facial": ["paràlisi de Bell"],
  "parálisis facial": ["paràlisi de Bell"],
  
  // Malalties infeccioses
  "tuberculosi": ["tuberculosi pulmonar"],
  "tuberculosis": ["tuberculosi pulmonar"],
  "hepatitis": ["hepatitis aguda"],
  "mononucleosi": ["mononucleosi infecciosa"],
  "mononucleosis": ["mononucleosi infecciosa"],
  "herpes": ["herpes zòster"],
  "zona": ["herpes zòster"],
  
  // Ginecologia
  "endometriosi": ["endometriosi"],
  "endometriosis": ["endometriosi"],
  "histerectomia": ["histerectomia"],
  "histerectomía": ["histerectomia"],
  "embaràs ectòpic": ["embaràs ectòpic"],
  "embarazo ectópico": ["embaràs ectòpic"],
  "avortament": ["avortament espontani"],
  "aborto": ["avortament espontani"],
  "menstruació": ["menstruació incapacitant"],
  "menstruación": ["menstruació incapacitant"],
  "regla dolorosa": ["menstruació incapacitant"],
  
  // Urologia
  "còlic nefrític": ["còlic nefrític", "litiasi renal"],
  "cólico nefrítico": ["còlic nefrític", "litiasi renal"],
  "pedra ronyó": ["còlic nefrític", "litiasi renal"],
  "piedra riñón": ["còlic nefrític", "litiasi renal"],
  "pròstata": ["prostatitis", "hiperplàsia pròstata"],
  "próstata": ["prostatitis", "hiperplàsia pròstata"],
  "infecció orina": ["infecció urinària", "pielonefritis"],
  "infección orina": ["infecció urinària", "pielonefritis"],
  
  // Oftalmologia
  "cataractes": ["cirurgia cataractes"],
  "cataratas": ["cirurgia cataractes"],
  "retina": ["despreniment retina"],
  "glaucoma": ["glaucoma agut"],
  
  // ORL
  "amígdales": ["amigdalectomia"],
  "amígdalas": ["amigdalectomia"],
  
  // Neoplàsies / Càncer
  "càncer": ["neoplàsia", "carcinoma", "tumor"],
  "cáncer": ["neoplàsia", "carcinoma", "tumor"],
  "tumor": ["neoplàsia", "carcinoma", "tumor"],
  "càncer mama": ["neoplàsia mama"],
  "cáncer mama": ["neoplàsia mama"],
  "càncer pulmó": ["neoplàsia pulmó"],
  "cáncer pulmón": ["neoplàsia pulmó"],
  "càncer còlon": ["neoplàsia còlon"],
  "cáncer colon": ["neoplàsia còlon"],
  "leucèmia": ["leucèmia"],
  "leucemia": ["leucèmia"],
  "limfoma": ["limfoma"],
  "linfoma": ["limfoma"],
  "melanoma": ["melanoma"],
  "quimioteràpia": ["neoplàsia", "quimioteràpia"],
  "quimioterapia": ["neoplàsia", "quimioteràpia"],
  "radioteràpia": ["neoplàsia", "radioteràpia"],
  "radioterapia": ["neoplàsia", "radioteràpia"],
  
  // Diabetis
  "diabetis": ["diabetis mellitus", "cetoacidosi"],
  "diabetes": ["diabetis mellitus", "cetoacidosi"],
  "sucre": ["diabetis mellitus"],
  "azúcar": ["diabetis mellitus"],
  
  // Tiroides
  "tiroides": ["hipotiroïdisme", "hipertiroïdisme", "Graves"],
  
  // Pell
  "psoriasi": ["psoriasi"],
  "psoriasis": ["psoriasi"],
  "dermatitis": ["dermatitis contacte"],
  "cel·lulitis": ["cel·lulitis", "erisipela"],
  "celulitis": ["cel·lulitis", "erisipela"],
};

/**
 * Cerca sinònims locals per un terme de cerca
 */
function findLocalSynonyms(query: string): string[] {
  const normalizedQuery = query.toLowerCase().trim();
  const synonyms = new Set<string>();
  
  // Cerca exacta
  if (SYNONYM_MAP[normalizedQuery]) {
    SYNONYM_MAP[normalizedQuery].forEach(s => synonyms.add(s));
  }
  
  // Cerca parcial (el query conté una clau del diccionari o viceversa)
  for (const [key, values] of Object.entries(SYNONYM_MAP)) {
    if (normalizedQuery.includes(key) || key.includes(normalizedQuery)) {
      values.forEach(s => synonyms.add(s));
    }
  }
  
  return Array.from(synonyms);
}

/**
 * Cerca a la BD amb múltiples termes (sinònims)
 */
async function searchWithTerms(terms: string[]): Promise<any[]> {
  const db = await getDb();
  if (!db || terms.length === 0) return [];
  
  const conditions = terms.flatMap(term => {
    const pattern = `%${term}%`;
    return [
      like(itDurations.diagnosis, pattern),
      like(itDurations.cie10Code, pattern),
      like(itDurations.category, pattern),
    ];
  });
  
  const results = await db
    .select()
    .from(itDurations)
    .where(or(...conditions))
    .limit(20);
  
  return results;
}

/**
 * Fallback LLM: demana al model que interpreti el terme de cerca
 * i retorni sinònims mèdics per buscar a la BD
 */
async function getLLMSynonyms(query: string): Promise<string[]> {
  try {
    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content: `Ets un expert mèdic. L'usuari busca un diagnòstic per calcular la durada d'una Incapacitat Temporal.
Retorna NOMÉS un JSON amb un array de termes mèdics sinònims o relacionats (en català i castellà) que podrien correspondre a la cerca de l'usuari.
Inclou: nom mèdic formal, sinònims col·loquials, codi CIE-10 si el coneixes, i termes relacionats.
Màxim 8 termes. No incloguis explicacions, només el JSON.`
        },
        {
          role: "user",
          content: `Cerca: "${query}". Retorna sinònims mèdics en format JSON: {"terms": ["terme1", "terme2", ...]}`
        }
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "synonym_search",
          strict: true,
          schema: {
            type: "object",
            properties: {
              terms: {
                type: "array",
                items: { type: "string" },
                description: "Termes mèdics sinònims o relacionats"
              }
            },
            required: ["terms"],
            additionalProperties: false
          }
        }
      }
    });
    
    const content = response.choices?.[0]?.message?.content;
    if (!content || typeof content !== 'string') return [];
    
    const parsed = JSON.parse(content);
    return parsed.terms || [];
  } catch (error) {
    console.error("[SemanticSearch] LLM fallback error:", error);
    return [];
  }
}

/**
 * Cerca semàntica principal: 3 nivells
 * 1. LIKE directa
 * 2. Sinònims locals
 * 3. Fallback LLM
 */
export async function semanticSearchDiagnosis(query: string): Promise<{
  results: any[];
  method: "direct" | "synonyms" | "llm";
  synonymsUsed?: string[];
}> {
  // Nivell 1: Cerca LIKE directa
  const directResults = await searchWithTerms([query]);
  if (directResults.length > 0) {
    return { results: directResults, method: "direct" };
  }
  
  // Nivell 2: Sinònims locals
  const localSynonyms = findLocalSynonyms(query);
  if (localSynonyms.length > 0) {
    const synonymResults = await searchWithTerms(localSynonyms);
    if (synonymResults.length > 0) {
      return { results: synonymResults, method: "synonyms", synonymsUsed: localSynonyms };
    }
  }
  
  // Nivell 3: Fallback LLM
  const llmSynonyms = await getLLMSynonyms(query);
  if (llmSynonyms.length > 0) {
    const llmResults = await searchWithTerms(llmSynonyms);
    if (llmResults.length > 0) {
      return { results: llmResults, method: "llm", synonymsUsed: llmSynonyms };
    }
  }
  
  return { results: [], method: "direct" };
}
