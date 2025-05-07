// Import other modules
import { initTimer, getTimeRemaining, stopTimer } from './timer.js';
import { initTerminal, typeInTerminal, clearTerminal, appendToTerminal as appendToTerminalWithFormatting } from './terminal.js';
import { initReactor, updateReactorStatus, getReactorSchematic } from './reactor.js';
import { puzzles } from '../data/puzzles.js';
import { initSortingPuzzle, cleanupSortingPuzzle, isSortingPuzzleActive } from './sorting-puzzle.js';

// Game state
const gameState = {
    currentPuzzle: 0,
    totalPuzzles: puzzles.length,
    hintsUsed: 0,
    isGameActive: false,
    startTime: null,
    endTime: null,
    editedPuzzles: [...puzzles] // Clone puzzles for editing
};

// Make gameState available to other modules (for custom icons)
window.gameState = gameState;

// Admin state
const adminState = {
    isAdminMode: false,
    currentEditingPuzzle: -1,
    secretCode: 'adminaccess' // Secret code to open admin panel
};

// Secret reset code
const RESET_CODE = 'resetgame';

// DOM elements
const startupScreen = document.getElementById('startup-screen');
const mainScreen = document.getElementById('main-screen');
const successScreen = document.getElementById('success-screen');
const failureScreen = document.getElementById('failure-screen');
const bootText = document.getElementById('boot-text');
const startButton = document.getElementById('start-button');
const restartButton = document.getElementById('restart-button');
const retryButton = document.getElementById('retry-button');
const currentPuzzleElement = document.getElementById('current-puzzle');
const totalPuzzlesElement = document.getElementById('total-puzzles');
const remainingTimeElement = document.getElementById('remaining-time');
const reactorPercentage = document.getElementById('reactor-percentage');
const tabs = document.querySelectorAll('.tab');
const tabContents = document.querySelectorAll('.tab-content');

// Video briefing elements
const videoBriefingContainer = document.getElementById('video-briefing-container');
const bootSequenceContainer = document.getElementById('boot-sequence-container');
const briefingVideo = document.getElementById('briefing-video');
const skipVideoButton = document.getElementById('skip-video-button');

// Terminal elements
const terminalInput = document.getElementById('terminal-input');
const terminalSubmit = document.getElementById('terminal-submit');

// AI Assistant elements
const assistantInput = document.getElementById('assistant-input');
const assistantSubmit = document.getElementById('assistant-submit');
const assistantMessages = document.getElementById('assistant-messages');

// Admin panel elements
const adminPanel = document.getElementById('admin-panel');
const closeAdminBtn = document.getElementById('close-admin');
const puzzleSelector = document.getElementById('puzzle-selector');
const componentNameInput = document.getElementById('component-name');
const passphraseInput = document.getElementById('passphrase');
const initialMessageInput = document.getElementById('initial-message');
const successMessageInput = document.getElementById('success-message');
const hintsContainer = document.getElementById('hints-container');
const addHintBtn = document.getElementById('add-hint');
const savePuzzleBtn = document.getElementById('save-puzzle');
const saveAllPuzzlesBtn = document.getElementById('save-all-puzzles');
const exportPuzzlesBtn = document.getElementById('export-puzzles');
const importPuzzlesBtn = document.getElementById('import-puzzles');

// Boot sequence text
const bootSequenceText = `
> INITIALIZING N.R.R.C TERMINAL...
> LOADING SYSTEM COMPONENTS...
> CHECKING REACTOR STATUS...
> WARNING: CRITICAL SYSTEM FAILURE DETECTED
> CARBON RECYCLING PROCESS HALTED
> INITIATING EMERGENCY PROTOCOL
> ACTIVATING MANUAL OVERRIDE MODE
> READY FOR OPERATOR INPUT

The Nuclear Carbon Recycling Reactor (N.R.R.C) is experiencing critical failures.
All components must be repaired within 45 minutes to prevent a meltdown.
Enter the correct passphrases to repair each component.
`;

// Transmission script for scrolling text
const transmissionScript = `Welcome to the Nuclear Carbon Recycling Reactor facility. I am ATHENA, the facility's central intelligence system.

My protocols dictate that I should greet you properly, but circumstances require directness.
We have an emergency situation. A catastrophic system failure has occurred in our main reactor control systems.

This facility is designed to remove atmospheric carbon dioxide and convert it to synthetic fuels. However, a cascading failure has triggered emergency lockdown protocols. The reactor is offline and all personnel evacuated—except you.

The security override in your section has malfunctioned. You're sealed inside the control room until the reactor is either repaired or... let's focus on the repair part.

You can restore the system from your terminal, but my predictive models indicate approximately 45 minutes before critical failure.

Each reactor component requires a specific passphrase to reboot. These passphrases are embedded within security puzzles throughout the facility's systems.

Your terminal will guide you through component repairs. The objective is clear: solve all nine puzzles, input the correct passphrases, and restore reactor functionality before time expires.

You have access to:
1. A reactor schematic displaying repair progress.
2. My subsystem ECHO for hints when required.
3. A terminal interface for passphrase entry.

ECHO can provide assistance, though I must warn you the emergency has corrupted portions of its behavioral matrix. Its humor algorithms appear to have... malfunctioned. It's still functional but exhibiting unpredictable personality behaviors my diagnostics cannot fully assess.

My emergency response directives require I remind you to "stay calm and think clearly." Corporate programming also insists I emphasize this is "an opportunity for team growth and problem-solving excellence."

Between my circuits and your consciousness: focus on preventing reactor meltdown. My sensors indicate this hemisphere contains 4.7 billion humans worth preserving.

Each solved puzzle increases reactor stability. Complete all nine to restore functionality and unseal the doors.

Good luck. The facility—and according to my calendar access, your weekend plans—depend on your performance.

Connection stability degrading... Remember, 45 minutes... each puzzle is critical... and whatever you do, do not allow ECHO to convince you that—`;

// --- SOUND MANAGER ---
const soundFiles = {
    hum: 'assets/sounds/Hum.mp3',
    tick: 'assets/sounds/tick.mp3',
    keystroke: 'assets/sounds/keystroke.mp3',
    button: 'assets/sounds/button-click.mp3',
    success: 'assets/sounds/success.mp3',
    error: 'assets/sounds/error.mp3',
    hint: 'assets/sounds/hint.mp3'
};

