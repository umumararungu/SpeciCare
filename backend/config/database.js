// config/database.js - WITH BETTER DEBUGGING
const { Sequelize } = require('sequelize');
const path = require('path');

// Load environment variables with explicit path
const envPath = path.resolve(process.cwd(), '.env');
console.log('Loading .env from:', envPath);

const result = require('dotenv').config({ path: envPath });

if (result.error) {
  console.error(' Error loading .env file:', result.error);
} else {
  console.log(' .env file loaded successfully');
}

// Debug: Show what environment variables are loaded
console.log('\n Loaded Environment Variables:');
console.log('DB_HOST:', process.env.DB_HOST);
console.log('DB_USER:', process.env.DB_USER);
console.log('DB_NAME:', process.env.DB_NAME);
console.log('DB_PORT:', process.env.DB_PORT);
console.log('DB_PASSWORD:', process.env.DB_PASSWORD ? '***' : 'NOT SET');

// Validate required environment variables
const requiredEnvVars = ['DB_NAME', 'DB_USER', 'DB_HOST'];
const missingEnvVars = requiredEnvVars.filter(envVar => {
  const value = process.env[envVar];
  return !value || value.trim() === '';
});

if (missingEnvVars.length > 0) {
  console.error(' Missing or empty environment variables:', missingEnvVars);
  console.error(' Please check your .env file');
  console.error('Current directory:', process.cwd());
  process.exit(1);
}

// Database configuration
const dbConfig = {
  database: process.env.DB_NAME,
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD || null,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT || 5432,
  dialect: 'postgres',
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
  
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  },
  
  dialectOptions: {
    ssl: process.env.NODE_ENV === 'production'
  }
};

console.log('\n  Database Configuration:');
console.log('Host:', dbConfig.host);
console.log('Port:', dbConfig.port);
console.log('Database:', dbConfig.database);
console.log('Username:', dbConfig.username);

// Create Sequelize instance
const sequelize = new Sequelize(
  dbConfig.database,
  dbConfig.username,
  dbConfig.password,
  {
    host: dbConfig.host,
    port: dbConfig.port,
    dialect: dbConfig.dialect,
    logging: dbConfig.logging,
    pool: dbConfig.pool,
    dialectOptions: dbConfig.dialectOptions
  }
);

// Test database connection
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log(' Database connection established successfully');
    return true;
  } catch (error) {
    console.error(' Unable to connect to database:', error.message);
    console.log(' Troubleshooting tips:');
    console.log('   1. Check if PostgreSQL is running');
    console.log('   2. Verify database credentials');
    console.log('   3. Check if database "specicare" exists');
    return false;
  }
};

module.exports = {
  sequelize,
  Sequelize,
  dbConfig,
  testConnection
};
