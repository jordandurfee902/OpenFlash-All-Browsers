let flashcardSets = [];
const setGrid = document.getElementById('setGrid');

function init() {
    chrome.storage.local.get(['flashcardSets', 'flashcards'], (result) => {
        if (result.flashcards && result.flashcards.length > 0 && !result.flashcardSets) {
            flashcardSets = [{
                id: 'default',
                title: 'Default Set',
                description: 'Cards added via the quick-add menu.',
                cards: result.flashcards
            }];
            chrome.storage.local.set({ flashcardSets });
        } else {
            flashcardSets = result.flashcardSets || [];
        }
        renderLibrary();
    });
}

const ICONS = {
    brain: '<svg viewBox="0 0 24 24"><path d="M12,3C7.58,3 4,4.79 4,7C4,9.21 7.58,11 12,11C16.42,11 20,9.21 20,7C20,4.79 16.42,3 12,3M4,9V12C4,14.21 7.58,16 12,16C16.42,16 20,14.21 20,12V9C20,11.21 16.42,13 12,13C7.58,13 4,11.21 4,9M4,14V17C4,19.21 7.58,21 12,21C16.42,21 20,19.21 20,17V14C20,16.21 16.42,18 12,18C7.58,18 4,16.21 4,14Z"/></svg>',
    book: '<svg viewBox="0 0 24 24"><path d="M18,22A2,2 0 0,0 20,20V4C20,2.89 19.1,2 18,2H12V9L9.5,7.5L7,9V2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18Z"/></svg>',
    science: '<svg viewBox="0 0 24 24"><path d="M7.5,2C5.57,2 4,3.57 4,5.5V18A2,2 0 0,0 6,20H18A2,2 0 0,0 20,18V5.5C20,3.57 18.43,2 16.5,2H7.5M7.5,4H16.5A1.5,1.5 0 0,1 18,5.5V18H6V5.5A1.5,1.5 0 0,1 7.5,4M13,6V10H17V6H13M13,11V15H17V11H13M7,11V15H11V11H7Z"/></svg>',
    math: '<svg viewBox="0 0 24 24"><path d="M19,13H5V11H19V13M19,10H5V8H19V10M19,16H5V14H19V16Z"/></svg>',
    code: '<svg viewBox="0 0 24 24"><path d="M8,18L2,12L8,6L9.41,7.41L4.83,12L9.41,16.59L8,18M16,18L14.59,16.59L19.17,12L14.59,7.41L16,6L22,12L16,18Z"/></svg>',
    globe: '<svg viewBox="0 0 24 24"><path d="M17.9,17.39C17.64,16.59 16.89,16 16,16H15V13A1,1 0 0,0 14,12H8V10H10A1,1 0 0,0 11,9V7H13A2,2 0 0,0 15,5V4.59C17.93,5.77 20,8.64 20,12C20,14.08 19.2,15.97 17.9,17.39M11,19.93C7.05,19.44 4,16.08 4,12C4,11.38 4.08,10.77 4.21,10.19L9,15V16A2,2 0 0,0 11,18V19.93M12,2C6.47,2 2,6.47 2,12A10,10 0 0,0 12,22A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z"/></svg>',
    music: '<svg viewBox="0 0 24 24"><path d="M12,3V13.55C11.41,13.21 10.73,13 10,13C7.79,13 6,14.79 6,17C6,19.21 7.79,21 10,21C12.21,21 14,19.21 14,17V7H18V3H12Z"/></svg>',
    sport: '<svg viewBox="0 0 24 24"><path d="M21,16.5C21,16.88 20.79,17.21 20.47,17.38L12.57,21.82C12.41,21.94 12.21,22 12,22C11.79,22 11.59,21.94 11.43,21.82L3.53,17.38C3.21,17.21 3,16.88 3,16.5V7.5C3,7.12 3.21,6.79 3.53,6.62L11.43,2.18C11.59,2.06 11.79,2 12,2C12.21,2 12.41,2.06 12.57,2.18L20.47,6.62C20.79,6.79 21,7.12 21,7.5V16.5Z"/></svg>'
};

function renderLibrary() {
    const placeholder = setGrid.querySelector('.placeholder');
    
    // Make placeholder functional
    placeholder.onclick = () => {
        window.location.href = 'create.html';
    };

    setGrid.innerHTML = '';
    setGrid.appendChild(placeholder);

    flashcardSets.forEach(set => {
        const setIcon = ICONS[set.icon] || '<svg viewBox="0 0 24 24"><path d="M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm16-4H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H8V4h12v12zM10 9h8v2h-8zm0 3h4v2h-4zm0-6h8v2h-8z"/></svg>';
        const setBg = set.iconColor || 'rgba(255, 215, 0, 0.1)';
        const setFg = set.iconColor ? 'white' : 'var(--primary-yellow)';

        const widget = document.createElement('div');
        widget.className = 'set-widget';
        widget.innerHTML = `
            <div class="set-icon" style="background: ${setBg}; color: ${setFg}">
                ${setIcon}
            </div>
            <h3>${set.title}</h3>
            <p>${set.description || 'No description'}</p>
            <div class="tags-container">
                <span class="tag">${set.cards.length} Cards</span>
                ${(set.tags || []).map(tag => `<span class="tag">${tag}</span>`).join('')}
            </div>
        `;
        widget.onclick = () => {
            window.location.href = `study.html?id=${set.id}`;
        };
        setGrid.insertBefore(widget, placeholder);
    });
}

// Theme Toggle Logic
const themeToggle = document.getElementById('themeToggle');
const sunIcon = themeToggle.querySelector('.sun-icon');
const moonIcon = themeToggle.querySelector('.moon-icon');

function setTheme(theme) {
    if (theme === 'light') {
        document.body.classList.add('light');
        document.body.classList.remove('dark');
        sunIcon.classList.add('hidden');
        moonIcon.classList.remove('hidden');
    } else {
        document.body.classList.add('dark');
        document.body.classList.remove('light');
        sunIcon.classList.remove('hidden');
        moonIcon.classList.add('hidden');
    }
}

themeToggle.onclick = () => {
    const isLight = document.body.classList.contains('light');
    const newTheme = isLight ? 'dark' : 'light';
    setTheme(newTheme);
    chrome.storage.local.set({ theme: newTheme });
};

// Initial load
chrome.storage.local.get(['theme'], (result) => {
    if (result.theme) {
        setTheme(result.theme);
    } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
        setTheme('light');
    }
    init();
});

chrome.storage.onChanged.addListener((changes, namespace) => {
    if (namespace === 'local' && changes.flashcardSets) {
        flashcardSets = changes.flashcardSets.newValue;
        renderLibrary();
    }
});
