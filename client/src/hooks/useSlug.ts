import { useLocation } from "wouter";

/**
 * Hook para extrair o slug do campeonato da URL atual
 * 
 * Exemplos:
 * - /magico → "magico"
 * - /magico/admin → "magico"
 * - /copa-2026/jogos → "copa-2026"
 * - / → "futebol-fraterno" (fallback)
 * 
 * @returns {string} Slug do campeonato atual
 */
export function useSlug(): string {
  const [location] = useLocation();
  const pathParts = location.split('/').filter(Boolean);
  
  // Fallback para futebol-fraterno para compatibilidade com rotas legadas
  return pathParts[0] || 'futebol-fraterno';
}
