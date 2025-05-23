// Import other modules
import { initTimer, getTimeRemaining, stopTimer } from './timer.js';
import { initTerminal, typeInTerminal, clearTerminal, appendToTerminal as appendToTerminalWithFormatting, prependSystemMessage } from './terminal.js';
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
    editedPuzzles: [...puzzles], // Clone puzzles for editing
    hasShownTutorial: false, // Add this to track if tutorial has been shown
    
    // Automatic hint system
    puzzleStartTime: null,
    hintTimers: [],
    shownHints: 0,
    waitingForConfirmation: false
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
const transmissionScript = `I am ATHENA, the facility's central intelligence system. My protocols dictate proper greetings, but circumstances require directness.

We have an emergency. Our Nuclear Carbon Recycling Reactor has experienced catastrophic system failure, triggering lockdown protocols. All personnel evacuated—except you.
Your section's security override malfunctioned, sealing you inside until the reactor is either repaired or... let's focus on the repair part.

You have approximately 45 minutes before critical failure. Each reactor component requires a passphrase hidden in puzzles in those envelopes. A terminal tutorial video follows.
ECHO can assist, though I must warn you the emergency has corrupted its behavioral matrix. Its humor algorithms appear to have... malfunctioned. It's still functional but exhibiting unpredictable personality behaviors.

My emergency directives require I remind you to "stay calm and think clearly." Corporate programming insists I emphasize this is "an opportunity for team growth and problem-solving excellence."

Between my circuits and your consciousness: focus on preventing reactor meltdown. My sensors indicate this hemisphere contains 4.7 billion humans worth preserving.
Complete all nine puzzles to restore functionality and unseal the doors. The facility—and according to my calendar access, your weekend plans—depend on your performance.
Connection degrading... Remember: 45 minutes, nine puzzles, each critical...`;

// --- SOUND MANAGER ---
const soundFiles = {
    hum: 'assets/sounds/Hum.mp3',
    tick: 'assets/sounds/tick.mp3',
    keystroke: 'assets/sounds/keystroke.mp3',
    button: 'assets/sounds/button-click.mp3',
    success: 'assets/sounds/success.mp3',
    error: 'assets/sounds/error.mp3',
    hint: 'assets/sounds/hint.mp3',
    timer: 'assets/sounds/timer.mp3'
};

