import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';

const DashboardSection = () => {
  const { currentUser, appointments, testResults, setActiveSection, logout } = useApp();
  const [activeTab, setActiveTab] = useState('appointments');

  const userAppointments = appointments.filter(apt => apt.patientPhone === currentUser?.phone);
  const userResults = testResults.filter(result => result.patientPhone === currentUser?.phone);

  const renderAppointmentsTab = () => (
    <div id="appointmentsTab" className={`dashboard-tab ${activeTab === 'appointments' ? 'active' : ''}`}>
      <h3>Upcoming Appointments</h3>
      <div className="appointment-list">
        {userAppointments.length === 0 ? (
          <div className="no-appointments">
            <i className="fas fa-calendar-times"></i>
            <h4>No appointments yet</h4>
            <p>Book your first medical test to get started</p>
          </div>
        ) : (
          userAppointments.map(appointment => (
            <div key={appointment.id} className="appointment-item">
              <div className="appointment-header">
                <strong>{appointment.testName}</strong>
                <span className={`status ${appointment.status}`}>
                  {appointment.status}
                </span>
              </div>
              <p><i className="fas fa-hospital"></i> {appointment.hospital}</p>
              <p><i className="fas fa-calendar"></i> {new Date(appointment.appointmentDate).toLocaleDateString()}</p>
              <p><i className="fas fa-money-bill-wave"></i> {appointment.price.toLocaleString()} RWF</p>
              <p className="reference">Reference: {appointment.reference}</p>
            </div>
          ))
        )}
      </div>
      <button className="cta-button" onClick={() => setActiveSection('search')}>
        <i className="fas fa-plus"></i> Book New Test
      </button>
    </div>
  );

  const renderResultsTab = () => (
    <div id="resultsTab" className={`dashboard-tab ${activeTab === 'results' ? 'active' : ''}`}>
      <h3>Test Results</h3>
      <div className="results-list">
        {userResults.length === 0 ? (
          <div className="no-results">
            <i className="fas fa-file-medical"></i>
            <h4>No test results yet</h4>
            <p>Your test results will appear here after your appointments</p>
          </div>
        ) : (
          userResults.map(result => (
            <div key={result.id} className="result-item">
              <div className="result-header">
                <strong>{result.testName}</strong>
                <span className={`status ${result.status}`}>{result.status}</span>
              </div>
              <p><i className="fas fa-hospital"></i> {result.hospital}</p>
              <p><i className="fas fa-calendar"></i> {new Date(result.testDate).toLocaleDateString()}</p>
              <div className="result-actions">
                <button className="book-btn" onClick={() => viewResult(result.id)}>
                  <i className="fas fa-eye"></i> View Results
                </button>
                <button className="secondary-btn" onClick={() => downloadResult(result.id)}>
                  <i className="fas fa-download"></i> Download
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );

  const renderProfileTab = () => (
    <div id="profileTab" className={`dashboard-tab ${activeTab === 'profile' ? 'active' : ''}`}>
      <h3>My Profile</h3>
      <div className="profile-info">
        <div className="profile-item">
          <label>Full Name:</label>
          <span id="profileName">{currentUser?.name || '-'}</span>
        </div>
        <div className="profile-item">
          <label>Phone Number:</label>
          <span id="profilePhone">{currentUser?.phone || '-'}</span>
        </div>
        <div className="profile-item">
          <label>Email:</label>
          <span id="profileEmail">{currentUser?.email || '-'}</span>
        </div>
        <div className="profile-item">
          <label>Insurance Number:</label>
          <span id="profileInsurance">{currentUser?.insuranceNumber || 'Not provided'}</span>
        </div>
      </div>
      <button className="logout-btn" onClick={logout}>
        <i className="fas fa-sign-out-alt"></i> Logout
      </button>
    </div>
  );

  const viewResult = (resultId) => {
    const result = userResults.find(r => r.id === resultId);
    if (result) {
      alert(`Viewing results for: ${result.testName}\nHospital: ${result.hospital}\nDate: ${result.testDate}\n\nIn a real application, this would display the actual test results.`);
    }
  };

  const downloadResult = (resultId) => {
    const result = userResults.find(r => r.id === resultId);
    if (result) {
      alert(`Downloading results for: ${result.testName}\n\nIn a real application, this would download the PDF file.`);
    }
  };

  return (
    <section id="dashboard" className="section active">
      <div className="dashboard-header">
        <h2>My Dashboard</h2>
        <p>Manage your appointments and view test results</p>
      </div>

      <div className="dashboard-actions">
        <button 
          className={`dashboard-btn ${activeTab === 'appointments' ? 'active' : ''}`}
          onClick={() => setActiveTab('appointments')}
        >
          <i className="fas fa-calendar-alt"></i> Appointments
        </button>
        <button 
          className={`dashboard-btn ${activeTab === 'results' ? 'active' : ''}`}
          onClick={() => setActiveTab('results')}
        >
          <i className="fas fa-file-medical-alt"></i> Test Results
        </button>
        <button 
          className={`dashboard-btn ${activeTab === 'profile' ? 'active' : ''}`}
          onClick={() => setActiveTab('profile')}
        >
          <i className="fas fa-user"></i> Profile
        </button>
      </div>

      <div className="dashboard-content">
        {activeTab === 'appointments' && renderAppointmentsTab()}
        {activeTab === 'results' && renderResultsTab()}
        {activeTab === 'profile' && renderProfileTab()}
      </div>
    </section>
  );
};

export default DashboardSection;
