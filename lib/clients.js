/* =========================================================================
   Clientes — cada cliente tem WhatsApp, gestor e as contas de anúncio
   vinculadas. Persistido no store (KV em produção). As contas ficam
   denormalizadas ({id, nome, plataforma}) para exibir sem outra consulta.
   ========================================================================= */

import { getJSON, setJSON } from './store.js';

const KEY = 'trafega:clients';

export async function listClients() {
  const l = await getJSON(KEY, []);
  return Array.isArray(l) ? l : [];
}

export async function upsertClient(input = {}) {
  const nome = (input.nome || '').trim();
  if (!nome) throw new Error('Nome do cliente obrigatório.');
  const list = await listClients();
  const i = list.findIndex((c) => c.nome.toLowerCase() === nome.toLowerCase());
  const base = i >= 0 ? list[i] : { ativo: true };
  const entry = {
    ...base,
    nome,
    whatsapp: input.whatsapp !== undefined ? String(input.whatsapp).trim() : (base.whatsapp || ''),
    gestor: input.gestor !== undefined ? String(input.gestor).trim() : (base.gestor || ''),
    contas: Array.isArray(input.contas) ? input.contas : (base.contas || []),
    ativo: input.ativo !== undefined ? !!input.ativo : (base.ativo !== false),
  };
  if (i >= 0) list[i] = entry; else list.push(entry);
  list.sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));
  await setJSON(KEY, list);
  return entry;
}

export async function removeClient(nome) {
  const list = await listClients();
  await setJSON(KEY, list.filter((c) => c.nome.toLowerCase() !== String(nome).toLowerCase()));
  return { ok: true };
}
