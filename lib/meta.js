/* =========================================================================
   Meta Ads — sincronização via Graph API usando um System User token.
   Para contas dentro do SEU Business Manager NÃO precisa de App Review:
   basta o token com permissão ads_read. Config vem do .env.
   ========================================================================= */

import { ingestMany } from './accounts.js';

const V = process.env.META_API_VERSION || 'v21.0';
const TOKEN = process.env.META_ACCESS_TOKEN || '';
export const META_ENABLED = !!TOKEN;

async function graph(pathname, params = {}) {
  const url = new URL('https://graph.facebook.com/' + V + '/' + pathname);
  Object.entries(params).forEach(([k, val]) => url.searchParams.set(k, val));
  url.searchParams.set('access_token', TOKEN);
  const r = await fetch(url);
  const j = await r.json().catch(() => ({}));
  if (!r.ok || j.error) throw new Error(j.error?.message || ('Graph API ' + r.status));
  return j;
}

/* Lista as contas de anúncio visíveis pelo token (as do seu BM). */
export async function listAdAccounts() {
  const j = await graph('me/adaccounts', { fields: 'account_id,name,currency', limit: '500' });
  return j.data || [];
}

/* Conversões = soma das ações de resultado (lead, compra, conversões de pixel). */
function contarConversoes(actions = []) {
  const alvo = /(lead|purchase|complete_registration|conversion|submit_application|contact|schedule)/i;
  return actions.filter((a) => alvo.test(a.action_type)).reduce((s, a) => s + (parseFloat(a.value) || 0), 0);
}

const MESES = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];

/* Série de conversões dos últimos ~5 meses (para o gráfico). */
async function serieMensal(accountId) {
  try {
    const hoje = new Date();
    const since = new Date(hoje.getFullYear(), hoje.getMonth() - 4, 1);
    const j = await graph('act_' + accountId + '/insights', {
      fields: 'actions',
      time_increment: 'monthly',
      time_range: JSON.stringify({ since: since.toISOString().slice(0, 10), until: hoje.toISOString().slice(0, 10) }),
    });
    const rows = j.data || [];
    return {
      labels: rows.map((r) => MESES[Number((r.date_start || '').slice(5, 7)) - 1] || ''),
      valores: rows.map((r) => contarConversoes(r.actions)),
    };
  } catch {
    return { labels: [], valores: [] };
  }
}

/* Puxa os dados do mês atual de todas as contas e grava via ingestAccount. */
export async function syncMeta() {
  if (!TOKEN) throw new Error('META_ACCESS_TOKEN não configurado. Peça o token ao dono do sistema.');
  const contas = await listAdAccounts();
  const items = [];
  for (const c of contas) {
    const ins = await graph('act_' + c.account_id + '/insights', {
      fields: 'spend,clicks,cpc,impressions,actions',
      date_preset: 'this_month',
    });
    const row = (ins.data && ins.data[0]) || {};
    const conversoes = contarConversoes(row.actions);
    const custo = parseFloat(row.spend) || 0;
    items.push({
      plataforma: 'meta',
      contaId: c.account_id,
      contaNome: c.name,
      moeda: c.currency || 'BRL',
      periodo: 'Mês atual',
      metricas: {
        conversoes,
        cliques: parseFloat(row.clicks) || 0,
        custo,
        cpcMedio: parseFloat(row.cpc) || 0,
        custoPorConversao: conversoes ? custo / conversoes : 0,
        impressoes: parseFloat(row.impressions) || 0,
      },
      serie: await serieMensal(c.account_id),
    });
  }
  await ingestMany(items);
  return { contas: items.length, nomes: items.map((i) => i.contaNome) };
}
