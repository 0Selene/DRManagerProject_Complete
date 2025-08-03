import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Content = sequelize.define('Content', {
  id: {
    type: DataTypes.STRING,
    primaryKey: true,
    allowNull: false
  },
  userAddress: {
    type: DataTypes.STRING,
    allowNull: false,
    index: true
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  category: {
    type: DataTypes.STRING,
    defaultValue: 'other'
  },
  price: {
    type: DataTypes.DECIMAL(18, 8),
    defaultValue: 0
  },
  ipfsHash: {
    type: DataTypes.STRING,
    allowNull: false
  },
  txHash: {
    type: DataTypes.STRING,
    allowNull: false
  },
  blockNumber: {
    type: DataTypes.BIGINT,
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('registered', 'active', 'inactive'),
    defaultValue: 'registered'
  }
}, {
  tableName: 'contents',
  timestamps: true
});

export default Content; 