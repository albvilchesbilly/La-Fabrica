# La Fábrica

**Qué es:** una fábrica capaz de diseñar bienes y servicios, que aprende de cada producto que construye y que se construye a sí misma. Este mismo repositorio — el Starter Kit V0.1 — es su producto cero: se levanta siguiendo las reglas que él mismo define, para que el primer producto ya sea evidencia de que el método funciona.

## Principio rector de la V0.1

No demostrar que somos inteligentes, sino demostrar que podemos **construir, medir, aprender y mejorar.**

## Cómo se construyó este repositorio

Cada paso del montaje entró en su propio commit, con su ADR correspondiente en `docs/adr/`. El historial de Git es la primera evidencia de la fábrica. El guion original vive en `guion-montaje-starter-kit-v01.md`.

## Estructura del repo

- `constitucion/` — las 11 reglas de oro y la escala de niveles de autonomía (N0–N4). Invariante; protegida por `CODEOWNERS`.
- `agents.md` — instrucción de lectura obligatoria: todo agente lee la constitución, los niveles de autonomía y su propio ADN antes de tocar nada.
- `agents/` — plantilla de ADN y el ADN de cada agente (orquestador, CTO IA, y los que se añadan).
- `docs/adr/` — decisiones de arquitectura (Architecture Decision Records), una por decisión, nunca se borran (se marcan `superseded`).
- `docs/policy-tecnologico.md` — stack por defecto, proveedor de IA, reglas de admisión de tecnología nueva.
- `docs/limitaciones-v01.md` — deuda técnica declarada de esta versión y el criterio que la convierte en V0.2.
- `memoria/eventos/` — registro append-only de hechos verificables (PRs, commits, CI), escrito únicamente por el orquestador.
- `memoria/aprendizajes/` — lecciones documentadas tras cada producto, escritas por los agentes vía PR.
- `.github/workflows/portero.yml` — el portero de CI: valida alcance, bloque de confrontación crítica y expiración de agentes temporales en cada PR.
- `src/puerta-ia/` — módulo único de llamada a la API de Anthropic (módulo-puerta): ningún agente llama a la API directamente.
- `CODEOWNERS` — rutas protegidas que requieren revisión de Billy.

## Acciones manuales pendientes (Claude Code no puede hacerlas)

- Activar **branch protection** en la rama principal: revisión obligatoria, sin push directo, checks de CI requeridos.
- Cargar la clave de API de Anthropic en los **Secrets de GitHub Actions** (nunca en el repo).
