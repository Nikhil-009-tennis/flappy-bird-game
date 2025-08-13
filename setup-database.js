// Database Setup Script
// Run this in your browser console after setting up Supabase

class DatabaseSetup {
    constructor() {
        this.supabase = window.supabase;
        this.dbService = new DatabaseService();
    }

    // Test database connection
    async testConnection() {
        console.log('🔍 Testing database connection...');
        
        try {
            const result = await this.dbService.getStoreItems();
            if (result.success) {
                console.log('✅ Database connection successful!');
                console.log('📦 Found', result.items.length, 'store items');
                return true;
            } else {
                console.error('❌ Database connection failed:', result.error);
                return false;
            }
        } catch (error) {
            console.error('❌ Database connection error:', error);
            return false;
        }
    }

    // Initialize sample data
    async initializeSampleData() {
        console.log('🚀 Initializing sample data...');
        
        try {
            // Check if data already exists
            const storeResult = await this.dbService.getStoreItems();
            if (storeResult.success && storeResult.items.length > 0) {
                console.log('ℹ️ Sample data already exists, skipping initialization');
                return;
            }

            console.log('📝 Creating sample store items...');
            
            // Sample store items
            const sampleItems = [
                {
                    name: 'Rainbow Bird',
                    description: 'A colorful rainbow bird skin',
                    item_type: 'skin',
                    price: 25,
                    icon: '🎨',
                    rarity: 'common',
                    effects: { color: 'rainbow', animation: 'rainbow' }
                },
                {
                    name: 'Golden Wings',
                    description: 'Shiny golden wing effects',
                    item_type: 'effect',
                    price: 50,
                    icon: '⭐',
                    rarity: 'rare',
                    effects: { wings: 'golden', sparkle: true }
                },
                {
                    name: 'Diamond Bird',
                    description: 'A sparkling diamond bird',
                    item_type: 'skin',
                    price: 100,
                    icon: '💎',
                    rarity: 'epic',
                    effects: { color: 'diamond', sparkle: true }
                },
                {
                    name: 'Speed Boost',
                    description: 'Temporary speed boost power-up',
                    item_type: 'powerup',
                    price: 35,
                    icon: '🚀',
                    rarity: 'common',
                    effects: { speed_multiplier: 1.5, duration: 10 }
                },
                {
                    name: 'Shield',
                    description: 'Protection from one collision',
                    item_type: 'powerup',
                    price: 75,
                    icon: '🛡️',
                    rarity: 'rare',
                    effects: { protection: 1, duration: 30 }
                },
                {
                    name: 'Coin Magnet',
                    description: 'Attracts coins from a distance',
                    item_type: 'powerup',
                    price: 60,
                    icon: '🎯',
                    rarity: 'rare',
                    effects: { magnet_radius: 100, duration: 15 }
                }
            ];

            // Insert sample items
            for (const item of sampleItems) {
                try {
                    const { data, error } = await this.supabase
                        .from('store_items')
                        .insert(item)
                        .select()
                        .single();
                    
                    if (error) {
                        console.error('❌ Error inserting item:', item.name, error);
                    } else {
                        console.log('✅ Created item:', item.name);
                    }
                } catch (error) {
                    console.error('❌ Error inserting item:', item.name, error);
                }
            }

            console.log('✅ Sample data initialization complete!');
            
        } catch (error) {
            console.error('❌ Error initializing sample data:', error);
        }
    }

    // Create test user
    async createTestUser() {
        console.log('👤 Creating test user...');
        
        try {
            const testUser = {
                username: 'testuser',
                email: 'test@flappybird.local',
                password: 'testpass123'
            };

            const result = await this.dbService.createUser(
                testUser.username,
                testUser.password,
                testUser.email
            );

            if (result.success) {
                console.log('✅ Test user created successfully!');
                console.log('📧 Email:', testUser.email);
                console.log('🔑 Password:', testUser.password);
                return result.user;
            } else {
                console.error('❌ Failed to create test user:', result.error);
                return null;
            }
        } catch (error) {
            console.error('❌ Error creating test user:', error);
            return null;
        }
    }

