if [ ! -f .env ]; then
  echo \"PORT=5555\nDEBUG=\nADMIN_IPS=\nGOOGLE_CLIENT_ID=''\nGOOGLE_CLIENT_SECRET=''\n#NODE_ENV=dev\nEMAIL_FROM=''\nEMAIL_PASSWORD=''\nSUB_APP=false\nPROTOCOL='http'\nDOMAIN='127.0.0.1'\n\" >> .env
fi

patch node_modules/ws/lib/WebSocket.js ws.patch
