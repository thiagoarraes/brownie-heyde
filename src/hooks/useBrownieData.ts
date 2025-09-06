import { useState, useEffect } from 'react';
import { Purchase, Sale, Customer, FinancialSummary } from '@/types/brownie';

const STORAGE_KEYS = {
  purchases: 'brownie-purchases',
  sales: 'brownie-sales',
  customers: 'brownie-customers',
};

export const useBrownieData = () => {
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);

  // Load data from localStorage on mount
  useEffect(() => {
    const loadedPurchases = JSON.parse(localStorage.getItem(STORAGE_KEYS.purchases) || '[]');
    const loadedSales = JSON.parse(localStorage.getItem(STORAGE_KEYS.sales) || '[]');
    const loadedCustomers = JSON.parse(localStorage.getItem(STORAGE_KEYS.customers) || '[]');

    setPurchases(loadedPurchases);
    setSales(loadedSales);
    setCustomers(loadedCustomers);
  }, []);

  // Save to localStorage whenever data changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.purchases, JSON.stringify(purchases));
  }, [purchases]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.sales, JSON.stringify(sales));
  }, [sales]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.customers, JSON.stringify(customers));
  }, [customers]);

  const addPurchase = (purchase: Omit<Purchase, 'id' | 'createdAt'>) => {
    const newPurchase: Purchase = {
      ...purchase,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    setPurchases(prev => [newPurchase, ...prev]);
  };

  const addSale = (sale: Omit<Sale, 'id' | 'createdAt'>) => {
    const newSale: Sale = {
      ...sale,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    setSales(prev => [newSale, ...prev]);

    // Update or create customer
    setCustomers(prev => {
      const existingCustomer = prev.find(c => c.name.toLowerCase() === sale.customerName.toLowerCase());
      
      if (existingCustomer) {
        return prev.map(c => 
          c.id === existingCustomer.id 
            ? {
                ...c,
                totalSpent: c.totalSpent + sale.totalValue,
                totalPurchases: c.totalPurchases + 1,
                lastPurchaseDate: sale.date,
              }
            : c
        );
      } else {
        const newCustomer: Customer = {
          id: Date.now().toString() + '-customer',
          name: sale.customerName,
          totalSpent: sale.totalValue,
          totalPurchases: 1,
          lastPurchaseDate: sale.date,
          createdAt: new Date().toISOString(),
        };
        return [newCustomer, ...prev];
      }
    });
  };

  const getFinancialSummary = (): FinancialSummary => {
    const totalInvestment = purchases.reduce((sum, p) => sum + p.totalValue, 0);
    const totalRevenue = sales.reduce((sum, s) => sum + s.totalValue, 0);
    const netProfit = totalRevenue - totalInvestment;
    const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;
    
    const totalBrowniesPurchased = purchases.reduce((sum, p) => sum + p.quantity, 0);
    const totalBrowniesSold = sales.reduce((sum, s) => sum + s.quantity, 0);
    const totalBrowniesStock = Math.max(0, totalBrowniesPurchased - totalBrowniesSold);
    
    const averageCostPerBrownie = totalBrowniesPurchased > 0 ? totalInvestment / totalBrowniesPurchased : 0;
    const averageSellingPrice = totalBrowniesSold > 0 ? totalRevenue / totalBrowniesSold : 0;

    return {
      totalInvestment,
      totalRevenue,
      netProfit,
      profitMargin,
      totalBrowniesSold,
      totalBrowniesStock,
      averageCostPerBrownie,
      averageSellingPrice,
    };
  };

  return {
    purchases,
    sales,
    customers,
    addPurchase,
    addSale,
    getFinancialSummary,
  };
};