# Flappy Bird Game

A fun and interactive Flappy Bird game with user authentication, multiple themes, and a store system.

## Features

### 🎮 Game Features
- Classic Flappy Bird gameplay
- Multiple themes (Classic, Sunset, Night, Forest, Ocean)
- Coin collection system
- Score tracking with best score persistence
- Responsive design

### 👤 User Authentication
- **User Registration**: Create new accounts with username and password
- **User Login**: Secure login system for returning users
- **Guest Mode**: Play without creating an account (limited features)
- **User Data Persistence**: Each user's progress, coins, and preferences are saved separately
- **Logout Functionality**: Secure logout with session management

### 🛒 Store System
- Purchase items with collected coins
- Various upgrades and skins available
- User-specific purchases and coin tracking

## How to Use

### Starting the Game
1. Open `main.html` in your web browser
2. You'll be redirected to the login page if not authenticated
3. Choose to:
   - **Register**: Create a new account
   - **Login**: Use existing credentials
   - **Play as Guest**: Start playing immediately (limited features)

### User Accounts
- **Registered Users**: Full access to all features, persistent data across sessions
- **Guest Users**: Can play the game but data is not permanently saved

### Game Controls
- **Space Bar** or **Mouse Click**: Make the bird flap
- **Start Game**: Begin a new game session
- **Restart**: Start over after game over
- **Store**: Access the in-game store to purchase items

## File Structure

```
flappy bird game/
├── main.html          # Entry point with authentication redirect
├── login.html         # User authentication page
├── index.html         # Main game page (requires authentication)
├── store.html         # In-game store (requires authentication)
├── game.js           # Game logic and authentication integration
├── style.css         # Styling for all pages
├── games.json        # Game data (if any)
└── README.md         # This file
```

## Technical Details

### Authentication System
- Uses localStorage for user data persistence
- Secure password validation
- Session management with automatic redirects
- User-specific data isolation

### Data Storage
- **User Data**: Stored in localStorage as `flappyBirdUsers`
- **Current Session**: Stored as `flappyBirdCurrentUser`
- **Guest Data**: Uses legacy localStorage keys for backward compatibility

### Security Features
- Password validation (minimum 4 characters)
- Username uniqueness checking
- Session validation on page load
- Automatic logout for invalid sessions

## Browser Compatibility
- Modern browsers with localStorage support
- Responsive design for mobile and desktop
- No external dependencies required

## Hosting
The game is designed to work with any static web hosting service. Simply upload all files to your web server and access `main.html` to start the game.

## Development
To modify the game:
1. Edit `game.js` for game logic changes
2. Modify `style.css` for styling updates
3. Update `login.html` for authentication changes
4. Test thoroughly before deploying

The authentication system is designed to be non-intrusive and maintains backward compatibility with existing game functionality.
