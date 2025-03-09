import axios from 'axios';
import config from '../components/common/config';

const API_DISTRIBUTOR_URL = 'http://localhost:8080/api/distributor';
const API_TRACING_URL = 'http://localhost:8080/api/tracing';

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

export const getTransferById = async (transferId) => {
    try {
        const response = await axios.get(`${API_DISTRIBUTOR_URL}/transport/${transferId}`, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem(config.AUTH.TOKEN_KEY)}`,
            },
        });
        return response.data;
    } catch (error) {
        const errorMessage = handleApiError(error, 'Error fetching transfer details');
        throw new Error(errorMessage);
    }
};

export const getBlockchainTransaction = async (itemId) => {
    try {
        const response = await axios.get(`${API_TRACING_URL}/blockchain/transaction/${itemId}`, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem(config.AUTH.TOKEN_KEY)}`,
            },
        });
        return response.data;
    } catch (error) {
        const errorMessage = handleApiError(error, 'Error fetching blockchain transaction');
        throw new Error(errorMessage);
    }
};