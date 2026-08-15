/* =========================================================================
   Tráfega Mídia — Painel de Relatórios (front-end)
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
  contas:       { title: 'Contas de anúncio', crumb: 'Google Ads e Meta',                 render: renderContas },
  clientes:     { title: 'Clientes',          crumb: 'Destinatários e vínculos',          render: renderClientes },
  config:       { title: 'Configurações',     crumb: 'Credenciais e integrações',         render: renderConfig },
  relatorio:    { title: 'Relatório',         crumb: 'Prévia do envio',                   render: renderReportDetail, parent: 'relatorios' },
};

let selectedReport = SAMPLE_REPORT;

function navigate() {
  const route = (location.hash.replace('#/', '') || 'painel');
  const def = ROUTES[route] || ROUTES.painel;
  document.title = 'Tráfega Mídia · ' + def.title;
  const activeRoute = def.parent || (ROUTES[route] ? route : 'painel');
  document.querySelectorAll('.nav-item').forEach((b) => b.classList.toggle('active', b.dataset.route === activeRoute));
  const view = $('#view');
  view.innerHTML = '';
  def.render(view);
  view.scrollTo?.(0, 0);
  document.querySelector('.content').scrollTop = 0;
  closeMobileNav();
}

/* ============================== PÁGINAS ================================= */

