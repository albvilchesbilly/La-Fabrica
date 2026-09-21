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
PRs etiquetados firmante:billy: verifica solo la forma (bloque 9,
agentes expirados), no el alcance. Billy juzga el fondo (ADR-0012).

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
ÚNICO escritor de memoria/eventos/, en la rama memoria-eventos
(ADR-0011); nunca en la rama de un PR ni en main. Solo hechos verificables:
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
