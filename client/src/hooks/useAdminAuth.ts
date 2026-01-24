import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { toast } from "sonner";
import { useSlug } from "./useSlug";

export function useAdminAuth() {
  const [, setLocation] = useLocation();
  const slug = useSlug();
  
  // Verificar se há token no localStorage
  const hasToken = !!localStorage.getItem("admin_token");
  
  const { data: adminUser, isLoading, refetch } = trpc.adminUsers.me.useQuery(undefined, {
    retry: false,
    refetchOnWindowFocus: false,
    enabled: hasToken, // Só fazer query se houver token
  });

  const logoutMutation = trpc.adminUsers.logout.useMutation({
    onSuccess: () => {
      // Limpar token do localStorage
      localStorage.removeItem("admin_token");
      toast.success("Logout realizado com sucesso");
      setLocation(`/${slug}`);
    },
  });

  const logout = () => {
    logoutMutation.mutate();
  };

  return {
    adminUser: adminUser || null,
    isAuthenticated: !!adminUser,
    loading: isLoading,
    logout,
    refetch,
  };
}
