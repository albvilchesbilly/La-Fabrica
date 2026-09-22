# ADR-9999: prueba de humo del portero

## Contexto
PR sintético para verificar el portero en CI. No se mergea.

## Opciones
1. Probar solo en local. 2. Probar contra CI real.

## Decisión
Probar contra CI real y cerrar el PR sin mergear.

## Confrontación crítica
1. Abogado del diablo: un ADR de prueba ensucia docs/adr/ si alguien lo mergea por inercia.
2. Prueba de simplicidad: la batería local cubre la lógica; solo el workflow exige CI.
3. Reversibilidad: se cierra el PR y se borra la rama; coste de salida nulo.
4. Dependencias opacas: ninguna.
5. Provocación P1.
