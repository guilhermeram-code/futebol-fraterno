import { useState, useEffect } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Header } from "@/components/Header";
import { trpc } from "@/lib/trpc";
import { useTournament } from "@/contexts/TournamentContext";
import { useMusic } from "@/contexts/MusicContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Layout } from "@/components/Layout";
import { Link } from "wouter";
import { 
  Trophy, 
  Users, 
  Calendar, 
  Target, 
  Shield, 
  AlertTriangle,
  ChevronRight,
  Star,
  Flame,
  Clock
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function Home() {
  const { user, isAuthenticated } = useAuth();
  const { settings, isLoading: loadingSettings, campaignId } = useTournament();
  const { setMusicUrl } = useMusic();

  // Atualizar URL da música quando as configurações carregarem
  useEffect(() => {
    if (settings.tournamentMusic) {
      setMusicUrl(settings.tournamentMusic);
    }
  }, [settings.tournamentMusic, setMusicUrl]);
  
  const { data: groups, isLoading: loadingGroups } = trpc.groups.list.useQuery({ campaignId });
  const { data: upcomingMatches, isLoading: loadingUpcoming } = trpc.matches.upcoming.useQuery({ limit: 5, campaignId });
  const { data: recentMatches, isLoading: loadingRecent } = trpc.matches.recent.useQuery({ limit: 5, campaignId });
  const { data: topScorers, isLoading: loadingScorers } = trpc.stats.topScorers.useQuery({ limit: 5, campaignId });
  const { data: topCarded, isLoading: loadingCarded } = trpc.stats.topCarded.useQuery({ limit: 5, campaignId });
  const { data: worstDefenses, isLoading: loadingDefenses } = trpc.stats.worstDefenses.useQuery({ limit: 3, campaignId });
  const { data: teams } = trpc.teams.list.useQuery({ campaignId });
  const { data: players } = trpc.players.list.useQuery({ campaignId });

  const getTeamName = (teamId: number) => {
    return teams?.find(t => t.id === teamId)?.name || "Time";
  };

  const getPlayerName = (playerId: number) => {
    return players?.find(p => p.id === playerId)?.name || "Jogador";
  };

  const getTeamLodge = (teamId: number) => {
    return teams?.find(t => t.id === teamId)?.lodge || "";
  };

  const getGroupName = (groupId: number | null) => {
    if (!groupId) return "";
    return groups?.find(g => g.id === groupId)?.name || "";
  };

  const { data: announcements } = trpc.announcements.active.useQuery({ campaignId });

  const formatMatchDate = (date: Date | null) => {
    if (!date) return "Data a definir";
    return format(new Date(date), "dd/MM - HH:mm", { locale: ptBR });
  };

  return (
    <Layout>
      {/* Header */}
      <Header />

      {/* Hero Section */}
      <section 
        className="py-12 relative"
        style={settings.heroBackground ? {
          backgroundImage: `url(${settings.heroBackground})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        } : undefined}
      >
        {/* Overlay para garantir legibilidade */}
        <div className={`absolute inset-0 ${settings.heroBackground ? 'bg-black/40' : 'bg-gold-gradient'}`} />
        <div className="container text-center relative z-10">
          {loadingSettings ? (
            <>
              <div className="mx-auto h-48 w-48 rounded-full border-4 border-white shadow-2xl mb-6 bg-muted animate-pulse" />
              <div className="h-10 w-96 mx-auto bg-muted animate-pulse rounded mb-2" />
              <div className="h-6 w-64 mx-auto bg-muted animate-pulse rounded mb-6" />
            </>
          ) : (
            <>
              <div className="mx-auto h-48 w-48 rounded-full border-4 border-white shadow-2xl mb-6 overflow-hidden bg-black flex items-center justify-center">
                <img 
                  src={`${settings.tournamentLogo}?v=${Date.now()}`} 
                  alt={settings.tournamentName} 
                  className="w-full h-full object-contain scale-90"
                />
              </div>
              <h2 className="text-4xl font-bold text-primary-foreground mb-2">
                {settings.tournamentName}
              </h2>
              <p className="text-xl text-primary-foreground/80 mb-6">
                {settings.tournamentOrganizer}
              </p>
            </>
          )}
          <div className="flex justify-center gap-4 flex-wrap">
            <Link href="/classificacao">
              <Button size="lg" variant="secondary" className="gap-2">
                <Trophy className="h-5 w-5" />
                Ver Classificação
              </Button>
            </Link>
            <Link href="/mata-mata">
              <Button size="lg" variant="outline" className="gap-2 bg-white/10 border-white text-white hover:bg-white/20">
                <Target className="h-5 w-5" />
                Chaves Mata-Mata
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Avisos Importantes */}
      {announcements && announcements.length > 0 && (
        <section className="bg-amber-50 dark:bg-amber-950/20 border-y border-amber-200 dark:border-amber-800 py-4">
          <div className="container">
            <div className="space-y-3">
              {announcements.map((announcement) => (
                <div key={announcement.id} className="flex items-start gap-3 p-4 bg-white dark:bg-gray-900 rounded-lg shadow-sm">
                  <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <h3 className="font-bold text-amber-900 dark:text-amber-100 mb-1">
                      {announcement.title}
                    </h3>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      {announcement.content}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Main Content */}
      <main className="container py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Próximos Jogos */}
          <div className="lg:col-span-2 space-y-6">
            {/* Próximos Jogos */}
            <Card className="card-hover">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-gold-dark">
                  <Clock className="h-5 w-5" />
                  Próximos Jogos
                </CardTitle>
                <Link href="/jogos">
                  <Button variant="ghost" size="sm" className="gap-1">
                    Ver todos <ChevronRight className="h-4 w-4" />
                  </Button>
                </Link>
              </CardHeader>
              <CardContent>
                {loadingUpcoming ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map(i => (
                      <Skeleton key={i} className="h-16 w-full" />
                    ))}
                  </div>
                ) : upcomingMatches && upcomingMatches.length > 0 ? (
                  <div className="space-y-3">
                    {upcomingMatches.map(match => (
                      <div 
                        key={match.id} 
                        className="flex items-center justify-between p-3 bg-muted rounded-lg hover:bg-muted/80 transition-colors"
                      >
                        <div className="flex flex-col gap-2 flex-1">
                          <Badge variant="outline" className="text-xs w-fit">
                            {match.phase === "groups" ? (getGroupName(match.groupId) ? `Fase de Grupos - ${getGroupName(match.groupId)}` : "Fase de Grupos") : 
                             match.phase === "round16" ? "Oitavas" :
                             match.phase === "quarters" ? "Quartas" :
                             match.phase === "semis" ? "Semi" :
                             match.phase === "final" ? "Final" : match.phase}
                          </Badge>
                          <div className="flex items-center gap-3">
                            <div className="flex-1 text-right">
                              <div className="font-medium">{getTeamName(match.homeTeamId)}</div>
                              <div className="text-xs text-muted-foreground">{getTeamLodge(match.homeTeamId)}</div>
                            </div>
                            <span className="text-muted-foreground">vs</span>
                            <div className="flex-1">
                              <div className="font-medium">{getTeamName(match.awayTeamId)}</div>
                              <div className="text-xs text-muted-foreground">{getTeamLodge(match.awayTeamId)}</div>
                            </div>
                          </div>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {formatMatchDate(match.matchDate)}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-8">
                    Nenhum jogo agendado
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Últimos Resultados */}
            <Card className="card-hover">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-gold-dark">
                  <Trophy className="h-5 w-5" />
                  Últimos Resultados
                </CardTitle>
                <Link href="/jogos">
                  <Button variant="ghost" size="sm" className="gap-1">
                    Ver todos <ChevronRight className="h-4 w-4" />
                  </Button>
                </Link>
              </CardHeader>
              <CardContent>
                {loadingRecent ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map(i => (
                      <Skeleton key={i} className="h-16 w-full" />
                    ))}
                  </div>
                ) : recentMatches && recentMatches.length > 0 ? (
                  <div className="space-y-3">
                    {recentMatches.map(match => (
                      <div 
                        key={match.id} 
                        className="flex items-center justify-between p-3 bg-muted rounded-lg"
                      >
                        <div className="flex items-center gap-3 flex-1">
                          <div className="flex-1 text-right">
                            <div className="font-medium">{getTeamName(match.homeTeamId)}</div>
                            <div className="text-xs text-muted-foreground">{getTeamLodge(match.homeTeamId)}</div>
                          </div>
                          <div className="flex items-center gap-2 px-4">
                            <span className="text-2xl font-bold text-gold-dark score-display">
                              {match.homeScore}
                            </span>
                            <span className="text-muted-foreground">x</span>
                            <span className="text-2xl font-bold text-gold-dark score-display">
                              {match.awayScore}
                            </span>
                          </div>
                          <div className="flex-1">
                            <div className="font-medium">{getTeamName(match.awayTeamId)}</div>
                            <div className="text-xs text-muted-foreground">{getTeamLodge(match.awayTeamId)}</div>
                          </div>
                        </div>
                        {match.penalties && (
                          <Badge variant="secondary" className="ml-2">
                            Pênaltis: {match.homePenalties} x {match.awayPenalties}
                          </Badge>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-8">
                    Nenhum resultado ainda
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Grupos */}
            <Card className="card-hover">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gold-dark">
                  <Users className="h-5 w-5" />
                  Grupos
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loadingGroups ? (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map(i => (
                      <Skeleton key={i} className="h-24 w-full" />
                    ))}
                  </div>
                ) : groups && groups.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {groups.map(group => (
                      <Link key={group.id} href={`/classificacao?grupo=${group.id}`}>
                        <div className="p-4 bg-muted rounded-lg text-center hover:bg-primary hover:text-primary-foreground transition-colors cursor-pointer">
                          <span className="font-bold text-lg">{group.name}</span>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-8">
                    Nenhum grupo cadastrado
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Rankings */}
          <div className="space-y-6">
            {/* Artilheiros */}
            <Card className="card-hover">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gold-dark">
                  <Target className="h-5 w-5" />
                  Artilheiros
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loadingScorers ? (
                  <div className="space-y-2">
                    {[1, 2, 3, 4, 5].map(i => (
                      <Skeleton key={i} className="h-10 w-full" />
                    ))}
                  </div>
                ) : topScorers && topScorers.length > 0 ? (
                  <>
                    {/* Mensagem comemorativa para o líder */}
                    {topScorers[0] && topScorers[0].goalCount >= 3 && (
                      <p className="text-xs text-center text-gold-dark italic mb-3 animate-pulse">
                        🔥 {getPlayerName(topScorers[0].playerId)} está voando! Artilheiro isolado!
                      </p>
                    )}
                    <div className="space-y-2">
                      {topScorers.map((scorer, index) => (
                        <div 
                          key={scorer.playerId} 
                          className={`flex items-center justify-between p-2 rounded-lg hover:bg-muted transition-colors ${index === 0 ? 'bg-gold/10 border border-gold/30' : ''}`}
                        >
                          <div className="flex items-center gap-3">
                            <span className={`font-bold text-lg w-6 ${index < 3 ? "text-gold" : "text-muted-foreground"}`}>
                              {index + 1}º
                            </span>
                            <div>
                              <p className="font-medium">
                                {getPlayerName(scorer.playerId)}
                                {index === 0 && " 👑"}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {getTeamName(scorer.teamId)}
                                {getTeamLodge(scorer.teamId) && ` - ${getTeamLodge(scorer.teamId)}`}
                              </p>
                            </div>
                          </div>
                          <Badge variant="default" className="bg-primary">
                            {scorer.goalCount} gols
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <p className="text-center text-muted-foreground py-4">
                    Nenhum gol marcado
                  </p>
                )}
                <Link href="/estatisticas">
                  <Button variant="ghost" className="w-full mt-4 gap-1">
                    Ver ranking completo <ChevronRight className="h-4 w-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Maior Quebrador */}
            <Card className="card-hover border-destructive/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-destructive">
                  <AlertTriangle className="h-5 w-5" />
                  Maior Quebrador
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loadingCarded ? (
                  <div className="space-y-2">
                    {[1, 2, 3].map(i => (
                      <Skeleton key={i} className="h-10 w-full" />
                    ))}
                  </div>
                ) : topCarded && topCarded.length > 0 ? (
                  <>
                    {/* Mensagem brincalhona para o líder */}
                    {topCarded[0] && (topCarded[0].redCards >= 2 || topCarded[0].yellowCards >= 4) && (
                      <p className="text-xs text-center text-destructive italic mb-3">
                        ⚠️ {getPlayerName(topCarded[0].playerId)} precisa se acalmar! Vai quebrar alguém!
                      </p>
                    )}
                    <div className="space-y-2">
                      {topCarded.slice(0, 3).map((player, index) => (
                        <div 
                          key={player.playerId} 
                          className={`flex items-center justify-between p-2 rounded-lg hover:bg-muted transition-colors ${index === 0 ? 'bg-destructive/10 border border-destructive/30' : ''}`}
                        >
                          <div className="flex items-center gap-3">
                            <span className="font-bold text-lg w-6 text-destructive">
                              {index + 1}º
                            </span>
                            <div>
                              <p className="font-medium">
                                {getPlayerName(player.playerId)}
                                {index === 0 && " 💢"}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {getTeamName(player.teamId)}
                                {getTeamLodge(player.teamId) && ` - ${getTeamLodge(player.teamId)}`}
                              </p>
                            </div>
                          </div>
                          <div className="flex gap-1">
                            <Badge variant="outline" className="bg-red-100 text-red-800 border-red-300">
                              {player.redCards} 🟥
                            </Badge>
                            <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300">
                              {player.yellowCards} 🟨
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <p className="text-center text-muted-foreground py-4">
                    Nenhum cartão registrado
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Frangueiro */}
            <Card className="card-hover border-warning/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-warning">
                  <Flame className="h-5 w-5" />
                  Frangueiro (Pior Defesa)
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loadingDefenses ? (
                  <div className="space-y-2">
                    {[1, 2, 3].map(i => (
                      <Skeleton key={i} className="h-10 w-full" />
                    ))}
                  </div>
                ) : worstDefenses && worstDefenses.length > 0 ? (
                  <>
                    {/* Mensagem brincalhona para o líder */}
                    {worstDefenses[0] && worstDefenses[0].goalsAgainst >= 5 && (
                      <p className="text-xs text-center text-warning italic mb-3">
                        🐔 {worstDefenses[0].team.name} tá tomando de todo lado! Fecha o gol!
                      </p>
                    )}
                    <div className="space-y-2">
                      {worstDefenses.map((team, index) => (
                        <div 
                          key={team.team.id} 
                          className={`flex items-center justify-between p-2 rounded-lg hover:bg-muted transition-colors ${index === 0 ? 'bg-warning/10 border border-warning/30' : ''}`}
                        >
                          <div className="flex items-center gap-3">
                            <span className="font-bold text-lg w-6 text-warning">
                              {index + 1}º
                            </span>
                            <div>
                              <p className="font-medium">
                                {team.team.name}
                                {index === 0 && " 🐔"}
                              </p>
                              <p className="text-xs text-muted-foreground">{team.team.lodge}</p>
                            </div>
                          </div>
                          <Badge variant="outline" className="bg-orange-100 text-orange-800 border-orange-300">
                            {team.goalsAgainst} gols sofridos
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <p className="text-center text-muted-foreground py-4">
                    Nenhum jogo realizado
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Melhor Defesa */}
            <Card className="card-hover border-success/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-success">
                  <Shield className="h-5 w-5" />
                  Melhor Defesa
                </CardTitle>
              </CardHeader>
              <CardContent>
                <BestDefenseSection campaignId={campaignId} />
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Sponsors Section */}
        <section className="mt-8">
          <SponsorsSection campaignId={campaignId} />
        </section>

        {/* Comments Section */}
        <section className="mt-8">
          <CommentsSection campaignId={campaignId} />
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-secondary text-secondary-foreground py-8 mt-12">
        <div className="container text-center">
          {loadingSettings ? (
            <>
              <div className="mx-auto h-20 w-20 rounded-full bg-muted animate-pulse border-2 border-primary mb-4" />
              <div className="h-6 w-64 mx-auto bg-muted animate-pulse rounded mb-2" />
              <div className="h-4 w-48 mx-auto bg-muted animate-pulse rounded" />
              <div className="h-3 w-40 mx-auto bg-muted animate-pulse rounded mt-4" />
            </>
          ) : (
            <>
              <img 
                src={`${settings.tournamentLogo}?v=${Date.now()}`} 
                alt={settings.tournamentName} 
                className="mx-auto h-20 w-20 rounded-full object-cover border-2 border-primary mb-4"
              />
              <p className="text-gold font-bold text-lg mb-2">{settings.tournamentName}</p>
              <p className="text-muted-foreground text-sm">
                {settings.tournamentOrganizer}
              </p>
              <p className="text-muted-foreground text-xs mt-4">
                {settings.tournamentSubtitle}
              </p>
            </>
          )}
        </div>
      </footer>

    </Layout>
  );
}

function BestDefenseSection({ campaignId }: { campaignId: number }) {
  const { data: bestDefenses, isLoading } = trpc.stats.bestDefenses.useQuery({ limit: 3, campaignId });
  const { data: teams } = trpc.teams.list.useQuery({ campaignId });

  if (isLoading) {
    return (
      <div className="space-y-2">
        {[1, 2, 3].map(i => (
          <Skeleton key={i} className="h-10 w-full" />
        ))}
      </div>
    );
  }

  if (!bestDefenses || bestDefenses.length === 0) {
    return (
      <p className="text-center text-muted-foreground py-4">
        Nenhum jogo realizado
      </p>
    );
  }

  return (
    <>
      {/* Mensagem comemorativa para o líder */}
      {bestDefenses[0] && bestDefenses[0].goalsAgainst <= 2 && (
        <p className="text-xs text-center text-success italic mb-3">
          🧤 {bestDefenses[0].team.name} é uma muralha! Defesa impenetrável!
        </p>
      )}
      <div className="space-y-2">
        {bestDefenses.map((team, index) => (
          <div 
            key={team.team.id} 
            className={`flex items-center justify-between p-2 rounded-lg hover:bg-muted transition-colors ${index === 0 ? 'bg-success/10 border border-success/30' : ''}`}
          >
            <div className="flex items-center gap-3">
              <span className="font-bold text-lg w-6 text-success">
                {index + 1}º
              </span>
              <div>
                <p className="font-medium">
                  {team.team.name}
                  {index === 0 && " 🧤"}
                </p>
                <p className="text-xs text-muted-foreground">{team.team.lodge}</p>
              </div>
            </div>
            <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">
              {team.goalsAgainst} gols sofridos
            </Badge>
          </div>
        ))}
      </div>
    </>
  );
}

function CommentsSection({ campaignId }: { campaignId: number }) {
  const { data: comments, isLoading, refetch } = trpc.comments.list.useQuery({ limit: 10, campaignId });
  const [showPendingMessage, setShowPendingMessage] = useState(false);
  const createComment = trpc.comments.create.useMutation({
    onSuccess: () => {
      setName("");
      setLodge("");
      setContent("");
      setShowPendingMessage(true);
      setTimeout(() => setShowPendingMessage(false), 5000);
    }
  });

  const [name, setName] = useState("");
  const [lodge, setLodge] = useState("");
  const [content, setContent] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !content.trim()) return;
    createComment.mutate({
      authorName: name,
      authorLodge: lodge || undefined,
      content
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-gold-dark">
          <Star className="h-5 w-5" />
          Comentários da Torcida
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Comment Form */}
        <form onSubmit={handleSubmit} className="mb-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Seu nome *"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary"
              required
            />
            <input
              type="text"
              placeholder="Sua loja (opcional)"
              value={lodge}
              onChange={(e) => setLodge(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <textarea
            placeholder="Deixe seu comentário... *"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={3}
            className="w-full px-4 py-2 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary resize-none"
            required
          />
          <Button 
            type="submit" 
            className="w-full md:w-auto"
            disabled={createComment.isPending}
          >
            {createComment.isPending ? "Enviando..." : "Enviar Comentário"}
          </Button>
          
          {showPendingMessage && (
            <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-amber-800 text-sm font-medium">
                ✅ Comentário enviado! Aguardando aprovação do administrador.
              </p>
            </div>
          )}
        </form>

        {/* Comments List */}
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
        ) : comments && comments.length > 0 ? (
          <div className={`space-y-4 ${comments.length > 5 ? 'max-h-[400px] overflow-y-auto pr-2' : ''}`}>
            {comments.map(comment => (
              <div key={comment.id} className="p-4 bg-muted rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-bold">{comment.authorName}</span>
                  {comment.authorLodge && (
                    <Badge variant="outline" className="text-xs">
                      {comment.authorLodge}
                    </Badge>
                  )}
                  <span className="text-xs text-muted-foreground ml-auto">
                    {format(new Date(comment.createdAt), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                  </span>
                </div>
                <p className="text-sm">{comment.content}</p>
              </div>
            ))}
            {comments.length > 5 && (
              <p className="text-center text-xs text-muted-foreground py-2">
                ↑ Role para ver mais comentários
              </p>
            )}
          </div>
        ) : (
          <p className="text-center text-muted-foreground py-8">
            Seja o primeiro a comentar!
          </p>
        )}
      </CardContent>
    </Card>
  );
}


function SponsorsSection({ campaignId }: { campaignId: number }) {
  const { data: sponsors, isLoading } = trpc.sponsors.list.useQuery({ campaignId });
  const { data: sponsorMessage } = trpc.settings.get.useQuery({ key: "sponsorMessage", campaignId });

  // Separar por nível
  const tierA = sponsors?.filter(s => s.tier === "A") || [];
  const tierB = sponsors?.filter(s => s.tier === "B") || [];
  const tierC = sponsors?.filter(s => s.tier === "C") || [];

  // Se não há patrocinadores, não mostrar a seção
  if (!isLoading && (!sponsors || sponsors.length === 0)) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-gold-dark text-center justify-center">
          <Star className="h-5 w-5" />
          Nossos Patrocinadores
        </CardTitle>
        {sponsorMessage && (
          <p className="text-center text-muted-foreground text-sm">
            {sponsorMessage}
          </p>
        )}
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center gap-4">
            {[1, 2, 3].map(i => (
              <Skeleton key={i} className="h-24 w-24" />
            ))}
          </div>
        ) : (
          <div className="space-y-8">
            {/* Tier A - Patrocinadores Principais */}
            {tierA.length > 0 && (
              <div>
                <Badge className="mb-4 mx-auto block w-fit bg-gold text-black">
                  Patrocinadores Principais
                </Badge>
                <div className="flex flex-wrap justify-center gap-6">
                  {tierA.map(sponsor => {
                    const link = sponsor.link 
                      ? (sponsor.link.startsWith('http') ? sponsor.link : `https://${sponsor.link}`)
                      : "#";
                    return (
                      <a 
                        key={sponsor.id}
                        href={link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group"
                        onClick={(e) => link === "#" && e.preventDefault()}
                      >
                        <div className="w-40 h-40 rounded-lg border-2 border-gold bg-white p-4 flex items-center justify-center transition-transform group-hover:scale-105 shadow-lg">
                          {sponsor.logoUrl ? (
                            <img 
                              src={sponsor.logoUrl} 
                              alt={sponsor.name}
                              className="max-w-full max-h-full object-contain"
                            />
                          ) : (
                            <span className="text-lg font-bold text-center">{sponsor.name}</span>
                          )}
                        </div>
                        <p className="text-center text-sm font-medium mt-2">{sponsor.name}</p>
                        {sponsor.description && (
                          <p className="text-center text-xs text-muted-foreground mt-1 max-w-[160px]">{sponsor.description}</p>
                        )}
                      </a>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Tier B - Patrocinadores */}
            {tierB.length > 0 && (
              <div>
                <Badge variant="secondary" className="mb-4 mx-auto block w-fit">
                  Patrocinadores
                </Badge>
                <div className="flex flex-wrap justify-center gap-4">
                  {tierB.map(sponsor => {
                    const link = sponsor.link 
                      ? (sponsor.link.startsWith('http') ? sponsor.link : `https://${sponsor.link}`)
                      : "#";
                    return (
                      <a 
                        key={sponsor.id}
                        href={link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group"
                        onClick={(e) => link === "#" && e.preventDefault()}
                      >
                        <div className="w-28 h-28 rounded-lg border bg-white p-3 flex items-center justify-center transition-transform group-hover:scale-105 shadow">
                          {sponsor.logoUrl ? (
                            <img 
                              src={sponsor.logoUrl} 
                              alt={sponsor.name}
                              className="max-w-full max-h-full object-contain"
                            />
                          ) : (
                            <span className="text-sm font-medium text-center">{sponsor.name}</span>
                          )}
                        </div>
                        <p className="text-center text-xs mt-1">{sponsor.name}</p>
                        {sponsor.description && (
                          <p className="text-center text-xs text-muted-foreground max-w-[120px]">{sponsor.description}</p>
                        )}
                      </a>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Tier C - Apoiadores */}
            {tierC.length > 0 && (
              <div>
                <Badge variant="outline" className="mb-4 mx-auto block w-fit">
                  Apoiadores
                </Badge>
                <div className="flex flex-wrap justify-center gap-3">
                  {tierC.map(sponsor => {
                    const link = sponsor.link 
                      ? (sponsor.link.startsWith('http') ? sponsor.link : `https://${sponsor.link}`)
                      : "#";
                    return (
                      <a 
                        key={sponsor.id}
                        href={link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group"
                        onClick={(e) => link === "#" && e.preventDefault()}
                      >
                        <div className="w-20 h-20 rounded border bg-white p-2 flex items-center justify-center transition-transform group-hover:scale-105">
                          {sponsor.logoUrl ? (
                            <img 
                              src={sponsor.logoUrl} 
                              alt={sponsor.name}
                              className="max-w-full max-h-full object-contain"
                            />
                          ) : (
                            <span className="text-xs text-center">{sponsor.name}</span>
                          )}
                        </div>
                      </a>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
