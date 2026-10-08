// Langkah 3 - HMAC Secure Webhook (Node.js ES Module)
// POST /api/webhook  (header: x-signature = HMAC-SHA256 hex dari body)
import crypto from "node:crypto";

async function bacaBody(req) {
  const chunks = [];
  for await (const c of req) chunks.push(c);
  return Buffer.concat(chunks).toString("utf8");
}

async function kirimTelegram(teks) {
  const { TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID } = process.env;
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) return;
  await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: TELEGRAM_CHAT_ID, text: teks }),
  });
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Gunakan POST" });

  const signature = req.headers["x-signature"];
  if (!signature) return res.status(400).json({ error: "Header x-signature tidak ada" });   // Missing 400

  const rawBody = await bacaBody(req);
  const expected = crypto
    .createHmac("sha256", process.env.HMAC_SECRET ?? "")
    .update(rawBody)
    .digest("hex");

  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  const valid = a.length === b.length && crypto.timingSafeEqual(a, b);   // cegah timing attack
  if (!valid) return res.status(401).json({ error: "Signature tidak valid" });              // Tampered 401

  const laporan = JSON.parse(rawBody);   // { status, level, pesan }
  await kirimTelegram(
    `[PERWIRA SECURITY]\nStatus: ${laporan.status}\nLevel: ${laporan.level}\nPesan: ${laporan.pesan}`
  );
  return res.status(200).json({ ok: true });                                                // Valid 200
}
