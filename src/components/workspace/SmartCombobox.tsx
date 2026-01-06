import { useState } from 'react';
import { Plus, Search, Box } from 'lucide-react';
import { toast } from 'sonner';
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { useAuditStore } from '@/store/auditStore';
import { AuditItem, Kit } from '@/types/audit';

// Mock DB
const REF_ITEMS: (Partial<AuditItem> & { type: 'item' })[] = [
    { id: 'ref-1', name: 'Dipyrone 500mg', category: 'Medicines', unitPrice: 5.00, type: 'item' },
    { id: 'ref-2', name: 'Paracetamol 750mg', category: 'Medicines', unitPrice: 3.50, type: 'item' },
    { id: 'ref-3', name: 'Surgical Gloves 7.5', category: 'Materials', unitPrice: 12.00, type: 'item' },
];

const REF_KITS: (Kit & { type: 'kit' })[] = [
    {
        id: 'kit-1',
        name: 'Laparoscopy Kit',
        type: 'kit',
        items: [
            { id: 'k1-1', name: 'Trocar 10mm', billingCode: 'TR10', quantity: 2 },
            { id: 'k1-2', name: 'Veress Needle', billingCode: 'VN01', quantity: 1 },
            { id: 'k1-3', name: 'Endobag', billingCode: 'EB01', quantity: 1 },
        ]
    },
    {
        id: 'kit-2',
        name: 'Appendectomy Basic',
        type: 'kit',
        items: [
            { id: 'k2-1', name: 'Scalpel #11', billingCode: 'SC11', quantity: 1 },
            { id: 'k2-2', name: 'Suture 2-0', billingCode: 'SU20', quantity: 3 }
        ]
    }
];

export function SmartCombobox() {
    const [open, setOpen] = useState(false);
    const [selectedKit, setSelectedKit] = useState<Kit | null>(null);
    const [kitDialogOpen, setKitDialogOpen] = useState(false);

    const addAuditItems = useAuditStore(state => state.addAuditItems);
    const addLog = useAuditStore(state => state.addLog);

    const handleSelect = (value: string) => {
        // Find in items or kits
        // value from command is usually lowercase
        const itemMatch = REF_ITEMS.find(i => i.name?.toLowerCase() === value.toLowerCase());
        const kitMatch = REF_KITS.find(k => k.name.toLowerCase() === value.toLowerCase());

        if (kitMatch) {
            setSelectedKit(kitMatch);
            setKitDialogOpen(true);
            setOpen(false);
        } else if (itemMatch) {
            // Add single item
            const newItem: AuditItem = {
                id: Math.random().toString(36).substr(2, 9),
                name: itemMatch.name!,
                category: itemMatch.category as any,
                quantity: 1,
                unitPrice: itemMatch.unitPrice,
                totalPrice: itemMatch.unitPrice,
                foundInDoc: false,
                confidence: 1,
                selected: false
            };
            addAuditItems([newItem]);
            addLog(`Manually added item: ${newItem.name}`, 'success');
            setOpen(false);
        }
    };

    const confirmKitAddition = (itemsToInclude: Kit['items']) => {
        const newItems = itemsToInclude.map(kItem => ({
            id: Math.random().toString(36).substr(2, 9),
            name: kItem.name,
            category: 'Materials' as const, // Default for kit items
            quantity: kItem.quantity,
            unitPrice: Math.floor(Math.random() * 50) + 10, // Mock price between 10 and 60
            totalPrice: (Math.floor(Math.random() * 50) + 10) * kItem.quantity,
            foundInDoc: false,
            confidence: 1,
            selected: false
        }));

        addAuditItems(newItems);
        addLog(`Added Kit: ${selectedKit?.name} with ${newItems.length} items`, 'success');
        toast.success(`Broadened Kit: ${selectedKit?.name} added`, {
            description: `${newItems.length} items added to audit list.`
        });
        setKitDialogOpen(false);
        setSelectedKit(null);
    };

    return (
        <>
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={open}
                        className="w-full justify-between text-left font-normal"
                    >
                        <span className="flex items-center">
                            <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                            Adicionar Item ou Kit...
                        </span>

                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[400px] p-0" align="start">
                    <Command>
                        <CommandInput placeholder="Buscar por nome comercial, princípio ativo ou código..." />
                        <CommandList>
                            <CommandEmpty>Nenhum resultado encontrado.</CommandEmpty>

                            <CommandGroup heading="Sugeridos por IA">
                                {REF_ITEMS.slice(0, 1).map((item) => (
                                    <CommandItem
                                        key={`suggested-${item.id}`}
                                        value={item.name!}
                                        onSelect={handleSelect}
                                        className="cursor-pointer"
                                    >
                                        <div className="mr-2 h-4 w-4 flex items-center justify-center">
                                            <span className="relative flex h-2 w-2">
                                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                                            </span>
                                        </div>
                                        {item.name}
                                        <span className="ml-2 text-xs text-emerald-500 font-medium">98% Match</span>
                                    </CommandItem>
                                ))}
                            </CommandGroup>

                            <CommandGroup heading="Kits & Pacotes">
                                {REF_KITS.map((kit) => (
                                    <CommandItem
                                        key={kit.id}
                                        value={kit.name}
                                        onSelect={handleSelect}
                                        className="cursor-pointer"
                                    >
                                        <Box className="mr-2 h-4 w-4 text-brand-accent" />
                                        {kit.name}
                                        <span className="ml-auto text-xs text-muted-foreground">{kit.items.length} itens</span>
                                    </CommandItem>
                                ))}
                            </CommandGroup>

                            <CommandGroup heading="Itens Individuais">
                                {REF_ITEMS.map((item) => (
                                    <CommandItem
                                        key={item.id}
                                        value={item.name!}
                                        onSelect={handleSelect}
                                        className="cursor-pointer"
                                    >
                                        <Plus className="mr-2 h-4 w-4" />
                                        {item.name}
                                    </CommandItem>
                                ))}
                            </CommandGroup>
                        </CommandList>
                    </Command>
                </PopoverContent>
            </Popover>

            <KitSelectionDialog
                open={kitDialogOpen}
                onOpenChange={setKitDialogOpen}
                kit={selectedKit}
                onConfirm={confirmKitAddition}
            />
        </>
    );
}

function KitSelectionDialog({
    open,
    onOpenChange,
    kit,
    onConfirm
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    kit: Kit | null;
    onConfirm: (items: Kit['items']) => void;
}) {
    // In a real app we'd track selection state here
    if (!kit) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Adicionar {kit.name}?</DialogTitle>
                    <DialogDescription>
                        Os seguintes itens serão adicionados à sua lista de auditoria.
                    </DialogDescription>
                </DialogHeader>
                <div className="py-4 space-y-2 max-h-[300px] overflow-y-auto">
                    {kit.items.map(item => (
                        <div key={item.id} className="flex items-center justify-between border p-2 rounded-md">
                            <span className="font-medium">{item.name}</span>
                            <span className="text-sm text-muted-foreground">Qtd: {item.quantity}</span>
                        </div>
                    ))}
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
                    <Button onClick={() => onConfirm(kit.items)}>Adicionar Todos</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
