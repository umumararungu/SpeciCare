// controllers/hospital.js
const { Hospital } = require("../models");

// ✅ Get all hospitals
exports.getAllHospitals = async (req, res) => {
  try {
    const hospitals = await Hospital.findAll({
      where: { is_active: true },
      order: [["name", "ASC"]],
    });

    res.json({ success: true, hospitals });
  } catch (err) {
    console.error("Get hospitals error:", err);
    res.status(500).json({
      message: "Error fetching hospitals",
      error: err.message,
    });
  }
};

// ✅ Get single hospital by ID
exports.getHospitalById = async (req, res) => {
  try {
    const hospital = await Hospital.findByPk(req.params.id);

    if (!hospital) {
      return res.status(404).json({ message: "Hospital not found" });
    }

    res.json({success:true,hospital});
  } catch (err) {
    console.error("Get hospital error:", err);
    res.status(500).json({
      message: "Error fetching hospital",
      error: err.message,
    });
  }
};

// ✅ Create new hospital (Admin only)
exports.createHospital = async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      province,
      district,
      sector,
      cell,
      village,
      street,
      latitute,
      longitude,
      facilities = [],
      registration_number,
      is_active = true,
    } = req.body;

    const newHospital = await Hospital.create({
      name,
      email,
      phone,
      province,
      district,
      sector,
      cell,
      village,
      street,
      latitute,
      longitude,
      facilities,
      registration_number,
      is_active,
    });

    res.status(201).json({
      success: true,
      message: "Hospital created successfully",
      hospital: newHospital,
    });
  } catch (err) {
    console.error("Create hospital error:", err);
    res.status(500).json({
      message: "Error creating hospital",
      error: err.message,
    });
  }
};

// ✅ Update hospital
exports.updateHospital = async (req, res) => {
  try {
    const { id } = req.params;
    const updated_ata = req.body;

    const hospital = await Hospital.findByPk(id);
    if (!hospital) {
      return res.status(404).json({ message: "Hospital not found" });
    }

    await hospital.update(updated_ata);

    res.json({
      success: true,
      message: "Hospital updated successfully",
      hospital,
    });
  } catch (err) {
    console.error("Update hospital error:", err);
    res.status(500).json({
      message: "Error updating hospital",
      error: err.message,
    });
  }
};

// ✅ Delete hospital
exports.deleteHospital = async (req, res) => {
  try {
    const { id } = req.params;
    const hospital = await Hospital.findByPk(id);

    if (!hospital) {
      return res.status(404).json({ message: "Hospital not found" });
    }

    await hospital.destroy();

    res.json({
      success: true,
      message: "Hospital deleted successfully",
    });
  } catch (err) {
    console.error("Delete hospital error:", err);
    res.status(500).json({
      message: "Error deleting hospital",
      error: err.message,
    });
  }
};
