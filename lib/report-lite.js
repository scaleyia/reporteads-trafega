/* =========================================================================
   Relatório enxuto — resumo de um cliente a partir das contas de anúncio
   vinculadas (soma das métricas + gráfico mensal). Gera o HTML que vira PDF.
   ========================================================================= */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const logoB64 = (() => {
  try { return fs.readFileSync(path.join(HERE, '..', 'assets', 'logo_b64.txt'), 'utf-8').trim(); }
  catch { return ''; }
})();

const MESNOME = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
const brl = (n) => 'R$ ' + (Number(n) || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const num = (n) => (Number(n) || 0).toLocaleString('pt-BR', { maximumFractionDigits: 0 });

/* Soma as contas vinculadas do cliente num único resumo. */
export function montaResumoCliente(cliente, accounts) {
  const ids = new Set((cliente.contas || []).map((x) => x.id || x));
  const contas = accounts.filter((a) => ids.has(a.id));

  const tot = { conversoes: 0, cliques: 0, custo: 0, impressoes: 0 };
  const serieMap = new Map(); // label -> soma de conversões
  const ordemLabels = [];
  for (const a of contas) {
    tot.conversoes += a.metricas.conversoes || 0;
    tot.cliques += a.metricas.cliques || 0;
    tot.custo += a.metricas.custo || 0;
    tot.impressoes += a.metricas.impressoes || 0;
    const s = a.serie || { labels: [], valores: [] };
    s.labels.forEach((lb, i) => {
      if (!serieMap.has(lb)) { serieMap.set(lb, 0); ordemLabels.push(lb); }
      serieMap.set(lb, serieMap.get(lb) + (s.valores[i] || 0));
    });
  }
  const hoje = new Date();
  return {
    cliente: cliente.nome,
    contas: contas.map((c) => c.nome),
    plataformas: [...new Set(contas.map((c) => c.plataforma))],
    periodo: MESNOME[hoje.getMonth()] + ' de ' + hoje.getFullYear(),
    gestor: cliente.gestor || '',
    gerado: hoje.toLocaleDateString('pt-BR'),
    metricas: {
      conversoes: tot.conversoes,
      cliques: tot.cliques,
      custo: tot.custo,
      impressoes: tot.impressoes,
      cpcMedio: tot.cliques ? tot.custo / tot.cliques : 0,
      custoPorConversao: tot.conversoes ? tot.custo / tot.conversoes : 0,
    },
    serie: { labels: ordemLabels, valores: ordemLabels.map((lb) => serieMap.get(lb)) },
    semContas: contas.length === 0,
  };
}

const MESCURTO = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
const cap = (s) => s ? s.charAt(0).toUpperCase() + s.slice(1) : s;
const int = (n) => (Number(n) || 0).toLocaleString('pt-BR', { maximumFractionDigits: 0 });
const dec = (n) => (Number(n) || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

/* Monta o cfg do relatório OFICIAL (lib/report.js buildHtml) com dados reais. */
export function montaCfgCliente(cliente, accounts) {
  const r = montaResumoCliente(cliente, accounts);
  const hoje = new Date();
  const mm = String(hoje.getMonth() + 1).padStart(2, '0');
  const ini = '01/' + mm + '/' + hoje.getFullYear();
  const fim = String(hoje.getDate()).padStart(2, '0') + '/' + mm + '/' + hoje.getFullYear();
  const canal = r.plataformas.length >= 2 ? 'Google + Meta' : (r.plataformas[0] === 'meta' ? 'Meta Ads' : 'Google Ads');

  // Gráfico precisa de >= 2 pontos; se faltar histórico, preenche com zeros.
  let labels = r.serie.labels.map(cap);
  let valores = r.serie.valores.slice();
  if (valores.length < 2) {
    labels = []; valores = [];
    for (let i = 2; i >= 0; i--) { labels.push(cap(MESCURTO[new Date(hoje.getFullYear(), hoje.getMonth() - i, 1).getMonth()])); valores.push(0); }
  }

  return {
    cliente: r.cliente,
    mes: MESNOME[hoje.getMonth()],
    ano: String(hoje.getFullYear()),
    periodo: ini + ' a ' + fim,
    gestor: cliente.gestor || 'Tráfega',
    gerado_em: r.gerado,
    canal,
    metricas: [
      { label: 'Conversões', value: int(r.metricas.conversoes), cur: false, sub: '' },
      { label: 'Cliques', value: int(r.metricas.cliques), cur: false, sub: '' },
      { label: 'Custo / conv.', value: dec(r.metricas.custoPorConversao), cur: true, sub: '' },
      { label: 'CPC médio', value: dec(r.metricas.cpcMedio), cur: true, sub: '' },
      { label: 'Custo', value: dec(r.metricas.custo), cur: true, sub: '' },
    ],
    grafico: { subtitulo: 'Conversões por mês', labels, valores },
    leilao: [],
    passos: [],
    semContas: r.semContas,
  };
}

function barras(serie) {
  const vals = serie.valores || [];
  if (!vals.length) return '<p class="muted">Sem histórico suficiente para o gráfico.</p>';
  const max = Math.max(...vals, 1);
  return '<div class="chart">' + vals.map((v, i) =>
    '<div class="bar-wrap"><div class="bar" style="height:' + Math.max(4, Math.round((v / max) * 120)) + 'px"></div>' +
    '<span class="bv">' + num(v) + '</span><span class="bl">' + (serie.labels[i] || '') + '</span></div>'
  ).join('') + '</div>';
}

export function buildResumoHtml(r) {
  const cards = [
    { l: 'Conversões', v: num(r.metricas.conversoes) },
    { l: 'Cliques', v: num(r.metricas.cliques) },
    { l: 'Investimento', v: brl(r.metricas.custo) },
    { l: 'Custo / conversão', v: brl(r.metricas.custoPorConversao) },
    { l: 'CPC médio', v: brl(r.metricas.cpcMedio) },
  ];
  return `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><style>
    *{box-sizing:border-box;margin:0;padding:0}
    body{font-family:-apple-system,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;color:#14201a}
    .page{padding:44px 46px}
    .top{background:linear-gradient(120deg,#0a5f11,#15ac20);border-radius:16px;color:#fff;padding:26px 30px;margin-bottom:22px}
    .top img{height:24px;filter:brightness(0) invert(1);margin-bottom:14px}
    .top h1{font-size:24px;letter-spacing:-.4px}
    .top .sub{color:#e6ffe9;font-size:13px;margin-top:3px}
    .meta{display:flex;gap:18px;flex-wrap:wrap;font-size:12px;color:#5b6472;margin-bottom:18px}
    .meta b{color:#14201a}
    .grid{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-bottom:24px}
    .kpi{border:1px solid #e6eae1;border-radius:12px;padding:15px 16px}
    .kpi .l{font-size:11px;color:#7e867d;text-transform:uppercase;letter-spacing:.04em}
    .kpi .v{font-size:22px;font-weight:800;margin-top:5px;letter-spacing:-.5px}
    h2{font-size:14px;margin:0 0 12px;padding-bottom:6px;border-bottom:2px solid #0c8614;color:#0c8614}
    .chart{display:flex;align-items:flex-end;gap:16px;height:170px;padding:10px 4px}
    .bar-wrap{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:flex-end;gap:5px}
    .bar{width:70%;max-width:54px;background:linear-gradient(180deg,#15ac20,#0c8614);border-radius:6px 6px 0 0}
    .bv{font-size:11px;font-weight:700}
    .bl{font-size:11px;color:#7e867d;text-transform:capitalize}
    .muted{color:#7e867d;font-size:12px}
    .foot{margin-top:26px;font-size:10.5px;color:#9aa29a}
    .chips{margin-top:6px}
    .chip{display:inline-block;font-size:10.5px;background:#eafce9;color:#0c8614;border:1px solid #cfe9d2;border-radius:999px;padding:2px 9px;margin:2px 4px 2px 0}
  </style></head><body><div class="page">
    <div class="top">${logoB64 ? '<img src="data:image/png;base64,' + logoB64 + '">' : ''}
      <h1>Relatório de Desempenho</h1>
      <div class="sub">${r.cliente} · ${r.periodo}</div>
    </div>
    <div class="meta"><span>Cliente: <b>${r.cliente}</b></span>${r.gestor ? '<span>Gestor: <b>' + r.gestor + '</b></span>' : ''}<span>Plataformas: <b>${r.plataformas.map((p) => p === 'google' ? 'Google Ads' : 'Meta Ads').join(', ') || '—'}</b></span><span>Gerado em: <b>${r.gerado}</b></span></div>
    <div class="grid">${cards.map((c) => '<div class="kpi"><div class="l">' + c.l + '</div><div class="v">' + c.v + '</div></div>').join('')}</div>
    <h2>Conversões por mês</h2>
    ${barras(r.serie)}
    <div class="chips">Contas: ${r.contas.map((c) => '<span class="chip">' + c + '</span>').join('') || '<span class="muted">nenhuma</span>'}</div>
    <div class="foot">Relatório gerado automaticamente pela Tráfega. Dados agregados das contas de anúncio vinculadas ao cliente.</div>
  </div></body></html>`;
}
