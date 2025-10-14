const { Pool } = require('pg');
require('dotenv').config();

const initPool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: 'specicare' 
});

async function initializeDatabase() {
    let client;
    try {
        client = await initPool.connect();
        console.log('Connected to PostgreSQL server');

        // Create database if it doesn't exist
        await client.query(`
            SELECT 'CREATE DATABASE specicare'
            WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'specicare')
        `);

        console.log('Database "specicare" ensured');

        // Switch to specicare database
        await client.release();
        client = await initPool.connect();

        // Create tables
        await createTables(client);
        await insertSampleData(client);

        console.log('  Database initialization completed successfully');

    } catch (error) {
        console.error('   Database initialization failed:', error);
    } finally {
        if (client) client.release();
        await initPool.end();
    }
}

async function createTables(client) {
    // Users table
    await client.query(`
        CREATE TABLE IF NOT EXISTS users (
            id SERIAL PRIMARY KEY,
            name VARCHAR(100) NOT NULL,
            email VARCHAR(100) UNIQUE NOT NULL,
            phone VARCHAR(15) UNIQUE NOT NULL,
            password TEXT NOT NULL,
            insurance_number VARCHAR(50),
            date_of_birth DATE,
            gender VARCHAR(10) CHECK (gender IN ('male', 'female', 'other')),
            district VARCHAR(50),
            sector VARCHAR(50),
            cell VARCHAR(50),
            village VARCHAR(50),
            role VARCHAR(20) DEFAULT 'patient' CHECK (role IN ('patient', 'admin', 'hospital_staff')),
            is_active BOOLEAN DEFAULT TRUE,
            last_login TIMESTAMP,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `);

    // Medical tests table
    await client.query(`
        CREATE TABLE IF NOT EXISTS medical_tests (
            id SERIAL PRIMARY KEY,
            name VARCHAR(200) NOT NULL,
            description TEXT NOT NULL,
            category VARCHAR(50) NOT NULL CHECK (category IN (
                'radiology', 'laboratory', 'cardiology', 'neurology', 
                'pathology', 'endoscopy', 'pulmonology', 'other'
            )),
            subcategory VARCHAR(100),
            price INTEGER NOT NULL CHECK (price >= 0),
            currency VARCHAR(10) DEFAULT 'RWF',
            duration VARCHAR(50) NOT NULL,
            preparation_instructions TEXT,
            is_insurance_covered BOOLEAN DEFAULT TRUE,
            insurance_co_pay INTEGER DEFAULT 0 CHECK (insurance_co_pay >= 0),
            is_available BOOLEAN DEFAULT TRUE,
            requirements JSONB,
            tags JSONB,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `);

    // Hospitals table
    await client.query(`
        CREATE TABLE IF NOT EXISTS hospitals (
            id SERIAL PRIMARY KEY,
            name VARCHAR(200) NOT NULL,
            type VARCHAR(50) NOT NULL CHECK (type IN (
                'national_referral', 'provincial', 'district', 
                'private', 'health_center', 'clinic'
            )),
            phone VARCHAR(15) NOT NULL,
            email VARCHAR(100),
            emergency_phone VARCHAR(15),
            province VARCHAR(50) NOT NULL,
            district VARCHAR(50) NOT NULL,
            sector VARCHAR(50) NOT NULL,
            cell VARCHAR(50),
            village VARCHAR(50),
            street VARCHAR(100),
            latitude DECIMAL(10, 8),
            longitude DECIMAL(11, 8),
            operating_hours JSONB,
            facilities JSONB,
            insurance_providers JSONB,
            average_rating DECIMAL(3, 2) DEFAULT 0 CHECK (average_rating >= 0 AND average_rating <= 5),
            rating_count INTEGER DEFAULT 0,
            is_active BOOLEAN DEFAULT TRUE,
            registration_number VARCHAR(100) UNIQUE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `);

    // Appointments table
    await client.query(`
        CREATE TABLE IF NOT EXISTS appointments (
            id SERIAL PRIMARY KEY,
            reference VARCHAR(50) UNIQUE NOT NULL,
            patient_id INTEGER REFERENCES users(id),
            test_id INTEGER NOT NULL REFERENCES medical_tests(id),
            hospital_id INTEGER NOT NULL REFERENCES hospitals(id),
            appointment_date DATE NOT NULL,
            time_slot VARCHAR(10) NOT NULL,
            status VARCHAR(20) DEFAULT 'pending' CHECK (status IN (
                'pending', 'confirmed', 'completed', 'cancelled', 'no_show', 'rescheduled'
            )),
            total_amount INTEGER NOT NULL CHECK (total_amount >= 0),
            insurance_covered INTEGER DEFAULT 0 CHECK (insurance_covered >= 0),
            patient_share INTEGER NOT NULL CHECK (patient_share >= 0),
            payment_status VARCHAR(20) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
            payment_method VARCHAR(20) DEFAULT 'cash' CHECK (payment_method IN ('cash', 'mobile_money', 'insurance', 'card', 'bank_transfer')),
            transaction_id VARCHAR(100),
            paid_at TIMESTAMP,
            patient_name VARCHAR(100) NOT NULL,
            patient_phone VARCHAR(15) NOT NULL,
            patient_email VARCHAR(100),
            patient_insurance_number VARCHAR(50),
            patient_date_of_birth DATE,
            patient_gender VARCHAR(10) CHECK (patient_gender IN ('male', 'female', 'other')),
            referring_doctor VARCHAR(100),
            doctor_contact VARCHAR(100),
            clinical_notes TEXT,
            urgency VARCHAR(20) DEFAULT 'routine' CHECK (urgency IN ('routine', 'urgent', 'emergency')),
            symptoms JSONB,
            previous_tests JSONB,
            confirmation_sms_sent BOOLEAN DEFAULT FALSE,
            confirmation_sms_sent_at TIMESTAMP,
            confirmation_message_id VARCHAR(100),
            reminder_sms_sent BOOLEAN DEFAULT FALSE,
            reminder_sms_sent_at TIMESTAMP,
            reminder_message_id VARCHAR(100),
            result_sms_sent BOOLEAN DEFAULT FALSE,
            result_sms_sent_at TIMESTAMP,
            result_message_id VARCHAR(100),
            cancellation_reason TEXT,
            cancelled_by VARCHAR(20) CHECK (cancelled_by IN ('patient', 'hospital', 'system')),
            cancelled_at TIMESTAMP,
            refund_amount INTEGER DEFAULT 0,
            original_appointment_date DATE,
            original_time_slot VARCHAR(10),
            rescheduling_reason TEXT,
            rescheduled_at TIMESTAMP,
            rescheduled_by VARCHAR(20) CHECK (rescheduled_by IN ('patient', 'hospital')),
            result_file_url TEXT,
            result_file_name VARCHAR(255),
            result_file_size INTEGER,
            uploaded_by_id INTEGER REFERENCES users(id),
            uploaded_at TIMESTAMP,
            findings TEXT,
            interpretation TEXT,
            is_normal BOOLEAN,
            recommendations JSONB,
            feedback_rating INTEGER CHECK (feedback_rating >= 1 AND feedback_rating <= 5),
            feedback_comment TEXT,
            feedback_submitted_at TIMESTAMP,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `);

    // Test results table
    await client.query(`
        CREATE TABLE IF NOT EXISTS test_results (
            id SERIAL PRIMARY KEY,
            appointment_id INTEGER NOT NULL REFERENCES appointments(id),
            test_id INTEGER NOT NULL REFERENCES medical_tests(id),
            patient_id INTEGER NOT NULL REFERENCES users(id),
            hospital_id INTEGER NOT NULL REFERENCES hospitals(id),
            result_type VARCHAR(20) NOT NULL CHECK (result_type IN ('numeric', 'text', 'image', 'file', 'mixed')),
            files JSONB,
            numeric_results JSONB,
            text_findings TEXT,
            text_impression TEXT,
            text_conclusion TEXT,
            text_recommendations JSONB,
            text_technical_details TEXT,
            quality_control_performed_by VARCHAR(100),
            quality_control_performed_at TIMESTAMP,
            quality_controls JSONB,
            status VARCHAR(20) DEFAULT 'pending' CHECK (status IN (
                'pending', 'processing', 'completed', 'verified', 'amended', 'cancelled'
            )),
            verified_by_id INTEGER REFERENCES users(id),
            verified_at TIMESTAMP,
            priority VARCHAR(20) DEFAULT 'routine' CHECK (priority IN ('routine', 'urgent', 'stat')),
            promised_turnaround_time INTEGER,
            actual_turnaround_time INTEGER,
            met_deadline BOOLEAN,
            access_log JSONB,
            shared_with JSONB,
            is_public BOOLEAN DEFAULT FALSE,
            amendments JSONB,
            report_version VARCHAR(20) DEFAULT '1.0',
            template_used VARCHAR(100),
            generated_by VARCHAR(100),
            language VARCHAR(10) DEFAULT 'en',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `);

    // Notifications table
    await client.query(`
        CREATE TABLE IF NOT EXISTS notifications (
            id SERIAL PRIMARY KEY,
            user_id INTEGER NOT NULL REFERENCES users(id),
            type VARCHAR(50) NOT NULL CHECK (type IN (
                'appointment_confirmation', 'appointment_reminder', 'result_ready',
                'payment_success', 'payment_failure', 'cancellation', 'rescheduling',
                'system_alert', 'promotional'
            )),
            title VARCHAR(200) NOT NULL,
            message TEXT NOT NULL,
            appointment_id INTEGER REFERENCES appointments(id),
            test_result_id INTEGER REFERENCES test_results(id),
            action_url TEXT,
            action_metadata JSONB,
            channels JSONB NOT NULL,
            sms_sent BOOLEAN DEFAULT FALSE,
            sms_sent_at TIMESTAMP,
            sms_message_id VARCHAR(100),
            sms_error TEXT,
            email_sent BOOLEAN DEFAULT FALSE,
            email_sent_at TIMESTAMP,
            email_message_id VARCHAR(100),
            email_error TEXT,
            push_sent BOOLEAN DEFAULT FALSE,
            push_sent_at TIMESTAMP,
            push_message_id VARCHAR(100),
            push_error TEXT,
            in_app_sent BOOLEAN DEFAULT TRUE,
            in_app_sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            read BOOLEAN DEFAULT FALSE,
            read_at TIMESTAMP,
            priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
            expires_at TIMESTAMP,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `);

    console.log('  All tables created successfully');
}

