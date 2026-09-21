# Policy tecnológico

Subordinado a las 11 reglas de oro: si algo en este documento contradice `constitucion/reglas.md`, ganan las reglas.

## Stack por defecto (sin justificación)

- **Google Cloud**: Cloud Run para cómputo; Cloud SQL/PostgreSQL cuando haya productos corriendo con estado.
- **GitHub Actions** para CI/CD.

Usar este stack no requiere ADR. Salirse de él, sí.

## Capa de IA: Anthropic como proveedor único en V0.1

Decisión consciente: la regla de "ningún proveedor captura una capa crítica" queda **suspendida** para esta versión, con revisión obligatoria en la cita semestral de este policy.

Todas las llamadas a IA pasan por un módulo cliente único (**módulo-puerta**, `src/puerta-ia/`, ver Paso 10). Ningún agente llama a la API de Anthropic directamente.

## Admisión de tecnología nueva

Toda tecnología fuera del stack por defecto exige un ADR con bloque 9 completo, que acredite:

- Sin dependencias opacas (veto constitucional, regla 3).
- Coste de salida documentado; si es alto, escala a Billy.
- Madurez mínima demostrable.
- Permisos granulares disponibles (para poder aplicar mínimo privilegio, regla 8).

## Vetos

- Cajas negras inauditables.
- Dependencias sin versión fijable.
- Componentes que exigen permisos amplios sin granularidad.
- Llamadas a IA fuera del módulo-puerta.

## Revisión

Cada 6 meses, o tras cada producto terminado, lo que ocurra antes. **Las 11 reglas no se revisan** — solo este policy.
