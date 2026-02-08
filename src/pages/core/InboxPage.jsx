import { useState, useEffect } from 'react';
import {
    MessageCircle, Search, Building2, User,
    X, Phone, Video, AlertCircle, Paperclip, Loader2, FileText, Download, RefreshCw
} from 'lucide-react';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import InboxService from '../../services/inbox.service';

import PoStatusProgress, { getStatusColor } from '../../components/PoStatusProgress';

export default function InboxPage() {
    const [conversations, setConversations] = useState([]);
    const [selectedPo, setSelectedPo] = useState(null);
    const [messages, setMessages] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loadingList, setLoadingList] = useState(true);
    const [loadingChat, setLoadingChat] = useState(false);
    const [activeAttachment, setActiveAttachment] = useState(null);

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

    // 2. Fetch Chat
    useEffect(() => {
        if (!selectedPo) return;

        setActiveAttachment(null);

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
        const interval = setInterval(fetchChat, 30000); // Poll every 30s
        return () => clearInterval(interval);
    }, [selectedPo]);

    // 3. Handle Attachment
    const handleAttachmentClick = async (fileName, messageId) => {
        try {
            const result = await InboxService.getAttachmentUrl(selectedPo.id, fileName, messageId);
            setActiveAttachment(result);
        } catch (error) {
            console.error("Failed to load attachment", error);
            alert("Could not load attachment. Please try again.");
        }
    };

    const filteredConversations = conversations.filter(po =>
        po.supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        `PO-${po.id}`.toLowerCase().includes(searchTerm.toLowerCase())
    );

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
                            placeholder="Search PO or Supplier..."
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
                                    <span className="font-semibold text-slate-900">PO-{po.id}</span>
                                    <span className="text-xs text-slate-400">
                                        {new Date(po.lastActivityAt || po.createdAt).toLocaleDateString()}
                                    </span>
                                </div>
                                <div className="flex items-center gap-1 text-sm text-slate-600 mb-2">
                                    <Building2 size={14}/> {po.supplier.name}
                                </div>
                                <div className="flex items-center justify-between">
                                    {/* 👇 Use the imported helper for consistent colors */}
                                    <span className={`text-[10px] px-2 py-0.5 rounded-full text-white ${getStatusColor(po.status)}`}>
                                        {po.status.replace('_', ' ')}
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
                    <div className="h-16 border-b border-slate-200 bg-white flex items-center justify-between px-6 shadow-sm z-20">
                        <div>
                            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                PO-{selectedPo.id}
                                <span className="text-sm font-normal text-slate-500">| {selectedPo.supplier.name}</span>
                            </h2>
                            <div className="mt-1 w-64">
                                <PoStatusProgress status={selectedPo.status} />
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm"><Phone size={16}/></Button>
                            <Button variant="outline" size="sm"><Video size={16}/></Button>
                            <Button variant="ghost" size="sm"><AlertCircle size={16}/></Button>
                        </div>
                    </div>

                    {/* Chat Messages */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/50">
                        {loadingChat ? (
                            <div className="flex justify-center mt-10"><Loader2 className="animate-spin text-blue-500"/></div>
                        ) : messages.length === 0 ? (
                            <div className="text-center text-slate-400 mt-10">
                                <p>No messages yet.</p>
                                <p className="text-sm">Emails sent to this PO will appear here automatically.</p>
                            </div>
                        ) : (
                            messages.map((msg) => {
                                const isMe = msg.from.includes('supplymind') || msg.from === 'Me';
                                return (
                                    <div key={msg.id || msg.timestamp} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`max-w-[70%] rounded-xl p-4 shadow-sm ${
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

                                            <div className="text-sm whitespace-pre-wrap leading-relaxed">
                                                {msg.snippet || msg.body}
                                            </div>

                                            {msg.attachments && msg.attachments.length > 0 && (
                                                <div className="mt-3 pt-3 border-t border-dashed border-opacity-30 flex flex-wrap gap-2">
                                                    {msg.attachments.map((att, idx) => (
                                                        <Button
                                                            key={idx}
                                                            variant="ghost"
                                                            size="sm"
                                                            className={`h-auto py-1 px-2 text-xs flex items-center gap-1 ${
                                                                isMe ? 'text-blue-100 hover:text-white hover:bg-blue-500'
                                                                    : 'text-blue-600 bg-blue-50 hover:bg-blue-100'
                                                            }`}
                                                            onClick={() => handleAttachmentClick(att, msg.messageId)}
                                                        >
                                                            <Paperclip size={12} />
                                                            <span className="truncate max-w-[150px]">{att}</span>
                                                        </Button>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>

                    {/* Attachment Preview (Split View) */}
                    {activeAttachment && (
                        <div className="absolute top-0 right-0 w-1/2 h-full bg-slate-100 border-l border-slate-300 shadow-2xl z-30 flex flex-col slide-in-right">
                            <div className="h-12 bg-white border-b border-slate-200 flex items-center justify-between px-4">
                                <span className="font-semibold text-sm text-slate-700">Attachment Preview</span>
                                <div className="flex gap-2">
                                    <Button variant="ghost" size="sm" onClick={() => window.open(activeAttachment.url, '_blank')}>
                                        <Download size={16} className="mr-2"/> Download
                                    </Button>
                                    <Button variant="ghost" size="icon" onClick={() => setActiveAttachment(null)}>
                                        <X size={20} />
                                    </Button>
                                </div>
                            </div>
                            <div className="flex-1 p-4 overflow-hidden flex items-center justify-center">
                                {activeAttachment.type === 'pdf' ? (
                                    <iframe
                                        src={activeAttachment.url}
                                        className="w-full h-full rounded-lg shadow-md bg-white"
                                        title="Attachment Preview"
                                    />
                                ) : (
                                    <img
                                        src={activeAttachment.url}
                                        alt="Attachment"
                                        className="max-w-full max-h-full rounded-lg shadow-md object-contain"
                                    />
                                )}
                            </div>
                        </div>
                    )}
                </div>
            ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-slate-300 bg-slate-50">
                    <MessageCircle size={64} className="mb-4 opacity-20" />
                    <p className="text-lg font-medium text-slate-400">Select a conversation to start chatting</p>
                </div>
            )}
        </div>
    );
}