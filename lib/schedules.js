/* =========================================================================
   Agendamentos — CRUD + avaliação de "vence hoje" + tick de disparo.
   Estratégia (compatível com o plano Hobby da Vercel, 1 cron/dia): um único
   tick diário decide, por lógica, quais agendamentos vencem no dia.
   Fuso de referência: America/Sao_Paulo.
   ========================================================================= */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { getJSON, setJSON } from './store.js';
import { listClients } from './clients.js';
import { listAccounts } from './accounts.js';
import { montaCfgCliente } from './report-lite.js';
import { buildHtml } from './report.js';
import { htmlToPdf } from './pdf.js';
import { sendDocument, getStatus as waGetStatus } from './whatsapp.js';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const CLIENTS_FILE = path.join(HERE, '..', 'data', 'clients.json');

const KEY = 'trafega:schedules';
const RUNS_KEY = 'trafega:schedule_runs';
const CONFIG_KEY = 'trafega:config';
const TZ = 'America/Sao_Paulo';
const FREQS = ['diaria', 'semanal', 'mensal'];

/* ---------------------- Configuração global ---------------------------- */
/* Horário de referência do disparo diário (um só para todos os agendamentos,
   já que o plano Hobby dá uma passagem por dia). */
export async function getConfig() {
  const c = await getJSON(CONFIG_KEY, {});
  return { hora: /^\d{2}:\d{2}$/.test(c && c.hora) ? c.hora : '08:00' };
}
export async function setConfig(patch = {}) {
  const cur = await getConfig();
  const hora = /^\d{2}:\d{2}$/.test(patch.hora || '') ? patch.hora : cur.hora;
  await setJSON(CONFIG_KEY, { hora });
  return { hora };
}

/* ------------------------------ Datas (BRT) ---------------------------- */
export function brToday(now = new Date()) {
  const ymd = now.toLocaleDateString('en-CA', { timeZone: TZ }); // 2026-08-19
  const dia = parseInt(ymd.slice(8, 10), 10);
  const wd = now.toLocaleDateString('en-US', { timeZone: TZ, weekday: 'short' }); // 'Wed'
  const dow = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(wd);
  return { ymd, dia, dow };
}

/* Um agendamento vence na data informada? */
export function dueToday(s, parts = brToday()) {
  if (s.frequencia === 'diaria') return true;
  if (s.frequencia === 'semanal') return Number(s.diaSemana) === parts.dow;
  if (s.frequencia === 'mensal') return Number(s.diaMes) === parts.dia;
  return false;
}

/* ------------------------------ CRUD ----------------------------------- */
export async function listSchedules() {
  const list = await getJSON(KEY, []);
  return Array.isArray(list) ? list : [];
}
async function saveAll(list) { await setJSON(KEY, list); }

function normalize(input = {}) {
  const frequencia = FREQS.includes(input.frequencia) ? input.frequencia : 'mensal';
  const clientes = Array.isArray(input.clientes) ? input.clientes.filter(Boolean) : 'todos';
  return {
    nome: (input.nome || '').trim(),
    frequencia,
    diaMes: frequencia === 'mensal' ? Math.min(28, Math.max(1, Number(input.diaMes) || 1)) : null,
    diaSemana: frequencia === 'semanal' ? Math.min(6, Math.max(0, Number(input.diaSemana) || 1)) : null,
    clientes,
    ativo: input.ativo !== false,
  };
}

export async function createSchedule(input) {
  const data = normalize(input);
  if (!data.nome) throw new Error('Dê um nome ao agendamento.');
  const list = await listSchedules();
  const entry = { id: crypto.randomUUID(), ...data, criadoEm: new Date().toISOString(), ultimaExecucao: null };
  list.push(entry);
  await saveAll(list);
  return entry;
}

export async function updateSchedule(id, patch) {
  const list = await listSchedules();
  const i = list.findIndex((s) => s.id === id);
  if (i < 0) throw new Error('Agendamento não encontrado.');
  // toggle simples de "ativo" ou atualização de campos
  if (patch && Object.keys(patch).length === 1 && 'ativo' in patch) {
    list[i].ativo = !!patch.ativo;
  } else {
    list[i] = { ...list[i], ...normalize({ ...list[i], ...patch }) };
  }
  await saveAll(list);
  return list[i];
}

