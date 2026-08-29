import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
const projectRoot = dirname(fileURLToPath(import.meta.url));
export default defineConfig({
    root: projectRoot,
    plugins: [react()],
    resolve: {
        alias: {
            '@': resolve(projectRoot, 'src'),
            '@shared': resolve(projectRoot, 'shared'),
        },
    },
    test: {
        include: ['tests/**/*.test.ts', 'tests/**/*.test.tsx'],
        environment: 'node',
    },
});
