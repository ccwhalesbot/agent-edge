#!/bin/bash
# Health check script for Agent Edge Dashboard

echo "=== Agent Edge Dashboard Health Check ==="
echo "Checking if application is running on port 3000..."

# Check if the process is running
PID=$(lsof -ti:3000)
if [ ! -z "$PID" ]; then
    echo "✅ Process running with PID: $PID"
    echo "✅ Port 3000 is accessible"
    
    # Check HTTP response
    STATUS_CODE=$(curl -o /dev/null -s -w "%{http_code}\n" http://localhost:3000)
    if [ "$STATUS_CODE" -eq 200 ]; then
        echo "✅ HTTP Response: $STATUS_CODE (OK)"
        echo "✅ Application is responding correctly"
        echo ""
        echo "Access the dashboard at:"
        echo "  - Local: http://localhost:3000"
        echo "  - Network: http://$(hostname -I | awk '{print $1}'):3000"
    else
        echo "❌ HTTP Response: $STATUS_CODE"
        echo "❌ Application may have issues"
    fi
else
    echo "❌ Application is not running on port 3000"
    echo "❌ Start the application using: cd ~/agent-edge && npm run dev"
fi

echo ""
echo "=== Health Check Complete ==="