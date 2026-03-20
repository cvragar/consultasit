import mysql from "mysql2/promise";
import * as dotenv from "dotenv";
dotenv.config();

const connection = await mysql.createConnection(process.env.DATABASE_URL);

const content = `## Resum executiu per al metge de família

La **Llei Orgànica 1/2023, de 28 de febrer** (BOE núm. 51, 01/03/2023, en vigor des del **1 de juny de 2023**) introdueix tres noves **situacions especials d'IT per contingències comunes** que modifiquen la LGSS (art. 169, 172 i 173):

1. **Menstruació incapacitant secundària** (dismenorrea secundària per patologia diagnosticada)
2. **Interrupció de l'embaràs** (voluntària o no)
3. **Gestació des del primer dia de la setmana 39**

---

## 1. Menstruació incapacitant secundària

### Definició legal (art. 2.6 LO 1/2023)

> «Situació d'incapacitat derivada d'una dismenorrea generada per una **patologia prèviament diagnosticada**.»

**Clau:** NO és la dismenorrea primària (dolor menstrual sense causa orgànica). Cal una patologia de base diagnosticada.

### Patologies reconegudes

| Patologia | Freqüència |
|---|---|
| Endometriosi | Causa més freqüent (infradiagnosticada) |
| Adenomiosi | Freqüent |
| Miomes uterins | Freqüent |
| Malaltia inflamatòria pèlvica (MIP) | Moderada |
| Quists ovàrics | Moderada |
| Pòlips endometrials | Menys freqüent |
| Ovaris poliquístics (SOP) | Menys freqüent |
| Estenosi cervical | Menys freqüent |

### Règim econòmic (art. 173 LGSS modificat)

- **Qui paga:** La Seguretat Social des del **primer dia de la baixa** (sense franquícia empresarial)
- **Quantia:** 60% de la base reguladora (dies 4-20) / 75% (des del dia 21)
- **Períodes mínims de cotització:** **NO s'exigeixen** (art. 172 LGSS modificat)
- **Recaiguda:** Cada procés es considera **nou** (no computa per al màxim de 365 dies)

### Protocol de gestió a Catalunya

**Qui pot emetre la baixa:**
- Metge/essa de capçalera (CAP) — via habitual
- Ginecòleg/a de l'ASSIR (Atenció a la Salut Sexual i Reproductiva) — via alternativa

**Requisits per emetre la baixa:**
1. Diagnòstic previ de dismenorrea secundària per patologia orgànica
2. Ecografia vaginal (preferent) o valoració del grau de dolor incapacitant
3. Símptomes que impedeixin les activitats de la vida diària

**Diferència amb el protocol estatal:**
A Catalunya, els ginecòlegs de l'ASSIR poden emetre directament la baixa, a diferència d'altres CCAA on només ho pot fer el metge de família. Això agilitza el procés per a pacients que ja seguiment ginecològic.

**Dades d'aplicació a Catalunya (juny 2023 – gener 2025):**
- 316 baixes tramitades en 580 dies (aprox. 1 cada 2 dies)
- Molt per sota de les estimacions inicials (60.000 anuals a tot l'Estat)
- Causes del baix ús: estigma social, desconeixement de la llei, tractament hormonal previ

### Graus del dolor menstrual (classificació clínica)

| Grau | Característiques | Tractament |
|---|---|---|
| **Lleu** | 1 dia, sense necessitat d'analgèsia | Observació |
| **Moderat** | 2-3 dies, nàusees/vòmits, requereix AINE | AINE preventiu |
| **Greu** | Molt intens, no remet amb AINE, afecta vida diària | Ginecologia + possible baixa |

### Casos pràctics

**Cas 1 — Endometriosi diagnosticada:**
Treballadora amb endometriosi diagnosticada per ecografia. Cada mes té 2 dies de dolor greu incapacitant. El metge de capçalera emet part de baixa per menstruació incapacitant secundària. La SS paga des del primer dia. Cada baixa és un procés nou (no acumula per als 365 dies).

**Cas 2 — Sense diagnòstic previ:**
Treballadora amb dolor menstrual intens però sense diagnòstic de patologia orgànica. **No pot acollir-se a aquesta situació especial.** Ha d'anar al ginecòleg per fer una ecografia i obtenir el diagnòstic. Fins que no tingui el diagnòstic, si causa baixa serà IT ordinària per contingència comuna (paga l'empresa dies 4-15).

**Cas 3 — Dismenorrea primària (NO cobert):**
Adolescent amb dolor menstrual intens sense causa orgànica identificada. Dismenorrea primària. No té dret a la situació especial. Tractament: AINE, anticonceptius hormonals.

---

## 2. Interrupció de l'embaràs (voluntària o no)

### Règim econòmic (art. 173 LGSS modificat)

- **Qui paga:** La Seguretat Social des del **dia següent a la baixa** (l'empresa paga el dia de la baixa)
- **Quantia:** 60% BR (dies 4-20) / 75% BR (des del dia 21)
- **Períodes mínims de cotització:** **NO s'exigeixen**
- **Excepció:** Si la interrupció és per accident de treball o malaltia professional → IT per contingències professionals (75% BR des del dia següent)

---

## 3. Gestació des de la setmana 39

### Règim econòmic (art. 173 LGSS modificat)

- **Qui paga:** La Seguretat Social des del **dia següent a la baixa** (l'empresa paga el dia de la baixa)
- **Durada:** Des de l'inici de la baixa fins a la **data del part**
- **Excepció:** Si la treballadora ja tenia risc durant l'embaràs → continua percebent la prestació per risc durant l'embaràs
- **Períodes mínims de cotització:** Els mateixos que per al permís per naixement (art. 178.1 LGSS)

---

## Taula comparativa de les tres situacions especials

| Concepte | Menstruació incapacitant | Interrupció embaràs | Gestació setmana 39 |
|---|---|---|---|
| **Qui paga des del dia 1** | Seguretat Social | Seguretat Social (dia 2) | Seguretat Social (dia 2) |
| **Cotització mínima** | No s'exigeix | No s'exigeix | Art. 178.1 LGSS |
| **Recaiguda** | Cada procés és nou | Règim general | Règim general |
| **Durada màxima** | No computa per als 365 dies | Règim general | Fins al part |
| **Contingència** | Comuna | Comuna (o prof. si AT/EP) | Comuna |

---

## Base legal

- **Llei Orgànica 1/2023, de 28 de febrer** (BOE-A-2023-5364): art. 5 ter, Disposició Final Tercera
- **LGSS art. 169.1.a)** (modificat): definició de les tres situacions especials
- **LGSS art. 172** (modificat): beneficiaris, sense cotització mínima per a menstruació i interrupció
- **LGSS art. 173** (modificat): naixement i durada del dret al subsidi
- **LGSS art. 144.4** (modificat): obligació de cotitzar durant les situacions especials
- **Entrada en vigor:** 1 de juny de 2023 (3 mesos des de la publicació)
`;

const tags = JSON.stringify([
  "Llei 1/2023",
  "menstruació incapacitant",
  "dismenorrea secundària",
  "endometriosi",
  "IT especial",
  "contingència comuna",
  "primer dia SS",
  "sense cotització mínima",
  "interrupció embaràs",
  "setmana 39",
  "protocol Catalunya",
  "ASSIR",
  "ginecòleg",
  "metge família",
  "LGSS art. 169",
  "LGSS art. 172",
  "LGSS art. 173",
]);

await connection.execute(
  `UPDATE documents SET 
    title = ?,
    content = ?,
    tags = ?,
    publicationYear = ?,
    url = ?,
    status = ?
  WHERE id = 17`,
  [
    "Llei Orgànica 1/2023 - Menstruació incapacitant i situacions especials d'IT",
    content,
    tags,
    2023,
    "https://www.boe.es/buscar/act.php?id=BOE-A-2023-5364",
    "vigent",
  ]
);

const [rows] = await connection.execute(
  "SELECT id, title, LENGTH(content) as len FROM documents WHERE id = 17"
);
console.log("Document actualitzat:", rows[0]);
await connection.end();
