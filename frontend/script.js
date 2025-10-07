// Global variables
let currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;
let appointments = JSON.parse(localStorage.getItem('appointments')) || [];
let testResults = JSON.parse(localStorage.getItem('testResults')) || [];
let currentTest = null;

// Sample medical tests data
const medicalTests = [
    {
        id: 1,
        name: 'MRI Scan',
        category: 'radiology',
        hospital: 'Kigali Central Hospital',
        location: 'Kigali',
        price: 85000,
        duration: '45 minutes',
        description: 'Magnetic Resonance Imaging for detailed internal body scans',
        available: true,
        insuranceCovered: true
    },
    {
        id: 2,
        name: 'CT Scan',
        category: 'radiology',
        hospital: 'King Faisal Hospital',
        location: 'Kigali',
        price: 75000,
        duration: '30 minutes',
        description: 'Computed Tomography scan for cross-sectional body images',
        available: true,
        insuranceCovered: true
    },
    {
        id: 3,
        name: 'Blood Test (Full Panel)',
        category: 'laboratory',
        hospital: 'Bugesera District Hospital',
        location: 'Bugesera',
        price: 15000,
        duration: '15 minutes',
        description: 'Complete blood count and comprehensive metabolic panel',
        available: true,
        insuranceCovered: true
    },
    {
        id: 4,
        name: 'X-Ray Chest',
        category: 'radiology',
        hospital: 'Muhanga District Hospital',
        location: 'Muhanga',
        price: 20000,
        duration: '20 minutes',
        description: 'Chest X-ray for lung and heart examination',
        available: true,
        insuranceCovered: true
    },
    {
        id: 5,
        name: 'Ultrasound Abdomen',
        category: 'radiology',
        hospital: 'Kigali Central Hospital',
        location: 'Kigali',
        price: 35000,
        duration: '30 minutes',
        description: 'Abdominal ultrasound for organ examination',
        available: true,
        insuranceCovered: true
    },
    {
        id: 6,
        name: 'ECG (Electrocardiogram)',
        category: 'cardiology',
        hospital: 'King Faisal Hospital',
        location: 'Kigali',
        price: 25000,
        duration: '20 minutes',
        description: 'Heart electrical activity monitoring',
        available: true,
        insuranceCovered: true
    },
    {
        id: 7,
        name: 'EEG (Electroencephalogram)',
        category: 'neurology',
        hospital: 'Kigali Central Hospital',
        location: 'Kigali',
        price: 60000,
        duration: '60 minutes',
        description: 'Brain electrical activity monitoring',
        available: true,
        insuranceCovered: true
    }
];

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    setupEventListeners();
    checkAuthentication();
});

function initializeApp() {
    // Set minimum date for booking to today
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('appointmentDate').min = today;
    
    // Load sample data if not exists
    if (!localStorage.getItem('sampleDataInitialized')) {
        initializeSampleData();
    }
    
    // Render initial test data
    renderTestCards(medicalTests);
}

function setupEventListeners() {
    // Mobile menu
    document.querySelector('.mobile-menu-btn').addEventListener('click', toggleMobileMenu);
    
    // Form submissions
    document.getElementById('loginForm').addEventListener('submit', handleLogin);
    document.getElementById('registerForm').addEventListener('submit', handleRegister);
    document.getElementById('bookingForm').addEventListener('submit', handleBooking);
    
    // Navigation
    document.querySelectorAll('.nav-link, .mobile-nav-link').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const sectionId = this.getAttribute('href').substring(1);
            showSection(sectionId);
            
            // Close mobile menu if open
            document.querySelector('.mobile-menu').classList.remove('active');
        });
    });
}

function checkAuthentication() {
    if (currentUser) {
        updateUserInterface();
        showSection('dashboard');
    } else {
        showSection('home');
    }
}

