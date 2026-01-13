import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:8000/api/v1',
    timeout: 10000,
});

// Standard Error Handling Middleware
api.interceptors.response.use(
    (response) => response,
    (error) => {
        console.error('API Error:', error.response?.data || error.message);
        return Promise.reject(error);
    }
);

export default api;
