'use client';
import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 interactive",
  {
    variants: {
      variant: {
        default:
          "bg-gradient-to-r from-primary to-primary-hover text-primary-foreground shadow-lg hover:shadow-xl hover:shadow-primary/25 glow-hover",
        destructive:
          "bg-gradient-to-r from-destructive to-destructive/90 text-destructive-foreground shadow-lg hover:shadow-xl hover:shadow-destructive/25",
        outline:
          "glass border border-border/50 bg-background/50 backdrop-blur-md hover:bg-accent/50 hover:text-accent-foreground hover:border-primary/30",
        secondary:
          "glass bg-secondary/80 backdrop-blur-md text-secondary-foreground hover:bg-secondary-hover/80 shadow-md",
        ghost: 
          "hover:bg-accent/20 hover:text-accent-foreground backdrop-blur-sm",
        link: 
          "text-primary underline-offset-4 hover:underline hover:text-primary-hover",
        glass:
          "glass-card text-foreground hover:bg-white/10 dark:hover:bg-white/5 border-white/20 dark:border-white/10",
        neu:
          "neu bg-background text-foreground hover:text-primary",
        gradient:
          "bg-gradient-to-r from-primary via-accent to-primary-hover text-white shadow-xl hover:shadow-2xl hover:shadow-primary/30 hover:scale-[1.02]",
      },
      size: {
        default: "h-11 px-6 py-2",
        sm: "h-9 rounded-lg px-4",
        lg: "h-12 rounded-xl px-8 text-base",
        xl: "h-14 rounded-2xl px-10 text-lg",
        icon: "h-11 w-11 rounded-xl",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
