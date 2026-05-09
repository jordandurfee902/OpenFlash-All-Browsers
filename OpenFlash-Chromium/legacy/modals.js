/**
 * Custom Modal System for openFlash
 * Replaces native prompt() and confirm()
 */

const Modal = {
    init() {
        if (document.getElementById('openflash-modal-overlay')) return;

        const overlay = document.createElement('div');
        overlay.id = 'openflash-modal-overlay';
        overlay.className = 'modal-overlay';
        overlay.innerHTML = `
            <div class="modal-container">
                <h2 class="modal-title" id="modal-title">Title</h2>
                <p class="modal-message" id="modal-message">Message</p>
                <input type="text" id="modal-input" class="modal-input hidden">
                <div class="modal-actions">
                    <button id="modal-cancel" class="modal-btn modal-btn-cancel">Cancel</button>
                    <button id="modal-confirm" class="modal-btn modal-btn-confirm">Confirm</button>
                </div>
            </div>
        `;
        document.body.appendChild(overlay);
    },

    async confirm(title, message, isDanger = false, confirmLabel = "Confirm", cancelLabel = "Cancel") {
        this.init();
        const overlay = document.getElementById('openflash-modal-overlay');
        const titleEl = document.getElementById('modal-title');
        const messageEl = document.getElementById('modal-message');
        const inputEl = document.getElementById('modal-input');
        const cancelBtn = document.getElementById('modal-cancel');
        const confirmBtn = document.getElementById('modal-confirm');

        titleEl.innerText = title;
        messageEl.innerText = message;
        inputEl.classList.add('hidden');

        confirmBtn.className = isDanger ? 'modal-btn modal-btn-danger' : 'modal-btn modal-btn-confirm';
        confirmBtn.innerText = confirmLabel;
        cancelBtn.innerText = cancelLabel;

        return new Promise((resolve) => {
            overlay.classList.add('active');

            confirmBtn.onclick = () => {
                overlay.classList.remove('active');
                resolve(true);
            };

            cancelBtn.onclick = () => {
                overlay.classList.remove('active');
                resolve(false);
            };

            overlay.onclick = (e) => {
                if (e.target === overlay) {
                    overlay.classList.remove('active');
                    resolve(false);
                }
            };
        });
    },

    async prompt(title, message, defaultValue = "") {
        this.init();
        const overlay = document.getElementById('openflash-modal-overlay');
        const titleEl = document.getElementById('modal-title');
        const messageEl = document.getElementById('modal-message');
        const inputEl = document.getElementById('modal-input');
        const cancelBtn = document.getElementById('modal-cancel');
        const confirmBtn = document.getElementById('modal-confirm');

        titleEl.innerText = title;
        messageEl.innerText = message;
        inputEl.classList.remove('hidden');
        inputEl.value = defaultValue;

        confirmBtn.className = 'modal-btn modal-btn-confirm';
        confirmBtn.innerText = "Confirm";

        return new Promise((resolve) => {
            overlay.classList.add('active');
            inputEl.focus();

            confirmBtn.onclick = () => {
                overlay.classList.remove('active');
                resolve(inputEl.value);
            };

            cancelBtn.onclick = () => {
                overlay.classList.remove('active');
                resolve(null);
            };

            inputEl.onkeydown = (e) => {
                if (e.key === 'Enter') confirmBtn.click();
                if (e.key === 'Escape') cancelBtn.click();
            };
        });
    },

    async showSortSettings(currentSettings, hasSavedSession = false) {
        this.init();
        const overlay = document.getElementById('openflash-modal-overlay');
        const container = overlay.querySelector('.modal-container');
        const originalHTML = `
            <h2 class="modal-title" id="modal-title">Title</h2>
            <p class="modal-message" id="modal-message">Message</p>
            <input type="text" id="modal-input" class="modal-input hidden">
            <div class="modal-actions">
                <button id="modal-cancel" class="modal-btn modal-btn-cancel">Cancel</button>
                <button id="modal-confirm" class="modal-btn modal-btn-confirm">Confirm</button>
            </div>
        `;

        container.classList.add('large');

        let actionButtons = `
            <button id="modal-back" class="modal-btn modal-btn-cancel">Back to Study</button>
            <button id="modal-begin" class="modal-btn modal-btn-confirm">${hasSavedSession ? 'Restart Session' : 'Begin Session'}</button>
        `;

        if (hasSavedSession) {
            actionButtons = `
                <button id="modal-back" class="modal-btn modal-btn-cancel">Back</button>
                <button id="modal-restart" class="modal-btn modal-btn-danger">Restart</button>
                <button id="modal-continue" class="modal-btn modal-btn-confirm">Continue Session</button>
            `;
        }

        container.innerHTML = `
            <h2 class="modal-title">Sort Mode Settings</h2>
            <div class="settings-content">
                <div class="settings-section">
                    <h3 class="settings-subtitle">Evaluation Keybinds</h3>
                    <div class="keybind-grid">
                        <div class="keybind-item">
                            <label>Correct</label>
                            <button class="keybind-btn" data-key="correct">${currentSettings.keybinds.correct}</button>
                        </div>
                        <div class="keybind-item">
                            <label>Incorrect</label>
                            <button class="keybind-btn" data-key="incorrect">${currentSettings.keybinds.incorrect}</button>
                        </div>
                        <div class="keybind-item">
                            <label>Somewhat</label>
                            <button class="keybind-btn" data-key="somewhat">${currentSettings.keybinds.somewhat}</button>
                        </div>
                        <div class="keybind-item">
                            <label>Flip Card</label>
                            <button class="keybind-btn" data-key="flip">${currentSettings.keybinds.flip}</button>
                        </div>
                    </div>
                </div>

                <div class="settings-section">
                    <h3 class="settings-subtitle">Algorithm Settings</h3>
                    <div class="settings-row">
                        <label>Aggression</label>
                        <select id="aggressionSelect" class="modal-select">
                            <option value="relaxed" ${currentSettings.aggression === 'relaxed' ? 'selected' : ''}>Relaxed (Show less often)</option>
                            <option value="normal" ${currentSettings.aggression === 'normal' ? 'selected' : ''}>Normal</option>
                            <option value="aggressive" ${currentSettings.aggression === 'aggressive' ? 'selected' : ''}>Aggressive (Master it fast)</option>
                        </select>
                    </div>
                    <div class="settings-row">
                        <label>Mastery Threshold</label>
                        <select id="masterySelect" class="modal-select">
                            <option value="1" ${currentSettings.masteryThreshold == 1 ? 'selected' : ''}>1 Correct Answer</option>
                            <option value="2" ${currentSettings.masteryThreshold == 2 ? 'selected' : ''}>2 Correct Answers</option>
                            <option value="3" ${currentSettings.masteryThreshold == 3 ? 'selected' : ''}>3 Correct Answers</option>
                            <option value="5" ${currentSettings.masteryThreshold == 5 ? 'selected' : ''}>5 Correct Answers</option>
                        </select>
                    </div>
                </div>
            </div>
            <div class="modal-actions">
                ${actionButtons}
            </div>
        `;

        return new Promise((resolve) => {
            overlay.classList.add('active');

            let settings = JSON.parse(JSON.stringify(currentSettings));
            let activeKeyBtn = null;

            const handleGlobalKeydown = (e) => {
                if (activeKeyBtn) {
                    const keyType = activeKeyBtn.dataset.key;
                    settings.keybinds[keyType] = e.code;
                    activeKeyBtn.innerText = e.code;
                    activeKeyBtn.classList.remove('listening');
                    activeKeyBtn = null;
                    window.removeEventListener('keydown', handleGlobalKeydown, true);
                    e.preventDefault();
                    e.stopPropagation();
                }
            };

            container.querySelectorAll('.keybind-btn').forEach(btn => {
                btn.onclick = (e) => {
                    e.stopPropagation();
                    if (activeKeyBtn) activeKeyBtn.classList.remove('listening');
                    activeKeyBtn = btn;
                    btn.classList.add('listening');
                    btn.innerText = "...";
                    window.addEventListener('keydown', handleGlobalKeydown, true);
                };
            });

            const finalize = (action) => {
                settings.aggression = document.getElementById('aggressionSelect').value;
                settings.masteryThreshold = parseInt(document.getElementById('masterySelect').value);
                overlay.classList.remove('active');
                setTimeout(() => {
                    container.classList.remove('large');
                    container.innerHTML = originalHTML;
                }, 300);
                resolve({ settings, action });
            };

            if (hasSavedSession) {
                document.getElementById('modal-restart').onclick = () => finalize('restart');
                document.getElementById('modal-continue').onclick = () => finalize('continue');
            } else {
                document.getElementById('modal-begin').onclick = () => finalize('begin');
            }

            document.getElementById('modal-back').onclick = () => {
                overlay.classList.remove('active');
                setTimeout(() => {
                    container.classList.remove('large');
                    container.innerHTML = originalHTML;
                }, 300);
                resolve(null);
            };
        });
    },

    async showStudySettings(currentSettings) {
        this.init();
        const overlay = document.getElementById('openflash-modal-overlay');
        const container = overlay.querySelector('.modal-container');
        const originalHTML = `
            <h2 class="modal-title" id="modal-title">Title</h2>
            <p class="modal-message" id="modal-message">Message</p>
            <input type="text" id="modal-input" class="modal-input hidden">
            <div class="modal-actions">
                <button id="modal-cancel" class="modal-btn modal-btn-cancel">Cancel</button>
                <button id="modal-confirm" class="modal-btn modal-btn-confirm">Confirm</button>
            </div>
        `;

        container.classList.add('large');
        container.innerHTML = `
            <h2 class="modal-title">Study Keybinds</h2>
            <div class="settings-content">
                <div class="settings-section">
                    <h3 class="settings-subtitle">Navigation Keybinds</h3>
                    <div class="keybind-grid">
                        <div class="keybind-item">
                            <label>Next Card</label>
                            <button class="keybind-btn" data-key="next">${currentSettings.keybinds.next}</button>
                        </div>
                        <div class="keybind-item">
                            <label>Previous Card</label>
                            <button class="keybind-btn" data-key="prev">${currentSettings.keybinds.prev}</button>
                        </div>
                        <div class="keybind-item">
                            <label>Flip Card</label>
                            <button class="keybind-btn" data-key="flip">${currentSettings.keybinds.flip}</button>
                        </div>
                    </div>
                </div>
            </div>
            <div class="modal-actions">
                <button id="modal-cancel-study" class="modal-btn modal-btn-cancel">Cancel</button>
                <button id="modal-shuffle-study" class="modal-btn modal-btn-cancel" style="display: flex; align-items: center; gap: 8px;">
                    <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M10.59,9.17L5.41,4L4,5.41l5.17,5.17L10.59,9.17z M14.5,4l2.04,2.04L4,18.59L5.41,20L17.96,7.46L20,9.5V4H14.5z M14.83,13.41 l-1.41,1.41l3.13,3.13L14.5,20H20v-5.5l-2.04,2.04L14.83,13.41z"/>
                    </svg>
                    Shuffle Deck
                </button>
                <button id="modal-save-study" class="modal-btn modal-btn-confirm">Save Settings</button>
            </div>
        `;

        return new Promise((resolve) => {
            overlay.classList.add('active');

            let settings = JSON.parse(JSON.stringify(currentSettings));
            let activeKeyBtn = null;

            const handleGlobalKeydown = (e) => {
                if (activeKeyBtn) {
                    const keyType = activeKeyBtn.dataset.key;
                    settings.keybinds[keyType] = e.code;
                    activeKeyBtn.innerText = e.code;
                    activeKeyBtn.classList.remove('listening');
                    activeKeyBtn = null;
                    window.removeEventListener('keydown', handleGlobalKeydown, true);
                    e.preventDefault();
                    e.stopPropagation();
                }
            };

            container.querySelectorAll('.keybind-btn').forEach(btn => {
                btn.onclick = (e) => {
                    e.stopPropagation();
                    if (activeKeyBtn) activeKeyBtn.classList.remove('listening');
                    activeKeyBtn = btn;
                    btn.classList.add('listening');
                    btn.innerText = "...";
                    window.addEventListener('keydown', handleGlobalKeydown, true);
                };
            });

            const finalize = (action) => {
                overlay.classList.remove('active');
                setTimeout(() => {
                    container.classList.remove('large');
                    container.innerHTML = originalHTML;
                }, 300);
                resolve({ settings, action });
            };

            document.getElementById('modal-save-study').onclick = () => finalize('save');
            document.getElementById('modal-shuffle-study').onclick = () => finalize('shuffle');

            document.getElementById('modal-cancel-study').onclick = () => {
                overlay.classList.remove('active');
                setTimeout(() => {
                    container.classList.remove('large');
                    container.innerHTML = originalHTML;
                }, 300);
                resolve(null);
            };
        });
    },
    async showTypeSettings(currentSettings, hasSavedSession = false) {
        this.init();
        const overlay = document.getElementById('openflash-modal-overlay');
        const container = overlay.querySelector('.modal-container');
        const originalHTML = `
            <h2 class="modal-title" id="modal-title">Title</h2>
            <p class="modal-message" id="modal-message">Message</p>
            <input type="text" id="modal-input" class="modal-input hidden">
            <div class="modal-actions">
                <button id="modal-cancel" class="modal-btn modal-btn-cancel">Cancel</button>
                <button id="modal-confirm" class="modal-btn modal-btn-confirm">Confirm</button>
            </div>
        `;

        container.classList.add('large');

        let sessionActions = `
            <button id="modal-begin" class="modal-btn modal-btn-confirm">${hasSavedSession ? 'Restart Session' : 'Begin Session'}</button>
        `;

        if (hasSavedSession) {
            sessionActions = `
                <button id="modal-restart" class="modal-btn modal-btn-danger">Restart</button>
                <button id="modal-continue" class="modal-btn modal-btn-confirm">Continue Session</button>
            `;
        }

        container.innerHTML = `
            <h2 class="modal-title">Type Mode Settings</h2>
            <div class="settings-content">
                <div class="settings-section">
                    <h3 class="settings-subtitle">Grading Preferences</h3>
                    <div class="settings-column">
                        <label class="modal-checkbox-label">
                            <input type="checkbox" id="gradeUppercase" ${currentSettings.grading?.uppercase ? 'checked' : ''}>
                            <span class="checkmark"></span>
                            Grade Uppercase
                        </label>
                        <label class="modal-checkbox-label">
                            <input type="checkbox" id="gradePunctuation" ${currentSettings.grading?.punctuation ? 'checked' : ''}>
                            <span class="checkmark"></span>
                            Grade punctuation
                        </label>
                        <label class="modal-checkbox-label">
                            <input type="checkbox" id="gradeSpecial" ${currentSettings.grading?.special ? 'checked' : ''}>
                            <span class="checkmark"></span>
                            Grade special symbols and accent marks
                        </label>
                    </div>
                </div>

                <div class="settings-section">
                    <h3 class="settings-subtitle">Grading Difficulty</h3>
                    <div class="settings-row">
                        <label>Difficulty</label>
                        <select id="difficultySelect" class="modal-select">
                            <option value="easy" ${currentSettings.grading?.difficulty === 'easy' ? 'selected' : ''}>Easy</option>
                            <option value="medium" ${currentSettings.grading?.difficulty === 'medium' ? 'selected' : ''}>Medium</option>
                            <option value="hard" ${currentSettings.grading?.difficulty === 'hard' ? 'selected' : ''}>Hard</option>
                        </select>
                    </div>
                </div>

                <div class="settings-section">
                    <h3 class="settings-subtitle">Keybinds</h3>
                    <div class="keybind-grid">
                        <div class="keybind-item">
                            <label>Submit Answer</label>
                            <button class="keybind-btn" data-key="submit">${currentSettings.keybinds.submit || 'Enter'}</button>
                        </div>
                        <div class="keybind-item">
                            <label>Override Grade</label>
                            <button class="keybind-btn" data-key="override">${currentSettings.keybinds.override || 'Backspace'}</button>
                        </div>
                    </div>
                </div>

                <div class="settings-section">
                    <h3 class="settings-subtitle">Algorithm Settings</h3>
                    <div class="settings-row">
                        <label>Aggression</label>
                        <select id="aggressionSelect" class="modal-select">
                            <option value="relaxed" ${currentSettings.aggression === 'relaxed' ? 'selected' : ''}>Relaxed (Show less often)</option>
                            <option value="normal" ${currentSettings.aggression === 'normal' ? 'selected' : ''}>Normal</option>
                            <option value="aggressive" ${currentSettings.aggression === 'aggressive' ? 'selected' : ''}>Aggressive (Master it fast)</option>
                        </select>
                    </div>
                    <div class="settings-row">
                        <label>Mastery Threshold</label>
                        <select id="masterySelect" class="modal-select">
                            <option value="1" ${currentSettings.masteryThreshold == 1 ? 'selected' : ''}>1 Correct Answer</option>
                            <option value="2" ${currentSettings.masteryThreshold == 2 ? 'selected' : ''}>2 Correct Answers</option>
                            <option value="3" ${currentSettings.masteryThreshold == 3 ? 'selected' : ''}>3 Correct Answers</option>
                            <option value="5" ${currentSettings.masteryThreshold == 5 ? 'selected' : ''}>5 Correct Answers</option>
                        </select>
                    </div>
                </div>
            </div>
            <div class="modal-actions type-mode-actions">
                <button id="modal-back" class="modal-btn modal-btn-cancel">Back to Library</button>
                <button id="modal-shuffle" class="modal-btn modal-btn-cancel">Shuffle Cards</button>
                <button id="modal-flip" class="modal-btn modal-btn-cancel">Flip Cards</button>
                ${sessionActions}
            </div>
        `;

        return new Promise((resolve) => {
            overlay.classList.add('active');

            let settings = JSON.parse(JSON.stringify(currentSettings));
            let activeKeyBtn = null;

            const handleGlobalKeydown = (e) => {
                if (activeKeyBtn) {
                    const keyType = activeKeyBtn.dataset.key;
                    settings.keybinds[keyType] = e.code;
                    activeKeyBtn.innerText = e.code;
                    activeKeyBtn.classList.remove('listening');
                    activeKeyBtn = null;
                    window.removeEventListener('keydown', handleGlobalKeydown, true);
                    e.preventDefault();
                    e.stopPropagation();
                }
            };

            container.querySelectorAll('.keybind-btn').forEach(btn => {
                btn.onclick = (e) => {
                    e.stopPropagation();
                    if (activeKeyBtn) activeKeyBtn.classList.remove('listening');
                    activeKeyBtn = btn;
                    btn.classList.add('listening');
                    btn.innerText = "...";
                    window.addEventListener('keydown', handleGlobalKeydown, true);
                };
            });

            const finalize = (action) => {
                settings.grading = {
                    uppercase: document.getElementById('gradeUppercase').checked,
                    punctuation: document.getElementById('gradePunctuation').checked,
                    special: document.getElementById('gradeSpecial').checked,
                    difficulty: document.getElementById('difficultySelect').value
                };
                settings.aggression = document.getElementById('aggressionSelect').value;
                settings.masteryThreshold = parseInt(document.getElementById('masterySelect').value);

                overlay.classList.remove('active');
                setTimeout(() => {
                    container.classList.remove('large');
                    container.innerHTML = originalHTML;
                }, 300);
                resolve({ settings, action });
            };

            if (hasSavedSession) {
                document.getElementById('modal-restart').onclick = () => finalize('restart');
                document.getElementById('modal-continue').onclick = () => finalize('continue');
            } else {
                document.getElementById('modal-begin').onclick = () => finalize('begin');
            }

            document.getElementById('modal-shuffle').onclick = () => finalize('shuffle');
            document.getElementById('modal-flip').onclick = () => finalize('flip');

            document.getElementById('modal-back').onclick = () => {
                overlay.classList.remove('active');
                setTimeout(() => {
                    container.classList.remove('large');
                    container.innerHTML = originalHTML;
                }, 300);
                resolve(null);
            };
        });
    }
};

window.openFlashModal = Modal;
