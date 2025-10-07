// Global variables
let currentTest = '';
let currentHospital = '';
let appointments = JSON.parse(localStorage.getItem('appointments')) || [];
let testResults = JSON.parse(localStorage.getItem('testResults')) || [];

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    showSection('home');
    updateDashboard();
    
    // Setup form submission
    document.getElementById('bookingForm').addEventListener('submit', handleBooking);
});

// Navigation functions
function showSection(sectionId) {
    // Hide all sections
    document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active');
    });
    
    // Show selected section
    document.getElementById(sectionId).classList.add('active');
    
    // Update navigation
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
    });
    event.target.classList.add('active');
}

// Search functionality
function searchTests() {
    const searchTerm = document.getElementById('testSearch').value.toLowerCase();
    const locationFilter = document.getElementById('locationFilter').value;
    const priceFilter = document.getElementById('priceFilter').value;
    
    const testCards = document.querySelectorAll('.test-card');
    
    testCards.forEach(card => {
        const testName = card.querySelector('h3').textContent.toLowerCase();
        const testLocation = card.querySelector('.location').textContent.toLowerCase();
        const testPrice = parseInt(card.querySelector('.price').textContent);
        
        let matchesSearch = testName.includes(searchTerm) || searchTerm === '';
        let matchesLocation = testLocation.includes(locationFilter) || locationFilter === '';
        let matchesPrice = true;
        
        if (priceFilter === '0-10000') {
            matchesPrice = testPrice <= 10000;
        } else if (priceFilter === '10000-50000') {
            matchesPrice = testPrice >= 10000 && testPrice <= 50000;
        } else if (priceFilter === '50000+') {
            matchesPrice = testPrice > 50000;
        }
        
        if (matchesSearch && matchesLocation && matchesPrice) {
            card.style.display = 'flex';
        } else {
            card.style.display = 'none';
        }
    });
}

// Booking functionality
function bookTest(test, hospital) {
    currentTest = test;
    currentHospital = hospital;
    
    document.getElementById('bookingTest').value = test;
    document.getElementById('bookingHospital').value = hospital;
    document.getElementById('bookingModal').style.display = 'block';
}

function closeBooking() {
    document.getElementById('bookingModal').style.display = 'none';
    document.getElementById('bookingForm').reset();
}

function handleBooking(event) {
    event.preventDefault();
    
    const formData = {
        test: currentTest,
        hospital: currentHospital,
        name: document.getElementById('patientName').value,
        phone: document.getElementById('patientPhone').value,
        insurance: document.getElementById('insuranceNumber').value,
        date: document.getElementById('appointmentDate').value,
        status: 'confirmed',
        id: Date.now()
    };
    
    appointments.push(formData);
    localStorage.setItem('appointments', JSON.stringify(appointments));
    
    // Simulate SMS notification
    simulateSMSNotification(formData.phone, formData);
    
    alert('Booking confirmed! You will receive an SMS confirmation shortly.');
    closeBooking();
    updateDashboard();
    showSection('dashboard');
}

// SMS Simulation
function simulateSMSNotification(phone, appointment) {
    console.log(`SMS sent to ${phone}:`);
    console.log(`SpeciCare: Your ${appointment.test} is booked at ${appointment.hospital} on ${appointment.date}. Bring your insurance card.`);
    
    // In a real app, this would call Africa's Talking API
    // fetch('/api/send-sms', {
    //     method: 'POST',
    //     headers: {'Content-Type': 'application/json'},
    //     body: JSON.stringify({
    //         phone: phone,
    //         message: `SpeciCare: Your ${appointment.test} is booked at ${appointment.hospital} on ${appointment.date}.`
    //     })
    // });
}

// Dashboard functionality
function updateDashboard() {
    updateAppointmentList();
    updateResultsList();
}

function updateAppointmentList() {
    const appointmentList = document.getElementById('appointmentList');
    appointmentList.innerHTML = '';
    
    if (appointments.length === 0) {
        appointmentList.innerHTML = '<p>No upcoming appointments</p>';
        return;
    }
    
    appointments.forEach(appointment => {
        const appointmentItem = document.createElement('div');
        appointmentItem.className = 'appointment-item';
        appointmentItem.innerHTML = `
            <strong>${appointment.test}</strong>
            <p>${appointment.hospital}</p>
            <p>Date: ${appointment.date}</p>
            <p>Status: <span style="color: var(--teal)">${appointment.status}</span></p>
        `;
        appointmentList.appendChild(appointmentItem);
    });
}

function updateResultsList() {
    const resultsList = document.getElementById('resultsList');
    resultsList.innerHTML = '';
    
    if (testResults.length === 0) {
        resultsList.innerHTML = '<p>No test results available</p>';
        return;
    }
    
    testResults.forEach(result => {
        const resultItem = document.createElement('div');
        resultItem.className = 'result-item';
        resultItem.innerHTML = `
            <strong>${result.test}</strong>
            <p>Date: ${result.date}</p>
            <p>Status: ${result.status}</p>
            ${result.file ? `<button onclick="downloadResult('${result.file}')" class="book-btn">Download</button>` : ''}
        `;
        resultsList.appendChild(resultItem);
    });
}

function downloadResult(filename) {
    alert(`Downloading: ${filename}`);
    // In real implementation, this would download the actual file
}

// Sample data initialization
function initializeSampleData() {
    if (!localStorage.getItem('sampleDataInitialized')) {
        const sampleResults = [
            {
                test: 'Blood Test',
                date: '2024-01-15',
                status: 'Completed',
                file: 'blood_test_results.pdf'
            },
            {
                test: 'X-Ray Chest',
                date: '2024-01-10',
                status: 'Completed', 
                file: 'xray_results.pdf'
            }
        ];
        
        localStorage.setItem('testResults', JSON.stringify(sampleResults));
        localStorage.setItem('sampleDataInitialized', 'true');
        testResults = sampleResults;
        updateDashboard();
    }
}

// Initialize sample data on first load
initializeSampleData();

// Close modal if clicked outside
window.onclick = function(event) {
    const modal = document.getElementById('bookingModal');
    if (event.target === modal) {
        closeBooking();
    }
}