import mysql from "mysql2/promise";
import * as dotenv from "dotenv";
dotenv.config();

const content = `# Gestió de la Incapacitat Temporal (IT) en l'Àmbit Hospitalari - Catalunya (ICS)

**Font principal**: Canal Salut - Generalitat de Catalunya (actualitzat 19/02/2025)
**Font complementària**: Consorci Hospitalari de Vic (CHV), Hospital Universitari de Vic
**Àmbit**: Catalunya (xarxa ICS i centres concertats CatSalut)
**Normativa de referència**: RD 625/2014 (modificat per RD 1060/2022, en vigor des de 01/04/2023)

---

## 1. Principi general: la IT hospitalària es gestiona des del mateix centre

Des de 2023-2024, les incapacitats temporals generades per **ingrés hospitalari** o per una **cirurgia major ambulatòria (CMA)** i l'alta d'una IT per motiu de **part**, **es gestionen des del mateix hospital**, a través d'una plataforma integrada al sistema d'informació del centre (connectada a l'eCap i al sistema de la Seguretat Social).

**Objectius del canvi:**
- Agilitzar els processos administratius
- Disminuir el nombre de contactes a l'atenció primària per gestions d'aquest tipus
- Desburocratitzar el sistema
- Millorar l'experiència del pacient i el seu entorn
- Evitar desplaçaments innecessaris al CAP tant del pacient com dels seus familiars

---

## 2. Tres escenaris principals

### 2.1 Ingrés hospitalari (hospitalització convencional)

**Qui gestiona la baixa:** L'administració del centre hospitalari recull la informació requerida per gestionar la IT, en cas que el pacient necessiti la baixa per trobar-se en situació laboral activa.

**Terminis i comunicats:**

| Situació | Comunicat emès | Validesa |
|----------|---------------|---------|
| Ingrés ≥ 7 dies | Comunicat de confirmació automàtic | Fins a 14 dies |
| Ingrés < 7 dies | Primer comunicat s'emet en sortir de l'hospital | Fins a 14 dies |
| Seguiment posterior | Atenció primària (metge de família) | Segons grup de procés (RD 625/2014) |

**Requisits del pacient per poder tramitar la baixa a l'hospital:**
- Disposar de targeta sanitària amb Codi d'Identificació Personal (CIP)
- Trobar-se en edat laboral: entre 16 i 70 anys
- Estar treballant (amb contracte laboral o en règim d'autònoms) o cobrant subsidi d'atur
- Estar ingressat per via CatSalut (no privada, no accident laboral/esportiu/trànsit, no funcionaris amb mútua)

**Casos que NO es poden tramitar des de l'hospital:**
- Pacients ingressats per via privada
- Accidents laborals, esportius o de trànsit
- Funcionaris amb mútua pròpia

**Qui pot sol·licitar la baixa a l'hospital:**
- El propi pacient
- Un familiar del pacient
- A través de l'administració d'Admissions o urgències/planta

**Horari de tramitació (CHV com a exemple):** dilluns a divendres, de 13:00 a 19:00 h a Admissions.

### 2.2 Cirurgia Major Ambulatòria (CMA)

La CMA és una intervenció quirúrgica en la qual el pacient no pernocta a l'hospital (entra i surt el mateix dia).

**Funcionament:**
1. L'administració del centre recull la informació requerida per gestionar la IT
2. Segons el **diagnòstic de la intervenció**, l'**edat** i el **CNO (Codi Nacional d'Ocupació)** del pacient, es calcula la **durada òptima de la baixa** i se'n mostra una durada estimada

**Dos escenaris segons la durada estimada:**

| Durada òptima estimada | Gestió |
|------------------------|--------|
| **< 5 dies** | S'emet la baixa i l'alta en el mateix moment (un sol comunicat) |
| **≥ 5 dies** | S'emet la baixa; els comunicats de confirmació posteriors s'emeten des de l'atenció primària |

### 2.3 Ingrés per part (alta de la IT per maternitat)

**Situació específica:** Dones ingressades per part que tenien una **baixa laboral activa** en el moment de l'ingrés.

**Gestió especial:**
- L'alta de la IT es gestiona des del centre hospitalari
- Permet tramitar el **permís de maternitat/permís per naixement** sense haver de passar prèviament per l'atenció primària
- **Data d'alta de la baixa laboral:** necessàriament ha de ser el **dia anterior al part**

**Per què és important:** Si la IT no s'alta correctament des de l'hospital, la treballadora hauria de passar pel CAP per obtenir l'alta de la IT i poder iniciar el permís per naixement, generant un tràmit innecessari.

---

## 3. Coordinació entre l'hospital i l'atenció primària (eCap)

### 3.1 Flux de la informació

\`\`\`
INGRÉS HOSPITALARI
       ↓
Administració hospital recull: DNI/CIP, situació laboral, dades empresa
       ↓
Hospital emet: Part de baixa + 1r comunicat de confirmació (si ingrés ≥ 7 dies)
       ↓
Dades transmeses automàticament a:
  - Sistema de la Seguretat Social (via sistema RED)
  - eCap (historial clínic d'atenció primària)
       ↓
ALTA HOSPITALÀRIA
       ↓
Metge de família (CAP) gestiona:
  - Comunicats de confirmació successius
  - Seguiment del procés
  - Alta mèdica definitiva
\`\`\`

### 3.2 Eina informàtica: ZAS_GESTIO_IT

El sistema hospitalari utilitza una funció específica (**ZAS_GESTIO_IT**) vinculada al SAP (Sistema d'Aplicacions i Productes) per gestionar la IT:
- Es selecciona el pacient de la llista de pacients ingressats
- S'introdueixen les dades laborals (DNI/CIP del pacient)
- El sistema calcula automàticament la durada estimada i emet els comunicats

### 3.3 Descàrrega de documentació

Tota la documentació generada (baixa, comunicats de confirmació, alta) es pot descarregar immediatament des de **La Meva Salut** (app i web de la Generalitat de Catalunya).

---

## 4. Gestió de les baixes per hospitalització prolongada (> 30 dies)

Quan un pacient roman ingressat durant un període prolongat, la gestió dels comunicats de confirmació segueix el **RD 625/2014** (modificat per RD 1060/2022):

| Durada del procés | Grup RD 625/2014 | Termini màxim entre confirmacions |
|-------------------|-----------------|----------------------------------|
| < 5 dies | Grup a | Alta simultània amb la baixa |
| 5 – 30 dies | Grup b | ≤ 14 dies entre confirmacions |
| 31 – 60 dies | Grup c | ≤ 28 dies entre confirmacions |
| ≥ 61 dies | Grup d | ≤ 35 dies entre confirmacions |

**Punts clau per a hospitalitzacions prolongades:**
- Els comunicats de confirmació a partir del segon es gestionen des de l'**atenció primària** (metge de família), no des de l'hospital
- El metge de família pot emetre el comunicat de confirmació sense que el pacient es desplaci al CAP si el pacient segueix ingressat (pot fer-ho per telèfon o a través del sistema)
- A partir del **dia 180** de baixa, la competència passa exclusivament a l'**INSS** (Institut Nacional de la Seguretat Social), que pot emetre l'alta mèdica

---

## 5. Casos especials i situacions complexes

### 5.1 Pacient que ingressa estant ja de baixa

Si el pacient ja tenia una IT activa quan ingressa a l'hospital:
- La IT continua activa; no cal emetre una nova baixa
- L'hospital pot emetre els comunicats de confirmació corresponents
- El metge de família continua sent el responsable del seguiment un cop donat d'alta de l'hospital

### 5.2 Pacient que necessita la baixa però no la va sol·licitar a l'hospital

Si el pacient va ser ingressat però no va tramitar la baixa durant l'ingrés:
- Pot anar al CAP un cop donat d'alta de l'hospital
- El metge de família pot emetre la baixa amb data retroactiva coincident amb la data d'ingrés (amb justificant d'ingrés hospitalari)
- **Important:** La data d'inici de la IT ha de coincidir amb el primer dia que el treballador va faltar a la feina (no necessàriament el dia d'ingrés si l'ingrés va ser en cap de setmana o festiu)

### 5.3 Errors en la documentació emesa

**Regla crítica:** Si les dades de la baixa, els comunicats o l'alta són incorrectes o s'ha produït un error en el seu enregistrament, la documentació **només es podrà modificar/anular en els primers dies immediatament posteriors a la seva emissió**.

Passos a seguir en cas d'error:
1. Detectar l'error el més aviat possible (idealment el mateix dia o l'endemà)
2. Contactar amb l'administració del centre hospitalari (si l'error és del comunicat hospitalari)
3. Contactar amb el CAP/metge de família (si l'error és d'un comunicat d'atenció primària)
4. Si l'error no es pot corregir a temps, cal contactar amb la mútua o l'INSS per a la rectificació administrativa

### 5.4 Embaràs de risc i ingrés hospitalari

Si una treballadora embarassada és ingressada per una complicació de l'embaràs (preeclàmpsia, amenaça de part prematur, etc.):
- La IT es gestiona com a **contingència comuna** (embaràs de risc per causa clínica)
- L'hospital emet la baixa des del primer dia d'ingrés
- Si la causa és laboral (condicions del lloc de treball), cal derivar a la mútua per a la **prestació per risc durant l'embaràs** (100% BR), que és diferent de la IT

### 5.5 Accident de treball i ingrés hospitalari

Si l'ingrés és conseqüència d'un accident de treball:
- La gestió NO es fa des de l'hospital per via CatSalut
- Cal contactar amb la **mútua col·laboradora** de l'empresa
- La mútua gestiona la baixa com a contingència professional (AT/MP)
- Base reguladora: 75% de la base de cotització per contingències professionals des del primer dia

---

## 6. Resum executiu per al metge de família

| Situació | Qui emet la baixa | Qui fa el seguiment | Comunicats de confirmació |
|----------|------------------|---------------------|--------------------------|
| Ingrés hospitalari ≥ 7 dies | Hospital (automàtic) | Metge família (CAP) | CAP a partir del 2n |
| Ingrés hospitalari < 7 dies | Hospital (en alta) | Metge família (CAP) | CAP a partir del 2n |
| CMA durada < 5 dies | Hospital (baixa + alta simultànies) | — | No calen |
| CMA durada ≥ 5 dies | Hospital (baixa) | Metge família (CAP) | CAP a partir del 2n |
| Part (IT activa prèvia) | Hospital (alta IT dia anterior al part) | — | Permís per naixement |
| Ingrés per AT/MP | Mútua col·laboradora | Mútua | Mútua |
| Ingrés via privada | CAP (metge família) | Metge família | CAP |

**Preguntes freqüents del metge de família:**

**P: El pacient ha estat ingressat però no va demanar la baixa a l'hospital. Puc emetre-la ara?**
R: Sí. El metge de família pot emetre la baixa amb data retroactiva coincident amb la data d'ingrés, adjuntant el justificant d'ingrés hospitalari com a documentació justificativa.

**P: El pacient segueix ingressat i ha de renovar el comunicat de confirmació. Ha de venir al CAP?**
R: No. El metge de família pot emetre el comunicat de confirmació sense que el pacient es desplaci, verificant l'ingrés actiu al sistema.

**P: Quan passa la competència a l'INSS?**
R: A partir del dia 180 de baixa continuada, l'INSS és l'únic competent per emetre l'alta mèdica.

**P: La baixa per ingrés hospitalari compta com a contingència comuna o professional?**
R: Depèn de la causa: si és malaltia comuna o embaràs de risc per causa clínica → contingència comuna. Si és accident de treball o malaltia professional → contingència professional (gestió per mútua).
`;

