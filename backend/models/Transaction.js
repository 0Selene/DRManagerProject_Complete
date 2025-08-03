import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Transaction = sequelize.define('Transaction', {
  id: {
    type: DataTypes.STRING,
    primaryKey: true,
    allowNull: false
  },
  type: {
    type: DataTypes.ENUM('register', 'purchase', 'license'),
    allowNull: false
  },
  userAddress: {
    type: DataTypes.STRING,
    allowNull: false,
    index: true
  },
  contentId: {
    type: DataTypes.STRING,
    allowNull: true
  },
  txHash: {
    type: DataTypes.STRING,
    allowNull: false
  },
  amount: {
    type: DataTypes.DECIMAL(18, 8),
    defaultValue: 0
  },
  blockNumber: {
    type: DataTypes.BIGINT,
    allowNull: true
  },
  gasUsed: {
    type: DataTypes.BIGINT,
    allowNull: true
  }
}, {
  tableName: 'transactions',
  timestamps: true
});

export default Transaction; 