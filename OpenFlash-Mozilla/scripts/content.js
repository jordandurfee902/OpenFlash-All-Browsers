console.log(`OpenFlash: Content script successfully injected into ${window.location.hostname}`);

// Detection Logic
function checkForFlashcards() {
    const isQuizlet = window.location.hostname.includes('quizlet.com');
    const isKnowt = window.location.hostname.includes('knowt.com');

    if (isQuizlet) {
        const termsList = document.querySelector('section[data-testid="terms-list"]');
        const termDivs = document.querySelectorAll('div[aria-label="Term"]');
        if (termsList || termDivs.length > 0) {
            initSmartBanner();
            return true;
        }
    } else if (isKnowt) {
        const proseElements = document.querySelectorAll('.ProseMirror');
        if (proseElements.length > 0) {
            initSmartBanner();
            return true;
        }
    }
    return false;
}

// Watch for dynamic content changes
const observer = new MutationObserver(() => {
    if (checkForFlashcards()) {
        observer.disconnect(); // Stop watching once found
    }
});

observer.observe(document.body, { childList: true, subtree: true });

// Fallback: Check every 2 seconds for 10 seconds
let checks = 0;
const interval = setInterval(() => {
    checks++;
    if (checkForFlashcards() || checks > 5) {
        clearInterval(interval);
    }
}, 2000);

async function initSmartBanner() {
    // Prevent multiple banners
    if (document.querySelector('.openflash-banner')) return;

    const title = document.querySelector('h1')?.innerText || "this set";
    
    const storage = await chrome.storage.local.get(['flashcardSets', 'dismissedBanners']);
    const sets = storage.flashcardSets || [];
    const dismissed = storage.dismissedBanners || [];
    
    const isAlreadyAdded = sets.some(s => s.title === title);
    if (isAlreadyAdded || dismissed.includes(title)) return;

    createBanner(title);
}

function createBanner(setName) {
    const banner = document.createElement('div');
    banner.className = 'openflash-banner';
    banner.innerHTML = `
        <div class="openflash-banner-left">
            <svg class="openflash-logo" viewBox="0 0 24 24">
                <path d="M13 10V3L4 14H11V21L20 10H13Z" fill="#FFD700" />
            </svg>
            <span class="openflash-banner-text">Found flashcards! Add "${setName}" to your OpenFlash library?</span>
        </div>
        <div class="openflash-banner-right">
            <button id="openflash-dismiss" class="openflash-btn-dismiss">Maybe later</button>
            <button id="openflash-add" class="openflash-btn-add">Add to Library</button>
        </div>
    `;

    document.body.prepend(banner);
    setTimeout(() => banner.classList.add('show'), 100);

    document.getElementById('openflash-dismiss').onclick = () => {
        banner.classList.remove('show');
        setTimeout(() => banner.remove(), 500);
        chrome.storage.local.get(['dismissedBanners'], (result) => {
            const list = result.dismissedBanners || [];
            list.push(setName);
            chrome.storage.local.set({ dismissedBanners: list });
        });
    };

    document.getElementById('openflash-add').onclick = async () => {
        const btn = document.getElementById('openflash-add');
        btn.innerText = "Extracting...";
        btn.disabled = true;

        try {
            const isKnowt = window.location.hostname.includes('knowt.com');
            const result = isKnowt ? await extractKnowtData() : await extractQuizletData();
            if (result.success) {
                await saveSetToLibrary(result.newSet);
                
                const rightArea = banner.querySelector('.openflash-banner-right');
                rightArea.innerHTML = `
                    <div class="openflash-success">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
                        </svg>
                        Saved!
                    </div>
                `;
                
                setTimeout(() => {
                    banner.classList.remove('show');
                    setTimeout(() => banner.remove(), 500);
                }, 3000);
            }
        } catch (err) {
            console.error("openFlash: Extraction failed:", err);
            btn.innerText = "Error!";
            setTimeout(() => {
                btn.innerText = "Add to Library";
                btn.disabled = false;
            }, 2000);
        }
    };
}

