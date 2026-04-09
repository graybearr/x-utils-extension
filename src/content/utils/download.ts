import { logger } from './logger';
import { showToast } from './toast';

export async function downloadMp4(videoEl: HTMLVideoElement, tweetId: string): Promise<void> {
    const res = await fetch(videoEl.src);
    const blob = await res.blob();
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `xutils_${tweetId}_video.mp4`;
    a.click();
    URL.revokeObjectURL(a.href);
    showToast(chrome.i18n.getMessage('mp4SavedToast'));
}

export async function downloadGif(videoEl: HTMLVideoElement, tweetId: string): Promise<void> {
    showToast(chrome.i18n.getMessage('loadFfmpegToast'), true);

    // 진행도 메시지 수신
    const progressHandler = (message: { type: string; progress?: number }) => {
        if (message.type === 'GIF_PROGRESS') {
            showToast(`${chrome.i18n.getMessage('gifConvertToast')} (${Math.round((message.progress ?? 0) * 100)}%)`, true);
        }
    };
    chrome.runtime.onMessage.addListener(progressHandler);

    chrome.storage.sync.get({ gifQuality: 'medium' }, async (settings: Record<string, string>) => {
        try {
            const response = await new Promise<{ success: boolean; dataUrl?: string; error?: string }>((resolve) => {
                chrome.runtime.sendMessage(
                    { type: 'CONVERT_GIF', url: videoEl.src, quality: settings.gifQuality },
                    resolve
                );
            });

            chrome.runtime.onMessage.removeListener(progressHandler);

            if (!response.success || !response.dataUrl) {
                showToast(chrome.i18n.getMessage('gifFailedToast'));
                return;
            }

            const a = document.createElement('a');
            a.href = response.dataUrl;
            a.download = `xutils_${tweetId}_${settings.gifQuality}.gif`;
            a.click();
            showToast(chrome.i18n.getMessage('gifSavedToast'));
        } catch (err) {
            chrome.runtime.onMessage.removeListener(progressHandler);
            showToast(chrome.i18n.getMessage('gifFailedToast'));
            logger.error('download', (err as Error).message);
        }
    });
}