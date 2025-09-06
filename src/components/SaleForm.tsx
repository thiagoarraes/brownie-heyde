import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { TrendingUp } from 'lucide-react';
import { Sale } from '@/types/brownie';
import { useToast } from '@/hooks/use-toast';

interface SaleFormProps {
  onAddSale: (sale: Omit<Sale, 'id' | 'createdAt'>) => void;
  sales: Sale[];
  customers: { name: string }[];
}

const SaleForm = ({ onAddSale, sales, customers }: SaleFormProps) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    customerName: '',
    quantity: '',
    unitPrice: '',
    paymentMethod: 'pix' as 'dinheiro' | 'pix' | 'cartao' | 'outros',
    notes: '',
  });

  const totalValue = formData.quantity && formData.unitPrice 
    ? Number(formData.quantity) * Number(formData.unitPrice) 
    : 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.date || !formData.customerName || !formData.quantity || !formData.unitPrice) {
      toast({
        title: 'Erro no formulário',
        description: 'Preencha todos os campos obrigatórios.',
        variant: 'destructive',
      });
      return;
    }

    onAddSale({
      date: formData.date,
      customerName: formData.customerName,
      quantity: Number(formData.quantity),
      unitPrice: Number(formData.unitPrice),
      totalValue,
      paymentMethod: formData.paymentMethod,
      notes: formData.notes,
    });

    setFormData({
      date: new Date().toISOString().split('T')[0],
      customerName: '',
      quantity: '',
      unitPrice: '',
      paymentMethod: 'pix',
      notes: '',
    });

    toast({
      title: 'Venda registrada!',
      description: `${formData.quantity} brownies para ${formData.customerName}`,
    });
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
              <SelectContent>
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
                <div>
                  <p className="font-medium text-foreground">{sale.customerName}</p>
                  <p className="text-sm text-muted-foreground">
                    {sale.quantity} brownies • {new Date(sale.date).toLocaleDateString('pt-BR')}
                  </p>
                  <p className="text-xs text-muted-foreground capitalize">
                    {sale.paymentMethod}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-accent">
                    {formatCurrency(sale.totalValue)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatCurrency(sale.unitPrice)}/un
                  </p>
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