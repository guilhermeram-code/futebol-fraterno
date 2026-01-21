import { useState } from "react";
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
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AlertTriangle, Trash2 } from "lucide-react";

interface ConfirmDeleteDialogProps {
  /** Texto que aparece no botão de trigger (se não usar children) */
  triggerText?: string;
  /** Título do diálogo */
  title: string;
  /** Descrição do que será deletado */
  description: string;
  /** Se true, exige digitar "DELETAR" para confirmar */
  requireTyping?: boolean;
  /** Callback quando confirmar a exclusão */
  onConfirm: () => void;
  /** Se está processando a exclusão */
  isDeleting?: boolean;
  /** Variante do botão de trigger */
  variant?: "ghost" | "destructive" | "outline" | "default";
  /** Tamanho do botão de trigger */
  size?: "default" | "sm" | "lg" | "icon";
  /** Classe CSS adicional para o botão de trigger */
  className?: string;
  /** Children customizado para o trigger */
  children?: React.ReactNode;
}

export function ConfirmDeleteDialog({
  triggerText,
  title,
  description,
  requireTyping = false,
  onConfirm,
  isDeleting = false,
  variant = "ghost",
  size = "icon",
  className,
  children,
}: ConfirmDeleteDialogProps) {
  const [open, setOpen] = useState(false);
  const [confirmText, setConfirmText] = useState("");

  const canConfirm = requireTyping ? confirmText === "DELETAR" : true;

  const handleConfirm = () => {
    if (canConfirm) {
      onConfirm();
      setOpen(false);
      setConfirmText("");
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      setConfirmText("");
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogTrigger asChild>
        {children || (
          <Button variant={variant} size={size} className={className}>
            {size === "icon" ? (
              <Trash2 className="h-4 w-4 text-destructive" />
            ) : (
              <>
                <Trash2 className="h-4 w-4 mr-2" />
                {triggerText || "Excluir"}
              </>
            )}
          </Button>
        )}
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            {title}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-left">
            {description}
            {requireTyping && (
              <div className="mt-4 p-3 bg-destructive/10 rounded-lg border border-destructive/20">
                <p className="text-sm font-medium text-destructive mb-2">
                  Esta ação é IRREVERSÍVEL!
                </p>
                <p className="text-sm text-muted-foreground mb-3">
                  Digite <span className="font-bold text-destructive">DELETAR</span> para confirmar:
                </p>
                <Input
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value)}
                  placeholder="Digite DELETAR"
                  className="border-destructive/50 focus:border-destructive"
                />
              </div>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={!canConfirm || isDeleting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isDeleting ? "Excluindo..." : "Confirmar Exclusão"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
