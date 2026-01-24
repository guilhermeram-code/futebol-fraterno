import { useState, useRef, useEffect, useMemo } from "react";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
  Settings,
  ChevronDown,
  ChevronRight,
  Check,
  LogOut,
  Star,
  Heart,
  KeyRound
} from "lucide-react";

import { ResultsRegistration } from "@/components/ResultsRegistration";
import { useSlug } from "@/hooks/useSlug";
import { ConfirmDeleteDialog } from "@/components/ConfirmDeleteDialog";
import { useTournament } from "@/contexts/TournamentContext";

export default function Admin() {
  const { campaignId, settings } = useTournament();
  const { adminUser, isAuthenticated, loading, logout } = useAdminAuth();
  const [location, setLocation] = useLocation();

  // Extrair slug da URL atual (formato: /{slug}/admin)
  const slug = useSlug();

  // Verificar se precisa trocar senha (hook DEVE estar antes de qualquer return)
  const meQuery = trpc.adminUsers.me.useQuery(undefined, {
    enabled: isAuthenticated,
  });

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

  // Redirecionar para troca de senha se necessário
  if (isAuthenticated && meQuery.data?.needsPasswordChange) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-amber-500/10 rounded-full">
                <AlertTriangle className="h-8 w-8 text-amber-500" />
              </div>
            </div>
            <CardTitle className="text-2xl">Troca de Senha Obrigatória</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground text-center">
              Por segurança, você precisa alterar sua senha temporária antes de acessar o painel administrativo.
            </p>
            <Button 
              onClick={() => setLocation(`/${slug}/admin/change-password`)} 
              className="w-full"
            >
              Alterar Senha Agora
            </Button>
          </CardContent>
        </Card>
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
            <Button onClick={() => setLocation(`/${slug}/admin/login`)}>
              Fazer Login
            </Button>
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
              <Link href={`/${slug}`}>
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              </Link>
              {settings.tournamentLogo ? (
                <img 
                  src={settings.tournamentLogo} 
                  alt={settings.tournamentName || "Logo do Campeonato"} 
                  className="h-12 w-12 rounded-full object-cover border-2 border-primary"
                />
              ) : (
                <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center border-2 border-primary">
                  <Trophy className="h-6 w-6 text-muted-foreground" />
                </div>
              )}
              <div>
                <h1 className="text-xl font-bold text-gold">Painel Administrativo</h1>
                <p className="text-sm text-muted-foreground">Gerenciar Campeonato</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-gold border-gold">
                Admin: {adminUser?.name || adminUser?.username}
              </Badge>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setLocation(`/${slug}/admin/change-password`)}
                className="text-muted-foreground hover:text-foreground"
              >
                <KeyRound className="h-4 w-4 mr-2" />
                Alterar Senha
              </Button>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={logout}
                className="text-muted-foreground hover:text-foreground"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sair
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container py-8">
        <Tabs defaultValue="settings" className="w-full">
          <TabsList className="flex flex-wrap justify-start gap-1 mb-6 h-auto p-2">
            <TabsTrigger value="settings" className="gap-1 text-xs">
              <Settings className="h-4 w-4 hidden md:block" />
              Configurações
            </TabsTrigger>
            <TabsTrigger value="groups" className="gap-1 text-xs">
              <Trophy className="h-4 w-4 hidden md:block" />
              Grupos
            </TabsTrigger>
            <TabsTrigger value="teams" className="gap-1 text-xs">
              <Shield className="h-4 w-4 hidden md:block" />
              Times
            </TabsTrigger>
            <TabsTrigger value="players" className="gap-1 text-xs">
              <Users className="h-4 w-4 hidden md:block" />
              Jogadores
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
            <TabsTrigger value="sponsors" className="gap-1 text-xs">
              <Star className="h-4 w-4 hidden md:block" />
              Patrocinadores
            </TabsTrigger>
            <TabsTrigger value="support-messages" className="gap-1 text-xs">
              <Heart className="h-4 w-4 hidden md:block" />
              Apoio
            </TabsTrigger>
            <TabsTrigger value="admins" className="gap-1 text-xs">
              <UserPlus className="h-4 w-4 hidden md:block" />
              Admins
            </TabsTrigger>
          </TabsList>

          <TabsContent value="teams">
            <TeamsTab campaignId={campaignId} />
          </TabsContent>

          <TabsContent value="players">
            <PlayersTab campaignId={campaignId} />
          </TabsContent>

          <TabsContent value="groups">
            <GroupsTab campaignId={campaignId} />
          </TabsContent>

          <TabsContent value="matches">
            <MatchesTab campaignId={campaignId} />
          </TabsContent>

          <TabsContent value="results">
            <ResultsTab campaignId={campaignId} />
          </TabsContent>

          <TabsContent value="photos">
            <PhotosTab campaignId={campaignId} />
          </TabsContent>

          <TabsContent value="comments">
            <CommentsTab campaignId={campaignId} />
          </TabsContent>

          <TabsContent value="announcements">
            <AnnouncementsTab campaignId={campaignId} />
          </TabsContent>

          <TabsContent value="admins">
            <AdminsTab campaignId={campaignId} />
          </TabsContent>

          <TabsContent value="sponsors">
            <SponsorsTab campaignId={campaignId} />
          </TabsContent>

          <TabsContent value="support-messages">
            <SupportMessagesTab campaignId={campaignId} />
          </TabsContent>

          <TabsContent value="settings">
            <SettingsTab campaignId={campaignId} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

