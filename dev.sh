#!/bin/bash
# Raghuvir Consultants — Local Dev Startup
# Starts: backend (8000), frontend (5173), admin-dashboard (5174), nginx proxy (80)

WORKSPACE="$(cd "$(dirname "$0")" && pwd)"
NGINX=/opt/homebrew/bin/nginx

echo "🚀 Starting Raghuvir Consultants local dev..."

# ── Step 1: Kill anything holding the required ports ──────────────────────────
kill_port() {
  local PORT=$1
  local PIDS=$(sudo lsof -ti TCP:"$PORT" 2>/dev/null)
  if [ -n "$PIDS" ]; then
    echo "   ⚠️  Killing process(es) on port $PORT: $PIDS"
    echo "$PIDS" | xargs sudo kill -9 2>/dev/null || true
  fi
}

echo "🔧 Clearing ports 5173, 5174, 8000..."
kill_port 5173
kill_port 5174
kill_port 8000
# Wait for OS to release ports after kill
sleep 1

# ── Step 2: Stop any existing nginx on our pid ────────────────────────────────
if [ -f /tmp/nginx-raghuvir-dev.pid ]; then
  sudo "$NGINX" -s stop -c "$WORKSPACE/nginx-dev.conf" 2>/dev/null || true
  sleep 0.5
fi

# ── Step 3: Start nginx reverse proxy ─────────────────────────────────────────
echo "📡 Starting nginx reverse proxy on port 80..."
sudo "$NGINX" -c "$WORKSPACE/nginx-dev.conf"
echo "   ✅ raghuvircons.local     → frontend   (port 5173)"
echo "   ✅ app.raghuvircons.local → admin-dashboard (port 5174)"

# ── Step 4: Start backend ─────────────────────────────────────────────────────
echo "⚙️  Starting backend API on port 8000..."
cd "$WORKSPACE/backend"
source venv/bin/activate
uvicorn app.main:app --reload --port 8000 &
BACKEND_PID=$!
echo "   ✅ http://localhost:8000"

# ── Step 5: Start frontend ────────────────────────────────────────────────────
echo "🌐 Starting frontend on port 5173..."
cd "$WORKSPACE/frontend"
npm run dev &
FRONTEND_PID=$!

# ── Step 6: Start admin-dashboard ─────────────────────────────────────────────
echo "🔐 Starting admin-dashboard on port 5174..."
cd "$WORKSPACE/admin-dashboard"
npm run dev &
ADMIN_PID=$!

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  Main Site:  http://raghuvircons.local"
echo "  Investor:   http://raghuvircons.local/investor"
echo "  Admin:      http://app.raghuvircons.local"
echo "  API:        http://localhost:8000"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  Press Ctrl+C to stop all services"
echo ""

# ── Cleanup on exit ───────────────────────────────────────────────────────────
trap "echo '🛑 Stopping all services...'; kill $BACKEND_PID $FRONTEND_PID $ADMIN_PID 2>/dev/null; sudo '$NGINX' -s stop -c '$WORKSPACE/nginx-dev.conf' 2>/dev/null; echo 'Done.'" EXIT INT TERM

wait
