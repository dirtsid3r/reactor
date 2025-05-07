// Timer related variables
let timerInterval;
let timeLeft;
let timerCallback;
let lastUpdateTime = 0;

// Import reference to sound manager
let soundManager;

/**
 * Initialize the timer
 * @param {number} seconds - Total seconds for the countdown
 * @param {function} callback - Function to call when timer reaches zero
 */
export function initTimer(seconds, callback) {
    timeLeft = seconds;
    timerCallback = callback;
    lastUpdateTime = Date.now();
    
    // Get reference to the sound manager from the global scope
    if (window.soundManager) {
        soundManager = window.soundManager;
    }
    
    // Update the countdown display
    updateTimerDisplay();
    
    // Clear any existing interval
    if (timerInterval) {
        clearInterval(timerInterval);
    }
    
    // Start the interval with a precise timing mechanism
    timerInterval = setInterval(() => {
        const currentTime = Date.now();
        const elapsed = currentTime - lastUpdateTime;
        
        // Only update if at least 1000ms have passed
        if (elapsed >= 1000) {
            // Update last time
            lastUpdateTime = currentTime;
            
            // Decrement time
            timeLeft--;
            
            // Update the display
            updateTimerDisplay();
            
            // Play timer sound on each second at 50% volume of current setting
            if (soundManager && timeLeft > 0) {
                // Create a temporary gain node to reduce volume just for this sound
                if (soundManager.context) {
                    try {
                        const source = soundManager.context.createBufferSource();
                        const gainNode = soundManager.context.createGain();
                        
                        // Use the normal timer sound buffer
                        source.buffer = soundManager.buffers['timer'];
                        
                        // Set gain to 50% of normal
                        gainNode.gain.value = 0.075; // 50% of 0.15
                        
                        // Connect nodes
                        source.connect(gainNode);
                        gainNode.connect(soundManager.masterGain);
                        
                        // Play the sound
                        source.start(0);
                    } catch (e) {
                        // Fallback to regular play with reduced volume setting
                        soundManager.play('timer');
                    }
                } else {
                    soundManager.play('timer');
                }
            }
            
            // Check if time is up
            if (timeLeft <= 0) {
                stopTimer();
                if (timerCallback) {
                    timerCallback();
                }
            }
        }
    }, 250); // Check more frequently to ensure we don't miss the second mark
}

/**
 * Update the timer display
 */
function updateTimerDisplay() {
    const countdownElement = document.getElementById('countdown');
    if (!countdownElement) return;
    
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    
    // Format as MM:SS
    const formattedTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    
    // Update the display
    countdownElement.textContent = formattedTime;
    
    // Update timer container styling based on time remaining
    const timerContainer = countdownElement.parentElement;
    if (timerContainer) {
        // Clear existing classes
        timerContainer.classList.remove('warning', 'critical');
        
        // Add appropriate class
        if (timeLeft <= 60) {
            timerContainer.classList.add('critical');
        } else if (timeLeft <= 300) {
            timerContainer.classList.add('warning');
        }
    }
}

/**
 * Stop the timer
 */
export function stopTimer() {
    clearInterval(timerInterval);
}

/**
 * Get the remaining time as a formatted string
 * @returns {string} Formatted time (MM:SS)
 */
export function getTimeRemaining() {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    
    // Format as MM:SS
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

/**
 * Add time to the timer
 * @param {number} seconds - Seconds to add
 */
export function addTime(seconds) {
    timeLeft += seconds;
    updateTimerDisplay();
}

/**
 * Subtract time from the timer
 * @param {number} seconds - Seconds to subtract
 */
export function subtractTime(seconds) {
    timeLeft = Math.max(0, timeLeft - seconds);
    updateTimerDisplay();
    
    if (timeLeft <= 0) {
        stopTimer();
        if (timerCallback) {
            timerCallback();
        }
    }
} 