/**
 * Script per inserir:
 * 1. Cas especial: Malaltia professional en personal sanitari (punxada accidental → Hepatitis B)
 * 2. Document normatiu: RD 625/2014 (norma base gestió parts IT primers 365 dies)
 */

import mysql from "mysql2/promise";
import "dotenv/config";

const conn = await mysql.createConnection(process.env.DATABASE_URL);

// ─── 1. CAS ESPECIAL: Malaltia professional en personal sanitari ───────────────

const mpSanitariCase = {
  id: 80001,
  title: "Malaltia professional en personal sanitari: punxada accidental",
  category: "accident_treball",
  description: `## Descripció del cas

El **personal sanitari** (metges, infermers, auxiliars, llevadores, odontòlegs, etc.) que pateix una **punxada accidental amb agulla o instrument tallant contaminat** pot desenvolupar una malaltia infecciosa de transmissió hematògena (Hepatitis B, Hepatitis C, VIH). Quan la malaltia es manifesta com a conseqüència d'aquesta exposició laboral, es qualifica com a **malaltia professional del Grup 3A** del RD 1299/2006, i NO com a accident de treball.

### Diferència clau entre AT i malaltia professional en punxada accidental

| Concepte | Accident de Treball (AT) | Malaltia Professional (MP) |
|---|---|---|
| **Fet causant** | La punxada en si mateixa | La malaltia infecciosa resultant |
| **Moment de qualificació** | Immediatament | Quan es diagnostica la malaltia |
| **Normativa aplicable** | Art. 156 LGSS | Art. 157 LGSS + RD 1299/2006 |
| **Grup RD 1299/2006** | No aplicable | Grup 3A (agents biològics) |
| **Gestió** | Mútua des del primer dia | Mútua des del primer dia |
| **Part de baixa** | Part d'AT | Part de CC (fins a qualificació MP) |

> **Nota important**: La punxada accidental en si mateixa pot generar un part d'AT per les lesions físiques directes (la ferida). Però si posteriorment es desenvolupa una hepatitis B o C, o una infecció per VIH, aquesta malaltia es qualifica com a MP del Grup 3A.

### Agents biològics del Grup 3A rellevants per al personal sanitari

- **Hepatitis B** (VHB): risc de seroconversió ~30% si el pacient font és HBsAg+ i HBeAg+
- **Hepatitis C** (VHC): risc de seroconversió ~1,8% per punxada
- **VIH**: risc de seroconversió ~0,3% per punxada percutània
- **Brucella** (personal de laboratori, veterinaris)
- **Mycobacterium tuberculosis** (personal sanitari en contacte amb pacients TB)`,

  legalBasis: `## Base legal

### Normativa principal
- **Art. 157 LGSS** (RDLeg 8/2015): definició de malaltia professional. Malaltia contreta com a conseqüència del treball executat per compte aliè en les activitats especificades al quadre del RD 1299/2006.
- **RD 1299/2006, de 10 de novembre**: Quadre de malalties professionals. **Grup 3: Malalties professionals causades per agents biològics. Subgrup 3A**: Malalties infeccioses causades per agents biològics en treballadors que treballen en activitats sanitàries.
- **Art. 156 LGSS**: definició d'accident de treball (la punxada en si mateixa pot ser AT per la lesió física directa).
- **RD 625/2014, de 18 de juliol**: gestió i control dels processos d'IT en els primers 365 dies.

### Jurisprudència rellevant
- **STS 18/03/2008 (RCUD 800/2007)**: confirma la qualificació de la hepatitis C com a malaltia professional del personal sanitari exposat per via laboral.
- **STSJ Catalunya 10/11/2015**: reconeix la hepatitis B com a MP del Grup 3A en una infermera que va patir una punxada accidental.
- **STSJ Madrid 28/09/2020**: diferencia entre l'AT per la punxada (lesió física) i la MP per la malaltia infecciosa posterior.

### Protocols de referència
- **Protocol de vigilància sanitària específica: Agents biològics** (Ministeri de Sanitat, 2001, actualitzat 2014)
- **Protocol de profilaxi postexposició (PPE)** de cada comunitat autònoma (a Catalunya: Circular 4/2019 del CatSalut)`,

  procedure: `## Procediment des de l'eCap

### Fase 1: Exposició accidental (punxada) — Actuació immediata

1. **Notificació immediata** al servei de medicina preventiva o urgències de l'hospital/CAP (en les primeres 2 hores).
2. **Avaluació del risc**: identificar el pacient font si és possible (serologies VHB, VHC, VIH).
3. **Profilaxi postexposició (PPE)**:
   - VHB: immunoglobulina anti-hepatitis B + vacuna si el treballador no és immune.
   - VIH: tractament antirretroviral d'emergència en les primeres 72 hores.
4. **Part d'AT** per la lesió física de la punxada (si escau): emetre'l des de l'eCap o el servei de prevenció de riscos laborals de l'empresa.

### Fase 2: Diagnòstic de la malaltia infecciosa — Qualificació com a MP

5. **Seguiment serològic** als 6 setmanes, 3 mesos i 6 mesos post-exposició.
6. Si es confirma la seroconversió (diagnòstic de Hepatitis B, C o VIH):
   - **NO emetre part de CC** com a diagnòstic definitiu.
   - **Comunicar a la mútua** la sospita de malaltia professional (formulari específic).
   - La mútua inicia l'expedient de qualificació com a MP.
7. **Part de baixa des de l'eCap**: inicialment s'emet com a contingència comuna (CC) fins que la mútua confirmi la qualificació com a MP. Un cop qualificada, la mútua assumeix la gestió.

### Fase 3: Gestió de la IT per MP

8. La **mútua col·laboradora** gestiona la IT per malaltia professional des del dia de la baixa (no hi ha període de carència).
9. La **base reguladora** per a MP és la mateixa que per a AT: base de cotització del mes anterior dividida entre 30 (o els dies reals del mes).
10. La **prestació** és del **75% de la base reguladora des del primer dia** (igual que l'AT, sense el 60% dels primers 20 dies de la CC).

### Comunicació obligatòria
- El metge de família ha de comunicar la sospita de MP a la mútua i al servei de prevenció de riscos laborals de l'empresa.
- L'empresa té l'obligació de notificar la malaltia professional a la Seguretat Social (formulari CEPROSS).`,

  examples: `## Exemples pràctics

### Exemple 1: Infermera amb Hepatitis C post-punxada

**Situació**: Infermera de planta hospitalària que pateix una punxada accidental amb agulla de sutura d'un pacient amb hepatitis C activa. Als 3 mesos, la serologia confirma seroconversió (VHC positiu).

**Resolució**:
- En el moment de la punxada: part d'AT per la lesió física (ferida per punxada).
- Als 3 mesos, amb el diagnòstic de Hepatitis C: qualificació com a MP del Grup 3A.
- La mútua assumeix la gestió de la IT per MP des del primer dia de baixa per la hepatitis.
- Prestació: 75% de la base reguladora des del dia 1 (no 60% com a CC).
- La infermera NO ha de pagar el cost del tractament (interferon + ribavirina o antivirals d'acció directa): és a càrrec de la mútua.

### Exemple 2: Metge de família amb Hepatitis B

**Situació**: Metge de família no vacunat contra la Hepatitis B que es punxa accidentalment amb una agulla d'un pacient portador crònic (HBsAg+, HBeAg+). Desenvolupa una hepatitis B aguda.

**Resolució**:
- Profilaxi immediata: immunoglobulina anti-HB + vacuna (primera dosi).
- Si malgrat la profilaxi es desenvolupa la malaltia: qualificació com a MP Grup 3A.
- Prestació per IT: 75% de la base reguladora des del dia 1.
- Si evoluciona a hepatitis crònica i genera incapacitat permanent: expedient d'IP per malaltia professional.

### Exemple 3: Auxiliar d'infermeria amb VIH

**Situació**: Auxiliar que es punxa amb una agulla d'un pacient seropositiu. Inicia PPE en les primeres 2 hores. Als 6 mesos, la serologia confirma infecció per VIH.

**Resolució**:
- La infecció per VIH es qualifica com a MP del Grup 3A.
- La mútua gestiona la IT i els tractaments antiretrovirals.
- Si el VIH genera una síndrome d'immunodeficiència adquirida (SIDA) amb incapacitat per treballar: expedient d'IP per MP.
- La qualificació com a MP és fonamental per garantir les prestacions màximes i evitar que el treballador hagi de demostrar la relació causal en un futur.

### Exemple 4: Tuberculosi en professional sanitari

**Situació**: Metge de medicina interna que desenvolupa tuberculosi pulmonar activa després d'atendre pacients amb TB bacil·lífera sense la protecció adequada (mascareta FFP2).

**Resolució**:
- La TB es qualifica com a MP del Grup 3A si es pot demostrar l'exposició laboral.
- La mútua gestiona la IT des del primer dia.
- Prestació: 75% de la base reguladora.
- El metge ha de ser apartat del treball fins a la negativització dels cultius (mesura de salut pública).`,
};

