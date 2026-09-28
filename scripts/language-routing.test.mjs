import test from 'node:test';
import assert from 'node:assert/strict';
import middleware from '../middleware.js';

const request = (country, cookie, path = '/') => {
  const headers = new Headers();
  if (country) headers.set('x-vercel-ip-country', country);
  if (cookie) headers.set('cookie', cookie);
  return new Request(`https://www.bonanza-ranch.com${path}`, {headers});
};
test('Germany enters in German; other countries enter in English', () => {
  assert.equal(middleware(request('DE')).headers.get('x-middleware-next'), '1');
  for (const country of ['ZA','AT','US',undefined]) {
    const response = middleware(request(country));
    assert.equal(response.status, 307);
    assert.equal(response.headers.get('location'), 'https://www.bonanza-ranch.com/en');
    assert.equal(response.headers.get('cache-control'), 'private, no-store');
  }
});
test('manual choice takes priority over country, malformed preferences are ignored', () => {
  assert.equal(middleware(request('DE','other=1; bonanza_language=en')).status, 307);
  assert.equal(middleware(request('ZA','bonanza_language=de; other=1')).headers.get('x-middleware-next'), '1');
  assert.equal(middleware(request('ZA','not_bonanza_language=de')).status, 307);
});
test('explicit language pages, assets and legal links are not redirected', () => {
  for (const path of ['/en','/datenschutz','/impressum','/media/hero_video.webm']) {
    assert.equal(middleware(request('US',undefined,path)).headers.get('x-middleware-next'), '1');
  }
});
test('query parameters survive redirects; local preview remains German', () => {
  assert.equal(middleware(request('US',undefined,'/?utm_source=test')).headers.get('location'), 'https://www.bonanza-ranch.com/en?utm_source=test');
  assert.equal(middleware(new Request('http://127.0.0.1:4323/')).headers.get('x-middleware-next'), '1');
});
