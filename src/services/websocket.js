export const getWebSocketUrl = () => {
    if (import.meta.env.DEV) {
        return '/ws';
    }

    const baseUrl = import.meta.env.VITE_API_BASE_URL || '';
    const cleanUrl = baseUrl.replace(/\/api\/?$/, '').replace(/\/$/, '');

    return `${cleanUrl}/ws`;
};