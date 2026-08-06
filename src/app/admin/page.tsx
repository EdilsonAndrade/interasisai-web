"use client";

import { useState } from "react";
import { LogIn, AlertCircle, Loader2 } from "lucide-react";
import { IngestForm } from "@/components/admin/IngestForm";
import { useAdminIngest } from "@/hooks/useAdminIngest";

// ─── Auth helpers ─────────────────────────────────────────────────────────────

function validateCredentials(user: string, pwd: string): boolean {
  const expectedUser = process.env.NEXT_PUBLIC_ADM_USER;
  const expectedPwd = process.env.NEXT_PUBLIC_ADM_PWD;

  if (!expectedUser || !expectedPwd) {
    console.warn("[Admin:auth] Credentials not configured — access denied.");
    return false;
  }

  return user.trim() === expectedUser.trim() && pwd === expectedPwd;
}

// ─── Login Form ───────────────────────────────────────────────────────────────

type LoginFormProps = {
  onLogin: () => void;
};

function LoginForm({ onLogin }: LoginFormProps) {
  const [user, setUser] = useState("");
  const [pwd, setPwd] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [checking, setChecking] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!user.trim() || !pwd) {
      setError("Usuário e senha são obrigatórios.");
      return;
    }

    setChecking(true);

    // Small delay to show loading state
    setTimeout(() => {
      if (validateCredentials(user, pwd)) {
        onLogin();
      } else {
        setError("Usuário ou senha inválidos.");
        setChecking(false);
      }
    }, 600);
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm space-y-5 rounded-card border border-brand-primary/20 bg-surface-base/60 p-6 backdrop-blur-xl sm:p-8"
      >
        {/* Header */}
        <div className="space-y-1 text-center">
          <h1 className="text-xl font-bold text-text-strong">
            Painel Administrador
          </h1>
          <p className="text-xs text-text-body">
            Faça login para acessar a ingestão de conhecimento.
          </p>
        </div>

        {/* User field */}
        <div className="space-y-1.5">
          <label
            htmlFor="admin-user"
            className="block text-sm font-medium text-text-body"
          >
            Usuário
          </label>
          <input
            id="admin-user"
            type="text"
            value={user}
            onChange={(e) => setUser(e.target.value)}
            placeholder="admin"
            autoComplete="username"
            disabled={checking}
            className="w-full rounded-card border border-border-subtle bg-surface-subtle px-4 py-2.5 text-sm text-text-strong placeholder:text-text-body/50 focus:border-brand-primary/50 focus:outline-none focus:ring-1 focus:ring-brand-primary/30 disabled:cursor-not-allowed disabled:opacity-50"
          />
        </div>

        {/* Password field */}
        <div className="space-y-1.5">
          <label
            htmlFor="admin-pwd"
            className="block text-sm font-medium text-text-body"
          >
            Senha
          </label>
          <input
            id="admin-pwd"
            type="password"
            value={pwd}
            onChange={(e) => setPwd(e.target.value)}
            placeholder="••••••••"
            autoComplete="current-password"
            disabled={checking}
            className="w-full rounded-card border border-border-subtle bg-surface-subtle px-4 py-2.5 text-sm text-text-strong placeholder:text-text-body/50 focus:border-brand-primary/50 focus:outline-none focus:ring-1 focus:ring-brand-primary/30 disabled:cursor-not-allowed disabled:opacity-50"
          />
        </div>

        {/* Error feedback */}
        {error && (
          <div
            className="flex items-center gap-2 rounded-card border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-300"
            role="alert"
          >
            <AlertCircle className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
            {error}
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={checking}
          className="flex w-full items-center justify-center gap-2 rounded-card bg-brand-primary px-4 py-2.5 text-sm font-semibold text-text-inverse transition-all hover:bg-brand-primary-hover hover:scale-[1.02] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:scale-100"
        >
          {checking ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Verificando...
            </>
          ) : (
            <>
              <LogIn className="h-4 w-4" aria-hidden="true" />
              Entrar
            </>
          )}
        </button>
      </form>
    </main>
  );
}

// ─── Admin Page ───────────────────────────────────────────────────────────────

export default function AdminPage() {
  const [authenticated, setAuthenticated] = useState(false);
  const {
    tenantId,
    textContent,
    isLoading,
    result,
    setTenantId,
    setTextContent,
    submitIngest,
    clearResult,
  } = useAdminIngest();

  if (!authenticated) {
    return <LoginForm onLogin={() => setAuthenticated(true)} />;
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-start px-4 py-16 sm:px-6 lg:px-8">
      <section className="w-full max-w-2xl space-y-8">
        {/* Header */}
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-bold text-text-strong sm:text-4xl">
            Painel Administrador
          </h1>
          <p className="text-sm text-text-body">
            Envie regras de negócio e textos institucionais para vetorização na
            base de conhecimento (RAG) da IA.
          </p>
        </div>

        {/* Form */}
        <IngestForm
          tenantId={tenantId}
          textContent={textContent}
          isLoading={isLoading}
          result={result}
          onTenantIdChange={setTenantId}
          onTextContentChange={setTextContent}
          onSubmit={submitIngest}
          onClearResult={clearResult}
        />
      </section>
    </main>
  );
}
