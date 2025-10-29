const { Sequelize, DataTypes } = require('sequelize');
require('dotenv').config();

// Initialize Sequelize
const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  dialect: 'postgres',
  logging: console.log,
});

// Import models
const User = require('./User')(sequelize, DataTypes);
const Hospital = require('./Hospital')(sequelize, DataTypes);
const Appointment = require('./Appointment')(sequelize, DataTypes);
const MedicalTest = require('./MedicalTest')(sequelize, DataTypes);
const Notification = require('./Notifications')(sequelize, DataTypes);
const TestResult = require('./TestResults')(sequelize, DataTypes);

// ------------------------
// Associations
// ------------------------

// Users
User.hasMany(Appointment, { foreignKey: 'patientId' });
Appointment.belongsTo(User, { foreignKey: 'patientId' });

User.hasMany(TestResult, { foreignKey: 'patientId' });
TestResult.belongsTo(User, { foreignKey: 'patientId' });

User.hasMany(Notification, { foreignKey: 'patientId' });
Notification.belongsTo(User, { foreignKey: 'patientId' });

// Hospitals
Hospital.hasMany(Appointment, { foreignKey: 'hospitalId' });
Appointment.belongsTo(Hospital, { foreignKey: 'hospitalId' });

Hospital.hasMany(TestResult, { foreignKey: 'hospitalId' });
TestResult.belongsTo(Hospital, { foreignKey: 'hospitalId' });

// MedicalTests
MedicalTest.hasMany(Appointment, { foreignKey: 'testId' });
Appointment.belongsTo(MedicalTest, { foreignKey: 'testId' });

MedicalTest.hasMany(TestResult, { foreignKey: 'testId' });
TestResult.belongsTo(MedicalTest, { foreignKey: 'testId' });

// Appointments ↔ TestResults
Appointment.hasMany(TestResult, { foreignKey: 'appointmentId' });
TestResult.belongsTo(Appointment, { foreignKey: 'appointmentId' });


// Export models & sequelize
module.exports = {
  sequelize,
  Sequelize,
  User,
  Hospital,
  Appointment,
  MedicalTest,
  Notification,
  TestResult,
};