import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Menu, X } from "lucide-react";

export function Header() {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <header
            className={cn(
                "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
                isScrolled ? "glass shadow-sm py-4" : "bg-transparent py-6"
            )}
        >
            <div className="container mx-auto px-4 flex items-center justify-between">
                {/* Logo */}
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500 from-emerald-400 to-emerald-600 bg-gradient-to-br flex items-center justify-center text-white font-bold text-xl shadow-[0_0_15px_rgba(16,185,129,0.4)]">
                        R
                    </div>
                    <span className={cn(
                        "text-xl font-bold tracking-tight transition-colors",
                        isScrolled ? "text-foreground" : "text-white"
                    )}>
                        Revena
                    </span>
                </div>

                {/* Desktop Nav */}
                <nav className="hidden md:flex items-center gap-8">
                    {["Sobre", "Tecnologia", "Cases", "Contato"].map((item) => (
                        <a
                            key={item}
                            href={`#${item.toLowerCase()}`}
                            className={cn(
                                "text-sm font-medium transition-colors hover:text-emerald-500",
                                isScrolled ? "text-muted-foreground" : "text-white/80 hover:text-white"
                            )}
                        >
                            {item}
                        </a>
                    ))}
                    <Button
                        className="bg-emerald-500 hover:bg-emerald-600 text-white shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_25px_rgba(16,185,129,0.5)] transition-all duration-300 rounded-full px-6"
                    >
                        Entrar em contato
                    </Button>
                </nav>

                {/* Mobile Toggle */}
                <button
                    className="md:hidden text-foreground"
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                >
                    {isMobileMenuOpen ? <X /> : <Menu className={isScrolled ? "text-foreground" : "text-white"} />}
                </button>

                {/* Mobile Menu */}
                {isMobileMenuOpen && (
                    <div className="absolute top-full left-0 right-0 bg-background/95 backdrop-blur-md border-b border-border p-4 flex flex-col gap-4 md:hidden shadow-lg animate-in slide-in-from-top-2">
                        {["Sobre", "Tecnologia", "Cases", "Contato"].map((item) => (
                            <a
                                key={item}
                                href={`#${item.toLowerCase()}`}
                                className="text-sm font-medium text-muted-foreground hover:text-emerald-500"
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                {item}
                            </a>
                        ))}
                        <Button className="w-full bg-emerald-500 hover:bg-emerald-600 text-white">
                            Entrar em contato
                        </Button>
                    </div>
                )}
            </div>
        </header>
    );
}
