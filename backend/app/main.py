import os
from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routes import cuentas, transacciones, reportes

load_dotenv()

app = FastAPI(title="Sistema Contable API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(cuentas.router)
app.include_router(transacciones.router)
app.include_router(reportes.router)


@app.get("/")
def root():
    return {"mensaje": "Backend del sistema contable operativo"}

import uvicorn

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)