# ADR-0001: adopción de la constitución y los niveles de autonomía

**Estado:** Aceptado
**Fecha:** 2026-09-21
**Fecha de revisión futura:** no aplica — regla 11, la constitución es invariante. Los niveles de autonomía se revisan solo vía cambio de configuración versionado y aprobado por Billy.

## Contexto

La Fábrica necesita, antes de escribir una sola línea de producto, un piso normativo que no dependa de la interpretación de ningún agente: reglas que no cambien con la tecnología, y una escala explícita de cuánto puede hacer un agente sin supervisión humana. Sin esto, cualquier decisión posterior (ADN de agentes, policy tecnológico, CI) carecería de un límite objetivo contra el que medirse.

## Opciones evaluadas

1. **Reglas implícitas, aprendidas sobre la marcha.** Dejar que las normas de seguridad y autonomía emerjan de la práctica y se documenten a posteriori.
2. **Constitución explícita y escrita primero, con escala de autonomía N0–N4 versionada desde el día uno** (opción elegida).
3. **Delegar el límite de autonomía a la herramienta** (p. ej. los permisos por defecto de la plataforma de CI/CD o del proveedor cloud), sin una capa propia.

## Criterios

- Trazabilidad (regla 10): la decisión debe quedar registrada y ser auditable.
- Invariancia frente al cambio tecnológico.
- Capacidad de bloquear autonomía real (N3/N4) sin depender de la buena voluntad de un agente.

## Decisión

Se adopta la opción 2: `constitucion/reglas.md` con las 11 reglas de oro, y `constitucion/niveles-autonomia.md` con la escala N0–N4. El N4 queda apagado en V0.1 y solo se desbloquea con condiciones explícitas (20 operaciones N3 sin incidentes, evidencia en memoria, sobre por escrito, aprobación versionada de Billy).

## Opciones descartadas y por qué

- **Opción 1** se descarta: aprender las reglas sobre la marcha invierte el principio rector (construir, medir, aprender) y expone a la fábrica a operar sin freno antes de tener un freno. Viola la regla 9 (seguridad verificable antes de ejecutar).
- **Opción 3** se descarta: los límites de la herramienta son necesarios pero no suficientes — no expresan intención de negocio (cuándo un humano debe estar en el bucle) ni sobreviven a un cambio de proveedor, lo que viola la regla 11.

## Consecuencias

- Toda decisión posterior de la fábrica (ADNs, policy, CI) queda subordinada a estas reglas; si algo las contradice, ganan las reglas.
- Ningún agente puede autopromocionarse de nivel: promover es siempre un cambio de configuración versionado y aprobado por Billy.
- El coste es fricción deliberada: cada acción con impacto real exige un humano en el bucle antes de ejecutar, no después.

## Confrontación crítica

1. **Abogado del diablo (mínimo 3 objeciones):**
   - Una escala de 5 niveles puede ser burocracia prematura para un repo que todavía no tiene productos.
   - Fijar las reglas por escrito desde el día uno puede anclar decisiones que en la práctica conviene cambiar pronto.
   - El N4 "apagado en V0.1" puede ser una promesa sin coste real si nunca se documenta cómo se prueba el kill-switch.
2. **Prueba de simplicidad:** la versión más simple que resuelve el 80% sería solo las 11 reglas, sin escala de niveles. Se descarta porque las reglas solas no dicen *cuándo* un agente necesita aprobación humana — sin la escala, la regla 2 ("humano en el bucle para nivel 3") no tiene forma de aplicarse.
3. **Prueba de reversibilidad:** coste de salida a 3 meses — bajo. Es un documento Markdown versionado en Git; cambiarlo es un PR. Las 11 reglas en sí son la única pieza declarada invariante (regla 11), por diseño.
4. **Dependencias opacas:** ninguna. Son documentos de texto plano en el propio repo.
5. **Nivel de provocación aplicado:** P1 (revisión estándar). Cambio: se hizo explícita la condición de desbloqueo del N4 con umbrales numéricos (20 operaciones) en lugar de dejarla en "cuando haya confianza suficiente".
