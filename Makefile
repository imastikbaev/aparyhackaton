.PHONY: up down dev-backend dev-frontend test lint install

# ─── Docker ───────────────────────────────────────────────────────────────────
up:
	cp -n .env.example .env || true
	docker compose up --build -d

down:
	docker compose down

logs:
	docker compose logs -f

# ─── Local dev ────────────────────────────────────────────────────────────────
dev-backend:
	cd backend && uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

dev-frontend:
	cd frontend && npm run dev

# ─── Install ──────────────────────────────────────────────────────────────────
install:
	cd backend && pip install -r requirements.txt
	cd frontend && npm install

# ─── Tests ────────────────────────────────────────────────────────────────────
test:
	cd backend && pytest tests/ -v --cov=app --cov-report=term-missing

# ─── Lint ─────────────────────────────────────────────────────────────────────
lint:
	cd backend && ruff check app/ && mypy app/
	cd frontend && npm run lint && npm run type-check

# ─── DB migrations ────────────────────────────────────────────────────────────
migrate:
	cd backend && alembic upgrade head

migration:
	cd backend && alembic revision --autogenerate -m "$(MSG)"
