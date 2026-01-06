import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckSquare, ArrowRight } from "lucide-react";
import { useAuditStore } from "@/store/auditStore";
import { useMemo } from "react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

interface VerifyAuditModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function VerifyAuditModal({ open, onOpenChange }: VerifyAuditModalProps) {
    const navigate = useNavigate();
    const auditItems = useAuditStore(state => state.auditItems);

    const totalValue = useMemo(() => {
        return auditItems.reduce((acc, item) => acc + (item.totalPrice || 0), 0);
    }, [auditItems]);

    const handleConfirm = () => {
        // Mock finishing logic
        toast.success("Auditoria Finalizada com Sucesso", {
            description: `Relatório fechado em R$ ${totalValue.toFixed(2)} e enviado sistema.`
        });
        onOpenChange(false);
        navigate('/');
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-xl">
                        <CheckSquare className="h-5 w-5 text-emerald-500" />
                        Finalizar Auditoria?
                    </DialogTitle>
                    <DialogDescription>
                        Revise os totais antes de enviar para o faturamento.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                    <div className="p-4 rounded-xl bg-muted/40 border border-border space-y-3">
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-muted-foreground">Materiais</span>
                            <span className="font-mono">
                                R$ {auditItems.filter(i => i.category === 'Materials' || i.category === 'OPME').reduce((acc, i) => acc + (i.totalPrice || 0), 0).toFixed(2)}
                            </span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-muted-foreground">Medicamentos</span>
                            <span className="font-mono">
                                R$ {auditItems.filter(i => i.category === 'Medicines').reduce((acc, i) => acc + (i.totalPrice || 0), 0).toFixed(2)}
                            </span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-muted-foreground">Procedimentos</span>
                            <span className="font-mono">
                                R$ {auditItems.filter(i => i.category === 'Procedures').reduce((acc, i) => acc + (i.totalPrice || 0), 0).toFixed(2)}
                            </span>
                        </div>

                        <div className="w-full h-px bg-border my-2" />

                        <div className="flex justify-between items-center">
                            <span className="font-medium">Total Geral</span>
                            <span className="font-mono text-lg font-bold text-emerald-500">
                                R$ {totalValue.toFixed(2)}
                            </span>
                        </div>
                    </div>

                    <div className="text-xs text-muted-foreground text-center">
                        Ao confirmar, o faturamento será processado automaticamente.
                    </div>
                </div>

                <DialogFooter className="gap-2 sm:gap-0">
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Voltar e Revisar
                    </Button>
                    <Button
                        onClick={handleConfirm}
                        className="bg-emerald-500 hover:bg-emerald-600 text-white font-medium"
                    >
                        Confirmar Envio <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
