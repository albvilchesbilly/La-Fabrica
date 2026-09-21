# ADR-0010: módulo-puerta como único punto de contacto con el proveedor de IA

**Estado:** Aceptado
**Fecha:** 2026-09-21
**Fecha de revisión futura:** junto con el ADR-0005 (cita semestral del policy o tras el primer producto), y en cuanto se defina el presupuesto de tokens por agente (cola de diseño fino).

## Contexto

El ADR-0005 decidió que toda llamada a IA pasa por un módulo cliente único y que ningún agente llama a la API directamente. Este paso lo materializa. El módulo debe ser pequeño ("un archivo, no un proyecto"), registrar cada invocación con agente, propósito y tokens consumidos (regla 10, y datos para el futuro presupuesto por agente), y no exponer la clave de API en el repo (regla 1; la clave vive en Secrets de GitHub Actions, ADR-0006).

## Opciones evaluadas

1. **Llamadas HTTP crudas** (`fetch` nativo de Node) sin ninguna dependencia, para cumplir literalmente "un archivo".
2. **SDK oficial de Anthropic (`@anthropic-ai/sdk`) con versión fijada exacta**, envuelto en un único módulo `puerta.js` que valida agente y propósito, llama, y registra — **opción elegida**.
3. **Capa de abstracción multiproveedor** (interfaz genérica con adaptadores), anticipando el fin de la suspensión de la regla de no-captura.

## Criterios

- Sin dependencias opacas ni sin versión fijable (regla 3, policy tecnológico).
- Trazabilidad por invocación: agente, propósito, modelo, tokens (regla 10).
- Tamaño proporcional: que Billy pueda auditar el módulo entero en una lectura.

## Decisión

Se adopta la opción 2. `src/puerta-ia/puerta.js` exporta `crearPuerta()` → `invocar({ agente, proposito, messages, ... })`:

- Rechaza la llamada si el `agente` no tiene ADN en `agents/` o si no declara `proposito`. Sin identidad ni motivo no hay llamada.
- Usa `@anthropic-ai/sdk` con versión exacta (`0.127.0`) en `src/puerta-ia/package.json` — el único motivo de que exista ese manifiesto es fijar la versión (veto del policy a dependencias sin versión fijable).
- Modelo por defecto `claude-opus-5`; activa el *fallback* de refusal del lado del servidor (`fallbacks: "default"`) para que una negativa por clasificador de seguridad no deje al agente sin respuesta.
- Registra cada invocación (éxito o error) como una línea JSON en `memoria/invocaciones-ia.jsonl` (configurable con `PUERTA_IA_REGISTRO`): fecha, agente, propósito, modelo pedido y servido, tokens de entrada/salida/caché, latencia. Este registro es materia prima para el presupuesto por agente; no es `memoria/eventos/` (que sigue siendo exclusivo del orquestador).
- La clave la resuelve el SDK desde el entorno; el módulo nunca la lee ni la escribe.

Incluye `puerta.test.js` con un cliente falso: verifica las validaciones y el registro sin llamar a la API real.

## Opciones descartadas y por qué

- **Opción 1** se descarta: HTTP crudo obliga a reimplementar reintentos, tipado de errores y cambios de contrato de la API que el SDK oficial ya mantiene. Es más código propio que auditar, no menos, y el SDK oficial con versión fijada no es una dependencia opaca en el sentido de la regla 3.
- **Opción 3** se descarta: es exactamente la abstracción prematura que el ADR-0005 rechazó. Si la revisión semestral levanta la suspensión de la regla de no-captura, el módulo-puerta ya es el único sitio que habrá que cambiar.

## Consecuencias

- Cualquier agente que necesite IA importa `src/puerta-ia/puerta.js`; una importación directa de `@anthropic-ai/sdk` fuera de este módulo es una violación del policy tecnológico (veto: "llamadas a IA fuera del módulo-puerta"). Detectarlo mecánicamente en el portero queda en la cola de diseño fino.
- `memoria/invocaciones-ia.jsonl` crecerá con el uso; es append-only pero aún no tiene rotación ni agregación. Se resuelve cuando exista el presupuesto por agente.
- El módulo depende de que el runner tenga Node 18+ (por el SDK) y de que `ANTHROPIC_API_KEY` esté en el entorno. En local sin clave, solo funciona el test con cliente falso.

## Confrontación crítica

1. **Abogado del diablo:**
   - Un `package.json` ya es un embrión de proyecto: contradice la letra de "un archivo, no un proyecto", aunque solo sirva para fijar la versión.
   - Validar el agente comprobando que existe `agents/<id>.md` es identidad por convención, no por credencial: cualquier código puede declararse `cto-ia`. Es coherente con la deuda del ADR-0006 pero no la reduce.
   - Activar `fallbacks: "default"` significa que una respuesta puede venir de un modelo distinto al pedido; el registro guarda `modelo_servido` precisamente para que no sea invisible, pero un agente que no lo mire puede asumir que habló con Opus 5 cuando no fue así.
2. **Prueba de simplicidad:** la versión más simple que resuelve el 80% es la opción 1 (HTTP crudo, cero dependencias). No se elige porque el 20% restante —reintentos, errores tipados, seguimiento de cambios de API— es mantenimiento recurrente que el SDK oficial absorbe; el coste de una dependencia con versión exacta es menor que el de mantener un cliente HTTP propio.
3. **Prueba de reversibilidad:** coste de salida bajo a 3 meses: un archivo y un manifiesto; cambiar de SDK o de proveedor toca solo este módulo, que es la razón de que exista. El registro JSONL es portable a cualquier backend.
4. **Dependencias opacas:** `@anthropic-ai/sdk` es código abierto, versionado y auditable; se fija con versión exacta, sin rangos. Ninguna otra dependencia.
5. **Nivel de provocación aplicado:** P2. Cambio: se añadió la validación obligatoria de `agente` contra los ADNs existentes y de `proposito` no vacío; la primera versión aceptaba cualquier cadena, lo que habría dejado el registro sin valor para un presupuesto por agente.
