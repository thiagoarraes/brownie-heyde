import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useBrownieData } from '@/hooks/useBrownieData';
import MobileNavigation from '@/components/MobileNavigation';
import Dashboard from '@/components/Dashboard';
import PurchaseForm from '@/components/PurchaseForm';
import SaleForm from '@/components/SaleForm';
import CustomerList from '@/components/CustomerList';
import Reports from '@/components/Reports';
import { Loader2, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
const Index = () => {
  const [activeTab, setActiveTab] = useState('home');
  const navigate = useNavigate();
  const {
    user,
    loading,
    signOut
  } = useAuth();
  const {
    purchases,
    sales,
    customers,
    addPurchase,
    addSale,
    updatePurchase,
    updateSale,
    deletePurchase,
    deleteSale,
    getFinancialSummary
  } = useBrownieData();
  const summary = getFinancialSummary();
  useEffect(() => {
    console.log('Index: Auth state check:', { loading, user: user?.email });
    if (!loading && !user) {
      console.log('Index: No user found, redirecting to auth');
      navigate('/auth');
    }
  }, [user, loading, navigate]);
  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };
  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>;
  }
  
  if (!user) {
    return <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Redirecionando para login...</p>
        </div>
      </div>;
  }
  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return <Dashboard 
          summary={summary} 
          customerCount={customers.length}
        />;
      case 'purchases':
        return <PurchaseForm onAddPurchase={addPurchase} onUpdatePurchase={updatePurchase} onDeletePurchase={deletePurchase} purchases={purchases} />;
      case 'sales':
        return <SaleForm onAddSale={addSale} onUpdateSale={updateSale} onDeleteSale={deleteSale} sales={sales} customers={customers} />;
      case 'customers':
        return <CustomerList customers={customers} sales={sales} />;
      case 'reports':
        return <Reports purchases={purchases} sales={sales} summary={summary} />;
      default:
        return <Dashboard 
          summary={summary} 
          customerCount={customers.length}
        />;
    }
  };
  return <div className="min-h-screen bg-background">
      <div className="flex items-center justify-between p-4 border-b">
        <h1 className="text-xl font-bold">🧁 HeyBrownies</h1>
        <Button variant="outline" size="sm" onClick={handleSignOut}>
          <LogOut className="h-4 w-4 mr-2" />
          Sair
        </Button>
      </div>
      {renderContent()}
      <MobileNavigation activeTab={activeTab} onTabChange={setActiveTab} />
    </div>;
};
export default Index;