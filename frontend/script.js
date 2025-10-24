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
    const appointmentDateInput = document.getElementById('appointmentDate');
    if (appointmentDateInput) {
        appointmentDateInput.min = today;
    }
    
    // Initialize admin data
    initializeAdminData();
    
    // Load sample data if not exists
    if (!localStorage.getItem('sampleDataInitialized')) {
        initializeSampleData();
    }
    
    setTimeout(() => {
        initializeAddTestForm();
    }, 1000);

    // Render initial test data
    renderTestCards(medicalTests);
}


function setupEventListeners() {
    // Mobile menu
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', toggleMobileMenu);
    }
    
    // Form submissions
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const bookingForm = document.getElementById('bookingForm');
    
    if (loginForm) loginForm.addEventListener('submit', handleLogin);
    if (registerForm) registerForm.addEventListener('submit', handleRegister);
    if (bookingForm) bookingForm.addEventListener('submit', handleBooking);
    
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
    
    // Close modal when clicking outside
    window.addEventListener('click', function(event) {
        const modal = document.getElementById('bookingModal');
        if (event.target === modal) {
            closeBooking();
        }
    });
    
    // Close modal with escape key
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape') {
            closeBooking();
        }
    });
}

// function checkAuthentication() {
//     if (currentUser) {
//         updateUserInterface();
//         showSection('dashboard');
//     } else {
//         showSection('home');
//     }
// }

// Enhanced authentication check
function checkAuthentication() {
    console.log('Checking authentication...');
    
    // Check if user data exists in localStorage but currentUser is null (after logout)
    const storedUser = localStorage.getItem('currentUser');
    if (!storedUser && currentUser) {
        console.log('Clearing stale user data...');
        currentUser = null;
    }
    
    if (currentUser) {
        console.log('User is authenticated:', currentUser.name);
        updateUserInterface();
        
        // Redirect to appropriate section based on user role
        if (isAdmin()) {
            showSection('admin');
        } else {
            showSection('dashboard');
        }
    } else {
        console.log('No user authenticated - showing public sections');
        updateUserInterface();
        
        // Ensure we're on a public section
        const currentActive = document.querySelector('.section.active');
        if (currentActive && ['dashboard', 'admin'].includes(currentActive.id)) {
            console.log('Forcing home section due to no authentication');
            forceShowHomeSection();
        } else {
            showSection('home');
        }
        
        // Ensure login form is visible and clean
        showLoginForm();
    }
}


// Navigation functions
// function showSection(sectionId) {
//     // Hide all sections
//     document.querySelectorAll('.section').forEach(section => {
//         section.classList.remove('active');
//     });
    
//     // Show selected section
//     const targetSection = document.getElementById(sectionId);
//     if (targetSection) {
//         targetSection.classList.add('active');
        
//         // Update navigation highlights
//         document.querySelectorAll('.nav-link, .mobile-nav-link').forEach(link => {
//             link.classList.remove('active');
//             if (link.getAttribute('href') === `#${sectionId}`) {
//                 link.classList.add('active');
//             }
//         });
        
//         // Load section-specific data
//         if (sectionId === 'dashboard') {
//             updateDashboard();
//         } else if (sectionId === 'search') {
//             searchTests();
//         }
//     }
// }

// Enhanced showSection function with strict authentication
const originalShowSection = window.showSection;
window.showSection = function(sectionId) {
    console.log('Navigating to section:', sectionId);
    
    // Prevent access to protected sections after logout
    const protectedSections = ['dashboard', 'admin', 'search'];
    
    if (protectedSections.includes(sectionId) && !currentUser) {
        console.log('🚫 Blocked access to protected section:', sectionId);
        showNotification('Please login to access this section', 'error');
        
        // Force show home section and hide protected sections
        forceShowHomeSection();
        return;
    }
    
    // Check admin access
    if (sectionId === 'admin' && !isAdmin()) {
        showNotification('Access denied. Admin only.', 'error');
        showSection('dashboard');
        return;
    }
    
    // Call original function
    originalShowSection(sectionId);
};

// Force show home section (used after logout)
function forceShowHomeSection() {
    console.log('Force showing home section...');
    
    // Hide all sections
    document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active');
        if (section.id === 'dashboard' || section.id === 'admin') {
            section.style.display = 'none';
        }
    });
    
    // Show home section
    const homeSection = document.getElementById('home');
    if (homeSection) {
        homeSection.classList.add('active');
        homeSection.style.display = 'block';
    }
    
    // Update navigation
    updateNavigationHighlights('home');
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
            password,
            status: 'active',
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
    hideProtectedSections();
    terminateAllSections();
    showLoginForm();
    localStorage.removeItem('currentUser');
    updateUserInterface();
    showSection('home');
    forceHideDashboard();
    showNotification('Logged out successfully', 'success');
}

// Function to hide all protected sections

function hideProtectedSections() {
    console.log('Hiding protected sections...');
    
    const protectedSections = ['dashboard', 'admin', 'search'];
    
    protectedSections.forEach(sectionId => {
        const section = document.getElementById(sectionId);
        if (section) {
            section.classList.remove('active');
            console.log('Hidden section:', sectionId);
        }
    });
}

