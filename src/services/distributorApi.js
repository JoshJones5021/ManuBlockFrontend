import axios from 'axios';
import config from '../components/common/config';

const API_DISTRIBUTOR_URL = 'http://localhost:8080/api/distributor';

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

// Get all transports where the distributor is the source
export const getTransportsForSource = async (sourceId) => {
    try {
        const response = await axios.get(`${API_DISTRIBUTOR_URL}/transports/source/${sourceId}`, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem(config.AUTH.TOKEN_KEY)}`,
            },
        });
        return response.data;
    } catch (error) {
        const errorMessage = handleApiError(error, 'Error fetching outgoing transfers');
        throw new Error(errorMessage);
    }
};

// Get all transports where the distributor is the destination
export const getTransportsForDestination = async (destinationId) => {
    try {
        const response = await axios.get(`${API_DISTRIBUTOR_URL}/transports/destination/${destinationId}`, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem(config.AUTH.TOKEN_KEY)}`,
            },
        });
        return response.data;
    } catch (error) {
        const errorMessage = handleApiError(error, 'Error fetching incoming transfers');
        throw new Error(errorMessage);
    }
};

// Get details for a specific transport
export const getTransportDetail = async (transportId) => {
    try {
        const response = await axios.get(`${API_DISTRIBUTOR_URL}/transport/${transportId}`, {
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

// Update transport status (for pickup or delivery)
export const updateTransportStatus = async (transportId, statusData) => {
    try {
        const response = await axios.put(`${API_DISTRIBUTOR_URL}/transport/${transportId}/status`, statusData, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem(config.AUTH.TOKEN_KEY)}`,
                'Content-Type': 'application/json',
            },
        });
        return response.data;
    } catch (error) {
        const errorMessage = handleApiError(error, 'Error updating transfer status');
        throw new Error(errorMessage);
    }
};

// Schedule a new transport
export const scheduleTransport = async (transportData) => {
    try {
        const response = await axios.post(`${API_DISTRIBUTOR_URL}/transport/schedule`, transportData, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem(config.AUTH.TOKEN_KEY)}`,
                'Content-Type': 'application/json',
            },
        });
        return response.data;
    } catch (error) {
        const errorMessage = handleApiError(error, 'Error scheduling transport');
        throw new Error(errorMessage);
    }
};

// Cancel a scheduled transport
export const cancelTransport = async (transportId, reasonData) => {
    try {
        const response = await axios.post(`${API_DISTRIBUTOR_URL}/transport/${transportId}/cancel`, reasonData, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem(config.AUTH.TOKEN_KEY)}`,
                'Content-Type': 'application/json',
            },
        });
        return response.data;
    } catch (error) {
        const errorMessage = handleApiError(error, 'Error cancelling transport');
        throw new Error(errorMessage);
    }
};

// Get available vehicles/carriers for scheduling
export const getAvailableCarriers = async () => {
    try {
        const response = await axios.get(`${API_DISTRIBUTOR_URL}/carriers`, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem(config.AUTH.TOKEN_KEY)}`,
            },
        });
        return response.data;
    } catch (error) {
        const errorMessage = handleApiError(error, 'Error fetching available carriers');
        throw new Error(errorMessage);
    }
};

// Get transfer analytics for distributor dashboard
export const getTransferAnalytics = async (distributorId) => {
    try {
        const response = await axios.get(`${API_DISTRIBUTOR_URL}/analytics/${distributorId}`, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem(config.AUTH.TOKEN_KEY)}`,
            },
        });
        return response.data;
    } catch (error) {
        const errorMessage = handleApiError(error, 'Error fetching transfer analytics');
        throw new Error(errorMessage);
    }
};

export const getTransportsForDistributor = async (distributorId) => {
    try {
        const response = await axios.get(`${API_DISTRIBUTOR_URL}/transports/${distributorId}`, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem(config.AUTH.TOKEN_KEY)}`,
            },
        });
        return response.data;
    } catch (error) {
        const errorMessage = handleApiError(error, 'Error fetching distributor transfers');
        throw new Error(errorMessage);
    }
};

export const getReadyMaterialRequests = async () => {
    try {
        const response = await axios.get(`${API_DISTRIBUTOR_URL}/materials/ready`, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem(config.AUTH.TOKEN_KEY)}`,
            },
        });
        return response.data;
    } catch (error) {
        const errorMessage = handleApiError(error, 'Error fetching ready material requests');
        throw new Error(errorMessage);
    }
};

export const getManufacturers = async () => {
    try {
        const response = await axios.get(`${config.API.USERS}?role=MANUFACTURER`, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem(config.AUTH.TOKEN_KEY)}`,
            },
        });
        return response.data;
    } catch (error) {
        const errorMessage = handleApiError(error, 'Error fetching manufacturers');
        throw new Error(errorMessage);
    }
};

export const recordPickup = async (transportId) => {
    try {
        const response = await axios.post(`${API_DISTRIBUTOR_URL}/transport/${transportId}/pickup`, {}, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem(config.AUTH.TOKEN_KEY)}`
            }
        });
        return response.data;
    } catch (error) {
        const errorMessage = handleApiError(error, 'Error recording pickup');
        throw new Error(errorMessage);
    }
};

export const recordDelivery = async (transportId) => {
    try {
        const response = await axios.post(`${API_DISTRIBUTOR_URL}/transport/${transportId}/delivery`, {}, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem(config.AUTH.TOKEN_KEY)}`
            }
        });
        return response.data;
    } catch (error) {
        const errorMessage = handleApiError(error, 'Error recording delivery');
        throw new Error(errorMessage);
    }
};