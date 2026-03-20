import mysql from "mysql2/promise";
import * as dotenv from "dotenv";
dotenv.config();

const conn = await mysql.createConnection(process.env.DATABASE_URL);

// ─── 1. Eliminar el document defectuós (ID 30002) ────────────────────────────
await conn.execute("DELETE FROM documents WHERE id = 30002");
console.log("🗑️  Document ID 30002 (BOE-A-2023-160 defectuós) eliminat.");

// ─── 2. Contingut complet extret del PDF oficial ──────────────────────────────
const content = `# Reial Decret 1060/2022, de 27 de desembre

**BOE núm. 4, de 5 de gener de 2023 | Referència: BOE-A-2023-160**
**Entrada en vigor: 1 d'abril de 2023**

Modifica el Reial Decret 625/2014, de 18 de juliol, pel qual es regulen determinats aspectes de la gestió i control dels processos per incapacitat temporal en els primers tres-cents seixanta-cinc dies de la seva durada.

---

## Preàmbul

El Reial Decret 625/2014 va adaptar la regulació vigent a una sèrie de reformes legals i als avenços en la coordinació entre els serveis públics de salut, les entitats gestores de la Seguretat Social i les mútues col·laboradores. Va flexibilitzar els terminis d'emissió dels parts mèdics de confirmació i va potenciar l'ús de les noves tecnologies per a l'intercanvi de dades.

L'objecte principal d'aquest reial decret és **eliminar l'obligació de la persona treballadora de lliurar a l'empresa la còpia en paper dels parts mèdics**. Els actuals mitjans electrònics permeten que l'administració comuniqui directament a l'empresa l'expedició dels parts mèdics, i que l'empresa transmeti a l'administració les dades addicionals necessàries per a la gestió de la IT.

---

## Article únic. Modificació del Reial Decret 625/2014

### U. Modificació de l'article 2.3 — Grups de processos i terminis dels parts de confirmació

Els parts de baixa i de confirmació s'estendran en funció del període de durada que estimi el metge. S'estableixen **quatre grups de processos**:

| Grup | Durada estimada | Primer part de confirmació | Parts de confirmació successius |
|------|----------------|---------------------------|----------------------------------|
| **a)** | Menys de 5 dies naturals | El metge emet la baixa i l'alta en el **mateix acte mèdic** | No n'hi ha (alta simultània) |
| **b)** | 5 a 30 dies naturals | Revisió en **màx. 7 dies** des de la baixa inicial | Cada **màx. 14 dies** |
| **c)** | 31 a 60 dies naturals | Revisió en **màx. 7 dies** des de la baixa inicial | Cada **màx. 28 dies** |
| **d)** | 61 o més dies naturals | Revisió en **màx. 14 dies** des de la baixa inicial | Cada **màx. 35 dies** |

> **Nota important (grup a):** La persona treballadora pot sol·licitar un reconeixement mèdic el dia fixat com a data d'alta. Si el facultatiu considera que no ha recuperat la capacitat laboral, pot emetre el part de confirmació de la baixa.

> **Clàusula de flexibilitat:** En qualsevol dels processos, el facultatiu pot fixar la revisió mèdica en un període **inferior** al indicat per a cada grup.

### Dos. Modificació de l'article 6.3 — Proposta d'alta de la mútua

Quan la proposta d'alta formulada per una mútua no sigui resolta i notificada en el termini de cinc dies, la mútua podrà sol·licitar l'alta a l'INSS o a l'ISM. L'entitat gestora resoldrà en el termini de **quatre dies** següents a la seva recepció.

L'INSS i l'ISM realitzaran el seguiment del comportament del nou procediment de gestió i control dels processos per IT, incloent-hi el grau de motivació clínica de les propostes d'alta de les mútues i el grau de compliment dels terminis.

### Tres. Nova redacció de l'article 7 — Tramitació electrònica dels parts mèdics

#### Article 7.1 — Transmissió telemàtica dels parts

El facultatiu que expedeixi el part mèdic de baixa, confirmació o alta **lliurarà a la persona treballadora una còpia** d'aquest.

El servei públic de salut, la mútua o l'empresa col·laboradora **remetrà les dades dels parts a l'INSS per via telemàtica**, de manera immediata i, en tot cas, en el **primer dia hàbil** següent al de la seva expedició.

> **Canvi clau:** La persona treballadora **ja no ha de lliurar la còpia en paper del part a l'empresa**. L'administració comunica directament a l'empresa l'expedició dels parts.

#### Article 7.2 — Comunicació de l'INSS a les empreses

L'INSS comunicarà a les empreses les dades identificatives de caràcter merament administratiu dels parts mèdics de baixa, confirmació i alta, com a màxim en el **primer dia hàbil** següent al de la seva recepció.

Les empreses estan **obligades** a transmetre a l'INSS a través del sistema **RED**, amb caràcter immediat i en el termini màxim de **3 dies hàbils** des de la recepció de la comunicació de la baixa mèdica, les dades que es determinin per ordre ministerial.

> **Excepció:** Aquesta transmissió no és obligatòria quan la persona treballadora pertanyi a un col·lectiu respecte del qual l'empresa no tingui obligació d'incorporar-se al sistema RED.

> **Sanció per incompliment:** L'incompliment d'aquesta obligació pot constituir una infracció de les tipificades en l'article 21.4 del TRLISOS (RDL 5/2000).

#### Article 7.3 — Distribució de dades per l'INSS

L'INSS distribuirà i reenviarà de manera immediata (i en tot cas en el primer dia hàbil) les dades destinades a l'ISM i a les mútues.

L'INSS facilitarà a la TGSS les dades de les persones treballadores en situació d'IT per a la compensació en la liquidació de quotes de les quantitats satisfetes en pagament delegat.

Quan l'empresari hagi abonat la prestació d'IT en pagament delegat sense haver-la compensat en les liquidacions de quotes, podrà sol·licitar el reintegrament de les quantitats abonades davant l'INSS, l'ISM o la mútua competent.

#### Article 7.4 — Alta mèdica expedida per l'inspector mèdic de l'INSS

Quan el part d'alta sigui expedit per l'inspector mèdic de l'INSS o de l'ISM, aquestes entitats traslladaran les dades al servei públic de salut i a la mútua de manera immediata (primer dia hàbil).

L'inspector mèdic lliurarà una còpia del part a la persona treballadora, **expressant-li l'obligació d'incorporar-se al treball el dia següent** al de l'expedició.

L'entitat gestora comunicarà a l'empresa les dades merament administratives dels parts d'alta, com a màxim en el primer dia hàbil.

#### Article 7.5 — Competència exclusiva de l'INSS per a noves baixes (180 dies)

Quan en un procés d'IT s'hagi expedit el part d'alta per l'INSS o l'ISM a través dels seus inspectors mèdics, durant els **180 dies naturals** següents a la data de l'alta, **únicament** l'INSS o l'ISM (a través dels seus propis metges) seran competents per emetre una nova baixa mèdica per la **mateixa o similar patologia**.

---

## Disposició transitòria única — Processos en curs

Les previsions d'aquest reial decret s'aplicaran, a partir de la seva entrada en vigor, als processos que en aquell moment estiguin en curs i no hagin superat els 365 dies de durada.

---

## Disposició final única — Entrada en vigor

El present reial decret va entrar en vigor el **1 d'abril de 2023** (primer dia del tercer mes següent al de la seva publicació al BOE).

---

## Resum executiu per al metge de família

| Aspecte | Situació anterior (RD 625/2014) | Nova situació (RD 1060/2022) |
|---------|--------------------------------|------------------------------|
| **Còpia en paper per a l'empresa** | La persona treballadora havia de lliurar-la a l'empresa | **Eliminada**: l'INSS ho comunica directament |
| **Termini empresa → INSS** | La persona treballadora presentava el part | L'empresa transmet per RED en **3 dies hàbils** |
| **Grup a) < 5 dies** | Sense canvis significatius | Alta i baixa en el **mateix acte mèdic** |
| **Grup b) 5-30 dies** | Confirmació cada 7 dies | Primera revisió ≤ 7 dies; successives ≤ **14 dies** |
| **Grup c) 31-60 dies** | Confirmació cada 14 dies | Primera revisió ≤ 7 dies; successives ≤ **28 dies** |
| **Grup d) ≥ 61 dies** | Confirmació cada 28 dies | Primera revisió ≤ 14 dies; successives ≤ **35 dies** |
| **Entrada en vigor** | — | **1 d'abril de 2023** |

---

## Normativa relacionada

- **Reial Decret 625/2014, de 18 de juliol** (BOE-A-2014-7684): norma modificada
- **LGSS art. 169-176** (RDL 8/2015): prestació d'IT
- **LGSS art. 170.1**: competència de l'INSS per expedir altes
- **Llei 39/2015, d'1 d'octubre**: procediment administratiu comú (administració electrònica)
- **TRLISOS art. 21.4** (RDL 5/2000): infraccions per incompliment de l'obligació de transmissió RED
`;

