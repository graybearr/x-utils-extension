import { initViewQuotes } from "./features/viewQuotes";
import { initFixTweet } from "./features/fixTweet";
import { initGifDownload } from './features/gifDownload';

const cachedSettings: Record<string, boolean> = {
    viewquotes: true,
    fixtweet: true,
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

initViewQuotes(cachedSettings);
initFixTweet(cachedSettings);
initGifDownload(cachedSettings);
