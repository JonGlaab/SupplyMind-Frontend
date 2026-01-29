import { useState } from 'react';
import { Scanner } from '@yudiel/react-qr-scanner';
import { useNavigate } from 'react-router-dom';

const MobileSetup = () => {
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleScan = (detectedCodes) => {
        if (detectedCodes.length === 0) return;

        const rawValue = detectedCodes[0].rawValue;

        // Verify this is a valid Setup QR (starts with SUPPLYMIND_SETUP:)
        if (rawValue.startsWith('SUPPLYMIND_SETUP:')) {
            const token = rawValue.split('SUPPLYMIND_SETUP:')[1];

            //Save the desktop's token into the phone's storage
            localStorage.setItem('token', token);

            alert("Success! Device Linked.");
            navigate('/mobile/home'); // Go to Mobile Dashboard
        } else {
            setError("Invalid QR Code. Please scan the Setup code on your Desktop.");
        }
    };

    return (
        <div className="h-screen flex flex-col bg-black text-white">
            <div className="p-4 bg-gray-900 text-center">
                <h2 className="text-lg font-bold">Link Device</h2>
                <p className="text-sm text-gray-400">Scan the code on your computer screen</p>
            </div>

            <div className="flex-1 relative">
                <Scanner
                    onScan={handleScan}
                    components={{ audio: false, finder: true }}
                    styles={{ container: { height: '100%' } }}
                />
            </div>

            {error && (
                <div className="p-4 bg-red-600 text-center">
                    {error}
                </div>
            )}
        </div>
    );
};

export default MobileSetup;