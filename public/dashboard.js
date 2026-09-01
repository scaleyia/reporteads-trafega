/* =========================================================================
   Tráfega — Painel de Relatórios (front-end)
   SPA vanilla com roteamento por hash. Dados mock nas áreas ainda sem back-end;
   a seção OpenAI (Configurações) já conversa com a API real (/api/settings).
   ========================================================================= */

/* ------------------------------- Ícones -------------------------------- */
const I = {
  plug:    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M12 22v-5M9 8V2M15 8V2M18 8v4a6 6 0 0 1-12 0V8z"/></svg>',
  send:    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="m22 2-7 20-4-9-9-4z"/><path d="M22 2 11 13"/></svg>',
  clock:   '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>',
  check:   '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M20 6 9 17l-5-5"/></svg>',
  wa:      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M21 11.5a8.4 8.4 0 0 1-12.3 7.4L3 21l2.2-5.6A8.4 8.4 0 1 1 21 11.5z"/></svg>',
  file:    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/></svg>',
  eye:     '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z"/><circle cx="12" cy="12" r="3"/></svg>',
  refresh: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M3 12a9 9 0 0 1 15-6.7L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-15 6.7L3 16"/><path d="M3 21v-5h5"/></svg>',
  plus:    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M12 5v14M5 12h14"/></svg>',
  trash:   '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M3 6h18M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6M10 11v6M14 11v6M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>',
  edit:    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.1 2.1 0 0 1 3 3L12 15l-4 1 1-4z"/></svg>',
  money:   '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>',
  users:   '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>',
  chart:   '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M3 3v18h18"/><path d="M7 14l4-4 3 3 5-6"/></svg>',
  bolt:    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M13 2 3 14h7l-1 8 10-12h-7z"/></svg>',
  alert:   '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/><path d="M12 9v4M12 17h.01"/></svg>',
  info:    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg>',
  x:       '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M18 6 6 18M6 6l12 12"/></svg>',
  link:    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M10 13a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-1.5 1.5"/><path d="M14 11a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l1.5-1.5"/></svg>',
  key:     '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="7.5" cy="15.5" r="5.5"/><path d="m21 2-9.6 9.6M15.5 7.5l3 3L22 7l-3-3"/></svg>',
  power:   '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M18.4 6.6a9 9 0 1 1-12.8 0M12 2v10"/></svg>',
  aup:     '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M12 19V5M5 12l7-7 7 7"/></svg>',
  adown:   '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M12 5v14M19 12l-7 7-7-7"/></svg>',
  back:    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>',
  download:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>',
  play:    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><polygon points="6 3 20 12 6 21 6 3"/></svg>',
};

/* delta pill: {v:'+8,9%', up:true} */
function delta(txt, up) {
  return '<span class="delta-pill ' + (up ? 'up' : 'down') + '">' + (up ? I.aup : I.adown) + txt + '</span>';
}

/* Marcas oficiais (OAuth) */
const GOOGLE_G = '<svg viewBox="0 0 24 24"><path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.6v3h3.9c2.3-2.1 3.6-5.2 3.6-8.8z"/><path fill="#34A853" d="M12 24c3.2 0 6-1.1 8-3l-3.9-3c-1.1.7-2.5 1.2-4.1 1.2-3.1 0-5.8-2.1-6.7-5H1.3v3.1C3.3 21.3 7.3 24 12 24z"/><path fill="#FBBC05" d="M5.3 14.3c-.2-.7-.4-1.5-.4-2.3s.1-1.6.4-2.3V6.6H1.3C.5 8.2 0 10 0 12s.5 3.8 1.3 5.4l4-3.1z"/><path fill="#EA4335" d="M12 4.8c1.8 0 3.3.6 4.6 1.8l3.4-3.4C18 1.2 15.2 0 12 0 7.3 0 3.3 2.7 1.3 6.6l4 3.1C6.2 6.9 8.9 4.8 12 4.8z"/></svg>';
const FB_F = '<svg viewBox="0 0 24 24" fill="#fff"><path d="M24 12c0-6.6-5.4-12-12-12S0 5.4 0 12c0 6 4.4 11 10.1 11.9v-8.4H7.1V12h3V9.4c0-3 1.8-4.6 4.5-4.6 1.3 0 2.7.2 2.7.2v2.9h-1.5c-1.5 0-2 .9-2 1.9V12h3.3l-.5 3.5h-2.8v8.4C19.6 23 24 18 24 12z"/></svg>';

/* Ícones oficiais das plataformas (para os badges) */
const GADS = '<svg viewBox="0 0 24 24"><path d="M2.9 15 8.7 5c.6-1.1 2-1.4 3.1-.8s1.4 2 .8 3.1L6.8 17.3c-.6 1.1-2 1.4-3.1.8s-1.4-2-.8-3.1z" fill="#FBBC04"/><path d="M21.1 15 15.3 5c-.6-1.1-2-1.4-3.1-.8s-1.4 2-.8 3.1l5.8 10c.6 1.1 2 1.4 3.1.8s1.4-2 .8-3.1z" fill="#4285F4"/><circle cx="5" cy="16.8" r="2.45" fill="#34A853"/></svg>';
const META = '<svg viewBox="0 0 24 24" fill="#0866FF"><path d="M6.915 4.03c-1.968 0-3.683 1.28-4.871 3.113C.704 9.208 0 11.883 0 14.449c0 .706.07 1.369.21 1.973a6.624 6.624 0 0 0 .636 1.621c.696 1.159 1.818 1.927 3.593 1.927 1.497 0 2.633-.671 3.965-2.444.76-1.012 1.144-1.626 2.663-4.32l.756-1.339.186-.325c.061.1.121.196.183.3l2.152 3.595c.724 1.21 1.665 2.556 2.47 3.314 1.046.987 1.992 1.22 3.06 1.22 1.075 0 1.876-.355 2.455-.843a3.743 3.743 0 0 0 .81-.973c.542-.939.861-2.127.861-3.745 0-2.72-.681-5.357-2.084-7.45-1.282-1.912-2.957-2.93-4.716-2.93-1.047 0-2.088.467-3.053 1.308-.652.57-1.257 1.29-1.82 2.05-.69-.875-1.335-1.547-1.958-2.056-1.182-.966-2.315-1.303-3.454-1.303zm10.16 2.053c1.147 0 2.188.758 2.992 1.999 1.132 1.748 1.647 4.195 1.647 6.4 0 1.548-.368 2.9-1.839 2.9-.58 0-1.027-.23-1.664-1.004-.496-.601-1.343-1.878-2.832-4.358l-.617-1.028a44.908 44.908 0 0 0-1.255-1.98c.07-.109.141-.224.211-.327 1.12-1.667 2.118-2.602 3.157-2.602zm-10.201.553c1.265 0 2.058.791 2.675 1.446.307.327.737.871 1.234 1.579l-1.02 1.566c-.757 1.163-1.882 3.017-2.837 4.338-1.191 1.649-1.81 1.817-2.486 1.817-.524 0-1.038-.237-1.383-.794-.263-.426-.464-1.13-.464-2.046 0-2.221.63-4.535 1.66-6.088.454-.687.964-1.226 1.533-1.533a2.264 2.264 0 0 1 1.087-.281z"/></svg>';

function oauthCard(cls, nome, desc, note, btnHtml) {
  const bg = { google: '#1a73e8', meta: '#0866ff' }[cls];
  const card = el('<div class="card" style="margin-bottom:16px"></div>');
  card.appendChild(el(
    '<div class="card-head"><div class="plat-badge">' + (cls === 'google' ? GADS : META) + '</div>' +
    '<div><h3>' + nome + '</h3><span class="sub">' + desc + '</span></div>' +
    '<div class="actions"><span class="pill warn"><span class="dot"></span>Não conectado</span></div></div>'
  ));
  const body = el('<div class="card-pad"></div>');
  body.appendChild(el('<p class="oauth-note">' + note + '</p>'));
  const btn = el(btnHtml);
  btn.onclick = () => toast('Botão pronto! A conexão real liga quando o token/app estiver aprovado.');
  body.appendChild(btn);
  card.appendChild(body);
  return card;
}

/* ------------------------------- Dados --------------------------------- */
/* Sem dados mockados. As listas ficam vazias até as integrações reais
   preencherem. SAMPLE_REPORT alimenta apenas a tela de "modelo de relatório". */
const DATA = { contas: [], clientes: [], relatorios: [] };
const SAMPLE_REPORT = { cliente: 'Cliente exemplo', periodo: 'Ago/2026', plat: 'google' };

/* ------------------------------- Helpers ------------------------------- */
const $ = (s, r = document) => r.querySelector(s);
const el = (html) => { const t = document.createElement('template'); t.innerHTML = html.trim(); return t.content.firstElementChild; };
const initials = (n) => n.split(' ').filter(Boolean).slice(0, 2).map((w) => w[0]).join('').toUpperCase();