async function insertSampleData(client) {
    // Check if sample data already exists
    const testCount = await client.query('SELECT COUNT(*) FROM medical_tests');
    
    if (parseInt(testCount.rows[0].count) === 0) {
        console.log('Inserting sample data...');

        // Insert sample medical tests
        const sampleTests = [
            ['MRI Scan', 'Magnetic Resonance Imaging for detailed internal body scans', 'radiology', 85000, '45 minutes', 'No food or drink 4 hours before scan', true, 8500],
            ['CT Scan', 'Computed Tomography scan for cross-sectional body images', 'radiology', 75000, '30 minutes', 'No metal objects, fasting may be required', true, 7500],
            ['Blood Test (Full Panel)', 'Complete blood count and comprehensive metabolic panel', 'laboratory', 15000, '15 minutes', 'Fasting for 8-12 hours required', true, 1500],
            ['X-Ray Chest', 'Chest X-ray for lung and heart examination', 'radiology', 20000, '20 minutes', 'No special preparation needed', true, 2000],
            ['Ultrasound Abdomen', 'Abdominal ultrasound for organ examination', 'radiology', 35000, '30 minutes', 'Fasting for 6-8 hours required', true, 3500]
        ];

        for (const test of sampleTests) {
            await client.query(
                `INSERT INTO medical_tests 
                (name, description, category, price, duration, preparation_instructions, is_insurance_covered, insurance_co_pay) 
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
                test
            );
        }

        // Insert sample hospitals
        const sampleHospitals = [
            ['Kigali Central Hospital', 'national_referral', '+250788111111', 'info@kch.rw', '+250788111112', 'Kigali', 'Nyarugenge', 'Nyamirambo'],
            ['King Faisal Hospital', 'private', '+250788222222', 'info@kfh.rw', '+250788222223', 'Kigali', 'Kicukiro', 'Gikondo'],
            ['Bugesera District Hospital', 'district', '+250788333333', 'info@bugesarahospital.rw', null, 'Eastern', 'Bugesera', 'Nyamata'],
            ['Muhanga District Hospital', 'district', '+250788444444', 'info@muhangahospital.rw', null, 'Southern', 'Muhanga', 'Muhanga']
        ];

        for (const hospital of sampleHospitals) {
            await client.query(
                `INSERT INTO hospitals 
                (name, type, phone, email, emergency_phone, province, district, sector) 
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
                hospital
            );
        }

        console.log('  Sample data inserted successfully');
    } else {
        console.log('  Sample data already exists');
    }
}

// Run initialization
initializeDatabase();