// ─── 2. DOCUMENT: RD 625/2014 ─────────────────────────────────────────────────

const rd625Doc = {
  title: "Reial Decret 625/2014 (BOE-A-2014-7684)",
  type: "decreto",
  jurisdiction: "estatal",
  publicationYear: 2014,
  status: "vigent",
  url: "https://d2xsxph8kpxj0f.cloudfront.net/310519663242490001/DirVLPm6UeFJi3utFGbgZe/BOE-A-2014-6434_2be268e1.pdf",
  sourceUrl: "https://www.boe.es/eli/es/rd/2014/07/18/625",
  summary: "Norma base que regula la gestió i el control dels processos d'incapacitat temporal en els primers 365 dies. Estableix els tipus de parts (baixa, confirmació, alta), les periodicitats d'emissió, les competències de l'INSS i les mútues, i el procediment de control mèdic. Modificat parcialment pel RD 1060/2022 (eliminació de l'obligació del treballador de lliurar el part a l'empresa).",
  content: `# Reial Decret 625/2014, de 18 de juliol

**BOE núm. 176, de 21 de juliol de 2014 (BOE-A-2014-7684)**
Vigent (modificat parcialment pel RD 1060/2022)

## Objecte i àmbit d'aplicació

El RD 625/2014 regula la gestió i el control dels processos d'**incapacitat temporal (IT)** en els primers **365 dies** de durada, tant per contingència comuna (CC) com per contingències professionals (AT i MP). Estableix les obligacions del metge de família (eCap), de la mútua col·laboradora, de l'INSS i de l'empresa en la gestió dels parts mèdics.

## Estructura dels parts d'IT (art. 2)

### Tipus de parts

| Tipus de part | Quan s'emet | Qui l'emet |
|---|---|---|
| **Part de baixa** | Primer dia d'IT | Metge del SPS (eCap) o mútua (AT/MP) |
| **Part de confirmació** | Periòdicament (veure taula) | Metge del SPS (eCap) |
| **Part d'alta** | Quan el treballador pot reincorporar-se | Metge del SPS, INSS o mútua |

### Periodicitat dels parts de confirmació (art. 2.3, modificat pel RD 1060/2022)

| Durada estimada del procés | Periodicitat dels parts de confirmació |
|---|---|
| Fins a 5 dies | No cal part de confirmació (alta al mateix part de baixa) |
| De 5 a 30 dies | Cada 7 dies |
| De 31 a 60 dies | Cada 14 dies |
| Més de 60 dies | Cada 28 dies |

> **Canvi important del RD 1060/2022**: Des de l'1 d'abril de 2023, el treballador **NO ha de lliurar físicament** el part a l'empresa. L'INSS/mútua comunica electrònicament els parts a l'empresa.

## Competències per emetre parts d'alta (art. 3)

### Qui pot donar l'alta?

1. **Metge del Servei Públic de Salut (eCap)**: pot donar l'alta en qualsevol moment.
2. **Mútua col·laboradora**: pot proposar l'alta per contingències professionals (AT/MP) i per CC a partir del **dia 361** (quan l'INSS ha assumit el control).
3. **INSS**: pot donar l'alta a partir del **dia 365** (o en qualsevol moment si considera que el treballador és apte).
4. **Inspecció Mèdica del SPS**: pot donar l'alta per CC en qualsevol moment.

## Control mèdic per l'INSS i les mútues (art. 4-6)

### Competències de la mútua (art. 5)

La mútua pot:
- Realitzar **reconeixements mèdics** al treballador en situació d'IT per CC.
- Emetre **propostes d'alta** a l'INSS (que té 4 dies hàbils per resoldre).
- Accedir a la **documentació clínica** del treballador (amb el seu consentiment o per resolució judicial).

### Competències de l'INSS (art. 6)

A partir del **dia 365** d'IT, l'INSS assumeix el **control exclusiu** del procés:
- Pot prorrogar la IT fins a un màxim de **545 dies** (180 dies addicionals).
- Pot iniciar l'expedient d'**incapacitat permanent (IP)**.
- Pot emetre l'alta forçosa si considera que el treballador és apte.

## Procediment de qualificació de la contingència (art. 6 bis, afegit pel RD 1060/2022)

Quan hi ha dubte sobre si la IT és per CC o per contingència professional (AT/MP):
1. El metge del SPS pot emetre el part com a CC provisionalment.
2. La mútua o l'INSS pot sol·licitar la **determinació de la contingència**.
3. L'INSS resol en el termini de **15 dies hàbils**.
4. La resolució és comunicada al treballador, l'empresa, la mútua i el SPS.

## Implicacions pràctiques per al metge de família (eCap)

### Periodicitat dels parts de confirmació
- Processos curts (fins a 30 dies): part de confirmació cada **7 dies**.
- Processos mitjans (31-60 dies): part de confirmació cada **14 dies**.
- Processos llargs (>60 dies): part de confirmació cada **28 dies**.

### Tramitació electrònica (des de l'1 d'abril de 2023)
- Els parts es transmeten electrònicament a l'INSS/mútua des de l'eCap.
- El treballador **no ha de lliurar el part a l'empresa** (el rep directament per via telemàtica).
- El metge ha de registrar el codi de diagnòstic CIE-10 al part.

### Altes mèdiques
- El metge de família pot donar l'alta en qualsevol moment si considera que el treballador és apte.
- Si el treballador no està d'acord amb l'alta, pot presentar **reclamació a la Inspecció Mèdica** en el termini de **4 dies hàbils**.

## Modificacions introduïdes pel RD 1060/2022

El RD 1060/2022 (BOE-A-2023-160) va modificar el RD 625/2014 en els aspectes següents:
1. **Eliminació de l'obligació del treballador de lliurar el part a l'empresa** (nova redacció de l'art. 2.3).
2. **Comunicació electrònica dels parts** de l'INSS/mútua a l'empresa.
3. **Nou procediment de determinació de la contingència** (nou art. 6 bis).
4. **Prolongació dels efectes de la IT** (nou art. 7).

## Relació amb altres normes

| Norma | Relació |
|---|---|
| **RD 1060/2022** | Modifica parcialment el RD 625/2014 (tramitació electrònica) |
| **LGSS (RDLeg 8/2015)** | Marc legal superior (arts. 169-176 sobre IT) |
| **RD 1299/2006** | Quadre de malalties professionals (contingències professionals) |
| **OM TAS/2865/2003** | Regulació de les prestacions d'IT (complementa el RD 625/2014) |`,
  tags: JSON.stringify([
    "RD 625/2014",
    "parts mèdics",
    "incapacitat temporal",
    "gestió IT",
    "parts de baixa",
    "parts de confirmació",
    "alta mèdica",
    "INSS",
    "mútua",
    "365 dies",
    "eCap",
    "tramitació electrònica",
    "periodicitat parts",
    "control mèdic",
  ]),
};

