# TODO - Consultas IT

## Base de datos y modelos
- [x] Diseñar esquema de base de datos para documentos normativos
- [x] Crear tabla para casos especiales y situaciones extremas
- [x] Crear tabla para tiempos estándar de IT por patología
- [x] Crear tabla para conversaciones de chat
- [x] Crear tabla para historial de consultas

## Procesamiento de documentación
- [x] Extraer contenido de PDFs de normativa recopilada
- [x] Procesar y estructurar información de guías y manuales
- [ ] Cargar tiempos estándar de IT en base de datos
- [x] Indexar casos especiales con etiquetas y categorías
- [ ] Crear sistema de embeddings para búsqueda semántica

## Sistema de chat con IA
- [x] Implementar procedimiento tRPC para chat con contexto de IT
- [x] Crear sistema de RAG (Retrieval Augmented Generation) con documentación
- [x] Integrar LLM con prompt especializado en normativa IT
- [ ] Implementar streaming de respuestas
- [x] Guardar historial de conversaciones

## Calculadora y guía de procedimientos
- [x] Implementar calculadora de duración de IT por patología
- [x] Crear flujo de decisión para prórrogas (365, 545, 730 días)
- [ ] Desarrollar guía interactiva de procedimientos
- [ ] Implementar cálculo de prestaciones económicas
- [ ] Añadir alertas sobre plazos y fechas críticas

## Sistema de búsqueda
- [x] Implementar búsqueda por palabras clave en documentación
- [x] Crear filtros por tipo de documento y categoría
- [ ] Implementar búsqueda semántica con embeddings
- [ ] Añadir sugerencias y autocompletado
- [x] Crear índice de casos especiales navegable

## Panel de administración
- [ ] Crear interfaz para subir nuevos documentos
- [ ] Implementar editor para casos especiales
- [ ] Añadir gestión de tiempos estándar de IT
- [ ] Crear sistema de revisión y aprobación de contenidos
- [ ] Implementar logs de cambios y auditoría

## Interfaz de usuario
- [x] Diseñar sistema de colores y tipografía
- [x] Crear página de inicio con acceso a funcionalidades principales
- [x] Implementar interfaz de chat con IA
- [x] Desarrollar vista de calculadora de IT
- [x] Crear repositorio navegable de casos especiales
- [x] Implementar buscador de documentación
- [x] Diseñar guía de procedimientos interactiva
- [x] Crear panel de administración (solo para admins)
- [x] Añadir sistema de navegación y menús
- [x] Implementar diseño responsive

## Testing y entrega
- [x] Escribir tests para procedimientos tRPC
- [x] Probar sistema de chat con casos reales
- [x] Validar calculadora con diferentes escenarios
- [x] Verificar búsqueda y filtros
- [ ] Realizar pruebas de usabilidad
- [x] Crear checkpoint final

## Correcciones
- [x] Corregir visualización de casos especiales (no se amplían al hacer clic)
- [x] Corregir enlaces de la página de Documentación
- [x] Implementar historial de conversaciones del chat con panel lateral
- [x] Añadir funcionalidad para recuperar y continuar conversaciones anteriores
- [x] Añadir opción para eliminar conversaciones del historial
- [x] Implementar generación de PDF en el backend
- [x] Añadir endpoint tRPC para exportar conversaciones a PDF
- [x] Añadir endpoint tRPC para exportar casos especiales a PDF
- [x] Añadir endpoint tRPC para exportar documentos a PDF
- [x] Añadir botón de exportación en la página de chat
- [x] Añadir botón de exportación en la página de casos especiales
- [x] Añadir botón de exportación en la página de documentos

## Noves funcionalitats (sprint 2)
- [x] Afegir taula de favorits al esquema de BD
- [x] Crear endpoints tRPC per gestionar favorits (afegir, eliminar, llistar)
- [x] Implementar botó de favorit a documents i casos especials
- [x] Crear pàgina de favorits accessible des del menú
- [x] Implementar cerca avançada amb filtres combinats (tipus + jurisdicció + query)
- [x] Afegir cerca dins del contingut dels documents
- [x] Actualitzar pàgina de Documentació amb filtres avançats
- [x] Actualitzar pàgina de Casos Especials amb filtres avançats

