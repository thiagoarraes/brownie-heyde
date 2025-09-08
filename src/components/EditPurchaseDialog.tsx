import { useState, ReactNode, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Purchase } from '@/types/brownie';
import { useToast } from '@/hooks/use-toast';

interface EditPurchaseDialogProps {
  purchase: Purchase;
  onUpdatePurchase: (id: string, purchase: Omit<Purchase, 'id' | 'createdAt'>) => Promise<void>;
  children: ReactNode;
}

const EditPurchaseDialog = ({ purchase, onUpdatePurchase, children }: EditPurchaseDialogProps) => {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    date: purchase.date,
    quantity: purchase.quantity.toString(),
    totalValue: purchase.totalValue.toString(),
    supplier: purchase.supplier,
    notes: purchase.notes || '',
  });

  useEffect(() => {
    if (open) {
      setFormData({
        date: purchase.date,
        quantity: purchase.quantity.toString(),
        totalValue: purchase.totalValue.toString(),
        supplier: purchase.supplier,
        notes: purchase.notes || '',
      });
    }
  }, [open, purchase]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.date || !formData.quantity || !formData.totalValue) {
      toast({
        title: 'Erro no formulário',
        description: 'Preencha todos os campos obrigatórios.',
        variant: 'destructive',
      });
      return;
    }

    try {
      await onUpdatePurchase(purchase.id, {
        date: formData.date,
        quantity: Number(formData.quantity),
        totalValue: Number(formData.totalValue),
        supplier: formData.supplier,
        notes: formData.notes,
      });

      setOpen(false);
      toast({
        title: 'Compra atualizada!',
        description: 'Os dados foram atualizados com sucesso.',
      });
    } catch (error) {
      toast({
        title: 'Erro ao atualizar compra',
        description: 'Tente novamente mais tarde.',
        variant: 'destructive',
      });
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px] flex flex-col max-h-[90dvh] p-0">
        <DialogHeader className="p-6 pb-4">
          <DialogTitle>Editar Compra</DialogTitle>
        </DialogHeader>
        <form id="edit-purchase-form" onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 space-y-4">
          <div>
            <Label htmlFor="edit-date">Data da Compra *</Label>
            <Input
              id="edit-date"
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="mt-1"
              required
            />
          </div>

          <div>
            <Label htmlFor="edit-quantity">Quantidade de Brownies *</Label>
            <Input
              id="edit-quantity"
              type="number"
              min="1"
              value={formData.quantity}
              onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
              className="mt-1"
              required
            />
          </div>

          <div>
            <Label htmlFor="edit-totalValue">Valor Total Pago *</Label>
            <Input
              id="edit-totalValue"
              type="number"
              step="0.01"
              min="0"
              value={formData.totalValue}
              onChange={(e) => setFormData({ ...formData, totalValue: e.target.value })}
              className="mt-1"
              required
            />
            {formData.quantity && formData.totalValue && (
              <p className="text-sm text-muted-foreground mt-1">
                Custo por brownie: {formatCurrency(Number(formData.totalValue) / Number(formData.quantity))}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="edit-supplier">Fornecedor/Local</Label>
            <Input
              id="edit-supplier"
              value={formData.supplier}
              onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="edit-notes">Observações</Label>
            <Textarea
              id="edit-notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="mt-1"
              rows={3}
            />
          </div>
        </form>
        <DialogFooter className="p-6 pt-4 border-t">
          <Button type="button" variant="outline" onClick={() => setOpen(false)}>
            Cancelar
          </Button>
          <Button type="submit" form="edit-purchase-form">
            Salvar Alterações
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditPurchaseDialog;
