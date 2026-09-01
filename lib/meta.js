/* =========================================================================
   Meta Ads — sincronização via Graph API usando um System User token.
   Para contas dentro do SEU Business Manager NÃO precisa de App Review:
   basta o token com permissão ads_read. Config vem do .env.
   ========================================================================= */

import { ingestBulk } from './accounts.js';

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

const iso = (d) => d.toISOString().slice(0, 10);
const ddmm = (yyyymmdd) => { const p = String(yyyymmdd).split('-'); return p.length === 3 ? p[2] + '/' + p[1] : String(yyyymmdd); };

/* Início da série (6 semanas atrás, numa segunda) e fim (domingo da semana
   anterior). A última semana da série é justamente a semana passada. */
function janelaSemanal(hoje = new Date()) {
  const dow = (hoje.getDay() + 6) % 7; // 0 = segunda
  const thisMon = new Date(hoje); thisMon.setDate(hoje.getDate() - dow); thisMon.setHours(0, 0, 0, 0);
  const prevSun = new Date(thisMon); prevSun.setDate(thisMon.getDate() - 1);
  const serieStart = new Date(thisMon); serieStart.setDate(thisMon.getDate() - 6 * 7);
  return { serieStart, prevSun };
}

/* UMA chamada por conta: buckets semanais (7 dias) das últimas 6 semanas.
   A última linha é a SEMANA ANTERIOR; a série sai de todas as linhas. */
async function insightsConta(accountId) {
  const { serieStart, prevSun } = janelaSemanal();
  const j = await graph('act_' + accountId + '/insights', {
    fields: 'spend,clicks,cpc,impressions,actions',
    time_increment: '7',
    time_range: JSON.stringify({ since: iso(serieStart), until: iso(prevSun) }),
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
    periodo: 'Semana passada',
    metricas: {
      conversoes,
      cliques: parseFloat(atual.clicks) || 0,
      custo,
      cpcMedio: parseFloat(atual.cpc) || 0,
      custoPorConversao: conversoes ? custo / conversoes : 0,
      impressoes: parseFloat(atual.impressions) || 0,
    },
    serie: {
      labels: rows.map((r) => ddmm(r.date_start)),
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
  const coletadas = [];
  let falhas = 0;
  // Busca os insights em paralelo (rápido); a gravação é uma só, no final.
  for (let i = 0; i < contas.length; i += CONC) {
    const lote = contas.slice(i, i + CONC);
    await Promise.all(lote.map(async (c) => {
      try {
        const rows = await insightsConta(c.account_id);
        coletadas.push(montaConta(c, rows));
      } catch (e) {
        falhas++;
      }
    }));
  }
  await ingestBulk(coletadas);
  return { contas: coletadas.length, falhas, total: contas.length, nomes: coletadas.map((x) => x.contaNome) };
}