const summary = `Protocol de gestió de la IT en l'àmbit hospitalari a Catalunya (ICS). Des de 2023-2024, les IT per ingrés hospitalari, CMA i alta per part es gestionen des del mateix hospital via plataforma integrada (ZAS_GESTIO_IT). Cobreix: ingressos ≥7 dies (comunicat automàtic 14 dies), CMA (<5 dies: baixa+alta simultànies; ≥5 dies: seguiment al CAP), ingrés per part (alta IT dia anterior al part), coordinació hospital-eCap, hospitalitzacions prolongades (grups RD 625/2014), errors de documentació, embaràs de risc, AT/MP, i resum executiu per al metge de família.`;

const tags = JSON.stringify([
  "IT hospitalari",
  "ICS",
  "Catalunya",
  "ingrés hospitalari",
  "CMA",
  "cirurgia major ambulatòria",
  "ZAS_GESTIO_IT",
  "eCap",
  "Canal Salut",
  "hospitalització prolongada",
  "part",
  "baixa laboral hospital",
  "RD 625/2014",
]);

async function main() {
  const conn = await mysql.createConnection(process.env.DATABASE_URL);

  const [result] = await conn.execute(
    `UPDATE documents SET
      title = ?,
      content = ?,
      summary = ?,
      tags = ?,
      url = ?,
      publicationYear = ?,
      status = ?
    WHERE id = 19`,
    [
      "Gestió de la IT en l'Àmbit Hospitalari - Catalunya (ICS / Canal Salut)",
      content,
      summary,
      tags,
      "https://canalsalut.gencat.cat/ca/salut-a-z/a/avaluacions-mediques/baixa-medica/gestio-ingres-hospitalari/",
      2024,
      "vigent",
    ]
  );

  console.log("✅ Document ID 19 actualitzat. Files afectades:", result.affectedRows);

  const [rows] = await conn.execute(
    "SELECT id, title, LENGTH(content) as content_len, publicationYear, status FROM documents WHERE id = 19"
  );
  console.log("📋 Verificació:", rows[0]);

  await conn.end();
}

main().catch(console.error);
