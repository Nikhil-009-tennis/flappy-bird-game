// Supabase Configuration
// Replace these values with your actual Supabase project credentials

const SUPABASE_URL = 'https://insovfcglenqpfmzxmdv.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imluc292ZmNnbGVucXBmbXp4bWR2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ5NTk0OTEsImV4cCI6MjA3MDUzNTQ5MX0.apF1A78fSYYuq6sHU9AQs_gRJFMMWGGENfOlbGy2E8I';

// Initialize Supabase client
const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Database service class
class DatabaseService {
    constructor() {
        this.supabase = supabaseClient;
    }

    // User Management
    async createUser(username, password, email = null) {
        try {
            // Create user profile directly (simpler approach)
            const { data: profileData, error: profileError } = await this.supabase
                .from('users')
                .insert({
                    username: username,
                    email: email || `${username}@flappybird.local`, 
                })
                .select()
                .single();

            if (profileError) throw profileError;

            return { success: true, user: profileData };
        } catch (error) {
            console.error('Error creating user:', error);   
        }
    }

    async loginUser(email, password) {
        try {
            // Get user profile directly
            const { data: profile, error: profileError } = await this.supabase
                .from('users')
                .select('*')
                .eq('email', email)
                .eq('password_hash', password)
                .single();

            if (profileError) throw profileError;

            return { success: true, user: profile };
        } catch (error) {
            console.error('Error logging in:', error);
            return { success: false, error: error.message };
        }
    }

    async getCurrentUser() {
        try {
            // For now, return null since we're not using auth
            // This can be enhanced later with session management
            return null;
        } catch (error) {
            console.error('Error getting current user:', error);
            return null;
        }
    }

    async logoutUser() {
        try {
            // For now, just return success since we're not using auth
            return { success: true };
        } catch (error) {
            console.error('Error logging out:', error);
            return { success: false, error: error.message };
        }
    }

    // Game Data
    async saveGameSession(userId, score, coinsCollected, duration, pipesPassed, powerUpsUsed) {
        try {
            const { data, error } = await this.supabase
                .from('game_sessions')
                .insert({
                    user_id: userId,
                    score: score,
                    coins_collected: coinsCollected,
                    duration_seconds: duration,
                    pipes_passed: pipesPassed,
                    power_ups_used: powerUpsUsed
                })
                .select()
                .single();

            if (error) throw error;

            // Update user stats
            await this.updateUserStats(userId, score, coinsCollected);

            return { success: true, session: data };
        } catch (error) {
            console.error('Error saving game session:', error);
            return { success: false, error: error.message };
        }
    }

    async updateUserStats(userId, score, coins) {
        try {
            const { error } = await this.supabase.rpc('update_user_stats', {
                p_user_id: userId,
                p_score: score,
                p_coins: coins
            });

            if (error) throw error;
            return { success: true };
        } catch (error) {
            console.error('Error updating user stats:', error);
            return { success: false, error: error.message };
        }
    }

    async getUserStats(userId) {
        try {
            const { data, error } = await this.supabase
                .from('users')
                .select('coins, best_score, total_games, total_coins_earned, current_theme')
                .eq('id', userId)
                .single();

            if (error) throw error;
            return { success: true, stats: data };
        } catch (error) {
            console.error('Error getting user stats:', error);
            return { success: false, error: error.message };
        }
    }

    // Store and Purchases
    async getStoreItems() {
        try {
            const { data, error } = await this.supabase
                .from('store_items')
                .select('*')
                .eq('is_active', true)
                .order('price', { ascending: true });

            if (error) throw error;
            return { success: true, items: data };
        } catch (error) {
            console.error('Error getting store items:', error);
            return { success: false, error: error.message };
        }
    }

    async purchaseItem(userId, itemId) {
        try {
            const { data, error } = await this.supabase.rpc('purchase_item', {
                p_user_id: userId,
                p_item_id: itemId
            });

            if (error) throw error;
            return { success: data };
        } catch (error) {
            console.error('Error purchasing item:', error);
            return { success: false, error: error.message };
        }
    }

    async getUserPurchases(userId) {
        try {
            const { data, error } = await this.supabase
                .from('user_purchases')
                .select(`
                    *,
                    store_items (*)
                `)
                .eq('user_id', userId)
                .eq('purchase_status', 'active');

            if (error) throw error;
            return { success: true, purchases: data };
        } catch (error) {
            console.error('Error getting user purchases:', error);
            return { success: false, error: error.message };
        }
    }

