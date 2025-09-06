export interface Purchase {
  id: string;
  date: string;
  quantity: number;
  totalValue: number;
  supplier: string;
  notes?: string;
  createdAt: string;
}

export interface Sale {
  id: string;
  date: string;
  customerName: string;
  quantity: number;
  unitPrice: number;
  totalValue: number;
  paymentMethod: 'dinheiro' | 'pix' | 'cartao' | 'outros';
  notes?: string;
  createdAt: string;
}

export interface Customer {
  id: string;
  name: string;
  totalSpent: number;
  totalPurchases: number;
  lastPurchaseDate?: string;
  createdAt: string;
}

export interface FinancialSummary {
  totalInvestment: number;
  totalRevenue: number;
  netProfit: number;
  profitMargin: number;
  totalBrowniesSold: number;
  totalBrowniesStock: number;
  averageCostPerBrownie: number;
  averageSellingPrice: number;
}