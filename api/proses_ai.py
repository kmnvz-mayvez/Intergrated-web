"""
Langkah 2 - Async AI (NVIDIA NIM)
Endpoint: GET /api/proses_ai?input=<data>
RF (delay 0.3s) dan SVM (delay 0.5s) dijalankan PARALEL dengan asyncio.gather,
sehingga total waktu ~0.5s, bukan 0.8s (sequential).

Catatan belajar: delay di sini mensimulasikan latensi panggilan API model.
Ganti isi fungsi dengan request ke NVIDIA NIM sungguhan (httpx.AsyncClient)
dan simpan API key di environment variable, bukan di kode.
"""
import asyncio
import time
from fastapi import FastAPI

app = FastAPI()


async def prediksi_rf(data: str) -> dict:
    await asyncio.sleep(0.3)          # simulasi latensi Random Forest
    level = "BAHAYA" if "login gagal" in data.lower() else "AMAN"
    return {"model": "RandomForest", "label": level, "confidence": 0.97}


async def prediksi_svm(data: str) -> dict:
    await asyncio.sleep(0.5)          # simulasi latensi SVM
    level = "BAHAYA" if "login gagal" in data.lower() else "AMAN"
    return {"model": "SVM", "label": level, "confidence": 0.95}


@app.get("/api/proses_ai")
async def proses_ai(input: str = ""):
    mulai = time.perf_counter()
    rf, svm = await asyncio.gather(prediksi_rf(input), prediksi_svm(input))
    durasi = round(time.perf_counter() - mulai, 3)
    return {
        "status": "success",
        "duration_seconds": durasi,   # harus <= ~0.6 detik
        "rf": rf,
        "svm": svm,
    }