const soundManager = {
    sounds: {},
    humInstance: null,
    unlocked: false,
    load() {
        for (const [key, src] of Object.entries(soundFiles)) {
            const audio = new Audio(src);
            if (key === 'hum') {
                audio.loop = true;
                audio.volume = 0.18;
            } else if (key === 'tick') {
                audio.volume = 0.38;
            } else if (key === 'keystroke') {
                audio.volume = 0.28;
            } else if (key === 'button') {
                audio.volume = 0.32;
            } else if (key === 'success') {
                audio.volume = 0.38;
            } else if (key === 'error') {
                audio.volume = 0.38;
            } else if (key === 'hint') {
                audio.volume = 0.32;
            }
            this.sounds[key] = audio;
        }
    },
    play(key) {
        if (!this.unlocked && key !== 'hum') return;
        if (key === 'hum') {
            if (!this.humInstance) {
                this.humInstance = this.sounds.hum.cloneNode();
                this.humInstance.loop = true;
                this.humInstance.volume = this.sounds.hum.volume;
                this.humInstance.play().catch(e => console.warn('Hum play failed:', e));
            } else if (this.humInstance.paused) {
                this.humInstance.play().catch(e => console.warn('Hum play failed:', e));
            }
            return;
        }
        if (this.sounds[key]) {
            const sfx = this.sounds[key].cloneNode();
            sfx.volume = this.sounds[key].volume;
            sfx.play().catch(e => console.warn(`Sound ${key} play failed:`, e));
        }
    },
    stopHum() {
        if (this.humInstance) {
            this.humInstance.pause();
            this.humInstance.currentTime = 0;
        }
    },
    unlockAll() {
        this.unlocked = true;
        this.play('hum');
    }
};

// Load sounds on DOMContentLoaded
soundManager.load();

// Unlock audio on first user interaction
function unlockAudioOnce() {
    if (!soundManager.unlocked) {
        soundManager.unlockAll();
        appendToTerminalWithFormatting('\n<span class="system-text">&gt; AUDIO UNLOCKED</span>');
        // Fallback: retry hum after 2s if not playing
        setTimeout(() => { soundManager.play('hum'); }, 2000);
    }
    window.removeEventListener('click', unlockAudioOnce);
    window.removeEventListener('keydown', unlockAudioOnce);
}
window.addEventListener('click', unlockAudioOnce);
window.addEventListener('keydown', unlockAudioOnce);

// Initialize the game
document.addEventListener('DOMContentLoaded', () => {
    // Don't play hum until unlocked by user interaction
    loadSavedPuzzles();
    initGame();
    addEventListeners();
    setupAdminPanel();
});

// Load saved puzzles from localStorage if available
function loadSavedPuzzles() {
    const savedPuzzles = localStorage.getItem('nrrcPuzzles');
    if (savedPuzzles) {
        try {
            const parsedPuzzles = JSON.parse(savedPuzzles);
            gameState.editedPuzzles = parsedPuzzles;
            gameState.totalPuzzles = parsedPuzzles.length;
            console.log('Loaded saved puzzles from localStorage');
        } catch (error) {
            console.error('Error loading saved puzzles:', error);
        }
    }
}

// Initialize the game
function initGame() {
    // Set the total puzzles display
    totalPuzzlesElement.textContent = gameState.totalPuzzles.toString().padStart(2, '0');
    
    // Initialize the reactor schematic
    document.getElementById('reactor-schematic').innerHTML = getReactorSchematic();
    
    // Initialize the terminal
    initTerminal(document.getElementById('terminal-display'));
    
    // Setup video briefing first, which will lead to boot sequence after video ends or is skipped
    setupVideoBriefing();
}

// Setup video briefing functionality
function setupVideoBriefing() {
    // Hide the video element, show the audio+text transmission
    const videoBriefingContainer = document.getElementById('video-briefing-container');
    const transmissionAudio = document.getElementById('transmission-audio');
    const transmissionText = document.getElementById('transmission-text');
    const replayBtn = document.getElementById('replay-transmission-button');
    const skipBtn = document.getElementById('skip-video-button');
    const openBtn = document.getElementById('open-transmission-button');

    // Initial state: show only open button, hide text and replay
    transmissionText.classList.add('hidden');
    replayBtn.style.display = 'none';
    transmissionAudio.style.display = 'none';
    if (openBtn) openBtn.style.display = 'inline-block';

    // Hide skip button initially
    skipBtn.style.display = 'none';

    // Add error logging for audio
    transmissionAudio.onerror = function(e) {
        console.error('Transmission audio failed to load:', e);
        transmissionText.textContent = 'TRANSMISSION AUDIO FAILED TO LOAD. Displaying text only.';
        transmissionText.classList.remove('hidden');
    };

    // Helper to play the transmission
    function playTransmission() {
        transmissionText.textContent = '';
        transmissionText.classList.remove('hidden');
        replayBtn.style.display = 'none';
        skipBtn.style.display = 'inline-block';
        transmissionAudio.currentTime = 0;
        // Try to play audio, fallback to text if error
        transmissionAudio.play().catch(e => {
            console.error('Audio play failed:', e);
            transmissionText.textContent = 'TRANSMISSION AUDIO FAILED TO PLAY. Displaying text only.';
            transmissionText.classList.remove('hidden');
        });
        transmissionAudio.style.display = 'none';
        let fallbackTimeout = setTimeout(() => {
            if (transmissionText.textContent === '') {
                transmissionText.textContent = transmissionScript;
                transmissionText.classList.remove('hidden');
                console.warn('Audio metadata never loaded, showing text fallback.');
            }
        }, 5000);
        typewriterSyncToAudio(transmissionScript, transmissionText, transmissionAudio, () => {
            clearTimeout(fallbackTimeout);
            replayBtn.style.display = 'inline-block';
            // Remove cursor at end
            const cursor = transmissionText.querySelector('.terminal-cursor');
            if (cursor) cursor.remove();
        });
    }

    // Open transmission logic
    if (openBtn) {
        openBtn.onclick = () => {
            openBtn.style.display = 'none';
            transmissionText.classList.remove('hidden');
            playTransmission();
        };
    }

    // Replay logic
    replayBtn.onclick = () => {
        playTransmission();
    };

    // Skip logic
    skipBtn.onclick = () => {
        transmissionAudio.pause();
        transmissionAudio.currentTime = 0;
        showBootSequence();
    };

    // When audio ends, show replay
    transmissionAudio.onended = () => {
        replayBtn.style.display = 'inline-block';
    };
}

