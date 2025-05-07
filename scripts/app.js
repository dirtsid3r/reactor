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

// Add debugging info to the page
function addDebugInfo(message) {
    console.log("DEBUG:", message);
    // Only add visible debug in development
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        const debugContainer = document.getElementById('debug-container') || (() => {
            const container = document.createElement('div');
            container.id = 'debug-container';
            container.style.position = 'fixed';
            container.style.bottom = '10px';
            container.style.left = '10px';
            container.style.backgroundColor = 'rgba(0,0,0,0.8)';
            container.style.color = '#ff0';
            container.style.padding = '10px';
            container.style.fontFamily = 'monospace';
            container.style.fontSize = '12px';
            container.style.zIndex = '9999';
            container.style.maxHeight = '200px';
            container.style.overflow = 'auto';
            document.body.appendChild(container);
            return container;
        })();
        
        const msgElem = document.createElement('div');
        msgElem.textContent = message;
        debugContainer.appendChild(msgElem);
    }
}

const soundManager = {
    sounds: {},
    humInstance: null,
    unlocked: false,
    load() {
        console.log('Loading sound files...');
        for (const [key, src] of Object.entries(soundFiles)) {
            console.log(`Loading sound: ${key} from ${src}`);
            addDebugInfo(`Loading sound: ${key} from ${src}`);
            
            const audio = new Audio(src);
            
            // Add canplaythrough event listener
            audio.addEventListener('canplaythrough', () => {
                console.log(`Sound ${key} loaded successfully`);
                addDebugInfo(`Sound ${key} loaded successfully`);
            });
            
            audio.onerror = (e) => {
                console.error(`Failed to load sound ${key} from ${src}:`, e);
                addDebugInfo(`Failed to load sound ${key} from ${src}: ${e.target.error ? e.target.error.code : 'unknown error'}`);
                
                // Try an alternative approach for MP3 files
                if (src.endsWith('.mp3')) {
                    // Create a fetch request to check if the file exists
                    fetch(src)
                        .then(response => {
                            if (!response.ok) {
                                throw new Error(`HTTP error! status: ${response.status}`);
                            }
                            addDebugInfo(`Fetch for ${src} succeeded, but Audio API failed. Status: ${response.status}`);
                            return response.blob();
                        })
                        .then(blob => {
                            // Try to create an object URL
                            const objectUrl = URL.createObjectURL(blob);
                            addDebugInfo(`Created object URL for ${key}: ${objectUrl}`);
                            
                            const newAudio = new Audio(objectUrl);
                            newAudio.volume = audio.volume;
                            this.sounds[key] = newAudio;
                            
                            newAudio.addEventListener('canplaythrough', () => {
                                addDebugInfo(`Sound ${key} loaded successfully via blob`);
                            });
                            
                            newAudio.onerror = (err) => {
                                addDebugInfo(`Still failed to load ${key} via blob: ${err}`);
                            };
                        })
                        .catch(error => {
                            addDebugInfo(`Fetch for ${src} failed: ${error.message}`);
                        });
                }
            };
            
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
                
                // Try to play the hum with better error handling
                try {
                    const playPromise = this.humInstance.play();
                    if (playPromise !== undefined) {
                        playPromise.catch(e => {
                            console.warn('Hum play failed:', e);
                            addDebugInfo(`Hum play failed: ${e.message}`);
                            
                            // Try to recreate and reload the audio
                            setTimeout(() => {
                                try {
                                    // Try with fetch first
                                    fetch(soundFiles.hum)
                                        .then(response => {
                                            if (!response.ok) {
                                                throw new Error(`HTTP error! status: ${response.status}`);
                                            }
                                            return response.blob();
                                        })
                                        .then(blob => {
                                            const objectUrl = URL.createObjectURL(blob);
                                            const newHum = new Audio(objectUrl);
                                            newHum.loop = true;
                                            newHum.volume = this.sounds.hum.volume;
                                            newHum.play().catch(err => {
                                                console.error('Retry hum via blob failed:', err);
                                                addDebugInfo(`Retry hum via blob failed: ${err.message}`);
                                            });
                                            this.humInstance = newHum;
                                        })
                                        .catch(error => {
                                            console.error('Fetch for hum failed:', error);
                                            addDebugInfo(`Fetch for hum failed: ${error.message}`);
                                            
                                            // Traditional approach as last resort
                                            const newHum = new Audio(soundFiles.hum + '?t=' + Date.now());
                                            newHum.loop = true;
                                            newHum.volume = this.sounds.hum.volume;
                                            newHum.play().catch(err => {
                                                console.error('Last resort hum failed:', err);
                                                addDebugInfo(`Last resort hum failed: ${err.message}`);
                                            });
                                            this.humInstance = newHum;
                                        });
                                } catch (fetchError) {
                                    console.error('Error setting up hum retry:', fetchError);
                                    addDebugInfo(`Error setting up hum retry: ${fetchError.message}`);
                                }
                            }, 1000);
                        });
                    }
                } catch (e) {
                    console.error('Error playing hum:', e);
                    addDebugInfo(`Error playing hum: ${e.message}`);
                }
            } else if (this.humInstance.paused) {
                this.humInstance.play().catch(e => {
                    console.warn('Hum play failed on resume:', e);
                    addDebugInfo(`Hum play failed on resume: ${e.message}`);
                });
            }
            return;
        }
        
        if (this.sounds[key]) {
            try {
                const sfx = this.sounds[key].cloneNode();
                sfx.volume = this.sounds[key].volume;
                
                const playPromise = sfx.play();
                if (playPromise !== undefined) {
                    playPromise.catch(e => {
                        console.warn(`Sound ${key} play failed:`, e);
                        addDebugInfo(`Sound ${key} play failed: ${e.message}`);
                        
                        // Try with fetch as an alternative
                        fetch(soundFiles[key])
                            .then(response => {
                                if (!response.ok) {
                                    throw new Error(`HTTP error! status: ${response.status}`);
                                }
                                return response.blob();
                            })
                            .then(blob => {
                                const objectUrl = URL.createObjectURL(blob);
                                const newSfx = new Audio(objectUrl);
                                newSfx.volume = this.sounds[key].volume;
                                newSfx.play().catch(err => console.error(`Retry ${key} via blob failed:`, err));
                            })
                            .catch(error => {
                                console.error(`Fetch for ${key} failed:`, error);
                                addDebugInfo(`Fetch for ${key} failed: ${error.message}`);
                                
                                // Last resort - try a different URL with cache busting
                                const newSfx = new Audio(soundFiles[key] + '?t=' + Date.now());
                                newSfx.volume = this.sounds[key].volume;
                                newSfx.play().catch(err => console.error(`Last resort ${key} failed:`, err));
                            });
                    });
                }
            } catch (e) {
                console.error(`Error playing ${key}:`, e);
                addDebugInfo(`Error playing ${key}: ${e.message}`);
            }
        } else {
            console.warn(`Sound ${key} not loaded`);
            addDebugInfo(`Sound ${key} not loaded`);
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
        console.log('Attempting to unlock audio...');
        // Create and play a silent audio to unlock audio context
        const silentAudio = new Audio("data:audio/mp3;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4LjI5LjEwMAAAAAAAAAAAAAAA//tQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWGluZwAAAA8AAAACAAABGgD///////////////////////////////////////////8AAAA8TEFNRTMuMTAwAQAAAAAAAAAAABSAJAaWQgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA//sQZAAP8AAAaQAAAAgAAA0gAAABAAABpAAAACAAADSAAAAETEFNRTMuMTAwVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV");
        silentAudio.play().then(() => {
            console.log('Audio unlocked successfully!');
            soundManager.unlockAll();
            appendToTerminalWithFormatting('\n<span class="system-text">&gt; AUDIO UNLOCKED</span>');
            // Fallback: retry hum after 2s if not playing
            setTimeout(() => { soundManager.play('hum'); }, 2000);
        }).catch(e => {
            console.warn('Silent audio unlock failed:', e);
            // Try manual unlock anyway
            soundManager.unlockAll();
        });
    }
    window.removeEventListener('click', unlockAudioOnce);
    window.removeEventListener('keydown', unlockAudioOnce);
}
window.addEventListener('click', unlockAudioOnce);
window.addEventListener('keydown', unlockAudioOnce);

