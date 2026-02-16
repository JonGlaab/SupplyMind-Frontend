import { useState, useEffect, useRef } from 'react';
import {
    MessageCircle, Search, Building2,
    X, Paperclip, Loader2, Download, AlertCircle, Eye
} from 'lucide-react';
import { Input } from '../../components/ui/input.jsx';
import { Progress } from '../../components/ui/progress.jsx';
import { Button } from '../../components/ui/button.jsx';
import InboxService from '../../services/inbox.service.js';
import { FileText } from 'lucide-react';


import SockJS from 'sockjs-client';
import Stomp from 'stompjs';
import { getWebSocketUrl } from '../../services/websocket.js';

// --- Helper: Status to Progress % ---
const getStatusPercentage = (status) => {
    const map = {
        'EMAIL_SENT': 30,
        'SUPPLIER_REPLIED': 35,
        'DELAY_EXPECTED': 35,
        'CONFIRMED': 60,
        'PENDING_PAYMENT': 80,
        'PAID': 90,
        'RECEIVED': 100
    };
    return map[status] || 5;
};


const getProgressColor = (status) => {
    if (status === 'DELAY_EXPECTED') return 'bg-red-500';
    if (status === 'RECEIVED' || status === 'PAID') return 'bg-green-500';
    return 'bg-blue-600';
};

