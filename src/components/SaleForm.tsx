import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { TrendingUp, MoreVertical, Edit } from 'lucide-react';
import { Sale } from '@/types/brownie';
import { useToast } from '@/hooks/use-toast';
import { formatDateBR, getTodayInputFormat, ensureDateFormat } from '@/lib/dateUtils';
import EditSaleDialog from '@/components/EditSaleDialog';
import DeleteSaleDialog from '@/components/DeleteSaleDialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

interface SaleFormProps {
  onAddSale: (sale: Omit<Sale, 'id' | 'createdAt'>) => Promise<void>;
  onUpdateSale: (id: string, sale: Omit<Sale, 'id' | 'createdAt'>) => Promise<void>;
  onDeleteSale: (id: string) => Promise<void>;
  sales: Sale[];
  customers: { name: string }[];
}

const SaleForm = ({ onAddSale, onUpdateSale, onDeleteSale, sales, customers }: SaleFormProps) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    date: getTodayInputFormat(),
    customerName: '',
    quantity: '',
    unitPrice: '',
    paymentMethod: 'pix' as 'dinheiro' | 'pix' | 'cartao' | 'outros',
    brownieType: 'Doce de leite' as 'Doce de leite' | 'Ninho',
    notes: '',
  });

  const totalValue = formData.quantity && formData.unitPrice 
    ? Number(formData.quantity) * Number(formData.unitPrice) 
    : 0;

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
      await onAddSale({
        date: ensureDateFormat(formData.date),
        customerName: formData.customerName,
        quantity: Number(formData.quantity),
        unitPrice: Number(formData.unitPrice),
        totalValue,
        paymentMethod: formData.paymentMethod,
        brownieType: formData.brownieType,
        notes: formData.notes,
      });

      setFormData({
        date: getTodayInputFormat(),
        customerName: '',
        quantity: '',
        unitPrice: '',
        paymentMethod: 'pix',
        brownieType: 'Doce de leite',
        notes: '',
      });

      toast({
        title: 'Venda registrada!',
        description: `${formData.quantity} brownies para ${formData.customerName}`,
      });
    } catch (error) {
      toast({
        title: 'Erro ao registrar venda',
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
    <div className="p-4 pb-20 space-y-6">
      <div className="text-center mb-6">
        <TrendingUp className="mx-auto mb-2 text-accent" size={32} />
        <h1 className="text-2xl font-bold text-foreground">Nova Venda</h1>
        <p className="text-muted-foreground">Registre suas vendas de brownies</p>
      </div>

      <Card className="p-6 border border-border">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="date">Data da Venda *</Label>
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
            <Label htmlFor="customerName">Nome do Cliente *</Label>
            <Input
              id="customerName"
              list="customers"
              value={formData.customerName}
              onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
              className="mt-1"
              placeholder="Ex: Maria Silva"
              required
            />
            <datalist id="customers">
              {customers.map((customer, index) => (
                <option key={index} value={customer.name} />
              ))}
            </datalist>
          </div>

          <div>
            <Label htmlFor="quantity">Quantidade Vendida *</Label>
            <Input
              id="quantity"
              type="number"
              min="1"
              value={formData.quantity}
              onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
              className="mt-1"
              placeholder="Ex: 5"
              required
            />
          </div>

          <div>
            <Label htmlFor="unitPrice">Preço Unitário *</Label>
            <Input
              id="unitPrice"
              type="number"
              step="0.01"
              min="0"
              value={formData.unitPrice}
              onChange={(e) => setFormData({ ...formData, unitPrice: e.target.value })}
              className="mt-1"
              placeholder="Ex: 8.00"
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
            <Label htmlFor="brownieType">Tipo de Brownie *</Label>
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
            <Label htmlFor="paymentMethod">Forma de Pagamento</Label>
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
            <Label htmlFor="notes">Observações</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="mt-1"
              placeholder="Detalhes adicionais sobre a venda..."
              rows={3}
            />
          </div>

          <Button type="submit" className="w-full bg-accent hover:bg-accent/90">
            Registrar Venda
          </Button>
        </form>
      </Card>

      {/* Recent Sales */}
      {sales.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-foreground">Vendas Recentes</h2>
          {sales.slice(0, 5).map((sale) => (
            <Card key={sale.id} className="p-4 border border-border">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <p className="font-medium text-foreground">{sale.customerName}</p>
                  <p className="text-sm text-muted-foreground">
                    {sale.quantity} {sale.brownieType} • {formatDateBR(sale.date)}
                  </p>
                  <p className="text-xs text-muted-foreground capitalize">
                    {sale.paymentMethod}
                  </p>
                </div>
                <div className="text-right flex items-center">
                  <div>
                    <p className="font-bold text-accent">
                      {formatCurrency(sale.totalValue)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatCurrency(sale.unitPrice)}/un
                    </p>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 ml-2 flex-shrink-0">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <EditSaleDialog
                        sale={sale}
                        customers={customers}
                        onUpdateSale={onUpdateSale}
                      >
                        <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                          <Edit className="mr-2 h-4 w-4" />
                          <span>Editar</span>
                        </DropdownMenuItem>
                      </EditSaleDialog>
                      <DeleteSaleDialog 
                        saleId={sale.id} 
                        onDeleteSale={onDeleteSale} 
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

export default SaleForm;
