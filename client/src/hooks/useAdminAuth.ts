import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { toast } from "sonner";

export function useAdminAuth() {
  const [, setLocation] = useLocation();
  
  const { data: adminUser, isLoading, refetch } = trpc.adminUsers.me.useQuery(undefined, {
    retry: false,
    refetchOnWindowFocus: false,
  });

  const logoutMutation = trpc.adminUsers.logout.useMutation({
    onSuccess: () => {
      toast.success("Logout realizado com sucesso");
      setLocation("/admin/login");
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
