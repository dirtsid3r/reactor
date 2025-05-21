# Nuclear Carbon Recycling Reactor (N.R.R.C) Escape Room Digital Companion Design Document - Development Guide for Cursor AI

## Game Overview
A digital companion application supporting a sustainability-themed escape room experience. Players assume the role of scientists/researchers who must repair a malfunctioning Nuclear Carbon Recycling Reactor (N.R.R.C) through a series of puzzles and challenges.

## Game Setting
- **Location**: Scientific laboratory
- **Physical components**: Laptop, puzzles, items on a table
- **Digital component**: Companion application interface (N.R.R.C Terminal)
- **Total game duration**: 45 minutes (includes countdown timer)

## Core Concept
Players must solve physical puzzles to discover keywords/passphrases that are entered into the digital companion application. Each passphrase corresponds to a different component of the N.R.R.C that needs repair. Successfully repairing all components saves the reactor.

## User Interface Design

Refer to the screenshot in the folder for UI.

### UI Components
1. **Header Bar**
   - Title: "N.R.R.C" (top left)
   - Progress indicator: "01 of 09" (top right)

2. **Navigation Tabs**
   - "Reactor" tab (active, red background)
   - "Support" tab (inactive, dark background)

3. **Reactor Status Panel (Left Side)**
   - Reactor Status indicator: "0%" (currently failing)
   - Reactor diagram/schematic (displayed in red, indicating failure)
   - Countdown timer: "Time to Meltdown 45:00" (bottom)

4. **Machine Fix Terminal (Right Side)**
   - Terminal header: "Machine Fix Terminal"
   - Terminal display area (green text on black background)
   - Terminal message area (for displaying prompts, hints, success messages)
   - Input field: "Type your answer here..." (bottom)
   - "Upload" button (green, for submitting answers)

### Visual Style
- Dark interface with high contrast
- Emergency red for failing components
- Terminal-style green text on black background for the command interface
- Simple, technical diagrams and schematics
- Status indicators that change from red to green as puzzles are solved

### UI State Changes
- Reactor status percentage will increase as components are fixed (0% → 100%)
- Progress indicator will advance (01 of 09 → 02 of 09, etc.)
- Reactor schematic elements will change from red to green as corresponding components are repaired
- Terminal will display different messages based on game state

## Digital Companion Structure
Each reactor component section contains:

1. **Initial message/clue**: Presented in the terminal display before puzzle attempt
2. **Input field**: For entering discovered passphrases
3. **Hint system**: 3 progressive hints triggered by timing or wrong answers
4. **Success message**: Displayed when correct passphrase is entered
5. **Final success message**: Shown when all components are repaired

## Reactor Components & Puzzle Flow

### 1. 🌬 Carbon Intake & Capture (01 of 09)
**System function**: Atmospheric CO₂ collection using ionized air vacuums and nano-filtration membranes
- **Initial message**: [Custom terminal message explaining system failure]
- **Success indicator**: First component of reactor schematic turns green

### 2. 🧪 Molecular Disassembly (02 of 09)
**System function**: Breaking down CO₂ into carbon and oxygen atoms using high-frequency lasers and quantum resonance fields

### 3. ☢ Nuclear Energy Core Activation (03 of 09)
**System function**: Thorium-based molten salt reactor providing power for the facility

### 4. ⚛ Isotopic Reformation (04 of 09)
**System function**: Rearrangement of carbon atoms through magnetic fields and neutron baths to create synthetic hydrocarbons

### 5. 🧊 Cryogenic Carbon Storage (05 of 09)
**System function**: High-pressure storage of carbon in solid, nano-lattice form

### 6. 🛠 Synthetic Fuel Fabrication (06 of 09)
**System function**: Creation of carbon-neutral synthetic fuels by bonding processed carbon with hydrogen

### 7. 🔄 Closed-loop Energy Distribution (07 of 09)
**System function**: Distribution of synthetic fuel to surrounding systems with emissions feeding back into the N.R.R.C

### 8. ♻ Waste Reclamation & Reactor Cooling (08 of 09)
**System function**: Heat recapture system converting waste heat into electricity or powering water purification

### 9. 🧠 AI-Controlled Ecosystem Balance (09 of 09)
**System function**: Central AI monitoring and adjusting carbon levels, reactor efficiency, and city emissions
- **Final success message**: Terminal displays confirmation of full reactor restoration

## Technical Implementation for Cursor AI

### File Structure
```
/
├── index.html          # Main application HTML
├── styles/
│   └── main.css        # Core styling
├── scripts/
│   ├── app.js          # Main application logic
│   ├── timer.js        # Countdown timer functionality
│   ├── terminal.js     # Terminal display and input handling
│   └── reactor.js      # Reactor status visualization
└── data/
    └── puzzles.json    # Content configuration (easily editable)
```

### Content Management System
- Store all content in `puzzles.json` with easily editable fields for:
  - Initial messages/clues
  - Correct passphrases
  - Hint content (3 per puzzle)
  - Success messages
  - Final victory message

### User Interface Elements
- Countdown timer (45 minutes)
- Component status indicators
- Input field for passphrases
- Hint display area
- Success/failure notifications
- Reactor status visualization

### Game Flow Logic Implementation

It will be a simple web game that we will run on a free vercel server.

