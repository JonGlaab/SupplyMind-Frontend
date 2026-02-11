import api from './api';

const NotificationService = {
    // Get list of notifications (sorted by newest)
    getMyNotifications: async () => {
        const res = await api.get('/api/core/notifications');
        return res.data;
    },

    // Get just the number for the red badge
    getUnreadCount: async () => {
        const res = await api.get('/api/core/notifications/unread-count');
        return res.data;
    },

    // Mark single item read
    markAsRead: async (id) => {
        await api.put(`/api/core/notifications/${id}/read`);
    },

    // Mark all read
    markAllAsRead: async () => {
        await api.put('/api/core/notifications/read-all');
    }
};

export default NotificationService;