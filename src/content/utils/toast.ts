export function showToast(message: string, persistent: boolean = false): void {
    const existing = document.querySelector('[data-fxtweet-toast]');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.setAttribute('data-fxtweet-toast', 'true');
    toast.textContent = message + ' @X Utils';
    toast.style.cssText = `
        position: fixed;
        bottom: 32px;
        left: 50%;
        transform: translateX(-50%);
        background: rgba(255, 255, 255, 0.75);
        backdrop-filter: blur(12px);
        -webkit-backdrop-filter: blur(12px);
        color: rgb(0, 0, 0);
        padding: 12px 20px;
        border-radius: 9999px;
        font-size: 15px;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
        z-index: 99999;
        pointer-events: none;
        opacity: 1;
        transition: opacity 170ms cubic-bezier(0, 0, 1, 1);
    `;
    document.body.appendChild(toast);

    if (!persistent) {
        setTimeout(() => {
            toast.style.opacity = '0';
            setTimeout(() => toast.remove(), 170);
        }, 2500);
    }
}