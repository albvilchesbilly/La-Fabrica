# Eventos

Registro append-only de hechos verificables de la fábrica. **Solo lo escribe el orquestador** (ver `agents/orquestador.md`, bloque 6).

## Dónde está

El registro vive en la rama **`memoria-eventos`**, no en `main` (ADR-0011). El orquestador la escribe desde el portero de CI; nunca escribe en la rama de un PR ni en `main`. En `main`, esta carpeta solo contiene este README.

Para consultarlo:

```
git fetch origin memoria-eventos
git log origin/memoria-eventos
git show origin/memoria-eventos:memoria/eventos/2026-09-21.md
```

La rama no debe estar bajo branch protection ni exigir revisión: la escribe el orquestador con el token de CI, y su ADN ya prohíbe borrar o editar eventos.

## Formato

Un archivo por día o por producto. Una línea por evento:

```
fecha | agente | tipo | referencia verificable (PR/commit/run de CI)
```

## Tipos de evento (V0.1)

- `propuesta-abierta`
- `propuesta-rechazada` (con regla citada)
- `propuesta-mergeada`
- `ci-pasado`
- `ci-fallado`
- `incidencia`
- `rectificación`

## Reglas

- Si un evento no señala a algo comprobable en GitHub (PR, commit, run de CI), no es un evento: es una opinión, y no entra.
- Los eventos no se borran ni se editan. Un error se corrige con un evento de `rectificación`, nunca reescribiendo el histórico.
- Los eventos alimentan las promociones de nivel de autonomía y las métricas de la fábrica.
