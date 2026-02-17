import React from 'react';
import { Outlet } from 'react-router-dom';

const MobileLayout = () => {
    return (
        <div className="flex flex-col h-[100dvh] bg-slate-950 overflow-hidden">

            <main className="flex-1 overflow-y-auto bg-slate-950 relative scroll-smooth">
                <Outlet />
            </main>

        </div>
    );
};

export default MobileLayout;