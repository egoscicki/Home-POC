# NPC Grid Game

A top-down grid-based game where you can interact with AI-powered NPCs using natural language conversations.

## Features

- **Grid-based movement**: Navigate using WASD keys or click/touch to move
- **AI-powered NPCs**: 8 unique NPCs with different personalities and colors
- **Natural language interaction**: Chat with NPCs using OpenAI's GPT API
- **Responsive design**: Works on both desktop and mobile devices
- **Touch/click support**: Full mobile compatibility

## Setup

1. **Get an OpenAI API Key**:
   - Visit [OpenAI's website](https://platform.openai.com/api-keys)
   - Create an account and generate an API key
   - The API key is required for NPC conversations

2. **Run the Game**:
   - Open `index.html` in a modern web browser
   - Enter your OpenAI API key in the bottom section
   - Click "Save" to store your API key

## How to Play

### Movement
- **WASD keys**: Traditional movement controls
- **Arrow keys**: Alternative movement option
- **Click/Touch**: Click anywhere on the grid to move there

### Interaction
- **Spacebar**: When near an NPC (within 1 grid space), press spacebar to start a conversation
- **Chat**: Type messages and press Enter or click Send to chat with NPCs
- **Close chat**: Click the × button to close the conversation

### NPCs
- Each NPC has a unique color, name, and personality
- NPCs are randomly placed on the grid
- They respond naturally to your messages using AI

## Technical Details

- **Grid size**: 20x15 grid (800x600 pixels)
- **Player**: Green circle representing you
- **NPCs**: Colored squares with names and personalities
- **API**: Uses OpenAI's GPT-3.5-turbo model for natural responses
- **Storage**: API key is saved locally in your browser

## File Structure

- `index.html` - Main game page
- `style.css` - Game styling and responsive design
- `game.js` - Game logic and AI integration
- `README.md` - This file

## Browser Compatibility

- Chrome (recommended)
- Firefox
- Safari
- Edge
- Mobile browsers (iOS Safari, Chrome Mobile)

## Troubleshooting

- **NPCs not responding**: Check that your API key is correct and saved
- **Movement issues**: Ensure the game canvas is focused
- **Chat not opening**: Make sure you're within 1 grid space of an NPC
- **API errors**: Verify your OpenAI account has available credits

## Cost Note

This game uses OpenAI's API which incurs costs based on usage. Each conversation with an NPC will use a small amount of tokens. Monitor your usage on the OpenAI platform.

## Customization

You can modify the game by editing `game.js`:
- Change grid size in the constructor
- Modify NPC colors and names
- Adjust personality traits
- Change the OpenAI model used

Enjoy exploring and chatting with your AI NPCs!
