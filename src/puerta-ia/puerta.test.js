'use strict';

const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { crearPuerta } = require('./puerta');

const registro = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'puerta-')), 'reg.jsonl');

const clienteFalso = {
  beta: {
    messages: {
      create: async (params) => ({
        model: params.model,
        stop_reason: 'end_turn',
        content: [{ type: 'text', text: 'hola' }],
        usage: { input_tokens: 12, output_tokens: 3 },
      }),
    },
  },
};

(async () => {
  const puerta = crearPuerta({ client: clienteFalso, rutaRegistro: registro });

  await assert.rejects(
    () => puerta.invocar({ agente: 'no-existe', proposito: 'x', messages: [{ role: 'user', content: 'a' }] }),
    /no tiene ADN/
  );
  await assert.rejects(
    () => puerta.invocar({ agente: 'cto-ia', messages: [{ role: 'user', content: 'a' }] }),
    /proposito/
  );

  const r = await puerta.invocar({
    agente: 'cto-ia',
    proposito: 'prueba unitaria',
    messages: [{ role: 'user', content: 'a' }],
  });
  assert.strictEqual(puerta.texto(r), 'hola');

  const lineas = fs.readFileSync(registro, 'utf8').trim().split('\n');
  assert.strictEqual(lineas.length, 1);
  const entrada = JSON.parse(lineas[0]);
  assert.strictEqual(entrada.agente, 'cto-ia');
  assert.strictEqual(entrada.proposito, 'prueba unitaria');
  assert.strictEqual(entrada.tokens_entrada, 12);
  assert.strictEqual(entrada.tokens_salida, 3);

  console.log('puerta-ia: OK');
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
