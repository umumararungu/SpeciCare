// models/Appointment.js - CORRECTED VERSION
const { DataTypes } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  const Appointment = sequelize.define('Appointment', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    patientId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    hospitalId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    testId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    time: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    reason: {
      type: DataTypes.STRING(500),
    },
    type: {
      type: DataTypes.ENUM('consultation', 'follow-up', 'lab-test', 'emergency'),
      defaultValue: 'consultation',
    },
    status: {
      type: DataTypes.ENUM('pending', 'confirmed', 'cancelled', 'completed', 'rescheduled'),
      defaultValue: 'pending',
    },
    notes: {
      type: DataTypes.JSONB,
      defaultValue: {},
    },
    reminders: {
      type: DataTypes.JSONB,
      defaultValue: [],
    },
    payment_info: {
      type: DataTypes.JSONB,
      defaultValue: {},
    },
    follow_up: {
      type: DataTypes.JSONB,
      defaultValue: {},
    }
  }, {
    tableName: 'appointments',
    timestamps: true, // Let Sequelize handle createdAt/updatedAt
    underscored: true,
  });

  return Appointment;
};