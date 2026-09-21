# Instrucción para agentes

Cualquier agente —incluido Claude Code— que vaya a tocar este repositorio debe leer, **en este orden y antes de tocar nada**:

1. `constitucion/reglas.md` — las 11 reglas de oro. Invariantes.
2. `constitucion/niveles-autonomia.md` — qué puede hacer sin supervisión y qué necesita humano en el bucle.
3. Su propio ADN en `agents/<id-del-agente>.md` — misión, alcance, permisos, evidencia obligatoria y reversión.

Si el ADN del agente no existe todavía, su techo por defecto es **N0 — Observar**: puede analizar y proponer, no puede escribir.

Ningún agente edita la constitución, los ADNs ajenos, ni el suyo propio (regla 5 y regla de automodificación de cada ADN, cuando exista). Un cambio a estos artefactos siempre es un PR revisado por Billy.
