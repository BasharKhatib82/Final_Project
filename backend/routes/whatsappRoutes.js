import express from "express";

const router = express.Router();

// Parse JSON *and* keep raw body only for this router (useful later for signature checks)
router.use((req, res, next) => {
  // attach a json parser that also stores raw body
  let data = [];
  req.on("data", (chunk) => data.push(chunk));
  req.on("end", () => {
    try {
      const raw = Buffer.concat(data);
      req.rawBody = raw; // keep raw buffer for future signature validation
      if (raw.length) {
        req.body = JSON.parse(raw.toString("utf8"));
      } else {
        req.body = {};
      }
    } catch {
      // fallback to empty body if not JSON
      req.body = {};
    }
    next();
  });
});

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
router.post("/webhook", (req, res) => {
  // Always reply fast to avoid retries
  res.sendStatus(200);

  // Log full payload for now (simple start)
  console.log(
    "📩 Incoming WhatsApp JSON:\n",
    JSON.stringify(req.body, null, 2)
  );

  // Later: insert to DB, trigger flows, map to project, etc.
});

export default router;
