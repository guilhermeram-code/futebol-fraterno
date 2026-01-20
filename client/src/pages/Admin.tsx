import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Link, useLocation } from "wouter";
import { toast } from "sonner";
import { 
  ArrowLeft, 
  Plus, 
  Trash2, 
  Edit, 
  Users, 
  Shield, 
  Calendar, 
  Target,
  AlertTriangle,
  Image,
  MessageSquare,
  Trophy,
  Upload,
  Bell,
  UserPlus,
  Settings
} from "lucide-react";
import { getLoginUrl } from "@/const";
import { ResultsRegistration } from "@/components/ResultsRegistration";

export default function Admin() {
  const { user, isAuthenticated, loading } = useAuth();
  const [, setLocation] = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Skeleton className="h-12 w-12 rounded-full mx-auto mb-4" />
          <Skeleton className="h-4 w-32 mx-auto" />
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="py-8 text-center">
            <Shield className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-xl font-bold mb-2">Acesso Restrito</h2>
            <p className="text-muted-foreground mb-4">
              Você precisa fazer login para acessar o painel administrativo.
            </p>
            <Button onClick={() => window.location.href = getLoginUrl()}>
              Fazer Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (user?.role !== "admin") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="py-8 text-center">
            <AlertTriangle className="h-12 w-12 mx-auto text-destructive mb-4" />
            <h2 className="text-xl font-bold mb-2">Acesso Negado</h2>
            <p className="text-muted-foreground mb-4">
              Você não tem permissão para acessar esta página.
            </p>
            <Link href="/">
              <Button>Voltar para Home</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-secondary text-secondary-foreground">
        <div className="container py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/">
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              </Link>
              <img 
                src="/logo-campeonato.jpg" 
                alt="Futebol Fraterno 2026" 
                className="h-12 w-12 rounded-full object-cover border-2 border-primary"
              />
              <div>
                <h1 className="text-xl font-bold text-gold">Painel Administrativo</h1>
                <p className="text-sm text-muted-foreground">Gerenciar Campeonato</p>
              </div>
            </div>
            <Badge variant="outline" className="text-gold border-gold">
              Admin: {user.name || user.email}
            </Badge>
          </div>
        </div>
      </header>

      <main className="container py-8">
        <Tabs defaultValue="teams" className="w-full">
          <TabsList className="grid w-full grid-cols-10 mb-6">
            <TabsTrigger value="teams" className="gap-1 text-xs">
              <Shield className="h-4 w-4 hidden md:block" />
              Times
            </TabsTrigger>
            <TabsTrigger value="players" className="gap-1 text-xs">
              <Users className="h-4 w-4 hidden md:block" />
              Jogadores
            </TabsTrigger>
            <TabsTrigger value="groups" className="gap-1 text-xs">
              <Trophy className="h-4 w-4 hidden md:block" />
              Grupos
            </TabsTrigger>
            <TabsTrigger value="matches" className="gap-1 text-xs">
              <Calendar className="h-4 w-4 hidden md:block" />
              Jogos
            </TabsTrigger>
            <TabsTrigger value="results" className="gap-1 text-xs">
              <Target className="h-4 w-4 hidden md:block" />
              Resultados
            </TabsTrigger>
            <TabsTrigger value="photos" className="gap-1 text-xs">
              <Image className="h-4 w-4 hidden md:block" />
              Fotos
            </TabsTrigger>
            <TabsTrigger value="comments" className="gap-1 text-xs">
              <MessageSquare className="h-4 w-4 hidden md:block" />
              Comentários
            </TabsTrigger>
            <TabsTrigger value="announcements" className="gap-1 text-xs">
              <Bell className="h-4 w-4 hidden md:block" />
              Avisos
            </TabsTrigger>
            <TabsTrigger value="admins" className="gap-1 text-xs">
              <UserPlus className="h-4 w-4 hidden md:block" />
              Admins
            </TabsTrigger>
            <TabsTrigger value="settings" className="gap-1 text-xs">
              <Settings className="h-4 w-4 hidden md:block" />
              Configurações
            </TabsTrigger>
          </TabsList>

          <TabsContent value="teams">
            <TeamsTab />
          </TabsContent>

          <TabsContent value="players">
            <PlayersTab />
          </TabsContent>

          <TabsContent value="groups">
            <GroupsTab />
          </TabsContent>

          <TabsContent value="matches">
            <MatchesTab />
          </TabsContent>

          <TabsContent value="results">
            <ResultsTab />
          </TabsContent>

          <TabsContent value="photos">
            <PhotosTab />
          </TabsContent>

          <TabsContent value="comments">
            <CommentsTab />
          </TabsContent>

          <TabsContent value="announcements">
            <AnnouncementsTab />
          </TabsContent>

          <TabsContent value="admins">
            <AdminsTab />
          </TabsContent>

          <TabsContent value="settings">
            <SettingsTab />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

// ==================== TEAMS TAB ====================
function TeamsTab() {
  const utils = trpc.useUtils();
  const { data: teams, isLoading } = trpc.teams.list.useQuery();
  const { data: groups } = trpc.groups.list.useQuery();
  const createTeam = trpc.teams.create.useMutation({
    onSuccess: () => {
      utils.teams.list.invalidate();
      toast.success("Time criado com sucesso!");
      setOpen(false);
      resetForm();
    },
    onError: (error) => toast.error(error.message)
  });
  const deleteTeam = trpc.teams.delete.useMutation({
    onSuccess: () => {
      utils.teams.list.invalidate();
      toast.success("Time excluído!");
    },
    onError: (error) => toast.error(error.message)
  });
  const updateTeam = trpc.teams.update.useMutation({
    onSuccess: () => {
      utils.teams.list.invalidate();
      toast.success("Time atualizado!");
    },
    onError: (error) => toast.error(error.message)
  });

  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [lodge, setLodge] = useState("");
  const [groupId, setGroupId] = useState<string>("");

  const resetForm = () => {
    setName("");
    setLodge("");
    setGroupId("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createTeam.mutate({
      name,
      lodge: lodge || undefined,
      groupId: groupId ? parseInt(groupId) : undefined
    });
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Times ({teams?.length || 0})</CardTitle>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Novo Time
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Cadastrar Time</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Nome do Time *</Label>
                <Input 
                  id="name" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                  required 
                />
              </div>
              <div>
                <Label htmlFor="lodge">Loja Maçônica</Label>
                <Input 
                  id="lodge" 
                  value={lodge} 
                  onChange={(e) => setLodge(e.target.value)} 
                />
              </div>
              <div>
                <Label htmlFor="group">Grupo</Label>
                <Select value={groupId} onValueChange={setGroupId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um grupo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Sem grupo</SelectItem>
                    {groups?.map(g => (
                      <SelectItem key={g.id} value={g.id.toString()}>{g.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" className="w-full" disabled={createTeam.isPending}>
                {createTeam.isPending ? "Salvando..." : "Salvar"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            {[1, 2, 3].map(i => <Skeleton key={i} className="h-12 w-full" />)}
          </div>
        ) : teams && teams.length > 0 ? (
          <div className="space-y-2">
            {teams.map(team => (
              <div key={team.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div className="flex items-center gap-3">
                  {team.logoUrl ? (
                    <img src={team.logoUrl} alt={team.name} className="h-10 w-10 rounded-full object-cover" />
                  ) : (
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Shield className="h-5 w-5 text-primary" />
                    </div>
                  )}
                  <div>
                    <p className="font-medium">{team.name}</p>
                    {team.lodge && <p className="text-xs text-muted-foreground">{team.lodge}</p>}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {team.groupId && groups && (
                    <Badge variant="outline">
                      {groups.find(g => g.id === team.groupId)?.name}
                    </Badge>
                  )}
                  <TeamLogoUpload teamId={team.id} />
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => deleteTeam.mutate({ id: team.id })}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-muted-foreground py-8">Nenhum time cadastrado</p>
        )}
      </CardContent>
    </Card>
  );
}

function TeamLogoUpload({ teamId }: { teamId: number }) {
  const utils = trpc.useUtils();
  const uploadLogo = trpc.teams.uploadLogo.useMutation({
    onSuccess: () => {
      utils.teams.list.invalidate();
      toast.success("Logo atualizado!");
    },
    onError: (error) => toast.error(error.message)
  });
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = (reader.result as string).split(",")[1];
      uploadLogo.mutate({
        teamId,
        base64,
        mimeType: file.type
      });
    };
    reader.readAsDataURL(file);
  };

  return (
    <>
      <input 
        type="file" 
        ref={inputRef} 
        className="hidden" 
        accept="image/*"
        onChange={handleFileChange}
      />
      <Button 
        variant="ghost" 
        size="icon"
        onClick={() => inputRef.current?.click()}
        disabled={uploadLogo.isPending}
      >
        <Upload className="h-4 w-4" />
      </Button>
    </>
  );
}

// ==================== PLAYERS TAB ====================
function PlayersTab() {
  const utils = trpc.useUtils();
  const { data: players, isLoading } = trpc.players.list.useQuery();
  const { data: teams } = trpc.teams.list.useQuery();
  const createPlayer = trpc.players.create.useMutation({
    onSuccess: () => {
      utils.players.list.invalidate();
      toast.success("Jogador criado!");
      setOpen(false);
      resetForm();
    },
    onError: (error) => toast.error(error.message)
  });
  const deletePlayer = trpc.players.delete.useMutation({
    onSuccess: () => {
      utils.players.list.invalidate();
      toast.success("Jogador excluído!");
    },
    onError: (error) => toast.error(error.message)
  });

  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [number, setNumber] = useState("");
  const [position, setPosition] = useState("");
  const [teamId, setTeamId] = useState("");

  const resetForm = () => {
    setName("");
    setNumber("");
    setPosition("");
    setTeamId("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createPlayer.mutate({
      name,
      number: number ? parseInt(number) : undefined,
      position: position || undefined,
      teamId: parseInt(teamId)
    });
  };

  const getTeamName = (id: number) => teams?.find(t => t.id === id)?.name || "Time";

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Jogadores ({players?.length || 0})</CardTitle>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Novo Jogador
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Cadastrar Jogador</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="playerName">Nome *</Label>
                <Input 
                  id="playerName" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                  required 
                />
              </div>
              <div>
                <Label htmlFor="playerNumber">Número</Label>
                <Input 
                  id="playerNumber" 
                  type="number"
                  value={number} 
                  onChange={(e) => setNumber(e.target.value)} 
                />
              </div>
              <div>
                <Label htmlFor="playerPosition">Posição</Label>
                <Select value={position} onValueChange={setPosition}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a posição" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Goleiro">Goleiro</SelectItem>
                    <SelectItem value="Defensor">Defensor</SelectItem>
                    <SelectItem value="Meio-campo">Meio-campo</SelectItem>
                    <SelectItem value="Atacante">Atacante</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="playerTeam">Time *</Label>
                <Select value={teamId} onValueChange={setTeamId} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o time" />
                  </SelectTrigger>
                  <SelectContent>
                    {teams?.map(t => (
                      <SelectItem key={t.id} value={t.id.toString()}>{t.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" className="w-full" disabled={createPlayer.isPending || !teamId}>
                {createPlayer.isPending ? "Salvando..." : "Salvar"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            {[1, 2, 3].map(i => <Skeleton key={i} className="h-12 w-full" />)}
          </div>
        ) : players && players.length > 0 ? (
          <div className="space-y-2">
            {players.map(player => (
              <div key={player.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="font-bold text-primary">{player.number || "-"}</span>
                  </div>
                  <div>
                    <p className="font-medium">{player.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {getTeamName(player.teamId)} {player.position && `• ${player.position}`}
                    </p>
                  </div>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => deletePlayer.mutate({ id: player.id })}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-muted-foreground py-8">Nenhum jogador cadastrado</p>
        )}
      </CardContent>
    </Card>
  );
}

// ==================== GROUPS TAB ====================
function GroupsTab() {
  const utils = trpc.useUtils();
  const { data: groups, isLoading } = trpc.groups.list.useQuery();
  const { data: teams } = trpc.teams.list.useQuery();
  const createGroup = trpc.groups.create.useMutation({
    onSuccess: () => {
      utils.groups.list.invalidate();
      toast.success("Grupo criado!");
      setOpen(false);
      setName("");
    },
    onError: (error) => toast.error(error.message)
  });
  const deleteGroup = trpc.groups.delete.useMutation({
    onSuccess: () => {
      utils.groups.list.invalidate();
      utils.teams.list.invalidate();
      toast.success("Grupo excluído!");
    },
    onError: (error) => toast.error(error.message)
  });
  const updateTeam = trpc.teams.update.useMutation({
    onSuccess: () => {
      utils.teams.list.invalidate();
      toast.success("Time atualizado!");
    },
    onError: (error) => toast.error(error.message)
  });

  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createGroup.mutate({ name });
  };

  const getTeamsInGroup = (groupId: number) => {
    return teams?.filter(t => t.groupId === groupId) || [];
  };

  const getTeamsWithoutGroup = () => {
    return teams?.filter(t => !t.groupId) || [];
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Grupos ({groups?.length || 0})</CardTitle>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Novo Grupo
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Criar Grupo</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="groupName">Nome do Grupo *</Label>
                <Input 
                  id="groupName" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                  placeholder="Ex: Grupo A"
                  required 
                />
              </div>
              <Button type="submit" className="w-full" disabled={createGroup.isPending}>
                {createGroup.isPending ? "Salvando..." : "Salvar"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2].map(i => <Skeleton key={i} className="h-32 w-full" />)}
          </div>
        ) : (
          <div className="space-y-6">
            {/* Teams without group */}
            {getTeamsWithoutGroup().length > 0 && (
              <div className="p-4 border border-dashed rounded-lg">
                <h3 className="font-medium mb-3 text-muted-foreground">Times sem grupo ({getTeamsWithoutGroup().length})</h3>
                <div className="flex flex-wrap gap-2">
                  {getTeamsWithoutGroup().map(team => (
                    <Badge key={team.id} variant="outline" className="py-1">
                      {team.name}
                      <Select 
                        onValueChange={(value) => updateTeam.mutate({ id: team.id, groupId: parseInt(value) })}
                      >
                        <SelectTrigger className="h-6 w-6 ml-2 p-0 border-0">
                          <Plus className="h-3 w-3" />
                        </SelectTrigger>
                        <SelectContent>
                          {groups?.map(g => (
                            <SelectItem key={g.id} value={g.id.toString()}>{g.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Groups */}
            {groups && groups.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {groups.map(group => (
                  <div key={group.id} className="p-4 bg-muted rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-bold text-gold-dark">{group.name}</h3>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => deleteGroup.mutate({ id: group.id })}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                    <div className="space-y-1">
                      {getTeamsInGroup(group.id).length > 0 ? (
                        getTeamsInGroup(group.id).map(team => (
                          <div key={team.id} className="flex items-center justify-between p-2 bg-background rounded">
                            <span className="text-sm">{team.name}</span>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              className="h-6 w-6"
                              onClick={() => updateTeam.mutate({ id: team.id, groupId: null })}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-muted-foreground">Nenhum time</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">Nenhum grupo cadastrado</p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ==================== MATCHES TAB ====================
function MatchesTab() {
  const utils = trpc.useUtils();
  const { data: matches, isLoading } = trpc.matches.list.useQuery();
  const { data: teams } = trpc.teams.list.useQuery();
  const { data: groups } = trpc.groups.list.useQuery();
  const createMatch = trpc.matches.create.useMutation({
    onSuccess: () => {
      utils.matches.list.invalidate();
      toast.success("Jogo criado!");
      setOpen(false);
      resetForm();
    },
    onError: (error) => toast.error(error.message)
  });
  const deleteMatch = trpc.matches.delete.useMutation({
    onSuccess: () => {
      utils.matches.list.invalidate();
      toast.success("Jogo excluído!");
    },
    onError: (error) => toast.error(error.message)
  });

  const [open, setOpen] = useState(false);
  const [homeTeamId, setHomeTeamId] = useState("");
  const [awayTeamId, setAwayTeamId] = useState("");
  const [phase, setPhase] = useState<string>("groups");
  const [groupId, setGroupId] = useState("");
  const [round, setRound] = useState("");
  const [matchDate, setMatchDate] = useState("");
  const [location, setLocation] = useState("");
  const [bracketSide, setBracketSide] = useState<string>("");

  const resetForm = () => {
    setHomeTeamId("");
    setAwayTeamId("");
    setPhase("groups");
    setGroupId("");
    setRound("");
    setMatchDate("");
    setLocation("");
    setBracketSide("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMatch.mutate({
      homeTeamId: parseInt(homeTeamId),
      awayTeamId: parseInt(awayTeamId),
      phase: phase as any,
      groupId: groupId ? parseInt(groupId) : undefined,
      round: round ? parseInt(round) : undefined,
      matchDate: matchDate || undefined,
      location: location || undefined,
      bracketSide: (bracketSide as 'left' | 'right' | undefined) || undefined
    });
  };

  const getTeamName = (id: number) => teams?.find(t => t.id === id)?.name || "Time";
  const getGroupName = (id: number | null) => {
    if (!id) return "";
    return groups?.find(g => g.id === id)?.name || "";
  };

  const phaseLabels: Record<string, string> = {
    groups: "Fase de Grupos",
    round16: "Oitavas de Final",
    quarters: "Quartas de Final",
    semis: "Semifinal",
    final: "Final"
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Jogos ({matches?.length || 0})</CardTitle>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Novo Jogo
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Cadastrar Jogo</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Time Casa *</Label>
                  <Select value={homeTeamId} onValueChange={setHomeTeamId} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      {teams?.map(t => (
                        <SelectItem key={t.id} value={t.id.toString()}>{t.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Time Visitante *</Label>
                  <Select value={awayTeamId} onValueChange={setAwayTeamId} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      {teams?.map(t => (
                        <SelectItem key={t.id} value={t.id.toString()}>{t.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Fase *</Label>
                  <Select value={phase} onValueChange={setPhase}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="groups">Fase de Grupos</SelectItem>
                      <SelectItem value="round16">Oitavas de Final</SelectItem>
                      <SelectItem value="quarters">Quartas de Final</SelectItem>
                      <SelectItem value="semis">Semifinal</SelectItem>
                      <SelectItem value="final">Final</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {phase === "groups" ? (
                  <div>
                    <Label>Grupo</Label>
                    <Select value={groupId} onValueChange={setGroupId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        {groups?.map(g => (
                          <SelectItem key={g.id} value={g.id.toString()}>{g.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                ) : (
                  <div>
                    <Label>Lado da Chave</Label>
                    <Select value={bracketSide} onValueChange={setBracketSide}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="left">Esquerdo</SelectItem>
                        <SelectItem value="right">Direito</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Rodada</Label>
                  <Input 
                    type="number" 
                    value={round} 
                    onChange={(e) => setRound(e.target.value)} 
                    placeholder="1, 2, 3..."
                  />
                </div>
                <div>
                  <Label>Data/Hora</Label>
                  <Input 
                    type="datetime-local" 
                    value={matchDate} 
                    onChange={(e) => setMatchDate(e.target.value)} 
                  />
                </div>
              </div>
              <div>
                <Label>Local</Label>
                <Input 
                  value={location} 
                  onChange={(e) => setLocation(e.target.value)} 
                  placeholder="Nome do campo/quadra"
                />
              </div>
              <Button type="submit" className="w-full" disabled={createMatch.isPending || !homeTeamId || !awayTeamId}>
                {createMatch.isPending ? "Salvando..." : "Salvar"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            {[1, 2, 3].map(i => <Skeleton key={i} className="h-16 w-full" />)}
          </div>
        ) : matches && matches.length > 0 ? (
          <div className="space-y-2">
            {matches.map(match => (
              <div key={match.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="outline" className="text-xs">
                      {phaseLabels[match.phase]}
                      {match.groupId && ` - ${getGroupName(match.groupId)}`}
                      {match.round && ` - R${match.round}`}
                    </Badge>
                    {match.played && <Badge className="bg-green-500">Finalizado</Badge>}
                  </div>
                  <p className="font-medium">
                    {getTeamName(match.homeTeamId)} 
                    {match.played ? ` ${match.homeScore} x ${match.awayScore} ` : " vs "}
                    {getTeamName(match.awayTeamId)}
                  </p>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => deleteMatch.mutate({ id: match.id })}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-muted-foreground py-8">Nenhum jogo cadastrado</p>
        )}
      </CardContent>
    </Card>
  );
}

// ==================== RESULTS TAB ====================
function ResultsTab() {
  return <ResultsRegistration />;
}

function ResultsTabOld() {
  const utils = trpc.useUtils();
  const { data: matches } = trpc.matches.list.useQuery();
  const { data: teams } = trpc.teams.list.useQuery();
  const { data: players } = trpc.players.list.useQuery();
  const registerResult = trpc.matches.registerResult.useMutation({
    onSuccess: () => {
      utils.matches.list.invalidate();
      toast.success("Resultado registrado!");
    },
    onError: (error) => toast.error(error.message)
  });
  const createGoal = trpc.goals.create.useMutation({
    onSuccess: () => {
      utils.goals.topScorers.invalidate();
      toast.success("Gol registrado!");
    },
    onError: (error) => toast.error(error.message)
  });
  const createCard = trpc.cards.create.useMutation({
    onSuccess: () => {
      utils.cards.topCarded.invalidate();
      toast.success("Cartão registrado!");
    },
    onError: (error) => toast.error(error.message)
  });

  const [selectedMatch, setSelectedMatch] = useState<number | null>(null);
  const [homeScore, setHomeScore] = useState("");
  const [awayScore, setAwayScore] = useState("");
  const [penalties, setPenalties] = useState(false);
  const [homePenalties, setHomePenalties] = useState("");
  const [awayPenalties, setAwayPenalties] = useState("");

  // Goal form
  const [goalPlayerId, setGoalPlayerId] = useState("");
  const [goalTeamId, setGoalTeamId] = useState("");

  // Card form
  const [cardPlayerId, setCardPlayerId] = useState("");
  const [cardTeamId, setCardTeamId] = useState("");
  const [cardType, setCardType] = useState<"yellow" | "red">("yellow");

  const getTeamName = (id: number) => teams?.find(t => t.id === id)?.name || "Time";
  const getPlayersByTeam = (teamId: number) => players?.filter(p => p.teamId === teamId) || [];

  const pendingMatches = matches?.filter(m => !m.played) || [];
  const selectedMatchData = matches?.find(m => m.id === selectedMatch);

  const handleRegisterResult = () => {
    if (!selectedMatch) return;
    registerResult.mutate({
      matchId: selectedMatch,
      homeScore: parseInt(homeScore),
      awayScore: parseInt(awayScore),
      penalties: penalties || undefined,
      homePenalties: penalties ? parseInt(homePenalties) : undefined,
      awayPenalties: penalties ? parseInt(awayPenalties) : undefined
    });
  };

  const handleAddGoal = () => {
    if (!selectedMatch || !goalPlayerId || !goalTeamId) return;
    createGoal.mutate({
      matchId: selectedMatch,
      playerId: parseInt(goalPlayerId),
      teamId: parseInt(goalTeamId)
    });
    setGoalPlayerId("");
  };

  const handleAddCard = () => {
    if (!selectedMatch || !cardPlayerId || !cardTeamId) return;
    createCard.mutate({
      matchId: selectedMatch,
      playerId: parseInt(cardPlayerId),
      teamId: parseInt(cardTeamId),
      cardType
    });
    setCardPlayerId("");
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Select Match */}
      <Card>
        <CardHeader>
          <CardTitle>Selecionar Jogo</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {pendingMatches.length > 0 ? (
              pendingMatches.map(match => (
                <div 
                  key={match.id} 
                  className={`p-3 rounded-lg cursor-pointer transition-colors ${
                    selectedMatch === match.id ? "bg-primary text-primary-foreground" : "bg-muted hover:bg-muted/80"
                  }`}
                  onClick={() => {
                    setSelectedMatch(match.id);
                    setHomeScore("");
                    setAwayScore("");
                    setPenalties(false);
                  }}
                >
                  <p className="font-medium">
                    {getTeamName(match.homeTeamId)} vs {getTeamName(match.awayTeamId)}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-center text-muted-foreground py-4">
                Nenhum jogo pendente
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Register Result */}
      {selectedMatch && selectedMatchData && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Registrar Resultado</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4 items-center">
                <div className="text-center">
                  <p className="font-bold mb-2">{getTeamName(selectedMatchData.homeTeamId)}</p>
                  <Input 
                    type="number" 
                    value={homeScore} 
                    onChange={(e) => setHomeScore(e.target.value)}
                    className="text-center text-2xl"
                    min="0"
                  />
                </div>
                <div className="text-center text-2xl font-bold text-muted-foreground">X</div>
                <div className="text-center">
                  <p className="font-bold mb-2">{getTeamName(selectedMatchData.awayTeamId)}</p>
                  <Input 
                    type="number" 
                    value={awayScore} 
                    onChange={(e) => setAwayScore(e.target.value)}
                    className="text-center text-2xl"
                    min="0"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input 
                  type="checkbox" 
                  id="penalties" 
                  checked={penalties}
                  onChange={(e) => setPenalties(e.target.checked)}
                />
                <Label htmlFor="penalties">Foi para pênaltis?</Label>
              </div>

              {penalties && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Pênaltis {getTeamName(selectedMatchData.homeTeamId)}</Label>
                    <Input 
                      type="number" 
                      value={homePenalties} 
                      onChange={(e) => setHomePenalties(e.target.value)}
                      min="0"
                    />
                  </div>
                  <div>
                    <Label>Pênaltis {getTeamName(selectedMatchData.awayTeamId)}</Label>
                    <Input 
                      type="number" 
                      value={awayPenalties} 
                      onChange={(e) => setAwayPenalties(e.target.value)}
                      min="0"
                    />
                  </div>
                </div>
              )}

              <Button 
                onClick={handleRegisterResult} 
                className="w-full"
                disabled={!homeScore || !awayScore || registerResult.isPending}
              >
                {registerResult.isPending ? "Salvando..." : "Salvar Resultado"}
              </Button>
            </CardContent>
          </Card>

          {/* Add Goals */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Registrar Gols
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Time</Label>
                <Select value={goalTeamId} onValueChange={setGoalTeamId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o time" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={selectedMatchData.homeTeamId.toString()}>
                      {getTeamName(selectedMatchData.homeTeamId)}
                    </SelectItem>
                    <SelectItem value={selectedMatchData.awayTeamId.toString()}>
                      {getTeamName(selectedMatchData.awayTeamId)}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {goalTeamId && (
                <div>
                  <Label>Jogador</Label>
                  <Select value={goalPlayerId} onValueChange={setGoalPlayerId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Quem fez o gol?" />
                    </SelectTrigger>
                    <SelectContent>
                      {getPlayersByTeam(parseInt(goalTeamId)).map(p => (
                        <SelectItem key={p.id} value={p.id.toString()}>
                          {p.number && `${p.number} - `}{p.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              <Button 
                onClick={handleAddGoal}
                disabled={!goalPlayerId || !goalTeamId || createGoal.isPending}
                className="w-full"
              >
                {createGoal.isPending ? "Salvando..." : "Adicionar Gol"}
              </Button>
            </CardContent>
          </Card>

          {/* Add Cards */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Registrar Cartões
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Time</Label>
                <Select value={cardTeamId} onValueChange={setCardTeamId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o time" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={selectedMatchData.homeTeamId.toString()}>
                      {getTeamName(selectedMatchData.homeTeamId)}
                    </SelectItem>
                    <SelectItem value={selectedMatchData.awayTeamId.toString()}>
                      {getTeamName(selectedMatchData.awayTeamId)}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {cardTeamId && (
                <>
                  <div>
                    <Label>Jogador</Label>
                    <Select value={cardPlayerId} onValueChange={setCardPlayerId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Quem recebeu o cartão?" />
                      </SelectTrigger>
                      <SelectContent>
                        {getPlayersByTeam(parseInt(cardTeamId)).map(p => (
                          <SelectItem key={p.id} value={p.id.toString()}>
                            {p.number && `${p.number} - `}{p.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Tipo de Cartão</Label>
                    <Select value={cardType} onValueChange={(v) => setCardType(v as "yellow" | "red")}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="yellow">🟨 Amarelo</SelectItem>
                        <SelectItem value="red">🟥 Vermelho</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}
              <Button 
                onClick={handleAddCard}
                disabled={!cardPlayerId || !cardTeamId || createCard.isPending}
                className="w-full"
              >
                {createCard.isPending ? "Salvando..." : "Adicionar Cartão"}
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

// ==================== PHOTOS TAB ====================
function PhotosTab() {
  const utils = trpc.useUtils();
  const { data: photos, isLoading } = trpc.photos.list.useQuery({ limit: 100 });
  const uploadPhoto = trpc.photos.upload.useMutation({
    onSuccess: () => {
      utils.photos.list.invalidate();
      toast.success("Foto enviada!");
    },
    onError: (error) => toast.error(error.message)
  });
  const deletePhoto = trpc.photos.delete.useMutation({
    onSuccess: () => {
      utils.photos.list.invalidate();
      toast.success("Foto excluída!");
    },
    onError: (error) => toast.error(error.message)
  });

  const inputRef = useRef<HTMLInputElement>(null);
  const [caption, setCaption] = useState("");

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = (reader.result as string).split(",")[1];
      uploadPhoto.mutate({
        base64,
        mimeType: file.type,
        caption: caption || undefined
      });
      setCaption("");
    };
    reader.readAsDataURL(file);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Galeria ({photos?.length || 0})</CardTitle>
        <div className="flex items-center gap-2">
          <Input 
            placeholder="Legenda (opcional)"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            className="w-48"
          />
          <input 
            type="file" 
            ref={inputRef} 
            className="hidden" 
            accept="image/*"
            onChange={handleFileChange}
          />
          <Button 
            className="gap-2"
            onClick={() => inputRef.current?.click()}
            disabled={uploadPhoto.isPending}
          >
            <Upload className="h-4 w-4" />
            {uploadPhoto.isPending ? "Enviando..." : "Enviar Foto"}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => <Skeleton key={i} className="aspect-square w-full" />)}
          </div>
        ) : photos && photos.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {photos.map(photo => (
              <div key={photo.id} className="relative group">
                <img 
                  src={photo.url} 
                  alt={photo.caption || "Foto"}
                  className="w-full aspect-square object-cover rounded-lg"
                />
                <Button 
                  variant="destructive" 
                  size="icon"
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => deletePhoto.mutate({ id: photo.id })}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
                {photo.caption && (
                  <p className="text-xs text-muted-foreground mt-1 truncate">{photo.caption}</p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-muted-foreground py-8">Nenhuma foto na galeria</p>
        )}
      </CardContent>
    </Card>
  );
}

// ==================== COMMENTS TAB ====================
function CommentsTab() {
  const utils = trpc.useUtils();
  const { data: comments, isLoading } = trpc.comments.list.useQuery({ limit: 100 });
  const deleteComment = trpc.comments.delete.useMutation({
    onSuccess: () => {
      utils.comments.list.invalidate();
      toast.success("Comentário excluído!");
    },
    onError: (error) => toast.error(error.message)
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Comentários ({comments?.length || 0})</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            {[1, 2, 3].map(i => <Skeleton key={i} className="h-20 w-full" />)}
          </div>
        ) : comments && comments.length > 0 ? (
          <div className="space-y-2">
            {comments.map(comment => (
              <div key={comment.id} className="flex items-start justify-between p-3 bg-muted rounded-lg">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium">{comment.authorName}</span>
                    {comment.authorLodge && (
                      <Badge variant="outline" className="text-xs">{comment.authorLodge}</Badge>
                    )}
                  </div>
                  <p className="text-sm">{comment.content}</p>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => deleteComment.mutate({ id: comment.id })}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-muted-foreground py-8">Nenhum comentário</p>
        )}
      </CardContent>
    </Card>
  );
}


// ==================== ANNOUNCEMENTS TAB ====================
function AnnouncementsTab() {
  const utils = trpc.useUtils();
  const { data: announcements, isLoading } = trpc.announcements.list.useQuery();
  const createAnnouncement = trpc.announcements.create.useMutation({
    onSuccess: () => {
      utils.announcements.list.invalidate();
      utils.announcements.active.invalidate();
      toast.success("Aviso criado!");
      setTitle("");
      setContent("");
    },
    onError: (error) => toast.error(error.message)
  });
  const updateAnnouncement = trpc.announcements.update.useMutation({
    onSuccess: () => {
      utils.announcements.list.invalidate();
      utils.announcements.active.invalidate();
      toast.success("Aviso atualizado!");
    },
    onError: (error) => toast.error(error.message)
  });
  const deleteAnnouncement = trpc.announcements.delete.useMutation({
    onSuccess: () => {
      utils.announcements.list.invalidate();
      utils.announcements.active.invalidate();
      toast.success("Aviso excluído!");
    },
    onError: (error) => toast.error(error.message)
  });

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const handleCreate = () => {
    if (!title || !content) {
      toast.error("Preencha título e conteúdo!");
      return;
    }
    createAnnouncement.mutate({ title, content, active: true });
  };

  const toggleActive = (id: number, currentActive: boolean) => {
    updateAnnouncement.mutate({ id, active: !currentActive });
  };

  return (
    <div className="space-y-6">
      {/* Create Announcement */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Criar Novo Aviso
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Título</Label>
            <Input 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Alteração de horário"
            />
          </div>
          <div>
            <Label>Conteúdo</Label>
            <Input 
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Ex: O jogo da rodada 3 foi adiado para..."
            />
          </div>
          <Button 
            onClick={handleCreate}
            disabled={createAnnouncement.isPending}
            className="w-full"
          >
            {createAnnouncement.isPending ? "Criando..." : "Criar Aviso"}
          </Button>
        </CardContent>
      </Card>

      {/* List Announcements */}
      <Card>
        <CardHeader>
          <CardTitle>Avisos Cadastrados</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              {[1, 2, 3].map(i => <Skeleton key={i} className="h-20 w-full" />)}
            </div>
          ) : announcements && announcements.length > 0 ? (
            <div className="space-y-3">
              {announcements.map((announcement) => (
                <div 
                  key={announcement.id}
                  className="flex items-start justify-between p-4 border rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold">{announcement.title}</h3>
                      <Badge variant={announcement.active ? "default" : "secondary"}>
                        {announcement.active ? "Ativo" : "Inativo"}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{announcement.content}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleActive(announcement.id, announcement.active)}
                      disabled={updateAnnouncement.isPending}
                    >
                      {announcement.active ? "Desativar" : "Ativar"}
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => deleteAnnouncement.mutate({ id: announcement.id })}
                      disabled={deleteAnnouncement.isPending}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">Nenhum aviso cadastrado</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// ==================== ADMINS TAB ====================
function AdminsTab() {
  const utils = trpc.useUtils();
  const { data: adminEmails, isLoading } = trpc.adminEmails.list.useQuery();
  const addAdminEmail = trpc.adminEmails.add.useMutation({
    onSuccess: () => {
      utils.adminEmails.list.invalidate();
      toast.success("Email adicionado como admin!");
      setEmail("");
    },
    onError: (error) => toast.error(error.message)
  });
  const removeAdminEmail = trpc.adminEmails.remove.useMutation({
    onSuccess: () => {
      utils.adminEmails.list.invalidate();
      toast.success("Email removido!");
    },
    onError: (error) => toast.error(error.message)
  });

  const [email, setEmail] = useState("");

  const handleAdd = () => {
    if (!email) {
      toast.error("Digite um email!");
      return;
    }
    // Validação básica de email
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error("Email inválido!");
      return;
    }
    addAdminEmail.mutate({ email });
  };

  return (
    <div className="space-y-6">
      {/* Add Admin */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Adicionar Novo Administrador
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Email</Label>
            <Input 
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="exemplo@email.com"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Este email terá acesso total ao painel administrativo
            </p>
          </div>
          <Button 
            onClick={handleAdd}
            disabled={addAdminEmail.isPending}
            className="w-full"
          >
            {addAdminEmail.isPending ? "Adicionando..." : "Adicionar Admin"}
          </Button>
        </CardContent>
      </Card>

      {/* List Admins */}
      <Card>
        <CardHeader>
          <CardTitle>Administradores Cadastrados</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              {[1, 2].map(i => <Skeleton key={i} className="h-12 w-full" />)}
            </div>
          ) : adminEmails && adminEmails.length > 0 ? (
            <div className="space-y-2">
              {adminEmails.map((admin) => (
                <div 
                  key={admin.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-primary" />
                    <span>{admin.email}</span>
                  </div>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => removeAdminEmail.mutate({ id: admin.id })}
                    disabled={removeAdminEmail.isPending}
                  >
                    Remover
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">Nenhum admin adicional cadastrado</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// ==================== SETTINGS TAB ====================
function SettingsTab() {
  const utils = trpc.useUtils();
  const { data: tournamentName } = trpc.settings.get.useQuery({ key: "tournamentName" });
  const { data: tournamentSubtitle } = trpc.settings.get.useQuery({ key: "tournamentSubtitle" });
  const { data: tournamentOrganizer } = trpc.settings.get.useQuery({ key: "tournamentOrganizer" });
  const { data: tournamentLogo } = trpc.settings.get.useQuery({ key: "tournamentLogo" });
  const { data: tournamentMusic } = trpc.settings.get.useQuery({ key: "tournamentMusic" });
  const { data: tournamentBackground } = trpc.settings.get.useQuery({ key: "tournamentBackground" });
  const { data: heroBackground } = trpc.settings.get.useQuery({ key: "heroBackground" });

  const setSetting = trpc.settings.set.useMutation({
    onSuccess: () => {
      utils.settings.get.invalidate();
      toast.success("Configuração salva!");
    },
    onError: (error) => toast.error(error.message)
  });

  const uploadLogo = trpc.settings.uploadLogo.useMutation({
    onSuccess: () => {
      utils.settings.get.invalidate();
      toast.success("Logo atualizado!");
    },
    onError: (error) => toast.error(error.message)
  });

  const uploadMusic = trpc.settings.uploadMusic.useMutation({
    onSuccess: () => {
      utils.settings.get.invalidate();
      toast.success("Música atualizada!");
    },
    onError: (error) => toast.error(error.message)
  });

  const uploadBackground = trpc.settings.uploadBackground.useMutation({
    onSuccess: () => {
      utils.settings.get.invalidate();
      utils.settings.getAll.invalidate();
      toast.success("Imagem de fundo atualizada!");
    },
    onError: (error) => toast.error(error.message)
  });

  const uploadHeroBackground = trpc.settings.uploadHeroBackground.useMutation({
    onSuccess: () => {
      utils.settings.get.invalidate();
      utils.settings.getAll.invalidate();
      toast.success("Imagem do Hero atualizada!");
    },
    onError: (error) => toast.error(error.message)
  });

  const [name, setName] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [organizer, setOrganizer] = useState("");

  // Atualizar estados quando os dados carregam
  useEffect(() => {
    if (tournamentName) setName(tournamentName);
  }, [tournamentName]);

  useEffect(() => {
    if (tournamentSubtitle) setSubtitle(tournamentSubtitle);
  }, [tournamentSubtitle]);

  useEffect(() => {
    if (tournamentOrganizer) setOrganizer(tournamentOrganizer);
  }, [tournamentOrganizer]);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result?.toString().split(',')[1];
      if (base64) {
        uploadLogo.mutate({
          base64,
          mimeType: file.type
        });
      }
    };
    reader.readAsDataURL(file);
  };

  const handleMusicUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result?.toString().split(',')[1];
      if (base64) {
        uploadMusic.mutate({
          base64,
          mimeType: file.type
        });
      }
    };
    reader.readAsDataURL(file);
  };

  const handleBackgroundUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result?.toString().split(',')[1];
      if (base64) {
        uploadBackground.mutate({
          base64,
          mimeType: file.type
        });
      }
    };
    reader.readAsDataURL(file);
  };

  const handleHeroBackgroundUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result?.toString().split(',')[1];
      if (base64) {
        uploadHeroBackground.mutate({
          base64,
          mimeType: file.type
        });
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Configurações do Campeonato
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Nome do Campeonato */}
          <div>
            <Label>Nome do Campeonato</Label>
            <Input 
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Futebol Fraterno"
            />
            <Button 
              onClick={() => setSetting.mutate({ key: "tournamentName", value: name })}
              disabled={setSetting.isPending || !name}
              className="mt-2"
              size="sm"
            >
              Salvar Nome
            </Button>
          </div>

          {/* Subtítulo */}
          <div>
            <Label>Subtítulo</Label>
            <Input 
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              placeholder="Ex: 2026 - Respeito e União"
            />
            <Button 
              onClick={() => setSetting.mutate({ key: "tournamentSubtitle", value: subtitle })}
              disabled={setSetting.isPending || !subtitle}
              className="mt-2"
              size="sm"
            >
              Salvar Subtítulo
            </Button>
          </div>

          {/* Organizador */}
          <div>
            <Label>Organizador</Label>
            <Input 
              value={organizer}
              onChange={(e) => setOrganizer(e.target.value)}
              placeholder="Ex: Organizado pela Loja José Moreira"
            />
            <Button 
              onClick={() => setSetting.mutate({ key: "tournamentOrganizer", value: organizer })}
              disabled={setSetting.isPending || !organizer}
              className="mt-2"
              size="sm"
            >
              Salvar Organizador
            </Button>
          </div>

          {/* Logo */}
          <div>
            <Label>Logo do Campeonato</Label>
            {tournamentLogo && (
              <img 
                src={tournamentLogo} 
                alt="Logo atual" 
                className="h-24 w-24 object-cover rounded-lg mb-2"
              />
            )}
            <Input 
              type="file"
              accept="image/*"
              onChange={handleLogoUpload}
              disabled={uploadLogo.isPending}
            />
            <p className="text-xs text-muted-foreground mt-1">
              {uploadLogo.isPending ? "Enviando..." : "Formatos: JPG, PNG"}
            </p>
          </div>

          {/* Música */}
          <div>
            <Label>Música de Fundo</Label>
            {tournamentMusic && (
              <audio controls className="w-full mb-2">
                <source src={tournamentMusic} />
              </audio>
            )}
            <Input 
              type="file"
              accept="audio/*"
              onChange={handleMusicUpload}
              disabled={uploadMusic.isPending}
            />
            <p className="text-xs text-muted-foreground mt-1">
              {uploadMusic.isPending ? "Enviando..." : "Formatos: MP3, WAV, OGG"}
            </p>
          </div>

          {/* Imagem de Fundo da Seção Hero (Laranja) */}
          <div>
            <Label>Imagem de Fundo da Seção Hero (parte laranja)</Label>
            <p className="text-xs text-muted-foreground mb-2">
              Esta imagem aparece na seção principal do site, onde fica o logo e os botões.
            </p>
            {heroBackground && (
              <img 
                src={heroBackground} 
                alt="Hero atual" 
                className="h-32 w-full object-cover rounded-lg mb-2"
              />
            )}
            <Input 
              type="file"
              accept="image/*"
              onChange={handleHeroBackgroundUpload}
              disabled={uploadHeroBackground.isPending}
            />
            <p className="text-xs text-muted-foreground mt-1">
              {uploadHeroBackground.isPending ? "Enviando..." : "Formatos: JPG, PNG. Recomendado: 1920x600px ou maior."}
            </p>
          </div>

          {/* Imagem de Fundo Geral */}
          <div>
            <Label>Imagem de Fundo Geral do Site</Label>
            <p className="text-xs text-muted-foreground mb-2">
              Esta imagem aparece como fundo em todas as páginas do site.
            </p>
            {tournamentBackground && (
              <img 
                src={tournamentBackground} 
                alt="Fundo atual" 
                className="h-32 w-full object-cover rounded-lg mb-2"
              />
            )}
            <Input 
              type="file"
              accept="image/*"
              onChange={handleBackgroundUpload}
              disabled={uploadBackground.isPending}
            />
            <p className="text-xs text-muted-foreground mt-1">
              {uploadBackground.isPending ? "Enviando..." : "Formatos: JPG, PNG. Recomendado: imagem de alta resolução."}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
