import { useState } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { DropdownMenuItem } from "@/components/ui/dropdown-menu"
import { useToast } from "@/hooks/use-toast"
import { Trash2 } from "lucide-react"

interface DeletePurchaseDialogProps {
  purchaseId: string;
  onDeletePurchase: (id: string) => Promise<void>;
}

const DeletePurchaseDialog = ({ purchaseId, onDeletePurchase }: DeletePurchaseDialogProps) => {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);

  const handleDelete = async () => {
    try {
      await onDeletePurchase(purchaseId);
      toast({
        title: "Compra excluída!",
        description: "O registro da compra foi removido com sucesso.",
      });
      setOpen(false);
    } catch (error) {
      toast({
        title: "Erro ao excluir compra",
        description: "Tente novamente mais tarde.",
        variant: "destructive",
      });
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
          <Trash2 className="mr-2 h-4 w-4 text-destructive" />
          <span className="text-destructive">Excluir</span>
        </DropdownMenuItem>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
          <AlertDialogDescription>
            Essa ação não pode ser desfeita. Isso excluirá permanentemente o registro desta compra.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">
            Confirmar Exclusão
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeletePurchaseDialog;
