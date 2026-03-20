import { createConnection } from 'mysql2/promise';
import * as dotenv from 'dotenv';
dotenv.config();

const db = await createConnection(process.env.DATABASE_URL);

const cas = {
  id: 90005,
  title: "IT prèvia al part i permís per naixement i cura de menor (16 setmanes)",
  description: `**Situació freqüent que genera dubtes sobre quan s'inicia el permís parental i com es calcula la prestació**

Des de la reforma del RDL 6/2019 (en vigor des del 1 d'abril de 2019 per al segon progenitor i des del 2021 per a ambdós), el permís per **naixement i cura de menor** és de **16 setmanes** per a cada progenitor (mare i pare/segon progenitor), de manera individual i intransferible.

**Quan la mare és de baixa per IT quan es produeix el part:**
Si la mare estava de baixa per IT (per exemple, per embaràs de risc) quan es produeix el part, la IT s'extingeix automàticament i s'inicia el permís per naixement i cura de menor. La mare **no pot acumular** la IT i el permís parental: el part posa fi a la IT i inicia el permís.

**Base reguladora del permís parental vs. base reguladora de la IT:**
La base reguladora del permís per naixement i cura de menor es calcula de manera diferent a la IT:
- **IT**: 60% de la BR els dies 4-20, 75% des del dia 21
- **Permís parental (prestació per maternitat/paternitat)**: **100% de la BR** des del primer dia

Això significa que si la mare estava de baixa per IT (percebent el 75% de la BR) i es produeix el part, passarà a percebre el **100% de la BR** durant les 16 setmanes del permís.

**Situació especial: IT durant el permís parental**
Durant el permís per naixement i cura de menor **no es reconeix una situació d'IT**, excepte si la prestació per naixement es compatibilitza amb el treball a temps parcial (cas molt poc freqüent). Si el progenitor emmalalteix durant el permís parental, no pot causar baixa per IT fins que acabi el permís.`,
  category: "embarazo",
  legalBasis: `**Normativa aplicable:**
- ET art. 48.4 i 48.5: Permís per naixement i cura de menor (16 setmanes per a cada progenitor)
- LGSS art. 177-182 bis: Prestació per naixement i cura de menor (100% BR)
- RDL 6/2019, de 1 de març: Mesures urgents per a la igualtat real entre dones i homes (reforma del permís de paternitat fins a 16 setmanes)
- RD 295/2009, art. 2-25: Regulació de la prestació per maternitat/paternitat
- LGSS art. 177.2: Extinció de la IT quan es produeix el part (inici automàtic del permís parental)
- LGSS art. 178: Base reguladora de la prestació per naixement (100% de la BR, contingència comuna o professional)
- Llei Orgànica 3/2007, art. 44: Permís de paternitat (antecedent de la reforma de 2019)

**Criteri INSS sobre IT durant el permís parental:**
- Durant el permís per naixement i cura de menor NO es reconeix la IT (LGSS art. 177.4)
- Excepció: si el progenitor treballa a temps parcial durant el permís (cas molt infreqüent)
- Si el progenitor emmalalteix durant el permís, ha d'esperar a l'alta del permís per causar baixa per IT`,
  procedure: `**Procediment per al metge de família (eCap) quan la mare és de baixa per IT i es produeix el part:**

1. **Emissió de l'alta mèdica per IT**: Quan la mare ingressa per part o es produeix el part, el metge de família (o el facultatiu que atén el part) ha d'emetre l'alta mèdica de la IT. L'alta es pot emetre el mateix dia del part o el dia anterior.

2. **No cal emetre cap document addicional**: El permís per naixement i cura de menor s'inicia automàticament el dia del part (o el dia posterior a l'alta de la IT). La mare ha de sol·licitar la prestació a l'INSS o a la mútua (si és contingència professional).

3. **Situació especial: part prematur o hospitalització del nadó**: Si el nadó és hospitalitzat, les 6 setmanes obligatòries de descans postpart es computen des del part, però les 10 setmanes restants es poden suspendre fins que el nadó rebi l'alta hospitalària.

**Procediment per al segon progenitor (pare/parella):**

El segon progenitor té dret a 16 setmanes de permís per naixement i cura de menor, de les quals les 6 primeres setmanes han de ser immediatament posteriors al part (obligatòries i ininterrompudes). Les 10 setmanes restants es poden gaudir de manera flexible fins que el fill compleixi 12 mesos.

**Quan el segon progenitor és de baixa per IT quan es produeix el part:**
Si el segon progenitor és de baixa per IT quan es produeix el part, pot optar per:
- Mantenir la IT i iniciar el permís parental un cop rep l'alta (les 6 setmanes obligatòries s'han de gaudir immediatament, però si hi ha causa justificada com una IT, l'INSS pot acceptar un inici diferit)
- Sol·licitar l'alta voluntària de la IT per iniciar el permís parental (percebria el 100% de la BR en lloc del 75% de la IT)

**Nota per a l'eCap**: Si el segon progenitor en IT sol·licita l'alta voluntària per iniciar el permís parental, el metge de família pot emetre l'alta mèdica voluntària. La decisió és del treballador, no del metge.`,
  examples: `**Exemple 1: Mare de baixa per IT (embaràs de risc) → part → permís parental**
Mare de baixa per IT per preeclàmpsia des de la setmana 28. Part a la setmana 37. La IT s'extingeix el dia del part. S'inicia el permís per naixement i cura de menor (16 setmanes). La mare passa de percebre el 75% de la BR (IT) al **100% de la BR** (permís parental). El metge de família emet l'alta mèdica de la IT el dia del part.

**Exemple 2: Mare de baixa per IT (setmana 39) → part → permís parental**
Mare de baixa per IT des de la setmana 39 (situació especial de gestació, 100% BR). Part a la setmana 40. La IT s'extingeix el dia del part. S'inicia el permís per naixement i cura de menor (16 setmanes, 100% BR). En aquest cas no hi ha canvi en la quantia de la prestació (ja era el 100% de la BR).

**Exemple 3: Segon progenitor de baixa per IT → part de la parella → dilema**
Pare de baixa per IT per fractura de turmell (percep el 75% de la BR). La seva parella dóna a llum. Té dues opcions:
- **Opció A**: Mantenir la IT. Les 6 setmanes obligatòries del permís parental s'inicien quan rep l'alta de la IT. Risc: pot perdre part del permís si la IT s'allarga.
- **Opció B**: Sol·licitar l'alta voluntària de la IT i iniciar el permís parental (100% BR). Més avantatjós econòmicament si la IT és de llarga durada.
El metge de família pot emetre l'alta voluntària si el pare ho sol·licita.

**Exemple 4: IT durant el permís parental (NO possible)**
Progenitor en permís per naixement i cura de menor (setmana 8 de les 16). Desenvolupa una grip amb complicacions que li impedeix cuidar el nadó. El metge de família **no pot emetre un part de baixa IT** durant el permís parental (LGSS art. 177.4). El permís parental continua i s'extingeix als 16 setmanes. Un cop acabat el permís, si segueix malalt, pot causar baixa per IT.

**Exemple 5: Part prematur i hospitalització del nadó**
Part prematur a la setmana 30. El nadó és hospitalitzat a la UCI neonatal. Les 6 setmanes obligatòries de descans postpart es computen des del part. Les 10 setmanes restants es poden suspendre fins que el nadó rebi l'alta hospitalària. La mare pot reprendre el treball (si ho desitja) durant la hospitalització del nadó i gaudir de les 10 setmanes restants quan el nadó arribi a casa.`,
};

try {
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

  const [rows] = await db.execute('SELECT id, title, category FROM special_cases WHERE id = 90005');
  console.log('\n📋 Verificació:');
  rows.forEach(r => console.log(`  - ID ${r.id}: ${r.title} [${r.category}]`));

  const [total] = await db.execute('SELECT COUNT(*) as total FROM special_cases');
  console.log(`\n📊 Total de casos especials a la BD: ${total[0].total}`);
} catch (err) {
  console.error('❌ Error:', err.message);
} finally {
  await db.end();
}
