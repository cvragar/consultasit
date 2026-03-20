/**
 * Script per inserir el Reial Decret 1060/2022 (BOE-A-2023-160) a la base de dades
 * com a font normativa fiable.
 *
 * RD 1060/2022, de 27 de desembre, que modifica el RD 625/2014 sobre gestió
 * i control dels processos d'IT en els primers 365 dies.
 */

import mysql from "mysql2/promise";
import * as dotenv from "dotenv";
dotenv.config();

const conn = await mysql.createConnection(process.env.DATABASE_URL);

const content = `# Reial Decret 1060/2022, de 27 de desembre

**BOE núm. 4, de 5 de gener de 2023 | Referència: BOE-A-2023-160**
**Entrada en vigor: 1 d'abril de 2023**

Modifica el Reial Decret 625/2014, de 18 de juliol, pel qual es regulen determinats aspectes de la gestió i control dels processos per incapacitat temporal en els primers tres-cents seixanta-cinc dies de la seva durada.

---

## Objecte i motivació

L'objecte principal d'aquest Reial Decret és eliminar l'obligació del treballador de lliurar físicament a l'empresa la còpia en paper dels parts mèdics de baixa, confirmació i alta. A partir de l'entrada en vigor (1 d'abril de 2023), l'INSS o la mútua col·laboradora comunica electrònicament els parts a l'empresa, sense necessitat d'intervenció del treballador.

Aquesta reforma s'emmarca en l'impuls de l'administració electrònica previst a la Llei 39/2015, d'1 d'octubre, del Procediment Administratiu Comú, i es justifica per les limitacions evidenciades durant la pandèmia de la COVID-19.

---

## Modificacions principals

### 1. Nou article 2.3 del RD 625/2014 (paràgraf final afegit)

En qualsevol dels processos contemplats en aquest apartat, el facultatiu podrà fixar la revisió mèdica corresponent en un període inferior a l'indicat en cada cas. Amb això s'eviten dubtes interpretatius sobre la possibilitat de revisar el pacient abans del termini màxim establert.

### 2. Nova redacció de l'article 7 del RD 625/2014: Tramitació dels parts mèdics

**Apartat 1 — Comunicació electrònica a l'empresa (novetat principal):**

El metge o metgessa que expedeixi el part de baixa, confirmació o alta mèdica el comunicarà al Sistema d'Informació de la Seguretat Social (SISSS), que el transmetrà a l'entitat gestora o mútua competent. L'entitat gestora o mútua comunicarà a l'empresa, per via electrònica (sistema RED/SILTRA), les dades dels parts mèdics dels seus treballadors, com a màxim el primer dia hàbil següent al de la seva recepció.

**L'empresa ja no necessita que el treballador li lliuri el part en paper.** El treballador queda alliberat d'aquesta obligació burocràtica.

**Apartat 2 — Obligació de l'empresa de comunicar dades addicionals:**

L'empresa haurà de comunicar a l'entitat gestora o mútua, en el termini de tres dies hàbils, les dades necessàries per a la gestió de la prestació (base de cotització, situació laboral, etc.) a través dels mitjans electrònics del sistema RED. L'incompliment d'aquesta obligació podrà constituir una infracció tipificada a l'article 21.4 del TRLISOS (RDL 5/2000).

**Apartat 3 — Distribució de dades per l'INSS:**

L'INSS distribuirà i reenviarà de manera immediata (i en tot cas el primer dia hàbil següent) les dades destinades a l'ISM i a les mútues. L'INSS facilitarà a la TGSS les dades dels treballadors en IT per a la liquidació de quotes i la compensació del pagament delegat.

**Apartat 4 — Alta expedida per l'inspector mèdic de l'INSS/ISM:**

Quan el part d'alta sigui expedit per l'inspector mèdic de l'INSS o ISM, aquestes entitats traslladaran les dades al servei públic de salut i a la mútua (si escau) de manera immediata. L'inspector mèdic lliurarà còpia del part al treballador, indicant-li l'obligació d'incorporar-se al treball el dia següent a l'expedició.

**Apartat 5 — Competència exclusiva de l'INSS/ISM per a noves baixes (180 dies):**

Quan en un procés d'IT s'hagi expedit el part d'alta per l'INSS o ISM a través dels seus inspectors mèdics, durant els **180 dies naturals** següents a la data de l'alta, seran aquestes entitats les úniques competents per emetre una nova baixa mèdica per la mateixa o similar patologia.

---

## Disposició transitòria única

Les previsions d'aquest Reial Decret s'aplicaran, a partir de la seva entrada en vigor, als processos que en aquell moment es trobin en curs i no hagin superat els 365 dies de durada.

---

## Disposició final única — Entrada en vigor

El Reial Decret va entrar en vigor l'**1 d'abril de 2023** (primer dia del tercer mes següent a la publicació al BOE, el 5 de gener de 2023).

---

## Implicacions pràctiques per al metge de família (eCap)

1. **Parts de baixa i confirmació**: el metge continua emetent els parts a través de l'eCap com fins ara. La diferència és que el treballador **no ha de lliurar el paper a l'empresa**: l'INSS/mútua ho comunica electrònicament.

2. **Parts d'alta**: el metge emet l'alta a l'eCap. El treballador rep còpia per al seu coneixement però no cal que la presenti a l'empresa.

3. **Revisió anticipada**: el metge pot citar el pacient per a revisió en un termini inferior al màxim establert per al tipus de procés (art. 2.3 modificat).

4. **Processos en curs a l'1 d'abril de 2023**: la nova tramitació electrònica s'aplica als processos en curs que no hagin superat els 365 dies.

5. **Competència de l'INSS per a recaigudes (180 dies)**: si l'INSS va emetre l'alta, durant els 180 dies posteriors el metge de família **no pot emetre una nova baixa per la mateixa patologia**: ha de derivar a l'INSS/ISM.

---

## Normativa relacionada

- **RD 625/2014, de 18 de juliol**: norma principal modificada per aquest RD 1060/2022.
- **LGSS (RDL 8/2015)**: art. 169-176 (IT), art. 170.1 i DA 1a.4 (alta per inspector mèdic INSS).
- **Llei 39/2015, d'1 d'octubre**: Procediment Administratiu Comú (administració electrònica).
- **TRLISOS (RDL 5/2000)**: art. 21.4 (infraccions per incompliment de l'empresa).
- **Ordre ESS/1187/2015**: regula el sistema RED i la comunicació electrònica.`;

