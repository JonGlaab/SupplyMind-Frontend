import * as React from "react"
import { cn } from "../../lib/utils"

const DropdownMenu = ({ children }) => <div className="relative inline-block text-left">{children}</div>

const DropdownMenuTrigger = ({ children, asChild }) => <div className="cursor-pointer">{children}</div>

const DropdownMenuContent = ({ children, className }) => (
    <div className={cn(
        "absolute right-0 z-50 mt-2 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md animate-in fade-in-80",
        className
    )}>
        {children}
    </div>
)

const DropdownMenuItem = ({ className, children, onClick }) => (
    <div
        onClick={onClick}
        className={cn(
            "relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
            className
        )}
    >
        {children}
    </div>
)

export {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
}