// Force hide dashboard and admin sections
function forceHideDashboard() {
    console.log('Force hiding dashboard and admin sections...');
    
    // Get all sections
    const sections = document.querySelectorAll('.section');
    
    sections.forEach(section => {
        if (section.id === 'dashboard' || section.id === 'admin') {
            section.classList.remove('active');
            section.style.display = 'none';
            console.log('Force hidden:', section.id);
        } else if (section.id === 'home' || section.id === 'login') {
            section.classList.add('active');
            section.style.display = 'block';
        } else {
            section.classList.remove('active');
            section.style.display = 'none';
        }
    });
    
    // Update navigation highlights
    updateNavigationHighlights('home');
}

// Update navigation highlights
function updateNavigationHighlights(activeSection) {
    console.log('Updating navigation for:', activeSection);
    
    // Update main navigation
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${activeSection}`) {
            link.classList.add('active');
        }
    });}


function updateUserInterface() {
    const loginBtn = document.querySelector('.login-btn');
    const mobileLoginBtn = document.querySelector('.mobile-nav-link.login-btn');
    
    if (currentUser) {
        if (loginBtn) {
            loginBtn.textContent = 'Dashboard';
            loginBtn.href = '#dashboard';
        }
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
        if (loginBtn) {
            loginBtn.textContent = 'Login';
            loginBtn.href = '#login';
        }
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
    if (!container) return;
    
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
            <button class="book-btn" onclick="bookTest(${test.id}, '${test.name}', '${test.hospital}', ${test.price})">
                <i class="fas fa-calendar-plus"></i> Book Now
            </button>
        </div>
    `).join('');
}

// Fixed Booking Functions
function bookTest(testId, testName, hospital, price) {
    console.log('Book Now clicked:', { testId, testName, hospital, price });
    
    if (!currentUser) {
        showNotification('Please login to book a test', 'error');
        showSection('login');
        return;
    }
    
    const test = medicalTests.find(t => t.id === testId);
    if (!test) {
        console.error('Test not found:', testId);
        return;
    }
    
    currentTest = test;
    
    // Populate modal fields
    document.getElementById('bookingTest').value = testName;
    document.getElementById('bookingHospital').value = hospital;
    document.getElementById('bookingPrice').value = `${price.toLocaleString()} RWF`;
    
    // Pre-fill with user data
    if (currentUser) {
        document.getElementById('patientName').value = currentUser.name || '';
        document.getElementById('patientPhone').value = currentUser.phone || '';
        document.getElementById('patientEmail').value = currentUser.email || '';
        document.getElementById('insuranceNumber').value = currentUser.insuranceNumber || '';
    }
    
    // Set minimum date to today
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('appointmentDate').min = today;
    
    // Show the modal with animation
    const modal = document.getElementById('bookingModal');
    const modalContent = document.querySelector('.modal-content');
    
    modal.style.display = 'block';
    document.body.classList.add('modal-open');
    
    // Add animation
    setTimeout(() => {
        modalContent.classList.add('show');
    }, 10);
    
    console.log('Modal should be visible now');
}

function closeBooking() {
    const modal = document.getElementById('bookingModal');
    const modalContent = document.querySelector('.modal-content');
    
    // Remove animation class
    modalContent.classList.remove('show');
    
    // Hide modal after animation
    setTimeout(() => {
        modal.style.display = 'none';
        document.body.classList.remove('modal-open');
        document.getElementById('bookingForm').reset();
        currentTest = null;
    }, 300);
}

function handleBooking(event) {
    event.preventDefault();
    console.log('Booking form submitted');
    
    if (!currentUser || !currentTest) {
        showNotification('Please login to book a test', 'error');
        return;
    }
    
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
    
    // Validate required fields
    if (!formData.patientName || !formData.patientPhone || !formData.appointmentDate) {
        showNotification('Please fill in all required fields', 'error');
        return;
    }
    
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
    const targetTab = document.getElementById(`${tabName}Tab`);
    if (targetTab) {
        targetTab.classList.add('active');
    }
    
    // Activate selected button
    if (event && event.target) {
        event.target.classList.add('active');
    }
}

