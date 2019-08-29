const https = require('https');
const urllib = require('url');
const _ = require('lodash');
const qs = require('qs');
const log = require('debug')('app');

const proxy = async (req, res, next) => {
  const queryObj = qs.parse(urllib.parse(req.url).query);
  log(`query: ${JSON.stringify(queryObj)}`);

  const {
    url,
    requestHeadersOverride,
    requestHeaderBlacklist=[],
    responseHeadersOverride,
    responseHeaderBlacklist=[],
    responseStatusOverride,
    resolveRedirection,
  } = queryObj;

  if (!url) { return next(new Error('Required parameter: url')); }

  const headers = _.pickBy(
    requestHeadersOverride || req.headers,
    (__, key) => !requestHeaderBlacklist.includes(key));

  log(`request: ${url}`)
  log(`request headers: ${JSON.stringify(headers)}`)

  https.get(url, { headers }, (proxyRes) => {

    log(`response statusCode: ${proxyRes.statusCode}`)
    log(`response headers: ${JSON.stringify(proxyRes.headers)}`)

    if (resolveRedirection &&
        300 <= proxyRes.statusCode && proxyRes.statusCode < 400) {
      const { location } = proxyRes.headers;
      res.writeHead(proxyRes.statusCode, {
        location: '?' + qs.stringify({
          url: location,
          requestHeadersOverride,
          requestHeaderBlacklist,
          responseHeadersOverride,
          responseHeaderBlacklist,
          responseStatusOverride,
          resolveRedirection
        })
      });
      return res.end();
    }

    const respHeaders = _.pickBy(
      responseHeadersOverride || proxyRes.headers,
      (__, key) => !responseHeaderBlacklist.includes(key));

    res.writeHead(responseStatusOverride || proxyRes.statusCode, respHeaders);
    proxyRes.pipe(res);

  }).on('error', (e) => {
    log(`request error: ${e.message}`);
    res.writeHead(400);
    res.end(e.message);
  });
}

module.exports = proxy;

if (require.main === module) {
  const express = require('express');
  const app = express();
  const morgan = require('morgan');
  const cors = require('cors');

  app.use([
    morgan('short'),
    cors({
      origin: (process.env.ALLOW_ORIGIN && JSON.parse(process.env.ALLOW_ORIGIN)) || '*',
      methods: 'GET',
      allowedHeaders: '*',
      exposedHeaders: '*'
    })
  ]);
  app.get('/', proxy);

  const port = process.env.PORT || 8080;
  app.listen(port, () => {
    log(':: Listening on port ', port);
  });
}
