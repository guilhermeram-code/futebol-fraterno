import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Header } from "@/components/Header";
import { Link, useParams } from "wouter";
import { Users, Shield, Trophy, Target, AlertTriangle, Calendar, Info } from "lucide-react";
import { AudioPlayer } from "@/components/AudioPlayer";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function TimeDetail() {
  const params = useParams<{ id: string }>();
  const teamId = parseInt(params.id || "0");

  const { data: team, isLoading: loadingTeam } = trpc.teams.byId.useQuery({ id: teamId });
  const { data: stats, isLoading: loadingStats } = trpc.teams.stats.useQuery({ id: teamId });
  const { data: statsGroupOnly } = trpc.teams.statsGroupOnly.useQuery({ id: teamId });
  const { data: statsKnockoutOnly } = trpc.teams.statsKnockoutOnly.useQuery({ id: teamId });
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
        {/* Cabeçalho do Time */}
        <div className="mb-8">
          <Card className="bg-gradient-to-r from-secondary to-secondary/80 text-secondary-foreground overflow-hidden">
            <CardContent className="p-6 md:p-8">
              <div className="flex flex-col md:flex-row items-center gap-6">
                {/* Logo do Time */}
                {team.logoUrl ? (
                  <img 
                    src={team.logoUrl} 
                    alt={team.name}
                    className="h-24 w-24 md:h-32 md:w-32 object-contain rounded-lg bg-white/10 p-2"
                  />
                ) : (
                  <div className="h-24 w-24 md:h-32 md:w-32 rounded-lg bg-white/10 flex items-center justify-center">
                    <Shield className="h-12 w-12 md:h-16 md:w-16 text-gold" />
                  </div>
                )}
                
                {/* Informações do Time */}
                <div className="text-center md:text-left flex-1">
                  <h1 className="text-3xl md:text-4xl font-bold text-gold mb-2">
                    {team.name}
                  </h1>
                  {team.lodge && (
                    <p className="text-xl md:text-2xl text-gold/80 mb-3">
                      {team.lodge}
                    </p>
                  )}
                  <div className="flex flex-wrap justify-center md:justify-start gap-2">
                    {team.groupId && (
                      <Badge variant="secondary" className="bg-gold/20 text-gold border-gold/30">
                        <Trophy className="h-3 w-3 mr-1" />
                        {getGroupName(team.groupId)}
                      </Badge>
                    )}
                    <Badge variant="secondary" className="bg-white/10 text-white/80">
                      <Users className="h-3 w-3 mr-1" />
                      {players?.length || 0} jogadores
                    </Badge>
                  </div>
                  {/* Mensagem de Apoio */}
                  {team.supportMessage && (
                    <div className="mt-4 p-3 rounded-lg bg-gold/20 border border-gold/30">
                      <p className="text-sm md:text-base italic text-gold">
                        "💬 {team.supportMessage}"
                      </p>
                    </div>
                  )}
                </div>
                
                {/* Estatísticas Rápidas - Apenas Fase de Grupos */}
                {statsGroupOnly && statsGroupOnly.played > 0 ? (
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div className="bg-white/10 rounded-lg p-3">
                      <p className="text-2xl md:text-3xl font-bold text-gold score-display">{statsGroupOnly.points}</p>
                      <p className="text-xs text-white/60">Pontos</p>
                    </div>
                    <div className="bg-white/10 rounded-lg p-3">
                      <p className="text-2xl md:text-3xl font-bold text-green-400 score-display">{statsGroupOnly.wins}</p>
                      <p className="text-xs text-white/60">Vitórias</p>
                    </div>
                    <div className="bg-white/10 rounded-lg p-3">
                      <p className="text-2xl md:text-3xl font-bold text-gold score-display">{statsGroupOnly.goalsFor}</p>
                      <p className="text-xs text-white/60">Gols</p>
                    </div>
                  </div>
                ) : stats && (
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div className="bg-white/10 rounded-lg p-3">
                      <p className="text-2xl md:text-3xl font-bold text-gold score-display">{stats.points}</p>
                      <p className="text-xs text-white/60">Pontos</p>
                    </div>
                    <div className="bg-white/10 rounded-lg p-3">
                      <p className="text-2xl md:text-3xl font-bold text-green-400 score-display">{stats.wins}</p>
                      <p className="text-xs text-white/60">Vitórias</p>
                    </div>
                    <div className="bg-white/10 rounded-lg p-3">
                      <p className="text-2xl md:text-3xl font-bold text-gold score-display">{stats.goalsFor}</p>
                      <p className="text-xs text-white/60">Gols</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Stats and Players */}
          <div className="lg:col-span-2 space-y-6">
            {/* Stats - Fase de Grupos */}
            {statsGroupOnly && statsGroupOnly.played > 0 && (
              <Card className="card-shadow">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-gold-dark text-lg">
                    <Trophy className="h-5 w-5" />
                    Fase de Grupos
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-4 md:grid-cols-8 gap-2">
                    <div className="text-center p-2 bg-gold-gradient-light rounded-lg">
                      <p className="text-2xl font-bold text-gold-dark score-display">{statsGroupOnly.points}</p>
                      <p className="text-xs text-muted-foreground">PTS</p>
                    </div>
                    <div className="text-center p-2 bg-muted rounded-lg">
                      <p className="text-2xl font-bold score-display">{statsGroupOnly.played}</p>
                      <p className="text-xs text-muted-foreground">J</p>
                    </div>
                    <div className="text-center p-2 bg-green-50 rounded-lg">
                      <p className="text-2xl font-bold text-green-600 score-display">{statsGroupOnly.wins}</p>
                      <p className="text-xs text-muted-foreground">V</p>
                    </div>
                    <div className="text-center p-2 bg-yellow-50 rounded-lg">
                      <p className="text-2xl font-bold text-yellow-600 score-display">{statsGroupOnly.draws}</p>
                      <p className="text-xs text-muted-foreground">E</p>
                    </div>
                    <div className="text-center p-2 bg-red-50 rounded-lg">
                      <p className="text-2xl font-bold text-red-600 score-display">{statsGroupOnly.losses}</p>
                      <p className="text-xs text-muted-foreground">D</p>
                    </div>
                    <div className="text-center p-2 bg-muted rounded-lg">
                      <p className="text-2xl font-bold score-display">{statsGroupOnly.goalsFor}</p>
                      <p className="text-xs text-muted-foreground">GP</p>
                    </div>
                    <div className="text-center p-2 bg-muted rounded-lg">
                      <p className="text-2xl font-bold score-display">{statsGroupOnly.goalsAgainst}</p>
                      <p className="text-xs text-muted-foreground">GC</p>
                    </div>
                    <div className="text-center p-2 bg-muted rounded-lg">
                      <p className={`text-2xl font-bold score-display ${statsGroupOnly.goalDifference > 0 ? "text-green-600" : statsGroupOnly.goalDifference < 0 ? "text-red-600" : ""}`}>
                        {statsGroupOnly.goalDifference > 0 ? "+" : ""}{statsGroupOnly.goalDifference}
                      </p>
                      <p className="text-xs text-muted-foreground">SG</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Stats - Mata-Mata */}
            {statsKnockoutOnly && statsKnockoutOnly.played > 0 && (
              <Card className="card-shadow">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-gold-dark text-lg">
                    <Target className="h-5 w-5" />
                    Mata-Mata
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-4 md:grid-cols-7 gap-2">
                    <div className="text-center p-2 bg-muted rounded-lg">
                      <p className="text-2xl font-bold score-display">{statsKnockoutOnly.played}</p>
                      <p className="text-xs text-muted-foreground">J</p>
                    </div>
                    <div className="text-center p-2 bg-green-50 rounded-lg">
                      <p className="text-2xl font-bold text-green-600 score-display">{statsKnockoutOnly.wins}</p>
                      <p className="text-xs text-muted-foreground">V</p>
                    </div>
                    <div className="text-center p-2 bg-yellow-50 rounded-lg">
                      <p className="text-2xl font-bold text-yellow-600 score-display">{statsKnockoutOnly.draws}</p>
                      <p className="text-xs text-muted-foreground">E</p>
                    </div>
                    <div className="text-center p-2 bg-red-50 rounded-lg">
                      <p className="text-2xl font-bold text-red-600 score-display">{statsKnockoutOnly.losses}</p>
                      <p className="text-xs text-muted-foreground">D</p>
                    </div>
                    <div className="text-center p-2 bg-muted rounded-lg">
                      <p className="text-2xl font-bold score-display">{statsKnockoutOnly.goalsFor}</p>
                      <p className="text-xs text-muted-foreground">GP</p>
                    </div>
                    <div className="text-center p-2 bg-muted rounded-lg">
                      <p className="text-2xl font-bold score-display">{statsKnockoutOnly.goalsAgainst}</p>
                      <p className="text-xs text-muted-foreground">GC</p>
                    </div>
                    <div className="text-center p-2 bg-muted rounded-lg">
                      <p className={`text-2xl font-bold score-display ${statsKnockoutOnly.goalDifference > 0 ? "text-green-600" : statsKnockoutOnly.goalDifference < 0 ? "text-red-600" : ""}`}>
                        {statsKnockoutOnly.goalDifference > 0 ? "+" : ""}{statsKnockoutOnly.goalDifference}
                      </p>
                      <p className="text-xs text-muted-foreground">SG</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Stats - Geral (se não tiver nenhum jogo) */}
            {loadingStats ? (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-gold-dark">
                    <Trophy className="h-5 w-5" />
                    Estatísticas
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-24 w-full" />
                </CardContent>
              </Card>
            ) : (!statsGroupOnly || statsGroupOnly.played === 0) && (!statsKnockoutOnly || statsKnockoutOnly.played === 0) && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-gold-dark">
                    <Trophy className="h-5 w-5" />
                    Estatísticas
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-center text-muted-foreground">Nenhum jogo realizado ainda</p>
                </CardContent>
              </Card>
            )}

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
                            <span className="font-medium flex items-center gap-1">
                              {isHome ? (
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <span className="cursor-help text-green-600">🏠</span>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>Jogando em casa (mandante)</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              ) : (
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <span className="cursor-help text-muted-foreground">✈️</span>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>Jogando fora de casa (visitante)</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              )} vs {getTeamName(opponentId)}
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
