import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Users, Search, User, Trophy, Target, AlertTriangle } from "lucide-react";
import { Header } from "@/components/Header";
import { AudioPlayer } from "@/components/AudioPlayer";
import { trpc } from "@/lib/trpc";
import { Link } from "wouter";

export default function Jogadores() {
  const { data: players, isLoading: playersLoading } = trpc.players.list.useQuery();
  const { data: teams } = trpc.teams.list.useQuery();
  const { data: groups } = trpc.groups.list.useQuery();
  const { data: goals } = trpc.goals.list.useQuery();
  const { data: cards } = trpc.cards.byMatch.useQuery({ matchId: 0 }, { enabled: false });

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGroup, setSelectedGroup] = useState<string>("all");
  const [selectedTeam, setSelectedTeam] = useState<string>("all");

  // Calcular estatísticas dos jogadores
  const playerStats = useMemo(() => {
    if (!players || !goals || !cards) return {};
    
    const stats: Record<number, { goals: number; yellowCards: number; redCards: number }> = {};
    
    players.forEach(p => {
      stats[p.id] = { goals: 0, yellowCards: 0, redCards: 0 };
    });
    
    goals?.forEach((g: { playerId: number | null }) => {
      if (g.playerId && stats[g.playerId]) {
        stats[g.playerId].goals++;
      }
    });
    
    return stats;
  }, [players, goals, cards]);

  // Filtrar times por grupo selecionado
  const filteredTeams = useMemo(() => {
    if (!teams) return [];
    if (selectedGroup === "all") return teams;
    return teams.filter(t => t.groupId?.toString() === selectedGroup);
  }, [teams, selectedGroup]);

  // Filtrar jogadores
  const filteredPlayers = useMemo(() => {
    if (!players) return [];
    
    return players.filter(player => {
      // Filtro por nome
      if (searchTerm && !player.name.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }
      
      // Filtro por time
      if (selectedTeam !== "all" && player.teamId?.toString() !== selectedTeam) {
        return false;
      }
      
      // Filtro por grupo (através do time)
      if (selectedGroup !== "all" && selectedTeam === "all") {
        const team = teams?.find(t => t.id === player.teamId);
        if (!team || team.groupId?.toString() !== selectedGroup) {
          return false;
        }
      }
      
      return true;
    });
  }, [players, searchTerm, selectedTeam, selectedGroup, teams]);

  // Ordenar por gols (artilheiros primeiro)
  const sortedPlayers = useMemo(() => {
    return [...filteredPlayers].sort((a, b) => {
      const goalsA = playerStats[a.id]?.goals || 0;
      const goalsB = playerStats[b.id]?.goals || 0;
      return goalsB - goalsA;
    });
  }, [filteredPlayers, playerStats]);

  const getTeamName = (teamId: number | null) => {
    if (!teamId) return "Sem time";
    return teams?.find(t => t.id === teamId)?.name || "Desconhecido";
  };

  const getTeamLodge = (teamId: number | null) => {
    if (!teamId) return "";
    return teams?.find(t => t.id === teamId)?.lodge || "";
  };

  const getGroupName = (teamId: number | null) => {
    if (!teamId) return "";
    const team = teams?.find(t => t.id === teamId);
    if (!team?.groupId) return "";
    return groups?.find(g => g.id === team.groupId)?.name || "";
  };

  // Encontrar artilheiro
  const topScorer = useMemo((): { player: { id: number; name: string }; goals: number } | null => {
    if (!players || !playerStats) return null;
    let maxGoals = 0;
    let scorer: { id: number; name: string } | null = null;
    players.forEach(p => {
      const goals = playerStats[p.id]?.goals || 0;
      if (goals > maxGoals) {
        maxGoals = goals;
        scorer = { id: p.id, name: p.name };
      }
    });
    return scorer && maxGoals > 0 ? { player: scorer, goals: maxGoals } : null;
  }, [players, playerStats]);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container py-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Users className="h-8 w-8 text-primary" />
              Jogadores
            </h1>
            <p className="text-muted-foreground">
              {players?.length || 0} jogadores cadastrados
            </p>
          </div>
          
          {/* Destaque do Artilheiro */}
          {topScorer && (
            <Card className="bg-gradient-to-r from-gold/20 to-gold-dark/20 border-gold">
              <CardContent className="py-3 px-4 flex items-center gap-3">
                <Trophy className="h-6 w-6 text-gold" />
                <div>
                  <p className="text-xs text-muted-foreground">Artilheiro</p>
                  <p className="font-bold">{topScorer.player.name} - {topScorer.goals} gols</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Filtros */}
        <Card className="mb-6">
          <CardContent className="py-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Busca por nome */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar jogador por nome..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              {/* Filtro por grupo */}
              <Select value={selectedGroup} onValueChange={(v) => { setSelectedGroup(v); setSelectedTeam("all"); }}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos os grupos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os grupos</SelectItem>
                  {groups?.map(g => (
                    <SelectItem key={g.id} value={g.id.toString()}>{g.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              {/* Filtro por time */}
              <Select value={selectedTeam} onValueChange={setSelectedTeam}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos os times" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os times</SelectItem>
                  {filteredTeams?.map(t => (
                    <SelectItem key={t.id} value={t.id.toString()}>{t.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Lista de Jogadores */}
        {playersLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map(i => <Skeleton key={i} className="h-32 w-full" />)}
          </div>
        ) : sortedPlayers.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                {searchTerm || selectedGroup !== "all" || selectedTeam !== "all"
                  ? "Nenhum jogador encontrado com os filtros aplicados"
                  : "Nenhum jogador cadastrado ainda"}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sortedPlayers.map(player => {
              const stats = playerStats[player.id] || { goals: 0, yellowCards: 0, redCards: 0 };
              const groupName = getGroupName(player.teamId);
              
              return (
                <Link key={player.id} href={`/jogadores/${player.id}`}>
                  <Card className="cursor-pointer hover:shadow-lg transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        {/* Foto ou Avatar */}
                        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center overflow-hidden flex-shrink-0">
                          {player.photoUrl ? (
                            <img 
                              src={player.photoUrl} 
                              alt={player.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <User className="h-8 w-8 text-muted-foreground" />
                          )}
                        </div>
                        
                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            {player.number && (
                              <Badge variant="outline" className="text-xs">
                                #{player.number}
                              </Badge>
                            )}
                            <h3 className="font-bold truncate">{player.name}</h3>
                          </div>
                          
                          <p className="text-sm text-muted-foreground truncate">
                            {getTeamName(player.teamId)}
                            {getTeamLodge(player.teamId) && ` (${getTeamLodge(player.teamId)})`}
                          </p>
                          
                          {groupName && (
                            <Badge variant="secondary" className="text-xs mt-1">
                              {groupName}
                            </Badge>
                          )}
                          
                          {/* Estatísticas */}
                          <div className="flex items-center gap-3 mt-2">
                            {stats.goals > 0 && (
                              <span className="flex items-center gap-1 text-sm">
                                <Target className="h-4 w-4 text-green-500" />
                                {stats.goals}
                              </span>
                            )}
                            {stats.yellowCards > 0 && (
                              <span className="flex items-center gap-1 text-sm">
                                <div className="w-3 h-4 bg-yellow-400 rounded-sm" />
                                {stats.yellowCards}
                              </span>
                            )}
                            {stats.redCards > 0 && (
                              <span className="flex items-center gap-1 text-sm">
                                <div className="w-3 h-4 bg-red-500 rounded-sm" />
                                {stats.redCards}
                              </span>
                            )}
                            {stats.goals === 0 && stats.yellowCards === 0 && stats.redCards === 0 && (
                              <span className="text-xs text-muted-foreground">Sem estatísticas</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}
      </main>

      <AudioPlayer />
    </div>
  );
}
