import { createConnection } from 'mysql2/promise';
import * as dotenv from 'dotenv';
dotenv.config();

const conn = await createConnection(process.env.DATABASE_URL);

// Obtenir tots els casos especials
const [rows] = await conn.execute(
  'SELECT id, title, category, examples, `procedure`, legal_basis FROM special_cases ORDER BY id'
);

console.log('=== DETECTANT CAMPS AMB JSON ESCAPAT ===\n');

const problematic = [];

for (const row of rows) {
  const fields = { examples: row.examples, procedure: row.procedure, legalBasis: row.legal_basis };
  let hasIssue = false;
  
  for (const [fieldName, value] of Object.entries(fields)) {
    if (!value) continue;
    
    // Detectar si el valor comença amb [ o { (JSON array/object) o conté \u00 (unicode escapat)
    const isJsonArray = value.trim().startsWith('[');
    const isJsonObject = value.trim().startsWith('{');
    const hasEscapedUnicode = value.includes('\\u00');
    
    if (isJsonArray || isJsonObject || hasEscapedUnicode) {
      if (!hasIssue) {
        console.log(`\nID: ${row.id} | ${row.category} | ${row.title}`);
        hasIssue = true;
        problematic.push(row.id);
      }
      console.log(`  CAMP: ${fieldName}`);
      console.log(`  isJsonArray: ${isJsonArray}, isJsonObject: ${isJsonObject}, hasEscapedUnicode: ${hasEscapedUnicode}`);
      console.log(`  Preview: ${value.substring(0, 150)}`);
    }
  }
}

if (problematic.length === 0) {
  console.log('Cap camp amb problemes detectat!');
} else {
  console.log(`\n=== TOTAL: ${problematic.length} casos amb problemes: IDs ${problematic.join(', ')} ===`);
}

await conn.end();
