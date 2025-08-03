import { create } from '@web3-storage/w3up-client';
import dotenv from 'dotenv';
import { File } from 'fetch-blob/file.js'; // Node.js version File
import crypto from 'crypto';

dotenv.config();

// Create a File object from the memory buffer
async function getFileFromBuffer(buffer, fileName) {
  return new File([buffer], fileName);
}

// upload to IPFS with error handling
export async function uploadToIPFS(buffer, fileName) {
  try {
    console.log('开始上传到 IPFS...');
    const client = await create();
    
    console.log('正在登录 Web3.Storage...');
    await client.login(process.env.WEB3_STORAGE_EMAIL);
    
    console.log('设置当前空间...');
    await client.setCurrentSpace(process.env.SPACE_DID);
    
    console.log('创建文件对象...');
    const file = await getFileFromBuffer(buffer, fileName);
    
    console.log('上传文件中...');
    // upload single file
    const cid = await client.uploadFile(file);
    
    console.log('上传成功，CID:', cid.toString());
    return cid.toString();
  } catch (error) {
    console.error('IPFS 上传失败:', error);
    throw new Error(`IPFS 上传失败: ${error.message}`);
  }
}

// calculate hash256
export function calculateHash(buffer) {
  return crypto.createHash('sha256').update(buffer).digest('hex');
}

// 示例：完整的上传处理函数（假设你在路由中使用）
export async function handleFileUpload(req, res) {
  try {
    // 假设你使用 multer 或类似中间件处理文件上传
    if (!req.file) {
      return res.status(400).json({ success: false, error: '没有文件被上传' });
    }

    const { buffer, originalname } = req.file;
    
    console.log('处理文件:', originalname);
    
    // 计算文件哈希
    const fileHash = calculateHash(buffer);
    console.log('文件哈希:', fileHash);
    
    // 上传到 IPFS
    const ipfsHash = await uploadToIPFS(buffer, originalname);
    console.log('IPFS 哈希:', ipfsHash);
    
    // 确保 ipfsHash 不为空
    if (!ipfsHash) {
      throw new Error('IPFS 上传返回空的哈希值');
    }
    
    // 保存到数据库（这里需要根据你的数据库模型调整）
    // 假设你使用 Sequelize 或类似 ORM
    const uploadRecord = await Upload.create({
      fileName: originalname,
      fileHash: fileHash,
      ipfsHash: ipfsHash, // 确保这个值不为 null
      fileSize: buffer.length,
      uploadTime: new Date()
    });
    
    return res.json({
      success: true,
      data: {
        id: uploadRecord.id,
        fileName: originalname,
        fileHash: fileHash,
        ipfsHash: ipfsHash,
        fileSize: buffer.length
      }
    });
    
  } catch (error) {
    console.error('文件上传处理失败:', error);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
}