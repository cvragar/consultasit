#!/usr/bin/env python3
"""
Script para procesar PDFs de normativa IT y cargar datos en la base de datos
"""
import os
import sys
import json
import pymupdf  # PyMuPDF
import mysql.connector
from urllib.parse import urlparse
from datetime import datetime

# Obtener DATABASE_URL del entorno
database_url = os.getenv('DATABASE_URL')
if not database_url:
    print("Error: DATABASE_URL no está definida")
    sys.exit(1)

# Parsear DATABASE_URL
parsed = urlparse(database_url)
db_config = {
    'host': parsed.hostname,
    'port': parsed.port or 3306,
    'user': parsed.username,
    'password': parsed.password,
    'database': parsed.path.lstrip('/').split('?')[0]
}

def extract_text_from_pdf(pdf_path):
    """Extrae texto de un PDF usando PyMuPDF"""
    try:
        doc = pymupdf.open(pdf_path)
        text = ""
        for page in doc:
            text += page.get_text()
        doc.close()
        return text.strip()
    except Exception as e:
        print(f"Error al procesar {pdf_path}: {e}")
        return None

def insert_document(cursor, title, doc_type, source, jurisdiction, content, summary=None, tags=None):
    """Inserta un documento en la base de datos"""
    query = """
    INSERT INTO documents (title, type, source, jurisdiction, content, summary, tags, createdAt, updatedAt)
    VALUES (%s, %s, %s, %s, %s, %s, %s, NOW(), NOW())
    """
    tags_json = json.dumps(tags if tags else [])
    cursor.execute(query, (title, doc_type, source, jurisdiction, content, summary, tags_json))
    return cursor.lastrowid

def insert_special_case(cursor, title, category, description, legal_basis=None, procedure=None, examples=None):
    """Inserta un caso especial en la base de datos"""
    query = """
    INSERT INTO special_cases (title, category, description, legalBasis, `procedure`, examples, createdAt, updatedAt)
    VALUES (%s, %s, %s, %s, %s, %s, NOW(), NOW())
    """
    cursor.execute(query, (title, category, description, legal_basis, procedure, examples))
    return cursor.lastrowid