function toast(msg) {
  const t = $('#toast');
  t.innerHTML = I.check + '<span>' + msg + '</span>';
  t.classList.add('show');
  clearTimeout(toast._t);
  toast._t = setTimeout(() => t.classList.remove('show'), 3200);
}

function emptyState(icon, title, desc, actionHtml) {
  return '<div class="empty"><div class="ico">' + icon + '</div><h4>' + title + '</h4><p>' + desc + '</p>' + (actionHtml || '') + '</div>';
}

function platTag(plat) {
  return plat === 'google'
    ? '<span class="tag-plat"><span class="glyph google">' + GADS + '</span>Google Ads</span>'
    : '<span class="tag-plat"><span class="glyph meta">' + META + '</span>Meta Ads</span>';
}

function openModal(title, bodyHtml, footHtml) {
  const m = $('#modal');
  m.innerHTML =
    '<div class="modal-head"><h3>' + title + '</h3>' +
    '<button class="icon-btn close" id="modalClose">' + I.x + '</button></div>' +
    '<div class="modal-body">' + bodyHtml + '</div>' +
    (footHtml ? '<div class="modal-foot">' + footHtml + '</div>' : '');
  $('#modalScrim').classList.add('open');
  $('#modalClose').onclick = closeModal;
}
function closeModal() { $('#modalScrim').classList.remove('open'); }
$('#modalScrim').addEventListener('click', (e) => { if (e.target.id === 'modalScrim') closeModal(); });

/* ------------------------------- Rotas --------------------------------- */
const ROUTES = {
  painel:       { title: 'Painel',            crumb: 'Visão geral',                       render: renderPainel },
  relatorios:   { title: 'Relatórios',        crumb: 'Histórico e geração',               render: renderRelatorios },
  agendamentos: { title: 'Agendamentos',      crumb: 'Disparos automáticos',              render: renderAgendamentos },
  conexao:      { title: 'Conexão',           crumb: 'WhatsApp via Evolution',            render: renderConexao },
  contas:       { title: 'Contas de anúncio', crumb: 'Google Ads e Meta',                 render: renderContas },
  clientes:     { title: 'Clientes',          crumb: 'Destinatários e vínculos',          render: renderClientes },
  config:       { title: 'Configurações',     crumb: 'Credenciais e integrações',         render: renderConfig },
  relatorio:    { title: 'Relatório',         crumb: 'Prévia do envio',                   render: renderReportDetail, parent: 'relatorios' },
};

let selectedReport = SAMPLE_REPORT;

function navigate() {
  const route = (location.hash.replace('#/', '') || 'painel');
  const def = ROUTES[route] || ROUTES.painel;
  document.title = 'Tráfega · ' + def.title;
  const activeRoute = def.parent || (ROUTES[route] ? route : 'painel');
  document.querySelectorAll('.nav-item').forEach((b) => b.classList.toggle('active', b.dataset.route === activeRoute));
  stopWaPoll();
  const view = $('#view');
  view.innerHTML = '';
  def.render(view);
  view.scrollTo?.(0, 0);
  document.querySelector('.content').scrollTop = 0;
  closeMobileNav();
}

/* ============================== PÁGINAS ================================= */

/* ---- Painel ---- */
function proximaDate(s, hora) {
  const now = new Date();
  const [h, m] = (hora || '08:00').split(':').map(Number);
  const d = new Date(now); d.setHours(h, m, 0, 0);
  if (s.frequencia === 'diaria') { if (d <= now) d.setDate(d.getDate() + 1); }
  else if (s.frequencia === 'semanal') {
    let add = ((Number(s.diaSemana) - d.getDay()) + 7) % 7;
    if (add === 0 && d <= now) add = 7;
    d.setDate(d.getDate() + add);
  } else {
    d.setDate(Number(s.diaMes) || 1);
    if (d <= now) d.setMonth(d.getMonth() + 1);
  }
  return d;
}

function renderPainel(v) {
  v.appendChild(el(
    '<div class="hero"><span class="hero-glow a"></span><span class="hero-glow b"></span>' +
    '<div class="hero-txt"><h2>Bem-vindo de volta, Tráfega</h2>' +
    '<p>Aqui está o resumo da sua operação de relatórios automáticos no WhatsApp.</p></div></div>'
  ));
  const bannerSlot = el('<div></div>'); v.appendChild(bannerSlot);

  const grid = el('<div class="grid kpi-grid"></div>'); v.appendChild(grid);
  const row = el('<div class="grid" style="margin-top:16px"></div>');
  const feed = el('<div class="card"><div class="card-head"><h3>Atividade recente</h3><div class="actions"><a class="btn btn-ghost btn-sm" href="#/agendamentos">Ver todos</a></div></div><div class="feed"></div></div>');
  row.appendChild(feed); v.appendChild(row);
  const integ = el('<div class="card" style="margin-top:16px"><div class="card-head"><h3>Integrações</h3></div><div class="grid" style="grid-template-columns:repeat(4,1fr);gap:0"></div></div>');
  v.appendChild(integ);

  function kpiCard(ico, cls, label, value, foot) {
    return '<div class="kpi"><div class="top"><div class="ico ' + cls + '">' + ico + '</div></div>' +
      '<div class="label">' + label + '</div><div class="value tnum">' + value + '</div>' +
      '<div class="delta flat">' + foot + '</div></div>';
  }
  function runPill(st) {
    if (st === 'enviado' || st === 'ok') return '<span class="pill ok"><span class="dot"></span>Enviado</span>';
    if (st === 'parcial') return '<span class="pill warn"><span class="dot"></span>Parcial</span>';
    if (st === 'pendente') return '<span class="pill warn"><span class="dot"></span>Pendente</span>';
    return '<span class="pill err"><span class="dot"></span>Falha</span>';
  }
  function integCard(cls, glyph, nome, ok, txt, first) {
    return '<div class="integration"' + (first ? ' style="border-right:1px solid var(--line-2)"' : '') + '>' +
      '<div class="logo ' + cls + '">' + glyph + '</div>' +
      '<div class="info"><b>' + nome + '</b><p>' + txt + '</p></div>' +
      '<span class="pill ' + (ok ? 'ok' : 'warn') + '"><span class="dot"></span>' + (ok ? 'Conectado' : 'Pendente') + '</span></div>';
  }

  Promise.all([
    fetch('/api/accounts').then((r) => r.json()).catch(() => []),
    fetch('/api/clients').then((r) => r.json()).catch(() => []),
    fetch('/api/schedules').then((r) => r.json()).catch(() => []),
    fetch('/api/schedules/runs').then((r) => r.json()).catch(() => []),
    fetch('/api/schedules/config').then((r) => r.json()).catch(() => ({ hora: '08:00' })),
    fetch('/api/whatsapp/status').then((r) => r.json()).catch(() => ({ state: 'none' })),
    fetch('/api/integrations').then((r) => r.json()).catch(() => ({})),
    fetch('/api/settings').then((r) => r.json()).catch(() => ({})),
  ]).then(([accounts, clients, schedules, runs, cfg, wa, integs, settings]) => {
    accounts = Array.isArray(accounts) ? accounts : [];
    clients = Array.isArray(clients) ? clients : [];
    schedules = Array.isArray(schedules) ? schedules : [];
    runs = Array.isArray(runs) ? runs : [];
    const nG = accounts.filter((a) => a.plataforma === 'google').length;
    const nM = accounts.filter((a) => a.plataforma === 'meta').length;
    const ativos = schedules.filter((s) => s.ativo !== false);
    const enviados = runs.filter((r) => r.status === 'enviado' || r.status === 'ok').length;
    const waOk = wa.state === 'open';

    // Banner: só aparece se ainda falta configurar algo essencial.
    if (!accounts.length || !waOk) {
      bannerSlot.appendChild(el('<div class="banner">' + I.info +
        '<div><b>Falta pouco.</b> ' +
        (!accounts.length ? 'Rode o script do Google / sincronize o Meta em <a href="#/contas" style="text-decoration:underline;font-weight:700">Contas de anúncio</a>. ' : '') +
        (!waOk ? 'Conecte o WhatsApp em <a href="#/conexao" style="text-decoration:underline;font-weight:700">Conexão</a>.' : '') +
        '</div></div>'));
    } else {
      bannerSlot.appendChild(el('<div class="banner" style="background:var(--ok-bg);border-color:#cfe9d2;color:var(--ok)">' + I.check +
        '<div><b>Tudo pronto!</b> Contas conectadas, WhatsApp ativo. Crie agendamentos em <a href="#/agendamentos" style="text-decoration:underline;font-weight:700">Agendamentos</a>.</div></div>'));
    }

    // Próximo disparo
    let proxTxt = '—', proxFoot = 'Nenhum agendamento ativo';
    if (ativos.length) {
      const next = ativos.map((s) => proximaDate(s, cfg.hora)).sort((a, b) => a - b)[0];
      proxTxt = next.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
      proxFoot = (cfg.hora || '08:00') + ' · ' + ativos.length + ' agendamento(s)';
    }

    grid.innerHTML =
      kpiCard(I.plug, '', 'Contas conectadas', String(accounts.length), accounts.length ? nG + ' Google · ' + nM + ' Meta' : 'Nenhuma conta ainda') +
      kpiCard(I.users, 'blue', 'Clientes', String(clients.length), clients.length ? clients.filter((c) => c.ativo !== false).length + ' ativos' : 'Nenhum cadastrado') +
      kpiCard(I.clock, 'amber', 'Próximo disparo', proxTxt, proxFoot) +
      kpiCard(I.wa, 'slate', 'WhatsApp', waOk ? 'Ativo' : 'Off', waOk ? (wa.profile?.nome || 'Conectado') : 'Desconectado');

    // Atividade recente
    const feedEl = $('.feed', feed);
    if (!runs.length) {
      feedEl.appendChild(el(emptyState(I.clock, 'Nenhuma atividade ainda', 'Os disparos aparecem aqui assim que os relatórios começarem a ser enviados.')));
    } else {
      runs.slice(0, 6).forEach((r) => {
        const quando = new Date(r.data).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
        const nc = Array.isArray(r.clientes) ? r.clientes.length : 0;
        feedEl.appendChild(el('<div class="integration" style="border-bottom:1px solid var(--line-2)"><div class="logo wa">' + waMini() + '</div>' +
          '<div class="info"><b>' + r.nome + '</b><p>' + quando + ' · ' + nc + ' cliente(s)</p></div>' + runPill(r.status) + '</div>'));
      });
    }

    // Integrações reais
    const gGlyph = GADS, mGlyph = META;
    $('.grid', integ).innerHTML =
      integCard('google', gGlyph, 'Google Ads', nG > 0, nG > 0 ? nG + ' contas' : 'Rode o script', true) +
      integCard('meta', mGlyph, 'Meta Ads', integs.metaConfigured, integs.metaConfigured ? nM + ' contas' : 'Sem token', true) +
      integCard('wa', waMini(), 'WhatsApp', waOk, waOk ? (wa.profile?.numero ? '+' + wa.profile.numero : 'Conectado') : 'Desconectado', true) +
      integCard('ai', aiMini(), 'OpenAI', !!settings.hasKey, settings.hasKey ? (settings.model || 'configurada') : 'Sem chave', false);
  });
}

