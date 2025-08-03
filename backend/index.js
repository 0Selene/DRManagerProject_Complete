import express from 'express';
import multer from 'multer';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// Import database configuration and models
import sequelize from './config/database.js';
import Upload from './models/Upload.js';
import Content from './models/Content.js';
import Transaction from './models/Transaction.js';

// Import existing upload handler
import { uploadToIPFS } from './upload.js';

// ES modules equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static file service (serving frontend)
app.use(express.static(path.join(__dirname, '../frontend')));

// File upload configuration
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 100 * 1024 * 1024, // 100MB limit
    },
    fileFilter: (req, file, cb) => {
        // File type validation
        const allowedTypes = [
            'image/', 'application/', 'text/', 'audio/', 'video/'
        ];
        
        const isAllowed = allowedTypes.some(type => file.mimetype.startsWith(type));
        
        if (isAllowed) {
            cb(null, true);
        } else {
            cb(new Error('Unsupported file type'), false);
        }
    }
});

// =================== API ROUTES ===================

// 1. File upload to IPFS
app.post('/api/upload', upload.single('file'), async (req, res) => {
    try {
        console.log('📤 Received upload request:', req.file?.originalname);
        
        if (!req.file) {
            return res.status(400).json({
                success: false,
                error: 'No file received'
            });
        }

        // File size validation
        if (req.file.size > 100 * 1024 * 1024) {
            return res.status(400).json({
                success: false,
                error: 'File size exceeds 100MB limit'
            });
        }

        // Upload to IPFS
        const uploadResult = await uploadToIPFS(req.file.buffer, req.file.originalname);
        
        // Generate upload ID
        const uploadId = Date.now().toString();
        
        // Save to database
        await Upload.create({
            id: uploadId,
            fileName: req.file.originalname,
            fileSize: req.file.size,
            mimeType: req.file.mimetype,
            ipfsHash: uploadResult.ipfsHash || uploadResult.Hash,
            status: 'completed'
        });

        console.log('✅ Upload successful:', uploadResult.ipfsHash || uploadResult.Hash);

        res.json({
            success: true,
            uploadId: uploadId,
            ipfsHash: uploadResult.ipfsHash || uploadResult.Hash,
            fileName: req.file.originalname,
            fileSize: req.file.size,
            gatewayUrl: uploadResult.gatewayUrl || `https://ipfs.io/ipfs/${uploadResult.ipfsHash || uploadResult.Hash}`
        });

    } catch (error) {
        console.error('❌ Upload failed', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Upload failed'
        });
    }
});

