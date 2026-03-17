/**
 * Script per convertir els camps `examples` que estan en format JSON array
 * a text pla en format Markdown llegible.
 * 
 * Format JSON d'entrada:
 * [{"title": "...", "description": "...", "resolution": "..."}, ...]
 * 
 * Format de sortida (text pla Markdown):
 * **Exemple 1: Títol**
 * Descripció...
 * 
 * **Resolució:** Resolució...
 */

import { createConnection } from 'mysql2/promise';
import * as dotenv from 'dotenv';
dotenv.config();

const conn = await createConnection(process.env.DATABASE_URL);

// Obtenir tots els casos amb examples en format JSON
const [rows] = await conn.execute(
  "SELECT id, title, examples FROM special_cases WHERE examples LIKE '[%' ORDER BY id"
);

console.log(`Processant ${rows.length} casos amb examples en format JSON...\n`);

let updated = 0;

for (const row of rows) {
  let parsed;
  try {
    parsed = JSON.parse(row.examples);
  } catch (e) {
    console.log(`ERROR parsejant ID ${row.id}: ${e.message}`);
    continue;
  }

  if (!Array.isArray(parsed)) {
    console.log(`ID ${row.id}: examples no és un array, saltant...`);
    continue;
  }

  // Convertir a text pla Markdown
  const textLines = [];
  
  parsed.forEach((item, idx) => {
    const num = idx + 1;
    
    // Suport per a múltiples formats de claus
    const title = item.title || item.titol || item.nom || `Exemple ${num}`;
    const description = item.description || item.descripcio || item.situacio || item.situació || '';
    const resolution = item.resolution || item.resolucio || item.resolució || item.result || '';
    const notes = item.notes || item.nota || '';
    
    textLines.push(`**Exemple ${num}: ${title}**`);
    if (description) textLines.push(`${description}`);
    if (resolution) textLines.push(`\n**Resolució:** ${resolution}`);
    if (notes) textLines.push(`\n*Nota: ${notes}*`);
    textLines.push(''); // línia en blanc entre exemples
  });

  const newText = textLines.join('\n').trim();
  
  console.log(`ID ${row.id} | ${row.title}`);
  console.log(`  Exemples: ${parsed.length}`);
  console.log(`  Preview nou text: ${newText.substring(0, 150)}...`);
  
  await conn.execute(
    'UPDATE special_cases SET examples = ? WHERE id = ?',
    [newText, row.id]
  );
  updated++;
}

console.log(`\n✅ Actualitzats ${updated} casos especials.`);

await conn.end();
