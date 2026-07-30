// Autenticação simples por e-mail + senha (usuário admin).
// Sem dependências extras: usa o crypto nativo para assinar um cookie de sessão (HMAC).
// Funciona local e no Vercel (serverless / disco só-leitura) — tudo vem das env vars.

import crypto from 'node:crypto';

// Credenciais do admin. Configure no .env (ou nas env vars do Vercel).
// Padrão de fábrica: admin@lastone.com / admin  ← troque em produção!
const ADMIN_EMAIL = (process.env.AUTH_EMAIL || 'admin@lastone.com').trim().toLowerCase();
const ADMIN_PASSWORD = process.env.AUTH_PASSWORD || 'admin';

// Segredo usado para assinar a sessão. Se não definir, usa um padrão fixo
// (funciona, mas qualquer um que veja o código consegue forjar sessão — defina em produção).
const SECRET = process.env.AUTH_SECRET || 'lastone-relatorios-troque-este-segredo-em-producao';

const COOKIE = 'lo_session';
const MAX_AGE = 60 * 60 * 24 * 7; // 7 dias (em segundos)

export const USING_DEFAULT_CREDENTIALS =
  !process.env.AUTH_EMAIL && !process.env.AUTH_PASSWORD;

// Comparação de tempo constante que tolera tamanhos diferentes.
function safeEqual(a, b) {
  const ba = Buffer.from(String(a));
  const bb = Buffer.from(String(b));
  if (ba.length !== bb.length) return false;
  return crypto.timingSafeEqual(ba, bb);
}

export function checkCredentials(email, password) {
  const e = String(email || '').trim().toLowerCase();
  const p = String(password || '');
  return safeEqual(e, ADMIN_EMAIL) && safeEqual(p, ADMIN_PASSWORD);
}

// ---- Token de sessão: base64url(payload).hmac ----
function sign(payload) {
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const mac = crypto.createHmac('sha256', SECRET).update(body).digest('base64url');
  return `${body}.${mac}`;
}

function verify(token) {
  if (!token || !token.includes('.')) return null;
  const [body, mac] = token.split('.');
  const expected = crypto.createHmac('sha256', SECRET).update(body).digest('base64url');
  if (!safeEqual(mac, expected)) return null;
  try {
    const payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf-8'));
    if (payload.exp && Date.now() > payload.exp) return null;
    return payload;
  } catch {
    return null;
  }
}

export function createSession() {
  return sign({ email: ADMIN_EMAIL, exp: Date.now() + MAX_AGE * 1000 });
}

// ---- Cookies ----
function parseCookies(header) {
  const out = {};
  (header || '').split(';').forEach((part) => {
    const i = part.indexOf('=');
    if (i < 0) return;
    const k = part.slice(0, i).trim();
    if (k) out[k] = decodeURIComponent(part.slice(i + 1).trim());
  });
  return out;
}

export function readSession(req) {
  return verify(parseCookies(req.headers.cookie)[COOKIE]);
}

export function sessionCookie(token) {
  const parts = [`${COOKIE}=${token}`, 'Path=/', 'HttpOnly', 'SameSite=Lax', `Max-Age=${MAX_AGE}`];
  if (process.env.VERCEL) parts.push('Secure'); // HTTPS no Vercel
  return parts.join('; ');
}

export function clearCookie() {
  return `${COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`;
}

// Recursos liberados sem login (a própria tela de login e o que ela precisa).
const PUBLIC_PATHS = new Set(['/login', '/login.html', '/styles.css', '/favicon.ico']);

export function requireAuth(req, res, next) {
  const p = req.path;
  if (p === '/api/login' || p === '/api/health') return next();
  if (p.startsWith('/assets/')) return next(); // logo, etc. na tela de login
  if (PUBLIC_PATHS.has(p)) return next();

  if (readSession(req)) return next();

  if (p.startsWith('/api/')) return res.status(401).json({ error: 'Sessão expirada. Faça login novamente.' });
  return res.redirect('/login.html');
}
