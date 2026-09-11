# Entorn local de proves amb Docker i MySQL

## Objectiu

Aquesta configuració permet executar una instància local de **MySQL 8.4** per provar l’esquema, les migracions, les consultes de dades i la suite del projecte sense accedir a TiDB, S3, OAuth, LLM ni cap altra credencial de Manus. El servei escolta només a `127.0.0.1:3307` per defecte.

> Aquest entorn és exclusivament de desenvolupament. Les contrasenyes de `docker-compose.local.yml` són intencionadament públiques i només s’han d’utilitzar dins de la màquina local.

## Requisits

| Eina                           | Versió recomanada | Comprovació              |
| ------------------------------ | ----------------: | ------------------------ |
| Docker Engine o Docker Desktop |            Actual | `docker --version`       |
| Docker Compose                 |                v2 | `docker compose version` |
| Node.js                        |     22 o superior | `node --version`         |
| pnpm                           |                10 | `pnpm --version`         |

## Posada en marxa

Des de l’arrel del projecte, instal·la les dependències, inicia MySQL i espera que el servei estigui saludable.

```bash
pnpm install

docker compose -f docker-compose.local.yml up -d --wait
```

Crea la configuració local a partir de la plantilla. Aquest fitxer no s’ha de versionar.

```bash
cp ENVIRONMENT.local-docker.template.txt .env
```

Exporta temporalment les variables perquè Drizzle pugui llegir `DATABASE_URL` i aplica les migracions existents.

```bash
set -a
. ./.env
set +a
pnpm drizzle-kit migrate
```

Comprova que la base de dades és accessible.

```bash
docker compose -f docker-compose.local.yml exec mysql \
  mysql -uconsultasit -pconsultasit_local_password consultasit \
  -e "SHOW TABLES;"
```

## Validació sense Manus

Les proves unitàries, la comprovació de tipus i la compilació es poden executar sense cap servei de Manus.

```bash
pnpm test
pnpm check
pnpm build
```

També pots iniciar la interfície local i visitar `http://localhost:3000`.

```bash
pnpm dev
```

Les rutes públiques i les operacions que només utilitzen la base de dades funcionaran amb aquest entorn. L’inici de sessió, les descàrregues a S3, la traducció, el xat amb LLM i qualsevol operació protegida per Manus no funcionaran sense implementar o injectar adaptadors locals. Per provar codi nou d’aquestes integracions, utilitza mocks en Vitest i no introdueixis secrets reals al repositori.

## Operacions habituals

| Finalitat                                | Comanda                                                                         |
| ---------------------------------------- | ------------------------------------------------------------------------------- |
| Veure l’estat del contenidor             | `docker compose -f docker-compose.local.yml ps`                                 |
| Veure el registre de MySQL               | `docker compose -f docker-compose.local.yml logs -f mysql`                      |
| Aturar conservant les dades              | `docker compose -f docker-compose.local.yml down`                               |
| Aturar i esborrar totes les dades locals | `docker compose -f docker-compose.local.yml down -v`                            |
| Canviar el port local                    | `LOCAL_MYSQL_PORT=3308 docker compose -f docker-compose.local.yml up -d --wait` |

Per reinicialitzar la base de dades, executa `docker compose -f docker-compose.local.yml down -v`, inicia-la de nou amb `up -d --wait` i torna a aplicar les migracions. Les variables d’inicialització de la imatge MySQL només tenen efecte quan el volum de dades és buit.[2]

## Límits de l’entorn

La configuració no carrega documents ni casos de producció. Això evita copiar dades o credencials del projecte Manus. Les proves actuals s’executen amb les seves dades de prova o mocks; si calen dades de demostració, crea un seeder específic amb informació no sensible.

## References

[1]: https://docs.docker.com/compose/how-tos/startup-order/ "Control startup and shutdown order in Compose"
[2]: https://hub.docker.com/_/mysql "mysql - Official Image"