/* ---- Relatórios ---- */
function renderRelatorios(v) {
  const head = el(
    '<div class="page-head"><div class="titles"><h2>Relatórios</h2><p>Histórico de relatórios gerados e enviados no WhatsApp.</p></div>' +
    '<div class="actions"><button class="btn btn-ghost btn-sm" id="rfRefresh">' + I.refresh + 'Atualizar</button>' +
    '<button class="btn btn-primary" id="rfNew">' + I.plus + 'Gerar relatório</button></div></div>'
  );
  v.appendChild(head);

  if (!DATA.relatorios.length) {
    const card = el('<div class="card"></div>');
    card.appendChild(el(emptyState(I.file, 'Nenhum relatório ainda',
      'Os relatórios gerados aparecem aqui, com o status de entrega no WhatsApp. Conecte suas contas para começar.',
      '<button class="btn btn-ghost btn-sm" id="rfSample">' + I.eye + 'Ver modelo de relatório</button>')));
    v.appendChild(card);
    $('#rfSample').onclick = () => { selectedReport = SAMPLE_REPORT; location.hash = '#/relatorio'; };
  } else {
    const card = el('<div class="card"><div class="table-wrap"><table class="data"><thead><tr>' +
      '<th>Cliente</th><th>Período</th><th>Plataforma</th><th>Gerado em</th><th>WhatsApp</th><th></th>' +
      '</tr></thead><tbody></tbody></table></div></div>');
    const tb = $('tbody', card);
    DATA.relatorios.forEach((r) => {
      const envio = r.envio === 'ok'
        ? '<span class="pill ok"><span class="dot"></span>Entregue</span>'
        : '<span class="pill err"><span class="dot"></span>Falha</span>';
      tb.appendChild(el(
        '<tr><td><div class="cell-lead"><span class="avatar-sm">' + initials(r.cliente) + '</span><span class="strong">' + r.cliente + '</span></div></td>' +
        '<td class="muted">' + r.periodo + '</td><td>' + platTag(r.plat) + '</td><td class="muted tnum">' + r.gerado + '</td>' +
        '<td>' + envio + '</td>' +
        '<td><div class="row-actions"><button class="icon-btn" data-view title="Ver relatório">' + I.eye + '</button>' +
        '<button class="icon-btn" data-send title="Reenviar no WhatsApp">' + I.send + '</button></div></td></tr>'
      ));
      $('[data-view]', tb.lastElementChild).onclick = () => { selectedReport = r; location.hash = '#/relatorio'; };
      $('[data-send]', tb.lastElementChild).onclick = () => toast('Reenvio disponível quando o WhatsApp estiver conectado.');
    });
    v.appendChild(card);
  }

  $('#rfRefresh').onclick = () => toast('Lista atualizada.');
  $('#rfNew').onclick = openGerarModal;
}

function openGerarModal() {
  openModal('Gerar relatório',
    '<div class="form-grid">' +
    '<div class="field full"><label>Cliente / conta</label><select class="select"><option>Selecione…</option>' +
    DATA.clientes.map((c) => '<option>' + c.nome + '</option>').join('') + '</select><span class="hint">A lista virá das contas conectadas ao Google/Meta.</span></div>' +
    '<div class="field"><label>Mês</label><select class="select"><option>Agosto</option><option>Julho</option><option>Junho</option></select></div>' +
    '<div class="field"><label>Ano</label><select class="select"><option>2026</option><option>2025</option></select></div>' +
    '<div class="field full"><label>Formato de entrega</label>' +
    '<div style="display:flex;gap:14px;margin-top:4px"><label style="display:flex;gap:7px;align-items:center;font-weight:500;font-size:13px"><input type="checkbox" checked> Texto no WhatsApp</label>' +
    '<label style="display:flex;gap:7px;align-items:center;font-weight:500;font-size:13px"><input type="checkbox" checked> PDF anexado</label></div></div>' +
    '</div>',
    '<button class="btn btn-ghost" onclick="document.getElementById(\'modalScrim\').classList.remove(\'open\')">Cancelar</button>' +
    '<button class="btn btn-primary" id="doGerar">' + I.bolt + 'Gerar e enviar</button>'
  );
  $('#doGerar').onclick = () => { closeModal(); toast('Geração automática entra no ar quando as APIs estiverem conectadas.'); };
}

/* ---- Agendamentos ---- */
const DIAS_SEMANA = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];

function freqResumo(s) {
  if (s.frequencia === 'diaria') return 'Todo dia';
  if (s.frequencia === 'semanal') return 'Toda ' + DIAS_SEMANA[Number(s.diaSemana) || 0].toLowerCase();
  return 'Todo dia ' + (Number(s.diaMes) || 1) + ' do mês';
}
function proximaExecucao(s, hora) {
  const now = new Date();
  const [h, m] = (hora || '08:00').split(':').map(Number);
  const d = new Date(now); d.setHours(h, m, 0, 0);
  if (s.frequencia === 'diaria') { if (d <= now) d.setDate(d.getDate() + 1); }
  else if (s.frequencia === 'semanal') {
    let add = ((Number(s.diaSemana) - d.getDay()) + 7) % 7;
    if (add === 0 && d <= now) add = 7;
    d.setDate(d.getDate() + add);
  } else {
    d.setDate(Number(s.diaMes) || 1);
    if (d <= now) d.setMonth(d.getMonth() + 1);
  }
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }) + ' · ' + (hora || '08:00');
}

