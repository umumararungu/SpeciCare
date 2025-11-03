import React, { useState, useEffect } from "react";
import { useApp } from "../../context/AppContext";

const BookingModal = () => {
  const { currentTest, confirmBooking, setCurrentTest, currentUser,hospitals } = useApp();
  const [bookingData, setBookingData] = useState({
    patientName: "",
    patientPhone: "",
    patientEmail: "",
    insuranceNumber: "",
    appointment_date: "",
    time_slot: "",
  });

  // Reset form when modal opens/closes or user changes
  useEffect(() => {
    if (currentTest && currentUser) {
      setBookingData({
        patientName: currentUser?.name || "",
        patientPhone: currentUser?.phone || "",
        patientEmail: currentUser?.email || "",
        insuranceNumber: currentUser?.insuranceNumber || "",
        appointment_date: "",
        time_slot: "",

      });
    }
  }, [currentTest, currentUser]);

  // Close modal when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      const modal = document.getElementById("bookingModal");
      if (event.target === modal) {
        setCurrentTest(null);
      }
    };

    if (currentTest) {
      document.addEventListener("click", handleClickOutside);
      document.body.classList.add("modal-open");
    } else {
      document.body.classList.remove("modal-open");
    }

    return () => {
      document.removeEventListener("click", handleClickOutside);
      document.body.classList.remove("modal-open");
    };
  }, [currentTest, setCurrentTest]);

  // Close modal with escape key
  useEffect(() => {
    const handleEscapeKey = (event) => {
      if (event.key === "Escape" && currentTest) {
        setCurrentTest(null);
      }
    };

    document.addEventListener("keydown", handleEscapeKey);
    return () => {
      document.removeEventListener("keydown", handleEscapeKey);
    };
  }, [currentTest, setCurrentTest]);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!bookingData.appointment_date) {
      alert("Please select an appointment date");
      return;
    }

    if (!bookingData.patientName || !bookingData.patientPhone) {
      alert("Please fill in all required fields");
      return;
    }

    const completeBookingData = {
      ...bookingData,
      testId: currentTest.id,
      testName: currentTest.name,
      hospitalId: currentTest.hospital_id,
      price: currentTest.price,
    };

    confirmBooking(completeBookingData);
    setCurrentTest(null); // Close modal after booking
  };

  const handleChange = (field, value) => {
    setBookingData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Don't render if no test is selected
  if (!currentTest) {
    return null;
  }

  const today = new Date().toISOString().split("T")[0];

  const hospital = hospitals.find(
        (hospital) => currentTest.hospital_id === hospital.id
      );

  return (
    <div id="bookingModal" className="modal" style={{ display: "block" }}>
      <div className="modal-content show">
        <span
          className="close"
          onClick={() => setCurrentTest(null)}
          style={{ cursor: "pointer" }}
        >
          &times;
        </span>
        <h2>Book Your Test</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Test Type</label>
            <input type="text" value={currentTest.name} readOnly />
          </div>
          <div className="form-group">
            <label>Hospital</label>
            <input type="text" value={hospital.name} readOnly />
          </div>
          <div className="form-group">
            <label>Price</label>
            <input
              type="text"
              value={`${currentTest.price.toLocaleString()} RWF`}
              readOnly
            />
          </div>
          <div className="form-group">
            <label>Full Name *</label>
            <input
              type="text"
              value={bookingData.patientName}
              onChange={(e) => handleChange("patientName", e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>Phone Number *</label>
            <input
              type="tel"
              value={bookingData.patientPhone}
              onChange={(e) => handleChange("patientPhone", e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>Email Address</label>
            <input
              type="email"
              value={bookingData.patientEmail}
              onChange={(e) => handleChange("patientEmail", e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>Insurance Number (CBHI)</label>
            <input
              type="text"
              value={bookingData.insuranceNumber}
              onChange={(e) => handleChange("insuranceNumber", e.target.value)}
              placeholder="Enter if applicable"
            />
          </div>
          <div className="form-group">
            <label>Preferred Date *</label>
            <input
              type="date"
              value={bookingData.appointment_date}
              onChange={(e) => handleChange("appointment_date", e.target.value)}
              min={today}
              required
            />
          </div>

                    <div className="form-group">
            <label>Preferred time*</label>
            <input
              type="time"
              value={bookingData.time_slot}
              onChange={(e) => handleChange("time_slot", e.target.value)}
              min={today}
              required
            />
          </div>

          <button type="submit" className="submit-btn">
            Confirm Booking
          </button>
        </form>
      </div>
    </div>
  );
};

export default BookingModal;
