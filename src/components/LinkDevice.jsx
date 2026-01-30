import { QRCodeSVG } from 'qrcode.react';
import { useNavigate } from 'react-router-dom';
import { Smartphone, CheckCircle, AlertCircle } from 'lucide-react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';

const LinkDevice = () => {
    const navigate = useNavigate();

    let token = localStorage.getItem('token');


    const isValidToken = token && token !== "undefined" && token !== "null";

    if (!isValidToken) {
        return (
            <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
                <Card className="max-w-md w-full bg-red-950/50 border-red-900 text-red-200">
                    <CardContent className="pt-6 text-center space-y-4">
                        <div className="mx-auto w-12 h-12 bg-red-900/50 rounded-full flex items-center justify-center">
                            <AlertCircle className="w-6 h-6 text-red-500" />
                        </div>
                        <h3 className="text-lg font-bold text-white">Setup Failed</h3>
                        <p className="text-sm text-red-200/80">
                            We couldn't generate your secure handshake token. This usually happens if the registration response was incomplete.
                        </p>
                        <Button
                            variant="secondary"
                            className="w-full bg-red-900 hover:bg-red-800 text-white border-none"
                            onClick={() => navigate('/login')}
                        >
                            Try Logging In Instead
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    const qrValue = `SUPPLYMIND_SETUP:${token}`;

    return (
        <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6 text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_0%,rgba(59,130,246,0.15),transparent_50%)]" />

            <div className="relative z-10 max-w-md w-full">
                <div className="mb-8 mx-auto w-16 h-16 bg-blue-500/10 rounded-2xl flex items-center justify-center ring-1 ring-blue-500/20 shadow-[0_0_40px_-10px_rgba(59,130,246,0.3)]">
                    <Smartphone size={32} className="text-blue-400" />
                </div>

                <h1 className="text-3xl font-bold mb-3 tracking-tight">Connect Companion</h1>
                <p className="mb-8 text-slate-400 text-sm leading-relaxed">
                    Open the SupplyMind mobile app and scan this code to securely link this device to your account.
                </p>

                <div className="bg-white p-5 rounded-3xl shadow-2xl shadow-blue-900/20 mx-auto w-fit transform transition-all hover:scale-105 duration-300">
                    <QRCodeSVG
                        value={qrValue}
                        size={200}
                        level="H"
                        includeMargin={false}
                    />
                </div>

                <div className="mt-10 space-y-6">
                    <div className="flex items-center justify-center text-xs font-medium text-emerald-400 space-x-2 bg-emerald-950/30 py-2 px-4 rounded-full border border-emerald-900/50 w-fit mx-auto">
                        <CheckCircle size={14} />
                        <span>Secure Token Generated</span>
                    </div>

                    <button
                        onClick={() => navigate('/dashboard')}
                        className="text-slate-500 hover:text-white text-sm hover:underline transition-colors"
                    >
                        Skip setup & go to Dashboard &rarr;
                    </button>
                </div>
            </div>
        </div>
    );
};

export default LinkDevice;