function renderAgendamentos(v) {
  v.appendChild(el(
    '<div class="page-head"><div class="titles"><h2>Agendamentos</h2><p>Defina quando os relatórios são gerados e disparados automaticamente.</p></div>' +
    '<div class="actions"><button class="btn btn-ghost btn-sm" id="agRefresh">' + I.refresh + 'Atualizar</button>' +
    '<button class="btn btn-primary" id="agNew">' + I.plus + 'Novo agendamento</button></div></div>'
  ));

  v.appendChild(el('<div class="banner">' + I.check +
    '<div><b>Hospedado na Vercel.</b> Os disparos rodam sozinhos via <b>Vercel Cron</b> — não precisa de servidor sempre ligado. ' +
    'No plano grátis (Hobby) roda <b>1× por dia</b> no horário abaixo (com ~1h de imprecisão).</div></div>'));

  // Card de configuração do horário do disparo diário
  const cfgCard = el('<div class="card ag-cfg"></div>');
  v.appendChild(cfgCard);

  const listCard = el('<div class="card" id="agList" style="margin-top:16px"></div>');
  v.appendChild(listCard);

  const runsCard = el('<div class="card" id="agRuns" style="margin-top:16px"><div class="card-head"><h3>Últimas execuções</h3><span class="sub">registro dos disparos</span></div></div>');
  v.appendChild(runsCard);

  const openNew = () => openAgendamentoModal(load);
  $('#agNew').onclick = openNew;
  $('#agRefresh').onclick = () => { toast('Atualizando…'); load(); };

  let globalHora = '08:00';

  function load() {
    Promise.all([
      fetch('/api/schedules/config').then((r) => r.json()),
      fetch('/api/schedules').then((r) => r.json()),
      fetch('/api/schedules/runs').then((r) => r.json()),
    ]).then(([cfg, list, runs]) => {
      globalHora = (cfg && cfg.hora) || '08:00';
      renderCfg(globalHora);
      renderList(Array.isArray(list) ? list : []);
      renderRuns(Array.isArray(runs) ? runs : []);
    }).catch(() => { listCard.innerHTML = ''; listCard.appendChild(el(emptyState(I.alert, 'Falha ao carregar', 'Não deu para consultar os agendamentos.'))); });
  }

  function renderCfg(hora) {
    cfgCard.innerHTML = '';
    cfgCard.appendChild(el(
      '<div class="card-head"><div class="ag-cfg-ico">' + I.clock + '</div>' +
      '<div><h3>Horário do disparo diário</h3><span class="sub">quando os relatórios saem, todo dia</span></div>' +
      '<div class="actions"><input class="input ag-cfg-time" id="agHoraGlobal" type="time" value="' + hora + '">' +
      '<button class="btn btn-primary btn-sm" id="agHoraSalvar">' + I.check + 'Salvar</button></div></div>'
    ));
    cfgCard.appendChild(el(
      '<div class="card-pad ag-cfg-body"><p class="ag-cfg-note">' + I.info +
      '<span>É possível escolher <b>apenas um horário por dia</b>, válido para todos os agendamentos.</span>' +
      '</p></div>'
    ));
    $('#agHoraSalvar').onclick = () => {
      const nova = $('#agHoraGlobal').value || '08:00';
      fetch('/api/schedules/config', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ hora: nova }) })
        .then((r) => r.json()).then(() => { toast('Horário salvo.'); load(); })
        .catch(() => toast('Falha ao salvar o horário.'));
    };
  }

  function renderList(list) {
    listCard.innerHTML = '';
    if (!list.length) {
      listCard.appendChild(el(emptyState(I.clock, 'Nenhum agendamento criado',
        'Crie um agendamento para o sistema gerar e disparar os relatórios sozinho (ex.: todo dia 1º às 08:00).',
        '<button class="btn btn-primary btn-sm" id="agEmptyNew">' + I.plus + 'Novo agendamento</button>')));
      $('#agEmptyNew').onclick = openNew;
      return;
    }
    const wrap = el('<div class="table-wrap"><table class="data"><thead><tr>' +
      '<th>Nome</th><th>Quando</th><th>Clientes</th><th>Próxima</th><th>Ativo</th><th></th></tr></thead><tbody></tbody></table></div>');
    const tb = $('tbody', wrap);
    list.forEach((s) => {
      const clientes = s.clientes === 'todos'
        ? '<span class="pill mute">Todos os ativos</span>'
        : '<span class="pill mute">' + (s.clientes.length) + ' selecionado' + (s.clientes.length === 1 ? '' : 's') + '</span>';
      const tr = el(
        '<tr><td><div class="cell-lead"><span class="avatar-sm">' + I.clock + '</span><span class="strong">' + s.nome + '</span></div></td>' +
        '<td class="muted">' + freqResumo(s) + ' · ' + globalHora + '</td>' +
        '<td>' + clientes + '</td>' +
        '<td class="muted tnum">' + (s.ativo ? proximaExecucao(s, globalHora) : '—') + '</td>' +
        '<td><label class="switch"><input type="checkbox" ' + (s.ativo ? 'checked' : '') + '><span class="track"></span></label></td>' +
        '<td><div class="row-actions">' +
        '<button class="icon-btn" data-run title="Executar agora">' + I.play + '</button>' +
        '<button class="icon-btn" data-del title="Remover">' + I.trash + '</button></div></td></tr>'
      );
      $('.switch input', tr).onchange = (e) => {
        const ativo = e.target.checked;
        fetch('/api/schedules/' + s.id, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ativo }) })
          .then((r) => r.json()).then(() => { toast(ativo ? 'Agendamento ativado.' : 'Agendamento pausado.'); load(); })
          .catch(() => toast('Falha ao atualizar.'));
      };
      $('[data-run]', tr).onclick = () => {
        toast('Executando agora…');
        fetch('/api/schedules/' + s.id + '/run', { method: 'POST' })
          .then((r) => r.json()).then((res) => { toast('Disparo processado (' + res.ran + ').'); load(); })
          .catch(() => toast('Falha ao executar.'));
      };
      $('[data-del]', tr).onclick = () => {
        openModal('Remover agendamento',
          '<p style="font-size:14px;color:var(--ink-2)">Remover <b>' + s.nome + '</b>? Esta ação não pode ser desfeita.</p>',
          '<button class="btn btn-ghost" onclick="document.getElementById(\'modalScrim\').classList.remove(\'open\')">Cancelar</button>' +
          '<button class="btn btn-danger" id="agDelOk">' + I.trash + 'Remover</button>');
        $('#agDelOk').onclick = () => {
          closeModal();
          fetch('/api/schedules/' + s.id, { method: 'DELETE' })
            .then((r) => r.json()).then(() => { toast('Agendamento removido.'); load(); })
            .catch(() => toast('Falha ao remover.'));
        };
      };
      tb.appendChild(tr);
    });
    listCard.appendChild(wrap);
  }

  function renderRuns(runs) {
    const head = runsCard.querySelector('.card-head');
    runsCard.innerHTML = '';
    runsCard.appendChild(head);
    if (!runs.length) {
      runsCard.appendChild(el('<div class="card-pad" style="padding-top:0"><p class="muted" style="font-size:13px">Nenhum disparo ainda. Use <b>Executar agora</b> para testar ou aguarde o horário agendado.</p></div>'));
      return;
    }
    const wrap = el('<div class="table-wrap"><table class="data"><thead><tr><th>Quando</th><th>Agendamento</th><th>Clientes</th><th>Status</th></tr></thead><tbody></tbody></table></div>');
    const tb = $('tbody', wrap);
    runs.slice(0, 12).forEach((r) => {
      const quando = new Date(r.data).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
      const nc = Array.isArray(r.clientes) ? r.clientes.length : 0;
      const t = ' title="' + (r.motivo || '').replace(/"/g, '&quot;') + '"';
      const status = (r.status === 'enviado' || r.status === 'ok')
        ? '<span class="pill ok"' + t + '><span class="dot"></span>Enviado</span>'
        : r.status === 'parcial'
          ? '<span class="pill warn"' + t + '><span class="dot"></span>Parcial</span>'
          : r.status === 'pendente'
            ? '<span class="pill warn"' + t + '><span class="dot"></span>Pendente</span>'
            : '<span class="pill err"' + t + '><span class="dot"></span>Falha</span>';
      tb.appendChild(el('<tr><td class="muted tnum">' + quando + '</td><td class="strong">' + r.nome + '</td>' +
        '<td class="muted tnum">' + nc + '</td><td>' + status + '</td></tr>'));
    });
    runsCard.appendChild(wrap);
  }

  load();
}

