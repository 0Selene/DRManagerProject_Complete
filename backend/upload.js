// 使用 ES Module 导入
import { createRequire } from 'module';
import { filesFromPaths } from 'files-from-path';
import { create } from '@web3-storage/w3up-client';
import { ethers } from 'ethers';
import crypto from 'crypto';
import fs from 'fs';
import dotenv from 'dotenv';

// 使用 require 只用于 JSON 文件
const require = createRequire(import.meta.url);
const contractABI = require('../frontend/contract.json');

dotenv.config();

const provider = new ethers.providers.JsonRpcProvider(process.env.RPC_URL);
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
const contract = new ethers.Contract(process.env.CONTRACT_ADDRESS, contractABI.abi, wallet);

export async function uploadToIPFS(buffer, fileName) {
  const tempFilePath = `./temp-${Date.now()}-${fileName}`;
  fs.writeFileSync(tempFilePath, buffer);

  const client = await create();
  await client.login(process.env.WEB3_STORAGE_EMAIL);
  await client.setCurrentSpace(process.env.SPACE_DID);

  const files = await filesFromPaths([tempFilePath]);

  const cid = await client.uploadDirectory(files);

  fs.unlinkSync(tempFilePath);

  return cid.toString();
}

export function calculateHash(buffer) {
  return crypto.createHash('sha256').update(buffer).digest('hex');
}

export async function registerWorkOnChain(hash, title, cid) {
  const tx = await contract.registerWork(hash, title, cid);
  await tx.wait();
  console.log('Work registered on-chain:', hash);
}