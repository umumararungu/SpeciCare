const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

// Ensure data directory exists
const dataDir = path.join(__dirname, '..', 'data');
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'specicare.db');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database:', err.message);
    } else {
        console.log('Connected to SQLite database:', dbPath);
        initializeDatabase();
    }
});

// Enable foreign keys
db.run('PRAGMA foreign_keys = ON');

function initializeDatabase() {
    // Create tables
    createUsersTable();
    createMedicalTestsTable();
    createHospitalsTable();
    createAppointmentsTable();
    createTestResultsTable();
    createNotificationsTable();
}

function createUsersTable() {
    db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        phone TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        insuranceNumber TEXT,
        dateOfBirth TEXT,
        gender TEXT CHECK(gender IN ('male', 'female', 'other')),
        district TEXT,
        sector TEXT,
        cell TEXT,
        village TEXT,
        role TEXT DEFAULT 'patient' CHECK(role IN ('patient', 'admin', 'hospital_staff')),
        isActive BOOLEAN DEFAULT 1,
        lastLogin TEXT,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);
}

function createMedicalTestsTable() {
    db.run(`CREATE TABLE IF NOT EXISTS medical_tests (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        description TEXT NOT NULL,
        category TEXT NOT NULL CHECK(category IN (
            'radiology', 'laboratory', 'cardiology', 'neurology', 
            'pathology', 'endoscopy', 'pulmonology', 'other'
        )),
        subcategory TEXT,
        price INTEGER NOT NULL CHECK(price >= 0),
        currency TEXT DEFAULT 'RWF',
        duration TEXT NOT NULL,
        preparationInstructions TEXT,
        isInsuranceCovered BOOLEAN DEFAULT 1,
        insuranceCoPay INTEGER DEFAULT 0 CHECK(insuranceCoPay >= 0),
        isAvailable BOOLEAN DEFAULT 1,
        requirements TEXT, -- JSON string
        tags TEXT, -- JSON string
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);
}

function createHospitalsTable() {
    db.run(`CREATE TABLE IF NOT EXISTS hospitals (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        type TEXT NOT NULL CHECK(type IN (
            'national_referral', 'provincial', 'district', 
            'private', 'health_center', 'clinic'
        )),
        phone TEXT NOT NULL,
        email TEXT,
        emergencyPhone TEXT,
        province TEXT NOT NULL,
        district TEXT NOT NULL,
        sector TEXT NOT NULL,
        cell TEXT,
        village TEXT,
        street TEXT,
        latitude REAL,
        longitude REAL,
        operatingHours TEXT, -- JSON string
        facilities TEXT, -- JSON string
        insuranceProviders TEXT, -- JSON string
        averageRating REAL DEFAULT 0 CHECK(averageRating >= 0 AND averageRating <= 5),
        ratingCount INTEGER DEFAULT 0,
        isActive BOOLEAN DEFAULT 1,
        registrationNumber TEXT UNIQUE,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);
}

function createAppointmentsTable() {
    db.run(`CREATE TABLE IF NOT EXISTS appointments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        reference TEXT UNIQUE NOT NULL,
        patientId INTEGER NOT NULL,
        testId INTEGER NOT NULL,
        hospitalId INTEGER NOT NULL,
        appointmentDate TEXT NOT NULL,
        timeSlot TEXT NOT NULL,
        status TEXT DEFAULT 'pending' CHECK(status IN (
            'pending', 'confirmed', 'completed', 'cancelled', 'no_show', 'rescheduled'
        )),
        totalAmount INTEGER NOT NULL CHECK(totalAmount >= 0),
        insuranceCovered INTEGER DEFAULT 0 CHECK(insuranceCovered >= 0),
        patientShare INTEGER NOT NULL CHECK(patientShare >= 0),
        paymentStatus TEXT DEFAULT 'pending' CHECK(paymentStatus IN ('pending', 'paid', 'failed', 'refunded')),
        paymentMethod TEXT DEFAULT 'cash' CHECK(paymentMethod IN ('cash', 'mobile_money', 'insurance', 'card', 'bank_transfer')),
        transactionId TEXT,
        paidAt TEXT,
        patientName TEXT NOT NULL,
        patientPhone TEXT NOT NULL,
        patientEmail TEXT,
        patientInsuranceNumber TEXT,
        patientDateOfBirth TEXT,
        patientGender TEXT CHECK(patientGender IN ('male', 'female', 'other')),
        referringDoctor TEXT,
        doctorContact TEXT,
        clinicalNotes TEXT,
        urgency TEXT DEFAULT 'routine' CHECK(urgency IN ('routine', 'urgent', 'emergency')),
        symptoms TEXT, -- JSON string
        previousTests TEXT, -- JSON string
        confirmationSmsSent BOOLEAN DEFAULT 0,
        confirmationSmsSentAt TEXT,
        confirmationMessageId TEXT,
        reminderSmsSent BOOLEAN DEFAULT 0,
        reminderSmsSentAt TEXT,
        reminderMessageId TEXT,
        resultSmsSent BOOLEAN DEFAULT 0,
        resultSmsSentAt TEXT,
        resultMessageId TEXT,
        cancellationReason TEXT,
        cancelledBy TEXT CHECK(cancelledBy IN ('patient', 'hospital', 'system')),
        cancelledAt TEXT,
        refundAmount INTEGER DEFAULT 0,
        originalAppointmentDate TEXT,
        originalTimeSlot TEXT,
        reschedulingReason TEXT,
        rescheduledAt TEXT,
        rescheduledBy TEXT CHECK(rescheduledBy IN ('patient', 'hospital')),
        resultFileUrl TEXT,
        resultFileName TEXT,
        resultFileSize INTEGER,
        uploadedById INTEGER,
        uploadedAt TEXT,
        findings TEXT,
        interpretation TEXT,
        isNormal BOOLEAN,
        recommendations TEXT, -- JSON string
        feedbackRating INTEGER CHECK(feedbackRating >= 1 AND feedbackRating <= 5),
        feedbackComment TEXT,
        feedbackSubmittedAt TEXT,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (patientId) REFERENCES users (id),
        FOREIGN KEY (testId) REFERENCES medical_tests (id),
        FOREIGN KEY (hospitalId) REFERENCES hospitals (id),
        FOREIGN KEY (uploadedById) REFERENCES users (id)
    )`);
}

function createTestResultsTable() {
    db.run(`CREATE TABLE IF NOT EXISTS test_results (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        appointmentId INTEGER NOT NULL,
        testId INTEGER NOT NULL,
        patientId INTEGER NOT NULL,
        hospitalId INTEGER NOT NULL,
        resultType TEXT NOT NULL CHECK(resultType IN ('numeric', 'text', 'image', 'file', 'mixed')),
        files TEXT, -- JSON string
        numericResults TEXT, -- JSON string
        textFindings TEXT,
        textImpression TEXT,
        textConclusion TEXT,
        textRecommendations TEXT, -- JSON string
        textTechnicalDetails TEXT,
        qualityControlPerformedBy TEXT,
        qualityControlPerformedAt TEXT,
        qualityControls TEXT, -- JSON string
        status TEXT DEFAULT 'pending' CHECK(status IN (
            'pending', 'processing', 'completed', 'verified', 'amended', 'cancelled'
        )),
        verifiedById INTEGER,
        verifiedAt TEXT,
        priority TEXT DEFAULT 'routine' CHECK(priority IN ('routine', 'urgent', 'stat')),
        promisedTurnaroundTime INTEGER,
        actualTurnaroundTime INTEGER,
        metDeadline BOOLEAN,
        accessLog TEXT, -- JSON string
        sharedWith TEXT, -- JSON string
        isPublic BOOLEAN DEFAULT 0,
        amendments TEXT, -- JSON string
        reportVersion TEXT DEFAULT '1.0',
        templateUsed TEXT,
        generatedBy TEXT,
        language TEXT DEFAULT 'en',
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (appointmentId) REFERENCES appointments (id),
        FOREIGN KEY (testId) REFERENCES medical_tests (id),
        FOREIGN KEY (patientId) REFERENCES users (id),
        FOREIGN KEY (hospitalId) REFERENCES hospitals (id),
        FOREIGN KEY (verifiedById) REFERENCES users (id)
    )`);
}

function createNotificationsTable() {
    db.run(`CREATE TABLE IF NOT EXISTS notifications (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        userId INTEGER NOT NULL,
        type TEXT NOT NULL CHECK(type IN (
            'appointment_confirmation', 'appointment_reminder', 'result_ready',
            'payment_success', 'payment_failure', 'cancellation', 'rescheduling',
            'system_alert', 'promotional'
        )),
        title TEXT NOT NULL,
        message TEXT NOT NULL,
        appointmentId INTEGER,
        testResultId INTEGER,
        actionUrl TEXT,
        actionMetadata TEXT, -- JSON string
        channels TEXT NOT NULL, -- JSON string
        smsSent BOOLEAN DEFAULT 0,
        smsSentAt TEXT,
        smsMessageId TEXT,
        smsError TEXT,
        emailSent BOOLEAN DEFAULT 0,
        emailSentAt TEXT,
        emailMessageId TEXT,
        emailError TEXT,
        pushSent BOOLEAN DEFAULT 0,
        pushSentAt TEXT,
        pushMessageId TEXT,
        pushError TEXT,
        inAppSent BOOLEAN DEFAULT 1,
        inAppSentAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        read BOOLEAN DEFAULT 0,
        readAt TEXT,
        priority TEXT DEFAULT 'medium' CHECK(priority IN ('low', 'medium', 'high', 'urgent')),
        expiresAt TEXT,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (userId) REFERENCES users (id),
        FOREIGN KEY (appointmentId) REFERENCES appointments (id),
        FOREIGN KEY (testResultId) REFERENCES test_results (id)
    )`);
}

// Insert sample data
function insertSampleData() {
    // Check if sample data already exists
    db.get("SELECT COUNT(*) as count FROM medical_tests", (err, row) => {
        if (err) {
            console.error('Error checking sample data:', err);
            return;
        }
        
        if (row.count === 0) {
            console.log('Inserting sample data...');
            
            // Insert sample medical tests
            const sampleTests = [
                ['MRI Scan', 'Magnetic Resonance Imaging for detailed internal body scans', 'radiology', 85000, '45 minutes', 'No food or drink 4 hours before scan', 1, 8500],
                ['CT Scan', 'Computed Tomography scan for cross-sectional body images', 'radiology', 75000, '30 minutes', 'No metal objects, fasting may be required', 1, 7500],
                ['Blood Test (Full Panel)', 'Complete blood count and comprehensive metabolic panel', 'laboratory', 15000, '15 minutes', 'Fasting for 8-12 hours required', 1, 1500],
                ['X-Ray Chest', 'Chest X-ray for lung and heart examination', 'radiology', 20000, '20 minutes', 'No special preparation needed', 1, 2000],
                ['Ultrasound Abdomen', 'Abdominal ultrasound for organ examination', 'radiology', 35000, '30 minutes', 'Fasting for 6-8 hours required', 1, 3500]
            ];
            
            const insertTest = db.prepare(`INSERT INTO medical_tests 
                (name, description, category, price, duration, preparationInstructions, isInsuranceCovered, insuranceCoPay) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)`);
            
            sampleTests.forEach(test => {
                insertTest.run(test);
            });
            insertTest.finalize();
            
            // Insert sample hospitals
            const sampleHospitals = [
                ['Kigali Central Hospital', 'national_referral', '+250788111111', 'info@kch.rw', '+250788111112', 'Kigali', 'Nyarugenge', 'Nyamirambo'],
                ['King Faisal Hospital', 'private', '+250788222222', 'info@kfh.rw', '+250788222223', 'Kigali', 'Kicukiro', 'Gikondo'],
                ['Bugesera District Hospital', 'district', '+250788333333', 'info@bugesarahospital.rw', null, 'Eastern', 'Bugesera', 'Nyamata'],
                ['Muhanga District Hospital', 'district', '+250788444444', 'info@muhangahospital.rw', null, 'Southern', 'Muhanga', 'Muhanga']
            ];
            
            const insertHospital = db.prepare(`INSERT INTO hospitals 
                (name, type, phone, email, emergencyPhone, province, district, sector) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)`);
            
            sampleHospitals.forEach(hospital => {
                insertHospital.run(hospital);
            });
            insertHospital.finalize();
            
            console.log('Sample data inserted successfully');
        }
    });
}

// Call sample data insertion after a short delay
setTimeout(insertSampleData, 1000);

module.exports = db;
