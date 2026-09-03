const http = require("http");
const httpProxy = require("http-proxy");

const proxy = httpProxy.createProxyServer({
  ws: true,
  changeOrigin: false
});

const routes = {
  "/vps1/vless-ws": "http://169.58.232.36:10001",
  "/vps1/vmess-ws": "http://169.58.232.36:10002",
  "/vps1/trojan-ws": "http://169.58.232.36:10003",
  "/vps2/vless-ws": "http://81.17.99.235:10001",
  "/vps2/vmess-ws": "http://81.17.99.235:10002",
  "/vps2/trojan-ws": "http://81.17.99.235:10003"
};

function getTarget(url) {
  for (const path in routes) {
    if (url.startsWith(path)) {
      return routes[path];
    }
  }
  return null;
}

// GESTION GLOBALE DES ERREURS DE PROXY
proxy.on('error', (err, req, res) => {
  console.error('Proxy Error:', err.message);
  if (res.writeHead) {
    res.writeHead(502, { 'Content-Type': 'text/plain' });
    res.end('Bad Gateway - Destination Unreachable');
  }
});

const server = http.createServer((req, res) => {
  const target = getTarget(req.url);

  if (target) {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    return res.end('NOSTRA Proxy Online');
  }

  proxy.web(req, res, { target });
});

server.on('upgrade', (req, socket, head) => {
  const target = getTarget(req.url);

  if (!target) {
    socket.destroy();
    return;
  }

  proxy.ws(req, socket, { target }, (err) => {
    console.error('WS Error:', err.message);
    socket.destroy();
  });
});

const port = process.env.PORT || 8080;

server.listen(port, () => {
  console.log(`Proxy listening on ${port}`);
});
