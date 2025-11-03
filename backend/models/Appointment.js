// models/Appointment.js - CORRECTED VERSION
const { DataTypes } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  const Appointment = sequelize.define('appointment', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    patient_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    hospital_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    test_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    appointment_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      field:'appointment_date',
    },
    time_slot: {
      type: DataTypes.STRING(20),
      allowNull: false,
      field:'time_slot',
    },
    // reason: {
    //   type: DataTypes.STRING(500),
    // },
    // type: {
    //   type: DataTypes.ENUM('consultation', 'follow-up', 'lab-test', 'emergency'),
    //   defaultValue: 'consultation',
    // },
    status: {
      type: DataTypes.ENUM('pending', 'confirmed', 'cancelled', 'completed', 'rescheduled'),
      defaultValue: 'pending',
    },
    // notes: {
    //   type: DataTypes.JSONB,
    //   defaultValue: {},
    // },
    reminder_sms_sent_at: {
      type: DataTypes.DATE,
    },
    payment_method: {
      type: DataTypes.STRING,
    },
    previous_tests: {
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