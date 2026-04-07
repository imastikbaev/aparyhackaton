#!/bin/bash
# ─────────────────────────────────────────────────────────────
# APARU QR Taxi — dev-режим (hot reload, БЕЗ Docker)
# БД: SQLite (файл aparu.db)
# Redis: fakeredis (in-memory, не требует установки Redis)
# Запуск: ./dev.sh
# ─────────────────────────────────────────────────────────────
set -e

ROOT="$(cd "$(dirname "$0")" && pwd)"
BACKEND="$ROOT/backend"
FRONTEND="$ROOT/frontend"

# SQLite — файл создаётся автоматически рядом с backend
DEV_DATABASE_URL="sqlite+aiosqlite:///$BACKEND/aparu.db"
DEV_REDIS_URL="fake"

echo ""
echo "🚀  APARU dev-режим (без Docker)"
echo "────────────────────────────────────"
echo "  БД:    SQLite → $BACKEND/aparu.db"
echo "  Redis: fakeredis (in-memory)"
echo "────────────────────────────────────"

# 1. Устанавливаем Python-зависимости (если нужно)
echo "▶  Проверяем Python-зависимости..."
cd "$BACKEND"
pip3 install -r requirements.txt -q 2>/dev/null || true

# 2. Инициализируем БД и заполняем тестовыми данными
echo "▶  Создаём таблицы и seed-данные..."
DATABASE_URL="$DEV_DATABASE_URL" \
REDIS_URL="$DEV_REDIS_URL" \
python3 seed.py 2>/dev/null || true

# 3. Запускаем бэкенд в фоне с hot-reload
echo "▶  Запуск бэкенда на http://localhost:8000 ..."
DATABASE_URL="$DEV_DATABASE_URL" \
REDIS_URL="$DEV_REDIS_URL" \
SMS_PROVIDER=mock \
SECRET_KEY=dev-secret-key \
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000 &
BACKEND_PID=$!

# 4. Устанавливаем Node-зависимости (если нужно)
echo "▶  Проверяем npm-зависимости..."
cd "$FRONTEND"
[ ! -d node_modules ] && npm install --legacy-peer-deps

# 5. Запускаем фронтенд с hot-reload
echo ""
echo "────────────────────────────────────"
echo "  Фронт:  http://localhost:3000/scan/oskemen-hub"
echo "  API:    http://localhost:8000/docs"
echo ""
echo "  Изменения в коде → сохраняются автоматически"
echo "  Ctrl+C — остановить всё"
echo "────────────────────────────────────"
echo ""

# Останавливаем только бэкенд при выходе (никакого Docker)
trap "echo ''; echo 'Останавливаем...'; kill $BACKEND_PID 2>/dev/null" EXIT

NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1 \
NEXT_PUBLIC_WS_URL=ws://localhost:8000/api/v1 \
npm run dev
