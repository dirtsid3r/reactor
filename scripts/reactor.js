// Reactor component labels from the plan with sci-fi symbols
const componentLabels = [
    '⌬ Carbon Intake & Capture',
    '⚛ Molecular Disassembly',
    '☢ Nuclear Energy Core',
    '⎔ Isotopic Reformation',
    '❄ Cryogenic Carbon Storage',
    '⚙ Synthetic Fuel Fabrication',
    '⟲ Closed-loop Energy Distribution',
    '♲ Waste Reclamation & Cooling',
    '⧗ AI-Controlled Ecosystem'
];

// Track state of components
const reactorState = {
    activeComponent: -1,
    repairedComponents: [],
    errorComponent: -1, // For showing error animation
    hoverComponent: -1  // Track which component is being hovered
};

/**
 * Initialize the reactor
 */
export function initReactor() {
    const schematicContainer = document.getElementById('reactor-schematic');
    if (schematicContainer) {
        schematicContainer.innerHTML = getReactorSchematic();
        addReactorInteractivity();
    }
}

/**
 * Add interactivity to reactor components
 */
function addReactorInteractivity() {
    // Add event listeners to reactor components for hover and click effects
    for (let i = 0; i < componentLabels.length; i++) {
        const component = document.getElementById(`component-${i}`);
        if (component) {
            // Add hover effects
            component.addEventListener('mouseenter', () => {
                reactorState.hoverComponent = i;
                showComponentTooltip(i);
            });
            
            component.addEventListener('mouseleave', () => {
                reactorState.hoverComponent = -1;
                hideComponentTooltip();
            });
            
            // Add click effects - flash error if component not active
            component.addEventListener('click', () => {
                if (i !== reactorState.activeComponent) {
                    flashErrorOnComponent(i);
                } else {
                    // Flash active indication
                    pulseActiveComponent(i);
                    
                    // Shift focus to terminal input
                    document.getElementById('terminal-input').focus();
                }
            });
        }
    }
}

/**
 * Show tooltip for component
 * @param {number} index - Component index
 */
function showComponentTooltip(index) {
    const component = document.getElementById(`component-${index}`);
    if (!component) return;
    
    // Create tooltip if it doesn't exist
    let tooltip = document.getElementById('component-tooltip');
    if (!tooltip) {
        tooltip = document.createElement('div');
        tooltip.id = 'component-tooltip';
        tooltip.style.position = 'absolute';
        tooltip.style.backgroundColor = 'rgba(0, 0, 0, 0.9)';
        tooltip.style.border = '1px solid #00ff66';
        tooltip.style.padding = '8px 12px';
        tooltip.style.color = '#00ff66';
        tooltip.style.fontFamily = 'Courier New, monospace';
        tooltip.style.fontSize = '12px';
        tooltip.style.pointerEvents = 'none';
        tooltip.style.zIndex = '1000';
        tooltip.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
        tooltip.style.boxShadow = '0 0 10px rgba(0, 255, 102, 0.3)';
        tooltip.style.borderRadius = '0';
        tooltip.style.maxWidth = '200px';
        document.getElementById('reactor-schematic').appendChild(tooltip);
    }
    
    // Set tooltip content and position
    const componentRect = component.getBoundingClientRect();
    const schematicRect = document.getElementById('reactor-schematic').getBoundingClientRect();
    
    // Determine if component is repaired
    const statusText = reactorState.repairedComponents.includes(index) ? 
        '<span style="color: #00ffaa;">REPAIRED</span>' : 
        (index === reactorState.activeComponent ? 
            '<span style="color: #ffff33;">ACTIVE</span>' : 
            '<span style="color: #ff5555;">OFFLINE</span>');
    
    // Add additional info for enhanced tooltips
    const componentInfo = getComponentInfo(index);
    
    tooltip.innerHTML = `
        <div style="text-align: center; margin-bottom: 5px; font-weight: bold; border-bottom: 1px solid rgba(0, 255, 102, 0.3); padding-bottom: 4px;">${componentLabels[index]}</div>
        <div style="margin-bottom: 4px;">Status: ${statusText}</div>
        <div style="font-size: 10px; color: #aaffcc; margin-top: 5px;">${componentInfo}</div>
        <div style="font-size: 9px; margin-top: 8px; text-align: center; color: rgba(0, 255, 102, 0.7);">
            ${index === reactorState.activeComponent ? '[CLICK TO FOCUS TERMINAL]' : ''}
        </div>
    `;
    
    // Position tooltip - adjusted for better visibility
    // Try to position above component first, fallback to below if not enough space
    const tooltipHeight = tooltip.offsetHeight;
    const spaceAbove = componentRect.top - schematicRect.top;
    
    if (spaceAbove > tooltipHeight + 20) {
        // Position above component
        tooltip.style.left = (componentRect.left - schematicRect.left + (componentRect.width / 2) - (tooltip.offsetWidth / 2)) + 'px';
        tooltip.style.top = (componentRect.top - schematicRect.top - tooltipHeight - 10) + 'px';
    } else {
        // Position below component
        tooltip.style.left = (componentRect.left - schematicRect.left + (componentRect.width / 2) - (tooltip.offsetWidth / 2)) + 'px';
        tooltip.style.top = (componentRect.top - schematicRect.top + componentRect.height + 10) + 'px';
    }
    
    tooltip.style.opacity = '1';
    tooltip.style.transform = 'scale(1)';
    
    // Update system uptime in the annotation
    const uptimeElement = document.getElementById('system-uptime');
    if (uptimeElement) {
        const countdownElement = document.getElementById('countdown');
        if (countdownElement) {
            uptimeElement.textContent = countdownElement.textContent;
        }
    }
    
    // No need to update system integrity as the element has been removed
}