async function saveSetToLibrary(newSet) {
    console.log("openFlash: Starting saveSetToLibrary for set:", newSet.title);
    const result = await chrome.storage.local.get(['flashcardSets']);
    const sets = result.flashcardSets || [];
    
    // Process cards to move images to DB via background script (bypasses CORS)
    let imagesProcessed = 0;
    let imagesFailed = 0;

    for (let i = 0; i < newSet.cards.length; i++) {
        let card = newSet.cards[i];
        if (card.tempImgUrl) {
            console.log(`openFlash: [Card ${i+1}] Found tempImgUrl, sending to background:`, card.tempImgUrl);
            try {
                const response = await chrome.runtime.sendMessage({
                    action: "save_image_url",
                    url: card.tempImgUrl
                });

                if (response && response.success) {
                    console.log(`openFlash: [Card ${i+1}] Successfully saved image. ID:`, response.imageId);
                    card.imageId = response.imageId;
                    imagesProcessed++;
                } else {
                    console.error(`openFlash: [Card ${i+1}] Background failed to save image:`, response?.error || "Unknown error");
                    imagesFailed++;
                }
                delete card.tempImgUrl;
            } catch (e) {
                console.error(`openFlash: [Card ${i+1}] Background communication FAILED:`, e);
                imagesFailed++;
            }
        }
    }

    console.log(`openFlash: Image processing complete. Success: ${imagesProcessed}, Failed: ${imagesFailed}`);
    sets.unshift(newSet);
    await chrome.storage.local.set({ flashcardSets: sets });
    console.log("openFlash: Set successfully saved to local library.");
}

async function extractQuizletData() {
    console.log("openFlash: Starting Quizlet extraction...");
    const title = document.querySelector('h1')?.innerText || "Untitled Quizlet Set";
    const termDivs = document.querySelectorAll('div[aria-label="Term"]');
    console.log(`openFlash: Found ${termDivs.length} term containers.`);
    const cards = [];

    for (let i = 0; i < termDivs.length; i++) {
        const div = termDivs[i];
        const spans = div.querySelectorAll('span.TermText');
        const img = div.querySelector('img');
        
        const imgSrc = img ? (img.src || img.dataset.src) : null;
        
        if (spans.length >= 1 && (spans.length >= 2 || imgSrc)) {
            const card = {
                id: Date.now() + Math.random() + i,
                term: spans[0].innerText.trim(),
                definition: spans.length >= 2 ? spans[1].innerText.trim() : ""
            };
            
            if (imgSrc) {
                console.log(`openFlash: [Card ${i+1}] Found image in DOM:`, imgSrc);
                // Store URL to be fetched by background
                card.tempImgUrl = imgSrc;
            }
            cards.push(card);
        }
    }

    console.log(`openFlash: Extraction complete. Found ${cards.length} valid cards.`);
    if (cards.length === 0) throw new Error("No cards found.");

    const newSet = {
        id: "quizlet-" + Date.now(),
        title: title,
        description: `Extracted from Quizlet on ${new Date().toLocaleDateString()}`,
        cards: cards,
        tags: ["Quizlet"]
    };

    return { success: true, count: cards.length, newSet: newSet };
}

async function extractKnowtData() {
    const title = document.querySelector('h1')?.innerText || "Untitled Knowt Set";
    const proseElements = document.querySelectorAll('.ProseMirror');
    const cards = [];

    // Knowt uses .ProseMirror for both term and definition in sequence
    // Indices 0, 2, 4... are terms; 1, 3, 5... are definitions
    for (let i = 0; i < proseElements.length; i += 2) {
        const termEl = proseElements[i];
        const defEl = proseElements[i + 1];

        if (termEl && defEl) {
            const card = {
                id: Date.now() + Math.random() + i,
                term: termEl.innerText.trim(),
                definition: defEl.innerText.trim()
            };

            // Image check: More aggressive search walking up the DOM tree
            const findImageInContext = (el) => {
                let current = el;
                // Walk up up to 4 levels to find a container that might hold the image
                for (let level = 0; level < 4; level++) {
                    if (!current) break;
                    const img = current.querySelector('img');
                    if (img) return img;
                    current = current.parentElement;
                }
                return null;
            };

            const img = findImageInContext(defEl) || findImageInContext(termEl);
            const imgSrc = img ? (img.src || img.dataset.src || img.getAttribute('data-src')) : null;

            if (imgSrc) {
                console.log(`openFlash: [Knowt] Found image source for card ${Math.floor(i/2) + 1}:`, imgSrc);
                card.tempImgUrl = imgSrc;
            } else {
                console.log(`openFlash: [Knowt] No image found for card ${Math.floor(i/2) + 1}`);
            }
            cards.push(card);
        }
    }

    if (cards.length === 0) throw new Error("No cards found on Knowt.");

    const newSet = {
        id: "knowt-" + Date.now(),
        title: title,
        description: `Extracted from Knowt on ${new Date().toLocaleDateString()}`,
        cards: cards,
        tags: ["Knowt"]
    };

    return { success: true, count: cards.length, newSet: newSet };
}

// Start detection immediately
checkForFlashcards();