function updateAppointmentList() {
    const appointmentList = document.getElementById('appointmentList');
    if (!appointmentList) return;
    
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
    if (!resultsList) return;
    
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
    
    if (document.getElementById('profileName')) {
        document.getElementById('profileName').textContent = currentUser.name;
        document.getElementById('profilePhone').textContent = currentUser.phone;
        document.getElementById('profileEmail').textContent = currentUser.email;
        document.getElementById('profileInsurance').textContent = currentUser.insuranceNumber || 'Not provided';
    }
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
    const spinner = document.getElementById('loadingSpinner');
    if (spinner) {
        spinner.style.display = show ? 'flex' : 'none';
    }
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

// Add CSS for notifications and modal
const additionalStyles = document.createElement('style');
additionalStyles.textContent = `
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
    
    /* Modal animations */
    .modal-content {
        transition: all 0.3s ease;
        transform: scale(0.7);
        opacity: 0;
    }
    
    .modal-content.show {
        transform: scale(1);
        opacity: 1;
    }
    
    body.modal-open {
        overflow: hidden;
    }
`;
document.head.appendChild(additionalStyles);

// Admin configuration
const ADMIN_CONFIG = {
    email: 'admin@specicare.com',
    password: 'admin123'
};

// Check if current user is admin
function isAdmin() {
    return currentUser && currentUser.email === ADMIN_CONFIG.email;
}

// Show admin section
function showAdminSection() {
    console.log('Showing admin section...');
    if (!isAdmin()) {
        showNotification('Access denied. Admin only.', 'error');
        showSection('dashboard');
        return;
    }
    showSection('admin');
    updateAdminDashboard();
}

// Update admin dashboard
function updateAdminDashboard() {
    if (!isAdmin()) return;
    
    console.log('Updating admin dashboard...');
    updateAdminStats();
    updateActivitiesList();
    updateUsersList();
    updateBookingsList();
    updateTestsList();
}

// Update admin statistics
function updateAdminStats() {
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const appointments = JSON.parse(localStorage.getItem('appointments')) || [];
    
    document.getElementById('totalUsers').textContent = users.length;
    document.getElementById('totalBookings').textContent = appointments.length;
    document.getElementById('totalTests').textContent = medicalTests.length;
    
    const totalRevenue = appointments.reduce((sum, apt) => sum + apt.price, 0);
    document.getElementById('totalRevenue').textContent = totalRevenue.toLocaleString() + ' RWF';
}

// Update activities list
function updateActivitiesList() {
    const activitiesList = document.getElementById('activitiesList');
    if (!activitiesList) return;
    
    const activities = JSON.parse(localStorage.getItem('adminActivities')) || [];
    const recentActivities = activities.slice(-5).reverse();
    
    if (recentActivities.length === 0) {
        activitiesList.innerHTML = '<p class="no-activities">No recent activities</p>';
        return;
    }
    
    activitiesList.innerHTML = recentActivities.map(activity => `
        <div class="activity-item">
            <div class="activity-icon">
                <i class="fas fa-${getActivityIcon(activity.type)}"></i>
            </div>
            <div class="activity-content">
                <p>${activity.message}</p>
                <span class="activity-time">${new Date(activity.timestamp).toLocaleString()}</span>
            </div>
        </div>
    `).join('');
}

function getActivityIcon(type) {
    const icons = {
        user: 'user-plus',
        booking: 'calendar-check',
        test: 'flask',
        system: 'cog'
    };
    return icons[type] || 'info-circle';
}

// Update users list
function updateUsersList() {
    const usersList = document.getElementById('usersList');
    if (!usersList) return;
    
    const users = JSON.parse(localStorage.getItem('users')) || [];
    // Filter out admin user from the list
    const regularUsers = users.filter(user => user.email !== ADMIN_CONFIG.email);
    
    if (regularUsers.length === 0) {
        usersList.innerHTML = '<p class="no-users">No users registered</p>';
        return;
    }
    
    usersList.innerHTML = regularUsers.map(user => `
        <div class="user-item">
            <div class="user-info">
                <h4>${user.name}</h4>
                <p>${user.email} • ${user.phone}</p>
                <small>Joined: ${new Date(user.createdAt).toLocaleDateString()}</small>
            </div>
            <div class="user-actions">
                <button class="secondary-btn" onclick="viewUserDetails(${user.id})">
                    <i class="fas fa-eye"></i>
                </button>
                <button class="danger-btn" onclick="deleteUser(${user.id})">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
    `).join('');
}

// Update bookings list
function updateBookingsList() {
    const bookingsList = document.getElementById('bookingsList');
    if (!bookingsList) return;
    
    const appointments = JSON.parse(localStorage.getItem('appointments')) || [];
    const statusFilter = document.getElementById('bookingStatusFilter').value;
    
    const filteredBookings = statusFilter === 'all' 
        ? appointments 
        : appointments.filter(apt => apt.status === statusFilter);
    
    if (filteredBookings.length === 0) {
        bookingsList.innerHTML = '<p class="no-bookings">No bookings found</p>';
        return;
    }
    
    bookingsList.innerHTML = filteredBookings.map(booking => `
        <div class="booking-item">
            <div class="booking-info">
                <h4>${booking.testName}</h4>
                <p><strong>Patient:</strong> ${booking.patientName} • ${booking.patientPhone}</p>
                <p><strong>Hospital:</strong> ${booking.hospital}</p>
                <p><strong>Date:</strong> ${new Date(booking.appointmentDate).toLocaleDateString()}</p>
                <p><strong>Price:</strong> ${booking.price.toLocaleString()} RWF</p>
                <span class="status ${booking.status}">${booking.status}</span>
            </div>
            <div class="booking-actions">
                <button class="secondary-btn" onclick="updateBookingStatus(${booking.id}, 'confirmed')">
                    Confirm
                </button>
                <button class="warning-btn" onclick="updateBookingStatus(${booking.id}, 'completed')">
                    Complete
                </button>
                <button class="danger-btn" onclick="updateBookingStatus(${booking.id}, 'cancelled')">
                    Cancel
                </button>
            </div>
        </div>
    `).join('');
}

// Update tests list
function updateTestsList() {
    const testsList = document.getElementById('testsList');
    if (!testsList) return;
    
    if (medicalTests.length === 0) {
        testsList.innerHTML = '<p class="no-tests">No tests available</p>';
        return;
    }
    
    testsList.innerHTML = medicalTests.map(test => `
        <div class="test-item">
            <div class="test-info">
                <h4>${test.name}</h4>
                <p><strong>Hospital:</strong> ${test.hospital} • ${test.location}</p>
                <p><strong>Category:</strong> ${test.category} • ${test.duration}</p>
                <p><strong>Price:</strong> ${test.price.toLocaleString()} RWF</p>
                <span class="status ${test.available ? 'confirmed' : 'cancelled'}">
                    ${test.available ? 'Available' : 'Unavailable'}
                </span>
            </div>
            <div class="test-actions">
                <button class="secondary-btn" onclick="editTest(${test.id})">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="danger-btn" onclick="deleteTest(${test.id})">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
    `).join('');
}

// Admin tab navigation
function showAdminTab(tabName) {
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

// Debug function for add test
function debugAddTest() {
    console.log('=== DEBUG ADD TEST FUNCTIONALITY ===');
    
    const modal = document.getElementById('addTestModal');
    const form = document.getElementById('addTestForm');
    const button = document.querySelector('[onclick="showAddTestModal()"]');
    
    console.log('Add Test Modal:', modal);
    console.log('Add Test Form:', form);
    console.log('Add Test Button:', button);
    console.log('Medical tests array:', medicalTests);
    
    // Check if event listeners are attached
    if (form) {
        console.log('Form onsubmit:', form.onsubmit);
    }
    
    if (!modal) {
        console.error('❌ addTestModal not found!');
        showNotification('Error: Add test modal not found', 'error');
        return;
    }
    
    if (!form) {
        console.error('❌ addTestForm not found!');
        showNotification('Error: Add test form not found', 'error');
        return;
    }
    
    console.log('✅ All elements found');
    showNotification('Debug complete! Check console.', 'info');
}

// Force show modal function
function forceShowAddTestModal() {
    console.log('Force showing add test modal...');
    
    const modal = document.getElementById('addTestModal');
    if (modal) {
        modal.style.display = 'block';
        console.log('✅ Modal displayed');
        
        // Add animation
        const modalContent = modal.querySelector('.modal-content');
        if (modalContent) {
            modalContent.classList.add('show');
        }
        
        // Populate with sample data for testing
        document.getElementById('testName').value = 'Sample Blood Test';
        document.getElementById('testCategory').value = 'laboratory';
        document.getElementById('testHospital').value = 'Test Hospital';
        document.getElementById('testLocation').value = 'Kigali';
        document.getElementById('testPrice').value = '15000';
        document.getElementById('testDuration').value = '15 minutes';
        document.getElementById('testDescription').value = 'This is a sample test description';
        
        showNotification('Modal forced open with sample data!', 'success');
    } else {
        console.error('❌ Modal not found');
        showNotification('Error: Modal not found', 'error');
    }
}

// Fixed showAddTestModal function
function showAddTestModal() {
    console.log('showAddTestModal called');
    
    const modal = document.getElementById('addTestModal');
    if (!modal) {
        console.error('addTestModal element not found!');
        showNotification('Error: Cannot open add test form', 'error');
        return;
    }
    
    // Reset form
    const form = document.getElementById('addTestForm');
    if (form) {
        form.reset();
        // Set default values
        document.getElementById('testAvailable').checked = true;
        document.getElementById('testInsuranceCovered').checked = true;
    }
    
    // Show modal
    modal.style.display = 'block';
    
    // Add animation
    const modalContent = modal.querySelector('.modal-content');
    if (modalContent) {
        setTimeout(() => {
            modalContent.classList.add('show');
        }, 10);
    }
    
    console.log('Add test modal should be visible now');
}

// Fixed closeAddTestModal function
function closeAddTestModal() {
    console.log('closeAddTestModal called');
    
    const modal = document.getElementById('addTestModal');
    const modalContent = modal?.querySelector('.modal-content');
    
    if (modalContent) {
        modalContent.classList.remove('show');
    }
    
    setTimeout(() => {
        if (modal) {
            modal.style.display = 'none';
        }
        const form = document.getElementById('addTestForm');
        if (form) {
            form.reset();
        }
    }, 300);
}

// Fixed form submission handler
function initializeAddTestForm() {
    const addTestForm = document.getElementById('addTestForm');
    if (!addTestForm) {
        console.error('Add test form not found during initialization');
        return;
    }
    
    console.log('Initializing add test form...');
    
    // Remove any existing event listeners by cloning the form
    const newForm = addTestForm.cloneNode(true);
    addTestForm.parentNode.replaceChild(newForm, addTestForm);
    
    // Add new event listener
    newForm.addEventListener('submit', function(e) {
        e.preventDefault();
        console.log('Add test form submitted!');
        
        // Get form values
        const testName = document.getElementById('testName').value;
        const testCategory = document.getElementById('testCategory').value;
        const testHospital = document.getElementById('testHospital').value;
        const testLocation = document.getElementById('testLocation').value;
        const testPrice = parseInt(document.getElementById('testPrice').value);
        const testDuration = document.getElementById('testDuration').value;
        const testDescription = document.getElementById('testDescription').value;
        const testAvailable = document.getElementById('testAvailable').checked;
        const testInsuranceCovered = document.getElementById('testInsuranceCovered').checked;
        
        console.log('Form data:', {
            testName, testCategory, testHospital, testLocation, 
            testPrice, testDuration, testDescription, testAvailable, testInsuranceCovered
        });
        
        // Validate required fields
        if (!testName || !testCategory || !testHospital || !testLocation || !testPrice || !testDuration || !testDescription) {
            showNotification('Please fill in all required fields', 'error');
            return;
        }
        
        // Create new test object
        const newTest = {
            id: Date.now(),
            name: testName,
            category: testCategory,
            hospital: testHospital,
            location: testLocation,
            price: testPrice,
            duration: testDuration,
            description: testDescription,
            available: testAvailable,
            insuranceCovered: testInsuranceCovered
        };
        
        console.log('Adding new test:', newTest);
        
        // Add to medicalTests array
        medicalTests.push(newTest);
        
        // Save to localStorage
        localStorage.setItem('medicalTests', JSON.stringify(medicalTests));
        
        // Log admin activity
        logAdminActivity('test', `Added new test: ${newTest.name}`);
        
        showNotification(`Test "${newTest.name}" added successfully!`, 'success');
        
        // Close modal
        closeAddTestModal();
        
        // Update the tests list
        updateTestsList();
        
        // Update search results if on search page
        renderTestCards(medicalTests);
    });
    
    console.log('✅ Add test form initialized successfully');
}


// Admin action functions
function updateBookingStatus(bookingId, status) {
    const appointments = JSON.parse(localStorage.getItem('appointments')) || [];
    const booking = appointments.find(apt => apt.id === bookingId);
    
    if (booking) {
        booking.status = status;
        localStorage.setItem('appointments', JSON.stringify(appointments));
        
        logAdminActivity('booking', `Updated booking ${booking.reference} to ${status}`);
        
        showNotification(`Booking ${status} successfully!`, 'success');
        updateAdminDashboard();
    }
}

function deleteUser(userId) {
    if (confirm('Are you sure you want to delete this user?')) {
        const users = JSON.parse(localStorage.getItem('users')) || [];
        const userIndex = users.findIndex(u => u.id === userId);
        
        if (userIndex > -1) {
            const userName = users[userIndex].name;
            users.splice(userIndex, 1);
            localStorage.setItem('users', JSON.stringify(users));
            
            logAdminActivity('user', `Deleted user: ${userName}`);
            
            showNotification('User deleted successfully!', 'success');
            updateAdminDashboard();
        }
    }
}

function deleteTest(testId) {
    if (confirm('Are you sure you want to delete this test?')) {
        const testIndex = medicalTests.findIndex(t => t.id === testId);
        
        if (testIndex > -1) {
            const testName = medicalTests[testIndex].name;
            medicalTests.splice(testIndex, 1);
            localStorage.setItem('medicalTests', JSON.stringify(medicalTests));
            
            logAdminActivity('test', `Deleted test: ${testName}`);
            
            showNotification('Test deleted successfully!', 'success');
            updateAdminDashboard();
        }
    }
}

function editTest(testId) {
    const test = medicalTests.find(t => t.id === testId);
    if (test) {
        // Populate the add test form with existing data
        document.getElementById('testName').value = test.name;
        document.getElementById('testCategory').value = test.category;
        document.getElementById('testHospital').value = test.hospital;
        document.getElementById('testLocation').value = test.location;
        document.getElementById('testPrice').value = test.price;
        document.getElementById('testDuration').value = test.duration;
        document.getElementById('testDescription').value = test.description;
        document.getElementById('testAvailable').checked = test.available;
        document.getElementById('testInsuranceCovered').checked = test.insuranceCovered;
        
        showAddTestModal();
        
        // Remove existing event listener and add update handler
        const form = document.getElementById('addTestForm');
        const newForm = form.cloneNode(true);
        form.parentNode.replaceChild(newForm, form);
        
        newForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            test.name = document.getElementById('testName').value;
            test.category = document.getElementById('testCategory').value;
            test.hospital = document.getElementById('testHospital').value;
            test.location = document.getElementById('testLocation').value;
            test.price = parseInt(document.getElementById('testPrice').value);
            test.duration = document.getElementById('testDuration').value;
            test.description = document.getElementById('testDescription').value;
            test.available = document.getElementById('testAvailable').checked;
            test.insuranceCovered = document.getElementById('testInsuranceCovered').checked;
            
            localStorage.setItem('medicalTests', JSON.stringify(medicalTests));
            
            logAdminActivity('test', `Updated test: ${test.name}`);
            
            showNotification('Test updated successfully!', 'success');
            closeAddTestModal();
            updateAdminDashboard();
        });
    }
}

