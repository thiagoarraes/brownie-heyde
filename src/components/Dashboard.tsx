import { Card } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Package, Users } from 'lucide-react';
import { FinancialSummary } from '@/types/brownie';
interface DashboardProps {
  summary: FinancialSummary;
  customerCount: number;
}
const Dashboard = ({
  summary,
  customerCount
}: DashboardProps) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };
  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };
  const stats = [{
    title: 'Receita Total',
    value: formatCurrency(summary.totalRevenue),
    icon: TrendingUp,
    color: 'text-success',
    bgColor: 'bg-success/10'
  }, {
    title: 'Investimento Total',
    value: formatCurrency(summary.totalInvestment),
    icon: TrendingDown,
    color: 'text-primary',
    bgColor: 'bg-primary/10'
  }, {
    title: 'Lucro Líquido',
    value: formatCurrency(summary.netProfit),
    icon: TrendingUp,
    color: summary.netProfit >= 0 ? 'text-success' : 'text-destructive',
    bgColor: summary.netProfit >= 0 ? 'bg-success/10' : 'bg-destructive/10'
  }, {
    title: 'Margem de Lucro',
    value: formatPercentage(summary.profitMargin),
    icon: TrendingUp,
    color: summary.profitMargin >= 0 ? 'text-success' : 'text-destructive',
    bgColor: summary.profitMargin >= 0 ? 'bg-success/10' : 'bg-destructive/10'
  }];
  const quickStats = [{
    title: 'Brownies Vendidos',
    value: summary.totalBrowniesSold,
    icon: Package
  }, {
    title: 'Estoque Restante',
    value: summary.totalBrowniesStock,
    icon: Package
  }, {
    title: 'Total de Clientes',
    value: customerCount,
    icon: Users
  }, {
    title: 'Preço Médio',
    value: formatCurrency(summary.averageSellingPrice),
    icon: TrendingUp
  }];
  return <div className="p-4 pb-20 space-y-6">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-foreground mb-2">Gerenciamento</h1>
        <p className="text-muted-foreground">Acompanhe seu negócio em tempo real</p>
      </div>

      {/* Financial Summary */}
      <div className="grid grid-cols-1 gap-4">
        {stats.map(stat => {
        const Icon = stat.icon;
        return <Card key={stat.title} className="p-4 border border-border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                  <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                  <Icon size={24} className={stat.color} />
                </div>
              </div>
            </Card>;
      })}
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-4">
        {quickStats.map(stat => {
        const Icon = stat.icon;
        return <Card key={stat.title} className="p-4 border border-border">
              <div className="flex flex-col items-center text-center">
                <Icon size={20} className="text-primary mb-2" />
                <p className="text-lg font-bold text-foreground">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.title}</p>
              </div>
            </Card>;
      })}
      </div>
    </div>;
};
export default Dashboard;