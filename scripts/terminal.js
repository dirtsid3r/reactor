// Terminal element
let terminalElement;
let cursorElement = null;

/**
 * Initialize the terminal
 * @param {HTMLElement} element - The terminal element
 */
export function initTerminal(element) {
    terminalElement = element;
    // Initialize the cursor when the terminal is initialized
    addCursorToTerminal();
}

/**
 * Clear the terminal
 */
export function clearTerminal() {
    const terminal = document.getElementById('terminal-display');
    terminal.innerHTML = '';
    // Re-add the cursor after clearing
    addCursorToTerminal();
}

/**
 * Add a blinking cursor to the terminal
 */
export function addCursorToTerminal() {
    const terminal = document.getElementById('terminal-display');
    
    // Remove existing cursor if there is one
    if (cursorElement) {
        cursorElement.remove();
    }
    
    // Create a new cursor element
    cursorElement = document.createElement('span');
    cursorElement.classList.add('terminal-cursor');
    terminal.appendChild(cursorElement);
    
    // Scroll to bottom to ensure cursor is visible
    terminal.scrollTop = terminal.scrollHeight;
}

/**
 * Type text in the terminal with a typewriter effect
 * @param {HTMLElement} element - The element to type in
 * @param {string} text - The text to type
 * @param {number} speed - The typing speed (ms per character)
 * @param {function} callback - Function to call when typing is complete
 */
export function typeInTerminal(element, text, speed = 30, callback = null) {
    let i = 0;
    let currentText = '';
    let currentLine = '';
    let isSystemLine = false;
    
    // Remove existing cursor during typing
    if (cursorElement) {
        cursorElement.remove();
    }
    
    // Add a blinking cursor that persists during typing
    const cursor = document.createElement('span');
    cursor.classList.add('terminal-cursor');
    element.appendChild(cursor);
    
    const typeNextChar = () => {
        if (i < text.length) {
            // Get current character
            const char = text.charAt(i);
            
            // Check for line start
            if (currentLine === '' && char === '>') {
                isSystemLine = true;
                currentLine += char;
                currentText += '<span class="system-text">' + char;
            } 
            // Check for end of line
            else if (char === '\n') {
                if (isSystemLine) {
                    currentText += '</span><br>';
                    isSystemLine = false;
                } else {
                    currentText += '<br>';
                }
                currentLine = '';
            } 
            // For all other characters
            else {
                currentLine += char;
                currentText += char;
            }
            
            // Update the element's innerHTML
            element.innerHTML = currentText;
            
            // Reappend the cursor
            element.appendChild(cursor);
            
            // Increment index and set timeout for next character
            i++;
            
            // Scroll to bottom
            element.scrollTop = element.scrollHeight;
            
            // Random variation in typing speed for realism
            const randomDelay = speed * (0.5 + Math.random());
            setTimeout(typeNextChar, randomDelay);
        } else {
            // Close any open system-text spans
            if (isSystemLine) {
                currentText += '</span>';
                element.innerHTML = currentText;
            }
            
            // Typing complete, remove the cursor
            cursor.remove();
            
            // Don't add back the cursor - hide it after typing
            // This way users won't be confused about where to type
            
            // Focus on the terminal input
            const terminalInput = document.getElementById('terminal-input');
            if (terminalInput) {
                terminalInput.focus();
            }
            
            if (callback) {
                callback();
            }
        }
    };
    
    // Start typing
    typeNextChar();
}

/**
 * Add a loading effect to the terminal
 * @param {string} text - The text to show before the loading animation
 * @param {number} duration - How long to show the loading effect (ms)
 * @param {function} callback - Function to call when loading is complete
 */
export function showLoading(text, duration = 2000, callback = null) {
    const terminal = document.getElementById('terminal-display');
    
    // Temporarily remove cursor
    if (cursorElement) {
        cursorElement.remove();
    }
    
    // Create loading element
    const loadingElement = document.createElement('div');
    loadingElement.innerHTML = `${text} <span class="loading"></span>`;
    terminal.appendChild(loadingElement);
    
    // Scroll to bottom
    terminal.scrollTop = terminal.scrollHeight;
    
    // Set timeout for completion
    setTimeout(() => {
        // Remove loading animation
        loadingElement.querySelector('.loading').remove();
        
        // Append completion text
        loadingElement.innerHTML += ' Complete';
        
        // Re-add cursor
        addCursorToTerminal();
        
        // Scroll to bottom again
        terminal.scrollTop = terminal.scrollHeight;
        
        // Call callback if provided
        if (callback) {
            callback();
        }
    }, duration);
}

/**
 * Add an error message to the terminal
 * @param {string} message - The error message
 */
export function showError(message) {
    const terminal = document.getElementById('terminal-display');
    
    // Temporarily remove cursor
    if (cursorElement) {
        cursorElement.remove();
    }
    
    // Create error element
    const errorElement = document.createElement('div');
    errorElement.classList.add('error-message');
    errorElement.innerHTML = `<span class="system-text">&gt;</span> <span class="error">ERROR:</span> ${message}`;
    terminal.appendChild(errorElement);
    
    // Add shake effect to terminal
    terminal.classList.add('error-shake');
    setTimeout(() => {
        terminal.classList.remove('error-shake');
    }, 500);
    
    // Re-add cursor
    addCursorToTerminal();
    
    // Scroll to bottom
    terminal.scrollTop = terminal.scrollHeight;
}

/**
 * Add a success message to the terminal
 * @param {string} message - The success message
 */
export function showSuccess(message) {
    const terminal = document.getElementById('terminal-display');
    
    // Temporarily remove cursor
    if (cursorElement) {
        cursorElement.remove();
    }
    
    // Create success element
    const successElement = document.createElement('div');
    successElement.classList.add('success-message');
    successElement.innerHTML = `<span class="system-text">&gt;</span> <span class="success">SUCCESS:</span> ${message}`;
    terminal.appendChild(successElement);
    
    // Add flash effect to terminal
    terminal.classList.add('success-flash');
    setTimeout(() => {
        terminal.classList.remove('success-flash');
    }, 500);
    
    // Re-add cursor
    addCursorToTerminal();
    
    // Scroll to bottom
    terminal.scrollTop = terminal.scrollHeight;
}

/**
 * Append text to the terminal with proper formatting for system messages
 * @param {string} text - The text to append
 */
export function appendToTerminal(text) {
    const terminal = document.getElementById('terminal-display');
    
    // Temporarily remove cursor
    if (cursorElement) {
        cursorElement.remove();
    }
    
    // Format system messages (lines starting with >)
    const formattedText = text.replace(/^(>.*?)$/gm, '<span class="system-text">$1</span>');
    
    terminal.innerHTML += formattedText;
    
    // Re-add cursor
    addCursorToTerminal();
    
    terminal.scrollTop = terminal.scrollHeight;
} 