// ==================== TEAMS TAB ====================
function TeamsTab({ campaignId }: { campaignId: number }) {
  const utils = trpc.useUtils();
  const { data: teams, isLoading } = trpc.teams.list.useQuery({ campaignId });
  const { data: groups } = trpc.groups.list.useQuery({ campaignId });
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
      groupId: groupId ? parseInt(groupId) : undefined,
      campaignId
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
                <Label htmlFor="lodge">Subtítulo (opcional)</Label>
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
                  <AddPlayerToTeamButton teamId={team.id} teamName={team.name} campaignId={campaignId} />
                  <TeamSupportMessageButton teamId={team.id} teamName={team.name} currentMessage={team.supportMessage} />
                  <TeamLogoUpload teamId={team.id} />
                  <ConfirmDeleteDialog
                    title="Excluir Time"
                    description={`Você está prestes a excluir o time "${team.name}" e TODOS os seus jogadores. ATENCAO: Todos os gols, cartões amarelos, cartões vermelhos e estatísticas relacionados serão PERMANENTEMENTE REMOVIDOS. Esta ação não pode ser desfeita.`}
                    requireTyping={true}
                    onConfirm={() => deleteTeam.mutate({ id: team.id })}
                    isDeleting={deleteTeam.isPending}
                  />
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

// ==================== ADD PLAYER TO TEAM BUTTON ====================
function AddPlayerToTeamButton({ teamId, teamName, campaignId }: { teamId: number; teamName: string; campaignId: number }) {
  const utils = trpc.useUtils();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [number, setNumber] = useState("");
  const [position, setPosition] = useState("");

  const createPlayer = trpc.players.create.useMutation({
    onSuccess: () => {
      utils.players.list.invalidate();
      toast.success("Jogador adicionado!");
      setName("");
      setNumber("");
      setPosition("");
      // Modal permanece aberto para adicionar mais jogadores
    },
    onError: (error) => toast.error(error.message)
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Nome do jogador é obrigatório");
      return;
    }
    createPlayer.mutate({
      name: name.trim(),
      teamId,
      number: number ? parseInt(number) : undefined,
      position: position || undefined,
      campaignId
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" title={`Adicionar jogador ao ${teamName}`}>
          <UserPlus className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Adicionar Jogador ao {teamName}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="playerName">Nome do Jogador *</Label>
            <Input
              id="playerName"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nome completo"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="playerNumber">Número</Label>
              <Input
                id="playerNumber"
                type="number"
                value={number}
                onChange={(e) => setNumber(e.target.value)}
                placeholder="Ex: 10"
                min="1"
                max="99"
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
          </div>
          <Button type="submit" className="w-full" disabled={createPlayer.isPending}>
            {createPlayer.isPending ? "Adicionando..." : "Adicionar Jogador"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ==================== TEAM SUPPORT MESSAGE BUTTON ====================
function TeamSupportMessageButton({ teamId, teamName, currentMessage }: { teamId: number; teamName: string; currentMessage: string | null }) {
  const utils = trpc.useUtils();
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState(currentMessage || "");

  const updateTeam = trpc.teams.update.useMutation({
    onSuccess: () => {
      utils.teams.list.invalidate();
      toast.success("Mensagem de apoio atualizada!");
      setOpen(false);
    },
    onError: (error) => toast.error(error.message)
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateTeam.mutate({
      id: teamId,
      supportMessage: message.trim() || null
    });
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      setOpen(isOpen);
      if (isOpen) setMessage(currentMessage || "");
    }}>
      <DialogTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          title={`Mensagem de apoio - ${teamName}`}
          className={currentMessage ? "text-gold" : ""}
        >
          <MessageSquare className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Mensagem de Apoio - {teamName}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="supportMessage">Mensagem</Label>
            <Textarea
              id="supportMessage"
              value={message}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setMessage(e.target.value)}
              placeholder="Ex: Vai com tudo, time! Estamos torcendo por vocês!"
              rows={3}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Esta mensagem aparecerá na página do time
            </p>
          </div>
          <div className="flex gap-2">
            <Button type="submit" className="flex-1" disabled={updateTeam.isPending}>
              {updateTeam.isPending ? "Salvando..." : "Salvar"}
            </Button>
            {currentMessage && (
              <Button 
                type="button" 
                variant="outline"
                onClick={() => {
                  setMessage("");
                  updateTeam.mutate({ id: teamId, supportMessage: null });
                }}
                disabled={updateTeam.isPending}
              >
                Remover
              </Button>
            )}
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ==================== PLAYERS TAB ====================
function PlayersTab({ campaignId }: { campaignId: number }) {
  const utils = trpc.useUtils();
  const { data: players, isLoading } = trpc.players.list.useQuery({ campaignId });
  const { data: teams } = trpc.teams.list.useQuery({ campaignId });
  const { data: groups } = trpc.groups.list.useQuery({ campaignId });
  const createPlayer = trpc.players.create.useMutation({
    onSuccess: () => {
      utils.players.list.invalidate();
      toast.success("Jogador criado!");
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
  const updatePlayer = trpc.players.update.useMutation({
    onSuccess: () => {
      utils.players.list.invalidate();
      toast.success("Jogador atualizado!");
      setEditOpen(false);
      setEditingPlayer(null);
    },
    onError: (error) => toast.error(error.message)
  });

  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState<any>(null);
  const [editName, setEditName] = useState("");
  const [editNumber, setEditNumber] = useState("");
  const [editPosition, setEditPosition] = useState("");
  const [editTeamId, setEditTeamId] = useState("");
  const [editPhotoUrl, setEditPhotoUrl] = useState("");
  const [editUploading, setEditUploading] = useState(false);
  const editFileInputRef = useRef<HTMLInputElement>(null);
  const [name, setName] = useState("");
  const [number, setNumber] = useState("");
  const [position, setPosition] = useState("");
  const [teamId, setTeamId] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Estado para expand/collapse
  const [expandedGroups, setExpandedGroups] = useState<Set<number>>(new Set());
  const [expandedLodges, setExpandedLodges] = useState<Set<string>>(new Set());

  const resetForm = () => {
    setName("");
    setNumber("");
    setPosition("");
    setTeamId("");
    setPhotoUrl("");
  };

  const uploadImage = trpc.upload.image.useMutation();

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Arquivo muito grande. Máximo 5MB.");
      return;
    }
    
    setUploading(true);
    try {
      // Converter arquivo para base64
      const reader = new FileReader();
      reader.onload = async () => {
        const base64 = (reader.result as string).split(',')[1];
        const result = await uploadImage.mutateAsync({
          base64,
          mimeType: file.type,
          folder: 'players',
        });
        setPhotoUrl(result.url);
        toast.success("Foto enviada!");
        setUploading(false);
      };
      reader.onerror = () => {
        toast.error("Erro ao ler arquivo");
        setUploading(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      toast.error("Erro ao enviar foto");
      setUploading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createPlayer.mutate({
      name,
      number: number ? parseInt(number) : undefined,
      position: position || undefined,
      teamId: parseInt(teamId),
      photoUrl: photoUrl || undefined,
      campaignId
    });
  };

  const handleEditPhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Arquivo muito grande. Máximo 5MB.");
      return;
    }
    
    setEditUploading(true);
    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64 = (reader.result as string).split(',')[1];
        const result = await uploadImage.mutateAsync({
          base64,
          mimeType: file.type,
          folder: 'players',
        });
        setEditPhotoUrl(result.url);
        toast.success("Foto enviada!");
        setEditUploading(false);
      };
      reader.onerror = () => {
        toast.error("Erro ao ler arquivo");
        setEditUploading(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      toast.error("Erro ao enviar foto");
      setEditUploading(false);
    }
  };

  const openEditDialog = (player: any) => {
    setEditingPlayer(player);
    setEditName(player.name);
    setEditNumber(player.number?.toString() || "");
    setEditPosition(player.position || "");
    setEditTeamId(player.teamId.toString());
    setEditPhotoUrl(player.photoUrl || "");
    setEditOpen(true);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPlayer) return;
    updatePlayer.mutate({
      id: editingPlayer.id,
      name: editName,
      number: editNumber ? parseInt(editNumber) : undefined,
      position: editPosition || undefined,
      teamId: parseInt(editTeamId),
      photoUrl: editPhotoUrl || undefined
    });
  };

  const toggleGroup = (groupId: number) => {
    setExpandedGroups(prev => {
      const newSet = new Set(prev);
      if (newSet.has(groupId)) {
        newSet.delete(groupId);
      } else {
        newSet.add(groupId);
      }
      return newSet;
    });
  };

  const toggleLodge = (lodgeKey: string) => {
    setExpandedLodges(prev => {
      const newSet = new Set(prev);
      if (newSet.has(lodgeKey)) {
        newSet.delete(lodgeKey);
      } else {
        newSet.add(lodgeKey);
      }
      return newSet;
    });
  };

  // Organizar jogadores por Grupo > Loja
  const organizedPlayers = useMemo(() => {
    if (!players || !teams || !groups) return [];
    
    const groupMap = new Map<number, {
      group: typeof groups[0];
      lodges: Map<string, {
        lodge: string;
        team: typeof teams[0];
        players: typeof players;
      }>;
    }>();
    
    // Inicializar grupos
    groups.forEach(group => {
      groupMap.set(group.id, { group, lodges: new Map() });
    });
    
    // Grupo "Sem Grupo" para times sem grupo
    groupMap.set(0, { group: { id: 0, campaignId: 1, name: "Sem Grupo", createdAt: new Date() }, lodges: new Map() });
    
    // Organizar por grupo e loja (incluindo teamId para separar times com mesma loja)
    players.forEach(player => {
      const team = teams.find(t => t.id === player.teamId);
      if (!team) return;
      
      const groupId = team.groupId || 0;
      const lodge = team.lodge || "Sem Loja";
      const lodgeKey = `${groupId}-${lodge}-${team.id}`; // Incluir teamId para separar times
      
      const groupData = groupMap.get(groupId);
      if (!groupData) return;
      
      if (!groupData.lodges.has(lodgeKey)) {
        groupData.lodges.set(lodgeKey, { lodge, team, players: [] });
      }
      groupData.lodges.get(lodgeKey)!.players.push(player);
    });
    
    // Converter para array e filtrar grupos vazios
    return Array.from(groupMap.values())
      .filter(g => g.lodges.size > 0)
      .sort((a, b) => a.group.name.localeCompare(b.group.name));
  }, [players, teams, groups]);

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
                      <SelectItem key={t.id} value={t.id.toString()}>
                        {t.name} {t.lodge && `(${t.lodge})`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Foto do Jogador</Label>
                <div className="flex items-center gap-3 mt-2">
                  {photoUrl ? (
                    <img src={photoUrl} alt="Foto" className="h-16 w-16 rounded-full object-cover border" />
                  ) : (
                    <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center border">
                      <Users className="h-6 w-6 text-muted-foreground" />
                    </div>
                  )}
                  <div className="flex-1">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      className="hidden"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploading}
                    >
                      {uploading ? "Enviando..." : photoUrl ? "Trocar Foto" : "Escolher Foto"}
                    </Button>
                  </div>
                </div>
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
        ) : organizedPlayers.length > 0 ? (
          <div className="space-y-3">
            {organizedPlayers.map((groupData: any) => (
              <div key={groupData.group.id} className="border rounded-lg overflow-hidden">
                {/* Cabeçalho do Grupo */}
                <button
                  onClick={() => toggleGroup(groupData.group.id)}
                  className="w-full flex items-center justify-between p-3 bg-primary/10 hover:bg-primary/20 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    {expandedGroups.has(groupData.group.id) ? (
                      <ChevronDown className="h-5 w-5" />
                    ) : (
                      <ChevronRight className="h-5 w-5" />
                    )}
                    <Trophy className="h-4 w-4 text-primary" />
                    <span className="font-bold">{groupData.group.name}</span>
                  </div>
                  <Badge variant="secondary">
                    {Array.from(groupData.lodges.values()).reduce((acc: number, l: any) => acc + l.players.length, 0)} jogadores
                  </Badge>
                </button>
                
                {/* Lojas do Grupo */}
                {expandedGroups.has(groupData.group.id) && (
                  <div className="pl-4">
                    {Array.from(groupData.lodges.values()).map((lodgeData: any) => {
                      const lodgeKey = `${groupData.group.id}-${lodgeData.lodge}`;
                      return (
                        <div key={lodgeKey} className="border-l-2 border-primary/30">
                          {/* Cabeçalho da Loja */}
                          <button
                            onClick={() => toggleLodge(lodgeKey)}
                            className="w-full flex items-center justify-between p-2 pl-4 bg-muted/50 hover:bg-muted transition-colors"
                          >
                            <div className="flex items-center gap-2">
                              {expandedLodges.has(lodgeKey) ? (
                                <ChevronDown className="h-4 w-4" />
                              ) : (
                                <ChevronRight className="h-4 w-4" />
                              )}
                              <Shield className="h-4 w-4 text-muted-foreground" />
                              <span className="font-medium text-sm">{lodgeData.team.name}</span>
                              <span className="text-xs text-muted-foreground">({lodgeData.lodge === "Sem Loja" ? "subtítulo" : lodgeData.lodge})</span>
                            </div>
                            <Badge variant="outline" className="text-xs">
                              {lodgeData.players.length}
                            </Badge>
                          </button>
                          
                          {/* Jogadores da Loja */}
                          {expandedLodges.has(lodgeKey) && (
                            <div className="pl-8 py-2 space-y-1">
                              {lodgeData.players.map((player: any) => (
                                <div key={player.id} className="flex items-center justify-between p-2 bg-background rounded hover:bg-muted/30">
                                  <div className="flex items-center gap-2">
                                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-sm">
                                      <span className="font-bold text-primary">{player.number || "-"}</span>
                                    </div>
                                    <div>
                                      <p className="font-medium text-sm">{player.name}</p>
                                      {player.position && (
                                        <p className="text-xs text-muted-foreground">{player.position}</p>
                                      )}
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-8 w-8"
                                      onClick={() => openEditDialog(player)}
                                    >
                                      <Edit className="h-4 w-4" />
                                    </Button>
                                    <ConfirmDeleteDialog
                                      title="Excluir Jogador"
                                      description={`Você está prestes a excluir o jogador "${player.name}". Todos os gols e cartões registrados serão removidos.`}
                                      requireTyping={false}
                                      onConfirm={() => deletePlayer.mutate({ id: player.id })}
                                      isDeleting={deletePlayer.isPending}
                                      className="h-8 w-8"
                                    />
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-muted-foreground py-8">Nenhum jogador cadastrado</p>
        )}
      </CardContent>

      {/* Dialog de Edição de Jogador */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Jogador</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditSubmit} className="space-y-4">
            <div>
              <Label htmlFor="editPlayerName">Nome *</Label>
              <Input 
                id="editPlayerName" 
                value={editName} 
                onChange={(e) => setEditName(e.target.value)} 
                required 
              />
            </div>
            <div>
              <Label htmlFor="editPlayerNumber">Número</Label>
              <Input 
                id="editPlayerNumber" 
                type="number"
                value={editNumber} 
                onChange={(e) => setEditNumber(e.target.value)} 
              />
            </div>
            <div>
              <Label htmlFor="editPlayerPosition">Posição</Label>
              <Select value={editPosition} onValueChange={setEditPosition}>
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
              <Label htmlFor="editPlayerTeam">Time *</Label>
              <Select value={editTeamId} onValueChange={setEditTeamId} required>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o time" />
                </SelectTrigger>
                <SelectContent>
                  {teams?.map(t => (
                    <SelectItem key={t.id} value={t.id.toString()}>
                      {t.name} {t.lodge && `(${t.lodge})`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Foto do Jogador</Label>
              <div className="flex items-center gap-3 mt-2">
                {editPhotoUrl ? (
                  <img src={editPhotoUrl} alt="Foto" className="h-16 w-16 rounded-full object-cover border" />
                ) : (
                  <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center border">
                    <Users className="h-6 w-6 text-muted-foreground" />
                  </div>
                )}
                <div className="flex-1">
                  <input
                    ref={editFileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleEditPhotoUpload}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => editFileInputRef.current?.click()}
                    disabled={editUploading}
                  >
                    {editUploading ? "Enviando..." : editPhotoUrl ? "Trocar Foto" : "Escolher Foto"}
                  </Button>
                </div>
              </div>
            </div>
            <Button type="submit" className="w-full" disabled={updatePlayer.isPending || !editTeamId}>
              {updatePlayer.isPending ? "Salvando..." : "Salvar Alterações"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

// ==================== GROUPS TAB ====================
function GroupsTab({ campaignId }: { campaignId: number }) {
  const utils = trpc.useUtils();
  const { data: groups, isLoading } = trpc.groups.list.useQuery({ campaignId });
  const { data: teams } = trpc.teams.list.useQuery({ campaignId });
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
    createGroup.mutate({ name, campaignId });
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
                      <ConfirmDeleteDialog
                        title="Excluir Grupo"
                        description={`Você está prestes a excluir o grupo "${group.name}". Todos os times serão removidos do grupo e os jogos relacionados poderão ser afetados.`}
                        requireTyping={true}
                        onConfirm={() => deleteGroup.mutate({ id: group.id })}
                        isDeleting={deleteGroup.isPending}
                      />
                    </div>
                    <div className="space-y-1">
                      {getTeamsInGroup(group.id).length > 0 ? (
                        getTeamsInGroup(group.id).map(team => (
                          <div key={team.id} className="flex items-center justify-between p-2 bg-background rounded">
                            <div className="flex flex-col">
                              <span className="text-sm font-medium">{team.name}</span>
                              {team.lodge && (
                                <span className="text-xs text-muted-foreground">{team.lodge}</span>
                              )}
                            </div>
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
function MatchesTab({ campaignId }: { campaignId: number }) {
  const utils = trpc.useUtils();
  const { data: matches, isLoading } = trpc.matches.list.useQuery({ campaignId });
  const { data: teams } = trpc.teams.list.useQuery({ campaignId });
  const { data: groups } = trpc.groups.list.useQuery({ campaignId });
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
      bracketSide: (bracketSide as 'left' | 'right' | undefined) || undefined,
      campaignId
    });
  };

  const getTeamName = (id: number) => teams?.find(t => t.id === id)?.name || "Time";
  const getTeamNameWithLodge = (id: number) => {
    const team = teams?.find(t => t.id === id);
    if (!team) return "Time";
    return team.lodge ? `${team.name} (${team.lodge})` : team.name;
  };
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
                ) : phase !== "final" ? (
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
                ) : null}
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
                    {getTeamNameWithLodge(match.homeTeamId)} 
                    {match.played ? ` ${match.homeScore} x ${match.awayScore} ` : " vs "}
                    {getTeamNameWithLodge(match.awayTeamId)}
                  </p>
                  {match.matchDate && (
                    <p className="text-xs text-muted-foreground mt-1">
                      📅 {new Date(match.matchDate).toLocaleDateString('pt-BR')} às {new Date(match.matchDate).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                      {match.location && ` • 📍 ${match.location}`}
                    </p>
                  )}
                </div>
                <ConfirmDeleteDialog
                  title="Excluir Jogo"
                  description={`Você está prestes a excluir o jogo "${getTeamNameWithLodge(match.homeTeamId)} vs ${getTeamNameWithLodge(match.awayTeamId)}". Resultados, gols e cartões registrados serão removidos.`}
                  requireTyping={false}
                  onConfirm={() => deleteMatch.mutate({ id: match.id })}
                  isDeleting={deleteMatch.isPending}
                />
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
function ResultsTab({ campaignId }: { campaignId: number }) {
  return <ResultsRegistration campaignId={campaignId} />;
}

function ResultsTabOld({ campaignId }: { campaignId: number }) {
  const utils = trpc.useUtils();
  const { data: matches } = trpc.matches.list.useQuery({ campaignId });
  const { data: teams } = trpc.teams.list.useQuery({ campaignId });
  const { data: players } = trpc.players.list.useQuery({ campaignId });
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
  const getTeamNameWithLodge = (id: number) => {
    const team = teams?.find(t => t.id === id);
    if (!team) return "Time";
    return team.lodge ? `${team.name} (${team.lodge})` : team.name;
  };
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
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-xs opacity-70 mb-1">
                        {match.phase === 'groups' ? 'Fase de Grupos' : match.phase === 'round16' ? 'Oitavas' : match.phase === 'quarters' ? 'Quartas' : match.phase === 'semis' ? 'Semi' : 'Final'}
                        {match.round && ` - R${match.round}`}
                      </p>
                      <p className="font-medium">
                        {getTeamNameWithLodge(match.homeTeamId)} vs {getTeamNameWithLodge(match.awayTeamId)}
                      </p>
                    </div>
                    {match.matchDate && (
                      <span className="text-xs opacity-70">
                        {new Date(match.matchDate).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
                        {' '}{new Date(match.matchDate).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    )}
                  </div>
                  <Badge variant="outline" className="mt-2">Pendente</Badge>
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
                  <p className="font-bold mb-2">{getTeamNameWithLodge(selectedMatchData.homeTeamId)}</p>
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
                  <p className="font-bold mb-2">{getTeamNameWithLodge(selectedMatchData.awayTeamId)}</p>
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
                    <Label>Pênaltis {getTeamNameWithLodge(selectedMatchData.homeTeamId)}</Label>
                    <Input 
                      type="number" 
                      value={homePenalties} 
                      onChange={(e) => setHomePenalties(e.target.value)}
                      min="0"
                    />
                  </div>
                  <div>
                    <Label>Pênaltis {getTeamNameWithLodge(selectedMatchData.awayTeamId)}</Label>
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
                      {getTeamNameWithLodge(selectedMatchData.homeTeamId)}
                    </SelectItem>
                    <SelectItem value={selectedMatchData.awayTeamId.toString()}>
                      {getTeamNameWithLodge(selectedMatchData.awayTeamId)}
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
                      {getTeamNameWithLodge(selectedMatchData.homeTeamId)}
                    </SelectItem>
                    <SelectItem value={selectedMatchData.awayTeamId.toString()}>
                      {getTeamNameWithLodge(selectedMatchData.awayTeamId)}
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
function PhotosTab({ campaignId }: { campaignId: number }) {
  const utils = trpc.useUtils();
  const { data: photos, isLoading } = trpc.photos.list.useQuery({ limit: 100, campaignId });
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
        caption: caption || undefined,
        campaignId
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
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <ConfirmDeleteDialog
                    title="Excluir Foto"
                    description="Você está prestes a excluir esta foto da galeria. Esta ação não pode ser desfeita."
                    requireTyping={false}
                    onConfirm={() => deletePhoto.mutate({ id: photo.id })}
                    isDeleting={deletePhoto.isPending}
                    variant="destructive"
                  />
                </div>
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
function CommentsTab({ campaignId }: { campaignId: number }) {
  const utils = trpc.useUtils();
  const { data: allComments, isLoading } = trpc.comments.listAll.useQuery({ limit: 100, campaignId });
  const approveComment = trpc.comments.approve.useMutation({
    onSuccess: () => {
      utils.comments.listAll.invalidate();
      utils.comments.list.invalidate();
      toast.success("Comentário aprovado!");
    },
    onError: (error) => toast.error(error.message)
  });
  const deleteComment = trpc.comments.delete.useMutation({
    onSuccess: () => {
      utils.comments.listAll.invalidate();
      utils.comments.list.invalidate();
      toast.success("Comentário excluído!");
    },
    onError: (error) => toast.error(error.message)
  });

  const pendingComments = allComments?.filter((c: any) => !c.approved) || [];
  const approvedComments = allComments?.filter((c: any) => c.approved) || [];

  return (
    <div className="space-y-6">
      {/* Comentários Pendentes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-amber-500"></span>
            Pendentes de Aprovação ({pendingComments.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              {[1, 2, 3].map(i => <Skeleton key={i} className="h-20 w-full" />)}
            </div>
          ) : pendingComments.length > 0 ? (
            <div className="space-y-2">
              {pendingComments.map((comment: any) => (
                <div key={comment.id} className="flex items-start justify-between p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium">{comment.authorName}</span>
                      {comment.authorLodge && (
                        <Badge variant="outline" className="text-xs">{comment.authorLodge}</Badge>
                      )}
                      <Badge variant="outline" className="text-xs bg-amber-100 text-amber-800 border-amber-300">
                        Pendente
                      </Badge>
                    </div>
                    <p className="text-sm">{comment.content}</p>
                  </div>
                  <div className="flex gap-1 ml-2">
                    <Button 
                      variant="ghost" 
                      size="icon"
                      className="text-green-600 hover:text-green-700 hover:bg-green-100"
                      onClick={() => approveComment.mutate({ id: comment.id })}
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                    <ConfirmDeleteDialog
                      title="Excluir Comentário"
                      description={`Você está prestes a excluir o comentário de "${comment.authorName}".`}
                      requireTyping={false}
                      onConfirm={() => deleteComment.mutate({ id: comment.id })}
                      isDeleting={deleteComment.isPending}
                      className="text-destructive hover:text-destructive hover:bg-red-100"
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-4">Nenhum comentário pendente</p>
          )}
        </CardContent>
      </Card>

      {/* Comentários Aprovados */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-green-500"></span>
            Aprovados ({approvedComments.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {approvedComments.length > 0 ? (
            <div className="space-y-2">
              {approvedComments.map((comment: any) => (
                <div key={comment.id} className="flex items-start justify-between p-3 bg-muted rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium">{comment.authorName}</span>
                      {comment.authorLodge && (
                        <Badge variant="outline" className="text-xs">{comment.authorLodge}</Badge>
                      )}
                      <Badge variant="outline" className="text-xs bg-green-100 text-green-800 border-green-300">
                        Aprovado
                      </Badge>
                    </div>
                    <p className="text-sm">{comment.content}</p>
                  </div>
                  <ConfirmDeleteDialog
                    title="Excluir Comentário"
                    description={`Você está prestes a excluir o comentário de "${comment.authorName}".`}
                    requireTyping={false}
                    onConfirm={() => deleteComment.mutate({ id: comment.id })}
                    isDeleting={deleteComment.isPending}
                  />
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-4">Nenhum comentário aprovado</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}


// ==================== ANNOUNCEMENTS TAB ====================
function AnnouncementsTab({ campaignId }: { campaignId: number }) {
  const utils = trpc.useUtils();
  const { data: announcements, isLoading } = trpc.announcements.list.useQuery({ campaignId });
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
    createAnnouncement.mutate({ title, content, active: true, campaignId });
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
                    <ConfirmDeleteDialog
                      title="Excluir Aviso"
                      description={`Você está prestes a excluir o aviso "${announcement.title}".`}
                      requireTyping={false}
                      onConfirm={() => deleteAnnouncement.mutate({ id: announcement.id })}
                      isDeleting={deleteAnnouncement.isPending}
                      variant="destructive"
                      size="sm"
                    />
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
function AdminsTab({ campaignId }: { campaignId: number }) {
  const utils = trpc.useUtils();
  const { adminUser } = useAdminAuth();
  const { data: adminUsers, isLoading } = trpc.adminUsers.list.useQuery({ campaignId });
  
  const createAdmin = trpc.adminUsers.create.useMutation({
    onSuccess: () => {
      utils.adminUsers.list.invalidate();
      toast.success("Administrador criado com sucesso!");
      setUsername("");
      setPassword("");
      setName("");
    },
    onError: (error: any) => toast.error(error.message || "Erro ao criar administrador")
  });
  
  const deleteAdmin = trpc.adminUsers.delete.useMutation({
    onSuccess: () => {
      utils.adminUsers.list.invalidate();
      toast.success("Administrador removido!");
    },
    onError: (error: any) => toast.error(error.message || "Erro ao remover administrador")
  });

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");

  const handleCreate = () => {
    if (!username || !password) {
      toast.error("Preencha login e senha!");
      return;
    }
    if (password.length < 4) {
      toast.error("Senha deve ter no mínimo 4 caracteres!");
      return;
    }
    createAdmin.mutate({ username, password, name: name || undefined, isOwner: false, campaignId });
  };

  const isOwner = adminUser?.isOwner || false;

  return (
    <div className="space-y-6">
      {/* Add Admin - apenas para owner */}
      {isOwner ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5" />
              Criar Novo Administrador
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Apenas o administrador principal pode criar novos admins
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Login (Username)</Label>
              <Input 
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Digite o login"
              />
            </div>
            <div>
              <Label>Senha</Label>
              <Input 
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mínimo 4 caracteres"
              />
            </div>
            <div>
              <Label>Nome (opcional)</Label>
              <Input 
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nome completo"
              />
            </div>
            <Button 
              onClick={handleCreate}
              disabled={createAdmin.isPending}
              className="w-full"
            >
              {createAdmin.isPending ? "Criando..." : "Criar Administrador"}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="py-8 text-center">
            <Shield className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Permissão Restrita</h3>
            <p className="text-muted-foreground">
              Apenas o administrador principal pode criar novos administradores.
            </p>
          </CardContent>
        </Card>
      )}

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
          ) : adminUsers && adminUsers.length > 0 ? (
            <div className="space-y-2">
              {adminUsers.map((admin: any) => (
                <div 
                  key={admin.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-primary" />
                    <div>
                      <p className="font-medium">{admin.username}</p>
                      {admin.name && <p className="text-sm text-muted-foreground">{admin.name}</p>}
                      {admin.isOwner && (
                        <Badge variant="secondary" className="text-xs mt-1">Administrador Principal</Badge>
                      )}
                    </div>
                  </div>
                  {isOwner && !admin.isOwner && (
                    <ConfirmDeleteDialog
                      title="Remover Administrador"
                      description={`Você está prestes a remover o administrador "${admin.username}". Ele perderá acesso ao painel.`}
                      requireTyping={true}
                      onConfirm={() => deleteAdmin.mutate({ id: admin.id })}
                      isDeleting={deleteAdmin.isPending}
                      variant="destructive"
                      size="sm"
                    >
                      <Button variant="destructive" size="sm">
                        Remover
                      </Button>
                    </ConfirmDeleteDialog>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">Nenhum administrador cadastrado</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// ==================== SETTINGS TAB ====================
function SettingsTab({ campaignId }: { campaignId: number }) {
  const utils = trpc.useUtils();
  const { data: tournamentName } = trpc.settings.get.useQuery({ key: "tournamentName", campaignId });
  const { data: tournamentSubtitle } = trpc.settings.get.useQuery({ key: "tournamentSubtitle", campaignId });
  const { data: tournamentOrganizer } = trpc.settings.get.useQuery({ key: "tournamentOrganizer", campaignId });
  const { data: tournamentLogo } = trpc.settings.get.useQuery({ key: "tournamentLogo", campaignId });

  const { data: tournamentBackground } = trpc.settings.get.useQuery({ key: "tournamentBackground", campaignId });
  const { data: heroBackground } = trpc.settings.get.useQuery({ key: "heroBackground", campaignId });
  
  // Configurações de torneio
  const { data: tournamentType } = trpc.settings.get.useQuery({ key: "tournamentType", campaignId });
  const { data: teamsQualifyPerGroup } = trpc.settings.get.useQuery({ key: "teamsQualifyPerGroup", campaignId });
  const { data: knockoutSize } = trpc.settings.get.useQuery({ key: "knockoutSize", campaignId });

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
  
  // Estados para configurações de torneio
  const [selectedTournamentType, setSelectedTournamentType] = useState("groups_knockout");
  const [selectedTeamsQualify, setSelectedTeamsQualify] = useState("2");
  const [selectedKnockoutSize, setSelectedKnockoutSize] = useState("8");

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

  useEffect(() => {
    if (tournamentType) setSelectedTournamentType(tournamentType);
  }, [tournamentType]);

  useEffect(() => {
    if (teamsQualifyPerGroup) setSelectedTeamsQualify(teamsQualifyPerGroup);
  }, [teamsQualifyPerGroup]);

  useEffect(() => {
    if (knockoutSize) setSelectedKnockoutSize(knockoutSize);
  }, [knockoutSize]);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result?.toString().split(',')[1];
      if (base64) {
        uploadLogo.mutate({
          base64,
          mimeType: file.type,
          campaignId
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
          mimeType: file.type,
          campaignId
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
          mimeType: file.type,
          campaignId
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
              onClick={() => setSetting.mutate({ key: "tournamentName", value: name, campaignId })}
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
              onClick={() => setSetting.mutate({ key: "tournamentSubtitle", value: subtitle, campaignId })}
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
               placeholder="Ex: Organizado pelo Time Campeão"
            />
            <Button 
              onClick={() => setSetting.mutate({ key: "tournamentOrganizer", value: organizer, campaignId })}
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
                src={`${tournamentLogo}?v=${Date.now()}`} 
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



          {/* Imagem de Fundo da Seção Hero (Laranja) */}
          <div>
            <Label>Imagem de Fundo da Seção Hero (parte laranja)</Label>
            <p className="text-xs text-muted-foreground mb-2">
              Esta imagem aparece na seção principal do site, onde fica o logo e os botões.
            </p>
            {heroBackground && (
              <img 
                src={`${heroBackground}?v=${Date.now()}`} 
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
                src={`${tournamentBackground}?v=${Date.now()}`} 
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

      {/* Configurações de Formato do Torneio */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Formato do Torneio
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Tipo de Campeonato */}
          <div>
            <Label>Tipo de Campeonato</Label>
            <p className="text-xs text-muted-foreground mb-2">
              Define se o campeonato terá fase de grupos, mata-mata ou ambos.
            </p>
            <Select value={selectedTournamentType} onValueChange={setSelectedTournamentType}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="groups_only">Apenas Fase de Grupos</SelectItem>
                <SelectItem value="knockout_only">Apenas Mata-Mata</SelectItem>
                <SelectItem value="groups_knockout">Grupos + Mata-Mata</SelectItem>
              </SelectContent>
            </Select>
            <Button 
              onClick={() => setSetting.mutate({ key: "tournamentType", value: selectedTournamentType, campaignId })}
              disabled={setSetting.isPending}
              className="mt-2"
              size="sm"
            >
              Salvar Tipo
            </Button>
          </div>

          {/* Quantos classificam por grupo */}
          {selectedTournamentType !== "knockout_only" && (
            <div>
              <Label>Quantos times classificam por grupo?</Label>
              <p className="text-xs text-muted-foreground mb-2">
                Define quantos primeiros colocados de cada grupo avançam para o mata-mata.
              </p>
              <Select value={selectedTeamsQualify} onValueChange={setSelectedTeamsQualify}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 time por grupo</SelectItem>
                  <SelectItem value="2">2 times por grupo</SelectItem>
                  <SelectItem value="3">3 times por grupo</SelectItem>
                  <SelectItem value="4">4 times por grupo</SelectItem>
                </SelectContent>
              </Select>
              <Button 
                onClick={() => setSetting.mutate({ key: "teamsQualifyPerGroup", value: selectedTeamsQualify, campaignId })}
                disabled={setSetting.isPending}
                className="mt-2"
                size="sm"
              >
                Salvar Classificados
              </Button>
            </div>
          )}

          {/* Tamanho do Mata-Mata */}
          {selectedTournamentType !== "groups_only" && (
            <div>
              <Label>Tamanho do Mata-Mata</Label>
              <p className="text-xs text-muted-foreground mb-2">
                Quantos times participam do mata-mata. Se houver número ímpar, alguns times passam direto (BYE).
              </p>
              <Select value={selectedKnockoutSize} onValueChange={setSelectedKnockoutSize}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="4">4 times (Semi + Final)</SelectItem>
                  <SelectItem value="8">8 times (Quartas + Semi + Final)</SelectItem>
                  <SelectItem value="16">16 times (Oitavas + Quartas + Semi + Final)</SelectItem>
                  <SelectItem value="32">32 times (16-avos + Oitavas + Quartas + Semi + Final)</SelectItem>
                </SelectContent>
              </Select>
              <Button 
                onClick={() => setSetting.mutate({ key: "knockoutSize", value: selectedKnockoutSize, campaignId })}
                disabled={setSetting.isPending}
                className="mt-2"
                size="sm"
              >
                Salvar Tamanho
              </Button>
            </div>
          )}

          {/* Resumo das configurações */}
          <div className="bg-muted/50 p-4 rounded-lg">
            <h4 className="font-semibold mb-2">Resumo do Formato</h4>
            <ul className="text-sm space-y-1">
              <li>
                <strong>Tipo:</strong>{" "}
                {selectedTournamentType === "groups_only" && "Apenas Fase de Grupos"}
                {selectedTournamentType === "knockout_only" && "Apenas Mata-Mata"}
                {selectedTournamentType === "groups_knockout" && "Grupos + Mata-Mata"}
              </li>
              {selectedTournamentType !== "knockout_only" && (
                <li>
                  <strong>Classificados por grupo:</strong> {selectedTeamsQualify} time(s)
                </li>
              )}
              {selectedTournamentType !== "groups_only" && (
                <li>
                  <strong>Mata-mata:</strong> {selectedKnockoutSize} times
                  {selectedKnockoutSize === "4" && " (Semifinal + Final)"}
                  {selectedKnockoutSize === "8" && " (Quartas + Semi + Final)"}
                  {selectedKnockoutSize === "16" && " (Oitavas + Quartas + Semi + Final)"}
                  {selectedKnockoutSize === "32" && " (16-avos + Oitavas + Quartas + Semi + Final)"}
                </li>
              )}
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


// ==================== SPONSORS TAB ====================
function SponsorsTab({ campaignId }: { campaignId: number }) {
  const utils = trpc.useUtils();
  const { data: sponsors, isLoading } = trpc.sponsors.listAdmin.useQuery({ campaignId });
  const { data: sponsorMessage } = trpc.settings.get.useQuery({ key: "sponsorMessage", campaignId });
  
  const createSponsor = trpc.sponsors.create.useMutation({
    onSuccess: () => {
      utils.sponsors.listAdmin.invalidate();
      toast.success("Patrocinador criado com sucesso!");
      setOpen(false);
      resetForm();
    },
    onError: (error) => toast.error(error.message)
  });
  
  const updateSponsor = trpc.sponsors.update.useMutation({
    onSuccess: () => {
      utils.sponsors.listAdmin.invalidate();
      toast.success("Patrocinador atualizado!");
    },
    onError: (error) => toast.error(error.message)
  });
  
  const deleteSponsor = trpc.sponsors.delete.useMutation({
    onSuccess: () => {
      utils.sponsors.listAdmin.invalidate();
      toast.success("Patrocinador removido!");
    },
    onError: (error) => toast.error(error.message)
  });
  
  const uploadLogo = trpc.sponsors.uploadLogo.useMutation({
    onSuccess: () => {
      utils.sponsors.listAdmin.invalidate();
      toast.success("Logo atualizado!");
    },
    onError: (error) => toast.error(error.message)
  });
  
  const setSetting = trpc.settings.set.useMutation({
    onSuccess: () => {
      utils.settings.get.invalidate();
      toast.success("Mensagem salva!");
    },
    onError: (error) => toast.error(error.message)
  });

  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [tier, setTier] = useState<"A" | "B" | "C">("C");
  const [link, setLink] = useState("");
  const [description, setDescription] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (sponsorMessage) setMessage(sponsorMessage);
  }, [sponsorMessage]);

  const resetForm = () => {
    setName("");
    setTier("C");
    setLink("");
    setDescription("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createSponsor.mutate({
      name,
      tier,
      link: link || undefined,
      description: description || undefined,
      active: true,
      campaignId
    });
  };

  const handleLogoUpload = (sponsorId: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result?.toString().split(',')[1];
      if (base64) {
        uploadLogo.mutate({
          sponsorId,
          base64,
          mimeType: file.type
        });
      }
    };
    reader.readAsDataURL(file);
  };

  const tierLabels: Record<string, string> = {
    A: "Principal",
    B: "Patrocinador",
    C: "Apoiador"
  };

  const tierColors: Record<string, string> = {
    A: "bg-gold text-black",
    B: "bg-secondary",
    C: "bg-muted"
  };

  // Separar por tier
  const tierA = sponsors?.filter(s => s.tier === "A") || [];
  const tierB = sponsors?.filter(s => s.tier === "B") || [];
  const tierC = sponsors?.filter(s => s.tier === "C") || [];

  return (
    <div className="space-y-6">
      {/* Mensagem de Agradecimento */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5" />
            Mensagem de Agradecimento
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Mensagem para exibir na seção de patrocinadores</Label>
            <Input 
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Ex: Agradecemos aos nossos patrocinadores pelo apoio!"
            />
            <Button 
              onClick={() => setSetting.mutate({ key: "sponsorMessage", value: message, campaignId })}
              disabled={setSetting.isPending}
              className="mt-2"
              size="sm"
            >
              Salvar Mensagem
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Criar Patrocinador */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Patrocinadores ({sponsors?.length || 0})</CardTitle>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Novo Patrocinador
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Cadastrar Patrocinador</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="sponsor-name">Nome *</Label>
                  <Input 
                    id="sponsor-name" 
                    value={name} 
                    onChange={(e) => setName(e.target.value)} 
                    required 
                  />
                </div>
                <div>
                  <Label htmlFor="sponsor-tier">Nível</Label>
                  <Select value={tier} onValueChange={(v) => setTier(v as "A" | "B" | "C")}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o nível" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="A">A - Principal (logo grande)</SelectItem>
                      <SelectItem value="B">B - Patrocinador (logo médio)</SelectItem>
                      <SelectItem value="C">C - Apoiador (logo pequeno)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="sponsor-link">Link (opcional)</Label>
                  <Input 
                    id="sponsor-link" 
                    value={link} 
                    onChange={(e) => setLink(e.target.value)} 
                    placeholder="https://..."
                  />
                </div>
                <div>
                  <Label htmlFor="sponsor-desc">Descrição (opcional)</Label>
                  <Input 
                    id="sponsor-desc" 
                    value={description} 
                    onChange={(e) => setDescription(e.target.value)} 
                  />
                </div>
                <Button type="submit" className="w-full" disabled={createSponsor.isPending}>
                  {createSponsor.isPending ? "Criando..." : "Criar Patrocinador"}
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
          ) : sponsors && sponsors.length > 0 ? (
            <div className="space-y-6">
              {/* Tier A */}
              {tierA.length > 0 && (
                <div>
                  <Badge className="mb-3 bg-gold text-black">Principais (Nível A)</Badge>
                  <div className="space-y-2">
                    {tierA.map((sponsor: any) => (
                      <SponsorRow 
                        key={sponsor.id} 
                        sponsor={sponsor} 
                        onLogoUpload={handleLogoUpload}
                        onUpdate={updateSponsor}
                        onDelete={deleteSponsor}
                        tierColors={tierColors}
                        tierLabels={tierLabels}
                      />
                    ))}
                  </div>
                </div>
              )}
              
              {/* Tier B */}
              {tierB.length > 0 && (
                <div>
                  <Badge variant="secondary" className="mb-3">Patrocinadores (Nível B)</Badge>
                  <div className="space-y-2">
                    {tierB.map((sponsor: any) => (
                      <SponsorRow 
                        key={sponsor.id} 
                        sponsor={sponsor} 
                        onLogoUpload={handleLogoUpload}
                        onUpdate={updateSponsor}
                        onDelete={deleteSponsor}
                        tierColors={tierColors}
                        tierLabels={tierLabels}
                      />
                    ))}
                  </div>
                </div>
              )}
              
              {/* Tier C */}
              {tierC.length > 0 && (
                <div>
                  <Badge variant="outline" className="mb-3">Apoiadores (Nível C)</Badge>
                  <div className="space-y-2">
                    {tierC.map((sponsor: any) => (
                      <SponsorRow 
                        key={sponsor.id} 
                        sponsor={sponsor} 
                        onLogoUpload={handleLogoUpload}
                        onUpdate={updateSponsor}
                        onDelete={deleteSponsor}
                        tierColors={tierColors}
                        tierLabels={tierLabels}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">
              Nenhum patrocinador cadastrado
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function SponsorRow({ 
  sponsor, 
  onLogoUpload, 
  onUpdate, 
  onDelete,
  tierColors,
  tierLabels
}: { 
  sponsor: any; 
  onLogoUpload: (id: number, e: React.ChangeEvent<HTMLInputElement>) => void;
  onUpdate: any;
  onDelete: any;
  tierColors: Record<string, string>;
  tierLabels: Record<string, string>;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="flex items-center justify-between p-3 border rounded-lg">
      <div className="flex items-center gap-3">
        {sponsor.logoUrl ? (
          <img 
            src={sponsor.logoUrl} 
            alt={sponsor.name}
            className="w-12 h-12 object-contain rounded"
          />
        ) : (
          <div className="w-12 h-12 bg-muted rounded flex items-center justify-center">
            <Star className="h-6 w-6 text-muted-foreground" />
          </div>
        )}
        <div>
          <p className="font-medium">{sponsor.name}</p>
          <div className="flex items-center gap-2">
            <Badge className={`text-xs ${tierColors[sponsor.tier]}`}>
              {tierLabels[sponsor.tier]}
            </Badge>
            {!sponsor.active && (
              <Badge variant="destructive" className="text-xs">Inativo</Badge>
            )}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => onLogoUpload(sponsor.id, e)}
        />
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload className="h-4 w-4" />
        </Button>
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => onUpdate.mutate({ id: sponsor.id, active: !sponsor.active })}
        >
          {sponsor.active ? "Desativar" : "Ativar"}
        </Button>
        <ConfirmDeleteDialog
          title="Remover Patrocinador"
          description={`Você está prestes a remover o patrocinador "${sponsor.name}".`}
          requireTyping={false}
          onConfirm={() => onDelete.mutate({ id: sponsor.id })}
          isDeleting={onDelete.isPending}
          variant="destructive"
          size="sm"
        >
          <Button variant="destructive" size="sm">
            <Trash2 className="h-4 w-4" />
          </Button>
        </ConfirmDeleteDialog>
      </div>
    </div>
  );
}


// ==================== SUPPORT MESSAGES TAB ====================
function SupportMessagesTab({ campaignId }: { campaignId: number }) {
  const utils = trpc.useUtils();
  const { data: allMessages, isLoading } = trpc.supportMessages.all.useQuery({ campaignId });
  const { data: teams } = trpc.teams.list.useQuery({ campaignId });
  
  const approveMessage = trpc.supportMessages.approve.useMutation({
    onSuccess: () => {
      utils.supportMessages.all.invalidate();
      utils.supportMessages.byTeam.invalidate();
      toast.success("Mensagem aprovada!");
    },
    onError: (error) => toast.error(error.message)
  });
  
  const deleteMessage = trpc.supportMessages.delete.useMutation({
    onSuccess: () => {
      utils.supportMessages.all.invalidate();
      utils.supportMessages.byTeam.invalidate();
      toast.success("Mensagem excluída!");
    },
    onError: (error) => toast.error(error.message)
  });

  const getTeamName = (teamId: number) => {
    return teams?.find(t => t.id === teamId)?.name || `Time #${teamId}`;
  };

  const pendingMessages = allMessages?.filter((m: any) => !m.approved) || [];
  const approvedMessages = allMessages?.filter((m: any) => m.approved) || [];

  return (
    <div className="space-y-6">
      {/* Mensagens Pendentes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-amber-500"></span>
            Pendentes de Aprovação ({pendingMessages.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              {[1, 2, 3].map(i => <Skeleton key={i} className="h-20 w-full" />)}
            </div>
          ) : pendingMessages.length > 0 ? (
            <div className="space-y-2">
              {pendingMessages.map((msg: any) => (
                <div key={msg.id} className="flex items-start justify-between p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <Badge variant="secondary" className="bg-gold/20 text-gold-dark">
                        <Shield className="h-3 w-3 mr-1" />
                        {getTeamName(msg.teamId)}
                      </Badge>
                      <span className="font-medium text-sm">{msg.authorName}</span>
                      {msg.authorLodge && (
                        <Badge variant="outline" className="text-xs">{msg.authorLodge}</Badge>
                      )}
                      <Badge variant="outline" className="text-xs bg-amber-100 text-amber-800 border-amber-300">
                        Pendente
                      </Badge>
                    </div>
                    <p className="text-sm mt-2">"{msg.message}"</p>
                  </div>
                  <div className="flex gap-1 ml-2">
                    <Button 
                      variant="ghost" 
                      size="icon"
                      className="text-green-600 hover:text-green-700 hover:bg-green-100"
                      onClick={() => approveMessage.mutate({ id: msg.id })}
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                    <ConfirmDeleteDialog
                      title="Excluir Mensagem"
                      description={`Você está prestes a excluir a mensagem de "${msg.authorName}".`}
                      requireTyping={false}
                      onConfirm={() => deleteMessage.mutate({ id: msg.id })}
                      isDeleting={deleteMessage.isPending}
                      className="text-destructive hover:text-destructive hover:bg-red-100"
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-4">Nenhuma mensagem pendente</p>
          )}
        </CardContent>
      </Card>

      {/* Mensagens Aprovadas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-green-500"></span>
            Aprovadas ({approvedMessages.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {approvedMessages.length > 0 ? (
            <div className="space-y-2">
              {approvedMessages.map((msg: any) => (
                <div key={msg.id} className="flex items-start justify-between p-3 bg-muted rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <Badge variant="secondary" className="bg-gold/20 text-gold-dark">
                        <Shield className="h-3 w-3 mr-1" />
                        {getTeamName(msg.teamId)}
                      </Badge>
                      <span className="font-medium text-sm">{msg.authorName}</span>
                      {msg.authorLodge && (
                        <Badge variant="outline" className="text-xs">{msg.authorLodge}</Badge>
                      )}
                      <Badge variant="outline" className="text-xs bg-green-100 text-green-800 border-green-300">
                        Aprovada
                      </Badge>
                    </div>
                    <p className="text-sm mt-2">"{msg.message}"</p>
                  </div>
                  <ConfirmDeleteDialog
                    title="Excluir Mensagem"
                    description={`Você está prestes a excluir a mensagem de "${msg.authorName}".`}
                    requireTyping={false}
                    onConfirm={() => deleteMessage.mutate({ id: msg.id })}
                    isDeleting={deleteMessage.isPending}
                  />
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-4">Nenhuma mensagem aprovada</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
