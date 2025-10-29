// models/Hospital.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');


module.exports = (sequelize, DataTypes) =>{
return Hospital = sequelize.define('Hospital', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING(150),
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true,
    },
  },
  phone: {
    type: DataTypes.STRING(20),
    allowNull: false,
  },
  address: {
    type: DataTypes.JSONB, // holds district, sector, cell, village
    defaultValue: {},
  },
  departments: {
    type: DataTypes.JSONB, // e.g. [{ name: "Lab", head: "Dr. X" }]
    defaultValue: [],
  },
  facilities: {
    type: DataTypes.JSONB, // e.g. ["X-ray", "CT Scan", "Emergency"]
    defaultValue: [],
  },
  license_number: {
    type: DataTypes.STRING(100),
  },
  accreditation: {
    type: DataTypes.JSONB, // { body: "Rwanda Medical Board", status: "approved" }
    defaultValue: {},
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  metadata: {
    type: DataTypes.JSONB, // store flexible additional info
    defaultValue: {},
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  updatedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
}, {
  tableName: 'hospitals',
  timestamps: true,
  underscored: true,
});
}
// module.exports = Hospital;
