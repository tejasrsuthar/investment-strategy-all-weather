#!/bin/bash
# Raghuvir Consultants — Local Dev Startup
# Starts: backend, frontend (5173), admin-dashboard (5174), nginx proxy (80)

WORKSPACE="$(cd "$(dirname "$0")" && pwd)"

echo "🚀 Starting Raghuvir Consultants local dev..."

# Kill any leftover nginx using our pid file
if [ -f /tmp/nginx-raghuvir-dev.pid ]; then
  sudo /opt/homebrew/bin/nginx -s stop -c "$WORKSPACE/nginx-dev.conf" 2>/dev/null || true
  sleep 1
fi

# Start nginx reverse proxy (needs sudo for port 80)
echo "📡 Starting nginx reverse proxy on port 80..."
sudo /opt/homebrew/bin/nginx -c "$WORKSPACE/nginx-dev.conf"
echo "   ✅ raghuvircons.local        → frontend (5173)"
echo "   ✅ app.raghuvircons.local    → admin-dashboard (5174)"

# Start backend
echo "⚙️  Starting backend API on port 8000..."
cd "$WORKSPACE/backend"
source venv/bin/activate
uvicorn app.main:app --reload --port 8000 &
BACKEND_PID=$!
echo "   ✅ http://localhost:8000"

# Start frontend
echo "🌐 Starting frontend on port 5173..."
cd "$WORKSPACE/frontend"
npm run dev &
FRONTEND_PID=$!

# Start admin-dashboard
echo "🔐 Starting admin-dashboard on port 5174..."
cd "$WORKSPACE/admin-dashboard"
npm run dev &
ADMIN_PID=$!

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  Main Site:      http://raghuvircons.local"
echo "  Investor:       http://raghuvircons.local/investor"
echo "  Admin:          http://app.raghuvircons.local"
echo "  API:            http://localhost:8000"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  Press Ctrl+C to stop all services"
echo ""

# Wait and cleanup on exit
trap "echo '🛑 Stopping...'; kill $BACKEND_PID $FRONTEND_PID $ADMIN_PID 2>/dev/null; sudo /opt/homebrew/bin/nginx -s stop -c '$WORKSPACE/nginx-dev.conf' 2>/dev/null" EXIT INT TERM

wait
