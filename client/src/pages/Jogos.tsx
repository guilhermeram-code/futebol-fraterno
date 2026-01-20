import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Header } from "@/components/Header";
import { Link } from "wouter";
import { Calendar, Clock, Trophy, MapPin } from "lucide-react";
import { AudioPlayer } from "@/components/AudioPlayer";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function Jogos() {
  const { data: allMatches, isLoading } = trpc.matches.list.useQuery();
  const { data: teams } = trpc.teams.list.useQuery();
  const { data: groups } = trpc.groups.list.useQuery();

  const getTeamName = (teamId: number) => {
    return teams?.find(t => t.id === teamId)?.name || "Time";
  };

  const getTeamLodge = (teamId: number) => {
    return teams?.find(t => t.id === teamId)?.lodge || null;
  };

  const getGroupName = (groupId: number | null) => {
    if (!groupId) return "";
    return groups?.find(g => g.id === groupId)?.name || "";
  };

  const formatMatchDate = (date: Date | null) => {
    if (!date) return "Data a definir";
    return format(new Date(date), "dd 'de' MMMM 'às' HH:mm", { locale: ptBR });
  };

  const upcomingMatches = allMatches?.filter(m => !m.played) || [];
  const playedMatches = allMatches?.filter(m => m.played) || [];

  const phaseLabels: Record<string, string> = {
    groups: "Fase de Grupos",
    round16: "Oitavas de Final",
    quarters: "Quartas de Final",
    semis: "Semifinal",
    final: "Final"
  };

  return (
    <div className="min-h-screen bg-background masonic-pattern">
      {/* Header */}
      <Header />

      <main className="container py-8">
        <Tabs defaultValue="upcoming" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="upcoming" className="gap-2">
              <Clock className="h-4 w-4" />
              Próximos Jogos ({upcomingMatches.length})
            </TabsTrigger>
            <TabsTrigger value="results" className="gap-2">
              <Trophy className="h-4 w-4" />
              Resultados ({playedMatches.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming">
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map(i => (
                  <Skeleton key={i} className="h-24 w-full" />
                ))}
              </div>
            ) : upcomingMatches.length > 0 ? (
              <div className="space-y-4">
                {upcomingMatches.map(match => (
                  <Card key={match.id} className="card-hover">
                    <CardContent className="p-4">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center gap-4 flex-1">
                          <div className="text-center flex-1">
                            <Link href={`/times/${match.homeTeamId}`}>
                              <div className="hover:text-primary cursor-pointer">
                                <p className="font-bold text-lg">{getTeamName(match.homeTeamId)}</p>
                                {getTeamLodge(match.homeTeamId) && (
                                  <p className="text-xs text-muted-foreground">{getTeamLodge(match.homeTeamId)}</p>
                                )}
                              </div>
                            </Link>
                          </div>
                          <div className="text-center px-4">
                            <Badge variant="outline" className="mb-2">
                              {phaseLabels[match.phase]}
                              {match.groupId && ` - ${getGroupName(match.groupId)}`}
                              {match.round && ` - Rodada ${match.round}`}
                            </Badge>
                            <p className="text-2xl font-bold text-muted-foreground">VS</p>
                          </div>
                          <div className="text-center flex-1">
                            <Link href={`/times/${match.awayTeamId}`}>
                              <div className="hover:text-primary cursor-pointer">
                                <p className="font-bold text-lg">{getTeamName(match.awayTeamId)}</p>
                                {getTeamLodge(match.awayTeamId) && (
                                  <p className="text-xs text-muted-foreground">{getTeamLodge(match.awayTeamId)}</p>
                                )}
                              </div>
                            </Link>
                          </div>
                        </div>
                        <div className="text-center md:text-right space-y-1">
                          <div className="flex items-center gap-2 text-sm text-muted-foreground justify-center md:justify-end">
                            <Calendar className="h-4 w-4" />
                            {formatMatchDate(match.matchDate)}
                          </div>
                          {match.location && (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground justify-center md:justify-end">
                              <MapPin className="h-4 w-4" />
                              {match.location}
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">Nenhum jogo agendado</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="results">
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map(i => (
                  <Skeleton key={i} className="h-24 w-full" />
                ))}
              </div>
            ) : playedMatches.length > 0 ? (
              <div className="space-y-4">
                {playedMatches.map(match => (
                  <Card key={match.id} className="card-hover">
                    <CardContent className="p-4">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center gap-4 flex-1">
                          <div className="text-center flex-1">
                            <Link href={`/times/${match.homeTeamId}`}>
                              <div className="hover:text-primary cursor-pointer">
                                <p className={`font-bold text-lg ${
                                  match.homeScore! > match.awayScore! ? "text-green-600" : ""
                                }`}>
                                  {getTeamName(match.homeTeamId)}
                                </p>
                                {getTeamLodge(match.homeTeamId) && (
                                  <p className="text-xs text-muted-foreground">{getTeamLodge(match.homeTeamId)}</p>
                                )}
                              </div>
                            </Link>
                          </div>
                          <div className="text-center px-4">
                            <Badge variant="outline" className="mb-2">
                              {phaseLabels[match.phase]}
                              {match.groupId && ` - ${getGroupName(match.groupId)}`}
                            </Badge>
                            <div className="flex items-center gap-2 justify-center">
                              <span className="text-3xl font-bold text-gold-dark">{match.homeScore}</span>
                              <span className="text-xl text-muted-foreground">x</span>
                              <span className="text-3xl font-bold text-gold-dark">{match.awayScore}</span>
                            </div>
                            {match.penalties && (
                              <p className="text-xs text-muted-foreground mt-1">
                                Pênaltis: {match.homePenalties} x {match.awayPenalties}
                              </p>
                            )}
                          </div>
                          <div className="text-center flex-1">
                            <Link href={`/times/${match.awayTeamId}`}>
                              <div className="hover:text-primary cursor-pointer">
                                <p className={`font-bold text-lg ${
                                  match.awayScore! > match.homeScore! ? "text-green-600" : ""
                                }`}>
                                  {getTeamName(match.awayTeamId)}
                                </p>
                                {getTeamLodge(match.awayTeamId) && (
                                  <p className="text-xs text-muted-foreground">{getTeamLodge(match.awayTeamId)}</p>
                                )}
                              </div>
                            </Link>
                          </div>
                        </div>
                        <div className="text-center md:text-right">
                          <div className="flex items-center gap-2 text-sm text-muted-foreground justify-center md:justify-end">
                            <Calendar className="h-4 w-4" />
                            {formatMatchDate(match.matchDate)}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <Trophy className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">Nenhum resultado ainda</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </main>

      <AudioPlayer />
    </div>
  );
}
