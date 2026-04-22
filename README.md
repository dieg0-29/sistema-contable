# Sistema Contable
---
Proyecto desarrollado para el curso de Sistema y Gestión Financiera, en la Facultad de Ingeniería Industrial y de Sistemas, de la Universidad Nacional de Ingeniería, Lima, Perú

Sirve para registrar transacciones contables y generar:
- Libro diario
- Libro mayor
- Estados financieros

## Tecnologías
- React
- Vite
- FastAPI
- Supabase

## Instalación

**Frontend:**
```
npm install
```
**Backend:**
```
pip install -r requirements.txt
```
**Despliegue:** Desde dos terminales distintas

- **Terminal 1:** Backend
```
uvicorn app.main:app --reload
```
- **Terminal 2:** Frontend
```
npm run dev
```

## Variables de entorno
Crear archivo .env con:
```
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```