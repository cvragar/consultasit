import { createConnection } from 'mysql2/promise';
import * as dotenv from 'dotenv';
dotenv.config();

const db = await createConnection(process.env.DATABASE_URL);

// CAS 1: IT durant embaràs de risc vs. prestació per risc durant l'embaràs
const cas1 = {
  id: 90001,
  title: "IT durant embaràs de risc vs. prestació per risc durant l'embaràs",
  description: `**Distinció fonamental que genera confusió freqüent al metge de família**

Existeixen dues situacions completament diferents que afecten treballadores embarassades i que requereixen tramitacions, prestacions i gestors distints. Confondre-les és un error habitual que pot perjudicar la treballadora.

**Embaràs de risc (IT per contingència comuna)**
Es produeix quan la pròpia gestació presenta complicacions clíniques (hipertensió, diabetis gestacional, amenaça d'avortament, gestació múltiple, etc.) que impedeixen treballar. La causa és **mèdica**, no laboral. El metge de família emet el part de baixa com a IT per contingència comuna. La treballadora percep el 60% de la base reguladora des del 4t dia (o el 75% a partir del dia 21).

**Risc durant l'embaràs (prestació específica)**
Es produeix quan les **condicions del lloc de treball** (agents químics, radiacions, esforç físic, postures, horaris nocturns, etc.) posen en risc la salut de la mare o el fetus. La causa és **laboral-preventiva**, no clínica. El metge de família NO emet la baixa: és la mútua o l'INSS qui certifica el risc i gestiona la prestació. La treballadora percep el **100% de la base reguladora** des del primer dia.

**Regla pràctica per al metge de família:**
- Si la treballadora ve amb complicació clínica del seu embaràs → emet part de baixa IT (eCap)
- Si la treballadora ve perquè el seu treball és incompatible amb l'embaràs → deriva a la mútua o informa que ha de sol·licitar la prestació per risc durant l'embaràs (no emet part de baixa)`,
  category: "embarazo",
  legalBasis: `**IT per embaràs de risc (contingència comuna):**
- LGSS art. 169: Definició de la situació d'IT
- LGSS art. 172: Durada de la IT (fins a 365 dies + pròrroga fins a 545 dies)
- LGSS art. 173: Base reguladora de la IT (60% dies 4-20, 75% des del dia 21)
- RD 625/2014: Gestió i control dels processos d'IT
- LGSS art. 174: Situació especial d'IT per gestació setmana 39 (des de l'inici de la setmana 39 fins al part)

**Prestació per risc durant l'embaràs:**
- LGSS art. 186: Situació protegida (risc per condicions laborals, no per patologia)
- LGSS art. 187: Prestació econòmica (100% base reguladora, contingència professional)
- RD 295/2009, art. 26-38: Regulació detallada de la prestació per risc durant l'embaràs
- Llei 31/1995 de Prevenció de Riscos Laborals, art. 26: Obligació empresarial de protecció
- Directiva 92/85/CEE: Protecció de la maternitat en el treball`,
  procedure: `**Procediment per al metge de família (eCap) en cas d'embaràs de risc (IT):**

1. **Visita mèdica**: Avaluar la situació clínica de la gestant. Si hi ha patologia que impedeix treballar (hipertensió, diabetis gestacional, amenaça d'avortament, etc.), emetre part de baixa.

2. **Emissió del part de baixa a l'eCap**:
   - Contingència: **Malaltia comuna** (NO accident de treball)
   - Diagnòstic: el codi CIE-10 corresponent a la complicació obstètrica
   - Durada estimada: variable segons la complicació (pot ser fins al part)

3. **Seguiment**: Parts de confirmació cada 7 dies (primers 30 dies) o cada 14 dies (fins al dia 365). La gestant pot continuar amb el seguiment obstètric habitual en paral·lel.

4. **Alta**: Normalment coincideix amb l'inici del permís per naixement i cura de menor (16 setmanes). Si el part es produeix mentre la treballadora és de baixa per IT, l'alta per IT es produeix automàticament i s'inicia el permís de maternitat.

**Quan NO emetre part de baixa (derivar a la mútua):**

Si la treballadora explica que el seu treball és incompatible amb l'embaràs (treballa amb productes químics, radiacions ionitzants, fa esforç físic, treballa en torn de nit, etc.) però **no té cap patologia clínica**, el metge de família NO ha d'emetre part de baixa IT. Ha d'informar la treballadora que:
1. Comuniqui la situació a l'empresa (per escrit)
2. L'empresa ha d'adoptar mesures preventives o canviar-la de lloc
3. Si l'empresa no pot, ha de sol·licitar la prestació per risc durant l'embaràs a la mútua o a l'INSS

**Situació especial: setmana 39 de gestació**
Des de la reforma de la LGSS (Llei 2/2023), a partir de l'inici de la setmana 39 de gestació, la treballadora té dret a una situació especial d'IT per contingència comuna, independentment de si té o no patologia. El metge de família pot emetre el part de baixa des del primer dia de la setmana 39.`,
  examples: `**Exemple 1: Embaràs de risc → IT correcta**
Gestant de 28 setmanes amb diagnòstic de preeclàmpsia lleu (hipertensió + proteinúria). Treballa com a administrativa. El metge de família emet part de baixa IT per contingència comuna (codi CIE-10: O14.0). Percep el 60% de la BR fins al dia 20 i el 75% des del dia 21. La mútua no intervé en la gestió.

**Exemple 2: Risc laboral → prestació per risc durant l'embaràs (NO IT)**
Gestant de 12 setmanes que treballa com a auxiliar d'infermeria en una UCI. Sense cap patologia clínica. Fa esforç físic, mobilitzacions de pacients i pot estar exposada a agents biològics. L'empresa no pot canviar-la de lloc. La treballadora sol·licita la prestació per risc durant l'embaràs a la mútua. Percep el 100% de la BR. El metge de família NO emet part de baixa.

**Exemple 3: Situació mixta (IT + posterior risc durant l'embaràs)**
Gestant de 20 setmanes amb amenaça d'avortament (IT per contingència comuna). Es recupera i es reincorpora. Posteriorment, l'empresa no pot garantir condicions segures. Pot sol·licitar la prestació per risc durant l'embaràs. Si durant la IT sol·licita el canvi a prestació per risc durant l'embaràs, la IT s'extingeix i s'inicia la nova prestació (RD 295/2009, art. 26.2).

**Exemple 4: Setmana 39 (situació especial)**
Gestant de 38+6 setmanes sense patologia. Treballa com a professora. A partir del primer dia de la setmana 39 (39+0), el metge de família pot emetre part de baixa IT per contingència comuna com a "situació especial de gestació". Percep el 100% de la BR (no el 60%/75% habitual) fins al part.`,
};

