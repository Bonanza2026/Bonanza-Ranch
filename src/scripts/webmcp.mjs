const documentIds = ['de', 'en', 'impressum', 'en-legal', 'datenschutz', 'en-privacy'];
const sections = ['reise', 'wildnis', 'freizeit', 'sicherheit', 'kontakt'];
const installations = new WeakMap();

function validateInput(input, property, allowed) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    throw new TypeError('Tool arguments must be an object.');
  }
  const keys = Reflect.ownKeys(input);
  if (property ? keys.length !== 1 || keys[0] !== property : keys.length !== 0) {
    throw new TypeError(property ? `Only ${property} is accepted.` : 'This tool accepts no arguments.');
  }
  if (property && !allowed.includes(input[property])) {
    throw new TypeError(`Unknown ${property}.`);
  }
}

function schema(property, allowed) {
  return {
    type: 'object',
    properties: property ? { [property]: { type: 'string', enum: [...allowed] } } : {},
    required: property ? [property] : [],
    additionalProperties: false,
  };
}

function createTools(page, browser, request, lifetime) {
  const home = page.documentElement.lang === 'en' ? '/en' : '/de';
  const signalFor = (signal) => signal ? AbortSignal.any([lifetime, signal]) : lifetime;
  const contact = () => {
    const dialog = page.querySelector('.contact-options');
    const address = dialog?.querySelector('.contact-address');
    const href = address?.getAttribute('href');
    if (!href?.startsWith('mailto:')) throw new Error('The contact address is unavailable.');
    return {
      dialog,
      email: decodeURIComponent(href.slice(7).split('?')[0]),
      url: new URL(`${home}#kontakt`, browser.location.origin).href,
    };
  };
  return [
    {
      name: 'read_bonanza_page',
      description: 'Read a public Bonanza Ranch page in German or English, including the legal notice and privacy policy. Returns the same published page content as Markdown in a JSON document.',
      inputSchema: schema('documentId', documentIds),
      annotations: { readOnlyHint: true, consequentialHint: false },
      execute: async (input, { signal } = {}) => {
        validateInput(input, 'documentId', documentIds);
        const cancellation = signalFor(signal);
        cancellation.throwIfAborted();
        const url = new URL(`/api/content/${input.documentId}.json`, browser.location.origin);
        const response = await request(url.href, {
          method: 'GET',
          headers: { Accept: 'application/json' },
          credentials: 'omit',
          redirect: 'error',
          signal: cancellation,
        });
        if (!response.ok || !/^application\/json(?:\s*;|$)/i.test(response.headers.get('content-type') || '')) {
          throw new Error(`Published content is unavailable (HTTP ${response.status}).`);
        }
        if (response.url && response.url !== url.href) throw new Error('Content must come from the requested same-origin endpoint.');
        const content = await response.json();
        cancellation.throwIfAborted();
        if (content?.documentId !== input.documentId || typeof content.markdown !== 'string') {
          throw new Error('The content response does not match the requested document.');
        }
        return JSON.stringify(content);
      },
    },
    {
      name: 'navigate_bonanza_section',
      description: 'Navigate to the location, wildlife, experiences, security or contact section of the Bonanza homepage in the current page language. Changes only the visible page; does not contact anyone.',
      inputSchema: schema('section', sections),
      annotations: { readOnlyHint: false, consequentialHint: false },
      execute: async (input, { signal } = {}) => {
        validateInput(input, 'section', sections);
        signalFor(signal).throwIfAborted();
        const url = new URL(`${home}#${input.section}`, browser.location.origin);
        const link = [...page.querySelectorAll('a[href]')].find((anchor) => {
          const target = new URL(anchor.getAttribute('href'), browser.location.href);
          return target.href === url.href && (!anchor.target || anchor.target === '_self') && !anchor.hasAttribute('download');
        });
        // Existing anchors use the site's Lenis chapter handler. Other known
        // sections use the same native hash navigation handled by runtime.ts.
        if (link) link.click();
        else browser.location.assign(url.href);
        return JSON.stringify({ section: input.section, url: url.href });
      },
    },
    {
      name: 'get_bonanza_contact',
      description: 'Read the public contact email address shown on this Bonanza Ranch page. Does not send an email, open an email application or copy anything to the clipboard.',
      inputSchema: schema(),
      annotations: { readOnlyHint: true, consequentialHint: false },
      execute: async (input, { signal } = {}) => {
        validateInput(input);
        signalFor(signal).throwIfAborted();
        const { email, url } = contact();
        return JSON.stringify({ email, url });
      },
    },
    {
      name: 'open_bonanza_contact',
      description: 'Show the existing contact dialog on the Bonanza page so the user can choose how to contact the operator. Does not launch an email application or send a message.',
      inputSchema: schema(),
      annotations: { readOnlyHint: false, consequentialHint: false },
      execute: async (input, { signal } = {}) => {
        validateInput(input);
        signalFor(signal).throwIfAborted();
        const { dialog, email, url } = contact();
        if (!dialog.open) dialog.showModal();
        return JSON.stringify({ opened: dialog.open, email, url });
      },
    },
  ];
}

export function initializeBonanzaWebMCP({
  document: page = globalThis.document,
  navigator: agent = globalThis.navigator,
  window: browser = globalThis.window,
  fetch: request = globalThis.fetch,
} = {}) {
  if (!page || !browser) return () => {};
  if (installations.has(page)) return installations.get(page);
  // Current Chrome exposes document.modelContext; older previews used navigator.
  // Unsupported browsers retain the normal UI without any polyfill or fake API.
  const context = typeof page.modelContext?.registerTool === 'function'
    ? page.modelContext
    : typeof agent?.modelContext?.registerTool === 'function' ? agent.modelContext : null;
  if (!context) return () => {};

  let controller;
  let active = true;
  let disposed = false;
  const unregister = () => {
    controller?.abort();
    controller = undefined;
  };
  const register = () => {
    if (disposed || !active || page.readyState === 'loading' || page.visibilityState === 'hidden' || controller) return;
    const registration = new AbortController();
    controller = registration;
    const tools = createTools(page, browser, request, registration.signal);
    const failed = (error) => {
      registration.abort();
      if (controller === registration) controller = undefined;
      if (!disposed) console.warn('Bonanza WebMCP tool registration failed.', error);
    };
    // A browser may expose the experiment but refuse this origin's registration.
    // Handle both synchronous permission errors and asynchronous rejections.
    try {
      Promise.all(tools.map((tool) => context.registerTool(tool, { signal: registration.signal }))).catch(failed);
    } catch (error) {
      failed(error);
    }
  };
  const visibility = () => page.visibilityState === 'hidden' ? unregister() : register();
  const hide = () => { active = false; unregister(); };
  const show = () => { active = true; register(); };
  const dispose = () => {
    if (disposed) return;
    disposed = true;
    unregister();
    page.removeEventListener('DOMContentLoaded', register);
    page.removeEventListener('visibilitychange', visibility);
    browser.removeEventListener('pagehide', hide);
    browser.removeEventListener('pageshow', show);
    installations.delete(page);
  };
  installations.set(page, dispose);
  page.addEventListener('DOMContentLoaded', register);
  page.addEventListener('visibilitychange', visibility);
  browser.addEventListener('pagehide', hide);
  browser.addEventListener('pageshow', show);
  register();
  return dispose;
}

if (typeof document !== 'undefined' && typeof window !== 'undefined') initializeBonanzaWebMCP();
