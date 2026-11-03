import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { mkdtemp, readFile, access, readdir, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { buildSite } from '../scripts/build.mjs';

const root = resolve(import.meta.dirname, '..');
const workerSource = await readFile(join(root, 'sw.js'), 'utf8');

function workerHarness() {
  const handlers = {};
  const scope = 'https://example.github.io/kutradar-hu/';
  const cacheData = new Map();
  const deleted = [];
  let network = async () => new Response('new release');
  const cache = {
    addAll: async paths => { for (const path of paths) cacheData.set(new URL(path, scope).href, new Response('offline shell')); },
    put: async (key, response) => cacheData.set(key, response),
    match: async key => cacheData.get(key)?.clone(),
  };
  const caches = {
    open: async () => cache,
    keys: async () => [
      'kutradar-demo-/kutradar-hu/-old', 'kutradar-demo-/another-app/-old', 'unrelated-cache',
    ],
    delete: async key => deleted.push(key),
  };
  vm.runInNewContext(workerSource, {
    URL, Set, Promise, Response, caches, fetch: request => network(request),
    self: { registration: { scope }, location: new URL(scope),
      skipWaiting: async () => {}, clients: { claim: async () => {} },
      addEventListener: (name, handler) => { handlers[name] = handler; } },
  });
  return { handlers, deleted, cacheData, setNetwork: handler => { network = handler; },
    async lifecycle(name) { let pending; handlers[name]({ waitUntil: promise => { pending = promise; } }); await pending; },
    fetch(path, method = 'GET') {
      let response;
      handlers.fetch({ request: new Request(new URL(path, scope), { method }),
        respondWith: promise => { response = promise; } });
      return response;
    },
  };
}

test('Pages build contains all runtime files and disclosures and resolves under a project path', async () => {
  const temporary = await mkdtemp(join(tmpdir(), 'kutradar-build-'));
  try {
    const destination = join(temporary, 'site');
    const first = await buildSite(destination);
    const entries = await readdir(destination);
    assert.ok(entries.includes('.nojekyll'));
    for (const privateFile of ['.git', '.github', 'scripts', 'tests', 'package.json']) assert.ok(!entries.includes(privateFile));
    const history = await readFile(join(destination, 'docs/HISTORY.md'), 'utf8');
    assert.match(history, /synthetic historical dates/);
    assert.match(await readFile(join(destination, 'README.md'), 'utf8'), /simulated fuel prices/);
    const manifest = JSON.parse(await readFile(join(destination, 'public/manifest.webmanifest'), 'utf8'));
    for (const base of ['https://example.github.io/', 'https://example.github.io/kutradar-hu/']) {
      const manifestURL = new URL('public/manifest.webmanifest', base);
      assert.equal(new URL(manifest.start_url, manifestURL).href, base);
      assert.equal(new URL(manifest.scope, manifestURL).href, base);
      assert.equal(new URL(manifest.id, manifestURL).href, base);
      assert.equal(new URL(manifest.icons[0].src, manifestURL).href, new URL('public/icon.svg', base).href);
    }
    const worker = await readFile(join(destination, 'sw.js'), 'utf8');
    assert.ok(!worker.includes('__BUILD_ID__'));
    assert.ok(worker.includes(first.buildId));
    const paths = [...worker.matchAll(/'\.\/(.*?)'/g)].map(match => match[1]);
    for (const path of paths) await access(join(destination, path || 'index.html'));
    assert.equal((await buildSite(destination)).buildId, first.buildId);
  } finally { await rm(temporary, { recursive: true, force: true }); }
});

test('worker refreshes cached releases online and opens shared links offline', async () => {
  const worker = workerHarness();
  await worker.lifecycle('install');
  const response = await worker.fetch('src/app.js');
  assert.equal(await response.text(), 'new release');
  worker.setNetwork(async () => { throw new Error('offline'); });
  assert.equal(await (await worker.fetch('src/app.js')).text(), 'new release');
  assert.equal(await (await worker.fetch('?city=gyor&fuel=diesel')).text(), 'offline shell');
  assert.ok([...worker.cacheData.keys()].every(key => !key.includes('?')));
});

test('worker cache cleanup and fetch interception stay inside this app', async () => {
  const worker = workerHarness();
  await worker.lifecycle('activate');
  assert.deepEqual(worker.deleted, ['kutradar-demo-/kutradar-hu/-old']);
  assert.equal(worker.fetch('https://tiles.example.com/map.png'), undefined);
  assert.equal(worker.fetch('/another-app/index.html'), undefined);
  assert.equal(worker.fetch('docs/HISTORY.md'), undefined);
  assert.equal(worker.fetch('index.html', 'POST'), undefined);
});