// Navigation functions
function showSection(sectionId) {
    // Hide all sections
    document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active');
    });
    
    // Show selected section
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
        targetSection.classList.add('active');
        
        // Update navigation highlights
        document.querySelectorAll('.nav-link, .mobile-nav-link').forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${sectionId}`) {
                link.classList.add('active');
            }
        });
        
        // Load section-specific data
        if (sectionId === 'dashboard') {
            updateDashboard();
        } else if (sectionId === 'search') {
            searchTests();
        }
    }
}

function toggleMobileMenu() {
    document.querySelector('.mobile-menu').classList.toggle('active');
}

// Authentication functions
function handleLogin(event) {
    event.preventDefault();
    
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    
    showLoading(true);
    
    // Simulate API call
    setTimeout(() => {
        const users = JSON.parse(localStorage.getItem('users')) || [];
        const user = users.find(u => u.email === email && u.password === password);
        
        if (user) {
            currentUser = { ...user };
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
            updateUserInterface();
            showSection('dashboard');
            showNotification('Login successful!', 'success');
        } else {
            showNotification('Invalid email or password', 'error');
        }
        
        showLoading(false);
    }, 1000);
}

function handleRegister(event) {
    event.preventDefault();
    
    const name = document.getElementById('registerName').value;
    const email = document.getElementById('registerEmail').value;
    const phone = document.getElementById('registerPhone').value;
    const insurance = document.getElementById('registerInsurance').value;
    const password = document.getElementById('registerPassword').value;
    const confirmPassword = document.getElementById('registerConfirmPassword').value;
    
    if (password !== confirmPassword) {
        showNotification('Passwords do not match', 'error');
        return;
    }
    
    showLoading(true);
    
    // Simulate API call
    setTimeout(() => {
        const users = JSON.parse(localStorage.getItem('users')) || [];
        
        // Check if user already exists
        if (users.find(u => u.email === email)) {
            showNotification('User with this email already exists', 'error');
            showLoading(false);
            return;
        }
        
        // Create new user
        const newUser = {
            id: Date.now(),
            name,
            email,
            phone,
            insuranceNumber: insurance,
            password, // In real app, hash this password
            createdAt: new Date().toISOString()
        };
        
        users.push(newUser);
        localStorage.setItem('users', JSON.stringify(users));
        
        currentUser = { ...newUser };
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        
        updateUserInterface();
        showSection('dashboard');
        showNotification('Account created successfully!', 'success');
        showLoading(false);
    }, 1000);
}

function logout() {
    currentUser = null;
    localStorage.removeItem('currentUser');
    updateUserInterface();
    showSection('home');
    showNotification('Logged out successfully', 'success');
}

function updateUserInterface() {
    const loginBtn = document.querySelector('.login-btn');
    const mobileLoginBtn = document.querySelector('.mobile-nav-link.login-btn');
    
    if (currentUser) {
        loginBtn.textContent = 'Dashboard';
        loginBtn.href = '#dashboard';
        if (mobileLoginBtn) {
            mobileLoginBtn.textContent = 'Dashboard';
            mobileLoginBtn.href = '#dashboard';
        }
        
        // Update profile information
        if (document.getElementById('profileName')) {
            document.getElementById('profileName').textContent = currentUser.name;
            document.getElementById('profilePhone').textContent = currentUser.phone;
            document.getElementById('profileEmail').textContent = currentUser.email;
            document.getElementById('profileInsurance').textContent = currentUser.insuranceNumber || 'Not provided';
        }
    } else {
        loginBtn.textContent = 'Login';
        loginBtn.href = '#login';
        if (mobileLoginBtn) {
            mobileLoginBtn.textContent = 'Login';
            mobileLoginBtn.href = '#login';
        }
    }
}

// Search and booking functions
function searchTests() {
    const searchTerm = document.getElementById('testSearch').value.toLowerCase();
    const locationFilter = document.getElementById('locationFilter').value;
    const priceFilter = document.getElementById('priceFilter').value;
    const categoryFilter = document.getElementById('categoryFilter').value;
    
    let filteredTests = medicalTests.filter(test => {
        const matchesSearch = test.name.toLowerCase().includes(searchTerm) || 
                            test.description.toLowerCase().includes(searchTerm) ||
                            searchTerm === '';
        const matchesLocation = test.location.toLowerCase().includes(locationFilter) || locationFilter === '';
        const matchesCategory = test.category === categoryFilter || categoryFilter === '';
        
        let matchesPrice = true;
        if (priceFilter === '0-10000') {
            matchesPrice = test.price <= 10000;
        } else if (priceFilter === '10000-50000') {
            matchesPrice = test.price >= 10000 && test.price <= 50000;
        } else if (priceFilter === '50000-100000') {
            matchesPrice = test.price >= 50000 && test.price <= 100000;
        } else if (priceFilter === '100000+') {
            matchesPrice = test.price > 100000;
        }
        
        return matchesSearch && matchesLocation && matchesPrice && matchesCategory;
    });
    
    renderTestCards(filteredTests);
}

function renderTestCards(tests) {
    const container = document.getElementById('resultsContainer');
    
    if (tests.length === 0) {
        container.innerHTML = `
            <div class="no-results">
                <i class="fas fa-search"></i>
                <h3>No tests found</h3>
                <p>Try adjusting your search criteria</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = tests.map(test => `
        <div class="test-card">
            <div class="test-info">
                <h3>${test.name}</h3>
                <p class="hospital">${test.hospital}</p>
                <p class="location">
                    <i class="fas fa-map-marker-alt"></i> ${test.location} • ${test.category}
                </p>
                <p class="description">${test.description}</p>
                <p class="price">${test.price.toLocaleString()} RWF</p>
            </div>
            <button class="book-btn" onclick="bookTest(${test.id})">
                <i class="fas fa-calendar-plus"></i> Book Now
            </button>
        </div>
    `).join('');
}

