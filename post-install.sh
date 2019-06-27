if [ ! -f .env ]; then
  echo 'PORT=5555\nGOOGLE_CLIENT_ID=''\nGOOGLE_CLIENT_SECRET=''\nEMAIL_FROM=''\nEMAIL_PASSWORD=''\nPROTOCOL='http'\nDOMAIN='127.0.0.1'\n' >> .env
fi

# patch node_modules/ws/lib/WebSocket.js ws.patch
