const assert = require('assert').strict;
const supertest = require('supertest');
const qs = require('qs');

const proxy = require('./proxy');

describe('proxy GET /', function() {
  it('resolveRedirection and requestHeaderBlacklist', async () => {
    const url1 = 'https://gitlab.com/profile';
    const url2 = 'https://gitlab.com/users/sign_in';
    await supertest(proxy)
      .get('/?' + qs.stringify({ url: url1, resolveRedirection: 'true', requestHeaderBlacklist: ['host'] }))
      .expect(res => {
        assert.deepStrictEqual(res.headers['location'], '?' + qs.stringify({
          url: url2,
          requestHeaderBlacklist: ['host'],
          resolveRedirection: 'true',
        }))
        assert.strictEqual(res.status, 302);
      });
  }).timeout(10000);
});
