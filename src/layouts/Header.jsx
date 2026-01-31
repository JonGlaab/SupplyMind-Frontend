import { Search, Bell, HelpCircle } from 'lucide-react'
// If you have these Shadcn components, keep these imports.
// If not, see the HTML alternatives in the code below.
import { Input } from '../components/ui/input'
import { Button } from '../components/ui/button'
import { Badge } from '../components/ui/badge'

export function Header() {
    return (
        <header className="border-b border-border bg-card px-6 py-4">
            <div className="flex items-center gap-4">

                {/* Search Bar */}
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    {/* If Input component is missing, use: <input className="pl-10 ..." /> */}
                    <Input
                        placeholder="Search SKU, PO #, or Supplier..."
                        className="pl-10 bg-background border-border w-full"
                    />
                </div>

                {/* Notification Bell */}
                {/* If Button component is missing, use: <button className="..."> */}
                <Button variant="outline" size="icon" className="relative bg-transparent">
                    <Bell className="w-5 h-5" />
                    {/* If Badge component is missing, use: <span className="..."> */}
                    <Badge className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 bg-red-600 text-white text-xs rounded-full">
                        3
                    </Badge>
                </Button>

                {/* Help Icon */}
                <Button variant="outline" size="icon">
                    <HelpCircle className="w-5 h-5" />
                </Button>
            </div>
        </header>
    )
}