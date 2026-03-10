#!/usr/bin/env python3
"""
Script per inserir els nous casos especials d'accident de treball
a la base de dades de Consultes IT
"""

import mysql.connector
import os
import json
from datetime import datetime

# Connexió a la base de dades
db_url = os.environ.get('DATABASE_URL', '')

# Parse DATABASE_URL: mysql://user:pass@host:port/db or mysql://user:pass@host/db
import re
match = re.match(r'mysql://([^:]+):([^@]+)@([^:/]+)(?::(\d+))?/(.+)', db_url)
if not match:
    print(f"Error: no s'ha pogut parsejar DATABASE_URL: {db_url[:30]}...")
    exit(1)

user, password, host, port, database = match.groups()
port = int(port) if port else 3306
database = database.split('?')[0]  # Remove query params if any

conn = mysql.connector.connect(
    host=host,
    port=int(port),
    user=user,
    password=password,
    database=database
)
cursor = conn.cursor()

# Casos especials a inserir
cases = [
    {
        "title": "Accident de treball en treballador autònom (RETA)",
        "category": "otro",
        "description": "Procediment i qualificació de la contingència quan un treballador autònom pateix un accident durant la seva activitat professional. Inclou les diferències amb el RGSS, la cobertura de contingències professionals i qui emet el part de baixa.",
        "legalBasis": json.dumps([
            "Llei 20/2007, art. 26 (LETA): Definició d'AT per a autònom",
            "LGSS (RDL 8/2015), art. 316: AT en RETA",
            "RD 1273/2003: Cobertura contingències professionals RETA",
            "RD 625/2014, art. 1.2: Emissió de parts de baixa",
            "STS 5 juliol 2023 (ROJ: STS 3098/2023)",
            "Criteri de gestió DGOSS 22/2022"
        ]),
        "procedure": """REQUISIT PREVI: Verificar si l'autònom té cobertura de contingències professionals (CP) amb mútua.

SI TÉ COBERTURA DE CP AMB MÚTUA:
- La MÚTUA emet el part de baixa per AT (no l'eCap)
- El metge de l'eCap ha de derivar el pacient a la mútua col·laboradora
- Prestació: 75% de la base reguladora des del dia SEGÜENT a l'accident (sense carència)
- Base reguladora: base de cotització del mes anterior / 30
- L'autònom ha de presentar Declaració de Situació d'Activitat (DSA) a la mútua

SI NO TÉ COBERTURA DE CP:
- L'accident es qualifica com a ACCIDENT NO LABORAL o MALALTIA COMUNA
- El metge de l'eCap emet el part de baixa per contingència comuna
- Prestació: 60% de la base reguladora fins al dia 20, 75% a partir del dia 21
- Hi ha carència de 3 dies (dies 1, 2 i 3 sense prestació)""",
        "examples": json.dumps([
            {
                "title": "Autònom fuster amb cobertura CP: caiguda al taller",
                "description": "Fuster autònom cau al seu taller i es fractura el canell. Té contractada la cobertura de CP amb FREMAP.",
                "resolution": "AT cobert per la mútua. La mútua (FREMAP) emet el part de baixa. L'eCap no ha d'emetre cap part. Prestació: 75% BR des del dia 2. L'autònom ha de presentar la DSA a la mútua."
            },
            {
                "title": "Autònom sense cobertura CP: accident al local",
                "description": "Comerciant autònom sense cobertura de contingències professionals pateix un accident al seu local.",
                "resolution": "L'accident es qualifica com a accident NO laboral. L'eCap emet el part de baixa per contingència comuna. Prestació: 60% BR dies 4-20, 75% a partir del dia 21."
            },
            {
                "title": "Infart en autònom durant la jornada laboral",
                "description": "Autònom sufre un infart mentre treballa al seu despatx. Té cobertura de CP.",
                "resolution": "ATENCIÓ: Al RETA NO s'aplica la presumpció de laboralitat (art. 156.3 LGSS). Cal acreditar connexió causal directa entre l'activitat i la lesió. Si no s'acredita, la mútua pot qualificar-ho com a malaltia comuna. Diferència clau amb el RGSS on la presumpció sí s'aplica (STS 5/7/2023)."
            },
            {
                "title": "Accident in itinere d'autònom",
                "description": "Autònom amb cobertura CP pateix un accident de trànsit anant al seu local de treball.",
                "resolution": "L'accident in itinere SÍ es cobreix per a autònoms si: el lloc de treball és diferent del domicili I coincideix amb el local/nau/oficina declarat a efectes fiscals. Si es compleixen aquests requisits: AT cobert per la mútua."
            }
        ]),
        "tags": json.dumps(["autònom", "RETA", "accident de treball", "contingències professionals", "mútua", "cobertura", "part de baixa", "eCap", "presumpció laboralitat"]),
        "severity": "alta",
        "frequency": "freqüent"
    },
    {
        "title": "Accident de treball en treballador en situació de pluriocupació",
        "category": "pluriempleo",
        "description": "Procediment quan un treballador que presta serveis simultàniament per a dues o més empreses (pluriocupació) pateix un accident de treball en una d'elles. Inclou la qualificació de la contingència en l'altra empresa, el càlcul de la base reguladora i qui emet el part de baixa.",
        "legalBasis": json.dumps([
            "LGSS (RDL 8/2015), art. 156: Definició d'AT",
            "LGSS (RDL 8/2015), art. 143: Pluriocupació i base reguladora",
            "RD 625/2014, art. 1.2: Emissió de parts de baixa",
            "STS 22 juliol 1998 (rcud 1878/1979): AT en pluriocupació",
            "STS 5 juliol 2023 (ROJ: STS 3098/2023): Qualificació AT en pluriactivitat",
            "Criteri de gestió DGOSS 22/2022",
            "FAQ Seguretat Social: Pluriocupació i AT"
        ]),
        "procedure": """ESCENARI A: L'altra activitat és per compte aliè (altra empresa assalariada)
- L'AT es considera AT EN AMBDUES relacions laborals
- Cada empresa ha de notificar l'accident (part d'accident - Delt@)
- La base reguladora es calcula sumant les bases de cotització de TOTES les empreses
- Paga la mútua/INSS de l'empresa on ha ocorregut l'AT

ESCENARI B: L'altra activitat és per compte propi (autònom)
- L'AT es qualifica com a AT per a l'activitat d'assalariat
- Per a l'activitat d'autònom: accident NO laboral (si no té cobertura CP) o AT (si té cobertura CP i es compleixen els requisits del RETA)

QUI EMET EL PART DE BAIXA (des de l'eCap):
- Si l'empresa on s'ha produït l'AT té cobertura amb MÚTUA → LA MÚTUA emet el part (no l'eCap)
- Si l'empresa on s'ha produït l'AT té cobertura amb l'INSS → L'eCap emet el part com a AT
- El part de baixa cobreix TOTES les activitats laborals del treballador

CÀLCUL DE LA BASE REGULADORA:
- Es sumen totes les bases de cotització de totes les empreses del mes anterior
- S'aplica el topall màxim de cotització
- Prestació: 100% de la base reguladora des del dia SEGÜENT a l'AT (sense carència)""",
        "examples": json.dumps([
            {
                "title": "Treballador en dues empreses: AT en l'empresa A",
                "description": "Treballador treballa a l'empresa A (8h, base cotització 1.500€/mes, mútua ASEPEYO) i a l'empresa B (4h, base cotització 800€/mes, mútua FREMAP). Pateix un AT a l'empresa A.",
                "resolution": "ASEPEYO (mútua empresa A) emet el part de baixa. Base reguladora = (1.500 + 800) / 30 = 76,67€/dia. Prestació = 76,67€/dia des del dia 2. L'empresa B també ha de notificar l'accident com a AT. ASEPEYO paga la prestació total."
            },
            {
                "title": "Treballador assalariat i autònom: AT en l'empresa",
                "description": "Treballador assalariat (empresa amb mútua) i autònom (sense cobertura CP) pateix un AT a l'empresa.",
                "resolution": "La mútua de l'empresa emet el part de baixa per AT. Per a l'activitat d'autònom: es qualifica com a accident NO laboral (contingència comuna). La base reguladora inclou només les cotitzacions de l'empresa (no les de l'autònom sense CP)."
            },
            {
                "title": "Treballador assalariat i autònom amb CP: AT en l'empresa",
                "description": "Treballador assalariat i autònom (AMB cobertura CP) pateix un AT a l'empresa.",
                "resolution": "La mútua de l'empresa emet el part per AT (activitat assalariada). Per a l'activitat d'autònom: pot ser AT si es compleixen els requisits del RETA. Dues mútues poden estar implicades. La base reguladora de la prestació de l'empresa inclou les cotitzacions de l'empresa; la de l'autònom es calcula per separat."
            },
            {
                "title": "Accident in itinere en treballador en pluriocupació",
                "description": "Treballador que va de l'empresa A a l'empresa B pateix un accident de trànsit.",
                "resolution": "L'accident in itinere es qualifica com a AT. El desplaçament entre dues empreses on treballa el mateix treballador es considera in itinere. La qualificació s'aplica a ambdues relacions laborals (si l'altra activitat és per compte aliè)."
            }
        ]),
        "tags": json.dumps(["pluriocupació", "pluriempleo", "dues empreses", "accident de treball", "base reguladora", "mútua", "part de baixa", "eCap", "cotització"]),
        "severity": "alta",
        "frequency": "moderada"
    }
]

# Inserir els casos
for case in cases:
    try:
        cursor.execute("""
            INSERT INTO special_cases (
                title, category, description, 
                legalBasis, `procedure`, examples,
                createdAt, updatedAt
            ) VALUES (%s, %s, %s, %s, %s, %s, NOW(), NOW())
        """, (
            case["title"],
            case["category"],
            case["description"],
            case["legalBasis"],
            case["procedure"],
            case["examples"]
        ))
        print(f"✅ Inserit: {case['title']}")
    except Exception as e:
        print(f"❌ Error inserint {case['title']}: {e}")

conn.commit()
cursor.close()
conn.close()
print("\n✅ Tots els casos inserits correctament!")