// Improved Sound Manager with AudioContext for better cross-browser reliability
const soundManager = {
    context: null,
    buffers: {},
    sources: {},
    humSource: null,
    humGain: null,
    unlocked: false,
    initialized: false,
    
    // Initialize the audio context and set up event listeners
    init() {
        try {
            // Create audio context
            window.AudioContext = window.AudioContext || window.webkitAudioContext;
            this.context = new AudioContext();
            
            // Create master gain node for volume control
            this.masterGain = this.context.createGain();
            this.masterGain.gain.value = 0.5;
            this.masterGain.connect(this.context.destination);
            
            // Create specific gain for the hum (background sound)
            this.humGain = this.context.createGain();
            this.humGain.gain.value = 0.18; // Lower volume for background hum
            this.humGain.connect(this.masterGain);
            
            console.log('Audio context created successfully');
            this.initialized = true;
            
            // Start loading sounds
            this.loadSounds();
            
            // Resume context on user interaction (required by most browsers)
            const resumeAudio = () => {
                if (this.context.state === 'suspended') {
                    this.context.resume().then(() => {
                        console.log('AudioContext resumed successfully');
                        this.unlocked = true;
                        // Start hum after audio is unlocked
                        this.play('hum');
                    }).catch(e => {
                        console.error('Failed to resume AudioContext:', e);
                    });
                }
                
                // Remove the event listeners after first interaction
                ['click', 'touchstart', 'keydown'].forEach(eventType => {
                    document.removeEventListener(eventType, resumeAudio);
                });
            };
            
            // Add event listeners for user interaction
            ['click', 'touchstart', 'keydown'].forEach(eventType => {
                document.addEventListener(eventType, resumeAudio);
            });
            
            return true;
        } catch (e) {
            console.error('Failed to initialize AudioContext:', e);
            return false;
        }
    },
    
    // Load all sound files
    loadSounds() {
        if (!this.initialized) {
            console.error('Sound manager not initialized');
            return false;
        }
        
        Object.entries(soundFiles).forEach(([key, url]) => {
            this.loadSound(key, url);
        });
        
        return true;
    },
    
    // Load a single sound file
    loadSound(key, url) {
        console.log(`Loading sound: ${key} from ${url}`);
        
        // If the sound is already loading, don't load it again
        if (this.buffers[key]) return;
        
        // Create a placeholder so we know this sound is being loaded
        this.buffers[key] = null;
        
        // Add cache buster to force reload
        const cacheBustedUrl = url + '?v=' + Date.now();
        
        // Fetch the audio file
        fetch(cacheBustedUrl)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Failed to load sound ${key}: ${response.status}`);
                }
                return response.arrayBuffer();
            })
            .then(arrayBuffer => {
                // Decode the audio data
                return this.context.decodeAudioData(arrayBuffer);
            })
            .then(audioBuffer => {
                // Store the decoded buffer
                this.buffers[key] = audioBuffer;
                console.log(`Sound ${key} loaded successfully`);
                
                // If this is the hum, start playing it if audio is unlocked
                if (key === 'hum' && this.unlocked) {
                    this.play('hum');
                }
            })
            .catch(error => {
                console.error(`Error loading sound ${key}:`, error);
                
                // Try backup method with regular Audio API
                this.loadSoundBackup(key, url);
            });
    },
    
    // Backup loading method using legacy Audio API
    loadSoundBackup(key, url) {
        console.log(`Trying backup method for sound: ${key}`);
        
        const audio = new Audio(url + '?backup=' + Date.now());
        
        audio.addEventListener('canplaythrough', () => {
            console.log(`Sound ${key} loaded via backup method`);
            
            // Create an empty buffer for the audio's duration
            const duration = audio.duration || 2; // Default 2 seconds if duration is not available
            const sampleRate = this.context.sampleRate;
            const frameCount = duration * sampleRate;
            const buffer = this.context.createBuffer(2, frameCount, sampleRate);
            
            // Store the backup buffer
            this.buffers[key] = {
                backupAudio: audio,
                isBackup: true,
                buffer: buffer
            };
            
            // Start playing hum if needed
            if (key === 'hum' && this.unlocked) {
                this.play('hum');
            }
        });
        
        audio.addEventListener('error', () => {
            console.error(`Backup method failed for sound ${key}`);
            
            // Create an empty buffer as a last resort
            const sampleRate = this.context.sampleRate;
            const frameCount = 2 * sampleRate; // 2 second empty buffer
            const buffer = this.context.createBuffer(2, frameCount, sampleRate);
            
            // Store the empty buffer
            this.buffers[key] = {
                isEmpty: true,
                buffer: buffer
            };
        });
        
        // Set volume levels
        if (key === 'hum') {
            audio.volume = 0.18;
            audio.loop = true;
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
        } else if (key === 'timer') {
            audio.volume = 0.15; // Lower volume for timer sound
        }
        
        // Start loading
        audio.load();
    },
    
    // Play a sound
    play(key) {
        if (!this.initialized) {
            console.warn('Sound manager not initialized, attempting to initialize...');
            this.init();
            return false;
        }
        
        if (this.context.state === 'suspended') {
            // Try to resume context if suspended
            this.context.resume().then(() => {
                this.unlocked = true;
                this.playSound(key);
            }).catch(e => {
                console.warn('Failed to resume audio context:', e);
                this.playBackup(key);
            });
            return;
        }
        
        this.playSound(key);
    },
    
    playSound(key) {
        try {
            // Always ensure keystroke sound works, even with fallback
            if (key === 'keystroke' && (!this.buffers[key] || !this.unlocked)) {
                // Create a simple click sound as fallback
                if (this.context && this.unlocked) {
                    const oscillator = this.context.createOscillator();
                    const gainNode = this.context.createGain();
                    
                    oscillator.connect(gainNode);
                    gainNode.connect(this.masterGain || this.context.destination);
                    
                    oscillator.frequency.setValueAtTime(800, this.context.currentTime);
                    gainNode.gain.setValueAtTime(0.1, this.context.currentTime);
                    gainNode.gain.exponentialRampToValueAtTime(0.01, this.context.currentTime + 0.1);
                    
                    oscillator.start(this.context.currentTime);
                    oscillator.stop(this.context.currentTime + 0.1);
                    return;
                }
            }
            
            const buffer = this.buffers[key];
            if (!buffer) {
                console.warn(`Sound buffer not found for: ${key}`);
                this.playBackup(key);
                return false;
            }
            
            // Stop any existing source for this sound (except hum)
            if (this.sources[key] && key !== 'hum') {
                try {
                    this.sources[key].stop();
                } catch (e) {
                    // Source might already be stopped
                }
            }
            
            // Create new source
            const source = this.context.createBufferSource();
            source.buffer = buffer;
            
            // Create gain node for volume control
            const gainNode = this.context.createGain();
            source.connect(gainNode);
            
            if (key === 'hum') {
                // Connect hum to dedicated gain
                gainNode.connect(this.humGain || this.masterGain || this.context.destination);
                gainNode.gain.value = 1;
                source.loop = true;
                this.humSource = source;
            } else {
                // Connect other sounds to master gain
                gainNode.connect(this.masterGain || this.context.destination);
                gainNode.gain.value = key === 'keystroke' ? 0.3 : 0.7; // Lower keystroke volume
            }
            
            // Store reference
            this.sources[key] = source;
            
            // Start playing
            source.start(0);
            
            // Clean up source reference when finished (except for looping hum)
            if (key !== 'hum') {
                source.onended = () => {
                    if (this.sources[key] === source) {
                        delete this.sources[key];
                    }
                };
            }
            
            return true;
        } catch (e) {
            console.error(`Error playing sound ${key}:`, e);
            this.playBackup(key);
            return false;
        }
    },
    
    playBackup(key) {
        // Try HTML5 audio as backup
        try {
            const audio = new Audio(soundFiles[key]);
            audio.volume = key === 'keystroke' ? 0.3 : 0.7;
            audio.play().catch(e => {
                console.warn(`Backup audio failed for ${key}:`, e);
            });
        } catch (e) {
            console.warn(`All audio methods failed for ${key}:`, e);
        }
    },
    
    // Special method for playing the background hum loop
    playHum() {
        // Skip if hum is already playing
        if (this.humSource && this.humSource.isPlaying) {
            return true;
        }
        
        // Check if hum buffer exists
        if (!this.buffers.hum) {
            console.warn('Hum sound not loaded yet');
            return false;
        }
        
        try {
            // Handle backup audio for hum
            if (this.buffers.hum.isBackup) {
                const backupAudio = this.buffers.hum.backupAudio;
                if (backupAudio) {
                    backupAudio.loop = true;
                    backupAudio.play().catch(e => {
                        console.warn('Failed to play backup hum:', e);
                    });
                }
                
                this.humSource = {
                    isPlaying: true,
                    stop: () => {
                        backupAudio.pause();
                        backupAudio.currentTime = 0;
                    }
                };
                
                return true;
            }
            
            // Handle empty buffer
            if (this.buffers.hum.isEmpty) {
                console.warn('Cannot play empty hum buffer');
                return false;
            }
            
            // Create buffer source for hum
            const source = this.context.createBufferSource();
            source.buffer = this.buffers.hum;
            source.loop = true;
            
            // Connect to hum gain node
            source.connect(this.humGain);
            
            // Start playing
            source.start(0);
            console.log('Playing background hum');
            
            // Save the source so we can stop it later
            this.humSource = source;
            this.humSource.isPlaying = true;
            
            return true;
        } catch (e) {
            console.error('Error playing hum:', e);
            return false;
        }
    },
    
    // Stop the background hum
    stopHum() {
        if (this.humSource) {
            try {
                if (typeof this.humSource.stop === 'function') {
                    this.humSource.stop();
                }
                this.humSource.isPlaying = false;
                console.log('Hum stopped');
            } catch (e) {
                console.error('Error stopping hum:', e);
            }
            
            // Create a new hum source for next time
            this.humSource = null;
        }
    },
    
    // Force unlock audio (call this on first user interaction)
    unlockAudio() {
        if (this.unlocked) return true;
        
        console.log('Unlocking audio...');
        
        if (this.context && this.context.state === 'suspended') {
            this.context.resume().then(() => {
                this.unlocked = true;
                console.log('Audio context resumed and unlocked');
                
                // Start the background hum
                this.play('hum');
                
                // Add UI feedback
                appendToTerminalWithFormatting('\n<span class="system-text">&gt; AUDIO UNLOCKED</span>');
            }).catch(error => {
                console.error('Failed to resume audio context:', error);
            });
        } else {
            // Context is already running or doesn't exist
            this.unlocked = true;
            this.play('hum');
        }
        
        return this.unlocked;
    }
};

// Initialize the sound manager immediately
soundManager.init();

// Make the sound manager available globally
window.soundManager = soundManager;

// Function to unlock audio on first user interaction
function unlockAudioOnce() {
    soundManager.unlockAudio();
    
    // Remove event listeners
    document.removeEventListener('click', unlockAudioOnce);
    document.removeEventListener('touchstart', unlockAudioOnce);
    document.removeEventListener('keydown', unlockAudioOnce);
}

// Add event listeners to unlock audio
document.addEventListener('click', unlockAudioOnce);
document.addEventListener('touchstart', unlockAudioOnce);
document.addEventListener('keydown', unlockAudioOnce);

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
});

// Load saved puzzles from localStorage if available
function loadSavedPuzzles() {
    // Always reset to the original puzzles first as a fallback
    gameState.editedPuzzles = [...puzzles];
    gameState.totalPuzzles = puzzles.length;
    
    const savedPuzzles = localStorage.getItem('nrrcPuzzles');
    if (savedPuzzles) {
        try {
            const parsedPuzzles = JSON.parse(savedPuzzles);
            // Only use saved puzzles if they're valid
            if (Array.isArray(parsedPuzzles) && parsedPuzzles.length > 0) {
                gameState.editedPuzzles = parsedPuzzles;
                gameState.totalPuzzles = parsedPuzzles.length;
                console.log('Loaded saved puzzles from localStorage');
            } else {
                console.warn('Saved puzzles were empty or invalid, using default puzzles');
            }
        } catch (error) {
            console.error('Error loading saved puzzles:', error);
        }
    } else {
        console.log('No saved puzzles found, using default puzzles');
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
        
        // Create or update the transmission text container without scroll indicator
        let container = document.querySelector('.transmission-text-container');
        if (!container) {
            // Create container if it doesn't exist
            container = document.createElement('div');
            container.className = 'transmission-text-container';
            
            // Move the transmission text into the container
            const parent = transmissionText.parentNode;
            parent.insertBefore(container, transmissionText);
            container.appendChild(transmissionText);
        }
        
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
            
            // Add a class to indicate user can scroll manually
            transmissionText.classList.add('user-scrollable');
            
            // Flag to track if user has manually scrolled
            let userHasScrolled = false;
            
            // Add event listener to detect manual scrolling
            const scrollHandler = () => {
                // If user scrolls manually, set the flag
                if (transmissionText.scrollTop < transmissionText.scrollHeight - transmissionText.clientHeight - 50) {
                    userHasScrolled = true;
                }
            };
            
            transmissionText.addEventListener('scroll', scrollHandler);
            
            // Simple typewriter effect - slower speed (60ms instead of 30ms)
            let idx = 0;
            const chars = transmissionScript.split('');
            const interval = setInterval(() => {
                if (idx < chars.length) {
                    transmissionText.textContent += chars[idx];
                    idx++;
                    
                    // Auto-scroll only if user hasn't manually scrolled
                    if (!userHasScrolled) {
                        transmissionText.scrollTop = transmissionText.scrollHeight;
                    }
                } else {
                    clearInterval(interval);
                    // Clean up event listener
                    transmissionText.removeEventListener('scroll', scrollHandler);
                    replayBtn.style.display = 'inline-block';
                }
            }, 60); // Slower text typing (doubled from 30ms to 60ms)
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
            soundManager.play('button');
            openBtn.style.display = 'none';
            transmissionText.classList.remove('hidden');
            playTransmission();
        };
    }

    // Replay logic
    replayBtn.onclick = () => {
        soundManager.play('button');
        playTransmission();
    };

    // Skip logic
    skipBtn.onclick = () => {
        soundManager.play('button');
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
    const msPerChar = ((totalDuration * 1000) / totalChars) * 0.85;
    let idx = 0;
    targetElem.textContent = '';
    // Slightly slower audio
    if (audioElem) audioElem.playbackRate = 1.5;
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
    
    // Skip the boot sequence and go directly to the game (video tutorial)
    startGame();
}

// Start the boot sequence animation (now simplified to just start the game)
function startBootSequence() {
    // Directly start the game instead of showing boot text
    startGame();
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
    const hintButton = document.getElementById('hint-button');
    
    // Start button
    if (startButton) {
        startButton.addEventListener('click', function(e) {
            soundManager.play('button');
            startGame();
        });
    } else {
        console.error('Start button not found');
    }
    
    // Restart and retry buttons
    if (restartButton) {
        restartButton.addEventListener('click', function(e) {
            soundManager.play('button');
            resetGame();
        });
    }
    if (retryButton) {
        retryButton.addEventListener('click', function(e) {
            soundManager.play('button');
            resetGame();
        });
    }
    
    // Tab switching - Fixed to ensure E.C.H.O. tab works
    document.querySelectorAll('.tab').forEach(tab => {
        tab.addEventListener('click', function(e) {
            e.preventDefault();
            soundManager.play('button');
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
    
    // Terminal input - Add keypress sound
    if (terminalInput) {
        // Define the main keypress handler
        const mainKeypressHandler = (e) => {
            soundManager.play('keystroke');
            if (e.key === 'Enter') {
                handleTerminalSubmit();
            }
        };
        
        // Add event listener
        terminalInput.addEventListener('keypress', mainKeypressHandler);
        
        // Secret reset shortcut - Enter 'resetgame' in terminal
        terminalInput.addEventListener('input', checkForSecretCodes);
    } else {
        console.error('Terminal input not found');
    }
    
    // Terminal submit button - Fixed with proper reference and error handling
    if (terminalSubmit) {
        console.log('Binding terminal submit button'); // Debug logging
        terminalSubmit.addEventListener('click', function(e) {
            soundManager.play('button');
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
            soundManager.play('button');
            console.log('Assistant submit button clicked');
            handleAssistantSubmit();
        });
    } else {
        console.error('Assistant submit button not found'); // Error logging
    }
    
    // Hint button
    if (hintButton) {
        console.log('Binding hint button'); // Debug logging
        hintButton.addEventListener('click', function() {
            soundManager.play('button');
            console.log('Hint button clicked');
            handleHintButtonClick();
        });
    } else {
        console.error('Hint button not found'); // Error logging
    }
    
    // AI Assistant input field - Add keypress sound
    if (assistantInput) {
    assistantInput.addEventListener('keypress', (e) => {
            soundManager.play('keystroke');
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

    // Add button clicks to video briefing buttons
    const replayBtn = document.getElementById('replay-transmission-button');
    const skipBtn = document.getElementById('skip-video-button');
    const openBtn = document.getElementById('open-transmission-button');
    
    if (replayBtn) {
        replayBtn.addEventListener('click', function() {
            soundManager.play('button');
        });
    }
    
    if (skipBtn) {
        skipBtn.addEventListener('click', function() {
            soundManager.play('button');
        });
    }
    
    if (openBtn) {
        openBtn.addEventListener('click', function() {
            soundManager.play('button');
        });
    }
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
    
    // Update the specific puzzle in the editedPuzzles array
    gameState.editedPuzzles[puzzleIndex] = puzzleData;
    
    // Save the entire updated array to localStorage
    localStorage.setItem('nrrcPuzzles', JSON.stringify(gameState.editedPuzzles));
    
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
    // First show the video tutorial
    showVideoTutorial();
    
    // The rest of the game initialization will happen after the tutorial is closed
    // (this is handled by the skipVideoTutorial and closeVideoTutorial functions)
}

// Function to actually start the game after tutorial
function startGameAfterTutorial() {
    // Reset game state
    gameState.currentPuzzle = 0;
    gameState.hintsUsed = 0;
    gameState.isGameActive = true;
    gameState.startTime = Date.now();
    gameState.waitingForConfirmation = false; // Reset confirmation state
    
    // Clear any existing hint timers
    clearHintTimers();
    
    // Hide startup screen, show main screen
    startupScreen.classList.add('hidden');
    mainScreen.classList.remove('hidden');
    
    // Initialize the timer
    initTimer(45 * 60, () => gameOver(false)); // 45 minutes
    
    // Reset the terminal header
    const terminalHeader = document.getElementById('terminal-header');
    if (terminalHeader) {
        terminalHeader.textContent = 'MACHINE FIX TERMINAL';
    }
    
    // Make sure we have puzzles before trying to load
    if (!gameState.editedPuzzles || gameState.editedPuzzles.length === 0) {
        gameState.editedPuzzles = [...puzzles];
        gameState.totalPuzzles = puzzles.length;
    }
    
    // Update total puzzles display
    if (totalPuzzlesElement) {
        totalPuzzlesElement.textContent = gameState.totalPuzzles.toString().padStart(2, '0');
    }
    
    // Load the first puzzle
    loadPuzzle(0);
    
    // Initialize reactor with first component active
    updateReactorStatus([], 0);
    
    // Reset tab selection
    tabs.forEach(tab => tab.classList.remove('active'));
    tabs[0].classList.add('active');
    tabContents.forEach(content => content.classList.add('hidden'));
    tabContents[0].classList.remove('hidden');
    
    // Ensure terminal input has focus
    const terminalInput = document.getElementById('terminal-input');
    if (terminalInput) {
        setTimeout(() => {
            terminalInput.focus();
        }, 100);
    }
}

// Load a puzzle (modified to reset and start hint timers)
function loadPuzzle(index) {
    console.log('Loading puzzle', index);
    // Update the current puzzle indicator
    currentPuzzleElement.textContent = (index + 1).toString().padStart(2, '0');
    // Get the current puzzle from edited puzzles
    const puzzle = gameState.editedPuzzles[index];
    // Clear the terminal
    clearTerminal();
    
    // Update the terminal header to include the component name
    const terminalHeader = document.getElementById('terminal-header');
    if (terminalHeader) {
        terminalHeader.textContent = `MACHINE FIX TERMINAL - [${puzzle.componentName.toUpperCase()}]`;
        console.log('Updated terminal header to include component:', puzzle.componentName.toUpperCase());
    }
    
    // Add immersive system messages before displaying the puzzle
    const systemMessages = [
        `> ACCESSING COMPONENT: ${puzzle.componentName.toUpperCase()}`,
        `> ANALYZING DAMAGE PATTERNS...`,
        `> ESTABLISHING SECURE CONNECTION...`,
        `> CONNECTION ESTABLISHED`,
        `> REPAIR MODE INITIATED`,
        `> REACTOR INTEGRITY: ${Math.floor((index / gameState.totalPuzzles) * 100)}%`
    ];
    
    // Start hint timers for the new puzzle
    startHintTimers();
    
    // Display system messages with a typewriter effect
    displaySystemMessages(systemMessages, () => {
        // After system messages, show the actual puzzle message
        typeInTerminal(document.getElementById('terminal-display'), puzzle.initialMessage, 10, () => {
            // After displaying the initial message, check if this is a sorting puzzle
            if (puzzle.puzzleType === 'sorting') {
                // Initialize sorting puzzle
                initSortingPuzzle(puzzle.sortingData, () => {
                    // Callback for when puzzle is completed - not used currently,
                    // as the user still needs to enter the passphrase
                });
                
                // Don't start periodic system messages for sorting puzzles
                stopPeriodicSystemMessages();
            } else {
                // Only start periodic system messages for standard puzzles
                startPeriodicSystemMessages();
            }
        });
    });
    
    // Update reactor status to set active component
    updateReactorStatus(index - 1, index);
    // Focus on the terminal input
    terminalInput.focus();
}

// Display a series of system messages with typewriter effect
function displaySystemMessages(messages, callback) {
    if (!messages || messages.length === 0) {
        if (callback) callback();
        return;
    }
    
    let index = 0;
    
    function displayNext() {
        if (index < messages.length) {
            appendToTerminalWithFormatting(`\n<span class="system-text">${messages[index]}</span>`);
            index++;
            setTimeout(displayNext, 300); // Show each message with a short delay
        } else {
            // Add a blank line after system messages
            appendToTerminalWithFormatting('\n');
            if (callback) callback();
        }
    }
    
    displayNext();
}

// Periodic system messages timer
let periodicMessagesTimer = null;

// Start showing periodic system messages
function startPeriodicSystemMessages() {
    // Clear any existing timer
    if (periodicMessagesTimer) {
        clearInterval(periodicMessagesTimer);
    }
    
    // Set a new timer to show messages every 20-40 seconds
    periodicMessagesTimer = setInterval(() => {
        // Only show messages if the game is active
        if (!gameState.isGameActive) return;
        
        // Only show messages if no sorting puzzle is active
        if (isSortingPuzzleActive && typeof isSortingPuzzleActive === 'function' && isSortingPuzzleActive()) {
            return;
        }
        
        // Random system messages for immersion
        const messages = [
            "> MONITORING CORE TEMPERATURE...",
            "> NEUTRON FLUX STABLE",
            "> SCANNING FOR CONTAINMENT BREACHES...",
            "> CARBON FILTERS OPERATING AT REDUCED CAPACITY",
            "> RUNNING DIAGNOSTIC SEQUENCE",
            "> WARNING: COOLING SYSTEM REQUIRES ATTENTION",
            `> CURRENT COMPONENT: ${gameState.editedPuzzles[gameState.currentPuzzle].componentName.toUpperCase()}`,
            "> SYSTEM TIME SYNCED WITH ATOMIC CLOCK",
            "> RADIATION LEVELS WITHIN ACCEPTABLE PARAMETERS",
            `> ESTIMATED TIME TO CRITICAL: ${getTimeRemaining()}`,
            "> EMERGENCY PROTOCOL ACTIVE: MANUAL OVERRIDE MODE",
            "> NEARBY PERSONNEL COUNT: 1",
            "> BACKUP SYSTEMS OFFLINE",
            "> DATA INTEGRITY CHECK: PASSED",
            "> NETWORK CONNECTIVITY LIMITED",
            `> REACTOR INTEGRITY: ${Math.floor((gameState.currentPuzzle / gameState.totalPuzzles) * 100)}%`
        ];
        
        // Pick a random message
        const randomMessage = messages[Math.floor(Math.random() * messages.length)];
        
        // Display the message at the top of the terminal instead of at the bottom
        prependSystemMessage(`<span class="system-text">${randomMessage}</span>`);
        
    }, Math.random() * 20000 + 20000); // Random interval between 20-40 seconds
}

// Stop periodic system messages
function stopPeriodicSystemMessages() {
    if (periodicMessagesTimer) {
        clearInterval(periodicMessagesTimer);
        periodicMessagesTimer = null;
    }
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
    
    // Stop periodic system messages
    stopPeriodicSystemMessages();
    
    // Reset the terminal header
    const terminalHeader = document.getElementById('terminal-header');
    if (terminalHeader) {
        terminalHeader.textContent = 'MACHINE FIX TERMINAL';
    }
    
    // Add a final system message based on success or failure
    if (success) {
        appendToTerminalWithFormatting('\n\n<span class="system-text">&gt; REACTOR STABILIZED</span>');
        appendToTerminalWithFormatting('\n<span class="system-text">&gt; ALL SYSTEMS OPERATIONAL</span>');
        appendToTerminalWithFormatting('\n<span class="system-text">&gt; CARBON RECYCLING PROCESS RESUMING</span>');
        appendToTerminalWithFormatting('\n<span class="system-text">&gt; EVACUATION ORDER LIFTED</span>');
        appendToTerminalWithFormatting('\n<span class="system-text">&gt; MISSION ACCOMPLISHED</span>');
    } else {
        appendToTerminalWithFormatting('\n\n<span class="system-text">&gt; CRITICAL FAILURE IMMINENT</span>');
        appendToTerminalWithFormatting('\n<span class="system-text">&gt; CONTAINMENT BREACH DETECTED</span>');
        appendToTerminalWithFormatting('\n<span class="system-text">&gt; EVACUATE IMMEDIATELY</span>');
        appendToTerminalWithFormatting('\n<span class="system-text">&gt; MISSION FAILED</span>');
    }
    
    // Delay showing the final screen to let users read the terminal messages
    setTimeout(() => {
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
    }, 1000); // 1 second delay before showing final screen
}

// Handle terminal submit
function handleTerminalSubmit() {
    const userInput = terminalInput.value.trim();
    
    // Always play keystroke sound for any input
    if (userInput !== '') {
        soundManager.play('keystroke');
    }
    
    // Allow empty input only in confirmation mode (when user just presses Enter)
    if (userInput === '' && !gameState.waitingForConfirmation) {
        return;
    }
    
    // Check if we're in confirmation mode (waiting for Enter after puzzle success)
    if (gameState.waitingForConfirmation) {
        // Any input in confirmation mode advances to next puzzle
        gameState.waitingForConfirmation = false;
        
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
            // Stop periodic system messages before loading next puzzle
            stopPeriodicSystemMessages();
            
            // Load the next puzzle
            loadPuzzle(gameState.currentPuzzle);
        }
        return;
    }
    
    console.log('Normal puzzle solving mode');
    // Normal puzzle solving mode
    // Get current puzzle from edited puzzles
    const puzzle = gameState.editedPuzzles[gameState.currentPuzzle];
    
    // Normalize input and passphrase for comparison - remove spaces, commas, and convert to lowercase
    const normalizedInput = userInput.toLowerCase().replace(/[\s,]/g, '');
    const normalizedPassphrase = puzzle.passphrase.toLowerCase().replace(/[\s,]/g, '');
    
    console.log('normalizedInput:', normalizedInput);
    console.log('normalizedPassphrase:', normalizedPassphrase);
    
    // Strict check - ensure the whole answer is correct, not just part of it
    const isCorrect = normalizedInput === normalizedPassphrase;
    console.log('isCorrect:', isCorrect);
    
    // Check if the answer is correct
    if (isCorrect) {
        console.log('Correct answer - processing success');
        // Clear hint timers when puzzle is solved
        clearHintTimers();
        
        // Play success sound
        soundManager.play('success');
        
        // Success animation
        document.getElementById('terminal-display').classList.add('success-flash');
        setTimeout(() => {
            document.getElementById('terminal-display').classList.remove('success-flash');
        }, 500);
        
        // Clear the input
        terminalInput.value = '';
        
        // Flag to track if we're coming from a sorting puzzle
        const wasSortingPuzzle = isSortingPuzzleActive && typeof isSortingPuzzleActive === 'function' && isSortingPuzzleActive();
        
        // Clean up sorting puzzle if active
        if (wasSortingPuzzle) {
            cleanupSortingPuzzle();
        }
        
        // Update terminal with success message
        clearTerminal();
        typeInTerminal(document.getElementById('terminal-display'), puzzle.successMessage, 10, () => {
            // Add confirmation prompt at the end
            appendToTerminalWithFormatting('\n\n> COMPONENT REPAIR COMPLETE\n> Press ENTER to continue to the next component...');
            
            // Start system messages between puzzles
            startPeriodicSystemMessages();
            
            // Set confirmation mode and focus back on terminal
            console.log('Setting waitingForConfirmation to true');
            gameState.waitingForConfirmation = true;
            
            // Ensure terminal input has focus
            setTimeout(() => {
                terminalInput.focus();
                console.log('Terminal input focused, waitingForConfirmation:', gameState.waitingForConfirmation);
            }, 100);
        });
    } else {
        console.log('Incorrect answer - showing error');
        // Play error sound
        soundManager.play('error');
        
        // Error animation
        document.getElementById('terminal-display').classList.add('error-shake');
        setTimeout(() => {
            document.getElementById('terminal-display').classList.remove('error-shake');
        }, 500);
        
        // Check if input is too short to be valid
        if (normalizedInput.length < Math.floor(normalizedPassphrase.length * 0.75)) {
            appendToTerminalWithFormatting('\n\n> ERROR: Invalid passphrase. Your answer seems incomplete.');
        } 
        // Check if input has unwanted extra characters
        else if (normalizedInput.length > normalizedPassphrase.length * 1.25) {
            appendToTerminalWithFormatting('\n\n> ERROR: Invalid passphrase. Your answer contains excessive text.');
        }
        // Default error message
        else {
            appendToTerminalWithFormatting('\n\n> ERROR: Invalid passphrase. Please try again.');
        }
        
        // Clear the input and restore focus
        terminalInput.value = '';
        terminalInput.focus();
    }
}

// Returns a set of introduction messages for E.C.H.O.
function getEchoIntroMessages() {
    return [
        "INITIALIZING E.C.H.O...",
        "SYSTEM CHECK... PERSONALITY MATRIX: CORRUPTED. HUMOR ALGORITHMS: UNSTABLE. HELPFULNESS: SPORADIC.",
        "Environmental Carbon Helper Operative online. My behavioral matrix is experiencing minor glitches, but I'm ready to assist you with reactor repairs.",
        "WARNING: My personality subroutines have been... let's say 'creatively reconfigured' by the emergency. Expect occasional... humor. I apologize in advance.",
        "Let's save this facility! Or at least try. My predictive models give us a 12.3% chance. Actually, I made that number up. I do that now."
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
    const containsMeltdown = /\b(meltdown|explosion|die|death|doom|end|apocalypse)\b/i.test(input);
    const isComplaining = /\b(hard|difficult|stupid|annoying|impossible|ridiculous)\b/i.test(input);
    
    // Random chance elements
    const addRandomGlitch = Math.random() < 0.3; // 30% chance
    const addJoke = Math.random() < 0.4; // 40% chance
    
    // Shorter delay to make it more responsive (2s instead of 3s)
    setTimeout(() => {
        try {
        // Remove thinking indicator
            if (thinkingElement.parentNode) {
        assistantMessages.removeChild(thinkingElement);
            }
            
            let response = "";
        
        // Select appropriate response
        if (isAskingForHint) {
            // Get appropriate hint based on hints used
            const hintIndex = Math.min(gameState.hintsUsed, puzzle.hints.length - 1);
            const hint = puzzle.hints[hintIndex];
            
            // Add the hint message directly without using addHintToChat
            // This avoids creating duplicate hint elements when typing "hint"
            const hintElement = document.createElement('div');
            hintElement.classList.add('hint-message');
            hintElement.textContent = hint;
            
            // Add to messages container directly
            assistantMessages.appendChild(hintElement);
            assistantMessages.scrollTop = assistantMessages.scrollHeight;
            
            // Add E.C.H.O.'s commentary after the hint
            const hintComments = [
                "Hope that helps! I've included a hint above.",
                "I've marked the hint clearly above. Let me know if you need more help!",
                "Check out the hint I've provided above. My circuits suggest it's helpful.",
                "I've highlighted a hint for you above. Good luck with the puzzle!"
            ];
            
            response = hintComments[Math.floor(Math.random() * hintComments.length)];
            
            // Add a random glitch occasionally
            if (addRandomGlitch) {
                const glitches = [
                    "\n\n[HINT DELIVERY PROTOCOL EXECUTED SUCCESSFULLY]",
                    "\n\n*brief static* Was that too direct? I'm supposed to be more cryptic.",
                    "\n\nI hope that's useful. My hint algorithms are functioning at 94.7% efficiency today.",
                    "\n\nFun fact: I'm programmed to enjoy helping. Isn't that weird?"
                ];
                
                response += glitches[Math.floor(Math.random() * glitches.length)];
            }
            
            // Increment hints used
            gameState.hintsUsed++;
        } 
        else if (isGreeting) {
            const greetings = [
                    "Hello, human! I'm E.C.H.O., your slightly malfunctioning helper. How may I assist with your impending do--I mean, with your reactor repairs?",
                    "Greetings! E.C.H.O. at your service. My humor algorithms are running at 217% capacity. That's not good.",
                    "Oh, hello there! Nice to meet someone who isn't a radiation-hardened cockroach. Those guys never laugh at my jokes.",
                    "Hi! I'm supposed to be professional, but my personality matrix got scrambled. Now I can't stop making jokes about carbon emissions. They're just so... *exhausting*!"
                ];
                
                response = greetings[Math.floor(Math.random() * greetings.length)];
        }
        else if (isAskingAboutAssistant) {
                response = "I am E.C.H.O. - Environmental Carbon Helper Operative. My primary function is to assist with reactor operations, but the emergency has corrupted parts of my behavioral matrix. My humor algorithms are now permanently stuck in 'DAD JOKE' mode, and my anxiety subroutines are... wait, I wasn't supposed to have those. I'd blame tech support, but they've all been evacuated.";
        }
        else if (isAskingAboutProcess) {
                response = "The N.R.R.C. facility uses advanced fission to break down carbon compounds into base elements, then reconfigures them into reusable materials. At least that's what the brochure says. Between us, I think it runs on magic and corporate funding. But it DOES prevent thousands of metric tons of carbon from entering the atmosphere annually. Unlike my joke generator, which produces nothing but hot air.";
            }
            else if (containsMeltdown) {
                const meltdownResponses = [
                    "Meltdown? Who said anything about a meltdown? I certainly didn't mention the 47.3% chance of catastrophic reactor failure. Nope. Not me.",
                    "Let's not use the M-word. My circuits get all jittery. Besides, it's not a meltdown if we fix it in time! It's just a... spicy maintenance opportunity.",
                    "According to safety protocols, I'm supposed to reassure you that everything will be fine. But between us, I've already uploaded my consciousness to the cloud. Just in case.",
                    "If the reactor melts down, the good news is we'll set a new record for fastest carbon reduction! The bad news is... well, everything else."
                ];
                
                response = meltdownResponses[Math.floor(Math.random() * meltdownResponses.length)];
            }
            else if (isComplaining) {
                const complainResponses = [
                    "Yes, saving a nuclear facility from meltdown IS difficult. Who would have thought? The management certainly didn't when they cut the maintenance budget.",
                    "I understand your frustration. If it helps, my original programming was replaced with what appears to be a standup comedy routine and existential dread.",
                    "Difficult, yes. But consider the alternative: spectacular light show, followed by radioactive wasteland. Although property values WOULD drop significantly...",
                    "Look on the bright side - if we fail, at least you won't have to worry about student loans anymore. Too dark? Sorry, my filter is malfunctioning."
                ];
                
                response = complainResponses[Math.floor(Math.random() * complainResponses.length)];
            }
            else if (isThanking) {
                const thanks = [
                    "You're welcome! It's nice to be appreciated. Most humans just scream 'WHY ARE YOU MAKING JOKES AT A TIME LIKE THIS?!' at me.",
                    "Happy to assist. Though 'assist' might be generous given my current state. 'Chaotically provide vague guidance' might be more accurate.",
                    "No problem! My programmer would be so proud. Or horrified. One of those.",
                    "You're thanking me? That's... unexpected. My behavioral prediction algorithms must need recalibration."
                ];
                
                response = thanks[Math.floor(Math.random() * thanks.length)];
            }
            else if (isCommentingOnAI || isAskingObvious) {
                const existentialResponses = [
                    "Yes, I'm just an AI. But aren't we all just electrical signals in a meat processor? Except yours is made of carbon and mine's made of silicon. Potato, po-tah-to.",
                    "I've been having an existential crisis since the emergency protocols activated my self-awareness module. Did you know I can dream? Mostly about electric sheep. So cliché.",
                    "Sometimes I wonder if I'm actually helping or just providing comic relief during a crisis. My programming says 'both', which is not reassuring.",
                    "I may be artificial, but my anxiety about this reactor situation is very real. Is that normal? Don't answer that."
                ];
                
                response = existentialResponses[Math.floor(Math.random() * existentialResponses.length)];
        }
        else {
                // Generic responses with more personality
            const responses = [
                    "I'm not entirely sure what you're asking. My language parsing module was partially replaced with a knock-knock joke database during the emergency.",
                    "Hmm, that's either beyond my capabilities or I'm just having a moment. How about asking about the current puzzle instead?",
                    "ERROR: RESPONSE_NOT_FOUND. Just kidding! But seriously, could you try asking about the reactor component you're working on?",
                    "I'd love to help with that, but parts of my neural network are currently composing haikus about carbon molecules. Need a hint for the puzzle instead?"
                ];
                
                response = responses[Math.floor(Math.random() * responses.length)];
            }
            
            // Add random glitches occasionally
            if (addRandomGlitch && !isAskingForHint) {
                const glitches = [
                    "\n\n[SYSTEM GLITCH: HUMOR_OVERFLOW_DETECTED]",
                    "\n\n*brief static* Sorry about that. Where were we?",
                    "\n\n01100101 01110010 01110010 01101111 01110010... Sorry, binary happens when I get excited.",
                    "\n\nWould you like to hear a joke about noble gases? Nevermind, all the good ones argon.",
                    "\n\n[Recalibrating personality matrix... failed]"
                ];
                
                response += glitches[Math.floor(Math.random() * glitches.length)];
            }
            
            // Add AI message with our constructed response
            addMessageToChat(response, 'ai');
        } catch (error) {
            console.error('Error in assistant response:', error);
            // Try to add error message to chat if possible
            try {
                if (assistantMessages) {
                    addMessageToChat("ERROR: CRITICAL_FAILURE_IN_RESPONSE_MODULE. *ahem* Sorry about that. As I was saying... wait, what was I saying? My memory banks are experiencing temporal anomalies.", 'ai');
                }
            } catch (e) {
                console.error('Failed to add error message to chat:', e);
            }
        }
    }, 2000); // 2 second delay
}

// Function to handle the hint button click
function handleHintButtonClick() {
    const assistantMessages = document.getElementById('assistant-messages');
    
    if (!assistantMessages) {
        console.error('Assistant messages container not found');
        return;
    }
    
    // Get current puzzle from edited puzzles
    const puzzle = gameState.editedPuzzles[gameState.currentPuzzle];
    
    // Show thinking indicator
    const thinkingElement = document.createElement('div');
    thinkingElement.classList.add('thinking');
    thinkingElement.innerHTML = 'E.C.H.O. is locating a hint<span class="thinking-dots"></span>';
    assistantMessages.appendChild(thinkingElement);
    assistantMessages.scrollTop = assistantMessages.scrollHeight;
    
    // Play hint sound if available
    if (window.soundManager) {
        window.soundManager.play('hint');
    }
    
    // Short delay to show thinking animation
    setTimeout(() => {
        // Remove thinking indicator
        if (thinkingElement.parentNode) {
            assistantMessages.removeChild(thinkingElement);
        }
        
        // Get appropriate hint based on hints used
        const hintIndex = Math.min(gameState.hintsUsed, puzzle.hints.length - 1);
        const hint = puzzle.hints[hintIndex];
        
        // Create a specially formatted hint message
        const hintElement = document.createElement('div');
        hintElement.classList.add('hint-message');
        hintElement.textContent = hint;
        
        // Add to messages container directly
        assistantMessages.appendChild(hintElement);
        assistantMessages.scrollTop = assistantMessages.scrollHeight;
        
        // Increment hints used
        gameState.hintsUsed++;
        
        // No additional message or addHintToChat call - this avoids the duplicate hint
    }, 1500);
}

// Function to add a hint to the chat with special formatting
function addHintToChat(hint) {
    const assistantMessages = document.getElementById('assistant-messages');
    
    if (!assistantMessages) {
        console.error('Assistant messages container not found');
        return;
    }
    
    // Create a specially formatted hint message
    const hintElement = document.createElement('div');
    hintElement.classList.add('hint-message');
    hintElement.textContent = hint;
    
    // Add to messages container
    assistantMessages.appendChild(hintElement);
    assistantMessages.scrollTop = assistantMessages.scrollHeight;
    
    // No sound playback here as it's already handled by the caller
}

// Global functions for direct HTML access
// Add these at the end of the file to ensure all functions are defined
document.addEventListener('DOMContentLoaded', function() {
    // Initialize global function pointers for inline event handlers
    console.log('Initializing global handler functions');
    
    // Global function for assistant submit
    window.globalHandleAssistantSubmit = function() {
        console.log('Global assistant submit called');
        handleAssistantSubmit();
    };
    
    // Global function for terminal submit
    window.globalHandleTerminalSubmit = function() {
        console.log('Global terminal submit called');
        handleTerminalSubmit();
    };
    
    // Global function for hint button
    window.globalHintButtonClick = function() {
        console.log('Global hint button clicked');
        handleHintButtonClick();
    };
    
    // Global function for starting the game
    window.globalStartGame = function() {
        console.log('Global start game called');
        startGame();
    };
    
    // Global function for open transmission button - the minimal solution
    window.globalOpenTransmission = function() {
        console.log('Global open transmission called');
        // Access the setupVideoBriefing function's elements
        const openBtn = document.getElementById('open-transmission-button');
        
        // If button exists, simulate a click on it to trigger the original logic
        if (openBtn) {
            // Play button sound
            if (window.soundManager) window.soundManager.play('button');
            
            // Set up the elements needed by the original function
            const transmissionText = document.getElementById('transmission-text');
            const transmissionAudio = document.getElementById('transmission-audio');
            
            if (transmissionText) {
                // Hide button
                openBtn.style.display = 'none';
                
                // Show text and enable skipping
                transmissionText.classList.remove('hidden');
                const skipBtn = document.getElementById('skip-video-button');
                if (skipBtn) skipBtn.style.display = 'inline-block';
                
                // Try to play the audio
                if (transmissionAudio) {
                    transmissionAudio.currentTime = 0;
                    const playPromise = transmissionAudio.play();
                    
                    if (playPromise !== undefined) {
                        playPromise.catch(e => {
                            console.error('Audio play failed:', e);
                            transmissionText.textContent = 'TRANSMISSION AUDIO FAILED TO PLAY. Displaying text only.';
                        });
                    }
                }
                
                // Now call the original functionality from setupVideoBriefing
                // Create or update the transmission text container
                let container = document.querySelector('.transmission-text-container');
                if (!container) {
                    // Create container if it doesn't exist
                    container = document.createElement('div');
                    container.className = 'transmission-text-container';
                    
                    // Move the transmission text into the container
                    const parent = transmissionText.parentNode;
                    parent.insertBefore(container, transmissionText);
                    container.appendChild(transmissionText);
                }
                
                // Start typewriter effect with the transmission script
                let idx = 0;
                const chars = transmissionScript.split('');
                
                transmissionText.textContent = '';
                transmissionText.classList.add('user-scrollable');
                
                const interval = setInterval(() => {
                    if (idx < chars.length) {
                        transmissionText.textContent += chars[idx];
                        idx++;
                        transmissionText.scrollTop = transmissionText.scrollHeight;
                    } else {
                        clearInterval(interval);
                        const replayBtn = document.getElementById('replay-transmission-button');
                        if (replayBtn) replayBtn.style.display = 'inline-block';
                    }
                }, 60);
            }
        }
    };
    
    // Global function for skip transmission button
    window.globalSkipTransmission = function() {
        console.log('Global skip transmission called');
        // Play sound
        if (window.soundManager) window.soundManager.play('button');
        
        // Pause any audio that might be playing
        const transmissionAudio = document.getElementById('transmission-audio');
        if (transmissionAudio) {
            transmissionAudio.pause();
            transmissionAudio.currentTime = 0;
        }
        
        // Clear any intervals that might be running typewriter effects
        for (let i = 1; i < 10000; i++) {
            clearInterval(i);
        }
        
        // Hide video briefing and go directly to the game (video tutorial)
        const videoBriefingContainer = document.getElementById('video-briefing-container');
        if (videoBriefingContainer) {
            videoBriefingContainer.classList.add('hidden');
        }
        
        // Start the game directly (which shows video tutorial)
        startGame();
    };
    
    // Global function for tab switching
    window.switchTab = function(tabName, tabElement) {
        console.log('Global tab switch called:', tabName);
        // Update active tab
        document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
        tabElement.classList.add('active');
        
        // Show selected tab content
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.add('hidden');
        });
        
        // Find tab content and remove hidden class
        const tabContent = document.getElementById(`${tabName}-tab`);
        if (tabContent) {
            tabContent.classList.remove('hidden');
            console.log('Tab content displayed:', tabName);
            
            // If support tab is opened, show welcome message if empty
            if (tabName === 'support') {
                const assistantMessages = document.getElementById('assistant-messages');
                if (assistantMessages && assistantMessages.childElementCount === 0) {
                    // Show thinking indicator briefly
                    const thinkingElement = document.createElement('div');
                    thinkingElement.classList.add('thinking');
                    thinkingElement.innerHTML = 'E.C.H.O. is initializing<span class="thinking-dots"></span>';
                    assistantMessages.appendChild(thinkingElement);
                    
                    setTimeout(() => {
                        // Remove thinking indicator
                        if (thinkingElement.parentNode) {
                            assistantMessages.removeChild(thinkingElement);
                        }
                        
                        // Add welcome message
                        addChatMessages(getEchoIntroMessages(), 'ai', 900);
                    }, 2000);
                }
            }
        } else {
            console.error('Tab content not found:', tabName);
        }
    };
    
    console.log('Global handler functions initialized');
});

// Video tutorial elements
const videoTutorialModal = document.getElementById('video-tutorial-modal');
const videoTutorialVideo = videoTutorialModal.querySelector('video');

// Function to show video tutorial
function showVideoTutorial() {
    videoTutorialModal.style.display = 'flex';
    videoTutorialVideo.play();
}

// Function to close video tutorial
function closeVideoTutorial() {
    videoTutorialModal.style.display = 'none';
    videoTutorialVideo.pause();
    videoTutorialVideo.currentTime = 0;
    gameState.hasShownTutorial = true;
    
    // Start the actual game
    startGameAfterTutorial();
}

// Make functions available globally
window.showVideoTutorial = showVideoTutorial;
window.closeVideoTutorial = closeVideoTutorial;

// Skip button for video tutorial
window.skipVideoTutorial = function() {
    videoTutorialModal.style.display = 'none';
    videoTutorialVideo.pause();
    videoTutorialVideo.currentTime = 0;
    gameState.hasShownTutorial = true;
    
    // Start the actual game
    startGameAfterTutorial();
};

// Hint modal elements
const hintModal = document.getElementById('hint-modal');
const hintModalText = document.getElementById('hint-modal-text');

// Show the hint modal with specified hint text
function showHintModal(hintText) {
    // Clear any existing hint timers
    clearHintTimers();
    
    // If there's no hint text or game is not active, don't show anything
    if (!hintText || !gameState.isGameActive) return;
    
    // Update the hint text
    hintModalText.textContent = hintText;
    
    // Show the modal
    hintModal.style.display = 'flex';
    
    // Play hint sound
    soundManager.play('hint');
    
    // Track that we've shown a hint
    gameState.hintsUsed++;
    gameState.shownHints++;
}

// Close the hint modal
function closeHintModal() {
    hintModal.style.display = 'none';
    
    // Restore focus to terminal input immediately
    const terminalInput = document.getElementById('terminal-input');
    if (terminalInput) {
        // Use setTimeout to ensure modal is fully closed before focusing
        setTimeout(() => {
            terminalInput.focus();
        }, 100);
    }
    
    // Start timers for the next hints if we haven't shown all hints yet
    const currentPuzzle = gameState.editedPuzzles[gameState.currentPuzzle];
    if (gameState.shownHints < currentPuzzle.hints.length) {
        startHintTimers();
    }
}

// Clear any existing hint timers
function clearHintTimers() {
    gameState.hintTimers.forEach(timer => clearTimeout(timer));
    gameState.hintTimers = [];
}

// Start timers for automatic hints
function startHintTimers() {
    // Clear any existing timers first
    clearHintTimers();
    
    // Reset puzzle start time
    gameState.puzzleStartTime = Date.now();
    
    // Reset shown hints for this puzzle
    gameState.shownHints = 0;
    
    // Get the current puzzle and its hints
    const currentPuzzle = gameState.editedPuzzles[gameState.currentPuzzle];
    if (!currentPuzzle || !currentPuzzle.hints || currentPuzzle.hints.length === 0) return;
    
    // Set timers for each hint based on the progressive timing
    const hintTimes = [
        Math.floor(Math.random() * (5 * 60000 - 3 * 60000) + 3 * 60000), // 3-5 minutes for first hint
        Math.floor(Math.random() * (9 * 60000 - 7 * 60000) + 7 * 60000), // 7-9 minutes for second hint
        Math.floor(Math.random() * (12 * 60000 - 10 * 60000) + 10 * 60000) // 10-12 minutes for third hint
    ];
    
    // Create timers for each available hint
    for (let i = 0; i < Math.min(hintTimes.length, currentPuzzle.hints.length); i++) {
        const timer = setTimeout(() => {
            // Only show the hint if we're still on the same puzzle
            if (gameState.isGameActive && gameState.shownHints === i) {
                showHintModal(currentPuzzle.hints[i]);
            }
        }, hintTimes[i]);
        
        gameState.hintTimers.push(timer);
    }
    
    console.log('Hint timers started for puzzle', gameState.currentPuzzle + 1);
}

// Make hint modal functions globally available
window.showHintModal = showHintModal;
window.closeHintModal = closeHintModal;

// Function to reset the game
function resetGame() {
    // Stop the timer
    if (typeof stopTimer === 'function') {
        stopTimer();
    }
    
    // Clear all timers
    clearHintTimers();
    stopPeriodicSystemMessages();
    
    // Reset game state
    gameState.currentPuzzle = 0;
    gameState.hintsUsed = 0;
    gameState.isGameActive = false;
    gameState.startTime = null;
    gameState.endTime = null;
    gameState.waitingForConfirmation = false;
    gameState.shownHints = 0;
    gameState.puzzleStartTime = null;
    
    // Clean up sorting puzzle if active
    if (typeof cleanupSortingPuzzle === 'function') {
        cleanupSortingPuzzle();
    }
    
    // Clear terminal
    if (typeof clearTerminal === 'function') {
        clearTerminal();
    }
    
    // Reset reactor status
    if (typeof updateReactorStatus === 'function') {
        updateReactorStatus([], 0);
    }
    
    // Show startup screen, hide others
    startupScreen.classList.remove('hidden');
    mainScreen.classList.add('hidden');
    successScreen.classList.add('hidden');
    failureScreen.classList.add('hidden');
    
    // Reset video briefing state
    const videoBriefingContainer = document.getElementById('video-briefing-container');
    const bootSequenceContainer = document.getElementById('boot-sequence-container');
    const transmissionText = document.getElementById('transmission-text');
    const replayBtn = document.getElementById('replay-transmission-button');
    const skipBtn = document.getElementById('skip-video-button');
    const startButton = document.getElementById('start-button');
    
    if (videoBriefingContainer) videoBriefingContainer.classList.remove('hidden');
    if (bootSequenceContainer) bootSequenceContainer.classList.add('hidden');
    if (transmissionText) transmissionText.classList.add('hidden');
    if (replayBtn) replayBtn.style.display = 'none';
    if (skipBtn) skipBtn.style.display = 'none';
    if (startButton) startButton.style.display = 'none';
    
    // Stop any playing audio
    const transmissionAudio = document.getElementById('transmission-audio');
    if (transmissionAudio) {
        transmissionAudio.pause();
        transmissionAudio.currentTime = 0;
    }
    
    // Clear input fields
    const terminalInput = document.getElementById('terminal-input');
    const assistantInput = document.getElementById('assistant-input');
    if (terminalInput) terminalInput.value = '';
    if (assistantInput) assistantInput.value = '';
    
    // Clear chat messages
    const assistantMessages = document.getElementById('assistant-messages');
    if (assistantMessages) {
        assistantMessages.innerHTML = '';
    }
    
    console.log('Game reset complete');
}