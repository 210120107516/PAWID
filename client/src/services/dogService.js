import axios from 'axios';

// Define the base URL for the dog API endpoints
const API_URL = `${import.meta.env.VITE_API_URL}/dogs` || 'http://localhost:4000/api/dogs';

// Helper function to get the auth token from local storage
const getAuthToken = () => localStorage.getItem('authToken');

// Helper function to create the authorization header
const getAuthConfig = () => {
    const token = getAuthToken();
    if (!token) {
        console.error("No auth token found for API request.");
        // Optionally throw an error or handle appropriately
        return {}; // Return empty config if no token
    }
    return {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    };
};

// Create a new dog
const createDog = async (dogData) => {
    const response = await axios.post(API_URL, dogData, getAuthConfig());
    return response.data;
};

// Get dogs belonging to the logged-in user
const getMyDogs = async () => {
    const response = await axios.get(`${API_URL}/mydogs`, getAuthConfig());
    return response.data;
};

// Get a single dog by ID
const getDogById = async (id) => {
    const response = await axios.get(`${API_URL}/${id}`, getAuthConfig());
    return response.data;
};

// Update an existing dog
const updateDog = async (id, dogData) => {
    const response = await axios.put(`${API_URL}/${id}`, dogData, getAuthConfig());
    return response.data;
};

// Delete a dog
const deleteDog = async (id) => {
    const response = await axios.delete(`${API_URL}/${id}`, getAuthConfig());
    return response.data; // Contains { message: '...', _id: '...' }
};


const dogService = {
    createDog,
    getMyDogs,
    getDogById,
    updateDog,
    deleteDog,
};

export default dogService;