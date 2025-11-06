// context/AppContext.js
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import axios from "axios";

const AppContext = createContext();

// Helper: convert snake_case keys to camelCase recursively for objects returned by backend
const toCamel = (s) => String(s).replace(/_([a-z])/g, (m, p1) => p1.toUpperCase());
const camelizeObject = (obj) => {
  if (!obj || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map(camelizeObject);
  const out = {};
  Object.keys(obj).forEach((k) => {
    const v = obj[k];
    const key = toCamel(k);
    out[key] = camelizeObject(v);
  });
  return out;
};

// Custom hook to use the app context
export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
};

export const AppProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [testResults, setTestResults] = useState([]);
  const [currentTest, setCurrentTest] = useState(null);
  const [medicalTests, setMedicalTests] = useState([]);
  const [activeSection, setActiveSection] = useState("home");
  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState(null);
  const [errors, setErrors] = useState([]);
  const [adminStats, setAdminStats] = useState(null);
  const [allUsers, setAllUsers] = useState([]);
  const [allAppointments, setAllAppointments] = useState([]);
  const [hospitals, setHospitals] = useState([]);
  const [currentResultDraft, setCurrentResultDraft] = useState(null);

  const API_BASE = "http://localhost:5000/api";

  // Check if user is admin
  const isAdmin = currentUser?.role === "admin";

  // Clear errors
  const clearErrors = () => setErrors([]);

  // Enhanced notification system
  const showNotification = (message, type = "info", duration = 5000) => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), duration);
  };

  // Show multiple errors
  const showErrors = (errorMessages, type = "error") => {
    if (Array.isArray(errorMessages)) {
      setErrors(errorMessages);
      // Also show the first error as a notification
      if (errorMessages.length > 0) {
        showNotification(errorMessages[0], type);
      }
    } else {
      setErrors([errorMessages]);
      showNotification(errorMessages, type);
    }
  };

  // Fetch admin-specific data - defined with useCallback to avoid infinite re-renders
  const fetchAdminData = useCallback(async () => {
    try {
      const [statsRes, usersRes, appointmentsRes] = await Promise.all([
        axios.get(`${API_BASE}/admin/dashboard/stats`, {
          withCredentials: true,
        }),
        axios.get(`${API_BASE}/admin/users`, { withCredentials: true }),
        axios.get(`${API_BASE}/admin/appointments`, { withCredentials: true }),
      ]);
  setAdminStats(statsRes.data.stats);
  setAllUsers(camelizeObject(usersRes.data.users || []));
  setAllAppointments(camelizeObject(appointmentsRes.data.appointments || []));
    } catch (error) {
      console.error("Error fetching admin data:", error);
      showNotification("Error loading admin data", "error");
    }
  }, [API_BASE]); // Only depend on API_BASE since it's a constant

  // Enhanced initializeData for admin
  const initializeData = useCallback(async () => {
    try {
      setIsLoading(true);

      // Fetch logged-in user
      const userRes = await axios.get(`${API_BASE}/users/me`, {
        withCredentials: true,
      });
      setCurrentUser(camelizeObject(userRes.data.user));

      // Fetch medical tests
      const testsRes = await axios.get(`${API_BASE}/medical-test`);
      console.log("medical test: ", testsRes);
  setMedicalTests(camelizeObject(testsRes.data || []));

      const hospitalsRes = await axios.get(`${API_BASE}/hospitals`, {
        withCredentials: true,
      });
  setHospitals(camelizeObject(hospitalsRes.data.hospitals || []));

      const apptsRes = await axios.get(`${API_BASE}/appointments/my`, {
        withCredentials: true,
      });
  setAppointments(camelizeObject(apptsRes.data || []));
      console.log("appointments: ", apptsRes.data);

      // If user is admin, fetch admin data
        if (userRes.data.user.role === "admin") {
        await fetchAdminData();
      } else {
        // Regular user data
        const apptsRes = await axios.get(`${API_BASE}/appointments/my`, {
          withCredentials: true,
        });
        setAppointments(camelizeObject(apptsRes.data || []));

        const resultsRes = await axios.get(`${API_BASE}/test-results/my`, {
          withCredentials: true,
        });
        setTestResults(camelizeObject(resultsRes.data || []));
      }

      setIsLoading(false);
    } catch (error) {
      console.error("Error initializing data:", error);
      setIsLoading(false);
      // If initialize fails (no session / server error), clear user and redirect to login
      setCurrentUser(null);
      setAppointments([]);
      setTestResults([]);
      setActiveSection("login");
    }
  }, [API_BASE, fetchAdminData]); // Include fetchAdminData in dependencies

  useEffect(() => {
    initializeData();
  }, [initializeData]);

  // -------------------------------
  // Authentication
  // -------------------------------
  const login = async (email, password) => {
    try {
      setIsLoading(true);
      clearErrors();

      const res = await axios.post(
        `${API_BASE}/users/login`,
        { email, password },
        { withCredentials: true }
      );

      if (res.data.success) {
        setCurrentUser(camelizeObject(res.data.user));
        setActiveSection("dashboard");
        showNotification(res.data.message, "success");
        clearErrors();

        // Reinitialize data after login
        await initializeData();

        setIsLoading(false);
        return true;
      } else {
        if (res.data.errors && res.data.errors.length > 0) {
          showErrors(res.data.errors, "error");
        } else {
          showErrors([res.data.message || "Login failed"], "error");
        }
        setIsLoading(false);
        return false;
      }
    } catch (error) {
      console.error("Login error:", error);

      if (error.response && error.response.data) {
        const backendError = error.response.data;
        if (backendError.errors && backendError.errors.length > 0) {
          showErrors(backendError.errors, "error");
        } else {
          showErrors([backendError.message || "Login failed"], "error");
        }
      } else if (error.request) {
        showErrors(
          [
            "Unable to connect to server. Please check your internet connection.",
          ],
          "error"
        );
      } else {
        showErrors(
          ["An unexpected error occurred. Please try again."],
          "error"
        );
      }

      setIsLoading(false);
      return false;
    }
  };

  const logout = async () => {
    try {
      await axios.post(
        `${API_BASE}/users/logout`,
        {},
        { withCredentials: true }
      );
      setCurrentUser(null);
      setCurrentTest(null);
      setActiveSection("home");
      setAppointments([]);
      setTestResults([]);
      setAdminStats(null);
      setAllUsers([]);
      setAllAppointments([]);
      showNotification("Logged out successfully", "success");
    } catch (error) {
      console.error("Logout error:", error);
      showNotification("Logout failed", "error");
    }
  };

  const register = async (userData) => {
    try {
      setIsLoading(true);
      clearErrors();

  const res = await axios.post(`${API_BASE}/users/register`, userData, { withCredentials: true });

      if (res.data.success) {
        setCurrentUser(camelizeObject(res.data.user));
        setActiveSection("dashboard");
        showNotification(res.data.message, "success");
        clearErrors();

        // Reinitialize data after registration
        await initializeData();

        setIsLoading(false);
        return true;
      } else {
        // Handle backend validation errors
        if (res.data.errors && res.data.errors.length > 0) {
          showErrors(res.data.errors, "error");
        } else {
          showErrors([res.data.message || "Registration failed"], "error");
        }
        setIsLoading(false);
        return false;
      }
    } catch (error) {
      console.error("Registration error:", error);

      // Handle axios errors
      if (error.response && error.response.data) {
        const backendError = error.response.data;
        if (backendError.errors && backendError.errors.length > 0) {
          showErrors(backendError.errors, "error");
        } else {
          showErrors([backendError.message || "Registration failed"], "error");
        }
      } else if (error.request) {
        showErrors(
          [
            "Unable to connect to server. Please check your internet connection.",
          ],
          "error"
        );
      } else {
        showErrors(
          ["An unexpected error occurred. Please try again."],
          "error"
        );
      }

      setIsLoading(false);
      return false;
    }
  };

  // -------------------------------
  // Booking / Appointments
  // -------------------------------
  const bookTest = (test) => {
    setCurrentTest(test);
  };

  const confirmBooking = async (bookingData) => {
    if (!currentUser) {
      showNotification("You must be logged in to book a test", "error");
      return;
    }
    try {
      setIsLoading(true);
      const res = await axios.post(
        `${API_BASE}/appointments`,
        {
          ...bookingData,
          patientId: currentUser.id,
        },
        { withCredentials: true }
      );
      setAppointments((prev) => [...prev, camelizeObject(res.data)]);
      setCurrentTest(null);
      showNotification("Booking confirmed successfully!", "success");
      setIsLoading(false);
    } catch (error) {
      console.error("Booking error:", error);
      showNotification(
        error.response?.data?.message || "Booking failed",
        "error"
      );
      setIsLoading(false);
    }
  };

  // -------------------------------
  // Admin Functions
  // -------------------------------
  const updateAppointmentStatus = async (appointmentId, status) => {
    try {
      const res = await axios.put(
        `${API_BASE}/admin/appointments/${appointmentId}/status`,
        { status },
        { withCredentials: true }
      );

      if (res.data.success) {
        // Update local state
        setAllAppointments((prev) =>
          prev.map((apt) =>
            apt.id === appointmentId ? { ...apt, status } : apt
          )
        );

        showNotification(res.data.message, "success");
        // return the updated appointment so callers can act on it
        return res.data.appointment || null;
      }
    } catch (error) {
      console.error("Update appointment error:", error);
      showNotification(
        error.response?.data?.message || "Error updating appointment",
        "error"
      );
      return null;
    }
  };

  // Create a test result (admin)
  const createTestResult = async (payload) => {
    try {
      let res;
      // If payload is FormData (multipart), let the browser set headers
      if (typeof FormData !== 'undefined' && payload instanceof FormData) {
        res = await axios.post(`${API_BASE}/test-results`, payload, { withCredentials: true });
      } else {
        res = await axios.post(`${API_BASE}/test-results`, payload, { withCredentials: true });
      }

      if (res.data && res.data.success) {
        // Optionally refresh testResults or admin data
        await refreshAdminData();
        showNotification('Test result created successfully', 'success');
        return res.data.testResult;
      }
    } catch (error) {
      console.error('Create test result error:', error);
      showNotification(error.response?.data?.message || 'Error creating test result', 'error');
    }
    return null;
  };

  const createMedicalTest = async (testData) => {
    try {
      const res = await axios.post(`${API_BASE}/admin/medical-test`, testData, {
        withCredentials: true,
      });

      if (res.data.success) {
        // Update local state
        setMedicalTests((prev) => [...prev, res.data.test]);
        showNotification(res.data.message, "success");
        return true;
      }
    } catch (error) {
      console.error("Create test error:", error);
      showNotification(
        error.response?.data?.message || "Error creating test",
        "error"
      );
      return false;
    }
  };

  const updateMedicalTest = async (testId, updates) => {
    try {
      const res = await axios.put(`${API_BASE}/admin/medical-test/${testId}`, updates, {
        withCredentials: true,
      });

      if (res.data && res.data.success) {
        setMedicalTests((prev) => prev.map((t) => (t.id === testId ? { ...t, ...updates } : t)));
        showNotification(res.data.message || 'Medical test updated', 'success');
        return true;
      }
    } catch (error) {
      console.error('Update test error:', error);
      showNotification(error.response?.data?.message || 'Error updating test', 'error');
      return false;
    }
  };

  const deleteMedicalTest = async (testId) => {
    try {
      const res = await axios.delete(
        `${API_BASE}/admin/medical-test/${testId}`,
        { withCredentials: true }
      );

      if (res.data.success) {
        // Update local state
        setMedicalTests((prev) => prev.filter((test) => test.id !== testId));
        showNotification(res.data.message, "success");
        return true;
      }
    } catch (error) {
      console.error("Delete test error:", error);
      showNotification(
        error.response?.data?.message || "Error deleting test",
        "error"
      );
      return false;
    }
  };

  const deleteUser = async (userId) => {
    try {
      const res = await axios.delete(`${API_BASE}/admin/users/${userId}`, {
        withCredentials: true,
      });

      if (res.data.success) {
        // Update local state
        setAllUsers((prev) => prev.filter((user) => user.id !== userId));
        showNotification(res.data.message, "success");
        return true;
      }
    } catch (error) {
      console.error("Delete user error:", error);
      showNotification(
        error.response?.data?.message || "Error deleting user",
        "error"
      );
      return false;
    }
  };

  // -------------------------------
  // Hospital Management
  // -------------------------------
  const fetchHospitals = async () => {
    try {
      const res = await axios.get(`${API_BASE}/hospitals`, {
        withCredentials: true,
      });
      setHospitals(camelizeObject(res.data.hospitals || []));
    } catch (error) {
      console.error("Error fetching hospitals:", error);
      showNotification("Error loading hospitals", "error");
    }
  };

  const createHospital = async (hospitalData) => {
    try {
      const res = await axios.post(
        `${API_BASE}/admin/hospitals`,
        hospitalData,
        { withCredentials: true }
      );

      if (res.data.success) {
        setHospitals((prev) => [...prev, camelizeObject(res.data.hospital)]);
        showNotification(
          res.data.message || "Hospital added successfully",
          "success"
        );
        return true;
      }
    } catch (error) {
      console.error("Create hospital error:", error);
      showNotification(
        error.response?.data?.message || "Error creating hospital",
        "error"
      );
      return false;
    }
  };

  const updateHospital = async (hospitalId, updates) => {
    try {
      const res = await axios.put(
        `${API_BASE}/admin/hospitals/${hospitalId}`,
        updates,
        { withCredentials: true }
      );

      if (res.data.success) {
        setHospitals((prev) =>
          prev.map((h) => (h.id === hospitalId ? { ...h, ...updates } : h))
        );
        showNotification(
          res.data.message || "Hospital updated successfully",
          "success"
        );
        return true;
      }
    } catch (error) {
      console.error("Update hospital error:", error);
      showNotification(
        error.response?.data?.message || "Error updating hospital",
        "error"
      );
      return false;
    }
  };

  const deleteHospital = async (hospitalId) => {
    try {
      const res = await axios.delete(
        `${API_BASE}/admin/hospitals/${hospitalId}`,
        { withCredentials: true }
      );

      if (res.data.success) {
        setHospitals((prev) => prev.filter((h) => h.id !== hospitalId));
        showNotification(
          res.data.message || "Hospital deleted successfully",
          "success"
        );
        return true;
      }
    } catch (error) {
      console.error("Delete hospital error:", error);
      showNotification(
        error.response?.data?.message || "Error deleting hospital",
        "error"
      );
      return false;
    }
  };

  // Refresh admin data
  const refreshAdminData = async () => {
    if (isAdmin) {
      await fetchAdminData();
    }
  };

  // -------------------------------
  // Values exposed to components
  // -------------------------------
  const value = {
    // State
    currentUser,
    appointments: isAdmin ? allAppointments : appointments,
    testResults,
    currentTest,
    currentResultDraft,
    medicalTests,
    hospitals,
    activeSection,
    isLoading,
    notification,
    errors,
    adminStats,
  allUsers,
  allAppointments,
    isAdmin,

    // Setters
    setActiveSection,
    setMedicalTests,
  setCurrentResultDraft,

    // Auth functions
    login,
    logout,
    register,

    // Booking functions
    bookTest,
    confirmBooking,
    setCurrentTest,

    // Notification functions
    showNotification,
    showErrors,
    clearErrors,

    // Hospital functions
    fetchHospitals,
    createHospital,
    updateHospital,
    deleteHospital,

    // Admin functions
    updateAppointmentStatus,
    createTestResult,
    createMedicalTest,
  updateMedicalTest,
    deleteMedicalTest,
    deleteUser,
    refreshAdminData,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export default AppProvider;
