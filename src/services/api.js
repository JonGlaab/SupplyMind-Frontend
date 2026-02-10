import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true
});

// Request interceptor to add the token to every request
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Response interceptor to handle auth errors
api.interceptors.response.use(
    (response) => response, // Simply return successful responses
    (error) => {
        // Check if the error is a 401 or 403
        if (error.response && [401, 403].includes(error.response.status)) {
            console.log("Authentication error detected. Logging out.");
            // Remove the invalid token
            localStorage.removeItem('token');
            localStorage.removeItem('userRole');
            localStorage.removeItem('userName');
            // Redirect to the login page
            window.location.href = '/login';
        }
        // For all other errors, just reject the promise
        return Promise.reject(error);
    }
);

export default api;