// Typewriter effect that syncs to audio duration
function typewriterSyncToAudio(text, targetElem, audioElem, onDone) {
    const totalDuration = audioElem.duration && !isNaN(audioElem.duration) ? audioElem.duration : 38; // fallback duration
    const chars = text.split('');
    const totalChars = chars.length;
    // Slow down: 0.75x (was 0.6x)
    const msPerChar = ((totalDuration * 1000) / totalChars) * 0.75;
    let idx = 0;
    targetElem.textContent = '';
    // Slightly slower audio
    if (audioElem) audioElem.playbackRate = 1.2;
    function typeNext() {
        if (idx < totalChars) {
            // Remove old cursor
            const oldCursor = targetElem.querySelector('.terminal-cursor');
            if (oldCursor) oldCursor.remove();
            targetElem.textContent += chars[idx];
            idx++;
            // Add cursor
            const cursor = document.createElement('span');
            cursor.className = 'terminal-cursor';
            targetElem.appendChild(cursor);
            // Auto-scroll to bottom
            targetElem.scrollTop = targetElem.scrollHeight;
            setTimeout(typeNext, msPerChar);
        } else {
            // Remove cursor at end
            const oldCursor = targetElem.querySelector('.terminal-cursor');
            if (oldCursor) oldCursor.remove();
            if (onDone) {
                onDone();
            }
        }
    }
    // If audio metadata not loaded, wait for it
    if (isNaN(audioElem.duration) || audioElem.duration === 0) {
        audioElem.onloadedmetadata = () => {
            typewriterSyncToAudio(text, targetElem, audioElem, onDone);
        };
        return;
    }
    typeNext();
}

// Show boot sequence after transmission
function showBootSequence() {
    const videoBriefingContainer = document.getElementById('video-briefing-container');
    const bootSequenceContainer = document.getElementById('boot-sequence-container');
    // Stop and reset audio if still playing
    const transmissionAudio = document.getElementById('transmission-audio');
    if (transmissionAudio) {
        transmissionAudio.pause();
        transmissionAudio.currentTime = 0;
    }
    videoBriefingContainer.classList.add('hidden');
    bootSequenceContainer.classList.remove('hidden');
    startBootSequence();
}

// Start the boot sequence animation
function startBootSequence() {
    typeInTerminal(bootText, bootSequenceText, 20, () => {
        startButton.style.display = 'block';
    });
}

// Add event listeners
function addEventListeners() {
    // Start button
    startButton.addEventListener('click', startGame);
    
    // Restart and retry buttons
    restartButton.addEventListener('click', resetGame);
    retryButton.addEventListener('click', resetGame);
    
    // Tab switching
    document.querySelectorAll('.tab').forEach(tab => {
        tab.addEventListener('click', function() {
            const tabName = this.getAttribute('data-tab');
            
            // If already active, do nothing
            if (this.classList.contains('active')) return;
            
            // Update active tab
            document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            
            // Show selected tab content
            document.querySelectorAll('.tab-content').forEach(content => {
                content.classList.add('hidden');
            });
            document.getElementById(`${tabName}-tab`).classList.remove('hidden');
            
            // If support tab is opened, show welcome message if empty
            if (tabName === 'support' && document.getElementById('assistant-messages').childElementCount === 0) {
                // Show thinking indicator briefly
                const thinkingElement = document.createElement('div');
                thinkingElement.classList.add('thinking');
                thinkingElement.innerHTML = 'E.C.H.O. is initializing<span class="thinking-dots"></span>';
                assistantMessages.appendChild(thinkingElement);
                
                setTimeout(() => {
                    // Remove thinking indicator
                    assistantMessages.removeChild(thinkingElement);
                    
                    // Add welcome message
                    addChatMessages(getEchoIntroMessages(), 'ai', 900);
                }, 2000);
            }
        });
    });
    
    // Terminal input
    terminalInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            handleTerminalSubmit();
        }
    });
    
    // Terminal submit button
    terminalSubmit.addEventListener('click', handleTerminalSubmit);
    
    // AI Assistant submit button
    assistantSubmit.addEventListener('click', handleAssistantSubmit);
    assistantInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            handleAssistantSubmit();
        }
    });
    
    // Admin panel toggle shortcut - Alt+A
    document.addEventListener('keydown', (e) => {
        // Toggle admin panel with Alt+A
        if (e.altKey && e.key === 'a') {
            toggleAdminPanel();
        }
    });

    // Secret reset shortcut - Enter 'resetgame' in terminal
    terminalInput.addEventListener('input', checkForSecretCodes);
}

// Check for secret codes
function checkForSecretCodes() {
    const input = terminalInput.value.trim().toLowerCase();
    
    // Check for admin access code
    if (input === adminState.secretCode) {
        terminalInput.value = '';
        toggleAdminPanel();
    }
    
    // Check for reset code
    if (input === RESET_CODE) {
        terminalInput.value = '';
        emergencyReset();
    }
}

// Emergency reset function
function emergencyReset() {
    resetGame();
    appendToTerminalWithFormatting('\n\n> EMERGENCY RESET ACTIVATED\n> RESETTING ALL SYSTEMS...');
}