    async getUserInventory(userId) {
        try {
            const { data, error } = await this.supabase
                .from('user_inventory')
                .select(`
                    *,
                    store_items (*)
                `)
                .eq('user_id', userId);

            if (error) throw error;
            return { success: true, inventory: data };
        } catch (error) {
            console.error('Error getting user inventory:', error);
            return { success: false, error: error.message };
        }
    }

    // Themes
    async getGameThemes() {
        try {
            const { data, error } = await this.supabase
                .from('game_themes')
                .select('*')
                .order('is_default', { ascending: false });

            if (error) throw error;
            return { success: true, themes: data };
        } catch (error) {
            console.error('Error getting game themes:', error);
            return { success: false, error: error.message };
        }
    }

    async updateUserTheme(userId, themeName) {
        try {
            const { error } = await this.supabase
                .from('users')
                .update({ current_theme: themeName })
                .eq('id', userId);

            if (error) throw error;
            return { success: true };
        } catch (error) {
            console.error('Error updating user theme:', error);
            return { success: false, error: error.message };
        }
    }

    // Achievements
    async getUserAchievements(userId) {
        try {
            const { data, error } = await this.supabase
                .from('user_achievements')
                .select('*')
                .eq('user_id', userId)
                .order('earned_at', { ascending: false });

            if (error) throw error;
            return { success: true, achievements: data };
        } catch (error) {
            console.error('Error getting user achievements:', error);
            return { success: false, error: error.message };
        }
    }

    async unlockAchievement(userId, achievementName, description, progress = 1, maxProgress = 1) {
        try {
            const { data, error } = await this.supabase
                .from('user_achievements')
                .upsert({
                    user_id: userId,
                    achievement_name: achievementName,
                    description: description,
                    progress: progress,
                    max_progress: maxProgress,
                    is_completed: progress >= maxProgress
                }, {
                    onConflict: 'user_id,achievement_name'
                })
                .select()
                .single();

            if (error) throw error;
            return { success: true, achievement: data };
        } catch (error) {
            console.error('Error unlocking achievement:', error);
            return { success: false, error: error.message };
        }
    }

    // Daily Challenges
    async getDailyChallenges() {
        try {
            const { data, error } = await this.supabase
                .from('daily_challenges')
                .select('*')
                .eq('is_active', true)
                .gte('end_date', new Date().toISOString().split('T')[0]);

            if (error) throw error;
            return { success: true, challenges: data };
        } catch (error) {
            console.error('Error getting daily challenges:', error);
            return { success: false, error: error.message };
        }
    }

    async getUserChallengeProgress(userId) {
        try {
            const { data, error } = await this.supabase
                .from('user_challenge_progress')
                .select(`
                    *,
                    daily_challenges (*)
                `)
                .eq('user_id', userId);

            if (error) throw error;
            return { success: true, progress: data };
        } catch (error) {
            console.error('Error getting challenge progress:', error);
            return { success: false, error: error.message };
        }
    }

    // Power-up Usage
    async trackPowerUpUsage(userId, itemId, gameSessionId, duration, effects) {
        try {
            const { data, error } = await this.supabase
                .from('power_up_usage')
                .insert({
                    user_id: userId,
                    item_id: itemId,
                    game_session_id: gameSessionId,
                    effect_duration: duration,
                    effect_value: effects
                })
                .select()
                .single();

            if (error) throw error;
            return { success: true, usage: data };
        } catch (error) {
            console.error('Error tracking power-up usage:', error);
            return { success: false, error: error.message };
        }
    }

    // Leaderboard
    async getLeaderboard(limit = 10) {
        try {
            const { data, error } = await this.supabase
                .from('users')
                .select('username, best_score, total_coins_earned')
                .order('best_score', { ascending: false })
                .limit(limit);

            if (error) throw error;
            return { success: true, leaderboard: data };
        } catch (error) {
            console.error('Error getting leaderboard:', error);
            return { success: false, error: error.message };
        }
    }

    // Guest User Management
    async createGuestUser() {
        try {
            const { data, error } = await this.supabase
                .from('users')
                .insert({
                    username: `Guest_${Date.now()}`,
                    password_hash: 'guest',
                    is_guest: true,
                    coins: 50,
                    best_score: 0,
                    current_theme: 'classic'
                })
                .select()
                .single();

            if (error) throw error;
            return { success: true, user: data };
        } catch (error) {
            console.error('Error creating guest user:', error);
            return { success: false, error: error.message };
        }
    }
}

// Export the service
window.DatabaseService = DatabaseService; 