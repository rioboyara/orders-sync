// Локальный запуск / любой Node-хостинг: node server.js
const http = require('http');
const handler = require('./api/result');
http.createServer((req, res) => {
  const path = req.url.split('?')[0];
  if (path === '/result' || path === '/api/result' || path === '/') return handler(req, res);
  res.statusCode = 404; res.end('not found');
}).listen(process.env.PORT || 3000, () => console.log('listening', process.env.PORT || 3000));
