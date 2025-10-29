// routes/appointments.js
const express = require('express');
const { Appointment, User, Hospital, MedicalTest } = require('../models');
const { authenticate } = require('../middleware/auth');
const router = express.Router();

// Get user's appointments
router.get('/my', authenticate, async (req, res) => {
  try {
    const appointments = await Appointment.findAll({
      where: { patientId: req.user.id },
      include: [
        {
          model: Hospital,
          as: 'hospital',
          attributes: ['id', 'name', 'address']
        },
        {
          model: MedicalTest,
          as: 'medicalTest',
          attributes: ['id', 'name', 'category', 'price', 'duration']
        }
      ],
      order: [['date', 'DESC'], ['time', 'DESC']]
    });

    res.json(appointments);
  } catch (error) {
    console.error('Get appointments error:', error);
    res.status(500).json({ 
      message: 'Error fetching appointments',
      error: error.message 
    });
  }
});

// Create new appointment
router.post('/', authenticate, async (req, res) => {
  try {
    const {
      hospitalId,
      testId,
      date,
      time,
      reason,
      type = 'consultation'
    } = req.body;

    // Validate required fields
    if (!hospitalId || !testId || !date || !time) {
      return res.status(400).json({ 
        message: 'Hospital, test, date, and time are required' 
      });
    }

    // Create appointment
    const appointment = await Appointment.create({
      patientId: req.user.id,
      hospitalId,
      testId,
      date,
      time,
      reason,
      type,
      status: 'pending',
      notes: {},
      reminders: [],
      payment_info: {},
      follow_up: {}
    });

    // Fetch appointment with related data
    const newAppointment = await Appointment.findByPk(appointment.id, {
      include: [
        {
          model: Hospital,
          as: 'hospital',
          attributes: ['id', 'name', 'address']
        },
        {
          model: MedicalTest,
          as: 'medicalTest',
          attributes: ['id', 'name', 'category', 'price', 'duration']
        }
      ]
    });

    res.status(201).json(newAppointment);
  } catch (error) {
    console.error('Create appointment error:', error);
    res.status(500).json({ 
      message: 'Error creating appointment',
      error: error.message 
    });
  }
});

// Get single appointment
router.get('/:id', authenticate, async (req, res) => {
  try {
    const appointment = await Appointment.findOne({
      where: { 
        id: req.params.id,
        patientId: req.user.id 
      },
      include: [
        {
          model: Hospital,
          as: 'hospital',
          attributes: ['id', 'name', 'address']
        },
        {
          model: MedicalTest,
          as: 'medicalTest',
          attributes: ['id', 'name', 'category', 'price', 'duration']
        }
      ]
    });

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    res.json(appointment);
  } catch (error) {
    console.error('Get appointment error:', error);
    res.status(500).json({ 
      message: 'Error fetching appointment',
      error: error.message 
    });
  }
});

module.exports = router;
