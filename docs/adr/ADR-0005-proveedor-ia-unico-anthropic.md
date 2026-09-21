# ADR-0005: proveedor único Anthropic con módulo-puerta y suspensión consciente de la regla de no-captura

**Estado:** Aceptado
**Fecha:** 2026-09-21
**Fecha de revisión futura:** cita semestral del policy tecnológico (cada 6 meses o tras cada producto terminado, lo que ocurra antes).

## Contexto

La fábrica necesita decidir su stack por defecto y, en particular, cómo accede a capacidades de IA. Multiproveedor de IA desde el día uno añade una capa de abstracción (routing, normalización de APIs distintas) antes de tener un solo producto construido. A la vez, depender de un único proveedor en una capa crítica es precisamente el tipo de riesgo que una regla de buen gobierno de arquitectura suele prohibir.

## Opciones evaluadas

1. **Multiproveedor desde V0.1**, con capa de abstracción que normalice llamadas a distintos proveedores de IA.
2. **Anthropic como proveedor único**, con toda llamada centralizada en un módulo-puerta propio, y suspensión explícita y con fecha de revisión de la regla de no-captura — **opción elegida**.
3. **Anthropic como proveedor único, sin módulo-puerta**: cada agente llama directamente a la API.

## Criterios

- Prueba de simplicidad: ¿la versión más simple resuelve el 80% del problema de "la fábrica necesita IA"?
- Coste de salida: qué tan caro es cambiar de proveedor más adelante.
- Trazabilidad y control de gasto (regla 10, y presupuesto por agente pendiente en la cola de diseño fino).

## Decisión

Se adopta la opción 2. Anthropic es el proveedor único de IA en V0.1. Se suspende conscientemente la regla no escrita de "ningún proveedor captura una capa crítica", dejándolo declarado por escrito en vez de ignorado en silencio, con revisión obligatoria en la cita semestral del policy. Toda llamada a IA pasa por un módulo cliente único (módulo-puerta, Paso 10); ningún agente llama a la API directamente.

## Opciones descartadas y por qué

- **Opción 1** se descarta: construir una capa de abstracción multiproveedor antes de tener un producto real es exactamente la complejidad prematura que el principio rector de la V0.1 ("no demostrar que somos inteligentes, sino que podemos construir, medir, aprender y mejorar") desaconseja. No hay evidencia todavía de que se necesite.
- **Opción 3** se descarta: sin módulo-puerta, no hay punto único de trazabilidad (qué agente llamó, cuántos tokens, para qué) ni forma de aplicar mínimo privilegio o un futuro presupuesto por agente. Viola la regla 10 y complica la regla 8.

## Consecuencias

- La fábrica queda expuesta a un solo proveedor de IA: cambios de precio, disponibilidad o política de Anthropic afectan a toda la fábrica sin alternativa inmediata.
- El módulo-puerta se convierte en un componente crítico: si falla, ningún agente puede usar IA. A cambio, es el único lugar que hay que auditar o cambiar si se decide migrar de proveedor.
- La revisión semestral (o tras cada producto) es la válvula de escape: la suspensión de la regla de no-captura no es indefinida, tiene fecha de caducidad declarada.

## Confrontación crítica

1. **Abogado del diablo:**
   - Un proveedor único es un punto único de fallo de negocio, no solo técnico: un cambio de términos de servicio de Anthropic podría paralizar la fábrica.
   - "Revisión semestral" es una promesa fácil de posponer si no hay un producto que la fuerce antes.
   - El módulo-puerta centraliza el riesgo: un bug ahí afecta a todos los agentes a la vez, más que si cada uno llamara por su cuenta.
2. **Prueba de simplicidad:** la versión más simple que resuelve el 80% es exactamente la elegida (proveedor único + módulo-puerta delgado). La alternativa más simple aún, sin módulo-puerta (opción 3), se descarta porque el 20% que pierde —trazabilidad y mínimo privilegio— es constitucional (reglas 8 y 10), no opcional.
3. **Prueba de reversibilidad:** coste de salida documentado como alto — migrar de proveedor implica reescribir el módulo-puerta y revalidar comportamiento en todos los agentes que lo usan. Por eso el policy exige escalar a Billy cualquier decisión de tecnología con coste de salida alto, y esta lo tiene; se acepta con los ojos abiertos porque el módulo-puerta, al ser el único punto de contacto, acota el radio del cambio a un solo archivo/módulo en vez de a todo el código de agentes.
4. **Dependencias opacas:** la API de Anthropic no es una caja negra inauditable en el sentido de la regla 3 (hay documentación pública, contratos de API estables, y el módulo-puerta deja logs de cada invocación), pero se reconoce que es de código cerrado. Se acepta porque el veto de la regla 3 apunta a dependencias sin transparencia de comportamiento ni control de versión, no a todo proveedor externo.
5. **Nivel de provocación aplicado:** P3. Cambio: en vez de simplemente elegir un proveedor único y seguir adelante, se obligó a declarar por escrito qué regla de buen gobierno se está suspendiendo y a fijarle fecha de revisión — convirtiendo una omisión implícita en una decisión auditable.
