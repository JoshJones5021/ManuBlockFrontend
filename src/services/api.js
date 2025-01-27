import axios from 'axios';

const API_URL = 'http://localhost:8080/api/users';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

export const registerUser = async (userData) => {
    console.log("Registering user with data:", userData);  // Debugging log
    return await api.post('/register', userData);
};

export const loginUser = async (credentials) => {
    const response = await axios.post(`${API_URL}/login`, credentials);
    localStorage.setItem('token', response.data.token);
    return response.data;
};

export const isAuthenticated = () => {
    return !!localStorage.getItem('token');
};

export const logoutUser = async () => {
    try {
        const token = localStorage.getItem('token');
        await axios.post(
            'http://localhost:8080/api/users/logout',
            {},
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                withCredentials: true
            }
        );
        // Remove token and redirect user
        localStorage.removeItem('token');
    } catch (error) {
        console.error('Logout failed:', error);
    }
};