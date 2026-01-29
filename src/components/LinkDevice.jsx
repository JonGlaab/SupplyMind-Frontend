import { QRCodeSVG } from 'qrcode.react';
import { useNavigate } from 'react-router-dom';

const LinkDevice = () => {
    const navigate = useNavigate();
    // Assume the user just registered/logged in, so the token is in localStorage
    const token = localStorage.getItem('token');

    if (!token) return <p>Error: No token found. Please log in first.</p>;

    const qrValue = `SUPPLYMIND_SETUP:${token}`;

    return (
        <div className="flex flex-col items-center justify-center h-screen bg-gray-50 text-center p-6">
            <h1 className="text-2xl font-bold mb-4">Set up Mobile Companion</h1>
            <p className="mb-6 text-gray-600 max-w-md">
                Scan this code with your mobile phone to instantly log in and link your device.
            </p>

            <div className="bg-white p-4 rounded-xl shadow-lg border">
                <QRCodeSVG value={qrValue} size={250} />
            </div>

            <button
                onClick={() => navigate('/dashboard')}
                className="mt-8 text-blue-600 hover:underline"
            >
                Skip for now &rarr;
            </button>
        </div>
    );
};

export default LinkDevice;