function bookTest(testId) {
    if (!currentUser) {
        showNotification('Please login to book a test', 'error');
        showSection('login');
        return;
    }
    
    const test = medicalTests.find(t => t.id === testId);
    if (!test) return;
    
    currentTest = test;
    
    document.getElementById('bookingTest').value = test.name;
    document.getElementById('bookingHospital').value = test.hospital;
    document.getElementById('bookingPrice').value = `${test.price.toLocaleString()} RWF`;
    document.getElementById('patientName').value = currentUser.name;
    document.getElementById('patientPhone').value = currentUser.phone;
    document.getElementById('patientEmail').value = currentUser.email;
    document.getElementById('insuranceNumber').value = currentUser.insuranceNumber || '';
    
    document.getElementById('bookingModal').style.display = 'block';
}

function closeBooking() {
    document.getElementById('bookingModal').style.display = 'none';
    document.getElementById('bookingForm').reset();
    currentTest = null;
}

function handleBooking(event) {
    event.preventDefault();
    
    if (!currentUser || !currentTest) return;
    
    const formData = {
        id: Date.now(),
        testId: currentTest.id,
        testName: currentTest.name,
        hospital: currentTest.hospital,
        price: currentTest.price,
        patientName: document.getElementById('patientName').value,
        patientPhone: document.getElementById('patientPhone').value,
        patientEmail: document.getElementById('patientEmail').value,
        insuranceNumber: document.getElementById('insuranceNumber').value,
        appointmentDate: document.getElementById('appointmentDate').value,
        notes: document.getElementById('bookingNotes').value,
        status: 'confirmed',
        bookingDate: new Date().toISOString(),
        reference: `SC${Date.now()}`
    };
    
    appointments.push(formData);
    localStorage.setItem('appointments', JSON.stringify(appointments));
    
    // Simulate SMS notification
    simulateSMSNotification(formData.patientPhone, formData);
    
    showNotification('Booking confirmed! You will receive an SMS confirmation shortly.', 'success');
    closeBooking();
    updateDashboard();
    showSection('dashboard');
}

// Dashboard functions
function updateDashboard() {
    updateAppointmentList();
    updateResultsList();
    updateProfileInfo();
}

