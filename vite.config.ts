import { defineConfig } from 'vite';
import { crx } from '@crxjs/vite-plugin';
import manifest from './manifest.json';
import { copyFileSync, mkdirSync, rmSync } from 'fs';
import { resolve } from 'path';
import { fileURLToPath } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

export default defineConfig(({ mode }) => ({
    build: {
        rollupOptions: {
            input: {
                offscreen: resolve(__dirname, 'src/offscreen/offscreen.html')
            }
        }
    },
    define: {
        '__DEBUG__': mode === 'development'
    },
    plugins: [
        crx({ manifest }),
        {
            name: 'copy-ffmpeg-wasm',
            apply: 'build' as const,
            closeBundle() {
                const src  = resolve(__dirname, 'node_modules/@ffmpeg/core/dist/esm');
                const dest = resolve(__dirname, 'dist/ffmpeg');
                mkdirSync(dest, { recursive: true });
                for (const file of ['ffmpeg-core.js', 'ffmpeg-core.wasm']) {
                    copyFileSync(resolve(src, file), resolve(dest, file));
                }
                rmSync(resolve(__dirname, 'dist/.vite'), { recursive: true, force: true });
            }
        }
    ]
}));
