import { Card } from '@/components/ui/card';
import { BarChart3, TrendingUp, Package, Calendar } from 'lucide-react';
import { Purchase, Sale, FinancialSummary } from '@/types/brownie';

interface ReportsProps {
  purchases: Purchase[];
  sales: Sale[];
  summary: FinancialSummary;
}

const Reports = ({ purchases, sales, summary }: ReportsProps) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const getCurrentMonth = () => {
    const now = new Date();
    return {
      year: now.getFullYear(),
      month: now.getMonth(),
      startDate: new Date(now.getFullYear(), now.getMonth(), 1),
      endDate: new Date(now.getFullYear(), now.getMonth() + 1, 0),
    };
  };

  const getMonthlyData = () => {
    const currentMonth = getCurrentMonth();
    
    const monthlyPurchases = purchases.filter(p => {
      const purchaseDate = new Date(p.date);
      return purchaseDate >= currentMonth.startDate && purchaseDate <= currentMonth.endDate;
    });

    const monthlySales = sales.filter(s => {
      const saleDate = new Date(s.date);
      return saleDate >= currentMonth.startDate && saleDate <= currentMonth.endDate;
    });

    const monthlyInvestment = monthlyPurchases.reduce((sum, p) => sum + p.totalValue, 0);
    const monthlyRevenue = monthlySales.reduce((sum, s) => sum + s.totalValue, 0);
    const monthlyProfit = monthlyRevenue - monthlyInvestment;
    const monthlyBrowniesSold = monthlySales.reduce((sum, s) => sum + s.quantity, 0);

    return {
      investment: monthlyInvestment,
      revenue: monthlyRevenue,
      profit: monthlyProfit,
      browniesSold: monthlyBrowniesSold,
      salesCount: monthlySales.length,
      purchasesCount: monthlyPurchases.length,
    };
  };

  const getPaymentMethodStats = () => {
    const paymentMethods = sales.reduce((acc, sale) => {
      acc[sale.paymentMethod] = (acc[sale.paymentMethod] || 0) + sale.totalValue;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(paymentMethods).map(([method, total]) => ({
      method: method.charAt(0).toUpperCase() + method.slice(1),
      total,
      percentage: (total / summary.totalRevenue) * 100,
    }));
  };

  const getTopCustomers = () => {
    const customerTotals = sales.reduce((acc, sale) => {
      acc[sale.customerName] = (acc[sale.customerName] || 0) + sale.totalValue;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(customerTotals)
      .map(([name, total]) => ({ name, total }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 5);
  };

  const getBrownieTypeStats = () => {
    const brownieTypes = sales.reduce((acc, sale) => {
      acc[sale.brownieType] = (acc[sale.brownieType] || 0) + sale.quantity;
      return acc;
    }, {} as Record<string, number>);

    const totalBrownies = Object.values(brownieTypes).reduce((sum, count) => sum + count, 0);

    return Object.entries(brownieTypes).map(([type, quantity]) => ({
      type,
      quantity,
      percentage: totalBrownies > 0 ? (quantity / totalBrownies) * 100 : 0,
    }));
  };

  const monthlyData = getMonthlyData();
  const paymentStats = getPaymentMethodStats();
  const topCustomers = getTopCustomers();
  const brownieTypeStats = getBrownieTypeStats();

  const currentMonthName = new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });

  return (
    <div className="p-4 pb-20 space-y-6">
      <div className="text-center mb-6">
        <BarChart3 className="mx-auto mb-2 text-primary" size={32} />
        <h1 className="text-2xl font-bold text-foreground">Relatórios</h1>
        <p className="text-muted-foreground">Analise o desempenho do seu negócio</p>
      </div>

      {/* Monthly Performance */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-foreground flex items-center">
          <Calendar className="mr-2" size={20} />
          Desempenho - {currentMonthName}
        </h2>
        
        <div className="grid grid-cols-2 gap-4">
          <Card className="p-4 border border-border">
            <div className="text-center">
              <TrendingUp className="mx-auto mb-2 text-accent" size={24} />
              <p className="text-xl font-bold text-foreground">{formatCurrency(monthlyData.revenue)}</p>
              <p className="text-sm text-muted-foreground">Receita do Mês</p>
            </div>
          </Card>
          
          <Card className="p-4 border border-border">
            <div className="text-center">
              <Package className="mx-auto mb-2 text-primary" size={24} />
              <p className="text-xl font-bold text-foreground">{monthlyData.browniesSold}</p>
              <p className="text-sm text-muted-foreground">Brownies Vendidos</p>
            </div>
          </Card>
          
          <Card className="p-4 border border-border">
            <div className="text-center">
              <p className={`text-xl font-bold ${monthlyData.profit >= 0 ? 'text-success' : 'text-destructive'}`}>
                {formatCurrency(monthlyData.profit)}
              </p>
              <p className="text-sm text-muted-foreground">Lucro do Mês</p>
            </div>
          </Card>
          
          <Card className="p-4 border border-border">
            <div className="text-center">
              <p className="text-xl font-bold text-foreground">{monthlyData.salesCount}</p>
              <p className="text-sm text-muted-foreground">Vendas Realizadas</p>
            </div>
          </Card>
        </div>
      </div>

      {/* Overall Statistics */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-foreground">Estatísticas Gerais</h2>
        
        <div className="grid grid-cols-1 gap-4">
          <Card className="p-4 border border-border">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Custo Médio por Brownie</span>
              <span className="font-bold text-foreground">
                {formatCurrency(summary.averageCostPerBrownie)}
              </span>
            </div>
          </Card>
          
          <Card className="p-4 border border-border">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Preço Médio de Venda</span>
              <span className="font-bold text-foreground">
                {formatCurrency(summary.averageSellingPrice)}
              </span>
            </div>
          </Card>
          
          <Card className="p-4 border border-border">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Margem de Lucro Atual</span>
              <span className={`font-bold ${summary.profitMargin >= 0 ? 'text-success' : 'text-destructive'}`}>
                {summary.profitMargin.toFixed(1)}%
              </span>
            </div>
          </Card>
          
          <Card className="p-4 border border-border">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Estoque Atual</span>
              <span className={`font-bold ${summary.totalBrowniesStock > 0 ? 'text-foreground' : 'text-destructive'}`}>
                {summary.totalBrowniesStock} brownies
              </span>
            </div>
          </Card>
        </div>
      </div>

      {/* Payment Methods */}
      {paymentStats.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-foreground">Métodos de Pagamento</h2>
          
          <div className="space-y-3">
            {paymentStats.map((stat) => (
              <Card key={stat.method} className="p-4 border border-border">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-foreground">{stat.method}</span>
                  <div className="text-right">
                    <p className="font-bold text-foreground">{formatCurrency(stat.total)}</p>
                    <p className="text-sm text-muted-foreground">{stat.percentage.toFixed(1)}%</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Brownie Types */}
      {brownieTypeStats.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-foreground">Tipos de Brownie Mais Vendidos</h2>
          
          <div className="space-y-3">
            {brownieTypeStats.map((stat) => (
              <Card key={stat.type} className="p-4 border border-border">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-foreground">{stat.type}</span>
                  <div className="text-right">
                    <p className="font-bold text-foreground">{stat.quantity} brownies</p>
                    <p className="text-sm text-muted-foreground">{stat.percentage.toFixed(1)}%</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Top Customers */}
      {topCustomers.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-foreground">Melhores Clientes</h2>
          
          <div className="space-y-3">
            {topCustomers.map((customer, index) => (
              <Card key={customer.name} className="p-4 border border-border">
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <span className="text-lg font-bold text-accent mr-3">#{index + 1}</span>
                    <span className="font-medium text-foreground">{customer.name}</span>
                  </div>
                  <span className="font-bold text-foreground">{formatCurrency(customer.total)}</span>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Reports;