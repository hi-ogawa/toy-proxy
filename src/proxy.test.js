const assert = require('assert').strict;
const supertest = require('supertest');
const qs = require('qs');

const proxy = require('./proxy');

describe('proxy GET /', () => {
  describe('followRedirection and requestHeaderBlacklist', () => {
    const url = 'https://gitlab.com/profile'; // redirected to 'https://gitlab.com/users/sign_in'
    it('1', async () => {
      await supertest(proxy)
        .get('/?' + qs.stringify({ url, followRedirection: 'true', requestHeaderBlacklist: ['host'] }))
        .expect(res => {
          assert.strictEqual(res.status, 200);
        });
    });

    it('2', async () => {
      await supertest(proxy)
        .get('/?' + qs.stringify({ url, requestHeaderBlacklist: ['host'] }))
        .expect(res => {
          assert.strictEqual(res.status, 302);
        });
    });
  });
});
