# Las 11 reglas de oro

Estas reglas son la constitución de La Fábrica. Ningún agente, ADN, policy o ADR puede contradecirlas: si algo lo hace, ganan las reglas.

1. **Privacidad y seguridad por defecto.** Ningún producto ni agente maneja datos personales o credenciales de forma innecesaria ni expuesta.
2. **Humano en el bucle para nivel 3.** Ninguna acción con impacto real (producción, datos reales, gasto, terceros) se ejecuta sin aprobación humana previa y obligatoria.
3. **Nada de dependencias opacas.** No se admite tecnología que funcione como caja negra inauditable.
4. **Reversibilidad en automatizaciones.** Toda automatización declara cómo deshacerse antes de operar.
5. **Constitución protegida.** Estas reglas y los niveles de autonomía viven en rutas con revisión obligatoria; ningún agente puede modificarlas.
6. **Versionado y control de configuración.** Todo cambio relevante (reglas, ADNs, permisos, policy) es un cambio versionado, con historial trazable.
7. **Aprendizaje documentado tras cada producto.** Cada producto terminado deja una lección escrita en `memoria/aprendizajes/`.
8. **Mínimo privilegio para agentes y servicios.** Cada agente tiene solo los permisos que necesita para su alcance declarado, y se le retiran los que no use.
9. **Seguridad verificable antes de ejecutar.** Ninguna acción se ejecuta sin una comprobación automática previa de que cumple las reglas.
10. **Trazabilidad total de las decisiones.** Toda decisión relevante deja evidencia verificable: quién, qué, cuándo y por qué.
11. **Regla madre: las 11 reglas de oro son invariantes.** Las tecnologías cambian; las reglas, no.
