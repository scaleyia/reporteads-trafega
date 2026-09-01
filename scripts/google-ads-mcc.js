// Trafega - Google Ads Script (nivel MCC) - SEMANAL
// Envia as metricas da SEMANA ANTERIOR de cada conta para /api/ingest.
// Cole no editor de Scripts (conta MCC), Autorize, Execute e agende Diariamente.

var ENDPOINT = 'https://reporteads-trafega.vercel.app/api/ingest';
var TOKEN = 'COLE_AQUI_O_INGEST_TOKEN';

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
  Logger.log('Concluido. Enviadas: ' + enviadas + ' | Falhas: ' + falhas);
}

// Segunda e domingo da semana anterior.
function janela() {
  var hoje = new Date();
  var dow = (hoje.getDay() + 6) % 7; // 0 = segunda
  var thisMon = new Date(hoje); thisMon.setDate(hoje.getDate() - dow);
  var prevMon = new Date(thisMon); prevMon.setDate(thisMon.getDate() - 7);
  var prevSun = new Date(thisMon); prevSun.setDate(thisMon.getDate() - 1);
  return { prevMon: prevMon, prevSun: prevSun };
}

function enviarConta(conta) {
  var acc = AdsApp.currentAccount();
  var j = janela();
  var s = acc.getStatsFor(fmt(j.prevMon), fmt(j.prevSun));

  var conversoes = s.getConversions();
  var cliques = s.getClicks();
  var custo = s.getCost();

  var payload = {
    plataforma: 'google',
    contaId: conta.getCustomerId(),
    contaNome: conta.getName(),
    moeda: acc.getCurrencyCode(),
    periodo: 'Semana passada',
    metricas: {
      conversoes: conversoes,
      cliques: cliques,
      custo: custo,
      cpcMedio: cliques ? custo / cliques : 0,
      custoPorConversao: conversoes ? custo / conversoes : 0,
      impressoes: s.getImpressions()
    },
    serie: serieSemanal(acc, j.prevMon)
  };

  var resp = UrlFetchApp.fetch(ENDPOINT, {
    method: 'post',
    contentType: 'application/json',
    headers: { 'x-ingest-token': TOKEN },
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  });
  if (resp.getResponseCode() >= 300) {
    throw new Error('HTTP ' + resp.getResponseCode() + ': ' + resp.getContentText());
  }
}

// Conversoes das ultimas 6 semanas (a ultima e a semana anterior).
function serieSemanal(acc, prevMon) {
  var labels = [], valores = [];
  for (var i = 5; i >= 0; i--) {
    var ini = new Date(prevMon); ini.setDate(prevMon.getDate() - i * 7);
    var fim = new Date(ini); fim.setDate(ini.getDate() + 6);
    var st = acc.getStatsFor(fmt(ini), fmt(fim));
    labels.push(ddmm(ini));
    valores.push(st.getConversions());
  }
  return { labels: labels, valores: valores };
}

function fmt(d) {
  var m = ('0' + (d.getMonth() + 1)).slice(-2);
  var dd = ('0' + d.getDate()).slice(-2);
  return '' + d.getFullYear() + m + dd; // yyyymmdd
}

function ddmm(d) {
  var m = ('0' + (d.getMonth() + 1)).slice(-2);
  var dd = ('0' + d.getDate()).slice(-2);
  return dd + '/' + m;
}
