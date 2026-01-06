import { create } from 'zustand';
import { AuditItem, AuditJob, LogEntry } from '../types/audit';
import { mockApi } from '@/services/mockApi';

interface AuditState {
    // Job Queue
    jobs: AuditJob[];
    addJob: (filename: string, customData?: AuditJob['customPdfData']) => void;
    startSimulation: (id: string) => void;
    updateJobStatus: (id: string, status: AuditJob['status'], step?: string) => void;

    // Workspace
    activeJobId: string | null;
    setActiveJob: (id: string) => void;

    // Split Screen Items
    auditItems: AuditItem[];
    addAuditItem: (item: AuditItem) => void;
    addAuditItems: (items: AuditItem[]) => void; // For batches/kits
    removeAuditItem: (id: string) => void;
    toggleItemSelection: (id: string) => void;

    // Terminal
    logs: LogEntry[];
    addLog: (message: string, type?: LogEntry['type']) => void;
}

// Mock Data
const MOCK_JOBS: AuditJob[] = [
    {
        id: '1',
        filename: 'Patient_John_Doe_Surgery.pdf',
        uploadDate: '2023-10-25 10:30',
        status: 'ready',
        itemCount: 42,
        logs: [
            { id: '1', timestamp: '10:30:15', message: 'Agente IA: Inicializando contexto...', type: 'info' },
            { id: '2', timestamp: '10:30:18', message: 'Agente IA: Analisando estrutura do documento...', type: 'info' },
            { id: '3', timestamp: '10:30:22', message: 'Agente IA: Extraindo entidades médicas...', type: 'info' },
            { id: '4', timestamp: '10:30:25', message: 'Agente IA: Validando regras de faturamento...', type: 'info' },
            { id: '5', timestamp: '10:30:28', message: 'Verificação concluída. 42 itens encontrados.', type: 'success' }
        ]
    },
    {
        id: '2',
        filename: 'Maria_Silva_Appendectomy.pdf',
        uploadDate: '2023-10-25 11:15',
        status: 'processing',
        progressStep: 'Step 3/5: Extracting Procedures...',
        logs: [
            { id: '1', timestamp: '11:15:05', message: 'Agente IA: Inicializando contexto...', type: 'info' },
            { id: '2', timestamp: '11:15:09', message: 'Agente IA: Analisando estrutura do documento...', type: 'info' },
            { id: '3', timestamp: '11:15:15', message: 'Agente IA: Extraindo entidades médicas...', type: 'info' }
        ]
    },
    { id: '3', filename: 'Emergency_Room_Report_992.pdf', uploadDate: '2023-10-25 11:45', status: 'queued', logs: [] },
];

export const useAuditStore = create<AuditState>((set, get) => ({
    jobs: MOCK_JOBS,

    addJob: (filename, customData) => {
        const newJob: AuditJob = {
            id: Math.random().toString(36).substr(2, 9),
            filename,
            uploadDate: new Date().toLocaleString(),
            status: 'queued',
            customPdfData: customData,
            logs: []
        };

        set((state) => ({ jobs: [...state.jobs, newJob] }));

        // Auto-start simulation in "background"
        setTimeout(() => get().startSimulation(newJob.id), 500);
    },

    startSimulation: async (id) => {
        console.log('Starting simulation for job:', id);
        const updateJob = (updates: Partial<AuditJob>) => {
            console.log('Updating job:', id, updates);
            set((state) => ({
                jobs: state.jobs.map(j => j.id === id ? { ...j, ...updates } : j)
            }));
        };

        const addJobLog = (message: string, type: LogEntry['type'] = 'info') => {
            const entry: LogEntry = {
                id: Math.random().toString(36).substr(2, 9),
                timestamp: new Date().toLocaleTimeString(),
                message,
                type
            };

            set((state) => ({
                jobs: state.jobs.map(j => j.id === id ? { ...j, logs: [...(j.logs || []), entry] } : j)
            }));
        };

        updateJob({ status: 'processing', progressStep: 'Inicializando análise...' });
        addJobLog('Agente IA: Inicializando contexto...', 'info');

        await new Promise(r => setTimeout(r, 1500));
        addJobLog('Agente IA: Analisando estrutura do documento...', 'info');
        updateJob({ progressStep: 'Analisando estrutura...' });

        await new Promise(r => setTimeout(r, 2000));
        addJobLog('Agente IA: Extraindo entidades médicas...', 'info');
        updateJob({ progressStep: 'Extraindo entidades...' });

        await new Promise(r => setTimeout(r, 1500));
        addJobLog('Agente IA: Validando regras de faturamento...', 'info');
        updateJob({ progressStep: 'Validando regras...' });

        try {
            // Get current job data to pass to API
            const job = get().jobs.find(j => j.id === id);
            if (!job) return;

            const items = await mockApi.analyzeDocument(job);

            addJobLog(`Verificação concluída. ${items.length} itens encontrados.`, 'success');

            updateJob({
                status: 'ready',
                progressStep: 'Concluído',
                results: items,
                itemCount: items.length
            });

            // If this is the active job, update the workspace view immediately
            if (get().activeJobId === id) {
                set({ auditItems: items });
            }

        } catch (error) {
            addJobLog('Erro na análise.', 'error');
            updateJob({ status: 'failed', progressStep: 'Erro' });
        }
    },

    updateJobStatus: (id, status, step) => set((state) => ({
        jobs: state.jobs.map(j => j.id === id ? { ...j, status, progressStep: step } : j)
    })),

    activeJobId: null,
    setActiveJob: (id) => {
        const job = get().jobs.find(j => j.id === id);
        if (job) {
            // Restore state from job
            set({
                activeJobId: id,
                auditItems: job.results || []
                // Logs are read directly from job in the view now
            });
        }
    },

    auditItems: [],
    addAuditItem: (item) => set((state) => ({ auditItems: [...state.auditItems, item] })),
    addAuditItems: (items) => set((state) => ({ auditItems: [...state.auditItems, ...items] })),
    removeAuditItem: (id) => set((state) => ({ auditItems: state.auditItems.filter(i => i.id !== id) })),
    toggleItemSelection: (id) => set((state) => ({
        auditItems: state.auditItems.map(i => i.id === id ? { ...i, selected: !i.selected } : i)
    })),

    // Deprecated global logs (keeping for type safety for now, but unused)
    logs: [],
    addLog: (_message, _type = 'info') => { },
}));
