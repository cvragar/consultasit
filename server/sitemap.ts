import { Router } from "express";
import { getDb } from "./db";
import { specialCases, documents } from "../drizzle/schema";
import { sql } from "drizzle-orm";

const BASE_URL = "https://consultesit.com";

interface SitemapUrl {
  loc: string;
  lastmod: string;
  changefreq: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
  priority: number;
}

/**
 * Genera el sitemap.xml dinàmicament basant-se en les rutes públiques
 * i les dates reals de modificació de la base de dades.
 */
async function generateSitemap(): Promise<string> {
  // Obtenir la data de l'últim cas especial i document modificat
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }
  const [latestCase] = await db
    .select({ maxDate: sql<string>`MAX(updatedAt)` })
    .from(specialCases);
  const [latestDoc] = await db
    .select({ maxDate: sql<string>`MAX(updatedAt)` })
    .from(documents);

  const today = new Date().toISOString().split("T")[0];
  const casesLastmod = latestCase?.maxDate
    ? new Date(latestCase.maxDate).toISOString().split("T")[0]
    : today;
  const docsLastmod = latestDoc?.maxDate
    ? new Date(latestDoc.maxDate).toISOString().split("T")[0]
    : today;

  const urls: SitemapUrl[] = [
    {
      loc: `${BASE_URL}/`,
      lastmod: today,
      changefreq: "weekly",
      priority: 1.0,
    },
    {
      loc: `${BASE_URL}/casos-especials`,
      lastmod: casesLastmod,
      changefreq: "weekly",
      priority: 0.9,
    },
    {
      loc: `${BASE_URL}/documents`,
      lastmod: docsLastmod,
      changefreq: "weekly",
      priority: 0.8,
    },
    {
      loc: `${BASE_URL}/calculadora`,
      lastmod: today,
      changefreq: "monthly",
      priority: 0.8,
    },
    {
      loc: `${BASE_URL}/reclamacions`,
      lastmod: today,
      changefreq: "monthly",
      priority: 0.7,
    },
    {
      loc: `${BASE_URL}/novetats`,
      lastmod: casesLastmod > docsLastmod ? casesLastmod : docsLastmod,
      changefreq: "weekly",
      priority: 0.7,
    },
  ];

  const urlEntries = urls
    .map(
      (u) => `  <url>
    <loc>${u.loc}</loc>
    <lastmod>${u.lastmod}</lastmod>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority.toFixed(1)}</priority>
    <xhtml:link rel="alternate" hreflang="ca" href="${u.loc}"/>
    <xhtml:link rel="alternate" hreflang="es" href="${u.loc}"/>
  </url>`
    )
    .join("\n\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">

${urlEntries}

</urlset>`;
}

export const sitemapRouter = Router();

sitemapRouter.get("/sitemap.xml", async (_req, res) => {
  try {
    const xml = await generateSitemap();
    res.set("Content-Type", "application/xml; charset=utf-8");
    res.set("Cache-Control", "public, max-age=3600"); // Cache 1 hora
    res.send(xml);
  } catch (error) {
    console.error("Error generating sitemap:", error);
    res.status(500).send("Error generating sitemap");
  }
});
