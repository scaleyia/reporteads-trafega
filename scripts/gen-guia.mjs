// Gera o "Guia de Integração" em PDF (passo a passo para leigos), reaproveitando
// o motor de PDF do projeto (lib/pdf.js). Uso: `node scripts/gen-guia.mjs`
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { htmlToPdf, closeBrowser } from '../lib/pdf.js';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(HERE, '..');
const logoB64 = fs.readFileSync(path.join(ROOT, 'assets', 'logo_b64.txt'), 'utf-8').trim();

// Pega o INGEST_TOKEN do .env para já deixar o script preenchido.
const env = fs.existsSync(path.join(ROOT, '.env')) ? fs.readFileSync(path.join(ROOT, '.env'), 'utf-8') : '';
const ingestToken = (env.match(/^INGEST_TOKEN=(.*)$/m) || [])[1] || 'DEFINA_O_INGEST_TOKEN_NA_VERCEL';

// Monta o script do Google já com o token preenchido (a URL fica marcada).
let script = fs.readFileSync(path.join(ROOT, 'scripts', 'google-ads-mcc.js'), 'utf-8');
script = script.replace('COLE_AQUI_O_INGEST_TOKEN', ingestToken);
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const html = /* html */ `<!doctype html>
<html lang="pt-BR"><head><meta charset="utf-8">
<style>
  :root{ --ink:#14201a; --muted:#5b6472; --line:#e5e8ee; --brand:#0c8614; --accent:#12CC1C; --soft:#f2faf3; --code:#0b1220; --warn:#fdf3e2; --warnl:#7a5610; }
  *{ box-sizing:border-box; }
  html,body{ margin:0; padding:0; }
  body{ font-family:-apple-system,"Segoe UI",Roboto,Helvetica,Arial,sans-serif; color:var(--ink); font-size:11px; line-height:1.6; }
  .page{ padding:44px 50px; }
  h1{ font-size:25px; margin:0 0 4px; letter-spacing:-.4px; }
  h2{ font-size:15px; margin:24px 0 8px; padding-bottom:5px; border-bottom:2px solid var(--brand); letter-spacing:-.2px; color:var(--brand); }
  h3{ font-size:12.5px; margin:14px 0 5px; }
  p{ margin:6px 0; }
  ul,ol{ margin:6px 0 6px 20px; padding:0; } li{ margin:4px 0; }
  code{ font-family:"SF Mono",Menlo,Consolas,monospace; background:var(--soft); border:1px solid var(--line); border-radius:4px; padding:1px 5px; font-size:10px; }
  pre{ background:var(--code); color:#e6edf3; border-radius:8px; padding:12px 14px; font-size:8.6px; overflow:auto; line-height:1.5; white-space:pre-wrap; word-break:break-word; }
  pre code{ background:none; border:none; color:inherit; padding:0; }
  .muted{ color:var(--muted); }
  table{ width:100%; border-collapse:collapse; margin:8px 0; font-size:10px; }
  th,td{ text-align:left; padding:7px 9px; border-bottom:1px solid var(--line); vertical-align:top; }
  th{ background:var(--soft); font-weight:700; }
  .kv td:first-child{ width:160px; font-weight:700; white-space:nowrap; }
  .cover{ background:linear-gradient(120deg,#0a5f11,#15ac20); border-radius:16px; color:#fff; padding:30px 34px; margin-bottom:14px; }
  .cover img{ height:26px; width:auto; margin-bottom:16px; filter:brightness(0) invert(1); }
  .cover h1{ color:#fff; }
  .cover .sub{ color:#e6ffe9; font-size:12.5px; margin-top:4px; }
  .pill{ display:inline-block; background:var(--soft); color:var(--brand); border:1px solid #cfe9d2; border-radius:999px; padding:2px 10px; font-size:9.5px; font-weight:700; }
  .step{ border:1px solid var(--line); border-left:4px solid var(--accent); border-radius:10px; padding:12px 15px; margin:10px 0; background:#fff; }
  .step h3{ margin-top:0; }
  .num{ display:inline-flex; align-items:center; justify-content:center; width:20px; height:20px; border-radius:50%; background:var(--accent); color:#06230a; font-weight:800; font-size:11px; margin-right:7px; }
  .warn{ background:var(--warn); border:1px solid #f4e3c4; color:var(--warnl); border-radius:9px; padding:10px 13px; margin:9px 0; font-size:10.5px; }
  .ok{ background:var(--soft); border:1px solid #cfe9d2; color:var(--brand); border-radius:9px; padding:10px 13px; margin:9px 0; font-size:10.5px; }
  .tag{ display:inline-block; font-weight:800; font-size:10px; padding:1px 7px; border-radius:5px; margin-right:5px; }
  .g{ background:#fef7e0; color:#a56a00; } .m{ background:#e7f0ff; color:#0866ff; } .w{ background:#e7f7ea; color:#0c8614; }
  .brk{ page-break-before: always; }
</style></head>
<body>
<div class="page">

  <div class="cover">
    <img src="data:image/png;base64,${logoB64}" alt="Tráfega">
    <h1>Guia de Integração</h1>
    <div class="sub">Como ligar o Google Ads, a Meta e o WhatsApp ao sistema de relatórios — passo a passo, sem enrolação.</div>
  </div>

  <p class="muted">Este guia é para você seguir <b>durante o acesso remoto (AnyDesk)</b> à conta do dono do sistema. Cada bloco é um passo. Faça na ordem. Onde tiver <span class="pill">DICA</span>, é atalho; onde tiver aviso amarelo, é cuidado importante.</p>

  <h2>Visão geral — o que vamos ligar</h2>
  <table class="kv">
    <tr><td><span class="tag g">GOOGLE</span></td><td>Um "script" colado dentro do Google Ads que, sozinho, manda os números das contas pro sistema. <b>Não precisa de aprovação de API.</b></td></tr>
    <tr><td><span class="tag m">META</span></td><td>Um "token" (uma senha especial) gerado no Business Manager, que deixa o sistema ler os dados das contas. <b>Sem App Review.</b></td></tr>
    <tr><td><span class="tag w">WHATSAPP</span></td><td>Um QR Code que você lê com o celular que vai enviar os relatórios.</td></tr>
  </table>

  <h2>Antes de começar — tenha aberto</h2>
  <ul>
    <li>O <b>painel da Vercel</b> do projeto (onde o sistema está publicado).</li>
    <li>O <b>sistema aberto</b> no navegador (o painel de relatórios).</li>
    <li>Acesso remoto ligado à máquina do dono (para entrar no Google Ads e na Meta com a conta dele).</li>
    <li>O <b>celular</b> com o WhatsApp que vai disparar os relatórios.</li>
  </ul>

  <h2><span class="num">1</span>Configurar o sistema na Vercel</h2>
  <p>A Vercel é onde o sistema está publicado. Aqui a gente guarda umas "chaves" e cria um bancinho de dados. Faça na sua própria conta da Vercel (não precisa do acesso remoto ainda).</p>

  <h3>1.1 — Entrar no projeto</h3>
  <ol>
    <li>Acesse <b>vercel.com</b> e faça login.</li>
    <li>Na lista de projetos, clique em <b>reporteads-trafega</b>.</li>
    <li>No topo, clique na aba <b>Settings</b> (Configurações).</li>
  </ol>

  <h3>1.2 — Colocar as variáveis (as "chaves")</h3>
  <ol>
    <li>No menu da esquerda, clique em <b>Environment Variables</b> (Variáveis de Ambiente).</li>
    <li>Para cada linha da tabela abaixo: escreva o nome em <b>Key</b>, o valor em <b>Value</b>, deixe marcado <b>Production</b> e clique em <b>Save</b>.</li>
  </ol>
  <table class="kv">
    <tr><th>Key (nome)</th><th>Value (o que colocar)</th></tr>
    <tr><td>INGEST_TOKEN</td><td>Cole exatamente: <code>${esc(ingestToken)}</code></td></tr>
    <tr><td>CRON_SECRET</td><td>Qualquer texto longo e aleatório (ex.: junte letras e números, umas 30 casas). Serve de senha do disparo automático.</td></tr>
    <tr><td>META_ACCESS_TOKEN</td><td>Deixe <b>em branco por enquanto</b> — você preenche no Passo 3.</td></tr>
    <tr><td>META_API_VERSION</td><td>Escreva: <code>v21.0</code></td></tr>
  </table>
  <div class="warn">💡 Se alguma variável já existir na lista, não precisa criar de novo — só confira se o valor está certo.</div>

  <h3>1.3 — Criar o banco de dados (KV)</h3>
  <p>É onde ficam salvos os agendamentos e as contas. Sem ele, na Vercel nada fica guardado.</p>
  <ol>
    <li>No topo, clique na aba <b>Storage</b>.</li>
    <li>Clique em <b>Create Database</b> (Criar banco). Escolha a opção <b>KV</b> (também pode aparecer como “Upstash for Redis / KV”).</li>
    <li>Dê um nome qualquer (ex.: <code>trafega-kv</code>), escolha a região mais próxima do Brasil e confirme.</li>
    <li>Quando ele perguntar, clique em <b>Connect Project</b> e selecione o projeto <b>reporteads-trafega</b>. Confirme.</li>
  </ol>
  <div class="ok">✅ Ao conectar, a Vercel cria sozinha as variáveis <code>KV_REST_API_URL</code> e <code>KV_REST_API_TOKEN</code> — você não precisa digitar nada disso.</div>

  <h3>1.4 — Publicar as mudanças (Redeploy)</h3>
  <ol>
    <li>No topo, clique na aba <b>Deployments</b>.</li>
    <li>Na primeira linha (o deploy mais recente), clique no botão <b>“···”</b> à direita → <b>Redeploy</b>.</li>
    <li>Confirme clicando em <b>Redeploy</b> de novo. Espere uns 1–2 minutos até ficar <b>Ready</b> (verde).</li>
  </ol>
  <div class="warn">⚠️ Toda vez que você mudar uma variável, precisa fazer <b>Redeploy</b> para valer. Vai lembrar disso de novo no Passo 3.</div>

  <h2 class="brk"><span class="num">2</span>Ligar o Google Ads (colar o script no MCC)</h2>
  <p>Aqui você <b>entra na conta do dono (via acesso remoto)</b>. A ideia: colar um script dentro do Google Ads que envia os números pro sistema, sozinho, todo dia.</p>

  <h3>2.1 — Entrar na conta certa (MCC)</h3>
  <ol>
    <li>Abra <b>ads.google.com</b> (a conta do dono já deve estar logada).</li>
    <li>No canto superior direito tem o <b>seletor de contas</b> (mostra o nome/número da conta). Clique nele e escolha a <b>conta gerenciadora (MCC)</b> — é a que enxerga todas as contas dos clientes de uma vez.</li>
  </ol>
  <div class="warn">⚠️ Tem que ser a conta <b>MCC</b> (gerenciadora), não a de um cliente só. Se colar numa conta-filha, ele só pega aquela conta.</div>

  <h3>2.2 — Abrir a tela de Scripts</h3>
  <ol>
    <li>No menu de cima, clique em <b>Ferramentas</b> (ícone de <b>chave inglesa</b> 🔧, ou o texto “Ferramentas e configurações”).</li>
    <li>Procure a coluna <b>Ações em massa</b> e clique em <b>Scripts</b>.</li>
  </ol>

  <h3>2.3 — Criar e colar o script</h3>
  <ol>
    <li>Clique no botão azul <b>“+”</b> (ou “Novo script”), no canto superior esquerdo da lista.</li>
    <li>Vai abrir um editor com um texto de exemplo. <b>Selecione tudo e apague</b> (Ctrl+A e Delete).</li>
    <li><b>Cole o script inteiro</b> que está na última página deste guia (ele já vem com a URL e o token prontos — não precisa mexer em nada).</li>
    <li>Lá em cima, troque o nome “Script sem título” por algo como <b>Envio Tráfega</b>.</li>
  </ol>

  <h3>2.4 — Autorizar</h3>
  <ol>
    <li>Clique em <b>Autorizar</b> (na 1ª vez o Google pede permissão).</li>
    <li>Abre uma janelinha do Google: escolha a <b>conta do dono</b>.</li>
    <li>Se aparecer “O Google não verificou este app”, clique em <b>Avançado</b> → <b>Acessar (nome do script)</b>. É seguro — é o script dele mesmo.</li>
    <li>Na tela de permissões, clique em <b>Permitir</b>.</li>
  </ol>

  <h3>2.5 — Rodar uma vez e conferir</h3>
  <ol>
    <li>Clique em <b>Executar</b> (botão de rodar) e espere aparecer “Concluído”.</li>
    <li>Clique em <b>Registros</b> (ou “Logs”) para ver o resultado — deve aparecer algo como <code>Enviadas: X | Falhas: 0</code>.</li>
  </ol>

  <h3>2.6 — Deixar automático (todo dia)</h3>
  <ol>
    <li>Ainda na tela do script, procure <b>Frequência</b> (ícone de relógio / “Criar agendamento”).</li>
    <li>Escolha <b>Diariamente</b>, um horário qualquer, e <b>Salve</b>.</li>
  </ol>
  <div class="ok">✅ Confirmação: abra o sistema em <b>Contas de anúncio</b>. As contas do Google aparecem na tabela com conversões e custo reais. 🎉</div>

  <h2 class="brk"><span class="num">3</span>Ligar a Meta (gerar o token)</h2>
  <p>Ainda dentro do acesso remoto (conta do dono). Aqui a gente gera uma "senha especial" (token) que deixa o sistema ler os dados das contas do Meta.</p>

  <h3>3.1 — Ter um "app" (só uma vez)</h3>
  <p>O token precisa ficar ligado a um app. Se o dono já tiver um, pule para o 3.2. Se não:</p>
  <ol>
    <li>Abra <b>developers.facebook.com</b> → menu <b>Meus Apps</b> → <b>Criar app</b>.</li>
    <li>Em tipo, escolha <b>Outro</b> e depois <b>Empresa</b> (Business). Clique em Avançar.</li>
    <li>Dê um nome (ex.: <b>Relatórios Tráfega</b>), confirme o e-mail e clique em <b>Criar app</b>. Pronto — pode fechar.</li>
  </ol>

  <h3>3.2 — Criar o Usuário do Sistema</h3>
  <ol>
    <li>Abra <b>business.facebook.com</b>.</li>
    <li>Clique na <b>engrenagem ⚙️ (Configurações do Negócio)</b>, no canto inferior/lateral esquerdo.</li>
    <li>No menu da esquerda, desça até <b>Usuários</b> e clique em <b>Usuários do sistema</b>.</li>
    <li>Clique em <b>Adicionar</b>. Nome: <b>Relatórios Tráfega</b>. Função: <b>Funcionário</b>. Confirme.</li>
  </ol>

  <h3>3.3 — Dar acesso às contas de anúncio</h3>
  <ol>
    <li>Com o usuário do sistema selecionado, clique em <b>Adicionar ativos</b> (Add Assets).</li>
    <li>Escolha a aba <b>Contas de anúncio</b>.</li>
    <li><b>Marque</b> as contas dos clientes que entram nos relatórios.</li>
    <li>Ligue a permissão de <b>Ver desempenho</b> (leitura) e clique em <b>Salvar alterações</b>.</li>
  </ol>

  <h3>3.4 — Gerar o token</h3>
  <ol>
    <li>Ainda no usuário do sistema, clique em <b>Gerar novo token</b>.</li>
    <li>Em <b>App</b>, escolha o app do passo 3.1.</li>
    <li>Em <b>Expiração do token</b>, escolha <b>Nunca</b>.</li>
    <li>Na lista de permissões, procure e <b>marque</b> <code>ads_read</code>.</li>
    <li>Clique em <b>Gerar token</b>. Vai aparecer um código grande — clique em <b>Copiar</b>.</li>
  </ol>
  <div class="warn">🔒 Esse código só aparece <b>uma vez</b>. Copie e cole com cuidado. Ele é uma <b>senha</b>: nunca mande por WhatsApp/e-mail.</div>

  <h3>3.5 — Colocar o token no sistema</h3>
  <ol>
    <li>Vá na <b>Vercel</b> → projeto <b>reporteads-trafega</b> → <b>Settings</b> → <b>Environment Variables</b>.</li>
    <li>Ache <b>META_ACCESS_TOKEN</b> (você criou no Passo 1) → clique para editar → <b>cole o token</b> no Value → <b>Save</b>.</li>
    <li>Vá em <b>Deployments</b> → <b>“···”</b> → <b>Redeploy</b> (para valer).</li>
  </ol>
  <div class="ok">✅ Teste: no sistema, em <b>Contas de anúncio</b>, clique em <b>Sincronizar Meta</b>. As contas da Meta aparecem na tabela. 🎉</div>

  <h2><span class="num">4</span>Conectar o WhatsApp</h2>
  <div class="step">
    <ol>
      <li>No sistema, abra o menu <b>Conexão</b> e clique em <b>Conectar aparelho</b> — vai aparecer um <b>QR Code</b>.</li>
      <li>No <b>celular</b> que vai enviar: WhatsApp → <b>⋮ / Ajustes</b> → <b>Aparelhos conectados</b> → <b>Conectar aparelho</b>.</li>
      <li>Aponte a câmera para o QR Code da tela. Em alguns segundos ele mostra <b>Conectado</b> com o nome e número.</li>
    </ol>
  </div>

  <h2><span class="num">5</span>Conferir tudo</h2>
  <table>
    <tr><th>Onde</th><th>O que deve estar</th></tr>
    <tr><td>Conexão</td><td>WhatsApp <b>Conectado</b> (verde).</td></tr>
    <tr><td>Contas de anúncio</td><td>Contas do Google e da Meta aparecendo com números.</td></tr>
    <tr><td>Agendamentos</td><td>Horário do disparo definido (ex.: 08h).</td></tr>
  </table>

  <h2>Problemas comuns</h2>
  <table>
    <tr><th>Sintoma</th><th>O que fazer</th></tr>
    <tr><td>Google não aparece nas contas</td><td>Rode o script de novo (Visualizar/Executar) e veja o "Registro". Confira a URL do ENDPOINT e se o KV está conectado na Vercel.</td></tr>
    <tr><td>“Sincronizar Meta” dá erro de token</td><td>O META_ACCESS_TOKEN está vazio, errado ou expirado. Gere de novo (Passo 3) com <b>ads_read</b> e sem expiração.</td></tr>
    <tr><td>Nada salva na Vercel</td><td>Falta o <b>KV</b>. Crie em Storage → KV e conecte ao projeto.</td></tr>
    <tr><td>WhatsApp caiu</td><td>Volte em Conexão e escaneie o QR de novo.</td></tr>
  </table>

  <h2 class="brk">Script do Google Ads — copie tudo</h2>
  <p class="muted">Cole este conteúdo inteiro no editor de Scripts do Google Ads (Passo 2). Já está <b>100% preenchido</b> (URL do sistema + token) — é só colar, autorizar e agendar.</p>
  <pre><code>${esc(script)}</code></pre>

</div>
</body></html>`;

const pdf = await htmlToPdf(html);
const out = path.join(ROOT, 'GUIA-INTEGRACAO.pdf');
fs.writeFileSync(out, pdf);
await closeBrowser();
console.log('Gerado:', out);
