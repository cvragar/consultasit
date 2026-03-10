#!/usr/bin/env python3
"""
Script per inserir el cas especial d'in itinere per a autònoms amb múltiples llocs de treball
"""
import subprocess
import json
import re

# Obtenir DATABASE_URL
result = subprocess.run(
    ['node', '-e', "require('dotenv/config'); process.stdout.write(process.env.DATABASE_URL || '');"],
    capture_output=True, text=True, cwd='/home/ubuntu/consultasit'
)
db_url = result.stdout.strip()

# Parse URL: mysql://user:pass@host:port/dbname?params
match = re.match(r'mysql://([^:]+):([^@]+)@([^:]+):(\d+)/([^?]+)', db_url)
if not match:
    print(f"Error parsing DATABASE_URL: {db_url[:50]}...")
    exit(1)

user, password, host, port, dbname = match.groups()
dbname = dbname.split('?')[0]

import mysql.connector

conn = mysql.connector.connect(
    host=host, port=int(port), user=user, password=password,
    database=dbname, ssl_disabled=False
)
cursor = conn.cursor()

title = "Accident in itinere per a autònoms amb múltiples llocs de treball declarats"

description = """Situació complexa on un treballador autònom té declarats a Hisenda dos o més locals, naus o oficines com a afectes a la seva activitat econòmica. La normativa (art. 316.2 LGSS) utilitza el singular ("el establecimiento"), generant conflicte sobre quin trajecte és cobert com a in itinere.

NORMATIVA APLICABLE:
- Art. 316.2 LGSS (modificat per Llei 6/2017, art. 14, vigent des del 26/10/2017)
- Art. 3.2 i 4 del RD 1273/2003
- Art. 317.II LGSS (per a TRADE)

DEFINICIÓ LEGAL: "Se entenderá como lugar de la prestación el establecimiento en donde el trabajador autónomo ejerza habitualmente su actividad siempre que no coincida con su domicilio y se corresponda con el local, nave u oficina declarado como afecto a la actividad económica a efectos fiscales."

DIFERÈNCIA CLAU AMB L'ASSALARIAT:
- Assalariat: presumpció de laboralitat (art. 156.2.a LGSS). N'hi ha prou amb provar el trajecte habitual.
- Autònom: NO hi ha presumpció de laboralitat. Ha de provar la connexió directa i immediata amb l'activitat del RETA. La càrrega de la prova recau sobre el treballador.

CRITERI JURISPRUDENCIAL PER A MÚLTIPLES LOCALS:
Cal identificar quin és el lloc on s'exerceix HABITUALMENT l'activitat:
- Si un local és el principal (on treballa la major part del temps) i l'altre és accessori, el trajecte domicili-local principal és in itinere cobert.
- El trajecte entre locals es considera "accident en missió" (no in itinere), amb millor cobertura (connexió directa amb el treball).
- Si el domicili coincideix amb un dels llocs de treball declarats, NO hi pot haver in itinere des d'aquell domicili.

JURISPRUDÈNCIA RELLEVANT:
- STSJ Madrid n.º 12/2023, de 13 de gener: Fotògraf autònom que es desplaça a clients. El TSJ va considerar que els desplaçaments formen part intrínseca de l'activitat i es cobreixen com a AT per connexió directa.
- STS 522/2025, de 2 de juny (Rec. 813/2023): Element geogràfic de l'in itinere: el trajecte comença quan s'abandona la zona privada del domicili.
- STS 15/04/2013 (R. 1847/2013): Si el trajecte s'interromp per motius personals, es perd la consideració d'in itinere (element teleològic).
- STS 17/04/2018 (R. 1777/2016): Petita desviació per comprar menjar → NO perd la consideració d'in itinere si és mínima i raonablement vinculada al trajecte.
- TSJ Galícia: Autònom amb taller que coincideix amb domicili → NO és in itinere perquè el lloc de treball i el domicili coincideixen.

TAULA COMPARATIVA: IN ITINERE vs EN MISSIÓ per a autònoms:
- In itinere: Trajecte domicili ↔ lloc de treball habitual. Sense presumpció (autònom ha de provar). Cobertura: contingències professionals.
- En missió: Trajecte entre clients o entre llocs de treball. Connexió directa amb el treball. Cobertura: contingències professionals.

PROCEDIMENT DES DE L'eCap:
1. Autònom AMB cobertura de contingències professionals (mútua): La mútua emet el part de baixa per AT. L'eCap NO emet el part. Si l'autònom acudeix a l'eCap per error, derivar a la mútua.
2. Autònom SENSE cobertura de contingències professionals: Gestió com a contingència comuna. L'eCap SÍ emet el part de baixa per malaltia comuna. Prestació del 60% (no del 75%).
3. In itinere no reconegut inicialment: Emetre part per contingència comuna provisionalment. Informar que pot reclamar la qualificació d'AT davant la mútua i l'INSS.

CASOS PRÀCTICS:
Cas 1 - Fisioterapeuta amb dos locals declarats: Local A (principal, 4 dies/setmana) i Local B (secundari, 1 dia/setmana). Accident anant del domicili al Local B. Resolució: Probablement in itinere cobert perquè el Local B també està declarat a Hisenda, però la mútua pot qüestionar-ho. Cal aportar model 036/037 que acrediti els dos locals. Part de baixa: la mútua.

Cas 2 - Autònom que treballa des de casa i té un local: Dissenyador gràfic amb domicili declarat com a lloc de treball i un local de coworking també declarat. Accident anant al coworking. Resolució: El trajecte domicili-coworking és in itinere si el coworking és el lloc principal. Part de baixa: la mútua.

Cas 3 - Autònom entre clients: Electricista que pateix un accident entre dues obres (client A → client B). Resolució: NO és in itinere. És accident en missió. Cobertura: contingències professionals. Part de baixa: la mútua.

Cas 4 - Autònom amb domicili = lloc de treball: Traductora amb domicili com a únic lloc de treball. Accident sortint de casa per anar a una reunió. Resolució: Accident en missió (no in itinere). Cobertura si té CP. Part de baixa: la mútua."""

