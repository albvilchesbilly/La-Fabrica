# Deuda declarada de la V0.1

> En la V0.1, todos los agentes operan con las credenciales de Billy (GitHub y Google Cloud). El mínimo privilegio se hace cumplir por verificación en CI (portero de alcances), no por separación de llaves. **Dar a cada agente sus propias identidades y credenciales (cuentas de servicio separadas, tokens propios) es el criterio que convierte la V0.1 en V0.2.** Deuda técnica conocida, con pagaré.

La clave de API de Anthropic vive en los Secrets de GitHub Actions. Nunca en el repo.
