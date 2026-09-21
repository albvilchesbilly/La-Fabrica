# ADR-0013: formato de los ADNs — cabecera YAML restringida y cuerpo Markdown

**Estado:** Propuesto (agente `cto-ia`, N1). Decisión de Billy (2026-09-21): se adopta la **alternativa mínima** del bloque 9 — el portero rechaza todo ADN sin `puede_tocar` o `no_puede_tocar` legibles — y la migración de formato queda pendiente hasta que exista un cuarto ADN. Si entonces se acepta, supersede parcialmente al ADR-0002 (formato de la plantilla).
**Fecha:** 2026-09-21
**Fecha de revisión futura:** tras el primer ADN escrito con el nuevo formato, o cuando haya más de 5 ADNs — lo que ocurra antes.

## Contexto

Los ADNs actuales (`agents/plantilla-adn.md`, `orquestador.md`, `cto-ia.md`) envuelven en un único bloque ```` ```yaml ```` una mezcla de claves YAML (`id`, `tipo`, `nivel`, `puede_tocar`) y prosa Markdown (`## 1. Misión`, párrafos). El portero (`portero.js`) tiene que extraer `puede_tocar`/`no_puede_tocar`/`tipo`/`expira` con expresiones regulares porque el bloque no es YAML válido. El aprendizaje del producto cero lo señaló como fricción y recomendó fijar el formato antes de que existan más ADNs. Con tres archivos el coste de migrar es trivial; con diez, ya no.

## Opciones evaluadas

1. **Status quo:** un bloque ```` ```yaml ```` con YAML y prosa mezclados, parseado por regex.
2. **YAML puro:** todo el ADN como documento YAML (los bloques de prosa como cadenas multilínea). Descartado ya en el ADR-0002 por legibilidad; se reevalúa aquí con el dato nuevo del parser.
3. **Cabecera YAML restringida + cuerpo Markdown** (*frontmatter*): entre `---` van solo las claves que el portero verifica mecánicamente — `id`, `tipo`, `version`, `expira`, `nivel`, `puede_tocar`, `no_puede_tocar` — limitadas a escalares y listas de cadenas; debajo, los 9 bloques en Markdown normal — **opción propuesta**.

## Criterios

- Verificabilidad mecánica sin dependencias: el portero debe seguir sin paquetes externos (regla 3, policy tecnológico). Un subconjunto de YAML con escalares y listas planas se parsea en ~15 líneas propias; YAML completo exigiría una librería.
- Legibilidad para Billy, que audita el fondo (ADR-0002, ADR-0004).
- Coste de migración ahora frente a más adelante.

## Comparación (benchmark de forma, sobre los 3 ADNs actuales)

| | Status quo | YAML puro | Frontmatter restringido |
|---|---|---|---|
| Parser en el portero | 4 regex acopladas al texto (~30 líneas) | Librería YAML (dependencia nueva) o parser propio de YAML completo (inviable) | Parser propio de subconjunto (~15 líneas), sin dependencia |
| Falla si… | cambia la indentación o el orden de las claves | la prosa contiene `:` o `#` sin comillas | una clave de la cabecera no es escalar ni lista plana (se rechaza explícitamente) |
| Legibilidad de la prosa | Buena, pero dentro de un bloque de código (sin encabezados reales) | Mala: cadenas multilínea con sangría | Buena: Markdown normal, navegable |
| Archivos a migrar hoy | 0 | 3 | 3 |

## Decisión (propuesta)

Adoptar la opción 3. La cabecera *frontmatter* contiene únicamente las claves verificables; el portero rechaza cualquier ADN cuya cabecera use tipos fuera del subconjunto (mapas anidados, escalares multilínea), citando este ADR. Los 9 bloques pasan a Markdown normal, fuera de bloque de código. La entrada de alcance sigue siendo "rutas verificables" o prosa: el portero verifica las rutas y deja la prosa a revisión humana, como hoy (ADR-0009).

Implementación, fuera del alcance de este agente y por tanto de este PR: (a) `agents/plantilla-adn.md`, `orquestador.md` y `cto-ia.md` migrados por Billy (`agents/` es ruta protegida); (b) `portero.js` con el parser del subconjunto en lugar de las regex (`.github/` es ruta protegida). Ambos cambios se harían en un mismo PR de Billy para no romper la verificación en ningún commit intermedio.

## Opciones descartadas y por qué

- **Opción 1** se descarta: la regex funciona hoy porque los tres ADNs los escribió la misma mano en el mismo día. Cada ADN nuevo escrito por otro agente es una oportunidad de romperla en silencio (falso "APROBADO" por no encontrar `no_puede_tocar`). Es exactamente el tipo de fallo que el `pipefail` del PR #2 ya mostró: un verificador que aprueba por no ver.
- **Opción 2** se descarta de nuevo: resuelve el parser a costa de la legibilidad, y exige una dependencia o un parser completo. Pierde en dos criterios de tres.

## Consecuencias

- Ganancia: el portero deja de depender de la forma exacta del texto; un ADN mal formado se rechaza con motivo en lugar de aprobarse por omisión.
- Coste: un PR de migración de Billy (3 archivos + ~40 líneas en el portero). Mientras no se haga, este ADR queda "Propuesto" y nada cambia.
- Riesgo: si Billy migra los ADNs antes que el portero, o al revés, hay una ventana en la que el portero no verifica alcance. Mitigación: un solo PR para ambas cosas, con la prueba local de `portero.js` contra los tres ADNs migrados antes de empujar.

## Confrontación crítica

1. **Abogado del diablo:**
   - Con tres ADNs y un solo autor, el problema es hipotético: nadie ha roto la regex todavía. Es optimización prematura disfrazada de higiene.
   - Un "subconjunto de YAML" propio es un dialecto: quien escriba un ADN tendrá que aprender qué está permitido, y el rechazo del portero será la forma en que lo descubra.
   - Este ADR lo propone el mismo agente cuyo alcance (`docs/adr/`) no le permite implementarlo: es fácil proponer trabajo que hará otro.
2. **Prueba de simplicidad:** la versión más simple que resuelve el 80% es no cambiar nada y añadir al portero una comprobación de que `puede_tocar` y `no_puede_tocar` **existen** en el ADN (rechazar si falta cualquiera). Eso elimina el falso "APROBADO" por omisión con 3 líneas y sin migrar nada. **Se reconoce como alternativa válida** y se deja a Billy elegirla si prefiere posponer la migración: cierra el riesgo principal hoy, y este ADR puede quedar "Propuesto" hasta que el número de ADNs justifique el formato nuevo. Se mantiene la propuesta completa porque el coste de migrar tres archivos ahora es menor que el de migrar diez después.
3. **Prueba de reversibilidad:** coste de salida bajo a 3 meses: son archivos de texto; volver al formato anterior es revertir un PR. No hay datos ni integraciones externas que dependan del formato.
4. **Dependencias opacas:** ninguna. Se rechaza explícitamente añadir una librería YAML al portero; el parser del subconjunto es código propio, corto y auditable.
5. **Nivel de provocación aplicado:** P2. Cambio: la primera redacción proponía YAML puro (como sugería el aprendizaje del producto cero); la prueba de simplicidad la sustituyó por *frontmatter* restringido, y la objeción 1 obligó a documentar la alternativa de 3 líneas como opción legítima para Billy en vez de esconderla.
