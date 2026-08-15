// ----- Helpers -----
const $ = (sel) => document.querySelector(sel);
const el = (tag, props = {}, children = []) => {
  const n = document.createElement(tag);
  Object.entries(props).forEach(([k, v]) => {
    if (k === 'class') n.className = v;
    else if (k === 'html') n.innerHTML = v;
    else if (k.startsWith('on')) n.addEventListener(k.slice(2), v);
    else if (v !== undefined && v !== null) n.setAttribute(k, v);
  });
  (Array.isArray(children) ? children : [children]).forEach((c) => {
    if (c == null) return;
    n.appendChild(typeof c === 'string' ? document.createTextNode(c) : c);
  });
  return n;
};

const MESES = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

// Nº de dias do mês (índice 0-11) num dado ano.
function diasNoMes(mi, y) {
  return mi >= 0 ? new Date(y, mi + 1, 0).getDate() : 31;
}

// "2026-08-03" -> {d:3, m:7, y:2026} (sem fuso: parse manual)
function parseISO(iso) {
  const [y, m, d] = String(iso || '').split('-').map(Number);
  if (!y || !m || !d) return null;
  return { d, m: m - 1, y };
}
// {y, mi, dia} -> "2026-08-03"
function toISO(y, mi, dia) {
  return `${y}-${String(mi + 1).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;
}

// Monta o texto do período a partir de duas datas (ISO). Ordena início/fim.
//   Mesmo mês/ano:  "13 a 31 de Maio de 2026"
//   Meses no mesmo ano: "27 de Julho a 3 de Agosto de 2026"
//   Anos diferentes:    "28 de Dezembro de 2025 a 3 de Janeiro de 2026"
function periodoFromDatas(startISO, endISO) {
  let a = parseISO(startISO), b = parseISO(endISO);
  if (!a || !b) return '';
  if (a.y * 10000 + a.m * 100 + a.d > b.y * 10000 + b.m * 100 + b.d) { const t = a; a = b; b = t; }
  if (a.m === b.m && a.y === b.y) return `${a.d} a ${b.d} de ${MESES[a.m]} de ${a.y}`;
  if (a.y === b.y) return `${a.d} de ${MESES[a.m]} a ${b.d} de ${MESES[b.m]} de ${a.y}`;
  return `${a.d} de ${MESES[a.m]} de ${a.y} a ${b.d} de ${MESES[b.m]} de ${b.y}`;
}

// ---------- Date picker custom (tema verde) ----------
const DP_WEEK = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];
const cmpDate = (a, b) => (a.y * 10000 + a.m * 100 + a.d) - (b.y * 10000 + b.m * 100 + b.d);

// "2026-08-03" -> "03/08/2026"
function fmtBR(iso) {
  const p = parseISO(iso);
  return p ? `${String(p.d).padStart(2, '0')}/${String(p.m + 1).padStart(2, '0')}/${p.y}` : '';
}
// Lê/grava a data do campo. A fonte de verdade é dataset.iso; o value mostra dd/mm/aaaa.
function dpIso(input) { return input.dataset.iso || ''; }
function dpSet(input, iso, silent) {
  input.dataset.iso = iso || '';
  input.value = fmtBR(iso);
  if (!silent) input.dispatchEvent(new Event('change'));
}

// Anexa um calendário custom a um <input> readonly. opts.partner = campo par (realce de intervalo).
function attachDatePicker(input, opts = {}) {
  input.readOnly = true;
  const wrap = input.closest('.field') || input.parentElement;
  wrap.classList.add('dp-field');
  const pop = el('div', { class: 'dp-pop hidden' });
  wrap.appendChild(pop);
  let view = null; // {y, m} do mês exibido

  const render = () => {
    const sel = parseISO(input.dataset.iso);
    if (!view) {
      const base = sel || (() => { const t = new Date(); return { y: t.getFullYear(), m: t.getMonth() }; })();
      view = { y: base.y, m: base.m };
    }
    const { y, m } = view;
    const startDow = new Date(y, m, 1).getDay();
    const days = diasNoMes(m, y);
    const partner = opts.partner ? parseISO(opts.partner.dataset.iso) : null;
    const lo = sel && partner ? (cmpDate(sel, partner) <= 0 ? sel : partner) : null;
    const hi = sel && partner ? (cmpDate(sel, partner) <= 0 ? partner : sel) : null;
    const today = new Date();

    pop.innerHTML = '';
    const prev = el('button', { class: 'dp-nav', type: 'button', 'aria-label': 'Mês anterior' }, '‹');
    const next = el('button', { class: 'dp-nav', type: 'button', 'aria-label': 'Próximo mês' }, '›');
    prev.onclick = (e) => { e.stopPropagation(); view = m === 0 ? { y: y - 1, m: 11 } : { y, m: m - 1 }; render(); };
    next.onclick = (e) => { e.stopPropagation(); view = m === 11 ? { y: y + 1, m: 0 } : { y, m: m + 1 }; render(); };
    pop.append(el('div', { class: 'dp-head' }, [prev, el('div', { class: 'dp-title' }, `${MESES[m]} de ${y}`), next]));

    const grid = el('div', { class: 'dp-grid' });
    DP_WEEK.forEach((d) => grid.append(el('div', { class: 'dp-dow' }, d)));
    for (let i = 0; i < startDow; i++) grid.append(el('div', { class: 'dp-cell' }));
    for (let d = 1; d <= days; d++) {
      const cur = { y, m, d };
      const cls = ['dp-cell', 'dp-day'];
      if (sel && sel.y === y && sel.m === m && sel.d === d) cls.push('dp-sel');
      else if (lo && hi && cmpDate(cur, lo) >= 0 && cmpDate(cur, hi) <= 0) cls.push('dp-inrange');
      if (today.getFullYear() === y && today.getMonth() === m && today.getDate() === d) cls.push('dp-today');
      const cell = el('div', { class: cls.join(' ') }, String(d));
      cell.onclick = (e) => { e.stopPropagation(); dpSet(input, toISO(y, m, d)); close(); };
      grid.append(cell);
    }
    pop.append(grid);

    const hoje = el('button', { class: 'dp-link', type: 'button' }, 'Hoje');
    hoje.onclick = (e) => { e.stopPropagation(); const t = new Date(); dpSet(input, toISO(t.getFullYear(), t.getMonth(), t.getDate())); close(); };
    const goto = el('button', { class: 'dp-link', type: 'button' }, 'Ir para hoje');
    goto.onclick = (e) => { e.stopPropagation(); const t = new Date(); view = { y: t.getFullYear(), m: t.getMonth() }; render(); };
    pop.append(el('div', { class: 'dp-foot' }, [goto, hoje]));
  };

  const open = () => {
    document.querySelectorAll('.dp-pop').forEach((p) => p.classList.add('hidden')); // fecha os outros
    view = null; render(); pop.classList.remove('hidden');
  };
  const close = () => pop.classList.add('hidden');

  input.addEventListener('click', (e) => { e.stopPropagation(); pop.classList.contains('hidden') ? open() : close(); });
  input.addEventListener('focus', open);
  input.addEventListener('keydown', (e) => { if (e.key === 'Escape' || e.key === 'Tab') close(); });
  pop.addEventListener('click', (e) => e.stopPropagation());
  document.addEventListener('click', close);
}

// Liga um controle de período (mês inteiro OU intervalo por calendário) e mantém o preview.
// Retorna um getter que devolve a string atual do período.
function setupPeriodo({ modeId, startWrapId, endWrapId, startId, endId, viewId, mesId, anoId, onChange }) {
  const refMes = () => {
    const mi = MESES.indexOf($(mesId).value);
    const y = parseInt($(anoId).value, 10) || new Date().getFullYear();
    return { mi, y, last: diasNoMes(mi, y) };
  };
  const textoMesInteiro = () => {
    const { mi, y, last } = refMes();
    return `1 a ${last} de ${MESES[mi]} de ${y}`;
  };
  // Preenche o calendário com o mês de referência inteiro.
  const prefillMes = () => {
    const { mi, y, last } = refMes();
    dpSet($(startId), toISO(y, mi, 1), true);
    dpSet($(endId), toISO(y, mi, last), true);
  };
  const get = () => {
    if ($(modeId).value !== 'custom') return textoMesInteiro();
    return periodoFromDatas(dpIso($(startId)), dpIso($(endId))) || textoMesInteiro();
  };
  const upd = () => {
    const custom = $(modeId).value === 'custom';
    $(startWrapId).classList.toggle('hidden', !custom);
    $(endWrapId).classList.toggle('hidden', !custom);
    const txt = get();
    $(viewId).textContent = '→ ' + txt;
    if (onChange) onChange(txt);
  };
  // Date pickers custom (tema verde) com realce de intervalo entre os dois campos.
  attachDatePicker($(startId), { partner: $(endId) });
  attachDatePicker($(endId), { partner: $(startId) });
  // Ao entrar no modo personalizado sem datas, prefill com o mês de referência.
  $(modeId).addEventListener('change', () => {
    if ($(modeId).value === 'custom' && !dpIso($(startId))) prefillMes();
    upd();
  });
  // Trocar mês/ano reajusta o intervalo para o novo mês (referência é o guia).
  [mesId, anoId].forEach((id) => $(id).addEventListener('change', () => {
    if ($(modeId).value === 'custom') prefillMes();
    upd();
  }));
  [startId, endId].forEach((id) => $(id).addEventListener('change', upd));
  upd();
  // Datas resolvidas do período (para rotular o gráfico por faixas de data).
  get.dates = () => {
    if ($(modeId).value === 'custom') return { startISO: dpIso($(startId)), endISO: dpIso($(endId)) };
    const { mi, y, last } = refMes();
    return { startISO: toISO(y, mi, 1), endISO: toISO(y, mi, last) };
  };
  return get;
}

let getIndividualPeriodo = () => '';
let getBulkPeriodo = () => '';

// Meses abreviados (rótulos do gráfico).
const MES_ABBR = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];

// Troca os labels do gráfico por faixas de data (mantém o resto). Fallback: labels da IA.
function relabelGrafico(g, dates = {}) {
  const base = g || { subtitulo: '', labels: [], valores: [] };
  const valores = base.valores || [];
  const datas = weekLabels(dates.startISO, dates.endISO, valores.length);
  return { ...base, labels: datas.length === valores.length ? datas : (base.labels || []) };
}

// Divide [start,end] em n blocos contíguos e rotula cada um pela faixa de datas.
//   Mesmo mês: "1–7 ago" · Meses diferentes: "27 jul–2 ago"
function weekLabels(startISO, endISO, n) {
  const a = parseISO(startISO), b = parseISO(endISO);
  if (!a || !b || !n) return [];
  let s = new Date(a.y, a.m, a.d), e = new Date(b.y, b.m, b.d);
  if (e < s) { const t = s; s = e; e = t; }
  const totalDays = Math.round((e - s) / 86400000) + 1;
  const out = [];
  for (let i = 0; i < n; i++) {
    const from = new Date(s); from.setDate(s.getDate() + Math.floor((i * totalDays) / n));
    const to = new Date(s); to.setDate(s.getDate() + Math.floor(((i + 1) * totalDays) / n) - 1);
    out.push(
      from.getTime() === to.getTime()
        ? `${from.getDate()} ${MES_ABBR[from.getMonth()]}`
        : from.getMonth() === to.getMonth()
          ? `${from.getDate()}–${to.getDate()} ${MES_ABBR[from.getMonth()]}`
          : `${from.getDate()} ${MES_ABBR[from.getMonth()]}–${to.getDate()} ${MES_ABBR[to.getMonth()]}`
    );
  }
  return out;
}

let toastTimer;
function toast(msg, isErr = false) {
  const t = $('#toast');
  t.textContent = msg;
  t.className = 'toast show' + (isErr ? ' err' : '');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => (t.className = 'toast'), 3200);
}

const files = [null, null]; // print 1, print 2
let activeSingleIdx = -1; // último dropzone individual focado/clicado (-1 = nenhum)

// Extrai imagens da área de transferência (Ctrl+V)
function imagesFromClipboard(e) {
  const items = e.clipboardData && e.clipboardData.items ? [...e.clipboardData.items] : [];
  return items
    .filter((it) => it.kind === 'file' && it.type.startsWith('image/'))
    .map((it) => it.getAsFile())
    .filter(Boolean);
}

// Colar imagem (Ctrl+V) carrega no campo certo conforme a aba ativa
function handleGlobalPaste(e) {
  const imgs = imagesFromClipboard(e);
  if (!imgs.length) return;
  e.preventDefault();

  const bulkVisible = !$('#modeBulk').classList.contains('hidden');
  if (bulkVisible) {
    addBulkFiles(imgs);
    toast(`${imgs.length} print(s) colado(s) ✓`);
    return;
  }

  // modo individual: usa o campo focado, senão preenche os vazios em ordem
  let target = activeSingleIdx >= 0 ? activeSingleIdx : files.findIndex((f) => !f);
  if (target < 0) target = 0;
  for (const img of imgs.slice(0, 2)) {
    setFile(target === 0 ? $('#dz1') : $('#dz2'), target, img);
    const empty = files.findIndex((f) => !f);
    target = empty !== -1 ? empty : (target === 0 ? 1 : 0);
  }
  activeSingleIdx = -1;
  toast('Print colado ✓');
}

// ----- Init -----
async function init() {
  // meses
  const mesSel = $('#mes');
  MESES.forEach((m, i) => mesSel.appendChild(el('option', { value: m }, m)));
  mesSel.selectedIndex = new Date().getMonth();

  getIndividualPeriodo = setupPeriodo({
    modeId: '#iPerMode', startWrapId: '#iPerStartWrap', endWrapId: '#iPerEndWrap',
    startId: '#iPerStart', endId: '#iPerEnd', viewId: '#iPerView',
    mesId: '#mes', anoId: '#ano',
    onChange: (txt) => { const p = $('#periodo'); if (p) p.value = txt; },
  });

  // gerado em
  const now = new Date();
  $('#geradoEm').value = '';
  $('#geradoEmDefault') && ($('#geradoEmDefault').value = '');

  // perfil (mostra/esconde as configurações da IA)
  $('#profileBtn').addEventListener('click', () => toggleProfile(true));
  $('#profileBackBtn').addEventListener('click', () => toggleProfile(false));

  // configurações (chave + modelo)
  $('#saveKeyBtn').addEventListener('click', saveKey);
  $('#removeKeyBtn').addEventListener('click', removeKey);
  $('#reloadModelsBtn').addEventListener('click', () => loadModels(true));
  $('#modelSelect').addEventListener('change', saveModel);
  await loadSettings();
  await loadModels(false);

  setupDropzone($('#dz1'), 0);
  setupDropzone($('#dz2'), 1);
  document.addEventListener('paste', handleGlobalPaste);

  $('#extractBtn').addEventListener('click', doExtract);
  $('#generateBtn').addEventListener('click', doGenerate);
  $('#previewBtn').addEventListener('click', doPreview);
  $('#addSemana').addEventListener('click', () => addSemanaRow('', ''));
  $('#addLeilao').addEventListener('click', () => addLeilaoRow({}));
  $('#addPasso').addEventListener('click', () => addPassoCard({}));

  setupBulk();
}

// ----- Perfil -----
function toggleProfile(show) {
  $('#settingsCard').classList.toggle('hidden', !show);
  $('#mainView').classList.toggle('hidden', show);
  if (show) window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ----- Configurações (chave + modelo) -----
let currentModel = '';

async function loadSettings() {
  try {
    const s = await (await fetch('/api/settings')).json();
    const status = $('#settingsStatus');
    const removeBtn = $('#removeKeyBtn');
    const saveBtn = $('#saveKeyBtn');
    const input = $('#apiKey');

    // Vercel/serverless: disco é só-leitura, a chave vem da env var OPENAI_API_KEY.
    if (s.readonly) {
      input.disabled = true;
      saveBtn.disabled = true;
      removeBtn.classList.add('hidden');
      if (s.hasKey) {
        status.textContent = '✅ chave via ambiente';
        status.style.color = 'var(--forest)';
        input.placeholder = s.keyMasked + ' — definida em OPENAI_API_KEY';
        $('#keyStatus').textContent = 'Chave configurada pelas Environment Variables do Vercel (OPENAI_API_KEY).';
      } else {
        status.textContent = '⚠️ defina OPENAI_API_KEY no Vercel';
        status.style.color = 'var(--danger)';
        input.placeholder = 'definir em Vercel → Settings → Environment Variables';
        $('#keyStatus').textContent =
          'Sem chave. Cadastre OPENAI_API_KEY nas Environment Variables do projeto no Vercel e refaça o deploy.';
      }
      return;
    }

    // Local: chave gerenciada pela interface (data/settings.json)
    if (s.hasKey) {
      status.textContent = '✅ chave configurada';
      status.style.color = 'var(--forest)';
      $('#keyStatus').textContent =
        'Chave salva: ' + s.keyMasked +
        (s.keyFromEnv ? ' (via .env — remova no arquivo)' : ' · para trocar, cole uma nova e salve');
      input.placeholder = s.keyMasked + ' — deixe em branco para manter';
      removeBtn.classList.toggle('hidden', s.keyFromEnv);
    } else {
      status.textContent = '⚠️ cole sua API key abaixo';
      status.style.color = 'var(--danger)';
      $('#keyStatus').textContent = 'Nenhuma chave configurada ainda.';
      input.placeholder = 'sk-...';
      removeBtn.classList.add('hidden');
    }
  } catch {}
}

async function saveKey() {
  const apiKey = $('#apiKey').value.trim();
  if (!apiKey) return toast('Cole a API key.', true);
  $('#saveKeyBtn').disabled = true;
  try {
    const r = await fetch('/api/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ apiKey }),
    });
    if (!r.ok) throw new Error('Falha ao salvar.');
    $('#apiKey').value = '';
    await loadSettings();
    await loadModels(true); // já busca os modelos da conta com a chave nova
    toast('Chave salva! Agora escolha o modelo.');
  } catch (e) {
    toast(e.message, true);
  } finally {
    $('#saveKeyBtn').disabled = false;
  }
}

async function removeKey() {
  if (!confirm('Remover a chave da OpenAI salva neste sistema?')) return;
  try {
    const r = await fetch('/api/settings/key', { method: 'DELETE' });
    if (!r.ok) throw new Error('Falha ao remover.');
    $('#apiKey').value = '';
    await loadSettings();
    await loadModels(false);
    toast('Chave removida.');
  } catch (e) {
    toast(e.message, true);
  }
}

const MODEL_KEY = 'lastone_model';

async function loadModels(_fromAccount) {
  const sel = $('#modelSelect');
  const st = $('#modelStatus');
  st.textContent = 'carregando…';
  try {
    const data = await (await fetch('/api/models')).json();
    const models = data.models || [];
    // fonte do modelo: navegador (localStorage) > padrão do servidor > 1º da lista
    currentModel = localStorage.getItem(MODEL_KEY) || data.current || models[0] || '';
    sel.innerHTML = '';
    if (currentModel && !models.includes(currentModel)) models.unshift(currentModel);
    models.forEach((m) => sel.appendChild(el('option', { value: m }, m)));
    sel.value = currentModel;
    st.textContent =
      data.source === 'account'
        ? `${models.length} modelos da sua conta`
        : 'lista padrão (configure a chave para ver os da sua conta)';
    if (data.error) st.textContent += ' · ' + data.error;
  } catch {
    st.textContent = 'não consegui carregar modelos';
  }
}

async function saveModel() {
  const model = $('#modelSelect').value;
  currentModel = model;
  localStorage.setItem(MODEL_KEY, model); // fonte da verdade (enviado em cada requisição)
  // tenta persistir no servidor também (no local funciona; no Vercel é no-op)
  try {
    await fetch('/api/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model }),
    });
  } catch {}
  toast('Modelo: ' + model);
}

// Sistema não guarda clientes: é só preencher e gerar. `clients` fica vazio
// (mantido só para o agrupamento do modo em massa, que lida com lista vazia).
let clients = [];

// ----- Dropzones -----
function setupDropzone(dz, idx) {
  const input = dz.querySelector('input[type="file"]');
  const markActive = () => { activeSingleIdx = idx; };
  dz.addEventListener('mousedown', markActive);
  dz.addEventListener('focus', markActive);
  dz.addEventListener('click', () => input.click());
  input.addEventListener('change', () => input.files[0] && setFile(dz, idx, input.files[0]));
  ['dragover', 'dragenter'].forEach((ev) =>
    dz.addEventListener(ev, (e) => { e.preventDefault(); dz.classList.add('drag'); }));
  ['dragleave', 'drop'].forEach((ev) =>
    dz.addEventListener(ev, (e) => { e.preventDefault(); dz.classList.remove('drag'); }));
  dz.addEventListener('drop', (e) => {
    const f = e.dataTransfer.files[0];
    if (f && f.type.startsWith('image/')) setFile(dz, idx, f);
  });
}

function setFile(dz, idx, file) {
  files[idx] = file;
  dz.classList.add('has-file');
  const old = dz.querySelector('img.preview');
  if (old) old.remove();
  const url = URL.createObjectURL(file);
  dz.appendChild(el('img', { class: 'preview', src: url }));
  $('#extractBtn').disabled = !(files[0] && files[1]);
}

// ----- Extração -----
async function doExtract() {
  if (!(files[0] && files[1])) return;
  const cliente = $('#clienteNome').value.trim();
  setBusy('#extractBtn', '#extractLabel', true, 'Lendo prints…');
  $('#extractStatus').textContent = 'A IA está lendo as imagens…';
  try {
    const fd = new FormData();
    fd.append('prints', files[0]);
    fd.append('prints', files[1]);
    fd.append('cliente', cliente);
    fd.append('semCustoPorConversao', $('#semCpc').checked ? 'true' : 'false');
    if (currentModel) fd.append('model', currentModel);

    const r = await fetch('/api/extract', { method: 'POST', body: fd });
    const data = await r.json();
    if (!r.ok) throw new Error(data.error || 'Falha na extração.');

    renderReview(data);
    $('#extractStatus').textContent = '✅ Pronto — confira abaixo.';
    $('#reviewCard').scrollIntoView({ behavior: 'smooth' });
  } catch (e) {
    toast(e.message, true);
    $('#extractStatus').textContent = '';
  } finally {
    setBusy('#extractBtn', '#extractLabel', false, '🔍 Ler prints com a IA');
  }
}

// ----- Render conferência -----
function renderReview(d) {
  $('#reviewCard').classList.remove('hidden');
  $('#periodo').value = getIndividualPeriodo() || d.periodo || '';
  const now = new Date();
  $('#geradoEm').value =
    String(now.getDate()).padStart(2, '0') + '/' +
    String(now.getMonth() + 1).padStart(2, '0') + '/' + now.getFullYear();

  // avisos
  const box = $('#avisosBox');
  if (d.avisos && d.avisos.length) {
    box.classList.remove('hidden');
    box.innerHTML = '<b>⚠️ Transparência (avise o cliente):</b>';
    const ul = el('ul');
    d.avisos.forEach((a) => ul.appendChild(el('li', {}, a)));
    box.appendChild(ul);
  } else box.classList.add('hidden');

  // métricas
  const mg = $('#metricasGrid');
  mg.innerHTML = '';
  (d.metricas || []).forEach((m) => addMetricCard(m));

  // gráfico
  $('#graficoSub').value = d.grafico?.subtitulo || '';
  $('#graficoRows').innerHTML = '';
  const valores = d.grafico?.valores || [];
  // Rótulos por faixa de datas (determinístico), com fallback nos rótulos da IA.
  const { startISO, endISO } = getIndividualPeriodo.dates ? getIndividualPeriodo.dates() : {};
  const datas = weekLabels(startISO, endISO, valores.length);
  const labels = datas.length === valores.length ? datas : (d.grafico?.labels || []);
  labels.forEach((l, i) => addSemanaRow(l, valores[i] ?? ''));
  updateSoma();

  // leilão
  $('#leilaoTable').querySelector('tbody').innerHTML = '';
  (d.leilao || []).forEach((row) => addLeilaoRow(row));

  // passos
  $('#passosGrid').innerHTML = '';
  (d.passos || []).forEach((p) => addPassoCard(p));
}

function addMetricCard(m = {}) {
  const card = el('div', { class: 'metric-edit' }, [
    fieldInput('Label', m.label || '', 'm-label'),
    fieldInput('Valor', m.value || '', 'm-value'),
    el('label', { class: 'checkrow' }, [
      checkbox(m.cur, 'm-cur'), document.createTextNode(' Prefixo R$'),
    ]),
    fieldInput('Sub (contexto)', m.sub || '', 'm-sub'),
  ]);
  $('#metricasGrid').appendChild(card);
}

function addSemanaRow(label = '', valor = '') {
  const row = el('div', { class: 'grid', style: 'grid-template-columns: 2fr 1fr 36px; gap:8px; margin-bottom:8px;' }, [
    el('input', { type: 'text', class: 's-label', value: label, placeholder: 'Semana 1' }),
    el('input', { type: 'number', class: 's-valor', value: valor, placeholder: '0', oninput: updateSoma }),
    el('button', { class: 'btn btn-link', onclick: (e) => { e.target.closest('div').remove(); updateSoma(); } }, '✕'),
  ]);
  $('#graficoRows').appendChild(row);
}

function updateSoma() {
  const vals = [...document.querySelectorAll('.s-valor')].map((i) => Number(i.value) || 0);
  const soma = vals.reduce((a, b) => a + b, 0);
  const conv = parseBR(document.querySelector('.m-value')?.value || '0');
  const ok = Math.abs(soma - conv) < 0.5;
  $('#somaSemanas').innerHTML = `Soma das semanas: <b>${soma}</b> · Conversões totais: <b>${conv}</b> ` +
    (ok ? '✅' : '⚠️ devem ser iguais');
}

function parseBR(s) {
  return Number(String(s).replace(/\./g, '').replace(',', '.')) || 0;
}

function addLeilaoRow(r = {}) {
  const tr = el('tr', {}, [
    el('td', {}, el('input', { type: 'text', value: r.dominio || '' })),
    el('td', {}, el('input', { type: 'text', class: 'small', value: r.parcela || '' })),
    el('td', {}, el('input', { type: 'text', class: 'small', value: r.sobreposicao || '' })),
    el('td', {}, el('input', { type: 'text', class: 'small', value: r.posicaoAcima || '' })),
    el('td', {}, el('input', { type: 'text', class: 'small', value: r.topo || '' })),
    el('td', { class: 'center' }, checkbox(r.ehVoce)),
    el('td', { class: 'center' }, el('button', { class: 'btn btn-link', onclick: (e) => e.target.closest('tr').remove() }, '✕')),
  ]);
  $('#leilaoTable').querySelector('tbody').appendChild(tr);
}

function addPassoCard(p = {}) {
  const card = el('div', { class: 'step-edit' }, [
    el('input', { type: 'text', class: 'p-tag', value: p.tag || '', placeholder: 'Tag (ex.: Impacto alto)' }),
    el('input', { type: 'text', class: 'p-titulo', value: p.titulo || '', placeholder: 'Título' }),
    el('textarea', { class: 'p-texto', placeholder: 'Texto (2–3 linhas)' }, p.texto || ''),
    el('button', { class: 'btn btn-link', onclick: (e) => e.target.closest('.step-edit').remove() }, '✕ remover'),
  ]);
  $('#passosGrid').appendChild(card);
}

// small builders
function fieldInput(labelText, value, cls) {
  return el('label', { class: 'field', style: 'margin-bottom:8px;' }, [
    el('span', {}, labelText),
    el('input', { type: 'text', class: cls, value }),
  ]);
}
function checkbox(checked, cls = '') {
  const c = el('input', { type: 'checkbox', class: cls });
  c.checked = !!checked;
  return c;
}

// ----- Coleta do CFG -----
function collectCfg() {
  const metricas = [...$('#metricasGrid').children].map((card) => ({
    label: card.querySelector('.m-label').value,
    value: card.querySelector('.m-value').value,
    cur: card.querySelector('.m-cur').checked,
    sub: card.querySelector('.m-sub').value,
  }));

  const labels = [...document.querySelectorAll('.s-label')].map((i) => i.value);
  const valores = [...document.querySelectorAll('.s-valor')].map((i) => Number(i.value) || 0);

  const leilao = [...$('#leilaoTable').querySelectorAll('tbody tr')].map((tr) => {
    const inp = tr.querySelectorAll('input[type="text"]');
    return {
      dominio: inp[0].value,
      parcela: inp[1].value,
      sobreposicao: inp[2].value,
      posicaoAcima: inp[3].value,
      topo: inp[4].value,
      ehVoce: tr.querySelector('input[type="checkbox"]').checked,
    };
  });

  const passos = [...$('#passosGrid').children].map((c) => ({
    tag: c.querySelector('.p-tag').value,
    titulo: c.querySelector('.p-titulo').value,
    texto: c.querySelector('.p-texto').value,
  }));

  return {
    cliente: $('#clienteNome').value.trim(),
    mes: $('#mes').value,
    ano: String($('#ano').value).trim(),
    periodo: $('#periodo').value,
    gerado_em: $('#geradoEm').value,
    gestor: $('#gestor').value.trim(),
    metricas,
    grafico: { subtitulo: $('#graficoSub').value, labels, valores },
    leilao,
    passos,
  };
}

function validateCfg(cfg) {
  if (!cfg.cliente) return 'Informe o nome do cliente.';
  if (!cfg.metricas.length) return 'Adicione pelo menos uma métrica.';
  if (!cfg.leilao.length) return 'Adicione pelo menos um concorrente na tabela de leilão.';
  return null;
}

// ----- Gerar PDF -----
async function doGenerate() {
  const cfg = collectCfg();
  const err = validateCfg(cfg);
  if (err) return toast(err, true);

  setBusy('#generateBtn', '#genLabel', true, 'Gerando PDF…');
  $('#genStatus').textContent = '';
  try {
    const r = await fetch('/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(cfg),
    });
    if (!r.ok) {
      const e = await r.json().catch(() => ({}));
      throw new Error(e.error || 'Falha ao gerar o PDF.');
    }
    const blob = await r.blob();
    const url = URL.createObjectURL(blob);
    const a = el('a', { href: url, download: `Relatório ${cfg.mes} - ${cfg.cliente}.pdf` });
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    $('#genStatus').textContent = '✅ Baixado.';
    toast('Relatório gerado!');
  } catch (e) {
    toast(e.message, true);
  } finally {
    setBusy('#generateBtn', '#genLabel', false, '📄 Gerar Relatório (PDF)');
  }
}

async function doPreview() {
  const cfg = collectCfg();
  const err = validateCfg(cfg);
  if (err) return toast(err, true);
  const r = await fetch('/api/preview', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(cfg),
  });
  const html = await r.text();
  const w = window.open('', '_blank');
  w.document.write(html);
  w.document.close();
}

function setBusy(btnSel, labelSel, busy, label) {
  const btn = $(btnSel);
  btn.disabled = busy;
  const l = $(labelSel);
  if (busy) {
    l.innerHTML = `<span class="spinner"></span> ${label}`;
  } else {
    l.textContent = label;
  }
}

// ===================== GERAÇÃO EM MASSA =====================
// bulkItems: cada print solto -> { file, cliente, tipo, identified, error }
// bulkGroups: agrupados por cliente (lido da imagem) -> { cliente, items, ... }
let bulkItems = [];
let bulkGroups = [];

function setupBulk() {
  // abas
  document.querySelectorAll('.tab').forEach((t) =>
    t.addEventListener('click', () => {
      document.querySelectorAll('.tab').forEach((x) => x.classList.remove('active'));
      t.classList.add('active');
      const mode = t.dataset.mode;
      $('#modeBulk').classList.toggle('hidden', mode !== 'bulk');
      $('#modeIndividual').classList.toggle('hidden', mode !== 'individual');
    })
  );

  // mês/ano da batelada
  const mesSel = $('#bMes');
  MESES.forEach((m) => mesSel.appendChild(el('option', { value: m }, m)));
  mesSel.selectedIndex = new Date().getMonth();

  getBulkPeriodo = setupPeriodo({
    modeId: '#bPerMode', startWrapId: '#bPerStartWrap', endWrapId: '#bPerEndWrap',
    startId: '#bPerStart', endId: '#bPerEnd', viewId: '#bPerView',
    mesId: '#bMes', anoId: '#bAno',
  });

  // dropzone
  const dz = $('#bulkDz');
  const input = $('#bulkInput');
  dz.addEventListener('click', () => input.click());
  input.addEventListener('change', () => addBulkFiles(input.files));
  ['dragover', 'dragenter'].forEach((ev) =>
    dz.addEventListener(ev, (e) => { e.preventDefault(); dz.classList.add('drag'); }));
  ['dragleave', 'drop'].forEach((ev) =>
    dz.addEventListener(ev, (e) => { e.preventDefault(); dz.classList.remove('drag'); }));
  dz.addEventListener('drop', (e) => addBulkFiles(e.dataTransfer.files));

  $('#bulkIdentifyBtn').addEventListener('click', identifyAll);
  $('#bulkClear').addEventListener('click', clearBulk);
  $('#bulkRunBtn').addEventListener('click', runBulk);
  $('#bulkZipBtn').addEventListener('click', downloadZip);
}

function addBulkFiles(fileList) {
  for (const f of fileList) {
    if (f.type && f.type.startsWith('image/')) {
      bulkItems.push({
        file: f, url: URL.createObjectURL(f),
        cliente: '', tipo: '', identified: false, error: '',
      });
    }
  }
  renderStaging();
}

function clearBulk() {
  bulkItems.forEach((it) => it.url && URL.revokeObjectURL(it.url));
  bulkItems = [];
  bulkGroups = [];
  $('#bulkInput').value = '';
  $('#bulkThumbs').innerHTML = '';
  $('#bulkGroupsCard').classList.add('hidden');
  $('#bulkCount').textContent = '';
  $('#bulkResultsCard').classList.add('hidden');
  $('#bulkResults').innerHTML = '';
  $('#bulkProgress').textContent = '';
  $('#bulkIdBarWrap').classList.add('hidden');
  $('#bulkBarWrap').classList.add('hidden');
  $('#bulkIdentifyBtn').disabled = true;
}

function renderStaging() {
  const n = bulkItems.length;
  const idCount = bulkItems.filter((i) => i.identified).length;
  $('#bulkCount').textContent = n
    ? `${n} print(s)` + (idCount ? ` · ${idCount} identificado(s)` : '')
    : '';
  $('#bulkIdentifyBtn').disabled = n === 0;

  // galeria de miniaturas
  const wrap = $('#bulkThumbs');
  wrap.innerHTML = '';
  bulkItems.forEach((it, idx) => {
    const tipoTxt = it.tipo === 'visao' ? 'visão geral' : it.tipo === 'leilao' ? 'leilão' : '';
    const cap = it.identified
      ? (it.cliente || '— sem nome') + (tipoTxt ? ' · ' + tipoTxt : '')
      : it.file.name;
    const thumb = el('div', { class: 'thumb' }, [
      el('button', { class: 'thumb-x', title: 'remover', onclick: () => removeItem(idx) }, '✕'),
      el('img', { src: it.url, alt: '' }),
      el('div', { class: 'thumb-cap' + (it.identified ? ' id' : ''), title: cap }, cap),
    ]);
    wrap.appendChild(thumb);
  });
}

function removeItem(idx) {
  const it = bulkItems[idx];
  if (it && it.url) URL.revokeObjectURL(it.url);
  bulkItems.splice(idx, 1);
  renderStaging();
  if (bulkGroups.length) buildGroups();
}

// ---- normalização para casar nomes ----
function norm(s) {
  return (s || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

// Canoniza o nome lido: se casar com um cliente salvo, usa o nome salvo.
function canonicalName(name) {
  const n = norm(name);
  if (!n) return '';
  for (const c of clients) {
    const cn = norm(c.nome);
    if (cn && (n === cn || n.includes(cn) || cn.includes(n))) return c.nome;
  }
  return name.trim();
}

// ---- Identificação (lê o cliente de cada print) ----
async function identifyAll() {
  const s = await (await fetch('/api/settings')).json();
  if (!s.hasKey) return toast('Configure a API key no painel ⚙ antes de identificar.', true);

  const todo = bulkItems.filter((i) => !i.identified);
  if (!todo.length) return buildGroups();

  setBusy('#bulkIdentifyBtn', '#bulkIdLabel', true, 'Identificando…');
  $('#bulkIdBarWrap').classList.remove('hidden');
  let done = 0;
  const total = todo.length;
  const bar = () => {
    $('#bulkCount').textContent = `identificando ${done}/${total}…`;
    $('#bulkIdBarFill').style.width = Math.round((done / total) * 100) + '%';
  };
  bar();

  let idx = 0;
  const CONC = 4;
  async function worker() {
    while (idx < todo.length) {
      const it = todo[idx++];
      try {
        const fd = new FormData();
        fd.append('print', it.file);
        if (currentModel) fd.append('model', currentModel);
        const r = await fetch('/api/identify', { method: 'POST', body: fd });
        const data = await r.json();
        if (!r.ok) throw new Error(data.error || 'falha');
        it.cliente = data.cliente || '';
        it.tipo = data.tipo || 'outro';
        it.identified = true;
      } catch (e) {
        it.error = e.message;
        it.identified = true;
        it.tipo = 'outro';
      }
      done++;
      bar();
    }
  }
  await Promise.all(Array.from({ length: Math.min(CONC, total) }, worker));

  setBusy('#bulkIdentifyBtn', '#bulkIdLabel', false, '🔎 Identificar clientes');
  $('#bulkIdBarWrap').classList.add('hidden');
  renderStaging();
  buildGroups();
  toast('Identificação concluída — confira os clientes abaixo.');
}

// Agrupa os itens identificados por nome de cliente (canonizado).
function buildGroups() {
  const map = new Map();
  for (const it of bulkItems) {
    const disp = canonicalName(it.cliente) || 'Sem nome';
    const key = norm(disp) || '(sem nome)';
    if (!map.has(key)) {
      const saved = clients.find((c) => norm(c.nome) === norm(disp));
      map.set(key, {
        cliente: disp,
        items: [],
        semCpc: saved ? !!saved.semCustoPorConversao : false,
        gestor: saved ? saved.gestor : '',
        status: 'wait',
        pdfBlob: null,
        avisos: [],
        error: '',
      });
    }
    map.get(key).items.push(it);
  }
  bulkGroups = [...map.values()].sort((a, b) => a.cliente.localeCompare(b.cliente, 'pt-BR'));
  renderBulkTable();
}

function tipoBadges(items) {
  const v = items.filter((i) => i.tipo === 'visao').length;
  const l = items.filter((i) => i.tipo === 'leilao').length;
  const o = items.filter((i) => i.tipo === 'outro').length;
  const parts = [];
  if (v) parts.push(v + '× visão');
  if (l) parts.push(l + '× leilão');
  if (o) parts.push(o + '× ?');
  return parts.join(', ');
}

function renderBulkTable() {
  if (!bulkGroups.length) {
    $('#bulkGroupsCard').classList.add('hidden');
    return;
  }
  $('#bulkGroupsCard').classList.remove('hidden');
  $('#bulkCount').textContent = `${bulkItems.length} print(s) · ${bulkGroups.length} cliente(s)`;
  const tb = $('#bulkTable').querySelector('tbody');
  tb.innerHTML = '';
  bulkGroups.forEach((g, i) => {
    const bad = g.items.length !== 2;
    const nameInput = el('input', { type: 'text', value: g.cliente });
    // renomear no blur re-agrupa (permite juntar clientes que a IA leu diferente)
    nameInput.addEventListener('change', () => {
      const novo = nameInput.value.trim();
      g.items.forEach((it) => { it.cliente = novo; });
      buildGroups();
    });
    const tr = el('tr', { class: bad ? 'row-bad' : '' }, [
      el('td', {}, nameInput),
      el('td', { class: 'center' }, `${g.items.length}${tipoBadges(g.items) ? ' (' + tipoBadges(g.items) + ')' : ''}`),
      el('td', { class: 'center' }, (() => {
        const c = checkbox(g.semCpc);
        c.addEventListener('change', () => { g.semCpc = c.checked; });
        return c;
      })()),
      el('td', { class: 'st-cell' }, statusSpan(g)),
      el('td', { class: 'center' }, el('button', {
        class: 'btn btn-link',
        onclick: () => removeGroup(i),
      }, '✕')),
    ]);
    g.row = tr;
    tb.appendChild(tr);
  });
}

function removeGroup(i) {
  const g = bulkGroups[i];
  if (!g) return;
  const set = new Set(g.items);
  bulkItems = bulkItems.filter((it) => !set.has(it));
  buildGroups();
  renderStaging();
}

function statusSpan(g) {
  const map = {
    wait: ['wait', g.items.length === 2 ? 'aguardando' : `⚠ ${g.items.length} print(s)`],
    run: ['run', '⏳ lendo…'],
    ok: ['ok', '✅ pronto'],
    warn: ['warn', '✅ pronto (revisar avisos)'],
    err: ['err', '❌ ' + (g.error || 'erro')],
  };
  const [cls, txt] = map[g.status] || map.wait;
  const span = el('span', { class: 'st ' + cls }, txt);
  if (g.pdfBlob) {
    const eye = el('a', { class: 'bulk-dl', href: '#', title: 'Ver como ficou', style: 'margin-left:10px;' }, '👁 ver');
    eye.addEventListener('click', (e) => { e.preventDefault(); previewOne(g); });
    const a = el('a', { class: 'bulk-dl', href: '#', style: 'margin-left:10px;' }, 'baixar');
    a.addEventListener('click', (e) => { e.preventDefault(); downloadOne(g); });
    return el('span', {}, [span, eye, a]);
  }
  return span;
}

function setBulkStatus(g, status) {
  g.status = status;
  if (g.row) {
    const cell = g.row.querySelector('.st-cell');
    cell.innerHTML = '';
    cell.appendChild(statusSpan(g));
  }
}

async function runBulk() {
  const s = await (await fetch('/api/settings')).json();
  if (!s.hasKey) return toast('Configure a API key no painel ⚙ antes de gerar.', true);

  const targets = bulkGroups.filter((g) => g.items.length === 2);
  if (!targets.length) return toast('Nenhum cliente com exatamente 2 prints.', true);

  setBusy('#bulkRunBtn', '#bulkRunLabel', true, 'Gerando…');
  $('#bulkResults').innerHTML = '';
  $('#bulkResultsCard').classList.add('hidden');
  $('#bulkBarWrap').classList.remove('hidden');
  let done = 0;
  const total = targets.length;
  const updateBar = () => {
    $('#bulkProgress').textContent = `${done}/${total} concluído(s)`;
    $('#bulkBarFill').style.width = Math.round((done / total) * 100) + '%';
  };
  updateBar();

  let idx = 0;
  const CONC = 3;
  async function worker() {
    while (idx < targets.length) {
      const g = targets[idx++];
      await processGroup(g);
      done++;
      updateBar();
    }
  }
  await Promise.all(Array.from({ length: Math.min(CONC, total) }, worker));

  setBusy('#bulkRunBtn', '#bulkRunLabel', false, '⚡ Gerar todos os relatórios');
  const okCount = bulkGroups.filter((g) => g.pdfBlob).length;
  const errCount = bulkGroups.filter((g) => g.status === 'err').length;
  toast(`Concluído: ${okCount} gerado(s)` + (errCount ? `, ${errCount} com erro` : '') + '.');
}

function downloadOne(g) {
  if (!g.pdfBlob) return;
  const url = URL.createObjectURL(g.pdfBlob);
  const a = el('a', { href: url, download: g.filename });
  document.body.appendChild(a); a.click(); a.remove();
  URL.revokeObjectURL(url);
}

// Abre o PDF já gerado numa nova aba, para conferir antes de baixar.
function previewOne(g) {
  if (!g.pdfBlob) return;
  const url = URL.createObjectURL(g.pdfBlob);
  const w = window.open(url, '_blank');
  if (!w) { toast('Permita pop-ups para visualizar.', true); URL.revokeObjectURL(url); return; }
  setTimeout(() => URL.revokeObjectURL(url), 60000);
}

// Adiciona o PDF pronto à lista de resultados (cada um com seu botão Baixar).
function addResultRow(g) {
  $('#bulkResultsCard').classList.remove('hidden');
  const row = el('div', { class: 'result-row' }, [
    el('span', { class: 'ico' }, '📄'),
    el('div', { class: 'result-info' }, [
      el('div', { class: 'result-name' }, g.cliente),
      el('div', { class: 'result-file' + (g.avisos.length ? ' warn' : '') },
        g.filename + (g.avisos.length ? ' · ⚠ revisar avisos' : '')),
    ]),
    el('button', { class: 'btn btn-ghost btn-sm', title: 'Ver como ficou', onclick: () => previewOne(g) }, '👁'),
    el('button', { class: 'btn btn-ghost btn-sm', onclick: () => downloadOne(g) }, '⬇️ Baixar'),
  ]);
  $('#bulkResults').appendChild(row);
}

async function processGroup(g) {
  setBulkStatus(g, 'run');
  try {
    const fd = new FormData();
    fd.append('prints', g.items[0].file);
    fd.append('prints', g.items[1].file);
    fd.append('cliente', g.cliente);
    fd.append('semCustoPorConversao', g.semCpc ? 'true' : 'false');
    if (currentModel) fd.append('model', currentModel);

    const r = await fetch('/api/extract', { method: 'POST', body: fd });
    const data = await r.json();
    if (!r.ok) throw new Error(data.error || 'falha na leitura');

    const now = new Date();
    const geradoEm =
      String(now.getDate()).padStart(2, '0') + '/' +
      String(now.getMonth() + 1).padStart(2, '0') + '/' + now.getFullYear();
    const cfg = {
      cliente: g.cliente,
      mes: $('#bMes').value,
      ano: String($('#bAno').value).trim(),
      periodo: getBulkPeriodo() || data.periodo || '',
      gerado_em: geradoEm,
      gestor: g.gestor || $('#bGestor').value.trim(),
      metricas: data.metricas || [],
      grafico: relabelGrafico(data.grafico, getBulkPeriodo.dates ? getBulkPeriodo.dates() : {}),
      leilao: data.leilao || [],
      passos: data.passos || [],
    };

    const gr = await fetch('/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(cfg),
    });
    if (!gr.ok) {
      const e = await gr.json().catch(() => ({}));
      throw new Error(e.error || 'falha no PDF');
    }
    g.pdfBlob = await gr.blob();
    g.filename = `Relatório ${cfg.mes} - ${cfg.cliente}.pdf`;
    g.avisos = data.avisos || [];
    setBulkStatus(g, g.avisos.length ? 'warn' : 'ok');
    addResultRow(g);
  } catch (e) {
    g.error = e.message;
    setBulkStatus(g, 'err');
  }
}

async function downloadZip() {
  const ready = bulkGroups.filter((g) => g.pdfBlob);
  if (!ready.length) return toast('Nada para baixar ainda.', true);
  const zip = new JSZip();
  ready.forEach((g) => zip.file(g.filename, g.pdfBlob));
  const blob = await zip.generateAsync({ type: 'blob' });
  const url = URL.createObjectURL(blob);
  const a = el('a', { href: url, download: `Relatórios ${$('#bMes').value} ${$('#bAno').value}.zip` });
  document.body.appendChild(a); a.click(); a.remove();
  URL.revokeObjectURL(url);
  toast(`ZIP com ${ready.length} relatório(s) baixado.`);
}

init();
