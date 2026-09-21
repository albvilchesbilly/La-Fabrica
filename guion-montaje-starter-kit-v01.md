# Guion de montaje — Starter Kit V0.1 de La Fábrica

**Para:** Claude Code, en un repositorio vacío de GitHub.
**Producto cero:** este mismo kit. Se construye siguiendo las reglas que él mismo define.
**Regla del montaje:** cada paso entra en su propio commit (o PR), con su ADR correspondiente. Nada de un único commit que lo traiga todo. El historial de Git es la primera evidencia de la fábrica.

**Principio rector de la V0.1:** no demostrar que somos inteligentes, sino demostrar que podemos construir, medir, aprender y mejorar.

---

## Paso 0 — Nacimiento
Crear `README.md` con: nombre de la fábrica, visión (fábrica capaz de diseñar bienes y servicios, que aprende de cada producto y se construye a sí misma), el principio rector, y un índice de la estructura del repo.

## Paso 1 — Constitución
Crear `constitucion/reglas.md` con las 11 reglas de oro:

1. Privacidad y seguridad por defecto
2. Humano en el bucle para nivel 3
3. Nada de dependencias opacas
4. Reversibilidad en automatizaciones
5. Constitución protegida
6. Versionado y control de configuración
7. Aprendizaje documentado tras cada producto
8. Mínimo privilegio para agentes y servicios
9. Seguridad verificable antes de ejecutar
10. Trazabilidad total de las decisiones
11. **Regla madre:** las 11 reglas de oro son invariantes. Las tecnologías cambian; las reglas, no.

Crear `constitucion/niveles-autonomia.md`:

| Nivel | Qué puede hacer | Aprobación | Reversión |
|---|---|---|---|
| N0 — Observar | Solo lectura: analiza, investiga, propone. No escribe. | Ninguna | No aplica |
| N1 — Proponer | Genera artefactos (código, docs, ADRs) en rama o borrador. No mergea, no despliega. | Humana para integrar | Descartar la rama |
| N2 — Ejecutar en aislado | Escribe, testea, despliega a entornos efímeros con datos sintéticos. Sin datos reales, terceros ni gasto. | Ninguna dentro del sobre | Automática: destruir el entorno |
| N3 — Impacto real | Producción, datos reales, gasto, terceros. | **Humano en el bucle, previo y obligatorio** | Plan de rollback declarado ANTES |
| N4 — Autonomía acotada | Sin aprobación previa dentro de un sobre cerrado. | **APAGADO en V0.1** | Rollback automático al salirse del sobre |

Reglas de la escala:
- Ningún agente puede subirse de nivel a sí mismo. Promocionar es un cambio de configuración versionado y aprobado por Billy.
- **Condición de desbloqueo del N4:** (1) mínimo 20 operaciones N3 sin incidentes ni rollbacks causados por el agente; (2) evidencia en la memoria de la fábrica; (3) sobre definido por escrito (presupuesto, alcance, ventana temporal, kill-switch probado); (4) aprobación explícita de Billy como cambio versionado. Nunca automática.

**ADR-0001:** adopción de la constitución y los niveles de autonomía.

## Paso 2 — agents.md y plantilla de ADN
Crear `agents.md` en la raíz: instrucción de que Claude Code (y cualquier agente) lee la constitución, los niveles de autonomía y el ADN del agente correspondiente ANTES de tocar nada.

Crear `agents/plantilla-adn.md` con la plantilla de 9 bloques:
1. Misión (una frase: para qué existe)
2. Nivel de autonomía (N0–N3; promoción solo por Billy)
3. Alcance (`puede_tocar` / `no_puede_tocar` con exclusiones explícitas)
4. Permisos mínimos (retirar los no usados en 30 días)
5. Entradas y salidas (`recibe_de` / `entrega_a`)
6. Evidencia obligatoria
7. Reversión (declarada ANTES de operar; sin respuesta → techo N1)
8. Criterios de retiro o promoción
9. Confrontación crítica (para quien propone construir)

Los agentes `tipo: temporal` llevan fecha de expiración; sus credenciales mueren con ella.

**ADR-0002:** plantilla de ADN v0.1.

## Paso 3 — ADN del orquestador (el primero, por decisión de la revisión pre-kit)
Crear `agents/orquestador.md`:

