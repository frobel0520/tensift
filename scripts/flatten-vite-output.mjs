import { mkdir, rename, rm } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = fileURLToPath(new URL('..', import.meta.url));
const distRoot = join(projectRoot, 'dist');
const nestedAppRoot = join(distRoot, 'app');
const nestedIndex = join(nestedAppRoot, 'index.html');
const flatIndex = join(distRoot, 'index.html');

await mkdir(distRoot, { recursive: true });
await rename(nestedIndex, flatIndex);
await rm(nestedAppRoot, { recursive: true, force: true });
console.log('Vite output flattened to dist/index.html.');
