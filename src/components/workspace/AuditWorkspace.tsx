import { useRef, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuditStore } from '@/store/auditStore';
import { SmartCombobox } from './SmartCombobox';
import { VerifyAuditModal } from './VerifyAuditModal';
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { TextAnimate } from "@/components/magicui/text-animate";
import { ArrowLeft, Terminal, X, FileText, CheckSquare, ChevronUp, ChevronDown, Download, HelpCircle } from 'lucide-react';
import { memo } from 'react';
import { LogEntry, AuditItem } from "@/types/audit";
import { InteractiveHighlighter } from './InteractiveHighlighter';
import { toast } from 'sonner';
import { useTour } from "@/components/ui/tour";

const LogRow = memo(({ log, shouldAnimate }: { log: LogEntry; shouldAnimate: boolean }) => (
    <div className="flex gap-2 opacity-90 hover:opacity-100 transition-opacity">
        <span className="text-white/40">[{log.timestamp}]</span>
        <span className={log.type === 'success' ? 'text-brand-accent' : log.type === 'warning' ? 'text-yellow-400' : 'text-gray-300'}>
            {log.type === 'success' ? '✓ ' : '> '}
            {shouldAnimate ? (
                <TextAnimate animation="blurInUp" by="word" once duration={0.3} delay={0.04}>
                    {log.message}
                </TextAnimate>
            ) : (
                <span>{log.message}</span>
            )}
        </span>
    </div>
));
LogRow.displayName = 'LogRow';