    // Test authentication
    async testAuthentication() {
        console.log('🔐 Testing authentication...');
        
        try {
            const result = await this.dbService.loginUser('test@flappybird.local', 'testpass123');
            
            if (result.success) {
                console.log('✅ Authentication test successful!');
                console.log('👤 User:', result.user.username);
                console.log('💰 Coins:', result.user.coins);
                return true;
            } else {
                console.error('❌ Authentication test failed:', result.error);
                return false;
            }
        } catch (error) {
            console.error('❌ Authentication test error:', error);
            return false;
        }
    }

    // Test store operations
    async testStoreOperations() {
        console.log('🛒 Testing store operations...');
        
        try {
            // Get store items
            const itemsResult = await this.dbService.getStoreItems();
            if (!itemsResult.success) {
                console.error('❌ Failed to get store items');
                return false;
            }

            console.log('📦 Store items loaded:', itemsResult.items.length);

            // Test purchase (if we have a user)
            const currentUser = await this.dbService.getCurrentUser();
            if (currentUser && itemsResult.items.length > 0) {
                const firstItem = itemsResult.items[0];
                console.log('🛍️ Testing purchase of:', firstItem.name);
                
                const purchaseResult = await this.dbService.purchaseItem(currentUser.id, firstItem.id);
                if (purchaseResult.success) {
                    console.log('✅ Purchase test successful!');
                } else {
                    console.log('ℹ️ Purchase test result:', purchaseResult);
                }
            }

            return true;
        } catch (error) {
            console.error('❌ Store operations test error:', error);
            return false;
        }
    }

    // Run full setup
    async runFullSetup() {
        console.log('🚀 Starting full database setup...');
        console.log('=====================================');
        
        // Test connection
        const connectionOk = await this.testConnection();
        if (!connectionOk) {
            console.error('❌ Setup failed: Database connection failed');
            return false;
        }

        // Initialize sample data
        await this.initializeSampleData();

        // Create test user
        const testUser = await this.createTestUser();

        // Test authentication
        if (testUser) {
            await this.testAuthentication();
        }

        // Test store operations
        await this.testStoreOperations();

        console.log('=====================================');
        console.log('✅ Database setup complete!');
        console.log('🎮 You can now test the game with the database integration');
        
        return true;
    }

    // Show setup status
    async showStatus() {
        console.log('📊 Database Status Report');
        console.log('========================');
        
        try {
            // Check store items
            const storeResult = await this.dbService.getStoreItems();
            console.log('🛒 Store Items:', storeResult.success ? storeResult.items.length : 'Error');

            // Check themes
            const themesResult = await this.dbService.getGameThemes();
            console.log('🎨 Game Themes:', themesResult.success ? themesResult.themes.length : 'Error');

            // Check current user
            const currentUser = await this.dbService.getCurrentUser();
            console.log('👤 Current User:', currentUser ? currentUser.username : 'None');

            if (currentUser) {
                const statsResult = await this.dbService.getUserStats(currentUser.id);
                if (statsResult.success) {
                    console.log('💰 User Coins:', statsResult.stats.coins);
                    console.log('🏆 Best Score:', statsResult.stats.best_score);
                    console.log('🎮 Total Games:', statsResult.stats.total_games);
                }
            }

        } catch (error) {
            console.error('❌ Error getting status:', error);
        }
    }
}

// Create global instance
window.dbSetup = new DatabaseSetup();

// Helper functions
window.testDB = () => dbSetup.testConnection();
window.initSampleData = () => dbSetup.initializeSampleData();
window.createTestUser = () => dbSetup.createTestUser();
window.testAuth = () => dbSetup.testAuthentication();
window.testStore = () => dbSetup.testStoreOperations();
window.runSetup = () => dbSetup.runFullSetup();
window.showStatus = () => dbSetup.showStatus();

console.log('🚀 Database Setup Script Loaded!');
console.log('Available commands:');
console.log('- testDB() - Test database connection');
console.log('- initSampleData() - Initialize sample data');
console.log('- createTestUser() - Create a test user');
console.log('- testAuth() - Test authentication');
console.log('- testStore() - Test store operations');
console.log('- runSetup() - Run full setup');
console.log('- showStatus() - Show current status');
console.log('');
console.log('Run runSetup() to start the full setup process'); 