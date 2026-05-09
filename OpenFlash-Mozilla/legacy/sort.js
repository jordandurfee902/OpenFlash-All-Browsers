let currentSet = null;
let currentIndex = 0;
let studyCards = [];
let swapMode = false;

let sortSettings = {
    keybinds: {
        correct: "ArrowRight",
        incorrect: "ArrowLeft",
        somewhat: "ArrowDown",
        flip: "ArrowUp"
    },
    aggression: "normal",
    masteryThreshold: 3
};

const termDisplay = document.getElementById('termDisplay');
const definitionDisplay = document.getElementById('definitionDisplay');
const progressText = document.getElementById('progressText');
const currentCard = document.getElementById('currentCard');

// Dashboard Elements
const studyTitleMain = document.getElementById('studyTitleMain');
const studyDescription = document.getElementById('studyDescription');
const tagContainer = document.getElementById('tagContainer');

// --- Appearance Logic ---
const ICONS = {
    brain: '<svg viewBox="0 0 24 24"><path d="M12,3C7.58,3 4,4.79 4,7C4,9.21 7.58,11 12,11C16.42,11 20,9.21 20,7C20,4.79 16.42,3 12,3M4,9V12C4,14.21 7.58,16 12,16C16.42,16 20,14.21 20,12V9C20,11.21 16.42,13 12,13C7.58,13 4,11.21 4,9M4,14V17C4,19.21 7.58,21 12,21C16.42,21 20,19.21 20,17V14C20,16.21 16.42,18 12,18C7.58,18 4,16.21 4,14Z"/></svg>',
    book: '<svg viewBox="0 0 24 24"><path d="M18,22A2,2 0 0,0 20,20V4C20,2.89 19.1,2 18,2H12V9L9.5,7.5L7,9V2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18Z"/></svg>',
    science: '<svg viewBox="0 0 24 24"><path d="M7.5,2C5.57,2 4,3.57 4,5.5V18A2,2 0 0,0 6,20H18A2,2 0 0,0 20,18V5.5C20,3.57 18.43,2 16.5,2H7.5M7.5,4H16.5A1.5,1.5 0 0,1 18,5.5V18H6V5.5A1.5,1.5 0 0,1 7.5,4M13,6V10H17V6H13M13,11V15H17V11H13M7,11V15H11V11H7Z"/></svg>',
    math: '<svg viewBox="0 0 24 24"><path d="M19,13H5V11H19V13M19,10H5V8H19V10M19,16H5V14H19V16Z"/></svg>',
    code: '<svg viewBox="0 0 24 24"><path d="M8,18L2,12L8,6L9.41,7.41L4.83,12L9.41,16.59L8,18M16,18L14.59,16.59L19.17,12L14.59,7.41L16,6L22,12L16,18Z"/></svg>',
    globe: '<svg viewBox="0 0 24 24"><path d="M17.9,17.39C17.64,16.59 16.89,16 16,16H15V13A1,1 0 0,0 14,12H8V10H10A1,1 0 0,0 11,9V7H13A2,2 0 0,0 15,5V4.59C17.93,5.77 20,8.64 20,12C20,14.08 19.2,15.97 17.9,17.39M11,19.93C7.05,19.44 4,16.08 4,12C4,11.38 4.08,10.77 4.21,10.19L9,15V16A2,2 0 0,0 11,18V19.93M12,2C6.47,2 2,6.47 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z"/></svg>',
    music: '<svg viewBox="0 0 24 24"><path d="M12,3V13.55C11.41,13.21 10.73,13 10,13C7.79,13 6,14.79 6,17C6,19.21 7.79,21 10,21C12.21,21 14,19.21 14,17V7H18V3H12Z"/></svg>',
    sport: '<svg viewBox="0 0 24 24"><path d="M21,16.5C21,16.88 20.79,17.21 20.47,17.38L12.57,21.82C12.41,21.94 12.21,22 12,22C11.79,22 11.59,21.94 11.43,21.82L3.53,17.38C3.21,17.21 3,16.88 3,16.5V7.5C3,7.12 3.21,6.79 3.53,6.62L11.43,2.18C11.59,2.06 11.79,2 12,2C12.21,2 12.41,2.06 12.57,2.18L20.47,6.62C20.79,6.79 21,7.12 21,7.5V16.5Z"/></svg>'
};

