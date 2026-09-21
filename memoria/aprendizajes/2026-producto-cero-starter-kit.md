# Producto cero — Starter Kit V0.1

**Fecha:** 2026-09-21
**Producto:** este repositorio, montado siguiendo `guion-montaje-starter-kit-v01.md` en 12 pasos y 12 commits.
**Escrito por:** Claude Code, actuando como constructor del kit (sin ADN propio: techo N1, todo en rama, integración pendiente de Billy).
**ADRs relacionados:** ADR-0001 a ADR-0010 en `docs/adr/`.

## Qué funcionó

- **Un paso, un commit, un ADR.** El historial de Git cuenta la historia de la fábrica sin necesidad de un documento aparte. Cualquiera puede leer `git log` y ver qué se decidió, en qué orden y por qué.
- **Escribir el orquestador antes que el CTO IA.** Tener primero el mecanismo de cumplimiento (aunque fuera solo un ADN) obligó a que cada ADN posterior fuera verificable por él. El portero (Paso 9) salió casi directo de leer `agents/orquestador.md`.
- **Probar el portero contra el propio montaje.** Al ejecutarlo en local contra esta misma rama con `agente:cto-ia`, rechazó 11 archivos: el kit no habría podido construirse a sí mismo desde un agente N1. Eso es correcto, no un fallo: el montaje inicial es un acto de Billy (vía Claude Code), no de un agente de la fábrica.
- **El bloque 9 en cada ADR cambió decisiones.** No fue ritual: en el ADR-0009 forzó a condicionar la exención de `memoria/eventos/` a que el cambio sea append-only; en el ADR-0010 añadió la validación obligatoria de agente y propósito. Sin el peaje, ambos huecos habrían quedado abiertos.

## Qué fricción apareció

- **El guion mezcla YAML y prosa dentro de un mismo bloque de código** en los ADNs. Se respetó tal cual, pero el portero tiene que parsearlo con expresiones regulares en vez de con un parser YAML. Funciona; no es elegante. Si la plantilla evoluciona a YAML puro (opción 3 descartada en el ADR-0002), el parser se simplifica.
- **"Un archivo, no un proyecto" chocó con "dependencias con versión fijable".** El módulo-puerta necesita un `package.json` solo para fijar la versión del SDK. Se aceptó la tensión y quedó documentada en el ADR-0010.
- **El registro de eventos desde CI empuja commits a la rama del PR.** Es la forma más simple de que el orquestador sea el único escritor de `memoria/eventos/`, pero cada PR acaba con commits firmados por "orquestador" y el workflow se dispara dos veces. Tolerable en V0.1; a vigilar cuando haya volumen.
- **Identidad por convención.** Etiqueta `agente:<id>` en el PR, comprobación de que existe `agents/<id>.md` en el módulo-puerta: en ambos casos la identidad es declarativa, no verificada por credencial. Es exactamente la deuda del ADR-0006; el montaje la hizo visible en dos sitios más.
- **CODEOWNERS sin branch protection no cierra nada.** El candado del Paso 8 queda a medias hasta que Billy active la protección de rama a mano. Está en el README, pero es el único paso del guion que el kit no puede completar por sí mismo.

## Qué se haría distinto

- **Fijar el formato de los ADNs como YAML puro desde el Paso 2.** El coste de hacerlo ahora es cero; el coste de migrar después, con más agentes, crece.
- **Añadir al portero un veto mecánico a importaciones de `@anthropic-ai/sdk` fuera de `src/puerta-ia/`.** El policy lo prohíbe, pero hoy solo lo detecta una revisión humana. Es un `grep` en CI; debería haber entrado en el Paso 9.
- **Escribir el guion con el ADR de cada paso ya esbozado** (contexto y opciones), no solo el título. Redactar diez ADRs con bloque 9 completo fue la mitad del esfuerzo del montaje; buena parte del contexto estaba en la cabeza de quien escribió el guion y hubo que reconstruirlo.
- **Decidir antes qué agente firma el montaje inicial.** El kit se construyó sin agente firmante porque ninguno tenía alcance para tocar la constitución. Es correcto, pero debería estar escrito en el guion: "el Paso 0 al 11 los ejecuta Billy con Claude Code como herramienta, fuera de la escala N0–N4".

## Lo que enseñó el primer PR (#1, el propio montaje)

El portero se estrenó contra este mismo PR y falló de tres maneras distintas en diez minutos. Ninguna la habrían encontrado las pruebas en local.

- **El check estaba verde con el portero rechazando.** `node portero.js | tee` sin `pipefail`: el paso devolvía 0 aunque el script saliera con 1. Un mecanismo de "seguridad verificable" que aprueba todo es peor que no tenerlo. Corregido con `shell: bash` (activa `pipefail`). Lección: probar el *workflow*, no solo el script.
- **Registrar el evento en la rama del PR rompe el merge.** Cada run empujaba un commit del orquestador al PR; el run que disparaba ese push aparecía como *failure* sin jobs. Con check requerido, ningún PR habría podido mergearse. Movido a la rama `memoria-eventos` (ADR-0011).
- **El montaje no tenía firmante posible.** Ningún agente puede tocar `constitucion/` ni `agents/`, así que el propio kit no podía pasar su portero. Añadida la etiqueta `firmante:billy` (ADR-0012): el portero verifica forma, Billy juzga fondo.

Balance: el primer PR no fue "el kit funcionando"; fue el kit descubriendo que tres de sus mecanismos no funcionaban. Eso es exactamente lo que el principio rector pide —construir, medir, aprender y mejorar— y la razón de que el historial de Git sea la evidencia y no el README.

## Antipatrones detectados

- **Bloque 9 rellenado por inercia.** Riesgo real a partir del tercer o cuarto ADR: las objeciones empiezan a parecerse. La cláusula del ADR-0004 (agente provocador si degenera en ritual) existe por esto; conviene medirlo desde el primer producto real.
- **Confundir "declarar la deuda" con "reducirla".** Tres ADRs (0006, 0008, 0010) declaran limitaciones que no resuelven. Está bien en V0.1, pero la fábrica debe tener un criterio para que las deudas declaradas no se acumulen indefinidamente sin pagaré con fecha.

## Pendiente que este producto deja a la cola de diseño fino

- Presupuesto de tokens por agente: el módulo-puerta ya registra los datos en `memoria/invocaciones-ia.jsonl`.
- Veto mecánico en CI a llamadas a IA fuera del módulo-puerta.
- Umbral numérico para "ritual vacío" en el bloque 9 y para "disputas ganadas contra el orquestador".
- ADNs del CEO IA operativo y COO IA.
