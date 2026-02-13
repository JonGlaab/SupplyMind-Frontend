import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import SockJS from 'sockjs-client';
import { Stomp } from '@stomp/stompjs';
import { v4 as uuidv4 } from 'uuid';
import { Loader2, CheckCircle2 } from 'lucide-react';
import { getWebSocketUrl } from '../services/websocket';

const DesktopLoginQR = () => {
    const navigate = useNavigate();
    const [socketId, setSocketId] = useState('');
    const stompClientRef = useRef(null);
    const [status, setStatus] = useState('connecting');

    useEffect(() => {
        const newSocketId = uuidv4();
        setSocketId(newSocketId);

        const socketUrl = getWebSocketUrl();
        console.log("🔵 Connecting to WebSocket at:", socketUrl);

        const client = Stomp.over(() => new SockJS(socketUrl));

        // Disable debug logs for cleaner console
        client.debug = (str) => {
            console.log(str);
        };

        client.connect({}, () => {
            console.log("🟢 WebSocket Connected");
            setStatus('ready');

            console.log(`📡 Subscribing to: /topic/login/${newSocketId}`);

            client.subscribe(`/topic/login/${newSocketId}`, (message) => {
                console.log("📩 Message Received:", message.body);

                const body = JSON.parse(message.body);

                if (body.token) {
                    console.log("✅ Token found! Logging in...");
                    setStatus('success');
                    localStorage.setItem('token', body.token);
                    setTimeout(() => navigate('/dashboard'), 1500);
                }
            });
        }, (err) => {
            console.error("🔴 WebSocket Error:", err);
            setStatus('error');
        });


        client.heartbeat.outgoing = 20000;
        client.heartbeat.incoming = 0;

        client.connect({}, () => {
            console.log("🟢 WebSocket Connected");
            setStatus('ready');
            client.subscribe(`/topic/login/${newSocketId}`, (message) => {
                const body = JSON.parse(message.body);

                if (body.token) {
                    console.log("✅ Login Approved!");
                    setStatus('success');

                    // 1. SAVE THE DATA
                    localStorage.setItem('token', body.token);
                    localStorage.setItem('userRole', body.role); // <--- Critical Fix
                    localStorage.setItem('userName', `${body.firstName} ${body.lastName}`);

                    // 2. REDIRECT TO THE CORRECT DASHBOARD (Copied from Login.jsx)
                    setTimeout(() => {
                        switch (body.role) {
                            case 'ADMIN':
                                navigate('/admin/dashboard');
                                break;
                            case 'MANAGER':
                                navigate('/manager/dashboard');
                                break;
                            case 'PROCUREMENT_OFFICER':
                                navigate('/procurement/dashboard');
                                break;
                            case 'STAFF':
                                navigate('/staff/dashboard');
                                break;
                            default:
                                navigate('/warehouse/dashboard');
                        }
                    }, 1500);
                }
            });
        }, (err) => {
            console.error("🔴 WebSocket Error:", err);
            if (status !== 'success') {
                setStatus('error');
            }
        });

        stompClientRef.current = client;


        return () => {
            if (stompClientRef.current) {
                console.log("🔵 Disconnecting WebSocket...");
                stompClientRef.current.disconnect();
            }
        };
    }, [navigate]);


    if (status === 'connecting') {
        return (
            <div className="flex flex-col items-center justify-center p-8 space-y-4">
                <Loader2 className="animate-spin text-blue-500" size={48} />
                <p className="text-slate-500 text-sm">Connecting to Secure Server...</p>
            </div>
        );
    }

    if (status === 'success') {
        return (
            <div className="h-40 w-40 flex flex-col items-center justify-center bg-emerald-50 rounded-xl animate-in fade-in zoom-in border border-emerald-100">
                <CheckCircle2 className="text-emerald-500 mb-2" size={48} />
                <span className="text-emerald-700 font-bold text-sm">Approved!</span>
                <span className="text-emerald-600 text-xs">Redirecting...</span>
            </div>
        );
    }

    if (status === 'error') {
        return (
            <div className="text-center p-6 text-red-500">
                <p>Connection Failed.</p>
                <button
                    onClick={() => window.location.reload()}
                    className="mt-2 text-xs underline hover:text-red-700"
                >
                    Retry
                </button>
            </div>
        );
    }

    return (
        <div className="p-4 bg-white rounded-xl shadow-sm border border-slate-100 flex flex-col items-center">
            {socketId && (
                <QRCodeSVG
                    value={socketId}
                    size={180}
                    level={"H"}
                    includeMargin={true}
                    className="mb-4"
                />
            )}
            <p className="text-xs text-slate-400 font-medium">
                Scan with SupplyMind App
            </p>
        </div>
    );
};

export default DesktopLoginQR;