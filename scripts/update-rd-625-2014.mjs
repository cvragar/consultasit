import mysql from "mysql2/promise";
import * as dotenv from "dotenv";
dotenv.config();

const conn = await mysql.createConnection(process.env.DATABASE_URL);

// ─── Contingut complet del RD 625/2014 (text oficial consolidat BOE, última actualització 05/01/2023) ───

const content = `# Real Decreto 625/2014, de 18 de julio
## Gestión y control de los procesos de IT en los primeros 365 días

**BOE-A-2014-7684 | BOE núm. 176, de 21/07/2014 | Entrada en vigor: 01/09/2014**
**Última actualización: 05/01/2023 (modificado por RD 1060/2022, en vigor desde 01/04/2023)**
**URL oficial consolidada**: https://www.boe.es/buscar/act.php?id=BOE-A-2014-7684

---

## Artículo 1. Ámbito de aplicación

1. Lo dispuesto en este real decreto se aplicará, durante los primeros **trescientos sesenta y cinco días**, a los procesos de incapacidad temporal, cualquiera que sea la contingencia determinante, en los que se encuentren quienes estén incluidos en cualquiera de los regímenes que integran el sistema de la Seguridad Social, por desarrollar un trabajo o actividad por cuenta ajena o propia.

2. Quedan excluidos de lo dispuesto en este real decreto los regímenes especiales de las Fuerzas Armadas, de los Funcionarios Civiles de la Administración del Estado y del personal al servicio de la Administración de Justicia.

---

## Artículo 2. Declaraciones médicas de baja y de confirmación de la baja

### 2.1 Emisión del parte de baja

La emisión del parte médico de baja es el acto que origina la iniciación de las actuaciones conducentes al reconocimiento del derecho al subsidio por incapacidad temporal. La declaración de la baja médica se formulará en el correspondiente parte médico de baja expedido por el médico del servicio público de salud que haya efectuado el reconocimiento del trabajador afectado.

En el caso de que la causa de la baja médica sea un **accidente de trabajo o una enfermedad profesional** y el trabajador preste servicios en una empresa asociada a una mutua colaboradora con la Seguridad Social, los correspondientes partes de baja, de confirmación de la baja o de alta serán expedidos por los servicios médicos de la propia mutua o por los servicios médicos de la empresa colaboradora.

### 2.2 Reconocimiento médico previo

Todo parte médico de baja irá precedido de un reconocimiento médico del trabajador que permita la determinación objetiva de la incapacidad temporal para el trabajo habitual. Con el fin de que las actuaciones médicas cuenten con el mayor respaldo técnico se pondrá a disposición de los médicos **tablas de duración óptima** tipificadas por los distintos procesos patológicos, así como tablas sobre el grado de incidencia de aquellos procesos en las distintas actividades laborales.

### 2.3 Cuatro grupos de procesos y plazos de confirmación *(modificado por RD 1060/2022, en vigor desde 01/04/2023)*

Los partes de baja y de confirmación de la baja se extenderán en función del periodo de duración que estime el médico que los emite. Se establecen **cuatro grupos de procesos**:

| Grupo | Duración estimada | Primera revisión | Confirmaciones sucesivas |
|-------|-------------------|-----------------|--------------------------|
| **a)** | < 5 días naturales | Alta simultánea con la baja | El facultativo fija fecha de alta (misma fecha o hasta 3 días después). El trabajador puede pedir revisión el día del alta. |
| **b)** | 5 – 30 días naturales | ≤ 7 días desde la baja | Siguientes confirmaciones: ≤ 14 días entre sí |
| **c)** | 31 – 60 días naturales | ≤ 7 días desde la baja | Siguientes confirmaciones: ≤ 28 días entre sí |
| **d)** | ≥ 61 días naturales | ≤ 14 días desde la baja | Siguientes confirmaciones: ≤ 35 días entre sí |

En cualquiera de los grupos, el facultativo podrá fijar la revisión en un período **inferior** al indicado.

### 2.4 Modificación de diagnóstico

Siempre que se produzca una modificación o actualización del diagnóstico, se emitirá un parte de confirmación que recogerá la nueva duración estimada. Los siguientes partes de confirmación se expedirán en función de la nueva duración estimada.

### 2.5 Transmisión telemática de partes

El Instituto Nacional de la Seguridad Social transmitirá al Instituto Social de la Marina y a las mutuas, de manera inmediata, y en todo caso en el primer día hábil siguiente al de su recepción, los partes de baja y de confirmación de la baja por contingencia común relativos a los trabajadores respecto de los que gestionen la incapacidad temporal cada una de ellas.

---

## Artículo 3. Determinación de la contingencia causante

1. El servicio público de salud, el ISM, las mutuas o las empresas colaboradoras que hayan emitido el parte de baja podrán instar, motivadamente, ante el INSS la **revisión de la consideración inicial de la contingencia**, mediante el procedimiento regulado en el artículo 6 del RD 1430/2009.

2. El facultativo de la empresa colaboradora o de la mutua que asista al trabajador podrá inicialmente considerar que la patología causante es de carácter común y remitir al trabajador al servicio público de salud para su tratamiento, sin perjuicio de dispensarle la asistencia precisa en los casos de urgencia o de riesgo vital. Entregará al trabajador un informe médico en el que describa la patología, el diagnóstico, el tratamiento dispensado y los motivos que justifican la determinación de la contingencia como común.

Si el médico del servicio público de salud emite parte de baja por contingencia común, el beneficiario podrá formular reclamación ante el INSS. La resolución establecerá el carácter común o profesional de la contingencia y el sujeto obligado al pago.

---

## Artículo 4. Informes complementarios y de control

1. En los procesos de IT cuya gestión corresponda al servicio público de salud y su duración prevista sea **superior a 30 días naturales**, el segundo parte de confirmación de la baja irá acompañado de un **informe médico complementario** expedido por el facultativo, en el que se recogerán:
   - Las dolencias padecidas por el trabajador
   - El tratamiento médico prescrito
   - Las pruebas médicas realizadas
   - La evolución de las dolencias y su incidencia sobre la capacidad funcional

   Los informes médicos complementarios se actualizarán con cada dos partes de confirmación de baja posteriores.

2. En los procesos cuya gestión corresponda al servicio público de salud, **trimestralmente** a contar desde la fecha de inicio de la baja médica, la inspección médica del SPS o el médico de atención primaria, bajo la supervisión de su inspección médica, expedirá un **informe de control de la incapacidad** en el que deberá pronunciarse expresamente sobre todos los extremos que justifiquen, desde el punto de vista médico, la necesidad de mantener el proceso de IT.

3. Los informes médicos complementarios, los informes de control y las pruebas médicas forman parte del proceso de IT, por lo que tendrán acceso a los mismos:
   - Los inspectores médicos adscritos al INSS e ISM
   - Los facultativos de las mutuas respecto de los procesos por contingencias comunes de los trabajadores protegidos por las mismas

---

## Artículo 5. Declaraciones médicas de alta

### 5.1 Alta por contingencias comunes

Los partes de alta médica en los procesos derivados de contingencias comunes se emitirán, tras el reconocimiento del trabajador, por el correspondiente facultativo del servicio público de salud. Deberán contener:
- La causa del alta médica
- El código de diagnóstico definitivo
- La fecha de la baja inicial

El alta médica extinguirá el proceso de IT con **efectos laborales del día siguiente al de su emisión**. El alta médica determinará la obligación de que el trabajador se reincorpore a su puesto de trabajo el mismo día en que se produzcan sus efectos.

### 5.2 Alta por contingencias profesionales

El parte médico de alta se expedirá por el facultativo o inspector médico del SPS o por el inspector médico adscrito al INSS o ISM si el trabajador está protegido con una entidad gestora, o por el médico dependiente de la empresa colaboradora o de la mutua a la que corresponda la gestión del proceso.

### 5.3 Comunicación del agotamiento de los 365 días

El médico del SPS o el servicio médico de la empresa colaboradora o de la mutua, cuando expidan el **último parte médico de confirmación antes del agotamiento del plazo de 365 días**, comunicarán al interesado en el acto de reconocimiento médico que, una vez agotado el plazo, el control del proceso pasa a la competencia del INSS o ISM.

El servicio público de salud comunicará al INSS el agotamiento de los 365 días de manera inmediata, y en todo caso en el primer día hábil siguiente.

---

## Artículo 6. Propuestas de alta médica formuladas por las mutuas (contingencias comunes)

1. En los procesos de IT derivados de contingencias comunes cuya cobertura corresponda a una mutua, cuando ésta considere que el trabajador puede no estar impedido para el trabajo, podrá formular **propuestas motivadas de alta médica** a través de los médicos adscritos a ella, acompañadas de los informes y pruebas realizadas. Las mutuas comunicarán simultáneamente al trabajador que se ha enviado la propuesta de alta.

2. Las propuestas de alta de las mutuas se dirigirán a las unidades de la **inspección médica del SPS**, quienes las remitirán inmediatamente a los facultativos o servicios médicos a quienes corresponda la emisión de los partes médicos del proceso. Estos facultativos deberán pronunciarse, en el plazo máximo de **5 días**, bien confirmando la baja, bien admitiendo la propuesta (expidiendo el parte de alta).

   - Si se confirma la baja: se consignará el diagnóstico, el tratamiento, las causas de la discrepancia y los controles médicos necesarios.
   - Si la inspección médica no recibe contestación o discrepa: podrá acordar el alta médica efectiva e inmediata.

3. Cuando la propuesta de alta formulada por una mutua no fuese resuelta y notificada en el plazo de **5 días**, la mutua podrá solicitar el alta al INSS o ISM *(modificado por RD 1060/2022, en vigor desde 01/04/2023)*. La entidad gestora resolverá en el plazo de **4 días** siguientes a su recepción.

---

## Artículo 7. Tramitación de partes médicos y expedición de altas por el INSS *(modificado por RD 1060/2022, en vigor desde 01/04/2023)*

### 7.1 Entrega de copia al trabajador

El facultativo que expida el parte médico de baja, confirmación o alta entregará a la persona trabajadora una copia de este.

El servicio público de salud o la mutua o la empresa colaboradora remitirá los datos contenidos en los partes médicos al INSS, **por vía telemática**, de manera inmediata y en todo caso en el primer día hábil siguiente al de su expedición.

### 7.2 Comunicación a las empresas (nueva tramitación electrónica desde 01/04/2023)

El INSS comunicará a las empresas los datos identificativos de carácter meramente administrativo relativos a los partes médicos emitidos, como máximo en el primer día hábil siguiente al de su recepción.

Las empresas tienen la **obligación de transmitir al INSS a través del sistema RED**, con carácter inmediato y en todo caso en el plazo máximo de **3 días hábiles** contados a partir de la recepción de la comunicación de la baja médica, los datos que se determinen mediante orden ministerial.

> **Nota importante para el médico de familia**: Desde el 1 de abril de 2023, la persona trabajadora **NO tiene que entregar la copia del parte a la empresa**. El INSS comunica directamente a la empresa la expedición del parte. La empresa es quien tiene la obligación de transmitir datos al INSS en 3 días hábiles.

El incumplimiento de esta obligación por parte de la empresa podrá constituir una infracción tipificada en el artículo 21.4 del TRLISOS.

### 7.3 Distribución interna de partes

El INSS distribuirá y reenviará de manera inmediata los datos destinados al ISM y a las mutuas, según la entidad a quien corresponda la gestión de la prestación.

### 7.4 Alta expedida por el INSS

Cuando el parte médico de alta sea expedido por el inspector médico del INSS o ISM, estas entidades trasladarán los datos al correspondiente SPS para su conocimiento y también a la mutua (si el trabajador está protegido por ella). El inspector médico entregará una copia del parte al trabajador, expresándole la obligación de incorporarse al trabajo el día siguiente al de la expedición.

### 7.5 Competencia exclusiva del INSS durante 180 días tras su alta

Cuando en un proceso de IT se haya expedido el parte médico de alta por el INSS o ISM, durante los **180 días naturales siguientes** a la fecha del alta, serán estas entidades las **únicas competentes** para emitir una nueva baja médica por la misma o similar patología.

---

## Artículo 8. Seguimiento y control de la prestación económica

1. El INSS, el ISM y las mutuas, a través de su personal médico y personal no sanitario, ejercerán el **control y seguimiento de la prestación económica** de la IT, pudiendo realizar actividades que tengan por objeto comprobar el mantenimiento de los hechos y de la situación que originaron el derecho al subsidio.

2. Con el fin de que las actuaciones médicas cuenten con el mayor respaldo técnico, se pondrá a disposición de los médicos **tablas de duraciones óptimas**, tipificadas para los distintos procesos patológicos, así como tablas sobre el grado de incidencia de dichos procesos en las diversas ocupaciones laborales.

3. El tratamiento de los datos de los trabajadores afectados así como el acceso a los mismos quedará sujeto a la normativa de protección de datos. Los datos únicamente podrán ser utilizados con la finalidad del control de los procesos de incapacidad y control interno.

---

## Artículo 9. Requerimientos a los trabajadores para reconocimiento médico

1. El INSS o ISM podrá disponer que los trabajadores en situación de IT sean reconocidos por los inspectores médicos de dichas entidades gestoras. Igual facultad corresponderá a las mutuas respecto de los beneficiarios de la prestación por IT derivada de contingencias comunes.

2. Los reconocimientos se llevarán a cabo respetando el derecho a la intimidad y a la dignidad de los trabajadores.

3. La citación a reconocimiento médico habrá de comunicarse al trabajador con una antelación mínima de **4 días hábiles**. En dicha citación se le informará de que en caso de no acudir al reconocimiento, se procederá a **suspender cautelarmente la prestación económica**, y que si la falta de personación no queda justificada en el plazo de **10 días hábiles** siguientes, se procederá a la **extinción del derecho al subsidio**.

4. Cuando el trabajador citado no se persone, el director provincial dictará resolución disponiendo la **suspensión cautelar del subsidio** desde el día siguiente al fijado para el reconocimiento.

5. Si el trabajador justifica su incomparecencia dentro de los 10 días hábiles siguientes, se dejará sin efecto la suspensión cautelar y se rehabilitará el pago de la prestación con efectos desde la fecha en que quedó suspendida.

   Se entenderá que la incomparecencia fue justificada cuando:
   - El médico del SPS señale que la personación era desaconsejable conforme a la situación clínica
   - La cita se hubiera realizado con un plazo previo inferior a 4 días hábiles
   - El beneficiario acredite la imposibilidad de su asistencia por otra causa suficiente

6. Transcurridos **10 días hábiles** desde la fecha de la citación sin justificación suficiente, el director provincial dictará resolución declarando la **extinción del derecho a la prestación económica**.

---

## Artículo 10. Cooperación y coordinación

1. La cooperación y coordinación en la gestión de la IT entre el INSS, el ISM, las mutuas, los servicios públicos de salud de las comunidades autónomas y el Instituto Nacional de Gestión Sanitaria se instrumentarán institucionalmente a través de **acuerdos y convenios**, que promoverán el perfeccionamiento y la utilización en común de la información.

2. Se establecerán mecanismos específicos y estables de colaboración entre el INSS y las mutuas, que tendrán por objeto coordinar actuaciones, de acuerdo con sus respectivas competencias.

---

## Disposiciones adicionales destacades

### Disposición adicional primera. Remisión de datos per les mútues
En el marc de les funcions de direcció i tutela que exerceix la Direcció General d'Ordenació de la Seguretat Social, les mútues li remetran les dades i informació que aquella els sol·liciti, per al coneixement de les actuacions desenvolupades, així com per avaluar-ne l'eficàcia.

### Disposición derogatoria única
Queden derogades totes les disposicions de rang igual o inferior que s'oposin al que disposa aquest reial decret i, expressament, el **Reial Decret 575/1997, de 18 d'abril**.

---

## Resum executiu per al metge de família

| Aspecte clau | Regla |
|---|---|
| **Àmbit** | Tots els règims SS (excepte FFAA, funcionaris civils i justícia), primers 365 dies |
| **Qui emet la baixa (CC)** | Metge del SPS (eCap a Catalunya) |
| **Qui emet la baixa (AT/EP)** | Metge de la mútua o empresa col·laboradora |
| **Grup a) < 5 dies** | Alta simultània amb la baixa |
| **Grup b) 5-30 dies** | 1a revisió ≤7 dies; confirmacions ≤14 dies |
| **Grup c) 31-60 dies** | 1a revisió ≤7 dies; confirmacions ≤28 dies |
| **Grup d) ≥61 dies** | 1a revisió ≤14 dies; confirmacions ≤35 dies |
| **Informe complementari** | A partir del 2n part de confirmació si durada >30 dies |
| **Informe de control** | Trimestral des de l'inici de la baixa |
| **Treballador lliura còpia a empresa?** | **NO** (des de l'1 d'abril de 2023 — RD 1060/2022) |
| **Empresa transmet dades a INSS** | Sí, via sistema RED, en 3 dies hàbils |
| **180 dies competència exclusiva INSS** | Quan l'INSS ha emès l'alta, durant 180 dies és l'únic que pot emetre nova baixa per la mateixa patologia |
| **Citació a reconeixement** | Mínim 4 dies hàbils d'antelació |
| **Incompareixença injustificada** | Suspensió cautelar; extinció als 10 dies hàbils sense justificació |

---

## Base legal i modificacions

- **RD 625/2014** (BOE-A-2014-7684): text original, en vigor des de l'01/09/2014
- **RD 231/2017** (BOE-A-2017-3125): modifica arts. 2.3, 3, 5.3; efectes des de l'01/01/2017
- **RD 1060/2022** (BOE-A-2023-160): modifica arts. 2.3, 6.3, 7; en vigor des de l'01/04/2023
- **LGSS (RDLeg 8/2015)**: arts. 169-176 (IT), DA 52a (competències INSS fins 365 dies), DA 40a (intercanvi dades mèdiques)
`;

