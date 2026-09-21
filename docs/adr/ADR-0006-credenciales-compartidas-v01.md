# ADR-0006: limitación de credenciales declarada; criterio de graduación a V0.2

**Estado:** Aceptado
**Fecha:** 2026-09-21
**Fecha de revisión futura:** cuando se dé de alta el primer agente con cuenta de servicio propia — ese evento, por definición, gradúa el repo a V0.2.

## Contexto

El mínimo privilegio (regla 8) exige que cada agente tenga solo los permisos que necesita. La forma completa de aplicarlo es dar a cada agente su propia identidad (cuenta de servicio, token) con permisos granulares. Montar esa infraestructura de identidades antes del primer producto sería trabajo de plataforma sin un consumidor real todavía.

## Opciones evaluadas

1. **Credenciales propias por agente desde V0.1**: cada agente con su cuenta de servicio de Google Cloud y su token de GitHub con scope mínimo.
2. **Credenciales compartidas de Billy en V0.1, con mínimo privilegio aplicado por verificación en CI** (el portero de alcances, Paso 9) en vez de por separación de llaves, y la deuda declarada por escrito con criterio explícito de cuándo se paga — **opción elegida**.
3. **Credenciales compartidas sin declarar la limitación**, confiando en que el portero de CI baste indefinidamente.

## Criterios

- Coste de puesta en marcha antes del primer producto.
- Cumplimiento real vs. aparente de la regla 8 (mínimo privilegio).
- Trazabilidad de la deuda técnica (regla 10): que quede escrita, no implícita.

## Decisión

Se adopta la opción 2. Todos los agentes operan en V0.1 con las credenciales de Billy. El mínimo privilegio se hace cumplir por verificación en CI (el portero de alcances valida que el diff de cada PR respeta `puede_tocar`/`no_puede_tocar` del ADN firmante), no por separación de llaves real. Se declara explícitamente que dar a cada agente sus propias identidades es **el** criterio que convierte la V0.1 en V0.2 — no uno entre varios, el que define el salto de versión. La clave de API de Anthropic vive en Secrets de GitHub Actions, nunca en el repo.

## Opciones descartadas y por qué

- **Opción 1** se descarta para V0.1: construir infraestructura de identidades por agente antes de tener un solo producto corriendo es coste de plataforma sin consumidor, y contradice el principio rector (demostrar que se puede construir, no exhibir madurez de infraestructura prematura).
- **Opción 3** se descarta: no declarar la limitación por escrito la convierte en una brecha silenciosa entre lo que la regla 8 promete y lo que el sistema realmente hace. Eso viola la regla 10 (trazabilidad total) — Billy y cualquier auditor futuro deben poder ver la deuda sin tener que descubrirla por inspección del código.

## Consecuencias

- El mínimo privilegio en V0.1 es una promesa aplicada por software (el portero de CI), no por separación física de credenciales. Un bug en el portero, o un agente que consiguiera ejecutarse fuera del flujo de PR, tendría de facto los permisos completos de Billy.
- El criterio de graduación a V0.2 queda inequívoco y verificable: el día que exista una cuenta de servicio propia de un agente, el repo ya no es V0.1.
- La clave de Anthropic en Secrets de GitHub Actions es la única credencial de IA que existe en V0.1; su fuga comprometería el módulo-puerta para todos los agentes a la vez.

## Confrontación crítica

1. **Abogado del diablo:**
   - Verificación en CI es un control detectivo (después del hecho, en el PR), no preventivo como lo sería una credencial con permisos ya recortados — un agente con un bug podría intentar una acción fuera de su alcance y solo se le pararía en el chequeo, no antes.
   - Compartir credenciales entre todos los agentes hace imposible saber, por la sola credencial usada, qué agente hizo qué — la atribución depende enteramente de la etiqueta/convención de PR, que es más fácil de falsear que una identidad separada.
   - Declarar la deuda por escrito no la reduce; solo la hace visible. El riesgo real (blast radius de una credencial compartida) sigue intacto hasta V0.2.
2. **Prueba de simplicidad:** la versión más simple que resuelve el 80% del problema de "controlar qué toca cada agente" es exactamente la elegida: verificación en CI sobre credenciales compartidas. Se justifica no ir directamente a credenciales separadas (opción 1) porque el 20% restante —aislamiento real a nivel de identidad— no tiene todavía ningún incidente que lo demande, y construirlo antes es sobre-ingeniería para un repo sin productos aún.
3. **Prueba de reversibilidad:** coste de salida alto — mencionado explícitamente en el propio documento como "criterio que convierte la V0.1 en V0.2", con lo cual, según el policy tecnológico, correspondería escalar a Billy. Aquí el escalado es implícito en el propio nombre de la decisión (V0.1 → V0.2 es un cambio de versión mayor, no una decisión técnica menor), y queda como jalón de roadmap, no como tarea suelta.
4. **Dependencias opacas:** ninguna; el mecanismo de control (portero de CI) es código propio y auditable.
5. **Nivel de provocación aplicado:** P2. Cambio: en vez de dejar la limitación de credenciales como una nota al margen, se convirtió en **el** criterio de graduación de versión, con lo que cualquier futuro PR que dé una cuenta de servicio a un agente automáticamente documenta que la fábrica pasó a V0.2.
