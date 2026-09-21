#!/usr/bin/env node
'use strict';

/*
 * Portero de CI — implementación V0.1, código determinista (ver
 * agents/orquestador.md y ADR-0009). No llama a ningún modelo de IA:
 * lee archivos del propio repo y compara contra reglas explícitas.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const REPO_ROOT = path.resolve(__dirname, '..', '..');
const AGENTS_DIR = path.join(REPO_ROOT, 'agents');
// Los eventos viven en la rama memoria-eventos (ADR-0011); el workflow la
// monta en un worktree y pasa su ruta aquí. Sin ella, se escribe en local.
const EVENTOS_DIR = process.env.PORTERO_EVENTOS_DIR || path.join(REPO_ROOT, 'memoria', 'eventos');

// Único firmante humano reconocido (ADR-0012). Sus PRs no se verifican por
// alcance (Billy juzga el fondo); sí por forma (bloque 9, agentes expirados).
const FIRMANTE_HUMANO = 'billy';

// Rutas protegidas de forma global, independientemente del ADN del
// agente firmante (regla 5: constitución protegida).
const GLOBAL_PROTECTED_PREFIXES = ['constitucion/', '.github/', 'CODEOWNERS'];
// Dentro de agents/, solo agents/propuestas/ está abierto por defecto
// a agentes que proponen ADNs nuevos (p.ej. el CTO IA).
const AGENTS_ROOT_EXCEPTIONS = ['agents/propuestas/'];

function sh(cmd) {
  return execSync(cmd, { cwd: REPO_ROOT, encoding: 'utf8' }).trim();
}

function getChangedFiles(baseRef, headRef) {
  const out = sh(`git diff --name-only ${baseRef}...${headRef}`);
  return out ? out.split('\n').filter(Boolean) : [];
}

function readAgentDNA(agentId) {
  const file = path.join(AGENTS_DIR, `${agentId}.md`);
  if (!fs.existsSync(file)) return null;
  return fs.readFileSync(file, 'utf8');
}

// Extrae los items de una lista YAML tipo:
//   puede_tocar:
//     - a
//     - b
function extractList(content, key) {
  const re = new RegExp(`${key}:\\s*\\n((?:\\s*-\\s*.+\\n?)+)`, 'm');
  const m = content.match(re);
  if (!m) return [];
  return m[1]
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.startsWith('-'))
    .map((l) => l.replace(/^-+\s*/, '').trim());
}

// De cada item ("docs/adr/" o "contenido de ningún PR (no edita propuestas)")
// se queda solo con lo que parece una ruta verificable mecánicamente.
function pathLikePrefixes(items) {
  return items
    .map((item) => item.split('(')[0].trim())
    .filter((item) => /^[\w./-]+\/?$/.test(item) && item.includes('/'));
}

function matchesAnyPrefix(file, prefixes) {
  return prefixes.some((p) => file === p.replace(/\/$/, '') || file.startsWith(p));
}

// memoria/eventos/ solo admite líneas añadidas: ninguna borrada ni editada.
function isAppendOnlyChange(baseRef, headRef, file) {
  const diff = sh(`git diff ${baseRef}...${headRef} -- "${file}"`);
  return !diff.split('\n').some((l) => l.startsWith('-') && !l.startsWith('---'));
}

function extractField(content, field) {
  const m = content.match(new RegExp(`^${field}:\\s*(.+)$`, 'm'));
  return m ? m[1].trim() : null;
}