/**
 * Hide component tooltip
 */
function hideComponentTooltip() {
    const tooltip = document.getElementById('component-tooltip');
    if (tooltip) {
        tooltip.style.opacity = '0';
        tooltip.style.transform = 'scale(0.95)';
    }
}

/**
 * Flash error animation on component
 * @param {number} index - Component index
 */
function flashErrorOnComponent(index) {
    const component = document.getElementById(`component-${index}`);
    if (!component) return;
    
    // Set error state
    reactorState.errorComponent = index;
    component.classList.add('error');
    
    // Play error sound if supported
    playSound('error');
    
    // Remove error class after animation
    setTimeout(() => {
        component.classList.remove('error');
        reactorState.errorComponent = -1;
    }, 800);
}

/**
 * Pulse active component for attention
 * @param {number} index - Component index
 */
function pulseActiveComponent(index) {
    const component = document.getElementById(`component-${index}`);
    if (!component) return;
    
    // Temporarily increase animation
    component.style.animationDuration = '0.5s';
    
    // Reset after animation
    setTimeout(() => {
        component.style.animationDuration = '';
    }, 1500);
    
    // Play interaction sound
    playSound('interact');
}

/**
 * Play sound effect if audio supported
 * @param {string} type - Sound type to play
 */
function playSound(type) {
    // Only implement if needed - stub for audio integration
    // console.log(`Playing ${type} sound effect`);
}

/**
 * Update the reactor status based on solved puzzles
 * @param {number} solvedIndex - Index of last solved component or array of solved indices
 * @param {number} currentIndex - Index of currently active component
 */
export function updateReactorStatus(solvedIndex, currentIndex) {
    console.log('Updating reactor status:', { solvedIndex, currentIndex });
    
    // Handle both array of solved puzzles or single index
    if (Array.isArray(solvedIndex)) {
        reactorState.repairedComponents = [...solvedIndex];
    } else if (solvedIndex >= 0) {
        if (!reactorState.repairedComponents.includes(solvedIndex)) {
            reactorState.repairedComponents.push(solvedIndex);
        }
    }
    
    // Update active component
    reactorState.activeComponent = currentIndex;
    
    console.log('Reactor state after update:', { 
        active: reactorState.activeComponent, 
        repaired: [...reactorState.repairedComponents] 
    });
    
    // Update component visuals
    updateComponentVisuals();
    
    // Update status percentage
    updateStatusPercentage();
    
    // Update countdown timer styling based on progress
    updateCountdownStyle();
}

/**
 * Update the visual appearance of all components
 */
