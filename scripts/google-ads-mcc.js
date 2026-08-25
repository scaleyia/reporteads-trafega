/**
 * ============================================================================
 *  Tráfega — Google Ads Script (nível MCC)
 * ----------------------------------------------------------------------------
 *  Roda DENTRO da conta gerenciadora (MCC). Não precisa de developer token
 *  nem de aprovação de API. Varre todas as contas-filhas, coleta as métricas
 *  do mês e envia para o sistema Tráfega via webhook (/api/ingest).
 *
 *  COMO USar (dono do MCC):
 *   1. Google Ads (conta MCC) → Ferramentas → Ações em massa → Scripts.
 *   2. "+", cole este arquivo inteiro.
 *   3. Preencha ENDPOINT e TOKEN abaixo (o Gabriel te passa os valores).
 *   4. Autorize (Google pede na 1ª vez) e clique em "Visualizar/Executar".
 *   5. Programe a frequência (ex.: diariamente) em "Frequência".
 * ============================================================================
 */

// >>> PREENCHER (valores fornecidos pela Tráfega) >>>
var ENDPOINT = 'https://reporteads-trafega.vercel.app/api/ingest';
var TOKEN    = 'COLE_AQUI_O_INGEST_TOKEN';
// <<< ------------------------------------------- <<<

var MESES = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];

function main() {
  var it = AdsManagerApp.accounts().get();
  var enviadas = 0, falhas = 0;
  while (it.hasNext()) {
    var conta = it.next();
    AdsManagerApp.select(conta);
    try {
      enviarConta(conta);
      enviadas++;
    } catch (e) {
      falhas++;
      Logger.log('Falha em ' + conta.getName() + ': ' + e);
    }
  }
  Logger.log('Concluído. Enviadas: ' + enviadas + ' | Falhas: ' + falhas);
}

function enviarConta(conta) {
  var acc = AdsApp.currentAccount();
  var s = acc.getStatsFor('THIS_MONTH');

  var conversoes = s.getConversions();
  var cliques = s.getClicks();
  var custo = s.getCost();

  var payload = {
    plataforma: 'google',
    contaId: conta.getCustomerId(),
    contaNome: conta.getName(),
    moeda: acc.getCurrencyCode(),
    periodo: nomeDoMes(new Date()),
    metricas: {
      conversoes: conversoes,
      cliques: cliques,
      custo: custo,
      cpcMedio: cliques ? custo / cliques : 0,
      custoPorConversao: conversoes ? custo / conversoes : 0,
      impressoes: s.getImpressions(),
    },
    serie: serieMensal(acc),
  };

  var resp = UrlFetchApp.fetch(ENDPOINT, {
    method: 'post',
    contentType: 'application/json',
    headers: { 'x-ingest-token': TOKEN },
    payload: JSON.stringify(payload),
    muteHttpExceptions: true,
  });
  if (resp.getResponseCode() >= 300) {
    throw new Error('HTTP ' + resp.getResponseCode() + ' — ' + resp.getContentText());
  }
}

/* Série de conversões dos últimos 5 meses (para o gráfico). */
function serieMensal(acc) {
  var labels = [], valores = [];
  var hoje = new Date();
  for (var i = 4; i >= 0; i--) {
    var ini = new Date(hoje.getFullYear(), hoje.getMonth() - i, 1);
    var fim = new Date(hoje.getFullYear(), hoje.getMonth() - i + 1, 0);
    var st = acc.getStatsFor(fmt(ini), fmt(fim));
    labels.push(MESES[ini.getMonth()]);
    valores.push(st.getConversions());
  }
  return { labels: labels, valores: valores };
}

function fmt(d) {
  var m = ('0' + (d.getMonth() + 1)).slice(-2);
  var dd = ('0' + d.getDate()).slice(-2);
  return '' + d.getFullYear() + m + dd; // yyyymmdd
}

function nomeDoMes(d) {
  return MESES[d.getMonth()] + '/' + d.getFullYear();
}