try {
  // Inserir cas especial de malaltia professional
  const [existingCase] = await conn.execute(
    "SELECT id FROM special_cases WHERE id = ?",
    [mpSanitariCase.id]
  );

  if (existingCase.length > 0) {
    await conn.execute(
      `UPDATE special_cases SET title=?, category=?, description=?, \`procedure\`=?, examples=?, legalBasis=? WHERE id=?`,
      [
        mpSanitariCase.title,
        mpSanitariCase.category,
        mpSanitariCase.description,
        mpSanitariCase.procedure,
        mpSanitariCase.examples,
        mpSanitariCase.legalBasis,
        mpSanitariCase.id,
      ]
    );
    console.log(`✅ Cas especial actualitzat. ID: ${mpSanitariCase.id}`);
  } else {
    await conn.execute(
      `INSERT INTO special_cases (id, title, category, description, \`procedure\`, examples, legalBasis) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        mpSanitariCase.id,
        mpSanitariCase.title,
        mpSanitariCase.category,
        mpSanitariCase.description,
        mpSanitariCase.procedure,
        mpSanitariCase.examples,
        mpSanitariCase.legalBasis,
      ]
    );
    console.log(`✅ Cas especial inserit correctament. ID: ${mpSanitariCase.id}`);
  }

  // Inserir document RD 625/2014
  const [existingDoc] = await conn.execute(
    "SELECT id FROM documents WHERE title LIKE '%625/2014%'"
  );

  if (existingDoc.length > 0) {
    console.log(`ℹ️ El document RD 625/2014 ja existeix. ID: ${existingDoc[0].id}`);
  } else {
    const [result] = await conn.execute(
      `INSERT INTO documents (title, type, jurisdiction, publicationYear, status, url, sourceUrl, summary, content, tags)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        rd625Doc.title,
        rd625Doc.type,
        rd625Doc.jurisdiction,
        rd625Doc.publicationYear,
        rd625Doc.status,
        rd625Doc.url,
        rd625Doc.sourceUrl,
        rd625Doc.summary,
        rd625Doc.content,
        rd625Doc.tags,
      ]
    );
    console.log(`✅ Document RD 625/2014 inserit correctament. ID: ${result.insertId}`);
    console.log(`   Títol: ${rd625Doc.title}`);
    console.log(`   URL PDF: ${rd625Doc.url}`);
  }
} catch (err) {
  console.error("❌ Error:", err.message);
} finally {
  await conn.end();
}
