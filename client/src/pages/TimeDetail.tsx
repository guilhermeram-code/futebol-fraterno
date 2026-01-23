import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Header } from "@/components/Header";
import { Link, useParams } from "wouter";
import { useCampaign } from "@/App";
import { Users, Shield, Trophy, Target, Calendar, Award, ShieldCheck, ShieldX, MessageCircle, Send, Heart } from "lucide-react";
import { AudioPlayer } from "@/components/AudioPlayer";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { useTournament } from "@/contexts/TournamentContext";

export default function TimeDetail() {
  const { slug } = useCampaign();
  const { campaignId } = useTournament();
  const params = useParams<{ id: string }>();
  const teamId = parseInt(params.id || "0");

  const { data: team, isLoading: loadingTeam } = trpc.teams.byId.useQuery({ id: teamId, campaignId });
  const { data: stats, isLoading: loadingStats } = trpc.teams.stats.useQuery({ id: teamId, campaignId });
  const { data: statsGroupOnly } = trpc.teams.statsGroupOnly.useQuery({ id: teamId, campaignId });
  const { data: statsKnockoutOnly } = trpc.teams.statsKnockoutOnly.useQuery({ id: teamId, campaignId });
  const { data: players, isLoading: loadingPlayers } = trpc.players.byTeam.useQuery({ teamId, campaignId });
  const { data: matches, isLoading: loadingMatches } = trpc.matches.byTeam.useQuery({ teamId, campaignId });
  const { data: allTeams } = trpc.teams.list.useQuery({ campaignId });
  const { data: groups } = trpc.groups.list.useQuery({ campaignId });
  const { data: topScorers } = trpc.goals.topScorers.useQuery({ limit: 100, campaignId });
  const { data: allPlayers } = trpc.players.list.useQuery({ campaignId });
  const { data: bestDefenses } = trpc.stats.bestDefenses.useQuery({ limit: 100, campaignId });
  const { data: worstDefenses } = trpc.stats.worstDefenses.useQuery({ limit: 100, campaignId });
  const { data: supportMessages, refetch: refetchMessages } = trpc.supportMessages.byTeam.useQuery({ teamId, campaignId });

  const [showMessageForm, setShowMessageForm] = useState(false);
  const [authorName, setAuthorName] = useState("");
  const [authorLodge, setAuthorLodge] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const createMessage = trpc.supportMessages.create.useMutation({
    onSuccess: () => {
      toast.success("Mensagem enviada! Aguarde aprovação do administrador.");
      setShowMessageForm(false);
      setAuthorName("");
      setAuthorLodge("");
      setMessage("");
      refetchMessages();
    },
    onError: () => {
      toast.error("Erro ao enviar mensagem. Tente novamente.");
    },
  });

  const handleSubmitMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authorName.trim() || !message.trim()) {
      toast.error("Preencha seu nome e a mensagem.");
      return;
    }
    setSubmitting(true);
    try {
      await createMessage.mutateAsync({
        teamId,
        authorName: authorName.trim(),
        authorLodge: authorLodge.trim() || undefined,
        message: message.trim(),
      });
    } finally {
      setSubmitting(false);
    }
  };

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

  // Encontrar artilheiro do time
  const teamTopScorer = useMemo(() => {
    if (!topScorers || !players || !allPlayers) return null;
    
    // Filtrar apenas jogadores deste time
    const teamPlayerIds = players.map(p => p.id);
    const teamScorers = topScorers.filter(s => teamPlayerIds.includes(s.playerId));
    
    if (teamScorers.length === 0) return null;
    
    // Pegar o maior artilheiro do time
    const topTeamScorer = teamScorers[0];
    const player = allPlayers.find(p => p.id === topTeamScorer.playerId);
    
    if (!player) return null;
    
    return {
      player,
      goals: topTeamScorer.goalCount
    };
  }, [topScorers, players, allPlayers]);

  // Verificar se o time é a melhor defesa do campeonato
  const isBestDefense = useMemo(() => {
    if (!bestDefenses || bestDefenses.length === 0) return false;
    return bestDefenses[0].team?.id === teamId;
  }, [bestDefenses, teamId]);

  // Verificar se o time é a pior defesa do campeonato (frangueiro)
  const isWorstDefense = useMemo(() => {
    if (!worstDefenses || worstDefenses.length === 0) return false;
    return worstDefenses[0].team?.id === teamId;
  }, [worstDefenses, teamId]);

  // Verificar se o artilheiro do time é o artilheiro do campeonato
  const isTopScorerOfChampionship = useMemo(() => {
    if (!topScorers || topScorers.length === 0 || !teamTopScorer) return false;
    return topScorers[0].playerId === teamTopScorer.player.id;
  }, [topScorers, teamTopScorer]);

  // Mensagens comemorativas
  const getTopScorerMessage = () => {
    if (!teamTopScorer) return null;
    
    if (isTopScorerOfChampionship) {
      return `🏆 ${teamTopScorer.player.name} é o ARTILHEIRO DO CAMPEONATO com ${teamTopScorer.goals} gols! Que craque!`;
    }
    return `⚽ ${teamTopScorer.player.name} é o artilheiro do time com ${teamTopScorer.goals} gol${teamTopScorer.goals > 1 ? 's' : ''}!`;
  };

  const getBestDefenseMessage = () => {
    if (!isBestDefense) return null;
    const goalsAgainst = bestDefenses?.[0]?.goalsAgainst || 0;
    return `🛡️ MELHOR DEFESA DO CAMPEONATO! Apenas ${goalsAgainst} gol${goalsAgainst !== 1 ? 's' : ''} sofrido${goalsAgainst !== 1 ? 's' : ''}. Muralha impenetrável!`;
  };

  const getWorstDefenseMessage = () => {
    if (!isWorstDefense) return null;
    const goalsAgainst = worstDefenses?.[0]?.goalsAgainst || 0;
    return `🥅 Ops... ${goalsAgainst} gols sofridos. O goleiro está precisando de óculos! 👓`;
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

  const hasAchievements = teamTopScorer || isBestDefense || isWorstDefense;

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
                  {/* Mensagem de Apoio do Admin */}
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

        {/* Conquistas e Destaques */}
        {hasAchievements && (
          <div className="mb-6">
            <Card className="border-gold/30 bg-gradient-to-r from-gold/5 to-gold/10">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-gold-dark">
                  <Award className="h-5 w-5" />
                  Conquistas e Destaques
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {/* Artilheiro do Time */}
                  {teamTopScorer && (
                    <div className={`p-4 rounded-lg ${isTopScorerOfChampionship ? 'bg-gradient-to-r from-yellow-100 to-amber-100 border-2 border-yellow-400' : 'bg-green-50 border border-green-200'}`}>
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-full ${isTopScorerOfChampionship ? 'bg-yellow-400' : 'bg-green-500'}`}>
                          <Target className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <p className={`font-bold ${isTopScorerOfChampionship ? 'text-yellow-800' : 'text-green-800'}`}>
                            {isTopScorerOfChampionship ? '🏆 ARTILHEIRO DO CAMPEONATO' : '⚽ Artilheiro do Time'}
                          </p>
                          <p className={`text-sm ${isTopScorerOfChampionship ? 'text-yellow-700' : 'text-green-700'}`}>
                            {getTopScorerMessage()}
                          </p>
                          <Link href={`/${slug}/jogadores/${teamTopScorer.player.id}`}>
                            <span className="text-xs text-primary hover:underline cursor-pointer">
                              Ver estatísticas do jogador →
                            </span>
                          </Link>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Melhor Defesa */}
                  {isBestDefense && (
                    <div className="p-4 rounded-lg bg-gradient-to-r from-blue-100 to-cyan-100 border-2 border-blue-400">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-full bg-blue-500">
                          <ShieldCheck className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <p className="font-bold text-blue-800">🛡️ MELHOR DEFESA DO CAMPEONATO</p>
                          <p className="text-sm text-blue-700">
                            {getBestDefenseMessage()}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Pior Defesa (Frangueiro) */}
                  {isWorstDefense && (
                    <div className="p-4 rounded-lg bg-gradient-to-r from-red-50 to-orange-50 border border-red-200">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-full bg-red-400">
                          <ShieldX className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <p className="font-bold text-red-700">🥅 Frangueiro</p>
                          <p className="text-sm text-red-600">
                            {getWorstDefenseMessage()}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

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
                    {players.map(player => {
                      const isTopScorer = teamTopScorer?.player.id === player.id;
                      return (
                        <Link key={player.id} href={`/${slug}/jogadores/${player.id}`}>
                          <div 
                            className={`flex items-center gap-3 p-2 rounded-lg hover:bg-muted transition-colors cursor-pointer ${isTopScorer ? 'bg-yellow-50 border border-yellow-200' : ''}`}
                          >
                            <div className={`h-10 w-10 rounded-full flex items-center justify-center ${isTopScorer ? 'bg-yellow-400' : 'bg-primary/10'}`}>
                              <span className={`font-bold ${isTopScorer ? 'text-white' : 'text-primary'}`}>
                                {player.number || "-"}
                              </span>
                            </div>
                            <div className="flex-1">
                              <p className="font-medium flex items-center gap-1">
                                {player.name}
                                {isTopScorer && <Target className="h-4 w-4 text-yellow-600" />}
                              </p>
                              {player.position && (
                                <p className="text-xs text-muted-foreground">{player.position}</p>
                              )}
                            </div>
                            {isTopScorer && (
                              <Badge className="bg-yellow-400 text-yellow-900">
                                {teamTopScorer.goals} gols
                              </Badge>
                            )}
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-4">
                    Nenhum jogador cadastrado
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Mensagens de Apoio da Torcida */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gold-dark">
                  <Heart className="h-5 w-5 text-red-500" />
                  Mensagens da Torcida
                </CardTitle>
              </CardHeader>
              <CardContent>
                {/* Formulário para enviar mensagem */}
                {!showMessageForm ? (
                  <Button 
                    variant="outline" 
                    className="w-full mb-4 border-gold text-gold hover:bg-gold/10"
                    onClick={() => setShowMessageForm(true)}
                  >
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Enviar mensagem de apoio
                  </Button>
                ) : (
                  <form onSubmit={handleSubmitMessage} className="mb-4 p-4 bg-muted rounded-lg space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <Input
                        placeholder="Seu nome *"
                        value={authorName}
                        onChange={(e) => setAuthorName(e.target.value)}
                        required
                      />
                      <Input
                        placeholder="Seu time (opcional)"
                        value={authorLodge}
                        onChange={(e) => setAuthorLodge(e.target.value)}
                      />
                    </div>
                    <Textarea
                      placeholder="Escreva sua mensagem de apoio ao time... (máx. 500 caracteres)"
                      value={message}
                      onChange={(e) => setMessage(e.target.value.slice(0, 500))}
                      required
                      rows={3}
                    />
                    <p className="text-xs text-muted-foreground">
                      {message.length}/500 caracteres • Sua mensagem será exibida após aprovação do administrador
                    </p>
                    <div className="flex gap-2">
                      <Button type="submit" disabled={submitting} className="bg-gold hover:bg-gold-dark">
                        <Send className="h-4 w-4 mr-2" />
                        {submitting ? "Enviando..." : "Enviar"}
                      </Button>
                      <Button 
                        type="button" 
                        variant="ghost" 
                        onClick={() => {
                          setShowMessageForm(false);
                          setAuthorName("");
                          setAuthorLodge("");
                          setMessage("");
                        }}
                      >
                        Cancelar
                      </Button>
                    </div>
                  </form>
                )}

                {/* Lista de mensagens aprovadas */}
                {supportMessages && supportMessages.length > 0 ? (
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {supportMessages.map(msg => (
                      <div key={msg.id} className="p-3 bg-gradient-to-r from-gold/5 to-gold/10 rounded-lg border border-gold/20">
                        <p className="text-sm mb-2">"{msg.message}"</p>
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span className="font-medium">
                            — {msg.authorName}
                            {msg.authorLodge && ` (${msg.authorLodge})`}
                          </span>
                          <span>
                            {format(new Date(msg.createdAt), "dd/MM/yyyy", { locale: ptBR })}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-4">
                    Nenhuma mensagem ainda. Seja o primeiro a apoiar o time!
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
