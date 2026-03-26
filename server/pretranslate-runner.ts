/**
 * Script de pre-traducció: executa la traducció de tots els casos i documents
 * directament usant les funcions del servidor (accés directe a la BD i a la IA).
 * Executar amb: npx tsx server/pretranslate-runner.ts
 */
import { getAllSpecialCases, getAllDocuments, saveSpecialCaseTranslation, saveDocumentTranslation } from "./db";
import { translateCaToEs } from "./translation";

async function run() {
  console.log("🔄 Iniciant pre-traducció al castellà...\n");

  const cases = await getAllSpecialCases();
  const docs = await getAllDocuments();

  const casesToTranslate = cases.filter(c => !c.titleEs || c.titleEs === c.title);
  const docsToTranslate = docs.filter(d => !d.titleEs || d.titleEs === d.title);

  console.log(`📋 Casos a traduir: ${casesToTranslate.length} / ${cases.length}`);
  console.log(`📄 Documents a traduir: ${docsToTranslate.length} / ${docs.length}\n`);

  let casesDone = 0;
  let docsDone = 0;
  const errors: string[] = [];

  for (const c of casesToTranslate) {
    try {
      console.log(`  Traduint cas #${c.id}: "${c.title}"...`);
      const titleTranslated = await translateCaToEs(c.title);
      if (!titleTranslated || titleTranslated === c.title) {
        console.log(`  ⚠️  Cas #${c.id}: la traducció ha retornat el text original, saltant`);
        errors.push(`Case #${c.id}: same text`);
        continue;
      }
      const descTranslated = await translateCaToEs(c.description);
      const legalTranslated = c.legalBasis ? await translateCaToEs(c.legalBasis) : undefined;
      const procTranslated = c.procedure ? await translateCaToEs(c.procedure) : undefined;
      const exTranslated = c.examples ? await translateCaToEs(c.examples) : undefined;

      await saveSpecialCaseTranslation(c.id, {
        titleEs: titleTranslated,
        descriptionEs: descTranslated !== c.description ? descTranslated : undefined,
        legalBasisEs: legalTranslated !== c.legalBasis ? legalTranslated : undefined,
        procedureEs: procTranslated !== c.procedure ? procTranslated : undefined,
        examplesEs: exTranslated !== c.examples ? exTranslated : undefined,
      });
      console.log(`  ✅ Cas #${c.id} traduït: "${titleTranslated}"`);
      casesDone++;
    } catch (err) {
      const msg = `Case #${c.id}: ${(err as Error).message}`;
      console.error(`  ❌ ${msg}`);
      errors.push(msg);
    }
  }

  for (const d of docsToTranslate) {
    try {
      console.log(`  Traduint doc #${d.id}: "${d.title}"...`);
      const titleTranslated = await translateCaToEs(d.title);
      if (!titleTranslated || titleTranslated === d.title) {
        console.log(`  ⚠️  Doc #${d.id}: la traducció ha retornat el text original, saltant`);
        errors.push(`Doc #${d.id}: same text`);
        continue;
      }
      const summaryTranslated = d.summary ? await translateCaToEs(d.summary) : undefined;
      const contentTranslated = (d.content && d.content.length <= 6000)
        ? await translateCaToEs(d.content)
        : undefined;

      await saveDocumentTranslation(d.id, {
        titleEs: titleTranslated,
        summaryEs: summaryTranslated !== d.summary ? summaryTranslated : undefined,
        contentEs: contentTranslated !== d.content ? contentTranslated : undefined,
      });
      console.log(`  ✅ Doc #${d.id} traduït: "${titleTranslated}"`);
      docsDone++;
    } catch (err) {
      const msg = `Doc #${d.id}: ${(err as Error).message}`;
      console.error(`  ❌ ${msg}`);
      errors.push(msg);
    }
  }

  console.log(`\n✅ Pre-traducció completada!`);
  console.log(`   Casos traduïts: ${casesDone} / ${casesToTranslate.length}`);
  console.log(`   Documents traduïts: ${docsDone} / ${docsToTranslate.length}`);
  if (errors.length > 0) {
    console.log(`   Errors: ${errors.length}`);
    errors.forEach(e => console.log(`     - ${e}`));
  }
  process.exit(0);
}

run().catch(err => {
  console.error("Error fatal:", err);
  process.exit(1);
});
