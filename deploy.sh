#!/bin/bash
# ─────────────────────────────────────────────────────────────────────────────
# APARU — Deploy Script
# Запускай из папки проекта (там где backend/ и frontend/)
# ─────────────────────────────────────────────────────────────────────────────
set -e

ROOT="$(cd "$(dirname "$0")" && pwd)"

echo ""
echo "🚀  APARU Deploy Script"
echo "────────────────────────────────────────"

# ─── ШАГ 1: Git ───────────────────────────────────────────────────────────────
echo ""
echo "▶  [1/4] Настройка Git..."

cd "$ROOT"

if [ ! -d ".git" ]; then
  git init
  git branch -m main
fi

# Добавляем remote (если нет)
if ! git remote get-url origin 2>/dev/null | grep -q "aparyhackaton"; then
  git remote add origin https://github.com/imastikbaev/aparyhackaton.git 2>/dev/null || \
  git remote set-url origin https://github.com/imastikbaev/aparyhackaton.git
fi

git add .
git diff --cached --quiet && echo "  Нет изменений для коммита" || \
  git commit -m "chore: update config for Vercel + Railway deploy"

echo "▶  Pushing to GitHub..."
git push -u origin main

echo "  ✅ GitHub: https://github.com/imastikbaev/aparyhackaton"

# ─── ШАГ 2: Vercel ────────────────────────────────────────────────────────────
echo ""
echo "▶  [2/4] Деплой фронтенда на Vercel..."

# Проверяем, установлен ли Vercel CLI
if ! command -v vercel &> /dev/null; then
  echo "  Устанавливаем Vercel CLI..."
  npm install -g vercel
fi

cd "$ROOT/frontend"

# Проверяем авторизацию
if ! vercel whoami &>/dev/null; then
  echo "  Войди в Vercel:"
  vercel login
fi

# Первый деплой или продакшн?
if [ -f ".vercel/project.json" ]; then
  echo "  Обнаружен существующий Vercel проект. Деплой в production..."
  vercel --prod --yes
else
  echo "  Первый деплой — создаём проект aparu-frontend..."
  echo "  Отвечай на вопросы Vercel:"
  echo "    - Scope:        imastikbaev-4596s-projects"
  echo "    - Project name: aparu-frontend"
  echo "    - Directory:    ./ (нажми Enter)"
  vercel --prod
fi

VERCEL_URL=$(vercel ls --scope imastikbaev-4596s-projects 2>/dev/null | grep aparu-frontend | awk '{print $2}' | head -1)
echo "  ✅ Frontend: https://aparu-frontend.vercel.app"

# ─── ШАГ 3: Railway ───────────────────────────────────────────────────────────
echo ""
echo "▶  [3/4] Деплой бэкенда на Railway..."

if ! command -v railway &> /dev/null; then
  echo "  Устанавливаем Railway CLI..."
  curl -fsSL https://railway.app/install.sh | sh
fi

cd "$ROOT/backend"

if ! railway whoami &>/dev/null; then
  echo "  Войди в Railway:"
  railway login
fi

# Проверяем, есть ли проект
if ! railway status &>/dev/null; then
  echo "  Создаём Railway проект..."
  railway init --name aparu
  echo ""
  echo "  Добавляем PostgreSQL..."
  railway add --plugin postgresql
  echo ""
  echo "  Добавляем Redis..."
  railway add --plugin redis
fi

echo "  Деплой backend..."
railway up --service backend --detach

echo "  ✅ Backend деплоится на Railway"

# ─── ШАГ 4: Env переменные ────────────────────────────────────────────────────
echo ""
echo "▶  [4/4] Не забудь добавить переменные окружения!"
echo ""
echo "  Railway → проект aparu → backend → Variables:"
echo "  ┌─────────────────────────────────────────────────────────┐"
echo "  │  SECRET_KEY      = <любая строка 32+ символа>           │"
echo "  │  SMS_PROVIDER    = mock                                  │"
echo "  │  CORS_ORIGINS    = [\"https://aparu-frontend.vercel.app\"] │"
echo "  └─────────────────────────────────────────────────────────┘"
echo ""
echo "  Vercel → aparu-frontend → Settings → Environment Variables:"
echo "  ┌─────────────────────────────────────────────────────────┐"
echo "  │  NEXT_PUBLIC_API_URL = https://<railway-url>/api/v1     │"
echo "  │  NEXT_PUBLIC_WS_URL  = wss://<railway-url>/api/v1       │"
echo "  └─────────────────────────────────────────────────────────┘"
echo ""
echo "────────────────────────────────────────"
echo "✅  Готово! Смотри APARU_Deploy_Guide.docx для подробностей."
echo ""