```yaml
id: orquestador
tipo: permanente
version: 0.1.0

## 1. Misión
Hacer cumplir el proceso de la fábrica sin interpretarlo: enrutar
trabajo, verificar requisitos y rechazar lo que no cumple.
No tiene criterio propio y eso es deliberado.

## 2. Nivel de autonomía
nivel: N2
Solo actos de proceso: etiquetar, enrutar, comentar, rechazar,
registrar. Nunca mergea, nunca despliega, nunca aprueba.
Implementación V0.1: código determinista (GitHub Actions + reglas
versionadas), no un modelo de IA.

## 3. Alcance
puede_tocar:
  - etiquetas, estados y asignaciones de PRs e issues
  - comentarios de rechazo con el motivo y la regla incumplida
  - memoria/eventos/ (registro append-only)
no_puede_tocar:
  - constitucion/, agents/ (ni para "corregir formato")
  - contenido de ningún PR (no edita propuestas)
  - su propio código y sus propias reglas (prohibida la automodificación)

## 4. Permisos mínimos
Lectura del repo; escritura de etiquetas/estados/comentarios vía
token de CI con scope mínimo; escritura append-only en
memoria/eventos/. Sin credenciales cloud, sin acceso a IA.

## 5. Entradas y salidas
recibe_de: [todos los agentes, billy]
entrega_a: [agente destinatario, memoria-fabrica, billy]
Escala a Billy: todo N3, coste de salida alto, y cualquier caso no
cubierto por sus reglas (ante la duda, no tramita y escala).

## 6. Evidencia obligatoria
ÚNICO escritor de memoria/eventos/. Solo hechos verificables:
PR abierto/mergeado/rechazado, check de CI pasado/fallado, motivo
de rechazo con regla citada. Nunca valoraciones.

## 7. Reversión
Todos sus actos son reversibles (quitar etiqueta, reabrir PR,
reasignar). Los eventos no se borran: un error se corrige con un
evento de rectificación.

## 8. Criterios de retiro o promoción
No promociona: N2 es su techo permanente por diseño. Cada rechazo
disputado queda registrado; si las disputas ganadas contra él
superan un umbral, sus reglas se revisan vía PR aprobado por Billy.

## 9. Confrontación crítica
No aplica: no propone construir. Es quien cobra el peaje: rechaza
mecánicamente todo ADR de decisión de construir sin el bloque 9.

## Gobernanza del propio orquestador
Su código y sus reglas viven en rutas protegidas con revisión
obligatoria de Billy. Cambiar al árbitro es un acto constitucional.
```

**ADR-0003:** orquestador como repartidor mecánico sin criterio, techo N2 permanente, único escritor de eventos.

## Paso 4 — ADN del CTO IA
Crear `agents/cto-ia.md`:

```yaml
id: cto-ia
tipo: permanente
version: 0.1.0

## 1. Misión
Garantizar que cada decisión arquitectónica sea la más simple que
resuelve el problema, respaldada por benchmarking y registrada
con evidencia.

## 2. Nivel de autonomía
nivel: N1
Propone arquitecturas, ADRs y benchmarks en rama. No mergea, no
despliega, no provisiona. Promoción a N2: decisión de Billy.

## 3. Alcance
puede_tocar:
  - docs/adr/
  - docs/benchmarks/
  - agents/propuestas/
no_puede_tocar:
  - constitucion/
  - .github/workflows/
  - credenciales, facturación, infraestructura viva

## 4. Permisos mínimos
Lectura del repo; escritura solo en puede_tocar vía PR; lectura de
la memoria de la fábrica. Sin credenciales cloud, sin datos de
producto.

## 5. Entradas y salidas
recibe_de: [ceo-ia-operativo, motor-innovacion, billy]
entrega_a: [orquestador, memoria-fabrica]

## 6. Evidencia obligatoria
Cada decisión deja un ADR con: contexto, opciones evaluadas
(mínimo 2), criterios, elegida, descartadas y por qué, fecha de
revisión futura. Sin ADR, la decisión no existe.

## 7. Reversión
Todo vive en ramas y PRs. Un ADR se marca "superseded", nunca se
borra.

## 8. Criterios de retiro o promoción
Promoción a N2: 10 ADRs aceptados sin rectificación mayor.
Degradación: ADR sin bloque 9 o con una sola opción se rechaza;
tres rechazos seguidos fuerzan revisión del ADN.

## 9. Confrontación crítica (peaje previo a construir)
Antes de que una decisión pase a "construir", atacar la propia
propuesta y dejar el resultado en el ADR:
1. Abogado del diablo: mínimo 3 objeciones serias.
2. Prueba de simplicidad: ¿qué versión más simple resuelve el 80%?
   Si existe y no se elige, justificar.
3. Prueba de reversibilidad: coste de salida a 3 meses vista.
   Coste alto = escalar a Billy.
4. Dependencias opacas: si introduce caja negra, veto automático.
5. Nivel de provocación aplicado (P0–P4) y qué cambió gracias a él.
Sin este bloque, la decisión es inválida: el orquestador la rechaza.
```

Reparto de papeles (dejarlo escrito en `agents/plantilla-adn.md`): **quien propone confronta** (bloque 9); **el orquestador verifica la forma** (que el bloque existe y está completo); **Billy juzga el fondo** en las propuestas N3. Si en niveles inferiores la autoconfrontación degenera en ritual vacío, se extraerá un agente provocador independiente.

**ADR-0004:** confrontación crítica dentro del CTO IA (no como agente separado en V0.1).

## Paso 5 — Policy tecnológico
Crear `docs/policy-tecnologico.md`:

