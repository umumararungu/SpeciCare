const express = require('express');
const { query } = require('../config/database');

const router = express.Router();

// Get all hospitals
router.get('/', async (req, res) => {
    try {
        const { district, type, hasTest } = req.query;

        let sql = `
            SELECT h.*, 
                   COUNT(DISTINCT mt.id) as available_tests_count,
                   ARRAY_AGG(DISTINCT mt.category) as test_categories
            FROM hospitals h
            LEFT JOIN medical_tests mt ON mt.is_available = true
            WHERE h.is_active = true
        `;
        
        const params = [];
        let paramCount = 0;

        if (district) {
            paramCount++;
            sql += ` AND h.district ILIKE $${paramCount}`;
            params.push(`%${district}%`);
        }

        if (type) {
            paramCount++;
            sql += ` AND h.type = $${paramCount}`;
            params.push(type);
        }

        sql += ` GROUP BY h.id ORDER BY h.name`;

        const result = await query(sql, params);

        res.json({
            success: true,
            count: result.rows.length,
            hospitals: result.rows
        });

    } catch (error) {
        console.error('Get hospitals error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch hospitals'
        });
    }
});

// Get hospital by ID
router.get('/:id', async (req, res) => {
    try {
        const hospitalId = parseInt(req.params.id);

        const result = await query(
            `SELECT h.*, 
                    JSON_AGG(
                        DISTINCT JSONB_BUILD_OBJECT(
                            'id', mt.id,
                            'name', mt.name,
                            'category', mt.category,
                            'price', mt.price,
                            'duration', mt.duration
                        )
                    ) as available_tests
             FROM hospitals h
             CROSS JOIN medical_tests mt
             WHERE h.id = $1 AND mt.is_available = true
             GROUP BY h.id`,
            [hospitalId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Hospital not found'
            });
        }

        res.json({
            success: true,
            hospital: result.rows[0]
        });

    } catch (error) {
        console.error('Get hospital error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch hospital'
        });
    }
});

module.exports = router;
