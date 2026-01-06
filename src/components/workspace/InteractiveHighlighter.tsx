import { ReactNode } from 'react';
import { cn } from "@/lib/utils";

interface InteractiveHighlighterProps {
    children: ReactNode;
    active?: boolean;
    onClick?: () => void;
    className?: string;
}

export function InteractiveHighlighter({ children, active, onClick, className }: InteractiveHighlighterProps) {
    return (
        <span
            onClick={onClick}
            className={cn(
                "cursor-pointer transition-all duration-200 rounded px-1 border",
                active
                    ? "bg-brand-accent text-brand-dark border-brand-accent shadow-sm"
                    : "bg-brand-accent/10 hover:bg-brand-accent/30 text-brand-dark/80 border-brand-accent/20 hover:border-brand-accent/50",
                className
            )}
        >
            {children}
        </span>
    );
}