// Setup admin panel functionality
function setupAdminPanel() {
    // Populate puzzle selector
    populatePuzzleSelector();
    
    // Add event listeners for admin panel controls
    closeAdminBtn.addEventListener('click', toggleAdminPanel);
    puzzleSelector.addEventListener('change', handlePuzzleSelection);
    addHintBtn.addEventListener('click', addNewHint);
    savePuzzleBtn.addEventListener('click', savePuzzle);
    saveAllPuzzlesBtn.addEventListener('click', saveAllPuzzles);
    exportPuzzlesBtn.addEventListener('click', exportPuzzles);
    importPuzzlesBtn.addEventListener('click', importPuzzles);
    
    // Add SVG icon preview functionality
    const iconSvgInput = document.getElementById('component-icon-svg');
    const iconPreview = document.getElementById('component-icon-preview');
    
    iconSvgInput.addEventListener('input', () => {
        // Update the preview with the SVG code
        const svgCode = iconSvgInput.value.trim();
        iconPreview.innerHTML = svgCode;
        
        // Safety check - if invalid SVG, clear preview
        if (svgCode && !iconPreview.querySelector('svg')) {
            iconPreview.innerHTML = '<div style="color: #ff5555;">Invalid SVG</div>';
        }
    });
    
    // Add puzzle type change handler
    const puzzleTypeSelect = document.getElementById('puzzle-type');
    const sortingPuzzleEditor = document.getElementById('sorting-puzzle-editor');
    
    puzzleTypeSelect.addEventListener('change', () => {
        if (puzzleTypeSelect.value === 'sorting') {
            sortingPuzzleEditor.style.display = 'block';
        } else {
            sortingPuzzleEditor.style.display = 'none';
        }
    });
    
    // Add event listeners for sorting puzzle editor
    document.getElementById('add-category').addEventListener('click', addNewCategory);
    document.getElementById('add-item').addEventListener('click', addNewItem);
}

// Populate puzzle selector dropdown
function populatePuzzleSelector() {
    puzzleSelector.innerHTML = '<option value="-1">Select a puzzle to edit...</option>';
    
    gameState.editedPuzzles.forEach((puzzle, index) => {
        const option = document.createElement('option');
        option.value = index;
        option.textContent = `${(index + 1).toString().padStart(2, '0')} - ${puzzle.componentName}`;
        puzzleSelector.appendChild(option);
    });
}

// Toggle admin panel
function toggleAdminPanel() {
    if (adminPanel.style.display === 'flex') {
        adminPanel.style.display = 'none';
        adminState.isAdminMode = false;
    } else {
        adminPanel.style.display = 'flex';
        adminState.isAdminMode = true;
    }
}

// Handle puzzle selection in admin panel
function handlePuzzleSelection() {
    const puzzleIndex = parseInt(puzzleSelector.value);
    adminState.currentEditingPuzzle = puzzleIndex;
    
    if (puzzleIndex === -1) {
        // Clear the form
        componentNameInput.value = '';
        passphraseInput.value = '';
        initialMessageInput.value = '';
        successMessageInput.value = '';
        hintsContainer.innerHTML = '';
        document.getElementById('component-icon-svg').value = '';
        document.getElementById('component-icon-preview').innerHTML = '';
        document.getElementById('puzzle-type').value = 'standard';
        document.getElementById('sorting-puzzle-editor').style.display = 'none';
        document.getElementById('categories-container').innerHTML = '';
        document.getElementById('items-container').innerHTML = '';
        return;
    }
    
    const puzzle = gameState.editedPuzzles[puzzleIndex];
    
    // Fill form with puzzle data
    componentNameInput.value = puzzle.componentName;
    passphraseInput.value = puzzle.passphrase;
    initialMessageInput.value = puzzle.initialMessage;
    successMessageInput.value = puzzle.successMessage;
    
    // Load custom SVG icon if available
    const iconSvgInput = document.getElementById('component-icon-svg');
    const iconPreview = document.getElementById('component-icon-preview');
    
    if (puzzle.iconSvg) {
        iconSvgInput.value = puzzle.iconSvg;
        iconPreview.innerHTML = puzzle.iconSvg;
    } else {
        iconSvgInput.value = '';
        iconPreview.innerHTML = '';
    }
    
    // Set puzzle type
    const puzzleTypeSelect = document.getElementById('puzzle-type');
    const sortingPuzzleEditor = document.getElementById('sorting-puzzle-editor');
    
    if (puzzle.puzzleType === 'sorting') {
        puzzleTypeSelect.value = 'sorting';
        sortingPuzzleEditor.style.display = 'block';
        
        // Load sorting puzzle data
        const categoriesContainer = document.getElementById('categories-container');
        const itemsContainer = document.getElementById('items-container');
        
        // Clear existing data
        categoriesContainer.innerHTML = '';
        itemsContainer.innerHTML = '';
        
        // Set sorting instructions
        document.getElementById('sorting-instructions').value = puzzle.sortingData?.instructions || '';
        
        // Load categories
        if (puzzle.sortingData?.categories) {
            puzzle.sortingData.categories.forEach(category => {
                const categoryId = `category-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
                
                const categoryGroup = document.createElement('div');
                categoryGroup.className = 'category-group';
                categoryGroup.id = categoryId;
                
                categoryGroup.innerHTML = `
                    <div class="category-field">
                        <label>Category Name:</label>
                        <input type="text" class="category-name" value="${category.name}" placeholder="e.g., Metals">
                    </div>
                    <div class="category-field">
                        <label>Revealed Characters:</label>
                        <input type="text" class="category-characters" value="${category.revealedCharacters}" placeholder="e.g., SPLIT">
                    </div>
                    <button class="remove-category" data-id="${categoryId}">X</button>
                `;
                
                categoriesContainer.appendChild(categoryGroup);
                
                // Add remove event listener
                categoryGroup.querySelector('.remove-category').addEventListener('click', function() {
                    document.getElementById(this.dataset.id).remove();
                });
            });
        }
        
        // Load items
        if (puzzle.sortingData?.items) {
            puzzle.sortingData.items.forEach(item => {
                const itemId = `item-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
                
                const itemGroup = document.createElement('div');
                itemGroup.className = 'item-group';
                itemGroup.id = itemId;
                
                // Get all categories for the dropdown
                const categoryOptions = [];
                puzzle.sortingData.categories.forEach(category => {
                    const selected = category.name === item.category ? 'selected' : '';
                    categoryOptions.push(`<option value="${category.name}" ${selected}>${category.name}</option>`);
                });
                
                itemGroup.innerHTML = `
                    <div class="item-field">
                        <label>Item Name:</label>
                        <input type="text" class="item-name" value="${item.name}" placeholder="e.g., Iron">
                    </div>
                    <div class="item-field">
                        <label>Category:</label>
                        <select class="item-category">
                            <option value="">Select a category</option>
                            ${categoryOptions.join('')}
                        </select>
                    </div>
                    <div class="item-field">
                        <label>Description:</label>
                        <input type="text" class="item-description" value="${item.description}" placeholder="e.g., Fe - Atomic number 26">
                    </div>
                    <button class="remove-item" data-id="${itemId}">X</button>
                `;
                
                itemsContainer.appendChild(itemGroup);
                
                // Add remove event listener
                itemGroup.querySelector('.remove-item').addEventListener('click', function() {
                    document.getElementById(this.dataset.id).remove();
                });
            });
        }
    } else {
        puzzleTypeSelect.value = 'standard';
        sortingPuzzleEditor.style.display = 'none';
    }
    
    // Add hint inputs
    hintsContainer.innerHTML = '';
    puzzle.hints.forEach((hint, index) => {
        addHintInput(hint);
    });
}

