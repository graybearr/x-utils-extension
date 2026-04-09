import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile } from '@ffmpeg/util';

type Quality = 'low' | 'medium' | 'high';

interface QualitySetting {
    fps: number;
    scale: number;
}

const QUALITY_SETTINGS: Record<Quality, QualitySetting> = {
    low:    { fps: 8,  scale: 320 },
    medium: { fps: 15, scale: 480 },
    high:   { fps: -1, scale: -1  },
};

const port = chrome.runtime.connect({ name: 'offscreen' });

let ffmpeg: FFmpeg | null = null;

async function getFFmpeg(): Promise<FFmpeg> {
    if (ffmpeg) return ffmpeg;
    ffmpeg = new FFmpeg();
    const coreURL = chrome.runtime.getURL('ffmpeg/ffmpeg-core.js');
    const wasmURL = chrome.runtime.getURL('ffmpeg/ffmpeg-core.wasm');
    port.postMessage({ type: 'LOG', message: `coreURL: ${coreURL}` });
    port.postMessage({ type: 'LOG', message: `wasmURL: ${wasmURL}` });
    ffmpeg.on('progress', ({ progress }) => {
        port.postMessage({ type: 'GIF_PROGRESS', progress });
    });
    await ffmpeg.load({ coreURL, wasmURL });
    return ffmpeg;
}

port.onMessage.addListener(async (message: { type: string; url?: string; quality?: string }) => {
    if (message.type !== 'START_CONVERT') return;

    try {
        port.postMessage({ type: 'LOG', message: 'ffmpeg 로딩 시작' });
        const ff = await getFFmpeg();
        port.postMessage({ type: 'LOG', message: 'ffmpeg 로딩 완료' });

        const qualityKey = (message.quality as Quality) || 'medium';
        const { fps, scale } = QUALITY_SETTINGS[qualityKey];

        const fpsStr = fps === -1 ? '' : `fps=min(source_fps\\,${fps}),`;
        const scaleStr = scale === -1 ? 'iw' : `min(iw\\,${scale})`;
        const palettegen = qualityKey === 'high' ? 'palettegen=stats_mode=full' : 'palettegen';

        await ff.writeFile('input.mp4', await fetchFile(message.url!));
        await ff.exec([
            '-i', 'input.mp4',
            '-vf', `${fpsStr}scale=${scaleStr}:-1:flags=lanczos,split[s0][s1];[s0]${palettegen}[p];[s1][p]paletteuse`,
            '-loop', '0',
            'output.gif'
        ]);

        const data = await ff.readFile('output.gif');
        const uint8 = new Uint8Array(data instanceof Uint8Array ? (data.buffer as ArrayBuffer) : new TextEncoder().encode(data as string));
        const blob = new Blob([uint8], { type: 'image/gif' });

        const reader = new FileReader();
        reader.onload = () => {
            port.postMessage({ type: 'GIF_RESULT', success: true, dataUrl: reader.result });
        };
        reader.readAsDataURL(blob);

        await ff.deleteFile('input.mp4');
        await ff.deleteFile('output.gif');
    } catch (e: unknown) {
        const err = e as Error;
        port.postMessage({ type: 'GIF_RESULT', success: false, error: err.message, stack: err.stack });
    }
});

port.postMessage({ type: 'OFFSCREEN_READY' });
