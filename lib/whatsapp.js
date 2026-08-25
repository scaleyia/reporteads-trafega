/* =========================================================================
   Evolution API — cliente de conexão do WhatsApp.
   A ApiKey nunca vai para o navegador: o front conversa só com /api/whatsapp/*
   e este módulo faz o proxy para a Evolution. Config vem do .env (com fallback).
   Docs: https://doc.evolution-api.com  ·  versão testada: 2.3.7
   ========================================================================= */

const BASE = (process.env.EVOLUTION_URL || 'https://whatsapp-evolution-api.zb8ckr.easypanel.host').replace(/\/+$/, '');
const KEY = process.env.EVOLUTION_APIKEY || ''; // definido via .env / variáveis da Vercel
const INSTANCE = process.env.EVOLUTION_INSTANCE || 'trafega';

/* Chamada base à Evolution. Sempre resolve (não lança) para o server decidir. */
async function ev(pathname, { method = 'GET', body } = {}) {
  const res = await fetch(BASE + pathname, {
    method,
    headers: { apikey: KEY, 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });
  let data = null;
  try { data = await res.json(); } catch { /* corpo vazio/não-json */ }
  return { ok: res.ok, status: res.status, data };
}

/* Dados do aparelho conectado (nome, número, foto) a partir do fetchInstances. */
async function readProfile() {
  const r = await ev('/instance/fetchInstances?instanceName=' + encodeURIComponent(INSTANCE));
  const inst = Array.isArray(r.data) ? r.data.find((i) => i.name === INSTANCE) : null;
  if (!inst) return null;
  const jid = inst.ownerJid || '';
  const numero = jid ? jid.split('@')[0].replace(/\D/g, '') : (inst.number || '');
  return {
    nome: inst.profileName || null,
    numero: numero || null,
    foto: inst.profilePicUrl || null,
  };
}

/* Estado atual: 'open' (conectado), 'connecting', 'close' ou 'none' (sem instância). */
export async function getStatus() {
  const r = await ev('/instance/connectionState/' + encodeURIComponent(INSTANCE));
  if (!r.ok) return { state: 'none', profile: null };
  const state = r.data?.instance?.state || 'close';
  const profile = state === 'open' ? await readProfile() : null;
  return { state, profile };
}

/* Inicia/retoma a conexão e devolve o QR Code (base64 PNG) para escanear. */
export async function connect() {
  const st = await ev('/instance/connectionState/' + encodeURIComponent(INSTANCE));

  // Instância ainda não existe → cria já pedindo o QR.
  if (!st.ok) {
    const c = await ev('/instance/create', {
      method: 'POST',
      body: { instanceName: INSTANCE, integration: 'WHATSAPP-BAILEYS', qrcode: true },
    });
    if (!c.ok) throw new Error(c.data?.response?.message || c.data?.message || 'Falha ao criar a instância na Evolution.');
    const qr = c.data?.qrcode || {};
    return { state: 'connecting', qr: qr.base64 || null, code: qr.code || null };
  }

  // Já conectado → nada a escanear.
  if (st.data?.instance?.state === 'open') {
    return { state: 'open', qr: null, code: null, profile: await readProfile() };
  }

  // Existe mas desconectada → pega um QR novo.
  const r = await ev('/instance/connect/' + encodeURIComponent(INSTANCE));
  if (!r.ok) throw new Error(r.data?.response?.message || r.data?.message || 'Falha ao gerar o QR Code.');
  return { state: 'connecting', qr: r.data?.base64 || null, code: r.data?.code || null };
}

/* Desconecta o aparelho (logout), mantendo a instância para reconectar depois. */
export async function disconnect() {
  const r = await ev('/instance/logout/' + encodeURIComponent(INSTANCE), { method: 'DELETE' });
  // 401/404 = já estava fora; tratamos como sucesso idempotente.
  if (!r.ok && ![401, 404].includes(r.status)) {
    throw new Error(r.data?.response?.message || r.data?.message || 'Falha ao desconectar.');
  }
  return { ok: true };
}
