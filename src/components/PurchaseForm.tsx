import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { ShoppingBag, MoreVertical, Edit } from 'lucide-react';
import { Purchase } from '@/types/brownie';
import { useToast } from '@/hooks/use-toast';
import { formatDateBR, getTodayInputFormat, ensureDateFormat } from '@/lib/dateUtils';
import EditPurchaseDialog from '@/components/EditPurchaseDialog';
import DeletePurchaseDialog from '@/components/DeletePurchaseDialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

interface PurchaseFormProps {
  onAddPurchase: (purchase: Omit<Purchase, 'id' | 'createdAt'>) => Promise<void>;
  onUpdatePurchase: (id: string, purchase: Omit<Purchase, 'id' | 'createdAt'>) => Promise<void>;
  onDeletePurchase: (id: string) => Promise<void>;
  purchases: Purchase[];
}

const PurchaseForm = ({ onAddPurchase, onUpdatePurchase, onDeletePurchase, purchases }: PurchaseFormProps) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    date: getTodayInputFormat(),
    quantity: '',
    totalValue: '',
    supplier: '',
    notes: '',
  });

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
      await onAddPurchase({
        date: ensureDateFormat(formData.date),
        quantity: Number(formData.quantity),
        totalValue: Number(formData.totalValue),
        supplier: formData.supplier,
        notes: formData.notes,
      });

      setFormData({
        date: getTodayInputFormat(),
        quantity: '',
        totalValue: '',
        supplier: '',
        notes: '',
      });

      toast({
        title: 'Compra registrada!',
        description: `${formData.quantity} brownies por ${Number(formData.totalValue).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`,
      });
    } catch (error) {
      toast({
        title: 'Erro ao registrar compra',
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
    <div className="p-4 pb-20 space-y-6">
      <div className="text-center mb-6">
        <ShoppingBag className="mx-auto mb-2 text-primary" size={32} />
        <h1 className="text-2xl font-bold text-foreground">Nova Compra</h1>
        <p className="text-muted-foreground">Registre seus investimentos em brownies</p>
      </div>

      <Card className="p-6 border border-border">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="date">Data da Compra *</Label>
            <Input
              id="date"
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="mt-1"
              required
            />
          </div>

          <div>
            <Label htmlFor="quantity">Quantidade de Brownies *</Label>
            <Input
              id="quantity"
              type="number"
              min="1"
              value={formData.quantity}
              onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
              className="mt-1"
              placeholder="Ex: 50"
              required
            />
          </div>

          <div>
            <Label htmlFor="totalValue">Valor Total Pago *</Label>
            <Input
              id="totalValue"
              type="number"
              step="0.01"
              min="0"
              value={formData.totalValue}
              onChange={(e) => setFormData({ ...formData, totalValue: e.target.value })}
              className="mt-1"
              placeholder="Ex: 150.00"
              required
            />
            {formData.quantity && formData.totalValue && (
              <p className="text-sm text-muted-foreground mt-1">
                Custo por brownie: {formatCurrency(Number(formData.totalValue) / Number(formData.quantity))}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="supplier">Fornecedor/Local</Label>
            <Input
              id="supplier"
              value={formData.supplier}
              onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
              className="mt-1"
              placeholder="Ex: Confeitaria do João"
            />
          </div>

          <div>
            <Label htmlFor="notes">Observações</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="mt-1"
              placeholder="Detalhes adicionais sobre a compra..."
              rows={3}
            />
          </div>

          <Button type="submit" className="w-full bg-primary hover:bg-primary/90">
            Registrar Compra
          </Button>
        </form>
      </Card>

      {/* Recent Purchases */}
      {purchases.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-foreground">Compras Recentes</h2>
          {purchases.slice(0, 5).map((purchase) => (
            <Card key={purchase.id} className="p-4 border border-border">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <p className="font-medium text-foreground">
                    {purchase.quantity} brownies
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {formatDateBR(purchase.date)}
                  </p>
                  {purchase.supplier && (
                    <p className="text-sm text-muted-foreground">{purchase.supplier}</p>
                  )}
                </div>
                <div className="text-right flex items-center">
                  <div>
                    <p className="font-bold text-foreground">
                      {formatCurrency(purchase.totalValue)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatCurrency(purchase.totalValue / purchase.quantity)}/un
                    </p>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 ml-2 flex-shrink-0">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <EditPurchaseDialog 
                        purchase={purchase} 
                        onUpdatePurchase={onUpdatePurchase}
                      >
                        <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                          <Edit className="mr-2 h-4 w-4" />
                          <span>Editar</span>
                        </DropdownMenuItem>
                      </EditPurchaseDialog>
                      <DeletePurchaseDialog 
                        purchaseId={purchase.id} 
                        onDeletePurchase={onDeletePurchase} 
                      />
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default PurchaseForm;
