import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        // Using CSS custom properties that map to Radix theme variables
        default: "bg-[var(--accent-9)] text-[var(--accent-contrast)] hover:bg-[var(--accent-10)]",
        destructive: "bg-[var(--red-9)] text-[var(--red-contrast)] hover:bg-[var(--red-10)]",
        outline: "border border-[var(--gray-6)] bg-transparent hover:bg-[var(--gray-4)] text-[var(--gray-12)]",
        secondary: "bg-[var(--gray-4)] text-[var(--gray-11)] hover:bg-[var(--gray-5)]",
        ghost: "hover:bg-[var(--gray-4)] text-[var(--gray-11)]",
        link: "text-[var(--accent-11)] underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
