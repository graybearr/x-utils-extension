export interface MenuItemOptions {
    dataAttr: string;
    svgPath: string;
    label: string;
    onClick: () => void;
}

export function createMenuItem(menu: Element, options: MenuItemOptions): Element | null {
    const existingItem = menu.querySelector('[role="menuitem"]');
    if (!existingItem) return null;

    const item = existingItem.cloneNode(true) as Element;
    item.setAttribute(options.dataAttr, 'true');
    item.removeAttribute('data-testid');

    const svgEl = item.querySelector('svg');
    if (svgEl) {
        svgEl.setAttribute('viewBox', '0 0 24 24');
        svgEl.innerHTML = `<path d="${options.svgPath}"/>`;
    }

    const spans = item.querySelectorAll('span');
    for (const span of spans) {
        if (span.textContent.trim().length > 0 && !span.querySelector('svg')) {
            span.textContent = options.label;
            break;
        }
    }

    item.addEventListener('click', (e) => {
        e.stopPropagation();
        options.onClick();
    });

    item.addEventListener('mouseenter', () => {
        const isDark = document.documentElement.style.colorScheme === 'dark';
        (item as HTMLElement).style.backgroundColor = isDark
            ? 'rgba(255, 255, 255, 0.03)'
            : 'rgba(0, 0, 0, 0.03)';
    });

    item.addEventListener('mouseleave', () => {
        (item as HTMLElement).style.backgroundColor = '';
    });

    return item;
}