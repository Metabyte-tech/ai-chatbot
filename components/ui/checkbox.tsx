"use client";

import * as React from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
    onCheckedChange?: (checked: boolean) => void;
}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
    ({ className, onCheckedChange, ...props }, ref) => {
        return (
            <div className="relative flex items-center justify-center h-5 w-5 pointer-events-none">
                <input
                    type="checkbox"
                    ref={ref}
                    className={cn(
                        "peer h-5 w-5 cursor-pointer appearance-none rounded border border-zinc-300 bg-white transition-all checked:border-zinc-900 checked:bg-zinc-900 hover:border-zinc-400 pointer-events-auto",
                        className
                    )}
                    onChange={(e) => onCheckedChange?.(e.target.checked)}
                    {...props}
                />
                <Check
                    className="absolute h-3.5 w-3.5 text-white opacity-0 transition-opacity peer-checked:opacity-100 pointer-events-none"
                    strokeWidth={4}
                />
            </div>
        );
    }
);
Checkbox.displayName = "Checkbox";

export { Checkbox };
