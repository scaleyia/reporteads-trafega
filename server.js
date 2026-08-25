import 'dotenv/config';
import express from 'express';
import multer from 'multer';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { extractFromPrints, listModels, identifyImage } from './lib/extract.js';
import { buildHtml, reportFilename } from './lib/report.js';
import { htmlToPdf, closeBrowser } from './lib/pdf.js';
import { readSettings, writeSettings, clearApiKey, getApiKey, getModel, maskKey, READONLY_FS } from './lib/settings.js';
import { getStatus as waStatus, connect as waConnect, disconnect as waDisconnect } from './lib/whatsapp.js';
import { listSchedules, createSchedule, updateSchedule, removeSchedule, listRuns, runDue, getConfig, setConfig } from './lib/schedules.js';
import { listAccounts, ingestAccount, removeAccount } from './lib/accounts.js';
import { syncMeta, META_ENABLED } from './lib/meta.js';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const PORT = process.env.PORT || 3000;
const CLIENTS_FILE = path.join(HERE, 'data', 'clients.json');

const app = express();
app.use(express.json({ limit: '5mb' }));

app.use(express.static(path.join(HERE, 'public')));
app.use('/assets', express.static(path.join(HERE, 'assets')));

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 15 * 1024 * 1024 }, // 15MB por print
});

// ---- Aviso se a chave não estiver configurada ----
if (!getApiKey()) {
  console.warn(
    '\n⚠️  Sem chave da OpenAI ainda. Cole sua API key direto na interface (painel "Configurações").\n'
  );
}

// ---------- Configurações (chave + modelo) ----------
app.get('/api/settings', (_req, res) => {
  const s = readSettings();
  const key = getApiKey();
  res.json({
    hasKey: !!key,
    keyMasked: maskKey(key),
    keyFromEnv: !s.apiKey && !!process.env.OPENAI_API_KEY,
    readonly: READONLY_FS, // no Vercel a chave/modelo vêm do ambiente, não do disco
    model: getModel(),
  });
});

app.post('/api/settings', (req, res) => {
  const { apiKey, model } = req.body || {};
  writeSettings({ apiKey, model });
  const key = getApiKey();
  res.json({ hasKey: !!key, keyMasked: maskKey(key), model: getModel() });
});

// Remove a chave salva (settings.json). Se houver chave no .env, ela continua valendo.
app.delete('/api/settings/key', (_req, res) => {
  clearApiKey();
  const s = readSettings();
  const key = getApiKey();
  res.json({
    hasKey: !!key,
    keyMasked: maskKey(key),
    keyFromEnv: !s.apiKey && !!process.env.OPENAI_API_KEY,
    model: getModel(),
  });
});

// Lista de modelos disponíveis (da conta do usuário, com fallback)
app.get('/api/models', async (_req, res) => {
  const result = await listModels();
  res.json({ ...result, current: getModel() });
});

// ---------- Clientes ----------
function readClients() {
  try {
    return JSON.parse(fs.readFileSync(CLIENTS_FILE, 'utf-8'));
  } catch {
    return [];
  }
}
function writeClients(list) {
  fs.writeFileSync(CLIENTS_FILE, JSON.stringify(list, null, 2));
}

app.get('/api/clients', (_req, res) => {
  res.json(readClients());
});

// Cria ou atualiza um cliente (por nome). Body: {nome, gestor, semCustoPorConversao}
app.post('/api/clients', (req, res) => {
  const { nome, gestor, semCustoPorConversao } = req.body || {};
  if (!nome || !nome.trim()) return res.status(400).json({ error: 'Nome obrigatório.' });
  const list = readClients();
  const i = list.findIndex((c) => c.nome.toLowerCase() === nome.trim().toLowerCase());
  const entry = {
    nome: nome.trim(),
    gestor: (gestor || '').trim(),
    semCustoPorConversao: !!semCustoPorConversao,
  };
  if (i >= 0) list[i] = { ...list[i], ...entry };
  else list.push(entry);
  list.sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));
  writeClients(list);
  res.json(entry);
});

