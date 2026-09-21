# ADR-0007: memoria en Git, eventos solo del orquestador, aprendizajes por PR

**Estado:** Aceptado
**Fecha:** 2026-09-21
**Fecha de revisión futura:** cuando el volumen de eventos haga inviable el formato de texto plano (a definir por señal observable: tiempo de lectura/agregación, no fecha fija).

## Contexto

La regla 10 (trazabilidad total) y la regla 7 (aprendizaje documentado) exigen que la fábrica deje rastro de lo que pasa y de lo que aprende. Hace falta decidir dónde vive esa memoria y quién puede escribirla, antes de que exista el primer producto que la necesite.

## Opciones evaluadas

1. **Base de datos externa** (o servicio de logging gestionado) para eventos y aprendizajes, fuera del repositorio.
2. **Memoria en el propio Git del repo**: `memoria/eventos/` append-only escrito únicamente por el orquestador, y `memoria/aprendizajes/` escrito por los agentes solo vía PR revisado; los ADRs viven en `docs/adr/` y la memoria los referencia sin duplicarlos — **opción elegida**.
3. **Memoria libre**: cualquier agente escribe donde considere oportuno, sin carpeta ni formato fijo.

## Criterios

- Coherencia con el policy tecnológico (regla 3, nada de dependencias opacas; un servicio externo nuevo exigiría su propio ADR de admisión).
- Auditabilidad: quién escribió qué y cuándo, usando las herramientas que la fábrica ya usa para todo lo demás (Git, PRs, CI).
- Simplicidad para V0.1: no introducir infraestructura nueva antes del primer producto.

## Decisión

Se adopta la opción 2. `memoria/eventos/` es append-only y su único escritor es el orquestador (ya declarado en su ADN, Paso 3): una línea por evento, formato fijo `fecha | agente | tipo | referencia verificable`. Los tipos válidos en V0.1 son: `propuesta-abierta`, `propuesta-rechazada` (con regla citada), `propuesta-mergeada`, `ci-pasado`, `ci-fallado`, `incidencia`, `rectificación`. Un evento sin referencia verificable en GitHub no es un evento. `memoria/aprendizajes/` la escriben los agentes tras cada producto, solo vía PR revisado. Los ADRs no se duplican: viven en `docs/adr/` y la memoria los referencia.

## Opciones descartadas y por qué

- **Opción 1** se descarta para V0.1: un servicio externo de logging o una base de datos añaden una dependencia nueva (con su propio coste de admisión según el policy tecnológico) para un volumen de eventos que todavía no existe. Contradice el principio de no construir para necesidades hipotéticas.
- **Opción 3** se descarta: memoria sin dueño ni formato fijo es indistinguible de no tener memoria — nadie podría confiar en que un evento reportado sea un hecho y no una opinión, violando la regla 10 directamente.

## Consecuencias

- Toda la memoria de la fábrica es auditable con las herramientas de Git: `git log`, `git blame`, historial de PRs. No hay sistema nuevo que aprender ni mantener.
- El orquestador se convierte en el único cuello de escritura de eventos: si no está bien implementado o se cae, la fábrica pierde trazabilidad de proceso (riesgo ya reconocido en el ADR-0003).
- El formato de línea fija (`fecha | agente | tipo | referencia`) es simple pero rígido; agregarlo o consultarlo a escala (muchos productos, muchos agentes) puede requerir tooling adicional más adelante — se deja como señal de revisión futura, no como problema resuelto.

## Confrontación crítica

1. **Abogado del diablo:**
   - Texto plano append-only es difícil de consultar o agregar a medida que crece (no hay índice, no hay query) — funciona para pocos eventos, no para cientos.
   - "El orquestador es el único escritor" reintroduce el mismo punto único de fallo señalado en el ADR-0003, ahora aplicado específicamente a la memoria de eventos.
   - Sin validación automática del formato de línea, un evento mal formado podría colarse y romper silenciosamente cualquier tooling futuro que lo lea.
2. **Prueba de simplicidad:** la versión más simple que resuelve el 80% es exactamente la elegida: archivos de texto en Git, sin infraestructura nueva. Se descarta ir directamente a un sistema más robusto (opción 1) porque no hay evidencia todavía de que el volumen lo requiera; construirlo antes sería sobre-ingeniería.
3. **Prueba de reversibilidad:** coste de salida bajo — migrar de archivos de texto a una base de datos más adelante es un ejercicio de importación mecánica (parsear líneas con formato fijo), no una reescritura conceptual. El principio de "los eventos no se borran, se corrigen con rectificación" se mantendría igual en cualquier backend.
4. **Dependencias opacas:** ninguna; es Git y Markdown, ya presentes en toda la fábrica.
5. **Nivel de provocación aplicado:** P1. Cambio: se hizo explícito el criterio "si un evento no señala a algo comprobable en GitHub, no es un evento: es una opinión, y no entra", cerrando la puerta a que el orquestador registre valoraciones subjetivas bajo la apariencia de hechos.
