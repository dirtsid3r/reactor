# NRRC Terminal Game – Maker Test & Tutorial

This file is for internal use by the makers of the NRRC Terminal game. It includes a full QA checklist, all current passphrases, and a step-by-step tutorial for finishing the game.

---

## 1. Game Startup & UI
- [ ] Game loads with no errors in console.
- [ ] Space Mono font is used everywhere.
- [ ] All main screens (startup, main, success, failure) are accessible.
- [ ] "OPEN TRANSMISSION" button appears on startup.
- [ ] Transmission text and audio play on user interaction.
- [ ] Transmission text is green, typewriter effect works, and cursor disappears after typing.
- [ ] "I GET IT, SAVE THE PLANET" button appears after transmission.

## 2. Audio (Hum & SFX)
- [ ] Reactor hum starts after first user interaction and loops seamlessly (no gaps/clicks).
- [ ] Button click sound plays for all major buttons (tabs, upload, send, etc.).
- [ ] Keystroke sound plays for every terminal keypress.
- [ ] Timer tick sound is audible and plays every second during countdown.
- [ ] Success and error sounds play on correct/incorrect passphrase.
- [ ] Hint sound plays when E.C.H.O. gives a hint.

## 3. Terminal & Typewriter Effects
- [ ] Terminal text is bold, readable, and uses correct color (white for normal, green for system).
- [ ] System messages (e.g., "> PROCESSING PASSPHRASE...") are green and bold.
- [ ] Typewriter effect animates puzzle and boot messages.
- [ ] Cursor is hidden after typewriter effect completes.

## 4. Puzzle Flow & Passphrases
- [ ] Each puzzle loads in order, with a green system message above the initial message (e.g., "> COMPONENT REPAIR INITIATED: [COMPONENT NAME]").
- [ ] Entering the correct passphrase advances to the next puzzle and plays success sound.
- [ ] Entering an incorrect passphrase shows a green error message and plays error sound.
- [ ] All passphrases are case-insensitive.
- [ ] Test all passphrases:
    - [ ] Puzzle 1 (Blocking generator): carbon footprint
    - [ ] Puzzle 2 (What is the target?): hidden costs
    - [ ] Puzzle 3 (Power Plant Leak): Idle Monitor Control Panel Lights Security Cameras Charging Station Coffee Machine
    - [ ] Puzzle 4 (Recycling Relay): Plastic Paper Metal Organic E-Waste Glass
    - [ ] Puzzle 5 (Keep 1.5 Alive): KEEP 1.5 ALIVE
    - [ ] Puzzle 6 (Water Use): Beef, Burger, Milk, Coffee, Toast, Tea
    - [ ] Puzzle 7 (UV Reveal): 140SYNTHETICLIES
    - [ ] Puzzle 8 (AI Overlord): Prompts = Water
    - [ ] Puzzle 9 (Generator Chaos): Recycled Aluminum Panels Bamboo Insulation Wrap Reclaimed Copper Coil 3D-printed Plastic Mount Modular Circuit Core Solar-Compatible Glass Panel
- [ ] After last puzzle, success screen appears with time remaining.
- [ ] Failure screen appears if timer runs out.

## 5. E.C.H.O. Assistant Chat
- [ ] Tab is labeled "E.C.H.O." everywhere.
- [ ] E.C.H.O. intro matches transmission script (formal, direct, dry humor, urgency).
- [ ] E.C.H.O. breaks up long replies into chat-like messages.
- [ ] Asking for a hint returns only the hint (no extra text).
- [ ] E.C.H.O. responds appropriately to greetings, questions about itself, the reactor, and off-topic queries.
- [ ] Hint sound plays when hint is given.

## 6. Sorting Puzzle
- [ ] Sorting puzzle appears for the correct puzzle (Puzzle 2: hidden costs).
- [ ] Drag-and-drop works smoothly; items snap into categories.
- [ ] Revealed characters update as categories are completed.
- [ ] Sorting puzzle is visually compact and matches terminal theme.

## 7. Admin Panel
- [ ] Admin panel opens with Alt+A or "adminaccess" in terminal.
- [ ] All puzzles can be edited, saved, imported, and exported.
- [ ] Custom SVG icons preview correctly.
- [ ] Sorting puzzle editor works for categories and items.

## 8. Edge Cases & Resets
- [ ] "resetgame" in terminal resets the game.
- [ ] Audio unlocks on first interaction (no browser errors).
- [ ] Game can be restarted from success/failure screens.
- [ ] No lingering audio or cursor after reset.
- [ ] All screens and features work on Chrome, Edge, and Firefox.

---

## Tutorial: How to Finish the Game

1. **Start the Game**
    - Open the game in your browser.
    - Click "OPEN TRANSMISSION" and listen/read the briefing.
    - Click "I GET IT, SAVE THE PLANET" to begin.

2. **Solve Each Puzzle**
    - Read the terminal message for each component.
    - Enter the correct passphrase (see list above) in the terminal and press "UPLOAD".
    - If you get it wrong, try again or ask E.C.H.O. for a hint.
    - For Puzzle 2, complete the sorting puzzle to reveal the passphrase.

3. **Use E.C.H.O. for Help**
    - Click the "E.C.H.O." tab.
    - Type "hint" for a clue, or ask questions about the reactor or process.
    - E.C.H.O. will reply in a chat-like format.

4. **Progress and Win**
    - Each correct passphrase repairs a component and advances to the next puzzle.
    - Complete all 9 puzzles before the timer runs out to win.
    - If the timer expires, the failure screen appears; click "RETRY SIMULATION" to try again.

5. **Admin Panel (for makers only)**
    - Press Alt+A or type "adminaccess" in the terminal to open the admin panel.
    - Edit, save, import, or export puzzles as needed.

---

**Tested by:** ____________________  
**Date:** ____________________ 