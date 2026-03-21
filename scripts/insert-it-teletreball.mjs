import mysql from "mysql2/promise";
import * as dotenv from "dotenv";
dotenv.config();

const connection = await mysql.createConnection(process.env.DATABASE_URL);

const description = `## Descripció del cas

La **Llei 10/2021, de 9 de juliol, de treball a distància** no regula de manera específica els accidents de treball en teletreball. Per tant, s'aplica de manera supletòria l'**art. 156 LGSS** (presumpció *iuris tantum*): les lesions sofertes pel treballador **durant el temps i en el lloc de treball** es presumeixen accident de treball.

La clau per distingir un **accident de treball (AT)** d'una **contingència comuna (CC)** en teletreball és acreditar:
1. Que la lesió es va produir **durant la jornada laboral** (temps de treball).
2. Que existeix un **nexe causal** entre la lesió i la prestació de serveis (o que no es pot descartar).

### Taula comparativa: AT vs. CC en teletreball

| Concepte | Accident de Treball (AT) | Contingència Comuna (CC) |
|---|---|---|
| **Definició** | Art. 156 LGSS: lesió corporal en temps i lloc de treball | Malaltia o accident no relacionat amb el treball |
| **Prestació econòmica** | Des del dia 1: 75% BR (a càrrec de la mútua) | Dies 1-3: sense prestació; dies 4-20: 60% BR (empresa); dies 21+: 75% BR (INSS/mútua) |
| **Part mèdic** | Part d'AT (metge de la mútua o urgències) | Part de CC (metge de família/CAP) |
| **Gestió** | Mútua col·laboradora | Mútua col·laboradora o INSS |
| **Càrrega de la prova** | Presumpció a favor del treballador (art. 156.3 LGSS) | Empresa/mútua pot destruir la presumpció |

### Criteris jurisprudencials per qualificar l'AT en teletreball

**Factors que AFAVOREIXEN la qualificació com a AT:**
- La lesió es produeix **dins de l'horari laboral** (element temporal)
- El treballador estava **activament treballant** en el moment de l'accident
- La lesió es produeix en el **lloc habilitat per teletraballar** (despatx, taula de treball)
- La lesió es produeix en un **desplaçament necessari** dins del domicili durant la jornada (anar al bany, buscar material de treball)
- Malalties cardiovasculars (ictus, infart) que es manifesten **durant la jornada** (presumpció de laboralitat)

**Factors que DIFICULTEN la qualificació com a AT:**
- La lesió es produeix **fora de l'horari laboral**
- El treballador **no pot acreditar** que estava treballant en el moment de l'accident
- La lesió es produeix en activitats clarament **domèstiques o personals** sense connexió amb el treball
- La mútua pot provar la **desconnexió absoluta** entre la lesió i la prestació de serveis`;

const legalBasis = `### Normativa aplicable

**Normativa principal:**
- **Art. 156.1 LGSS** (RDLeg 8/2015): definició d'accident de treball — "tota lesió corporal que el treballador sofreixi amb ocasió o per conseqüència del treball que executi per compte d'altri"
- **Art. 156.3 LGSS**: presumpció *iuris tantum* — es presumeix AT la lesió sofrerta durant el temps i en el lloc de treball
- **Art. 156.2.a) LGSS**: accidents *in itinere* (trayecte al/del treball)
- **Llei 10/2021, de 9 de juliol, art. 16**: obligació de l'empresa d'avaluar els riscos laborals en el teletreball i planificar activitats preventives (factors psicosocials, ergonòmics, organitzatius i d'accessibilitat)
- **Art. 169 LGSS**: situació d'IT per contingència comuna (malaltia comuna o accident no laboral)

**Jurisprudència clau:**
- **STSJ Madrid 11/11/2022 (rec. 526/2022)**: accident durant la pausa dins de la jornada (ampolla d'aigua a la cuina) = AT. Aplica la presumpció de laboralitat del 156.3 LGSS.
- **JS Girona 12/11/2020**: ictus isquèmic durant el teletreball = AT. La presumpció s'aplica igual que en treball presencial.
- **JS Cáceres 26/10/2022 (rec. 273/2022)**: caiguda al passadís en tornar del bany durant la jornada = AT. El "lloc de treball" inclou tot el domicili durant la jornada.
- **STSJ Aragó 18/01/2022 (rec. 875/2021)**: infart de miocardi durant reunió virtual = AT.
- **STSJ Galícia 25/02/2022**: dolor d'espatlla en girar la pantalla, sense poder acreditar que estava treballant en aquell moment = CC. La presumpció no opera si no s'acredita el temps de treball.
- **STS 20/04/2021 (rec. 4466/2018)**: accidents durant la pausa de descans dins de la jornada = AT (doctrina aplicable al teletreball).`;

