import { useState, useCallback } from 'react';
import { useAuditStore } from '@/store/auditStore';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { UploadCloud, FileText, X, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface BatchUploadModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function BatchUploadModal({ open, onOpenChange }: BatchUploadModalProps) {
    const addJob = useAuditStore(state => state.addJob);
    const [isDragging, setIsDragging] = useState(false);
    const [file, setFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            setFile(e.dataTransfer.files[0]);
        }
    }, []);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setFile(e.target.files[0]);
        }
    };

    const handleUpload = async () => {
        if (!file) return;

        setUploading(true);

        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 2000));

        addJob(file.name);
        toast.success(`Lote "${file.name}" enviado com sucesso`);

        setUploading(false);
        setFile(null);
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Enviar Lote de Auditoria</DialogTitle>
                    <DialogDescription>
                        Arraste e solte seus prontuários médicos (PDF, XML) para iniciar a auditoria com IA.
                    </DialogDescription>
                </DialogHeader>

                {!file ? (
                    <div
                        className={`
                            border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center transition-colors cursor-pointer
                            ${isDragging ? 'border-brand-accent bg-brand-accent/5' : 'border-border hover:border-brand-accent/50 hover:bg-muted/50'}
                        `}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        onClick={() => document.getElementById('file-upload')?.click()}
                    >
                        <input
                            id="file-upload"
                            type="file"
                            className="hidden"
                            onChange={handleFileSelect}
                            accept=".pdf,.xml,.json"
                        />
                        <div className="bg-muted p-4 rounded-full mb-4">
                            <UploadCloud className="h-6 w-6 text-foreground" />
                        </div>
                        <h3 className="font-semibold text-lg mb-1">Clique para enviar ou arraste e solte</h3>
                        <p className="text-sm text-muted-foreground">PDF, XML ou JSON (máx. 10MB)</p>
                    </div>
                ) : (
                    <div className="border rounded-xl p-4 flex items-center justify-between bg-muted/30 border-border">
                        <div className="flex items-center gap-3">
                            <div className="bg-brand-accent/20 p-2 rounded-lg">
                                <FileText className="h-5 w-5 text-emerald-500" />
                            </div>
                            <div className="text-left">
                                <p className="font-medium text-sm truncate max-w-[200px]">{file.name}</p>
                                <p className="text-xs text-muted-foreground">{(file.size / 1024).toFixed(1)} KB</p>
                            </div>
                        </div>
                        {!uploading && (
                            <Button variant="ghost" size="icon" onClick={() => setFile(null)} className="h-8 w-8 text-muted-foreground hover:text-destructive">
                                <X className="h-4 w-4" />
                            </Button>
                        )}
                    </div>
                )}

                <DialogFooter className="sm:justify-between flex gap-2 sm:gap-0">
                    <Button variant="outline" onClick={() => onOpenChange(false)} disabled={uploading}>
                        Cancelar
                    </Button>
                    <Button onClick={handleUpload} disabled={!file || uploading} className="min-w-[100px]">
                        {uploading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Enviando...
                            </>
                        ) : (
                            'Iniciar Auditoria'
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
