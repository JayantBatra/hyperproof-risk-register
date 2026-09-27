#!/usr/bin/env bash
set -e

echo "========================================================"
echo "    Starting Hyperproof Risk Register Full-Stack App    "
echo "========================================================"

# Auto-detect or use JAVA_HOME if available
if [ -z "$JAVA_HOME" ]; then
  if [ -d "/opt/homebrew/opt/openjdk@17" ]; then
    export JAVA_HOME="/opt/homebrew/opt/openjdk@17"
    export PATH="$JAVA_HOME/bin:$PATH"
  elif command -v /usr/libexec/java_home &> /dev/null; then
    export JAVA_HOME=$(/usr/libexec/java_home -v 17 2>/dev/null || true)
  fi
fi

echo "Using Java: $(java -version 2>&1 | head -n 1)"
echo "Using Node: $(node -v)"
echo ""

# Function to cleanup child processes on exit
cleanup() {
  echo ""
  echo "Shutting down servers..."
  kill $(jobs -p) 2>/dev/null || true
  exit 0
}
trap cleanup SIGINT SIGTERM EXIT

# Start backend
echo "Starting Spring Boot Backend on http://localhost:8080..."
cd backend
if command -v mvn &> /dev/null; then
  mvn spring-boot:run &
else
  ./mvnw spring-boot:run &
fi
BACKEND_PID=$!
cd ..

# Start frontend
echo "Starting React Frontend on http://localhost:3000..."
cd frontend
npm run dev &
FRONTEND_PID=$!
cd ..

echo ""
echo "========================================================"
echo " Application is starting up:"
echo "   - Frontend UI:  http://localhost:3000"
echo "   - Backend API:  http://localhost:8080/api/risks"
echo "   - Swagger UI:   http://localhost:8080/swagger-ui.html"
echo "   - H2 Console:   http://localhost:8080/h2-console"
echo "========================================================"
echo "Press Ctrl+C to terminate both servers."

wait
