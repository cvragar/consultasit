import { createConnection } from 'mysql2/promise';
import * as dotenv from 'dotenv';
dotenv.config();

const db = await createConnection(process.env.DATABASE_URL);

// CAS 1: IT durant un ERTE/ERTO
const cas1 = {
  id: 90003,
  title: "IT durant un ERTE/ERTO: qui paga i com es gestiona",
  description: `**Situació molt freqüent que genera confusió sobre qui paga la prestació i com s'emet el part de baixa**

Quan un treballador afectat per un ERTE (Expedient de Regulació Temporal d'Ocupació) causa baixa per IT, la gestió de la prestació depèn del moment en què es produeix la baixa respecte a l'inici de l'ERTE.

**Cas 1: IT prèvia a l'ERTE (baixa activa quan s'inicia l'ERTE)**
El treballador que ja estava de baixa per IT quan s'inicia l'ERTE continua percebent la prestació d'IT (no la prestació per desocupació de l'ERTE). La IT suspèn l'ERTE. Quan l'IT s'extingeix, el treballador passa a percebre la prestació per desocupació de l'ERTE (si encara dura).

**Cas 2: IT durant l'ERTE (baixa que s'inicia mentre dura l'ERTE)**
Si el treballador causa baixa per IT mentre ja és en ERTE, la IT suspèn la prestació per desocupació de l'ERTE. La prestació d'IT la paga la mútua (si és contingència professional) o la mútua/INSS (si és contingència comuna). La base reguladora de la IT es calcula sobre la base de cotització anterior a l'ERTE (no sobre la base reduïda de l'ERTE).

**Cas 3: ERTE de reducció de jornada + IT**
Si el treballador és en ERTE de reducció de jornada (no de suspensió total) i causa baixa per IT, la IT es calcula sobre la base de cotització de la jornada reduïda per l'ERTE. La prestació per desocupació de la part no treballada es manté.

**Per al metge de família**: el part de baixa s'emet de la mateixa manera que qualsevol altra IT. No cal indicar res especial sobre l'ERTE. La gestió de la compatibilitat entre IT i ERTE la gestionen l'empresa, la mútua i el SEPE.`,
  category: "otro",
  legalBasis: `**Normativa aplicable:**
- LGSS art. 169-176: Incapacitat Temporal (IT)
- LGSS art. 267-269: Prestació per desocupació (ERTE)
- RD-Llei 8/2020, art. 22-25: Mesures extraordinàries en matèria d'ocupació (ERTE COVID)
- LGSS art. 273.1: Suspensió de la prestació per desocupació durant la IT
- Criteri SEPE: La IT suspèn la prestació per desocupació de l'ERTE (no s'extingeix)
- LGSS art. 173: Base reguladora de la IT (base de cotització del mes anterior a la baixa, no la base reduïda de l'ERTE)

**Jurisprudència i criteris administratius:**
- Criteri INSS 2020: En ERTE de suspensió, la IT es calcula sobre la base de cotització anterior a l'ERTE
- STSJ Madrid 14/07/2021: Confirma que la IT durant l'ERTE es calcula sobre la base anterior a la suspensió
- Instrucció SEPE 4/2020: Gestió de la compatibilitat IT-ERTE durant la pandèmia COVID-19`,
  procedure: `**Procediment per al metge de família (eCap):**

El metge de família **no té cap actuació especial** en casos d'ERTE. El part de baixa s'emet de la mateixa manera que qualsevol altra IT:

1. **Emissió del part de baixa**: Contingència comuna o professional, segons la causa. No cal indicar res sobre l'ERTE.
2. **Seguiment habitual**: Parts de confirmació cada 7 dies (primers 30 dies) o cada 14 dies (fins al dia 365).

**Informació que pot proporcionar el metge de família al treballador:**

- **La IT suspèn l'ERTE**: Mentre el treballador és de baixa per IT, no percep la prestació per desocupació de l'ERTE, sinó la prestació d'IT.
- **Qui paga la IT**: La mútua (si és contingència professional o si l'empresa té la cobertura de CC amb mútua) o l'INSS (si la CC és gestionada per l'INSS).
- **Base reguladora**: La IT es calcula sobre la base de cotització del mes anterior a la baixa, que normalment és la base anterior a l'ERTE (no la base reduïda de l'ERTE).
- **Quan s'acaba la IT**: El treballador torna a percebre la prestació per desocupació de l'ERTE (si encara dura). Si l'ERTE ha acabat mentre estava de baixa, pot tenir dret a la prestació per desocupació ordinària.

**Nota important**: Si el treballador pregunta sobre la compatibilitat entre IT i ERTE, ha de consultar amb el seu departament de RRHH, la mútua o el SEPE. El metge de família no gestiona les prestacions econòmiques.`,
  examples: `**Exemple 1: IT prèvia a l'ERTE (baixa activa quan s'inicia l'ERTE)**
Treballador de baixa per IT per fractura de turmell (des del 1 de febrer). L'empresa presenta un ERTE el 15 de febrer. El treballador continua percebent la IT (no la prestació de l'ERTE). Quan rep l'alta mèdica (15 de març), si l'ERTE continua, passa a percebre la prestació per desocupació de l'ERTE. La IT no s'ha vist afectada per l'ERTE.

**Exemple 2: IT durant l'ERTE de suspensió total**
Treballador en ERTE de suspensió total (percep el 70% de la base reguladora per desocupació). El 10 de març causa baixa per gastroenteritis aguda. La prestació per desocupació de l'ERTE se suspèn. La mútua li paga la IT. Base reguladora de la IT: la del mes anterior a l'ERTE (salari complet), no la base reduïda de l'ERTE. Quan rep l'alta (15 de març), torna a percebre la prestació de l'ERTE.

**Exemple 3: ERTE de reducció de jornada + IT**
Treballadora en ERTE de reducció del 50% de la jornada (treballa 20h/setmana, percep desocupació per les altres 20h). Causa baixa per lumbàlgia. La IT es calcula sobre la base de cotització de les 20h treballades (base reduïda). La prestació per desocupació de la part no treballada se suspèn mentre dura la IT.

**Exemple 4: ERTE acabat durant la IT**
Treballador en ERTE que causa baixa per IT el 1 de març. L'ERTE acaba el 31 de març. El treballador continua de baixa fins al 15 d'abril. Quan rep l'alta, l'ERTE ja ha acabat. Pot tenir dret a la prestació per desocupació ordinària si compleix els requisits (cotitzacions suficients, inscripció com a demandant d'ocupació).`,
};

