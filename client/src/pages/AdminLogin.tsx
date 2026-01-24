import { useState } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Shield, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { Link } from "wouter";
import { useSlug } from "@/hooks/useSlug";
import { useCampaign } from "@/App";

export default function AdminLogin() {
  const [location, setLocation] = useLocation();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  
  // Extrair slug da URL atual (formato: /{slug}/admin/login)
  const slug = useSlug();
  const { campaignId } = useCampaign();

  const loginMutation = trpc.adminUsers.login.useMutation({
    onSuccess: (data) => {
      // Armazenar token no localStorage
      localStorage.setItem("admin_token", data.token);
      toast.success("Login realizado com sucesso");
      // Redirecionar para o admin do campeonato específico
      setLocation(`/${slug}/admin`);
    },
    onError: (error: any) => {
      toast.error(error.message || "Área restrita, você não tem acesso");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      toast.error("Preencha todos os campos");
      return;
    }
    loginMutation.mutate({ username, password, campaignId });
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Link href={`/${slug}`}>
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar para Home
          </Button>
        </Link>
        
        <Card>
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <Shield className="h-12 w-12 text-primary" />
            </div>
            <CardTitle>Painel Administrativo</CardTitle>
            <p className="text-sm text-muted-foreground">Entre com suas credenciais</p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Login</Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="Digite seu login"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Digite sua senha"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={loginMutation.isPending}>
                {loginMutation.isPending ? "Entrando..." : "Entrar"}
              </Button>
              
              <div className="text-center mt-4">
                <Link href={`/${slug}/admin/forgot-password`}>
                  <Button variant="link" className="text-sm text-muted-foreground hover:text-primary">
                    Esqueci minha senha
                  </Button>
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
