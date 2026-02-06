#!/bin/bash

# Agent Edge Process Manager
# Keeps the localhost:3000 app running 24/7

APP_DIR="/home/beastmaster/agent-edge"
LOG_FILE="$APP_DIR/app-process.log"
MAX_RESTARTS=10
RESTART_DELAY=5

cd "$APP_DIR"

echo "Starting Agent Edge Process Manager - $(date)" >> "$LOG_FILE"

restart_count=0

while [ $restart_count -lt $MAX_RESTARTS ]; do
    echo "Starting Agent Edge app... (Attempt $((restart_count + 1))/$MAX_RESTARTS)" >> "$LOG_FILE"
    
    # Kill any existing processes on port 3000
    pkill -f "vite" 2>/dev/null || true
    sleep 2
    
    # Start the app in background
    npm run dev >> "$LOG_FILE" 2>&1 &
    APP_PID=$!
    
    echo "App started with PID: $APP_PID" >> "$LOG_FILE"
    
    # Wait for app to start or crash
    sleep 10
    
    # Check if process is still running
    if kill -0 $APP_PID 2>/dev/null; then
        echo "App is running successfully. PID: $APP_PID" >> "$LOG_FILE"
        
        # Monitor the process
        while kill -0 $APP_PID 2>/dev/null; do
            sleep 30
        done
        
        echo "App process has stopped unexpectedly" >> "$LOG_FILE"
    else
        echo "App failed to start" >> "$LOG_FILE"
    fi
    
    restart_count=$((restart_count + 1))
    echo "Waiting $RESTART_DELAY seconds before restart..." >> "$LOG_FILE"
    sleep $RESTART_DELAY
done

echo "Maximum restarts reached. Manual intervention required." >> "$LOG_FILE"