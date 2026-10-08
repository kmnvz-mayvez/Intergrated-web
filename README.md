# Security Monitoring Dashboard

Alur: Supabase (trigger) -> HMAC Webhook -> Vercel Serverless -> NVIDIA NIM (RF + SVM async) -> Telegram Alert

## Struktur
```
api/proses_ai.py                 Langkah 2: FastAPI async (asyncio.gather)
api/webhook.js                   Langkah 3: HMAC-SHA256 + Telegram
public/index.html                Langkah 4: dashboard (dark + glassmorphism)
.github/workflows/deploy.yml     Langkah 1: CI/CD GitHub Actions
vercel.json, requirements.txt, package.json
```

## Secrets yang harus diisi (JANGAN hard-code)
- GitHub Secrets: VERCEL_TOKEN (+ SUPABASE_URL, SUPABASE_ANON_KEY bila dipakai)
- Vercel Environment Variables: HMAC_SECRET, TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID

## Uji coba (cek 3 skenario)
```
BODY='{"status":"ALERT","level":3,"pesan":"uji"}'
SIG=$(printf '%s' "$BODY" | openssl dgst -sha256 -hmac "$HMAC_SECRET" | awk '{print $2}')
curl -i -X POST $URL/api/webhook -H "x-signature: $SIG" -d "$BODY"      # 200
curl -i -X POST $URL/api/webhook -H "x-signature: salah" -d "$BODY"     # 401
curl -i -X POST $URL/api/webhook -d "$BODY"                             # 400
curl "$URL/api/proses_ai?input=login%20gagal"                           # duration <= ~0.6 detik
```

## Latihan
1. Ganti simulasi `asyncio.sleep` dengan panggilan nyata ke NVIDIA NIM memakai httpx.AsyncClient.
2. Tambahkan pemeriksaan timestamp pada webhook untuk mencegah replay attack.
3. Hubungkan trigger Supabase (Database Webhook) ke /api/webhook.