function showDashboardTab(tabName) {
    // Hide all tabs
    document.querySelectorAll('.dashboard-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Remove active class from all buttons
    document.querySelectorAll('.dashboard-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Show selected tab
    document.getElementById(`${tabName}Tab`).classList.add('active');
    
    // Activate selected button
    event.target.classList.add('active');
}

function updateAppointmentList() {
    const appointmentList = document.getElementById('appointmentList');
    const userAppointments = appointments.filter(apt => apt.patientPhone === currentUser?.phone);
    
    if (userAppointments.length === 0) {
        appointmentList.innerHTML = `
            <div class="no-appointments">
                <i class="fas fa-calendar-times"></i>
                <h4>No appointments yet</h4>
                <p>Book your first medical test to get started</p>
            </div>
        `;
        return;
    }
    
    appointmentList.innerHTML = userAppointments.map(appointment => `
        <div class="appointment-item">
            <div class="appointment-header">
                <strong>${appointment.testName}</strong>
                <span class="status ${appointment.status}">${appointment.status}</span>
            </div>
            <p><i class="fas fa-hospital"></i> ${appointment.hospital}</p>
            <p><i class="fas fa-calendar"></i> ${new Date(appointment.appointmentDate).toLocaleDateString()}</p>
            <p><i class="fas fa-money-bill-wave"></i> ${appointment.price.toLocaleString()} RWF</p>
            <p class="reference">Reference: ${appointment.reference}</p>
        </div>
    `).join('');
}

function updateResultsList() {
    const resultsList = document.getElementById('resultsList');
    const userResults = testResults.filter(result => result.patientPhone === currentUser?.phone);
    
    if (userResults.length === 0) {
        resultsList.innerHTML = `
            <div class="no-results">
                <i class="fas fa-file-medical"></i>
                <h4>No test results yet</h4>
                <p>Your test results will appear here after your appointments</p>
            </div>
        `;
        return;
    }
    
    resultsList.innerHTML = userResults.map(result => `
        <div class="result-item">
            <div class="result-header">
                <strong>${result.testName}</strong>
                <span class="status ${result.status}">${result.status}</span>
            </div>
            <p><i class="fas fa-hospital"></i> ${result.hospital}</p>
            <p><i class="fas fa-calendar"></i> ${new Date(result.testDate).toLocaleDateString()}</p>
            <div class="result-actions">
                <button class="book-btn" onclick="viewResult(${result.id})">
                    <i class="fas fa-eye"></i> View Results
                </button>
                <button class="secondary-btn" onclick="downloadResult(${result.id})">
                    <i class="fas fa-download"></i> Download
                </button>
            </div>
        </div>
    `).join('');
}

function updateProfileInfo() {
    if (!currentUser) return;
    
    document.getElementById('profileName').textContent = currentUser.name;
    document.getElementById('profilePhone').textContent = currentUser.phone;
    document.getElementById('profileEmail').textContent = currentUser.email;
    document.getElementById('profileInsurance').textContent = currentUser.insuranceNumber || 'Not provided';
}

// Login/Register form toggling
function showRegisterForm() {
    document.getElementById('registerCard').style.display = 'block';
    document.querySelector('.login-card').style.display = 'none';
}

function showLoginForm() {
    document.getElementById('registerCard').style.display = 'none';
    document.querySelector('.login-card').style.display = 'block';
}

// Utility functions
function simulateSMSNotification(phone, appointment) {
    console.log(`SMS sent to ${phone}:`);
    console.log(`SpeciCare: Your ${appointment.testName} is booked at ${appointment.hospital} on ${appointment.appointmentDate}. Booking Ref: ${appointment.reference}.`);
}

function showLoading(show) {
    document.getElementById('loadingSpinner').style.display = show ? 'flex' : 'none';
}

function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check' : type === 'error' ? 'exclamation-triangle' : 'info'}"></i>
        <span>${message}</span>
    `;
    
    // Add styles for notification
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: ${type === 'success' ? 'var(--success)' : type === 'error' ? 'var(--error)' : 'var(--teal)'};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 5px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 4000;
        animation: slideInRight 0.3s ease;
        display: flex;
        align-items: center;
        gap: 0.5rem;
        max-width: 400px;
    `;
    
    document.body.appendChild(notification);
    
    // Remove after 5 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 5000);
}

function initializeSampleData() {
    const sampleResults = [
        {
            id: 1,
            testName: 'Blood Test (Full Panel)',
            hospital: 'Bugesera District Hospital',
            testDate: '2024-01-15',
            status: 'completed',
            patientPhone: currentUser?.phone || '+250788123456',
            file: 'blood_test_results.pdf'
        },
        {
            id: 2,
            testName: 'X-Ray Chest',
            hospital: 'Muhanga District Hospital', 
            testDate: '2024-01-10',
            status: 'completed',
            patientPhone: currentUser?.phone || '+250788123456',
            file: 'xray_results.pdf'
        }
    ];
    
    localStorage.setItem('testResults', JSON.stringify(sampleResults));
    localStorage.setItem('sampleDataInitialized', 'true');
    testResults = sampleResults;
}

function viewResult(resultId) {
    const result = testResults.find(r => r.id === resultId);
    if (result) {
        alert(`Viewing results for: ${result.testName}\nHospital: ${result.hospital}\nDate: ${result.testDate}\n\nIn a real application, this would display the actual test results.`);
    }
}

function downloadResult(resultId) {
    const result = testResults.find(r => r.id === resultId);
    if (result) {
        alert(`Downloading results for: ${result.testName}\n\nIn a real application, this would download the PDF file.`);
    }
}

// Add CSS for notifications
const notificationStyles = document.createElement('style');
notificationStyles.textContent = `
    @keyframes slideInRight {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes slideOutRight {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
    
    .no-results, .no-appointments {
        text-align: center;
        padding: 3rem;
        color: var(--gray-medium);
    }
    
    .no-results i, .no-appointments i {
        font-size: 4rem;
        margin-bottom: 1rem;
        color: var(--teal-light);
    }
    
    .appointment-header, .result-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 0.5rem;
    }
    
    .status {
        padding: 0.25rem 0.75rem;
        border-radius: 15px;
        font-size: 0.8rem;
        font-weight: bold;
        text-transform: uppercase;
    }
    
    .status.confirmed {
        background: var(--success);
        color: white;
    }
    
    .status.completed {
        background: var(--teal);
        color: white;
    }
    
    .status.cancelled {
        background: var(--error);
        color: white;
    }
    
    .reference {
        font-family: monospace;
        background: var(--white);
        padding: 0.25rem 0.5rem;
        border-radius: 3px;
        font-size: 0.9rem;
    }
    
    .result-actions {
        display: flex;
        gap: 0.5rem;
        margin-top: 1rem;
    }
`;
document.head.appendChild(notificationStyles);