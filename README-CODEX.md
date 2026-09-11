# Consultes IT — Guia per treballar amb Codex

Aquest projecte és una aplicació web full-stack de **React 19**, **Vite**, **Express**, **tRPC**, **Drizzle ORM** i **MySQL/TiDB**. Es pot obrir amb Codex a partir del repositori Git o del paquet ZIP d'exportació.

## Inici ràpid

```bash
pnpm install
cp ENVIRONMENT.template.txt .env
# Completa les variables de .env amb credencials pròpies
pnpm dev
```

Per comprovar el projecte abans de modificar-lo:

```bash
pnpm test
pnpm check
pnpm build
```

## Estructura principal

| Ruta | Contingut |
|---|---|
| `client/src/` | Interfície React i components visuals. |
| `server/` | API tRPC, regles de negoci, accés a dades i exportacions. |
| `drizzle/schema.ts` | Esquema de la base de dades. |
| `drizzle/` | Migracions de la base de dades. |
| `shared/` | Constants i tipus compartits. |
| `scripts/` | Utilitats de manteniment i d'exportació. |
| `exports/` | Artefactes de corpus TXT generats per al projecte. |

## Variables d'entorn

Crea un fitxer `.env` des de `ENVIRONMENT.template.txt`. **No pugis mai credencials, cadenes de connexió o claus API al repositori.** Per executar totes les funcionalitats cal, com a mínim, una base de dades MySQL/TiDB i credencials OAuth compatibles amb la configuració del projecte.

Les funcionalitats vinculades al runtime de Manus, com l'OAuth integrat, l'emmagatzematge S3 gestionat i la proxy d'LLM, depenen de variables que proporciona Manus. Per executar-les fora de Manus, cal substituir-les per serveis propis compatibles o implementar adaptadors equivalents.

## Instruccions per a Codex

1. Llegeix primer `package.json`, `drizzle/schema.ts`, `server/routers.ts` i el component o la ruta que es vol modificar.
2. No editis `server/_core/` sense una necessitat d'infraestructura explícita.
3. Mantén el patró tRPC: les operacions de dades passen per `server/db.ts` i `server/routers.ts`; el client les consumeix amb `trpc.*`.
4. Quan canviïs l'esquema, genera la migració amb `pnpm drizzle-kit generate`, revisa el SQL i aplica'l al teu entorn abans de modificar la interfície.
5. Afegeix o actualitza proves Vitest a `server/*.test.ts` per a cada canvi de lògica.
6. Executa `pnpm test`, `pnpm check` i `pnpm build` abans de lliurar el canvi.

## Comandes disponibles

| Comanda | Finalitat |
|---|---|
| `pnpm dev` | Servidor de desenvolupament. |
| `pnpm test` | Suite Vitest completa. |
| `pnpm check` | Comprovació de tipus TypeScript. |
| `pnpm build` | Compilació de producció. |
| `pnpm db:push` | Genera i aplica migracions Drizzle al teu entorn. |

## Notes de seguretat

L'exportació exclou `node_modules`, resultats de compilació, fitxers `.env`, credencials i metadades específiques de Manus. Reviseu sempre qualsevol configuració de desplegament, OAuth, base de dades i emmagatzematge abans d'executar-la fora de Manus.
