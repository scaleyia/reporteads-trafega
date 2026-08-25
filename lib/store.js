/* =========================================================================
   Armazenamento persistente (chave→JSON).
   - Produção (Vercel): usa Vercel KV / Upstash Redis via REST — sem dependência
     nova, só fetch. Ativa sozinho quando as env vars existem.
   - Dev / servidor com disco: cai para arquivos em data/<chave>.json.
   O disco da Vercel é efêmero, por isso o KV é o caminho real em produção.
   ========================================================================= */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const DATA = path.join(HERE, '..', 'data');

const KV_URL = (process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL || '').replace(/\/+$/, '');
const KV_TOKEN = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN || '';
export const KV_ENABLED = !!(KV_URL && KV_TOKEN);

/* Executa um comando Redis pela API REST (formato ["SET","k","v"]). */
async function kvCmd(cmd) {
  const r = await fetch(KV_URL, {
    method: 'POST',
    headers: { Authorization: 'Bearer ' + KV_TOKEN, 'Content-Type': 'application/json' },
    body: JSON.stringify(cmd),
  });
  if (!r.ok) throw new Error('KV ' + r.status + ' ' + (await r.text().catch(() => '')));
  return (await r.json()).result;
}

/* Caminho do arquivo de fallback para uma chave (sanitizada). */
const fileFor = (key) => path.join(DATA, key.replace(/[^a-z0-9_-]+/gi, '_') + '.json');

/* Lê um valor JSON. Devolve `fallback` se não existir / falhar. */
export async function getJSON(key, fallback = null) {
  if (KV_ENABLED) {
    try {
      const raw = await kvCmd(['GET', key]);
      return raw ? JSON.parse(raw) : fallback;
    } catch (e) {
      console.error('store.getJSON KV:', e.message);
      return fallback;
    }
  }
  try {
    return JSON.parse(fs.readFileSync(fileFor(key), 'utf-8'));
  } catch {
    return fallback;
  }
}

/* Grava um valor JSON. Retorna true se persistiu de verdade. */
export async function setJSON(key, value) {
  if (KV_ENABLED) {
    try {
      await kvCmd(['SET', key, JSON.stringify(value)]);
      return true;
    } catch (e) {
      console.error('store.setJSON KV:', e.message);
      return false;
    }
  }
  try {
    fs.mkdirSync(DATA, { recursive: true });
    fs.writeFileSync(fileFor(key), JSON.stringify(value, null, 2));
    return true;
  } catch (e) {
    // Disco só-leitura (Vercel sem KV): não persiste. Avisamos uma vez.
    if (!setJSON._warned) { console.warn('⚠️  Sem KV e disco só-leitura: agendamentos não vão persistir. Configure o Vercel KV.'); setJSON._warned = true; }
    return false;
  }
}