app.delete('/api/clients/:nome', (req, res) => {
  const nome = decodeURIComponent(req.params.nome);
  const list = readClients().filter((c) => c.nome.toLowerCase() !== nome.toLowerCase());
  writeClients(list);
  res.json({ ok: true });
});

// ---------- Conexão do WhatsApp (Evolution API) ----------
app.get('/api/whatsapp/status', async (_req, res) => {
  try {
    res.json(await waStatus());
  } catch (err) {
    console.error('WhatsApp status:', err);
    res.status(500).json({ error: err.message || 'Falha ao consultar a conexão.' });
  }
});

app.post('/api/whatsapp/connect', async (_req, res) => {
  try {
    res.json(await waConnect());
  } catch (err) {
    console.error('WhatsApp connect:', err);
    res.status(500).json({ error: err.message || 'Falha ao iniciar a conexão.' });
  }
});

app.post('/api/whatsapp/disconnect', async (_req, res) => {
  try {
    res.json(await waDisconnect());
  } catch (err) {
    console.error('WhatsApp disconnect:', err);
    res.status(500).json({ error: err.message || 'Falha ao desconectar.' });
  }
});

// ---------- Contas de anúncio (ingestão) ----------
// Recebe dados do Google Ads Script (webhook). Protegido pelo INGEST_TOKEN.
app.post('/api/ingest', async (req, res) => {
  const token = process.env.INGEST_TOKEN;
  const sent = req.headers['x-ingest-token'] || (req.body && req.body.token);
  if (token && sent !== token) return res.status(401).json({ error: 'Token de ingestão inválido.' });
  try {
    const acc = await ingestAccount(req.body || {});
    res.json({ ok: true, id: acc.id, nome: acc.nome });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.get('/api/accounts', async (_req, res) => {
  try { res.json(await listAccounts()); }
  catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete('/api/accounts/:id', async (req, res) => {
  try { res.json(await removeAccount(decodeURIComponent(req.params.id))); }
  catch (err) { res.status(400).json({ error: err.message }); }
});

// Status das integrações (para a tela de Contas saber o que está pronto).
app.get('/api/integrations', (_req, res) => {
  res.json({ metaConfigured: META_ENABLED, ingestConfigured: !!process.env.INGEST_TOKEN });
});

// Sincroniza a Meta sob demanda (usa o System User token do .env).
app.post('/api/meta/sync', async (_req, res) => {
  try { res.json({ ok: true, ...(await syncMeta()) }); }
  catch (err) { res.status(400).json({ error: err.message }); }
});

// ---------- Agendamentos ----------
app.get('/api/schedules/config', async (_req, res) => {
  try { res.json(await getConfig()); }
  catch (err) { res.status(500).json({ error: err.message }); }
});

app.put('/api/schedules/config', async (req, res) => {
  try { res.json(await setConfig(req.body || {})); }
  catch (err) { res.status(400).json({ error: err.message }); }
});

app.get('/api/schedules', async (_req, res) => {
  try { res.json(await listSchedules()); }
  catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/schedules', async (req, res) => {
  try { res.json(await createSchedule(req.body || {})); }
  catch (err) { res.status(400).json({ error: err.message }); }
});

app.patch('/api/schedules/:id', async (req, res) => {
  try { res.json(await updateSchedule(req.params.id, req.body || {})); }
  catch (err) { res.status(400).json({ error: err.message }); }
});

app.delete('/api/schedules/:id', async (req, res) => {
  try { res.json(await removeSchedule(req.params.id)); }
  catch (err) { res.status(400).json({ error: err.message }); }
});

// Executa um agendamento na hora (teste manual, ignora a checagem de data).
app.post('/api/schedules/:id/run', async (req, res) => {
  try { res.json(await runDue(new Date(), { force: true, onlyId: req.params.id })); }
  catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/schedules/runs', async (_req, res) => {
  try { res.json(await listRuns()); }
  catch (err) { res.status(500).json({ error: err.message }); }
});

// Tick diário chamado pelo Vercel Cron. Protegido pelo CRON_SECRET.
async function cronDispatch(req, res) {
  const secret = process.env.CRON_SECRET;
  if (secret && req.headers.authorization !== 'Bearer ' + secret) {
    return res.status(401).json({ error: 'Não autorizado.' });
  }
  try {
    const result = await runDue(new Date());
    console.log(`⏰ Cron: ${result.ran} agendamento(s) executado(s) em ${result.ymd}.`);
    res.json({ ok: true, ...result });
  } catch (err) {
    console.error('Cron dispatch:', err);
    res.status(500).json({ error: err.message });
  }
}
app.get('/api/cron/dispatch', cronDispatch);
app.post('/api/cron/dispatch', cronDispatch);

// ---------- Extração dos prints ----------
app.post('/api/extract', upload.array('prints', 2), async (req, res) => {
  try {
    if (!getApiKey()) {
      return res.status(500).json({ error: 'Cole sua API key da OpenAI no painel "Configurações" antes de ler os prints.' });
    }
    const files = req.files || [];
    if (files.length < 2) {
      return res.status(400).json({ error: 'Envie os 2 prints (visão geral + tabela de leilão).' });
    }
    const cliente = req.body.cliente || '';
    const semCustoPorConversao = req.body.semCustoPorConversao === 'true';
    const model = req.body.model || undefined;

    const dados = await extractFromPrints({ files, cliente, semCustoPorConversao, model });
    res.json(dados);
  } catch (err) {
    console.error('Erro na extração:', err);
    res.status(500).json({ error: err.message || 'Falha ao ler os prints.' });
  }
});

// ---------- Identificação de 1 print (geração em massa) ----------
app.post('/api/identify', upload.single('print'), async (req, res) => {
  try {
    if (!getApiKey()) {
      return res.status(500).json({ error: 'Configure a API key no painel "Configurações".' });
    }
    if (!req.file) return res.status(400).json({ error: 'Envie uma imagem.' });
    const data = await identifyImage({ file: req.file, model: req.body.model || undefined });
    res.json(data);
  } catch (err) {
    console.error('Erro na identificação:', err);
    res.status(500).json({ error: err.message || 'Falha ao identificar o print.' });
  }
});

// ---------- Geração do PDF ----------
app.post('/api/generate', async (req, res) => {
  try {
    const cfg = req.body;
    if (!cfg || !cfg.cliente || !cfg.metricas || !cfg.leilao) {
      return res.status(400).json({ error: 'Dados incompletos para gerar o relatório.' });
    }
    const html = buildHtml(cfg);
    const pdf = await htmlToPdf(html);
    const filename = reportFilename(cfg);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="relatorio.pdf"; filename*=UTF-8''${encodeURIComponent(filename)}`
    );
    res.send(pdf);
  } catch (err) {
    console.error('Erro ao gerar PDF:', err);
    res.status(500).json({ error: err.message || 'Falha ao gerar o PDF.' });
  }
});

// Pré-visualização HTML (útil para conferir o layout sem baixar o PDF)
app.post('/api/preview', (req, res) => {
  try {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(buildHtml(req.body));
  } catch (err) {
    res.status(500).send(String(err));
  }
});

app.get('/api/health', (_req, res) =>
  res.json({ ok: true, hasKey: !!getApiKey(), model: getModel() })
);

// No Vercel (serverless) o app é importado por api/index.js — não chamamos listen.
// Local: sobe o servidor normalmente.
export default app;

if (!process.env.VERCEL) {
  const server = app.listen(PORT, () => {
    console.log(`\n✅ Gerador de Relatórios Tráfega rodando em  http://localhost:${PORT}\n`);
  });
  process.on('SIGINT', async () => {
    await closeBrowser();
    server.close(() => process.exit(0));
  });
}
