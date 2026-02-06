import api from './api';

const InboxService = {
    // 1. Get List of Conversations
    getConversations: async () => {
        const res = await api.get('/api/core/purchase-orders');
        const allPos = Array.isArray(res.data) ? res.data : (res.data.content || []);
        // Only active POs in the inbox
        return allPos.filter(po =>
            ['EMAIL_SENT', 'SUPPLIER_REPLIED', 'DELAY_EXPECTED', 'CONFIRMED', 'PENDING_PAYMENT', 'PAID', 'RECEIVED'].includes(po.status)
        ).sort((a, b) => b.id - a.id);
    },

    // 2. Get Messages for a specific PO
    getMessages: async (poId) => {
        const res = await api.get(`/api/core/inbox/po/${poId}`);
        return res.data;
    },

    // 3. Smart Attachment Fetcher
    getAttachmentUrl: async (poId, fileName, messageId) => {
        //  The PO PDF itself
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

        // Real file from Gmail (via Backend Proxy)
        if (messageId) {
            const res = await api.get(`/api/core/inbox/attachments/${poId}/${fileName}`, {
                params: { messageId: messageId },
                responseType: 'blob'
            });

            const isPdf = fileName.toLowerCase().endsWith('.pdf');
            return {
                url: URL.createObjectURL(new Blob([res.data])),
                type: isPdf ? 'pdf' : 'image'
            };
        }

        throw new Error("Cannot download file");
    }
};

export default InboxService;