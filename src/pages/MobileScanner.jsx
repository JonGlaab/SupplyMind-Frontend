import { useState, useEffect } from 'react';
import { Scanner } from '@yudiel/react-qr-scanner';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';

const MobileScanner = () => {
    const [status, setStatus] = useState("Align QR code to scan");
    const [isProcessing, setIsProcessing] = useState(false); // Prevent double-scans
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) navigate('/login');
    }, [navigate]);

    const handleScan = async (detectedCodes) => {

        if (isProcessing || detectedCodes.length === 0) return;

        const socketId = detectedCodes[0].rawValue;

        if (socketId.length < 10) return;

        setIsProcessing(true);
        setStatus("Unlocking Desktop...");

        try {

            await api.post(`/auth/qr/approve?socketId=${socketId}`);

            setStatus("Success! Desktop Unlocked.");
            if (navigator.vibrate) navigator.vibrate(200);

            setTimeout(() => {
                navigate('/mobile/home');
            }, 1500);

        } catch (error) {
            console.error(error);
            setStatus("Error: " + (error.response?.data || "Could not unlock"));
            setIsProcessing(false); // Allow retrying
        }
    };

    return (
        <div className="h-screen flex flex-col bg-black">
            {/* Header / Status Bar */}
            <div className={`p-6 text-center transition-colors ${
                status.includes("Success") ? "bg-green-600" :
                    status.includes("Error") ? "bg-red-600" : "bg-gray-900"
            }`}>
                <h3 className="text-white font-bold text-lg">{status}</h3>
            </div>

            {/* Camera View */}
            <div className="flex-1 relative">
                <Scanner
                    onScan={handleScan}
                    components={{ audio: false, finder: true }}
                    styles={{ container: { height: '100%' } }}
                    // Turn off scanning while processing to save resources
                    enabled={!isProcessing}
                />
            </div>

            {/* Cancel Button */}
            <button
                onClick={() => navigate('/mobile/home')}
                className="p-6 bg-gray-800 text-white font-bold tracking-wide"
            >
                CANCEL
            </button>
        </div>
    );
};

export default MobileScanner;