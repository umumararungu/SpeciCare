const express = require('express');
const { query } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Get all medical tests with filtering
router.get('/', async (req, res) => {
    try {
        const { search, category, minPrice, maxPrice, location } = req.query;

        let sql = `
            SELECT mt.*, 
                   COUNT(DISTINCT h.id) as hospital_count,
                   ARRAY_AGG(DISTINCT h.district) as available_locations
            FROM medical_tests mt
            LEFT JOIN hospitals h ON h.is_active = true
            WHERE mt.is_available = true
        `;
        
        const params = [];
        let paramCount = 0;

        if (search) {
            paramCount++;
            sql += ` AND (mt.name ILIKE $${paramCount} OR mt.description ILIKE $${paramCount})`;
            params.push(`%${search}%`);
        }

        if (category) {
            paramCount++;
            sql += ` AND mt.category = $${paramCount}`;
            params.push(category);
        }

        if (minPrice) {
            paramCount++;
            sql += ` AND mt.price >= $${paramCount}`;
            params.push(parseInt(minPrice));
        }

        if (maxPrice) {
            paramCount++;
            sql += ` AND mt.price <= $${paramCount}`;
            params.push(parseInt(maxPrice));
        }

        sql += ` GROUP BY mt.id ORDER BY mt.name`;

        const result = await query(sql, params);

        res.json({
            success: true,
            count: result.rows.length,
            tests: result.rows
        });

    } catch (error) {
        console.error('Get tests error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch medical tests'
        });
    }
});

// Get test by ID
router.get('/:id', async (req, res) => {
    try {
        const testId = parseInt(req.params.id);

        const result = await query(
            `SELECT mt.*, 
                    JSON_AGG(
                        DISTINCT JSONB_BUILD_OBJECT(
                            'id', h.id,
                            'name', h.name,
                            'district', h.district,
                            'price', mt.price
                        )
                    ) as hospitals
             FROM medical_tests mt
             CROSS JOIN hospitals h
             WHERE mt.id = $1 AND h.is_active = true
             GROUP BY mt.id`,
            [testId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Medical test not found'
            });
        }

        res.json({
            success: true,
            test: result.rows[0]
        });

    } catch (error) {
        console.error('Get test by ID error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch medical test'
        });
    }
});

// Get available categories
router.get('/categories/all', async (req, res) => {
    try {
        const result = await query(
            'SELECT DISTINCT category FROM medical_tests WHERE is_available = true ORDER BY category'
        );

        const categories = result.rows.map(row => row.category);

        res.json({
            success: true,
            categories
        });

    } catch (error) {
        console.error('Get categories error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch categories'
        });
    }
});

module.exports = router;
