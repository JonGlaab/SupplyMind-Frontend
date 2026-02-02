export const getWebSocketUrl = () => {
    // 1. In Development, return the relative path '/ws'
    if (import.meta.env.DEV) {
        return '/ws';
    }

    // 2. In Production (Real Deployment), use the environment variable.
    const baseUrl = import.meta.env.VITE_API_BASE_URL || '';
    const cleanUrl = baseUrl.replace(/\/api\/?$/, '').replace(/\/$/, '');

    return `${cleanUrl}/ws`;
};