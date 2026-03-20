/**
 * Script per inserir el Reial Decret 1299/2006, de 10 de novembre,
 * pel qual s'aprova el quadre de malalties professionals en el sistema
 * de la Seguretat Social.
 * BOE núm. 302, de 19 de desembre de 2006 | Referència: BOE-A-2006-22169
 * Entrada en vigor: 1 de gener de 2007
 */

import mysql from "mysql2/promise";
import * as dotenv from "dotenv";
dotenv.config();

const conn = await mysql.createConnection(process.env.DATABASE_URL);

const content = `# Reial Decret 1299/2006, de 10 de novembre

**BOE núm. 302, de 19 de desembre de 2006 | Referència: BOE-A-2006-22169**
**Entrada en vigor: 1 de gener de 2007**

Aprova el quadre de malalties professionals en el sistema de la Seguretat Social i estableix criteris per a la seva notificació i registre.

---

## Objecte i motivació

El RD 1299/2006 substitueix el quadre de malalties professionals anterior (RD 1995/1978) i el Decret 3772/1972 (Règim Especial Agrari). La reforma respon a la necessitat d'actualitzar la llista de malalties professionals per adaptar-la als canvis en els processos productius, als nous riscos laborals identificats i a la Recomanació de la Comissió Europea de 19 de setembre de 2003.

La norma s'aplica al Règim General i als règims especials que incloguin la cobertura de la contingència de malaltia professional (inclòs el RETA des de la Llei 20/2007 i el RD 1273/2003).

---

## Estructura del quadre de malalties professionals (Annex 1)

El quadre s'organitza en **6 grups** segons l'agent causant:

### Grup 1: Malalties causades per agents químics

Inclou malalties per exposició a metalls pesants (arsènic, beril·li, cadmi, crom, mercuri, plom, manganès, níquel, fòsfor, vanadi, zinc), dissolvents orgànics (benzè, toluè, xilè, sulfur de carboni, tricloroetilè), pesticides, isocianats, amines aromàtiques i altres substàncies químiques.

**Exemples rellevants per al sector sanitari:**
- Exposició a agents citostàtics (quimioteràpia): risc per a infermers/es d'oncologia
- Exposició a formaldehid: anatomia patològica, laboratoris
- Exposició a òxid d'etilè: esterilització de material quirúrgic
- Exposició a anestèsics halogenats: personal de quiròfan

### Grup 2: Malalties causades per agents físics

Inclou malalties per soroll (hipoacúsia), vibracions (síndrome de Raynaud, artropaties), radiacions ionitzants i no ionitzants, postures forçades i moviments repetitius, i agents atmosfèrics.

**Subgrups destacats:**

**2A — Hipoacúsia per soroll:**
Treballadors exposats a soroll superior a 85 dB(A) de manera continuada. Molt prevalent en construcció, indústria metal·lúrgica, música i hostaleria.

**2B — Malalties per vibracions:**
- Vibracions mà-braç: síndrome de Raynaud, artropaties del colze i canell (conductors de maquinària, operadors de martells pneumàtics)
- Vibracions cos sencer: dorsàlgies, hèrnies discals (conductors de vehicles pesants, tractors)

**2C — Malalties per agents atmosfèrics:**
- Calor: cops de calor, rampes de calor (treballadors de forns, cuiners)
- Fred: sabanyons, crioglobulinèmia (treballadors de cambres frigorífiques, pesca)
- Pressió atmosfèrica: malaltia de descompressió (bussejadors, treballadors en cambres hiperbàriques)

**2D — Nistagmus dels miners:**
Treballadors de la mineria subterrània.

**2E — Nòduls de les cordes vocals:**
Activitats que requereixen ús mantingut i continu de la veu: professors, cantants, actors, teleoperadors, locutors. **Molt rellevant per al personal sanitari** (metges, infermers/es que fan docència).

**2F — Malalties per energia radiant:**
Treballadors amb cristall incandescent, masses incandescents, fundicions.

**2G — Malalties per radiacions ionitzants:**
Personal sanitari exposat a radiacions (radiologia, medicina nuclear, radioterapia).

**2H — Malalties per postures forçades i moviments repetitius:**
Síndrome del túnel carpià, tendinitis de Quervain, epicondilitis, bursitis, síndrome del canal de Guyon, síndrome del canal epitrocleo-olecranià. **Molt prevalent en el sector sanitari** (cirurgians, odontòlegs, fisioterapeutes, infermers/es).

**Activitats de risc per al personal sanitari (2H):**
- Síndrome del túnel carpià: cirurgians, odontòlegs, fisioterapeutes, infermers/es que fan cures
- Tendinitis de Quervain: cirurgians, instrumentistes quirúrgics
- Epicondilitis: fisioterapeutes, odontòlegs
- Bursitis de genoll: personal que treballa en posicions agenollades

### Grup 3: Malalties causades per agents biològics

**3A — Malalties infeccioses per risc laboral:**
Malalties infeccioses causades pel treball de les persones que s'ocupen de la prevenció, assistència mèdica i activitats en les quals s'ha provat un risc d'infecció.

**Activitats de risc (codi 3A0101 i 3A0102):**
- Personal sanitari (metges, infermers/es, auxiliars, tècnics de laboratori)
- Personal sanitari i auxiliar d'institucions tancades (hospitals, residències)

**Malalties incloses:** hepatitis B, hepatitis C, VIH (en cas d'accident per punxada), tuberculosi, brucel·losi, leptospirosi, àntrax, i qualsevol malaltia infecciosa demostrada per exposició laboral.

**Implicació clau per al metge de família:** quan un professional sanitari contreu una malaltia infecciosa per exposició laboral (p. ex., hepatitis B per punxada accidental), pot ser qualificada com a **malaltia professional** (no com a accident de treball), amb les conseqüències en la prestació econòmica i la cobertura.

### Grup 4: Malalties per inhalació de substàncies

Inclou pneumoconiosis (silicosi, asbestosi, antracosi, siderosi), asma professional, al·lèrgies respiratòries, bissinosi (fibres tèxtils), i malalties per inhalació de pols de fusta, farina, làtex, etc.

**Malalties rellevants per al sector sanitari:**
- Asma professional per làtex: personal sanitari que usa guants de làtex
- Al·lèrgia respiratòria per aldehids (formaldehid, glutaraldehid): personal d'esterilització i anatomia patològica
- Asma professional per pols de farina: personal de cuina hospitalària

### Grup 5: Malalties de la pell

Inclou dermatitis de contacte al·lèrgica i irritativa, urticària de contacte, i altres malalties cutànies causades per substàncies i agents no compresos en altres grups.

**Malalties rellevants per al sector sanitari:**
- Dermatitis de contacte per làtex: personal sanitari (guants)
- Dermatitis de contacte per desinfectants (clorhexidina, iode, aldehids)
- Dermatitis de contacte per medicaments (antibiòtics, anestèsics locals)
- Urticària de contacte per làtex

### Grup 6: Malalties per agents carcinògens

Inclou càncers professionals per exposició a amines aromàtiques, benzè, clorur de vinil, asbest, pols de fusta, radiacions ionitzants, i altres carcinògens reconeguts.

**Malalties rellevants per al sector sanitari:**
- Leucèmia per benzè (laboratoris)
- Mesotelioma i càncer de pulmó per asbest (hospitals antics amb aïllament d'amiant)
- Càncer de pell per radiacions ionitzants (radiologia, medicina nuclear)
- Càncer de bufeta per amines aromàtiques (laboratoris de patologia)

---

## Annex 2: Malalties d'origen professional no incloses a l'Annex 1

L'Annex 2 recull malalties que, sense estar incloses al quadre oficial, es sospita que poden tenir origen professional. La seva inclusió a l'Annex 2 permet la comunicació als efectes de la seva investigació i possible incorporació futura al quadre oficial.

---

## Procediment de declaració de malaltia professional

1. **Diagnòstic:** el facultatiu (metge de la mútua, metge de l'empresa o metge del SNS) diagnostica la malaltia i sospita l'origen professional.

2. **Comunicació:** la mútua o l'INSS emet el **part de malaltia professional** (model oficial aprovat per l'Ordre TAS/1/2007). El treballador no ha de lliurar el part a l'empresa (des del RD 1060/2022, la comunicació és electrònica).

3. **Qualificació:** l'entitat gestora o mútua qualifica la contingència com a malaltia professional. En cas de discrepància, el treballador pot impugnar la qualificació davant la jurisdicció social.

4. **Comunicació del metge del SNS:** quan un facultatiu del Sistema Nacional de Salut, en les seves actuacions professionals, tingui coneixement de l'existència d'una malaltia inclosa a l'Annex 1 que podria ser qualificada com a professional, **ho ha de comunicar** a través de l'organisme competent de la comunitat autònoma a l'entitat gestora i a la mútua.

---

## Implicacions pràctiques per al metge de família (eCap)

1. **Sospita de malaltia professional:** si en la consulta es detecta una patologia que podria tenir origen laboral (p. ex., síndrome del túnel carpià en una infermera, asma per làtex en un cirurgià, hepatitis B en personal sanitari), el metge ha de comunicar-ho a l'organisme competent de la CA (a Catalunya: el Servei de Salut Laboral del CatSalut).

2. **Part de baixa:** si la malaltia professional causa IT, el part de baixa ha d'indicar la contingència com a **malaltia professional** (no contingència comuna). Això implica que la prestació la gestiona la mútua (no l'INSS per CC), la base reguladora és diferent i el subsidi és del 75% des del primer dia (no del 60% els primers 20 dies com a CC).

3. **Diferència entre AT i malaltia professional:** l'accident de treball és un succés sobtat; la malaltia professional és una patologia que es desenvolupa de forma gradual per l'exposició a agents de risc laboral reconeguts al quadre del RD 1299/2006. Ambdues contingències donen dret a la prestació d'IT des del dia de la baixa (sense període de carència).

4. **Personal sanitari i Grup 3:** el personal sanitari és especialment vulnerable a les malalties del Grup 3 (agents biològics). La punxada accidental amb agulla contaminada pot originar una malaltia professional (hepatitis B, C, VIH) si es demostra l'exposició laboral.

5. **Malalties musculoesquelètiques (Grup 2H):** molt freqüents en el sector sanitari. La síndrome del túnel carpià, la tendinitis de Quervain i l'epicondilitis poden ser qualificades com a malaltia professional si es demostra la relació amb l'activitat laboral (moviments repetitius, postures forçades).

---

## Normativa relacionada

- **LGSS (RDL 8/2015):** art. 156 (accident de treball), art. 157 (malaltia professional), art. 158 (altres contingències professionals)
- **RD 1299/2006:** norma principal (aquest document)
- **Ordre TAS/1/2007, de 2 de gener:** aprova el model de part de malaltia professional i regula la seva tramitació electrònica (sistema CEPROSS)
- **RD 664/1997, de 12 de maig:** protecció dels treballadors contra els riscos relacionats amb l'exposició a agents biològics
- **RD 1273/2003:** cobertura de contingències professionals per als treballadors autònoms (RETA)
- **Llei 20/2007, de 11 de juliol:** Estatut del Treball Autònom (cobertura obligatòria de contingències professionals per als autònoms econòmicament dependents - TRADE)
- **RD 1060/2022 (BOE-A-2023-160):** tramitació electrònica dels parts mèdics (aplicable també a malalties professionals)`;

