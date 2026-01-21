import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link, useLocation } from "wouter";
import { Menu, X, Trophy, Calendar, Users, BarChart3, Image, Settings, LogIn, Search, User, FileText } from "lucide-react";
import { getLoginUrl } from "@/const";
import { useTournament } from "@/contexts/TournamentContext";
import { trpc } from "@/lib/trpc";

export function Header() {
  const { user, isAuthenticated } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const searchRef = useRef<HTMLDivElement>(null);
  const { settings } = useTournament();
  const [, navigate] = useLocation();

  const { data: players } = trpc.players.list.useQuery();
  const { data: teams } = trpc.teams.list.useQuery();

  // Filtrar jogadores baseado na busca
  const filteredPlayers = players?.filter(p => 
    searchTerm.length >= 2 && p.name.toLowerCase().includes(searchTerm.toLowerCase())
  ).slice(0, 5) || [];

  // Fechar busca ao clicar fora
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setSearchOpen(false);
        setSearchTerm("");
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getTeamName = (teamId: number) => {
    return teams?.find(t => t.id === teamId)?.name || "";
  };

  const handlePlayerClick = (playerId: number) => {
    navigate(`/jogadores/${playerId}`);
    setSearchOpen(false);
    setSearchTerm("");
  };

  const navItems = [
    { href: "/classificacao", label: "Classificação", icon: Trophy },
    { href: "/jogos", label: "Jogos", icon: Calendar },
    { href: "/times", label: "Times", icon: Users },
    { href: "/estatisticas", label: "Estatísticas", icon: BarChart3 },
    { href: "/galeria", label: "Galeria", icon: Image },
    { href: "/relatorios", label: "Relatórios", icon: FileText },
  ];

  return (
    <header className="bg-secondary text-secondary-foreground sticky top-0 z-50">
      <div className="container py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/">
            <div className="flex items-center gap-4 cursor-pointer">
              <img 
                src={settings.tournamentLogo} 
                alt={settings.tournamentName} 
                className="h-12 w-12 md:h-16 md:w-16 rounded-full object-cover border-2 border-primary shadow-lg"
              />
              <div>
                <h1 className="text-xl md:text-2xl font-bold text-gold">{settings.tournamentName}</h1>
                <p className="text-xs md:text-sm text-muted-foreground">{settings.tournamentSubtitle}</p>
              </div>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-2">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href}>
                <Button variant="ghost" className="text-secondary-foreground hover:text-gold">
                  {item.label}
                </Button>
              </Link>
            ))}
            
            {/* Search Button */}
            <div className="relative" ref={searchRef}>
              <Button 
                variant="ghost" 
                size="icon"
                className="text-secondary-foreground hover:text-gold"
                onClick={() => setSearchOpen(!searchOpen)}
              >
                <Search className="h-5 w-5" />
              </Button>
              
              {searchOpen && (
                <div className="absolute right-0 top-full mt-2 w-72 bg-card rounded-lg shadow-lg border p-2">
                  <Input
                    placeholder="Buscar jogador..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="mb-2"
                    autoFocus
                  />
                  {filteredPlayers.length > 0 ? (
                    <div className="space-y-1">
                      {filteredPlayers.map(player => (
                        <button
                          key={player.id}
                          onClick={() => handlePlayerClick(player.id)}
                          className="w-full flex items-center gap-3 p-2 rounded hover:bg-muted transition-colors text-left"
                        >
                          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                            <User className="h-4 w-4 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium text-sm">{player.name}</p>
                            <p className="text-xs text-muted-foreground">{getTeamName(player.teamId)}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  ) : searchTerm.length >= 2 ? (
                    <p className="text-sm text-muted-foreground text-center py-2">
                      Nenhum jogador encontrado
                    </p>
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-2">
                      Digite pelo menos 2 caracteres
                    </p>
                  )}
                </div>
              )}
            </div>
            
            {isAuthenticated && user?.role === "admin" ? (
              <Link href="/admin">
                <Button variant="default" className="bg-primary text-primary-foreground">
                  Painel Admin
                </Button>
              </Link>
            ) : (
              <a href={getLoginUrl()}>
                <Button variant="default" className="bg-primary text-primary-foreground gap-2">
                  <LogIn className="h-4 w-4" />
                  Entrar
                </Button>
              </a>
            )}
          </nav>

          {/* Mobile Menu Button */}
          <div className="flex items-center gap-2 lg:hidden">
            <Button 
              variant="ghost" 
              size="icon"
              className="text-secondary-foreground hover:text-gold"
              onClick={() => setSearchOpen(!searchOpen)}
            >
              <Search className="h-5 w-5" />
            </Button>
            <button
              className="p-2 rounded-lg hover:bg-white/10 transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Menu"
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6 text-gold" />
              ) : (
                <Menu className="h-6 w-6 text-gold" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Search */}
        {searchOpen && (
          <div className="lg:hidden mt-4 pb-4" ref={searchRef}>
            <Input
              placeholder="Buscar jogador..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="mb-2"
              autoFocus
            />
            {filteredPlayers.length > 0 && (
              <div className="bg-card rounded-lg border p-2 space-y-1">
                {filteredPlayers.map(player => (
                  <button
                    key={player.id}
                    onClick={() => handlePlayerClick(player.id)}
                    className="w-full flex items-center gap-3 p-2 rounded hover:bg-muted transition-colors text-left"
                  >
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{player.name}</p>
                      <p className="text-xs text-muted-foreground">{getTeamName(player.teamId)}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <nav className="lg:hidden mt-4 pb-4 border-t border-white/10 pt-4">
            <div className="flex flex-col gap-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link key={item.href} href={item.href}>
                    <Button 
                      variant="ghost" 
                      className="w-full justify-start text-secondary-foreground hover:text-gold hover:bg-white/10 gap-3"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Icon className="h-5 w-5" />
                      {item.label}
                    </Button>
                  </Link>
                );
              })}
              
              <div className="border-t border-white/10 my-2" />
              
              {isAuthenticated && user?.role === "admin" ? (
                <Link href="/admin">
                  <Button 
                    variant="default" 
                    className="w-full bg-primary text-primary-foreground gap-3"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Settings className="h-5 w-5" />
                    Painel Admin
                  </Button>
                </Link>
              ) : (
                <a href={getLoginUrl()}>
                  <Button 
                    variant="default" 
                    className="w-full bg-primary text-primary-foreground gap-3"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <LogIn className="h-5 w-5" />
                    Entrar
                  </Button>
                </a>
              )}
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}
