import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [, setLocation] = useLocation();

  const loginMutation = trpc.auth.loginWithPassword.useMutation({
    onSuccess: (data) => {
      toast.success("✅ Login realizado!", {
        description: `Bem-vindo, ${data.user.name}!`,
      });
      
      // Se é owner, redirecionar para dashboard geral
      if (data.isOwner) {
        setLocation("/admin-dashboard");
      }
      // Se tem campeonato, redirecionar para admin do campeonato
      else if (data.campaignSlug) {
        setLocation(`/${data.campaignSlug}/admin`);
      }
      // Senão, redirecionar para home
      else {
        setLocation("/");
      }
    },
    onError: (error) => {
      toast.error("❌ Erro no login", {
        description: error.message,
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error("❌ Campos obrigatórios", {
        description: "Preencha email e senha",
      });
      return;
    }

    loginMutation.mutate({ email, password });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-green-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center mb-4">
            <img src="/logo.svg" alt="PeladaPro" className="h-12" />
          </div>
          <CardTitle className="text-2xl text-center">Login - PeladaPro</CardTitle>
          <CardDescription className="text-center">
            Acesse o painel de gerenciamento do seu campeonato
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button
              type="submit"
              className="w-full"
              disabled={loginMutation.isPending}
            >
              {loginMutation.isPending ? "Entrando..." : "Entrar"}
            </Button>
          </form>
          <div className="mt-4 text-center text-sm">
            <a href="/change-password" className="text-green-600 hover:underline">
              Esqueceu sua senha?
            </a>
          </div>
          <div className="mt-2 text-center text-sm text-gray-600">
            Não tem uma conta?{" "}
            <a href="/landing" className="text-green-600 hover:underline">
              Criar campeonato
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
