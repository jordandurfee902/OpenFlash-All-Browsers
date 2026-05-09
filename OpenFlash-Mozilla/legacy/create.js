// Create Set Page Logic
console.log("openFlash: Create Page Initialized");

const cardRowsContainer = document.getElementById('cardRows');
const addRowBtn = document.getElementById('addRowBtn');
const saveSetBtn = document.getElementById('saveSetBtn');
const setTitleInput = document.getElementById('setTitle');
const setDescInput = document.getElementById('setDescription');

let isEditMode = false;
let editSetId = null;

// --- Tab Switching ---
const tabs = document.querySelectorAll('.tab-btn');
const contents = document.querySelectorAll('.tab-content');

tabs.forEach(tab => {
    tab.onclick = () => {
        tabs.forEach(t => t.classList.remove('active'));
        contents.forEach(c => c.classList.remove('active'));
        
        tab.classList.add('active');
        document.getElementById(`${tab.dataset.tab}Section`).classList.add('active');
    };
});

// --- Manual Entry Logic ---

function createRowHTML(index, data = null) {
    const row = document.createElement('div');
    row.className = 'card-row';
    row.innerHTML = `
        <span class="row-number">${index}</span>
        <div class="row-inputs">
            <div class="input-group">
                <input type="text" placeholder="Term" class="card-input term-input" value="${data ? (data.term || '') : ''}">
                <label>TERM</label>
            </div>
            <div class="input-group">
                <input type="text" placeholder="Definition" class="card-input def-input" value="${data ? (data.definition || '') : ''}">
                <label>DEFINITION</label>
            </div>
        </div>
        <div class="row-actions">
            <div class="image-upload-wrapper">
                <button class="image-btn" title="Add Image">
                    <svg viewBox="0 0 24 24"><path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/></svg>
                </button>
                <input type="file" class="row-image-input" hidden accept="image/*">
                <div class="image-preview hidden">
                    <img src="" alt="Preview" data-image-id="${data ? (data.imageId || '') : ''}">
                    <button class="remove-image">×</button>
                </div>
            </div>
            <button class="delete-row-btn" title="Delete Row">×</button>
        </div>
    `;
    setupRowEvents(row);

    // If data has an image, load it
    if (data && data.imageId) {
        openFlashDB.getImage(data.imageId).then(url => {
            if (url) {
                const img = row.querySelector('.image-preview img');
                img.src = url;
                row.querySelector('.image-preview').classList.remove('hidden');
            }
        });
    }

    return row;
}

function setupRowEvents(row) {
    const deleteBtn = row.querySelector('.delete-row-btn');
    const imageBtn = row.querySelector('.image-btn');
    const imageInput = row.querySelector('.row-image-input');
    const imagePreview = row.querySelector('.image-preview');
    const removeImageBtn = row.querySelector('.remove-image');
    const previewImg = imagePreview.querySelector('img');

    deleteBtn.onclick = () => {
        if (cardRowsContainer.children.length > 1) {
            row.remove();
            updateRowNumbers();
        } else {
            // Clear inputs if only one row left
            row.querySelectorAll('input').forEach(i => i.value = '');
            imagePreview.classList.add('hidden');
            previewImg.src = '';
            imageInput.value = '';
            previewImg.dataset.imageId = '';
        }
    };

    imageBtn.onclick = () => imageInput.click();

    imageInput.onchange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                previewImg.src = event.target.result;
                imagePreview.classList.remove('hidden');
                previewImg.dataset.imageId = ''; // Reset imageId as it's a new file
            };
            reader.readAsDataURL(file);
        }
    };

    removeImageBtn.onclick = () => {
        imageInput.value = '';
        previewImg.src = '';
        imagePreview.classList.add('hidden');
        previewImg.dataset.imageId = '';
    };
}

function updateRowNumbers() {
    const rows = cardRowsContainer.querySelectorAll('.card-row');
    rows.forEach((row, i) => {
        row.querySelector('.row-number').innerText = i + 1;
    });
}

addRowBtn.onclick = () => {
    const nextIndex = cardRowsContainer.children.length + 1;
    const newRow = createRowHTML(nextIndex);
    cardRowsContainer.appendChild(newRow);
};

// --- Save Logic ---

saveSetBtn.onclick = async () => {
    const title = setTitleInput.value.trim();
    if (!title) {
        alert("Please enter a title for your set.");
        setTitleInput.focus();
        return;
    }

    saveSetBtn.innerText = isEditMode ? "Updating..." : "Saving...";
    saveSetBtn.disabled = true;

    const rows = cardRowsContainer.querySelectorAll('.card-row');
    const cards = [];

    for (const row of rows) {
        const term = row.querySelector('.term-input').value.trim();
        const definition = row.querySelector('.def-input').value.trim();
        const imageInput = row.querySelector('.row-image-input');
        const previewImg = row.querySelector('.image-preview img');
        
        if (term || definition) {
            const card = {
                id: Date.now() + Math.random(),
                term: term,
                definition: definition
            };

            // Handle Image
            if (imageInput.files && imageInput.files[0]) {
                try {
                    const imageId = await openFlashDB.saveImage(imageInput.files[0]);
                    card.imageId = imageId;
                } catch (e) {
                    console.error("Failed to save image:", e);
                }
            } else if (previewImg.dataset.imageId) {
                // Keep existing image ID
                card.imageId = previewImg.dataset.imageId;
            }

            cards.push(card);
        }
    }

    if (cards.length === 0) {
        alert("Please add at least one card to your set.");
        saveSetBtn.innerText = isEditMode ? "Update Set" : "Save Set";
        saveSetBtn.disabled = false;
        return;
    }

    chrome.storage.local.get(['flashcardSets'], (result) => {
        let sets = result.flashcardSets || [];
        
        if (isEditMode) {
            const index = sets.findIndex(s => s.id == editSetId);
            if (index !== -1) {
                sets[index] = {
                    ...sets[index],
                    title: title,
                    description: setDescInput.value.trim(),
                    cards: cards
                };
            }
        } else {
            const newSet = {
                id: "manual-" + Date.now(),
                title: title,
                description: setDescInput.value.trim(),
                cards: cards,
                tags: ["Manual"]
            };
            sets.unshift(newSet);
        }

        chrome.storage.local.set({ flashcardSets: sets }, () => {
            location.href = isEditMode ? `study.html?id=${editSetId}` : 'index.html';
        });
    });
};

