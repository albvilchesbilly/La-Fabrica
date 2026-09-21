# ADR-0004: confrontación crítica dentro del CTO IA (no como agente separado en V0.1)

**Estado:** Aceptado
**Fecha:** 2026-09-21
**Fecha de revisión futura:** cuando el bloque 9 del CTO IA muestre síntomas de ritual vacío (bloque relleno sin objeciones reales), o tras 10 ADRs, junto con su primer criterio de promoción.

## Contexto

El CTO IA es el primer agente con criterio propio de la fábrica: propone arquitecturas y decide, dentro de su alcance, qué construir. Toda decisión de construir necesita un contrapeso que evite que un agente apruebe sus propias ideas sin fricción (regla 2 en espíritu, aunque el CTO IA opera en N1, no N3). Hay que decidir dónde vive ese contrapeso: dentro del propio agente que propone, o en un agente independiente dedicado a confrontar.

## Opciones evaluadas

1. **Agente provocador independiente desde V0.1**, cuya única misión sea confrontar las propuestas de otros agentes antes de que pasen a "construir".
2. **Confrontación crítica como bloque 9 dentro del ADN de quien propone** (autoconfrontación obligatoria y verificada en forma por el orquestador) — **opción elegida**.
3. **Confrontación delegada íntegramente a Billy**, sin bloque estructurado: Billy decide caso a caso si una propuesta está suficientemente cuestionada.

## Criterios

- Coste de coordinación: cuántos agentes y handoffs añade el contrapeso.
- Verificabilidad mecánica: si el orquestador (N2, sin criterio) puede comprobar que el contrapeso existió.
- Riesgo de ritual vacío: probabilidad de que el mecanismo se convierta en trámite sin sustancia.

## Decisión

Se adopta la opción 2 para V0.1. El bloque 9 vive dentro del ADN del CTO IA (y de la plantilla general): quien propone construir debe atacar su propia propuesta con abogado del diablo (mínimo 3 objeciones), prueba de simplicidad, prueba de reversibilidad, veto a dependencias opacas y nivel de provocación aplicado. El orquestador verifica que el bloque existe y está completo (verificación de forma, no de fondo); Billy juzga el fondo en las propuestas N3. Se deja escrito en `agents/plantilla-adn.md` el reparto de papeles, y una cláusula explícita: si la autoconfrontación degenera en ritual vacío, se extraerá un agente provocador independiente.

## Opciones descartadas y por qué

- **Opción 1** se descarta para V0.1, no de forma permanente: con un solo agente proponente (el CTO IA) y ningún historial de decisiones todavía, crear un segundo agente dedicado exclusivamente a objetar sería anticipar una necesidad no demostrada — coste de coordinación sin evidencia de que el autoataque falle. Queda como plan B explícito y condicionado a una señal observable (ritual vacío).
- **Opción 3** se descarta: sin bloque estructurado, Billy no tiene nada verificable que auditar y la carga recae enteramente en su juicio caso a caso, lo que no escala y viola la regla 9 (seguridad verificable antes de ejecutar) al no dejar rastro homogéneo.

## Consecuencias

- El CTO IA es responsable de su propia crítica; esto es una tensión conocida y aceptada: quien propone tiene incentivo a ser indulgente consigo mismo.
- El orquestador gana una responsabilidad concreta y mecánica: rechazar cualquier ADR de decisión de construir sin bloque 9 completo (ya declarado en su propio ADN, Paso 3).
- Se deja un criterio de fallback explícito y medible: si el bloque 9 degenera en ritual, la fábrica misma lo detectará (por la falta de objeciones sustantivas registradas en los ADRs) y se creará el agente provocador.

## Confrontación crítica

1. **Abogado del diablo:**
   - Autoconfrontación es estructuralmente débil: nadie objeta bien a su propia idea con la misma dureza que un tercero.
   - El criterio de "ritual vacío" no tiene un umbral numérico definido todavía — es subjetivo y podría no dispararse nunca aunque el bloque 9 se vuelva trámite.
   - Empezar sin agente provocador ahorra coordinación hoy, pero puede costar más caro si los primeros ADRs (que sientan precedente) no fueron confrontados con rigor real.
2. **Prueba de simplicidad:** la versión más simple que resuelve el 80% es exactamente la opción elegida (autoconfrontación + verificación de forma). Se justifica no ir directamente a la opción más robusta (agente provocador) porque el 20% restante — el riesgo de indulgencia consigo mismo — se mitiga con la verificación de forma del orquestador y el juicio de fondo de Billy en N3.
3. **Prueba de reversibilidad:** coste de salida bajo. Migrar de autoconfrontación a un agente provocador independiente es aditivo: se crea un nuevo ADN, se cambia el reparto de papeles en la plantilla, y los ADRs existentes no necesitan reescribirse (se marcarían "superseded" solo si su bloque 9 resultara insuficiente en retrospectiva).
4. **Dependencias opacas:** ninguna.
5. **Nivel de provocación aplicado:** P2. Cambio: se fijó por escrito el criterio de disparo del plan B ("si la autoconfrontación degenera en ritual vacío, se extraerá un agente provocador independiente") en vez de dejarlo como intención implícita.
