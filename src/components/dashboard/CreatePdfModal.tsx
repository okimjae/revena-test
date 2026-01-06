import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuditStore } from '@/store/auditStore';
import { toast } from 'sonner';

interface CreatePdfModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function CreatePdfModal({ open, onOpenChange }: CreatePdfModalProps) {
    const addJob = useAuditStore(state => state.addJob);
    const [patientName, setPatientName] = useState('');
    const [procedure, setProcedure] = useState('');
    const [description, setDescription] = useState('');

    const handleSubmit = () => {
        if (!patientName || !procedure || !description) {
            toast.error("Por favor, preencha todos os campos.");
            return;
        }

        const filename = `Custom_Test_${patientName.replace(/\s+/g, '_')}.pdf`;

        addJob(filename, {
            patientName,
            procedure,
            description
        });

        toast.success("PDF de Teste Criado", {
            description: `${filename} foi adicionado à fila.`
        });

        // Reset and close
        setPatientName('');
        setProcedure('');
        setDescription('');
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Criar PDF de Teste</DialogTitle>
                    <DialogDescription>
                        Crie um documento personalizado para testar a extração da IA.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="name" className="text-right">
                            Paciente
                        </Label>
                        <Input
                            id="name"
                            value={patientName}
                            onChange={(e) => setPatientName(e.target.value)}
                            className="col-span-3"
                            placeholder="Ex: Maria Silva"
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="procedure" className="text-right">
                            Procedimento
                        </Label>
                        <Input
                            id="procedure"
                            value={procedure}
                            onChange={(e) => setProcedure(e.target.value)}
                            className="col-span-3"
                            placeholder="Ex: Apendicectomia"
                        />
                    </div>
                    <div className="grid grid-cols-4 items-start gap-4">
                        <Label htmlFor="description" className="text-right pt-2">
                            Descrição
                        </Label>
                        <Textarea
                            id="description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="col-span-3 h-32"
                            placeholder="Cole aqui o texto do relatório médico..."
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
                    <Button onClick={handleSubmit}>Criar PDF</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