export default function InboxPage() {
    const [conversations, setConversations] = useState([]);
    const [selectedPo, setSelectedPo] = useState(null);
    const [messages, setMessages] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loadingList, setLoadingList] = useState(true);
    const [loadingChat, setLoadingChat] = useState(false);

    // Attachment Modal State
    const [activeAttachment, setActiveAttachment] = useState(null);

    // WebSocket Refs
    const stompClientRef = useRef(null);
    const subscriptionRef = useRef(null);

    // 1. Fetch Sidebar List
    useEffect(() => {
        loadConversations();
    }, []);

    const loadConversations = async () => {
        try {
            const data = await InboxService.getConversations();
            setConversations(data);
        } catch (error) {
            console.error("Failed to load inbox list", error);
        } finally {
            setLoadingList(false);
        }
    };


    useEffect(() => {
        if (!selectedPo || !selectedPo.id) return;

        setActiveAttachment(null);

        // A. Initial Load via REST
        const fetchChat = async () => {
            setLoadingChat(true);
            try {
                const data = await InboxService.getMessages(selectedPo.id);
                setMessages(data);
            } catch (error) {
                console.error("Failed to load messages", error);
                setMessages([]);
            } finally {
                setLoadingChat(false);
            }
        };

        fetchChat();

        // B. Connect WebSocket
        const socket = new SockJS(getWebSocketUrl());
        const stompClient = Stomp.over(socket);
        // Disable debug logs for cleaner console
        stompClient.debug = () => {};

        stompClient.connect({}, () => {
            // Subscribe to this specific PO's topic
            const sub = stompClient.subscribe(`/topic/po/${selectedPo.id}`, (payload) => {
                try {
                    const newMessage = JSON.parse(payload.body);
                    // Append new message to state immediately
                    setMessages((prev) => {
                        // Avoid duplicates if any
                        if (prev.find(m => m.messageId === newMessage.messageId)) return prev;
                        // Sort by timestamp to be safe
                        const updated = [...prev, newMessage];
                        updated.sort((a, b) => a.timestamp - b.timestamp);
                        return updated;
                    });
                } catch (e) {
                    console.error("Error parsing WS message", e);
                }
            });
            subscriptionRef.current = sub;
        }, (err) => {
            console.error("WS Connection Error:", err);
        });

        stompClientRef.current = stompClient;

        // Cleanup on PO change or unmount
        return () => {
            if (subscriptionRef.current) subscriptionRef.current.unsubscribe();
            if (stompClientRef.current && stompClientRef.current.connected) {
                stompClientRef.current.disconnect();
            }
        };

    }, [selectedPo]); // Re-run when selected PO changes

    // 3. Handle Attachment
    const handleAttachmentClick = async (fileName, messageId) => {
        try {
            const result = await InboxService.getAttachmentUrl(selectedPo.id, fileName, messageId);
            setActiveAttachment({ ...result, name: fileName });
        } catch (error) {
            console.error("Failed to load attachment", error);
            alert("Could not load attachment.");
        }
    };

    const filteredConversations = conversations.filter(po =>
        (po.poCode || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (po.supplierName || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    // ... (Render Logic remains exactly the same as your previous file) ...
    // ... Copy the RETURN block from your existing file here ...
    return (
        <div className="flex h-screen bg-slate-50 overflow-hidden">
            {/* LEFT SIDEBAR */}
            <div className="w-80 bg-white border-r border-slate-200 flex flex-col z-10">
                <div className="p-4 border-b border-slate-100">
                    <h1 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                        <MessageCircle className="text-blue-600"/> Inbox
                    </h1>
                    <div className="relative">
                        <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
                        <Input
                            placeholder="Search PO..."
                            className="pl-10 bg-slate-50"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto">
                    {loadingList ? (
                        <div className="flex justify-center p-8"><Loader2 className="animate-spin text-blue-500"/></div>
                    ) : (
                        filteredConversations.map(po => (
                            <div
                                key={po.id}
                                onClick={() => setSelectedPo(po)}
                                className={`p-4 border-b border-slate-50 cursor-pointer transition-colors hover:bg-slate-50
                                    ${selectedPo?.id === po.id ? 'bg-blue-50 border-l-4 border-l-blue-600' : ''}
                                `}
                            >
                                <div className="flex justify-between items-start mb-1">
                                    <span className="font-bold text-slate-900">{po.poCode}</span>
                                    <span className="text-xs text-slate-400">
                                        {po.timestamp ? new Date(po.timestamp).toLocaleDateString() : 'N/A'}
                                    </span>
                                </div>
                                <div className="flex items-center gap-1 text-sm text-slate-600 mb-2">
                                    <Building2 size={14}/> {po.supplierName}
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className={`text-[10px] px-2 py-0.5 rounded-full text-white ${getProgressColor(po.status)}`}>
                                        {po.status ? po.status.replace('_', ' ') : 'UNKNOWN'}
                                    </span>
                                    {po.status === 'DELAY_EXPECTED' && <AlertCircle size={16} className="text-red-500" />}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* MAIN CHAT AREA */}
            {selectedPo ? (
                <div className="flex-1 flex flex-col h-full relative">
                    {/* Header */}
                    <div className="h-20 border-b border-slate-200 bg-white flex items-center justify-between px-6 shadow-sm z-20">
                        <div className="flex flex-col justify-center">
                            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                                {selectedPo.poCode}
                            </h2>
                            <div className="flex items-center gap-2 text-sm text-slate-500">
                                <Building2 size={16} className="text-blue-500"/>
                                {selectedPo.supplierName}
                            </div>
                        </div>
                        <div className="w-72 flex flex-col justify-center">
                            <div className="flex justify-between items-end mb-2">
                                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                                    Status
                                </span>
                                <span className={`text-xs px-2 py-0.5 rounded-full text-white font-medium ${getProgressColor(selectedPo.status)}`}>
                                    {selectedPo.status ? selectedPo.status.replace('_', ' ') : 'UNKNOWN'}
                                </span>
                            </div>
                            <Progress value={getStatusPercentage(selectedPo.status)} className="h-2.5 w-full bg-slate-100" />
                        </div>
                    </div>

                    {/* Chat Messages */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/50">
                        {loadingChat ? (
                            <div className="flex justify-center mt-10"><Loader2 className="animate-spin text-blue-500"/></div>
                        ) : messages.length === 0 ? (
                            <div className="text-center text-slate-400 mt-10">
                                <p>No messages yet.</p>
                                <p className="text-sm">Emails related to {selectedPo.poCode} will appear here.</p>
                            </div>
                        ) : (
                            messages.map((msg, idx) => {
                                const isMe = msg.from && (msg.from.includes('supplymind') || msg.from === 'Me');
                                return (
                                    <div key={msg.id || idx} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`max-w-[75%] rounded-xl p-4 shadow-sm ${
                                            isMe ? 'bg-blue-600 text-white' : 'bg-white border border-slate-200 text-slate-800'
                                        }`}>
                                            <div className="flex items-center justify-between gap-4 mb-2">
                                                <span className={`text-xs font-bold ${isMe ? 'text-blue-100' : 'text-slate-500'}`}>
                                                    {isMe ? 'You' : msg.from}
                                                </span>
                                                <span className={`text-[10px] ${isMe ? 'text-blue-200' : 'text-slate-400'}`}>
                                                    {new Date(msg.timestamp).toLocaleString()}
                                                </span>
                                            </div>

                                            {msg.subject && (
                                                <div className={`text-xs font-semibold mb-2 pb-2 border-b ${
                                                    isMe ? 'border-blue-500/50' : 'border-slate-100'
                                                }`}>
                                                    {msg.subject}
                                                </div>
                                            )}

                                            {/* FULL BODY RENDER */}
                                            <div className="text-sm whitespace-pre-wrap leading-relaxed font-sans">
                                                {msg.body || msg.snippet}
                                            </div>

                                            {/* Gmail-Style Attachment Pills */}
                                            {msg.attachments && msg.attachments.length > 0 && (
                                                <div className="mt-3 pt-3 border-t border-dashed border-opacity-30 flex flex-wrap gap-2">
                                                    {msg.attachments.map((att, i) => (
                                                        <div
                                                            key={i}
                                                            onClick={() => handleAttachmentClick(att, msg.messageId)}
                                                            className={`cursor-pointer group flex items-center gap-2 px-3 py-2 rounded-lg border text-xs transition-all ${
                                                                isMe
                                                                    ? 'border-blue-400 bg-blue-500/50 hover:bg-blue-500 text-white'
                                                                    : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700'
                                                            }`}
                                                        >
                                                            <div className={`p-1.5 rounded-md ${isMe ? 'bg-blue-400' : 'bg-red-100'}`}>
                                                                <FileText size={14} className={isMe ? 'text-white' : 'text-red-500'} />
                                                            </div>
                                                            <div className="flex flex-col">
                                                                <span className="font-medium truncate max-w-[120px]">{att}</span>
                                                                <span className="text-[10px] opacity-70">Click to preview</span>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>

                    {/* --- MODAL OVERLAY (Gmail Style) --- */}
                    {activeAttachment && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                            <div className="relative w-full max-w-5xl h-[85vh] bg-white rounded-xl shadow-2xl flex flex-col overflow-hidden">

                                {/* Modal Header */}
                                <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 bg-slate-50">
                                    <div className="flex items-center gap-2">
                                        <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                                            <Paperclip size={18} />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-slate-800 text-sm">{activeAttachment.name}</h3>
                                            <p className="text-xs text-slate-500">Preview Mode</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Button variant="outline" size="sm" onClick={() => window.open(activeAttachment.url, '_blank')}>
                                            <Download size={16} className="mr-2"/> Download
                                        </Button>
                                        <Button variant="ghost" size="icon" onClick={() => setActiveAttachment(null)}>
                                            <X size={20} />
                                        </Button>
                                    </div>
                                </div>

                                {/* Modal Body (Preview) */}
                                <div className="flex-1 bg-slate-100 p-4 flex items-center justify-center overflow-auto">
                                    {activeAttachment.type === 'pdf' ? (
                                        <iframe
                                            src={activeAttachment.url}
                                            className="w-full h-full rounded shadow-sm bg-white border border-slate-200"
                                            title="Preview"
                                        />
                                    ) : (
                                        <img
                                            src={activeAttachment.url}
                                            alt="Preview"
                                            className="max-w-full max-h-full object-contain rounded shadow-lg"
                                        />
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-slate-300 bg-slate-50">
                    <MessageCircle size={64} className="mb-4 opacity-20" />
                    <p className="text-lg font-medium text-slate-400">Select a PO to view emails</p>
                </div>
            )}
        </div>
    );
}