// CAS 2: Reducció de jornada per guarda legal i IT
const cas2 = {
  id: 90002,
  title: "Reducció de jornada per guarda legal i IT: càlcul de la base reguladora",
  description: `**Situació freqüent que genera dubtes sobre la quantia de la prestació d'IT**

Quan un treballador o treballadora en situació de **reducció de jornada per guarda legal** (art. 37.6 ET) causa baixa per IT, la base reguladora de la prestació es calcula sobre la **base de cotització de la jornada reduïda**, no sobre la jornada completa. Això significa que la prestació d'IT és proporcionalment inferior al que hauria percebut si no hagués reduït la jornada.

**Per què és important per al metge de família?**
El metge de família no calcula la prestació, però és habitual que la treballadora pregunti per la quantia esperada. Cal explicar que la prestació d'IT es calcula sobre el salari real (reduït), no sobre el salari que hauria tingut sense la reducció.

**Excepció important (art. 237.3 LGSS):**
Durant els **tres primers anys** de reducció de jornada per guarda legal, les cotitzacions es computen incrementades fins al 100% a efectes de determinades prestacions (jubilació, incapacitat permanent, mort i supervivència, i naixement i cura de menor). **Però la IT no està inclosa en aquesta excepció**, de manera que la base reguladora de la IT sempre es calcula sobre la cotització real reduïda.

**Controvèrsia judicial:**
Alguns tribunals (STSJ Andalusia 6/6/2019) han declarat discriminatori calcular la IT sobre la base reduïda quan la causa de la baixa està relacionada amb l'embaràs, considerant-ho discriminació indirecta per raó de sexe. Tanmateix, el criteri general de l'INSS és calcular la IT sobre la base de cotització real.`,
  category: "otro",
  legalBasis: `**Normativa aplicable:**
- ET art. 37.6: Dret a la reducció de jornada per guarda legal (menor de 12 anys o persona amb discapacitat)
- LGSS art. 173: Base reguladora de la IT (base de cotització del mes anterior)
- LGSS art. 237.1 i 237.3: Prestació familiar contributiva no econòmica (cotitzacions incrementades al 100% durant 3 anys per a jubilació, IP, mort i supervivència, i naixement i cura de menor, però NO per a IT)
- RD 2064/1995, art. 65.1: Cotització en contractes a temps parcial (aplicable per analogia a la reducció de jornada)
- RD-Llei 2/2023, art. únic.25: Ampliació de 2 a 3 anys del període de cotizació incrementada per guarda legal (en vigor des del 18/3/2023)

**Jurisprudència rellevant:**
- STSJ Andalusia (Sevilla) 6/6/2019 (EDJ 2019/647428): Declara discriminatori calcular la IT sobre la base reduïda quan la causa de la baixa és l'embaràs (discriminació indirecta per raó de sexe)
- STSJ Madrid 5320/2014: Reconeix la prestació completa per IT a treballadora que es reincorpora a jornada completa el darrer dia del mes anterior a la baixa
- STS 23/2026: Protecció del complement d'assistència en situació d'IT (jornada reduïda)`,
  procedure: `**Procediment per al metge de família (eCap):**

El metge de família **no té cap actuació especial** en aquests casos. El part de baixa s'emet de la mateixa manera que qualsevol altra IT, sense que la reducció de jornada afecti el procediment mèdic.

**Informació que pot proporcionar el metge de família a la treballadora:**

1. **Càlcul de la prestació**: La IT es calcula sobre la base de cotització del mes anterior a la baixa. Si la treballadora porta mesos en reducció de jornada, la seva base de cotització és proporcional a les hores treballades.

2. **Exemple pràctic**:
   - Salari a jornada completa: 2.000 €/mes → Base reguladora IT: 66,67 €/dia
   - Reducció del 50% (1.000 €/mes) → Base reguladora IT: 33,33 €/dia
   - Prestació IT (75% des del dia 21): 25,00 €/dia en lloc de 50,00 €/dia

3. **Excepció: baixa el mateix mes que s'inicia la reducció**: Si la treballadora causa baixa el mateix mes en què va iniciar la reducció de jornada, la base reguladora es calcula sobre la cotització del mes anterior (quan encara treballava a jornada completa), de manera que la prestació no es veu reduïda.

4. **Possible reclamació per discriminació**: Si la causa de la baixa és l'embaràs o una patologia relacionada amb el gènere, la treballadora pot al·legar discriminació indirecta per raó de sexe (STSJ Andalusia 2019) per reclamar la prestació calculada sobre la jornada completa. Aquesta reclamació s'ha de fer davant l'INSS o, si és denegada, davant la jurisdicció social.

**Nota per a l'eCap**: El sistema eCap no distingeix entre treballadors a jornada completa i reduïda. El part de baixa s'emet de la mateixa manera. La reducció de jornada és una dada que gestiona l'empresa i la Seguretat Social, no el metge.`,
  examples: `**Exemple 1: Cas estàndard (reducció de jornada + IT)**
Treballadora amb reducció de jornada del 33% (treballa 2/3 de la jornada) per cuidar un fill de 3 anys. Salari reduït: 1.400 €/mes. Causa baixa per lumbàlgia aguda. Base reguladora IT: 1.400/30 = 46,67 €/dia. Prestació IT (75% des del dia 21): 35,00 €/dia. Si no hagués reduït la jornada (salari 2.100 €/mes), hauria percebut 52,50 €/dia.

**Exemple 2: Baixa el mateix mes que s'inicia la reducció**
Treballadora que inicia reducció de jornada el dia 1 de febrer. El dia 15 de febrer causa baixa per IT. La base reguladora es calcula sobre la cotització de **gener** (mes anterior), quan treballava a jornada completa (salari 2.000 €/mes → BR: 66,67 €/dia). La reducció de jornada no afecta la prestació d'IT en aquest cas.

**Exemple 3: Baixa per embaràs amb reducció de jornada (possible discriminació)**
Treballadora amb reducció de jornada del 25% per guarda legal. Causa baixa per amenaça d'avortament (setmana 12). La mútua calcula la IT sobre la base reduïda. La treballadora pot reclamar la prestació calculada sobre la jornada completa al·legant discriminació indirecta per raó de sexe (STSJ Andalusia 6/6/2019). Si l'INSS denega la reclamació, pot acudir a la jurisdicció social.

**Exemple 4: Reducció de jornada i IT de llarga durada**
Treballadora amb reducció de jornada del 50% des de fa 2 anys (fill de 2 anys). Causa baixa per depressió major. La IT es calcula sobre la base reduïda. Quan la IT supera els 365 dies i passa a pròrroga, la base reguladora continua sent la mateixa (la reduïda). Si en algun moment es reconeix incapacitat permanent, les cotitzacions dels 3 primers anys de reducció es computen al 100% (art. 237.3 LGSS), de manera que la IP es calcula sobre una base superior a la IT.`,
};

try {
  // Inserir cas 1
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
    [cas1.id, cas1.title, cas1.description, cas1.category, cas1.legalBasis, cas1.procedure, cas1.examples]
  );
  console.log(`✅ Cas especial ${cas1.id} inserit: ${cas1.title}`);

  // Inserir cas 2
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
    [cas2.id, cas2.title, cas2.description, cas2.category, cas2.legalBasis, cas2.procedure, cas2.examples]
  );
  console.log(`✅ Cas especial ${cas2.id} inserit: ${cas2.title}`);

  // Verificar
  const [rows] = await db.execute('SELECT id, title, category FROM special_cases WHERE id IN (90001, 90002)');
  console.log('\n📋 Verificació:');
  rows.forEach(r => console.log(`  - ID ${r.id}: ${r.title} [${r.category}]`));

  // Total de casos
  const [total] = await db.execute('SELECT COUNT(*) as total FROM special_cases');
  console.log(`\n📊 Total de casos especials a la BD: ${total[0].total}`);

} catch (err) {
  console.error('❌ Error:', err.message);
} finally {
  await db.end();
}
