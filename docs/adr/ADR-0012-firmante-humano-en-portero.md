# ADR-0012: PRs firmados por Billy — el portero verifica la forma, no el alcance

**Estado:** Aceptado. Complementa al ADR-0009.
**Fecha:** 2026-09-21
**Fecha de revisión futura:** cuando haya un segundo humano con autoridad de revisión (misma cita que el ADR-0008), o si un PR con `firmante:billy` resulta haber sido etiquetado por alguien que no era Billy.

## Contexto

El portero (ADR-0009) exige que todo PR lleve un agente firmante y verifica el diff contra el alcance de su ADN. El primer PR de la fábrica —el propio montaje— no puede cumplirlo: toca `constitucion/`, `agents/` y `.github/`, rutas que ningún agente puede tocar, y lo firma Billy, que es humano y está fuera de la escala N0–N4. El portero lo rechazó, correctamente según sus reglas, pero eso deja sin vía a cualquier PR de Billy: cambios constitucionales, ADNs nuevos, el propio portero.

## Opciones evaluadas

1. **Etiqueta `firmante:billy`**: el portero no verifica alcance (Billy juzga el fondo, como en N3), sí verifica forma (bloque 9 en ADRs, agentes temporales expirados) y registra el evento con `agente=billy` — **opción elegida**.
2. **Nunca**: el portero rechaza todo PR sin agente; Billy mergea con bypass de administrador.
3. **ADN `billy` como agente N3** con `puede_tocar: todo`, reutilizando el mecanismo existente sin código nuevo.

## Criterios

- Coherencia con la constitución: el humano en el bucle (regla 2) juzga el fondo; el orquestador verifica la forma (reparto de papeles, ADR-0004).
- Que la actividad de Billy quede en la memoria de eventos como la de cualquier agente (regla 10).
- Que el check del portero sea verde en un PR legítimo de Billy; un check rojo "por diseño" en cada acto constitucional acaba normalizando el rojo.

## Decisión

Se adopta la opción 1. La etiqueta `firmante:<nombre>` identifica un firmante humano; en V0.1 el único reconocido es `billy` (constante en `portero.js`; cualquier otro nombre se rechaza). Con ella, el portero omite la verificación de alcance y mantiene las de forma. El evento se registra con `agente=billy`. El reparto de papeles queda íntegro: quien propone confronta (bloque 9 sigue siendo obligatorio en los ADRs de Billy), el orquestador verifica la forma, Billy juzga el fondo.

## Opciones descartadas y por qué

- **Opción 2** se descarta: el bypass de administrador deja los cambios constitucionales sin evento y sin verificación de forma. Precisamente los cambios más sensibles serían los menos trazados.
- **Opción 3** se descarta: mezcla al humano en el bucle con la escala de agentes que la constitución separa a propósito. Un "agente billy" con `puede_tocar: todo` tendría que promocionar, retirarse y declarar reversión como los demás, y ninguna de esas cosas tiene sentido para el humano que aprueba a los demás.

## Consecuencias

- Un PR de Billy se etiqueta `firmante:billy` y el portero lo aprueba si los ADRs llevan bloque 9 y no hay agentes expirados. Sin la etiqueta, se rechaza como cualquier PR sin firmante.
- La etiqueta la puede poner cualquiera con permiso de triaje en el repo; el portero no verifica que quien etiqueta sea Billy. Es la misma identidad por convención del ADR-0006 y del ADR-0009 (etiqueta `agente:<id>`), y se resuelve igual: en V0.2, con identidades propias. Mientras tanto, el único mitigante es que en V0.1 solo Billy tiene permisos en el repo.
- El ADN del orquestador recoge la nueva regla en su bloque 2.

## Confrontación crítica

1. **Abogado del diablo:**
   - Es una puerta trasera con nombre: cualquier PR con la etiqueta esquiva el chequeo de alcance. Si algún día un agente consigue etiquetar, el portero no lo verá.
   - "Solo Billy tiene permisos" es cierto hoy y dejará de serlo sin que este ADR se entere.
   - Verificar forma pero no alcance en los PRs más sensibles (constitución, ADNs, portero) invierte la intuición: cuanto más crítico el cambio, menos lo mira la máquina.
2. **Prueba de simplicidad:** la versión más simple que resuelve el 80% es la opción 2 (bypass de admin y check rojo). No se elige porque el 20% que pierde —evento registrado y bloque 9 verificado en los actos constitucionales— es justo lo que la regla 10 pide para las decisiones importantes.
3. **Prueba de reversibilidad:** coste de salida trivial: borrar la etiqueta del PR restaura el comportamiento anterior; quitar la constante del script, también.
4. **Dependencias opacas:** ninguna.
5. **Nivel de provocación aplicado:** P2. Cambio: se limitó `firmante:` a un único nombre reconocido en código (cualquier otro se rechaza), en lugar de aceptar cualquier `firmante:<x>` como humano; y se dejó por escrito la condición de revisión "si un PR con la etiqueta resulta no ser de Billy".
