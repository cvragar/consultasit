/**
 * Script per actualitzar els casos especials (IDs 1-10) al català
 * Executa: node scripts/update-translations-ca.mjs
 */
import { createConnection } from 'mysql2/promise';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { config } from 'dotenv';

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: join(__dirname, '..', '.env') });

const translations = [
  {
    id: 1,
    title: "Menstruació incapacitant",
    description: "Des de l'1 de juny de 2023, les dones amb menstruacions incapacitants poden sol·licitar baixa mèdica per IT. Es considera situació d'incapacitat temporal derivada de malaltia comuna.",
    legalBasis: "Reial Decret-llei 5/2023, de 28 de juny. Article 9 que modifica l'article 169 de la Llei General de la Seguretat Social.",
    procedure: "La baixa l'emet el metge d'atenció primària o ginecòleg del sistema públic de salut. No es requereix període mínim de cotització. La prestació és del 60% de la base reguladora des del primer dia (sense els 3 dies de carència habitual).",
    examples: "Dismenorrea severa, endometriosi simptomàtica, síndrome premenstrual incapacitant."
  },
  {
    id: 2,
    title: "Interrupció voluntària de l'embaràs (IVE)",
    description: "La interrupció voluntària de l'embaràs genera dret a IT des del mateix dia de la intervenció.",
    legalBasis: "Llei Orgànica 2/2010, de 3 de març, de salut sexual i reproductiva i de la interrupció voluntària de l'embaràs.",
    procedure: "El metge que realitza la IVE emet el part de baixa. Es considera contingència comuna. La durada habitual és de 3-7 dies segons el mètode utilitzat i l'evolució clínica.",
    examples: "IVE farmacològica: 3-5 dies. IVE quirúrgica: 5-7 dies. Es pot prolongar si hi ha complicacions."
  },
  {
    id: 3,
    title: "Gestació a partir de la setmana 39",
    description: "A partir de la setmana 39 de gestació, l'embarassada pot sol·licitar la baixa per IT si el seu estat o activitat laboral ho requereixen.",
    legalBasis: "Reial Decret 625/2014. Criteri mèdic basat en risc maternofetal.",
    procedure: "El metge d'atenció primària o ginecòleg valora la situació laboral i l'estat de la gestant. Es considera contingència comuna. La baixa s'estén fins al part.",
    examples: "Treballs de peu prolongats, esforços físics, risc de part prematur, hipertensió gestacional."
  },
  {
    id: 4,
    title: "Donació d'òrgans",
    description: "La donació d'òrgans en vida genera dret a IT com a contingència d'accident no laboral.",
    legalBasis: "Llei 30/1979, de 27 d'octubre, sobre extracció i trasplantament d'òrgans. Reial Decret Legislatiu 8/2015 (LGSS).",
    procedure: "L'hospital on es realitza l'extracció emet el part de baixa. Es considera accident no laboral (contingència comuna amb millors prestacions). La prestació és del 75% des del primer dia. Durada segons l'òrgan donat: ronyó 30-45 dies, fetge 45-60 dies.",
    examples: "Donació de ronyó: 30-45 dies. Donació de lòbul hepàtic: 45-60 dies. Donació de medul·la òssia: 7-15 dies."
  },
  {
    id: 5,
    title: "Baixes retroactives",
    description: "Les baixes amb efecte retroactiu només són possibles en situacions excepcionals i degudament justificades.",
    legalBasis: "Reial Decret 625/2014. Criteri jurisprudencial del Tribunal Suprem.",
    procedure: "Només s'admeten baixes retroactives si: 1) El treballador no va poder acudir al metge per la gravetat del seu estat. 2) Ingrés hospitalari urgent. 3) Situació de força major degudament acreditada. El metge ha de justificar per escrit la impossibilitat d'emetre la baixa en el seu moment. Màxim retroactivitat: 5-7 dies.",
    examples: "Ingrés urgent en UCI, accident amb pèrdua de consciència, impossibilitat física de desplaçament."
  },
  {
    id: 6,
    title: "Pluriocupació",
    description: "El treballador pluriocupat en IT ha de causar baixa en totes les seves ocupacions, encara que la incapacitat només afecti una d'elles.",
    legalBasis: "Article 169 LGSS. Sentència del Tribunal Suprem de 18 de juliol de 2019.",
    procedure: "El metge emet un únic part de baixa. El treballador ha de presentar còpia en totes les seves empreses. La prestació es calcula sobre la base de cotització conjunta de totes les ocupacions. No pot treballar en cap de les ocupacions mentre estigui de baixa.",
    examples: "Treballador amb contracte en dues empreses: si es trenca una cama, ha de causar baixa en ambdues encara que en una treballi només amb ordinador."
  },
  {
    id: 7,
    title: "IT i presó",
    description: "L'ingrés en presó suspèn la prestació per IT, però no extingeix el procés.",
    legalBasis: "Article 169.1.d LGSS. Sentència del Tribunal Suprem de 25 de febrer de 2020.",
    procedure: "Quan el treballador ingressa en presó, la mútua o l'INSS suspèn el pagament de la prestació. El procés d'IT queda en suspens. Si surt de presó abans d'esgotar-se els terminis d'IT, pot reprendre la prestació. El temps en presó no computa per als terminis d'IT.",
    examples: "Treballador en IT per depressió que ingressa en presó preventiva: se suspèn la prestació. Si surt en llibertat provisional, pot reprendre la IT."
  },
  {
    id: 8,
    title: "IT en estrangers",
    description: "Els estrangers amb permís de treball tenen els mateixos drets a IT que els espanyols. Els estrangers sense permís de treball no tenen dret a prestació econòmica, però sí a assistència sanitària.",
    legalBasis: "Llei Orgànica 4/2000 sobre drets i llibertats dels estrangers a Espanya. Reial Decret Legislatiu 8/2015 (LGSS).",
    procedure: "Estrangers amb permís de treball: mateixos requisits i procediment que treballadors espanyols. Estrangers sense permís: el metge pot emetre baixa mèdica per justificar absència laboral, però no hi ha prestació econòmica. Refugiats i sol·licitants d'asil: equiparats a espanyols.",
    examples: "Treballador estranger amb permís de treball: IT normal. Treballador irregular: baixa mèdica sense prestació econòmica."
  },
  {
    id: 9,
    title: "Vacances durant la IT",
    description: "El treballador en IT no pot gaudir de vacances. Si estava de vacances i cau malalt, pot sol·licitar IT i les vacances s'interrompen.",
    legalBasis: "Article 38 de l'Estatut dels Treballadors. Sentència del Tribunal de Justícia de la Unió Europea (TJUE) de 21 de juny de 2012.",
    procedure: "Si el treballador emmalalteix durant les vacances, ha de sol·licitar baixa mèdica immediatament. Les vacances s'interrompen des del dia de la baixa. Els dies de vacances no consumits es poden gaudir posteriorment. Si la IT s'inicia abans de les vacances programades, aquestes s'ajornen.",
    examples: "Treballador de vacances que pateix un accident: sol·licita baixa, les vacances s'interrompen i podrà gaudir-les després de l'alta."
  },
  {
    id: 10,
    title: "Recaiguda en IT",
    description: "Es considera recaiguda quan el treballador torna a causar baixa per la mateixa patologia o relacionada en els 180 dies següents a l'alta.",
    legalBasis: "Article 169 LGSS. Reial Decret 625/2014.",
    procedure: "El metge ha d'indicar al part de baixa que es tracta d'una recaiguda. Els dies de la recaiguda se sumen als del procés anterior per al còmput dels 365 dies. Si el procés anterior havia superat els 365 dies, la competència és de l'INSS des del primer dia de la recaiguda. Si la nova baixa és per patologia diferent, es considera procés nou.",
    examples: "Treballador amb baixa per hèrnia discal 300 dies, alta mèdica, recaiguda als 60 dies: se sumen els dies i queden 65 dies fins als 365. Treballador amb baixa per depressió 200 dies, alta, nova baixa per fractura: procés nou independent."
  }
];

async function updateTranslations() {
  const conn = await createConnection(process.env.DATABASE_URL);
  console.log('Connectat a la base de dades. Actualitzant traduccions...\n');

  let updated = 0;
  for (const t of translations) {
    await conn.execute(
      'UPDATE special_cases SET title = ?, description = ?, legalBasis = ?, `procedure` = ?, examples = ?, updatedAt = NOW() WHERE id = ?',
      [t.title, t.description, t.legalBasis, t.procedure, t.examples, t.id]
    );
    console.log(`✓ ID ${t.id}: "${t.title}"`);
    updated++;
  }

  await conn.end();
  console.log(`\nTotal actualitzats: ${updated} casos especials.`);
}

updateTranslations().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