## Correccions responsive (mòbil)
- [x] Corregir header de Home (botons surten de pantalla en mòbil)
- [x] Reduir mida de text del hero en mòbil
- [x] Corregir botons CTA (apilats verticalment en mòbil)
- [x] Revisar responsive de totes les pàgines principals

## Nous casos especials - Accidents de treball (AT)
- [x] Investigar AT en treballadors autònoms (TRADE i autònom pur)
- [x] Investigar AT en situació de pluriocupació (treballador d'una empresa que pateix AT en una altra)
- [x] Afegir procediment des de l'eCap per a parts de baixa per AT
- [x] Afegir normativa específica: LGSS, LETA, RD 1273/2003
- [x] Afegir jurisprudència rellevant sobre AT en autònoms i pluriocupació
- [x] Inserir nous casos a la base de dades

## Nou cas especial - TRADE (Treballador Autònom Econòmicament Dependent)
- [x] Investigar definició i requisits del TRADE (LETA art. 11-18)
- [x] Investigar cobertura IT i AT específica del TRADE
- [x] Investigar qui emet el part de baixa per al TRADE (eCap vs mútua)
- [x] Investigar drets específics del TRADE en IT: durada, prestació, base reguladora
- [x] Investigar jurisprudència rellevant sobre TRADE i IT/AT
- [x] Investigar el contracte TRADE i la seva relació amb la cobertura de contingències
- [x] Inserir el nou cas especial a la base de dades

## Millores categories i nous casos AT
- [x] Afegir "accident_treball" a l'enum de categories de special_cases
- [x] Migrar casos AT existents (autònom pur, pluriocupació, TRADE) a la nova categoria
- [x] Actualitzar el frontend per mostrar la nova categoria amb filtre específic
- [x] Investigar i afegir cas in itinere per a autònoms amb múltiples llocs de treball
- [x] Inserir el nou cas in itinere a la base de dades

## Nou cas especial - In itinere en teletreball parcial
- [x] Investigar normativa Llei 10/2021 de treball a distància i AT
- [x] Investigar jurisprudència TS i TSJ sobre in itinere en dies de teletreball
- [x] Investigar el criteri de l'INSS i les mútues sobre dies de teletreball vs presencial
- [x] Documentar el procediment des de l'eCap per a parts de baixa per AT en teletreball
- [x] Inserir el nou cas especial a la base de dades

## Pujada de PDFs des del panel d'administració
- [x] Instal·lar pdf-parse per extracció de text de PDFs al servidor
- [x] Crear endpoint REST POST /api/upload/pdf amb multer + pdf-parse + S3
- [x] Implementar extracció automàtica de text del PDF
- [x] Guardar el PDF a S3 i el contingut a la BD com a document
- [x] Crear interfície de pujada al panel d'administració amb drag & drop
- [x] Afegir gestió (llistar i eliminar) dels documents pujats
- [x] Escriure tests per al nou endpoint (10 tests)

## Streaming de respostes del xat
- [x] Crear endpoint REST /api/stream/chat amb Server-Sent Events (SSE)
- [x] Integrar streaming del LLM al backend
- [x] Actualitzar la interfície del xat per consumir el stream
- [x] Mostrar cursor animat mentre la IA escriu
- [x] Gestionar errors i cancel·lació del stream
- [x] Escriure tests per al nou endpoint

## Nou cas especial - Pluriactivitat (autònom + assalariat)
- [x] Investigar normativa sobre pluriactivitat: LGSS art. 313, RD 84/1996, Llei 6/2017
- [x] Investigar com es calcula la base reguladora en pluriactivitat (BR separades per règim)
- [x] Investigar qui paga la prestació d'IT en cada règim (INSS/mútua per RGSS, mútua autònoms per RETA)
- [x] Investigar si el part de baixa de l'eCap cobreix totes dues contingències (cal emetre parts separats)
- [x] Investigar casos especials: AT en una activitat, CC en l'altra
- [x] Investigar jurisprudència rellevant: STS 19/02/2002, STS 07/04/2004, STSJ Castella i Lleó 18/10/2022
- [x] Inserir el nou cas especial a la base de dades (ID: 70001, categoria: pluriempleo)
- [x] Escriure tests per al nou cas especial (10 tests, tots passen)

## Traducció al català de tots els casos especials
- [x] Exportar el contingut actual de tots els casos especials de la BD
- [x] Traduir tots els camps (títol, descripció, base legal, procediment, exemples) al català (10 casos traducts)
- [x] Actualitzar la base de dades amb el contingut traduït
- [x] Verificar la visualització al frontend (tots els casos mostren contingut en català)

## Bug: quadre d'entrada de text no apareix a la pàgina de xat
- [x] Diagnosticar per què no es mostra el camp d'entrada de text al xat (causa: min-h-screen sense overflow-hidden feia que el quadre quedés fora del viewport)
- [x] Corregir el bug: canviat a h-screen + overflow-hidden + min-h-0 al contenidor de missatges

## Millores del xat i traducció completa
- [x] Afegir suggeriments ràpids clicables a la pantalla inicial del xat (8 consultes freqüents)
- [x] Traduir tots els textos en castellà de la interfície al català (Home, Chat, CasosEspeciales, Documentos, Favorits, Admin, NotFound)
- [x] Canviar el títol de la pestanya del navegador a "Consultes IT - Bot de consultes sobre la incapacitat temporal"
- [x] Obrir automàticament el sidebar quan l'usuari té converses anteriors (useEffect amb sidebarInitialized)
- [x] Corregir tots els links interns per usar rutes en català (/casos-especials, /documents)
- [x] Afegir 10 tests per a les millores del xat (72 tests en total, tots passen)

## Millores pàgina de Documentació
- [x] Afegir camps publicationYear (int) i status (vigent/derogada/en_revisio) a la taula documents
- [x] Migrar la BD amb pnpm db:push (migració 0003 aplicada)
- [x] Actualitzar el router tRPC per filtrar per any i per estat
- [x] Actualitzar la pàgina de Documentació amb filtre per any de publicació (selector dinàmic)
- [x] Afegir indicador visual de vigència (badge verd/vermell/groc) a cada targeta i al diàleg
- [x] Actualitzar tots els documents existents amb any i estat (SQL directe)
- [x] Afegir avís visual al diàleg per a documents derogats i en revisió
- [x] Escriure 19 tests per als nous filtres (91 tests en total, tots passen)

## Bug: camps examples i procedure es mostren com a JSON en brut a les targetes de casos especials
- [x] Diagnosticar: el problema era a la BD (dades guardades com a JSON array en lloc de text pla)
- [x] Corregir el camp examples: 5 casos (30001-30004, 60001) convertits de JSON array a Markdown
- [x] Corregir el camp legalBasis: 2 casos (30001, 30002) convertits de JSON array a llista Markdown
- [x] Verificar que no queden camps amb JSON escapat (0 resultats a la consulta de verificació)

## Millores panell d'admin i edició directa de casos especials
- [x] Afegir validació anti-JSON al formulari d'admin (avís si el contingut sembla JSON array/object)
- [x] Afegir botó "Editar" a les targetes de Casos Especials (visible només per a admins, icona llapis)
- [x] El botó d'edició obre un diàleg modal amb el formulari d'edició del cas
- [x] El formulari d'edició inclou tots els camps: títol, descripció, base legal, procediment, exemples, categoria
- [x] Confirmació addicional si es detecta JSON als camps (AlertDialog)
- [x] Botó "Editar" també visible al diàleg de visualització del cas
- [x] Procediment tRPC specialCases.update afegit al router (protectedProcedure, admin only)
- [x] Funció updateSpecialCase afegida a db.ts
- [x] 23 tests nous (114 tests en total, tots passen)

## Bug: cerca de diagnòstic a la calculadora d'IT no retorna resultats
- [x] Diagnosticar: la taula it_durations estava completament buida (0 registres)
- [x] Poblar la taula amb 96 diagnòstics de 12 categories basats en les taules de l'INSS 2023
- [x] Verificar que la cerca funciona correctament (lumbalgia, hèrnia, fractura, depressió, etc.)
- [x] Escriure 18 tests per a la calculadora (132 tests en total, tots passen)

## Bug: quadre d'entrada del xat no visible a Safari iOS
- [x] Corregir h-screen → h-dvh (Dynamic Viewport Height, suportat des de Safari iOS 15.4)
- [x] Afegir viewport-fit=cover al meta viewport per gestionar el notch i la safe area
- [x] Afegir padding-bottom: max(1rem, env(safe-area-inset-bottom)) a l'àrea d'entrada
- [x] Verificar que el servidor compila correctament (132 tests passen)

## Millora calculadora: durades reals INSS 2023 i ajustaments CNAE/CNO
- [x] Investigar el Manual de Tiempos Óptimos de IT (INSS, 4a edició) - PDF oficial descarregat i analitzat
- [x] Investigar la relació CNO-11 i ajustaments de durada (Taula 15 del manual)
- [x] Corregir les durades de 70 diagnòstics (neoplàsies: 90-365 dies; cardiovascular: 30-180; etc.)
- [x] Afegir factors de correcció per 17 grups d'ocupació CNO-11 a les patologies més prevalents
- [x] Actualitzar el frontend amb selector de grup CNO-11 i càlcul de dies ajustats en temps real
- [x] Afegir taula expandible amb tots els factors per grup d'ocupació
- [x] Escriure 19 tests nous (151 tests en total, tots passen)

## Integració Reial Decret BOE-A-2023-160
- [x] Extreure el contingut del PDF del BOE (pdftotext, 350 línies)
- [x] Identificar l'articulat rellevant: modificació art. 2.3 i nova redacció art. 7 del RD 625/2014
- [x] Inserir el document a la BD (ID: 30002, tipus: decreto, estat: vigent, any: 2023)
- [x] PDF pujat a S3/CDN amb URL pública permanent
- [x] Contingut estructurat en català amb implicacions pràctiques per al metge de família (eCap)
- [x] Etiquetes: RD 1060/2022, parts mèdics, tramitació electrònica, 180 dies, INSS, mútua, eCap
- [x] Escriure 13 tests (164 tests en total, tots passen)

## Integració Reial Decret 1299/2006 sobre malalties professionals
- [x] Descarregar el PDF del RD 1299/2006 del BOE (1,9 MB, 9854 línies de text)
- [x] Extreure i estructurar el contingut: 6 grups de malalties, implicacions per al sector sanitari
- [x] Inserir el document a la BD (ID: 30003, tipus: decreto, estat: vigent, any: 2006)
- [x] PDF pujat a S3/CDN amb URL pública permanent
- [x] Contingut estructurat en català amb èmfasi en el personal sanitari (Grups 2H i 3A)
- [x] Escriure 15 tests (179 tests en total, tots passen)

## Tres noves millores (20/03/2026)
- [x] Afegir cas especial: malaltia professional en personal sanitari (punxada accidental → Hepatitis B, Grup 3A RD 1299/2006) - ID: 80001
- [x] Integrar el RD 625/2014 com a font normativa fiable (norma base gestió parts IT primers 365 dies) - ID: 15 actualitzat
- [x] Crear secció "Contingències Professionals" a la pàgina d'inici (AT vs MP vs CC, taula comparativa, links a casos i documents)
- [x] Escriure 18 tests per a les tres millores (197 tests en total, tots passen)
## Nous casos especials: embaràs de risc i reducció de jornada (20/03/2026)
- [x] Investigar normativa IT durant embaràs de risc vs. prestació per risc durant l'embaràs (LGSS art. 186-187, RD 295/2009)
- [x] Investigar normativa reducció de jornada per guarda legal i IT (ET art. 37.6, LGSS art. 237.3, STSJ Andalusia 2019)
- [x] Inserir cas especial ID 90001: IT durant embaràs de risc vs. prestació per risc durant l'embaràs (categoria: embarazo)
- [x] Inserir cas especial ID 90002: Reducció de jornada per guarda legal i IT: càlcul de la base reguladora (categoria: otro)
- [x] Escriure 21 tests per als dos nous casos (218 tests en total, tots passen)

## Correccions visuals i millores xat (20/03/2026 - sprint 3)
- [ ] Corregir errors visuals als casos especials: Markdown no renderitzat (## ** | taules) al diàleg i les targetes
- [ ] Afegir suggeriments ràpids al xat: "Diferència entre embaràs de risc i risc durant l'embaràs"
- [ ] Afegir suggeriments ràpids al xat: "IT amb reducció de jornada per guarda legal"
- [ ] Revisar la bibliografia recent per identificar nous casos especials potencials
- [x] Inserir cas especial ID 90003: IT durant un ERTE/ERTO: qui paga i com es gestiona (categoria: otro)
- [x] Inserir cas especial ID 90004: Prestació per risc durant la lactància natural (categoria: lactancia)
- [x] Escriure tests per als nous casos 90003 i 90004 (239 tests en total, tots passen)
- [x] Revisar la bibliografia recent i identificar nous casos (ERTE+IT, risc durant la lactància)

## Sprint 4 (20/03/2026)
- [x] Inserir cas especial ID 90005: IT i permís parental (16 setmanes): compatibilitat i base reguladora
- [x] Implementar funció stripMarkdown per netejar el preview de les targetes de casos especials
- [x] Afegir badge "Nou" a les targetes de casos especials afegits en els últims 30 dies
- [x] Afegir filtre "Nous" a la pàgina de Casos Especials per filtrar per casos recents
- [x] Escriure tests per al nou cas especial i les millores visuals

## Iteració 2025-03-20 (tard)
- [ ] Ampliar document Llei 1/2023 (menstruació incapacitant) amb text complet i protocol català
- [ ] Crear pàgina de Novetats (últims 30 dies: casos i documents)
- [x] Corregir desbordament definitiu del diàleg de casos especials (títol llarg + taules en mòbil)

## Pàgina Reclamacions i Recursos
- [ ] Investigar normativa reclamació alta metge de família (art. 170 LGSS, RD 625/2014)
- [ ] Investigar normativa reclamació alta ICAM/inspecció mèdica (Catalunya)
- [ ] Investigar normativa reclamació alta mútua (accident laboral)
- [ ] Investigar normativa determinació de contingències
- [ ] Crear dades de reclamacions a la BD
- [ ] Crear pàgina Reclamacions.tsx amb les 4 vies
- [ ] Registrar ruta /reclamacions a App.tsx i navegació
- [x] Pàgina de Reclamacions i Recursos (4 vies: ICAM, mútua AT, INSS CC, determinació contingències)
- [x] Link Reclamacions a la navegació (desktop i mòbil)
- [x] Tests per a la pàgina de Reclamacions (21 tests)
- [x] Targeta Reclamacions a la pàgina d'inici (features grid)
- [x] Suggeriments ràpids al xat sobre reclamacions (2 nous)
- [x] Corregir títol de la pestanya del navegador en català
- [x] Eliminar badges d'urgència de la pàgina de Reclamacions
- [x] Corregir títol de la pestanya (VITE_APP_TITLE) en català
- [x] Botó Reclamacions al hero de la pàgina d'inici
- [x] Afegir via impugnació alta ICAM < 365 dies a Reclamacions (proposta mútua confirmada per ICAM)
- [x] Afegir suggeriment ràpid al xat sobre proposta d'alta de mútua confirmada per ICAM (17 suggeriments en total)