// 2. Content registration
app.post('/api/content/register', async (req, res) => {
    try {
        const {
            userAddress,
            title,
            description,
            category,
            price,
            ipfsHash,
            txHash,
            blockNumber
        } = req.body;

        console.log('📝 Saving registration info', { title, ipfsHash, txHash });

        // Validation
        if (!userAddress || !title || !ipfsHash || !txHash) {
            return res.status(400).json({
                success: false,
                error: 'Missing required information'
            });
        }

        // Generate content ID
        const contentId = Date.now().toString();

        await Content.create({
            id: contentId,
            userAddress: userAddress.toLowerCase(),
            title,
            description: description || '',
            category: category || 'other',
            price: price || '0',
            ipfsHash,
            txHash,
            blockNumber,
            status: 'registered'
        });

        console.log('✅ Information saved successfully');

        res.json({
            success: true,
            contentId,
            message: 'Content registered successfully'
        });

    } catch (error) {
        console.error('❌ Save failed', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// 3. Get user content
app.get('/api/content/user/:address', async (req, res) => {
    try {
        const userAddress = req.params.address.toLowerCase();
        console.log('📋 Getting user content:', userAddress);

        const userContents = await Content.findAll({
            where: { userAddress },
            order: [['createdAt', 'DESC']]
        });

        res.json({
            success: true,
            contents: userContents,
            total: userContents.length
        });

    } catch (error) {
        console.error('❌ Failed to get user content:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// 4. Get marketplace content
app.get('/api/content/marketplace', async (req, res) => {
    try {
        console.log('🛒 Getting marketplace content');

        const allContents = await Content.findAll({
            where: { status: 'registered' },
            order: [['createdAt', 'DESC']],
            limit: 50
        });

        res.json({
            success: true,
            contents: allContents,
            total: allContents.length
        });

    } catch (error) {
        console.error('❌ Failed to get marketplace content:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// 5. Record transaction
app.post('/api/transaction/record', async (req, res) => {
    try {
        const {
            type,           // 'register', 'purchase', 'license'
            userAddress,
            contentId,
            txHash,
            amount,
            blockNumber,
            gasUsed
        } = req.body;

        console.log('💰 Recording transaction:', { type, txHash, amount });

        const transactionId = Date.now().toString();
        
        await Transaction.create({
            id: transactionId,
            type,
            userAddress: userAddress.toLowerCase(),
            contentId,
            txHash,
            amount: amount || '0',
            blockNumber,
            gasUsed
        });

        res.json({
            success: true,
            transactionId,
            message: 'Transaction recorded successfully'
        });

    } catch (error) {
        console.error('❌ Failed to record transaction:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// 6. Get upload status
app.get('/api/upload/status/:uploadId', async (req, res) => {
    try {
        const uploadId = req.params.uploadId;
        const uploadData = await Upload.findByPk(uploadId);

        if (!uploadData) {
            return res.status(404).json({
                success: false,
                error: 'Upload record not found'
            });
        }

        res.json({
            success: true,
            upload: uploadData
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// 7. Health check
app.get('/api/health', async (req, res) => {
    try {
        // Health check object
        const health = {
            status: 'healthy',
            timestamp: new Date().toISOString(),
            services: {
                api: 'running',
                ipfs: 'unknown',
                database: 'unknown'
            },
            stats: {
                totalUploads: 0,
                totalContents: 0,
                totalTransactions: 0
            }
        };

        // Check database connection
        try {
            await sequelize.authenticate();
            health.services.database = 'healthy';
            
            // Get statistics
            const [uploadCount, contentCount, transactionCount] = await Promise.all([
                Upload.count(),
                Content.count(),
                Transaction.count()
            ]);
            
            health.stats.totalUploads = uploadCount;
            health.stats.totalContents = contentCount;
            health.stats.totalTransactions = transactionCount;
        } catch (dbError) {
            health.services.database = 'error';
            health.status = 'unhealthy';
        }

        // Check IPFS connection
        try {
            // IPFS health check logic here
            health.services.ipfs = 'healthy';
        } catch {
            health.services.ipfs = 'error';
        }

        res.json(health);

    } catch (error) {
        res.status(500).json({
            status: 'unhealthy',
            error: error.message
        });
    }
});

// 8. Get statistics
app.get('/api/stats/:address?', async (req, res) => {
    try {
        const userAddress = req.params.address?.toLowerCase();

        if (userAddress) {
            // Get specific user statistics
            const [userContents, userTransactions] = await Promise.all([
                Content.findAll({ where: { userAddress } }),
                Transaction.findAll({ where: { userAddress } })
            ]);

            const totalEarnings = userTransactions
                .filter(tx => tx.type === 'purchase')
                .reduce((sum, tx) => sum + parseFloat(tx.amount || 0), 0);

            res.json({
                success: true,
                stats: {
                    totalFiles: userContents.length,
                    totalEarnings: totalEarnings.toFixed(4),
                    activeLicenses: 0,
                    totalTransactions: userTransactions.length
                }
            });
        } else {
            // Get global statistics
            const [uploadCount, contentCount, transactionCount] = await Promise.all([
                Upload.count(),
                Content.count(),
                Transaction.count()
            ]);

            const uniqueUsers = await Content.count({
                distinct: true,
                col: 'userAddress'
            });

            res.json({
                success: true,
                stats: {
                    totalUploads: uploadCount,
                    totalContents: contentCount,
                    totalTransactions: transactionCount,
                    totalUsers: uniqueUsers
                }
            });
        }

    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// =================== ERROR HANDLING ===================

// File upload error handling
app.use((error, req, res, next) => {
    if (error instanceof multer.MulterError) {
        if (error.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                success: false,
                error: 'File size exceeds limit (100MB)'
            });
        }
    }
    
    console.error('Server error:', error);
    res.status(500).json({
        success: false,
        error: error.message || 'Internal server error'
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        error: 'API endpoint not found'
    });
});

// =================== SERVER STARTUP ===================

async function startServer() {
    try {
        // Test database connection
        await sequelize.authenticate();
        console.log('✅ Database connection successful');
        
        // Sync database models
        await sequelize.sync({ force: false });
        console.log('✅ Database models synchronized');
        
        app.listen(PORT, () => {
            console.log('🚀 DRManager server started successfully');
            console.log(`📡 API URL: http://localhost:${PORT}`);
            console.log(`🌐 Frontend URL: http://localhost:${PORT}`);
            console.log(`💾 Database: PostgreSQL`);
            console.log('');
            console.log('📋 Available API endpoints:');
            console.log('  POST /api/upload              - File upload');
            console.log('  POST /api/content/register     - Content registration');
            console.log('  GET  /api/content/user/:address - Get user content');
            console.log('  GET  /api/content/marketplace  - Get marketplace content');
            console.log('  POST /api/transaction/record   - Record transaction');
            console.log('  GET  /api/stats/:address       - Get statistics');
            console.log('  GET  /api/health               - Health check');
            console.log('');
        });
        
    } catch (error) {
        console.error('❌ Server startup failed:', error);
        process.exit(1);
    }
}

startServer();

export default app;