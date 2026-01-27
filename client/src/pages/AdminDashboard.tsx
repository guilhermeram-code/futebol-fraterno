import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  DollarSign, 
  Trophy, 
  Users, 
  Calendar, 
  ExternalLink, 
  Trash2, 
  Key, 
  TrendingUp,
  Clock,
  Mail,
  Loader2
} from "lucide-react";
import { formatDistanceToNow, differenceInDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";

export default function AdminDashboard() {
  const { user, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();

  // Redirecionar para login se não estiver autenticado
  useEffect(() => {
    if (!isAuthenticated) {
      setLocation("/login");
    }
  }, [isAuthenticated, setLocation]);

  const { data: stats, isLoading: statsLoading } = trpc.admin.getStats.useQuery();
  const { data: purchases, isLoading: purchasesLoading } = trpc.admin.getAllPurchases.useQuery();
  
  const [credentialsDialog, setCredentialsDialog] = useState<{
    open: boolean;
    purchase: any | null;
  }>({ open: false, purchase: null });
  
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    purchaseId: number | null;
  }>({ open: false, purchaseId: null });

  const utils = trpc.useUtils();
  
  const deletePurchase = trpc.admin.deletePurchase.useMutation({
    onSuccess: () => {
      setDeleteDialog({ open: false, purchaseId: null });
      toast.success("Campeonato excluído com sucesso!");
      setTimeout(() => {
        utils.admin.getAllPurchases.invalidate();
        utils.admin.getStats.invalidate();
      }, 0);
    },
    onError: (error: any) => {
      toast.error(`Erro ao excluir: ${error.message}`);
    },
  });

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(cents / 100);
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

  const handleShowCredentials = (purchase: any) => {
    setCredentialsDialog({ open: true, purchase });
  };

  const handleDeletePurchase = (purchaseId: number) => {
    setDeleteDialog({ open: true, purchaseId });
  };

  const confirmDelete = () => {
    if (deleteDialog.purchaseId) {
      deletePurchase.mutate({ id: deleteDialog.purchaseId });
    }
  };

  if (statsLoading || purchasesLoading) {
    return (
      <div className="container py-8">
        <h1 className="text-3xl font-bold mb-8">Painel Admin - PeladaPro</h1>
        <div className="grid gap-4 md:grid-cols-4 mb-8">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-4 rounded-full" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16 mb-2" />
                <Skeleton className="h-3 w-32" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Painel Admin - PeladaPro</h1>
          <p className="text-muted-foreground">Gestão completa de usuários e campeonatos</p>
        </div>
        <Button variant="outline" asChild>
          <a href="/" target="_blank">
            <ExternalLink className="mr-2 h-4 w-4" />
            Ver Site
          </a>
        </Button>
      </div>

      {/* Estatísticas */}
      <div className="grid gap-4 md:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Faturamento Total</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats?.totalRevenue || 0)}</div>
            <p className="text-xs text-muted-foreground">Todas as vendas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Campeonatos Ativos</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.activeCampaigns || 0}</div>
            <p className="text-xs text-muted-foreground">Assinaturas válidas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Campeonatos</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalCampaigns || 0}</div>
            <p className="text-xs text-muted-foreground">Todos os tempos</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Usuários</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalUsers || 0}</div>
            <p className="text-xs text-muted-foreground">Organizadores cadastrados</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabela Unificada: Usuários + Campeonatos */}
      <Card>
        <CardHeader>
          <CardTitle>Usuários e Campeonatos</CardTitle>
          <CardDescription>
            Lista completa de usuários e seus campeonatos com tempo restante
          </CardDescription>
        </CardHeader>
        <CardContent>
          {purchases && purchases.length === 0 && (
            <p className="text-center text-muted-foreground py-8">Nenhum campeonato criado ainda</p>
          )}

          {purchases && purchases.length > 0 && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Campeonato</TableHead>
                  <TableHead>Tempo Restante</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {purchases.map((purchase) => {
                  const { daysRemaining, totalDays, percentage } = calculateDaysRemaining(
                    purchase.expiresAt,
                    purchase.planType
                  );
                  const progressColor = getProgressColor(percentage);

                  return (
                    <TableRow key={purchase.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{purchase.customerEmail}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-semibold">{purchase.campaignName}</span>
                          <span className="text-xs text-muted-foreground">/{purchase.campaignSlug}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-2 min-w-[200px]">
                          <div className="flex items-center justify-between text-sm">
                            <span className="font-medium">
                              {daysRemaining} dias restantes / {totalDays} dias
                            </span>
                            <span className="text-muted-foreground">{percentage}%</span>
                          </div>
                          <div className="w-full bg-secondary rounded-full h-2">
                            <div
                              className={`h-2 rounded-full transition-all ${progressColor}`}
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                          {daysRemaining <= 7 && daysRemaining > 0 && (
                            <p className="text-xs text-yellow-600 dark:text-yellow-500 flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              Expira em breve!
                            </p>
                          )}
                          {daysRemaining === 0 && (
                            <p className="text-xs text-red-600 dark:text-red-500 font-medium">
                              Expirado
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {purchase.status === "completed" && daysRemaining > 0 ? (
                          <Badge variant="default" className="bg-green-500">Ativo</Badge>
                        ) : (
                          <Badge variant="secondary">Expirado</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleShowCredentials(purchase)}
                          >
                            <Key className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            asChild
                          >
                            <a href={`/${purchase.campaignSlug}`} target="_blank">
                              <ExternalLink className="h-4 w-4" />
                            </a>
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeletePurchase(purchase.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Dialog de Credenciais */}
      <Dialog open={credentialsDialog.open} onOpenChange={(open) => setCredentialsDialog({ open, purchase: null })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Credenciais de Acesso</DialogTitle>
            <DialogDescription>
              Informações de login para o campeonato {credentialsDialog.purchase?.campaignName}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">URL de Login</label>
              <div className="flex items-center gap-2 mt-1">
                <code className="flex-1 p-2 bg-muted rounded text-sm">
                  {`https://peladapro.com.br/${credentialsDialog.purchase?.campaignSlug}/admin/login`}
                </code>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    navigator.clipboard.writeText(
                      `https://peladapro.com.br/${credentialsDialog.purchase?.campaignSlug}/admin/login`
                    );
                    toast.success("URL copiada!");
                  }}
                >
                  Copiar
                </Button>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Email</label>
              <div className="flex items-center gap-2 mt-1">
                <code className="flex-1 p-2 bg-muted rounded text-sm">
                  {credentialsDialog.purchase?.customerEmail}
                </code>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    navigator.clipboard.writeText(credentialsDialog.purchase?.customerEmail || "");
                    toast.success("Email copiado!");
                  }}
                >
                  Copiar
                </Button>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Senha</label>
              <div className="flex items-center gap-2 mt-1">
                <code className="flex-1 p-2 bg-muted rounded text-sm">
                  {credentialsDialog.purchase?.tempPassword || "Senha não disponível"}
                </code>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    navigator.clipboard.writeText(credentialsDialog.purchase?.tempPassword || "");
                    toast.success("Senha copiada!");
                  }}
                >
                  Copiar
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog de Confirmação de Exclusão */}
      <AlertDialog open={deleteDialog.open} onOpenChange={(open) => !open && setDeleteDialog({ open: false, purchaseId: null })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este campeonato? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