function openAgendamentoModal(onSaved) {
  fetch('/api/clients').then((r) => r.json()).then((clientes) => {
    const opts = (Array.isArray(clientes) ? clientes : []).map((c) => '<option value="' + c.nome + '">' + c.nome + '</option>').join('');
    const semanaOpts = DIAS_SEMANA.map((d, i) => '<option value="' + i + '"' + (i === 1 ? ' selected' : '') + '>' + d + '</option>').join('');
    const mesOpts = Array.from({ length: 28 }, (_, i) => '<option value="' + (i + 1) + '">Dia ' + (i + 1) + '</option>').join('');

    openModal('Novo agendamento',
      '<div class="form-grid">' +
      '<div class="field full"><label>Nome <span class="req">*</span></label><input class="input" id="agNome" placeholder="Ex.: Fechamento mensal"></div>' +
      '<div class="field"><label>Frequência</label><select class="select" id="agFreq"><option value="mensal">Mensal</option><option value="semanal">Semanal</option><option value="diaria">Diária</option></select></div>' +
      '<div class="field" id="agDiaMesWrap"><label>Dia do mês</label><select class="select" id="agDiaMes">' + mesOpts + '</select></div>' +
      '<div class="field" id="agDiaSemWrap" style="display:none"><label>Dia da semana</label><select class="select" id="agDiaSem">' + semanaOpts + '</select></div>' +
      '<div class="field full"><label>Clientes</label><select class="select" id="agModo"><option value="todos">Todos os ativos</option><option value="manual">Selecionar manualmente</option></select></div>' +
      '<div class="field full" id="agClientesWrap" style="display:none"><label>Selecione os clientes</label><select class="select" id="agClientes" multiple size="4">' + opts + '</select>' +
      '<span class="hint">Segure Ctrl/Cmd para escolher vários.' + (opts ? '' : ' Nenhum cliente cadastrado ainda.') + '</span></div>' +
      '<div class="field full"><span class="hint">⏰ O horário do disparo é definido uma vez para todos, na própria página de Agendamentos.</span></div>' +
      '</div>',
      '<button class="btn btn-ghost" onclick="document.getElementById(\'modalScrim\').classList.remove(\'open\')">Cancelar</button>' +
      '<button class="btn btn-primary" id="agSalvar">' + I.check + 'Salvar agendamento</button>'
    );

    const freq = $('#agFreq');
    const syncFreq = () => {
      $('#agDiaMesWrap').style.display = freq.value === 'mensal' ? '' : 'none';
      $('#agDiaSemWrap').style.display = freq.value === 'semanal' ? '' : 'none';
    };
    freq.onchange = syncFreq; syncFreq();
    $('#agModo').onchange = (e) => { $('#agClientesWrap').style.display = e.target.value === 'manual' ? '' : 'none'; };

    $('#agSalvar').onclick = () => {
      const nome = $('#agNome').value.trim();
      if (!nome) return toast('Dê um nome ao agendamento.');
      const frequencia = freq.value;
      const modo = $('#agModo').value;
      const clientes = modo === 'manual'
        ? [...$('#agClientes').selectedOptions].map((o) => o.value)
        : 'todos';
      if (modo === 'manual' && !clientes.length) return toast('Escolha ao menos um cliente.');
      const body = {
        nome, frequencia, clientes,
        diaMes: Number($('#agDiaMes').value), diaSemana: Number($('#agDiaSem').value),
      };
      fetch('/api/schedules', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
        .then((r) => r.json().then((d) => ({ ok: r.ok, d })))
        .then(({ ok, d }) => { if (!ok) throw new Error(d.error || 'Falha'); closeModal(); toast('Agendamento criado.'); onSaved && onSaved(); })
        .catch((e) => toast(e.message || 'Falha ao salvar.'));
    };
  }).catch(() => toast('Falha ao carregar clientes.'));
}

/* ---- Conexão (WhatsApp · Evolution API) ---- */
let waPollTimer = null;
function stopWaPoll() { if (waPollTimer) { clearInterval(waPollTimer); waPollTimer = null; } }

function renderConexao(v) {
  stopWaPoll();

  v.appendChild(el(
    '<div class="page-head"><div class="titles"><h2>Conexão do WhatsApp</h2>' +
    '<p>Conecte um aparelho para o sistema enviar os relatórios pelo WhatsApp.</p></div>' +
    '<div class="actions"><button class="btn btn-ghost btn-sm" id="waRefresh">' + I.refresh + 'Atualizar</button></div></div>'
  ));

  const card = el(
    '<div class="card wa-card"><div class="card-head">' +
    '<div class="wa-badge">' + waMini() + '</div>' +
    '<div><h3>WhatsApp</h3><span class="sub">Aparelho que dispara os relatórios</span></div>' +
    '<div class="actions"><span class="pill mute" id="waPill"><span class="dot"></span>Verificando…</span></div></div>' +
    '<div class="wa-body" id="waBody"><div class="wa-loading">' + I.refresh + '<span>Verificando conexão…</span></div></div></div>'
  );
  v.appendChild(card);

  const body = $('#waBody', card);
  const pill = $('#waPill', card);

  const setPill = (cls, txt) => { pill.className = 'pill ' + cls; pill.innerHTML = '<span class="dot"></span>' + txt; };

  /* ---- Estado: desconectado (oferece conectar) ---- */
  function showDisconnected() {
    setPill('warn', 'Desconectado');
    body.innerHTML =
      '<div class="wa-cta">' +
      '<div class="wa-illus">' + I.wa + '</div>' +
      '<h4>Nenhum aparelho conectado</h4>' +
      '<p>Gere um QR Code e leia com o celular que vai enviar os relatórios. A leitura leva alguns segundos.</p>' +
      '<button class="btn btn-primary" id="waConnect">' + I.link + 'Conectar aparelho</button>' +
      '</div>';
    $('#waConnect', body).onclick = startConnect;
  }

  /* ---- Estado: QR na tela, aguardando leitura ---- */
  function showQr(qr) {
    setPill('info', 'Aguardando leitura');
    body.innerHTML =
      '<div class="wa-connect">' +
      '<div class="wa-qr"><div class="wa-qr-frame">' +
      (qr ? '<img src="' + qr + '" alt="QR Code do WhatsApp" />'
          : '<div class="wa-loading">' + I.refresh + '<span>Gerando QR…</span></div>') +
      '</div><div class="wa-waiting"><span class="wa-spinner"></span>Aguardando leitura…</div>' +
      '<button class="btn btn-ghost btn-sm" id="waNewQr">' + I.refresh + 'Gerar novo QR</button></div>' +
      '<div class="wa-steps"><h4>Como conectar</h4><ol>' +
      '<li>Abra o <b>WhatsApp</b> no celular.</li>' +
      '<li>Toque em <b>⋮ / Ajustes</b> → <b>Aparelhos conectados</b>.</li>' +
      '<li>Toque em <b>Conectar aparelho</b>.</li>' +
      '<li>Aponte a câmera para o <b>QR Code</b> ao lado.</li></ol>' +
      '<div class="wa-hint">' + I.info + '<span>O código expira em ~40s. Se sumir, é só gerar um novo.</span></div></div>' +
      '</div>';
    $('#waNewQr', body).onclick = startConnect;
    startPoll();
  }

  /* ---- Estado: conectado (mostra o aparelho) ---- */
  function showConnected(profile) {
    stopWaPoll();
    setPill('ok', 'Conectado');
    const p = profile || {};
    const foto = p.foto
      ? '<img src="' + p.foto + '" alt="" />'
      : '<span>' + waMini() + '</span>';
    const numero = p.numero ? formatPhone(p.numero) : 'Número conectado';
    body.innerHTML =
      '<div class="wa-connected">' +
      '<div class="wa-avatar">' + foto + '<span class="wa-online"></span></div>' +
      '<div class="wa-who"><b>' + (p.nome || 'Aparelho conectado') + '</b><span>' + numero + '</span></div>' +
      '<div class="wa-ok-badge">' + I.check + 'Pronto para enviar relatórios</div>' +
      '<button class="btn btn-ghost" id="waDisc">' + I.power + 'Desconectar</button>' +
      '</div>';
    $('#waDisc', body).onclick = () => {
      openModal('Desconectar WhatsApp',
        '<p style="font-size:14px;color:var(--ink-2)">Tem certeza que deseja desconectar este aparelho? Os relatórios deixam de ser enviados até você conectar de novo.</p>',
        '<button class="btn btn-ghost" onclick="document.getElementById(\'modalScrim\').classList.remove(\'open\')">Cancelar</button>' +
        '<button class="btn btn-danger" id="waDiscOk">' + I.power + 'Desconectar</button>');
      $('#waDiscOk').onclick = () => {
        closeModal();
        toast('Desconectando…');
        fetch('/api/whatsapp/disconnect', { method: 'POST' })
          .then((r) => r.json()).then(() => { toast('Aparelho desconectado.'); showDisconnected(); })
          .catch(() => toast('Falha ao desconectar.'));
      };
    };
  }

  /* ---- Ações ---- */
  function startConnect() {
    setPill('info', 'Gerando QR…');
    body.innerHTML = '<div class="wa-loading">' + I.refresh + '<span>Gerando QR Code…</span></div>';
    fetch('/api/whatsapp/connect', { method: 'POST' })
      .then((r) => r.json().then((d) => ({ ok: r.ok, d })))
      .then(({ ok, d }) => {
        if (!ok) throw new Error(d.error || 'Falha');
        if (d.state === 'open') return showConnected(d.profile);
        showQr(d.qr);
      })
      .catch((e) => { toast(e.message || 'Falha ao gerar o QR.'); showDisconnected(); });
  }

  function startPoll() {
    stopWaPoll();
    waPollTimer = setInterval(() => {
      fetch('/api/whatsapp/status').then((r) => r.json()).then((s) => {
        if (s.state === 'open') { toast('WhatsApp conectado! 🎉'); showConnected(s.profile); }
      }).catch(() => {});
    }, 3000);
  }

  function refresh() {
    fetch('/api/whatsapp/status').then((r) => r.json()).then((s) => {
      if (s.state === 'open') showConnected(s.profile);
      else showDisconnected();
    }).catch(() => { setPill('err', 'Erro'); body.innerHTML = emptyState(I.alert, 'Não deu para consultar', 'Verifique o servidor da Evolution e tente novamente.'); });
  }

  $('#waRefresh').onclick = refresh;
  refresh();
}

/* +5517981235049 -> +55 (17) 98123-5049 (melhor esforço; devolve cru se não casar) */
function formatPhone(n) {
  const d = String(n).replace(/\D/g, '');
  const m = d.match(/^(\d{2})(\d{2})(\d{4,5})(\d{4})$/);
  return m ? '+' + m[1] + ' (' + m[2] + ') ' + m[3] + '-' + m[4] : '+' + d;
}

/* ---- Contas de anúncio ---- */
function fmtNum(n) { return (Number(n) || 0).toLocaleString('pt-BR', { maximumFractionDigits: 0 }); }
function fmtMoeda(n, m) { return (m || 'R$') + ' ' + (Number(n) || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }
function moedaSigla(m) { return m === 'BRL' ? 'R$' : (m || 'R$'); }
function tempoAtras(iso) {
  if (!iso) return '—';
  const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) return 'agora';
  if (s < 3600) return Math.floor(s / 60) + ' min atrás';
  if (s < 86400) return Math.floor(s / 3600) + ' h atrás';
  return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
}

function renderContas(v) {
  v.appendChild(el(
    '<div class="page-head"><div class="titles"><h2>Contas de anúncio</h2><p>Dados do Google Ads (via Script no MCC) e da Meta (via token) que alimentam os relatórios.</p></div>' +
    '<div class="actions"><button class="btn btn-ghost btn-sm" id="ctRefresh">' + I.refresh + 'Atualizar</button>' +
    '<button class="btn btn-primary" id="ctMeta">' + I.refresh + 'Sincronizar Meta</button></div></div>'
  ));

  const statusRow = el('<div class="grid" style="grid-template-columns:1fr 1fr;margin-bottom:16px"></div>');
  v.appendChild(statusRow);

  const card = el('<div class="card" id="ctList"></div>');
  v.appendChild(card);

  function statusCard(cls, glyph, nome, desc, ok, okTxt, pendTxt) {
    return '<div class="card integration">' +
      '<div class="logo ' + cls + '">' + glyph + '</div>' +
      '<div class="info"><b>' + nome + '</b><p>' + desc + '</p></div>' +
      '<span class="pill ' + (ok ? 'ok' : 'warn') + '"><span class="dot"></span>' + (ok ? okTxt : pendTxt) + '</span></div>';
  }

  function load() {
    Promise.all([
      fetch('/api/integrations').then((r) => r.json()).catch(() => ({})),
      fetch('/api/accounts').then((r) => r.json()).catch(() => []),
    ]).then(([integ, contas]) => {
      contas = Array.isArray(contas) ? contas : [];
      const temGoogle = contas.some((c) => c.plataforma === 'google');
      statusRow.innerHTML = '';
      statusRow.appendChild(el(statusCard('google', GADS, 'Google Ads (MCC)',
        'Via Google Ads Script — sem API/aprovação.', temGoogle, 'Recebendo dados', 'Aguardando 1º envio')));
      statusRow.appendChild(el(statusCard('meta', META, 'Meta Ads',
        'Via System User token do seu Business Manager.', integ.metaConfigured, 'Token configurado', 'Sem token')));
      renderList(contas);
    });
  }

  function renderList(contas) {
    card.innerHTML = '<div class="card-head"><h3>Contas detectadas</h3><span class="sub">' + contas.length + ' conta(s) · atualizam sozinhas</span></div>';
    if (!contas.length) {
      card.appendChild(el(emptyState(I.plug, 'Nenhuma conta ainda',
        'Assim que o Google Ads Script rodar no MCC ou a Meta sincronizar, as contas aparecem aqui com os números reais.')));
      return;
    }
    const wrap = el('<div class="table-wrap"><table class="data"><thead><tr>' +
      '<th>Conta</th><th>Plataforma</th><th>Período</th><th>Conversões</th><th>Custo</th><th>Atualizado</th><th></th></tr></thead><tbody></tbody></table></div>');
    const tb = $('tbody', wrap);
    contas.forEach((c) => {
      const sig = moedaSigla(c.moeda);
      const tr = el(
        '<tr><td><div class="cell-lead"><span class="avatar-sm">' + initials(c.nome) + '</span><span class="strong">' + c.nome + '</span></div></td>' +
        '<td>' + platTag(c.plataforma) + '</td>' +
        '<td class="muted">' + (c.periodo || '—') + '</td>' +
        '<td class="tnum strong">' + fmtNum(c.metricas.conversoes) + '</td>' +
        '<td class="muted tnum">' + fmtMoeda(c.metricas.custo, sig) + '</td>' +
        '<td class="muted">' + tempoAtras(c.atualizadoEm) + '</td>' +
        '<td><div class="row-actions"><button class="icon-btn" data-del title="Remover">' + I.trash + '</button></div></td></tr>'
      );
      $('[data-del]', tr).onclick = () => {
        fetch('/api/accounts/' + encodeURIComponent(c.id), { method: 'DELETE' })
          .then((r) => r.json()).then(() => { toast('Conta removida.'); load(); })
          .catch(() => toast('Falha ao remover.'));
      };
      tb.appendChild(tr);
    });
    card.appendChild(wrap);
  }

  $('#ctRefresh').onclick = () => { toast('Atualizando…'); load(); };
  $('#ctMeta').onclick = () => {
    toast('Sincronizando a Meta…');
    fetch('/api/meta/sync', { method: 'POST' })
      .then((r) => r.json().then((d) => ({ ok: r.ok, d })))
      .then(({ ok, d }) => { if (!ok) throw new Error(d.error || 'Falha'); toast(d.contas + ' conta(s) sincronizada(s).'); load(); })
      .catch((e) => toast(e.message || 'Falha ao sincronizar a Meta.'));
  };

  load();
}

/* ---- Clientes ---- */
function renderClientes(v) {
  v.appendChild(el(
    '<div class="page-head"><div class="titles"><h2>Clientes</h2><p>Vincule cada conta a um número de WhatsApp e a um gestor responsável.</p></div>' +
    '<div class="actions"><button class="btn btn-primary" id="clNew">' + I.plus + 'Novo cliente</button></div></div>'
  ));

  const card = el('<div class="card" id="clList"></div>');
  v.appendChild(card);

  function load() {
    fetch('/api/clients').then((r) => r.json()).then((list) => {
      list = Array.isArray(list) ? list : [];
      card.innerHTML = '';
      if (!list.length) {
        card.appendChild(el(emptyState(I.users, 'Nenhum cliente cadastrado',
          'Cadastre seus clientes e vincule cada um a um número de WhatsApp e às contas de anúncio para começar a enviar relatórios.',
          '<button class="btn btn-primary btn-sm" id="clEmptyNew">' + I.plus + 'Cadastrar cliente</button>')));
        $('#clEmptyNew').onclick = () => openClienteModal(load);
        return;
      }
      const wrap = el('<div class="table-wrap"><table class="data"><thead><tr>' +
        '<th>Cliente</th><th>Contas vinculadas</th><th>WhatsApp</th><th>Gestor</th><th>Ativo</th><th></th></tr></thead><tbody></tbody></table></div>');
      const tb = $('tbody', wrap);
      list.forEach((c) => {
        const arr = c.contas || [];
        const chips = arr.length
          ? arr.slice(0, 3).map((n) => '<span class="pill mute" style="margin-right:4px">' + (n.nome || n) + '</span>').join('') +
            (arr.length > 3 ? '<span class="pill mute">+' + (arr.length - 3) + '</span>' : '')
          : '<span class="muted">—</span>';
        const tr = el(
          '<tr><td><div class="cell-lead"><span class="avatar-sm">' + initials(c.nome) + '</span><span class="strong">' + c.nome + '</span></div></td>' +
          '<td>' + chips + '</td><td class="tnum">' + (c.whatsapp ? formatPhone(c.whatsapp) : '—') + '</td><td class="muted">' + (c.gestor || '—') + '</td>' +
          '<td><label class="switch"><input type="checkbox" ' + (c.ativo !== false ? 'checked' : '') + '><span class="track"></span></label></td>' +
          '<td><div class="row-actions"><button class="icon-btn" data-edit title="Editar">' + I.edit + '</button><button class="icon-btn" data-del title="Remover">' + I.trash + '</button></div></td></tr>'
        );
        $('.switch input', tr).onchange = (e) => {
          fetch('/api/clients', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ nome: c.nome, ativo: e.target.checked }) })
            .then(() => toast(e.target.checked ? 'Cliente ativado.' : 'Cliente pausado.'));
        };
        $('[data-edit]', tr).onclick = () => openClienteModal(load, c);
        $('[data-del]', tr).onclick = () => {
          openModal('Remover cliente', '<p style="font-size:14px;color:var(--ink-2)">Remover <b>' + c.nome + '</b>?</p>',
            '<button class="btn btn-ghost" onclick="document.getElementById(\'modalScrim\').classList.remove(\'open\')">Cancelar</button>' +
            '<button class="btn btn-danger" id="clDelOk">' + I.trash + 'Remover</button>');
          $('#clDelOk').onclick = () => { closeModal(); fetch('/api/clients/' + encodeURIComponent(c.nome), { method: 'DELETE' }).then(() => { toast('Cliente removido.'); load(); }); };
        };
        tb.appendChild(tr);
      });
      card.appendChild(wrap);
    }).catch(() => { card.innerHTML = ''; card.appendChild(el(emptyState(I.alert, 'Falha ao carregar', 'Não deu para listar os clientes.'))); });
  }

  $('#clNew').onclick = () => openClienteModal(load);
  load();
}

