import test from 'node:test';
import assert from 'node:assert/strict';
import { initializeBonanzaWebMCP } from '../src/scripts/webmcp.mjs';

function fixture({ language = 'de', path = '/de', supported = true, legacy = false, ready = 'complete', visible = 'visible' } = {}) {
  const registrations = [];
  const calls = [];
  const navigations = [];
  const anchors = [];
  const context = { registerTool(tool, options) { registrations.push({ tool, signal: options.signal }); } };
  const dialog = {
    open: false,
    showCount: 0,
    showModal() { this.open = true; this.showCount += 1; },
    querySelector() { return { getAttribute: () => 'mailto:info@bonanza-ranch.com?subject=Bonanza%20Ranch' }; },
  };
  const page = Object.assign(new EventTarget(), {
    readyState: ready,
    visibilityState: visible,
    documentElement: { lang: language },
    querySelector(selector) { return selector === '.contact-options' ? dialog : null; },
    querySelectorAll(selector) { return selector === 'a[href]' ? anchors : []; },
  });
  const browser = Object.assign(new EventTarget(), {
    location: { origin: 'https://www.bonanza-ranch.com', href: `https://www.bonanza-ranch.com${path}`, assign: (url) => navigations.push(url) },
  });
  if (supported && !legacy) page.modelContext = context;
  const agent = supported && legacy ? { modelContext: context } : {};
  const request = async (url, options) => {
    calls.push({ url, options });
    const documentId = url.split('/').at(-1).replace('.json', '');
    return new Response(JSON.stringify({ documentId, markdown: '# Published page' }), { headers: { 'Content-Type': 'application/json; charset=utf-8' } });
  };
  const env = { document: page, navigator: agent, window: browser, fetch: request };
  const start = () => initializeBonanzaWebMCP(env);
  const tool = (name) => registrations.find((registration) => registration.tool.name === name).tool;
  return { registrations, calls, navigations, anchors, page, browser, dialog, env, start, tool };
}

test('unsupported browsers keep their UI and globals untouched', () => {
  const f = fixture({ supported: false });
  const dispose = f.start();
  f.browser.dispatchEvent(new Event('pageshow'));
  f.page.dispatchEvent(new Event('visibilitychange'));
  dispose();
  assert.equal(f.registrations.length, 0);
  assert.equal('modelContext' in f.page, false);
  assert.equal('modelContext' in f.env.navigator, false);
  assert.equal(f.navigations.length, 0);
});

test('native document API registers four strict tools with accurate safety hints', () => {
  const f = fixture();
  const dispose = f.start();
  assert.deepEqual(f.registrations.map(({ tool }) => tool.name), ['read_bonanza_page', 'navigate_bonanza_section', 'get_bonanza_contact', 'open_bonanza_contact']);
  for (const { tool, signal } of f.registrations) {
    assert.equal(tool.inputSchema.type, 'object');
    assert.equal(tool.inputSchema.additionalProperties, false);
    assert.equal(tool.annotations.consequentialHint, false);
    assert.equal(typeof tool.execute, 'function');
    assert.equal(signal.aborted, false);
  }
  assert.equal(f.tool('read_bonanza_page').annotations.readOnlyHint, true);
  assert.equal(f.tool('navigate_bonanza_section').annotations.readOnlyHint, false);
  assert.equal(f.tool('get_bonanza_contact').annotations.readOnlyHint, true);
  assert.equal(f.tool('open_bonanza_contact').annotations.readOnlyHint, false);
  dispose();
});

test('legacy navigator API is supported but the native document API takes priority', () => {
  const legacy = fixture({ legacy: true });
  legacy.start()();
  assert.equal(legacy.registrations.length, 4);
  const current = fixture();
  current.env.navigator.modelContext = { registerTool() { assert.fail('Legacy API must not run when document API exists.'); } };
  current.start()();
  assert.equal(current.registrations.length, 4);
});