def load_normativa_documents(cursor):
    """Carga documentos normativos desde /home/ubuntu/normativa_it/"""
    docs_dir = "/home/ubuntu/normativa_it"
    
    # Procesar PDFs
    pdf_files = [
        {
            'path': 'guia_valoracion_it_atencion_primaria.pdf',
            'title': 'Guía de valoración de incapacidad laboral para médicos de atención primaria',
            'type': 'guia',
            'source': 'ENMT - Instituto de Salud Carlos III',
            'jurisdiction': 'estatal',
            'tags': ['valoracion', 'atencion_primaria', 'guia_practica']
        },
        {
            'path': 'manual_it_atencion_primaria.pdf',
            'title': 'Incapacidad Temporal: Manual para el manejo en atención primaria',
            'type': 'manual',
            'source': 'AMAT',
            'jurisdiction': 'estatal',
            'tags': ['manual', 'atencion_primaria', 'gestion']
        },
        {
            'path': 'tiempos_estandar_it_inss.pdf',
            'title': 'Tiempos estándar de Incapacidad Temporal',
            'type': 'guia',
            'source': 'INSS',
            'jurisdiction': 'estatal',
            'tags': ['tiempos_estandar', 'duracion', 'inss']
        },
        {
            'path': 'gestio_incapacitat_temporal_fullet.pdf',
            'title': 'Gestió de la incapacitat temporal - Fullet informatiu',
            'type': 'guia',
            'source': 'Departament de Salut de Catalunya',
            'jurisdiction': 'autonomica',
            'tags': ['catalunya', 'gestion', 'informacion']
        }
    ]
    
    for pdf_info in pdf_files:
        pdf_path = os.path.join(docs_dir, pdf_info['path'])
        if os.path.exists(pdf_path):
            print(f"Procesando {pdf_info['title']}...")
            content = extract_text_from_pdf(pdf_path)
            if content:
                doc_id = insert_document(
                    cursor,
                    title=pdf_info['title'],
                    doc_type=pdf_info['type'],
                    source=pdf_info['source'],
                    jurisdiction=pdf_info['jurisdiction'],
                    content=content[:50000],  # Limitar a 50k caracteres por ahora
                    tags=pdf_info['tags']
                )
                print(f"  ✓ Documento insertado con ID {doc_id}")
        else:
            print(f"  ✗ Archivo no encontrado: {pdf_path}")
    
    # Cargar documentos markdown
    md_files = [
        {
            'path': 'rd_625_2014_resumen.md',
            'title': 'Real Decreto 625/2014 - Gestión y control de IT',
            'type': 'decreto',
            'source': 'BOE',
            'jurisdiction': 'estatal',
            'tags': ['rd_625_2014', 'normativa', 'gestion_control']
        },
        {
            'path': 'duracion_maxima_prorrogas_it.md',
            'title': 'Duración máxima de IT y prórrogas',
            'type': 'guia',
            'source': 'Compilación normativa',
            'jurisdiction': 'estatal',
            'tags': ['duracion', 'prorrogas', '365_dias', '545_dias', '730_dias']
        },
        {
            'path': 'situaciones_especiales_it.md',
            'title': 'Situaciones especiales de IT',
            'type': 'guia',
            'source': 'Wolters Kluwer / Normativa',
            'jurisdiction': 'estatal',
            'tags': ['situaciones_especiales', 'menstruacion', 'embarazo', 'donacion']
        },
        {
            'path': 'folleto_gestion_it_departament_salut.md',
            'title': 'Gestión de IT - Departament de Salut',
            'type': 'guia',
            'source': 'Departament de Salut de Catalunya',
            'jurisdiction': 'autonomica',
            'tags': ['catalunya', 'gestion', 'departament_salut']
        },
        {
            'path': 'ics_gestion_it_hospitales.md',
            'title': 'Gestión de IT en ingresos hospitalarios - ICS',
            'type': 'guia',
            'source': 'Institut Català de la Salut',
            'jurisdiction': 'autonomica',
            'tags': ['catalunya', 'ics', 'hospitales', 'ingresos']
        },
        {
            'path': 'curso_formacion_it_metges_catalunya.md',
            'title': 'Curso de formación: Incapacitats Temporals',
            'type': 'guia',
            'source': 'Metges de Catalunya',
            'jurisdiction': 'autonomica',
            'tags': ['catalunya', 'formacion', 'casos_especiales']
        }
    ]
    
    for md_info in md_files:
        md_path = os.path.join(docs_dir, md_info['path'])
        if os.path.exists(md_path):
            print(f"Cargando {md_info['title']}...")
            with open(md_path, 'r', encoding='utf-8') as f:
                content = f.read()
            doc_id = insert_document(
                cursor,
                title=md_info['title'],
                doc_type=md_info['type'],
                source=md_info['source'],
                jurisdiction=md_info['jurisdiction'],
                content=content,
                tags=md_info['tags']
            )
            print(f"  ✓ Documento insertado con ID {doc_id}")
        else:
            print(f"  ✗ Archivo no encontrado: {md_path}")