export async function removeSchedule(id) {
  const list = await listSchedules();
  await saveAll(list.filter((s) => s.id !== id));
  return { ok: true };
}

/* --------------------------- Histórico --------------------------------- */
export async function listRuns() {
  const runs = await getJSON(RUNS_KEY, []);
  return Array.isArray(runs) ? runs : [];
}
async function pushRuns(entries) {
  if (!entries.length) return;
  const runs = [...entries, ...(await listRuns())].slice(0, 50);
  await setJSON(RUNS_KEY, runs);
}

/* --------------------------- Disparo ----------------------------------- */
async function activeClientNames() {
  try {
    return (await listClients()).filter((c) => c.ativo !== false).map((c) => c.nome);
  } catch { return []; }
}

/* Disparo real: para cada cliente-alvo, agrega as contas vinculadas, gera o PDF
   e envia no WhatsApp do cliente via Evolution. */
async function dispatchSchedule(s, clientesNomes) {
  const alvoNomes = new Set(clientesNomes);
  const [clients, accounts, wa] = await Promise.all([listClients(), listAccounts(), waGetStatus().catch(() => ({ state: 'none' }))]);
  if (wa.state !== 'open') return { status: 'falha', motivo: 'WhatsApp desconectado — conecte em Conexão.' };

  const alvo = clients.filter((c) => alvoNomes.has(c.nome) && c.ativo !== false);
  if (!alvo.length) return { status: 'pendente', motivo: 'Nenhum cliente ativo para enviar.' };

  let enviados = 0, falhas = 0;
  const erros = [];
  for (const cliente of alvo) {
    try {
      if (!cliente.whatsapp) throw new Error('sem WhatsApp cadastrado');
      const cfg = montaCfgCliente(cliente, accounts);
      if (cfg.semContas) throw new Error('sem contas vinculadas');
      const pdf = await htmlToPdf(buildHtml(cfg));
      const base64 = Buffer.from(pdf).toString('base64');
      const legenda = 'Olá! Segue o relatório de ' + cfg.mes + '/' + cfg.ano + ' — ' + cliente.nome + '. 📊';
      await sendDocument(cliente.whatsapp, base64, 'Relatorio ' + cliente.nome + '.pdf', legenda);
      enviados++;
    } catch (e) {
      falhas++;
      erros.push(cliente.nome + ': ' + e.message);
    }
  }
  if (enviados && !falhas) return { status: 'enviado', motivo: enviados + ' relatório(s) enviado(s)' };
  if (enviados && falhas) return { status: 'parcial', motivo: enviados + ' enviado(s), ' + falhas + ' falha(s): ' + erros.join('; ') };
  return { status: 'falha', motivo: erros.join('; ') || 'Falha no envio' };
}

/* Tick: roda os agendamentos que vencem hoje (idempotente por dia).
   opts.force ignora a checagem de data; opts.onlyId restringe a um agendamento. */
export async function runDue(now = new Date(), opts = {}) {
  const parts = brToday(now);
  const list = await listSchedules();
  const runs = [];

  for (const s of list) {
    if (opts.onlyId && s.id !== opts.onlyId) continue;
    if (!opts.force) {
      if (!s.ativo) continue;
      if (s.ultimaExecucao === parts.ymd) continue; // já rodou hoje
      if (!dueToday(s, parts)) continue;
    }
    const clientes = s.clientes === 'todos' ? await activeClientNames() : s.clientes;
    const r = await dispatchSchedule(s, clientes);
    s.ultimaExecucao = parts.ymd;
    runs.push({
      id: crypto.randomUUID(),
      scheduleId: s.id,
      nome: s.nome,
      data: now.toISOString(),
      ymd: parts.ymd,
      clientes,
      status: r.status,
      motivo: r.motivo || '',
    });
  }

  if (runs.length) { await saveAll(list); await pushRuns(runs); }
  return { ran: runs.length, runs, ymd: parts.ymd };
}
