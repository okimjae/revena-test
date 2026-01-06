import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAuditStore } from '@/store/auditStore';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { FileText, Loader2, Play, HelpCircle } from "lucide-react";
import { AuditJob } from '@/types/audit';
import { BatchUploadModal } from './BatchUploadModal';
import { useTour } from "@/components/ui/tour";
import { CreatePdfModal } from './CreatePdfModal';

export function JobQueue() {
    const navigate = useNavigate();
    const tour = useTour();
    const jobs = useAuditStore(state => state.jobs);
    const setActiveJob = useAuditStore(state => state.setActiveJob);
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [isCreatePdfModalOpen, setIsCreatePdfModalOpen] = useState(false);

    useEffect(() => {
        const hasSeenTour = localStorage.getItem("revena-dashboard-tour-seen");
        if (!hasSeenTour) {
            // Short timeout to ensure elements are mounted
            setTimeout(() => {
                tour.start("dashboard");
                localStorage.setItem("revena-dashboard-tour-seen", "true");
            }, 1000);
        }
    }, []);

    const handleAudit = (job: AuditJob) => {
        setActiveJob(job.id);
        navigate(`/workspace/${job.id}`);
    };

    const getStatusBadge = (status: AuditJob['status']) => {
        switch (status) {
            case 'queued': return <Badge variant="secondary" className="bg-slate-800 text-slate-300 hover:bg-slate-700">Na Fila</Badge>;
            case 'processing': return <Badge className="bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 border border-blue-500/20">Processando</Badge>;
            case 'ready': return <Badge className="bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 border border-emerald-500/20">Pronto</Badge>;
            case 'failed': return <Badge variant="destructive">Falha</Badge>;
            default: return <Badge>{status}</Badge>;
        }
    };

    return (
        <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black p-4 md:p-8 space-y-8">
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div data-tour-step-id="welcome-dashboard" className="space-y-1">
                        <div data-tour-step-id="monitor" className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium tracking-wide">
                            <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                            LIVE MONITOR
                        </div>
                        <h1 data-tour-step-id="heading" className="text-4xl font-bold tracking-tight text-white">Painel de Auditoria</h1>
                        <p className="text-slate-400">Gerencie e valide auditorias processadas pela Revena AI.</p>
                    </div>
                    <div className="flex gap-3 w-full md:w-auto">
                        <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => tour.start("dashboard")}
                            className="text-muted-foreground hover:text-foreground hover:bg-accent"
                        >
                            <HelpCircle className="mr-2 h-4 w-4" />
                            Guia
                        </Button>
                        <Button
                            variant="outline"
                            className="bg-white/5 border-white/10 text-white hover:bg-white/10 hover:text-white backdrop-blur-sm"
                            onClick={() => setIsCreatePdfModalOpen(true)}
                        >
                            <FileText className="mr-2 h-4 w-4" />
                            Criar PDF Teste
                        </Button>
                        <Button
                            data-tour-step-id="new-batch"
                            className="bg-emerald-500 hover:bg-emerald-600 text-white shadow-[0_0_20px_rgba(16,185,129,0.2)] hover:shadow-[0_0_25px_rgba(16,185,129,0.4)] transition-all"
                            onClick={() => setIsUploadModalOpen(true)}
                        >
                            + Novo Lote
                        </Button>
                    </div>
                </div>

                {/* Stats Grid */}
                <div data-tour-step-id="stats" className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[
                        { label: "Economia Gerada", value: "R$ 450k", sub: "Últimos 30 dias" },
                        { label: "Tempo Médio", value: "12m", sub: "-85% vs Manual" },
                        { label: "Arquivos Auditados", value: "1,402", sub: "Este mês" }
                    ].map((stat, i) => (
                        <Card key={i} className="border border-white/10 bg-white/5 backdrop-blur-md">
                            <CardContent className="p-6">
                                <div className="text-3xl font-bold text-white mb-1">{stat.value}</div>
                                <div className="text-sm font-medium text-emerald-400 mb-1">{stat.label}</div>
                                <div className="text-xs text-slate-500">{stat.sub}</div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Main Queue Card */}
                <Card data-tour-step-id="jobs-table" className="border border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl overflow-hidden">
                    <CardHeader className="border-b border-white/5 pb-4 bg-black/20">
                        <div className="flex items-center justify-between">
                            <div className="space-y-1">
                                <CardTitle className="text-xl font-semibold text-white">Fila de Processamento</CardTitle>
                                <CardDescription className="text-slate-400">Status em tempo real do pipeline.</CardDescription>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-slate-500 font-mono">
                                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                                SYNCED
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="border-t border-white/5">
                            <Table>
                                <TableHeader className="bg-white/5 hover:bg-white/5">
                                    <TableRow className="border-white/5 hover:bg-transparent">
                                        <TableHead className="text-slate-400 font-medium h-12">Arquivo</TableHead>
                                        <TableHead className="text-slate-400 font-medium hidden md:table-cell">Data</TableHead>
                                        <TableHead className="text-slate-400 font-medium">Status</TableHead>
                                        <TableHead className="text-slate-400 font-medium hidden lg:table-cell">Progresso</TableHead>
                                        <TableHead className="text-right text-slate-400 font-medium">Ação</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {jobs.map((job) => (
                                        <TableRow key={job.id} className="border-white/5 hover:bg-white/5 transition-colors group">
                                            <TableCell className="font-medium">
                                                <div
                                                    className="flex items-center gap-3 cursor-pointer"
                                                    onClick={() => handleAudit(job)}
                                                >
                                                    <div className="p-2 rounded-lg bg-white/5 group-hover:bg-emerald-500/20 group-hover:text-emerald-400 transition-colors">
                                                        <FileText className="h-4 w-4 text-slate-400 group-hover:text-emerald-400 transition-colors" />
                                                    </div>
                                                    <span className="text-slate-200 group-hover:text-white transition-colors truncate max-w-[150px] md:max-w-xs font-medium">
                                                        {job.filename}
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="hidden md:table-cell text-slate-400 text-sm">{job.uploadDate}</TableCell>
                                            <TableCell>
                                                <div className="transform scale-90 origin-left">
                                                    {getStatusBadge(job.status)}
                                                </div>
                                            </TableCell>
                                            <TableCell className="hidden lg:table-cell">
                                                {job.status === 'processing' && (
                                                    <div className="flex items-center gap-2 text-xs text-emerald-400 animate-pulse font-mono bg-emerald-500/10 px-2 py-1 rounded w-fit">
                                                        <Loader2 className="h-3 w-3 animate-spin" />
                                                        {job.progressStep}
                                                    </div>
                                                )}
                                                {job.status === 'ready' && (
                                                    <span className="text-xs text-slate-500 font-mono">{job.itemCount} itens encontrados</span>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button
                                                    size="sm"
                                                    variant={job.status === 'ready' ? 'default' : 'ghost'}
                                                    className={job.status === 'ready'
                                                        ? 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/20 h-8 px-4'
                                                        : 'text-slate-400 hover:text-white hover:bg-white/10 h-8 px-4'}
                                                    onClick={() => handleAudit(job)}
                                                >
                                                    {job.status === 'ready' ? (
                                                        <>Auditar <Play className="ml-2 h-3 w-3" /></>
                                                    ) : 'Detalhes'}
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <BatchUploadModal open={isUploadModalOpen} onOpenChange={setIsUploadModalOpen} />
            <CreatePdfModal open={isCreatePdfModalOpen} onOpenChange={setIsCreatePdfModalOpen} />
        </div>
    );
}