const procedure = `### Procediment per al metge de família

**Quan el treballador teletreballador consulta per una lesió:**

**Pas 1 — Determinar si estava treballant en el moment de l'accident:**
- Preguntar l'hora de l'accident i si coincideix amb l'horari laboral
- Demanar si hi ha evidències del treball (correus enviats, registre d'hores, videoconferències)
- El treballador ha d'acreditar el temps de treball (registre horari obligatori per Llei 10/2021)

**Pas 2 — Qualificació provisional:**
- **Si estava treballant i hi ha nexe causal**: orientar com a AT → derivar a la **mútua col·laboradora** per emetre el part d'AT
- **Si no estava treballant o no hi ha nexe causal**: emetre part de CC al CAP com habitualment

**Pas 3 — Gestió de la baixa:**
- **AT**: el metge de la mútua emet el part d'AT. Prestació des del dia 1 (75% BR). No cal esperar 4 dies.
- **CC**: el metge de família emet el part de CC. Prestació des del dia 4 (60% BR dies 4-20, 75% BR des del dia 21).

**Nota important:** En cas de dubte, el metge de família pot emetre un part de CC i la mútua o el treballador poden impugnar la qualificació davant l'INSS. La qualificació definitiva la fa l'INSS o, en cas de litigi, el jutjat social.

**Situació especial — Malalties cardiovasculars (ictus, infart):**
Si el treballador sofreix un ictus o infart durant la jornada laboral en teletreball, la jurisprudència aplica la presumpció de laboralitat (art. 156.3 LGSS). Orientar com a AT i derivar a la mútua, llevat que es pugui acreditar una desconnexió absoluta amb el treball.`;

const examples = `### Exemples pràctics

**Exemple 1 — Caiguda al passadís durant la jornada (AT)**
Treballadora que teletreballa des de casa. A les 10:30 h, dins de la seva jornada (9-18 h), va al bany i en tornar cau al passadís i es trenca el canell. La mútua intenta qualificar-ho com a CC argumentant que no va caure a la taula de treball. **Resolució**: AT. La jurisprudència (JS Cáceres 2022) considera que el "lloc de treball" durant la jornada inclou tot el domicili. La presumpció del 156.3 LGSS opera. Prestació des del dia 1 (75% BR).

**Exemple 2 — Ictus durant videoconferència (AT)**
Treballador que sofreix un ictus isquèmic a les 11:00 h mentre participa en una videoconferència de treball. Hi ha registre de connexió a la videoconferència. **Resolució**: AT. La presumpció de laboralitat opera per les malalties cardiovasculars manifestades durant la jornada (JS Girona 2020, STSJ Aragó 2022). La mútua ha de gestionar la baixa des del dia 1.

**Exemple 3 — Dolor d'espatlla sense acreditar temps de treball (CC)**
Treballadora que al·lega que li va aparèixer un dolor d'espatlla mentre girava la pantalla de l'ordinador, però no pot acreditar l'hora exacta ni que estava treballant en aquell moment (no hi ha registre horari, no hi ha correus enviats). **Resolució**: CC. La presumpció del 156.3 LGSS no opera si no s'acredita el temps de treball (STSJ Galícia 2022). El metge de família emet part de CC.

**Exemple 4 — Accident fora de l'horari laboral (CC)**
Treballador que teletreballa de 9 a 18 h. A les 20:30 h, fora de la jornada, cau per les escales de casa i es trenca el turmell. **Resolució**: CC. No hi ha presumpció de laboralitat perquè l'accident es produeix fora del temps de treball. El metge de família emet part de CC.

**Exemple 5 — Accident durant la pausa del migdia (AT, criteri jurisprudencial)**
Treballador que fa una pausa de 30 minuts per dinar (dins de la jornada laboral). Durant la pausa, baixa a buscar el correu i cau per les escales. **Resolució**: AT probable. La STSJ Madrid (2022) i la STS (2021) han considerat AT els accidents durant les pauses dins de la jornada laboral, aplicant la presumpció de laboralitat. La connexió entre la pausa i el temps de treball no es trenca.`;

// Inserir el cas especial
const [result] = await connection.execute(
  `INSERT INTO special_cases 
   (id, title, category, description, legalBasis, \`procedure\`, examples, relatedDocumentIds, createdAt, updatedAt)
   VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
   ON DUPLICATE KEY UPDATE
     title = VALUES(title),
     category = VALUES(category),
     description = VALUES(description),
     legalBasis = VALUES(legalBasis),
     \`procedure\` = VALUES(\`procedure\`),
     examples = VALUES(examples),
     relatedDocumentIds = VALUES(relatedDocumentIds),
     updatedAt = NOW()`,
  [
    90006,
    "IT en teletreball: accident laboral vs. contingència comuna",
    "accident_treball",
    description,
    legalBasis,
    procedure,
    examples,
    JSON.stringify([]),
  ]
);

console.log("Cas especial inserit:", result);

// Verificar
const [rows] = await connection.execute(
  "SELECT id, title, category, LENGTH(description) as descLen FROM special_cases WHERE id = 90006"
);
console.log("Verificació:", rows[0]);

// Total de casos
const [total] = await connection.execute("SELECT COUNT(*) as total FROM special_cases");
console.log("Total de casos especials:", total[0].total);

await connection.end();
