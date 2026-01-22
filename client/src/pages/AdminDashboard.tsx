import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
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
  Clock
} from "lucide-react";
import { formatDistanceToNow, differenceInDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useState } from "react";
import { toast } from "sonner";

export default function AdminDashboard() {
  const { data: stats, isLoading: statsLoading } = trpc.admin.getStats.useQuery();
  const { data: campaigns, isLoading: campaignsLoading } = trpc.admin.getAllCampaigns.useQuery();
  
  const [credentialsDialog, setCredentialsDialog] = useState<{
    open: boolean;
    campaign: any | null;
  }>({ open: false, campaign: null });
  
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    campaignId: number | null;
  }>({ open: false, campaignId: null });

  if (statsLoading || campaignsLoading) {
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

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(cents / 100);
  };

  const getDaysUntilExpiration = (expiresAt: Date | null) => {
    if (!expiresAt) return null;
    const days = differenceInDays(new Date(expiresAt), new Date());
    return days;
  };

  const handleShowCredentials = (campaign: any) => {
    setCredentialsDialog({ open: true, campaign });
  };

  const handleDeleteCampaign = (campaignId: number) => {
    setDeleteDialog({ open: true, campaignId });
  };

  const deleteCampaign = trpc.admin.deleteCampaign.useMutation({
    onSuccess: () => {
      toast.success("Campeonato excluído com sucesso!");
      trpc.useUtils().admin.getAllCampaigns.invalidate();
      trpc.useUtils().admin.getStats.invalidate();
      setDeleteDialog({ open: false, campaignId: null });
    },
    onError: (error: any) => {
      toast.error(`Erro ao excluir: ${error.message}`);
    },
  });

  const confirmDelete = () => {
    if (deleteDialog.campaignId) {
      deleteCampaign.mutate({ id: deleteDialog.campaignId });
    }
  };

  // Calcular estatísticas adicionais
  const revenueByMonth = campaigns?.reduce((acc: any, c) => {
    if (!c.createdAt) return acc;
    const month = new Date(c.createdAt).toLocaleDateString('pt-BR', { year: 'numeric', month: 'short' });
    acc[month] = (acc[month] || 0) + (c.amountPaid || 0);
    return acc;
  }, {});

  const revenueByPlan = campaigns?.reduce((acc: any, c) => {
    if (!c.planType) return acc;
    const planName = {
      '2_months': '2 meses',
      '3_months': '3 meses',
      '6_months': '6 meses',
      '1_year': '1 ano'
    }[c.planType] || 'Desconhecido';
    acc[planName] = (acc[planName] || 0) + (c.amountPaid || 0);
    return acc;
  }, {});

  return (
    <div className="container py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Painel Admin - PeladaPro</h1>
          <p className="text-muted-foreground">Visão geral de todos os campeonatos e faturamento</p>
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

      {/* Gráficos de Receita */}
      <div className="grid gap-4 md:grid-cols-2 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Receita por Mês
            </CardTitle>
            <CardDescription>Faturamento mensal acumulado</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {revenueByMonth && Object.entries(revenueByMonth).map(([month, revenue]: [string, any]) => (
                <div key={month} className="flex items-center justify-between">
                  <span className="text-sm font-medium">{month}</span>
                  <span className="text-sm text-muted-foreground">{formatCurrency(revenue)}</span>
                </div>
              ))}
              {(!revenueByMonth || Object.keys(revenueByMonth).length === 0) && (
                <p className="text-sm text-muted-foreground text-center py-4">Nenhuma venda ainda</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Receita por Plano
            </CardTitle>
            <CardDescription>Faturamento por tipo de assinatura</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {revenueByPlan && Object.entries(revenueByPlan).map(([plan, revenue]: [string, any]) => (
                <div key={plan} className="flex items-center justify-between">
                  <span className="text-sm font-medium">{plan}</span>
                  <span className="text-sm text-muted-foreground">{formatCurrency(revenue)}</span>
                </div>
              ))}
              {(!revenueByPlan || Object.keys(revenueByPlan).length === 0) && (
                <p className="text-sm text-muted-foreground text-center py-4">Nenhuma venda ainda</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Campeonatos */}
      <Card>
        <CardHeader>
          <CardTitle>Todos os Campeonatos</CardTitle>
          <CardDescription>Lista completa de campeonatos criados na plataforma</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {campaigns && campaigns.length === 0 && (
              <p className="text-center text-muted-foreground py-8">Nenhum campeonato criado ainda</p>
            )}

            {campaigns?.map((campaign) => {
              const daysUntilExpiration = getDaysUntilExpiration(campaign.expiresAt);
              
              return (
                <div
                  key={campaign.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold">{campaign.name}</h3>
                      {campaign.isActive ? (
                        <Badge variant="default" className="bg-green-500">
                          Ativo
                        </Badge>
                      ) : (
                        <Badge variant="secondary">Expirado</Badge>
                      )}
                      {campaign.isDemo && <Badge variant="outline">Demo</Badge>}
                      {daysUntilExpiration !== null && (
                        <Badge 
                          variant={daysUntilExpiration < 7 ? "destructive" : "outline"}
                          className="flex items-center gap-1"
                        >
                          <Clock className="h-3 w-3" />
                          {daysUntilExpiration > 0 
                            ? `${daysUntilExpiration} dias restantes`
                            : `Expirou há ${Math.abs(daysUntilExpiration)} dias`
                          }
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>/{campaign.slug}</span>
                      <span>•</span>
                      <span>{campaign.organizerEmail}</span>
                      <span>•</span>
                      <span>Criado {formatDistanceToNow(new Date(campaign.createdAt), { addSuffix: true, locale: ptBR })}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleShowCredentials(campaign)}
                    >
                      <Key className="mr-2 h-4 w-4" />
                      Credenciais
                    </Button>
                    <Button variant="outline" size="sm" asChild>
                      <a href={`/${campaign.slug}`} target="_blank">
                        <ExternalLink className="mr-2 h-4 w-4" />
                        Ver Campeonato
                      </a>
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleDeleteCampaign(campaign.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Dialog de Credenciais */}
      <Dialog open={credentialsDialog.open} onOpenChange={(open) => setCredentialsDialog({ open, campaign: null })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Credenciais do Organizador</DialogTitle>
            <DialogDescription>
              Informações de acesso para o campeonato {credentialsDialog.campaign?.name}
            </DialogDescription>
          </DialogHeader>
          {credentialsDialog.campaign && (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Nome</label>
                <p className="text-sm font-mono bg-muted p-2 rounded mt-1">
                  {credentialsDialog.campaign.organizerName || "Não informado"}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Email (Login)</label>
                <p className="text-sm font-mono bg-muted p-2 rounded mt-1">
                  {credentialsDialog.campaign.organizerEmail}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">WhatsApp</label>
                <p className="text-sm font-mono bg-muted p-2 rounded mt-1">
                  {credentialsDialog.campaign.organizerPhone || "Não informado"}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Senha</label>
                <p className="text-sm font-mono bg-muted p-2 rounded mt-1">
                  {credentialsDialog.campaign.plainPassword || "Não disponível (campeonato antigo)"}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">URL do Campeonato</label>
                <p className="text-sm font-mono bg-muted p-2 rounded mt-1">
                  https://peladapro.com.br/{credentialsDialog.campaign.slug}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">URL do Admin</label>
                <p className="text-sm font-mono bg-muted p-2 rounded mt-1">
                  https://peladapro.com.br/{credentialsDialog.campaign.slug}/admin
                </p>
              </div>

            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setCredentialsDialog({ open: false, campaign: null })}>
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de Confirmação de Exclusão */}
      <Dialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ open, campaignId: null })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Exclusão</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja deletar este campeonato? Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setDeleteDialog({ open: false, campaignId: null })}
            >
              Cancelar
            </Button>
            <Button 
              variant="destructive" 
              onClick={confirmDelete}
            >
              Deletar Campeonato
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
