"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";

import { cn } from "@/lib/utils";

type RainbowBorderButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  asChild?: boolean;
};

const Button = React.forwardRef<HTMLButtonElement, RainbowBorderButtonProps>(
  ({ asChild = false, children = "Button", className, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";

    return (
      <Comp
        className={cn(
          "rainbow-border relative inline-flex h-11 min-w-[140px] items-center justify-center gap-2.5 rounded-xl border-none bg-black px-5 text-sm font-black text-white transition-all duration-200 hover:-translate-y-0.5",
          className
        )}
        ref={ref}
        {...props}
      >
        {children}
      </Comp>
    );
  }
);

Button.displayName = "RainbowBorderButton";

export { Button, Button as RainbowBorderButton };
