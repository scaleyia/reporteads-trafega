/* =========================================================================
   Marca (white-label) — logo do usuário, exibida na barra lateral.
   Guardada como data URI no store (KV em produção).
   ========================================================================= */

import { getJSON, setJSON } from './store.js';

const KEY = 'trafega:branding';

export async function getBranding() {
  const b = await getJSON(KEY, {});
  return { logo: (b && b.logo) || null };
}

export async function setBranding(logo) {
  await setJSON(KEY, { logo: logo || null });
  return { logo: logo || null };
}

export async function clearBranding() {
  await setJSON(KEY, {});
  return { logo: null };
}
