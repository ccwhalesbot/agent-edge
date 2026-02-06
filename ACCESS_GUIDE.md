# Agent Edge Dashboard - Access Guide

## Application Status
- Currently running on port 3000
- PID: 65971 (as of last check)
- Accessible from both localhost and network

## Access URLs
- Local access: http://localhost:3000
- Network access: http://172.29.67.37:3000

## Starting the Application
1. Manual start: `cd ~/agent-edge && npm run dev`
2. Using script: `~/agent-edge/start.sh`

## Stopping the Application
- Find the process: `ps aux | grep vite`
- Kill the process: `kill -9 <PID>`

## Troubleshooting
- If the application stops, use the start.sh script
- If port 3000 is blocked, check firewall settings
- If you get connection refused, restart the application

## Next Steps
- Deploy to GitHub for version control
- Set up Vercel deployment
- Configure proper domain access