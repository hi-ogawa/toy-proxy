const https = require('https');
const urllib = require('url');
const _ = require('lodash');
const qs = require('qs');
const log = require('debug')('app');

const get = (url, opts) => {
  return new Promise((resolve, reject) => {
    https.get(url, opts, resolve).on('error', reject);
  });
}

const getFollow = async (url, opts, follow, count) => {
  const res = await get(url, opts);
  if (follow && count > 0 && 300 <= res.statusCode && res.statusCode < 400) {
    return await getFollow(res.headers['location'], opts, follow, count - 1);
  }
  return res;
}

const proxy = async (req, res, next) => {
  const queryObj = qs.parse(urllib.parse(req.url).query);
  log(`query: ${JSON.stringify(queryObj)}`);

  const {
    url,
    followRedirection,
    requestHeadersOverride,
    requestHeaderBlacklist=[],
    responseHeadersOverride,
    responseHeaderBlacklist=[],
    responseStatusOverride,
  } = queryObj;

  if (!url) { return res.status(400).end('Required parameter: url'); }

  const headers = _.pickBy(
    requestHeadersOverride || req.headers,
    (__, key) => !requestHeaderBlacklist.includes(key));

  log(`request: ${url}`)
  log(`request headers: ${JSON.stringify(headers)}`)

  let proxyRes;
  try {
    proxyRes = await getFollow(url, { headers }, followRedirection, 10);
  } catch (err) {
    log(`request error: ${e.message}`);
    return res.status(400).end(e.message);
  }

  const respHeaders = _.pickBy(
    responseHeadersOverride || proxyRes.headers,
    (__, key) => !responseHeaderBlacklist.includes(key));

  res.writeHead(responseStatusOverride || proxyRes.statusCode, respHeaders);
  proxyRes.pipe(res);
}

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

module.exports = app;

if (require.main === module) {
  const port = process.env.PORT || 8080;
  app.listen(port, () => {
    log(':: Listening on port ', port);
  });
}
