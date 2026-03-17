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
