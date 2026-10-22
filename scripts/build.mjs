import { cp, mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { resolve, relative, sep, isAbsolute } from 'node:path';
import { pathToFileURL } from 'node:url';

const root = resolve(import.meta.dirname, '..');
const publicFiles = ['index.html', 'src', 'public', 'LICENSE', 'README.md', 'docs'];

async function filesAt(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = await Promise.all(entries.map(entry => entry.isDirectory()
    ? filesAt(resolve(directory, entry.name)) : [resolve(directory, entry.name)]));
  return files.flat().sort();
}

/** Publish only the app and its disclosures, never Git metadata or local tooling. */
export async function buildSite(output = resolve(root, 'dist')) {
  const destination = resolve(output);
  const contains = (parent, child) => {
    const path = relative(parent, child);
    return path === '' || (path !== '..' && !path.startsWith('..' + sep) && !isAbsolute(path));
  };
  if (contains(destination, root) || (contains(root, destination) && destination !== resolve(root, 'dist'))) {
    throw new Error('Build output must not overwrite the source repository');
  }
  await rm(destination, { recursive: true, force: true });
  await mkdir(destination, { recursive: true });
  for (const file of publicFiles) await cp(resolve(root, file), resolve(destination, file), { recursive: true });
  const worker = await readFile(resolve(root, 'sw.js'), 'utf8');
  const hash = createHash('sha256').update(worker);
  for (const file of await filesAt(destination)) {
    hash.update(relative(destination, file)).update(await readFile(file));
  }
  const buildId = hash.digest('hex').slice(0, 16);
  await writeFile(resolve(destination, 'sw.js'), worker.replace('__BUILD_ID__', buildId));
  await writeFile(resolve(destination, '.nojekyll'), '');
  return { destination, buildId };
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const { destination, buildId } = await buildSite();
  console.log(`Built KútRadar demo ${buildId} at ${destination}`);
}
