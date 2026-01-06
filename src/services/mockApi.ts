import { AuditItem, AuditJob } from "@/types/audit";

// Mock database of results
const SYSTEM_ITEMS: AuditItem[] = [
    { id: 'auto-1', name: 'Colecistectomia Videolaparoscópica', category: 'Procedures', quantity: 1, unitPrice: 1500.00, totalPrice: 1500.00, foundInDoc: true, confidence: 0.98, selected: false },
    { id: 'auto-2', name: 'Anestesia Geral', category: 'Procedures', quantity: 1, unitPrice: 450.00, totalPrice: 450.00, foundInDoc: true, confidence: 0.95, selected: false },
    { id: 'auto-3', name: 'Dipirona 500mg', category: 'Medicines', quantity: 1, unitPrice: 5.00, totalPrice: 5.00, foundInDoc: true, confidence: 0.99, selected: false },
    { id: 'auto-4', name: 'Trocar 10mm', category: 'Materials', quantity: 1, unitPrice: 120.00, totalPrice: 120.00, foundInDoc: true, confidence: 0.92, selected: false },
    { id: 'auto-5', name: 'Fio de Sutura Nylon 3-0', category: 'Materials', quantity: 2, unitPrice: 15.00, totalPrice: 30.00, foundInDoc: false, confidence: 0.00, selected: false }, // "Missed" item simulation
];

export const mockApi = {
    analyzeDocument: async (job: AuditJob): Promise<AuditItem[]> => {
        // Simulate network latency (2-4 seconds)
        const delay = Math.floor(Math.random() * 2000) + 2000;

        return new Promise((resolve) => {
            setTimeout(() => {
                if (job.customPdfData) {
                    // Generate dynamic results based on custom data
                    const customItems: AuditItem[] = [
                        {
                            id: `custom-${Math.random()}`,
                            name: job.customPdfData.procedure,
                            category: 'Procedures',
                            quantity: 1,
                            unitPrice: 2000.00,
                            totalPrice: 2000.00,
                            foundInDoc: true,
                            confidence: 0.98,
                            selected: false
                        },
                        {
                            id: `custom-${Math.random()}`,
                            name: 'Anestesia Geral',
                            category: 'Procedures',
                            quantity: 1,
                            unitPrice: 500.00,
                            totalPrice: 500.00,
                            foundInDoc: true,
                            confidence: 0.96,
                            selected: false
                        }
                    ];
                    resolve(customItems);
                } else {
                    resolve(SYSTEM_ITEMS);
                }
            }, delay);
        });
    }
};
