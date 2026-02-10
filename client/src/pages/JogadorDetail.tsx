import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Header } from "@/components/Header";
import { Link, useParams } from "wouter";
import { User, Target, AlertTriangle, Trophy, ArrowLeft, Shield } from "lucide-react";
import { useTournament } from "@/contexts/TournamentContext";
import { useCampaign } from "@/App";

export default function JogadorDetail() {
  const { slug } = useCampaign();
  const { campaignId } = useTournament();
  const params = useParams<{ id: string }>();
  const playerId = parseInt(params.id || "0");

  const { data: player, isLoading: loadingPlayer } = trpc.players.byId.useQuery({ id: playerId, campaignId });
  const { data: teams } = trpc.teams.list.useQuery({ campaignId });
  const { data: topScorers } = trpc.stats.topScorers.useQuery({ limit: 100, campaignId });
  const { data: topCarded } = trpc.stats.topCarded.useQuery({ limit: 100, campaignId });

  const team = teams?.find(t => t.id === player?.teamId);
  
  // Find player stats
  const scorerStats = topScorers?.find(s => s.playerId === playerId);
  const cardStats = topCarded?.find(c => c.playerId === playerId);
  
  // Find player ranking
  const scorerRank = topScorers?.findIndex(s => s.playerId === playerId);
  const cardRank = topCarded?.findIndex(c => c.playerId === playerId);

  if (loadingPlayer) {
    return (
      <div className="min-h-screen bg-background masonic-pattern">
        <Header />
        <main className="container py-8">
          <Skeleton className="h-64 w-full" />
        </main>
      </div>
    );
  }

  if (!player) {
    return (
      <div className="min-h-screen bg-background masonic-pattern">
        <Header />
        <main className="container py-8">
          <Card>
            <CardContent className="py-12 text-center">
              <User className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Jogador não encontrado</p>
              <Link href={`/${slug}/estatisticas`}>
                <span className="text-primary hover:underline mt-4 inline-block">
                  Voltar para Estatísticas
                </span>
              </Link>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background masonic-pattern">
      <Header />

      <main className="container py-8">
        {/* Back Button */}
        <Link href={`/${slug}/estatisticas`}>
          <span className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary mb-6 cursor-pointer">
            <ArrowLeft className="h-4 w-4" />
            Voltar para Estatísticas
          </span>
        </Link>

        {/* Player Header */}
        <Card className="mb-6">
          <CardContent className="py-8">
            <div className="flex flex-col md:flex-row items-center gap-6">
              {/* Player Avatar */}
              {player.photoUrl ? (
                <img 
                  src={player.photoUrl} 
                  alt={player.name}
                  className="h-24 w-24 rounded-full object-cover border-4 border-primary"
                />
              ) : (
                <div className="h-24 w-24 rounded-full bg-primary/10 flex items-center justify-center border-4 border-primary">
                  <User className="h-12 w-12 text-primary" />
                </div>
              )}
              
              {/* Player Info */}
              <div className="text-center md:text-left flex-1">
                <h1 className="text-3xl font-bold">{player.name}</h1>
                {player.number && (
                  <Badge variant="outline" className="mt-2 text-lg px-3 py-1">
                    #{player.number}
                  </Badge>
                )}
                {player.position && (
                  <p className="text-muted-foreground mt-1">{player.position}</p>
                )}
              </div>

              {/* Team Info */}
              {team && (
                <Link href={`/${slug}/times/${team.id}`}>
                  <div className="flex items-center gap-3 p-4 rounded-lg bg-muted hover:bg-muted/80 transition-colors cursor-pointer">
                    {team.logoUrl ? (
                      <img 
                        src={team.logoUrl} 
                        alt={team.name}
                        className="h-12 w-12 rounded-full object-cover border-2 border-primary"
                      />
                    ) : (
                      <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center border-2 border-primary">
                        <Shield className="h-6 w-6 text-primary" />
                      </div>
                    )}
                    <div>
                      <p className="font-bold">{team.name}</p>
                      {team.lodge && (
                        <p className="text-sm text-muted-foreground">{team.lodge}</p>
                      )}
                    </div>
                  </div>
                </Link>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Goals Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-gold-dark">
                <Target className="h-5 w-5" />
                Gols Marcados
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-5xl font-bold text-gold-dark">
                    {scorerStats?.goalCount || 0}
                  </p>
                  <p className="text-muted-foreground">gols no campeonato</p>
                </div>
                {scorerRank !== undefined && scorerRank >= 0 && (
                  <div className={`h-16 w-16 rounded-full flex items-center justify-center font-bold text-xl ${
                    scorerRank === 0 ? "bg-yellow-400 text-yellow-900" :
                    scorerRank === 1 ? "bg-gray-300 text-gray-700" :
                    scorerRank === 2 ? "bg-orange-400 text-orange-900" :
                    "bg-muted text-muted-foreground"
                  }`}>
                    {scorerRank + 1}º
                  </div>
                )}
              </div>
              {scorerRank !== undefined && scorerRank >= 0 && scorerRank < 3 && (
                <div className="mt-4 p-3 rounded-lg bg-gold-gradient-light">
                  <p className="text-sm font-medium flex items-center gap-2">
                    <Trophy className="h-4 w-4" />
                    {scorerRank === 0 ? "🔥 Artilheiro do Campeonato!" :
                     scorerRank === 1 ? "Vice-artilheiro" :
                     "3º lugar na artilharia"}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Cards Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-destructive">
                <AlertTriangle className="h-5 w-5" />
                Cartões Recebidos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex gap-4">
                  <div className="text-center">
                    <p className="text-4xl font-bold text-red-600">
                      {cardStats?.redCards || 0}
                    </p>
                    <p className="text-sm text-muted-foreground">🟥 Vermelhos</p>
                  </div>
                  <div className="text-center">
                    <p className="text-4xl font-bold text-yellow-600">
                      {cardStats?.yellowCards || 0}
                    </p>
                    <p className="text-sm text-muted-foreground">🟨 Amarelos</p>
                  </div>
                </div>
                {cardRank !== undefined && cardRank >= 0 && (
                  <div className={`h-16 w-16 rounded-full flex items-center justify-center font-bold text-xl ${
                    cardRank < 3 ? "bg-red-200 text-red-800" : "bg-muted text-muted-foreground"
                  }`}>
                    {cardRank + 1}º
                  </div>
                )}
              </div>

              {(cardStats?.totalCards || 0) === 0 && (
                <div className="mt-4 p-3 rounded-lg bg-green-50">
                  <p className="text-sm font-medium text-green-800 flex items-center gap-2">
                    ✅ Jogador disciplinado! Nenhum cartão recebido.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Summary Card */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Resumo do Jogador</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div className="p-4 rounded-lg bg-muted">
                <p className="text-2xl font-bold">{scorerStats?.goalCount || 0}</p>
                <p className="text-sm text-muted-foreground">Gols</p>
              </div>
              <div className="p-4 rounded-lg bg-muted">
                <p className="text-2xl font-bold">{cardStats?.redCards || 0}</p>
                <p className="text-sm text-muted-foreground">Cartões Vermelhos</p>
              </div>
              <div className="p-4 rounded-lg bg-muted">
                <p className="text-2xl font-bold">{cardStats?.yellowCards || 0}</p>
                <p className="text-sm text-muted-foreground">Cartões Amarelos</p>
              </div>
              <div className="p-4 rounded-lg bg-muted">
                <p className="text-2xl font-bold">{cardStats?.totalCards || 0}</p>
                <p className="text-sm text-muted-foreground">Total de Cartões</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>

    </div>
  );
}