const legalBasis = `## Base legal

### Normativa principal
- **Reial Decret 1060/2022, de 27 de desembre** (BOE-A-2023-160): norma que modifica el RD 625/2014
- **Reial Decret 625/2014, de 18 de juliol** (BOE-A-2014-7684): norma modificada — gestió i control dels processos d'IT en els primers 365 dies
- **LGSS art. 169-176** (RDL 8/2015): prestació d'incapacitat temporal
- **LGSS art. 170.1**: competència de l'INSS per expedir altes mèdiques
- **Llei 39/2015, d'1 d'octubre**: procediment administratiu comú i administració electrònica
- **TRLISOS art. 21.4** (RDL 5/2000): infraccions per incompliment de l'obligació de transmissió RED

### Disposicions destacades
- **Art. 2.3 RD 625/2014 (nova redacció)**: quatre grups de processos i terminis dels parts de confirmació
- **Art. 6.3 RD 625/2014 (nova redacció)**: proposta d'alta de la mútua i termini de resolució de l'INSS (4 dies)
- **Art. 7 RD 625/2014 (nova redacció completa)**: tramitació electrònica dels parts, obligació RED de les empreses (3 dies hàbils), competència exclusiva de l'INSS per a noves baixes durant 180 dies

### Entrada en vigor
1 d'abril de 2023 (primer dia del tercer mes següent a la publicació al BOE de 5 de gener de 2023)
`;

