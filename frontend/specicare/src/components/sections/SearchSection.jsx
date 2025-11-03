import React, { useState, useMemo } from "react";
import { useApp } from "../../context/AppContext";

const SearchSection = () => {
  const {
    medicalTests,
    bookTest,
    currentUser,
    setActiveSection,
    currentTest,
    hospitals,
  } = useApp();

  const [searchTerm, setSearchTerm] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [priceFilter, setPriceFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");

  console.log("Current Test State:", currentTest); // Debug log

  // Filter tests - same logic as your vanilla JS
  const filteredTests = useMemo(() => {
    return medicalTests.filter((test) => {
      const hospital = hospitals.find(
        (hospital) => test.hospital_id === hospital.id
      );
      const matchesSearch =
        test.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        test.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        searchTerm === "";

      console.log("hospital: ", hospital);
      const matchesLocation =
        hospital.district.toLowerCase().includes(locationFilter) ||
        locationFilter === "";
      const matchesCategory =
        test.category === categoryFilter || categoryFilter === "";

      let matchesPrice = true;
      if (priceFilter === "0-10000") {
        matchesPrice = test.price <= 10000;
      } else if (priceFilter === "10000-50000") {
        matchesPrice = test.price >= 10000 && test.price <= 50000;
      } else if (priceFilter === "50000-100000") {
        matchesPrice = test.price >= 50000 && test.price <= 100000;
      } else if (priceFilter === "100000+") {
        matchesPrice = test.price > 100000;
      }

      return (
        matchesSearch && matchesLocation && matchesPrice && matchesCategory
      );
    });
  }, [
    medicalTests,
    searchTerm,
    locationFilter,
    priceFilter,
    categoryFilter,
    hospitals,
  ]);

  const handleBookTest = (test) => {
    console.log("Book Now clicked for test:", test); // Debug log

    if (!currentUser) {
      console.log("No user - redirecting to login");
      setActiveSection("login");
      return;
    }

    console.log("Calling bookTest function with:", test);
    bookTest(test);
  };

  return (
    <section id="search" className="section active">
      <div className="search-header">
        <h2>Find Medical Tests</h2>
        <p>Search and book specialized tests across Rwanda's top hospitals</p>
      </div>

      <div className="search-container">
        <div className="search-box">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search for tests (e.g., MRI, Blood Test, X-Ray)"
          />
          <button>
            <i className="fas fa-search"></i> Search
          </button>
        </div>

        <div className="filters">
          <select
            value={locationFilter}
            onChange={(e) => setLocationFilter(e.target.value)}
          >
            <option value="">All Locations</option>
            <option value="kigali">Kigali</option>
            <option value="bugesera">Bugesera</option>
            <option value="muhanga">Muhanga</option>
            <option value="huye">Huye</option>
          </select>

          <select
            value={priceFilter}
            onChange={(e) => setPriceFilter(e.target.value)}
          >
            <option value="">Any Price</option>
            <option value="0-10000">Under 10,000 RWF</option>
            <option value="10000-50000">10,000 - 50,000 RWF</option>
            <option value="50000-100000">50,000 - 100,000 RWF</option>
            <option value="100000+">Over 100,000 RWF</option>
          </select>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="">All Categories</option>
            <option value="radiology">Radiology</option>
            <option value="laboratory">Laboratory</option>
            <option value="cardiology">Cardiology</option>
            <option value="neurology">Neurology</option>
          </select>
        </div>
      </div>

      <div className="results-container">
        {filteredTests.length === 0 ? (
          <div className="no-results">
            <i className="fas fa-search"></i>
            <h3>No tests found</h3>
            <p>Try adjusting your search criteria</p>
          </div>
        ) : (
          filteredTests.map((test) => {
            const hospital = hospitals.find(
              (hospital) => hospital.id === test.hospital_id
            );
            return (
              <div key={test.id} className="test-card">
                <div className="test-info">
                  <h3>{test.name}</h3>
                  <p className="hospital">{hospital.name}</p>
                  <p className="location">
                    <i className="fas fa-map-marker-alt"></i> {hospital.district} •{" "}
                    {test.category}
                  </p>
                  <p className="description">{test.description}</p>
                  <p className="price">{test.price.toLocaleString()} RWF</p>
                </div>
                <button
                  className="book-btn"
                  onClick={() => handleBookTest(test)}
                >
                  <i className="fas fa-calendar-plus"></i> Book Now
                </button>
              </div>
            );
          })
        )}
      </div>
    </section>
  );
};

export default SearchSection;