function renderAppearancePickers() {
    const iconPicker = document.getElementById('iconPicker');
    iconPicker.innerHTML = '';

    Object.keys(ICONS).forEach(key => {
        const opt = document.createElement('div');
        opt.className = `icon-option ${currentSet.icon === key ? 'active' : ''}`;
        opt.innerHTML = ICONS[key];
        opt.onclick = () => {
            currentSet.icon = key;
            document.querySelectorAll('.icon-option').forEach(o => o.classList.remove('active'));
            opt.classList.add('active');
            updateSetInStorage();
        };
        iconPicker.appendChild(opt);
    });

    const colorSwatches = document.querySelectorAll('.color-swatch');
    colorSwatches.forEach(swatch => {
        const color = swatch.dataset.color;
        if (currentSet.iconColor === color) swatch.classList.add('active');
        
        swatch.onclick = () => {
            currentSet.iconColor = color;
            colorSwatches.forEach(s => s.classList.remove('active'));
            swatch.classList.add('active');
            updateSetInStorage();
        };
    });
}

function init() {
    const params = new URLSearchParams(window.location.search);
    const setId = params.get('id');

    if (!setId) {
        location.href = 'index.html';
        return;
    }

    chrome.storage.local.get(['flashcardSets', 'sortSettings', 'sortSessionStates'], async (result) => {
        const sets = result.flashcardSets || [];
        currentSet = sets.find(s => s.id == setId);

        if (!currentSet) {
            location.href = 'index.html';
            return;
        }

        if (result.sortSettings) {
            sortSettings = result.sortSettings;
        }

        const sessionStates = result.sortSessionStates || {};
        const savedState = sessionStates[setId];

        const modalResult = await openFlashModal.showSortSettings(sortSettings, !!savedState);
        
        if (!modalResult) {
            location.href = `study.html?id=${setId}`;
            return;
        }

        sortSettings = modalResult.settings;
        const action = modalResult.action;
        chrome.storage.local.set({ sortSettings: sortSettings });

        if (savedState && action === 'continue') {
            studyCards = savedState.cards;
            currentIndex = savedState.currentIndex || 0;
            swapMode = savedState.swapMode || false;
            
            const btn = document.getElementById('swapBtn');
            if (btn) btn.style.transform = swapMode ? 'rotate(180deg)' : 'rotate(0deg)';
        } else {
            studyCards = [...currentSet.cards];
            shuffleCards(); // New or restarted session
            currentIndex = 0;
        }
        
        // Update Dashboard UI
        studyTitleMain.innerText = currentSet.title;
        studyDescription.innerText = currentSet.description || "No description provided.";
        renderTags();
        renderAppearancePickers();
        
        updateStudyUI();
    });
}

