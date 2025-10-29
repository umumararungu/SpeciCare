import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';

const AdminSection = () => {
  const { medicalTests, setMedicalTests, appointments, showNotification } = useApp();
  const [activeTab, setActiveTab] = useState('overview');
  const [users, setUsers] = useState([]);
  const [adminActivities, setAdminActivities] = useState([]);
  const [bookingStatusFilter, setBookingStatusFilter] = useState('all');

  // Initialize admin data
  useEffect(() => {
    const storedUsers = JSON.parse(localStorage.getItem('users')) || [];
    const storedActivities = JSON.parse(localStorage.getItem('adminActivities')) || [];
    
    setUsers(storedUsers);
    setAdminActivities(storedActivities);
  }, []);

  // Admin stats
  const totalUsers = users.length;
  const totalBookings = appointments.length;
  const totalTests = medicalTests.length;
  const totalRevenue = appointments.reduce((sum, apt) => sum + apt.price, 0);

  const filteredBookings = bookingStatusFilter === 'all' 
    ? appointments 
    : appointments.filter(apt => apt.status === bookingStatusFilter);

  const recentActivities = [...adminActivities].reverse().slice(0, 5);

  // Add new test function
  const [showAddTestModal, setShowAddTestModal] = useState(false);
  const [newTestData, setNewTestData] = useState({
    name: '',
    category: '',
    hospital: '',
    location: '',
    price: '',
    duration: '',
    description: '',
    available: true,
    insuranceCovered: true
  });

  const handleAddTest = (e) => {
    e.preventDefault();
    
    const newTest = {
      ...newTestData,
      id: Date.now(),
      price: parseInt(newTestData.price)
    };

    const updatedTests = [...medicalTests, newTest];
    setMedicalTests(updatedTests);
    localStorage.setItem('medicalTests', JSON.stringify(updatedTests));

    // Log activity
    const activity = {
      type: 'test',
      message: `Added new test: ${newTest.name}`,
      timestamp: new Date().toISOString(),
      admin: 'System Administrator'
    };
    
    const updatedActivities = [...adminActivities, activity];
    setAdminActivities(updatedActivities);
    localStorage.setItem('adminActivities', JSON.stringify(updatedActivities));

    showNotification(`Test "${newTest.name}" added successfully!`, 'success');
    setShowAddTestModal(false);
    setNewTestData({
      name: '',
      category: '',
      hospital: '',
      location: '',
      price: '',
      duration: '',
      description: '',
      available: true,
      insuranceCovered: true
    });
  };

  const deleteTest = (testId) => {
    if (window.confirm('Are you sure you want to delete this test?')) {
      const updatedTests = medicalTests.filter(test => test.id !== testId);
      setMedicalTests(updatedTests);
      localStorage.setItem('medicalTests', JSON.stringify(updatedTests));
      
      showNotification('Test deleted successfully!', 'success');
    }
  };

  const updateBookingStatus = (bookingId, status) => {
    const updatedAppointments = appointments.map(apt => 
      apt.id === bookingId ? { ...apt, status } : apt
    );
    
    localStorage.setItem('appointments', JSON.stringify(updatedAppointments));
    window.location.reload(); // Simple refresh to update state
    
    showNotification(`Booking ${status} successfully!`, 'success');
  };

  const deleteUser = (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      const updatedUsers = users.filter(user => user.id !== userId);
      setUsers(updatedUsers);
      localStorage.setItem('users', JSON.stringify(updatedUsers));
      
      showNotification('User deleted successfully!', 'success');
    }
  };

  const renderOverviewTab = () => (
    <div id="overviewTab" className="dashboard-tab active">
      <div className="admin-stats">
        <div className="admin-stat-card">
          <div className="stat-icon">
            <i className="fas fa-users"></i>
          </div>
          <div className="stat-info">
            <h3>{totalUsers}</h3>
            <p>Total Users</p>
          </div>
        </div>
        <div className="admin-stat-card">
          <div className="stat-icon">
            <i className="fas fa-calendar-check"></i>
          </div>
          <div className="stat-info">
            <h3>{totalBookings}</h3>
            <p>Total Bookings</p>
          </div>
        </div>
        <div className="admin-stat-card">
          <div className="stat-icon">
            <i className="fas fa-hospital"></i>
          </div>
          <div className="stat-info">
            <h3>{totalTests}</h3>
            <p>Available Tests</p>
          </div>
        </div>
        <div className="admin-stat-card">
          <div className="stat-icon">
            <i className="fas fa-money-bill-wave"></i>
          </div>
          <div className="stat-info">
            <h3>{totalRevenue.toLocaleString()} RWF</h3>
            <p>Total Revenue</p>
          </div>
        </div>
      </div>

      <div className="recent-activities">
        <h3>Recent Activities</h3>
        <div className="activities-list">
          {recentActivities.length === 0 ? (
            <p className="no-activities">No recent activities</p>
          ) : (
            recentActivities.map((activity, index) => (
              <div key={index} className="activity-item">
                <div className="activity-icon">
                  <i className={`fas fa-${getActivityIcon(activity.type)}`}></i>
                </div>
                <div className="activity-content">
                  <p>{activity.message}</p>
                  <span className="activity-time">
                    {new Date(activity.timestamp).toLocaleString()}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );

  const renderUsersTab = () => (
    <div id="usersTab" className="dashboard-tab">
      <div className="tab-header">
        <h3>User Management</h3>
      </div>
      <div className="users-list">
        {users.filter(user => user.email !== 'admin@specicare.com').length === 0 ? (
          <p className="no-users">No users registered</p>
        ) : (
          users.filter(user => user.email !== 'admin@specicare.com').map(user => (
            <div key={user.id} className="user-item">
              <div className="user-info">
                <h4>{user.name}</h4>
                <p>{user.email} • {user.phone}</p>
                <small>Joined: {new Date(user.createdAt).toLocaleDateString()}</small>
              </div>
              <div className="user-actions">
                <button className="danger-btn" onClick={() => deleteUser(user.id)}>
                  <i className="fas fa-trash"></i> Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );

  const renderBookingsTab = () => (
    <div id="bookingsTab" className="dashboard-tab">
      <div className="tab-header">
        <h3>Booking Management</h3>
        <div className="filter-controls">
          <select 
            value={bookingStatusFilter}
            onChange={(e) => setBookingStatusFilter(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="confirmed">Confirmed</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>
      <div className="bookings-list">
        {filteredBookings.length === 0 ? (
          <p className="no-bookings">No bookings found</p>
        ) : (
          filteredBookings.map(booking => (
            <div key={booking.id} className="booking-item">
              <div className="booking-info">
                <h4>{booking.testName}</h4>
                <p><strong>Patient:</strong> {booking.patientName} • {booking.patientPhone}</p>
                <p><strong>Hospital:</strong> {booking.hospital}</p>
                <p><strong>Date:</strong> {new Date(booking.appointmentDate).toLocaleDateString()}</p>
                <p><strong>Price:</strong> {booking.price.toLocaleString()} RWF</p>
                <span className={`status ${booking.status}`}>{booking.status}</span>
              </div>
              <div className="booking-actions">
                <button 
                  className="secondary-btn" 
                  onClick={() => updateBookingStatus(booking.id, 'confirmed')}
                >
                  Confirm
                </button>
                <button 
                  className="warning-btn" 
                  onClick={() => updateBookingStatus(booking.id, 'completed')}
                >
                  Complete
                </button>
                <button 
                  className="danger-btn" 
                  onClick={() => updateBookingStatus(booking.id, 'cancelled')}
                >
                  Cancel
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );

  const renderTestsTab = () => (
    <div id="testsTab" className="dashboard-tab">
      <div className="tab-header">
        <h3>Test Management</h3>
        <button className="cta-button" onClick={() => setShowAddTestModal(true)}>
          <i className="fas fa-plus"></i> Add New Test
        </button>
      </div>
      <div className="tests-list">
        {medicalTests.length === 0 ? (
          <p className="no-tests">No tests available</p>
        ) : (
          medicalTests.map(test => (
            <div key={test.id} className="test-item">
              <div className="test-info">
                <h4>{test.name}</h4>
                <p><strong>Hospital:</strong> {test.hospital} • {test.location}</p>
                <p><strong>Category:</strong> {test.category} • {test.duration}</p>
                <p><strong>Price:</strong> {test.price.toLocaleString()} RWF</p>
                <span className={`status ${test.available ? 'confirmed' : 'cancelled'}`}>
                  {test.available ? 'Available' : 'Unavailable'}
                </span>
              </div>
              <div className="test-actions">
                <button className="danger-btn" onClick={() => deleteTest(test.id)}>
                  <i className="fas fa-trash"></i> Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );

  const getActivityIcon = (type) => {
    const icons = {
      user: 'user-plus',
      booking: 'calendar-check',
      test: 'flask',
      system: 'cog'
    };
    return icons[type] || 'info-circle';
  };

  return (
    <section id="admin" className="section active">
      <div className="dashboard-header">
        <h2>Admin Dashboard</h2>
        <p>Manage platform operations and view analytics</p>
      </div>

      <div className="dashboard-actions">
        <button 
          className={`dashboard-btn ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          <i className="fas fa-chart-bar"></i> Overview
        </button>
        <button 
          className={`dashboard-btn ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          <i className="fas fa-users"></i> Users
        </button>
        <button 
          className={`dashboard-btn ${activeTab === 'bookings' ? 'active' : ''}`}
          onClick={() => setActiveTab('bookings')}
        >
          <i className="fas fa-calendar-alt"></i> Bookings
        </button>
        <button 
          className={`dashboard-btn ${activeTab === 'tests' ? 'active' : ''}`}
          onClick={() => setActiveTab('tests')}
        >
          <i className="fas fa-flask"></i> Tests
        </button>
      </div>

      <div className="dashboard-content">
        {activeTab === 'overview' && renderOverviewTab()}
        {activeTab === 'users' && renderUsersTab()}
        {activeTab === 'bookings' && renderBookingsTab()}
        {activeTab === 'tests' && renderTestsTab()}
      </div>

      {/* Add Test Modal */}
      {showAddTestModal && (
        <div id="addTestModal" className="modal" style={{ display: 'block' }}>
          <div className="modal-content">
            <span className="close" onClick={() => setShowAddTestModal(false)}>&times;</span>
            <h2>Add New Medical Test</h2>
            <form onSubmit={handleAddTest}>
              <div className="form-group">
                <label htmlFor="testName">Test Name *</label>
                <input 
                  type="text" 
                  id="testName" 
                  required 
                  value={newTestData.name}
                  onChange={(e) => setNewTestData({...newTestData, name: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label htmlFor="testCategory">Category *</label>
                <select 
                  id="testCategory" 
                  required
                  value={newTestData.category}
                  onChange={(e) => setNewTestData({...newTestData, category: e.target.value})}
                >
                  <option value="">Select Category</option>
                  <option value="radiology">Radiology</option>
                  <option value="laboratory">Laboratory</option>
                  <option value="cardiology">Cardiology</option>
                  <option value="neurology">Neurology</option>
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="testHospital">Hospital *</label>
                <input 
                  type="text" 
                  id="testHospital" 
                  required 
                  value={newTestData.hospital}
                  onChange={(e) => setNewTestData({...newTestData, hospital: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label htmlFor="testLocation">Location *</label>
                <input 
                  type="text" 
                  id="testLocation" 
                  required 
                  value={newTestData.location}
                  onChange={(e) => setNewTestData({...newTestData, location: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label htmlFor="testPrice">Price (RWF) *</label>
                <input 
                  type="number" 
                  id="testPrice" 
                  required 
                  value={newTestData.price}
                  onChange={(e) => setNewTestData({...newTestData, price: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label htmlFor="testDuration">Duration *</label>
                <input 
                  type="text" 
                  id="testDuration" 
                  required 
                  placeholder="e.g., 30 minutes"
                  value={newTestData.duration}
                  onChange={(e) => setNewTestData({...newTestData, duration: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label htmlFor="testDescription">Description *</label>
                <textarea 
                  id="testDescription" 
                  required
                  value={newTestData.description}
                  onChange={(e) => setNewTestData({...newTestData, description: e.target.value})}
                ></textarea>
              </div>
              <div className="form-group">
                <label>
                  <input 
                    type="checkbox" 
                    checked={newTestData.available}
                    onChange={(e) => setNewTestData({...newTestData, available: e.target.checked})}
                  /> Available
                </label>
                <label>
                  <input 
                    type="checkbox" 
                    checked={newTestData.insuranceCovered}
                    onChange={(e) => setNewTestData({...newTestData, insuranceCovered: e.target.checked})}
                  /> Insurance Covered
                </label>
              </div>
              <button type="submit" className="submit-btn">Add Test</button>
            </form>
          </div>
        </div>
      )}
    </section>
  );
};

export default AdminSection;
