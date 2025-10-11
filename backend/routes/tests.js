const express = require('express');
const db = require('../config/database');
const router = express.Router();

// Get all tests with filtering
router.get('/', (req, res) => {
    const { search, location, category, minPrice, maxPrice } = req.query;

    let sql = `
        SELECT mt.*, h.name as hospitalName, h.district as location 
        FROM medical_tests mt 
        LEFT JOIN hospitals h ON mt.hospitalId = h.id 
        WHERE mt.isAvailable = 1
    `;
    let params = [];

    if (search) {
        sql += ' AND (mt.name LIKE ? OR mt.description LIKE ?)';
        params.push(`%${search}%`, `%${search}%`);
    }

    if (location) {
        sql += ' AND h.district LIKE ?';
        params.push(`%${location}%`);
    }

    if (category) {
        sql += ' AND mt.category = ?';
        params.push(category);
    }

    if (minPrice) {
        sql += ' AND mt.price >= ?';
        params.push(parseInt(minPrice));
    }

    if (maxPrice) {
        sql += ' AND mt.price <= ?';
        params.push(parseInt(maxPrice));
    }

    sql += ' ORDER BY mt.name';

    db.all(sql, params, (err, rows) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({
                success: false,
                message: 'Failed to fetch tests'
            });
        }

        // If no specific hospital join, get basic test info
        if (rows.length === 0 || !rows[0].hospitalName) {
            db.all('SELECT * FROM medical_tests WHERE isAvailable = 1 ORDER BY name', (err, basicRows) => {
                if (err) {
                    return res.status(500).json({
                        success: false,
                        message: 'Failed to fetch tests'
                    });
                }
                res.json({
                    success: true,
                    count: basicRows.length,
                    tests: basicRows
                });
            });
        } else {
            res.json({
                success: true,
                count: rows.length,
                tests: rows
            });
        }
    });
});

// Get test by ID
router.get('/:id', (req, res) => {
    const testId = parseInt(req.params.id);
    
    db.get('SELECT * FROM medical_tests WHERE id = ?', [testId], (err, test) => {
        if (err) {
            return res.status(500).json({
                success: false,
                message: 'Database error'
            });
        }

        if (!test) {
            return res.status(404).json({
                success: false,
                message: 'Test not found'
            });
        }

        res.json({
            success: true,
            test
        });
    });
});

// Get available categories
router.get('/categories/all', (req, res) => {
    db.all('SELECT DISTINCT category FROM medical_tests WHERE isAvailable = 1 ORDER BY category', (err, rows) => {
        if (err) {
            return res.status(500).json({
                success: false,
                message: 'Database error'
            });
        }

        const categories = rows.map(row => row.category);
        res.json({
            success: true,
            categories
        });
    });
});

module.exports = router;
