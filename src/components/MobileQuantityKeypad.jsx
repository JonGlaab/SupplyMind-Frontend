import React, { useState } from 'react';
import { X, Check, Delete } from 'lucide-react';

const MobileQuantityKeypad = ({
                                  productName,
                                  sku,
                                  initialValue = 0,
                                  maxExpected = 0,
                                  onConfirm,
                                  onCancel
                              }) => {
    const [value, setValue] = useState(initialValue.toString());

    const handleNumberClick = (num) => {
        // Prevent leading zeros unless the value is just "0"
        if (value === "0") {
            setValue(num.toString());
        } else {
            setValue(prev => prev + num);
        }
    };

    const handleDelete = () => {
        if (value.length > 1) {
            setValue(prev => prev.slice(0, -1));
        } else {
            setValue("0");
        }
    };

    const handleConfirm = () => {
        onConfirm(parseInt(value, 10));
    };

    return (
        <div className="fixed inset-0 bg-slate-950 z-[60] flex flex-col animate-in slide-in-from-bottom duration-300">

            {/* 1. VISUAL VERIFICATION HEADER (Gap A) */}
            <header className="p-6 bg-slate-900 border-b border-slate-800 text-center">
                <div className="flex justify-between items-start mb-4">
                    <button onClick={onCancel} className="p-2 text-slate-400">
                        <X size={24} />
                    </button>
                    <div className="px-3 py-1 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-full text-xs font-bold">
                        VERIFYING COUNT
                    </div>
                    <div className="w-10" /> {/* Spacer */}
                </div>

                {/* Massive Product Name to prevent mixed shipment errors */}
                <h2 className="text-2xl font-black text-white uppercase tracking-tight break-words">
                    {productName}
                </h2>
                <p className="text-slate-400 font-mono mt-1">SKU: {sku}</p>
                <div className="mt-4 inline-block px-4 py-1 bg-slate-800 rounded-lg text-slate-300 text-sm">
                    Expected: <span className="text-white font-bold">{maxExpected}</span>
                </div>
            </header>

            {/* 2. CURRENT INPUT DISPLAY */}
            <div className="flex-1 flex flex-col items-center justify-center p-6">
                <span className="text-slate-500 text-sm uppercase font-bold tracking-widest mb-2">
                    Received Quantity
                </span>
                <div className="text-7xl font-black text-blue-400 tabular-nums">
                    {value}
                </div>
                {parseInt(value) > maxExpected && (
                    <p className="text-amber-400 text-xs mt-4 font-bold flex items-center gap-1">
                        ⚠️ Exceeds PO amount
                    </p>
                )}
            </div>

            {/* 3. KEYPAD GRID (Gap 2) */}
            <div className="bg-slate-900 p-4 pb-8 grid grid-cols-3 gap-3">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                    <button
                        key={num}
                        onClick={() => handleNumberClick(num)}
                        className="h-16 rounded-2xl bg-slate-800 text-2xl font-bold text-white active:bg-blue-600 transition-colors"
                    >
                        {num}
                    </button>
                ))}
                <button
                    onClick={handleDelete}
                    className="h-16 rounded-2xl bg-red-950/20 text-red-500 flex items-center justify-center active:bg-red-900/40"
                >
                    <Delete size={28} />
                </button>
                <button
                    onClick={() => handleNumberClick(0)}
                    className="h-16 rounded-2xl bg-slate-800 text-2xl font-bold text-white active:bg-blue-600"
                >
                    0
                </button>
                <button
                    onClick={handleConfirm}
                    className="h-16 rounded-2xl bg-emerald-600 text-white flex items-center justify-center active:bg-emerald-500 shadow-lg shadow-emerald-900/20"
                >
                    <Check size={28} strokeWidth={3} />
                </button>
            </div>
        </div>
    );
};

export default MobileQuantityKeypad;