import { useState } from 'react'
import { Sidebar } from '../components/Sidebar.jsx'
import { Header } from './Header'
import { CommandCenter } from '../pages/core/CommandCenter'
import { InventoryView } from '../pages/core/InventoryView'
import { PurchaseOrders } from '../pages/core/PurchaseOrders'
import { ReturnsInspection } from '../pages/core/ReturnsInspection'

export default function MainLayout() {
    const [currentView, setCurrentView] = useState('dashboard')

    const renderView = () => {
        switch (currentView) {
            case 'dashboard': return <CommandCenter />
            case 'inventory': return <InventoryView />
            case 'procurement': return <PurchaseOrders />
            case 'returns': return <ReturnsInspection />
            default: return <CommandCenter />
        }
    }

    return (
        <div className="flex h-screen bg-background text-foreground">
            <Sidebar currentView={currentView} onViewChange={setCurrentView} />
            <div className="flex-1 flex flex-col overflow-hidden">
                <Header />
                <main className="flex-1 overflow-auto p-6">
                    {renderView()}
                </main>
            </div>
        </div>
    )
}