function viewUserDetails(userId) {
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const user = users.find(u => u.id === userId);
    if (user) {
        alert(`User Details:\n\nName: ${user.name}\nEmail: ${user.email}\nPhone: ${user.phone}\nInsurance: ${user.insuranceNumber || 'None'}\nJoined: ${new Date(user.createdAt).toLocaleDateString()}`);
    }
}

// Filter bookings
function filterBookings() {
    updateBookingsList();
}

// Export users
function exportUsers() {
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const regularUsers = users.filter(user => user.email !== ADMIN_CONFIG.email);
    
    if (regularUsers.length === 0) {
        showNotification('No users to export', 'warning');
        return;
    }
    
    const csvContent = "data:text/csv;charset=utf-8," 
        + ["Name,Email,Phone,Insurance,Joined"].concat(
            regularUsers.map(user => 
                `"${user.name}","${user.email}","${user.phone}","${user.insuranceNumber || 'None'}","${user.createdAt}"`
            )
        ).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "specicare_users.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showNotification('Users exported successfully!', 'success');
}

// Log admin activities
function logAdminActivity(type, message) {
    const activities = JSON.parse(localStorage.getItem('adminActivities')) || [];
    const activity = {
        type,
        message,
        timestamp: new Date().toISOString(),
        admin: currentUser?.name || 'System'
    };
    
    activities.push(activity);
    localStorage.setItem('adminActivities', JSON.stringify(activities));
}