// --- Import Section Logic ---
const dropZone = document.getElementById('dropZone');
const fileInput = document.getElementById('fileInput');

dropZone.onclick = () => fileInput.click();

dropZone.ondragover = (e) => {
    e.preventDefault();
    dropZone.classList.add('hover');
};

dropZone.ondragleave = () => {
    dropZone.classList.remove('hover');
};

dropZone.ondrop = (e) => {
    e.preventDefault();
    dropZone.classList.remove('hover');
    const file = e.dataTransfer.files[0];
    if (file) handleFileImport(file);
};

fileInput.onchange = (e) => {
    const file = e.target.files[0];
    if (file) handleFileImport(file);
};

async function handleFileImport(file) {
    const reader = new FileReader();
    const extension = file.name.split('.').pop().toLowerCase();
    
    if (!setTitleInput.value.trim()) {
        setTitleInput.value = file.name.replace(/\.[^/.]+$/, "");
    }

    reader.onload = async (e) => {
        const text = e.target.result;
        let cards = [];

        try {
            if (extension === 'json') {
                const data = JSON.parse(text);
                cards = Array.isArray(data) ? data : (data.cards || []);
            } else {
                const lines = text.split(/\r?\n/);
                lines.forEach(line => {
                    if (!line.trim()) return;
                    let parts = line.split(/[,\t;]/);
                    if (parts.length >= 2) {
                        cards.push({
                            term: parts[0].trim(),
                            definition: parts.slice(1).join(',').trim()
                        });
                    }
                });
            }

            if (cards.length > 0) {
                const processedCards = [];
                for (const c of cards) {
                    const card = {
                        id: Date.now() + Math.random(),
                        term: c.term || c.word || "No Term",
                        definition: c.definition || c.def || c.meaning || ""
                    };

                    const imgUrl = c.image || c.imageUrl;
                    if (imgUrl && typeof imgUrl === 'string' && imgUrl.startsWith('http')) {
                        try {
                            const response = await fetch(imgUrl);
                            const blob = await response.blob();
                            const imageId = await openFlashDB.saveImage(blob);
                            card.imageId = imageId;
                        } catch (e) {
                            console.warn(`Failed to fetch image for card: ${card.term}`, e);
                        }
                    }
                    processedCards.push(card);
                }

                const newSet = {
                    id: "import-" + Date.now(),
                    title: setTitleInput.value.trim() || "Imported Set",
                    description: setDescInput.value.trim() || `Imported from ${file.name}`,
                    cards: processedCards,
                    tags: ["Imported"]
                };

                saveImportedSet(newSet);
            } else {
                alert("No valid flashcards found in this file.");
            }
        } catch (err) {
            console.error("Import failed:", err);
            alert("Error parsing file. Please check the format.");
        }
    };
    reader.readAsText(file);
}

function saveImportedSet(newSet) {
    chrome.storage.local.get(['flashcardSets'], (result) => {
        const sets = result.flashcardSets || [];
        sets.unshift(newSet);
        chrome.storage.local.set({ flashcardSets: sets }, () => {
            location.href = 'index.html';
        });
    });
}

// --- Initial setup ---
async function init() {
    const params = new URLSearchParams(window.location.search);
    const editId = params.get('edit');

    if (editId) {
        isEditMode = true;
        editSetId = editId;
        saveSetBtn.innerText = "Update Set";
        
        chrome.storage.local.get(['flashcardSets'], async (result) => {
            const sets = result.flashcardSets || [];
            const setToEdit = sets.find(s => s.id == editId);
            
            if (setToEdit) {
                setTitleInput.value = setToEdit.title;
                setDescInput.value = setToEdit.description || '';
                
                // Clear initial empty row
                cardRowsContainer.innerHTML = '';
                
                // Render existing cards
                setToEdit.cards.forEach((card, index) => {
                    const row = createRowHTML(index + 1, card);
                    cardRowsContainer.appendChild(row);
                });
            }
        });
    } else {
        // Initialize first empty row if not editing
        setupRowEvents(cardRowsContainer.querySelector('.card-row'));
    }

    chrome.storage.local.get(['theme'], (result) => {
        if (result.theme) {
            setTheme(result.theme);
        } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
            setTheme('light');
        }
    });
}

function setTheme(theme) {
    const themeToggle = document.getElementById('themeToggle');
    const sunIcon = themeToggle.querySelector('.sun-icon');
    const moonIcon = themeToggle.querySelector('.moon-icon');

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

document.getElementById('themeToggle').onclick = () => {
    const isLight = document.body.classList.contains('light');
    const newTheme = isLight ? 'dark' : 'light';
    setTheme(newTheme);
    chrome.storage.local.set({ theme: newTheme });
};

document.querySelector('[title="Library"]').onclick = () => {
    location.href = 'index.html';
};

init();