function updateComponentVisuals() {
    console.log('Updating component visuals, active component:', reactorState.activeComponent);
    
    // Reset all components to default state
    for (let i = 0; i < componentLabels.length; i++) {
        const component = document.getElementById(`component-${i}`);
        const line = document.getElementById(`line-${i}`);
        const statusIndicator = document.getElementById(`status-${i}`);
        
        if (component) {
            component.classList.remove('repaired', 'active', 'error');
            
            // Add appropriate classes based on state
            if (reactorState.repairedComponents.includes(i)) {
                component.classList.add('repaired');
                console.log(`Component ${i} marked as repaired`);
                // Remove status indicator code for repaired components
                if (statusIndicator) {
                    statusIndicator.style.display = 'none';
                }
            } else if (i === reactorState.activeComponent) {
                component.classList.add('active');
                console.log(`Component ${i} marked as active, classList:`, component.classList);
                // Remove status indicator code for active components
                if (statusIndicator) {
                    statusIndicator.style.display = 'none';
                }
                
                // Add visual indicator pointing to the active component
                addActiveIndicator(i);
            } else {
                // Reset indicator for inactive components
                if (statusIndicator) {
                    statusIndicator.style.display = 'none';
                }
            }
            
            // Handle component lines (connections)
            if (line) {
                line.classList.remove('repaired', 'active');
                
                if (reactorState.repairedComponents.includes(i)) {
                    line.classList.add('repaired');
                } else if (i === reactorState.activeComponent) {
                    line.classList.add('active');
                }
            }
        }
    }
    
    // If no active component, hide the active indicator
    if (reactorState.activeComponent === -1) {
        hideActiveIndicator();
    }
}

/**
 * Add an indicator pointing to the active component
 * @param {number} index - Component index
 */
function addActiveIndicator(index) {
    // Get component position to place the indicator
    const component = document.getElementById(`component-${index}`);
    if (!component) return;
    
    // Get the SVG element and component position
    const svg = document.querySelector('#reactor-schematic svg');
    if (!svg) return;
    
    // Calculate center position
    const centerX = 200;
    const centerY = 200;
    
    // Get component position and radius
    let componentX, componentY;
    let componentRadius = 30; // Default for outer components
    
    if (index === 2) {
        // It's the center core
        componentX = centerX;
        componentY = centerY;
        componentRadius = 50; // Larger radius for core
    } else {
        // For outer components (arranged in a circle)
        const radius = 120; // Same as in generateComponentsInCircle
        
        // Skip component 2 (core) as it's in the center
        let adjustedIndex = index;
        if (index > 2) adjustedIndex--;
        
        const angle = ((adjustedIndex) * Math.PI * 2) / 8;
        componentX = centerX + radius * Math.cos(angle);
        componentY = centerY + radius * Math.sin(angle);
        
        // Create indicator arrow pointing to the component
        const indicator = document.getElementById('active-indicator');
        if (indicator) {
            // Calculate angle for arrow rotation
            const arrowAngle = (angle * 180 / Math.PI) + 90; // +90 to point outward
            
            // Position arrow between center and component (30% of distance from center)
            const arrowX = centerX + (radius * 0.3) * Math.cos(angle);
            const arrowY = centerY + (radius * 0.3) * Math.sin(angle);
            
            // Update arrow with pulsing effect
            indicator.innerHTML = `
                <path d="M0,-10 L5,5 L-5,5 Z" fill="#ffff00" filter="drop-shadow(0 0 5px rgba(255, 255, 0, 0.8))">
                    <animate attributeName="opacity" values="0.7;1;0.7" dur="1.5s" repeatCount="indefinite" />
                </path>
            `;
            
            // Position and rotate indicator
            indicator.setAttribute('transform', `translate(${arrowX}, ${arrowY}) rotate(${arrowAngle})`);
            indicator.style.opacity = '1';
        }
    }
    
    // Add highlight effect around the active component
    const highlight = document.getElementById('active-highlight');
    if (highlight) {
        // Create pulsing highlight circle
        highlight.innerHTML = `
            <circle cx="${componentX}" cy="${componentY}" r="${componentRadius + 5}" 
                    fill="none" stroke="#ffff00" stroke-width="2" 
                    stroke-opacity="0.6" stroke-dasharray="10,5">
                <animate attributeName="stroke-opacity" values="0.3;0.8;0.3" dur="2s" repeatCount="indefinite" />
                <animate attributeName="r" values="${componentRadius + 5};${componentRadius + 8};${componentRadius + 5}" dur="2s" repeatCount="indefinite" />
                <animate attributeName="stroke-dashoffset" from="0" to="30" dur="3s" repeatCount="indefinite" />
            </circle>
            <circle cx="${componentX}" cy="${componentY}" r="${componentRadius + 2}" 
                    fill="none" stroke="#ffff00" stroke-width="1.5" 
                    stroke-opacity="0.4">
                <animate attributeName="stroke-opacity" values="0.2;0.6;0.2" dur="1.5s" repeatCount="indefinite" />
            </circle>
        `;
        highlight.style.opacity = '1';
    }
}