// CAS 2: Prestació per risc durant la lactància
const cas2 = {
  id: 90004,
  title: "Prestació per risc durant la lactància natural: diferències amb la IT",
  description: `**Situació anàloga al risc durant l'embaràs però amb normativa específica i menor coneixement pràctic**

La **prestació per risc durant la lactància natural** és una prestació de la Seguretat Social que protegeix la treballadora que amamanta el seu fill quan les condicions del seu lloc de treball poden perjudicar la seva salut o la del lactant. Com en el cas del risc durant l'embaràs, la causa és **laboral-preventiva** (les condicions del treball), no mèdica.

**Diferència clau amb la IT:**
- **IT per malaltia**: La treballadora té una patologia que li impedeix treballar. El metge de família emet el part de baixa. Percep el 60%/75% de la BR.
- **Risc durant la lactància**: El lloc de treball és incompatible amb la lactància natural, però la treballadora no té cap malaltia. La mútua gestiona la prestació. Percep el **100% de la BR**. El metge de família **NO emet el part de baixa**.

**Durada de la prestació:**
La prestació per risc durant la lactància dura fins que el fill compleix **9 mesos** (o fins que la treballadora abandona la lactància natural si és abans dels 9 mesos). No hi ha pròrroga automàtica.

**Rol del metge de família:**
El metge de família pot emetre un **informe mèdic** que acrediti que la treballadora amamanta el seu fill i que la lactància és compatible amb la seva salut. Aquest informe és necessari per sol·licitar la prestació a la mútua. No és un part de baixa IT.`,
  category: "lactancia",
  legalBasis: `**Normativa aplicable:**
- LGSS art. 188: Situació protegida (risc durant la lactància natural)
- LGSS art. 189: Prestació econòmica (100% base reguladora, contingència professional)
- RD 295/2009, art. 39-48: Regulació detallada de la prestació per risc durant la lactància
- Llei 31/1995 de Prevenció de Riscos Laborals, art. 26.4: Obligació empresarial de protecció durant la lactància
- Directiva 92/85/CEE, art. 9: Protecció de la maternitat i la lactància en el treball
- ET art. 37.4: Permís de lactància (1 hora diària fins als 9 mesos, diferent de la prestació per risc)

**Distinció entre permís de lactància i prestació per risc durant la lactància:**
- **Permís de lactància** (ET art. 37.4): Dret a 1 hora d'absència diària fins als 9 mesos. No és una prestació econòmica de la SS; és un dret laboral. Es pot acumular en dies complets (permís de 15 dies laborables).
- **Prestació per risc durant la lactància** (LGSS art. 188-189): Prestació econòmica quan el lloc de treball és incompatible amb la lactància. Gestiona la mútua. 100% BR.`,
  procedure: `**Procediment per al metge de família (eCap):**

El metge de família té un rol específic però limitat en la prestació per risc durant la lactància:

1. **Informe mèdic de lactància**: Si la treballadora sol·licita la prestació per risc durant la lactància, pot necessitar un informe del metge de família que acrediti que amamanta el seu fill. Aquest informe **no és un part de baixa IT**; és un certificat mèdic ordinari.

2. **Quan NO emetre part de baixa IT**: Si la treballadora explica que el seu lloc de treball és incompatible amb la lactància (productes químics, radiacions, esforç físic, etc.) però no té cap patologia, el metge de família **no ha d'emetre part de baixa IT**. Ha d'informar la treballadora que:
   - Comuniqui la situació a l'empresa (per escrit)
   - L'empresa ha d'adoptar mesures preventives o canviar-la de lloc
   - Si l'empresa no pot, ha de sol·licitar la prestació per risc durant la lactància a la mútua

3. **Quan emetre part de baixa IT**: Si la treballadora té una patologia (mastitis, depressió postpart, etc.) que li impedeix treballar, el metge de família ha d'emetre el part de baixa IT per contingència comuna, independent de si amamanta o no.

**Procediment de sol·licitud de la prestació per risc durant la lactància:**
1. La treballadora comunica la situació a l'empresa
2. L'empresa intenta adaptar el lloc de treball o canviar-la de lloc
3. Si no és possible, l'empresa sol·licita la prestació a la mútua
4. La mútua avalua el risc i, si el confirma, reconeix la prestació
5. La treballadora percep el 100% de la BR fins que el fill compleix 9 mesos`,
  examples: `**Exemple 1: Risc durant la lactància (NO IT)**
Treballadora que amamanta el seu fill de 3 mesos. Treballa com a tècnica de laboratori amb exposició a agents químics. Sense cap patologia clínica. L'empresa no pot canviar-la de lloc. Sol·licita la prestació per risc durant la lactància a la mútua. Percep el 100% de la BR fins que el fill compleix 9 mesos. El metge de família emet un informe de lactància (no un part de baixa IT).

**Exemple 2: IT per mastitis (no risc durant la lactància)**
Treballadora que amamanta el seu fill de 2 mesos. Desenvolupa una mastitis aguda que li impedeix treballar. El metge de família emet un part de baixa IT per contingència comuna (diagnòstic: mastitis). Percep el 60%/75% de la BR. No és una prestació per risc durant la lactància (la causa és mèdica, no laboral).

**Exemple 3: Permís de lactància vs. prestació per risc durant la lactància**
Treballadora que amamanta el seu fill de 6 mesos. Treballa en torn de nit en una fàbrica. Vol saber quins drets té:
- **Permís de lactància** (ET art. 37.4): Pot demanar 1 hora diària d'absència o acumular-la en 15 dies laborables. No és una prestació econòmica de la SS.
- **Prestació per risc durant la lactància**: Si el torn de nit és incompatible amb la lactància (per exemple, per l'exposició a agents nocturns), pot sol·licitar la prestació a la mútua (100% BR fins als 9 mesos del fill).

**Exemple 4: Situació mixta (risc durant la lactància + IT posterior)**
Treballadora percebent la prestació per risc durant la lactància (100% BR). Causa baixa per IT per una gastroenteritis aguda. La prestació per risc durant la lactància se suspèn i s'inicia la IT (60%/75% BR). Quan rep l'alta per IT, torna a percebre la prestació per risc durant la lactància (si el fill encara no ha complert 9 mesos).`,
};

try {
  for (const cas of [cas1, cas2]) {
    await db.execute(
      `INSERT INTO special_cases (id, title, description, category, legalBasis, \`procedure\`, examples)
       VALUES (?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         title = VALUES(title),
         description = VALUES(description),
         category = VALUES(category),
         legalBasis = VALUES(legalBasis),
         \`procedure\` = VALUES(\`procedure\`),
         examples = VALUES(examples)`,
      [cas.id, cas.title, cas.description, cas.category, cas.legalBasis, cas.procedure, cas.examples]
    );
    console.log(`✅ Cas especial ${cas.id} inserit: ${cas.title}`);
  }

  const [rows] = await db.execute('SELECT id, title, category FROM special_cases WHERE id IN (90003, 90004)');
  console.log('\n📋 Verificació:');
  rows.forEach(r => console.log(`  - ID ${r.id}: ${r.title} [${r.category}]`));

  const [total] = await db.execute('SELECT COUNT(*) as total FROM special_cases');
  console.log(`\n📊 Total de casos especials a la BD: ${total[0].total}`);
} catch (err) {
  console.error('❌ Error:', err.message);
} finally {
  await db.end();
}
