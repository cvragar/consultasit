#!/usr/bin/env python3
"""
Script per inserir el cas especial d'in itinere en teletreball parcial a la BD de Consultes IT.
"""

import subprocess
import re
import mysql.connector
import json

# Obtenir la DATABASE_URL des de l'entorn del projecte
result = subprocess.run(
    ['node', '-e', "require('dotenv').config({path:'.env'}); process.stdout.write(process.env.DATABASE_URL || '')"],
    capture_output=True, text=True, cwd='/home/ubuntu/consultasit'
)
db_url = result.stdout.strip()

if not db_url:
    print("ERROR: No s'ha pogut obtenir DATABASE_URL")
    exit(1)

# Netejar el missatge de dotenv si apareix
if 'mysql://' in db_url:
    db_url = 'mysql://' + db_url.split('mysql://')[1]

# Parsejar la URL: mysql://user:pass@host:port/dbname?params
match = re.match(r'mysql://([^:]+):([^@]+)@([^:]+):(\d+)/([^?]+)', db_url)
if not match:
    print(f"ERROR: Format de DATABASE_URL no reconegut: {db_url}")
    exit(1)

user, password, host, port, dbname = match.groups()
dbname = dbname.split('?')[0]

print(f"Connectant a {host}:{port}/{dbname} com a {user}...")

conn = mysql.connector.connect(
    host=host,
    port=int(port),
    user=user,
    password=password,
    database=dbname,
    ssl_disabled=False
)
cursor = conn.cursor()

# Contingut del cas especial
title = "Accident in itinere en treballadors assalariats amb contracte de teletreball parcial"

description = """La Llei 10/2021 de treball a distància ha creat una nova casuística complexa: el treballador amb teletreball parcial (p. ex., 2 dies a casa i 3 dies a l'oficina) pot patir accidents en situacions molt diverses. La clau és determinar si el dia de l'accident era dia presencial o dia de teletreball, i si l'accident es va produir en el trajecte o dins del domicili.

REGLA FONAMENTAL: Els dies de treball presencial, l'in itinere funciona de forma plena i ordinària. Els dies de teletreball, no hi ha trajecte protegit perquè el lloc de treball és el domicili, però sí que pot haver-hi AT si l'accident es produeix en temps i lloc de treball dins del domicili."""

legal_basis = """- Art. 156.2.a TRLGSS (RDL 8/2015): "Tendrán la consideración de accidentes de trabajo los que sufra el trabajador al ir o al volver del lugar de trabajo."
- Art. 156.3 TRLGSS: Presumpció iuris tantum que tot accident en temps i lloc de treball és AT (aplicació difícil en domicili)
- Llei 10/2021, de 9 de juliol, de treball a distància: Art. 16 (PRL en teletreball), igualtat de protecció amb treballadors presencials
- RD 625/2014: El part de baixa l'emet el metge del SPS (eCap a Catalunya) tant per CC com per AT"""

procedure = """PROCEDIMENT DES DE L'ECAP:

1. PREGUNTAR SEMPRE: Si el treballador té contracte de teletreball i si el dia de l'accident era dia presencial o de teletreball.

2. DIA PRESENCIAL - ACCIDENT EN TRAJECTE (in itinere clàssic):
   - Contingència: AT in itinere
   - Emetre el part indicant AT
   - La mútua de l'empresa gestiona la prestació (75% BR des del dia següent)

3. DIA DE TELETREBALL - ACCIDENT DINS DEL DOMICILI:
   - Contingència: Pot ser AT (si es prova que estava en jornada laboral) o CC
   - Recollir informació: hora, activitat, si estava en jornada (registre horari, correus, videoconferències)
   - Si no hi ha prou evidència: emetre com a CC i informar el treballador que pot reclamar contingència professional davant l'INSS
   - La presumpció de l'art. 156.3 TRLGSS és difícil d'aplicar en domicili (STSJ Galícia 7/7/2024)

4. DIA DE TELETREBALL - DESPLAÇAMENT PUNTUAL A L'EMPRESA:
   - Contingència: AT in itinere (STSJ Madrid 485/2022)
   - El desplaçament ha de ser per motiu laboral (reunió, formació, recollida de material...)
   - Emetre el part indicant AT

5. NOTA SOBRE LA STS 522/2025: Una caiguda als escalons de sortida de la vivenda (dins de la finca privada, sense haver sortit al carrer) NO és in itinere. El TS prioritza l'element geogràfic (cal haver abandonat l'espai privat del domicili)."""

examples = json.dumps([
    {
        "titol": "Infermera amb teletreball 2 dies/setmana - accident de trànsit en dia presencial",
        "descripcio": "Infermera que treballa a l'hospital 3 dies i des de casa 2 dies. Pateix un accident de trànsit anant a l'hospital un dimarts (dia presencial).",
        "resolucio": "AT in itinere clar. El metge de l'eCap emet el part indicant AT. La mútua de l'hospital gestiona la prestació (75% BR des del dia següent). No hi ha dubte perquè era dia presencial."
    },
    {
        "titol": "Administratiu que cau a casa en dia de teletreball",
        "descripcio": "Administratiu en teletreball dijous. Cau per les escales de casa a les 10:30h mentre anava a buscar documents de treball impresos.",
        "resolucio": "Pot ser AT si s'acredita que estava en jornada laboral i el desplaçament era per motiu laboral. Dificultat: provar que estava treballant. El metge de l'eCap ha de recollir tota la informació. Si no hi ha prou evidència, emetre com a CC i informar el treballador que pot reclamar la contingència professional davant l'INSS."
    },
    {
        "titol": "Tècnic que en dia de teletreball va a l'empresa a recollir material",
        "descripcio": "Tècnic en teletreball dilluns. El cap li demana que passi per l'empresa a recollir material urgent. Pateix un accident de trànsit en el trajecte domicili-empresa.",
        "resolucio": "AT in itinere (STSJ Madrid 485/2022). El desplaçament és per motiu laboral. El metge de l'eCap emet el part indicant AT. La mútua de l'empresa gestiona la prestació."
    },
    {
        "titol": "Comercial amb jornada flexible en teletreball total - caiguda a les 22:45h",
        "descripcio": "Comercial d'assegurances en teletreball total amb jornada flexible. Cau per les escales de casa a les 22:45h.",
        "resolucio": "CC (STSJ Galícia 7/7/2024). Malgrat la jornada flexible, les 22:45h no es corresponen amb l'horari ordinari d'un comercial. No s'ha acreditat que l'accident es produís en temps de treball. El metge de l'eCap emet el part com a CC."
    }
], ensure_ascii=False)

tags = json.dumps(["teletreball", "in itinere", "accident de treball", "Llei 10/2021", "treball a distancia", "dies presencials", "domicili", "contingència professional"], ensure_ascii=False)

sql = """
INSERT INTO special_cases 
(title, description, legalBasis, `procedure`, examples, category, complexity, isVerified, createdAt, updatedAt)
VALUES (%s, %s, %s, %s, %s, %s, %s, %s, NOW(), NOW())
"""

values = (
    title,
    description,
    legal_basis,
    procedure,
    examples,
    'accident_treball',
    'alta',
    True
)

cursor.execute(sql, values)
conn.commit()
print(f"✅ Cas especial inserit correctament! ID: {cursor.lastrowid}")
print(f"   Títol: {title}")
print(f"   Categoria: accident_treball")
print(f"   Complexitat: alta")

cursor.close()
conn.close()
