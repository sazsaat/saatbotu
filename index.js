const express = require("express");
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Facebook doğrulama endpoint’i
app.get("/webhook", (req, res) => {
  const VERIFY_TOKEN = "furkan-token-ab0782be"; // Jetonun aynısı

  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode && token === VERIFY_TOKEN) {
    res.status(200).send(challenge);
  } else {
    res.sendStatus(403);
  }
});

// POST endpointi (sonra kullanılacak)
app.post("/webhook", (req, res) => {
  console.log("Gelen mesaj:", req.body);
  res.sendStatus(200);
});

app.listen(PORT, () => {
  console.log(`Sunucu çalışıyor: http://localhost:${PORT}`);
});