// Update the login function to handle admin
function handleLogin(event) {
    event.preventDefault();
    
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    
    showLoading(true);
    
    // Simulate API call
    setTimeout(() => {
        // Check if admin login
        if (email === ADMIN_CONFIG.email && password === ADMIN_CONFIG.password) {
            currentUser = {
                id: 'admin',
                name: 'System Administrator',
                email: ADMIN_CONFIG.email,
                phone: 'N/A',
                role: 'admin',
                createdAt: new Date().toISOString()
            };
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
            updateUserInterface();
            showAdminSection(); // This is the key change!
            showNotification('Admin login successful!', 'success');
            showLoading(false);
            return;
        }
        
        // Regular user login
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

// Update user interface to show Admin instead of Dashboard for admin
function updateUserInterface() {
    const loginBtn = document.querySelector('.login-btn');
    const mobileLoginBtn = document.querySelector('.mobile-nav-link.login-btn');
    
    if (currentUser) {
        if (loginBtn) {
            loginBtn.textContent = isAdmin() ? 'Admin' : 'Dashboard';
            loginBtn.href = isAdmin() ? '#admin' : '#dashboard';
        }
        if (mobileLoginBtn) {
            mobileLoginBtn.textContent = isAdmin() ? 'Admin' : 'Dashboard';
            mobileLoginBtn.href = isAdmin() ? '#admin' : '#dashboard';
        }
        
        // Update profile information
        if (document.getElementById('profileName')) {
            document.getElementById('profileName').textContent = currentUser.name;
            document.getElementById('profilePhone').textContent = currentUser.phone;
            document.getElementById('profileEmail').textContent = currentUser.email;
            document.getElementById('profileInsurance').textContent = currentUser.insuranceNumber || 'Not provided';
        }
    } else {
        if (loginBtn) {
            loginBtn.textContent = 'Login';
            loginBtn.href = '#login';
        }
        if (mobileLoginBtn) {
            mobileLoginBtn.textContent = 'Login';
            mobileLoginBtn.href = '#login';
        }
    }
}

// Initialize admin data
function initializeAdminData() {
    if (!localStorage.getItem('adminActivities')) {
        const initialActivities = [
            {
                type: 'system',
                message: 'Admin dashboard initialized',
                timestamp: new Date().toISOString(),
                admin: 'System'
            }
        ];
        localStorage.setItem('adminActivities', JSON.stringify(initialActivities));
    }
    
    // Ensure medical tests are stored in localStorage
    if (!localStorage.getItem('medicalTests')) {
        localStorage.setItem('medicalTests', JSON.stringify(medicalTests));
    }
}

// Enhanced editUser function with debugging
function editUser(userId) {
    console.log('editUser called with ID:', userId);
    
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const user = users.find(u => u.id === userId);
    
    console.log('Found user:', user);
    
    if (!user) {
        console.error('User not found with ID:', userId);
        showNotification('User not found!', 'error');
        return;
    }
    
    // Get modal elements
    const modal = document.getElementById('editUserModal');
    const form = document.getElementById('editUserForm');
    const userIdInput = document.getElementById('editUserId');
    const nameInput = document.getElementById('editUserName');
    const emailInput = document.getElementById('editUserEmail');
    const phoneInput = document.getElementById('editUserPhone');
    const insuranceInput = document.getElementById('editUserInsurance');
    const statusInput = document.getElementById('editUserStatus');
    const passwordInput = document.getElementById('editUserPassword');
    
    console.log('Modal elements:', {
        modal, form, userIdInput, nameInput, emailInput, 
        phoneInput, insuranceInput, statusInput, passwordInput
    });
    
    // Populate form fields
    if (userIdInput) userIdInput.value = user.id;
    if (nameInput) nameInput.value = user.name || '';
    if (emailInput) emailInput.value = user.email || '';
    if (phoneInput) phoneInput.value = user.phone || '';
    if (insuranceInput) insuranceInput.value = user.insuranceNumber || '';
    if (statusInput) statusInput.value = user.status || 'active';
    if (passwordInput) passwordInput.value = '';
    
    // Show the modal
    if (modal) {
        modal.style.display = 'block';
        console.log('Modal should be visible now');
        
        // Add animation
        const modalContent = modal.querySelector('.modal-content');
        if (modalContent) {
            modalContent.classList.add('show');
        }
    } else {
        console.error('Edit user modal not found!');
    }
}

// Enhanced close function
function closeEditUserModal() {
    console.log('Closing edit user modal');
    
    const modal = document.getElementById('editUserModal');
    const modalContent = modal?.querySelector('.modal-content');
    
    if (modalContent) {
        modalContent.classList.remove('show');
    }
    
    setTimeout(() => {
        if (modal) {
            modal.style.display = 'none';
        }
        const form = document.getElementById('editUserForm');
        if (form) {
            form.reset();
        }
    }, 300);
}

// function closeEditUserModal() {
//     document.getElementById('editUserModal').style.display = 'none';
//     document.getElementById('editUserForm').reset();
// }

// Handle edit user form submission
document.addEventListener('DOMContentLoaded', function() {
    const editUserForm = document.getElementById('editUserForm');
    if (editUserForm) {
        editUserForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const userId = parseInt(document.getElementById('editUserId').value);
            const users = JSON.parse(localStorage.getItem('users')) || [];
            const userIndex = users.findIndex(u => u.id === userId);
            
            if (userIndex > -1) {
                const updatedUser = {
                    ...users[userIndex],
                    name: document.getElementById('editUserName').value,
                    email: document.getElementById('editUserEmail').value,
                    phone: document.getElementById('editUserPhone').value,
                    insuranceNumber: document.getElementById('editUserInsurance').value,
                    status: document.getElementById('editUserStatus').value,
                    updatedAt: new Date().toISOString()
                };
                
                // Update password only if provided
                const newPassword = document.getElementById('editUserPassword').value;
                if (newPassword) {
                    updatedUser.password = newPassword;
                }
                
                users[userIndex] = updatedUser;
                localStorage.setItem('users', JSON.stringify(users));
                
                // Log activity
                logAdminActivity('user', `Updated user: ${updatedUser.name}`);
                
                showNotification('User updated successfully!', 'success');
                closeEditUserModal();
                updateAdminDashboard();
            }
        });
    }
});

// Enhanced view user details function
function viewUserDetails(userId) {
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const user = users.find(u => u.id === userId);
    
    if (user) {
        const userDetailsHtml = `
            <div class="user-details-content">
                <h3>User Details</h3>
                <div class="user-detail-item">
                    <span class="user-detail-label">Full Name:</span>
                    <span class="user-detail-value">${user.name}</span>
                </div>
                <div class="user-detail-item">
                    <span class="user-detail-label">Email:</span>
                    <span class="user-detail-value">${user.email}</span>
                </div>
                <div class="user-detail-item">
                    <span class="user-detail-label">Phone:</span>
                    <span class="user-detail-value">${user.phone}</span>
                </div>
                <div class="user-detail-item">
                    <span class="user-detail-label">Insurance Number:</span>
                    <span class="user-detail-value">${user.insuranceNumber || 'Not provided'}</span>
                </div>
                <div class="user-detail-item">
                    <span class="user-detail-label">Account Status:</span>
                    <span class="user-detail-value">
                        <span class="status ${user.status || 'active'}">${user.status || 'active'}</span>
                    </span>
                </div>
                <div class="user-detail-item">
                    <span class="user-detail-label">Member Since:</span>
                    <span class="user-detail-value">${new Date(user.createdAt).toLocaleDateString()}</span>
                </div>
                ${user.updatedAt ? `
                <div class="user-detail-item">
                    <span class="user-detail-label">Last Updated:</span>
                    <span class="user-detail-value">${new Date(user.updatedAt).toLocaleDateString()}</span>
                </div>
                ` : ''}
                <div class="form-actions" style="margin-top: 2rem;">
                    <button class="edit-btn action-btn" onclick="editUser(${user.id}); document.getElementById('editUserModal').style.display='block';">
                        <i class="fas fa-edit"></i> Edit User
                    </button>
                    <button class="secondary-btn" onclick="this.closest('.modal').style.display='none'">
                        Close
                    </button>
                </div>
            </div>
        `;
        
        // Create a modal for user details
        showCustomModal('User Details', userDetailsHtml);
    }
}

// Enhanced user management functions
function suspendUser(userId) {
    if (confirm('Are you sure you want to suspend this user? They will not be able to login.')) {
        updateUserStatus(userId, 'suspended');
    }
}

function activateUser(userId) {
    updateUserStatus(userId, 'active');
}

function updateUserStatus(userId, status) {
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const userIndex = users.findIndex(u => u.id === userId);
    
    if (userIndex > -1) {
        const userName = users[userIndex].name;
        users[userIndex].status = status;
        users[userIndex].updatedAt = new Date().toISOString();
        localStorage.setItem('users', JSON.stringify(users));
        
        logAdminActivity('user', `${status === 'suspended' ? 'Suspended' : 'Activated'} user: ${userName}`);
        
        showNotification(`User ${status} successfully!`, 'success');
        updateAdminDashboard();
    }
}

// Utility function to show custom modals
function showCustomModal(title, content) {
    // Remove existing custom modal if any
    const existingModal = document.getElementById('customModal');
    if (existingModal) {
        existingModal.remove();
    }
    
    const modalHtml = `
        <div id="customModal" class="modal" style="display: block;">
            <div class="modal-content user-details-modal">
                <span class="close" onclick="this.closest('.modal').style.display='none'">&times;</span>
                <h2>${title}</h2>
                ${content}
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    
    // Add click outside to close
    const modal = document.getElementById('customModal');
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    });
}

function updateUsersList() {
    const usersList = document.getElementById('usersList');
    if (!usersList) {
        console.error('usersList element not found!');
        return;
    }
    
    const users = JSON.parse(localStorage.getItem('users')) || [];
    // Filter out admin user from the list
    const regularUsers = users.filter(user => user.email !== ADMIN_CONFIG.email);
    
    console.log('Rendering users list. Total users:', regularUsers.length);
    
    if (regularUsers.length === 0) {
        usersList.innerHTML = '<p class="no-users">No users registered</p>';
        return;
    }
    
    usersList.innerHTML = regularUsers.map(user => `
        <div class="user-item">
            <div class="user-info">
                <h4>${user.name}</h4>
                <p>${user.email} • ${user.phone}</p>
                <p>
                    <small>Joined: ${new Date(user.createdAt).toLocaleDateString()}</small>
                    <span class="status ${user.status || 'active'}">${user.status || 'active'}</span>
                </p>
            </div>
            <div class="user-actions">
                <button class="view-btn action-btn" onclick="viewUserDetails(${user.id})" title="View Details">
                    <i class="fas fa-eye"></i> View
                </button>
                <button class="edit-btn action-btn" onclick="editUser(${user.id})" title="Edit User">
                    <i class="fas fa-edit"></i> Edit
                </button>
                ${user.status === 'suspended' ? `
                    <button class="activate-btn action-btn" onclick="activateUser(${user.id})" title="Activate User">
                        <i class="fas fa-check"></i> Activate
                    </button>
                ` : `
                    <button class="suspend-btn action-btn" onclick="suspendUser(${user.id})" title="Suspend User">
                        <i class="fas fa-pause"></i> Suspend
                    </button>
                `}
                <button class="danger-btn action-btn" onclick="deleteUser(${user.id})" title="Delete User">
                    <i class="fas fa-trash"></i> Delete
                </button>
            </div>
        </div>
    `).join('');
    
    console.log('Users list rendered successfully');
}

// Enhanced delete user function with more checks
function deleteUser(userId) {
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const user = users.find(u => u.id === userId);
    
    if (!user) return;
    
    // Check if user has any bookings
    const appointments = JSON.parse(localStorage.getItem('appointments')) || [];
    const userAppointments = appointments.filter(apt => apt.patientPhone === user.phone);
    
    let warningMessage = `Are you sure you want to delete user: ${user.name}?`;
    
    if (userAppointments.length > 0) {
        warningMessage += `\n\nWARNING: This user has ${userAppointments.length} booking(s). Deleting the user will also remove their booking history.`;
    }
    
    if (confirm(warningMessage)) {
        const userIndex = users.findIndex(u => u.id === userId);
        
        if (userIndex > -1) {
            const userName = users[userIndex].name;
            
            // Remove user
            users.splice(userIndex, 1);
            localStorage.setItem('users', JSON.stringify(users));
            
            // Remove user's appointments
            if (userAppointments.length > 0) {
                const updatedAppointments = appointments.filter(apt => apt.patientPhone !== user.phone);
                localStorage.setItem('appointments', JSON.stringify(updatedAppointments));
            }
            
            logAdminActivity('user', `Deleted user: ${userName} (${userAppointments.length} bookings removed)`);
            
            showNotification('User deleted successfully!', 'success');
            updateAdminDashboard();
        }
    }
}

// Add modal close event listeners
document.addEventListener('DOMContentLoaded', function() {
    // Close modals when clicking outside
    window.addEventListener('click', function(event) {
        const editUserModal = document.getElementById('editUserModal');
        if (event.target === editUserModal) {
            closeEditUserModal();
        }
        
        const customModal = document.getElementById('customModal');
        if (event.target === customModal) {
            customModal.style.display = 'none';
        }
    });
    
    // Close modals with escape key
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape') {
            closeEditUserModal();
            const customModal = document.getElementById('customModal');
            if (customModal) {
                customModal.style.display = 'none';
            }
        }
    });
});

