import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Header } from "@/components/Header";
import { Link } from "wouter";
import { Users, Shield, ChevronRight, Search, TrendingUp, Flame, LayoutGrid, List, Trophy } from "lucide-react";
import { AudioPlayer } from "@/components/AudioPlayer";

export default function Times() {
  const { data: teams, isLoading } = trpc.teams.list.useQuery();
  const { data: groups } = trpc.groups.list.useQuery();
  const { data: allMatches } = trpc.matches.list.useQuery();
  const { data: topScorers } = trpc.stats.topScorers.useQuery({ limit: 1 });
  const { data: bestDefenses } = trpc.stats.bestDefenses.useQuery({ limit: 1 });
  const { data: worstDefenses } = trpc.stats.worstDefenses.useQuery({ limit: 1 });
  
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGroup, setSelectedGroup] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"grid" | "accordion">("accordion");

  const getGroupName = (groupId: number | null) => {
    if (!groupId) return null;
    return groups?.find(g => g.id === groupId)?.name;
  };

  // Calculate team stats
  const getTeamStats = (teamId: number) => {
    if (!allMatches) return { aproveitamento: 0, sequencia: [], played: 0 };
    
    const teamMatches = allMatches
      .filter(m => m.played && (m.homeTeamId === teamId || m.awayTeamId === teamId))
      .sort((a, b) => new Date(b.matchDate || 0).getTime() - new Date(a.matchDate || 0).getTime());
    
    if (teamMatches.length === 0) return { aproveitamento: 0, sequencia: [], played: 0 };
    
    let wins = 0, draws = 0, losses = 0;
    const sequencia: ('W' | 'D' | 'L')[] = [];
    
    teamMatches.forEach((match, index) => {
      const isHome = match.homeTeamId === teamId;
      const teamScore = isHome ? match.homeScore! : match.awayScore!;
      const opponentScore = isHome ? match.awayScore! : match.homeScore!;
      
      if (teamScore > opponentScore) {
        wins++;
        if (index < 5) sequencia.push('W');
      } else if (teamScore < opponentScore) {
        losses++;
        if (index < 5) sequencia.push('L');
      } else {
        draws++;
        if (index < 5) sequencia.push('D');
      }
    });
    
    const totalPoints = wins * 3 + draws;
    const maxPoints = teamMatches.length * 3;
    const aproveitamento = maxPoints > 0 ? Math.round((totalPoints / maxPoints) * 100) : 0;
    
    return { aproveitamento, sequencia: sequencia.reverse(), played: teamMatches.length };
  };

  // Filter teams based on search and group
  const filteredTeams = teams?.filter(team => {
    const matchesSearch = 
      team.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (team.lodge && team.lodge.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesGroup = 
      selectedGroup === "all" || 
      (selectedGroup === "none" && !team.groupId) ||
      team.groupId?.toString() === selectedGroup;
    
    return matchesSearch && matchesGroup;
  });

  const getSequenciaEmoji = (result: 'W' | 'D' | 'L') => {
    switch (result) {
      case 'W': return '🟢';
      case 'D': return '🟡';
      case 'L': return '🔴';
    }
  };

  const getSequenciaLabel = (result: 'W' | 'D' | 'L') => {
    switch (result) {
      case 'W': return 'Vitória';
      case 'D': return 'Empate';
      case 'L': return 'Derrota';
    }
  };

  // Função para obter mensagem especial do time
  const getTeamSpecialMessage = (teamId: number) => {
    const messages: { emoji: string; text: string; color: string }[] = [];
    
    // Verifica se tem o artilheiro
    if (topScorers && topScorers.length > 0) {
      const artilheiro = topScorers[0];
      if (artilheiro.teamId === teamId) {
        messages.push({
          emoji: '⚽',
          text: `Time do Artilheiro! (${artilheiro.goalCount} gols)`,
          color: 'bg-yellow-100 text-yellow-800 border-yellow-300'
        });
      }
    }
    
    // Verifica melhor defesa
    if (bestDefenses && bestDefenses.length > 0) {
      const melhorDefesa = bestDefenses[0];
      if (melhorDefesa.team.id === teamId) {
        messages.push({
          emoji: '🧱',
          text: `Melhor Defesa! (${melhorDefesa.goalsAgainst} gols sofridos)`,
          color: 'bg-blue-100 text-blue-800 border-blue-300'
        });
      }
    }
    
    // Verifica pior defesa (frangueiro)
    if (worstDefenses && worstDefenses.length > 0) {
      const piorDefesa = worstDefenses[0];
      if (piorDefesa.team.id === teamId) {
        messages.push({
          emoji: '🐔',
          text: `Frangueiro! (${piorDefesa.goalsAgainst} gols sofridos)`,
          color: 'bg-red-100 text-red-800 border-red-300'
        });
      }
    }
    
    return messages;
  };

  return (
    <div className="min-h-screen bg-background masonic-pattern">
      {/* Header */}
      <Header />

      <main className="container py-8">
        {/* Search and Filter Section */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome ou loja..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={selectedGroup} onValueChange={setSelectedGroup}>
            <SelectTrigger className="w-full sm:w-[200px]">
              <SelectValue placeholder="Filtrar por grupo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os grupos</SelectItem>
              {groups?.map(group => (
                <SelectItem key={group.id} value={group.id.toString()}>
                  {group.name}
                </SelectItem>
              ))}
              <SelectItem value="none">Sem grupo</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Results count and view toggle */}
        {!isLoading && filteredTeams && (
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-muted-foreground">
              {filteredTeams.length} time{filteredTeams.length !== 1 ? 's' : ''} encontrado{filteredTeams.length !== 1 ? 's' : ''}
              {searchTerm && ` para "${searchTerm}"`}
            </p>
            <div className="flex gap-1">
              <Button
                variant={viewMode === "accordion" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("accordion")}
                title="Visualizar por grupos"
              >
                <List className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "grid" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("grid")}
                title="Visualizar em grade"
              >
                <LayoutGrid className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <Skeleton key={i} className="h-32 w-full" />
            ))}
          </div>
        ) : filteredTeams && filteredTeams.length > 0 ? (
          viewMode === "accordion" ? (
            <Accordion type="multiple" defaultValue={groups?.map(g => `group-${g.id}`) || []} className="space-y-4">
              {/* Times com grupo */}
              {groups?.map(group => {
                const groupTeams = filteredTeams.filter(t => t.groupId === group.id);
                if (groupTeams.length === 0) return null;
                return (
                  <AccordionItem key={group.id} value={`group-${group.id}`} className="border rounded-lg bg-card">
                    <AccordionTrigger className="px-4 py-3 hover:no-underline">
                      <div className="flex items-center gap-3">
                        <Trophy className="h-5 w-5 text-gold" />
                        <span className="font-bold text-lg">{group.name}</span>
                        <Badge variant="secondary">{groupTeams.length} times</Badge>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-4 pb-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {groupTeams.map(team => {
                          const stats = getTeamStats(team.id);
                          const specialMessages = getTeamSpecialMessage(team.id);
                          return (
                            <TeamCard key={team.id} team={team} stats={stats} specialMessages={specialMessages} getGroupName={getGroupName} />
                          );
                        })}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                );
              })}
              {/* Times sem grupo */}
              {filteredTeams.filter(t => !t.groupId).length > 0 && (
                <AccordionItem value="no-group" className="border rounded-lg bg-card">
                  <AccordionTrigger className="px-4 py-3 hover:no-underline">
                    <div className="flex items-center gap-3">
                      <Shield className="h-5 w-5 text-muted-foreground" />
                      <span className="font-bold text-lg">Sem Grupo</span>
                      <Badge variant="secondary">{filteredTeams.filter(t => !t.groupId).length} times</Badge>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-4 pb-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {filteredTeams.filter(t => !t.groupId).map(team => {
                        const stats = getTeamStats(team.id);
                        const specialMessages = getTeamSpecialMessage(team.id);
                        return (
                          <TeamCard key={team.id} team={team} stats={stats} specialMessages={specialMessages} getGroupName={getGroupName} />
                        );
                      })}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              )}
            </Accordion>
          ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTeams.map(team => {
              const stats = getTeamStats(team.id);
              const specialMessages = getTeamSpecialMessage(team.id);
              return (
                <TeamCard key={team.id} team={team} stats={stats} specialMessages={specialMessages} getGroupName={getGroupName} />
              );
            })}
          </div>
          )
        ) : filteredTeams && filteredTeams.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                {searchTerm || selectedGroup !== "all" 
                  ? "Nenhum time encontrado com os filtros aplicados" 
                  : "Nenhum time cadastrado ainda"}
              </p>
            </CardContent>
          </Card>
        ) : null}
      </main>

      <AudioPlayer />
    </div>
  );
}

