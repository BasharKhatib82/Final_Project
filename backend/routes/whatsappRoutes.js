import express from "express";
import crypto from "crypto";

const router = express.Router();

// Parse JSON and keep raw body for signature checks
router.use(
  express.json({
    verify: (req, res, buf) => {
      req.rawBody = buf;
    },
  })
);

// אימות חתימה של Meta
function verifyMetaSignature(req) {
  const signature = req.headers["x-hub-signature-256"];
  if (!signature) return false;

  const hmac = crypto
    .createHmac("sha256", process.env.APP_SECRET)
    .update(req.rawBody)
    .digest("hex");

  return `sha256=${hmac}` === signature;
}

// ✅ Handshake verification
router.get("/webhook", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode === "subscribe" && token === process.env.VERIFY_TOKEN) {
    return res.status(200).send(challenge);
  }
  return res.sendStatus(403);
});

// ✅ Receiving webhook events
router.post("/webhook", async (req, res) => {
  // Always reply fast
  res.sendStatus(200);

  try {
    if (!verifyMetaSignature(req)) {
      console.warn("❌ בקשה עם חתימה לא תקינה");
      return;
    }

    const entry = req.body.entry?.[0];
    const changes = entry?.changes?.[0];
    const value = changes?.value;
    const message = value?.messages?.[0];

    if (message) {
      const from = message.from;
      const text = message.text?.body;
      console.log(`📲 הודעה מ-${from}: ${text}`);
    } else {
      console.log("📩 Webhook:", JSON.stringify(req.body, null, 2));
    }
  } catch (error) {
    console.error("שגיאה בטיפול ב-webhook של WhatsApp:", error);
  }
});

export default router;
