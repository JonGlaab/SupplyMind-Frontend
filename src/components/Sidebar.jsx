import { useState } from 'react'
import {
    LayoutDashboard,
    Package,
    ShoppingCart,
    RotateCcw,
    Settings,
    ChevronDown,
    ShieldCheck,
    LogOut
} from 'lucide-react'
import { cn } from '../lib/utils'

export function Sidebar({ currentView, onViewChange, onLogout }) {
    const [userRole] = useState(localStorage.getItem('userRole'));
    const [userEmail] = useState(localStorage.getItem('userEmail') || 'manager@supplymind.com');

    const [expandedMenus, setExpandedMenus] = useState({
        inventory: false,
        procurement: false,
    })

    const toggleMenu = (menu) => {
        setExpandedMenus(prev => ({ ...prev, [menu]: !prev[menu] }))
    }

    const NavItem = ({ icon: Icon, label, view, active }) => (
        <button
            onClick={() => onViewChange(view)}
            className={cn(
                'w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200',
                (active || currentView === view)
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'
            )}
        >
            <Icon className="w-5 h-5" />
            <span>{label}</span>
        </button>
    )

    return (
        <aside className="w-64 bg-slate-950 text-slate-100 flex flex-col h-screen border-r border-slate-800">
            {/* Logo Section - Clean branding */}
            <div className="p-8 border-b border-slate-800/50">
                <div className="flex items-center gap-2">
                    <span className="text-lg font-bold tracking-tight uppercase">
                        SUPPLY<span className="text-blue-500">MIND</span>
                    </span>
                </div>
            </div>

            {/* Navigation Section */}
            <nav className="flex-1 overflow-auto p-4 space-y-1">

                {/* Intelligence Hub */}
                {(userRole === 'ADMIN' || userRole === 'MANAGER') && (
                    <NavItem
                        icon={LayoutDashboard}
                        label={userRole === 'MANAGER' ? "Manager Intelligence" : "Command Center"}
                        view="dashboard"
                    />
                )}

                {/* Admin Panel */}
                {userRole === 'ADMIN' && (
                    <NavItem icon={ShieldCheck} label="Admin Panel" view="admin-panel" />
                )}

                {/* Inventory Grouping */}
                <div className="space-y-1">
                    <button
                        onClick={() => toggleMenu('inventory')}
                        className={cn(
                            'w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors',
                            (currentView === 'productlist' || currentView === 'inventory')
                                ? 'text-blue-400' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'
                        )}
                    >
                        <Package className="w-5 h-5" />
                        <span>Inventory</span>
                        <ChevronDown className={cn('w-4 h-4 ml-auto transition-transform duration-200', expandedMenus.inventory && 'rotate-180')} />
                    </button>
                    {expandedMenus.inventory && (
                        <div className="ml-9 space-y-1 border-l border-slate-800">
                            <button
                                onClick={() => onViewChange('productlist')}
                                className={cn('text-left px-4 py-2 text-xs rounded transition-colors block w-full',
                                    currentView === 'productlist' ? 'text-blue-400 font-bold' : 'text-slate-500 hover:text-slate-200'
                                )}
                            >
                                Product Catalog
                            </button>
                            <button
                                onClick={() => onViewChange('inventory')}
                                className={cn('text-left px-4 py-2 text-xs rounded transition-colors block w-full',
                                    currentView === 'inventory' ? 'text-blue-400 font-bold' : 'text-slate-500 hover:text-slate-200'
                                )}
                            >
                                Stock Management
                            </button>
                        </div>
                    )}
                </div>

                {/* Procurement */}
                {(userRole === 'MANAGER' || userRole === 'PROCUREMENT_OFFICER' || userRole === 'ADMIN') && (
                    <NavItem icon={ShoppingCart} label="Purchase Orders" view="procurement" />
                )}

                <NavItem icon={RotateCcw} label="Returns & Inspection" view="returns" />

                {/* Settings as a regular nav item */}
                <NavItem icon={Settings} label="User Settings" view="settings" />
            </nav>

            {/* Bottom Actions Area */}
            <div className="border-t border-slate-800 p-4 space-y-3">

                {/* The Logout Button */}
                <button
                    onClick={onLogout}
                    className="w-full flex items-center gap-3 px-4 py-2 text-sm font-medium text-red-400 hover:bg-red-500/10 hover:text-red-300 rounded-lg transition-all"
                >
                    <LogOut className="w-5 h-5" />
                    <span>Sign Out</span>
                </button>
            </div>
        </aside>
    )
}