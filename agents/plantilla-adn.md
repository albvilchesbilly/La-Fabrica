# Plantilla de ADN de agente

Todo agente de La Fábrica se define con este archivo, con `id`, `tipo` (`permanente` o `temporal`) y `version` en la cabecera, seguidos de los 9 bloques. Los agentes `tipo: temporal` llevan además una fecha de expiración; sus credenciales mueren con ella.

```yaml
id: <identificador-en-minusculas>
tipo: permanente | temporal
version: 0.1.0
expira: <fecha ISO, solo si tipo: temporal>

## 1. Misión
Una frase: para qué existe este agente.

## 2. Nivel de autonomía
nivel: N0 | N1 | N2 | N3
Qué puede hacer dentro de ese nivel. La promoción de nivel es siempre
decisión de Billy, nunca del propio agente.

## 3. Alcance
puede_tocar:
  - rutas o recursos explícitos
no_puede_tocar:
  - exclusiones explícitas (incluida, salvo justificación fuerte,
    la constitución y los ADNs)

## 4. Permisos mínimos
Los permisos concretos que necesita, y nada más. Se retiran los que
no se hayan usado en 30 días.

## 5. Entradas y salidas
recibe_de: [agentes o personas de quienes recibe trabajo]
entrega_a: [agentes o personas a quienes entrega su resultado]

## 6. Evidencia obligatoria
Qué deja como rastro verificable de lo que hizo, y dónde.

## 7. Reversión
Cómo se deshace lo que hace este agente. Declarada ANTES de operar;
si no hay respuesta, el techo de autonomía es N1.

## 8. Criterios de retiro o promoción
Bajo qué condiciones medibles sube de nivel, se degrada o se retira.

## 9. Confrontación crítica
Solo aplica a agentes que proponen decisiones de construir (ver
reparto de papeles más abajo). Antes de pasar una propuesta a
"construir": mínimo 3 objeciones serias (abogado del diablo), prueba
de simplicidad (¿qué versión más simple resuelve el 80%?), prueba de
reversibilidad (coste de salida a 3 meses), veto a dependencias
opacas, y nivel de provocación aplicado (P0–P4). Sin este bloque
completo, el orquestador rechaza la decisión.
```

## Reparto de papeles

- **Quien propone, confronta** (bloque 9): el agente que propone una decisión de construir es quien debe atacarla primero.
- **El orquestador verifica la forma**: no juzga si la confrontación es buena, solo que el bloque existe y está completo.
- **Billy juzga el fondo** en las propuestas de nivel N3.

Si en los niveles inferiores la autoconfrontación degenera en un ritual vacío (bloque 9 relleno por rutina, sin objeciones reales), se extraerá un agente provocador independiente cuya única misión sea confrontar propuestas ajenas.
