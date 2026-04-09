document.addEventListener("DOMContentLoaded", () => {
    const FEATURES = ['viewquotes', 'fixtweet', 'gifdownload']; // 기능 추가 시 작성
    const defaults = Object.fromEntries(FEATURES.map(id => [id, id !== 'gifdownload']));

    // 다국어 적용
    document.querySelectorAll("[data-i18n]").forEach(el => {
        (el as HTMLElement).textContent = chrome.i18n.getMessage((el as HTMLElement).dataset.i18n!);
    });

    // 저장된 설정 불러오기
    chrome.storage.sync.get(defaults, (settings) => {
        FEATURES.forEach(id => {
            const el = document.getElementById(id) as HTMLInputElement | null;
            if (el) el.checked = settings[id] as boolean;
        });
    });

    // 변경 시 저장
    FEATURES.forEach(id => {
        const el = document.getElementById(id) as HTMLInputElement | null;
        el?.addEventListener("change", (e) => {
            chrome.storage.sync.set({ [id]: (e.target as HTMLInputElement).checked });
        });
    });

    // 아코디언
    document.getElementById('gifDownloadHeader')?.addEventListener('click', () => {
        const panel = document.getElementById('gifQualityPanel');
        const arrow = document.querySelector('.accordion-arrow');
        panel?.classList.toggle('open');
        arrow?.classList.toggle('open');
    });
    
    // 화질 버튼
    const qualityBtns = document.querySelectorAll('.quality-btn');
    chrome.storage.sync.get({ gifQuality: 'medium' }, (settings) => {
        qualityBtns.forEach(btn => {
            if ((btn as HTMLElement).dataset.quality === settings.gifQuality) {
                btn.classList.add('active');
            }
            btn.addEventListener('click', () => {
                qualityBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                chrome.storage.sync.set({ gifQuality: (btn as HTMLElement).dataset.quality });
            });
        });
    });
    
    // 버전 표시
    const version = document.querySelector("#version");
    if (version) version.textContent = `v${chrome.runtime.getManifest().version}`;
});
