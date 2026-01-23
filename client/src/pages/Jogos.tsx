import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Header } from "@/components/Header";
import { Link } from "wouter";
import { useCampaign } from "@/App";
import { Calendar, Clock, Trophy, MapPin, Filter } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useTournament } from "@/contexts/TournamentContext";

export default function Jogos() {
  const { slug } = useCampaign();
  const { campaignId } = useTournament();
  const [selectedGroup, setSelectedGroup] = useState<string>("all");
  const [selectedPhase, setSelectedPhase] = useState<string>("all");
  
  const { data: allMatches, isLoading } = trpc.matches.list.useQuery({ campaignId });
  const { data: teams } = trpc.teams.list.useQuery({ campaignId });
  const { data: groups } = trpc.groups.list.useQuery({ campaignId });

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

  const formatMatchDate = (date: Date | string | null) => {
    if (!date) return "Data a definir";
    // Se for string ISO, criar Date diretamente
    const d = typeof date === 'string' ? new Date(date) : date;
    return format(d, "dd/MM - HH:mm", { locale: ptBR });
  };

  const formatMatchDateShort = (date: Date | string | null) => {
    if (!date) return "";
    const d = typeof date === 'string' ? new Date(date) : date;
    return format(d, "dd/MM", { locale: ptBR });
  };

  const formatMatchTime = (date: Date | string | null) => {
    if (!date) return "";
    const d = typeof date === 'string' ? new Date(date) : date;
    return format(d, "HH:mm", { locale: ptBR });
  };

  const phaseLabels: Record<string, string> = {
    groups: "Fase de Grupos",
    round16: "Oitavas de Final",
    quarters: "Quartas de Final",
    semis: "Semifinal",
    final: "Final"
  };

  // Filter matches
  const filterMatches = (matches: typeof allMatches) => {
    if (!matches) return [];
    
    return matches.filter(match => {
      // Filter by group
      if (selectedGroup !== "all") {
        if (selectedGroup === "knockout") {
          if (match.phase === "groups") return false;
        } else {
          const groupId = parseInt(selectedGroup);
          if (match.groupId !== groupId) return false;
        }
      }
      
      // Filter by phase
      if (selectedPhase !== "all" && match.phase !== selectedPhase) {
        return false;
      }
      
      return true;
    });
  };

  const filteredMatches = filterMatches(allMatches);
  const upcomingMatches = filteredMatches?.filter(m => !m.played) || [];
  const playedMatches = filteredMatches?.filter(m => m.played) || [];

  // Group matches by group/phase for better organization
  const groupMatchesBySection = (matches: typeof playedMatches) => {
    const grouped: Record<string, typeof matches> = {};
    
    matches.forEach(match => {
      let key = "";
      if (match.phase === "groups" && match.groupId) {
        key = `Fase de Grupos - ${getGroupName(match.groupId)}`;
      } else {
        key = phaseLabels[match.phase] || match.phase;
      }
      
      if (!grouped[key]) {
        grouped[key] = [];
      }
      grouped[key].push(match);
    });
    
    return grouped;
  };

  const groupedPlayedMatches = groupMatchesBySection(playedMatches);
  const groupedUpcomingMatches = groupMatchesBySection(upcomingMatches);

  return (
    <div className="min-h-screen bg-background masonic-pattern">
      {/* Header */}
      <Header />

      <main className="container py-8">
        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-6">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Filtrar por:</span>
          </div>
          
          <Select value={selectedGroup} onValueChange={setSelectedGroup}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Grupo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os Grupos</SelectItem>
              <SelectItem value="knockout">Mata-Mata</SelectItem>
              {groups?.map(group => (
                <SelectItem key={group.id} value={group.id.toString()}>
                  {group.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select value={selectedPhase} onValueChange={setSelectedPhase}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Fase" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as Fases</SelectItem>
              <SelectItem value="groups">Fase de Grupos</SelectItem>
              <SelectItem value="round16">Oitavas de Final</SelectItem>
              <SelectItem value="quarters">Quartas de Final</SelectItem>
              <SelectItem value="semis">Semifinal</SelectItem>
              <SelectItem value="final">Final</SelectItem>
            </SelectContent>
          </Select>
          
          {(selectedGroup !== "all" || selectedPhase !== "all") && (
            <button 
              onClick={() => { setSelectedGroup("all"); setSelectedPhase("all"); }}
              className="text-sm text-primary hover:underline"
            >
              Limpar filtros
            </button>
          )}
        </div>

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
              <div className="space-y-6">
                {Object.entries(groupedUpcomingMatches).map(([section, matches]) => (
                  <div key={section}>
                    <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                      <Badge variant="outline" className="text-sm">{section}</Badge>
                      <span className="text-muted-foreground text-sm">({matches.length} jogos)</span>
                    </h3>
                    <div className="space-y-3">
                      {matches.map(match => (
                        <Card key={match.id} className="card-hover">
                          <CardContent className="p-4">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                              <div className="flex items-center gap-4 flex-1">
                                <div className="text-center flex-1">
                                  <Link href={`/${slug}/times/${match.homeTeamId}`}>
                                    <div className="hover:text-primary cursor-pointer">
                                      <p className="font-bold text-lg">{getTeamName(match.homeTeamId)}</p>
                                      {getTeamLodge(match.homeTeamId) && (
                                        <p className="text-xs text-muted-foreground">{getTeamLodge(match.homeTeamId)}</p>
                                      )}
                                    </div>
                                  </Link>
                                </div>
                                <div className="text-center px-4">
                                  {match.round && (
                                    <Badge variant="secondary" className="mb-2 text-xs">
                                      Rodada {match.round}
                                    </Badge>
                                  )}
                                  <p className="text-2xl font-bold text-muted-foreground">VS</p>
                                </div>
                                <div className="text-center flex-1">
                                  <Link href={`/${slug}/times/${match.awayTeamId}`}>
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
                  </div>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">
                    {selectedGroup !== "all" || selectedPhase !== "all" 
                      ? "Nenhum jogo encontrado com os filtros selecionados"
                      : "Nenhum jogo agendado"}
                  </p>
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
              <div className="space-y-6">
                {Object.entries(groupedPlayedMatches).map(([section, matches]) => (
                  <div key={section}>
                    <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                      <Badge variant="outline" className="text-sm">{section}</Badge>
                      <span className="text-muted-foreground text-sm">({matches.length} jogos)</span>
                    </h3>
                    <div className="space-y-3">
                      {matches.map(match => (
                        <Card key={match.id} className="card-hover">
                          <CardContent className="p-4">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                              <div className="flex items-center gap-4 flex-1">
                                <div className="text-center flex-1">
                                  <Link href={`/${slug}/times/${match.homeTeamId}`}>
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
                                  {match.round && (
                                    <Badge variant="secondary" className="mb-2 text-xs">
                                      Rodada {match.round}
                                    </Badge>
                                  )}
                                  <div className="flex items-center gap-2 justify-center">
                                    <span className="text-3xl font-bold text-gold-dark score-display">{match.homeScore}</span>
                                    <span className="text-xl text-muted-foreground">x</span>
                                    <span className="text-3xl font-bold text-gold-dark score-display">{match.awayScore}</span>
                                  </div>
                                  {match.penalties && (
                                    <p className="text-xs text-muted-foreground mt-1">
                                      Pênaltis: {match.homePenalties} x {match.awayPenalties}
                                    </p>
                                  )}
                                </div>
                                <div className="text-center flex-1">
                                  <Link href={`/${slug}/times/${match.awayTeamId}`}>
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
                  </div>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <Trophy className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">
                    {selectedGroup !== "all" || selectedPhase !== "all" 
                      ? "Nenhum resultado encontrado com os filtros selecionados"
                      : "Nenhum resultado ainda"}
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </main>

    </div>
  );
}
