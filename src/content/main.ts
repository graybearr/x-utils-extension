import { injectViewQuotesButton } from "./features/viewQuotes";
import { injectFixTweetButton } from "./features/fixTweet";
import { initGifDownload } from './features/gifDownload';

interface ButtonHandler {
    match: (btn: HTMLElement) => boolean;
    settingKey: string;
    handler: (menu: Element) => void;
}

const BUTTON_HANDLERS: ButtonHandler[] = [
    {
        match: btn => btn.matches('[data-testid="retweet"], [data-testid="unretweet"]'),
        settingKey: 'viewquotes',
        handler: injectViewQuotesButton
    },
    {
        match: btn => !!btn.querySelector('path[d^="M12 2.59"]'),
        settingKey: 'fixtweet',
        handler: injectFixTweetButton
    }
    // 기능 추가 시 작성
];

const cachedSettings: Record<string, boolean> = {
    // ButtonHandler 기반 설정키
    ...Object.fromEntries(BUTTON_HANDLERS.map(({ settingKey }) => [settingKey, true])),
    // 독립 기능 설정키
    gifdownload: true,
};

chrome.storage.sync.get(cachedSettings, (settings) => {
    Object.assign(cachedSettings, settings);
});

chrome.storage.onChanged.addListener((changes) => {
    for (const key in changes) {
        cachedSettings[key] = changes[key].newValue as boolean;
    }
});

document.addEventListener('click', (e) => {
    const btn = (e.target as HTMLElement).closest('button') as HTMLElement | null;
    if (!btn) return;

    const matched = BUTTON_HANDLERS.find(({ match }) => match(btn));
    if (!matched) return;
    if (!cachedSettings[matched.settingKey]) return;

    let tries = 0;
    const interval = setInterval(() => {
        tries++;

        const menu = document.querySelector('[data-testid="Dropdown"]') || document.querySelector('[role="menu"]');
        if (menu) {
            clearInterval(interval);
            matched.handler(menu);
        }

        if (tries > 20) clearInterval(interval);
    }, 50);
}, true);

initGifDownload(cachedSettings);