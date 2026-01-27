import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Trash2, Users, Calendar, Mail, Phone, CreditCard, Loader2, Clock } from "lucide-react";
import { toast } from "sonner";

export default function AdminUsers() {
  const [deleteId, setDeleteId] = useState<number | null>(null);
  
  const { data: purchases, isLoading, refetch } = trpc.admin.getAllPurchases.useQuery();
  const deleteMutation = trpc.admin.deletePurchase.useMutation({
    onSuccess: () => {
      toast.success("Usuário deletado com sucesso!");
      refetch();
      setDeleteId(null);
    },
    onError: (error) => {
      toast.error(`Erro ao deletar: ${error.message}`);
      setDeleteId(null);
    },
  });

  const formatDate = (date: Date | string | null) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const formatPrice = (cents: number) => {
    return (cents / 100).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  };

  const getPlanName = (planType: string) => {
    const plans: Record<string, string> = {
      "2_months": "2 Meses",
      "3_months": "3 Meses",
      "6_months": "6 Meses",
      "1_year": "1 Ano",
    };
    return plans[planType] || planType;
  };

  const getPlanDuration = (planType: string): number => {
    const durations: Record<string, number> = {
      "2_months": 60,
      "3_months": 90,
      "6_months": 180,
      "1_year": 365,
    };
    return durations[planType] || 30;
  };

  const calculateDaysRemaining = (expiresAt: Date | string | null, planType: string) => {
    if (!expiresAt) return { daysRemaining: 0, totalDays: 0, percentage: 0 };
    
    const now = new Date();
    const expiryDate = new Date(expiresAt);
    const totalDays = getPlanDuration(planType);
    const daysRemaining = Math.max(0, Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
    const percentage = Math.round((daysRemaining / totalDays) * 100);
    
    return { daysRemaining, totalDays, percentage };
  };

  const getProgressColor = (percentage: number) => {
    if (percentage > 50) return "bg-emerald-500";
    if (percentage > 20) return "bg-yellow-500";
    return "bg-red-500";
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; label: string }> = {
      completed: { variant: "default", label: "Ativo" },
      pending: { variant: "secondary", label: "Pendente" },
      failed: { variant: "destructive", label: "Falhou" },
      refunded: { variant: "outline", label: "Reembolsado" },
      expired: { variant: "destructive", label: "Expirado" },
    };
    const config = variants[status] || { variant: "outline" as const, label: status };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Gestão de Usuários
              </CardTitle>
              <CardDescription>
                Visualize todos os compradores e gerencie suas assinaturas
              </CardDescription>
            </div>
            <Badge variant="secondary" className="text-lg">
              {purchases?.length || 0} usuários
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {!purchases || purchases.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhum usuário cadastrado ainda</p>
            </div>
          ) : (
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Telefone</TableHead>
                    <TableHead>Campeonato</TableHead>
                    <TableHead>Plano</TableHead>
                    <TableHead>Valor Pago</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Data Compra</TableHead>
                    <TableHead>Tempo Restante</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {purchases.map((purchase) => (
                    <TableRow key={purchase.id}>
                      <TableCell className="font-medium">{purchase.customerName}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{purchase.customerEmail}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {purchase.customerPhone ? (
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">{purchase.customerPhone}</span>
                          </div>
                        ) : (
                          "-"
                        )}
                      </TableCell>
                      <TableCell>
                        <a
                          href={`/${purchase.campaignSlug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline"
                        >
                          {purchase.campaignName}
                        </a>
                      </TableCell>
                      <TableCell>{getPlanName(purchase.planType)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <CreditCard className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{formatPrice(purchase.amountPaid)}</span>
                        </div>
                        {purchase.couponCode && (
                          <Badge variant="outline" className="mt-1 text-xs">
                            Cupom: {purchase.couponCode}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>{getStatusBadge(purchase.status as string)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{formatDate(purchase.createdAt)}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {(() => {
                          const { daysRemaining, totalDays, percentage } = calculateDaysRemaining(
                            purchase.expiresAt,
                            purchase.planType
                          );
                          const progressColor = getProgressColor(percentage);
                          
                          return (
                            <div className="space-y-2 min-w-[180px]">
                              <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm font-medium">
                                  {daysRemaining} dias restantes / {totalDays} dias
                                </span>
                              </div>
                              <div className="w-full">
                                <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                                  <div
                                    className={`h-full ${progressColor} transition-all duration-300`}
                                    style={{ width: `${percentage}%` }}
                                  />
                                </div>
                                <span className="text-xs text-muted-foreground mt-1 block">
                                  {percentage}% restante
                                </span>
                              </div>
                              {daysRemaining <= 7 && daysRemaining > 0 && (
                                <Badge variant="destructive" className="text-xs">
                                  Expira em breve!
                                </Badge>
                              )}
                              {daysRemaining === 0 && (
                                <Badge variant="destructive" className="text-xs">
                                  Expirado
                                </Badge>
                              )}
                            </div>
                          );
                        })()}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeleteId(purchase.id)}
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={deleteId !== null} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja deletar este usuário? Esta ação não pode ser desfeita e o
              campeonato associado também será removido.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteId && deleteMutation.mutate({ id: deleteId })}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deletando...
                </>
              ) : (
                "Deletar"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
