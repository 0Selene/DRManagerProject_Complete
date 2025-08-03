import sequelize from '../config/database.js';
import Upload from '../models/Upload.js';
import Content from '../models/Content.js';
import Transaction from '../models/Transaction.js';

async function seed() {
  try {
    console.log('🌱 Starting to insert seed data...');
    
    // Test data
    const testUploads = [
      {
        id: 'test_upload_1',
        fileName: 'test_document.pdf',
        fileSize: 1024000,
        mimeType: 'application/pdf',
        ipfsHash: 'QmTestHash1',
        status: 'completed'
      },
      {
        id: 'test_upload_2',
        fileName: 'sample_image.jpg',
        fileSize: 2048000,
        mimeType: 'image/jpeg',
        ipfsHash: 'QmTestHash2',
        status: 'completed'
      }
    ];

    const testContents = [
      {
        id: 'test_content_1',
        userAddress: '0x1234567890123456789012345678901234567890',
        title: 'Test Document',
        description: 'This is a test document',
        category: 'document',
        price: '0.1',
        ipfsHash: 'QmTestHash1',
        txHash: '0xTestTxHash1',
        status: 'registered'
      }
    ];

    const testTransactions = [
      {
        id: 'test_tx_1',
        type: 'register',
        userAddress: '0x1234567890123456789012345678901234567890',
        contentId: 'test_content_1',
        txHash: '0xTestTxHash1',
        amount: '0.1',
        blockNumber: 12345
      }
    ];

    // Insert data
    await Upload.bulkCreate(testUploads, { ignoreDuplicates: true });
    await Content.bulkCreate(testContents, { ignoreDuplicates: true });
    await Transaction.bulkCreate(testTransactions, { ignoreDuplicates: true });

    console.log('✅ Seed data insertion completed');
    console.log(`📊 Inserted ${testUploads.length} upload records`);
    console.log(`📝 Inserted ${testContents.length} content records`);
    console.log(`💰 Inserted ${testTransactions.length} transaction records`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed data insertion failed:', error);
    process.exit(1);
  }
}

seed(); 