// Componente TeamCard para reutilização
function TeamCard({ 
  team, 
  stats, 
  specialMessages, 
  getGroupName 
}: { 
  team: { id: number; name: string; lodge: string | null; logoUrl: string | null; groupId: number | null };
  stats: { aproveitamento: number; sequencia: ('W' | 'D' | 'L')[]; played: number };
  specialMessages: { emoji: string; text: string; color: string }[];
  getGroupName: (groupId: number | null) => string | null | undefined;
}) {
  const getSequenciaEmoji = (result: 'W' | 'D' | 'L') => {
    switch (result) {
      case 'W': return '🟢';
      case 'D': return '🟡';
      case 'L': return '🔴';
    }
  };

  const getSequenciaLabel = (result: 'W' | 'D' | 'L') => {
    switch (result) {
      case 'W': return 'Vitória';
      case 'D': return 'Empate';
      case 'L': return 'Derrota';
    }
  };

  return (
    <Link href={`/times/${team.id}`}>
      <Card className="card-hover cursor-pointer h-full card-shadow">
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            {team.logoUrl ? (
              <img 
                src={team.logoUrl} 
                alt={team.name}
                className="h-14 w-14 rounded-full object-cover border-2 border-primary flex-shrink-0"
              />
            ) : (
              <div className="h-14 w-14 rounded-full bg-muted flex items-center justify-center border-2 border-primary flex-shrink-0">
                <Shield className="h-7 w-7 text-muted-foreground" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h3 className="font-bold truncate">{team.name}</h3>
              {team.lodge && (
                <p className="text-sm text-muted-foreground truncate">{team.lodge}</p>
              )}
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                {team.groupId && (
                  <Badge variant="outline" className="text-xs">
                    {getGroupName(team.groupId)}
                  </Badge>
                )}
                {stats.played > 0 && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Badge 
                          variant="secondary" 
                          className={`text-xs ${
                            stats.aproveitamento >= 70 ? 'bg-green-100 text-green-800' :
                            stats.aproveitamento >= 40 ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}
                        >
                          <TrendingUp className="h-3 w-3 mr-1" />
                          {stats.aproveitamento}%
                        </Badge>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Aproveitamento em {stats.played} jogos</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
              </div>
              {/* Sequência de resultados */}
              {stats.sequencia.length > 0 && (
                <div className="flex items-center gap-0.5 mt-2">
                  <TooltipProvider>
                    {stats.sequencia.map((result, idx) => (
                      <Tooltip key={idx}>
                        <TooltipTrigger asChild>
                          <span className="text-xs cursor-help">{getSequenciaEmoji(result)}</span>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{getSequenciaLabel(result)}</p>
                        </TooltipContent>
                      </Tooltip>
                    ))}
                  </TooltipProvider>
                  {stats.sequencia.filter(r => r === 'W').length >= 3 && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="ml-1">🔥</span>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Em boa fase!</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                </div>
              )}
              {/* Mensagens especiais */}
              {specialMessages.length > 0 && (
                <div className="mt-2 space-y-1">
                  {specialMessages.map((msg, idx) => (
                    <div 
                      key={idx} 
                      className={`text-xs px-2 py-1 rounded border ${msg.color}`}
                    >
                      <span className="mr-1">{msg.emoji}</span>
                      {msg.text}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <ChevronRight className="h-5 w-5 text-muted-foreground flex-shrink-0" />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