/* ---- Painel ---- */
function renderPainel(v) {
  v.appendChild(el(
    '<div class="hero"><span class="hero-glow a"></span><span class="hero-glow b"></span>' +
    '<div class="hero-txt"><h2>Bem-vindo de volta, Tráfega</h2>' +
    '<p>Aqui está o resumo da sua operação de relatórios. Conecte suas contas e configure os clientes para começar a disparar no WhatsApp.</p></div></div>'
  ));

  v.appendChild(el(
    '<div class="banner">' + I.info +
    '<div><b>Vamos começar.</b> Conecte suas contas do Google Ads e Meta e configure os clientes para gerar e disparar os relatórios. Comece em <a href="#/config" style="text-decoration:underline;font-weight:700">Configurações</a>.</div></div>'
  ));

  const kpis = [
    { ico: I.plug,  cls: '',      label: 'Contas conectadas',         value: '0',  foot: 'Nenhuma conta conectada' },
    { ico: I.send,  cls: 'blue',  label: 'Relatórios enviados (mês)',  value: '0',  foot: 'Nenhum envio ainda' },
    { ico: I.clock, cls: 'amber', label: 'Próximo disparo',            value: '—',  foot: 'Nenhum agendamento ativo' },
    { ico: I.wa,    cls: 'slate', label: 'Entrega no WhatsApp',        value: '—',  foot: 'Sem dados ainda' },
  ];
  const grid = el('<div class="grid kpi-grid"></div>');
  kpis.forEach((k) => grid.appendChild(el(
    '<div class="kpi"><div class="top"><div class="ico ' + k.cls + '">' + k.ico + '</div></div>' +
    '<div class="label">' + k.label + '</div><div class="value tnum">' + k.value + '</div>' +
    '<div class="delta flat">' + k.foot + '</div></div>'
  )));
  v.appendChild(grid);

  const row = el('<div class="grid" style="margin-top:16px"></div>');
  // Activity
  const feed = el(
    '<div class="card"><div class="card-head"><h3>Atividade recente</h3></div><div class="feed"></div></div>'
  );
  $('.feed', feed).appendChild(el(emptyState(I.clock, 'Nenhuma atividade ainda', 'Assim que os relatórios começarem a ser gerados e enviados, o histórico aparece aqui.')));
  row.appendChild(feed);
  v.appendChild(row);

  // Integrações status
  const integ = el('<div class="card" style="margin-top:16px"><div class="card-head"><h3>Integrações</h3><div class="actions"><a class="btn btn-ghost btn-sm" href="#/config">Gerenciar</a></div></div><div class="grid" style="grid-template-columns:repeat(4,1fr);gap:0"></div></div>');
  const box = $('.grid', integ);
  [
    { cls: 'google', l: GADS, n: 'Google Ads', s: 'Aguardando token' },
    { cls: 'meta', l: META, n: 'Meta Ads', s: 'Aguardando token' },
    { cls: 'wa', l: '', n: 'WhatsApp', s: 'Aguardando instância' },
    { cls: 'ai', l: '', n: 'OpenAI', s: 'Verificando…', id: 'integAi' },
  ].forEach((x, i) => box.appendChild(el(
    '<div class="integration"' + (i < 3 ? ' style="border-right:1px solid var(--line-2)"' : '') + '>' +
    '<div class="logo ' + x.cls + '">' + (x.l || (x.cls === 'wa' ? waMini() : aiMini())) + '</div>' +
    '<div class="info"><b>' + x.n + '</b><p ' + (x.id ? 'id="' + x.id + '"' : '') + '>' + x.s + '</p></div>' +
    '<span class="pill ' + (x.cls === 'ai' ? 'mute' : 'warn') + '"><span class="dot"></span>' + (x.cls === 'ai' ? '...' : 'Pendente') + '</span></div>'
  )));
  v.appendChild(integ);

  // Confere OpenAI de verdade
  fetch('/api/settings').then((r) => r.json()).then((s) => {
    const p = $('#integAi'); const pill = p?.parentElement?.parentElement?.querySelector('.pill');
    if (!p) return;
    if (s.hasKey) { p.textContent = 'Chave configurada · ' + (s.model || 'modelo padrão'); pill.className = 'pill ok'; pill.innerHTML = '<span class="dot"></span>Conectado'; }
    else { p.textContent = 'Sem chave'; pill.className = 'pill warn'; pill.innerHTML = '<span class="dot"></span>Pendente'; }
  }).catch(() => {});
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
function renderAgendamentos(v) {
  v.appendChild(el(
    '<div class="page-head"><div class="titles"><h2>Agendamentos</h2><p>Defina quando os relatórios são gerados e disparados automaticamente.</p></div>' +
    '<div class="actions"><button class="btn btn-primary" id="agNew">' + I.plus + 'Novo agendamento</button></div></div>'
  ));

  v.appendChild(el('<div class="banner">' + I.info +
    '<div>O disparo automático precisa de um <b>servidor sempre ligado</b>. Assim que o sistema estiver hospedado, estes agendamentos passam a rodar sozinhos.</div></div>'));

  const card = el('<div class="card"></div>');
  card.appendChild(el(emptyState(I.clock, 'Nenhum agendamento criado',
    'Crie um agendamento para o sistema gerar e disparar os relatórios sozinho (ex.: todo dia 1º às 08:00).',
    '<button class="btn btn-primary btn-sm" id="agEmptyNew">' + I.plus + 'Novo agendamento</button>')));
  v.appendChild(card);
  $('#agEmptyNew').onclick = () => $('#agNew').click();
  $('#agNew').onclick = () => openModal('Novo agendamento',
    '<div class="form-grid"><div class="field full"><label>Nome</label><input class="input" placeholder="Ex.: Fechamento mensal"></div>' +
    '<div class="field"><label>Frequência</label><select class="select"><option>Mensal</option><option>Semanal</option><option>Diária</option></select></div>' +
    '<div class="field"><label>Horário</label><input class="input" type="time" value="08:00"></div>' +
    '<div class="field full"><label>Clientes</label><select class="select"><option>Todos os ativos</option><option>Selecionar manualmente</option></select></div></div>',
    '<button class="btn btn-ghost" onclick="document.getElementById(\'modalScrim\').classList.remove(\'open\')">Cancelar</button><button class="btn btn-primary" onclick="document.getElementById(\'modalScrim\').classList.remove(\'open\')">Salvar</button>'
  );
}

/* ---- Contas de anúncio ---- */
function renderContas(v) {
  v.appendChild(el(
    '<div class="page-head"><div class="titles"><h2>Contas de anúncio</h2><p>Contas do Google Ads (MCC) e do Meta que alimentam os relatórios.</p></div>' +
    '<div class="actions"><button class="btn btn-ghost btn-sm" id="ctSync">' + I.refresh + 'Sincronizar contas</button></div></div>'
  ));

  // Cards de conexão (OAuth)
  const conn = el('<div class="grid" style="grid-template-columns:1fr 1fr;margin-bottom:16px"></div>');
  [
    { cls: 'google', l: GADS, n: 'Google Ads (MCC)', s: 'Conecte para importar as contas do seu MCC automaticamente.', btn: '<button class="btn-oauth google">' + GOOGLE_G + 'Conectar com o Google</button>' },
    { cls: 'meta', l: META, n: 'Meta Ads', s: 'Conecte para importar suas contas de anúncio automaticamente.', btn: '<button class="btn-oauth meta">' + FB_F + 'Conectar com o Facebook</button>' },
  ].forEach((x) => {
    const c = el('<div class="card integration"><div class="logo ' + x.cls + '">' + x.l + '</div>' +
      '<div class="info"><b>' + x.n + '</b><p>' + x.s + '</p></div></div>');
    const b = el(x.btn);
    b.onclick = () => toast('Botão pronto! A conexão real liga quando o token/app estiver aprovado.');
    c.appendChild(b);
    conn.appendChild(c);
  });
  v.appendChild(conn);

  const card = el('<div class="card"><div class="card-head"><h3>Contas detectadas</h3><span class="sub">aparecem automaticamente após conectar</span></div></div>');
  if (!DATA.contas.length) {
    card.appendChild(el(emptyState(I.plug, 'Nenhuma conta conectada',
      'Conecte o Google Ads ou o Meta acima e as contas serão importadas automaticamente para cá.')));
  } else {
    const wrap = el('<div class="table-wrap"><table class="data"><thead><tr><th>Conta</th><th>Plataforma</th><th>ID</th><th>Status</th><th>Último relatório</th></tr></thead><tbody></tbody></table></div>');
    const tb = $('tbody', wrap);
    DATA.contas.forEach((c) => tb.appendChild(el(
      '<tr><td><div class="cell-lead"><span class="avatar-sm">' + initials(c.nome) + '</span><span class="strong">' + c.nome + '</span></div></td>' +
      '<td>' + platTag(c.plat) + '</td><td class="muted tnum">' + c.id + '</td>' +
      '<td><span class="pill warn"><span class="dot"></span>Pendente</span></td><td class="muted">' + c.ultimo + '</td></tr>'
    )));
    card.appendChild(wrap);
  }
  v.appendChild(card);
  $('#ctSync').onclick = () => toast('Sincronização disponível após conectar Google/Meta.');
}

/* ---- Clientes ---- */
function renderClientes(v) {
  v.appendChild(el(
    '<div class="page-head"><div class="titles"><h2>Clientes</h2><p>Vincule cada conta a um número de WhatsApp e a um gestor responsável.</p></div>' +
    '<div class="actions"><button class="btn btn-primary" id="clNew">' + I.plus + 'Novo cliente</button></div></div>'
  ));

  const card = el('<div class="card"></div>');
  if (!DATA.clientes.length) {
    card.appendChild(el(emptyState(I.users, 'Nenhum cliente cadastrado',
      'Cadastre seus clientes e vincule cada um a um número de WhatsApp e a um gestor para começar a enviar relatórios.',
      '<button class="btn btn-primary btn-sm" id="clEmptyNew">' + I.plus + 'Cadastrar cliente</button>')));
    v.appendChild(card);
    $('#clNew').onclick = openClienteModal;
    $('#clEmptyNew').onclick = openClienteModal;
    return;
  }
  const wrap = el('<div class="table-wrap"><table class="data"><thead><tr>' +
    '<th>Cliente</th><th>Contas vinculadas</th><th>WhatsApp</th><th>Gestor</th><th>Ativo</th><th></th></tr></thead><tbody></tbody></table></div>');
  const tb = $('tbody', wrap);
  DATA.clientes.forEach((c) => {
    const contas = c.contas.map((n) => '<span class="pill mute" style="margin-right:4px">' + n + '</span>').join('');
    tb.appendChild(el(
      '<tr><td><div class="cell-lead"><span class="avatar-sm">' + initials(c.nome) + '</span><span class="strong">' + c.nome + '</span></div></td>' +
      '<td>' + contas + '</td><td class="tnum">' + c.whats + '</td><td class="muted">' + c.gestor + '</td>' +
      '<td><label class="switch"><input type="checkbox" ' + (c.ativo ? 'checked' : '') + '><span class="track"></span></label></td>' +
      '<td><div class="row-actions"><button class="icon-btn" title="Editar">' + I.edit + '</button><button class="icon-btn" title="Remover">' + I.trash + '</button></div></td></tr>'
    ));
  });
  card.appendChild(wrap);
  v.appendChild(card);
  $('#clNew').onclick = openClienteModal;
  card.querySelectorAll('.switch input').forEach((s) => s.onchange = (e) => toast(e.target.checked ? 'Cliente ativado.' : 'Cliente pausado.'));
  card.querySelectorAll('.icon-btn').forEach((b) => b.onclick = () => toast('Edição de clientes conecta ao back-end na próxima fase.'));
}

function openClienteModal() {
  openModal('Novo cliente',
    '<div class="form-grid">' +
    '<div class="field full"><label>Nome do cliente <span class="req">*</span></label><input class="input" placeholder="Ex.: Nome do cliente"></div>' +
    '<div class="field"><label>WhatsApp (destinatário) <span class="req">*</span></label><input class="input" type="tel" placeholder="+55 34 99999-0000"></div>' +
    '<div class="field"><label>Gestor responsável</label><input class="input" placeholder="Ex.: Gabriel"></div>' +
    '<div class="field full"><label>Contas vinculadas</label><select class="select"><option>Selecione após conectar Google/Meta…</option></select><span class="hint">Você poderá vincular uma ou mais contas de anúncio.</span></div>' +
    '</div>',
    '<button class="btn btn-ghost" onclick="document.getElementById(\'modalScrim\').classList.remove(\'open\')">Cancelar</button>' +
    '<button class="btn btn-primary" id="doCliente">Salvar cliente</button>'
  );
  $('#doCliente').onclick = () => { closeModal(); toast('Cliente salvo (persistência entra na próxima fase).'); };
}

/* ---- Configurações ---- */
function renderConfig(v) {
  v.appendChild(el(
    '<div class="page-head"><div class="titles"><h2>Configurações</h2><p>Credenciais das integrações. Ficam salvas no servidor e não são versionadas.</p></div></div>'
  ));

  // Google — OAuth
  v.appendChild(oauthCard('google', 'Google Ads (MCC)',
    'Importa as métricas de todas as contas do seu MCC.',
    'Autorize <b>uma vez</b> com a conta que gerencia o MCC — todas as contas-filhas entram automaticamente. Sem tokens na mão, sem adicionar ninguém como administrador.',
    '<button class="btn-oauth google">' + GOOGLE_G + 'Conectar com o Google</button>'));

  // Meta — OAuth
  v.appendChild(oauthCard('meta', 'Meta Ads',
    'Acessa as contas de anúncio do Gerenciador de Negócios.',
    'Faça login <b>uma vez</b> como admin do Gerenciador de Negócios e todas as contas de anúncio ficam disponíveis. Sem copiar tokens.',
    '<button class="btn-oauth meta">' + FB_F + 'Conectar com o Facebook</button>'));

  // OpenAI — real
  const ai = credCard('ai', '', 'OpenAI',
    'Lê os dados e escreve o texto do relatório.',
    [
      { l: 'API Key', ph: 'sk-...', pass: true, id: 'aiKey', req: true },
    ], 'mute', 'Verificando…', aiMini(), true);
  v.appendChild(ai);

  wireOpenAI(ai);
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

navigate();
