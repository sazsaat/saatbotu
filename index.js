const express = require("express");
const bodyParser = require("body-parser");
const request = require("request");
const app = express();
const PORT = process.env.PORT || 3000;

const VERIFY_TOKEN = "furkan-token-ab0782be";
const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;

app.use(bodyParser.json());

// GET: Facebook doğrulama
app.get("/webhook", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode && token === VERIFY_TOKEN) {
    res.status(200).send(challenge);
  } else {
    res.sendStatus(403);
  }
});

// POST: mesaj geldiğinde çalışacak endpoint
app.post("/webhook", (req, res) => {
  const body = req.body;

  if (body.object === "page") {
    body.entry.forEach(entry => {
      const webhook_event = entry.messaging[0];
      const sender_psid = webhook_event.sender.id;

      if (webhook_event.message && webhook_event.message.text) {
        const received_message = webhook_event.message.text;
        sendMessage(sender_psid, "Merhaba! Sipariş vermek isterseniz yardımcı olabilirim 😊");
      }
    });

    res.status(200).send("EVENT_RECEIVED");
  } else {
    res.sendStatus(404);
  }
});

// Yanıt gönderme fonksiyonu
function sendMessage(sender_psid, response) {
  const request_body = {
    recipient: { id: sender_psid },
    message: { text: response }
  };

  request({
    uri: "https://graph.facebook.com/v19.0/me/messages",
    qs: { access_token: PAGE_ACCESS_TOKEN },
    method: "POST",
    json: request_body
  }, (err, res, body) => {
    if (!err) {
      console.log("Mesaj gönderildi!");
    } else {
      console.error("Hata:", err);
    }
  });
}

app.listen(PORT, () => {
  console.log(`Sunucu çalışıyor: http://localhost:${PORT}`);
});
