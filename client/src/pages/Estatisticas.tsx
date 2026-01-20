import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Header } from "@/components/Header";
import { Link } from "wouter";
import { Target, AlertTriangle, Shield, Flame, Trophy } from "lucide-react";
import { AudioPlayer } from "@/components/AudioPlayer";

export default function Estatisticas() {
  const { data: topScorers, isLoading: loadingScorers } = trpc.stats.topScorers.useQuery({ limit: 20 });
  const { data: topCarded, isLoading: loadingCarded } = trpc.stats.topCarded.useQuery({ limit: 20 });
  const { data: bestDefenses, isLoading: loadingBest } = trpc.stats.bestDefenses.useQuery({ limit: 10 });
  const { data: worstDefenses, isLoading: loadingWorst } = trpc.stats.worstDefenses.useQuery({ limit: 10 });
  const { data: teams } = trpc.teams.list.useQuery();
  const { data: players } = trpc.players.list.useQuery();

  const getTeamById = (teamId: number) => teams?.find(t => t.id === teamId);
  const getTeamName = (teamId: number) => getTeamById(teamId)?.name || "Time";
  const getTeamLodge = (teamId: number) => getTeamById(teamId)?.lodge || "";
  const getTeamWithLodge = (teamId: number) => {
    const team = getTeamById(teamId);
    if (!team) return "Time";
    return team.lodge ? `${team.name} (${team.lodge})` : team.name;
  };

  const getPlayerName = (playerId: number) => {
    return players?.find(p => p.id === playerId)?.name || "Jogador";
  };

  return (
    <div className="min-h-screen bg-background masonic-pattern">
      {/* Header */}
      <Header />

      <main className="container py-8">
        <Tabs defaultValue="scorers" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger value="scorers" className="gap-1 text-xs md:text-sm">
              <Target className="h-4 w-4 hidden md:block" />
              Artilheiros
            </TabsTrigger>
            <TabsTrigger value="cards" className="gap-1 text-xs md:text-sm">
              <AlertTriangle className="h-4 w-4 hidden md:block" />
              Cartões
            </TabsTrigger>
            <TabsTrigger value="best" className="gap-1 text-xs md:text-sm">
              <Shield className="h-4 w-4 hidden md:block" />
              Melhor Defesa
            </TabsTrigger>
            <TabsTrigger value="worst" className="gap-1 text-xs md:text-sm">
              <Flame className="h-4 w-4 hidden md:block" />
              Frangueiro
            </TabsTrigger>
          </TabsList>

          {/* Artilheiros */}
          <TabsContent value="scorers">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gold-dark">
                  <Target className="h-5 w-5" />
                  Ranking de Artilheiros
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loadingScorers ? (
                  <div className="space-y-2">
                    {[1, 2, 3, 4, 5].map(i => (
                      <Skeleton key={i} className="h-12 w-full" />
                    ))}
                  </div>
                ) : topScorers && topScorers.length > 0 ? (
                  <div className="space-y-2">
                    {topScorers.map((scorer, index) => (
                      <div 
                        key={scorer.playerId} 
                        className={`flex items-center justify-between p-3 rounded-lg transition-colors ${
                          index < 3 ? "bg-gold-gradient-light" : "hover:bg-muted"
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <div className={`h-10 w-10 rounded-full flex items-center justify-center font-bold ${
                            index === 0 ? "bg-yellow-400 text-yellow-900" :
                            index === 1 ? "bg-gray-300 text-gray-700" :
                            index === 2 ? "bg-orange-400 text-orange-900" :
                            "bg-muted text-muted-foreground"
                          }`}>
                            {index + 1}º
                          </div>
                          <div>
                            <p className="font-bold">{getPlayerName(scorer.playerId)}</p>
                            <p className="text-sm text-muted-foreground">{getTeamWithLodge(scorer.teamId)}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-2xl font-bold text-gold-dark">{scorer.goalCount}</span>
                          <span className="text-sm text-muted-foreground">gols</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-8">
                    Nenhum gol marcado ainda
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Cartões */}
          <TabsContent value="cards">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-destructive">
                  <AlertTriangle className="h-5 w-5" />
                  Ranking de Cartões (Maior Quebrador)
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loadingCarded ? (
                  <div className="space-y-2">
                    {[1, 2, 3, 4, 5].map(i => (
                      <Skeleton key={i} className="h-12 w-full" />
                    ))}
                  </div>
                ) : topCarded && topCarded.length > 0 ? (
                  <div className="space-y-2">
                    {topCarded.map((player, index) => (
                      <div 
                        key={player.playerId} 
                        className={`flex items-center justify-between p-3 rounded-lg transition-colors ${
                          index < 3 ? "bg-red-50" : "hover:bg-muted"
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <div className={`h-10 w-10 rounded-full flex items-center justify-center font-bold ${
                            index < 3 ? "bg-red-200 text-red-800" : "bg-muted text-muted-foreground"
                          }`}>
                            {index + 1}º
                          </div>
                          <div>
                            <p className="font-bold">{getPlayerName(player.playerId)}</p>
                            <p className="text-sm text-muted-foreground">{getTeamWithLodge(player.teamId)}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="bg-red-100 text-red-800 border-red-300">
                            {player.redCards} 🟥
                          </Badge>
                          <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300">
                            {player.yellowCards} 🟨
                          </Badge>
                          <span className="text-sm text-muted-foreground ml-2">
                            Total: {player.totalCards}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-8">
                    Nenhum cartão registrado ainda
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Melhor Defesa */}
          <TabsContent value="best">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-600">
                  <Shield className="h-5 w-5" />
                  Ranking de Melhor Defesa
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loadingBest ? (
                  <div className="space-y-2">
                    {[1, 2, 3, 4, 5].map(i => (
                      <Skeleton key={i} className="h-12 w-full" />
                    ))}
                  </div>
                ) : bestDefenses && bestDefenses.length > 0 ? (
                  <div className="space-y-2">
                    {bestDefenses.map((team, index) => (
                      <div 
                        key={team.team.id} 
                        className={`flex items-center justify-between p-3 rounded-lg transition-colors ${
                          index < 3 ? "bg-green-50" : "hover:bg-muted"
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <div className={`h-10 w-10 rounded-full flex items-center justify-center font-bold ${
                            index === 0 ? "bg-green-500 text-white" :
                            index === 1 ? "bg-green-400 text-green-900" :
                            index === 2 ? "bg-green-300 text-green-800" :
                            "bg-muted text-muted-foreground"
                          }`}>
                            {index + 1}º
                          </div>
                          <div>
                            <Link href={`/times/${team.team.id}`}>
                              <p className="font-bold hover:text-primary cursor-pointer">{team.team.name}</p>
                            </Link>
                            <p className="text-sm text-muted-foreground">
                              {team.played} jogos | {team.wins}V {team.draws}E {team.losses}D
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-green-600">{team.goalsAgainst}</p>
                          <p className="text-xs text-muted-foreground">gols sofridos</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-8">
                    Nenhum jogo realizado ainda
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Frangueiro */}
          <TabsContent value="worst">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-orange-600">
                  <Flame className="h-5 w-5" />
                  Ranking Frangueiro (Pior Defesa)
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loadingWorst ? (
                  <div className="space-y-2">
                    {[1, 2, 3, 4, 5].map(i => (
                      <Skeleton key={i} className="h-12 w-full" />
                    ))}
                  </div>
                ) : worstDefenses && worstDefenses.length > 0 ? (
                  <div className="space-y-2">
                    {worstDefenses.map((team, index) => (
                      <div 
                        key={team.team.id} 
                        className={`flex items-center justify-between p-3 rounded-lg transition-colors ${
                          index < 3 ? "bg-orange-50" : "hover:bg-muted"
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <div className={`h-10 w-10 rounded-full flex items-center justify-center font-bold ${
                            index === 0 ? "bg-orange-500 text-white" :
                            index === 1 ? "bg-orange-400 text-orange-900" :
                            index === 2 ? "bg-orange-300 text-orange-800" :
                            "bg-muted text-muted-foreground"
                          }`}>
                            {index + 1}º
                          </div>
                          <div>
                            <Link href={`/times/${team.team.id}`}>
                              <p className="font-bold hover:text-primary cursor-pointer">{team.team.name}</p>
                            </Link>
                            <p className="text-sm text-muted-foreground">
                              {team.played} jogos | {team.wins}V {team.draws}E {team.losses}D
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-orange-600">{team.goalsAgainst}</p>
                          <p className="text-xs text-muted-foreground">gols sofridos</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-8">
                    Nenhum jogo realizado ainda
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      <AudioPlayer />
    </div>
  );
}
