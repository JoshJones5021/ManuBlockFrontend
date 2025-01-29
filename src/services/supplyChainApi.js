import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api/supply-chains';

export const getAllSupplyChains = async () => {
    try {
        const response = await axios.get(API_BASE_URL, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching supply chains:', error);
        throw error;
    }
};

export const createSupplyChain = async (supplyChain) => {
    try {
        const response = await axios.post(`${API_BASE_URL}/create`, supplyChain, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json',
            },
        });
        return response.data;
    } catch (error) {
        console.error('Error creating supply chain:', error);
        throw error;
    }
};

export const getSupplyChainById = async (id) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/${id}`, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
        });
        return response.data;
    } catch (error) {
        console.error("Error fetching supply chain:", error);
        throw error;
    }
};

export const updateSupplyChain = async (id, updatedSupplyChain) => {
    try {
        const response = await axios.put(`${API_BASE_URL}/${id}`, updatedSupplyChain, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
                "Content-Type": "application/json",
            },
        });
        return response.data;
    } catch (error) {
        console.error(`Error updating supply chain ${id}:`, error.response?.data || error.message);
        throw error;
    }
};