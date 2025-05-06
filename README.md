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

## How to Run Locally

1. Clone the repository:
```
git clone https://github.com/yourusername/nrrc-escape-room.git
cd nrrc-escape-room
```

2. Open the project in your favorite code editor.

3. If you have Node.js installed, you can use a simple server like `http-server`:
```
npm install -g http-server
http-server
```

4. Open a browser and navigate to the provided URL (usually http://localhost:8080).

## How to Deploy

The application can be easily deployed on Vercel, Netlify, or GitHub Pages.

### Deploying to Vercel

1. Install the Vercel CLI:
```
npm install -g vercel
```

2. Deploy:
```
vercel
```

### Deploying to GitHub Pages

1. Push your code to a GitHub repository.
2. Go to the repository settings.
3. In the "GitHub Pages" section, select the branch you want to deploy from.
4. Click "Save" and your site will be available at the URL provided.

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