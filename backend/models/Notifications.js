const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');
module.exports = (sequelize, DataTypes) =>{
return Notification = sequelize.define('Notification', {
  patientId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  type: {
    type: DataTypes.ENUM(
      'appointment_confirmation',
      'appointment_reminder',
      'result_ready',
      'payment_success',
      'payment_failure',
      'cancellation',
      'rescheduling',
      'system_alert',
      'promotional'
    ),
    allowNull: false,
  },
  title: {
    type: DataTypes.STRING(200),
    allowNull: false,
  },
  message: {
    type: DataTypes.STRING(1000),
    allowNull: false,
  },
  data: {
    type: DataTypes.JSONB, // replaces nested Mongoose refs
    defaultValue: {},
  },
  channels: {
    type: DataTypes.JSONB, // e.g. ["sms", "email", "push"]
    defaultValue: [],
  },
  delivery_status: {
    type: DataTypes.JSONB, // nested structure for each channel
    defaultValue: {
      sms: {},
      email: {},
      push: {},
      in_app: {},
    },
  },
  read: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  read_at: {
    type: DataTypes.DATE,
  },
  priority: {
    type: DataTypes.ENUM('low', 'medium', 'high', 'urgent'),
    defaultValue: 'medium',
  },
  expires_at: {
    type: DataTypes.DATE,
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
  tableName: 'notifications',
  timestamps: true,
  underscored: true,
});
}

// module.exports = Notification;
