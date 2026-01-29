import { useEffect, useState, useRef } from 'react';
import SockJS from 'sockjs-client';
import { Stomp } from '@stomp/stompjs';
import { QRCodeSVG } from 'qrcode.react';
import { v4 as uuidv4 } from 'uuid';
import { useNavigate } from 'react-router-dom';

const DesktopLogin = () => {
    const [socketId, setSocketId] = useState(null);
    const navigate = useNavigate();
    const stompClientRef = useRef(null);

    useEffect(() => {
        const tempId = uuidv4();
        setSocketId(tempId);


        const fullApiUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';


        const serverRootUrl = fullApiUrl.replace(/\/api$/, '');


        const socket = new SockJS(`${serverRootUrl}/ws-auth`);
        const client = Stomp.over(socket);

        client.debug = () => {};

        client.connect({}, () => {
            client.subscribe(`/topic/login/${tempId}`, (message) => {
                const body = JSON.parse(message.body);
                if (body.token) {
                    localStorage.setItem('token', body.token);
                    alert("Mobile approved! Logging in...");
                    navigate('/dashboard');
                }
            });
        });

        stompClientRef.current = client;

        return () => {
            if (stompClientRef.current) stompClientRef.current.disconnect();
        };
    }, [navigate]);

    return (
        <div style={{ textAlign: 'center' }}>
            {socketId ? (
                <QRCodeSVG value={socketId} size={220} />
            ) : (
                <p className="text-gray-500 animate-pulse">Connecting to server...</p>
            )}
        </div>
    );
};

export default DesktopLogin;