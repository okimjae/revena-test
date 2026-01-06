import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle2, ShieldCheck, Zap } from "lucide-react";
import { Link } from "react-router-dom";

export function Hero() {
    return (
        <section className="relative min-h-screen flex items-center justify-center pt-20 overflow-hidden bg-[#020617]">
            {/* Background Gradients */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-emerald-500/20 blur-[120px] rounded-full opacity-50 pointer-events-none" />
            <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-brand-dark/40 blur-[100px] rounded-full pointer-events-none" />

            <div className="container relative z-10 px-4 grid lg:grid-cols-2 gap-12 items-center">
                {/* Text Content */}
                <div className="space-y-8 text-center lg:text-left">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-emerald-400 text-xs font-medium tracking-wide">
                        <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                        AUDITORIA DE SAÚDE COM IA
                    </div>

                    <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight text-white leading-[1.1]">
                        Receita médica <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">
                            sem glosas
                        </span>
                    </h1>

                    <p className="text-lg md:text-xl text-slate-400 max-w-xl mx-auto lg:mx-0 font-light leading-relaxed">
                        Nossa IA analisa 100% das contas hospitalares em tempo real,
                        garantindo conformidade e maximizando o faturamento.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                        <Button size="lg" className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-full h-12 px-8 text-base shadow-[0_0_30px_rgba(16,185,129,0.3)] w-full sm:w-auto">
                            Falar com especialista
                            <ArrowRight className="ml-2 w-4 h-4" />
                        </Button>
                        <Button
                            asChild
                            size="lg"
                            variant="outline"
                            className="border-white/10 bg-white/5 hover:bg-white/10 text-white rounded-full h-12 px-8 w-full sm:w-auto backdrop-blur-sm cursor-pointer"
                        >
                            <Link to="/dashboard">Ver demonstração</Link>
                        </Button>
                    </div>

                    <div className="pt-8 flex items-center justify-center lg:justify-start gap-8 border-t border-white/5">
                        <div className="flex flex-col gap-1">
                            <span className="text-3xl font-bold text-white">R$ 45M+</span>
                            <span className="text-xs text-slate-500 uppercase tracking-widest">Auditados</span>
                        </div>
                        <div className="w-px h-10 bg-white/10" />
                        <div className="flex flex-col gap-1">
                            <span className="text-3xl font-bold text-emerald-400">99.8%</span>
                            <span className="text-xs text-slate-500 uppercase tracking-widest">Precisão</span>
                        </div>
                    </div>
                </div>

                {/* Visual Content (Cards/Diagram) */}
                <div className="relative lg:block">
                    {/* Main Card */}
                    <div className="relative z-20 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl animate-in slide-in-from-right-4 duration-1000">
                        <div className="flex items-center justify-between mb-8 border-b border-white/5 pb-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                                    <ShieldCheck className="w-5 h-5" />
                                </div>
                                <div>
                                    <div className="text-sm font-medium text-white">Status da Auditoria</div>
                                    <div className="text-xs text-slate-400">Atualizado agora</div>
                                </div>
                            </div>
                            <div className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-semibold">
                                EM ANDAMENTO
                            </div>
                        </div>

                        <div className="space-y-4">
                            {[
                                { label: "Análise de Materiais", status: "Concluído", time: "0.4s" },
                                { label: "Verificação de Tabela TUSS", status: "Concluído", time: "0.2s" },
                                { label: "Validação de Regras Convenio", status: "Processando...", time: "..." }
                            ].map((item, i) => (
                                <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/5">
                                    <div className="flex items-center gap-3">
                                        {item.status === "Concluído" ? (
                                            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                                        ) : (
                                            <div className="w-4 h-4 rounded-full border-2 border-emerald-500/30 border-t-emerald-500 animate-spin" />
                                        )}
                                        <span className="text-sm text-slate-200">{item.label}</span>
                                    </div>
                                    <span className="text-xs font-mono text-slate-500">{item.time}</span>
                                </div>
                            ))}
                        </div>

                        {/* Floating Elements */}
                        <div className="absolute -top-12 -right-12 p-4 bg-slate-900 rounded-xl border border-white/10 shadow-2xl animate-bounce duration-[3000ms]">
                            <div className="flex items-center gap-2">
                                <Zap className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                                <span className="text-xs font-bold text-white">+12% Receita</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
