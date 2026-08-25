// Gera a documentação do sistema em PDF, reaproveitando o motor de PDF do
// próprio projeto (lib/pdf.js → Puppeteer/Chrome). Uso: `node scripts/gen-docs.mjs`
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { htmlToPdf, closeBrowser } from '../lib/pdf.js';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(HERE, '..');
const logoB64 = fs.readFileSync(path.join(ROOT, 'assets', 'logo_b64.txt'), 'utf-8').trim();

const html = /* html */ `<!doctype html>
<html lang="pt-BR"><head><meta charset="utf-8">
<style>
  :root{ --ink:#0f172a; --muted:#5b6472; --line:#e5e8ee; --brand:#111827; --accent:#2563eb; --soft:#f6f8fb; --code:#0b1220; }
  *{ box-sizing:border-box; }
  html,body{ margin:0; padding:0; }
  body{ font-family:-apple-system,"Segoe UI",Roboto,Helvetica,Arial,sans-serif; color:var(--ink); font-size:11px; line-height:1.55; }
  .page{ padding:46px 52px; }
  h1{ font-size:26px; margin:0 0 4px; letter-spacing:-.4px; }
  h2{ font-size:15px; margin:26px 0 8px; padding-bottom:5px; border-bottom:2px solid var(--brand); letter-spacing:-.2px; }
  h3{ font-size:12.5px; margin:16px 0 5px; color:var(--brand); }
  p{ margin:6px 0; }
  ul{ margin:6px 0 6px 18px; padding:0; } li{ margin:3px 0; }
  code{ font-family:"SF Mono",Menlo,Consolas,monospace; background:var(--soft); border:1px solid var(--line); border-radius:4px; padding:1px 5px; font-size:10px; }
  pre{ background:var(--code); color:#e6edf3; border-radius:8px; padding:12px 14px; font-size:10px; overflow:auto; line-height:1.5; }
  pre code{ background:none; border:none; color:inherit; padding:0; }
  .muted{ color:var(--muted); }
  table{ width:100%; border-collapse:collapse; margin:8px 0; font-size:10px; }
  th,td{ text-align:left; padding:7px 9px; border-bottom:1px solid var(--line); vertical-align:top; }
  th{ background:var(--soft); font-weight:600; }
  .cover{ height:150px; background:var(--brand); border-radius:14px; color:#fff; display:flex; flex-direction:column; justify-content:center; padding:0 34px; margin-bottom:8px; }
  .cover img{ height:34px; width:auto; margin-bottom:14px; filter:brightness(0) invert(1); }
  .cover .sub{ color:#cbd5e1; font-size:12px; }
  .pill{ display:inline-block; background:#eef2ff; color:var(--accent); border:1px solid #dbe3ff; border-radius:999px; padding:2px 9px; font-size:9.5px; font-weight:600; }
  .grid{ display:grid; grid-template-columns:1fr 1fr; gap:10px; margin:8px 0; }
  .card{ border:1px solid var(--line); border-radius:10px; padding:11px 13px; background:#fff; }
  .card b{ display:block; font-size:11px; margin-bottom:2px; }
  .kv td:first-child{ width:180px; font-weight:600; white-space:nowrap; }
  .route td:first-child{ width:150px; }
  .route .m{ font-family:"SF Mono",Menlo,monospace; font-weight:700; }
  .foot{ margin-top:28px; padding-top:10px; border-top:1px solid var(--line); color:var(--muted); font-size:9px; display:flex; justify-content:space-between; }
  .pb{ page-break-before:always; }
  .steps{ counter-reset:s; list-style:none; margin:8px 0 8px; padding:0; }
  .steps li{ counter-increment:s; position:relative; padding:4px 0 4px 26px; }
  .steps li::before{ content:counter(s); position:absolute; left:0; top:3px; width:17px; height:17px; background:var(--brand); color:#fff; border-radius:50%; font-size:9px; font-weight:700; display:flex; align-items:center; justify-content:center; }
</style></head>
<body><div class="page">

  <div class="cover">
    <img src="data:image/png;base64,${logoB64}" alt="Tráfega">
    <h1 style="color:#fff;margin:0">Documentação do Sistema</h1>
    <div class="sub">Gerador de Relatórios Google Ads — Tráfega Mídia</div>
  </div>
  <p class="muted">Versão 1.0.0 · Documento técnico e de uso · Gerado em 15/08/2026</p>

  <h2>1. Visão geral</h2>
  <p>Interface web que lê <b>2 prints do Google Ads</b> com a API da OpenAI (visão), extrai os números
  e gera automaticamente um <b>PDF de relatório mensal</b> no padrão da Tráfega Mídia — com template,
  logo e layout fixos. O objetivo é fechar cada relatório de cliente em <b>menos de 1 minuto</b>, sem
  edição manual de documento.</p>
  <p><b>Fluxo por cliente:</b> seleciona o cliente → sobe os 2 prints → a IA extrai os dados → confere/ajusta
  os campos → clica em <b>Gerar Relatório</b> → baixa o PDF.</p>
  <div class="grid">
    <div class="card"><b>Para quem é</b><span class="muted">Equipe de tráfego da agência, que emite dezenas de relatórios por mês.</span></div>
    <div class="card"><b>Entrada</b><span class="muted">2 imagens: visão geral (cards de performance) + tabela de leilão.</span></div>
    <div class="card"><b>Saída</b><span class="muted">PDF A4 <code>Relatório &lt;Mês&gt; - &lt;Cliente&gt;.pdf</code>.</span></div>
    <div class="card"><b>IA</b><span class="muted">Só a leitura dos prints usa a API; o PDF é montado localmente.</span></div>
  </div>

  <h2>2. Arquitetura</h2>
  <p>Aplicação <b>Node.js + Express</b>, frontend em HTML/CSS/JS puro (sem build). Roda tanto local
  quanto <b>serverless na Vercel</b> (mesma base de código).</p>
  <table>
    <tr><th>Camada</th><th>Tecnologia</th><th>Arquivo</th></tr>
    <tr><td>Servidor / API</td><td>Express 5</td><td><code>server.js</code></td></tr>
    <tr><td>Entrada serverless</td><td>Vercel Functions</td><td><code>api/index.js</code> + <code>vercel.json</code></td></tr>
    <tr><td>Leitura dos prints (IA)</td><td>OpenAI API — visão + JSON Schema strict</td><td><code>lib/extract.js</code></td></tr>
    <tr><td>Montagem do relatório</td><td>Gerador de HTML/CSS/SVG</td><td><code>lib/report.js</code></td></tr>
    <tr><td>HTML → PDF</td><td>Puppeteer + Chrome/Chromium</td><td><code>lib/pdf.js</code></td></tr>
    <tr><td>Config (chave + modelo)</td><td>JSON em disco / env vars</td><td><code>lib/settings.js</code></td></tr>
    <tr><td>Interface</td><td>HTML/CSS/JS puro</td><td><code>public/</code></td></tr>
    <tr><td>Template do relatório</td><td>Logo + head HTML</td><td><code>assets/</code></td></tr>
    <tr><td>Dados persistidos</td><td>JSON local</td><td><code>data/clients.json</code>, <code>data/settings.json</code></td></tr>
  </table>

  <h3>Fluxo de dados</h3>
  <pre><code>Prints (PNG/JPG)
    │  POST /api/extract  (multipart, 2 imagens)
    ▼
lib/extract.js ── OpenAI (visão, json_schema strict) ──▶ JSON estruturado
    │  usuário confere/edita no navegador
    ▼
POST /api/generate  (JSON do relatório)
    │
lib/report.js  →  HTML + gráfico SVG + tabela de leilão
    │
lib/pdf.js     →  Puppeteer renderiza A4  →  PDF (download)</code></pre>

  <div class="pb"></div>
  <h2>3. Rotas da API</h2>
  <table class="route">
    <tr><th>Rota</th><th>Método</th><th>Função</th></tr>
    <tr><td class="m">/api/settings</td><td>GET</td><td>Estado da configuração: se há chave, chave mascarada, origem (env/disco), se o disco é só-leitura e o modelo atual.</td></tr>
    <tr><td class="m">/api/settings</td><td>POST</td><td>Salva a chave da OpenAI e/ou o modelo escolhido.</td></tr>
    <tr><td class="m">/api/settings/key</td><td>DELETE</td><td>Remove a chave salva (se houver chave no <code>.env</code>, ela continua valendo).</td></tr>
    <tr><td class="m">/api/models</td><td>GET</td><td>Lista os modelos da conta OpenAI do usuário (fallback embutido se falhar).</td></tr>
    <tr><td class="m">/api/clients</td><td>GET</td><td>Lista os clientes salvos (nome, gestor, preferência).</td></tr>
    <tr><td class="m">/api/clients</td><td>POST</td><td>Cria/atualiza um cliente por nome.</td></tr>
    <tr><td class="m">/api/clients/:nome</td><td>DELETE</td><td>Remove um cliente.</td></tr>
    <tr><td class="m">/api/extract</td><td>POST</td><td>Recebe os 2 prints e devolve os dados estruturados do relatório.</td></tr>
    <tr><td class="m">/api/identify</td><td>POST</td><td>Identifica 1 print (nome do cliente + tipo) — usado na geração em massa para agrupar prints.</td></tr>
    <tr><td class="m">/api/generate</td><td>POST</td><td>Recebe o JSON do relatório e devolve o <b>PDF</b> pronto para download.</td></tr>
    <tr><td class="m">/api/preview</td><td>POST</td><td>Devolve o <b>HTML</b> do relatório (pré-visualização sem baixar o PDF).</td></tr>
    <tr><td class="m">/api/health</td><td>GET</td><td>Healthcheck: <code>{ ok, hasKey, model }</code>.</td></tr>
  </table>

  <h2>4. A leitura por IA (extração)</h2>
  <p>O módulo <code>lib/extract.js</code> envia as 2 imagens (em base64, <code>detail: high</code>) para a OpenAI
  com um <b>system prompt</b> que codifica as regras do relatório da Tráfega, e força a resposta via
  <b>JSON Schema strict</b> — garantindo saída sempre parseável e no formato certo.</p>
  <p>O schema padroniza:</p>
  <ul>
    <li><b>periodo</b> — período exato como no print.</li>
    <li><b>metricas</b> — sempre 4 cards (Conversões Totais · Custo por Conversão · CPC Médio · Investimento). Se o cliente marca "sem custo por conversão", o 2º card vira <b>Cliques</b>.</li>
    <li><b>grafico</b> — conversões por semana (o total das semanas soma o total do mês).</li>
    <li><b>leilao</b> — todos os concorrentes na mesma ordem; a linha do cliente vem destacada (<code>ehVoce=true</code>).</li>
    <li><b>passos</b> — 4 próximos passos baseados nos números reais.</li>
    <li><b>avisos</b> — ressalvas de transparência (ex.: gráfico estimado, valor calculado).</li>
  </ul>

  <div class="pb"></div>
  <h2>5. Configuração & execução</h2>
  <h3>Rodar localmente</h3>
  <pre><code>npm install     # instala dependências (Puppeteer usa o Chrome da máquina)
npm start       # sobe em http://localhost:3000
npm run dev     # modo watch (reinicia ao salvar)</code></pre>
  <h3>Variáveis de ambiente</h3>
  <table class="kv">
    <tr><td>OPENAI_API_KEY</td><td>Chave da OpenAI. Alternativa: salvar pela interface (tem prioridade sobre a env).</td></tr>
    <tr><td>OPENAI_MODEL</td><td>Modelo padrão (default <code>gpt-5.4-mini</code>).</td></tr>
    <tr><td>PORT</td><td>Porta local (default 3000).</td></tr>
    <tr><td>PUPPETEER_EXECUTABLE_PATH</td><td>Caminho manual do Chrome, se não for autodetectado.</td></tr>
  </table>
  <p class="muted">A chave também pode ser colada direto no painel <b>⚙ Configurações da IA</b>. Ela fica em
  <code>data/settings.json</code> (fora do git) e tem prioridade sobre o <code>.env</code>.</p>

  <h3>Deploy na Vercel</h3>
  <p>O projeto já está preparado para serverless: <code>api/index.js</code> reaproveita o app Express e
  <code>vercel.json</code> reescreve todas as rotas para essa função, com <code>maxDuration</code> de 60s.
  Diferenças no ambiente Vercel (disco somente-leitura):</p>
  <ul>
    <li>A chave vem da env var <code>OPENAI_API_KEY</code> (o campo na interface fica só-leitura).</li>
    <li>Modelo e lista de clientes ficam no <b>navegador</b> (localStorage), não no servidor.</li>
    <li>O PDF é gerado com <b>Chromium serverless</b> (<code>@sparticuz/chromium</code>) em vez do Chrome local.</li>
  </ul>

  <h2>6. Como usar (passo a passo)</h2>
  <ol class="steps">
    <li><b>Cliente & período</b> — escolha um cliente salvo (ou "➕ Novo cliente"), confira mês/ano e gestor. Marque "sem custo por conversão" se o cliente preferir o card de Cliques.</li>
    <li><b>Prints</b> — arraste os 2 prints (visão geral + tabela de leilão). A ordem não importa.</li>
    <li><b>Ler prints com a IA</b> — a OpenAI lê as imagens e preenche todos os campos.</li>
    <li><b>Conferir</b> — todos os campos são editáveis; avisos de transparência aparecem em destaque. Use <b>👁 Pré-visualizar</b> para ver antes de baixar.</li>
    <li><b>Gerar Relatório (PDF)</b> — baixa <code>Relatório &lt;Mês&gt; - &lt;Cliente&gt;.pdf</code>.</li>
  </ol>

  <h2>7. Dependências principais</h2>
  <table>
    <tr><th>Pacote</th><th>Uso</th></tr>
    <tr><td><code>express</code></td><td>Servidor HTTP e rotas da API.</td></tr>
    <tr><td><code>openai</code></td><td>Cliente da API de visão (leitura dos prints).</td></tr>
    <tr><td><code>multer</code></td><td>Upload das imagens (em memória, até 15 MB por print).</td></tr>
    <tr><td><code>puppeteer-core</code></td><td>Renderiza o HTML do relatório em PDF.</td></tr>
    <tr><td><code>@sparticuz/chromium</code></td><td>Chromium para o ambiente serverless da Vercel.</td></tr>
    <tr><td><code>dotenv</code></td><td>Carrega variáveis do <code>.env</code>.</td></tr>
  </table>

  <div class="foot">
    <span>Tráfega Mídia — Gerador de Relatórios Google Ads</span>
    <span>Documentação técnica · v1.0.0</span>
  </div>

</div></body></html>`;

const out = path.join(ROOT, 'DOCUMENTACAO.pdf');
const pdf = await htmlToPdf(html);
fs.writeFileSync(out, pdf);
await closeBrowser();
console.log('PDF gerado em: ' + out + ' (' + Math.round(pdf.length / 1024) + ' KB)');
