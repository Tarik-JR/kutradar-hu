import test from 'node:test';
import assert from 'node:assert/strict';
import { once } from 'node:events';
import { mkdtemp, mkdir, writeFile, symlink, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawn } from 'node:child_process';
import { createDevServer } from '../scripts/dev-server.mjs';

test('development server serves assets but rejects metadata, escapes and malformed requests', async () => {
  const temporary = await mkdtemp(join(tmpdir(), 'kutradar-server-'));
  const directory = join(temporary, 'public');
  await mkdir(directory);
  await writeFile(join(directory, 'index.html'), '<h1>Demo</h1>');
  await writeFile(join(directory, 'app.js'), 'export const demo = true;');
  await writeFile(join(temporary, 'private.txt'), 'private');
  await symlink(join(temporary, 'private.txt'), join(directory, 'escape.txt'));
  const server = createDevServer(directory).listen(0, '127.0.0.1');
  await once(server, 'listening');
  const base = `http://127.0.0.1:${server.address().port}`;
  try {
    const index = await fetch(base + '/?city=gyor');
    assert.equal(index.status, 200);
    assert.match(index.headers.get('content-type'), /text\/html/);
    assert.equal(index.headers.get('x-content-type-options'), 'nosniff');
    assert.match(await index.text(), /Demo/);
    assert.match((await fetch(base + '/app.js')).headers.get('content-type'), /javascript/);
    const head = await fetch(base + '/', { method: 'HEAD' });
    assert.equal(head.status, 200);
    assert.equal(await head.text(), '');
    for (const path of ['/.git/config', '/%2egit/config', '/.env', '/escape.txt', '/%2e%2e%2fprivate.txt']) {
      assert.equal((await fetch(base + path)).status, 403, path);
    }
    assert.equal((await fetch(base + '/%ZZ')).status, 400);
    assert.equal((await fetch(base + '/missing')).status, 404);
    assert.equal((await fetch(base + '/', { method: 'POST' })).status, 405);
  } finally {
    await new Promise(resolve => server.close(resolve));
    await rm(temporary, { recursive: true, force: true });
  }
});

test('development CLI honors the host and port arguments used by preview hosting', async () => {
  const child = spawn(process.execPath, ['scripts/dev-server.mjs', '--host', '0.0.0.0', '--port', '0', '--strictPort'], {
    cwd: new URL('..', import.meta.url), stdio: ['ignore', 'pipe', 'pipe'],
  });
  try {
    const output = await new Promise((resolve, reject) => {
      let text = '';
      const timeout = setTimeout(() => reject(new Error('Server startup timed out')), 5000);
      child.once('error', error => { clearTimeout(timeout); reject(error); });
      child.once('exit', code => { clearTimeout(timeout); reject(new Error(`Server exited: ${code}`)); });
      child.stdout.on('data', chunk => {
        text += chunk;
        if (text.includes('\n')) { clearTimeout(timeout); resolve(text); }
      });
    });
    assert.match(output, /http:\/\/0\.0\.0\.0:[1-9]\d*/);
  } finally {
    child.kill();
    if (child.exitCode === null && child.signalCode === null) await once(child, 'exit');
  }
});
