import api from './api';

const InboxService = {
    // 1. Get List of Conversations
    getConversations: async () => {
        const res = await api.get('/api/core/inbox/conversations');
        const allPos = Array.isArray(res.data) ? res.data : (res.data.content || []);

        return allPos.filter(po =>
            ['EMAIL_SENT', 'SUPPLIER_REPLIED', 'DELAY_EXPECTED', 'CONFIRMED', 'PENDING_PAYMENT', 'PAID', 'RECEIVED'].includes(po.status)
        ).sort((a, b) => {
            const timeA = new Date(a.timestamp || 0).getTime();
            const timeB = new Date(b.timestamp || 0).getTime();
            return timeB - timeA;
        });
    },

    // 2. Get Messages for a specific PO
    getMessages: async (poId) => {
        const res = await api.get(`/api/core/inbox/po/${poId}`);
        return res.data;
    },

    // 3. Smart Attachment Fetcher
    getAttachmentUrl: async (poId, fileName, messageId) => {
        if (fileName.includes(`PO-${poId}`) || fileName === 'PurchaseOrder.pdf') {
            const res = await api.get(`/api/core/purchase-orders/${poId}/preview-pdf`, {
                params: { signed: true },
                responseType: 'blob'
            });
            return {
                url: URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' })),
                type: 'pdf'
            };
        }

        if (messageId) {
            const res = await api.get(`/api/core/inbox/attachments/${poId}/${fileName}`, {
                params: { messageId: messageId },
                responseType: 'blob'
            });

            const lowerName = fileName.toLowerCase();
            const isPdf = lowerName.endsWith('.pdf');

            return {
                url: URL.createObjectURL(new Blob([res.data])),
                type: isPdf ? 'pdf' : 'image'
            };
        }
        throw new Error("Cannot download file");
    }
};

export default InboxService;