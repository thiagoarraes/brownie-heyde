import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Mail, CheckCircle } from 'lucide-react';

const EmailConfirmationTool = () => {
  const [email, setEmail] = useState('heydebezerra@gmail.com');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleConfirmEmail = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('confirm-email', {
        body: { email }
      });

      if (error) {
        throw error;
      }

      toast({
        title: "Email confirmado!",
        description: data.message,
      });
    } catch (error: any) {
      toast({
        title: "Erro ao confirmar email",
        description: error.message || "Não foi possível confirmar o email.",
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
          <Mail className="mx-auto h-12 w-12 text-primary mb-2" />
          <h2 className="text-lg font-semibold">Confirmar Email</h2>
          <p className="text-sm text-muted-foreground">
            Use este script para confirmar emails não confirmados
          </p>
        </div>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="email">Email para Confirmar</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Digite o email"
            />
          </div>
        </div>
        
        <Button
          onClick={handleConfirmEmail}
          disabled={isLoading || !email}
          className="w-full"
        >
          {isLoading ? 'Confirmando...' : 'Confirmar Email'}
          <CheckCircle className="ml-2 h-4 w-4" />
        </Button>
        
        <div className="text-xs text-muted-foreground text-center">
          <p>Este script confirma o email automaticamente</p>
          <p>para permitir login sem verificação manual</p>
        </div>
      </div>
    </Card>
  );
};

export default EmailConfirmationTool;