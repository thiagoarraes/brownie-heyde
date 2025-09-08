import { useState, ReactNode, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Sale } from '@/types/brownie';
import { useToast } from '@/hooks/use-toast';

interface EditSaleDialogProps {
  sale: Sale;
  customers: { name: string }[];
  onUpdateSale: (id: string, sale: Omit<Sale, 'id' | 'createdAt'>) => Promise<void>;
  children: ReactNode;
}

const EditSaleDialog = ({ sale, customers, onUpdateSale, children }: EditSaleDialogProps) => {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    date: sale.date,
    customerName: sale.customerName,
    quantity: sale.quantity.toString(),
    unitPrice: sale.unitPrice.toString(),
    paymentMethod: sale.paymentMethod,
    brownieType: sale.brownieType,
    notes: sale.notes || '',
  });

  const totalValue = formData.quantity && formData.unitPrice 
    ? Number(formData.quantity) * Number(formData.unitPrice) 
    : 0;

  useEffect(() => {
    if (open) {
      setFormData({
        date: sale.date,
        customerName: sale.customerName,
        quantity: sale.quantity.toString(),
        unitPrice: sale.unitPrice.toString(),
        paymentMethod: sale.paymentMethod,
        brownieType: sale.brownieType,
        notes: sale.notes || '',
      });
    }
  }, [open, sale]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.date || !formData.customerName || !formData.quantity || !formData.unitPrice) {
      toast({
        title: 'Erro no formulário',
        description: 'Preencha todos os campos obrigatórios.',
        variant: 'destructive',
      });
      return;
    }

    try {
      await onUpdateSale(sale.id, {
        date: formData.date,
        customerName: formData.customerName,
        quantity: Number(formData.quantity),
        unitPrice: Number(formData.unitPrice),
        totalValue,
        paymentMethod: formData.paymentMethod,
        brownieType: formData.brownieType,
        notes: formData.notes,
      });

      setOpen(false);
      toast({
        title: 'Venda atualizada!',
        description: 'Os dados foram atualizados com sucesso.',
      });
    } catch (error) {
      toast({
        title: 'Erro ao atualizar venda',
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

  const paymentMethods = [
    { value: 'pix', label: 'PIX' },
    { value: 'dinheiro', label: 'Dinheiro' },
    { value: 'cartao', label: 'Cartão' },
    { value: 'outros', label: 'Outros' },
  ];

  const brownieTypes = [
    { value: 'Doce de leite', label: 'Doce de leite' },
    { value: 'Ninho', label: 'Ninho' },
  ];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px] flex flex-col max-h-[90dvh] p-0">
        <DialogHeader className="p-6 pb-4">
          <DialogTitle>Editar Venda</DialogTitle>
        </DialogHeader>
        <form id="edit-sale-form" onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 space-y-4">
          <div>
            <Label htmlFor="edit-date">Data da Venda *</Label>
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
            <Label htmlFor="edit-customerName">Nome do Cliente *</Label>
            <Input
              id="edit-customerName"
              list="edit-customers"
              value={formData.customerName}
              onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
              className="mt-1"
              required
            />
            <datalist id="edit-customers">
              {customers.map((customer, index) => (
                <option key={index} value={customer.name} />
              ))}
            </datalist>
          </div>

          <div>
            <Label htmlFor="edit-quantity">Quantidade Vendida *</Label>
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
            <Label htmlFor="edit-unitPrice">Preço Unitário *</Label>
            <Input
              id="edit-unitPrice"
              type="number"
              step="0.01"
              min="0"
              value={formData.unitPrice}
              onChange={(e) => setFormData({ ...formData, unitPrice: e.target.value })}
              className="mt-1"
              required
            />
          </div>

          {totalValue > 0 && (
            <div className="p-3 bg-accent/10 border border-accent/20 rounded-lg">
              <p className="text-sm font-medium text-foreground">
                Valor Total: <span className="text-accent font-bold">{formatCurrency(totalValue)}</span>
              </p>
            </div>
          )}

          <div>
            <Label htmlFor="edit-brownieType">Tipo de Brownie *</Label>
            <Select 
              value={formData.brownieType} 
              onValueChange={(value: 'Doce de leite' | 'Ninho') => 
                setFormData({ ...formData, brownieType: value })
              }
            >
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-background border border-border z-50">
                {brownieTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="edit-paymentMethod">Forma de Pagamento</Label>
            <Select 
              value={formData.paymentMethod} 
              onValueChange={(value: 'dinheiro' | 'pix' | 'cartao' | 'outros') => 
                setFormData({ ...formData, paymentMethod: value })
              }
            >
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-background border border-border z-50">
                {paymentMethods.map((method) => (
                  <SelectItem key={method.value} value={method.value}>
                    {method.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
          <Button type="submit" form="edit-sale-form">
            Salvar Alterações
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditSaleDialog;
