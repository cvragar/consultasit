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
