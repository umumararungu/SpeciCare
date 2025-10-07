const express = require('express');
const router = express.Router();

// Sample medical tests data
const medicalTests = [
    {
        id: 1,
        name: 'MRI Scan',
        category: 'Radiology',
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
        category: 'Radiology',
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
        category: 'Laboratory',
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
        category: 'Radiology',
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
        category: 'Radiology',
        hospital: 'Kigali Central Hospital',
        location: 'Kigali',
        price: 35000,
        duration: '30 minutes',
        description: 'Abdominal ultrasound for organ examination',
        available: true,
        insuranceCovered: true
    }
];

// Get all tests
router.get('/', (req, res) => {
    const { search, location, category, minPrice, maxPrice } = req.query;

    let filteredTests = medicalTests;

    // Apply filters
    if (search) {
        filteredTests = filteredTests.filter(test =>
            test.name.toLowerCase().includes(search.toLowerCase()) ||
            test.description.toLowerCase().includes(search.toLowerCase())
        );
    }

    if (location) {
        filteredTests = filteredTests.filter(test =>
            test.location.toLowerCase().includes(location.toLowerCase())
        );
    }

    if (category) {
        filteredTests = filteredTests.filter(test =>
            test.category.toLowerCase() === category.toLowerCase()
        );
    }

    if (minPrice) {
        filteredTests = filteredTests.filter(test => test.price >= parseInt(minPrice));
    }

    if (maxPrice) {
        filteredTests = filteredTests.filter(test => test.price <= parseInt(maxPrice));
    }

    res.json({
        success: true,
        count: filteredTests.length,
        tests: filteredTests
    });
});

// Get test by ID
router.get('/:id', (req, res) => {
    const testId = parseInt(req.params.id);
    const test = medicalTests.find(t => t.id === testId);

    if (!test) {
        return res.status(404).json({
            success: false,
            message: 'Test not found'
        });
    }

    res.json({
        success: true,
        test
    });
});

// Get tests by hospital
router.get('/hospital/:hospital', (req, res) => {
    const hospital = req.params.hospital;
    const hospitalTests = medicalTests.filter(test =>
        test.hospital.toLowerCase().includes(hospital.toLowerCase())
    );

    res.json({
        success: true,
        count: hospitalTests.length,
        tests: hospitalTests
    });
});

// Get available categories
router.get('/categories/all', (req, res) => {
    const categories = [...new Set(medicalTests.map(test => test.category))];
    res.json({
        success: true,
        categories
    });
});

module.exports = router;
