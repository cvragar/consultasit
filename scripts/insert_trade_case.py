#!/usr/bin/env python3
"""Script per inserir el cas especial TRADE a la base de dades."""

import subprocess
import json
import sys

def get_db_url():
    # Llegir la URL del fitxer temporal generat prèviament
    try:
        with open('/tmp/db_url.txt', 'r') as f:
            url = f.read().strip()
        if url:
            return url
    except:
        pass
    # Fallback: llegir de l'entorn
    import os
    return os.environ.get('DATABASE_URL', '')

def insert_trade_case(db_url):
    import re
    m = re.match(r'mysql://([^:]+):([^@]+)@([^:]+):(\d+)/([^?]+)', db_url)
    if not m:
        print(f"ERROR: No s'ha pogut parsejar DATABASE_URL: {db_url[:50]}...")
        sys.exit(1)
    user, password, host, port, database = m.groups()

    import mysql.connector
    conn = mysql.connector.connect(
        host=host, port=int(port), user=user, password=password, database=database
    )
    cursor = conn.cursor()

    trade_case = {
        "title": "TRADE (Treballador Autònom Econòmicament Dependent): IT i Accident de Treball",
        "category": "pluriempleo",
        "description": "El TRADE és l'autònom que percep ≥75% dels seus ingressos d'un sol client. Té un règim especial d'AT que el diferencia tant de l'autònom pur com de l'assalariat: cobertura obligatòria de CP, accident in itinere cobert, però sense presumpció de laboralitat.",
        "legalBasis": "Art. 317 TRLGSS (RDL 8/2015): Definició d'AT per al TRADE | Art. 316 TRLGSS: Definició d'AT per a l'autònom pur (comparació) | Art. 11 i 26 LETA (Llei 20/2007): Definició, requisits i cobertura de CP del TRADE | RD 1273/2003: Cobertura de contingències professionals en el RETA | RDL 28/2018: Obligatoriìat de CP per a tots els autònoms des de l'01/01/2019 | RD 197/2009: Registre del contracte TRADE al SEPE",
        "procedure": """PROCEDIMENT DES DE L'eCAP

1. IDENTIFICACIÓ: Verificar si el pacient és TRADE (autònom que factura ≥75% a un sol client, amb contracte TRADE registrat al SEPE).

2. COBERTURA: Des de l'01/01/2019 tots els autònoms (inclosos TRADE) tenen cobertura obligatòria de contingències professionals. Preguntar amb quina mútua té formalitzada la cobertura.

3. QUALIFICACIÓ DE LA CONTINGÈNCIA:
   - Si l'accident ocorre DURANT l'activitat professional o en desplaçament al lloc de prestació → AT (contingència professional)
   - Si l'accident ocorre FORA de l'activitat professional → EC (contingència comuna), llevat de prova en contrari
   - DIFERÈNCIA CLAU: L'in itinere SÍ és AT per al TRADE (a diferència de l'autònom pur)

4. EMISSIÓ DEL PART A L'eCAP:
   - Emetre el part de baixa com a AT (contingència professional) si escau
   - La gestió de la prestació la porta la MÚTUA del TRADE
   - El TRADE ha de comunicar la baixa a la seva mútua

5. PRESTACIÓ ECONÒMICA:
   - AT: 75% de la base reguladora des del DIA SEGÜENT a la baixa
   - EC: 60% (dies 4-20), 75% (des del 21è)

6. OBLIGACIÓ DEL TRADE: Ha de presentar a la mútua una declaració sobre qui gestiona el seu negoci durant la IT.""",
        "examples": json.dumps([
            {
                "title": "TRADE que pateix un accident a les oficines del client",
                "description": "TRADE informàtic que cau per les escales de les oficines del seu client principal mentre treballa. Qualificació: AT. Procediment: part de baixa com AT a l'eCap, gestió per la mútua del TRADE."
            },
            {
                "title": "TRADE que pateix un accident in itinere",
                "description": "TRADE que es desplaça des del seu domicili a les oficines del client i pateix un accident de trànsit. Qualificació: AT in itinere (a diferència de l'autònom pur, on NO seria AT). Procediment: part de baixa com AT."
            },
            {
                "title": "TRADE que pateix un infart mentre treballa a casa",
                "description": "TRADE en teletreball que pateix un infart. Qualificació: INCERTA. No hi ha presumpció de laboralitat (a diferència de l'assalariat). Cal provar la connexió causal. Procediment: emetre inicialment com EC; el TRADE pot sol·licitar recalificació a AT davant l'INSS."
            },
            {
                "title": "TRADE amb pluriactivitat (també assalariat)",
                "description": "TRADE que a més té un contracte laboral parcial. Si l'AT ocorre en l'activitat com a TRADE → gestió per mútua del RETA. Si l'AT ocorre a l'empresa → gestió per mútua de l'empresa. Dret a prestació independent de cada règim."
            }
        ]),
        "tags": json.dumps(["TRADE", "autònom econòmicament dependent", "accident de treball", "in itinere", "contingències professionals", "RETA", "LETA", "pluriactivitat", "presumpció laboralitat"]),
        "severity": "alta",
        "jurisdiction": "estatal",
        "is_active": 1
    }

    sql = """
    INSERT INTO special_cases 
    (title, category, description, legalBasis, `procedure`, examples)
    VALUES (%s, %s, %s, %s, %s, %s)
    """
    
    values = (
        trade_case["title"],
        trade_case["category"],
        trade_case["description"],
        trade_case["legalBasis"],
        trade_case["procedure"],
        trade_case["examples"],
    )
    
    cursor.execute(sql, values)
    conn.commit()
    
    print(f"✅ Cas TRADE inserit correctament (ID: {cursor.lastrowid})")
    
    # Verificar
    cursor.execute("SELECT id, title, category FROM special_cases WHERE title LIKE '%TRADE%'")
    rows = cursor.fetchall()
    for row in rows:
        print(f"   → ID {row[0]}: {row[1]} [{row[2]}]")
    
    cursor.close()
    conn.close()

if __name__ == "__main__":
    db_url = get_db_url()
    if not db_url:
        print("ERROR: No s'ha trobat DATABASE_URL")
        sys.exit(1)
    print(f"Connectant a la BD...")
    insert_trade_case(db_url)