function openClienteModal(onSaved, cliente) {
  const editando = !!cliente;
  fetch('/api/accounts').then((r) => r.json()).then((contas) => {
    contas = Array.isArray(contas) ? contas : [];
    const jaTem = new Set(((cliente && cliente.contas) || []).map((x) => x.id || x));
    const opts = contas.map((a) =>
      '<option value="' + a.id + '" data-nome="' + a.nome.replace(/"/g, '&quot;') + '" data-plat="' + a.plataforma + '"' +
      (jaTem.has(a.id) ? ' selected' : '') + '>' + a.nome + '  ·  ' + (a.plataforma === 'google' ? 'Google' : 'Meta') + '</option>'
    ).join('');

    openModal(editando ? 'Editar cliente' : 'Novo cliente',
      '<div class="form-grid">' +
      '<div class="field full"><label>Nome do cliente <span class="req">*</span></label><input class="input" id="clNome" placeholder="Ex.: Nome do cliente" value="' + (editando ? cliente.nome.replace(/"/g, '&quot;') : '') + '"' + (editando ? ' readonly' : '') + '></div>' +
      '<div class="field"><label>WhatsApp (destinatário) <span class="req">*</span></label><input class="input" id="clWhats" type="tel" placeholder="47 99999-9999" value="' + (editando ? formatPhone(cliente.whatsapp || '') : '') + '"><span class="hint">Pode digitar só DDD + número — o +55 entra sozinho.</span></div>' +
      '<div class="field"><label>Gestor responsável</label><input class="input" id="clGestor" placeholder="Ex.: Gabriel" value="' + (editando ? (cliente.gestor || '') : '') + '"></div>' +
      '<div class="field full"><label>Contas vinculadas <span class="muted">(' + contas.length + ' disponíveis)</span></label>' +
      '<input class="input" id="clFiltro" placeholder="Filtrar por nome..." style="margin-bottom:6px">' +
      '<select class="select" id="clContas" multiple size="7">' + opts + '</select>' +
      '<span class="hint">Segure Ctrl/Cmd para marcar várias.</span></div>' +
      '</div>',
      '<button class="btn btn-ghost" onclick="document.getElementById(\'modalScrim\').classList.remove(\'open\')">Cancelar</button>' +
      '<button class="btn btn-primary" id="doCliente">' + I.check + 'Salvar cliente</button>'
    );

    $('#clFiltro').oninput = (e) => {
      const q = e.target.value.toLowerCase();
      [...$('#clContas').options].forEach((o) => { o.hidden = q && !o.textContent.toLowerCase().includes(q); });
    };

    $('#doCliente').onclick = () => {
      const nome = $('#clNome').value.trim();
      const whatsapp = $('#clWhats').value.trim();
      if (!nome) return toast('Informe o nome do cliente.');
      if (!whatsapp) return toast('Informe o WhatsApp do destinatário.');
      const contasSel = [...$('#clContas').selectedOptions].map((o) => ({ id: o.value, nome: o.dataset.nome, plataforma: o.dataset.plat }));
      fetch('/api/clients', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ nome, whatsapp, gestor: $('#clGestor').value.trim(), contas: contasSel }) })
        .then((r) => r.json().then((d) => ({ ok: r.ok, d })))
        .then(({ ok, d }) => { if (!ok) throw new Error(d.error || 'Falha'); closeModal(); toast('Cliente salvo.'); onSaved && onSaved(); })
        .catch((e) => toast(e.message || 'Falha ao salvar.'));
    };
  }).catch(() => toast('Falha ao carregar as contas.'));
}

