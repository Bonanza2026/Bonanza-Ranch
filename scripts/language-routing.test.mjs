import test from 'node:test';
import assert from 'node:assert/strict';
import middleware from '../middleware.js';

const request = (country, cookie, path = '/', accept) => {
  const headers = new Headers();
  if (country) headers.set('x-vercel-ip-country', country);
  if (cookie) headers.set('cookie', cookie);
  if (accept) headers.set('accept', accept);
  return new Request(`https://www.bonanza-ranch.com${path}`, {headers});
};
test('Germany enters in German; other countries enter in English', () => {
  for (const country of ['DE','ZA','AT','US','PL','CN','JP','SG','IN',undefined]) {
    const response = middleware(request(country));
    assert.equal(response.status, 307);
    assert.equal(response.headers.get('location'), `https://www.bonanza-ranch.com/${country === 'DE' ? 'de' : 'en'}`);
    assert.equal(response.headers.get('cache-control'), 'private, no-store');
    assert.equal(response.headers.get('vary'), 'Accept, Cookie, X-Vercel-IP-Country');
    assert.equal(response.headers.get('x-middleware-next'), null);
  }
});

test('apex entry reaches the canonical host before country, cookie or Markdown selection', () => {
  for (const country of ['DE', 'CN', undefined]) {
    for (const cookie of ['bonanza_language=de', 'bonanza_language=en', undefined]) {
      for (const accept of ['text/html', 'text/markdown']) {
        const input = request(country, cookie, '/?source=partner&phrase=hello%20world', accept);
        const response = middleware(new Request('https://bonanza-ranch.com/?source=partner&phrase=hello%20world', input));
        assert.equal(response.status, 308);
        assert.equal(response.headers.get('location'), 'https://www.bonanza-ranch.com/?source=partner&phrase=hello%20world');
        assert.equal(response.headers.get('x-middleware-next'), null);
      }
    }
  }
});

test('apex canonical pages redirect to www before representation negotiation', () => {
  for (const path of ['/de', '/en', '/impressum', '/en/legal', '/datenschutz', '/en/privacy']) {
    const response = middleware(new Request(`https://bonanza-ranch.com${path}?source=reader`, {headers: {accept: 'text/markdown'}}));
    assert.equal(response.status, 308);
    assert.equal(response.headers.get('location'), `https://www.bonanza-ranch.com${path}?source=reader`);
    assert.equal(response.headers.get('x-middleware-rewrite'), null);
  }
});
test('manual choice takes priority over country, malformed preferences are ignored', () => {
  assert.equal(middleware(request('DE','other=1; bonanza_language=en')).headers.get('location'), 'https://www.bonanza-ranch.com/en');
  assert.equal(middleware(request('ZA','bonanza_language=de; other=1')).headers.get('location'), 'https://www.bonanza-ranch.com/de');
  for (const cookie of ['not_bonanza_language=de', 'bonanza_language=deutsch', 'bonanza_language=enough', 'bonanza_language=DE']) {
    assert.equal(middleware(request('ZA',cookie)).headers.get('location'), 'https://www.bonanza-ranch.com/en');
  }
});
test('explicit language pages, assets and legal links are not redirected', () => {
  for (const path of ['/de','/en','/datenschutz','/impressum','/robots.txt','/llms.txt','/sitemap.xml','/media/hero_video.webm']) {
    assert.equal(middleware(request('US',undefined,path)).headers.get('x-middleware-next'), '1');
  }
});
test('query parameters survive redirects; local preview remains German', () => {
  assert.equal(middleware(request('US',undefined,'/?utm_source=test')).headers.get('location'), 'https://www.bonanza-ranch.com/en?utm_source=test');
  assert.equal(middleware(request('DE',undefined,'/?utm_source=test&phrase=hello%20world')).headers.get('location'), 'https://www.bonanza-ranch.com/de?utm_source=test&phrase=hello%20world');
  assert.equal(middleware(new Request('http://127.0.0.1:4323/')).headers.get('location'), 'http://127.0.0.1:4323/de');
});

test('Markdown entry requests keep country and saved language preferences', () => {
  for (const [country, cookie, language] of [
    ['DE', undefined, 'de'], ['CN', undefined, 'en'],
    ['DE', 'bonanza_language=en', 'en'], ['ZA', 'bonanza_language=de', 'de'],
  ]) {
    const response = middleware(request(country, cookie, '/?source=reader', 'text/markdown'));
    assert.equal(response.status, 307);
    assert.equal(response.headers.get('location'), `https://www.bonanza-ranch.com/${language}?source=reader`);
    assert.equal(response.headers.get('vary'), 'Accept, Cookie, X-Vercel-IP-Country');
    assert.equal(response.headers.get('cache-control'), 'private, no-store');
  }
  assert.equal(middleware(request('DE', undefined, '/', 'text/markdown;q=0')).headers.get('location'), 'https://www.bonanza-ranch.com/de');
});

test('root routing is consistent for browser and crawler user agents', () => {
  for (const country of ['DE', 'US', undefined]) {
    for (const userAgent of ['Mozilla/5.0', 'Googlebot', 'Bingbot', 'OAI-SearchBot']) {
      const original = request(country);
      original.headers.set('user-agent', userAgent);
      const response = middleware(original);
      assert.equal(response.status, 307);
      assert.equal(response.headers.get('location'), `https://www.bonanza-ranch.com/${country === 'DE' ? 'de' : 'en'}`);
    }
  }
});
