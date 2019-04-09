const express = require('express');
const httpProxy = require('http-proxy');
const hypernova = require('./middlewares/hypernova');

const app = express();

const proxy = httpProxy.createProxyServer();

app.get('/public/*', (req, res) => {
  proxy.web(req, res, { target: 'http://hypernova:3000' });
});

app.get('*', (req, res) => {
  proxy.web(req, res, { target: 'http://blog:8000', selfHandleResponse: true });
})

proxy.on('proxyRes', (proxyRes, req, res) => {
  const pathExp = /\/public\/.*/
  if (req.path.match(pathExp)) {
    return;
  }
  let body = Buffer.from([]);
  proxyRes.on('data', function (data) {
    body = Buffer.concat([body, data]);
  });
  proxyRes.on('end', function () {
      body = body.toString();
      if (!proxyRes.headers['content-type'].startsWith('text/html')) {
        res.end(body);
      }
      hypernova(body).then(
        (newBody) => res.end(newBody)
      ).catch(err => {
        res.end(body);
      });
  });
})

const PORT = process.env.PORT || 8080

app.listen(PORT, '0.0.0.0', () => {
  console.log('Proxy Running');
});