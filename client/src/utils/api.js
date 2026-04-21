import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:5604/api',
    headers: {
        'Content-Type': 'application/json'
    }
});

api.interceptors.request.use(
    (config) => {
        const token = sessionStorage.getItem('token');
        console.log('API Request:', config.method.toUpperCase(), config.url, 'to baseURL:', config.baseURL);
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
            console.log('Token sent:', token.substring(0, 10) + '...');
        } else {
            console.log('No token found in sessionStorage');
        }
        return config;
    },
    (error) => Promise.reject(error)
);

export default api;
