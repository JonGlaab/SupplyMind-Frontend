import React, { useRef, useState, useEffect } from 'react';
import { Camera, X, RefreshCw, Check, UploadCloud } from 'lucide-react';
import { uploadFile } from '../services/StorageService';
import toast from 'react-hot-toast';

const PhotoCapture = ({ poId, itemId, onCapture, onCancel }) => {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);

    const [stream, setStream] = useState(null);
    const [capturedImage, setCapturedImage] = useState(null); // Blob
    const [previewUrl, setPreviewUrl] = useState(null);       // Local URL for display
    const [isUploading, setIsUploading] = useState(false);

    // Battery Saver: 20s Timeout
    const [timeLeft, setTimeLeft] = useState(20);

    // 1. Start Camera on Mount
    useEffect(() => {
        startCamera();
        return () => stopCamera(); // Cleanup on unmount
    }, []);

    // 2. Countdown Logic
    useEffect(() => {
        if (!stream || capturedImage) return;

        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    stopCamera(); // Kill camera to save battery
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, [stream, capturedImage]);

    const startCamera = async () => {
        try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'environment' }
            });
            setStream(mediaStream);
            if (videoRef.current) {
                videoRef.current.srcObject = mediaStream;
            }
            setTimeLeft(20);
        } catch (err) {
            toast.error("Camera access denied");
            onCancel();
        }
    };

    const stopCamera = () => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            setStream(null);
        }
    };

    const takePhoto = () => {
        if (!videoRef.current || !canvasRef.current) return;

        const video = videoRef.current;
        const canvas = canvasRef.current;


        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;


        const ctx = canvas.getContext('2d');
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        canvas.toBlob((blob) => {
            setCapturedImage(blob);
            setPreviewUrl(URL.createObjectURL(blob));
            stopCamera(); // Stop video immediately
        }, 'image/jpeg', 0.8); // 80% quality JPEG
    };

    const handleRetake = () => {
        setCapturedImage(null);
        setPreviewUrl(null);
        startCamera();
    };

    const handleUpload = async () => {
        if (!capturedImage) return;
        setIsUploading(true);

        try {
            const result = await uploadFile(
                capturedImage,
                `PO_${poId}_Evidence`, // Folder Name
                itemId // Owner ID (or Item ID)
            );

            toast.success("Photo uploaded!");
            onCapture(result.url); // Pass URL back to parent
        } catch (err) {
            toast.error("Upload failed.");
            setIsUploading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black z-50 flex flex-col">
            {/* Header */}
            <div className="absolute top-0 w-full p-4 flex justify-between items-start z-10 bg-gradient-to-b from-black/80 to-transparent">
                <button onClick={onCancel} className="p-2 bg-black/40 rounded-full text-white backdrop-blur-md">
                    <X size={24} />
                </button>
                {!capturedImage && (
                    <div className="px-3 py-1 bg-red-600/80 rounded-full text-white text-xs font-bold font-mono">
                        {timeLeft}s
                    </div>
                )}
            </div>

            {/* Viewport */}
            <div className="flex-1 relative bg-slate-900 flex items-center justify-center overflow-hidden">
                {!capturedImage ? (
                    /* LIVE CAMERA */
                    stream ? (
                        <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
                    ) : (
                        <div className="text-center">
                            <p className="text-slate-500 mb-4">Camera Paused</p>
                            <button onClick={startCamera} className="px-6 py-2 bg-slate-800 rounded-full text-white">Resume</button>
                        </div>
                    )
                ) : (
                    /* PREVIEW FROZEN FRAME */
                    <img src={previewUrl} alt="Preview" className="w-full h-full object-contain" />
                )}
                <canvas ref={canvasRef} className="hidden" />
            </div>

            {/* Controls */}
            <div className="p-8 bg-black flex justify-center items-center gap-8">
                {!capturedImage ? (
                    <button
                        onClick={takePhoto}
                        className="w-20 h-20 rounded-full border-4 border-white flex items-center justify-center active:scale-95 transition-transform"
                    >
                        <div className="w-16 h-16 bg-white rounded-full" />
                    </button>
                ) : (
                    <>
                        <button
                            onClick={handleRetake}
                            disabled={isUploading}
                            className="p-4 rounded-full bg-slate-800 text-slate-300 disabled:opacity-50"
                        >
                            <RefreshCw size={24} />
                        </button>

                        <button
                            onClick={handleUpload}
                            disabled={isUploading}
                            className="flex-1 max-w-[200px] h-14 bg-blue-600 rounded-full flex items-center justify-center gap-2 font-bold text-white shadow-lg shadow-blue-900/40 active:scale-95 transition-transform disabled:opacity-50 disabled:bg-slate-700"
                        >
                            {isUploading ? (
                                <span className="animate-pulse">Uploading...</span>
                            ) : (
                                <>
                                    <UploadCloud size={20} /> Use Photo
                                </>
                            )}
                        </button>
                    </>
                )}
            </div>
        </div>
    );
};

export default PhotoCapture;