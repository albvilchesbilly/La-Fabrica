# ADR-0002: plantilla de ADN v0.1

**Estado:** Aceptado
**Fecha:** 2026-09-21
**Fecha de revisión futura:** tras el tercer ADN escrito con esta plantilla (Paso 4, CTO IA, ya la pone a prueba); revisión formal a los 6 meses junto con el policy tecnológico.

## Contexto

Cada agente de la fábrica necesita una definición estandarizada — su "ADN" — para que el portero de CI pueda verificar mecánicamente su alcance y para que cualquier humano pueda auditar qué puede y no puede hacer un agente sin leer su código. Sin una plantilla común, cada ADN se escribiría distinto y la verificación automática (regla 9) sería imposible.

## Opciones evaluadas

1. **ADN libre por agente**, cada uno documentado como su autor prefiera.
2. **Plantilla fija de 9 bloques**, con cabecera `id`/`tipo`/`version`, YAML para las partes estructuradas (alcance, entradas/salidas) y prosa para las que requieren juicio (misión, confrontación crítica) — **opción elegida**.
3. **Esquema JSON/YAML totalmente estructurado**, sin prosa, optimizado para parseo automático.

## Criterios

- Verificabilidad mecánica del alcance (para el portero de CI, Paso 9).
- Legibilidad humana (Billy debe poder auditar un ADN en un vistazo).
- Mínimo privilegio expresable de forma explícita (`puede_tocar` / `no_puede_tocar`).

## Decisión

Se adopta la opción 2: `agents/plantilla-adn.md` con 9 bloques (misión, nivel de autonomía, alcance, permisos mínimos, entradas/salidas, evidencia obligatoria, reversión, criterios de retiro/promoción, confrontación crítica), más `agents.md` en la raíz obligando a leer constitución + niveles + ADN propio antes de operar. Los agentes `tipo: temporal` declaran fecha de expiración.

## Opciones descartadas y por qué

- **Opción 1** se descarta: sin estructura común, ni el portero de CI ni Billy pueden verificar el alcance de forma consistente entre agentes. Viola la regla 9.
- **Opción 3** se descarta para V0.1: un esquema totalmente estructurado sería más fácil de parsear, pero bloques como "misión" o "confrontación crítica" pierden matiz forzados a JSON puro, y en esta fase priorizamos que Billy pueda leer y juzgar el fondo sin tooling adicional. Queda como candidata para V0.2 si el número de agentes crece.

## Consecuencias

- Todo agente nuevo se define copiando esta plantilla; el portero de CI (Paso 9) depende de que `alcance` y `nivel` estén en esta forma para poder validarlos automáticamente.
- El bloque 9 (confrontación crítica) se declara aquí como aplicable "solo a agentes que proponen decisiones de construir"; el reparto de papeles exacto (quién confronta, quién verifica forma, quién juzga fondo) se deja pendiente y se documentará explícitamente cuando el primer agente que lo necesite —el CTO IA, Paso 4— lo ponga en práctica.
- Los agentes `temporal` con fecha de expiración crean una dependencia: el portero de CI (Paso 9) debe comprobar expiración en cada PR.

## Confrontación crítica

1. **Abogado del diablo:**
   - Nueve bloques pueden ser demasiados para agentes triviales de un solo propósito.
   - Mezclar YAML estructurado con prosa libre en el mismo archivo complica el parseo automático futuro.
   - "Confrontación crítica" como bloque 9 sin más agentes que la ejerzan todavía es una promesa sin probar.
2. **Prueba de simplicidad:** la versión más simple (opción 1, ADN libre) resuelve el 80% de "documentar qué hace un agente", pero falla justo en el 20% crítico: la verificación automática de alcance, que es condición para la regla 9. No se elige la versión simple porque ese 20% es constitucional.
3. **Prueba de reversibilidad:** coste de salida bajo — es Markdown versionado; cambiar la plantilla no invalida ADNs existentes salvo que se retiren bloques que el portero ya valida.
4. **Dependencias opacas:** ninguna.
5. **Nivel de provocación aplicado:** P1. Cambio: se explicitó que sin bloque 9 completo el orquestador rechaza la decisión, en lugar de dejarlo como recomendación.
