import express from "express";

const router = express.Router();

// Parse JSON and keep raw body for signature checks.
router.use(
  express.json({
    verify: (req, res, buf) => {
      req.rawBody = buf;
    },
  })
);

// GET /whatsapp/webhook — verification handshake from Meta
router.get("/webhook", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode === "subscribe" && token === process.env.VERIFY_TOKEN) {
    return res.status(200).send(challenge);
  }

  return res.sendStatus(403);
});

// POST /whatsapp/webhook — receive messages
router.post("/webhook", async (req, res) => {
  // Always reply fast to avoid retries
  res.sendStatus(200);

  try {
    // Log full payload for now (simple start)
    console.log(
      "📩 Incoming WhatsApp JSON:\n",
      JSON.stringify(req.body, null, 2)
    );
    // Later: insert to DB, trigger flows, map to project, etc.
  } catch (error) {
    console.error("שגיאה בטיפול ב-webhook של WhatsApp:", error);
    // You can choose to log the error but still send 200 to Meta
  }
});

export default router;