const summary = `El Reial Decret 1299/2006 (BOE 19 de desembre de 2006, en vigor des de l'1 de gener de 2007) aprova el quadre de malalties professionals en el sistema de la Seguretat Social, organitzat en 6 grups: agents químics, agents físics (soroll, vibracions, postures forçades), agents biològics (especialment rellevant per al personal sanitari), inhalació de substàncies, malalties de la pell i agents carcinògens. Quan una malaltia professional causa IT, la prestació la gestiona la mútua des del primer dia al 75% de la base reguladora (sense els 20 dies inicials al 60% de la CC). El metge del SNS té l'obligació de comunicar les sospites de malaltia professional a l'organisme competent de la CA.`;

const tags = JSON.stringify([
  "RD 1299/2006",
  "malalties professionals",
  "quadre de malalties professionals",
  "agents biològics",
  "agents físics",
  "agents químics",
  "síndrome del túnel carpià",
  "hipoacúsia",
  "asma professional",
  "dermatitis professional",
  "hepatitis B laboral",
  "personal sanitari",
  "contingència professional",
  "mútua",
  "CEPROSS",
  "Ordre TAS/1/2007",
  "BOE-A-2006-22169",
  "IT malaltia professional"
]);

const pdfUrl = "https://d2xsxph8kpxj0f.cloudfront.net/310519663242490001/DirVLPm6UeFJi3utFGbgZe/BOE-A-2006-22169_b54ceec9.pdf";

const [result] = await conn.execute(
  `INSERT INTO documents
    (title, type, source, jurisdiction, content, summary, url, fileKey, tags, publicationYear, status)
   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  [
    "Reial Decret 1299/2006, de 10 de novembre (BOE-A-2006-22169) - Quadre de malalties professionals",
    "decreto",
    "BOE - Ministeri de Treball i Assumptes Socials",
    "estatal",
    content,
    summary,
    pdfUrl,
    "BOE-A-2006-22169_b54ceec9.pdf",
    tags,
    2006,
    "vigent"
  ]
);

console.log(`✅ Document inserit correctament. ID: ${result.insertId}`);
console.log(`   Títol: Reial Decret 1299/2006 (BOE-A-2006-22169)`);
console.log(`   URL PDF: ${pdfUrl}`);
console.log(`   URL BOE: https://www.boe.es/eli/es/rd/2006/11/10/1299`);

await conn.end();