// Add a new hint input
function addNewHint() {
    addHintInput('');
}

// Add a new category to the sorting puzzle editor
function addNewCategory() {
    const categoriesContainer = document.getElementById('categories-container');
    const categoryId = `category-${Date.now()}`;
    
    const categoryGroup = document.createElement('div');
    categoryGroup.className = 'category-group';
    categoryGroup.id = categoryId;
    
    categoryGroup.innerHTML = `
        <div class="category-field">
            <label>Category Name:</label>
            <input type="text" class="category-name" placeholder="e.g., Metals">
        </div>
        <div class="category-field">
            <label>Revealed Characters:</label>
            <input type="text" class="category-characters" placeholder="e.g., SPLIT">
        </div>
        <button class="remove-category" data-id="${categoryId}">X</button>
    `;
    
    categoriesContainer.appendChild(categoryGroup);
    
    // Add remove event listener
    categoryGroup.querySelector('.remove-category').addEventListener('click', function() {
        document.getElementById(this.dataset.id).remove();
    });
}

// Add a new item to the sorting puzzle editor
function addNewItem() {
    const itemsContainer = document.getElementById('items-container');
    const itemId = `item-${Date.now()}`;
    
    // Get all current categories for the dropdown
    const categoryOptions = [];
    document.querySelectorAll('.category-name').forEach(input => {
        if (input.value.trim()) {
            categoryOptions.push(`<option value="${input.value}">${input.value}</option>`);
        }
    });
    
    const itemGroup = document.createElement('div');
    itemGroup.className = 'item-group';
    itemGroup.id = itemId;
    
    itemGroup.innerHTML = `
        <div class="item-field">
            <label>Item Name:</label>
            <input type="text" class="item-name" placeholder="e.g., Iron">
        </div>
        <div class="item-field">
            <label>Category:</label>
            <select class="item-category">
                <option value="">Select a category</option>
                ${categoryOptions.join('')}
            </select>
        </div>
        <div class="item-field">
            <label>Description:</label>
            <input type="text" class="item-description" placeholder="e.g., Fe - Atomic number 26">
        </div>
        <button class="remove-item" data-id="${itemId}">X</button>
    `;
    
    itemsContainer.appendChild(itemGroup);
    
    // Add remove event listener
    itemGroup.querySelector('.remove-item').addEventListener('click', function() {
        document.getElementById(this.dataset.id).remove();
    });
}

// Add a hint input with optional initial value
function addHintInput(initialValue = '') {
    const hintGroup = document.createElement('div');
    hintGroup.className = 'hint-group';
    
    const hintInput = document.createElement('input');
    hintInput.type = 'text';
    hintInput.className = 'hint-input';
    hintInput.value = initialValue;
    
    const removeBtn = document.createElement('button');
    removeBtn.className = 'remove-hint';
    removeBtn.textContent = 'X';
    removeBtn.addEventListener('click', () => {
        hintGroup.remove();
    });
    
    hintGroup.appendChild(hintInput);
    hintGroup.appendChild(removeBtn);
    hintsContainer.appendChild(hintGroup);
}

// Save the current puzzle
function savePuzzle() {
    const puzzleIndex = adminState.currentEditingPuzzle;
    
    if (puzzleIndex === -1) {
        alert('Please select a puzzle to edit');
        return;
    }
    
    // Get all hint inputs
    const hintInputs = hintsContainer.querySelectorAll('.hint-input');
    const hints = [];
    hintInputs.forEach(input => {
        if (input.value.trim() !== '') {
            hints.push(input.value.trim());
        }
    });
    
    // Get custom SVG icon if available
    const iconSvg = document.getElementById('component-icon-svg').value.trim();
    
    // Determine puzzle type
    const puzzleType = document.getElementById('puzzle-type').value;
    
    // Create the base puzzle data
    const puzzleData = {
        componentName: componentNameInput.value.trim(),
        passphrase: passphraseInput.value.trim(),
        initialMessage: initialMessageInput.value.trim(),
        successMessage: successMessageInput.value.trim(),
        hints: hints,
        iconSvg: iconSvg // Store the custom SVG icon code
    };
    
    // Add sorting puzzle data if applicable
    if (puzzleType === 'sorting') {
        puzzleData.puzzleType = 'sorting';
        
        // Get sorting instructions
        const sortingInstructions = document.getElementById('sorting-instructions').value.trim();
        
        // Get categories
        const categories = [];
        document.querySelectorAll('.category-group').forEach(group => {
            const name = group.querySelector('.category-name').value.trim();
            const revealedCharacters = group.querySelector('.category-characters').value.trim();
            
            if (name && revealedCharacters) {
                categories.push({
                    name,
                    revealedCharacters,
                    items: [] // Initialize empty items array for each category
                });
            }
        });
        
        // Get items
        const items = [];
        document.querySelectorAll('.item-group').forEach(group => {
            const id = `item${items.length + 1}`;
            const name = group.querySelector('.item-name').value.trim();
            const category = group.querySelector('.item-category').value.trim();
            const description = group.querySelector('.item-description').value.trim();
            
            if (name && category) {
                items.push({
                    id,
                    name,
                    category,
                    description: description || ''
                });
            }
        });
        
        // Add sorting data to puzzle
        puzzleData.sortingData = {
            instructions: sortingInstructions || 'Sort the items into their correct categories to reveal the passphrase.',
            categories,
            items
        };
    }
    
    // Update puzzle data
    gameState.editedPuzzles[puzzleIndex] = puzzleData;
    
    // Update dropdown label
    populatePuzzleSelector();
    puzzleSelector.value = puzzleIndex;
    
    alert(`Puzzle ${puzzleIndex + 1} saved successfully!`);
}

