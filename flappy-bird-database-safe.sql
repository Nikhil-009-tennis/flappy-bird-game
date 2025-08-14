-- Flappy Bird Game Database Schema (Safe Version)
-- Run this in your Supabase SQL Editor to create all tables and data
-- This version handles cases where some objects already exist
--
-- NEW FEATURES ADDED:
-- ✨ Three-Second Countdown System
-- 🎨 Customizable Countdown Styles (Classic, Neon, Quick, Epic, Minimal)
-- 📊 Countdown Usage Tracking and Analytics
-- 🎯 User Countdown Preferences
-- 💰 Countdown Styles Available for Purchase in Store
-- 🔧 Advanced Countdown Configuration (Colors, Animations, Duration)

-- Drop existing objects if they exist (in reverse dependency order)
DROP TABLE IF EXISTS user_challenge_progress CASCADE;
DROP TABLE IF EXISTS daily_challenges CASCADE;
DROP TABLE IF EXISTS power_up_usage CASCADE;
DROP TABLE IF EXISTS user_achievements CASCADE;
DROP TABLE IF EXISTS user_inventory CASCADE;
DROP TABLE IF EXISTS user_purchases CASCADE;
DROP TABLE IF EXISTS game_sessions CASCADE;
DROP TABLE IF EXISTS countdown_settings CASCADE;
DROP TABLE IF EXISTS countdown_usage CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS store_items CASCADE;
DROP TABLE IF EXISTS game_themes CASCADE;

-- Drop functions if they exist
DROP FUNCTION IF EXISTS update_user_stats(UUID, INTEGER, INTEGER);
DROP FUNCTION IF EXISTS purchase_item(UUID, UUID);
DROP FUNCTION IF EXISTS update_updated_at_column();

-- Drop types if they exist
DROP TYPE IF EXISTS user_role CASCADE;
DROP TYPE IF EXISTS item_type CASCADE;
DROP TYPE IF EXISTS purchase_status CASCADE;

-- Create custom data types
CREATE TYPE user_role AS ENUM ('user', 'admin');
CREATE TYPE item_type AS ENUM ('skin', 'powerup', 'theme', 'effect');
CREATE TYPE purchase_status AS ENUM ('active', 'expired', 'used');

-- Users table - stores all user information
CREATE TABLE users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role user_role DEFAULT 'user',
    coins INTEGER DEFAULT 100,
    best_score INTEGER DEFAULT 0,
    total_games INTEGER DEFAULT 0,
    total_coins_earned INTEGER DEFAULT 0,
    current_theme VARCHAR(50) DEFAULT 'classic',
    current_countdown VARCHAR(50) DEFAULT 'classic',
    countdown_enabled BOOLEAN DEFAULT TRUE,
    countdown_duration INTEGER DEFAULT 3,
    is_guest BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_login TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Game sessions table - stores every game played
CREATE TABLE game_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    score INTEGER NOT NULL,
    coins_collected INTEGER DEFAULT 0,
    duration_seconds INTEGER,
    pipes_passed INTEGER DEFAULT 0,
    power_ups_used INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Store items table - all items available for purchase
CREATE TABLE store_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    item_type item_type NOT NULL,
    price INTEGER NOT NULL,
    icon VARCHAR(50),
    is_active BOOLEAN DEFAULT TRUE,
    rarity VARCHAR(20) DEFAULT 'common',
    effects JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User purchases table - tracks what users have bought
CREATE TABLE user_purchases (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    item_id UUID REFERENCES store_items(id) ON DELETE CASCADE,
    purchase_status purchase_status DEFAULT 'active',
    purchased_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE,
    used_at TIMESTAMP WITH TIME ZONE,
    UNIQUE(user_id, item_id)
);

