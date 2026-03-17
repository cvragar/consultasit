/**
 * Script per convertir els camps `legalBasis` que estan en format JSON array
 * a text pla en format Markdown llegible.
 * 
 * Format JSON d'entrada: ["Llei 20/2007, art. 26...", "LGSS art. 156...", ...]
 * Format de sortida: - Llei 20/2007, art. 26...\n- LGSS art. 156...\n...
 */

import { createConnection } from 'mysql2/promise';
import * as dotenv from 'dotenv';
dotenv.config();

const conn = await createConnection(process.env.DATABASE_URL);

// Obtenir tots els casos amb legalBasis en format JSON
const [rows] = await conn.execute(
  "SELECT id, title, legalBasis FROM special_cases WHERE legalBasis LIKE '[%' ORDER BY id"
);

console.log(`Processant ${rows.length} casos amb legalBasis en format JSON...\n`);

let updated = 0;

for (const row of rows) {
  let parsed;
  try {
    parsed = JSON.parse(row.legalBasis);
  } catch (e) {
    console.log(`ERROR parsejant ID ${row.id}: ${e.message}`);
    continue;
  }

  if (!Array.isArray(parsed)) {
    console.log(`ID ${row.id}: legalBasis no és un array, saltant...`);
    continue;
  }

  // Convertir a text pla Markdown (llista de punts)
  const textLines = parsed.map(item => `- ${item}`);
  const newText = textLines.join('\n').trim();
  
  console.log(`ID ${row.id} | ${row.title}`);
  console.log(`  ${parsed.length} entrades de base legal`);
  console.log(`  Preview: ${newText.substring(0, 200)}...`);
  
  await conn.execute(
    'UPDATE special_cases SET legalBasis = ? WHERE id = ?',
    [newText, row.id]
  );
  updated++;
}

// Verificar si hi ha altres camps amb JSON escapat (procedure)
const [rows2] = await conn.execute(
  "SELECT id, title, LEFT(`procedure`, 100) as proc FROM special_cases WHERE `procedure` LIKE '[%' ORDER BY id"
);

if (rows2.length > 0) {
  console.log(`\nTambé hi ha ${rows2.length} casos amb procedure en format JSON:`);
  for (const r of rows2) {
    console.log(`  ID ${r.id}: ${r.proc}`);
  }
}

console.log(`\n✅ Actualitzats ${updated} casos especials (legalBasis).`);

await conn.end();