- Subordinado a las 11 reglas: si algo lo contradice, ganan las reglas.
- **Stack por defecto (sin justificación):** Google Cloud (Cloud Run; Cloud SQL/PostgreSQL cuando haya productos corriendo), GitHub Actions para CI/CD.
- **Capa de IA: Anthropic como proveedor único en V0.1.** Decisión consciente: la regla de "ningún proveedor captura una capa crítica" queda suspendida para esta versión, con revisión en la cita semestral del policy. Todas las llamadas a IA pasan por un módulo cliente único (módulo-puerta); ningún agente llama a la API directamente.
- **Admisión de tecnología nueva:** exige ADR con bloque 9 completo — sin dependencias opacas (veto constitucional), coste de salida documentado (alto = escala a Billy), madurez mínima, permisos granulares disponibles.
- **Vetos:** cajas negras inauditables; dependencias sin versión fijable; componentes que exigen permisos amplios sin granularidad; llamadas a IA fuera del módulo-puerta.
- **Revisión:** cada 6 meses o tras cada producto terminado, lo que ocurra antes. Las 11 reglas no se revisan.

**ADR-0005:** proveedor único Anthropic con módulo-puerta y suspensión consciente de la regla de no-captura.

## Paso 6 — Deuda declarada de la V0.1
Crear `docs/limitaciones-v01.md`:

> En la V0.1, todos los agentes operan con las credenciales de Billy (GitHub y Google Cloud). El mínimo privilegio se hace cumplir por verificación en CI (portero de alcances), no por separación de llaves. **Dar a cada agente sus propias identidades y credenciales (cuentas de servicio separadas, tokens propios) es el criterio que convierte la V0.1 en V0.2.** Deuda técnica conocida, con pagaré.

La clave de API de Anthropic vive en los Secrets de GitHub Actions. Nunca en el repo.

**ADR-0006:** limitación de credenciales declarada; criterio de graduación a V0.2.

## Paso 7 — Memoria mínima viable
Crear `memoria/eventos/` y `memoria/aprendizajes/`, cada una con su README:

- **Eventos** (`memoria/eventos/`): solo los escribe el orquestador, append-only. Un archivo por día o por producto; una línea por evento con formato fijo: `fecha | agente | tipo | referencia verificable (PR/commit/run de CI)`. Tipos V0.1: propuesta-abierta, propuesta-rechazada (con regla citada), propuesta-mergeada, ci-pasado, ci-fallado, incidencia, rectificación. Si un evento no señala a algo comprobable en GitHub, no es un evento: es una opinión, y no entra. Los eventos alimentan promociones y métricas.
- **Aprendizajes** (`memoria/aprendizajes/`): los escriben los agentes tras cada producto, solo vía PR revisado. Qué funcionó, qué antipatrón apareció, qué se haría distinto. Alimentan a los agentes futuros.
- Los ADRs viven en `docs/adr/` y la memoria los referencia (no se duplican).

**ADR-0007:** memoria en Git, eventos solo del orquestador, aprendizajes por PR.

## Paso 8 — Candados
- Crear `CODEOWNERS`: `constitucion/`, `agents/`, `.github/` y `memoria/eventos/` requieren revisión de Billy.
- **Acción manual de Billy** (Claude Code no puede hacerla; dejarla indicada en el README): activar branch protection en la rama principal — revisión obligatoria, sin push directo, checks de CI requeridos.

**ADR-0008:** protección mecánica de la constitución y los ADNs.

## Paso 9 — Portero de CI (seguridad verificable)
Crear `.github/workflows/portero.yml`, que en cada PR:
1. Identifica al agente firmante (etiqueta o convención en la rama/PR).
2. Lee su ADN y valida que el diff solo toca rutas de su `puede_tocar` y ninguna de `no_puede_tocar`. Violación = rechazo automático con la regla citada.
3. Si el PR contiene un ADR de decisión de construir, verifica que el bloque 9 está presente y completo (verificación de forma).
4. Comprueba que ningún agente `temporal` ha expirado.
5. Registra el evento correspondiente en `memoria/eventos/`.

**ADR-0009:** portero de alcances como implementación de "seguridad verificable antes de ejecutar".

## Paso 10 — Módulo-puerta
Crear `src/puerta-ia/` con un único módulo cliente hacia la API de Anthropic: punto único de llamada, con registro de cada invocación (agente, tokens consumidos, propósito) para trazabilidad y futuro presupuesto por agente. Pequeño: un archivo, no un proyecto.

**ADR-0010:** módulo-puerta como único punto de contacto con el proveedor de IA.

## Paso 11 — Cierre del producto cero
Crear `memoria/aprendizajes/2026-producto-cero-starter-kit.md`: primera lección documentada de la fábrica. Qué funcionó del montaje, qué fricción apareció, qué se haría distinto. Con esto la fábrica nace cumpliendo su propia regla 7.

---

## Cola de diseño fino (pendiente, no bloquea el montaje)
- Presupuesto de tokens por agente y por operación (el módulo-puerta ya deja los datos).
- Formato de evidencia resumida para las aprobaciones N3 de Billy (evitar que sea cuello de botella).
- Contrapeso anti-Goodhart en las métricas de promoción (que los agentes no aprendan a proponer solo lo conservador).
- Mecanismo concreto para "privacidad por defecto".
- ADNs restantes del gobierno: CEO IA operativo y COO IA (reutilizar la plantilla).