// Initialize the game
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOMContentLoaded event fired');
    
    // Re-define DOM element references to ensure they're properly captured
    // Core elements
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

    // Terminal elements
    const terminalInput = document.getElementById('terminal-input');
    const terminalSubmit = document.getElementById('terminal-submit');

    // AI Assistant elements
    const assistantInput = document.getElementById('assistant-input');
    const assistantSubmit = document.getElementById('assistant-submit');
    const assistantMessages = document.getElementById('assistant-messages');
    
    // Log to validate DOM elements
    console.log('DOM Elements detected:');
    console.log('- Terminal Submit:', terminalSubmit ? 'Found' : 'Missing');
    console.log('- Assistant Submit:', assistantSubmit ? 'Found' : 'Missing');
    console.log('- E.C.H.O. Tab:', document.querySelector('.tab[data-tab="support"]') ? 'Found' : 'Missing');
    
    // Don't play hum until unlocked by user interaction
    loadSavedPuzzles();
    initGame();
    addEventListeners();
    setupAdminPanel();
    
    // Debug sound loading status in the UI
    window.debugSounds = function() {
        console.log('Checking sound loading status...');
        const results = document.createElement('div');
        results.style.position = 'fixed';
        results.style.bottom = '10px';
        results.style.right = '10px';
        results.style.backgroundColor = 'rgba(0,0,0,0.8)';
        results.style.color = '#0f0';
        results.style.padding = '10px';
        results.style.fontFamily = 'monospace';
        results.style.zIndex = '9999';
        results.style.maxHeight = '200px';
        results.style.overflow = 'auto';
        results.style.fontSize = '12px';
        
        let html = '<h3>Sound Loading Status</h3><ul>';
        for (const [key, src] of Object.entries(soundFiles)) {
            const audio = soundManager.sounds[key];
            html += `<li>${key}: ${src}<br>`;
            html += `Loaded: ${audio ? 'Yes' : 'No'}, `;
            if (audio) {
                html += `Ready: ${audio.readyState}, `;
                html += `Error: ${audio.error ? audio.error.code : 'None'}`;
                // Try to play a test version
                const test = new Audio(src + '?test=' + Date.now());
                test.volume = 0;
                test.muted = true;
                test.oncanplay = () => {
                    const li = results.querySelector(`li[data-key="${key}"]`);
                    if (li) li.innerHTML += ' <span style="color:#0f0">✓ Works</span>';
                };
                test.onerror = () => {
                    const li = results.querySelector(`li[data-key="${key}"]`);
                    if (li) li.innerHTML += ' <span style="color:#f00">✗ Error</span>';
                };
                test.load();
            }
            html += '</li>';
        }
        html += '</ul>';
        html += '<button onclick="this.parentNode.remove()">Close</button>';
        results.innerHTML = html;
        document.body.appendChild(results);
        
        // Tag each item
        results.querySelectorAll('li').forEach((li, idx) => {
            li.setAttribute('data-key', Object.keys(soundFiles)[idx]);
        });
    };
    
    // Add debug button to the terminal
    const debugBtn = document.createElement('button');
    debugBtn.textContent = 'Debug Sounds';
    debugBtn.className = 'terminal-button';
    debugBtn.style.position = 'fixed';
    debugBtn.style.bottom = '10px';
    debugBtn.style.right = '10px';
    debugBtn.addEventListener('click', window.debugSounds);
    document.body.appendChild(debugBtn);
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
        
        // Set a flag to track if we've already displayed the text
        let textDisplayed = false;
        
        // Always display the text after a short delay, regardless of audio
        setTimeout(() => {
            if (!textDisplayed) {
                console.log('Displaying text anyway as fallback');
                textDisplayed = true;
                // Start the typewriter effect with the text
                startTypewriter();
            }
        }, 1000);
        
        // Function to start typewriter
        function startTypewriter() {
            // Clear any existing text first
            if (transmissionText.textContent.includes('FAILED')) {
                transmissionText.textContent = '';
            }
            
            // Simple typewriter effect
            let idx = 0;
            const chars = transmissionScript.split('');
            const interval = setInterval(() => {
                if (idx < chars.length) {
                    transmissionText.textContent += chars[idx];
                    idx++;
                    // Auto-scroll
                    transmissionText.scrollTop = transmissionText.scrollHeight;
                } else {
                    clearInterval(interval);
                    replayBtn.style.display = 'inline-block';
                }
            }, 30);
        }
        
        // Try to play audio, but we'll show text regardless
        transmissionAudio.currentTime = 0;
        const playPromise = transmissionAudio.play();
        
        if (playPromise !== undefined) {
            playPromise.catch(e => {
                console.error('Audio play failed:', e);
                transmissionText.textContent = 'TRANSMISSION AUDIO FAILED TO PLAY. Displaying text only.';
                if (!textDisplayed) {
                    textDisplayed = true;
                    startTypewriter();
                }
            });
        }
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
        // If we have audio playing, pause it
        if (transmissionAudio) {
            transmissionAudio.pause();
            transmissionAudio.currentTime = 0;
        }
        
        // Clear any intervals that might be running the typewriter
        for (let i = 1; i < 10000; i++) {
            clearInterval(i);
        }
        
        // Show the boot sequence
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
    console.log('Setting up event listeners');
    
    // Get fresh references to all needed elements
    const startButton = document.getElementById('start-button');
    const restartButton = document.getElementById('restart-button');
    const retryButton = document.getElementById('retry-button');
    const terminalInput = document.getElementById('terminal-input');
    const terminalSubmit = document.getElementById('terminal-submit');
    const assistantInput = document.getElementById('assistant-input');
    const assistantSubmit = document.getElementById('assistant-submit');
    const assistantMessages = document.getElementById('assistant-messages');
    
    // Start button
    if (startButton) {
        startButton.addEventListener('click', startGame);
    } else {
        console.error('Start button not found');
    }
    
    // Restart and retry buttons
    if (restartButton) restartButton.addEventListener('click', resetGame);
    if (retryButton) retryButton.addEventListener('click', resetGame);
    
    // Tab switching - Fixed to ensure E.C.H.O. tab works
    document.querySelectorAll('.tab').forEach(tab => {
        tab.addEventListener('click', function(e) {
            e.preventDefault();
            const tabName = this.getAttribute('data-tab');
            console.log('Tab clicked:', tabName); // Debug logging
            
            // If already active, do nothing
            if (this.classList.contains('active')) return;
            
            // Update active tab
            document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            
            // Show selected tab content
            document.querySelectorAll('.tab-content').forEach(content => {
                content.classList.add('hidden');
            });
            
            // Find tab content and remove hidden class
            const tabContent = document.getElementById(`${tabName}-tab`);
            if (tabContent) {
                tabContent.classList.remove('hidden');
                console.log('Tab content displayed:', tabName); // Debug logging
            } else {
                console.error('Tab content not found:', tabName); // Error logging
            }
            
            // If support tab is opened, show welcome message if empty
            if (tabName === 'support' && assistantMessages && assistantMessages.childElementCount === 0) {
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
    if (terminalInput) {
        terminalInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                handleTerminalSubmit();
            }
        });
        
        // Secret reset shortcut - Enter 'resetgame' in terminal
        terminalInput.addEventListener('input', checkForSecretCodes);
    } else {
        console.error('Terminal input not found');
    }
    
    // Terminal submit button - Fixed with proper reference and error handling
    if (terminalSubmit) {
        console.log('Binding terminal submit button'); // Debug logging
        terminalSubmit.addEventListener('click', function(e) {
            console.log('Terminal submit button clicked'); // Debug logging
            handleTerminalSubmit();
        });
    } else {
        console.error('Terminal submit button not found'); // Error logging
    }
    
    // AI Assistant submit button - Fixed event binding
    if (assistantSubmit) {
        console.log('Binding assistant submit button'); // Debug logging
        assistantSubmit.addEventListener('click', function() {
            console.log('Assistant submit button clicked');
            handleAssistantSubmit();
        });
    } else {
        console.error('Assistant submit button not found'); // Error logging
    }
    
    // AI Assistant input field
    if (assistantInput) {
        assistantInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                handleAssistantSubmit();
            }
        });
    } else {
        console.error('Assistant input not found');
    }
    
    // Admin panel toggle shortcut - Alt+A
    document.addEventListener('keydown', (e) => {
        // Toggle admin panel with Alt+A
        if (e.altKey && e.key === 'a') {
            toggleAdminPanel();
        }
    });
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
    
    // Save puzzle data to localStorage
    localStorage.setItem('nrrcPuzzles', JSON.stringify(puzzleData));
    
    // Reset admin panel
    toggleAdminPanel();
    
    // Reset game state
    resetGame();
    
    // Show success message
    appendToTerminalWithFormatting('\n\n> PUZZLE SAVED SUCCESSFULLY\n> RESETTING ALL SYSTEMS...');
}

