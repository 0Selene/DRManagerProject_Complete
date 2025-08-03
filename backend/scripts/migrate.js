import sequelize from '../config/database.js';
import Upload from '../models/Upload.js';
import Content from '../models/Content.js';
import Transaction from '../models/Transaction.js';

async function migrate() {
  try {
    console.log('🔄 Starting database migration...');
    
    // Test database connection
    await sequelize.authenticate();
    console.log('✅ Database connection successful');
    
    // Sync all models (create tables)
    await sequelize.sync({ force: false });
    console.log('✅ Database tables created successfully');
    
    console.log('📋 Created tables:');
    console.log('  - uploads (upload records)');
    console.log('  - contents (content records)');
    console.log('  - transactions (transaction records)');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Database migration failed:', error);
    process.exit(1);
  }
}

migrate(); 