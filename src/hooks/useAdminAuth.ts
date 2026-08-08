"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { AdminLoginInput } from "@/lib/whatsappSchemas";

export function useAdminAuth() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = async (credentials: AdminLoginInput): Promise<void> => {
    if (isLoading) return;
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/admin/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        setError(
          response.status === 503
            ? "Autenticação administrativa indisponível."
            : "Usuário ou senha inválidos.",
        );
        return;
      }

      router.refresh();
    } catch {
      setError("Não foi possível acessar o painel. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    await fetch("/api/admin/session", { method: "DELETE" });
    router.refresh();
  };

  return { login, logout, isLoading, error };
}