export function AuditWorkspace() {
    const { id } = useParams();
    const navigate = useNavigate();
    const bottomRef = useRef<HTMLDivElement>(null);
    const [isTerminalOpen, setIsTerminalOpen] = useState(true);
    const [isVerifyModalOpen, setIsVerifyModalOpen] = useState(false);

    const jobs = useAuditStore(state => state.jobs);
    const auditItems = useAuditStore(state => state.auditItems);
    const addAuditItems = useAuditStore(state => state.addAuditItems);
    const removeAuditItem = useAuditStore(state => state.removeAuditItem);
    const logs = useAuditStore(state => state.logs);
    const addLog = useAuditStore(state => state.addLog);
    const startSimulation = useAuditStore(state => state.startSimulation);

    const activeJob = jobs.find(j => j.id === id);
    const tour = useTour();

    useEffect(() => {
        const hasSeenTour = localStorage.getItem("revena-workspace-tour-seen");
        if (!hasSeenTour) {
            setTimeout(() => {
                tour.start("workspace");
                localStorage.setItem("revena-workspace-tour-seen", "true");
            }, 1000);
        }
    }, [tour]);

    useEffect(() => {
        if (id) {
            startSimulation(id);
        }
    }, [id, startSimulation]);

    // Display logs from the active job, or fall back to global logs if empty (legacy)
    const effectiveLogs = activeJob?.logs && activeJob.logs.length > 0 ? activeJob.logs : logs;

    // Track how many logs existed when we mounted, so we don't animate them
    const [initialLogCount] = useState(effectiveLogs.length);

    const handleExport = () => {
        if (!activeJob) return;

        const xmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<AuditReport>
    <Meta>
        <JobId>${activeJob.id}</JobId>
        <Filename>${activeJob.filename}</Filename>
        <Date>${new Date().toISOString()}</Date>
        <TotalValue>${auditItems.reduce((acc, item) => acc + (item.totalPrice || 0), 0).toFixed(2)}</TotalValue>
    </Meta>
    <Items>
        ${auditItems.map(item => `
        <Item>
            <Name>${item.name}</Name>
            <Category>${item.category}</Category>
            <Quantity>${item.quantity}</Quantity>
            <UnitPrice>${item.unitPrice?.toFixed(2)}</UnitPrice>
            <TotalPrice>${(item.quantity * (item.unitPrice || 0)).toFixed(2)}</TotalPrice>
            <Verified>${item.foundInDoc}</Verified>
        </Item>`).join('')}
    </Items>
</AuditReport>`;

        const blob = new Blob([xmlContent], { type: 'application/xml' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Auditoria_${activeJob.id}.xml`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        toast.success("Relatório de Auditoria Exportado", {
            description: "O arquivo XML foi gerado e baixado com sucesso."
        });
    };

    const addInteractiveItem = (name: string, price: number) => {
        const newItem: AuditItem = {
            id: Math.random().toString(36).substr(2, 9),
            name: name,
            category: 'Medicines',
            quantity: 1,
            unitPrice: price,
            totalPrice: price,
            foundInDoc: true,
            confidence: 0.99,
            selected: false
        };
        addAuditItems([newItem]);
        addLog(`Usuário verificou item do texto: ${name}`, 'success');
        toast.info(`${name} adicionado à lista`);
    };



    // Auto-scroll to bottom of logs
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [effectiveLogs]);

    if (!activeJob) {
        return <div className="p-8">Arquivo não encontrado <Button onClick={() => navigate('/')}>Voltar</Button></div>;
    }

    const calculateTotal = () => {
        return auditItems.reduce((acc, item) => acc + (item.totalPrice || 0), 0).toFixed(2);
    };

    const verifyMetadata = (type: string, value: string) => {
        toast.success(`${type} Verificado`, {
            description: `Valor "${value}" confirmado com o documento.`
        });
        addLog(`Metadado verificado manualmente: ${type}`, 'success');
    };

    // Components for Pane Content to re-use in Mobile Tabs and Desktop Split
    const PdfPane = () => {
        const customData = activeJob?.customPdfData;

        return (
            <div data-tour-step-id="pdf-viewer" className="h-full flex flex-col relative group bg-gray-900 border-r border-border">
                <div className="bg-gray-800 p-2 text-xs text-white flex justify-between items-center px-4">
                    <span>Página 1 / {customData ? '1' : '12'}</span>
                    <div className="flex gap-2">
                        <Button variant="ghost" size="icon" className="h-6 w-6 text-white hover:bg-white/20"><ChevronDown className="h-3 w-3" /></Button>
                        <Button variant="ghost" size="icon" className="h-6 w-6 text-white hover:bg-white/20"><ChevronUp className="h-3 w-3" /></Button>
                    </div>
                </div>
                <div className="flex-1 flex items-center justify-center relative overflow-hidden bg-gray-900/50 p-4">
                    {/* Mock PDF Content */}
                    <div className="w-full h-full max-w-[600px] bg-white shadow-2xl p-8 text-[12px] text-gray-700 overflow-y-auto select-none rounded-sm">
                        <h1 className="text-xl font-bold text-black mb-4">RELATÓRIO CIRÚRGICO</h1>
                        <div className="flex justify-between text-gray-500 mb-6 border-b pb-2">
                            <span>
                                Paciente: <InteractiveHighlighter onClick={() => verifyMetadata('Paciente', customData?.patientName || 'João da Silva')}>{customData?.patientName || 'João da Silva'}</InteractiveHighlighter>
                            </span>
                            <span>
                                DN: <InteractiveHighlighter onClick={() => verifyMetadata('Data de Nascimento', '01/01/1980')}>01/01/1980</InteractiveHighlighter>
                            </span>
                        </div>

                        <p className="font-bold mt-4">PROCEDIMENTO:</p>
                        {customData ? (
                            <InteractiveHighlighter onClick={() => addInteractiveItem(customData.procedure, 1500)}>
                                {customData.procedure}
                            </InteractiveHighlighter>
                        ) : (
                            <InteractiveHighlighter onClick={() => addInteractiveItem('Colecistectomia Videolaparoscópica', 1500)}>
                                Colecistectomia Videolaparoscópica
                            </InteractiveHighlighter>
                        )}

                        {!customData && (
                            <>
                                <p className="font-bold mt-2">ANESTESIA:</p>
                                <InteractiveHighlighter onClick={() => addInteractiveItem('Anestesia Geral', 450)}>
                                    Geral
                                </InteractiveHighlighter>
                            </>
                        )}

                        <br />
                        <p className="font-bold">DESCRIÇÃO:</p>
                        {customData ? (
                            <p className="leading-relaxed whitespace-pre-wrap">
                                {customData.description}
                            </p>
                        ) : (
                            <>
                                <p className="leading-relaxed">
                                    O paciente foi levado ao centro cirúrgico... <InteractiveHighlighter className="mx-1" onClick={() => addInteractiveItem('Dipirona 500mg', 5.00)}>Dipirona</InteractiveHighlighter> foi administrada...
                                </p>
                                <p className="leading-relaxed mt-2">
                                    ...inserção de trocarte realizada utilizando um <InteractiveHighlighter className="mx-1" onClick={() => addInteractiveItem('Trocar 10mm', 120.00)}>Trocar 10mm</InteractiveHighlighter>...
                                </p>
                                <p className="mt-2">...hemostasia alcançada...</p>
                            </>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    const toggleItemSelection = useAuditStore(state => state.toggleItemSelection);
    const [focusedIndex, setFocusedIndex] = useState(-1);

    // Keyboard Shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!auditItems.length) return;

            // Only capture if we aren't in an input (though here we don't have many inputs in this view)
            if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') return;

            switch (e.key) {
                case 'ArrowDown':
                    e.preventDefault();
                    setFocusedIndex(prev => Math.min(prev + 1, auditItems.length - 1));
                    break;
                case 'ArrowUp':
                    e.preventDefault();
                    setFocusedIndex(prev => Math.max(prev - 1, 0));
                    break;
                case 'Enter':
                    e.preventDefault();
                    if (focusedIndex >= 0 && auditItems[focusedIndex]) {
                        toggleItemSelection(auditItems[focusedIndex].id);
                        toast.success(auditItems[focusedIndex].selected ? "Item desmarcado" : "Item verificado");
                    }
                    break;
                case 'Delete':
                case 'Backspace':
                    e.preventDefault();
                    if (focusedIndex >= 0 && auditItems[focusedIndex]) {
                        const id = auditItems[focusedIndex].id;
                        removeAuditItem(id);
                        toast.info("Item removido");
                        // Adjust focus if we deleted the last item
                        if (focusedIndex >= auditItems.length - 1) {
                            setFocusedIndex(Math.max(0, auditItems.length - 2));
                        }
                    }
                    break;
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [auditItems, focusedIndex, removeAuditItem, toggleItemSelection]);

    // Reset focus when items change substantially (optional, but good for UX)
    useEffect(() => {
        if (auditItems.length > 0 && focusedIndex === -1) {
            setFocusedIndex(0);
        }
    }, [auditItems.length, focusedIndex]);

    const EditorPane = () => (
        <div className="h-full flex flex-col bg-transparent">
            <div data-tour-step-id="combobox" className="p-4 border-b border-white/5 bg-black/20 backdrop-blur-md shadow-sm z-10">
                <SmartCombobox />
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-transparent/5">
                <div className="bg-white/5 backdrop-blur-md rounded-xl border border-white/10 shadow-2xl overflow-hidden relative pb-8">
                    <Table>
                        <TableHeader className="bg-black/20">
                            <TableRow className="border-white/5 hover:bg-transparent">
                                <TableHead className="w-[40%] text-slate-400">Item</TableHead>
                                <TableHead className="w-[15%] text-center text-slate-400">Qtd</TableHead>
                                <TableHead className="w-[20%] text-right text-slate-400">Valor Unit.</TableHead>
                                <TableHead className="w-[20%] text-right text-slate-400">Total</TableHead>
                                <TableHead className="w-[5%]"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {auditItems.length === 0 && (
                                <>
                                    {[1, 2, 3].map((i) => (
                                        <TableRow key={i} className="border-white/5">
                                            <TableCell>
                                                <div className="h-4 w-32 bg-white/5 rounded animate-pulse mb-2" />
                                                <div className="h-3 w-16 bg-white/5 rounded animate-pulse opacity-50" />
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <div className="h-4 w-8 bg-white/5 rounded animate-pulse mx-auto" />
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="h-4 w-16 bg-white/5 rounded animate-pulse ml-auto" />
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="h-4 w-16 bg-white/5 rounded animate-pulse ml-auto" />
                                            </TableCell>
                                            <TableCell />
                                        </TableRow>
                                    ))}
                                    <TableRow className="border-white/5">
                                        <TableCell colSpan={5} className="text-center h-20 text-slate-500 animate-pulse">
                                            IA analisando documento...
                                        </TableCell>
                                    </TableRow>
                                </>
                            )}
                            {auditItems.map((item, index) => (
                                <TableRow
                                    key={item.id}
                                    className={`
                                        border-white/5 transition-all duration-200 cursor-pointer
                                        ${item.foundInDoc ? 'bg-emerald-500/5' : ''}
                                        ${focusedIndex === index ? 'bg-emerald-500/10 ring-1 ring-inset ring-emerald-500/50' : 'hover:bg-white/5'}
                                        ${item.selected ? 'bg-emerald-500/20' : ''}
                                    `}
                                    onClick={() => setFocusedIndex(index)}
                                >
                                    <TableCell>
                                        <div className="font-medium flex items-center gap-2 text-slate-200">
                                            {item.selected && <CheckSquare className="h-4 w-4 text-emerald-400 animate-in zoom-in" />}
                                            {item.name}
                                        </div>
                                        <div className="text-xs text-slate-500">{item.category}</div>
                                    </TableCell>
                                    <TableCell className="text-center text-slate-300">{item.quantity}</TableCell>
                                    <TableCell className="text-right text-slate-300">{item.unitPrice?.toFixed(2)}</TableCell>
                                    <TableCell className="text-right font-medium text-emerald-400">
                                        {(item.quantity * (item.unitPrice || 0)).toFixed(2)}
                                    </TableCell>
                                    <TableCell>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-8 w-8 p-0 text-red-400 hover:text-red-300 hover:bg-red-500/20"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                removeAuditItem(item.id);
                                            }}
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>

                    {/* Keyboard Shortcuts Legend */}
                    <div data-tour-step-id="shortcuts" className="absolute bottom-2 right-4 flex gap-4 text-[10px] text-slate-500 font-mono pointer-events-none opacity-50">
                        <span className="flex items-center gap-1"><span className="border border-slate-700 rounded px-1">↑↓</span> Nav</span>
                        <span className="flex items-center gap-1"><span className="border border-slate-700 rounded px-1">Enter</span> Verificar</span>
                        <span className="flex items-center gap-1"><span className="border border-slate-700 rounded px-1">Del</span> Remover</span>
                    </div>
                </div>

                <div className="flex justify-end p-4 border-t border-white/10 mt-auto">
                    <div className="text-right">
                        <div className="text-sm text-slate-400">Total Estimado</div>
                        <div className="text-2xl font-bold text-emerald-400">R$ {calculateTotal()}</div>
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <div className="flex h-screen flex-col bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black overflow-hidden relative">
            {/* Header */}
            {/* Header - Apple Style Glassmorphism */}


            {/* Header */}
            {/* Header - Apple Style Glassmorphism */}
            <header className="h-14 border-b border-white/5 bg-black/40 backdrop-blur-xl text-white flex items-center px-4 justify-between shrink-0 z-20 sticky top-0">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => navigate('/')} className="text-white hover:bg-white/10 rounded-full">
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <div className="flex flex-col overflow-hidden">
                        <h2 className="font-semibold text-sm md:text-base leading-tight truncate max-w-[150px] md:max-w-md text-slate-100">{activeJob.filename}</h2>
                        <div className="flex items-center gap-2 text-[10px] md:text-xs opacity-60">
                            <span className="inline">ID: {activeJob.id}</span>
                            <span className="hidden md:inline">•</span>
                            <span className="hidden md:inline text-emerald-400">{activeJob.status === 'processing' ? 'Processing...' : 'Ready for Review'}</span>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {/* <AnimatedThemeToggler />  -- Removed, focusing on Dark Mode only for premium feel */}
                    <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        AI Connected
                    </div>
                    <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => tour.start("workspace")}
                        className="flex gap-2 text-slate-400 hover:text-white"
                    >
                        <HelpCircle className="h-4 w-4" />
                        <span className="hidden md:inline">Guia</span>
                    </Button>
                    <Button size="sm" variant="outline" onClick={handleExport} className="hidden md:flex gap-2 bg-white/5 border-white/10 hover:bg-white/10 text-white hover:text-white backdrop-blur-sm">
                        <Download className="h-4 w-4" /> Exportar
                    </Button>
                    <Button
                        size="sm"
                        data-tour-step-id="action-verify"
                        onClick={() => setIsVerifyModalOpen(true)}
                        className="bg-emerald-500 hover:bg-emerald-600 text-white border-0 shadow-[0_0_15px_rgba(16,185,129,0.3)] hover:shadow-[0_0_20px_rgba(16,185,129,0.5)] transition-all"
                    >
                        Concluir
                    </Button>
                    <Button size="sm" variant="secondary" onClick={handleExport} className="flex md:hidden h-8 px-2 text-xs">Exportar</Button>
                </div>
            </header>

            <VerifyAuditModal open={isVerifyModalOpen} onOpenChange={setIsVerifyModalOpen} />


            {/* Mobile View: Tabs */}
            <div className="flex-1 lg:hidden flex flex-col overflow-hidden">
                <Tabs defaultValue="audit" className="flex-1 flex flex-col overflow-hidden">
                    <div className="px-4 py-2 border-b border-white/5 bg-black/20 flex justify-center shrink-0">
                        <TabsList className="grid w-full grid-cols-2 max-w-[400px]">
                            <TabsTrigger value="source" className="flex items-center gap-2" data-tour-step-id="mobile-tab-source">
                                <FileText className="h-4 w-4" /> Fonte
                            </TabsTrigger>
                            <TabsTrigger value="audit" className="flex items-center gap-2">
                                <CheckSquare className="h-4 w-4" /> Auditoria
                            </TabsTrigger>
                        </TabsList>
                    </div>
                    <TabsContent value="source" className="flex-1 overflow-hidden m-0 p-0 transform-none data-[state=inactive]:hidden h-full">
                        <PdfPane />
                    </TabsContent>
                    <TabsContent value="audit" className="flex-1 overflow-hidden m-0 p-0 transform-none data-[state=inactive]:hidden h-full">
                        <EditorPane />
                    </TabsContent>
                </Tabs>
            </div>

            {/* Desktop View: Split Screen */}
            <div className="flex-1 hidden lg:flex overflow-hidden">
                <div className="w-[45%] h-full">
                    <PdfPane />
                </div>
                <div className="w-[55%] h-full border-l border-border relative">
                    <EditorPane />
                </div>
            </div>

            {/* Collapsible Live Terminal */}
            <div className={`border-t border-gray-800 bg-black transition-all duration-300 ease-in-out flex flex-col absolute bottom-0 left-0 right-0 z-30 shadow-2xl ${isTerminalOpen ? 'h-48' : 'h-8'}`}>
                <div
                    className="h-8 px-4 bg-gray-900 border-b border-gray-800 flex items-center justify-between cursor-pointer hover:bg-gray-800 transition-colors"
                    onClick={() => setIsTerminalOpen(!isTerminalOpen)}
                >
                    <div className="flex items-center gap-4 text-white/50 uppercase tracking-wider font-semibold text-[10px] flex-1 overflow-hidden">
                        <div className="flex items-center gap-2 shrink-0">
                            <Terminal className="h-3 w-3" /> Revena AI Engine v2.4 Log Stream
                        </div>
                        {!isTerminalOpen && effectiveLogs.length > 0 && (
                            <div className="flex-1 truncate normal-case opacity-70 border-l border-white/10 pl-4">
                                <span className={effectiveLogs[effectiveLogs.length - 1].type === 'success' ? 'text-brand-accent' : effectiveLogs[effectiveLogs.length - 1].type === 'warning' ? 'text-yellow-400' : 'text-gray-300'}>
                                    {effectiveLogs[effectiveLogs.length - 1].type === 'success' ? '✓ ' : '> '}
                                    {effectiveLogs[effectiveLogs.length - 1].message}
                                </span>
                            </div>
                        )}
                    </div>
                    {isTerminalOpen ? <ChevronDown className="h-4 w-4 text-white/50 shrink-0" /> : <ChevronUp className="h-4 w-4 text-white/50 shrink-0" />}
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-1 font-mono text-xs">
                    {effectiveLogs.map((log, index) => (
                        <LogRow key={log.id} log={log} shouldAnimate={index >= initialLogCount} />
                    ))}
                    <div ref={bottomRef} />
                </div>
            </div>
        </div>
    );
}
