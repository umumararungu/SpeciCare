const { Appointment, MedicalTest, User, Hospital } = require("../models");

exports.getMyAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.findAll({
      where: { patient_id: req.user.id },
      include: [
        { model: MedicalTest, as: "medicalTest" },
        { model: Hospital, as: "hospital" },
        { model: User, as: "user", attributes: ["id", "name", "email"] },
      ],
    });
    res.json(appointments);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.createAppointment = async (req, res) => {
  try {
    const { hospital_id, patient_id, test_id, appointmentDate, time_slot } =
      req.body;
    const newAppointment = await Appointment.create({
      patient_id: req.user.id,
      hospital_id: hospital_id,
      test_id,
      appintment_date: appointmentDate,
      time_slot,
      status: "pending",
    });
    res.status(201).json(newAppointment);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
