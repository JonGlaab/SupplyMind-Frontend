import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import SockJS from 'sockjs-client';
import { Stomp } from '@stomp/stompjs';
import { v4 as uuidv4 } from 'uuid';
import { Loader2, CheckCircle2 } from 'lucide-react';

const DesktopLoginQR = () => {
    const navigate = useNavigate();
    const [socketId, setSocketId] = useState('');
    const stompClientRef = useRef(null);
    const [status, setStatus] = useState('connecting');

    useEffect(() => {
        const newSocketId = uuidv4();
        setSocketId(newSocketId);

        const socketUrl = '/ws';

        const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

        const serverRootUrl = apiBase.replace('/api', '');

        const isSecure = window.location.protocol === 'https:';

        console.log("Using WebSocket via Proxy:", socketUrl);

        // This forces SockJS to use the most reliable transport for proxies
        const socket = new SockJS('/ws', null, {
            transports: ['websocket'],
            timeout: 5000
        });
        const client = Stomp.over(() => socket);

        client.debug = () => {};

        client.connect({}, () => {
            console.log("🟢 WebSocket Connected:", newSocketId);
            setStatus('ready');

            client.subscribe(`/topic/login/${newSocketId}`, (message) => {
                const body = JSON.parse(message.body);
                if (body.token) {
                    setStatus('success');
                    localStorage.setItem('token', body.token);
                    setTimeout(() => navigate('/dashboard'), 1000);
                }
            });
        }, (err) => {
            console.error("🔴 WebSocket Error:", err);
            setStatus('ready');
        });

        stompClientRef.current = client;

        return () => {
            if (stompClientRef.current) stompClientRef.current.disconnect();
        };
    }, [navigate]);

    if (status === 'connecting') {
        return <Loader2 className="animate-spin text-blue-500" size={48} />;
    }

    if (status === 'success') {
        return (
            <div className="h-40 w-40 flex flex-col items-center justify-center bg-emerald-50 rounded-xl animate-in fade-in zoom-in">
                <CheckCircle2 className="text-emerald-500 mb-2" size={48} />
                <span className="text-emerald-700 font-bold text-sm">Approved!</span>
            </div>
        );
    }

    return (
        <div className="p-2 bg-white rounded-lg">
            {socketId && (
                <QRCodeSVG
                    value={socketId}
                    size={160}
                    level={"H"}
                    includeMargin={true}
                />
            )}
        </div>
    );
};

export default DesktopLoginQR;