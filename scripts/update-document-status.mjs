/**
 * Script per actualitzar els documents existents amb:
 * - publicationYear: any de publicació del document
 * - status: estat de vigència (vigent, derogada, en_revisio)
 *
 * Criteri d'assignació:
 * - Documents amb normativa anterior a 2010 → en_revisio (pot estar parcialment derogada)
 * - Documents derogats explícitament → derogada
 * - Resta → vigent
 */
import mysql from "mysql2/promise";
import dotenv from "dotenv";
dotenv.config();

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error("ERROR: DATABASE_URL no definit");
  process.exit(1);
}

const connection = await mysql.createConnection(DATABASE_URL);

// Mapa de documents amb any de publicació i estat coneguts
// Basat en el contingut dels documents (títols i fonts)
const documentUpdates = [
  // Normativa estatal vigent
  { titlePattern: "Real Decreto 625/2014", year: 2014, status: "vigent" },
  { titlePattern: "Reial Decret 625/2014", year: 2014, status: "vigent" },
  { titlePattern: "Ley General de la Seguridad Social", year: 2015, status: "vigent" },
  { titlePattern: "LGSS", year: 2015, status: "vigent" },
  { titlePattern: "Real Decreto Legislativo 8/2015", year: 2015, status: "vigent" },
  { titlePattern: "Reial Decret Legislatiu 8/2015", year: 2015, status: "vigent" },
  { titlePattern: "Estatuto de los Trabajadores", year: 2015, status: "vigent" },
  { titlePattern: "Estatut dels Treballadors", year: 2015, status: "vigent" },
  { titlePattern: "Real Decreto 1430/2009", year: 2009, status: "vigent" },
  { titlePattern: "Reial Decret 1430/2009", year: 2009, status: "vigent" },
  { titlePattern: "Ley 6/2017", year: 2017, status: "vigent" },
  { titlePattern: "Llei 6/2017", year: 2017, status: "vigent" },
  // Guies i manuals ICS / Departament de Salut
  { titlePattern: "ICS", year: 2022, status: "vigent" },
  { titlePattern: "Departament de Salut", year: 2023, status: "vigent" },
  { titlePattern: "CatSalut", year: 2023, status: "vigent" },
  { titlePattern: "eCap", year: 2023, status: "vigent" },
  // Guies INSS
  { titlePattern: "INSS", year: 2023, status: "vigent" },
  { titlePattern: "Guia de gestió", year: 2023, status: "vigent" },
  { titlePattern: "Guía de gestión", year: 2023, status: "vigent" },
  // Normativa antiga (possible derogació parcial)
  { titlePattern: "Real Decreto 575/1997", year: 1997, status: "derogada" },
  { titlePattern: "Reial Decret 575/1997", year: 1997, status: "derogada" },
  { titlePattern: "Orden de 13 de octubre de 1967", year: 1967, status: "derogada" },
  { titlePattern: "Ordre de 13 d'octubre de 1967", year: 1967, status: "derogada" },
  { titlePattern: "Decreto 3158/1966", year: 1966, status: "derogada" },
  { titlePattern: "Decret 3158/1966", year: 1966, status: "derogada" },
  // Normativa en revisió
  { titlePattern: "Real Decreto 84/1996", year: 1996, status: "en_revisio" },
  { titlePattern: "Reial Decret 84/1996", year: 1996, status: "en_revisio" },
  { titlePattern: "Real Decreto 2064/1995", year: 1995, status: "en_revisio" },
  { titlePattern: "Reial Decret 2064/1995", year: 1995, status: "en_revisio" },
];

// Obtenir tots els documents
const [rows] = await connection.execute("SELECT id, title, source FROM documents");
console.log(`Total documents: ${rows.length}`);

let updated = 0;
let skipped = 0;

for (const doc of rows) {
  let matchedYear = null;
  let matchedStatus = "vigent";

  // Intentar trobar coincidència per títol
  for (const update of documentUpdates) {
    if (doc.title.toLowerCase().includes(update.titlePattern.toLowerCase())) {
      matchedYear = update.year;
      matchedStatus = update.status;
      break;
    }
  }

  // Si no hi ha coincidència per títol, intentar extreure l'any del títol
  if (!matchedYear) {
    // Cercar patrons d'any (4 dígits entre 1950 i 2026)
    const yearMatch = doc.title.match(/\b(19[5-9]\d|20[0-2]\d)\b/);
    if (yearMatch) {
      matchedYear = parseInt(yearMatch[1]);
      // Assignar estat basat en l'any
      if (matchedYear < 2000) {
        matchedStatus = "en_revisio";
      } else if (matchedYear < 2010) {
        matchedStatus = "en_revisio";
      } else {
        matchedStatus = "vigent";
      }
    }
  }

  // Si encara no hi ha any, usar l'any de creació del document
  if (!matchedYear) {
    // Usar l'any actual com a fallback per a documents sense any identificable
    matchedYear = null; // Deixar null si no es pot determinar
    matchedStatus = "vigent"; // Per defecte vigent
  }

  // Actualitzar el document
  await connection.execute(
    "UPDATE documents SET publicationYear = ?, status = ? WHERE id = ?",
    [matchedYear, matchedStatus, doc.id]
  );

  if (matchedYear) {
    console.log(`✓ Doc ${doc.id}: "${doc.title.substring(0, 60)}..." → any: ${matchedYear}, estat: ${matchedStatus}`);
    updated++;
  } else {
    console.log(`~ Doc ${doc.id}: "${doc.title.substring(0, 60)}..." → sense any, estat: ${matchedStatus}`);
    skipped++;
  }
}

console.log(`\nResum: ${updated} documents actualitzats amb any, ${skipped} sense any identificable`);
await connection.end();
