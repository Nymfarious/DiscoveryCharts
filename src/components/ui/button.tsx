import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-gradient-to-b from-[hsl(var(--brass))] to-[hsl(var(--leather))] text-[hsl(var(--parchment))] hover:from-[hsl(var(--gold))] hover:to-[hsl(var(--brass))] shadow-[0_4px_0_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.2)] hover:shadow-[0_2px_0_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.3)] active:translate-y-[2px] active:shadow-[0_1px_0_rgba(0,0,0,0.3)] border-2 border-[hsl(var(--gold))]/30",
        destructive:
          "bg-gradient-to-b from-destructive to-destructive/80 text-destructive-foreground hover:from-destructive/90 hover:to-destructive/70 shadow-[0_4px_0_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.2)] hover:shadow-[0_2px_0_rgba(0,0,0,0.3)] active:translate-y-[2px] border-2 border-destructive/30",
        outline:
          "border-2 border-[hsl(var(--brass))] bg-[hsl(var(--parchment))]/80 hover:bg-[hsl(var(--parchment))] text-[hsl(var(--leather))] shadow-[0_2px_4px_rgba(0,0,0,0.2),inset_0_1px_0_rgba(255,255,255,0.3)]",
        secondary:
          "bg-gradient-to-b from-[hsl(var(--parchment))] to-[hsl(var(--parchment-dark))] text-[hsl(var(--leather))] hover:from-[hsl(var(--parchment))]/90 hover:to-[hsl(var(--parchment-dark))]/90 shadow-[0_3px_0_rgba(0,0,0,0.2),inset_0_1px_0_rgba(255,255,255,0.4)] hover:shadow-[0_1px_0_rgba(0,0,0,0.2)] active:translate-y-[2px] border-2 border-[hsl(var(--brass))]/40",
        ghost: "hover:bg-[hsl(var(--parchment))]/50 hover:text-[hsl(var(--leather))]",
        link: "text-primary underline-offset-4 hover:underline",
        brass: "bg-gradient-to-b from-[hsl(var(--gold))] to-[hsl(var(--brass))] text-[hsl(var(--leather))] hover:from-[hsl(var(--gold))]/90 hover:to-[hsl(var(--brass))]/90 shadow-[0_4px_0_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.3),0_0_15px_rgba(45,90,55,0.1)] hover:shadow-[0_2px_0_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.4)] active:translate-y-[2px] border-2 border-[hsl(var(--brass))]/60 uppercase tracking-wider font-semibold",
        steel: "bg-gradient-to-b from-[hsl(200,15%,65%)] to-[hsl(200,15%,45%)] text-[hsl(var(--parchment))] hover:from-[hsl(200,15%,70%)] hover:to-[hsl(200,15%,50%)] shadow-[0_4px_0_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.2)] hover:shadow-[0_2px_0_rgba(0,0,0,0.3)] active:translate-y-[2px] border-2 border-[hsl(200,15%,35%)]/50 uppercase tracking-wider font-semibold",
      },
      size: {
        default: "h-10 px-6 py-2 rounded-sm",
        sm: "h-9 rounded-sm px-4 text-xs",
        lg: "h-12 rounded-sm px-10 text-base",
        icon: "h-10 w-10 rounded-sm",
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
