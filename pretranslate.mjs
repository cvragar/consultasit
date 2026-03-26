/**
 * Pre-translation script: translates all special cases and documents from CA to ES
 * and saves the results to the database cache columns.
 * Run with: node pretranslate.mjs
 */
import mysql from "mysql2/promise";
import { config } from "dotenv";
config();

const DB_URL = process.env.DATABASE_URL;
if (!DB_URL) {
  console.error("DATABASE_URL not set");
  process.exit(1);
}

const LLM_URL = process.env.BUILT_IN_FORGE_API_URL;
const LLM_KEY = process.env.BUILT_IN_FORGE_API_KEY;
if (!LLM_URL || !LLM_KEY) {
  console.error("BUILT_IN_FORGE_API_URL or BUILT_IN_FORGE_API_KEY not set");
  process.exit(1);
}

const conn = await mysql.createConnection(DB_URL);

async function translateFieldsToEs(fields) {
  const entries = Object.entries(fields).filter(([, v]) => v && v.trim().length > 0);
  if (entries.length === 0) return {};

  const payload = Object.fromEntries(entries);
  const payloadStr = JSON.stringify(payload, null, 2);

  const response = await fetch(`${LLM_URL}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${LLM_KEY}`,
    },
    body: JSON.stringify({
      messages: [
        {
          role: "system",
          content: `Ets un traductor professional especialitzat en terminologia mèdica i jurídica espanyola.
Rebràs un objecte JSON amb camps de text en català. Tradueix cada valor al castellà mantenint:
- Tot el format Markdown (##, **, *, taules, llistes, etc.)
- Tots els termes legals i mèdics precisos (LGSS, INSS, IT, eCap, etc.)
- Les referències normatives exactes (art. 169, RD 625/2014, etc.)
- El to professional i tècnic
Retorna ÚNICAMENT un objecte JSON vàlid amb les mateixes claus i els valors traduïts al castellà. Sense cap text addicional fora del JSON.`,
        },
        { role: "user", content: payloadStr },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "translated_fields",
          strict: false,
          schema: { type: "object", additionalProperties: { type: "string" } },
        },
      },
    }),
  });

  const responseText = await response.text();
  let data;
  try {
    data = JSON.parse(responseText);
  } catch (e) {
    console.error("  HTTP response parse error. Status:", response.status, "Body:", responseText.substring(0, 300));
    return Object.fromEntries(entries);
  }
  const raw = data?.choices?.[0]?.message?.content;
  if (typeof raw === "string") {
    // Extract JSON robustly: strip markdown code fences if present
    let jsonStr = raw.trim();
    const fenceMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (fenceMatch) jsonStr = fenceMatch[1].trim();
    // Also try to find first { ... } block
    const braceStart = jsonStr.indexOf("{");
    const braceEnd = jsonStr.lastIndexOf("}");
    if (braceStart !== -1 && braceEnd !== -1) {
      jsonStr = jsonStr.slice(braceStart, braceEnd + 1);
    }
    try {
      const parsed = JSON.parse(jsonStr);
      if (typeof parsed === "object" && parsed !== null) {
        const result = {};
        for (const [key, original] of entries) {
          result[key] =
            typeof parsed[key] === "string" && parsed[key].trim().length > 0
              ? parsed[key]
              : original;
        }
        return result;
      }
    } catch (parseErr) {
      console.error("  JSON parse error:", parseErr.message, "Raw:", raw.substring(0, 200));
    }
  }
  return Object.fromEntries(entries);
}

// ===== TRANSLATE SPECIAL CASES =====
console.log("\n=== Translating special cases ===");
const [cases] = await conn.execute(
  "SELECT id, title, description, legalBasis, `procedure`, examples FROM special_cases WHERE titleEs IS NULL ORDER BY id"
);
console.log(`Found ${cases.length} cases to translate`);

for (const c of cases) {
  try {
    const fields = { title: c.title, description: c.description };
    if (c.legalBasis) fields.legalBasis = c.legalBasis;
    if (c.procedure) fields.procedure = c.procedure;
    if (c.examples) fields.examples = c.examples;

    console.log(`  Translating case #${c.id}: ${c.title.substring(0, 50)}...`);
    const translated = await translateFieldsToEs(fields);

    await conn.execute(
      `UPDATE special_cases SET titleEs=?, descriptionEs=?, legalBasisEs=?, procedureEs=?, examplesEs=? WHERE id=?`,
      [
        translated.title || null,
        translated.description || null,
        translated.legalBasis || null,
        translated.procedure || null,
        translated.examples || null,
        c.id,
      ]
    );
    console.log(`  ✓ Case #${c.id} translated`);
  } catch (err) {
    console.error(`  ✗ Error translating case #${c.id}:`, err.message);
  }
}

// ===== TRANSLATE DOCUMENTS =====
console.log("\n=== Translating documents ===");
const [docs] = await conn.execute(
  "SELECT id, title, summary, content FROM documents WHERE titleEs IS NULL ORDER BY id"
);
console.log(`Found ${docs.length} documents to translate`);

for (const d of docs) {
  try {
    const fields = { title: d.title };
    if (d.summary) fields.summary = d.summary;
    // Only translate content if not too long
    if (d.content && d.content.length <= 6000) {
      fields.content = d.content;
    }

    console.log(`  Translating doc #${d.id}: ${d.title.substring(0, 50)}...`);
    const translated = await translateFieldsToEs(fields);

    await conn.execute(
      `UPDATE documents SET titleEs=?, summaryEs=?, contentEs=? WHERE id=?`,
      [
        translated.title || null,
        translated.summary || null,
        translated.content || null,
        d.id,
      ]
    );
    console.log(`  ✓ Doc #${d.id} translated`);
  } catch (err) {
    console.error(`  ✗ Error translating doc #${d.id}:`, err.message);
  }
}

await conn.end();
console.log("\n✅ Pre-translation complete!");