const summary = `El Reial Decret 1060/2022 (BOE 5 de gener de 2023, en vigor des de l'1 d'abril de 2023) modifica el RD 625/2014 i elimina l'obligació del treballador de lliurar físicament el part mèdic a l'empresa. A partir de la seva entrada en vigor, l'INSS o la mútua col·laboradora comunica electrònicament els parts a l'empresa a través del sistema RED/SILTRA. L'empresa té 3 dies hàbils per comunicar les dades addicionals necessàries. Si l'alta va ser emesa per l'inspector mèdic de l'INSS, durant els 180 dies posteriors l'INSS és l'únic competent per emetre noves baixes per la mateixa patologia.`;

const tags = JSON.stringify([
  "RD 1060/2022",
  "RD 625/2014",
  "parts mèdics",
  "tramitació electrònica",
  "baixa mèdica",
  "alta mèdica",
  "sistema RED",
  "SILTRA",
  "empresa",
  "comunicació electrònica",
  "INSS",
  "mútua",
  "180 dies",
  "recaiguda",
  "competència INSS",
  "eCap",
  "BOE-A-2023-160"
]);

const pdfUrl = "https://d2xsxph8kpxj0f.cloudfront.net/310519663242490001/DirVLPm6UeFJi3utFGbgZe/BOE-A-2023-160_0b0ae01a.pdf";
const boeUrl = "https://www.boe.es/diario_boe/txt.php?id=BOE-A-2023-160";

const [result] = await conn.execute(
  `INSERT INTO documents
    (title, type, source, jurisdiction, content, summary, url, fileKey, tags, publicationYear, status)
   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  [
    "Reial Decret 1060/2022, de 27 de desembre (BOE-A-2023-160) - Gestió electrònica dels parts d'IT",
    "decreto",
    "BOE - Ministeri d'Inclusió, Seguretat Social i Migracions",
    "estatal",
    content,
    summary,
    pdfUrl,
    "BOE-A-2023-160_0b0ae01a.pdf",
    tags,
    2023,
    "vigent"
  ]
);

console.log(`✅ Document inserit correctament. ID: ${result.insertId}`);
console.log(`   Títol: Reial Decret 1060/2022 (BOE-A-2023-160)`);
console.log(`   URL PDF: ${pdfUrl}`);
console.log(`   URL BOE: ${boeUrl}`);

await conn.end();
