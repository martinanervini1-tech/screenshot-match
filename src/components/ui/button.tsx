import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "desk-button inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium cursor-pointer transition-[background-color,color,border-color,transform] duration-250 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        animated: "button-animated bg-primary text-primary-foreground border border-primary",
        kpi: "kpi-link whitespace-normal text-left rounded-none focus-visible:ring-inset",
        default: "bg-primary text-primary-foreground hover:bg-primary-hover focus-visible:bg-primary-hover",
        destructive: "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
        outline:
          "border border-input bg-background text-foreground hover:border-border-hover hover:bg-accent hover:text-accent-foreground focus-visible:bg-accent focus-visible:border-border-hover",
        secondary: "border border-input bg-secondary text-secondary-foreground hover:bg-accent hover:border-border-hover focus-visible:bg-accent focus-visible:border-border-hover",
        ghost: "hover:bg-accent hover:text-accent-foreground focus-visible:bg-accent",
        link: "text-primary underline-offset-4 hover:underline",
        sunset: "bg-peach text-foreground hover:bg-gold focus-visible:bg-gold font-semibold",
        sidebar: "text-tile-blue hover:bg-primary/40 hover:text-primary-foreground h-11 px-3",
        conversation: "block whitespace-normal text-left hover:border-primary",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-10 rounded-md px-8",
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
      <Comp data-variant={variant ?? "default"} className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
