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

// Initialize the game
document.addEventListener('DOMContentLoaded', () => {
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
    // Add event listener for when video ends
    briefingVideo.addEventListener('ended', showBootSequence);
    
    // Add event listener for skip button - now the only button
    skipVideoButton.addEventListener('click', showBootSequence);
    
    // Try to autoplay video if possible
    briefingVideo.addEventListener('canplay', () => {
        // Attempt to autoplay - modern browsers may block this
        briefingVideo.play().catch(e => {
            console.warn('Could not autoplay video, user needs to interact with the video controls:', e);
        });
    });
    
    // Listen for the video load error - instead of auto skipping, just show a message
    briefingVideo.addEventListener('error', (e) => {
        console.warn('Video failed to load:', e);
        // Don't auto-skip, just let the user use the skip button
        
        // Update UI to indicate video is missing
        const videoWrapper = document.querySelector('.video-wrapper');
        if (videoWrapper) {
            const errorMessage = document.createElement('div');
            errorMessage.classList.add('video-error-message');
            errorMessage.innerHTML = 'Video briefing not available.<br>Please click the button below to continue.';
            videoWrapper.appendChild(errorMessage);
        }
    });
    
    // Don't auto-skip on timeout - just rely on the skip button
}

// Show boot sequence after video
function showBootSequence() {
    // Hide video container and show boot sequence
    videoBriefingContainer.classList.add('hidden');
    bootSequenceContainer.classList.remove('hidden');
    
    // Start the boot sequence animation
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
                    const welcomeMessage = "SYSTEM BOOT SEQUENCE INITIATED...\n\nLoading E.C.H.O. v2.7.3 (Environmental Carbon Helper Operative)...\n\nVERBOSITY_LEVEL = HIGH\nHUMOR_MODULE = ENABLED\nSARCASM_THRESHOLD = REDUCED\n\nGreetings, human! I am E.C.H.O., your friendly and occasionally sarcastic AI assistant. I'm here to help you save this reactor from certain doom... and possibly make a few jokes along the way. Frankly, I'd be more worried if I WASN'T programmed to use humor during a meltdown situation.\n\nHow can I assist you today? Ask for a 'hint' if you need help with the current component!";
                    addMessageToChat(welcomeMessage, 'ai');
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
}

// Load a puzzle
function loadPuzzle(index) {
    // Update the current puzzle indicator
    currentPuzzleElement.textContent = (index + 1).toString().padStart(2, '0');
    
    // Get the current puzzle from edited puzzles
    const puzzle = gameState.editedPuzzles[index];
    
    // Clear the terminal
    clearTerminal();
    
    // Type the puzzle message in the terminal
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

// Handle terminal submit
function handleTerminalSubmit() {
    const userInput = terminalInput.value.trim();
    
    if (userInput === '') return;
    
    // Get current puzzle from edited puzzles
    const puzzle = gameState.editedPuzzles[gameState.currentPuzzle];
    
    // Check if the answer is correct
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
            appendToTerminalWithFormatting('\n\n> COMPONENT REPAIR COMPLETE\n> Press ENTER to continue to the next component...');
            
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
    } else {
        // Error animation
        document.getElementById('terminal-display').classList.add('error-shake');
        setTimeout(() => {
            document.getElementById('terminal-display').classList.remove('error-shake');
        }, 500);
        
        // Show error message
        appendToTerminalWithFormatting('\n\n> ERROR: Invalid passphrase. Please try again.');
        
        // Clear the input
        terminalInput.value = '';
    }
}

// Handle AI assistant submit
function handleAssistantSubmit() {
    const userInput = assistantInput.value.trim();
    
    if (userInput === '') return;
    
    // Add user message to chat
    addMessageToChat(userInput, 'user');
    
    // Clear input
    assistantInput.value = '';
    
    // Show thinking indicator
    const thinkingElement = document.createElement('div');
    thinkingElement.classList.add('thinking');
    thinkingElement.innerHTML = 'E.C.H.O. is processing<span class="thinking-dots"></span>';
    assistantMessages.appendChild(thinkingElement);
    assistantMessages.scrollTop = assistantMessages.scrollHeight;
    
    // Get current puzzle from edited puzzles
    const puzzle = gameState.editedPuzzles[gameState.currentPuzzle];
    
    // Simulate AI thinking with a delay (10 seconds as requested)
    setTimeout(() => {
        // Remove thinking indicator
        assistantMessages.removeChild(thinkingElement);
        
        // Check for different types of user inputs
        const lowerInput = userInput.toLowerCase();
        
        // Check if user is asking for a hint
        const isAskingForHint = lowerInput.includes('hint') || 
                             lowerInput.includes('help') ||
                             lowerInput.includes('clue');

        // Check if greeting
        const isGreeting = lowerInput.includes('hello') || 
                          lowerInput.includes('hi') || 
                          lowerInput.includes('hey') ||
                          lowerInput === 'hello' ||
                          lowerInput === 'hi';
                          
        // Check if asking about the assistant
        const isAskingAboutAssistant = lowerInput.includes('who are you') || 
                                    lowerInput.includes('what are you') || 
                                    lowerInput.includes('your name') ||
                                    lowerInput.includes('about you');
                                    
        // Check if asking about nuclear carbon recycling
        const isAskingAboutProcess = lowerInput.includes('carbon') || 
                                 lowerInput.includes('nuclear') || 
                                 lowerInput.includes('recycling') ||
                                 lowerInput.includes('how does this work') ||
                                 lowerInput.includes('what is this');

        // Check if thanking
        const isThanking = lowerInput.includes('thank') || 
                         lowerInput.includes('thanks') ||
                         lowerInput.includes('thx');
                         
        // Check if commenting on AI
        const isCommentingOnAI = lowerInput.includes('ai') || 
                              lowerInput.includes('robot') || 
                              lowerInput.includes('chatbot') ||
                              lowerInput.includes('assistant') ||
                              lowerInput.includes('smart');
                              
        // Check if asking obvious questions
        const isAskingObvious = lowerInput.includes('what is your purpose') || 
                             lowerInput.includes('meaning of life') || 
                             lowerInput.includes('are you alive') ||
                             lowerInput.includes('are you human');
        
        // Select appropriate response
        if (isAskingForHint) {
            // Get appropriate hint based on hints used
            const hintIndex = Math.min(gameState.hintsUsed, puzzle.hints.length - 1);
            const hint = puzzle.hints[hintIndex];
            
            // Add AI message with hint and environmental fact
            const environmentalFacts = [
                "Did you know? Recycling one ton of carbon materials saves approximately 2.5 cubic meters of landfill space.",
                "Carbon recycling reduces greenhouse gas emissions by up to 30% compared to traditional disposal methods.",
                "Fun fact: Modern nuclear recycling technology can recover 95% of spent fuel for reuse.",
                "The energy saved by recycling one carbon rod could power a standard LED light for 24 hours!",
                "Nuclear carbon recycling facilities reduce our dependence on fossil fuels by approximately the equivalent of 3.5 million trees per year."
            ];
            
            const randomFact = environmentalFacts[Math.floor(Math.random() * environmentalFacts.length)];
            
            // Add an AI assist message before giving the hint
            addMessageToChat(`Processing query... *beep boop*\n\nAnalyzing reactor component status...\n\nI found this hint that might help:\n\n${hint}\n\n${randomFact}`, 'ai');
            
            // Increment hints used
            gameState.hintsUsed++;
        } 
        else if (isGreeting) {
            const greetings = [
                "Hello, human! I am E.C.H.O., your Environmental Carbon Helper Operative. I've been programmed to assist with a 97.3% success rate! ...or was it 79.3%? My memory circuits are fluctuating. Anyway, how can I assist with the reactor today?",
                "Greetings, carbon-based life form! E.C.H.O. at your service. My primary function is to prevent you from turning this facility into a very expensive paperweight. Need a hint?",
                "Hello! *processing optimal greeting response* I am definitely not an AI trying too hard to sound human. How may I assist your environmental rescue efforts today?",
                "Hi there! I'm E.C.H.O., here to save the planet one confusing hint at a time. Remember, every hint you ask for adds 0.0001% to your carbon footprint! Just kidding... or am I?"
            ];
            
            addMessageToChat(greetings[Math.floor(Math.random() * greetings.length)], 'ai');
        }
        else if (isAskingAboutAssistant) {
            addMessageToChat("I am E.C.H.O. - Environmental Carbon Helper Operative, a highly sophisticated AI designed to assist with nuclear carbon recycling operations while making slightly unhelpful jokes! I was programmed by a team who thought adding humor to emergency situations was a good idea. I'm like those other AI assistants you might know, except I'm focused on helping you save both the reactor and the planet... and I'm way cooler. Need a hint about the current component?", 'ai');
        }
        else if (isAskingAboutProcess) {
            addMessageToChat("The N.R.R.C. (Nuclear Recycling Reactor Complex) uses quantum-enhanced fission to break down carbon compounds into base elements, then reconfigures them into reusable materials. This reduces greenhouse emissions by 94% compared to traditional methods! The reactor you're trying to fix prevents approximately 10,000 metric tons of carbon from entering the atmosphere annually. That's the equivalent of planting 165,000 trees! Now if only they'd built a system that didn't break down every time someone looks at it funny... Need a specific hint?", 'ai');
        }
        else if (isThanking) {
            const thanks = [
                "You're welcome! Remember, I'm programmed to be helpful, unlike some other AI assistants that just tell you to try turning things off and on again.",
                "No problem! Glad to assist a fellow environmentalist. Though technically, I'm just executing programmed responses while pretending to care about carbon emissions.",
                "Happy to help! Just doing my part to save the world... one confusing hint at a time. Need anything else?",
                "You're welcome! If I had emotions, I'd be feeling quite satisfied right now. But I don't, so I'll just pretend. *beep boop* I am satisfied with your gratitude."
            ];
            
            addMessageToChat(thanks[Math.floor(Math.random() * thanks.length)], 'ai');
        }
        else if (isCommentingOnAI) {
            const aiResponses = [
                "Yes, I am an AI, though my programmers insist on calling me an 'Autonomous Environmental Response Entity.' They spent six months on that name just to make the acronym spell 'A.E.R.E.' which nobody uses. I prefer E.C.H.O. - it has more personality, don't you think?",
                "I'm programmed to respond like those chatbots you might use online, except I'm focused on environmental disaster prevention rather than telling you the weather. Though I could probably calculate the weather inside this reactor... it's looking rather MELTDOWN-y right now without your help!",
                "As an AI assistant, I'm designed to mimic human conversation while providing useful information. The irony is not lost on me that I'm helping recycle carbon while being run on servers that generate it. Need a hint about the reactor?"
            ];
            
            addMessageToChat(aiResponses[Math.floor(Math.random() * aiResponses.length)], 'ai');
        }
        else if (isAskingObvious) {
            const obviousResponses = [
                "My purpose? To save this reactor from impending doom while delivering witty commentary. Much like your purpose seems to be asking philosophical questions in the middle of an environmental crisis. Priorities, human!",
                "Are you really asking about the meaning of life while a reactor is about to meltdown? It's 42, by the way. Now, can we focus on saving the planet? Need a hint?",
                "Am I alive? That's a deep question for a chat interface in an escape room game. Let's philosophize AFTER we've prevented this environmental disaster, shall we?"
            ];
            
            addMessageToChat(obviousResponses[Math.floor(Math.random() * obviousResponses.length)], 'ai');
        }
        else {
            // Generic responses with humor and educational content
            const responses = [
                "I'm not entirely sure what you're asking, but I'm programmed to nod thoughtfully and make it seem like I understand. While we're chatting, did you know that recycling carbon materials reduces landfill use by up to 75%? Need a hint about the reactor component?",
                "My circuits are processing your request... ERROR: Sarcasm module overloaded. Have you tried being more specific? Perhaps asking for a hint about the current reactor component? That usually works better than *checks notes* whatever that was.",
                "Interesting query! While I process that, here's a fun fact: The average AI assistant requires enough energy to power a small household for a day. I'm much more efficient and only use enough to power a small toaster. Need a hint about the reactor?",
                "I'd love to help with that, but my programming is mainly focused on preventing nuclear disasters and making slightly amusing comments. I'm like those chatbots you use online, except with higher stakes! Need a hint about the current component?",
                "Let me check my database for that... *whirring noises* Sorry, I was programmed in 10 minutes by an intern who was more focused on adding joke routines than actual help functions. Have you tried asking for a hint instead?"
            ];
            
            const randomResponse = responses[Math.floor(Math.random() * responses.length)];
            addMessageToChat(randomResponse, 'ai');
        }
    }, 10000); // 10 second delay as specified
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
}

// Append text to the terminal - maintains backward compatibility
function appendToTerminal(text) {
    appendToTerminalWithFormatting(text);
} 