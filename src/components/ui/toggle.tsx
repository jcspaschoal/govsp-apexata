import * as React from "react"
import * as TogglePrimitive from "@radix-ui/react-toggle"
import { cn } from "@/lib/utils"

export interface ToggleProps
  extends React.ComponentPropsWithoutRef<typeof TogglePrimitive.Root> {
  variant?: "default" | "outline"
  size?: "default" | "sm" | "lg"
}

const Toggle = React.forwardRef<
  React.ElementRef<typeof TogglePrimitive.Root>,
  ToggleProps
>(({ className, variant = "default", size = "default", ...props }, ref) => {
  const variants = {
    default: "bg-transparent",
    outline: "border border-border bg-transparent shadow-sm hover:bg-surface hover:text-text",
  }

  const sizes = {
    default: "h-9 px-3",
    sm: "h-8 px-2",
    lg: "h-10 px-3",
  }

  const baseStyles = "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors hover:bg-surface hover:text-text focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-focus disabled:pointer-events-none disabled:opacity-50 data-[state=on]:bg-surface data-[state=on]:text-text"

  return (
    <TogglePrimitive.Root
      ref={ref}
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      {...props}
    />
  )
})

Toggle.displayName = TogglePrimitive.Root.displayName

export { Toggle }