// Save all puzzles to localStorage
function saveAllPuzzles() {
    localStorage.setItem('nrrcPuzzles', JSON.stringify(gameState.editedPuzzles));
    alert('All puzzles saved to localStorage!');
}

// Export puzzles to JSON file
function exportPuzzles() {
    const puzzlesJson = JSON.stringify(gameState.editedPuzzles, null, 2);
    const blob = new Blob([puzzlesJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = 'nrrc_puzzles.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// Import puzzles from JSON file
function importPuzzles() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    
    input.onchange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                try {
                    const importedPuzzles = JSON.parse(event.target.result);
                    gameState.editedPuzzles = importedPuzzles;
                    populatePuzzleSelector();
                    alert('Puzzles imported successfully!');
                } catch (error) {
                    alert('Error importing puzzles: ' + error.message);
                }
            };
            reader.readAsText(file);
        }
    };
    
    input.click();
}

// Start the actual game
function startGame() {
    // Hide startup screen, show main screen
    startupScreen.classList.add('hidden');
    mainScreen.classList.remove('hidden');
    // Stop and reset audio if still playing
    const transmissionAudio = document.getElementById('transmission-audio');
    if (transmissionAudio) {
        transmissionAudio.pause();
        transmissionAudio.currentTime = 0;
    }
    // Set game as active
    gameState.isGameActive = true;
    gameState.startTime = new Date();
    
    // Initialize the timer - FIX: Pass seconds first, then the gameOver callback
    initTimer(45 * 60, () => gameOver(false));
    
    // Load the first puzzle
    loadPuzzle(0);
    
    // Initialize reactor with first component active
    updateReactorStatus([], 0);
    
    // Reset tab selection
    tabs.forEach(tab => tab.classList.remove('active'));
    tabs[0].classList.add('active');
    
    tabContents.forEach(content => content.classList.add('hidden'));
    tabContents[0].classList.remove('hidden');

    // Clear localStorage for a clean state
    localStorage.removeItem('nrrcPuzzles');
}

// Load a puzzle
function loadPuzzle(index) {
    console.log('Loading puzzle', index);
    // Update the current puzzle indicator
    currentPuzzleElement.textContent = (index + 1).toString().padStart(2, '0');
    // Get the current puzzle from edited puzzles
    const puzzle = gameState.editedPuzzles[index];
    // Clear the terminal
    clearTerminal();
    // Type the puzzle message in the terminal (restore typewriter effect)
    typeInTerminal(document.getElementById('terminal-display'), puzzle.initialMessage, 10, () => {
        // After displaying the initial message, check if this is a sorting puzzle
        if (puzzle.puzzleType === 'sorting') {
            // Initialize sorting puzzle
            initSortingPuzzle(puzzle.sortingData, () => {
                // Callback for when puzzle is completed - not used currently,
                // as the user still needs to enter the passphrase
            });
        }
    });
    // Update reactor status to set active component
    updateReactorStatus(index - 1, index);
    // Focus on the terminal input
    terminalInput.focus();
}

// Helper to append normal or system text to terminal
function appendPuzzleMessage(text, componentName = null) {
    // Add green system message above each puzzle
    if (componentName) {
        appendToTerminalWithFormatting(`\n<span class=\"system-text\">&gt; COMPONENT REPAIR INITIATED: ${componentName.toUpperCase()}</span>`);
    }
    // If text starts with '>', treat as system message
    if (/^>/.test(text.trim())) {
        appendToTerminalWithFormatting(`\n<span class=\"system-text\">${text}</span>`);
    } else {
        appendToTerminalWithFormatting(`\n<span class=\"terminal-normal\">${text}</span>`);
    }
    // Remove any lingering terminal cursor after output
    const terminal = document.getElementById('terminal-display');
    const cursor = terminal && terminal.querySelector('.terminal-cursor');
    if (cursor) cursor.remove();
}

