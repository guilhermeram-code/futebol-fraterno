import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { useAdminAuth } from "@/hooks/useAdminAuth";

export default function ChangePassword() {
  const { adminUser, isAuthenticated } = useAdminAuth();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [, setLocation] = useLocation();

  const changePasswordMutation = trpc.adminUsers.changePassword.useMutation({
    onSuccess: () => {
      toast.success("✅ Senha alterada!", {
        description: "Sua senha foi alterada com sucesso!",
      });
      setLocation(`/${adminUser?.campaignSlug}/admin`);
    },
    onError: (error) => {
      toast.error("❌ Erro ao alterar senha", {
        description: error.message,
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error("❌ Campos obrigatórios", {
        description: "Preencha todos os campos",
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("❌ Senhas não conferem", {
        description: "A nova senha e a confirmação devem ser iguais",
      });
      return;
    }

    if (newPassword.length < 8) {
      toast.error("❌ Senha muito curta", {
        description: "A senha deve ter no mínimo 8 caracteres",
      });
      return;
    }

    if (!adminUser?.username) {
      toast.error("❌ Erro", {
        description: "Usuário não autenticado",
      });
      return;
    }

    changePasswordMutation.mutate({ 
      username: adminUser.username,
      currentPassword, 
      newPassword 
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-green-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center mb-4">
            <img src="/logo.svg" alt="PeladaPro" className="h-12" />
          </div>
          <CardTitle className="text-2xl text-center">Alterar Senha</CardTitle>
          <CardDescription className="text-center">
            Escolha uma nova senha para sua conta
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Senha Atual</Label>
              <Input
                id="currentPassword"
                type="password"
                placeholder="••••••••"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="newPassword">Nova Senha</Label>
              <Input
                id="newPassword"
                type="password"
                placeholder="••••••••"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
              <p className="text-xs text-gray-500">Mínimo 8 caracteres</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmar Nova Senha</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
            <Button
              type="submit"
              className="w-full"
              disabled={changePasswordMutation.isPending}
            >
              {changePasswordMutation.isPending ? "Alterando..." : "Alterar Senha"}
            </Button>
          </form>
          <div className="mt-4 text-center text-sm">
            <a href="/login" className="text-green-600 hover:underline">
              Voltar para login
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
