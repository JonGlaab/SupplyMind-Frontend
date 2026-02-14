import React, { useState } from 'react';
import { X, Check, Delete } from 'lucide-react';

const MobileQuantityKeypad = ({
                                  productName,
                                  sku,
                                  maxExpected,
                                  initialValue = 0,
                                  onConfirm,
                                  onCancel,
                                  warehouseName // NEW: Show where we are counting
                              }) => {
    const [value, setValue] = useState(initialValue.toString());

    const handlePress = (num) => {
        if (value === '0') setValue(num.toString());
        else setValue(prev => prev + num);
    };

    const handleBackspace = () => {
        setValue(prev => prev.length > 1 ? prev.slice(0, -1) : '0');
    };

    return (
        // FIXED: z-[100] ensures it sits ON TOP of the bottom nav (z-50)
        <div className="fixed inset-0 bg-slate-950 z-[100] flex flex-col animate-in slide-in-from-bottom-full duration-300">

            {/* Header Area */}
            <div className="p-6 pt-12 flex-1 flex flex-col justify-center items-center text-center space-y-4">
                <button
                    onClick={onCancel}
                    className="absolute top-6 left-6 p-2 bg-slate-900 rounded-full text-slate-400 active:bg-slate-800"
                >
                    <X size={24} />
                </button>

                <div className="space-y-1">
                    <span className="px-3 py-1 rounded-full bg-blue-900/30 text-blue-400 text-xs font-bold uppercase tracking-wider border border-blue-500/20">
                        {warehouseName || 'Global Adjustment'}
                    </span>
                    <h2 className="text-2xl font-black text-white leading-tight mx-auto max-w-[80%]">
                        {productName}
                    </h2>
                    <p className="text-slate-500 font-mono text-sm">{sku}</p>
                </div>

                <div className="py-6">
                    <div className="text-sm text-slate-500 font-bold uppercase tracking-widest mb-1">
                        Expected: <span className="text-white">{maxExpected}</span>
                    </div>
                    <div className="text-7xl font-black text-white tracking-tight">
                        {value}
                    </div>
                    <div className="text-sm text-slate-500 font-bold uppercase tracking-widest mt-2">
                        Actual Count
                    </div>
                </div>
            </div>

            {/* Keypad Grid */}
            <div className="bg-slate-900 p-4 pb-8 rounded-t-[2.5rem] border-t border-slate-800 shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
                <div className="grid grid-cols-3 gap-3">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                        <button
                            key={num}
                            onClick={() => handlePress(num)}
                            className="h-16 rounded-2xl bg-slate-800 text-white text-2xl font-bold active:bg-slate-700 active:scale-95 transition-all shadow-sm border border-slate-700/50"
                        >
                            {num}
                        </button>
                    ))}

                    {/* Backspace */}
                    <button
                        onClick={handleBackspace}
                        className="h-16 rounded-2xl bg-slate-800 text-red-400 flex items-center justify-center active:bg-slate-700 active:scale-95 transition-all border border-slate-700/50"
                    >
                        <Delete size={28} />
                    </button>

                    <button
                        onClick={() => handlePress(0)}
                        className="h-16 rounded-2xl bg-slate-800 text-white text-2xl font-bold active:bg-slate-700 active:scale-95 transition-all border border-slate-700/50"
                    >
                        0
                    </button>

                    {/* Confirm Button */}
                    <button
                        onClick={() => onConfirm(parseInt(value))}
                        className="h-16 rounded-2xl bg-emerald-600 text-white flex items-center justify-center active:bg-emerald-500 active:scale-95 transition-all shadow-lg shadow-emerald-900/40"
                    >
                        <Check size={32} strokeWidth={3} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default MobileQuantityKeypad;