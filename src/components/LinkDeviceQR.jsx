import { QRCodeSVG } from 'qrcode.react';
import { Smartphone } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';

const LinkDeviceQR = ({ className }) => {
    const token = localStorage.getItem('token');

    if (!token) return null;

    const setupString = `SUPPLYMIND_SETUP:${token}`;

    return (
        <Card className={`border-blue-100 shadow-sm ${className}`}>
            <CardHeader className="bg-blue-50/50 pb-4">
                <CardTitle className="text-blue-900 flex items-center gap-2">
                    <Smartphone size={20} />
                    Link Mobile Device
                </CardTitle>
                <CardDescription>
                    Scan with the SupplyMind App to authorize your phone.
                </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center py-6">
                <div className="bg-white p-3 rounded-xl border shadow-sm mb-6">
                    <QRCodeSVG
                        value={setupString}
                        size={180}
                        level={"H"}
                        includeMargin={true}
                    />
                </div>

                <div className="w-full space-y-2">
                    <Instruction step="1" text="Open SupplyMind App" />
                    <Instruction step="2" text="Tap 'Setup' or 'Scan'" />
                    <Instruction step="3" text="Point camera here" />
                </div>
            </CardContent>
        </Card>
    );
};

const Instruction = ({ step, text }) => (
    <div className="flex items-center gap-3 text-sm text-slate-600">
        <div className="h-5 w-5 rounded-full bg-slate-100 flex items-center justify-center font-bold text-[10px] text-slate-500">
            {step}
        </div>
        <span>{text}</span>
    </div>
);

export default LinkDeviceQR;