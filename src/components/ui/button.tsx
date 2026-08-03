import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium cursor-pointer transition-all duration-300 ease-out focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground shadow hover:bg-primary/90 hover:-translate-y-0.5 hover:shadow-md",
        destructive: "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90 hover:-translate-y-0.5 hover:shadow-md",
        outline:
          "border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground hover:-translate-y-0.5 hover:shadow-md",
        secondary: "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80 hover:-translate-y-0.5 hover:shadow-md",
        ghost: "hover:bg-accent hover:text-accent-foreground hover:-translate-y-0.5",
        link: "text-primary underline-offset-4 hover:underline",
        /* Editorial CTA treatment — matches the hero buttons on the landing
           page: serif type, hairline radius, ink-on-ivory contrast. */
        editorial:
          "rounded-sm border border-[#2B2B2B] bg-[#2B2B2B] font-serif font-medium tracking-tight text-[#F6F2E8] shadow-[0_10px_28px_-14px_rgba(43,43,43,0.35)] transition-all duration-300 ease-out hover:-translate-y-0.5 hover:bg-[#3D3D3D] hover:shadow-[0_14px_34px_-12px_rgba(43,43,43,0.45)] active:scale-[0.98]",
        editorialOutline:
          "rounded-sm border border-[#2B2B2B]/20 bg-transparent font-serif font-medium tracking-tight text-[#2B2B2B] transition-all duration-300 ease-out hover:-translate-y-0.5 hover:bg-[#2B2B2B]/5 hover:text-[#1F1D1B] hover:border-[#2B2B2B]/35 hover:shadow-[0_10px_28px_-14px_rgba(43,43,43,0.18)] active:scale-[0.98]",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-10 rounded-md px-6 text-[15px]",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
