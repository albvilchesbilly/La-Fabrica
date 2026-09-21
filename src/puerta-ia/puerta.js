'use strict';

/*
 * Módulo-puerta (ADR-0005, ADR-0010): único punto de contacto de La
 * Fábrica con la API de Anthropic. Ningún agente importa el SDK
 * directamente; todos pasan por `invocar()`.
 *
 * Cada invocación deja una línea JSON en el registro (agente, propósito,
 * modelo, tokens) para trazabilidad y para el futuro presupuesto por
 * agente. La clave de API la resuelve el SDK desde ANTHROPIC_API_KEY
 * (en CI, desde los Secrets de GitHub Actions; nunca en el repo).
 */

const fs = require('fs');
const path = require('path');
const Anthropic = require('@anthropic-ai/sdk');

const REPO_ROOT = path.resolve(__dirname, '..', '..');
const AGENTS_DIR = path.join(REPO_ROOT, 'agents');
const REGISTRO_POR_DEFECTO = path.join(REPO_ROOT, 'memoria', 'invocaciones-ia.jsonl');

const MODELO_POR_DEFECTO = 'claude-opus-5';
const MAX_TOKENS_POR_DEFECTO = 16000;

function agenteExiste(agente) {
  return fs.existsSync(path.join(AGENTS_DIR, `${agente}.md`));
}

function registrar(rutaRegistro, entrada) {
  fs.mkdirSync(path.dirname(rutaRegistro), { recursive: true });
  fs.appendFileSync(rutaRegistro, JSON.stringify(entrada) + '\n');
}

function crearPuerta({ client, rutaRegistro } = {}) {
  const cliente = client || new Anthropic();
  const registro = rutaRegistro || process.env.PUERTA_IA_REGISTRO || REGISTRO_POR_DEFECTO;

  async function invocar({ agente, proposito, messages, system, model, maxTokens, effort }) {
    if (!agente || !agenteExiste(agente)) {
      throw new Error(`puerta-ia: agente "${agente}" no tiene ADN en agents/. Sin ADN no hay llamada (regla 8).`);
    }
    if (!proposito || typeof proposito !== 'string') {
      throw new Error('puerta-ia: toda invocación declara un "proposito" (regla 10).');
    }
    if (!Array.isArray(messages) || messages.length === 0) {
      throw new Error('puerta-ia: "messages" debe ser un array no vacío.');
    }

    const modelo = model || MODELO_POR_DEFECTO;
    const inicio = Date.now();
    const entrada = {
      fecha: new Date().toISOString(),
      agente,
      proposito,
      modelo,
    };

    try {
      const respuesta = await cliente.beta.messages.create({
        model: modelo,
        max_tokens: maxTokens || MAX_TOKENS_POR_DEFECTO,
        betas: ['server-side-fallback-2026-07-01'],
        fallbacks: 'default',
        ...(system ? { system } : {}),
        ...(effort ? { output_config: { effort } } : {}),
        messages,
      });

      registrar(registro, {
        ...entrada,
        modelo_servido: respuesta.model,
        stop_reason: respuesta.stop_reason,
        tokens_entrada: respuesta.usage.input_tokens,
        tokens_salida: respuesta.usage.output_tokens,
        tokens_cache_leidos: respuesta.usage.cache_read_input_tokens || 0,
        ms: Date.now() - inicio,
      });

      return respuesta;
    } catch (error) {
      registrar(registro, {
        ...entrada,
        error: error instanceof Anthropic.APIError ? `${error.status} ${error.name}` : String(error),
        ms: Date.now() - inicio,
      });
      throw error;
    }
  }

  function texto(respuesta) {
    return respuesta.content
      .filter((b) => b.type === 'text')
      .map((b) => b.text)
      .join('');
  }

  return { invocar, texto };
}

module.exports = { crearPuerta, MODELO_POR_DEFECTO };
