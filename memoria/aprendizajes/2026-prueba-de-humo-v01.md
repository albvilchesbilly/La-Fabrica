# Prueba de humo — Starter Kit V0.1

**Fecha:** 2026-09-22
**Qué se probó:** que los cuatro chequeos del portero, el registro de eventos y los candados funcionan en el entorno real, no solo en local.
**Escrito por:** Claude (sala de estrategia), verificado contra `memoria-eventos` y los PRs #5, #6 y #7.
**Evidencia:** runs `35718288943`, `35718378506`, `35718458308`; eventos del 2026-09-22 en la rama `memoria-eventos`.

## Resultado: positiva

| Criterio | Evidencia |
|---|---|
| Camino feliz con agente firmante | PR #5, check verde, evento `cto-ia \| ci-pasado` |
| Rechazo por alcance, con comentario automático | PR #6, evento `cto-ia \| propuesta-rechazada` citando `.github/` y la regla 5; comentario "Portero de CI — rechazado" en el PR |
| Rechazo por ADR sin bloque 9 | PR #7, evento citando `plantilla-adn.md bloque 9`; comentario en el PR |
| Protección de rama | Push directo a `main` rechazado |
| Trazabilidad | Un evento por run, ninguno borrado ni editado; `main` sin tocar (`416b008`); ramas de prueba borradas |

Es la primera vez que un PR firmado por un **agente** pasa el portero en verde: hasta hoy solo se había ejercitado el rechazo por firmante no identificado. El mecanismo de cumplimiento de la fábrica está demostrado, no supuesto.

Además, batería local de 12 casos sintéticos contra `portero.js` con las variables del workflow: 11 conformes. Cubrió lo que los PRs no tocaron — firmante humano falso, agente sin ADN, ADN sin alcance declarado (ADR-0013, que se había mergeado sin prueba) y agente temporal caducado. Los tests del módulo-puerta (`npm test`) pasan, incluidos sus dos vetos (agente sin ADN, invocación sin propósito).

## Lo que la prueba encontró

**El registro de eventos acepta escrituras de cualquier agente.** El portero comprueba que un cambio en `memoria/eventos/` sea append-only, pero no comprueba quién escribe. El ADR-0011 y el ADN del orquestador dicen que es el **único escritor**; el mecanismo no lo hace cumplir. Un agente con alcance en cualquier otra ruta puede añadir una línea de evidencia falsa y el check sale en verde. Lo tapan hoy `CODEOWNERS` y que los eventos vivan fuera de `main` — dos mitigaciones, ninguna mecánica. En una fábrica cuya única evidencia es este registro, es el hallazgo que importa. **Decisión pendiente: ADR-0014.**

**Ningún workflow ejecuta los tests del módulo-puerta.** Existen y pasan, pero el único workflow del repo es el portero: la regla 9 ("seguridad verificable antes de ejecutar") no cubre `src/`. Arreglo de cinco líneas.

**Sigue sin veto mecánico a `@anthropic-ai/sdk` fuera de `src/puerta-ia/`.** Ya estaba escrito en el aprendizaje del producto cero como cosa que debería haber entrado en el Paso 9. Un producto después, sigue sin entrar: primer síntoma del antipatrón que ese mismo aprendizaje señaló — declarar deuda no es reducirla.

**El portero verifica etiquetas, no identidades.** `firmante:billy` salta la verificación de alcance por diseño (ADR-0012) y la etiqueta la pone quien tenga permiso de escritura. Es la deuda del ADR-0006 apareciendo por tercera vez. No es un fallo de esta versión; es la razón de que no se pueda contar como protección.

## Lección de método

La prueba de humo se diseñó como una tabla de *esperado vs. obtenido* con un caso deliberadamente pensado para fallar. El hallazgo del registro de eventos salió de ese caso, no de los once que confirmaron lo que ya se creía. Una batería que solo prueba el camino feliz habría dado 100 % en verde y no habría comprado nada.
