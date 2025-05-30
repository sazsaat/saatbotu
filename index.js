const express = require("express");
const bodyParser = require("body-parser");
const request = require("request");
const { Configuration, OpenAIApi } = require("openai");

const app = express();
const PORT = process.env.PORT || 3000;

// OpenAI API ayarları
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY, // Render çevre değişkeninden alır
});
const openai = new OpenAIApi(configuration);

// Facebook doğrulama token'ı ve sayfa erişim anahtarı
const VERIFY_TOKEN = "furkan-token-ab0782be";
const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;

app.use(bodyParser.json());

// Webhook doğrulama (GET)
app.get("/webhook", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    console.log("Webhook doğrulandı.");
    res.status(200).send(challenge);
  } else {
    res.sendStatus(403);
  }
});

// Webhook mesaj alma ve yanıtlama (POST)
app.post("/webhook", async (req, res) => {
  const body = req.body;

  if (body.object === "page") {
    for (const entry of body.entry) {
      const webhook_event = entry.messaging[0];
      const sender_psid = webhook_event.sender.id;

      if (webhook_event.message && webhook_event.message.text) {
        const userMessage = webhook_event.message.text;

        try {
          // OpenAI'ya mesaj gönder
          const aiResponse = await openai.createChatCompletion({
            model: "gpt-4",
            messages: [
              { role: "user", content: userMessage },
            ],
          });

          const reply = aiResponse.data.choices[0].message.content;

          // Facebook’a cevap gönder
          sendMessage(sender_psid, reply);
        } catch (err) {
          console.error("OpenAI hatası:", err);
        }
      }
    }

    res.status(200).send("EVENT_RECEIVED");
  } else {
    res.sendStatus(404);
  }
});

// Facebook’a mesaj gönderen fonksiyon
function sendMessage(sender_psid, responseText) {
  const request_body = {
    recipient: {
      id: sender_psid,
    },
    message: {
      text: responseText,
    },
  };

  request(
    {
      uri: "https://graph.facebook.com/v17.0/me/messages",
      qs: { access_token: PAGE_ACCESS_TOKEN },
      method: "POST",
      json: request_body,
    },
    (err, res, body) => {
      if (!err) {
        console.log("Mesaj gönderildi!");
      } else {
        console.error("Mesaj gönderme hatası:", err);
      }
    }
  );
}

// Sunucuyu başlat
app.listen(PORT, () => {
  console.log(`Sunucu çalışıyor: http://localhost:${PORT}`);
});