test('native API permission failures unregister partial tools without breaking the page', async (t) => {
  const warnings = t.mock.method(console, 'warn', () => {});
  for (const asynchronous of [false, true]) {
    const f = fixture();
    const registerTool = f.page.modelContext.registerTool;
    f.page.modelContext.registerTool = (tool, options) => {
      if (tool.name === 'navigate_bonanza_section') {
        const error = new DOMException('The origin trial is unavailable.', 'SecurityError');
        if (asynchronous) return Promise.reject(error);
        throw error;
      }
      registerTool(tool, options);
    };
    const dispose = f.start();
    await new Promise(setImmediate);
    assert.ok(f.registrations.every(({ signal }) => signal.aborted));
    assert.equal(f.navigations.length, 0);
    assert.equal(f.dialog.open, false);
    dispose();
  }
  assert.equal(warnings.mock.callCount(), 2);
});

test('content reads only bounded same-origin public JSON endpoints', async () => {
  const f = fixture();
  const dispose = f.start();
  for (const documentId of ['de', 'en', 'impressum', 'en-legal', 'datenschutz', 'en-privacy']) {
    assert.deepEqual(JSON.parse(await f.tool('read_bonanza_page').execute({ documentId })), { documentId, markdown: '# Published page' });
  }
  for (const { url, options } of f.calls) {
    assert.equal(new URL(url).origin, f.browser.location.origin);
    assert.equal(options.method, 'GET');
    assert.equal(options.credentials, 'omit');
    assert.equal(options.redirect, 'error');
    assert.equal(options.headers.Accept, 'application/json');
    assert.equal(options.signal.aborted, false);
  }
  dispose();
});

test('malformed input cannot request arbitrary URLs or invoke UI actions', async () => {
  const f = fixture();
  const dispose = f.start();
  const read = f.tool('read_bonanza_page');
  const navigate = f.tool('navigate_bonanza_section');
  for (const input of [undefined, null, [], 'de', {}, { documentId: '../secret' }, { documentId: 'https://example.com' }, { documentId: 'de', url: '/secret' }]) {
    await assert.rejects(read.execute(input), TypeError);
  }
  for (const input of [{ section: 'mailto:info@bonanza-ranch.com' }, { section: 'kontakt', language: 'en' }, { section: 1 }, {}]) {
    await assert.rejects(navigate.execute(input), TypeError);
  }
  await assert.rejects(f.tool('open_bonanza_contact').execute({ send: true }), TypeError);
  await assert.rejects(f.tool('get_bonanza_contact').execute([]), TypeError);
  assert.equal(f.calls.length, 0);
  assert.equal(f.navigations.length, 0);
  assert.equal(f.dialog.open, false);
  dispose();
});

test('bad, cross-origin or mismatched content responses do not become tool content', async () => {
  const responses = [
    new Response('Not found', { status: 404 }),
    new Response('<h1>Not JSON</h1>', { headers: { 'Content-Type': 'text/html' } }),
    new Response(JSON.stringify({ documentId: 'en', markdown: '# Wrong document' }), { headers: { 'Content-Type': 'application/json' } }),
    new Response(JSON.stringify({ documentId: 'de' }), { headers: { 'Content-Type': 'application/json' } }),
    { ok: true, url: 'https://example.com/api/content/de.json', headers: new Headers({ 'Content-Type': 'application/json' }) },
  ];
  for (const response of responses) {
    const f = fixture();
    f.env.fetch = async () => response;
    const dispose = f.start();
    await assert.rejects(f.tool('read_bonanza_page').execute({ documentId: 'de' }));
    dispose();
  }
});

test('execution cancellation and page teardown cancel pending public content reads', async () => {
  for (const pageHide of [false, true]) {
    const f = fixture();
    const started = Promise.withResolvers();
    f.env.fetch = async (_url, { signal }) => {
      started.resolve();
      return new Promise((_resolve, reject) => signal.addEventListener('abort', () => reject(signal.reason), { once: true }));
    };
    const dispose = f.start();
    const cancellation = new AbortController();
    const result = f.tool('read_bonanza_page').execute({ documentId: 'de' }, { signal: cancellation.signal });
    await started.promise;
    if (pageHide) f.browser.dispatchEvent(new Event('pagehide'));
    else cancellation.abort();
    await assert.rejects(result, { name: 'AbortError' });
    dispose();
  }
});

