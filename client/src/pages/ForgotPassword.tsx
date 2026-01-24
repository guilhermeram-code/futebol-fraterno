import { useState } from "react";
import { Link, useLocation } from "wouter";
import { trpc } from "../lib/trpc";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { ArrowLeft, Mail, Shield } from "lucide-react";
import { toast } from "sonner";
import { useSlug } from "../hooks/useSlug";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const slug = useSlug();

  const forgotPasswordMutation = trpc.adminUsers.forgotPassword.useMutation({
    onSuccess: (data) => {
      toast.success(data.message || "Senha temporária enviada para seu email!");
      setEmail("");
    },
    onError: (error: any) => {
      toast.error(error.message || "Erro ao enviar email de recuperação");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error("Digite seu email");
      return;
    }
    forgotPasswordMutation.mutate({ email });
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Link href={`/${slug}/admin/login`}>
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar para Login
          </Button>
        </Link>

        <Card>
          <CardHeader className="space-y-1 text-center">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-primary/10 rounded-full">
                <Mail className="h-8 w-8 text-primary" />
              </div>
            </div>
            <CardTitle className="text-2xl">Esqueci Minha Senha</CardTitle>
            <p className="text-sm text-muted-foreground">
              Digite seu email de cadastro para receber uma senha temporária
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email de Cadastro</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4 space-y-2">
                <div className="flex items-start gap-2">
                  <Shield className="h-5 w-5 text-amber-600 dark:text-amber-500 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-amber-800 dark:text-amber-200">
                    <p className="font-medium mb-1">Como funciona:</p>
                    <ul className="list-disc list-inside space-y-1 text-xs">
                      <li>Você receberá uma senha temporária por email</li>
                      <li>Use essa senha para fazer login</li>
                      <li>Você será solicitado a alterar a senha no primeiro acesso</li>
                      <li>A senha temporária expira em 24 horas</li>
                    </ul>
                  </div>
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full" 
                disabled={forgotPasswordMutation.isPending}
              >
                {forgotPasswordMutation.isPending ? "Enviando..." : "Enviar Senha Temporária"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