async function updateStudyUI() {
    if (studyCards.length === 0) {
        document.getElementById('emptyState').classList.remove('hidden');
        document.getElementById('cardContainer').classList.add('hidden');
        progressText.innerText = "0 / 0";
        return;
    }

    document.getElementById('emptyState').classList.add('hidden');
    document.getElementById('cardContainer').classList.remove('hidden');

    const card = studyCards[currentIndex];
    termDisplay.innerText = card.term;
    definitionDisplay.innerText = card.definition || "No definition provided.";
    
    const imageContainer = document.getElementById('imageContainer');
    const cardImage = document.getElementById('cardImage');
    
    console.log(`openFlash: Rendering card ${currentIndex + 1}. ImageID: ${card.imageId || 'None'}`);

    if (card.imageId) {
        try {
            const objectUrl = await openFlashDB.getImage(card.imageId);
            if (objectUrl) {
                console.log(`openFlash: Image found in DB. Setting src to: ${objectUrl.substring(0, 30)}...`);
                cardImage.src = objectUrl;
                imageContainer.classList.remove('hidden');
            } else {
                console.warn(`openFlash: ImageID ${card.imageId} exists but was NOT found in IndexedDB.`);
                imageContainer.classList.add('hidden');
            }
        } catch (err) {
            console.error("openFlash: Error fetching image from DB:", err);
            imageContainer.classList.add('hidden');
        }
    } else if (card.imageUrl) {
        console.log(`openFlash: Using legacy web URL: ${card.imageUrl}`);
        cardImage.src = card.imageUrl;
        imageContainer.classList.remove('hidden');
    } else {
        imageContainer.classList.add('hidden');
    }

    if (swapMode) {
        currentCard.classList.add('flipped');
    } else {
        currentCard.classList.remove('flipped');
    }

    updateMasteryCounter();
    saveSessionState();
}

function updateMasteryCounter() {
    const masteredCount = studyCards.filter(c => (c.mastery || 0) >= sortSettings.masteryThreshold).length;
    document.getElementById('masteryCount').innerText = `${masteredCount} / ${studyCards.length}`;
    return masteredCount;
}

function saveSessionState() {
    const setId = new URLSearchParams(window.location.search).get('id');
    if (!setId) return;

    chrome.storage.local.get(['sortSessionStates'], (result) => {
        const states = result.sortSessionStates || {};
        states[setId] = {
            cards: studyCards,
            currentIndex: currentIndex,
            swapMode: swapMode
        };
        chrome.storage.local.set({ sortSessionStates: states });
    });
}

// --- Management Logic ---

function renderTags() {
    tagContainer.innerHTML = '';
    const tags = currentSet.tags || [];
    tags.forEach(tag => {
        const pill = document.createElement('div');
        pill.className = 'tag-pill';
        pill.innerHTML = `
            ${tag}
            <span class="remove-tag" data-tag="${tag}">×</span>
        `;
        pill.onclick = () => removeTag(tag);
        tagContainer.appendChild(pill);
    });
}

async function removeTag(tagName) {
    currentSet.tags = currentSet.tags.filter(t => t !== tagName);
    await updateSetInStorage();
    renderTags();
}

document.getElementById('editBtn').onclick = () => {
    location.href = `create.html?edit=${currentSet.id}`;
};

document.getElementById('addTagBtn').onclick = async () => {
    const newTag = await openFlashModal.prompt("Add New Tag", "Enter a name for your tag:");
    if (newTag && newTag.trim()) {
        if (!currentSet.tags) currentSet.tags = [];
        if (!currentSet.tags.includes(newTag.trim())) {
            currentSet.tags.push(newTag.trim());
            await updateSetInStorage();
            renderTags();
        }
    }
};

document.getElementById('renameBtn').onclick = async () => {
    const newTitle = await openFlashModal.prompt("Rename Set", "Enter a new title for this deck:", currentSet.title);
    if (newTitle && newTitle.trim()) {
        currentSet.title = newTitle.trim();
        studyTitleMain.innerText = currentSet.title;
        await updateSetInStorage();
    }
};

document.getElementById('deleteBtn').onclick = async () => {
    const confirmed = await openFlashModal.confirm(
        "Delete Set?", 
        `Are you sure you want to delete "${currentSet.title}"? This will permanently remove all cards and images.`,
        true // isDanger
    );
    
    if (confirmed) {
        // 1. Cleanup images from IndexedDB
        for (const card of currentSet.cards) {
            if (card.imageId) {
                await openFlashDB.deleteImage(card.imageId);
            }
        }
        
        // 2. Remove from Storage
        chrome.storage.local.get(['flashcardSets'], (result) => {
            let sets = result.flashcardSets || [];
            sets = sets.filter(s => s.id != currentSet.id);
            chrome.storage.local.set({ flashcardSets: sets }, () => {
                location.href = 'index.html';
            });
        });
    }
};

