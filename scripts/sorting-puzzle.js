/**
 * Sorting Puzzle Module
 * Implements drag and drop sorting puzzle for terminal interface
 */

// State for the sorting puzzle
const sortingPuzzleState = {
    currentPuzzleData: null,
    isActive: false,
    completedCategories: [],
    revealedCharacters: "",
    // Keep track of event listeners for proper cleanup
    dragItems: [],
    dropZones: []
};

/**
 * Initialize the sorting puzzle
 * @param {Object} puzzleData - The data for the sorting puzzle
 * @param {Function} onComplete - Callback for when puzzle is completed
 */
export function initSortingPuzzle(puzzleData, onComplete) {
    // Reset state
    sortingPuzzleState.currentPuzzleData = puzzleData;
    sortingPuzzleState.isActive = true;
    sortingPuzzleState.completedCategories = [];
    sortingPuzzleState.revealedCharacters = "";
    sortingPuzzleState.dragItems = [];
    sortingPuzzleState.dropZones = [];
    
    // Get the terminal display to insert our puzzle UI
    const terminalDisplay = document.getElementById('terminal-display');
    
    // Clear any existing content and create the sorting puzzle UI
    createSortingPuzzleUI(terminalDisplay, puzzleData, onComplete);
}

/**
 * Create the sorting puzzle UI
 * @param {HTMLElement} container - Container to append the puzzle UI
 * @param {Object} puzzleData - The data for the sorting puzzle
 * @param {Function} onComplete - Callback for when puzzle is completed
 */
function createSortingPuzzleUI(container, puzzleData, onComplete) {
    // Create the puzzle container with a sci-fi terminal style
    const puzzleContainer = document.createElement('div');
    puzzleContainer.className = 'sorting-puzzle-container';
    puzzleContainer.innerHTML = `
        <div class="puzzle-instructions">
            <div class="instruction-header">> SYSTEM DIAGNOSTIC INTERFACE</div>
            <div class="instruction-text">${puzzleData.instructions}</div>
        </div>
        <div class="items-container" id="items-container"></div>
        <div class="sorting-area">
            ${puzzleData.categories.map(category => `
                <div class="sorting-category" id="category-${category.name.toLowerCase().replace(/\s+/g, '-')}">
                    <div class="category-header">${category.name}</div>
                    <div class="category-dropzone" data-category="${category.name}"></div>
                    <div class="category-reveal">
                        <span class="reveal-characters" data-revealed="false" data-characters="${category.revealedCharacters}">
                            ${'?'.repeat(category.revealedCharacters.length)}
                        </span>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
    
    // Append the puzzle container to the terminal display
    container.appendChild(puzzleContainer);
    
    // Create the items as compact cards above the categories
    createItemElements(puzzleData.items);
    
    // Initialize drag and drop functionality
    initializeDragAndDrop();
}

/**
 * Create draggable item elements
 * @param {Array} items - Array of items to create
 */
function createItemElements(items) {
    const itemsContainer = document.getElementById('items-container');
    // Randomize the items order for the puzzle
    const shuffledItems = [...items].sort(() => Math.random() - 0.5);
    shuffledItems.forEach(item => {
        const itemElement = document.createElement('div');
        itemElement.className = 'sorting-item';
        itemElement.id = item.id;
        itemElement.draggable = true;
        itemElement.dataset.category = item.category;
        itemElement.title = item.description || '';
        itemElement.innerHTML = `<span class='item-name'>${item.name}</span>`;
        itemsContainer.appendChild(itemElement);
    });
}

/**
 * Initialize drag and drop functionality
 */
function initializeDragAndDrop() {
    const items = document.querySelectorAll('.sorting-item');
    const categories = document.querySelectorAll('.sorting-category');

    // Clear any existing event listeners
    sortingPuzzleState.dragItems.forEach(item => {
        item.element.removeEventListener('dragstart', item.dragStart);
        item.element.removeEventListener('dragend', item.dragEnd);
    });
    
    sortingPuzzleState.dropZones.forEach(zone => {
        zone.element.removeEventListener('dragover', zone.dragOver);
        zone.element.removeEventListener('dragleave', zone.dragLeave);
        zone.element.removeEventListener('drop', zone.drop);
    });
    
    // Reset tracking arrays
    sortingPuzzleState.dragItems = [];
    sortingPuzzleState.dropZones = [];

    // Add drag event listeners to items
    items.forEach(item => {
        // Store event handlers to allow proper removal later
        const dragStart = e => {
            e.dataTransfer.setData('text/plain', item.id);
            item.classList.add('dragging');
            setTimeout(() => {
                item.style.opacity = '0.7';
            }, 0);
        };
        
        const dragEnd = () => {
            item.classList.remove('dragging');
            item.style.opacity = '1';
        };
        
        // Add the event listeners
        item.addEventListener('dragstart', dragStart);
        item.addEventListener('dragend', dragEnd);
        
        // Keep track of items and their handlers
        sortingPuzzleState.dragItems.push({
            element: item,
            dragStart: dragStart,
            dragEnd: dragEnd
        });
    });

    // Make the entire category box a drop target
    categories.forEach(categoryBox => {
        const dropZone = categoryBox.querySelector('.category-dropzone');
        const categoryName = dropZone.dataset.category;

        // Store event handlers for proper cleanup
        const dragOver = e => {
            e.preventDefault();
            categoryBox.classList.add('drag-over');
            dropZone.classList.add('drag-over');
        };
        
        const dragLeave = e => {
            categoryBox.classList.remove('drag-over');
            dropZone.classList.remove('drag-over');
        };
        
        const drop = e => {
            e.preventDefault();
            categoryBox.classList.remove('drag-over');
            dropZone.classList.remove('drag-over');
            const itemId = e.dataTransfer.getData('text/plain');
            const item = document.getElementById(itemId);
            if (!item) return;
            // Only allow correct items
            if (item.dataset.category === categoryName) {
                dropZone.appendChild(item);
                
                // Important: Preserve the item's draggable property and ensure it remains functional
                item.draggable = true;
                
                // Reattach drag events to ensure they still work after being moved
                const dragItem = sortingPuzzleState.dragItems.find(d => d.element.id === itemId);
                if (dragItem) {
                    dragItem.element.addEventListener('dragstart', dragItem.dragStart);
                    dragItem.element.addEventListener('dragend', dragItem.dragEnd);
                }
                
                checkCategoryCompletion(dropZone);
            } else {
                item.classList.add('error');
                setTimeout(() => {
                    item.classList.remove('error');
                }, 500);
            }
        };
        
        // Add the event listeners
        categoryBox.addEventListener('dragover', dragOver);
        categoryBox.addEventListener('dragleave', dragLeave);
        categoryBox.addEventListener('drop', drop);
        
        // Keep track of drop zones and their handlers
        sortingPuzzleState.dropZones.push({
            element: categoryBox,
            dragOver: dragOver,
            dragLeave: dragLeave,
            drop: drop
        });
    });
}

