# ADR-0008: protección mecánica de la constitución y los ADNs

**Estado:** Aceptado
**Fecha:** 2026-09-21
**Fecha de revisión futura:** cuando la fábrica tenga más de un humano con autoridad de revisión (hoy solo Billy), para decidir si `CODEOWNERS` pasa a un equipo en vez de una persona.

## Contexto

La regla 5 ("constitución protegida") y el mínimo privilegio de cada ADN (regla 8) solo son reales si algo impide, mecánicamente, que un cambio a `constitucion/`, `agents/`, `.github/` o `memoria/eventos/` entre sin revisión humana. GitHub ofrece dos piezas para esto: `CODEOWNERS` (quién debe revisar) y branch protection (que la revisión sea obligatoria, no opcional). Solo la primera es algo que Claude Code puede escribir dentro del repo.

## Opciones evaluadas

1. **Sin candado técnico**: confiar en que los agentes respeten `no_puede_tocar` de su ADN por buena fe y en que el portero de CI (Paso 9) lo detecte a posteriori.
2. **`CODEOWNERS` sobre las rutas críticas + branch protection activada por Billy como acción manual documentada** — **opción elegida**.
3. **Branch protection sin `CODEOWNERS`**: exigir revisión de "cualquiera con permiso de escritura", sin designar a Billy específicamente como dueño de estas rutas.

## Criterios

- Qué puede ejecutar Claude Code de forma autónoma dentro del repo vs. qué requiere una acción de plataforma que solo Billy puede hacer (activar branch protection es un ajuste de configuración de GitHub, no un archivo del repo).
- Coherencia con la regla 5: la protección debe cubrir exactamente lo que la constitución declara invariante o sensible (constitución, ADNs, CI, eventos).
- Minimizar la fricción para el resto del repo (docs, memoria de aprendizajes, código de producto) que no necesita el mismo nivel de candado.

## Decisión

Se adopta la opción 2. Se crea `CODEOWNERS` exigiendo revisión de Billy en `constitucion/`, `agents/`, `.github/` y `memoria/eventos/`. La activación de branch protection en la rama principal (revisión obligatoria, sin push directo, checks de CI requeridos) queda documentada como acción manual pendiente de Billy — ya anotada en el README (Paso 0) — porque Claude Code no tiene permisos de administración del repositorio para activarla.

## Opciones descartadas y por qué

- **Opción 1** se descarta: un candado que depende de la buena fe del agente y de una detección posterior (el portero de CI actúa sobre PRs abiertos, no impide que alguien con permisos de escritura haga push directo a main) no es una protección real de la regla 5. Detectar después de que el daño ya está hecho no es lo mismo que impedirlo.
- **Opción 3** se descarta: sin `CODEOWNERS` específico, "cualquiera con permiso de escritura" podría aprobar un cambio a la constitución sin que sea necesariamente Billy — dado que en V0.1 todos los agentes operan con las credenciales de Billy (ADR-0006), esta distinción importa menos hoy, pero deja de tener sentido en cuanto existan colaboradores humanos adicionales. Se prefiere ser explícito desde ahora.

## Consecuencias

- `CODEOWNERS` por sí solo no bloquea nada: sin branch protection activada, es una señal de intención de revisión, no una barrera. Esto se declara explícitamente en el ADR y en el README como una acción manual pendiente, no como algo ya resuelto.
- Cuando Billy active branch protection, cualquier PR que toque las rutas protegidas quedará bloqueado hasta que él (o quien designe `CODEOWNERS` en el futuro) lo apruebe.
- Si más adelante se añaden colaboradores humanos, `CODEOWNERS` tendrá que evolucionar de una persona a un equipo — señalado como fecha de revisión futura de este ADR.

## Confrontación crítica

1. **Abogado del diablo:**
   - `CODEOWNERS` sin branch protection es, hasta que Billy active la segunda pieza manualmente, un candado de cartón: cualquiera con push directo lo ignora.
   - Concentrar toda la revisión crítica en una sola persona (Billy) es un cuello de botella humano, no solo el techo N3 de la constitución sino también un riesgo operativo si Billy no está disponible.
   - El archivo `CODEOWNERS` referencia rutas exactas; un refactor que mueva `agents/` a otro nombre de carpeta rompería la protección silenciosamente si no se actualiza a la vez.
2. **Prueba de simplicidad:** la versión más simple que resuelve el 80% sería no tener `CODEOWNERS` en absoluto y confiar solo en el portero de CI (opción 1). Se descarta porque el portero de CI verifica *forma* del PR (alcance, bloque 9), no *quién* puede aprobarlo — son mecanismos complementarios, no sustitutos.
3. **Prueba de reversibilidad:** coste de salida muy bajo — es un único archivo de texto; cambiar los dueños o las rutas protegidas es un PR trivial (aunque, irónicamente, ese propio PR quedaría sujeto a la regla que está cambiando).
4. **Dependencias opacas:** ninguna; `CODEOWNERS` es una convención nativa de GitHub, documentada y sin comportamiento oculto.
5. **Nivel de provocación aplicado:** P1. Cambio: se dejó explícito en el propio ADR que `CODEOWNERS` sin branch protection no protege nada por sí solo, en vez de dar a entender que el candado ya está cerrado con solo este paso.
