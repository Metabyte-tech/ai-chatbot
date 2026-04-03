const http = require('http');
http.createServer((req, res) => {
  res.writeHead(200, {
    'Content-Type': 'text/plain; charset=utf-8',
    'x-vercel-ai-data-stream': 'v1',
    'Access-Control-Allow-Origin': '*'
  });
  res.write('0:' + JSON.stringify('Hello from direct port!\n') + '\n');
  res.end();
}).listen(8001);
