export function showDropdown(
    anchor: HTMLElement,
    options: { label: string; onClick: () => void }[]
): void {
    const existing = document.querySelector('[data-xutils-dropdown]');
    if (existing) { existing.remove(); return; }

    const dropdown = document.createElement('div');
    dropdown.setAttribute('data-xutils-dropdown', 'true');
    dropdown.style.cssText = `
        position: absolute;
        top: 44px;
        right: 8px;
        background: rgba(0, 0, 0, 0.85);
        backdrop-filter: blur(12px);
        border-radius: 12px;
        overflow: hidden;
        z-index: 100;
        width: max-content;
        min-width: 120px;
        max-width: 280px;
        white-space: nowrap;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
    `;

    options.forEach(({ label, onClick }) => {
        const item = document.createElement('div');
        item.textContent = label;
        item.style.cssText = `
            padding: 10px 16px;
            color: white;
            font-size: 14px;
            cursor: pointer;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            transition: background 0.15s;
        `;
        item.addEventListener('mouseenter', () => { item.style.background = 'rgba(255,255,255,0.1)'; });
        item.addEventListener('mouseleave', () => { item.style.background = ''; });
        item.addEventListener('click', (e) => {
            e.stopPropagation();
            dropdown.remove();
            onClick();
        });
        dropdown.appendChild(item);
    });

    anchor.appendChild(dropdown);

    setTimeout(() => {
        document.addEventListener('click', () => dropdown.remove(), { once: true });
    }, 0);
}