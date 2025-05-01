import axios from 'axios';

const API_URL = `${import.meta.env.VITE_API_URL}/reports` || 'http://localhost:4000/api/reports';

// Helper to get auth token (reuse from dogService or create shared utility)
const getAuthToken = () => localStorage.getItem('authToken');
const getAuthConfig = (includeAuth = true) => {
    const config = { headers: {} };
    if (includeAuth) {
        const token = getAuthToken();
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        } else {
             console.warn("Attempting authenticated request without token.");
        }
    }
    return config;
};

// Create a new report (can be anonymous or authenticated)
const createReport = async (reportData) => {
    // Determine if auth is needed based on report type
    const needsAuth = ['Lost', 'Injured'].includes(reportData.reportType);
    const config = getAuthConfig(needsAuth); // Only include token if needed

    const response = await axios.post(API_URL, reportData, config);
    return response.data;
};

// Get reports for a specific dog (requires authentication)
const getReportsForDog = async (dogId) => {
    const config = getAuthConfig(true); // Always requires auth
    if (!config.headers['Authorization']) {
        throw new Error("Authentication required to view reports.");
    }
    const response = await axios.get(`${API_URL}/dog/${dogId}`, config);
    return response.data;
};

// Get all reports (requires Admin/Staff role)
const getAllReports = async () => {
    const config = getAuthConfig(true);
    if (!config.headers['Authorization']) {
        throw new Error("Authentication required to view all reports.");
    }
    const response = await axios.get(API_URL, config);
    return response.data;
};

// Update the status of a report (requires Admin/Staff role)
const updateReportStatus = async (reportId, statusData) => {
    const config = getAuthConfig(true);
    if (!config.headers['Authorization']) {
        throw new Error("Authentication required to update report status.");
    }
    const response = await axios.put(`${API_URL}/${reportId}/status`, statusData, config);
    return response.data;
};


const reportService = {
    createReport,
    getReportsForDog,
    getAllReports,      // Add new function
    updateReportStatus, // Add new function
};

export default reportService;