test('section navigation uses current-language native links, never mailto or third-party links', async () => {
  const f = fixture({ language: 'en', path: '/en/privacy' });
  const clicks = [];
  f.anchors.push(
    { getAttribute: () => 'mailto:info@bonanza-ranch.com', click() { assert.fail('Must not launch mail.'); } },
    { getAttribute: () => 'https://example.com/en#freizeit', click() { assert.fail('Must not follow third-party link.'); } },
    { getAttribute: () => '/en#freizeit', hasAttribute: () => false, click: () => clicks.push('experiences') },
  );
  const dispose = f.start();
  const navigate = f.tool('navigate_bonanza_section');
  await navigate.execute({ section: 'freizeit' });
  assert.deepEqual(clicks, ['experiences']);
  await navigate.execute({ section: 'wildnis' });
  await navigate.execute({ section: 'kontakt' });
  assert.deepEqual(f.navigations, ['https://www.bonanza-ranch.com/en#wildnis', 'https://www.bonanza-ranch.com/en#kontakt']);
  dispose();
});

test('contact tools read the rendered address and open only the existing dialog', async () => {
  const f = fixture();
  const dispose = f.start();
  assert.deepEqual(JSON.parse(await f.tool('get_bonanza_contact').execute({})), { email: 'info@bonanza-ranch.com', url: 'https://www.bonanza-ranch.com/de#kontakt' });
  assert.equal(f.dialog.open, false);
  await f.tool('open_bonanza_contact').execute({});
  await f.tool('open_bonanza_contact').execute({});
  assert.equal(f.dialog.open, true);
  assert.equal(f.dialog.showCount, 1);
  assert.equal(f.navigations.length, 0);
  assert.equal(f.calls.length, 0);
  dispose();
});

test('aborted calls cannot open contact or change navigation', async () => {
  const f = fixture();
  const dispose = f.start();
  const cancellation = AbortSignal.abort();
  await assert.rejects(f.tool('navigate_bonanza_section').execute({ section: 'reise' }, { signal: cancellation }), { name: 'AbortError' });
  await assert.rejects(f.tool('open_bonanza_contact').execute({}, { signal: cancellation }), { name: 'AbortError' });
  assert.equal(f.navigations.length, 0);
  assert.equal(f.dialog.open, false);
  dispose();
});

test('registration waits for page readiness and visibility and restores after back/forward cache', async () => {
  const f = fixture({ ready: 'loading', visible: 'hidden' });
  const dispose = f.start();
  assert.equal(f.start(), dispose, 'Repeated installation must return its existing cleanup.');
  assert.equal(f.registrations.length, 0);
  f.page.readyState = 'complete';
  f.page.dispatchEvent(new Event('DOMContentLoaded'));
  assert.equal(f.registrations.length, 0);
  f.page.visibilityState = 'visible';
  f.page.dispatchEvent(new Event('visibilitychange'));
  assert.equal(f.registrations.length, 4);
  const first = f.registrations.slice();
  f.browser.dispatchEvent(new Event('pagehide'));
  assert.ok(first.every(({ signal }) => signal.aborted));
  await assert.rejects(first[0].tool.execute({ documentId: 'de' }), { name: 'AbortError' });
  f.browser.dispatchEvent(new Event('pageshow'));
  assert.equal(f.registrations.length, 8);
  f.page.dispatchEvent(new Event('visibilitychange'));
  assert.equal(f.registrations.length, 8, 'Visible events must not duplicate registrations.');
  f.page.visibilityState = 'hidden';
  f.page.dispatchEvent(new Event('visibilitychange'));
  assert.ok(f.registrations.every(({ signal }) => signal.aborted));
  f.page.visibilityState = 'visible';
  f.page.dispatchEvent(new Event('visibilitychange'));
  assert.equal(f.registrations.length, 12);
  dispose();
  dispose();
  f.browser.dispatchEvent(new Event('pageshow'));
  f.page.dispatchEvent(new Event('visibilitychange'));
  assert.equal(f.registrations.length, 12, 'Disposed listeners must not register again.');
  assert.ok(f.registrations.every(({ signal }) => signal.aborted));
});
