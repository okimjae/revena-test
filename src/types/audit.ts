export type AuditStatus = 'queued' | 'processing' | 'ready' | 'failed';

export interface AuditJob {
    id: string;
    filename: string;
    uploadDate: string;
    status: AuditStatus;
    progressStep?: string; // e.g. "Step 3/5: Extracting Procedures..."
    itemCount?: number;
    customPdfData?: {
        patientName: string;
        procedure: string;
        description: string;
    };
    logs: LogEntry[];
    results?: AuditItem[];
}

export interface KitItem {
    id: string;
    name: string;
    activeIngredient?: string;
    billingCode: string;
    quantity: number;
}

export interface Kit {
    id: string;
    name: string;
    items: KitItem[];
}

export interface AuditItem {
    id: string;
    name: string;
    foundInDoc: boolean;
    pageNumber?: number;
    confidence: number;
    selected: boolean;
    quantity: number;
    unitPrice?: number;
    totalPrice?: number;
    category: 'Materials' | 'Medicines' | 'Procedures' | 'OPME';
}

export interface LogEntry {
    id: string;
    timestamp: string;
    message: string;
    type: 'info' | 'success' | 'warning' | 'error';
}
