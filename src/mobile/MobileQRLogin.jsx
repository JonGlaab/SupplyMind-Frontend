import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import QRScanner from '../components/QRScanner';

const MobileQRLogin = () => {
    const navigate = useNavigate();
    const [isProcessing, setIsProcessing] = useState(false);
    const [status, setStatus] = useState('');

    useEffect(() => {
        if (!localStorage.getItem('token')) {
            navigate('/mobile/setup');
        }
    }, [navigate]);

    const handleScan = async (rawValue) => {
        // Ignore Setup codes
        if (rawValue.startsWith('SUPPLYMIND_SETUP:')) return;

        setIsProcessing(true);
        setStatus("Unlocking Desktop...");

        try {
            await api.post(`/auth/qr/approve?socketId=${rawValue}`);

            setStatus("✅ Success!");
            if (navigator.vibrate) navigator.vibrate([100, 50, 100]);

            setTimeout(() => {
                navigate('/mobile/home');
            }, 1500);

        } catch (error) {
            console.error(error);
            setStatus("❌ Failed. Try again.");
            setTimeout(() => {
                setIsProcessing(false);
                setStatus('');
            }, 2000);
        }
    };

    return (
        <QRScanner
            onScan={handleScan}
            title="Unlock Desktop"
            instruction="Scan the Login QR on your Screen"
            status={status}
            isProcessing={isProcessing}
            onCancel={() => navigate('/mobile/home')}
        />
    );
};

export default MobileQRLogin;