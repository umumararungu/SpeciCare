// routes/testResults.js
const express = require('express');
const { TestResult, Appointment, User, Hospital, MedicalTest } = require('../models');
const { authenticate } = require('../middleware/auth');
const router = express.Router();

// Get user's test results
router.get('/my', authenticate, async (req, res) => {
  try {
    const testResults = await TestResult.findAll({
      where: { patientId: req.user.id },
      include: [
        {
          model: Appointment,
          as: 'appointment',
          attributes: ['id', 'date', 'time', 'type']
        },
        {
          model: Hospital,
          as: 'hospital',
          attributes: ['id', 'name']
        },
        {
          model: MedicalTest,
          as: 'medicalTest',
          attributes: ['id', 'name', 'category']
        }
      ],
      order: [['created_at', 'DESC']]
    });

    res.json(testResults);
  } catch (error) {
    console.error('Get test results error:', error);
    res.status(500).json({ 
      message: 'Error fetching test results',
      error: error.message 
    });
  }
});

// Get single test result
router.get('/:id', authenticate, async (req, res) => {
  try {
    const testResult = await TestResult.findOne({
      where: { 
        id: req.params.id,
        patientId: req.user.id 
      },
      include: [
        {
          model: Appointment,
          as: 'appointment',
          include: [
            {
              model: Hospital,
              as: 'hospital',
              attributes: ['id', 'name', "province","district","sector","cell","village","street","latitude","longitude"]
            }
          ]
        },
        {
          model: MedicalTest,
          as: 'medicalTest',
          attributes: ['id', 'name', 'category', 'description']
        }
      ]
    });

    if (!testResult) {
      return res.status(404).json({ message: 'Test result not found' });
    }

    res.json(testResult);
  } catch (error) {
    console.error('Get test result error:', error);
    res.status(500).json({ 
      message: 'Error fetching test result',
      error: error.message 
    });
  }
});

module.exports = router;