/* ---- Configurações ---- */
function renderConfig(v) {
  v.appendChild(el(
    '<div class="page-head"><div class="titles"><h2>Configurações</h2><p>Credenciais das integrações. Ficam salvas no servidor e não são versionadas.</p></div></div>'
  ));

  // Onde ficam as integrações reais (Google via Script, Meta via token)
  v.appendChild(el('<div class="banner">' + I.info +
    '<div>As contas do <b>Google Ads</b> (via Script no MCC) e do <b>Meta</b> (via token) são gerenciadas em ' +
    '<a href="#/contas" style="text-decoration:underline;font-weight:700">Contas de anúncio</a>, e o <b>WhatsApp</b> em ' +
    '<a href="#/conexao" style="text-decoration:underline;font-weight:700">Conexão</a>. Aqui fica só a chave da OpenAI.</div></div>'));

  // Logo da empresa (white-label)
  const logoCard = el('<div class="card" style="margin-bottom:16px">' +
    '<div class="card-head"><div class="logo" style="width:38px;height:38px;border-radius:10px;display:flex;align-items:center;justify-content:center;background:var(--green-tint);color:var(--green-700)">' + I.info + '</div>' +
    '<div><h3>Logo da empresa</h3><span class="sub">Aparece no topo da barra lateral</span></div></div>' +
    '<div class="card-pad"><div style="display:flex;align-items:center;gap:16px;flex-wrap:wrap">' +
    '<div style="width:150px;height:54px;border:1px solid var(--line);border-radius:10px;background:linear-gradient(120deg,#0a5f11,#15ac20);display:flex;align-items:center;justify-content:center;overflow:hidden">' +
    '<img id="logoPreviewImg" style="max-width:88%;max-height:78%;display:none" alt=""><span id="logoPreviewTxt" style="color:#fff;font-size:12px;opacity:.85">Prévia</span></div>' +
    '<div style="display:flex;gap:10px;flex-wrap:wrap">' +
    '<label class="btn btn-primary" style="cursor:pointer">' + I.plus + 'Escolher imagem<input type="file" id="logoInput" accept="image/png,image/jpeg,image/svg+xml,image/webp" hidden></label>' +
    '<button class="btn btn-ghost" id="logoRemove">' + I.trash + 'Remover</button></div></div>' +
    '<span class="hint" style="display:block;margin-top:10px">PNG ou SVG com fundo transparente funciona melhor (a barra é escura). Máx. ~500KB.</span></div></div>');
  v.appendChild(logoCard);
  wireLogo(logoCard);

  // OpenAI — real
  const ai = credCard('ai', '', 'OpenAI',
    'Lê os dados e escreve o texto do relatório.',
    [
      { l: 'API Key', ph: 'sk-...', pass: true, id: 'aiKey', req: true },
    ], 'mute', 'Verificando…', aiMini(), true);
  v.appendChild(ai);

  wireOpenAI(ai);
}

function wireLogo(card) {
  const img = $('#logoPreviewImg', card), txt = $('#logoPreviewTxt', card), input = $('#logoInput', card);
  const show = (dataUri) => {
    if (dataUri) { img.src = dataUri; img.style.display = 'block'; txt.style.display = 'none'; }
    else { img.removeAttribute('src'); img.style.display = 'none'; txt.style.display = 'block'; }
  };
  fetch('/api/branding').then((r) => r.json()).then((b) => show(b && b.logo)).catch(() => {});
  input.onchange = () => {
    const f = input.files && input.files[0];
    if (!f) return;
    if (f.size > 500 * 1024) return toast('Imagem muito grande (máx. ~500KB).');
    const rd = new FileReader();
    rd.onload = () => {
      const dataUri = rd.result;
      fetch('/api/branding', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ logo: dataUri }) })
        .then((r) => r.json().then((d) => ({ ok: r.ok, d })))
        .then(({ ok, d }) => { if (!ok) throw new Error(d.error || 'Falha'); show(dataUri); applyBranding(); toast('Logo salva!'); })
        .catch((e) => toast(e.message || 'Falha ao salvar a logo.'));
    };
    rd.readAsDataURL(f);
  };
  $('#logoRemove', card).onclick = () => {
    fetch('/api/branding', { method: 'DELETE' }).then(() => {
      show(null);
      const bi = document.getElementById('brandLogo');
      if (bi) bi.src = '/assets/logo_white.png';
      toast('Logo removida.');
    }).catch(() => toast('Falha ao remover.'));
  };
}

