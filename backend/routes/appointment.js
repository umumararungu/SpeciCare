// routes/appointments.js
const express = require("express");
const { Appointment, User, Hospital, MedicalTest, sequelize} = require("../models");
const { authenticate } = require("../middleware/auth");
const { generateAppointmentReference } = require("../middleware/sequenceGenerator"); // Add this import
const router = express.Router();

// Get user's appointments
router.get("/my", authenticate, async (req, res) => {
  try {
    const appointments = await Appointment.findAll({
      where: { patient_id: req.user.id },
      include: [
        {
          model: Hospital,
          as: "hospital",
          attributes: ["id", "name", "province","district","sector","cell","village","street","latitude","longitude"],
        },
        {
          model: MedicalTest,
          as: "medicalTest",
          attributes: ["id", "name", "category", "price", "duration"],
        },
      ],
      order: [
        ["appointment_date", "DESC"],
        ["time_slot", "DESC"],
      ],
    });

    res.json(appointments);
  } catch (error) {
    console.error("Get appointments error:", error);
    res.status(500).json({
      message: "Error fetching appointments",
      error: error.message,
    });
  }
});

// Create new appointment
router.post("/", authenticate, async (req, res) => {
  const transaction = await sequelize.transaction(); // Add transaction
  
  try {
    const {
      hospital_id,
      test_id,
      appointment_date,
      time_slot,
    } = req.body;

    // Validate required fields
    if (!hospital_id || !test_id || !appointment_date || !time_slot) {
      await transaction.rollback();
      return res.status(400).json({
        message: "Hospital, test, date, and time are required",
      });
    }

    // Generate unique reference
    const reference = await generateAppointmentReference();

    // Create appointment with reference
    const appointment = await Appointment.create({
      reference, // Add reference field
      patient_id: req.user.id,
      hospital_id: hospital_id,
      test_id: test_id,
      appointment_date: appointment_date,
      time_slot: time_slot,
      status: "pending",
      // Add other required fields with defaults
      total_amount: 0, // You'll need to calculate this based on test price
      insurance_covered: 0,
      patient_share: 0,
      patient_name: req.user.name, // Assuming user has name field
      patient_phone: req.user.phone, // Assuming user has phone field
    }, { transaction });

    // Fetch appointment with related data
    const newAppointment = await Appointment.findByPk(appointment.id, {
      include: [
        {
          model: Hospital,
          as: "hospital",
          attributes: ["id", "name", "province","district","sector","cell","village","street","latitude","longitude"],
        },
        {
          model: MedicalTest,
          as: "medicalTest",
          attributes: ["id", "name", "category", "price", "duration"],
        },
      ],
      transaction,
    });

    await transaction.commit(); // Commit transaction
    
    res.status(201).json(newAppointment);
  } catch (error) {
    await transaction.rollback(); // Rollback on error
    console.error("Create appointment error:", error);
    
    // Handle unique constraint violation for reference
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({
        message: "Duplicate reference generated. Please try again.",
        error: error.message,
      });
    }
    
    res.status(500).json({
      message: "Error creating appointment",
      error: error.message,
    });
  }
});

// Get single appointment
router.get("/:id", authenticate, async (req, res) => {
  try {
    const appointment = await Appointment.findOne({
      where: {
        id: req.params.id,
        patient_id: req.user.id,
      },
      include: [
        {
          model: Hospital,
          as: "hospital",
          attributes: ["id", "name", "province","district","sector","cell","village","street","latitude","longitude"],
        },
        {
          model: MedicalTest,
          as: "medicalTest",
          attributes: ["id", "name", "category", "price", "duration"],
        },
      ],
    });

    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    res.json(appointment);
  } catch (error) {
    console.error("Get appointment error:", error);
    res.status(500).json({
      message: "Error fetching appointment",
      error: error.message,
    });
  }
});

// Add new route to get appointment by reference
router.get("/reference/:reference", authenticate, async (req, res) => {
  try {
    const appointment = await Appointment.findOne({
      where: {
        reference: req.params.reference,
        patient_id: req.user.id,
      },
      include: [
        {
          model: Hospital,
          as: "hospital",
          attributes: ["id", "name", "province","district","sector","cell","village","street","latitude","longitude"],
        },
        {
          model: MedicalTest,
          as: "medicalTest",
          attributes: ["id", "name", "category", "price", "duration"],
        },
      ],
    });

    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    res.json(appointment);
  } catch (error) {
    console.error("Get appointment by reference error:", error);
    res.status(500).json({
      message: "Error fetching appointment",
      error: error.message,
    });
  }
});

module.exports = router;