// Save all puzzles
function saveAllPuzzles() {
    // Save each puzzle to localStorage
    gameState.editedPuzzles.forEach(puzzle => {
        savePuzzle(puzzle);
    });
    
    // Show success message
    appendToTerminalWithFormatting('\n\n> ALL PUZZLES SAVED SUCCESSFULLY\n> RESETTING ALL SYSTEMS...');
    
    // Reset game state
    resetGame();
}

// Export puzzles
function exportPuzzles() {
    // Convert puzzles to JSON string
    const puzzlesJson = JSON.stringify(gameState.editedPuzzles);
    
    // Create a Blob with the JSON data
    const blob = new Blob([puzzlesJson], { type: 'application/json' });
    
    // Create a download link
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'nrrc_puzzles.json';
    link.click();
    
    // Clean up
    URL.revokeObjectURL(link.href);
}

// Import puzzles
function importPuzzles() {
    // Trigger file input
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = function(event) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                const puzzlesJson = e.target.result;
                try {
                    const puzzles = JSON.parse(puzzlesJson);
                    gameState.editedPuzzles = puzzles;
                    gameState.totalPuzzles = puzzles.length;
                    console.log('Loaded puzzles from file');
                    
                    // Reset admin panel
                    toggleAdminPanel();
                    
                    // Reset game state
                    resetGame();
                    
                    // Show success message
                    appendToTerminalWithFormatting('\n\n> PUZZLES IMPORTED SUCCESSFULLY\n> RESETTING ALL SYSTEMS...');
                } catch (error) {
                    console.error('Error loading puzzles:', error);
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

// Handle terminal submit
function handleTerminalSubmit() {
    const userInput = terminalInput.value.trim();
    soundManager.play('keystroke');
    
    if (userInput === '') return;
    
    // Get current puzzle from edited puzzles
    const puzzle = gameState.editedPuzzles[gameState.currentPuzzle];
    
    // Check if the answer is correct
    if (userInput.toLowerCase() === puzzle.passphrase.toLowerCase()) {
        // Play success sound
        soundManager.play('success');
        
        // Success animation
        document.getElementById('terminal-display').classList.add('success-flash');
        setTimeout(() => {
            document.getElementById('terminal-display').classList.remove('success-flash');
        }, 500);
        
        // Clear the input
        terminalInput.value = '';
        
        // Clean up sorting puzzle if active
        if (isSortingPuzzleActive && typeof isSortingPuzzleActive === 'function' && isSortingPuzzleActive()) {
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
                    
                    // Play button sound
                    soundManager.play('button');
                    
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
                
                // Play button sound
                soundManager.play('button');
                
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
        // Play error sound
        soundManager.play('error');
        
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

// Returns a set of introduction messages for E.C.H.O.
function getEchoIntroMessages() {
    return [
        "INITIALIZING E.C.H.O...",
        "Environmental Carbon Helper Operative online and ready to assist.",
        "My systems indicate that you're attempting to repair the N.R.R.C facility. I'm here to provide hints and guidance on your mission.",
        "If you need a hint about the current component, just ask. Or we can discuss the environmental impact of carbon recycling if you prefer."
    ];
}

// Add chat messages sequentially with delay
function addChatMessages(messages, sender, delay = 300) {
    if (!Array.isArray(messages) || messages.length === 0) return;
    
    let index = 0;
    
    function addNextMessage() {
        if (index < messages.length) {
            addMessageToChat(messages[index], sender);
            index++;
            setTimeout(addNextMessage, delay);
        }
    }
    
    addNextMessage();
}

// Add a message to the AI chat
function addMessageToChat(message, sender) {
    console.log(`Adding ${sender} message to chat:`, message.substring(0, 30) + (message.length > 30 ? '...' : ''));
    
    // Get fresh reference to messages container
    const assistantMessages = document.getElementById('assistant-messages');
    if (!assistantMessages) {
        console.error('Assistant messages container not found');
        return;
    }
    
    const messageElement = document.createElement('div');
    messageElement.classList.add('message');
    messageElement.classList.add(sender === 'user' ? 'user-message' : 'ai-message');
    messageElement.textContent = message;
    
    try {
        assistantMessages.appendChild(messageElement);
        assistantMessages.scrollTop = assistantMessages.scrollHeight;
        
        // Play hint sound if it's an AI message
        if (sender === 'ai') {
            soundManager.play('hint');
        }
    } catch (error) {
        console.error('Error adding message to chat:', error);
    }
}

// Handle AI assistant submit
function handleAssistantSubmit() {
    console.log('handleAssistantSubmit called');
    
    // Get fresh references
    const assistantInput = document.getElementById('assistant-input');
    const assistantMessages = document.getElementById('assistant-messages');
    
    if (!assistantInput || !assistantMessages) {
        console.error('Assistant elements not found:', {
            input: !!assistantInput,
            messages: !!assistantMessages
        });
        return;
    }
    
    const userInput = assistantInput.value.trim();
    
    if (userInput === '') return;
    
    console.log('Processing assistant input:', userInput);
    
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
    
    // Analyze user input for different types of queries
    const input = userInput.toLowerCase();
    const isAskingForHint = /hint|clue|help|stuck|how|what|solve|answer|solution/i.test(input);
    const isGreeting = /^(hi|hello|hey|greetings|sup|yo|howdy)/i.test(input);
    const isAskingAboutAssistant = /(who|what).*you|your name|about you/i.test(input);
    const isAskingAboutProcess = /how.*work|process|explain|reactor|recycling/i.test(input);
    const isThanking = /thank|thanks|appreciated|helpful/i.test(input);
    const isCommentingOnAI = /\b(ai|artificial|intelligence|robot|bot|computer)\b/i.test(input);
    const isAskingObvious = /\b(life|alive|human|real|purpose|meaning)\b/i.test(input);
    
    // Shorter delay to make it more responsive (2s instead of 3s)
    setTimeout(() => {
        try {
            // Remove thinking indicator
            if (thinkingElement.parentNode) {
                assistantMessages.removeChild(thinkingElement);
            }
            
            // Select appropriate response
            if (isAskingForHint) {
                // Get appropriate hint based on hints used
                const hintIndex = Math.min(gameState.hintsUsed, puzzle.hints.length - 1);
                const hint = puzzle.hints[hintIndex];
                
                // Add AI message with hint
                addMessageToChat(hint, 'ai');
                
                // Increment hints used
                gameState.hintsUsed++;
            } 
            else if (isGreeting) {
                const greetings = [
                    "Hello! I'm E.C.H.O., your Environmental Carbon Helper Operative. How can I assist with the reactor today?",
                    "Greetings! E.C.H.O. at your service. Need a hint?",
                    "Hi there! I'm here to help you save the facility. Need assistance?"
                ];
                
                addMessageToChat(greetings[Math.floor(Math.random() * greetings.length)], 'ai');
            }
            else if (isAskingAboutAssistant) {
                addMessageToChat("I am E.C.H.O. - Environmental Carbon Helper Operative, an AI designed to assist with nuclear carbon recycling operations. I can provide hints about the reactor components you're trying to repair.", 'ai');
            }
            else if (isAskingAboutProcess) {
                addMessageToChat("The N.R.R.C. facility uses advanced fission to break down carbon compounds into base elements, then reconfigures them into reusable materials. This reduces greenhouse emissions by over 90% compared to traditional methods. The reactor you're trying to fix prevents thousands of metric tons of carbon from entering the atmosphere annually.", 'ai');
            }
            else if (isThanking) {
                const thanks = [
                    "You're welcome! I'm here to help.",
                    "Happy to assist. Need anything else?",
                    "No problem. Good luck with the reactor repairs!"
                ];
                
                addMessageToChat(thanks[Math.floor(Math.random() * thanks.length)], 'ai');
            }
            else {
                // Generic responses
                const responses = [
                    "I'm not sure I understand. If you need a hint about the current reactor component, just ask.",
                    "If you're stuck on the current puzzle, try asking for a hint.",
                    "I'm here to help with the reactor components. Need a hint?"
                ];
                
                const randomResponse = responses[Math.floor(Math.random() * responses.length)];
                addMessageToChat(randomResponse, 'ai');
            }
        } catch (error) {
            console.error('Error in assistant response:', error);
            // Try to add error message to chat if possible
            try {
                if (assistantMessages) {
                    addMessageToChat("Sorry, I encountered an error processing your request. Please try again.", 'ai');
                }
            } catch (e) {
                console.error('Failed to add error message to chat:', e);
            }
        }
    }, 2000); // 2 second delay
}