function credCard(cls, letter, nome, desc, fields, pillCls, pillTxt, glyph, isAi) {
  const card = el('<div class="card" style="margin-bottom:16px"></div>');
  card.appendChild(el(
    '<div class="card-head"><div class="logo ' + cls + '" style="width:38px;height:38px;border-radius:10px;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:800;background:' +
    ({ google: '#1a73e8', meta: '#0866ff', wa: '#25d366', ai: '#10a37f' }[cls]) + '">' + (letter || glyph) + '</div>' +
    '<div><h3>' + nome + '</h3><span class="sub">' + desc + '</span></div>' +
    '<div class="actions"><span class="pill ' + pillCls + '" data-pill><span class="dot"></span>' + pillTxt + '</span></div></div>'
  ));
  const body = el('<div class="card-pad"><div class="form-grid"></div></div>');
  const fg = $('.form-grid', body);
  fields.forEach((f) => fg.appendChild(el(
    '<div class="field ' + (fields.length === 1 ? 'full' : '') + '"><label>' + f.l + (f.req ? ' <span class="req">*</span>' : '') + '</label>' +
    '<input class="input" type="' + (f.pass ? 'password' : 'text') + '" placeholder="' + f.ph + '"' + (f.id ? ' id="' + f.id + '"' : '') + '></div>'
  )));
  const foot = el('<div style="grid-column:1/-1;display:flex;gap:10px;margin-top:4px">' +
    (isAi ? '<button class="btn btn-primary" data-save>' + I.check + 'Salvar chave</button><button class="btn btn-ghost" data-test>Testar conexão</button>'
          : '<button class="btn btn-primary" data-save>' + I.check + 'Salvar</button><button class="btn btn-ghost" data-test>' + I.plug + 'Testar conexão</button>') +
    '</div>');
  fg.appendChild(foot);
  card.appendChild(body);
  if (!isAi) {
    $('[data-save]', card).onclick = () => toast(nome + ' — salvo. Conexão real entra quando as credenciais forem válidas.');
    $('[data-test]', card).onclick = () => toast('Teste de conexão disponível na fase de integração.');
  }
  return card;
}

function wireOpenAI(card) {
  const pill = $('[data-pill]', card);
  const key = $('#aiKey', card);
  fetch('/api/settings').then((r) => r.json()).then((s) => {
    if (s.hasKey) { pill.className = 'pill ok'; pill.innerHTML = '<span class="dot"></span>Conectado'; key.placeholder = s.keyMasked || 'sk-••••••'; }
    else { pill.className = 'pill warn'; pill.innerHTML = '<span class="dot"></span>Sem chave'; }
  }).catch(() => { pill.className = 'pill err'; pill.innerHTML = '<span class="dot"></span>Erro'; });

  $('[data-save]', card).onclick = () => {
    const val = key.value.trim();
    if (!val) return toast('Cole a chave antes de salvar.');
    fetch('/api/settings', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ apiKey: val }) })
      .then((r) => r.json()).then((s) => { key.value = ''; key.placeholder = s.keyMasked || 'sk-••••••'; pill.className = 'pill ok'; pill.innerHTML = '<span class="dot"></span>Conectado'; toast('Chave da OpenAI salva.'); })
      .catch(() => toast('Falha ao salvar a chave.'));
  };
  $('[data-test]', card).onclick = () => {
    fetch('/api/health').then((r) => r.json()).then((h) => toast(h.hasKey ? 'OpenAI OK · modelo ' + (h.model || 'padrão') : 'Nenhuma chave configurada.')).catch(() => toast('Falha no teste.'));
  };
}

/* ---- Modelo de relatório: renderiza o RELATÓRIO REAL (buildHtml via /api/preview) ---- */
const SAMPLE_CFG = {
  cliente: 'Cliente exemplo',
  mes: 'Julho',
  ano: '2026',
  periodo: '01/07/2026 a 31/07/2026',
  gestor: 'Gabriel',
  gerado_em: '01/08/2026',
  metricas: [
    { label: 'Conversões', value: '366', sub: '295 no período anterior', cur: false },
    { label: 'Cliques', value: '12.809', sub: '11.200 no período anterior', cur: false },
    { label: 'Custo / conv.', value: '32,64', sub: 'R$ 35,50 no período anterior', cur: true },
    { label: 'CPC médio', value: '2,22', sub: 'R$ 2,35 no período anterior', cur: true },
    { label: 'Custo', value: '11.946,52', sub: 'R$ 8.468,67 no período anterior', cur: true },
  ],
  grafico: {
    subtitulo: 'Conversões por mês',
    labels: ['Mar', 'Abr', 'Mai', 'Jun', 'Jul'],
    valores: [248, 271, 259, 312, 366],
  },
  leilao: [
    { dominio: 'Cliente exemplo (você)', parcela: '42%', sobreposicao: '—', posicaoAcima: '—', topo: '88%', ehVoce: true },
    { dominio: 'concorrente-alpha.com.br', parcela: '31%', sobreposicao: '54%', posicaoAcima: '38%', topo: '71%', ehVoce: false },
    { dominio: 'concorrente-beta.com.br', parcela: '24%', sobreposicao: '47%', posicaoAcima: '29%', topo: '63%', ehVoce: false },
    { dominio: 'concorrente-gamma.com.br', parcela: '18%', sobreposicao: '33%', posicaoAcima: '21%', topo: '52%', ehVoce: false },
    { dominio: 'concorrente-delta.com.br', parcela: '< 10%', sobreposicao: '19%', posicaoAcima: '12%', topo: '40%', ehVoce: false },
  ],
  passos: [
    { tag: 'Campanhas', titulo: 'Escalar os anúncios de melhor desempenho', texto: 'Aumentar o orçamento das campanhas com melhor CPA e realocar verba das de menor retorno.' },
    { tag: 'Palavras-chave', titulo: 'Revisar termos de pesquisa', texto: 'Adicionar negativas para cortar cliques irrelevantes e reduzir o CPC médio.' },
    { tag: 'Criativos', titulo: 'Testar novas variações de anúncio', texto: 'Rodar testes A/B de títulos e descrições para melhorar o CTR no próximo período.' },
  ],
};

function renderReportDetail(v) {
  v.appendChild(el('<button class="back-btn" id="rdBack">' + I.back + 'Voltar aos relatórios</button>'));
  v.appendChild(el(
    '<div class="page-head"><div class="titles"><h2>Modelo de relatório</h2>' +
    '<p>É este o relatório que o sistema gera e envia (padrão Google Ads).</p></div>' +
    '<div class="actions"><button class="btn btn-primary" id="rdPdf">' + I.download + 'Baixar PDF de exemplo</button></div></div>'
  ));
  v.appendChild(el('<div class="banner amber">' + I.info +
    '<div><b>Exemplo ilustrativo.</b> Os números são fictícios só para mostrar o layout. Com as contas conectadas, os dados reais entram automaticamente.</div></div>'));

  const wrap = el('<div class="report-frame-wrap"><div class="report-loading" id="rdLoading">Carregando modelo…</div>' +
    '<iframe id="reportFrame" class="report-frame" title="Modelo de relatório" style="display:none"></iframe></div>');
  v.appendChild(wrap);

  fetch('/api/preview', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(SAMPLE_CFG) })
    .then((r) => r.text())
    .then((html) => {
      const f = $('#reportFrame');
      f.srcdoc = html;
      f.onload = () => {
        $('#rdLoading')?.remove();
        f.style.display = 'block';
        try { f.style.height = (f.contentDocument.documentElement.scrollHeight + 24) + 'px'; } catch (e) {}
      };
    })
    .catch(() => { const l = $('#rdLoading'); if (l) l.textContent = 'Falha ao carregar o modelo.'; });

  $('#rdBack').onclick = () => { location.hash = '#/relatorios'; };
  $('#rdPdf').onclick = () => {
    toast('Gerando PDF de exemplo…');
    fetch('/api/generate', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(SAMPLE_CFG) })
      .then((r) => (r.ok ? r.blob() : Promise.reject()))
      .then((blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = 'Relatório ' + SAMPLE_CFG.mes + ' - ' + SAMPLE_CFG.cliente + '.pdf';
        document.body.appendChild(a); a.click(); a.remove();
        setTimeout(() => URL.revokeObjectURL(url), 4000);
      })
      .catch(() => toast('Falha ao gerar o PDF (verifique o Chrome/servidor).'));
  };
}

function waMini() { return '<svg style="width:20px;height:20px" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2"><path d="M21 11.5a8.4 8.4 0 0 1-12.3 7.4L3 21l2.2-5.6A8.4 8.4 0 1 1 21 11.5z"/></svg>'; }
function aiMini() { return '<svg style="width:20px;height:20px" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2"><path d="M12 2a4 4 0 0 1 4 4 4 4 0 0 1 0 8 4 4 0 0 1-8 0 4 4 0 0 1 0-8 4 4 0 0 1 4-4z"/></svg>'; }

/* ------------------------------ Navegação ------------------------------ */
document.querySelectorAll('.nav-item').forEach((b) => b.addEventListener('click', () => { location.hash = '#/' + b.dataset.route; }));
window.addEventListener('hashchange', navigate);

function closeMobileNav() { $('#sidebar').classList.remove('open'); $('#scrimMobile').classList.remove('show'); }
$('#menuBtn').addEventListener('click', () => { $('#sidebar').classList.add('open'); $('#scrimMobile').classList.add('show'); });
$('#scrimMobile').addEventListener('click', closeMobileNav);

/* Aplica a logo personalizada (white-label) na barra lateral, se houver. */
function applyBranding() {
  fetch('/api/branding').then((r) => r.json()).then((b) => {
    const img = document.getElementById('brandLogo');
    if (img && b && b.logo) img.src = b.logo;
  }).catch(() => {});
}

navigate();
applyBranding();
