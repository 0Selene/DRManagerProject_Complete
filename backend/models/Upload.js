import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Upload = sequelize.define('Upload', {
  id: {
    type: DataTypes.STRING,
    primaryKey: true,
    allowNull: false
  },
  fileName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  fileSize: {
    type: DataTypes.BIGINT,
    allowNull: false
  },
  mimeType: {
    type: DataTypes.STRING,
    allowNull: false
  },
  ipfsHash: {
    type: DataTypes.STRING,
    allowNull: false
  },
  timestamp: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  status: {
    type: DataTypes.ENUM('pending', 'completed', 'failed'),
    defaultValue: 'pending'
  }
}, {
  tableName: 'uploads',
  timestamps: true
});

export default Upload; 