/**
 * Hide the active component indicator
 */
function hideActiveIndicator() {
    const indicator = document.getElementById('active-indicator');
    if (indicator) {
        indicator.style.opacity = '0';
    }
    
    const highlight = document.getElementById('active-highlight');
    if (highlight) {
        highlight.style.opacity = '0';
    }
}

/**
 * Update the status percentage display with appropriate color coding
 */
function updateStatusPercentage() {
    const percentComplete = Math.round((reactorState.repairedComponents.length / componentLabels.length) * 100);
    const percentageElement = document.getElementById('reactor-percentage');
    
    if (percentageElement) {
        percentageElement.textContent = percentComplete;
        
        // Remove previous status
        percentageElement.removeAttribute('data-status');
        
        // Set color status based on percentage
        if (percentComplete < 33) {
            percentageElement.setAttribute('data-status', 'low');
        } else if (percentComplete < 66) {
            percentageElement.setAttribute('data-status', 'medium');
        } else {
            percentageElement.setAttribute('data-status', 'high');
        }
    }
}

/**
 * Update countdown timer styling based on remaining time
 */
function updateCountdownStyle() {
    const countdownElement = document.getElementById('countdown');
    if (!countdownElement) return;
    
    const timeText = countdownElement.textContent;
    const timeParts = timeText.split(':');
    
    if (timeParts.length === 2) {
        const minutes = parseInt(timeParts[0]);
        const timerElement = countdownElement.parentElement;
        
        // Remove previous classes
        timerElement.classList.remove('warning', 'critical');
        
        // Add appropriate class based on remaining time
        if (minutes < 10) {
            timerElement.classList.add('critical');
        } else if (minutes < 20) {
            timerElement.classList.add('warning');
        }
    }
}

/**
 * Get the SVG for the reactor schematic
 * @returns {string} SVG markup for the reactor schematic
 */
