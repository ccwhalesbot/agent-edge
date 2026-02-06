#!/bin/bash
# Startup script for Agent Edge Mission Control

echo "Starting Agent Edge Mission Control..."
echo "Access the dashboard at:"
echo "  - Local: http://localhost:3000"
echo "  - Network: http://$(hostname -I | awk '{print $1}'):3000"

cd /home/beastmaster/agent-edge
npm run dev