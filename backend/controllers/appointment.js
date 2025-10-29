const { Appointment, MedicalTest, User, Hospital } = require('../models');

exports.getMyAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.findAll({
      where: { patientId: req.user.id },
      include: [
        { model: MedicalTest, as: 'test' },
        { model: Hospital, as: 'hospital' },
        { model: User, as: 'doctor', attributes: ['id', 'name', 'email'] }
      ]
    });
    res.json(appointments);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.createAppointment = async (req, res) => {
  try {
    const { hospitalId, doctorId, testId, date, time, reason } = req.body;
    const newAppointment = await Appointment.create({
      patientId: req.user.id,
      hospitalId,
      doctorId,
      testId,
      date,
      time,
      reason,
      status: 'pending'
    });
    res.status(201).json(newAppointment);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};
