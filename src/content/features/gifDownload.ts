import { showDropdown } from '../utils/dropdown';
import { downloadMp4, downloadGif } from '../utils/download';
import { getTweetIdFromArticle } from '../utils/tweet';
import { showToast } from '../utils/toast';

function injectDownloadButton(container: Element): void {
    if (container.querySelector(`[data-gif-download]`)) return;

    const videoEl = container.querySelector('video');
    if (!videoEl) return;

    const btn = document.createElement('button');
    btn.setAttribute('data-gif-download', 'true');
    btn.innerHTML = `
        <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
            <path d="M11.99 16l-5.7-5.7L7.7 8.88l3.29 3.3V2.59h2v9.59l3.3-3.3 1.41 1.42-5.71 5.7zM21 15l-.02 3.51c0 1.38-1.12 2.49-2.5 2.49H5.5C4.11 21 3 19.88 3 18.5V15h2v3.5c0 .28.22.5.5.5h12.98c.28 0 .5-.22.5-.5L19 15h2z"></path>
        </svg>
    `;
    btn.style.cssText = `
        position: absolute;
        top: 8px;
        right: 8px;
        background: rgba(0, 0, 0, 0.6);
        backdrop-filter: blur(4px);
        border: none;
        border-radius: 50%;
        width: 32px;
        height: 32px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        color: white;
        opacity: 0;
        transition: opacity 0.2s;
        z-index: 10;
    `;

    container.addEventListener('mouseenter', () => { btn.style.opacity = '1'; });
    container.addEventListener('mouseleave', () => { btn.style.opacity = '0'; });

    btn.addEventListener('click', (e) => {
        e.stopPropagation();
        e.preventDefault();
        const article = container.closest('article');
        const tweetId = article ? getTweetIdFromArticle(article) : null;
        if (!tweetId) {
            showToast(chrome.i18n.getMessage('NoTweetIdToast'));
            return;
        }
        showDropdown(btn, [
            { label: chrome.i18n.getMessage('downloadVideoBtn'), onClick: () => downloadMp4(videoEl as HTMLVideoElement, tweetId) },
            { label: chrome.i18n.getMessage('downloadGifBtn'), onClick: () => downloadGif(videoEl as HTMLVideoElement, tweetId) },
        ]);
    });

    (container as HTMLElement).style.position = 'relative';
    container.appendChild(btn);
}

function scanAndInject(): void {
    const gifContainers = document.querySelectorAll('[data-testid="tweetPhoto"]');

    gifContainers.forEach(container => {
        if (container.querySelector('[data-gif-download]')) return;

        const hasGifLabel = Array.from(container.querySelectorAll('span'))
            .some(span => span.textContent?.trim() === 'GIF');

        if (hasGifLabel) {
            injectDownloadButton(container);
        }
    });
}

function removeAllButtons(): void {
    document.querySelectorAll(`[data-gif-download]`).forEach(btn => btn.remove());
}

export function initGifDownload(cachedSettings: Record<string, boolean>): void {
    const observer = new MutationObserver(() => {
        if (!cachedSettings['gifdownload']) return;
        scanAndInject();
    });

    observer.observe(document.body, { childList: true, subtree: true });

    chrome.storage.onChanged.addListener((changes) => {
        if (!('gifdownload' in changes)) return;
        if (!changes['gifdownload'].newValue) {
            removeAllButtons();
        } else {
            scanAndInject();
        }
    });
}