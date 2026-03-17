import { createConnection } from 'mysql2/promise';
import * as dotenv from 'dotenv';
dotenv.config();

const conn = await createConnection(process.env.DATABASE_URL);

// Consultar els camps examples i procedure dels casos de pluriempleo
const [rows] = await conn.execute(
  'SELECT id, title, LEFT(examples, 300) as ex_preview, LEFT(`procedure`, 300) as proc_preview FROM special_cases WHERE category = "pluriempleo" LIMIT 5'
);

console.log('=== PLURIEMPLEO CASES ===');
for (const row of rows) {
  console.log(`\nID: ${row.id} | ${row.title}`);
  console.log('examples (first 300):', row.ex_preview);
  console.log('procedure (first 300):', row.proc_preview);
}

// Consultar també alguns casos d'altres categories per veure si el problema és general
const [rows2] = await conn.execute(
  'SELECT id, title, category, LEFT(examples, 200) as ex_preview FROM special_cases WHERE examples IS NOT NULL AND examples != "" LIMIT 10'
);

console.log('\n=== ALL CATEGORIES - examples preview ===');
for (const row of rows2) {
  console.log(`\nID: ${row.id} | ${row.category} | ${row.title}`);
  console.log('examples:', row.ex_preview);
}

await conn.end();
