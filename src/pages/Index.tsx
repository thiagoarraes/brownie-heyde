import { useState } from 'react';
import { useBrownieData } from '@/hooks/useBrownieData';
import MobileNavigation from '@/components/MobileNavigation';
import Dashboard from '@/components/Dashboard';
import PurchaseForm from '@/components/PurchaseForm';
import SaleForm from '@/components/SaleForm';
import CustomerList from '@/components/CustomerList';
import Reports from '@/components/Reports';

const Index = () => {
  const [activeTab, setActiveTab] = useState('home');
  const { purchases, sales, customers, addPurchase, addSale, updatePurchase, updateSale, getFinancialSummary } = useBrownieData();
  
  const summary = getFinancialSummary();

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return <Dashboard summary={summary} customerCount={customers.length} />;
      case 'purchases':
        return <PurchaseForm onAddPurchase={addPurchase} onUpdatePurchase={updatePurchase} purchases={purchases} />;
      case 'sales':
        return <SaleForm onAddSale={addSale} onUpdateSale={updateSale} sales={sales} customers={customers} />;
      case 'customers':
        return <CustomerList customers={customers} sales={sales} />;
      case 'reports':
        return <Reports purchases={purchases} sales={sales} summary={summary} />;
      default:
        return <Dashboard summary={summary} customerCount={customers.length} />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {renderContent()}
      <MobileNavigation activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
};

export default Index;
