// Timer related variables
let timerInterval;
let timeLeft;
let timerCallback;
const countdownElement = document.getElementById('countdown');
const timerContainer = countdownElement ? countdownElement.parentElement : null;

/**
 * Initialize the timer
 * @param {number} seconds - Total seconds for the countdown
 * @param {function} callback - Function to call when timer reaches zero
 */
export function initTimer(seconds, callback) {
    timeLeft = seconds;
    timerCallback = callback;
    
    // Update the countdown display
    updateTimerDisplay();
    
    // Start the interval
    timerInterval = setInterval(() => {
        timeLeft--;
        
        // Update the display
        updateTimerDisplay();
        
        // Check if time is up
        if (timeLeft <= 0) {
            stopTimer();
            if (timerCallback) {
                timerCallback();
            }
        }
    }, 1000);
}

/**
 * Update the timer display
 */
function updateTimerDisplay() {
    if (!countdownElement) return;
    
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    
    // Format as MM:SS
    const formattedTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    
    // Update the display
    countdownElement.textContent = formattedTime;
    
    // Update timer container styling based on time remaining
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