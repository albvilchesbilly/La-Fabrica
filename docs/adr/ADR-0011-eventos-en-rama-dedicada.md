# ADR-0011: los eventos del orquestador viven en la rama `memoria-eventos`

**Estado:** Aceptado. Supersede parcialmente al ADR-0007 (ubicación del registro de eventos) y al ADR-0009 (paso 5, registro del evento).
**Fecha:** 2026-09-21
**Fecha de revisión futura:** cuando exista credencial propia del orquestador (V0.2, ADR-0006) o cuando el volumen de eventos exija otro backend — lo que ocurra antes.

## Contexto

El primer PR real de la fábrica (#1, el propio montaje) demostró que registrar el evento empujando un commit del orquestador a la rama del PR no funciona:

- Cada verificación añade un commit `orquestador: evento…` al PR. Los pushes hechos con el token de CI no disparan nuevos runs del workflow, así que ese commit —el head del PR— queda sin check. Con branch protection y el check `portero` requerido, **ningún PR podría mergearse**.
- Cada evento de etiquetado (incluida la etiqueta que añade la herramienta de vigilancia del PR) generaba otro commit del orquestador. En diez minutos, dos commits ajenos en la rama del autor.
- Si esos pushes llegaran a disparar el workflow (credencial propia del orquestador en V0.2), un rechazo que empuja al PR sería un bucle: rechazo → commit → run → rechazo.

Hay que mover el registro fuera de la rama del PR sin sacarlo de Git (ADR-0007) y sin que el orquestador escriba en `main`, que estará protegida.

## Opciones evaluadas

1. **Rama dedicada `memoria-eventos`**, append-only, escrita solo por el orquestador con el token de CI; `main` conserva `memoria/eventos/README.md` apuntando a ella — **opción elegida**.
2. **Solo resumen del job y artefacto**: no se commitea nada; el evento vive en la salida del run.
3. **Mantener el push al PR** y no requerir el check `portero` en branch protection.

## Criterios

- Que el head de cada PR tenga siempre un check válido del portero.
- Que el registro siga en Git y sea append-only (ADR-0007, regla 10).
- Que funcione con branch protection en `main` sin bypass ni credenciales nuevas (ADR-0006).

## Decisión

Se adopta la opción 1. En cada run, el workflow monta la rama `memoria-eventos` en un worktree; si no existe, nace huérfana con el contenido actual de `memoria/eventos/` (README y eventos previos, si los hubiera). El portero escribe el evento allí y el orquestador hace push a `HEAD:memoria-eventos`. Nunca escribe en la rama del PR ni en `main`. Los runs se serializan (`concurrency`) para que dos PRs no empujen a la vez. `main` mantiene `memoria/eventos/README.md` con el formato y la forma de consultar la rama.

## Opciones descartadas y por qué

- **Opción 2** se descarta: saca la memoria de eventos de Git. Los artefactos de Actions caducan y el resumen del job no es consultable como historial. Contradice el ADR-0007 en lo esencial.
- **Opción 3** se descarta: convierte al portero en informativo. Un check que no bloquea no es "seguridad verificable antes de ejecutar" (regla 9).

## Consecuencias

- `memoria/eventos/` en `main` contiene solo el README. El registro real se lee con `git log origin/memoria-eventos` o `git show origin/memoria-eventos:memoria/eventos/<fecha>.md`.
- La rama `memoria-eventos` no debe estar bajo branch protection ni exigir revisión: es el orquestador quien la escribe, y su ADN ya prohíbe borrar o editar eventos (solo rectificación). `CODEOWNERS` sigue cubriendo `memoria/eventos/` en `main`, que solo contiene el README.
- La atribución del orquestador sigue siendo por convención (`user.name orquestador` con el token de CI). Es la misma deuda del ADR-0006; no la agrava.
- Los dos eventos registrados por los runs previos al cambio se migran a la rama en su primer run (copia de `memoria/eventos/` al crearla). Después se retira el archivo de datos de la rama del PR: los eventos no se borran, se mudan.

## Confrontación crítica

1. **Abogado del diablo:**
   - Una rama huérfana que nadie mergea es fácil de olvidar: no aparece en `main`, no la protege branch protection, y un `git push --delete` la borra sin más. Mitigación parcial: el README de `main` la nombra, y CODEOWNERS no aplica a ramas.
   - `concurrency` serializa **todos** los runs del portero, no solo los que escriben: con muchos PRs simultáneos añade latencia.
   - El worktree y el bootstrap huérfano son más lógica de shell en el workflow; cada línea de shell en CI es una línea que solo se prueba en CI.
2. **Prueba de simplicidad:** la versión más simple que resuelve el 80% es la opción 2 (artefacto y resumen del job). No se elige porque el 20% que pierde es exactamente la memoria de la fábrica: sin historial consultable en Git no hay promociones basadas en evidencia (ADR-0007).
3. **Prueba de reversibilidad:** coste de salida bajo. La rama contiene archivos de texto con formato fijo; migrarlos a `main` (si algún día se permite) o a otro backend es un `git log` y una importación. El workflow vuelve a la versión previa con un revert.
4. **Dependencias opacas:** ninguna. Git, `actions/checkout` y shell.
5. **Nivel de provocación aplicado:** P2. Cambio: el bootstrap huérfano copia el contenido previo de `memoria/eventos/` en vez de nacer vacío, para que los dos eventos ya registrados no se pierdan al cambiar de rama; y se añadió `concurrency` tras preguntarse qué pasa con dos runs empujando a la vez.
