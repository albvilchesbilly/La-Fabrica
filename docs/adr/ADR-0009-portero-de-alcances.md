# ADR-0009: portero de alcances como implementación de "seguridad verificable antes de ejecutar"

**Estado:** Aceptado
**Fecha:** 2026-09-21
**Fecha de revisión futura:** tras el primer producto terminado, o al primer rechazo disputado que el portero pierda — lo que ocurra antes.

## Contexto

La regla 9 exige que ninguna acción se ejecute sin una comprobación automática previa de que cumple las reglas. Hasta este paso, la fábrica tenía reglas (constitución), alcances declarados (ADNs) y candados de revisión (CODEOWNERS), pero nada que verificara mecánicamente que un PR respeta el alcance del agente que lo firma. El orquestador (ADR-0003) se definió como código determinista precisamente para que esta pieza existiera sin depender de un modelo de IA.

## Opciones evaluadas

1. **Verificación manual por Billy en cada PR**, leyendo el diff contra el ADN del agente.
2. **Workflow de GitHub Actions determinista** (`portero.yml` + `portero.js`, sin dependencias externas) que identifica al agente firmante, valida el diff contra `puede_tocar`/`no_puede_tocar`, comprueba el bloque 9 en ADRs nuevos, detecta agentes temporales expirados y registra el evento — **opción elegida**.
3. **Un agente de IA revisor** que lea el PR y juzgue si respeta el alcance.

## Criterios

- Determinismo y auditabilidad (regla 9): el mismo diff debe dar siempre el mismo veredicto, y el motivo debe citar la regla incumplida.
- Sin dependencias opacas (regla 3): nada que no se pueda leer en el propio repo.
- Coste de mantenimiento proporcional a un repo sin productos todavía.

## Decisión

Se adopta la opción 2. `.github/workflows/portero.yml` se ejecuta en cada PR y llama a `.github/scripts/portero.js` (Node.js sin paquetes externos), que:

1. Identifica al agente por etiqueta `agente:<id>` o rama `agente/<id>/...`. Sin agente identificable, rechaza.
2. Lee `agents/<id>.md` y valida cada archivo del diff: rutas protegidas globalmente (`constitucion/`, `.github/`, `CODEOWNERS`) y ADNs en `agents/` (salvo `agents/propuestas/`) se rechazan siempre; después aplica `no_puede_tocar` y `puede_tocar` del ADN. Solo se verifican mecánicamente las entradas que son rutas; las que son prosa ("credenciales, facturación") quedan para revisión humana.
3. Si el PR añade o modifica un ADR en `docs/adr/`, exige que exista la sección "Confrontación crítica" con contenido (verificación de forma, no de fondo).
4. Rechaza si el agente firmante es temporal y ha expirado; avisa si cualquier otro agente temporal del repo ha expirado.
5. Registra el evento (`ci-pasado` o `propuesta-rechazada` con motivo) en `memoria/eventos/<fecha>.md` y lo empuja a la rama del PR firmando como orquestador. Los cambios en `memoria/eventos/` están exentos de la verificación de alcance, pero deben ser estrictamente append-only (ninguna línea borrada).

Un rechazo deja un comentario en el PR con la salida completa del portero y la regla incumplida.

## Opciones descartadas y por qué

- **Opción 1** se descarta: la verificación manual no es "automática previa" (regla 9) y convierte a Billy en cuello de botella desde el primer PR. Además, no deja evento verificable salvo que Billy lo escriba a mano.
- **Opción 3** se descarta: un revisor de IA es no determinista y opaco en su razonamiento; el orquestador se definió como código sin criterio justamente para que la verificación de cumplimiento no dependa de un modelo (ADR-0003). Puede ser útil en el futuro como *complemento* para el fondo, nunca como sustituto de la forma.

## Consecuencias

- Todo PR necesita un agente firmante; los commits directos a `main` no pasan por el portero — de ahí que la branch protection (ADR-0008) sea una acción manual pendiente e imprescindible.
- El registro de eventos desde CI solo funciona en PRs del propio repositorio; los PRs desde forks no tienen token con permiso de escritura. Limitación declarada de la V0.1.
- La verificación de alcance es por prefijo de ruta, no por glob: es suficiente mientras los ADNs declaren directorios. Cuando haga falta más granularidad, será un cambio al script (protegido por CODEOWNERS y revisado por Billy).
- El propio portero vive en `.github/`, ruta que él mismo protege: nadie puede modificarlo desde un PR de agente. Cambiarlo es un acto constitucional, como declara el ADN del orquestador.

## Confrontación crítica

1. **Abogado del diablo:**
   - El portero solo entiende entradas de alcance que son rutas; las que son prosa ("infraestructura viva", "credenciales") no se verifican y dan una falsa sensación de cobertura.
   - Identificar al agente por una etiqueta o un nombre de rama es fácil de falsear: cualquiera con permisos de escritura puede etiquetar un PR como `agente:cto-ia`. Con credenciales compartidas (ADR-0006), la atribución es una convención, no una prueba.
   - Empujar el evento a la rama del PR desde CI hace que cada PR lleve commits del orquestador, lo que puede confundir en el historial y dispara otra ejecución del workflow (mitigado: el segundo run ve solo el archivo de eventos, exento y append-only, y no crea evento nuevo si el diff no cambia).
2. **Prueba de simplicidad:** la versión más simple que resuelve el 80% sería solo el chequeo de rutas protegidas globales sin leer los ADNs. Se descarta porque el 20% restante —que cada agente respete *su* alcance— es exactamente la regla 8 (mínimo privilegio) aplicada en la práctica.
3. **Prueba de reversibilidad:** coste de salida bajo. Son dos archivos sin dependencias; retirarlos deja el repo como estaba antes del Paso 9. Los eventos registrados no se pierden.
4. **Dependencias opacas:** ninguna. Node.js estándar del runner, `actions/checkout` y `actions/github-script` (acciones oficiales de GitHub, con versión fijada). Sin paquetes npm, sin llamadas a IA.
5. **Nivel de provocación aplicado:** P2. Cambio: la exención de `memoria/eventos/` en la verificación de alcance se condicionó a que el cambio sea append-only, en vez de exentar la carpeta sin más — un agente no puede usar esa exención para borrar o editar eventos.
