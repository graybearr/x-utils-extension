export interface TweetInfo {
    userId: string;
    tweetId: string;
}

export function getTweetInfo(menuEl: Element): TweetInfo | null {
    const rect = menuEl.getBoundingClientRect();
    const articles = document.querySelectorAll('article');

    for (const a of articles) {
        const ar = a.getBoundingClientRect();
        if (ar.top <= rect.top && ar.bottom >= rect.top) {
            //타임스탬프 태그에서 링크 찾기
            const timeLink = a.querySelector('a[href*="/status/"] time');
            if (timeLink) {
                const match = timeLink.closest('a')?.href.match(/(?:twitter|x)\.com\/([^/]+)\/status\/(\d+)/);
                if (match) return { userId: match[1], tweetId: match[2] };
            }

            const links = a.querySelectorAll('a[href*="/status/"]');
            for (const link of links) {
                const match = (link as HTMLAnchorElement).href.match(/(?:twitter|x)\.com\/([^/]+)\/status\/(\d+)/);
                if (match) return { userId: match[1], tweetId: match[2] };
            }
        }
    }

    const match = window.location.pathname.match(/\/([^/]+)\/status\/(\d+)/);
    if (match) return { userId: match[1], tweetId: match[2] };
    return null;
}

export function getTweetIdFromArticle(article: Element): string | null {
    const timeLink = article.querySelector('a[href*="/status/"] time');
    if (timeLink) {
        const match = timeLink.closest('a')?.href.match(/\/status\/(\d+)/);
        if (match) return match[1];
    }
    return null;
}