import { useNavigate } from 'react-router-dom';

const MobileHome = () => {
    const navigate = useNavigate();
    const token = localStorage.getItem('token');

    if (!token) {
        return (
            <div className="h-screen flex items-center justify-center p-6 text-center">
                <p>You are not logged in. <br/> Please scan the Setup QR code on your computer.</p>
                <button onClick={() => navigate('/mobile/setup')} className="mt-4 bg-blue-600 text-white p-2 rounded">
                    Go to Setup
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100 p-4">
            <header className="flex justify-between items-center mb-8">
                <h1 className="text-xl font-bold text-gray-800">SupplyMind Mobile</h1>
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" title="Online"></div>
            </header>

            <div className="grid gap-4">
                {/* 1. The Key Feature: Login to Desktop */}
                <button
                    onClick={() => navigate('/mobile/scanner')}
                    className="bg-blue-600 text-white p-6 rounded-xl shadow-lg flex flex-col items-center justify-center active:scale-95 transition"
                >
                    <span className="text-4xl mb-2">🔓</span>
                    <span className="font-bold text-lg">Unlock Desktop</span>
                </button>

                {/* Future Features (Placeholders) */}
                <div className="grid grid-cols-2 gap-4">
                    <button className="bg-white p-6 rounded-xl shadow text-gray-400 cursor-not-allowed">
                        <span className="text-2xl block mb-1">📦</span>
                        Scan SKU
                    </button>
                    <button className="bg-white p-6 rounded-xl shadow text-gray-400 cursor-not-allowed">
                        <span className="text-2xl block mb-1">📸</span>
                        Upload PO
                    </button>
                </div>
            </div>

            <button
                onClick={() => {
                    localStorage.removeItem('token');
                    navigate('/login');
                }}
                className="mt-12 text-red-500 w-full text-center text-sm font-semibold"
            >
                Log Out / Unlink Device
            </button>
        </div>
    );
};

export default MobileHome;