import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Menu, X, Trophy, Calendar, Users, BarChart3, Image, Settings, LogIn } from "lucide-react";
import { getLoginUrl } from "@/const";
import { useTournament } from "@/contexts/TournamentContext";

export function Header() {
  const { user, isAuthenticated } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { settings } = useTournament();

  const navItems = [
    { href: "/classificacao", label: "Classificação", icon: Trophy },
    { href: "/jogos", label: "Jogos", icon: Calendar },
    { href: "/times", label: "Times", icon: Users },
    { href: "/estatisticas", label: "Estatísticas", icon: BarChart3 },
    { href: "/galeria", label: "Galeria", icon: Image },
  ];

  // Usar nome do torneio das configurações

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
          <button
            className="lg:hidden p-2 rounded-lg hover:bg-white/10 transition-colors"
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
