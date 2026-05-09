document.getElementById('extractBtn').addEventListener('click', () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const activeTab = tabs[0];
        if (activeTab.url.includes("quizlet.com")) {
            chrome.tabs.sendMessage(activeTab.id, { action: "extract_quizlet" }, async (response) => {
                const status = document.getElementById('status');
                
                if (chrome.runtime.lastError) {
                    status.innerText = "Please refresh the Quizlet page!";
                    status.style.color = "red";
                    setTimeout(() => { status.style.color = "#4CAF50"; }, 3000);
                    return;
                }

                if (response && response.success) {
                    const newSet = response.newSet;
                    
                    // Process images into Extension's IndexedDB
                    for (let card of newSet.cards) {
                        if (card.imageData) {
                            try {
                                const res = await fetch(card.imageData);
                                const blob = await res.blob();
                                const imageId = `img-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
                                await openFlashDB.saveImage(imageId, blob);
                                card.imageId = imageId;
                                delete card.imageData; // Clean up large base64
                            } catch (e) {
                                console.error("Failed to save image to Extension DB:", e);
                            }
                        }
                    }

                    // Save to extension storage
                    chrome.storage.local.get(['flashcardSets'], (result) => {
                        const sets = result.flashcardSets || [];
                        sets.push(newSet);
                        chrome.storage.local.set({ flashcardSets: sets }, () => {
                            status.innerText = `Extracted ${response.count} cards!`;
                            setTimeout(() => { status.innerText = ""; }, 3000);
                        });
                    });
                } else {
                    status.innerText = "Extraction failed!";
                    status.style.color = "red";
                    setTimeout(() => { status.innerText = ""; status.style.color = "#4CAF50"; }, 3000);
                }
            });
        } else {
            const status = document.getElementById('status');
            status.innerText = "Only works on Quizlet.com";
            status.style.color = "red";
            setTimeout(() => { status.innerText = ""; status.style.color = "#4CAF50"; }, 3000);
        }
    });
});

document.getElementById('fullscreenBtn').addEventListener('click', () => {
    // This is the key part for offline fullscreen access
    const url = chrome.runtime.getURL("index.html");
    chrome.tabs.create({ url: url });
});

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
    } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        setTheme('dark');
    }
});
