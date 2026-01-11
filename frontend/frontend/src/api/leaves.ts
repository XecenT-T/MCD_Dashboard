import axios from 'axios';

const API_URL = 'http://localhost:5000/api/leaves';

// Helper to get headers with token
const getHeaders = () => {
    const token = localStorage.getItem('token');
    return {
        headers: {
            'x-auth-token': token
        }
    };
};

export const createLeaveRequest = async (data: { type: string; dates: string; reason: string }) => {
    const response = await axios.post(API_URL, data, getHeaders());
    return response.data;
};

export const getMyLeaves = async () => {
    const response = await axios.get(`${API_URL}/my-requests`, getHeaders());
    return response.data;
};

export const getDepartmentLeaves = async () => {
    const response = await axios.get(`${API_URL}/department`, getHeaders());
    return response.data;
};

export const updateLeaveStatus = async (id: string, status: string) => {
    const response = await axios.put(`${API_URL}/${id}`, { status }, getHeaders());
    return response.data;
};