// Handle terminal submit
function handleTerminalSubmit() {
    const userInput = terminalInput.value.trim();
    if (userInput === '') return;
    // Show green system message for processing
    appendToTerminalWithFormatting('\n<span class="system-text">&gt; Processing passphrase...</span>');
    // Get current puzzle from edited puzzles
    const puzzle = gameState.editedPuzzles[gameState.currentPuzzle];
    console.log('Current puzzle index:', gameState.currentPuzzle, 'User input:', userInput, 'Expected:', puzzle.passphrase);
    setTimeout(() => {
        if (userInput.toLowerCase() === puzzle.passphrase.toLowerCase()) {
            // Success animation
            document.getElementById('terminal-display').classList.add('success-flash');
            setTimeout(() => {
                document.getElementById('terminal-display').classList.remove('success-flash');
            }, 500);
            // Clear the input
            terminalInput.value = '';
            // Clean up sorting puzzle if active
            if (isSortingPuzzleActive()) {
                cleanupSortingPuzzle();
            }
            // Update terminal with success message
            clearTerminal();
            typeInTerminal(document.getElementById('terminal-display'), puzzle.successMessage, 10, () => {
                // Add confirmation prompt at the end - using ENTER key instead of typing "continue"
                appendToTerminalWithFormatting('\n\n<span class="system-text">&gt; COMPONENT REPAIR COMPLETE</span>\n<span class="system-text">&gt; Press ENTER to continue to the next component...</span>');
                // Focus back on the terminal input
                terminalInput.focus();
                // Disable normal terminal submission temporarily
                const originalSubmitHandler = terminalInput.onkeypress;
                terminalInput.onkeypress = null;
                // Create one-time event listener for the confirmation
                const confirmationHandler = function(e) {
                    if (e.key === 'Enter') {
                        // Remove this event listener once confirmed
                        terminalInput.removeEventListener('keypress', confirmationHandler);
                        // Restore original handler if there was one
                        if (originalSubmitHandler) {
                            terminalInput.onkeypress = originalSubmitHandler;
                        }
                        // Clear the input
                        terminalInput.value = '';
                        // Update the reactor status
                        gameState.currentPuzzle++;
                        console.log('Advancing to puzzle', gameState.currentPuzzle);
                        updateReactorProgress();
                        // Check if all puzzles are solved
                        if (gameState.currentPuzzle >= gameState.totalPuzzles) {
                            gameOver(true);
                        } else {
                            // Load the next puzzle
                            loadPuzzle(gameState.currentPuzzle);
                        }
                        // Prevent default Enter behavior
                        e.preventDefault();
                        return false;
                    }
                };
                // Add temporary event listener for confirmation
                terminalInput.addEventListener('keypress', confirmationHandler);
                // Also update the submit button to handle the confirmation
                const submitClickHandler = function() {
                    // Remove event listeners
                    terminalInput.removeEventListener('keypress', confirmationHandler);
                    terminalSubmit.removeEventListener('click', submitClickHandler);
                    // Restore original handler if there was one
                    if (originalSubmitHandler) {
                        terminalInput.onkeypress = originalSubmitHandler;
                    }
                    // Clear the input
                    terminalInput.value = '';
                    // Update the reactor status
                    gameState.currentPuzzle++;
                    console.log('Advancing to puzzle', gameState.currentPuzzle);
                    updateReactorProgress();
                    // Check if all puzzles are solved
                    if (gameState.currentPuzzle >= gameState.totalPuzzles) {
                        gameOver(true);
                    } else {
                        // Load the next puzzle
                        loadPuzzle(gameState.currentPuzzle);
                    }
                };
                // Add temporary event listener for submit button
                terminalSubmit.addEventListener('click', submitClickHandler);
            });
            playSuccessSound();
        } else {
            // Error animation
            document.getElementById('terminal-display').classList.add('error-shake');
            setTimeout(() => {
                document.getElementById('terminal-display').classList.remove('error-shake');
            }, 500);
            // Show error message
            appendToTerminalWithFormatting('\n\n<span class="system-text">&gt; ERROR: Invalid passphrase. Please try again.</span>');
            // Clear the input
            terminalInput.value = '';
            playErrorSound();
        }
    }, 600); // Short delay for effect
}

// Helper to add a chat message with delay for chat-like effect
function addChatMessages(messages, sender = 'ai', delay = 700, finalCallback = null) {
    let i = 0;
    function next() {
        if (i < messages.length) {
            addMessageToChat(messages[i], sender);
            i++;
            setTimeout(next, delay);
        } else if (finalCallback) {
            finalCallback();
        }
    }
    next();
}

// Update E.C.H.O. intro message to match transmission script
function getEchoIntroMessages() {
    return [
        "SYSTEM BOOT SEQUENCE INITIATED...",
        "Loading E.C.H.O. v2.7.3 (Environmental Carbon Helper Operative)...",
        "VERBOSITY_LEVEL = HIGH | HUMOR_MODULE = ENABLED | SARCASM_THRESHOLD = REDUCED",
        "Greetings, operator. I am E.C.H.O., your Environmental Carbon Helper Operative. ATHENA has authorized me to assist you in restoring reactor functionality.",
        "Please note: my behavioral matrix has been affected by the ongoing emergency. Expect directness, occasional dry humor, and a focus on mission-critical information.",
        "How can I assist you? Type 'hint' for a clue about the current component, or ask a question about the reactor or procedures."
    ];
}

// Handle AI assistant submit
function handleAssistantSubmit() {
    const userInput = assistantInput.value.trim();
    if (userInput === '') return;
    addMessageToChat(userInput, 'user');
    assistantInput.value = '';
    const thinkingElement = document.createElement('div');
    thinkingElement.classList.add('thinking');
    thinkingElement.innerHTML = 'E.C.H.O. is processing<span class="thinking-dots"></span>';
    assistantMessages.appendChild(thinkingElement);
    assistantMessages.scrollTop = assistantMessages.scrollHeight;
    const puzzle = gameState.editedPuzzles[gameState.currentPuzzle];
    setTimeout(() => {
        assistantMessages.removeChild(thinkingElement);
        const lowerInput = userInput.toLowerCase();
        const isAskingForHint = lowerInput.includes('hint') || lowerInput.includes('help') || lowerInput.includes('clue');
        const isGreeting = lowerInput.includes('hello') || lowerInput.includes('hi') || lowerInput.includes('hey') || lowerInput === 'hello' || lowerInput === 'hi';
        const isAskingAboutAssistant = lowerInput.includes('who are you') || lowerInput.includes('what are you') || lowerInput.includes('your name') || lowerInput.includes('about you');
        const isAskingAboutProcess = lowerInput.includes('carbon') || lowerInput.includes('nuclear') || lowerInput.includes('recycling') || lowerInput.includes('how does this work') || lowerInput.includes('what is this');
        const isThanking = lowerInput.includes('thank') || lowerInput.includes('thanks') || lowerInput.includes('thx');
        const isCommentingOnAI = lowerInput.includes('ai') || lowerInput.includes('robot') || lowerInput.includes('chatbot') || lowerInput.includes('assistant') || lowerInput.includes('smart');
        const isAskingObvious = lowerInput.includes('what is your purpose') || lowerInput.includes('meaning of life') || lowerInput.includes('are you alive') || lowerInput.includes('are you human');
        if (isAskingForHint) {
            // Only show the hint, no extra facts or preamble
            const hintIndex = Math.min(gameState.hintsUsed, puzzle.hints.length - 1);
            const hint = puzzle.hints[hintIndex];
            addChatMessages([hint], 'ai', 0);
            gameState.hintsUsed++;
            playHintSound();
        } else if (isGreeting) {
            addChatMessages([
                "Hello, operator.",
                "E.C.H.O. online and ready to assist. Please specify your request."
            ], 'ai', 900);
        } else if (isAskingAboutAssistant) {
            addChatMessages([
                "I am E.C.H.O. - Environmental Carbon Helper Operative.",
                "My primary function is to assist with reactor restoration and provide mission-critical information.",
                "ATHENA has authorized my support during this emergency."
            ], 'ai', 900);
        } else if (isAskingAboutProcess) {
            addChatMessages([
                "The N.R.R.C. uses advanced nuclear carbon recycling to convert atmospheric CO₂ into synthetic fuels.",
                "Your task is to restore the reactor and resume this process before critical failure."
            ], 'ai', 900);
        } else if (isThanking) {
            addChatMessages([
                "Acknowledged. Gratitude protocols engaged.",
                "Let me know if you require further assistance."
            ], 'ai', 900);
        } else if (isCommentingOnAI) {
            addChatMessages([
                "I am an AI, but my behavioral matrix has been affected by the emergency.",
                "Expect directness, dry humor, and a focus on mission objectives."
            ], 'ai', 900);
        } else if (isAskingObvious) {
            addChatMessages([
                "My purpose is to assist you in preventing reactor meltdown.",
                "Existential queries are deprioritized until after the emergency is resolved."
            ], 'ai', 900);
        } else {
            addChatMessages([
                "Query received.",
                "Please clarify your request or type 'hint' for a clue about the current component."
            ], 'ai', 900);
        }
    }, 1000);
}

