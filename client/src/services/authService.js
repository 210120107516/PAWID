import axios from 'axios';

// Define the base URL for the API. Use environment variables for flexibility.
const API_URL = `${import.meta.env.VITE_API_URL}/auth` || 'http://localhost:4000/api/auth';

// Set up axios instance for attaching token later if needed
const api = axios.create({
    baseURL: API_URL,
});

// Function to register a user
const register = async (name, email, password, role) => {
    const response = await api.post('/register', { name, email, password, role });
    return response.data; // Contains user info and token
};

// Function to login a user
const login = async (email, password) => {
    const response = await api.post('/login', { email, password });
    // Store token upon successful login
    if (response.data.token) {
        localStorage.setItem('authToken', response.data.token);
    }
    return response.data; // Contains user info and token
};

// Function to get the current user's profile (requires token)
const getMe = async (token) => {
    const config = {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    };
    const response = await api.get('/me', config);
    return response.data; // Contains user info (_id, name, email, role)
};

// Function to logout (client-side primarily, could call backend if needed)
const logout = () => {
    localStorage.removeItem('authToken');
};


const authService = {
    register,
    login,
    logout,
    getMe,
};

export default authService;