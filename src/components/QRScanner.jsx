import { Scanner } from '@yudiel/react-qr-scanner';
import { X, AlertCircle } from 'lucide-react';
import { useState } from 'react';

const QRScanner = ({
                       onScan,       // Function to run when code is found
                       title,        // e.g. "Link Device"
                       instruction,  // e.g. "Scan the Setup QR on Laptop"
                       status,       // e.g. "Unlocking..." or "Success!"
                       isProcessing, // true/false (stops scanning, shows spinner)
                       onCancel      // Function to navigate back
                   }) => {
    const [cameraError, setCameraError] = useState('');

    const handleInternalScan = (detectedCodes) => {
        if (isProcessing || !detectedCodes || detectedCodes.length === 0) return;

        const rawValue = detectedCodes[0]?.rawValue;
        if (rawValue) {
            onScan(rawValue);
        }
    };

    const handleError = (err) => {
        if (err.name === 'NotAllowedError') {
            setCameraError("Camera access denied. Please allow permissions.");
        }
    };

    return (
        <div className="fixed inset-0 bg-black text-white z-50">

            {/* 1. The Camera Layer */}
            <div className="absolute inset-0 z-0 bg-black">
                <Scanner
                    onScan={handleInternalScan}
                    onError={handleError}
                    components={{ audio: false, finder: false }} // Disable default red box
                    styles={{
                        container: { position: 'absolute', width: '100%', height: '100%' },
                        video: { objectFit: 'cover', width: '100%', height: '100%' }
                    }}
                    enabled={!isProcessing}
                />
            </div>

            {/* 2. The Overlay UI Layer */}
            <div className="absolute inset-0 z-10 flex flex-col pointer-events-none">

                {/* Header / Title */}
                <div className="pt-12 pb-6 bg-gradient-to-b from-black/80 to-transparent flex flex-col items-center">
                    <div className="bg-black/40 backdrop-blur-md px-6 py-2 rounded-full border border-white/10">
                        <span className="font-bold text-sm tracking-wide">{title}</span>
                    </div>
                </div>

                {/* Center Target Box */}
                <div className="flex-1 flex flex-col items-center justify-center gap-8">

                    {/* The Box itself */}
                    <div className="relative w-72 h-72">

                        {isProcessing && (
                            <div className="absolute inset-0 flex items-center justify-center z-20 bg-black/50 backdrop-blur-sm rounded-lg animate-in fade-in">
                                <p className="font-bold text-lg animate-pulse">{status}</p>
                            </div>
                        )}


                        <div className="absolute top-0 left-0 w-10 h-10 border-t-4 border-l-4 border-blue-500 rounded-tl-2xl shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
                        <div className="absolute top-0 right-0 w-10 h-10 border-t-4 border-r-4 border-blue-500 rounded-tr-2xl shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
                        <div className="absolute bottom-0 left-0 w-10 h-10 border-b-4 border-l-4 border-blue-500 rounded-bl-2xl shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
                        <div className="absolute bottom-0 right-0 w-10 h-10 border-b-4 border-r-4 border-blue-500 rounded-br-2xl shadow-[0_0_10px_rgba(59,130,246,0.5)]" />


                        {!isProcessing && (
                            <div className="absolute top-0 left-0 w-full h-0.5 bg-blue-400 shadow-[0_0_15px_rgba(59,130,246,1)] animate-[scan_2s_infinite_ease-in-out]"></div>
                        )}
                    </div>

                    {!isProcessing && (
                        <p className="text-sm font-medium text-white/90 bg-black/60 px-5 py-2 rounded-full backdrop-blur-md border border-white/10">
                            {instruction}
                        </p>
                    )}
                </div>

                <div className="pb-12 pt-6 bg-gradient-to-t from-black/80 to-transparent flex justify-center pointer-events-auto">
                    <button
                        onClick={onCancel}
                        className="bg-white/10 hover:bg-white/20 border border-white/20 p-4 rounded-full backdrop-blur-md transition-all active:scale-95"
                    >
                        <X size={24} />
                    </button>
                </div>
            </div>


            {cameraError && (
                <div className="absolute bottom-28 left-6 right-6 bg-red-600/90 text-white p-4 rounded-xl backdrop-blur-md shadow-lg flex items-center gap-3 z-50">
                    <AlertCircle size={24} />
                    <span className="text-sm font-medium flex-1">{cameraError}</span>
                </div>
            )}

            <style>{`
                @keyframes scan {
                    0% { top: 10%; opacity: 0; }
                    50% { opacity: 1; }
                    100% { top: 90%; opacity: 0; }
                }
            `}</style>
        </div>
    );
};

export default QRScanner;