const procedure = `## Procediment per al metge de família

### Emissió dels parts mèdics (nova tramitació electrònica)

**1. Part de baixa:**
- Emetreure el part a través del sistema eCap / SISAP
- Lliurar **una còpia a la persona treballadora** (obligatori)
- Transmetre les dades a l'INSS per via telemàtica en el **primer dia hàbil** següent
- **Ja NO cal lliurar còpia en paper per a l'empresa**: l'INSS ho comunica directament

**2. Selecció del grup de procés (art. 2.3):**
- **Grup a) < 5 dies**: emetre la baixa i l'alta en el **mateix acte mèdic**; fixar la data d'alta (mateixa data o fins a 3 dies naturals posteriors)
- **Grup b) 5-30 dies**: primera revisió en ≤ 7 dies; confirmacions successives cada ≤ 14 dies
- **Grup c) 31-60 dies**: primera revisió en ≤ 7 dies; confirmacions successives cada ≤ 28 dies
- **Grup d) ≥ 61 dies**: primera revisió en ≤ 14 dies; confirmacions successives cada ≤ 35 dies
- En qualsevol grup, es pot fixar la revisió en un termini **inferior** al màxim establert

**3. Part d'alta:**
- Lliurar còpia a la persona treballadora
- Transmetre a l'INSS en el primer dia hàbil
- Si l'alta ha estat expedida per l'inspector mèdic de l'INSS: la persona treballadora s'ha d'incorporar al treball el **dia següent** a l'expedició

**4. Noves baixes després d'alta de l'INSS (art. 7.5):**
- Si l'alta va ser expedida per l'inspector mèdic de l'INSS, durant els **180 dies** posteriors **únicament l'INSS** pot emetre nova baixa per la mateixa o similar patologia
- El metge de família **no pot emetre** la nova baixa en aquest cas: ha de derivar a l'INSS

### Obligació de l'empresa (per informació)
- L'empresa ha de transmetre dades a l'INSS per **sistema RED** en ≤ **3 dies hàbils** des de la recepció de la comunicació de baixa
- L'incompliment és infracció sancionable (TRLISOS art. 21.4)
`;