async function updateSetInStorage() {
    return new Promise((resolve) => {
        chrome.storage.local.get(['flashcardSets'], (result) => {
            const sets = result.flashcardSets || [];
            const index = sets.findIndex(s => s.id == currentSet.id);
            if (index !== -1) {
                sets[index] = currentSet;
                chrome.storage.local.set({ flashcardSets: sets }, resolve);
            }
        });
    });
}

// --- Controls ---
function shuffleCards() {
    for (let i = studyCards.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [studyCards[i], studyCards[j]] = [studyCards[j], studyCards[i]];
    }
    currentIndex = 0;
    updateStudyUI();
    
    const btn = document.getElementById('shuffleBtn');
    if (btn) {
        btn.style.transform = 'rotate(360deg)';
        setTimeout(() => btn.style.transform = '', 500);
    }
}

document.getElementById('settingsBtn').onclick = async (e) => {
    e.stopPropagation();
    const modalResult = await openFlashModal.showSortSettings(sortSettings, true);
    if (modalResult) {
        sortSettings = modalResult.settings;
        chrome.storage.local.set({ sortSettings: sortSettings });
        
        if (modalResult.action === 'restart') {
            studyCards.forEach(c => c.mastery = 0);
            currentIndex = 0;
            shuffleCards();
            saveSessionState();
            updateStudyUI();
        }
    }
};

document.getElementById('incorrectBtn').onclick = (e) => {
    e.stopPropagation();
    handleEvaluation('incorrect');
};

document.getElementById('somewhatBtn').onclick = (e) => {
    e.stopPropagation();
    handleEvaluation('somewhat');
};

document.getElementById('correctBtn').onclick = (e) => {
    e.stopPropagation();
    handleEvaluation('correct');
};

document.getElementById('swapBtn').onclick = (e) => {
    e.stopPropagation();
    swapMode = !swapMode;
    updateStudyUI();
    const btn = document.getElementById('swapBtn');
    btn.style.transform = swapMode ? 'rotate(180deg)' : 'rotate(0deg)';
};

currentCard.onclick = () => {
    currentCard.classList.toggle('flipped');
};

const studyModeBtn = document.getElementById('studyModeBtn');
if (studyModeBtn) {
    studyModeBtn.onclick = () => {
        const urlParams = new URLSearchParams(window.location.search);
        location.href = `study.html?id=${urlParams.get('id')}`;
    };
}

const typeModeBtn = document.getElementById('typeModeBtn');
if (typeModeBtn) {
    typeModeBtn.onclick = () => {
        const urlParams = new URLSearchParams(window.location.search);
        location.href = `type.html?id=${urlParams.get('id')}`;
    };
}

// Keyboard Shortcuts
window.addEventListener('keydown', (e) => {
    if (studyCards.length === 0) return;
    
    // Prevent double triggers if modal is open
    if (document.getElementById('openflash-modal-overlay')?.classList.contains('active')) return;

    const binds = sortSettings.keybinds;

    if (e.code === binds.correct) {
        triggerVisualFeedback('correct');
        handleEvaluation('correct');
        e.preventDefault();
    } else if (e.code === binds.incorrect) {
        triggerVisualFeedback('incorrect');
        handleEvaluation('incorrect');
        e.preventDefault();
    } else if (e.code === binds.somewhat) {
        triggerVisualFeedback('somewhat');
        handleEvaluation('somewhat');
        e.preventDefault();
    } else if (e.code === binds.flip) {
        currentCard.classList.toggle('flipped');
        e.preventDefault();
    }
});

