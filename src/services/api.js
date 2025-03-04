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

export const registerUser = async (userData) => {
    try {
        const response = await axios.post(`${API_URL}/register`, userData, {
            headers: {
                'Content-Type': 'application/json',
            }
        });
        return response.data;
    } catch (error) {
        const errorMessage = handleApiError(error, 'Registration failed');
        throw new Error(errorMessage);
    }
};

export const loginUser = async (credentials) => {
    try {
        const response = await axios.post(`${API_URL}/login`, credentials, {
            headers: {
                'Content-Type': 'application/json',
            }
        });
        localStorage.setItem(config.AUTH.TOKEN_KEY, response.data.token);
        localStorage.setItem(config.AUTH.WALLET_KEY, response.data.walletAddress || '');
        return response.data;
    } catch (error) {
        const errorMessage = handleApiError(error, 'Login failed');
        throw new Error(errorMessage);
    }
};

export const isAuthenticated = () => {
    return !!localStorage.getItem(config.AUTH.TOKEN_KEY);
};

export const isTokenExpired = () => {
    const token = localStorage.getItem(config.AUTH.TOKEN_KEY);
    if (!token) return true;
    
    try {
        // Get token payload
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const payload = JSON.parse(window.atob(base64));
        
        // Check if token is expired
        const currentTime = Date.now() / 1000;
        return payload.exp < currentTime;
    } catch (e) {
        console.error('Error parsing token:', e);
        return true;
    }
};

export const logoutUser = async () => {
    try {
        const token = localStorage.getItem(config.AUTH.TOKEN_KEY);
        await axios.post(
            `${API_URL}/logout`,
            {},
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            }
        );
        clearUserData();
    } catch (error) {
        console.error('Logout failed:', error);
        clearUserData();
    }
};

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

export const updateUser = async (userId, updates) => {
    try {
        const response = await axios.put(`${API_URL}/${userId}`, updates, {
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
        localStorage.setItem(config.AUTH.WALLET_KEY, walletAddress || '');
        return response.data;
    } catch (error) {
        const errorMessage = handleApiError(error, 'Error connecting wallet');
        throw new Error(errorMessage);
    }
};

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

export const getAllUsers = async () => {
    try {
        const response = await axios.get(`${API_URL}/`, {
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

const clearUserData = () => {
    localStorage.removeItem(config.AUTH.TOKEN_KEY);
    localStorage.removeItem(config.AUTH.USER_ID_KEY);
    localStorage.removeItem(config.AUTH.USERNAME_KEY);
    localStorage.removeItem(config.AUTH.ROLE_KEY);
    localStorage.removeItem(config.AUTH.WALLET_KEY);
};