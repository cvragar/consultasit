/**
 * Translation helper for database content.
 * Translates Catalan content to Spanish using the built-in LLM.
 * Results are cached in the database to avoid re-translating the same content.
 */
import { invokeLLM } from "./_core/llm";

/**
 * Translate a single text field from Catalan to Spanish.
 * Returns the original text if translation fails.
 */
export async function translateCaToEs(text: string): Promise<string> {
  if (!text || text.trim() === "") return text;

  try {
    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content: `Ets un traductor professional especialitzat en terminologia mèdica i jurídica espanyola. 
Tradueix el text del català al castellà mantenint:
- Tot el format Markdown (##, **, *, taules, llistes, etc.)
- Tots els termes legals i mèdics precisos (LGSS, INSS, IT, eCap, etc.)
- Les referències normatives exactes (art. 169, RD 625/2014, etc.)
- El to professional i tècnic
Retorna ÚNICAMENT el text traduït, sense cap explicació ni comentari addicional.`,
        },
        {
          role: "user",
          content: text,
        },
      ],
    });

    const translated = response?.choices?.[0]?.message?.content;
    if (typeof translated === "string" && translated.trim().length > 0) {
      return translated.trim();
    }
    return text;
  } catch (err) {
    console.error("[translation] Error translating content:", err);
    return text;
  }
}

/**
 * Translate multiple fields at once in a single LLM call (more efficient).
 * Returns a record with the same keys but translated values.
 */
export async function translateFieldsToEs(
  fields: Record<string, string | null | undefined>
): Promise<Record<string, string>> {
  const entries = Object.entries(fields).filter(
    ([, v]) => v && v.trim().length > 0
  ) as [string, string][];

  if (entries.length === 0) return {};

  // Build a JSON payload so we can translate all fields in one call
  const payload = Object.fromEntries(entries);
  const payloadStr = JSON.stringify(payload, null, 2);

  try {
    const response = await invokeLLM({
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
        {
          role: "user",
          content: payloadStr,
        },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "translated_fields",
          strict: false,
          schema: {
            type: "object",
            additionalProperties: { type: "string" },
          },
        },
      },
    });

    const raw = response?.choices?.[0]?.message?.content;
    if (typeof raw === "string") {
      const parsed = JSON.parse(raw);
      if (typeof parsed === "object" && parsed !== null) {
        // Ensure all original keys are present (fallback to original if missing)
        const result: Record<string, string> = {};
        for (const [key, original] of entries) {
          result[key] =
            typeof parsed[key] === "string" && parsed[key].trim().length > 0
              ? parsed[key]
              : original;
        }
        return result;
      }
    }
    // Fallback: return originals
    return Object.fromEntries(entries);
  } catch (err) {
    console.error("[translation] Error translating fields:", err);
    return Object.fromEntries(entries);
  }
}
