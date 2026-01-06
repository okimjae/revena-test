import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from "@/components/theme-provider"
import { JobQueue } from "@/components/dashboard/JobQueue"
import { AuditWorkspace } from "@/components/workspace/AuditWorkspace"
import { Toaster } from "@/components/ui/sonner"
import { useEffect, useRef } from "react"
import { useAuditStore } from "@/store/auditStore"
import { TourProvider, type Tour } from "@/components/ui/tour"

function App() {
    const startSimulation = useAuditStore(state => state.startSimulation);
    const hasInitialized = useRef(false);
    const isDesktop = window.matchMedia("(min-width: 1024px)").matches;

    const tours: Tour[] = [
        {
            id: "dashboard",
            steps: [
                {
                    id: "welcome-dashboard",
                    title: "Bem-vindo à Revena",
                    content: "Este é o seu Painel de Controle. Aqui você tem uma visão completa de todas as auditorias em andamento.",
                    side: "bottom",
                },
                {
                    id: "monitor",
                    title: "Monitor em Tempo Real",
                    content: "O indicador 'Live Monitor' confirma que nossa IA está ativa e processando novos documentos automaticamente.",
                    side: "bottom",
                },
                {
                    id: "new-batch",
                    title: "Iniciar Nova Auditoria",
                    content: "Para começar, clique em '+ Novo Lote' e faça o upload das contas médicas (PDF). A IA iniciará a análise imediatamente.",
                    side: "bottom",
                },
                {
                    id: "stats",
                    title: "Métricas Chave",
                    content: "Acompanhe seus resultados: economia gerada, tempo poupado e volume de arquivos processados no mês.",
                    side: "top",
                },
                {
                    id: "jobs-table",
                    title: "Fila de Processamento",
                    content: "Acompanhe o status de cada arquivo aqui. Quando estiver 'Pronto', clique em 'Auditar' para revisar os detalhes.",
                    side: "top",
                },
            ],
        },
        {
            id: "workspace",
            steps: [
                ...(isDesktop ? [{
                    id: "pdf-viewer",
                    title: "Visualizador Inteligente",
                    content: "Viewer interativo. Clique em nomes de pacientes ou datas para verificar metadados em bancos externos.",
                    side: "right",
                }] : [{
                    id: "mobile-tab-source",
                    title: "Visualizar Documento",
                    content: "Toque aqui para acessar o documento original (PDF) e conferir os dados.",
                    side: "bottom",
                }]) as any,
                {
                    id: "combobox",
                    title: "Busca Assistida por IA",
                    content: "Use esta busca inteligente para encontrar itens. Agora com 'Sugeridos por IA' para auditoria mais rápida.",
                    side: "bottom",
                },
                {
                    id: "shortcuts",
                    title: "Atalhos de Teclado",
                    content: "Acelere seu fluxo. Use as setas para navegar e Enter/Delete para gerenciar itens.",
                    side: "left",
                },
                {
                    id: "action-verify",
                    title: "Finalizar Auditoria",
                    content: "Quando terminar, verifique a auditoria aqui. Isso aciona a verificação final de compliance.",
                    side: "bottom",
                    align: "end",
                },
            ],
        },
    ];

    useEffect(() => {
        if (!hasInitialized.current) {
            hasInitialized.current = true;

            // Kickstart the "Processing" job immediately so it looks active
            console.log("Initializing Mock Job 2 (Processing)...");
            startSimulation('2');

            // Kickstart the "Queued" job after a short delay so it feels like it just started
            setTimeout(() => {
                console.log("Initializing Mock Job 3 (Queued)...");
                startSimulation('3');
            }, 3500);
        }
    }, [startSimulation]);

    return (
        <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
            <TourProvider tours={tours}>
                <div className="min-h-screen bg-background font-sans text-foreground transition-colors duration-300 selection:bg-emerald-500/30">
                    <Router>
                        <Routes>
                            <Route path="/" element={<JobQueue />} />
                            <Route path="/workspace/:id" element={<AuditWorkspace />} />
                            {/* Catch all redirect to home */}
                            <Route path="*" element={<Navigate to="/" replace />} />
                        </Routes>
                    </Router>
                    <Toaster />
                </div>
            </TourProvider>
        </ThemeProvider>
    )
}

export default App;
