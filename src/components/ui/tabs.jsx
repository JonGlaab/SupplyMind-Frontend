import * as React from "react"
import { cn } from "../../lib/utils"

const Tabs = ({ children, value, onValueChange, className }) => (
    <div className={cn("space-y-2", className)}>{children}</div>
)

const TabsList = ({ children, className }) => (
    <div className={cn("inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground", className)}>
        {children}
    </div>
)

const TabsTrigger = ({ children, value, onClick, className, ...props }) => (
    <button
        onClick={onClick}
        className={cn(
            "inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm",
            className
        )}
        {...props}
    >
        {children}
    </button>
)

const TabsContent = ({ children, value, className }) => (
    <div className={cn("mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2", className)}>
        {children}
    </div>
)

export { Tabs, TabsList, TabsTrigger, TabsContent }