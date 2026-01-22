import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { DollarSign, Trophy, Users, Calendar, ExternalLink } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function AdminDashboard() {
  const { data: stats, isLoading: statsLoading } = trpc.admin.getStats.useQuery();
  const { data: campaigns, isLoading: campaignsLoading } = trpc.admin.getAllCampaigns.useQuery();

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

            {campaigns?.map((campaign) => (
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
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>/{campaign.slug}</span>
                    <span>•</span>
                    <span>{campaign.organizerEmail}</span>
                    <span>•</span>
                    <span>Criado {formatDistanceToNow(new Date(campaign.createdAt), { addSuffix: true, locale: ptBR })}</span>
                  </div>
                </div>
                <Button variant="outline" size="sm" asChild>
                  <a href={`/${campaign.slug}`} target="_blank">
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Ver Campeonato
                  </a>
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
