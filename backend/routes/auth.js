const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/database');
const router = express.Router();

// User registration
router.post('/register', async (req, res) => {
    try {
        const { name, email, phone, password, insuranceNumber } = req.body;

        // Check if user already exists
        db.get('SELECT id FROM users WHERE email = ? OR phone = ?', [email, phone], async (err, row) => {
            if (err) {
                return res.status(500).json({ 
                    success: false, 
                    message: 'Database error' 
                });
            }

            if (row) {
                return res.status(400).json({ 
                    success: false, 
                    message: 'User already exists with this email or phone' 
                });
            }

            // Hash password
            const hashedPassword = await bcrypt.hash(password, 10);

            // Create user
            const sql = `INSERT INTO users (name, email, phone, password, insuranceNumber) 
                         VALUES (?, ?, ?, ?, ?)`;
            
            db.run(sql, [name, email, phone, hashedPassword, insuranceNumber], function(err) {
                if (err) {
                    return res.status(500).json({ 
                        success: false, 
                        message: 'Failed to create user' 
                    });
                }

                // Generate JWT token
                const token = jwt.sign(
                    { userId: this.lastID, email: email },
                    process.env.JWT_SECRET || 'specicare_secret',
                    { expiresIn: '24h' }
                );

                res.status(201).json({
                    success: true,
                    message: 'User registered successfully',
                    user: {
                        id: this.lastID,
                        name: name,
                        email: email,
                        phone: phone,
                        insuranceNumber: insuranceNumber
                    },
                    token
                });
            });
        });

    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Internal server error' 
        });
    }
});

// User login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find user
        db.get('SELECT * FROM users WHERE email = ?', [email], async (err, user) => {
            if (err) {
                return res.status(500).json({ 
                    success: false, 
                    message: 'Database error' 
                });
            }

            if (!user) {
                return res.status(401).json({ 
                    success: false, 
                    message: 'Invalid email or password' 
                });
            }

            // Check password
            const isValidPassword = await bcrypt.compare(password, user.password);
            if (!isValidPassword) {
                return res.status(401).json({ 
                    success: false, 
                    message: 'Invalid email or password' 
                });
            }

            // Update last login
            db.run('UPDATE users SET lastLogin = ? WHERE id = ?', [new Date().toISOString(), user.id]);

            // Generate JWT token
            const token = jwt.sign(
                { userId: user.id, email: user.email },
                process.env.JWT_SECRET || 'specicare_secret',
                { expiresIn: '24h' }
            );

            res.json({
                success: true,
                message: 'Login successful',
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    phone: user.phone,
                    insuranceNumber: user.insuranceNumber
                },
                token
            });
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Internal server error' 
        });
    }
});

// Get user profile
router.get('/profile', authenticateToken, (req, res) => {
    db.get('SELECT id, name, email, phone, insuranceNumber, createdAt FROM users WHERE id = ?', 
        [req.user.userId], (err, user) => {
        if (err) {
            return res.status(500).json({ 
                success: false, 
                message: 'Database error' 
            });
        }

        if (!user) {
            return res.status(404).json({ 
                success: false, 
                message: 'User not found' 
            });
        }

        res.json({
            success: true,
            user: user
        });
    });
});

// Middleware to authenticate JWT token
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ 
            success: false, 
            message: 'Access token required' 
        });
    }

    jwt.verify(token, process.env.JWT_SECRET || 'specicare_secret', (err, user) => {
        if (err) {
            return res.status(403).json({ 
                success: false, 
                message: 'Invalid or expired token' 
            });
        }
        req.user = user;
        next();
    });
}

module.exports = router;