export function getReactorSchematic() {
    // Create an SVG representation of the reactor
    // This is a simplified representation with components arranged in a circle
    
    const svg = `
    <svg width="100%" height="100%" viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg">
        <!-- Filter definitions -->
        <defs>
            <filter id="radarGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="2" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
            <radialGradient id="reactorGlow" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
                <stop offset="0%" style="stop-color:#ff3333;stop-opacity:0.1" />
                <stop offset="100%" style="stop-color:#000000;stop-opacity:0" />
            </radialGradient>
        </defs>
        
        <!-- Background glow -->
        <circle cx="200" cy="200" r="180" fill="url(#reactorGlow)" />
        
        <!-- Decorative elements for sci-fi look (behind components) -->
        <circle cx="200" cy="200" r="170" fill="none" stroke="#ff3333" stroke-opacity="0.15" stroke-width="1" stroke-dasharray="5,5" />
        <circle cx="200" cy="200" r="155" fill="none" stroke="#ff3333" stroke-opacity="0.1" stroke-width="1" />
        <circle cx="200" cy="200" r="150" fill="none" stroke="#ff3333" stroke-opacity="0.2" stroke-width="1" />
        <circle cx="200" cy="200" r="120" fill="none" stroke="#ff3333" stroke-opacity="0.1" stroke-width="1" />
        <circle cx="200" cy="200" r="75" fill="none" stroke="#ff3333" stroke-opacity="0.15" stroke-width="1" />
        
        <!-- Rotating element for visual effect -->
        <g id="rotating-element">
            <circle cx="200" cy="200" r="165" fill="none" stroke="#ff3333" stroke-opacity="0.05" stroke-width="1" stroke-dasharray="10,20">
                <animateTransform 
                    attributeName="transform" 
                    attributeType="XML" 
                    type="rotate" 
                    from="0 200 200" 
                    to="360 200 200" 
                    dur="60s" 
                    repeatCount="indefinite"
                />
            </circle>
            <circle cx="200" cy="200" r="140" fill="none" stroke="#ff3333" stroke-opacity="0.05" stroke-width="1" stroke-dasharray="15,15">
                <animateTransform 
                    attributeName="transform" 
                    attributeType="XML" 
                    type="rotate" 
                    from="360 200 200" 
                    to="0 200 200" 
                    dur="45s" 
                    repeatCount="indefinite"
                />
            </circle>
        </g>
        
        <!-- Grid lines for depth effect -->
        <line x1="50" y1="200" x2="350" y2="200" stroke="#ff3333" stroke-opacity="0.08" stroke-width="1" />
        <line x1="200" y1="50" x2="200" y2="350" stroke="#ff3333" stroke-opacity="0.08" stroke-width="1" />
        <line x1="120" y1="120" x2="280" y2="280" stroke="#ff3333" stroke-opacity="0.05" stroke-width="1" />
        <line x1="120" y1="280" x2="280" y2="120" stroke="#ff3333" stroke-opacity="0.05" stroke-width="1" />
        
        <!-- Radar scanning effect -->
        <path id="radar-beam" d="M 200,200 L 370,200 A 170 170 0 0 0 200,30 Z" 
              fill="rgba(255, 51, 51, 0.1)" 
              stroke="none"
              filter="url(#radarGlow)">
            <animateTransform
                attributeName="transform"
                attributeType="XML"
                type="rotate"
                from="0 200 200"
                to="360 200 200"
                dur="5s"
                repeatCount="indefinite"
            />
        </path>
        
        <!-- Connecting lines (behind components) -->
        ${generateConnectingLines()}
        
        <!-- Outer components in a circle -->
        ${generateComponentsInCircle()}
        
        <!-- Center reactor core with pulsing effect -->
        <circle cx="200" cy="200" r="50" class="reactor-component" id="component-2">
            <animate attributeName="opacity" values="0.8;1;0.8" dur="3s" repeatCount="indefinite" />
        </circle>
        <text x="200" y="200" class="reactor-label" dy=".3em" font-size="18">☢</text>
        <circle cx="200" cy="200" r="45" fill="none" stroke="#ff3333" stroke-opacity="0.3" stroke-width="1">
            <animate attributeName="r" values="40;45;40" dur="2s" repeatCount="indefinite" />
        </circle>

        <!-- Indicator arrows for active component -->
        <g id="active-indicator" style="opacity: 0; transition: opacity 0.5s ease;">
            <!-- Arrow indicators will be added dynamically -->
        </g>
        
        <!-- Active component highlight -->
        <g id="active-highlight" style="opacity: 0; transition: opacity 0.5s ease;">
            <!-- Dynamic highlight effect for active component -->
        </g>
        
        <!-- Data display annotations -->
        <g id="data-annotations" font-family="Courier New" font-size="8" fill="#ff6666" fill-opacity="0.7">
            <text x="50" y="380">NRRC.sys</text>
            <text x="315" y="380">v1.0.7</text>
            <text x="50" y="20">T-<tspan id="system-uptime">00:00</tspan></text>
        </g>
    </svg>
    `;
    
    return svg;
}

/**
 * Generate the SVG for components arranged in a circle
 * @returns {string} SVG markup for the components
 */
