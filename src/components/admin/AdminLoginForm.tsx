"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, Loader2, LogIn } from "lucide-react";
import { useForm } from "react-hook-form";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import {
  adminLoginSchema,
  type AdminLoginInput,
} from "@/lib/whatsappSchemas";

export function AdminLoginForm() {
  const { login, isLoading, error } = useAdminAuth();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AdminLoginInput>({
    resolver: zodResolver(adminLoginSchema),
    defaultValues: { user: "", password: "" },
  });

  return (
    <section className="flex min-h-[70vh] items-center justify-center px-4">
      <form
        onSubmit={handleSubmit(login)}
        className="w-full max-w-sm space-y-5 rounded-card border border-brand-primary/20 bg-surface-base/60 p-6 backdrop-blur-xl sm:p-8"
      >
        <header className="space-y-1 text-center">
          <h1 className="text-xl font-bold text-text-strong">
            Painel Administrador
          </h1>
          <p className="text-xs text-text-body">
            Entre para gerenciar conhecimento e conexões.
          </p>
        </header>

        <div className="space-y-1.5">
          <label htmlFor="admin-user" className="text-sm text-text-body">
            Usuário
          </label>
          <input
            id="admin-user"
            autoComplete="username"
            disabled={isLoading}
            aria-invalid={Boolean(errors.user)}
            aria-describedby={errors.user ? "admin-user-error" : undefined}
            {...register("user")}
            className="w-full rounded-card border border-border-subtle bg-surface-subtle px-4 py-2.5 text-text-strong focus:border-brand-primary focus:outline-none disabled:opacity-50"
          />
          {errors.user && (
            <p id="admin-user-error" role="alert" className="text-xs text-red-300">
              {errors.user.message}
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <label htmlFor="admin-password" className="text-sm text-text-body">
            Senha
          </label>
          <input
            id="admin-password"
            type="password"
            autoComplete="current-password"
            disabled={isLoading}
            aria-invalid={Boolean(errors.password)}
            aria-describedby={errors.password ? "admin-password-error" : undefined}
            {...register("password")}
            className="w-full rounded-card border border-border-subtle bg-surface-subtle px-4 py-2.5 text-text-strong focus:border-brand-primary focus:outline-none disabled:opacity-50"
          />
          {errors.password && (
            <p id="admin-password-error" role="alert" className="text-xs text-red-300">
              {errors.password.message}
            </p>
          )}
        </div>

        {error && (
          <p role="alert" className="flex gap-2 text-sm text-red-300">
            <AlertCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="flex w-full items-center justify-center gap-2 rounded-card bg-brand-primary px-4 py-2.5 text-sm font-semibold text-text-inverse transition-transform hover:scale-[1.02] disabled:opacity-60"
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          ) : (
            <LogIn className="h-4 w-4" aria-hidden="true" />
          )}
          {isLoading ? "Verificando..." : "Entrar"}
        </button>
      </form>
    </section>
  );
}