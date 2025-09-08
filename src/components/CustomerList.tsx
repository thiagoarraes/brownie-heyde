import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Users, Search } from 'lucide-react';
import { Customer, Sale } from '@/types/brownie';
import { formatDateBR } from '@/lib/dateUtils';

interface CustomerListProps {
  customers: Customer[];
  sales: Sale[];
}

const CustomerList = ({ customers, sales }: CustomerListProps) => {
  const [searchTerm, setSearchTerm] = useState('');

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const getCustomerSales = (customerName: string) => {
    return sales.filter(sale => 
      sale.customerName.toLowerCase() === customerName.toLowerCase()
    );
  };

  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedCustomers = filteredCustomers.sort((a, b) => b.totalSpent - a.totalSpent);

  return (
    <div className="p-4 pb-20 space-y-6">
      <div className="text-center mb-6">
        <Users className="mx-auto mb-2 text-primary" size={32} />
        <h1 className="text-2xl font-bold text-foreground">Clientes</h1>
        <p className="text-muted-foreground">Gerencie seu relacionamento com clientes</p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={20} />
        <Input
          placeholder="Buscar cliente..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Statistics Cards */}
      {customers.length > 0 && (
        <div className="grid grid-cols-2 gap-4 mb-6">
          <Card className="p-4 border border-border text-center">
            <p className="text-2xl font-bold text-foreground">{customers.length}</p>
            <p className="text-sm text-muted-foreground">Total de Clientes</p>
          </Card>
          <Card className="p-4 border border-border text-center">
            <p className="text-2xl font-bold text-accent">
              {formatCurrency(customers.reduce((sum, c) => sum + c.totalSpent, 0))}
            </p>
            <p className="text-sm text-muted-foreground">Receita Total</p>
          </Card>
        </div>
      )}

      {/* Customer List */}
      <div className="space-y-4">
        {sortedCustomers.length === 0 ? (
          <Card className="p-8 text-center border border-border">
            <Users className="mx-auto mb-4 text-muted-foreground" size={48} />
            <h3 className="text-lg font-medium text-foreground mb-2">
              {searchTerm ? 'Nenhum cliente encontrado' : 'Nenhum cliente cadastrado'}
            </h3>
            <p className="text-muted-foreground">
              {searchTerm 
                ? 'Tente buscar com outro termo.' 
                : 'Faça sua primeira venda para adicionar clientes automaticamente.'
              }
            </p>
          </Card>
        ) : (
          sortedCustomers.map((customer) => {
            const customerSales = getCustomerSales(customer.name);
            const lastSale = customerSales[0]; // Assuming sales are sorted by date desc
            
            return (
              <Card key={customer.id} className="p-4 border border-border">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-semibold text-foreground">{customer.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      Cliente desde {formatDateBR(customer.createdAt)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-accent">{formatCurrency(customer.totalSpent)}</p>
                    <p className="text-sm text-muted-foreground">gasto total</p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 pt-3 border-t border-border">
                  <div className="text-center">
                    <p className="text-lg font-semibold text-foreground">{customer.totalPurchases}</p>
                    <p className="text-xs text-muted-foreground">Compras</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-semibold text-foreground">
                      {customerSales.reduce((sum, sale) => sum + sale.quantity, 0)}
                    </p>
                    <p className="text-xs text-muted-foreground">Brownies</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-semibold text-foreground">
                      {formatCurrency(customer.totalSpent / customer.totalPurchases)}
                    </p>
                    <p className="text-xs text-muted-foreground">Ticket Médio</p>
                  </div>
                </div>

                {customer.lastPurchaseDate && (
                  <div className="mt-3 pt-3 border-t border-border">
                    <p className="text-sm text-muted-foreground">
                      Última compra: {formatDateBR(customer.lastPurchaseDate)}
                    </p>
                  </div>
                )}
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
};

export default CustomerList;