# APARU

APARU is a QR-based taxi ordering prototype built for hackathon demos. A user scans a QR point, verifies their phone with OTP, confirms a ride, and tracks order status in real time.

## Stack

- Frontend: Next.js, React, TypeScript, Tailwind CSS
- Backend: FastAPI, Python, Uvicorn
- Database: PostgreSQL
- Cache / OTP storage: Redis
- ORM: SQLAlchemy
- Realtime: WebSocket
- Deployment: Vercel and Railway

## Project Structure

- `frontend/` - Next.js client application
- `backend/` - FastAPI API, business logic, and data access
- `docker-compose.yml` - local multi-service development setup

## Local Run

1. Copy `.env.example` to `.env`
2. Start services:

```bash
docker compose up --build
```

3. Frontend:
   - `http://localhost:3000`
4. Backend:
   - `http://localhost:8000`
   - health check: `http://localhost:8000/health`

## Deployment

- Frontend is configured for Vercel from `frontend/`
- Backend is configured for Railway from `backend/`

## Key Flows

- QR point lookup
- OTP authentication
- Order creation and cancellation
- Live order status updates
- Read-only admin orders page