def load_special_cases(cursor):
    """Carga casos especiales predefinidos"""
    special_cases = [
        {
            'title': 'Menstruación incapacitante',
            'category': 'menstruacion',
            'description': 'Desde el 1 de junio de 2023, las mujeres con menstruaciones incapacitantes pueden solicitar baja médica por IT. Se considera situación de incapacidad temporal derivada de enfermedad común.',
            'legal_basis': 'Real Decreto-ley 5/2023, de 28 de junio. Artículo 9 que modifica el artículo 169 de la Ley General de la Seguridad Social.',
            'procedure': 'La baja la emite el médico de atención primaria o ginecólogo del sistema público de salud. No se requiere periodo mínimo de cotización. La prestación es del 60% de la base reguladora desde el primer día (sin los 3 días de carencia habitual).',
            'examples': 'Dismenorrea severa, endometriosis sintomática, síndrome premenstrual incapacitante.'
        },
        {
            'title': 'Interrupción voluntaria del embarazo (IVE)',
            'category': 'embarazo',
            'description': 'La interrupción voluntaria del embarazo genera derecho a IT desde el mismo día de la intervención.',
            'legal_basis': 'Ley Orgánica 2/2010, de 3 de marzo, de salud sexual y reproductiva y de la interrupción voluntaria del embarazo.',
            'procedure': 'El médico que realiza la IVE emite el parte de baja. Se considera contingencia común. La duración habitual es de 3-7 días según el método utilizado y la evolución clínica.',
            'examples': 'IVE farmacológica: 3-5 días. IVE quirúrgica: 5-7 días. Puede prolongarse si hay complicaciones.'
        },
        {
            'title': 'Gestación a partir de la semana 39',
            'category': 'embarazo',
            'description': 'A partir de la semana 39 de gestación, la embarazada puede solicitar la baja por IT si su estado o actividad laboral lo requieren.',
            'legal_basis': 'Real Decreto 625/2014. Criterio médico basado en riesgo materno-fetal.',
            'procedure': 'El médico de atención primaria o ginecólogo valora la situación laboral y el estado de la gestante. Se considera contingencia común. La baja se extiende hasta el parto.',
            'examples': 'Trabajos de pie prolongados, esfuerzos físicos, riesgo de parto prematuro, hipertensión gestacional.'
        },
        {
            'title': 'Donación de órganos',
            'category': 'donacion_organos',
            'description': 'La donación de órganos en vida genera derecho a IT como contingencia de accidente no laboral.',
            'legal_basis': 'Ley 30/1979, de 27 de octubre, sobre extracción y trasplante de órganos. Real Decreto Legislativo 8/2015 (LGSS).',
            'procedure': 'El hospital donde se realiza la extracción emite el parte de baja. Se considera accidente no laboral (contingencia común con mejores prestaciones). La prestación es del 75% desde el primer día. Duración según el órgano donado: riñón 30-45 días, hígado 45-60 días.',
            'examples': 'Donación de riñón: 30-45 días. Donación de lóbulo hepático: 45-60 días. Donación de médula ósea: 7-15 días.'
        },
        {
            'title': 'Bajas retroactivas',
            'category': 'baja_retroactiva',
            'description': 'Las bajas con efecto retroactivo solo son posibles en situaciones excepcionales y debidamente justificadas.',
            'legal_basis': 'Real Decreto 625/2014. Criterio jurisprudencial del Tribunal Supremo.',
            'procedure': 'Solo se admiten bajas retroactivas si: 1) El trabajador no pudo acudir al médico por la gravedad de su estado. 2) Ingreso hospitalario urgente. 3) Situación de fuerza mayor debidamente acreditada. El médico debe justificar por escrito la imposibilidad de emitir la baja en su momento. Máximo retroactividad: 5-7 días.',
            'examples': 'Ingreso urgente en UCI, accidente con pérdida de consciencia, imposibilidad física de desplazamiento.'
        },
        {
            'title': 'Pluriempleo',
            'category': 'pluriempleo',
            'description': 'El trabajador pluriempleado en IT debe causar baja en todos sus empleos, aunque la incapacidad solo afecte a uno de ellos.',
            'legal_basis': 'Artículo 169 LGSS. Sentencia del Tribunal Supremo de 18 de julio de 2019.',
            'procedure': 'El médico emite un único parte de baja. El trabajador debe presentar copia en todas sus empresas. La prestación se calcula sobre la base de cotización conjunta de todos los empleos. No puede trabajar en ninguno de los empleos mientras esté de baja.',
            'examples': 'Trabajador con contrato en dos empresas: si se rompe una pierna, debe causar baja en ambas aunque en una trabaje solo con ordenador.'
        },
        {
            'title': 'IT y prisión',
            'category': 'prision',
            'description': 'El ingreso en prisión suspende la prestación por IT, pero no extingue el proceso.',
            'legal_basis': 'Artículo 169.1.d LGSS. Sentencia del Tribunal Supremo de 25 de febrero de 2020.',
            'procedure': 'Cuando el trabajador ingresa en prisión, la mutua o el INSS suspende el pago de la prestación. El proceso de IT queda en suspenso. Si sale de prisión antes de agotarse los plazos de IT, puede reanudar la prestación. El tiempo en prisión no computa para los plazos de IT.',
            'examples': 'Trabajador en IT por depresión que ingresa en prisión preventiva: se suspende la prestación. Si sale en libertad provisional, puede reanudar la IT.'
        },
        {
            'title': 'IT en extranjeros',
            'category': 'extranjeros',
            'description': 'Los extranjeros con permiso de trabajo tienen los mismos derechos a IT que los españoles. Los extranjeros sin permiso de trabajo no tienen derecho a prestación económica, pero sí a asistencia sanitaria.',
            'legal_basis': 'Ley Orgánica 4/2000 sobre derechos y libertades de los extranjeros en España. Real Decreto Legislativo 8/2015 (LGSS).',
            'procedure': 'Extranjeros con permiso de trabajo: mismos requisitos y procedimiento que trabajadores españoles. Extranjeros sin permiso: el médico puede emitir baja médica para justificar ausencia laboral, pero no hay prestación económica. Refugiados y solicitantes de asilo: equiparados a españoles.',
            'examples': 'Trabajador extranjero con permiso de trabajo: IT normal. Trabajador irregular: baja médica sin prestación económica.'
        },
        {
            'title': 'Vacaciones durante IT',
            'category': 'vacaciones',
            'description': 'El trabajador en IT no puede disfrutar de vacaciones. Si estaba de vacaciones y cae enfermo, puede solicitar IT y las vacaciones se interrumpen.',
            'legal_basis': 'Artículo 38 del Estatuto de los Trabajadores. Sentencia del Tribunal de Justicia de la Unión Europea (TJUE) de 21 de junio de 2012.',
            'procedure': 'Si el trabajador enferma durante las vacaciones, debe solicitar baja médica inmediatamente. Las vacaciones se interrumpen desde el día de la baja. Los días de vacaciones no consumidos se pueden disfrutar posteriormente. Si la IT se inicia antes de las vacaciones programadas, estas se posponen.',
            'examples': 'Trabajador de vacaciones que sufre un accidente: solicita baja, las vacaciones se interrumpen y podrá disfrutarlas después del alta.'
        },
        {
            'title': 'Recaída en IT',
            'category': 'recaida',
            'description': 'Se considera recaída cuando el trabajador vuelve a causar baja por la misma patología o relacionada en los 180 días siguientes al alta.',
            'legal_basis': 'Artículo 169 LGSS. Real Decreto 625/2014.',
            'procedure': 'El médico debe indicar en el parte de baja que se trata de una recaída. Los días de la recaída se suman a los del proceso anterior para el cómputo de los 365 días. Si el proceso anterior había superado los 365 días, la competencia es del INSS desde el primer día de la recaída. Si la nueva baja es por patología diferente, se considera proceso nuevo.',
            'examples': 'Trabajador con baja por hernia discal 300 días, alta médica, recaída a los 60 días: se suman los días y quedan 65 días hasta los 365. Trabajador con baja por depresión 200 días, alta, nueva baja por fractura: proceso nuevo independiente.'
        }
    ]
    
    for case in special_cases:
        print(f"Cargando caso especial: {case['title']}...")
        case_id = insert_special_case(
            cursor,
            title=case['title'],
            category=case['category'],
            description=case['description'],
            legal_basis=case.get('legal_basis'),
            procedure=case.get('procedure'),
            examples=case.get('examples')
        )
        print(f"  ✓ Caso especial insertado con ID {case_id}")

def main():
    """Función principal"""
    print("=== Carga de documentos de IT ===\n")
    
    try:
        # Conectar a la base de datos
        print("Conectando a la base de datos...")
        conn = mysql.connector.connect(**db_config)
        cursor = conn.cursor()
        print("✓ Conexión establecida\n")
        
        # Cargar documentos normativos
        print("--- Cargando documentos normativos ---")
        load_normativa_documents(cursor)
        print()
        
        # Cargar casos especiales
        print("--- Cargando casos especiales ---")
        load_special_cases(cursor)
        print()
        
        # Confirmar cambios
        conn.commit()
        print("\n✓ Todos los datos han sido cargados exitosamente")
        
        # Cerrar conexión
        cursor.close()
        conn.close()
        
    except Exception as e:
        print(f"\n✗ Error: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
