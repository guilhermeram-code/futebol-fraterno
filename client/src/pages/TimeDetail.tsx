import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Header } from "@/components/Header";
import { Link, useParams } from "wouter";
import { Users, Shield, Trophy, Target, AlertTriangle, Calendar } from "lucide-react";
import { AudioPlayer } from "@/components/AudioPlayer";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function TimeDetail() {
  const params = useParams<{ id: string }>();
  const teamId = parseInt(params.id || "0");

  const { data: team, isLoading: loadingTeam } = trpc.teams.byId.useQuery({ id: teamId });
  const { data: stats, isLoading: loadingStats } = trpc.teams.stats.useQuery({ id: teamId });
  const { data: players, isLoading: loadingPlayers } = trpc.players.byTeam.useQuery({ teamId });
  const { data: matches, isLoading: loadingMatches } = trpc.matches.byTeam.useQuery({ teamId });
  const { data: allTeams } = trpc.teams.list.useQuery();
  const { data: groups } = trpc.groups.list.useQuery();

  const getTeamName = (id: number) => {
    return allTeams?.find(t => t.id === id)?.name || "Time";
  };

  const getGroupName = (groupId: number | null) => {
    if (!groupId) return null;
    return groups?.find(g => g.id === groupId)?.name;
  };

  const formatMatchDate = (date: Date | null) => {
    if (!date) return "Data a definir";
    return format(new Date(date), "dd/MM/yyyy", { locale: ptBR });
  };

  if (loadingTeam) {
    return (
      <div className="min-h-screen bg-background masonic-pattern">
        <Header />
        <main className="container py-8">
          <Skeleton className="h-64 w-full" />
        </main>
      </div>
    );
  }

  if (!team) {
    return (
      <div className="min-h-screen bg-background masonic-pattern">
        <Header />
        <main className="container py-8">
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">Time não encontrado</p>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background masonic-pattern">
      {/* Header */}
      <Header />

      <main className="container py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Stats and Players */}
          <div className="lg:col-span-2 space-y-6">
            {/* Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gold-dark">
                  <Trophy className="h-5 w-5" />
                  Estatísticas
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loadingStats ? (
                  <Skeleton className="h-24 w-full" />
                ) : stats ? (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-4 bg-muted rounded-lg">
                      <p className="text-3xl font-bold text-gold-dark">{stats.points}</p>
                      <p className="text-sm text-muted-foreground">Pontos</p>
                    </div>
                    <div className="text-center p-4 bg-muted rounded-lg">
                      <p className="text-3xl font-bold">{stats.played}</p>
                      <p className="text-sm text-muted-foreground">Jogos</p>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <p className="text-3xl font-bold text-green-600">{stats.wins}</p>
                      <p className="text-sm text-muted-foreground">Vitórias</p>
                    </div>
                    <div className="text-center p-4 bg-yellow-50 rounded-lg">
                      <p className="text-3xl font-bold text-yellow-600">{stats.draws}</p>
                      <p className="text-sm text-muted-foreground">Empates</p>
                    </div>
                    <div className="text-center p-4 bg-red-50 rounded-lg">
                      <p className="text-3xl font-bold text-red-600">{stats.losses}</p>
                      <p className="text-sm text-muted-foreground">Derrotas</p>
                    </div>
                    <div className="text-center p-4 bg-muted rounded-lg">
                      <p className="text-3xl font-bold">{stats.goalsFor}</p>
                      <p className="text-sm text-muted-foreground">Gols Pró</p>
                    </div>
                    <div className="text-center p-4 bg-muted rounded-lg">
                      <p className="text-3xl font-bold">{stats.goalsAgainst}</p>
                      <p className="text-sm text-muted-foreground">Gols Contra</p>
                    </div>
                    <div className="text-center p-4 bg-muted rounded-lg">
                      <p className={`text-3xl font-bold ${stats.goalDifference > 0 ? "text-green-600" : stats.goalDifference < 0 ? "text-red-600" : ""}`}>
                        {stats.goalDifference > 0 ? "+" : ""}{stats.goalDifference}
                      </p>
                      <p className="text-sm text-muted-foreground">Saldo</p>
                    </div>
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground">Nenhuma estatística disponível</p>
                )}
              </CardContent>
            </Card>

            {/* Players */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gold-dark">
                  <Users className="h-5 w-5" />
                  Elenco ({players?.length || 0} jogadores)
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loadingPlayers ? (
                  <Skeleton className="h-48 w-full" />
                ) : players && players.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {players.map(player => (
                      <div 
                        key={player.id} 
                        className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted transition-colors"
                      >
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="font-bold text-primary">
                            {player.number || "-"}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium">{player.name}</p>
                          {player.position && (
                            <p className="text-xs text-muted-foreground">{player.position}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-4">
                    Nenhum jogador cadastrado
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Matches */}
          <div className="space-y-6">
            {/* Group Info */}
            {team.groupId && (
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-gold-dark" />
                    <span className="font-medium">{getGroupName(team.groupId)}</span>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Match History */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gold-dark">
                  <Calendar className="h-5 w-5" />
                  Histórico de Jogos
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loadingMatches ? (
                  <div className="space-y-2">
                    {[1, 2, 3].map(i => (
                      <Skeleton key={i} className="h-16 w-full" />
                    ))}
                  </div>
                ) : matches && matches.length > 0 ? (
                  <div className="space-y-2">
                    {matches.map(match => {
                      const isHome = match.homeTeamId === teamId;
                      const opponentId = isHome ? match.awayTeamId : match.homeTeamId;
                      const teamScore = isHome ? match.homeScore : match.awayScore;
                      const opponentScore = isHome ? match.awayScore : match.homeScore;
                      
                      let result = "";
                      let resultClass = "";
                      if (match.played && teamScore !== null && opponentScore !== null) {
                        if (teamScore > opponentScore) {
                          result = "V";
                          resultClass = "bg-green-100 text-green-800";
                        } else if (teamScore < opponentScore) {
                          result = "D";
                          resultClass = "bg-red-100 text-red-800";
                        } else {
                          result = "E";
                          resultClass = "bg-yellow-100 text-yellow-800";
                        }
                      }

                      return (
                        <div 
                          key={match.id} 
                          className="p-3 bg-muted rounded-lg"
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs text-muted-foreground">
                              {formatMatchDate(match.matchDate)}
                            </span>
                            {result && (
                              <Badge variant="outline" className={resultClass}>
                                {result}
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="font-medium">
                              {isHome ? "vs" : "@"} {getTeamName(opponentId)}
                            </span>
                            {match.played ? (
                              <span className="font-bold">
                                {teamScore} x {opponentScore}
                              </span>
                            ) : (
                              <span className="text-muted-foreground text-sm">
                                A jogar
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-4">
                    Nenhum jogo registrado
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <AudioPlayer />
    </div>
  );
}
