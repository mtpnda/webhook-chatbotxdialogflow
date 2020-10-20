const express = require("express");
const body_parser = require("body-parser");
const { WebhookClient } = require('dialogflow-fulfillment');
const { nanoid } = require('nanoid')
const axios = require('axios')
const app = express();

var sheetClient = axios.create({
  baseURL: 'https://sheet.best/api/sheets/1fd0c830-d7c1-4777-97f6-0837459ea6fe',
});

app.use(body_parser.urlencoded({ extended: false }));
app.use(body_parser.json());

const sheet_best_url = 'https://sheet.best/api/sheets/1fd0c830-d7c1-4777-97f6-0837459ea6fe'

const price = {
  'Bakso': 12000,
  'Mie Ayam': 15000,
  'Teh Tawar': 2000,
  'Teh Manis': 3000
}

function formatCurrency(number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(number)
}

// Intents
async function lihatMenu(agent) {
  agent.add('Silahkan dipilih menunya, Kak');
  var response = await sheetClient.get('/tabs/Menu');
  if (response.data.length) {
    response.data.forEach(item => agent.add(`${item.nama} : ${item.harga}/${item.satuan}`))
  } else {
    agent.add('Mohon maaf Kak, menu nya belum tersedia untuk hari ini')
  }  
}

function pilihMenu(agent) {
  var nama = agent.parameters.nama || ""
  var pesanan = agent.parameters.menu || []
  var jml_raw = agent.parameters.jml || []  
  var jml = pesanan.map((item, index) => parseInt(jml_raw[index] || 1))

  var kode = nanoid(10)
  var harga = pesanan.map((item, index) => price[item] * parseInt(jml[index]))
  var sum_harga = harga.reduce((sum, item) => sum + item, 0)
  var pesanan_text_list = pesanan.map((item, index) => `${jml[index]}x ${item} = ${formatCurrency(harga[index])}`)
  var sum_harga_text = formatCurrency(sum_harga)

  var data = [
    {
      nama: nama,
      kode_pesanan: kode,
      pesanan: `="${pesanan_text_list.join('"&CHAR(10)&"')}"`,
      total_harga: sum_harga_text,
      status: 'menunggu bayar'
    }
  ];
  sheetClient.post('/tabs/Order', data)

  agent.add(`Berikut adalah pesanan kakak`);
  agent.add(`---------------------------------`);
  pesanan_text_list.forEach(item => agent.add(item))
  agent.add(`....................................`);
  agent.add(`Total harga = ${sum_harga_text}`);
  agent.add(`---------------------------------`);
  agent.add(`Kode pemesanan kakak adalah ${kode}`);
  agent.add(`Jawab iya jika selesai melakukan pembayaran, atau "tidak" untuk membatalkan`);

  agent.context.set("kode-pesanan", 1, { kode: kode });
}

function confirmPilihMenu(agent) {
  var kode = agent.context.get('kode-pesanan').parameters.kode;
  var updated_data = {
    status: 'berhasil bayar'
  };
  sheetClient.patch(`/tabs/Order/kode_pesanan/${kode}`, updated_data)
  agent.add(`Pesanan kakak dengan kode ${kode} akan kami buatkan. Terima kasih`);
}

// webhook
app.post("/webhook/", function(request, response) {
  const agent = new WebhookClient({request: request, response: response});

  let intentMap = new Map();
  intentMap.set('Lihat Menu', lihatMenu);
  intentMap.set('Pilih Menu', pilihMenu);
  intentMap.set('Pilih Menu - yes', confirmPilihMenu);
  agent.handleRequest(intentMap);
});

// listen for requests :)
const listener = app.listen(process.env.PORT);