function findAgentIdFromPR(prLabels, prBranch) {
  for (const label of prLabels) {
    const m = label.match(/^agente:(.+)$/);
    if (m) return m[1].trim();
  }
  const m = (prBranch || '').match(/^agente\/([^/]+)\//);
  if (m) return m[1];
  return null;
}

function findFirmanteHumano(prLabels) {
  for (const label of prLabels) {
    const m = label.match(/^firmante:(.+)$/);
    if (m) return m[1].trim();
  }
  return null;
}

function listAllAgentIds() {
  if (!fs.existsSync(AGENTS_DIR)) return [];
  return fs
    .readdirSync(AGENTS_DIR)
    .filter((f) => f.endsWith('.md') && f !== 'plantilla-adn.md')
    .map((f) => f.replace(/\.md$/, ''));
}

function checkExpiredTemporalAgents() {
  const expired = [];
  for (const id of listAllAgentIds()) {
    const content = readAgentDNA(id);
    if (!content) continue;
    const tipo = extractField(content, 'tipo');
    const expira = extractField(content, 'expira');
    if (tipo === 'temporal' && expira) {
      const expiraDate = new Date(expira);
      if (!isNaN(expiraDate) && expiraDate < new Date()) {
        expired.push({ id, expira });
      }
    }
  }
  return expired;
}

function checkAdrConfrontacionCritica(changedFiles) {
  const adrFiles = changedFiles.filter(
    (f) => f.startsWith('docs/adr/') && f.endsWith('.md')
  );
  const problems = [];
  for (const f of adrFiles) {
    const full = path.join(REPO_ROOT, f);
    if (!fs.existsSync(full)) continue; // archivo borrado
    const content = fs.readFileSync(full, 'utf8');
    const m = content.match(/## Confrontación crítica\s*\n([\s\S]*?)(\n## |\n?$)/);
    if (!m || m[1].trim().length < 20) {
      problems.push(`${f}: falta el bloque "Confrontación crítica" o está vacío (regla: plantilla-adn.md bloque 9).`);
    }
  }
  return problems;
}

function appendEvent(agentId, tipo, referencia) {
  fs.mkdirSync(EVENTOS_DIR, { recursive: true });
  const today = new Date().toISOString().slice(0, 10);
  const file = path.join(EVENTOS_DIR, `${today}.md`);
  const line = `${new Date().toISOString()} | ${agentId || 'desconocido'} | ${tipo} | ${referencia}\n`;
  fs.appendFileSync(file, line);
  return file;
}

function main() {
  const baseRef = process.env.PORTERO_BASE_REF || 'origin/main';
  const headRef = process.env.PORTERO_HEAD_REF || 'HEAD';
  const prLabels = (process.env.PORTERO_PR_LABELS || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  const prBranch = process.env.PORTERO_PR_BRANCH || '';
  const prNumber = process.env.PORTERO_PR_NUMBER || 'sin-numero';
  const runUrl = process.env.PORTERO_RUN_URL || 'sin-url-de-run';

  const violations = [];
  const summaryLines = [];
  const changedFiles = getChangedFiles(baseRef, headRef);
  const firmanteHumano = findFirmanteHumano(prLabels);
  let agentId = findAgentIdFromPR(prLabels, prBranch);

  if (firmanteHumano) {
    agentId = firmanteHumano;
    if (firmanteHumano !== FIRMANTE_HUMANO) {
      violations.push(`Firmante humano "${firmanteHumano}" no reconocido; solo "${FIRMANTE_HUMANO}" (ADR-0012).`);
    } else {
      summaryLines.push('Firmante humano: alcance no verificado (Billy juzga el fondo); se verifica la forma.');
    }
  } else if (!agentId) {
    violations.push(
      'No se pudo identificar al firmante. Etiqueta el PR como "agente:<id>" (o rama "agente/<id>/...") o, si lo firma Billy, "firmante:billy".'
    );
  } else {
    const dna = readAgentDNA(agentId);
    if (!dna) {
      violations.push(`No existe agents/${agentId}.md. Regla 5 / regla 9: sin ADN no hay verificación de alcance posible.`);
    } else {
      const tipo = extractField(dna, 'tipo');
      const expira = extractField(dna, 'expira');
      if (tipo === 'temporal' && expira && new Date(expira) < new Date()) {
        violations.push(`El agente "${agentId}" es temporal y expiró el ${expira}. Sus credenciales están muertas.`);
      }

      const puedeTocar = pathLikePrefixes(extractList(dna, 'puede_tocar'));
      const noPuedeTocar = pathLikePrefixes(extractList(dna, 'no_puede_tocar'));

      for (const file of changedFiles) {
        if (file.startsWith('memoria/eventos/')) {
          if (!isAppendOnlyChange(baseRef, headRef, file)) {
            violations.push(`${file}: memoria/eventos/ es append-only; no se borran ni editan eventos (ADR-0007).`);
          }
          continue;
        }
        const inAgentsRoot = file.startsWith('agents/');
        const isAgentsException = AGENTS_ROOT_EXCEPTIONS.some((p) => file.startsWith(p));
        const globalHit = GLOBAL_PROTECTED_PREFIXES.find((p) => file.startsWith(p));
        if (globalHit) {
          violations.push(`${file}: fuera de alcance — ruta protegida globalmente ("${globalHit}", regla 5).`);
          continue;
        }
        if (inAgentsRoot && !isAgentsException) {
          violations.push(`${file}: fuera de alcance — ningún agente edita ADNs ajenos ni el suyo propio (agents.md).`);
          continue;
        }
        const denied = noPuedeTocar.find((p) => matchesAnyPrefix(file, [p]));
        if (denied) {
          violations.push(`${file}: fuera de alcance — declarado en no_puede_tocar de agents/${agentId}.md ("${denied}").`);
          continue;
        }
        if (puedeTocar.length > 0 && !matchesAnyPrefix(file, puedeTocar)) {
          violations.push(`${file}: fuera de alcance — no está en puede_tocar de agents/${agentId}.md.`);
        }
      }
    }
  }

  violations.push(...checkAdrConfrontacionCritica(changedFiles));

  const expiredAgents = checkExpiredTemporalAgents();
  if (expiredAgents.length > 0) {
    summaryLines.push(
      `Aviso: agentes temporales expirados en el repo (retirar su ADN): ${expiredAgents
        .map((a) => `${a.id} (expiró ${a.expira})`)
        .join(', ')}`
    );
  }

  const passed = violations.length === 0;
  const eventoTipo = passed ? 'ci-pasado' : 'propuesta-rechazada';
  const referencia = `PR #${prNumber} — ${runUrl}`;
  const eventoMotivo = passed ? '' : ` | ${violations[0]}`;
  const eventFile = appendEvent(agentId, eventoTipo, referencia + eventoMotivo);

  console.log('--- Portero de CI (V0.1) ---');
  console.log(`Agente firmante: ${agentId || '(sin identificar)'}`);
  console.log(`Archivos cambiados: ${changedFiles.length}`);
  if (summaryLines.length) console.log(summaryLines.join('\n'));
  if (!passed) {
    console.log('RECHAZADO:');
    for (const v of violations) console.log(` - ${v}`);
  } else {
    console.log('APROBADO: el diff respeta el alcance declarado.');
  }
  console.log(`Evento registrado en ${path.relative(REPO_ROOT, eventFile)}`);

  if (!passed) process.exit(1);
}

main();
