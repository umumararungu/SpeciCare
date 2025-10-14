const express = require('express');
const { query } = require('../config/database');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();

// Get user profile (already in auth, but added for completeness)
router.get('/profile', authenticateToken, async (req, res) => {
    try {
        const result = await query(
            `SELECT id, name, email, phone, insurance_number, date_of_birth, gender,
                    district, sector, cell, village, role, created_at, last_login
             FROM users WHERE id = $1`,
            [req.user.userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        const user = result.rows[0];

        res.json({
            success: true,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                insuranceNumber: user.insurance_number,
                dateOfBirth: user.date_of_birth,
                gender: user.gender,
                district: user.district,
                sector: user.sector,
                cell: user.cell,
                village: user.village,
                role: user.role,
                lastLogin: user.last_login,
                createdAt: user.created_at
            }
        });

    } catch (error) {
        console.error('Get user profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch user profile'
        });
    }
});

// Update user profile
router.put('/profile', authenticateToken, async (req, res) => {
    try {
        const {
            name, dateOfBirth, gender, district, sector, cell, village, insuranceNumber
        } = req.body;

        const result = await query(
            `UPDATE users 
             SET name = $1, date_of_birth = $2, gender = $3, district = $4, 
                 sector = $5, cell = $6, village = $7, insurance_number = $8,
                 updated_at = CURRENT_TIMESTAMP
             WHERE id = $9
             RETURNING id, name, email, phone, insurance_number, date_of_birth, gender,
                       district, sector, cell, village, role, created_at`,
            [name, dateOfBirth, gender, district, sector, cell, village, insuranceNumber, req.user.userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        const user = result.rows[0];

        res.json({
            success: true,
            message: 'Profile updated successfully',
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                insuranceNumber: user.insurance_number,
                dateOfBirth: user.date_of_birth,
                gender: user.gender,
                district: user.district,
                sector: user.sector,
                cell: user.cell,
                village: user.village,
                role: user.role,
                createdAt: user.created_at
            }
        });

    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update profile'
        });
    }
});

module.exports = router;
