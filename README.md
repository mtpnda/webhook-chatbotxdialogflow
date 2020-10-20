# Chatbot Pemesanan Makanan

Repositori ini adalah webhook chatbot pemesanan makanan menggunakan Dialogflow.

## Menghubungkan Webhook dengan Dialogflow menggunakan glitch
1. Fork repository ini.
2. Login ke glitch.com dan hubungkan akun ke Github.
3. Pilih `New Project -> Import` from Github.
4. Pilih repository yang telah kamu Fork
5. Pilih `Share -> Live` App dan copy URL glitch
6. Paste URL glitch pada dialogflow, pada menu `Fullfillment -> URL`

## Menghubungkan Webhook dengan Dialogflow menggunakan localhost

1. Clone repositori ini.
2. Install dependencies `npm install`
3. Aktifkan web server `npm start`
4. Expose URL localhost (siapkan ngrok `npm install -g ngrok`) `ngrok http 3000`
5. Pada baris `https://xxxxxxx.ngrok.io -> http://localhost:3000`, copy URL ngrok
6. Paste URL ngrok pada dialogflow, pada menu `Fullfillment -> URL`

---

**Made by MTPNDA** 

( ᵔ ᴥ ᵔ )