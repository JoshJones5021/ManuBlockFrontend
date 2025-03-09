import axios from 'axios';
import config from '../components/common/config';

const API_URL = config.API.USERS;

const handleApiError = (error, customMessage) => {
    if (error.response) {
        if (error.response.status === 401) {
            localStorage.removeItem(config.AUTH.TOKEN_KEY);
            return `Session expired. Please login again.`;
        } else {
            return error.response.data.error || customMessage;
        }
    } else if (error.request) {
        return 'Network error. Please check your connection.';
    } else {
        return 'An unexpected error occurred.';
    }
};

// Get all users
export const getAllUsers = async () => {
    try {
        const response = await axios.get(API_URL, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem(config.AUTH.TOKEN_KEY)}`,
            }
        });
        return response.data;
    } catch (error) {
        const errorMessage = handleApiError(error, 'Error fetching users');
        throw new Error(errorMessage);
    }
};

// Get a specific user by ID
export const getUserById = async (userId) => {
    try {
        const response = await axios.get(`${API_URL}/${userId}`, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem(config.AUTH.TOKEN_KEY)}`,
            }
        });
        return response.data;
    } catch (error) {
        const errorMessage = handleApiError(error, 'Error fetching user');
        throw new Error(errorMessage);
    }
};

// Create a new user
export const createUser = async (userData) => {
    try {
        const response = await axios.post(`${API_URL}/register`, userData, {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${localStorage.getItem(config.AUTH.TOKEN_KEY)}`,
            }
        });
        return response.data;
    } catch (error) {
        const errorMessage = handleApiError(error, 'Error creating user');
        throw new Error(errorMessage);
    }
};

// Update an existing user
export const updateUser = async (userId, userData) => {
    try {
        const response = await axios.put(`${API_URL}/${userId}`, userData, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem(config.AUTH.TOKEN_KEY)}`,
                'Content-Type': 'application/json'
            }
        });
        return response.data;
    } catch (error) {
        const errorMessage = handleApiError(error, 'Error updating user');
        throw new Error(errorMessage);
    }
};

// Delete a user
export const deleteUser = async (userId) => {
    try {
        const response = await axios.delete(`${API_URL}/${userId}`, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem(config.AUTH.TOKEN_KEY)}`,
            }
        });
        return response.data;
    } catch (error) {
        const errorMessage = handleApiError(error, 'Error deleting user');
        throw new Error(errorMessage);
    }
};

// Get all available roles
export const getAllRoles = async () => {
    try {
        const response = await axios.get(`${API_URL}/roles`, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem(config.AUTH.TOKEN_KEY)}`,
            }
        });
        return response.data;
    } catch (error) {
        const errorMessage = handleApiError(error, 'Error fetching roles');
        throw new Error(errorMessage);
    }
};

// Assign a role to a user
export const assignRole = async (userId, role) => {
    try {
        const response = await axios.post(`${API_URL}/${userId}/assign-role?role=${role}`, 
            {},
            {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem(config.AUTH.TOKEN_KEY)}`,
                    'Content-Type': 'application/json'
                }
            }
        );
        return response.data;
    } catch (error) {
        const errorMessage = handleApiError(error, 'Error assigning role');
        throw new Error(errorMessage);
    }
};

// Connect wallet to a user
export const connectWallet = async (userId, walletAddress) => {
    try {
        const response = await axios.post(`${API_URL}/${userId}/connect-wallet`, 
            { walletAddress },
            {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem(config.AUTH.TOKEN_KEY)}`,
                    'Content-Type': 'application/json'
                }
            }
        );
        return response.data;
    } catch (error) {
        const errorMessage = handleApiError(error, 'Error connecting wallet');
        throw new Error(errorMessage);
    }
};