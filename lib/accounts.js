/* =========================================================================
   Contas de anúncio — ingestão e armazenamento dos dados que chegam do
   Google Ads Script (webhook) e da sincronização da Meta. É a fonte única:
   os dois conectores gravam aqui, no mesmo formato.
   ========================================================================= */

import { getJSON, setJSON } from './store.js';

const KEY = 'trafega:accounts';

function num(v) {
  const n = typeof v === 'number' ? v : parseFloat(String(v).replace(',', '.'));
  return Number.isFinite(n) ? n : 0;
}

/* Normaliza o que chega dos conectores para um formato único. */
function normalize(input = {}) {
  const plataforma = input.plataforma === 'meta' ? 'meta' : 'google';
  const contaId = String(input.contaId || '').trim();
  const m = input.metricas || {};
  const serie = input.serie && Array.isArray(input.serie.valores)
    ? { labels: (input.serie.labels || []).map(String), valores: input.serie.valores.map(num) }
    : { labels: [], valores: [] };
  return {
    id: plataforma + ':' + contaId,
    plataforma,
    contaId,
    nome: (input.contaNome || input.nome || 'Conta').toString().trim(),
    periodo: (input.periodo || '').toString().trim(),
    moeda: (input.moeda || 'BRL').toString().trim(),
    metricas: {
      conversoes: num(m.conversoes),
      cliques: num(m.cliques),
      custo: num(m.custo),
      custoPorConversao: num(m.custoPorConversao),
      cpcMedio: num(m.cpcMedio),
      impressoes: num(m.impressoes),
    },
    serie,
    atualizadoEm: new Date().toISOString(),
  };
}

export async function listAccounts() {
  const list = await getJSON(KEY, []);
  return Array.isArray(list) ? list : [];
}

/* Insere ou atualiza uma conta (por plataforma+id). */
export async function ingestAccount(input) {
  const acc = normalize(input);
  if (!acc.contaId) throw new Error('contaId é obrigatório.');
  const list = await listAccounts();
  const i = list.findIndex((a) => a.id === acc.id);
  if (i >= 0) list[i] = acc; else list.push(acc);
  list.sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));
  await setJSON(KEY, list);
  return acc;
}

/* Ingestão em lote ATÔMICA: lê a lista uma vez, faz o upsert de todas e grava
   uma vez só. Evita condição de corrida quando várias contas chegam juntas. */
export async function ingestBulk(items = []) {
  const list = await listAccounts();
  const byId = new Map(list.map((a) => [a.id, a]));
  for (const it of items) {
    const acc = normalize(it);
    if (!acc.contaId) continue;
    byId.set(acc.id, acc);
  }
  const merged = [...byId.values()].sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));
  await setJSON(KEY, merged);
  return merged.length;
}

export async function removeAccount(id) {
  const list = await listAccounts();
  await setJSON(KEY, list.filter((a) => a.id !== id));
  return { ok: true };
}
