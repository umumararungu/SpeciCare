import React, { useState } from "react";
import { useApp } from "../../context/AppContext";

const DashboardSection = () => {
  const { currentUser, appointments, testResults, setActiveSection, logout } =
    useApp();
  const [activeTab, setActiveTab] = useState("appointments");


  // Server returns only the current user's results at GET /test-results/my,
  // but be defensive and filter by patient_id when available.
  const userResults = (testResults || []).filter(
    (result) => !result.patient_id || result.patient_id === currentUser?.id
  );

  const renderAppointmentsTab = () => (
    <div
      id="appointmentsTab"
      className={`dashboard-tab ${
        activeTab === "appointments" ? "active" : ""
      }`}
    >
      <h3>Upcoming Appointments</h3>
      <div className="appointment-list">
        {appointments.length === 0 ? (
          <div className="no-appointments">
            <i className="fas fa-calendar-times"></i>
            <h4>No appointments yet</h4>
            <p>Book your first medical test to get started</p>
          </div>
        ) : (
          appointments.map((appointment) => (
            <div key={appointment.id} className="appointment-item">
              <div className="appointment-header">
                <strong>{appointment.medicalTest.name}</strong>
                <span className={`status ${appointment.status}`}>
                  {appointment.status}
                </span>
              </div>
              <p>
                <i className="fas fa-hospital"></i> {appointment.hospital.name}
              </p>
              <p>
                <i className="fas fa-calendar"></i>{" "}
                {new Date(appointment.date).toLocaleDateString()}
              </p>
              <p>
                <i className="fas fa-money-bill-wave"></i>{" "}
                {appointment.medicalTest.price.toLocaleString()} RWF
              </p>
              <p className="reference">Reference: {appointment.reference}</p>
            </div>
          ))
        )}
      </div>
      <button className="cta-button" onClick={() => setActiveSection("search")}>
        <i className="fas fa-plus"></i> Book New Test
      </button>
    </div>
  );

  const renderResultsTab = () => (
    <div
      id="resultsTab"
      className={`dashboard-tab ${activeTab === "results" ? "active" : ""}`}
    >
      <h3>Test Results</h3>
      <div className="results-list">
        {userResults.length === 0 ? (
          <div className="no-results">
            <i className="fas fa-file-medical"></i>
            <h4>No test results yet</h4>
            <p>Your test results will appear here after your appointments</p>
          </div>
        ) : (
          userResults.map((result) => {
            const testName = result.medicalTest?.name || result.testName || 'Test';
            const hospitalName = result.hospital?.name || result.hospitalName || 'Hospital';
            const apptDate = result.appointment?.appointment_date || result.testDate || result.created_at || null;
            const files = result.files || [];
            return (
              <div key={result.id} className="result-item">
                <div className="result-header">
                  <strong>{testName}</strong>
                  <span className={`status ${result.status}`}>
                    {result.status}
                  </span>
                </div>
                <p>
                  <i className="fas fa-hospital"></i> {hospitalName}
                </p>
                <p>
                  <i className="fas fa-calendar"></i>{" "}
                  {apptDate ? new Date(apptDate).toLocaleDateString() : 'N/A'}
                </p>
                {files.length > 0 && (
                  <p>
                    <i className="fas fa-paperclip"></i> {files.length} file{files.length>1? 's':''}
                  </p>
                )}
                <div className="result-actions">
                  <button
                    className="book-btn"
                    onClick={() => viewResult(result)}
                  >
                    <i className="fas fa-eye"></i> View Results
                  </button>
                  <button
                    className="secondary-btn"
                    onClick={() => downloadResult(result)}
                  >
                    <i className="fas fa-download"></i> Download
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );

  const renderProfileTab = () => (
    <div
      id="profileTab"
      className={`dashboard-tab ${activeTab === "profile" ? "active" : ""}`}
    >
      <h3>My Profile</h3>
      <div className="profile-info">
        <div className="profile-item">
          <label>Full Name:</label>
          <span id="profileName">{currentUser?.name || "-"}</span>
        </div>
        <div className="profile-item">
          <label>Phone Number:</label>
          <span id="profilePhone">{currentUser?.phone || "-"}</span>
        </div>
        <div className="profile-item">
          <label>Email:</label>
          <span id="profileEmail">{currentUser?.email || "-"}</span>
        </div>
        <div className="profile-item">
          <label>Insurance Number:</label>
          <span id="profileInsurance">
            {currentUser?.insuranceNumber || "Not provided"}
          </span>
        </div>
      </div>
      <button className="logout-btn" onClick={logout}>
        <i className="fas fa-sign-out-alt"></i> Logout
      </button>
    </div>
  );

  const viewResult = (result) => {
    // If there are files, open the first file in a new tab. Otherwise show details.
    const files = result.files || [];
    if (files.length > 0 && files[0].url) {
      window.open(files[0].url, '_blank');
      return;
    }
    // Otherwise show a compact details dialog
    const testName = result.medicalTest?.name || result.testName || 'Test';
    const hospitalName = result.hospital?.name || result.hospitalName || 'Hospital';
    const apptDate = result.appointment?.appointment_date || result.testDate || result.created_at || 'N/A';
    const numeric = result.numeric_results ? JSON.stringify(result.numeric_results) : 'N/A';
    const text = result.text_results ? JSON.stringify(result.text_results) : result.text_findings || 'N/A';
    alert(`Result: ${testName}\nHospital: ${hospitalName}\nDate: ${apptDate}\n\nNumeric: ${numeric}\nText: ${text}`);
  };

  const downloadResult = (result) => {
    const files = result.files || [];
    if (files.length === 0) {
      alert('No attached files to download for this result.');
      return;
    }
    // Open each file url in a new tab (browser will handle download or display)
    files.forEach((f) => {
      if (f.url) {
        window.open(f.url, '_blank');
      }
    });
  };

  return (
    <section id="dashboard" className="section active">
      <div className="dashboard-header">
        <h2>My Dashboard</h2>
        <p>Manage your appointments and view test results</p>
      </div>

      <div className="dashboard-actions">
        <button
          className={`dashboard-btn ${
            activeTab === "appointments" ? "active" : ""
          }`}
          onClick={() => setActiveTab("appointments")}
        >
          <i className="fas fa-calendar-alt"></i> Appointments
        </button>
        <button
          className={`dashboard-btn ${activeTab === "results" ? "active" : ""}`}
          onClick={() => setActiveTab("results")}
        >
          <i className="fas fa-file-medical-alt"></i> Test Results
        </button>
        <button
          className={`dashboard-btn ${activeTab === "profile" ? "active" : ""}`}
          onClick={() => setActiveTab("profile")}
        >
          <i className="fas fa-user"></i> Profile
        </button>
      </div>

      <div className="dashboard-content">
        {activeTab === "appointments" && renderAppointmentsTab()}
        {activeTab === "results" && renderResultsTab()}
        {activeTab === "profile" && renderProfileTab()}
      </div>
    </section>
  );
};

export default DashboardSection;