function generateComponentsInCircle() {
    const centerX = 200;
    const centerY = 200;
    const radius = 120;
    const components = [];
    
    // Import puzzles data to get custom icons if available
    let puzzleData = [];
    try {
        // Check if we can access puzzles from the game state
        if (window.gameState && window.gameState.editedPuzzles) {
            puzzleData = window.gameState.editedPuzzles;
        }
    } catch (e) {
        console.log('Could not access puzzle data for custom icons');
    }
    
    // Skip component 2 (core) as it's in the center
    const outerComponents = [...componentLabels];
    outerComponents.splice(2, 1);
    
    // Arrange the 8 remaining components in a circle
    for (let i = 0; i < outerComponents.length; i++) {
        const angle = (i * Math.PI * 2) / outerComponents.length;
        const x = centerX + radius * Math.cos(angle);
        const y = centerY + radius * Math.sin(angle);
        
        // Get original index (accounting for the removed core)
        let originalIndex = i;
        if (i >= 2) originalIndex++;
        
        // Extract symbol from label
        const symbol = outerComponents[i].split(' ')[0];
        
        // Status indicator position (slightly offset from the component)
        const indicatorDistance = 38; // Distance from component center
        const indicatorX = x + (indicatorDistance * Math.cos(angle));
        const indicatorY = y + (indicatorDistance * Math.sin(angle));
        
        // Check if custom SVG icon exists
        let iconContent = `<text x="${x}" y="${y}" class="reactor-label" dy=".3em" font-size="15">${symbol}</text>`;
        
        // If puzzle data is available and has custom SVG icon, use it
        if (puzzleData[originalIndex] && puzzleData[originalIndex].iconSvg) {
            const customSvg = puzzleData[originalIndex].iconSvg;
            iconContent = `
            <g transform="translate(${x-15}, ${y-15}) scale(0.3)">
                ${customSvg}
            </g>`;
        }
        
        // Create shape based on component type
        const shape = `
        <g id="component-group-${originalIndex}">
            <circle cx="${x}" cy="${y}" r="30" class="reactor-component" id="component-${originalIndex}" />
            ${iconContent}
            
            <!-- Hidden status indicator - kept for compatibility but not displayed -->
            <g id="status-${originalIndex}" class="status-indicator" transform="translate(${indicatorX - 6}, ${indicatorY - 6})" style="display: none;">
            </g>
        </g>
        `;
        
        components.push(shape);
    }
    
    // Also add status indicator for center component (hidden)
    const centerIndicator = `
    <g id="status-2" class="status-indicator" transform="translate(234, 194)" style="display: none;">
    </g>
    `;
    
    return components.join('') + centerIndicator;
}

/**
 * Generate connecting lines between components
 * @returns {string} SVG markup for the connecting lines
 */
function generateConnectingLines() {
    const centerX = 200;
    const centerY = 200;
    const radius = 120;
    const lines = [];
    
    // Connect center to all outer components
    for (let i = 0; i < 8; i++) {
        const angle = (i * Math.PI * 2) / 8;
        const outerX = centerX + radius * Math.cos(angle);
        const outerY = centerY + radius * Math.sin(angle);
        
        // Get original index (accounting for the removed core)
        let originalIndex = i;
        if (i >= 2) originalIndex++;
        
        // Create simple lines without decorative nodes at midpoint
        const line = `
        <g id="connection-group-${originalIndex}">
            <line x1="${centerX}" y1="${centerY}" x2="${outerX}" y2="${outerY}" 
                  stroke="#00ff66" stroke-width="2" 
                  class="component-line" id="line-${originalIndex}" />
        </g>
        `;
        
        lines.push(line);
    }
    
    return lines.join('');
}

/**
 * Get technical info about a component
 * @param {number} index - Component index
 * @returns {string} Technical information about the component
 */
function getComponentInfo(index) {
    // Component-specific technical details
    const technicalInfo = [
        "I/O: 240Kt/h • Purification: 99.7%",
        "Quantum Efficiency: 94.3% • Yield: 15.8T/h",
        "Output: 1.8GW • Core Temp: 723°C",
        "Atoms processed: 9.7x10^22/s • Purity: 99.97%",
        "Storage capacity: 140T • Temp: -196°C",
        "Production Rate: 70L/h • Quality: 98.2%",
        "Distribution: 94.8% • Recapture: 99.4%",
        "Heat Reclamation: 82.7% • Water: 960L/h",
        "Process Optimization: 99.3% • Cycles: 243"
    ];
    
    return technicalInfo[index] || "System data unavailable";
} 