import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import QRScanner from '../components/QRScanner'; // Import the new component

const MobileSetup = () => {
    const navigate = useNavigate();
    const [isProcessing, setIsProcessing] = useState(false);
    const [status, setStatus] = useState('');

    const handleScan = (rawValue) => {
        if (rawValue.startsWith('SUPPLYMIND_SETUP:')) {
            setIsProcessing(true);
            setStatus("Linking Device...");

            const token = rawValue.split('SUPPLYMIND_SETUP:')[1];


            localStorage.setItem('token', token);


            setStatus("✅ Device Linked!");
            if (navigator.vibrate) navigator.vibrate([100, 50, 100]);

            // Redirect
            setTimeout(() => {
                navigate('/mobile/home');
            }, 1000);
        }
    };

    return (
        <QRScanner
            onScan={handleScan}
            title="Link Device"
            instruction="Scan the Setup QR on your Laptop"
            status={status}
            isProcessing={isProcessing}
            onCancel={() => navigate('/mobile/home')}
        />
    );
};

export default MobileSetup;