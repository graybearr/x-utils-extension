import { getTweetInfo } from "../utils/tweet";
import { createMenuItem } from "../utils/menu";
import { showToast } from "../utils/toast";

export function injectFixTweetButton(menu: Element): void {
    if (menu.querySelector('[data-fixtweet]')) return;
    const items = menu.querySelectorAll('[role="menuitem"]');
    if (items.length < 1) return;

    const item = createMenuItem(menu, {
        dataAttr: 'data-fixtweet',
        svgPath: 'M18.36 5.64c-1.95-1.96-5.11-1.96-7.07 0L9.88 7.05 8.46 5.64l1.42-1.42c2.73-2.73 7.16-2.73 9.9 0 2.73 2.74 2.73 7.17 0 9.9l-1.42 1.42-1.41-1.42 1.41-1.41c1.96-1.96 1.96-5.12 0-7.07zm-2.12 3.53l-7.07 7.07-1.41-1.41 7.07-7.07 1.41 1.41zm-12.02.71l1.42-1.42 1.41 1.42-1.41 1.41c-1.96 1.96-1.96 5.12 0 7.07 1.95 1.96 5.11 1.96 7.07 0l1.41-1.41 1.42 1.41-1.42 1.42c-2.73 2.73-7.16 2.73-9.9 0-2.73-2.74-2.73-7.17 0-9.9z',
        label: chrome.i18n.getMessage('fixTweetBtn'),
        onClick: () => {
            const info = getTweetInfo(menu);
            if (info) {
                const url = `https://fxtwitter.com/${info.userId}/status/${info.tweetId}`;
                navigator.clipboard.writeText(url).then(() => {
                    showToast(chrome.i18n.getMessage('fixTweetToast'));
                });
            }
        }
    });

    if (item) {
        items[1]
            ? menu.insertBefore(item, items[1])
            : menu.appendChild(item);
    }
}