/**
 * Check if a category is complete with the correct items
 * @param {HTMLElement} categoryZone - The category drop zone to check
 */
function checkCategoryCompletion(categoryZone) {
    const categoryName = categoryZone.dataset.category;
    const items = sortingPuzzleState.currentPuzzleData.items.filter(item => item.category === categoryName);
    const placedItems = categoryZone.querySelectorAll('.sorting-item');
    
    // Check if the number of items matches what should be in this category
    if (placedItems.length === items.length) {
        // All items for this category have been placed correctly
        const categoryElement = categoryZone.closest('.sorting-category');
        const revealElement = categoryElement.querySelector('.reveal-characters');
        const chars = revealElement.getAttribute('data-characters');
        // Reveal the characters for this category (all revealed)
        revealElement.textContent = chars;
        revealElement.dataset.revealed = 'true';
        // Add visual feedback
        categoryElement.classList.add('category-completed');
        // Play success sound if supported
        playSound('success');
        // Add to completed categories
        if (!sortingPuzzleState.completedCategories.includes(categoryName)) {
            sortingPuzzleState.completedCategories.push(categoryName);
            updateRevealedCharacters();
        }
        
        // Ensure items remain draggable for flexibility
        placedItems.forEach(item => {
            item.draggable = true;
        });
    }
}

/**
 * Update the revealed characters display
 */
function updateRevealedCharacters() {
    const allCategories = sortingPuzzleState.currentPuzzleData.categories;
    let revealedText = '';
    allCategories.forEach(category => {
        let revealed = false;
        if (sortingPuzzleState.completedCategories.includes(category.name)) {
            revealedText += category.revealedCharacters;
            revealed = true;
        } else {
            revealedText += '?'.repeat(category.revealedCharacters.length);
        }
        // Update the UI for each category
        const catDiv = document.getElementById(`category-${category.name.toLowerCase().replace(/\s+/g, '-')}`);
        if (catDiv) {
            const revealElement = catDiv.querySelector('.reveal-characters');
            if (revealed) {
                revealElement.textContent = category.revealedCharacters;
                revealElement.dataset.revealed = 'true';
            } else {
                // Show question marks for unrevealed
                revealElement.textContent = '?'.repeat(category.revealedCharacters.length);
                revealElement.dataset.revealed = 'false';
            }
        }
    });
    sortingPuzzleState.revealedCharacters = revealedText;
    // Check if all categories are complete
    if (sortingPuzzleState.completedCategories.length === allCategories.length) {
        // All categories complete - update instruction text
        const instructionText = document.querySelector('.instruction-text');
        instructionText.textContent = 'All categories sorted correctly. Enter the revealed passphrase to repair the component.';
    }
}

/**
 * Play a sound effect
 * @param {string} type - The type of sound to play
 */
function playSound(type) {
    // Use global sound manager if available
    if (window.soundManager && typeof window.soundManager.play === 'function') {
        window.soundManager.play(type);
    }
}

/**
 * Clean up the sorting puzzle
 */
export function cleanupSortingPuzzle() {
    // Clean up event listeners
    sortingPuzzleState.dragItems.forEach(item => {
        if (item.element) {
            item.element.removeEventListener('dragstart', item.dragStart);
            item.element.removeEventListener('dragend', item.dragEnd);
        }
    });
    
    sortingPuzzleState.dropZones.forEach(zone => {
        if (zone.element) {
            zone.element.removeEventListener('dragover', zone.dragOver);
            zone.element.removeEventListener('dragleave', zone.dragLeave);
            zone.element.removeEventListener('drop', zone.drop);
        }
    });
    
    // Reset state
    sortingPuzzleState.isActive = false;
    sortingPuzzleState.currentPuzzleData = null;
    sortingPuzzleState.dragItems = [];
    sortingPuzzleState.dropZones = [];
    
    // Remove the puzzle UI
    const puzzleContainer = document.querySelector('.sorting-puzzle-container');
    if (puzzleContainer) {
        puzzleContainer.remove();
    }
}

/**
 * Check if the sorting puzzle is active
 * @returns {boolean} Whether the sorting puzzle is active
 */
export function isSortingPuzzleActive() {
    return sortingPuzzleState.isActive;
}

/**
 * Get the current revealed characters
 * @returns {string} The currently revealed characters
 */
export function getRevealedCharacters() {
    return sortingPuzzleState.revealedCharacters;
} 