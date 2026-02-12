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
