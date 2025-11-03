const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');
module.exports = (sequelize, DataTypes) =>{
return TestResult = sequelize.define('testResult', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  appointmentId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  testId:{
      type:DataTypes.UUID,
      allowNull:false,
  },
  patientId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  hospitalId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  result_type: {
    type: DataTypes.ENUM('numeric', 'text', 'image', 'file', 'mixed'),
    allowNull: false,
  },
  files: {
    type: DataTypes.JSONB, // [{ filename, url, uploadedBy, ... }]
    defaultValue: [],
  },
  numeric_results: {
    type: DataTypes.JSONB, // [{ parameter, value, unit, interpretation }]
    defaultValue: [],
  },
  text_results: {
    type: DataTypes.JSONB, // { findings, impression, conclusion, ... }
    defaultValue: {},
  },
  quality_control: {
    type: DataTypes.JSONB, // { performedBy, controls: [...] }
    defaultValue: {},
  },
  status: {
    type: DataTypes.ENUM('pending', 'processing', 'completed', 'verified', 'amended', 'cancelled'),
    defaultValue: 'pending',
  },
  verified_by: {
    type: DataTypes.UUID,
  },
  verified_at: {
    type: DataTypes.DATE,
  },
  priority: {
    type: DataTypes.ENUM('routine', 'urgent', 'stat'),
    defaultValue: 'routine',
  },
  turnaround_time: {
    type: DataTypes.JSONB, // { promised, actual, metDeadline }
    defaultValue: {},
  },
  access_log: {
    type: DataTypes.JSONB, // [{ accessedBy, accessedAt, action }]
    defaultValue: [],
  },
  sharing: {
    type: DataTypes.JSONB, // { sharedWith: [...], isPublic: true/false }
    defaultValue: {},
  },
  amendments: {
    type: DataTypes.JSONB, // [{ reason, previousValue, newValue }]
    defaultValue: [],
  },
  metadata: {
    type: DataTypes.JSONB, // { reportVersion, templateUsed, language, etc. }
    defaultValue: {
      reportVersion: '1.0',
      language: 'en',
    },
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  updated_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
}, {
  tableName: 'test_results',
  timestamps: false,
  underscored: true,
  hooks: {
    beforeUpdate: (result) => {
      result.updated_at = new Date();
    },
  },
});

// 🔍 Virtual getters
Object.defineProperty(TestResult.prototype, 'isVerified', {
  get() {
    return this.status === 'verified' && !!this.verified_by;
  },
});

Object.defineProperty(TestResult.prototype, 'hasCriticalValues', {
  get() {
    return (this.numeric_results || []).some(r => r.interpretation === 'critical');
  },
});

Object.defineProperty(TestResult.prototype, 'ageInDays', {
  get() {
    const created = this.created_at ? new Date(this.created_at) : new Date();
    return Math.floor((Date.now() - created.getTime()) / (1000 * 60 * 60 * 24));
  },
});

}

