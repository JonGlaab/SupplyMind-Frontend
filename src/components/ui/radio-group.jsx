import * as React from "react"
import { cn } from "../../lib/utils"

const RadioGroup = ({ children, className, value, onValueChange }) => (
    <div className={cn("grid gap-2", className)} role="radiogroup">
        {React.Children.map(children, (child) =>
            React.cloneElement(child, { checked: child.props.value === value, onChange: () => onValueChange(child.props.value) })
        )}
    </div>
)

const RadioGroupItem = ({ value, id, checked, onChange, className }) => (
    <input
        type="radio"
        id={id}
        value={value}
        checked={checked}
        onChange={onChange}
        className={cn("h-4 w-4 border-primary text-primary focus:ring-primary", className)}
    />
)

export { RadioGroup, RadioGroupItem }