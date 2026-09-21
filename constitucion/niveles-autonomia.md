# Niveles de autonomía

| Nivel | Qué puede hacer | Aprobación | Reversión |
|---|---|---|---|
| N0 — Observar | Solo lectura: analiza, investiga, propone. No escribe. | Ninguna | No aplica |
| N1 — Proponer | Genera artefactos (código, docs, ADRs) en rama o borrador. No mergea, no despliega. | Humana para integrar | Descartar la rama |
| N2 — Ejecutar en aislado | Escribe, testea, despliega a entornos efímeros con datos sintéticos. Sin datos reales, terceros ni gasto. | Ninguna dentro del sobre | Automática: destruir el entorno |
| N3 — Impacto real | Producción, datos reales, gasto, terceros. | **Humano en el bucle, previo y obligatorio** | Plan de rollback declarado ANTES |
| N4 — Autonomía acotada | Sin aprobación previa dentro de un sobre cerrado. | **APAGADO en V0.1** | Rollback automático al salirse del sobre |

## Reglas de la escala

- Ningún agente puede subirse de nivel a sí mismo. Promocionar es un cambio de configuración versionado y aprobado por Billy.
- **Condición de desbloqueo del N4:**
  1. Mínimo 20 operaciones N3 sin incidentes ni rollbacks causados por el agente.
  2. Evidencia en la memoria de la fábrica.
  3. Sobre definido por escrito (presupuesto, alcance, ventana temporal, kill-switch probado).
  4. Aprobación explícita de Billy como cambio versionado.

  Nunca automática.