function handleEvaluation(result) {
    const card = studyCards[currentIndex];
    if (card.mastery === undefined) card.mastery = 0;

    let moved = false;

    if (result === 'correct') {
        card.mastery++;
    } else if (result === 'incorrect') {
        card.mastery = Math.max(0, card.mastery - 1);
        
        // Aggression-based rescheduling with ±1 random jitter
        const randomJitter = Math.floor(Math.random() * 3) - 1; // -1, 0, or 1
        const baseOffset = sortSettings.aggression === 'aggressive' ? 2 : (sortSettings.aggression === 'normal' ? 5 : 10);
        const offset = Math.max(1, baseOffset + randomJitter);
        
        const newPos = Math.min(studyCards.length - 1, currentIndex + offset);
        
        studyCards.splice(currentIndex, 1);
        studyCards.splice(newPos, 0, card);
        moved = true;
    } else if (result === 'somewhat') {
        // Aggression-based rescheduling for "Somewhat" with ±1 random jitter
        const randomJitter = Math.floor(Math.random() * 3) - 1; // -1, 0, or 1
        const baseOffset = sortSettings.aggression === 'aggressive' ? 3 : (sortSettings.aggression === 'normal' ? 6 : 12);
        const offset = Math.max(2, baseOffset + randomJitter);
        
        const newPos = Math.min(studyCards.length - 1, currentIndex + offset);
        
        studyCards.splice(currentIndex, 1);
        studyCards.splice(newPos, 0, card);
        moved = true;
    }

    if (card.mastery >= sortSettings.masteryThreshold) {
        showFeedback('Mastered!', 'success');
        const masteredCount = updateMasteryCounter();
        if (masteredCount === studyCards.length) {
            handleCompletion();
            return;
        }
    }

    if (!moved) {
        if (currentIndex < studyCards.length - 1) {
            currentIndex++;
        } else {
            currentIndex = 0;
            shuffleCards();
        }
    }
    
    updateStudyUI();
}

async function handleCompletion() {
    const restart = await openFlashModal.confirm(
        "Deck Mastered! 🎉",
        "Congratulations! You've mastered every card in this set. Ready for another round or back to the library?",
        false,
        "Restart Session",
        "Back to Library"
    );

    if (restart) {
        studyCards.forEach(c => c.mastery = 0);
        currentIndex = 0;
        shuffleCards();
        saveSessionState();
        updateStudyUI();
    } else {
        location.href = 'index.html';
    }
}

function triggerVisualFeedback(result) {
    const typeMap = {
        'correct': { btn: 'correctBtn', active: 'active-success', eval: 'eval-success' },
        'incorrect': { btn: 'incorrectBtn', active: 'active-danger', eval: 'eval-danger' },
        'somewhat': { btn: 'somewhatBtn', active: 'active-info', eval: 'eval-info' }
    };
    
    const config = typeMap[result];
    if (!config) return;

    const btn = document.getElementById(config.btn);
    const card = document.getElementById('currentCard');
    
    if (btn) btn.classList.add(config.active);
    if (card) card.classList.add(config.eval);
    
    setTimeout(() => {
        if (btn) btn.classList.remove(config.active);
        if (card) card.classList.remove(config.eval);
    }, 200);
}

function showFeedback(text, type) {
    // Remove existing feedback if any
    const existing = document.querySelector('.evaluation-feedback');
    if (existing) existing.remove();

    const feedback = document.createElement('div');
    feedback.className = `evaluation-feedback ${type}`;
    feedback.innerText = text;
    document.body.appendChild(feedback);
    
    setTimeout(() => feedback.classList.add('show'), 10);
    setTimeout(() => {
        feedback.classList.remove('show');
        setTimeout(() => feedback.remove(), 300);
    }, 1000);
}

// Theme Logic
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

chrome.storage.local.get(['theme'], (result) => {
    if (result.theme) {
        setTheme(result.theme);
    } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
        setTheme('light');
    }
    init();
});