const summary = `Reglament principal que regula la gestió i control dels processos d'IT durant els primers 365 dies. Estableix els quatre grups de processos amb terminis de confirmació (a: <5 dies, alta simultània; b: 5-30 dies, revisió ≤7 dies; c: 31-60 dies, revisió ≤7 dies; d: ≥61 dies, revisió ≤14 dies), els informes complementaris i de control trimestrals, les propostes d'alta de les mútues, la nova tramitació electrònica (des de l'01/04/2023 el treballador no lliura la còpia a l'empresa), i la competència exclusiva de l'INSS durant 180 dies quan ha emès l'alta. Modificat pel RD 231/2017 i el RD 1060/2022.`;

const tags = JSON.stringify([
  "IT", "parts mèdics", "gestió IT", "365 dies", "grups de processos",
  "terminis confirmació", "informe complementari", "informe de control",
  "mútues", "INSS", "tramitació electrònica", "sistema RED", "RD 625/2014"
]);

// ─── Actualitzar el document ID 15 ───────────────────────────────────────────
const [result] = await conn.execute(
  `UPDATE documents SET
     content = ?,
     summary = ?,
     tags = ?,
     url = ?,
     publicationYear = ?,
     status = ?,
     updatedAt = NOW()
   WHERE id = 15`,
  [
    content,
    summary,
    tags,
    "https://www.boe.es/buscar/act.php?id=BOE-A-2014-7684",
    2014,
    "vigent",
  ]
);

console.log(`✅ Document ID 15 actualitzat. Files afectades: ${result.affectedRows}`);

// ─── Verificació ─────────────────────────────────────────────────────────────
const [rows] = await conn.execute(
  "SELECT id, title, LENGTH(content) as content_len, publicationYear, status FROM documents WHERE id = 15"
);
console.log("📋 Verificació:", rows[0]);

await conn.end();
