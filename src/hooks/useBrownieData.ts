import { useState, useEffect } from 'react';
import { Purchase, Sale, Customer, FinancialSummary } from '@/types/brownie';
import { supabase } from '@/integrations/supabase/client';

export const useBrownieData = () => {
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);

  // Load data from Supabase on mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Load purchases
      const { data: purchasesData, error: purchasesError } = await supabase
        .from('purchases')
        .select('*')
        .order('created_at', { ascending: false });

      if (purchasesError) {
        console.error('Error loading purchases:', purchasesError);
      } else {
        setPurchases(purchasesData?.map(p => ({
          id: p.id,
          date: p.date,
          quantity: p.quantity,
          totalValue: p.total_value,
          supplier: p.supplier,
          notes: p.notes,
          createdAt: p.created_at,
        })) || []);
      }

      // Load sales
      const { data: salesData, error: salesError } = await supabase
        .from('sales')
        .select('*')
        .order('created_at', { ascending: false });

      if (salesError) {
        console.error('Error loading sales:', salesError);
      } else {
        setSales(salesData?.map(s => ({
          id: s.id,
          date: s.date,
          customerName: s.customer_name,
          quantity: s.quantity,
          unitPrice: s.unit_price,
          totalValue: s.total_value,
          paymentMethod: s.payment_method as 'dinheiro' | 'pix' | 'cartao' | 'outros',
          notes: s.notes,
          createdAt: s.created_at,
        })) || []);
      }

      // Load customers
      const { data: customersData, error: customersError } = await supabase
        .from('customers')
        .select('*')
        .order('created_at', { ascending: false });

      if (customersError) {
        console.error('Error loading customers:', customersError);
      } else {
        setCustomers(customersData?.map(c => ({
          id: c.id,
          name: c.name,
          totalSpent: c.total_spent,
          totalPurchases: c.total_purchases,
          lastPurchaseDate: c.last_purchase_date,
          createdAt: c.created_at,
        })) || []);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const addPurchase = async (purchase: Omit<Purchase, 'id' | 'createdAt'>) => {
    try {
      const { data, error } = await supabase
        .from('purchases')
        .insert({
          date: purchase.date,
          quantity: purchase.quantity,
          total_value: purchase.totalValue,
          supplier: purchase.supplier,
          notes: purchase.notes,
        })
        .select()
        .single();

      if (error) {
        console.error('Error adding purchase:', error);
        throw error;
      }

      if (data) {
        const newPurchase: Purchase = {
          id: data.id,
          date: data.date,
          quantity: data.quantity,
          totalValue: data.total_value,
          supplier: data.supplier,
          notes: data.notes,
          createdAt: data.created_at,
        };
        setPurchases(prev => [newPurchase, ...prev]);
      }
    } catch (error) {
      console.error('Error adding purchase:', error);
      throw error;
    }
  };

  const addSale = async (sale: Omit<Sale, 'id' | 'createdAt'>) => {
    try {
      const { data, error } = await supabase
        .from('sales')
        .insert({
          date: sale.date,
          customer_name: sale.customerName,
          quantity: sale.quantity,
          unit_price: sale.unitPrice,
          total_value: sale.totalValue,
          payment_method: sale.paymentMethod,
          notes: sale.notes,
        })
        .select()
        .single();

      if (error) {
        console.error('Error adding sale:', error);
        throw error;
      }

      if (data) {
        const newSale: Sale = {
          id: data.id,
          date: data.date,
          customerName: data.customer_name,
          quantity: data.quantity,
          unitPrice: data.unit_price,
          totalValue: data.total_value,
          paymentMethod: data.payment_method as 'dinheiro' | 'pix' | 'cartao' | 'outros',
          notes: data.notes,
          createdAt: data.created_at,
        };
        setSales(prev => [newSale, ...prev]);
        
        // Reload customers to get updated stats (handled by database trigger)
        const { data: customersData } = await supabase
          .from('customers')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (customersData) {
          setCustomers(customersData.map(c => ({
            id: c.id,
            name: c.name,
            totalSpent: c.total_spent,
            totalPurchases: c.total_purchases,
            lastPurchaseDate: c.last_purchase_date,
            createdAt: c.created_at,
          })));
        }
      }
    } catch (error) {
      console.error('Error adding sale:', error);
      throw error;
    }
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