const examples = `## Exemples pràctics

### Exemple 1 — Grup a): Gastroenteritis aguda (2 dies)
**Situació:** Pacient amb gastroenteritis. El metge estima recuperació en 2 dies.
**Procediment:**
- Emetre baixa i alta en el **mateix acte mèdic** (grup a)
- Fixar data d'alta: avui o fins a 3 dies naturals posteriors
- Lliurar còpia a la persona treballadora
- **La persona treballadora NO ha de lliurar res a l'empresa**: l'INSS ho comunica directament
- Si el dia de l'alta la persona treballadora no es troba bé, pot sol·licitar reconeixement i el metge pot emetre part de confirmació

### Exemple 2 — Grup b): Lumbàlgia aguda (15 dies estimats)
**Situació:** Pacient amb lumbàlgia aguda. Estimació de recuperació: 15 dies.
**Procediment:**
- Emetre part de baixa (grup b)
- Fixar primera revisió en ≤ 7 dies (p. ex., dia 7)
- En la revisió del dia 7: si continua de baixa, emetre part de confirmació
- Confirmació successiva: màx. 14 dies (p. ex., dia 21)
- Si al dia 21 ja pot treballar: emetre alta
- **Canvi important**: la persona treballadora no ha de portar el paper a l'empresa; l'INSS ho gestiona electrònicament

### Exemple 3 — Grup d): Fractura de maluc (90 dies estimats)
**Situació:** Pacient amb fractura de maluc. Estimació: 3 mesos.
**Procediment:**
- Emetre part de baixa (grup d)
- Fixar primera revisió en ≤ 14 dies (p. ex., dia 14)
- Confirmació successiva: màx. 35 dies
- Si al dia 365 no hi ha alta, l'INSS assumeix la gestió (IT de llarga durada)

### Exemple 4 — Alta de l'INSS i nova baixa (art. 7.5)
**Situació:** La persona treballadora va tenir una IT per lumbàlgia i l'INSS va expedir l'alta el 15 de gener de 2024. El 1 de març de 2024 (45 dies després) torna a consulta per la mateixa lumbàlgia.
**Procediment:**
- Han passat 45 dies des de l'alta de l'INSS (< 180 dies)
- El metge de família **no pot emetre** la nova baixa per la mateixa patologia
- Ha de **derivar a l'INSS** perquè siguin els seus inspectors mèdics qui valorin i, si escau, emetin la nova baixa
- Si la nova patologia fos diferent (p. ex., grip), el metge de família sí que pot emetre la baixa

### Exemple 5 — Empresa que no transmet per RED
**Situació:** L'empresa rep la comunicació de baixa de l'INSS el dilluns 10 de febrer. No transmet les dades per RED.
**Conseqüència:**
- Termini màxim: dijous 13 de febrer (3 dies hàbils)
- Si no transmet en termini: infracció sancionable per l'art. 21.4 TRLISOS
- La persona treballadora no es veu afectada: la seva prestació no depèn d'aquesta transmissió
`;

// ─── 3. Inserir el nou document ───────────────────────────────────────────────
// La taula documents té: id, title, type, source, jurisdiction, content, summary, url, fileKey, tags, createdAt, updatedAt, createdBy, publicationYear, status
// Combinem tot el contingut en el camp 'content' i el resum en 'summary'
const fullContent = content + "\n\n---\n\n" + legalBasis + "\n\n---\n\n" + procedure + "\n\n---\n\n" + examples;
const summary = "Modifica el RD 625/2014 eliminant l'obligació de la persona treballadora de lliurar la còpia en paper dels parts mèdics a l'empresa. Estableix la tramitació electrònica: l'INSS comunica directament a l'empresa l'expedició dels parts. Les empreses han de transmetre dades a l'INSS per sistema RED en 3 dies hàbils. Fixa quatre grups de processos amb terminis de confirmació: a) <5 dies (alta simultània), b) 5-30 dies (revisió ≤7 dies, confirmació ≤14 dies), c) 31-60 dies (revisió ≤7 dies, confirmació ≤28 dies), d) ≥61 dies (revisió ≤14 dies, confirmació ≤35 dies). Entrada en vigor: 1 d'abril de 2023.";

const [result] = await conn.execute(
  `INSERT INTO documents (title, type, source, jurisdiction, content, summary, url, tags, publicationYear, status, createdAt, updatedAt)
   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
  [
    "Reial Decret 1060/2022, de 27 de desembre (BOE-A-2023-160) - Gestió electrònica dels parts d'IT",
    "decreto",
    "BOE - Ministeri d'Inclusió, Seguretat Social i Migracions",
    "estatal",
    fullContent,
    summary,
    "https://www.boe.es/buscar/act.php?id=BOE-A-2023-160",
    JSON.stringify(["IT", "parts mèdics", "tramitació electrònica", "RD 625/2014", "gestió IT", "sistema RED", "INSS"]),
    2022,
    "vigent",
  ]
);

console.log(`✅ Nou document inserit amb ID: ${result.insertId}`);

// ─── 4. Verificació ───────────────────────────────────────────────────────────
const [rows] = await conn.execute(
  "SELECT id, title, LENGTH(content) as content_len FROM documents WHERE id = ?",
  [result.insertId]
);
console.log("📋 Verificació:", rows[0]);

const [total] = await conn.execute("SELECT COUNT(*) as total FROM documents");
console.log(`📊 Total documents a la BD: ${total[0].total}`);

await conn.end();
