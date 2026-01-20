import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Header } from "@/components/Header";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { AudioPlayer } from "@/components/AudioPlayer";
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
  
  const { data: groups, isLoading: loadingGroups } = trpc.groups.list.useQuery();
  const { data: upcomingMatches, isLoading: loadingUpcoming } = trpc.matches.upcoming.useQuery({ limit: 5 });
  const { data: recentMatches, isLoading: loadingRecent } = trpc.matches.recent.useQuery({ limit: 5 });
  const { data: topScorers, isLoading: loadingScorers } = trpc.stats.topScorers.useQuery({ limit: 5 });
  const { data: topCarded, isLoading: loadingCarded } = trpc.stats.topCarded.useQuery({ limit: 5 });
  const { data: worstDefenses, isLoading: loadingDefenses } = trpc.stats.worstDefenses.useQuery({ limit: 3 });
  const { data: teams } = trpc.teams.list.useQuery();
  const { data: players } = trpc.players.list.useQuery();

  const getTeamName = (teamId: number) => {
    return teams?.find(t => t.id === teamId)?.name || "Time";
  };

  const getPlayerName = (playerId: number) => {
    return players?.find(p => p.id === playerId)?.name || "Jogador";
  };

  const formatMatchDate = (date: Date | null) => {
    if (!date) return "Data a definir";
    return format(new Date(date), "dd/MM - HH:mm", { locale: ptBR });
  };

  return (
    <div className="min-h-screen bg-background masonic-pattern">
      {/* Header */}
      <Header />

      {/* Hero Section */}
      <section className="bg-gold-gradient py-12">
        <div className="container text-center">
          <img 
            src="/logo-campeonato.jpg" 
            alt="Futebol Fraterno 2026" 
            className="mx-auto h-48 w-48 rounded-full object-cover border-4 border-white shadow-2xl mb-6"
          />
          <h2 className="text-4xl font-bold text-primary-foreground mb-2">
            Campeonato Fraterno 2026
          </h2>
          <p className="text-xl text-primary-foreground/80 mb-6">
            Organizado pela Loja José Moreira
          </p>
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
                        <div className="flex items-center gap-3">
                          <Badge variant="outline" className="text-xs">
                            {match.phase === "groups" ? `Rodada ${match.round}` : match.phase}
                          </Badge>
                          <span className="font-medium">{getTeamName(match.homeTeamId)}</span>
                          <span className="text-muted-foreground">vs</span>
                          <span className="font-medium">{getTeamName(match.awayTeamId)}</span>
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
                          <span className="font-medium flex-1 text-right">
                            {getTeamName(match.homeTeamId)}
                          </span>
                          <div className="flex items-center gap-2 px-4">
                            <span className="text-2xl font-bold text-gold-dark">
                              {match.homeScore}
                            </span>
                            <span className="text-muted-foreground">x</span>
                            <span className="text-2xl font-bold text-gold-dark">
                              {match.awayScore}
                            </span>
                          </div>
                          <span className="font-medium flex-1">
                            {getTeamName(match.awayTeamId)}
                          </span>
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
                  <div className="space-y-2">
                    {topScorers.map((scorer, index) => (
                      <div 
                        key={scorer.playerId} 
                        className="flex items-center justify-between p-2 rounded-lg hover:bg-muted transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <span className={`font-bold text-lg w-6 ${index < 3 ? "text-gold" : "text-muted-foreground"}`}>
                            {index + 1}º
                          </span>
                          <div>
                            <p className="font-medium">{getPlayerName(scorer.playerId)}</p>
                            <p className="text-xs text-muted-foreground">{getTeamName(scorer.teamId)}</p>
                          </div>
                        </div>
                        <Badge variant="default" className="bg-primary">
                          {scorer.goalCount} gols
                        </Badge>
                      </div>
                    ))}
                  </div>
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
                  <div className="space-y-2">
                    {topCarded.slice(0, 3).map((player, index) => (
                      <div 
                        key={player.playerId} 
                        className="flex items-center justify-between p-2 rounded-lg hover:bg-muted transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <span className="font-bold text-lg w-6 text-destructive">
                            {index + 1}º
                          </span>
                          <div>
                            <p className="font-medium">{getPlayerName(player.playerId)}</p>
                            <p className="text-xs text-muted-foreground">{getTeamName(player.teamId)}</p>
                          </div>
                        </div>
                        <div className="flex gap-1">
                          <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300">
                            {player.yellowCards} 🟨
                          </Badge>
                          <Badge variant="outline" className="bg-red-100 text-red-800 border-red-300">
                            {player.redCards} 🟥
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
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
                  <div className="space-y-2">
                    {worstDefenses.map((team, index) => (
                      <div 
                        key={team.team.id} 
                        className="flex items-center justify-between p-2 rounded-lg hover:bg-muted transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <span className="font-bold text-lg w-6 text-warning">
                            {index + 1}º
                          </span>
                          <p className="font-medium">{team.team.name}</p>
                        </div>
                        <Badge variant="outline" className="bg-orange-100 text-orange-800 border-orange-300">
                          {team.goalsAgainst} gols sofridos
                        </Badge>
                      </div>
                    ))}
                  </div>
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
                <BestDefenseSection />
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Comments Section */}
        <section className="mt-8">
          <CommentsSection />
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-secondary text-secondary-foreground py-8 mt-12">
        <div className="container text-center">
          <img 
            src="/logo-campeonato.jpg" 
            alt="Futebol Fraterno 2026" 
            className="mx-auto h-20 w-20 rounded-full object-cover border-2 border-primary mb-4"
          />
          <p className="text-gold font-bold text-lg mb-2">Futebol Fraterno 2026</p>
          <p className="text-muted-foreground text-sm">
            Organizado pela Loja José Moreira
          </p>
          <p className="text-muted-foreground text-xs mt-4">
            Respeito e União
          </p>
        </div>
      </footer>

      {/* Audio Player */}
      <AudioPlayer />
    </div>
  );
}

function BestDefenseSection() {
  const { data: bestDefenses, isLoading } = trpc.stats.bestDefenses.useQuery({ limit: 3 });
  const { data: teams } = trpc.teams.list.useQuery();

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
    <div className="space-y-2">
      {bestDefenses.map((team, index) => (
        <div 
          key={team.team.id} 
          className="flex items-center justify-between p-2 rounded-lg hover:bg-muted transition-colors"
        >
          <div className="flex items-center gap-3">
            <span className="font-bold text-lg w-6 text-success">
              {index + 1}º
            </span>
            <p className="font-medium">{team.team.name}</p>
          </div>
          <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">
            {team.goalsAgainst} gols sofridos
          </Badge>
        </div>
      ))}
    </div>
  );
}

function CommentsSection() {
  const { data: comments, isLoading, refetch } = trpc.comments.list.useQuery({ limit: 10 });
  const createComment = trpc.comments.create.useMutation({
    onSuccess: () => {
      refetch();
      setName("");
      setLodge("");
      setContent("");
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
        </form>

        {/* Comments List */}
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
        ) : comments && comments.length > 0 ? (
          <div className="space-y-4">
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
