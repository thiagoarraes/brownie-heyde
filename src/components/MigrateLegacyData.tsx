import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Download, Check, AlertCircle } from 'lucide-react';

interface MigrateLegacyDataProps {
  onMigrate: () => Promise<any>;
}

const MigrateLegacyData = ({ onMigrate }: MigrateLegacyDataProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [migrated, setMigrated] = useState(false);
  const { toast } = useToast();

  const handleMigrate = async () => {
    setIsLoading(true);
    try {
      const result = await onMigrate();
      
      if (result?.success) {
        toast({
          title: "Dados migrados com sucesso!",
          description: `${result.purchases_migrated} compras, ${result.sales_migrated} vendas e ${result.customers_migrated} clientes foram transferidos para sua conta.`,
        });
        setMigrated(true);
      }
    } catch (error: any) {
      toast({
        title: "Erro na migração",
        description: "Não foi possível migrar os dados. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (migrated) {
    return (
      <Card className="p-4 bg-success/10 border-success/20">
        <div className="flex items-center gap-3">
          <Check className="text-success" size={20} />
          <div>
            <p className="font-medium text-success">Dados migrados</p>
            <p className="text-sm text-success/80">Todos os dados legacy foram transferidos para sua conta</p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-4 bg-warning/10 border-warning/20">
      <div className="flex items-center gap-3 mb-3">
        <AlertCircle className="text-warning" size={20} />
        <div>
          <p className="font-medium text-warning">Dados encontrados</p>
          <p className="text-sm text-warning/80">Encontramos dados de antes do login. Deseja importá-los?</p>
        </div>
      </div>
      <Button
        onClick={handleMigrate}
        disabled={isLoading}
        className="w-full"
        variant="outline"
      >
        <Download size={16} className="mr-2" />
        {isLoading ? 'Migrando...' : 'Importar dados anteriores'}
      </Button>
    </Card>
  );
};

export default MigrateLegacyData;