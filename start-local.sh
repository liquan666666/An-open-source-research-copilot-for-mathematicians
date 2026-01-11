#!/bin/bash
# Start MathResearchPilot locally without Docker

echo "Starting MathResearchPilot..."

# Create data directory
mkdir -p apps/api/data

# Check if dependencies are installed
if [ ! -d "apps/web/node_modules" ]; then
  echo "Installing web dependencies..."
  cd apps/web && npm install && cd ../..
fi

echo "Starting API service on port 8000..."
cd apps/api
MRP_DB_PATH=./data/mrp.sqlite CORS_ORIGINS=http://localhost:3000 \
  uvicorn server.main:app --host 0.0.0.0 --port 8000 --reload > /tmp/api.log 2>&1 &
API_PID=$!
cd ../..

echo "Starting web UI on port 3000..."
cd apps/web
NEXT_PUBLIC_API_BASE=http://localhost:8000 npm run dev > /tmp/web.log 2>&1 &
WEB_PID=$!
cd ../..

echo ""
echo "✓ Services started!"
echo "  API:    http://localhost:8000/docs"
echo "  Web UI: http://localhost:3000"
echo ""
echo "API PID: $API_PID"
echo "Web PID: $WEB_PID"
echo ""
echo "To stop services:"
echo "  kill $API_PID $WEB_PID"
echo ""
echo "Logs:"
echo "  API:  tail -f /tmp/api.log"
echo "  Web:  tail -f /tmp/web.log"
