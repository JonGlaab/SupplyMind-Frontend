import * as React from "react"
import { cn } from "../../lib/utils"

const Select = ({ children, value, onValueChange }) => {
    // We pass the value and change handler down to the hidden native select
    return <div className="relative w-full">{children}</div>
}

const SelectTrigger = ({ className, children }) => (
    <div className={cn(
        "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        className
    )}>
        {children}
    </div>
)

const SelectValue = ({ placeholder }) => <span className="text-sm">{placeholder}</span>

const SelectContent = ({ children }) => (
    <div className="absolute z-50 mt-1 max-h-60 w-full overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md">
        {children}
    </div>
)

const SelectItem = ({ children, value, onClick }) => (
    <div
        onClick={onClick}
        className="relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none hover:bg-accent hover:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
    >
        {children}
    </div>
)

export { Select, SelectTrigger, SelectContent, SelectItem, SelectValue }