-- User inventory table - active items user owns
CREATE TABLE user_inventory (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    item_id UUID REFERENCES store_items(id) ON DELETE CASCADE,
    is_equipped BOOLEAN DEFAULT FALSE,
    quantity INTEGER DEFAULT 1,
    last_used TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Game themes table - different visual themes
CREATE TABLE game_themes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    display_name VARCHAR(100) NOT NULL,
    description TEXT,
    colors JSONB NOT NULL,
    background_image VARCHAR(255),
    is_default BOOLEAN DEFAULT FALSE,
    is_premium BOOLEAN DEFAULT FALSE,
    price INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Countdown settings table - stores countdown configuration and customization options
CREATE TABLE countdown_settings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    display_name VARCHAR(100) NOT NULL,
    description TEXT,
    countdown_duration INTEGER DEFAULT 3,
    countdown_style VARCHAR(50) DEFAULT 'classic',
    colors JSONB DEFAULT '{"number": "#FFD700", "background": "rgba(0, 0, 0, 0.5)", "text": "#FFFFFF", "go_message": "#00FF00"}',
    animations JSONB DEFAULT '{"scaling": true, "pulsing": true, "shadow": true}',
    is_default BOOLEAN DEFAULT FALSE,
    is_premium BOOLEAN DEFAULT FALSE,
    price INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Countdown usage tracking - tracks when countdowns are used and user preferences
CREATE TABLE countdown_usage (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    countdown_setting_id UUID REFERENCES countdown_settings(id) ON DELETE CASCADE,
    game_session_id UUID REFERENCES game_sessions(id) ON DELETE CASCADE,
    countdown_duration INTEGER NOT NULL,
    countdown_style VARCHAR(50),
    user_skipped BOOLEAN DEFAULT FALSE,
    skip_time_seconds INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User achievements table - tracks user accomplishments
CREATE TABLE user_achievements (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    achievement_name VARCHAR(100) NOT NULL,
    description TEXT,
    earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    progress INTEGER DEFAULT 1,
    max_progress INTEGER DEFAULT 1,
    is_completed BOOLEAN DEFAULT FALSE
);

-- Power-up usage tracking - when power-ups are used
CREATE TABLE power_up_usage (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    item_id UUID REFERENCES store_items(id) ON DELETE CASCADE,
    game_session_id UUID REFERENCES game_sessions(id) ON DELETE CASCADE,
    used_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    effect_duration INTEGER,
    effect_value JSONB
);

-- Daily challenges table - daily goals for users
CREATE TABLE daily_challenges (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    challenge_name VARCHAR(100) NOT NULL,
    description TEXT,
    target_score INTEGER,
    target_coins INTEGER,
    target_games INTEGER,
    reward_coins INTEGER DEFAULT 0,
    reward_item_id UUID REFERENCES store_items(id),
    is_active BOOLEAN DEFAULT TRUE,
    start_date DATE DEFAULT CURRENT_DATE,
    end_date DATE DEFAULT CURRENT_DATE + INTERVAL '1 day'
);

-- User challenge progress - tracks progress on daily challenges
CREATE TABLE user_challenge_progress (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    challenge_id UUID REFERENCES daily_challenges(id) ON DELETE CASCADE,
    progress INTEGER DEFAULT 0,
    is_completed BOOLEAN DEFAULT FALSE,
    completed_at TIMESTAMP WITH TIME ZONE,
    UNIQUE(user_id, challenge_id)
);

-- Insert default themes
INSERT INTO game_themes (name, display_name, description, colors, is_default) VALUES
('classic', 'Classic Theme', 'The original Flappy Bird colors', '{"bird": "#FFD700", "background": "#87CEEB", "pipes": "#228B22", "ground": "#8B4513"}', TRUE),
('sunset', 'Sunset Theme', 'Beautiful sunset colors', '{"bird": "#FF6B35", "background": "#FF8C42", "pipes": "#8B4513", "ground": "#654321"}', FALSE),
('night', 'Night Theme', 'Dark night mode', '{"bird": "#FFD700", "background": "#1a1a2e", "pipes": "#16213e", "ground": "#0f3460"}', FALSE);

-- Insert default store items
INSERT INTO store_items (name, description, item_type, price, icon, rarity, effects) VALUES
('Rainbow Bird', 'A colorful rainbow bird skin', 'skin', 25, '🎨', 'common', '{"color": "rainbow", "animation": "rainbow"}'),
('Golden Wings', 'Shiny golden wing effects', 'effect', 50, '⭐', 'rare', '{"wings": "golden", "sparkle": true}'),
('Diamond Bird', 'A sparkling diamond bird', 'skin', 100, '💎', 'epic', '{"color": "diamond", "sparkle": true}'),
('Speed Boost', 'Temporary speed boost power-up', 'powerup', 35, '🚀', 'common', '{"speed_multiplier": 1.5, "duration": 10}'),
('Shield', 'Protection from one collision', 'powerup', 75, '🛡️', 'rare', '{"protection": 1, "duration": 30}'),
('Coin Magnet', 'Attracts coins from a distance', 'powerup', 60, '🎯', 'rare', '{"magnet_radius": 100, "duration": 15}'),
('Neon Countdown', 'Bright neon-style countdown with glowing effects', 'effect', 40, '✨', 'rare', '{"countdown_style": "neon", "duration": 3}'),
('Quick Countdown', 'Fast 2-second countdown for experienced players', 'effect', 30, '⚡', 'common', '{"countdown_style": "quick", "duration": 2}'),
('Epic Countdown', 'Dramatic countdown with enhanced visual effects', 'effect', 80, '🔥', 'epic', '{"countdown_style": "epic", "duration": 3}'),
('Minimal Countdown', 'Clean, simple countdown without animations', 'effect', 20, '⚪', 'common', '{"countdown_style": "minimal", "duration": 3}');

-- Insert default countdown settings
INSERT INTO countdown_settings (name, display_name, description, countdown_duration, countdown_style, colors, animations, is_default) VALUES
('classic', 'Classic Countdown', 'The standard 3-2-1 countdown with gold numbers and green GO!', 3, 'classic', '{"number": "#FFD700", "background": "rgba(0, 0, 0, 0.5)", "text": "#FFFFFF", "go_message": "#00FF00"}', '{"scaling": true, "pulsing": true, "shadow": true}', TRUE),
('minimal', 'Minimal Countdown', 'Clean, simple countdown without animations', 3, 'minimal', '{"number": "#FFFFFF", "background": "rgba(0, 0, 0, 0.3)", "text": "#FFFFFF", "go_message": "#FFFFFF"}', '{"scaling": false, "pulsing": false, "shadow": false}', FALSE),
('neon', 'Neon Countdown', 'Bright neon-style countdown with glowing effects', 3, 'neon', '{"number": "#00FFFF", "background": "rgba(0, 0, 0, 0.7)", "text": "#FF00FF", "go_message": "#00FF00"}', '{"scaling": true, "pulsing": true, "shadow": true}', FALSE),
('quick', 'Quick Countdown', 'Fast 2-second countdown for experienced players', 2, 'quick', '{"number": "#FF6B35", "background": "rgba(0, 0, 0, 0.4)", "text": "#FFFFFF", "go_message": "#FFD700"}', '{"scaling": true, "pulsing": false, "shadow": true}', FALSE),
('epic', 'Epic Countdown', 'Dramatic countdown with enhanced visual effects', 3, 'epic', '{"number": "#FFD700", "background": "rgba(0, 0, 0, 0.8)", "text": "#FF6B35", "go_message": "#FF00FF"}', '{"scaling": true, "pulsing": true, "shadow": true}', FALSE);

-- Create indexes for better performance
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_countdown ON users(current_countdown);
CREATE INDEX idx_game_sessions_user_id ON game_sessions(user_id);
CREATE INDEX idx_game_sessions_created_at ON game_sessions(created_at);
CREATE INDEX idx_user_purchases_user_id ON user_purchases(user_id);
CREATE INDEX idx_user_purchases_item_id ON user_purchases(item_id);
CREATE INDEX idx_user_inventory_user_id ON user_inventory(user_id);
CREATE INDEX idx_store_items_type ON store_items(item_type);
CREATE INDEX idx_store_items_active ON store_items(is_active);
CREATE INDEX idx_countdown_settings_name ON countdown_settings(name);
CREATE INDEX idx_countdown_usage_user_id ON countdown_usage(user_id);
CREATE INDEX idx_countdown_usage_session_id ON countdown_usage(game_session_id);

-- Create functions for common operations
CREATE OR REPLACE FUNCTION update_user_stats(
    p_user_id UUID,
    p_score INTEGER,
    p_coins INTEGER
)
RETURNS VOID AS $$
BEGIN
    UPDATE users 
    SET 
        best_score = GREATEST(best_score, p_score),
        coins = coins + p_coins,
        total_coins_earned = total_coins_earned + p_coins,
        total_games = total_games + 1,
        updated_at = NOW()
    WHERE id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to purchase item
CREATE OR REPLACE FUNCTION purchase_item(
    p_user_id UUID,
    p_item_id UUID
)
RETURNS BOOLEAN AS $$
DECLARE
    item_price INTEGER;
    user_coins INTEGER;
BEGIN
    -- Get item price
    SELECT price INTO item_price FROM store_items WHERE id = p_item_id AND is_active = true;
    IF NOT FOUND THEN
        RETURN FALSE;
    END IF;
    
    -- Get user coins
    SELECT coins INTO user_coins FROM users WHERE id = p_user_id;
    IF NOT FOUND THEN
        RETURN FALSE;
    END IF;
    
    -- Check if user has enough coins
    IF user_coins < item_price THEN
        RETURN FALSE;
    END IF;
    
    -- Deduct coins and add item
    UPDATE users SET coins = coins - item_price WHERE id = p_user_id;
    INSERT INTO user_purchases (user_id, item_id) VALUES (p_user_id, p_item_id);
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update countdown preferences
CREATE OR REPLACE FUNCTION update_countdown_preferences(
    p_user_id UUID,
    p_countdown_name VARCHAR(50),
    p_countdown_duration INTEGER DEFAULT 3,
    p_countdown_enabled BOOLEAN DEFAULT TRUE
)
RETURNS BOOLEAN AS $$
BEGIN
    -- Check if countdown setting exists
    IF NOT EXISTS (SELECT 1 FROM countdown_settings WHERE name = p_countdown_name) THEN
        RETURN FALSE;
    END IF;
    
    -- Update user countdown preferences
    UPDATE users 
    SET 
        current_countdown = p_countdown_name,
        countdown_duration = p_countdown_duration,
        countdown_enabled = p_countdown_enabled,
        updated_at = NOW()
    WHERE id = p_user_id;
    
    RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to track countdown usage
CREATE OR REPLACE FUNCTION track_countdown_usage(
    p_user_id UUID,
    p_game_session_id UUID,
    p_countdown_duration INTEGER,
    p_countdown_style VARCHAR(50) DEFAULT 'classic',
    p_user_skipped BOOLEAN DEFAULT FALSE,
    p_skip_time_seconds INTEGER DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    countdown_setting_id UUID;
    usage_id UUID;
BEGIN
    -- Get countdown setting ID
    SELECT id INTO countdown_setting_id FROM countdown_settings WHERE name = p_countdown_style;
    
    -- Insert countdown usage record
    INSERT INTO countdown_usage (
        user_id, 
        countdown_setting_id, 
        game_session_id, 
        countdown_duration, 
        countdown_style, 
        user_skipped, 
        skip_time_seconds
    ) VALUES (
        p_user_id, 
        countdown_setting_id, 
        p_game_session_id, 
        p_countdown_duration, 
        p_countdown_style, 
        p_user_skipped, 
        p_skip_time_seconds
    ) RETURNING id INTO usage_id;
    
    RETURN usage_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create view for countdown statistics
CREATE OR REPLACE VIEW countdown_statistics AS
SELECT 
    cs.name as countdown_style,
    cs.display_name,
    COUNT(cu.id) as total_uses,
    AVG(cu.countdown_duration) as avg_duration,
    COUNT(CASE WHEN cu.user_skipped THEN 1 END) as skipped_count,
    AVG(CASE WHEN cu.user_skipped THEN cu.skip_time_seconds END) as avg_skip_time
FROM countdown_settings cs
LEFT JOIN countdown_usage cu ON cs.id = cu.countdown_setting_id
GROUP BY cs.id, cs.name, cs.display_name
ORDER BY total_uses DESC;

-- Create view for user countdown preferences
CREATE OR REPLACE VIEW user_countdown_preferences AS
SELECT 
    u.username,
    u.current_countdown,
    u.countdown_enabled,
    u.countdown_duration,
    cs.display_name as countdown_display_name,
    cs.colors,
    cs.animations
FROM users u
JOIN countdown_settings cs ON u.current_countdown = cs.name
WHERE u.is_guest = FALSE
ORDER BY u.username;

-- Insert sample countdown usage data for demonstration
INSERT INTO countdown_usage (user_id, countdown_setting_id, game_session_id, countdown_duration, countdown_style, user_skipped, skip_time_seconds) 
SELECT 
    u.id,
    cs.id,
    gs.id,
    3,
    'classic',
    FALSE,
    NULL
FROM users u
CROSS JOIN countdown_settings cs
CROSS JOIN game_sessions gs
WHERE cs.name = 'classic' 
LIMIT 5; 