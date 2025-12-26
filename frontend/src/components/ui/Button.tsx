import * as React from "react"
import { cn } from "../../lib/utils"

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'default' | 'outline' | 'ghost' | 'destructive'
    size?: 'default' | 'sm' | 'lg'
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = 'default', size = 'default', ...props }, ref) => {
        const baseStyles = "inline-flex items-center justify-center rounded-lg font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"

        const variants = {
            default: "bg-primary-500 text-white hover:bg-primary-600 focus-visible:ring-primary-500",
            outline: "border-2 border-slate-300 bg-white hover:bg-slate-50 text-slate-900",
            ghost: "hover:bg-slate-100 text-slate-900",
            destructive: "bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-600"
        }

        const sizes = {
            default: "h-10 px-4 py-2 text-sm",
            sm: "h-8 px-3 text-xs",
            lg: "h-12 px-6 text-base"
        }

        return (
            <button
                className={cn(baseStyles, variants[variant], sizes[size], className)}
                ref={ref}
                {...props}
            />
        )
    }
)

Button.displayName = "Button"

export { Button }
