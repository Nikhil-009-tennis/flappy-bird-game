# Flappy Bird Game - Supabase Database Integration

This project integrates a Flappy Bird game with Supabase for persistent data storage, user authentication, and online features.

## 🚀 Features

- **User Authentication**: Secure login/registration system
- **Persistent Game Data**: Scores, coins, and progress saved to database
- **Store System**: Purchase items using in-game coins
- **Theme System**: Customizable game themes
- **Achievement System**: Track player accomplishments
- **Leaderboards**: Compare scores with other players
- **Guest Mode**: Play without creating an account
- **Real-time Updates**: Live data synchronization

## 🗄️ Database Schema

### Core Tables

1. **users** - User profiles and statistics
2. **game_sessions** - Individual game play records
3. **store_items** - Available items in the store
4. **user_purchases** - User's purchased items
5. **user_inventory** - Active items and equipment
6. **game_themes** - Available game themes
7. **user_achievements** - Player achievements
8. **power_up_usage** - Power-up usage tracking
9. **daily_challenges** - Daily challenge system
10. **user_challenge_progress** - Challenge completion tracking

## 🛠️ Setup Instructions

### 1. Supabase Project Setup

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Note your project URL and anon key
3. Go to SQL Editor in your Supabase dashboard

### 2. Database Setup

1. Copy the contents of `database-schema.sql`
2. Paste it into the SQL Editor in Supabase
3. Click "Run" to execute the schema

### 3. Configuration

1. Update `supabase-config.js` with your project credentials:
   ```javascript
   const SUPABASE_URL = 'your-project-url';
   const SUPABASE_ANON_KEY = 'your-anon-key';
   ```

2. Update the JWT secret in the database schema:
   ```sql
   ALTER DATABASE postgres SET "app.jwt_secret" TO 'your-secret-key';
   ```

### 4. File Updates

1. Replace `login.html` with `login-supabase.html`
2. Replace `store.html` with `store-supabase.html`
3. Update `index.html` to include Supabase scripts:
   ```html
   <script src="https://unpkg.com/@supabase/supabase-js@2"></script>
   <script src="supabase-config.js"></script>
   ```

## 🔐 Authentication Flow

### User Registration
1. User enters username, email, and password
2. Supabase creates auth user and profile
3. User receives 100 starting coins
4. Redirected to game

### User Login
1. User enters email and password
2. Supabase authenticates credentials
3. User profile loaded from database
4. Redirected to game

### Guest Mode
1. User clicks "Play as Guest"
2. Temporary guest account created
3. Limited features available
4. Data stored locally

## 🎮 Game Integration

### Saving Game Data
```javascript
// Save game session
await dbService.saveGameSession(
    userId, 
    score, 
    coinsCollected, 
    duration, 
    pipesPassed, 
    powerUpsUsed
);

// Update user stats
await dbService.updateUserStats(userId, score, coinsCollected);
```

### Loading User Data
```javascript
// Get user statistics
const stats = await dbService.getUserStats(userId);
bestScore = stats.best_score;
coins = stats.coins;
currentTheme = stats.current_theme;
```

## 🛍️ Store System

### Store Items
- **Skins**: Bird appearance changes
- **Power-ups**: Temporary game effects
- **Effects**: Visual enhancements
- **Themes**: Game color schemes

### Purchase Flow
1. User selects item
2. System checks coin balance
3. Coins deducted from account
4. Item added to inventory
5. Purchase recorded in database

### Item Rarities
- **Common**: Basic items (25-35 coins)
- **Rare**: Enhanced items (50-75 coins)
- **Epic**: Premium items (100+ coins)
- **Legendary**: Special items (150+ coins)

## 🎨 Theme System

### Default Themes
- **Classic**: Original Flappy Bird colors
- **Sunset**: Warm orange/red palette
- **Night**: Dark mode theme

### Custom Themes
- Users can purchase additional themes
- Themes affect bird, background, pipes, and ground colors
- Themes are stored as JSON color objects

## 🏆 Achievement System

### Achievement Types
- **Score-based**: Reach specific score milestones
- **Coin-based**: Collect certain amounts of coins
- **Game-based**: Play specific number of games
- **Special**: Unique accomplishments

### Achievement Tracking
```javascript
await dbService.unlockAchievement(
    userId,
    'First Win',
    'Complete your first game',
    1,
    1
);
```

## 📊 Leaderboards

### Global Rankings
- Top scores across all players
- Total coins earned
- Games played statistics

### Personal Statistics
- Best personal score
- Total games played
- Coins earned lifetime
- Achievement progress

## 🔧 Database Functions

### Built-in Functions
- `update_user_stats()` - Update user statistics after game
- `purchase_item()` - Handle item purchases
- `update_updated_at_column()` - Automatic timestamp updates

### Row Level Security
- Users can only access their own data
- Store items are publicly viewable
- Guest users have limited access

## 🚨 Error Handling

### Common Issues
1. **Authentication Errors**: Check Supabase credentials
2. **Database Connection**: Verify project URL and key
3. **RLS Policies**: Ensure policies are properly configured
4. **CORS Issues**: Check Supabase project settings

### Debug Mode
Enable console logging for troubleshooting:
```javascript
// In supabase-config.js
console.log('Database operation result:', result);
```

## 📱 Mobile Compatibility

- Responsive design for all screen sizes
- Touch-friendly controls
- Optimized for mobile browsers
- Progressive Web App features

## 🔒 Security Features

- Row Level Security (RLS) enabled
- JWT-based authentication
- Password hashing (implement in production)
- Input validation and sanitization
- CORS protection

## 🚀 Performance Optimization

- Database indexes on frequently queried columns
- Efficient queries with proper joins
- Client-side caching for frequently accessed data
- Lazy loading of non-critical data

## 📈 Future Enhancements

- **Multiplayer Mode**: Real-time competitive play
- **Social Features**: Friend lists and challenges
- **Seasonal Events**: Limited-time content
- **Advanced Analytics**: Detailed player insights
- **API Integration**: Third-party game services

## 🐛 Troubleshooting

### Database Connection Issues
1. Check Supabase project status
2. Verify API keys and URLs
3. Check browser console for errors
4. Ensure CORS is properly configured

### Authentication Problems
1. Clear browser localStorage
2. Check Supabase auth settings
3. Verify email confirmation (if enabled)
4. Check user permissions

### Performance Issues
1. Review database query performance
2. Check for unnecessary API calls
3. Implement client-side caching
4. Optimize database indexes

## 📞 Support

For issues or questions:
1. Check Supabase documentation
2. Review browser console errors
3. Verify database schema setup
4. Test with minimal configuration

## 📄 License

This project is open source and available under the MIT License.

---

**Happy Gaming! 🎮** 