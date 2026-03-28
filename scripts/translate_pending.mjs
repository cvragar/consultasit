// Script per traduir els casos especials i documents pendents al castellà
// Executa: node scripts/translate_pending.mjs

import { createConnection } from "mysql2/promise";
import { readFileSync } from "fs";

const DB_URL = process.env.DATABASE_URL;
if (!DB_URL) {
  console.error("DATABASE_URL no definida");
  process.exit(1);
}

const FORGE_URL = process.env.BUILT_IN_FORGE_API_URL;
const FORGE_KEY = process.env.BUILT_IN_FORGE_API_KEY;

async function invokeLLM(messages) {
  const res = await fetch(`${FORGE_URL}/v1/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${FORGE_KEY}`,
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-5",
      messages,
      max_tokens: 4096,
    }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`LLM error: ${err}`);
  }
  const data = await res.json();
  return data.choices[0].message.content;
}

async function translateToSpanish(text, context) {
  if (!text || text.trim() === "") return "";
  const prompt = `Ets un traductor expert en normativa laboral i sanitària espanyola. Tradueix el text següent del català al castellà de manera precisa, mantenint tots els termes tècnics, referències legals (LGSS, ET, RD, etc.), números d'article i format Markdown. NO afegeixis cap comentari ni explicació, retorna ÚNICAMENT la traducció.\n\nContext: ${context}\n\nText a traduir:\n${text}`;
  return await invokeLLM([
    { role: "system", content: "Ets un traductor expert en normativa laboral i sanitària espanyola. Tradueixes del català al castellà mantenint tots els termes tècnics i referències legals." },
    { role: "user", content: prompt },
  ]);
}

async function main() {
  const conn = await createConnection(DB_URL);
  console.log("Connectat a la BD");

  // === CASOS ESPECIALS ===
  const [cases] = await conn.execute(
    "SELECT id, title, description, legalBasis, `procedure`, examples FROM special_cases WHERE titleEs IS NULL OR titleEs = '' OR descriptionEs IS NULL OR descriptionEs = ''"
  );
  console.log(`Casos especials pendents: ${cases.length}`);

  for (const caso of cases) {
    console.log(`\nTraduint cas #${caso.id}: ${caso.title}`);
    const ctx = `Cas especial d'IT: ${caso.title}`;
    const titleEs = await translateToSpanish(caso.title, ctx);
    const descriptionEs = await translateToSpanish(caso.description, ctx);
    const legalBasisEs = await translateToSpanish(caso.legalBasis || "", ctx);
    const procedureEs = await translateToSpanish(caso.procedure || "", ctx);
    const examplesEs = await translateToSpanish(caso.examples || "", ctx);

    await conn.execute(
      "UPDATE special_cases SET titleEs=?, descriptionEs=?, legalBasisEs=?, procedureEs=?, examplesEs=? WHERE id=?",
      [titleEs, descriptionEs, legalBasisEs || null, procedureEs || null, examplesEs || null, caso.id]
    );
    console.log(`  ✓ Cas #${caso.id} traduït: ${titleEs}`);
  }

  // === DOCUMENTS ===
  const [docs] = await conn.execute(
    "SELECT id, title, content, summary FROM documents WHERE titleEs IS NULL OR titleEs = '' OR contentEs IS NULL OR contentEs = ''"
  );
  console.log(`\nDocuments pendents: ${docs.length}`);

  for (const doc of docs) {
    console.log(`\nTraduint document #${doc.id}: ${doc.title}`);
    const ctx = `Document normatiu: ${doc.title}`;
    const titleEs = await translateToSpanish(doc.title, ctx);
    const summaryEs = await translateToSpanish(doc.summary || "", ctx);
    // Per al content, si és molt llarg, traduïm els primers 3000 caràcters
    const contentToTranslate = doc.content ? doc.content.substring(0, 3000) : "";
    const contentEs = await translateToSpanish(contentToTranslate, ctx);

    await conn.execute(
      "UPDATE documents SET titleEs=?, summaryEs=?, contentEs=? WHERE id=?",
      [titleEs, summaryEs || null, contentEs || null, doc.id]
    );
    console.log(`  ✓ Document #${doc.id} traduït: ${titleEs}`);
  }

  await conn.end();
  console.log("\n✅ Traducció completada!");
}

main().catch((err) => {
  console.error("Error:", err);
  process.exit(1);
});
