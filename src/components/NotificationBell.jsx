import React, { useState, useEffect } from 'react';
import { Bell, Check, Clock, AlertTriangle, Info, CheckCircle, XCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import NotificationService from '../services/notification.service';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from './ui/dropdown-menu.jsx';

export default function NotificationBell() {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    const navigate = useNavigate();

    // 1. Load Data
    const loadNotifications = async () => {
        try {
            const count = await NotificationService.getUnreadCount();
            setUnreadCount(count);

            // Only fetch full list if menu is open to save bandwidth
            if (isOpen) {
                const list = await NotificationService.getMyNotifications();
                setNotifications(list);
            }
        } catch (error) {
            console.error("Failed to load notifications", error);
        }
    };

    // 2. Poll every 60 seconds
    useEffect(() => {
        loadNotifications();
        const interval = setInterval(loadNotifications, 60000);
        return () => clearInterval(interval);
    }, [isOpen]); // Reload when menu opens

    // 3. Handle Click
    const handleItemClick = async (n) => {
        // A. Mark as read immediately in UI
        if (!n.isRead) {
            setUnreadCount(prev => Math.max(0, prev - 1));
            await NotificationService.markAsRead(n.id);
        }

        // B. Navigate based on Type
        if (n.referenceType === 'PURCHASE_ORDER') {
            navigate(`/purchase-order/${n.referenceId}`);
        } else if (n.referenceType === 'PRODUCT') {
            // navigate(`/inventory/${n.referenceId}`); // Example
        }
    };

    const handleMarkAllRead = async (e) => {
        e.stopPropagation();
        await NotificationService.markAllAsRead();
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
        setUnreadCount(0);
    };

    // Helper: Icons
    const getIcon = (type) => {
        switch (type) {
            case 'WARNING': return <AlertTriangle size={16} className="text-amber-500" />;
            case 'SUCCESS': return <CheckCircle size={16} className="text-green-500" />;
            case 'ERROR': return <XCircle size={16} className="text-red-500" />;
            default: return <Info size={16} className="text-blue-500" />;
        }
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger>
                <button
                    className="p-2 text-slate-400 hover:text-blue-600 transition-colors relative"
                    onClick={() => setIsOpen(!isOpen)}
                >
                    <Bell size={20} />
                    {unreadCount > 0 && (
                        <span className="absolute top-2 right-2 h-2.5 w-2.5 bg-red-500 rounded-full border-2 border-white animate-pulse" />
                    )}
                </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent className="w-80 p-0 bg-white border border-slate-200 shadow-xl rounded-lg mr-4 mt-2">
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-slate-50/50">
                    <h3 className="font-semibold text-sm text-slate-800">Notifications</h3>
                    {unreadCount > 0 && (
                        <button
                            onClick={handleMarkAllRead}
                            className="text-[10px] text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
                        >
                            <Check size={12} /> Mark all read
                        </button>
                    )}
                </div>

                {/* List */}
                <div className="max-h-[400px] overflow-y-auto">
                    {notifications.length === 0 ? (
                        <div className="p-8 text-center text-slate-400 text-sm">
                            No notifications yet
                        </div>
                    ) : (
                        notifications.map(n => (
                            <DropdownMenuItem
                                key={n.id}
                                onClick={() => handleItemClick(n)}
                                className={`
                                    px-4 py-3 border-b border-slate-50 cursor-pointer flex gap-3 items-start
                                    ${!n.isRead ? 'bg-blue-50/50' : 'hover:bg-slate-50'}
                                `}
                            >
                                <div className="mt-0.5 shrink-0">
                                    {getIcon(n.type)}
                                </div>
                                <div className="flex-1 space-y-1">
                                    <div className="flex justify-between items-start">
                                        <p className={`text-sm ${!n.isRead ? 'font-semibold text-slate-800' : 'font-medium text-slate-600'}`}>
                                            {n.title}
                                        </p>
                                        {!n.isRead && <span className="h-1.5 w-1.5 bg-blue-500 rounded-full shrink-0 mt-1.5" />}
                                    </div>
                                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                                        {n.message}
                                    </p>
                                    <div className="flex items-center gap-1 text-[10px] text-slate-400 pt-1">
                                        <Clock size={10} />
                                        {n.timeAgo || 'Just now'}
                                    </div>
                                </div>
                            </DropdownMenuItem>
                        ))
                    )}
                </div>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}