import { logger } from './content/utils/logger';

let offscreenPort: chrome.runtime.Port | null = null;
let offscreenReadyResolve: (() => void) | null = null;

chrome.runtime.onConnect.addListener((port) => {
    if (port.name !== 'offscreen') return;
    offscreenPort = port;
    port.onMessage.addListener((msg) => {
        if (msg.type === 'LOG') logger.info('offscreen', msg.message);
        if (msg.type === 'OFFSCREEN_READY') {
            logger.info('background', 'offscreen 포트 준비 완료');
            offscreenReadyResolve?.();
            offscreenReadyResolve = null;
        }
    });
    port.onDisconnect.addListener(() => {
        offscreenPort = null;
    });
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    logger.info('background', `메시지 받음: ${message.type}`);
    if (message.type !== 'CONVERT_GIF') return;

    const tabId = sender.tab?.id;
    (async () => {
        try {
            if (!await chrome.offscreen.hasDocument()) {
                logger.info('background', 'offscreen 생성 시도');
                const readyPromise = new Promise<void>((resolve) => {
                    offscreenReadyResolve = resolve;
                });
                await chrome.offscreen.createDocument({
                    url: chrome.runtime.getURL('src/offscreen/offscreen.html'),
                    reasons: [chrome.offscreen.Reason.WORKERS],
                    justification: 'ffmpeg wasm으로 GIF 변환'
                });
                await readyPromise;
                logger.info('background', 'offscreen 준비 완료');
            }

            if (!offscreenPort) {
                sendResponse({ success: false, error: 'offscreen port not found' });
                return;
            }

            const resultPromise = new Promise<{ success: boolean; dataUrl?: string; error?: string; stack?: string }>((resolve) => {
                const handler = (msg: { type: string; progress?: number; success?: boolean; dataUrl?: string; error?: string; stack?: string; message?: string }) => {
                    if (msg.type === 'LOG') logger.info('offscreen', msg.message ?? '');
                    if (msg.type === 'GIF_PROGRESS' && tabId !== undefined) {
                        chrome.tabs.sendMessage(tabId, { type: 'GIF_PROGRESS', progress: msg.progress });
                    }
                    if (msg.type === 'GIF_RESULT') {
                        offscreenPort?.onMessage.removeListener(handler);
                        resolve(msg as { success: boolean; dataUrl?: string; error?: string; stack?: string });
                    }
                };
                offscreenPort!.onMessage.addListener(handler);
            });

            logger.info('background', 'START_CONVERT 전송');
            offscreenPort.postMessage({ type: 'START_CONVERT', url: message.url, quality: message.quality });

            const result = await resultPromise;
            logger.info('background', `결과: ${result.success}, 에러: ${result.error}`);
            logger.info('background', `스택: ${result.stack}`);
            await chrome.offscreen.closeDocument();
            sendResponse(result);
        } catch (e: unknown) {
            const err = e as Error;
            logger.error('background', `에러: ${err.message}`);
            sendResponse({ success: false, error: err.message });
        }
    })();
    return true; // 비동기 응답 유지
});
