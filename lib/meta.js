/* =========================================================================
   Meta Ads — sincronização via Graph API usando um System User token.
   Para contas dentro do SEU Business Manager NÃO precisa de App Review:
   basta o token com permissão ads_read. Config vem do .env.
   ========================================================================= */

import { ingestAccount } from './accounts.js';

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
const iso = (d) => d.toISOString().slice(0, 10);

/* UMA chamada por conta: insights mensais dos últimos 5 meses. O mês atual é a
   última linha; a série sai das linhas todas. Metade das chamadas de antes. */
async function insightsConta(accountId) {
  const hoje = new Date();
  const since = new Date(hoje.getFullYear(), hoje.getMonth() - 4, 1);
  const j = await graph('act_' + accountId + '/insights', {
    fields: 'spend,clicks,cpc,impressions,actions',
    time_increment: 'monthly',
    time_range: JSON.stringify({ since: iso(since), until: iso(hoje) }),
  });
  return j.data || [];
}

function montaConta(c, rows) {
  const atual = rows[rows.length - 1] || {};
  const conversoes = contarConversoes(atual.actions);
  const custo = parseFloat(atual.spend) || 0;
  return {
    plataforma: 'meta',
    contaId: c.account_id,
    contaNome: c.name,
    moeda: c.currency || 'BRL',
    periodo: 'Mês atual',
    metricas: {
      conversoes,
      cliques: parseFloat(atual.clicks) || 0,
      custo,
      cpcMedio: parseFloat(atual.cpc) || 0,
      custoPorConversao: conversoes ? custo / conversoes : 0,
      impressoes: parseFloat(atual.impressions) || 0,
    },
    serie: {
      labels: rows.map((r) => MESES[Number((r.date_start || '').slice(5, 7)) - 1] || ''),
      valores: rows.map((r) => contarConversoes(r.actions)),
    },
  };
}

/* Sincroniza todas as contas em paralelo (em lotes), gravando cada uma assim
   que chega — assim o progresso persiste mesmo se algo falhar no meio. */
export async function syncMeta() {
  if (!TOKEN) throw new Error('META_ACCESS_TOKEN não configurado. Peça o token ao dono do sistema.');
  const contas = await listAdAccounts();
  const CONC = 6;
  let ok = 0, falhas = 0;
  const nomes = [];
  for (let i = 0; i < contas.length; i += CONC) {
    const lote = contas.slice(i, i + CONC);
    await Promise.all(lote.map(async (c) => {
      try {
        const rows = await insightsConta(c.account_id);
        await ingestAccount(montaConta(c, rows));
        ok++; nomes.push(c.name);
      } catch (e) {
        falhas++;
      }
    }));
  }
  return { contas: ok, falhas, total: contas.length, nomes };
}