legal_basis = "Art. 316.2 LGSS (Llei 6/2017, art. 14); Art. 3.2 i 4 RD 1273/2003; Art. 317.II LGSS (TRADE); STSJ Madrid 12/2023; STS 522/2025 (Rec. 813/2023); STS 15/04/2013 (R. 1847/2013); STS 17/04/2018 (R. 1777/2016)"

procedure = """PROTOCOL PER AL METGE DE L'eCap:

PREGUNTA 1: L'autònom té cobertura de contingències professionals (mútua)?
→ SÍ: Derivar a la mútua. La mútua emet el part de baixa per AT.
→ NO: Emetre part de baixa per contingència COMUNA. Informar que no té cobertura d'AT.

PREGUNTA 2 (si té mútua): El lloc de l'accident és in itinere o en missió?
→ IN ITINERE (domicili → local declarat): La mútua gestiona.
→ EN MISSIÓ (entre clients o locals): La mútua gestiona (millor cobertura).
→ DUBTE: Emetre part CC provisionalment. Informar que pot reclamar AT davant la mútua.

DOCUMENTACIÓ QUE POT NECESSITAR L'AUTÒNOM:
- Model 036/037 (declaració censal amb els locals afectes a l'activitat)
- Declaració de l'IRPF amb els locals declarats
- Prova del trajecte habitual (GPS, testimonis, etc.)
- Justificant de la cotització per contingències professionals

IMPORTANT: Si l'autònom acudeix a urgències de l'eCap per un AT, s'atendrà l'emergència, però la gestió posterior (part de baixa, seguiment) correspon a la mútua si té cobertura de CP."""

tags = json.dumps(["accident_treball", "autònom", "in_itinere", "múltiples_llocs", "mútua", "contingències_professionals", "LGSS_316", "en_missió", "jurisprudència"])

examples = json.dumps([
    {
        "title": "Fisioterapeuta amb dos locals declarats a Hisenda",
        "description": "Fisioterapeuta autònom amb Local A (principal, 4 dies/setmana) i Local B (secundari, 1 dia/setmana), tots dos declarats al model 036. Accident de trànsit anant del domicili al Local B un divendres.",
        "resolution": "In itinere cobert perquè el Local B està declarat a Hisenda com a afecte a l'activitat. La mútua pot qüestionar-ho al·legant que el Local A és el 'lloc habitual', però la jurisprudència tendeix a cobrir tots els locals declarats. Cal aportar el model 036/037. Part de baixa: la mútua per AT.",
        "legalBasis": "Art. 316.2 LGSS; STSJ Madrid 12/2023"
    },
    {
        "title": "Electricista autònom entre dues obres",
        "description": "Electricista autònom que pateix un accident de trànsit mentre va d'una obra (client A) a una altra obra (client B) durant la mateixa jornada laboral.",
        "resolution": "NO és in itinere (no és el trajecte domicili-lloc de treball). És un accident EN MISSIÓ per connexió directa i immediata amb el treball. Cobertura: contingències professionals. La mútua gestiona i emet el part de baixa per AT. Prestació: 75% base reguladora des del dia següent.",
        "legalBasis": "Art. 316.2 LGSS; Art. 3.2 RD 1273/2003; STS 17/04/2018"
    },
    {
        "title": "Autònom amb domicili declarat com a lloc de treball",
        "description": "Dissenyadora gràfica autònoma amb el domicili declarat com a únic lloc de treball a Hisenda. Accident al sortir de casa per anar a una reunió presencial amb un client.",
        "resolution": "Com que el domicili és el lloc de treball, NO hi pot haver in itinere (la llei exigeix que el lloc de prestació 'no coincida con su domicilio'). El trajecte domicili-client és un accident EN MISSIÓ. Cobertura si té CP. Part de baixa: la mútua.",
        "legalBasis": "Art. 316.2 LGSS (incís 'siempre que no coincida con su domicilio'); TSJ Galícia"
    },
    {
        "title": "Autònom sense cobertura de contingències professionals",
        "description": "Lampista autònom que no ha contractat la cobertura de contingències professionals amb cap mútua. Pateix un accident de trànsit anant del domicili al seu taller (declarat a Hisenda).",
        "resolution": "Sense cobertura de CP, l'accident no es pot qualificar d'AT ni d'in itinere. L'eCap emet el part de baixa per CONTINGÈNCIA COMUNA (malaltia comuna). Prestació: 60% base reguladora (no 75%). Informar l'autònom que hauria de contractar la cobertura de CP per estar protegit en futurs accidents.",
        "legalBasis": "Art. 316.1 LGSS; RD 1273/2003; Llei 20/2007 LETA"
    }
])

sql = """
INSERT INTO special_cases 
(title, description, category, legalBasis, `procedure`, examples, createdAt, updatedAt)
VALUES (%s, %s, %s, %s, %s, %s, NOW(), NOW())
"""

values = (
    title,
    description,
    'accident_treball',
    legal_basis,
    procedure,
    examples
)

try:
    cursor.execute(sql, values)
    conn.commit()
    print(f"✅ Cas especial inserit correctament! ID: {cursor.lastrowid}")
    print(f"   Títol: {title}")
    print(f"   Categoria: accident_treball")
except Exception as e:
    print(f"❌ Error en la inserció: {e}")
    conn.rollback()
finally:
    cursor.close()
    conn.close()
