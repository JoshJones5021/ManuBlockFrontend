import axios from 'axios';
import config from '../components/common/config';

const API_BASE_URL = 'http://localhost:8080/api/customer';

const handleApiError = (error, customMessage) => {
    if (error.response) {
        if (error.response.status === 401) {
            localStorage.removeItem(config.AUTH.TOKEN_KEY);
            window.location.href = '/login';
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

// Order Management
export const getOrders = async (customerId) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/orders/${customerId}`, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem(config.AUTH.TOKEN_KEY)}`,
            },
        });
        return response.data;
    } catch (error) {
        const errorMessage = handleApiError(error, 'Error fetching orders');
        throw new Error(errorMessage);
    }
};

export const getAvailableProducts = async () => {
    try {
        const response = await axios.get(`${API_BASE_URL}/products/available`, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem(config.AUTH.TOKEN_KEY)}`,
            },
        });
        return response.data;
    } catch (error) {
        const errorMessage = handleApiError(error, 'Error fetching available products');
        throw new Error(errorMessage);
    }
};

export const createOrder = async (orderData) => {
    try {
        const response = await axios.post(`${API_BASE_URL}/orders`, orderData, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem(config.AUTH.TOKEN_KEY)}`,
                'Content-Type': 'application/json',
            },
        });
        return response.data;
    } catch (error) {
        const errorMessage = handleApiError(error, 'Error creating order');
        throw new Error(errorMessage);
    }
};

export const getOrderDetails = async (orderNumber) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/orders/number/${orderNumber}`, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem(config.AUTH.TOKEN_KEY)}`,
            },
        });
        return response.data;
    } catch (error) {
        const errorMessage = handleApiError(error, 'Error fetching order details');
        throw new Error(errorMessage);
    }
};

export const cancelOrder = async (orderId) => {
    try {
        const response = await axios.post(`${API_BASE_URL}/orders/${orderId}/cancel`, {}, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem(config.AUTH.TOKEN_KEY)}`,
                'Content-Type': 'application/json',
            },
        });
        return response.data;
    } catch (error) {
        const errorMessage = handleApiError(error, 'Error cancelling order');
        throw new Error(errorMessage);
    }
};

export const confirmDelivery = async (orderId) => {
    try {
        const response = await axios.post(`${API_BASE_URL}/orders/${orderId}/confirm`, {}, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem(config.AUTH.TOKEN_KEY)}`,
                'Content-Type': 'application/json',
            },
        });
        return response.data;
    } catch (error) {
        const errorMessage = handleApiError(error, 'Error confirming delivery');
        throw new Error(errorMessage);
    }
};