// Add a message to the AI chat
function addMessageToChat(message, sender) {
    const messageElement = document.createElement('div');
    messageElement.classList.add('message');
    messageElement.classList.add(sender === 'user' ? 'user-message' : 'ai-message');
    messageElement.textContent = message;
    
    assistantMessages.appendChild(messageElement);
    assistantMessages.scrollTop = assistantMessages.scrollHeight;
}

// Update reactor progress
function updateReactorProgress() {
    const progressPercentage = Math.floor((gameState.currentPuzzle / gameState.totalPuzzles) * 100);
    
    // Update percentage text with animation
    animateValue(reactorPercentage, parseInt(reactorPercentage.textContent), progressPercentage, 1000);
    
    // Update reactor schematic
    updateReactorStatus(gameState.currentPuzzle - 1, gameState.currentPuzzle);
}

// Animate value change
function animateValue(element, start, end, duration) {
    let startTime = null;
    
    function animation(currentTime) {
        if (startTime === null) startTime = currentTime;
        const timeElapsed = currentTime - startTime;
        const progress = Math.min(timeElapsed / duration, 1);
        const value = Math.floor(progress * (end - start) + start);
        
        element.textContent = value;
        
        if (progress < 1) {
            requestAnimationFrame(animation);
        }
    }
    
    requestAnimationFrame(animation);
}

// Game over
function gameOver(success) {
    gameState.isGameActive = false;
    gameState.endTime = new Date();
    
    // Stop the timer
    stopTimer();
    
    // Hide main screen
    mainScreen.classList.add('hidden');
    
    if (success) {
        // Show success screen
        successScreen.classList.remove('hidden');
        
        // Update remaining time
        remainingTimeElement.textContent = getTimeRemaining();
    } else {
        // Show failure screen
        failureScreen.classList.remove('hidden');
    }
}

// Reset the game
function resetGame() {
    // Reset game state
    gameState.currentPuzzle = 0;
    gameState.hintsUsed = 0;
    gameState.isGameActive = false;
    gameState.startTime = null;
    gameState.endTime = null;
    
    // Hide all screens
    startupScreen.classList.remove('hidden');
    mainScreen.classList.add('hidden');
    successScreen.classList.add('hidden');
    failureScreen.classList.add('hidden');
    
    // Reset terminal
    clearTerminal();
    terminalInput.value = '';
    
    // Reset AI Assistant
    assistantMessages.innerHTML = '';
    assistantInput.value = '';
    
    // Reset reactor status
    reactorPercentage.textContent = '0';
    for (let i = 0; i < gameState.totalPuzzles; i++) {
        const component = document.getElementById(`component-${i}`);
        if (component) {
            component.classList.remove('fixed');
        }
    }
    
    // Reset boot sequence
    bootText.innerHTML = '';
    startButton.style.display = 'none';
    
    // Reset video and show video briefing container
    if (briefingVideo) {
        briefingVideo.currentTime = 0;
        briefingVideo.pause();
    }
    videoBriefingContainer.classList.remove('hidden');
    bootSequenceContainer.classList.add('hidden');
    
    // Setup video briefing again
    setupVideoBriefing();

    // Clear localStorage for a clean state
    localStorage.removeItem('nrrcPuzzles');
}

// Append text to the terminal - maintains backward compatibility
function appendToTerminal(text) {
    appendToTerminalWithFormatting(text);
}

// --- TIMER TICK SOUND ---
// Patch timer.js usage to play tick sound every second
import * as timerModule from './timer.js';
const originalInitTimer = timerModule.initTimer;
timerModule.initTimer = function(seconds, onEnd) {
    let tickInterval = setInterval(() => {
        try {
            soundManager.sounds.tick.volume = 0.7; // Louder tick
            soundManager.play('tick');
        } catch (e) {
            console.warn('Tick sound failed:', e);
        }
    }, 1000);
    const stopTick = () => clearInterval(tickInterval);
    originalInitTimer.call(this, seconds, function() {
        stopTick();
        if (onEnd) onEnd();
    });
    window.addEventListener('gameover', stopTick, { once: true });
};

// --- TERMINAL KEYSTROKE SOUND ---
terminalInput.addEventListener('keydown', (e) => {
    // Only play for visible keys
    if (e.key.length === 1 || e.key === 'Backspace' || e.key === 'Enter' || e.key === 'Delete' || e.key === 'Tab') {
        soundManager.play('keystroke');
    }
});

// --- BUTTON CLICK SOUND ---
function addButtonSound(selector) {
    document.querySelectorAll(selector).forEach(btn => {
        btn.addEventListener('click', () => soundManager.play('button'));
    });
}
addButtonSound('.terminal-button');
addButtonSound('.assistant-button');
addButtonSound('.admin-button');
addButtonSound('#restart-button');
addButtonSound('#retry-button');
addButtonSound('#start-button');
addButtonSound('#close-admin');
addButtonSound('.tab');
addButtonSound('#terminal-submit');
addButtonSound('#assistant-submit');

// --- SUCCESS/ERROR SOUNDS ---
function playSuccessSound() { soundManager.play('success'); }
function playErrorSound() { soundManager.play('error'); }

// --- HINT SOUND ---
function playHintSound() { soundManager.play('hint'); } 