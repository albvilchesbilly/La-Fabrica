# ADR-0003: orquestador como repartidor mecánico sin criterio, techo N2 permanente, único escritor de eventos

**Estado:** Aceptado
**Fecha:** 2026-09-21
**Fecha de revisión futura:** cuando las disputas ganadas contra sus rechazos superen el umbral declarado en su bloque 8 (a definir con datos reales de operación).

## Contexto

La fábrica necesita un primer agente porque la constitución y la plantilla, por sí solas, no se hacen cumplir. Alguien tiene que enrutar trabajo, verificar que cada PR respeta el alcance de su ADN y rechazar lo que no cumple, dejando rastro. La revisión pre-kit decidió que este debía ser el primer ADN escrito, antes que cualquier agente con criterio propio (como el CTO IA), porque sin un mecanismo de cumplimiento nada de lo demás es verificable.

## Opciones evaluadas

1. **Orquestador implementado como modelo de IA con criterio propio**, que interpreta reglas y decide caso a caso.
2. **Orquestador como código determinista** (GitHub Actions + reglas versionadas), sin capacidad de juicio, techo N2 permanente, único escritor de `memoria/eventos/` — **opción elegida**.
3. **Sin orquestador dedicado**: cada agente autorreporta su propio cumplimiento y Billy audita manualmente.

## Criterios

- Verificabilidad mecánica (regla 9): el cumplimiento no puede depender de la interpretación de un modelo.
- Trazabilidad (regla 10): un único escritor de eventos evita relatos contradictorios.
- Mínimo privilegio (regla 8): quien hace cumplir el proceso no debería tener poder para decidir el fondo.

## Decisión

Se adopta la opción 2. El orquestador es código determinista, no un modelo de IA. Su nivel es N2 fijo (nunca sube), solo puede actuar sobre el proceso (etiquetas, estados, comentarios de rechazo, registro de eventos), nunca sobre el contenido de un PR, y es el único escritor autorizado de `memoria/eventos/`, en modo append-only. Ante cualquier caso no cubierto por sus reglas, escala a Billy en vez de decidir.

## Opciones descartadas y por qué

- **Opción 1** se descarta: un orquestador con criterio propio dejaría de ser un mecanismo verificable y pasaría a ser un agente más cuyas decisiones habría que auditar — exactamente el problema que se supone que resuelve. Además introduciría una llamada a IA en el camino crítico de cumplimiento, lo que la regla 9 (seguridad verificable) desaconseja para esta pieza en concreto.
- **Opción 3** se descarta: la autoevaluación sin verificación independiente es la antítesis de la regla 9 y convertiría a Billy en cuello de botella manual desde el primer producto.

## Consecuencias

- El orquestador es deliberadamente "tonto": no interpreta, solo verifica forma y enruta. Esto lo hace auditable con una lectura de su propio ADN.
- Al ser el único escritor de `memoria/eventos/`, toda la trazabilidad de la fábrica depende de que el orquestador funcione — su código vive en rutas protegidas con revisión obligatoria de Billy (ver Paso 8, CODEOWNERS).
- Su techo N2 es permanente por diseño: no hay ruta de promoción. Si en el futuro se necesita un orquestador con más autonomía, será un agente distinto, no una promoción de este.

## Confrontación crítica

1. **Abogado del diablo:**
   - Un orquestador sin criterio no puede distinguir un rechazo justo de uno técnicamente correcto pero absurdo en contexto — puede generar fricción innecesaria en casos límite.
   - Ser el único escritor de eventos crea un punto único de fallo: si el orquestador se cae o tiene un bug, toda la memoria de eventos se detiene.
   - "Código determinista" todavía no existe en el Paso 3 (el workflow real llega en el Paso 9); este ADR aprueba un ADN antes que su implementación.
2. **Prueba de simplicidad:** la versión más simple sería no tener orquestador y confiar en revisión manual de Billy (opción 3). Se descarta porque no escala más allá de un producto y viola la regla 9 desde el primer PR.
3. **Prueba de reversibilidad:** coste de salida bajo — es un ADN en Markdown y, cuando se implemente (Paso 9), un workflow de GitHub Actions reemplazable. El riesgo real es el punto único de fallo en `memoria/eventos/`, mitigado porque los eventos nunca se borran y un error se corrige con un evento de rectificación, no editando el histórico.
4. **Dependencias opacas:** ninguna — se declara explícitamente que la V0.1 usa código determinista, no un modelo de IA, precisamente para evitar una caja negra en la pieza que hace cumplir las reglas.
5. **Nivel de provocación aplicado:** P2. Cambio: se añadió explícitamente que el orquestador nunca puede automodificarse ("prohibida la automodificación"), cerrando el caso en que el propio mecanismo de cumplimiento se exceptuara a sí mismo.
