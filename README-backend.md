## 📋 版本信息

- **Node.js**: 16+
- **PostgreSQL**: 15+
- **后端框架**: Express.js
- **数据库ORM**: Sequelize
- **区块链**: Ethereum + Hardhat
- **IPFS**: Web3.Storage

## 📁 项目结构

```
DRManagerProject_Complete/
├── backend/                 # 后端服务
│   ├── config/             # 配置文件
│   │   └── database.js     # 数据库配置
│   ├── models/             # 数据模型
│   │   ├── Upload.js       # 上传模型
│   │   ├── Content.js      # 内容模型
│   │   └── Transaction.js  # 交易模型
│   ├── scripts/            # 脚本文件
│   │   ├── migrate.js      # 数据库迁移
│   │   └── seed.js         # 种子数据
│   ├── uploads/            # 上传文件目录
│   ├── index.js            # 主应用文件
│   ├── package.json        # 后端依赖
│   ├── env.example         # 环境变量模板
│   └── .env                # 环境变量
├── frontend/               # 前端应用
│   ├── index.html          # 主页面
│   ├── app.js              # 前端逻辑
│   └── contract.json       # 合约配置
├── contracts/              # 智能合约
│   └── DRManager.sol       # 主合约
├── test/                   # 测试文件
├── scripts/                # 部署脚本
└── README.md               # 项目文档
```

## 🛠️ 安装步骤

### 1. 克隆项目

```bash
git clone <repository-url>
cd DRManagerProject_Complete
```

### 2. 安装依赖

```bash
# 安装根目录依赖
npm install

# 安装后端依赖
cd backend
npm install
```

### 3. 配置PostgreSQL数据库

#### 3.1 安装PostgreSQL

1. 下载并安装 [PostgreSQL](https://www.postgresql.org/download/windows/)
2. 安装时记住设置的密码
3. 确保PostgreSQL服务已启动

#### 3.2 创建数据库

```bash
# 连接到PostgreSQL
psql -U postgres

# 创建数据库
CREATE DATABASE drmanager;

# 创建用户（可选）
CREATE USER drmanager_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE drmanager TO drmanager_user;

# 退出
\q
```

### 4. 配置环境变量

```bash
cd backend
cp env.example .env
```

编辑 `.env` 文件，需要配置以下内容：

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=drmanager
DB_USER=postgres
DB_PASSWORD=your_password

# Blockchain Configuration
BLOCKCHAIN_NETWORK=localhost
CONTRACT_ADDRESS=0x1fE38AFc5B06e147dCb0e2eF46FC7ee27bfd278f

# Web3.Storage Configuration
WEB3_STORAGE_EMAIL=your_email@example.com
SPACE_DID=your_space_did_here

# Ethereum Configuration
RPC_URL=http://localhost:8545
PRIVATE_KEY=your_private_key_here

# File storage configuration
SAVE_TO_FILE=false
MAX_FILE_SIZE=104857600
```

### 5. 运行数据库迁移

```bash
cd backend
npm run db:migrate
```

### 6. 启动后端

```bash
# 开发模式
npm run dev

# 生产模式
npm start
```
启动成功后，访问：
- **前端界面**: http://localhost:3000
- **API文档**: http://localhost:3000/api/*

## 🧪 测试

```bash
# 运行区块链测试
npm test

# 运行API测试
cd backend
npm test
```

### 端口冲突

如果端口3000被占用，可以在 `.env` 文件中修改 `PORT` 配置。

### 权限问题

确保数据库用户有足够的权限：

```sql
GRANT ALL PRIVILEGES ON DATABASE drmanager TO your_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO your_user;
```

## 🗄️ 数据库表结构

### uploads (上传记录表)
| 字段 | 类型 | 说明 |
|------|------|------|
| id | STRING | 主键，上传ID |
| fileName | STRING | 文件名 |
| fileSize | BIGINT | 文件大小 |
| mimeType | STRING | 文件类型 |
| ipfsHash | STRING | IPFS哈希 |
| timestamp | DATE | 上传时间 |
| status | ENUM | 状态 (pending/completed/failed) |

### contents (内容记录表)
| 字段 | 类型 | 说明 |
|------|------|------|
| id | STRING | 主键，内容ID |
| userAddress | STRING | 用户地址 |
| title | STRING | 标题 |
| description | STRING | 描述 |
| category | STRING | 分类 |
| price | STRING | 价格 |
| ipfsHash | STRING | IPFS哈希 |
| txHash | STRING | 交易哈希 |
| blockNumber | INTEGER | 区块号 |
| status | ENUM | 状态 (registered/active/inactive) |

### transactions (交易记录表)
| 字段 | 类型 | 说明 |
|------|------|------|
| id | STRING | 主键，交易ID |
| type | ENUM | 交易类型 (register/purchase/license) |
| userAddress | STRING | 用户地址 |
| contentId | STRING | 内容ID |
| txHash | STRING | 交易哈希 |
| amount | STRING | 金额 |
| blockNumber | INTEGER | 区块号 |
| gasUsed | STRING | 消耗的gas |

## 📊 API 接口

| 接口 | 方法 | 说明 |
|------|------|------|
| `/api/upload` | POST | 文件上传到IPFS |
| `/api/content/register` | POST | 内容注册 |
| `/api/content/user/:address` | GET | 获取用户内容 |
| `/api/content/marketplace` | GET | 获取市场内容 |
| `/api/transaction/record` | POST | 记录交易 |
| `/api/stats/:address` | GET | 获取统计信息 |
| `/api/health` | GET | 健康检查 |
