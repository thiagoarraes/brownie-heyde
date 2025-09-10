import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useBrownieData } from '@/hooks/useBrownieData';
import { UserPlus, ArrowRight } from 'lucide-react';

const AccountMigration = () => {
  const [newEmail, setNewEmail] = useState('heydebezerra@gmail.com');
  const [newPassword, setNewPassword] = useState('hs2t0103');
  const [isLoading, setIsLoading] = useState(false);
  const { signUp, signOut } = useAuth();
  const { migrateLegacyData } = useBrownieData();
  const { toast } = useToast();

  const handleCreateNewAccount = async () => {
    setIsLoading(true);
    try {
      // First, migrate current data to legacy (set user_id to null)
      // This will be handled by creating a new function
      
      // Sign out current user
      await signOut();
      
      // Create new account
      const { error } = await signUp(newEmail, newPassword);
      
      if (!error) {
        toast({
          title: "Nova conta criada!",
          description: "Verifique seu email para ativar a conta, depois faça login para migrar os dados.",
        });
      }
    } catch (error: any) {
      toast({
        title: "Erro ao criar conta",
        description: error.message || "Não foi possível criar a nova conta.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="p-6 max-w-md mx-auto">
      <div className="space-y-4">
        <div className="text-center">
          <UserPlus className="mx-auto h-12 w-12 text-primary mb-2" />
          <h2 className="text-lg font-semibold">Criar Nova Conta</h2>
          <p className="text-sm text-muted-foreground">
            Crie uma nova conta com o email desejado
          </p>
        </div>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="email">Novo Email</Label>
            <Input
              id="email"
              type="email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
            />
          </div>
          
          <div>
            <Label htmlFor="password">Nova Senha</Label>
            <Input
              id="password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </div>
        </div>
        
        <Button
          onClick={handleCreateNewAccount}
          disabled={isLoading || !newEmail || !newPassword}
          className="w-full"
        >
          {isLoading ? 'Criando...' : 'Criar Nova Conta'}
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
        
        <div className="text-xs text-muted-foreground text-center">
          <p>1. Crie a nova conta</p>
          <p>2. Verifique o email</p>
          <p>3. Faça login</p>
          <p>4. Importe os dados no dashboard</p>
        </div>
      </div>
    </Card>
  );
};

export default AccountMigration;