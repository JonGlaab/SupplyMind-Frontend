import { useState } from 'react'
import { LayoutDashboard, Package, ShoppingCart, RotateCcw, Settings, ChevronDown } from 'lucide-react'
import { cn } from '../lib/utils' // Ensure this path matches your project structure

export function Sidebar({ currentView, onViewChange }) {
    const [expandedMenus, setExpandedMenus] = useState({
        inventory: false,
        procurement: false,
    })

    const toggleMenu = (menu) => {
        setExpandedMenus(prev => ({
            ...prev,
            [menu]: !prev[menu]
        }))
    }

    const NavItem = ({ icon: Icon, label, view, submenu }) => (
        <button
            onClick={() => !submenu && onViewChange(view)}
            className={cn(
                'w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors',
                currentView === view
                    ? 'bg-primary text-primary-foreground'
                    : 'text-foreground hover:bg-muted'
            )}
        >
            <Icon className="w-5 h-5" />
            <span>{label}</span>
            {submenu && (
                <ChevronDown className={cn(
                    'w-4 h-4 ml-auto transition-transform',
                    expandedMenus[view] && 'rotate-180'
                )} />
            )}
        </button>
    )

    return (
        <aside className="w-64 bg-card border-r border-border flex flex-col h-screen">
            {/* Logo */}
            <div className="p-6 border-b border-border">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded bg-primary text-primary-foreground flex items-center justify-center font-bold">
                        S
                    </div>
                    <span className="text-lg font-bold text-foreground">SupplyMind</span>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 overflow-auto p-4 space-y-2">
                <NavItem
                    icon={LayoutDashboard}
                    label="Command Center"
                    view="dashboard"
                />

                <div>
                    <button
                        onClick={() => toggleMenu('inventory')}
                        className={cn(
                            'w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors',
                            currentView.startsWith('inventory')
                                ? 'bg-primary text-primary-foreground'
                                : 'text-foreground hover:bg-muted'
                        )}
                    >
                        <Package className="w-5 h-5" />
                        <span>Inventory</span>
                        <ChevronDown className={cn(
                            'w-4 h-4 ml-auto transition-transform',
                            expandedMenus.inventory && 'rotate-180'
                        )} />
                    </button>
                    {expandedMenus.inventory && (
                        <div className="ml-4 mt-1 space-y-1">
                            <button
                                onClick={() => onViewChange('inventory')}
                                className={cn(
                                    'text-left px-4 py-2 text-xs rounded transition-colors block w-full',
                                    currentView === 'inventory'
                                        ? 'bg-secondary text-secondary-foreground'
                                        : 'text-muted-foreground hover:text-foreground'
                                )}
                            >
                                Products
                            </button>
                        </div>
                    )}
                </div>

                <div>
                    <button
                        onClick={() => toggleMenu('procurement')}
                        className={cn(
                            'w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors',
                            currentView.startsWith('procurement')
                                ? 'bg-primary text-primary-foreground'
                                : 'text-foreground hover:bg-muted'
                        )}
                    >
                        <ShoppingCart className="w-5 h-5" />
                        <span>Procurement</span>
                        <ChevronDown className={cn(
                            'w-4 h-4 ml-auto transition-transform',
                            expandedMenus.procurement && 'rotate-180'
                        )} />
                    </button>
                    {expandedMenus.procurement && (
                        <div className="ml-4 mt-1 space-y-1">
                            <button
                                onClick={() => onViewChange('procurement')}
                                className={cn(
                                    'text-left px-4 py-2 text-xs rounded transition-colors block w-full',
                                    currentView === 'procurement'
                                        ? 'bg-secondary text-secondary-foreground'
                                        : 'text-muted-foreground hover:text-foreground'
                                )}
                            >
                                Purchase Orders
                            </button>
                        </div>
                    )}
                </div>

                <NavItem
                    icon={RotateCcw}
                    label="Returns & Inspection"
                    view="returns"
                />
            </nav>

            {/* Settings & Profile */}
            <div className="border-t border-border p-4 space-y-2">
                <button
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-foreground hover:bg-muted rounded-lg transition-colors"
                >
                    <Settings className="w-5 h-5" />
                    <span>Settings</span>
                </button>
                <div className="flex items-center gap-3 px-4 py-3">
                    <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                        A
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">Admin User</p>
                        <p className="text-xs text-muted-foreground truncate">admin@supplymind.com</p>
                    </div>
                </div>
            </div>
        </aside>
    )
}