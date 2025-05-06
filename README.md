# Nuclear Carbon Recycling Reactor (N.R.R.C) Escape Room Digital Companion

This is a digital companion application for a sustainability-themed escape room experience. Players assume the role of scientists/researchers who must repair a malfunctioning Nuclear Carbon Recycling Reactor (N.R.R.C) through a series of puzzles and challenges.

## Game Overview

Players solve physical puzzles to discover passphrases that are entered into this digital companion application. Each passphrase corresponds to a different component of the N.R.R.C that needs repair. Successfully repairing all components saves the reactor.

## Features

- Terminal-style interface with typewriter animations
- Countdown timer (45 minutes)
- Interactive reactor schematic that visualizes repair progress
- AI assistant chatbot for hints
- Success and failure screens
- Detailed terminal messages for each reactor component

## Deployment Options

### GitHub Pages

This project is configured for GitHub Pages deployment. Simply push to the main branch and GitHub Actions will deploy the site.

### Vercel Deployment

To deploy to Vercel:

1. Fork this repository
2. Create a Vercel account if you don't have one
3. Import the repository in Vercel
4. Deploy with default settings

### Local Development

To run locally:

```bash
# Install dependencies
npm install

# Start local server
npm start

# Access at http://localhost:8080
```

## Game Configuration

The escape room puzzles and passphrases are configured in the `data/puzzles.js` file. Each puzzle contains:

- Component name
- Initial terminal message
- Passphrase (to be discovered through physical puzzles)
- Success message
- Three progressive hints

## Physical Puzzle Integration

This digital companion is designed to work alongside physical puzzles that reveal the passphrases. The game master should:

1. Set up the physical puzzles in the escape room
2. Ensure each puzzle reveals a passphrase when solved
3. Launch this digital application on a laptop or tablet
4. Players enter the discovered passphrases to progress

## Customization

The game can be customized by:

- Modifying the puzzle content in `data/puzzles.js`
- Adjusting the time limit in `scripts/app.js` (default: 45 minutes)
- Changing the visual styling in `styles/main.css`
- Modifying the reactor schematic in `scripts/reactor.js`

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Created for sustainability-themed escape room experiences
- Inspired by real carbon capture and recycling technologies

## Admin Panel

The game includes an admin panel for game operators to modify puzzle details on the fly. This is useful for testing or adjusting the difficulty.

### How to Access Admin Panel

There are two ways to access the admin panel:
1. Press **Alt+A** anywhere in the game
2. Type `adminaccess` in the terminal input and press Enter

### Admin Panel Features

- Edit component names, passphrases, messages, and hints
- Save changes for individual puzzles
- Save all puzzles to browser's localStorage
- Export puzzles to a JSON file
- Import puzzles from a JSON file

### Emergency Reset

If you need to quickly reset the game:
- Type `resetgame` in the terminal input and press Enter 