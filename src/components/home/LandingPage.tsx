import { Hero } from "@/components/home/Hero";
import { Header } from "@/components/layout/Header";

export function LandingPage() {
    return (
        <div className="min-h-screen bg-background">
            <Header />
            <Hero />
            {/* Additional sections will be added here */}
            <section id="cases" className="py-20 bg-white dark:bg-slate-950">
                <div className="container mx-auto px-4 text-center">
                    <h2 className="text-3xl font-bold mb-12">Nossos Resultados</h2>
                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            { label: "Cash Gain", value: "+12%", desc: "Aumento no faturamento líquido" },
                            { label: "Eficiência", value: "30x", desc: "Mais rápido que auditoria manual" },
                            { label: "ROI", value: "4.5x", desc: "Retorno sobre investimento em 3 meses" }
                        ].map((stat, i) => (
                            <div key={i} className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                                <div className="text-4xl font-bold text-emerald-500 mb-2">{stat.value}</div>
                                <div className="text-lg font-semibold mb-2">{stat.label}</div>
                                <div className="text-sm text-muted-foreground">{stat.desc}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
}
