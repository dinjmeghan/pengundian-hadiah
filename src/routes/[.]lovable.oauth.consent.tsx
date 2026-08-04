import { createFileRoute, redirect } from "@tanstack/react-router";
import { useState } from "react";
import { ShieldCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

type OAuthNamespace = {
  getAuthorizationDetails: (id: string) => Promise<{ data: AuthorizationDetails | null; error: { message: string } | null }>;
  approveAuthorization: (id: string) => Promise<{ data: AuthorizationDetails | null; error: { message: string } | null }>;
  denyAuthorization: (id: string) => Promise<{ data: AuthorizationDetails | null; error: { message: string } | null }>;
};

type AuthorizationDetails = {
  client?: { name?: string } | null;
  redirect_url?: string;
  redirect_to?: string;
};

function oauthApi(): OAuthNamespace {
  return (supabase.auth as unknown as { oauth: OAuthNamespace }).oauth;
}

export const Route = createFileRoute("/.lovable/oauth/consent")({
  // Browser-only: the Supabase client reads its session from localStorage.
  ssr: false,
  validateSearch: (s: Record<string, unknown>) => ({
    authorization_id: typeof s['authorization_id'] === "string" ? s['authorization_id'] : "",
  }),
  beforeLoad: async ({ search, location }) => {
    if (!search.authorization_id) throw new Error("Missing authorization_id");
    const { data } = await supabase.auth.getSession();
    if (!data.session) {
      const next = location.pathname + location.searchStr;
      throw redirect({ to: "/auth", search: { next } });
    }
  },
  loader: async ({ location }) => {
    const authorizationId = new URLSearchParams(location.search).get("authorization_id")!;
    const { data, error } = await oauthApi().getAuthorizationDetails(authorizationId);
    if (error) throw new Error(error.message);
    const immediate = data?.redirect_url ?? data?.redirect_to;
    if (immediate && !data?.client) throw redirect({ href: immediate });
    return data;
  },
  component: Consent,
  errorComponent: ({ error }) => (
    <main className="flex min-h-screen items-center justify-center bg-background px-4">
      <p className="panel-surface rounded-2xl px-6 py-5 font-prize text-sm text-muted-foreground">
        Permintaan otorisasi tidak dapat dimuat: {String((error as Error)?.message ?? error)}
      </p>
    </main>
  ),
});

function Consent() {
  const details = Route.useLoaderData();
  const { authorization_id } = Route.useSearch();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const clientName = details?.client?.name ?? "Aplikasi AI";

  async function decide(approve: boolean) {
    setBusy(true);
    setError(null);
    const api = oauthApi();
    const { data, error: err } = approve
      ? await api.approveAuthorization(authorization_id)
      : await api.denyAuthorization(authorization_id);
    if (err) {
      setBusy(false);
      setError(err.message);
      return;
    }
    const target = data?.redirect_url ?? data?.redirect_to;
    if (!target) {
      setBusy(false);
      setError("Server otorisasi tidak mengembalikan alamat pengalihan.");
      return;
    }
    window.location.href = target;
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 py-10">
      <section className="panel-surface shine flex w-full max-w-md flex-col gap-5 rounded-3xl px-8 py-10">
        <header className="flex flex-col items-center gap-2 text-center">
          <ShieldCheck className="size-8 text-gold" />
          <h1 className="font-display text-lg font-bold tracking-[0.12em] uppercase">
            Hubungkan {clientName}
          </h1>
          <p className="font-prize text-xs tracking-[0.2em] text-muted-foreground uppercase">
            Dashboard Pengundian Hadiah
          </p>
        </header>

        <p className="font-prize text-sm text-muted-foreground">
          {clientName} akan dapat membaca dan mengelola data peserta serta daftar hadiah sebagai
          akun Anda.
        </p>

        {error && (
          <p role="alert" className="rounded-xl bg-panel-2/70 px-4 py-3 font-prize text-xs text-destructive">
            {error}
          </p>
        )}

        <div className="flex flex-col gap-3">
          <button
            type="button"
            disabled={busy}
            onClick={() => decide(true)}
            className="flex h-14 items-center justify-center rounded-xl bg-primary px-6 font-display text-sm font-bold tracking-[0.14em] text-primary-foreground uppercase transition-all hover:brightness-110 disabled:opacity-50"
          >
            {busy ? "Memproses..." : "Izinkan"}
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={() => decide(false)}
            className="flex h-14 items-center justify-center rounded-xl border border-input bg-panel-2 px-6 font-display text-sm font-bold tracking-[0.14em] uppercase disabled:opacity-50"
          >
            Tolak
          </button>
        </div>
      </section>
    </main>
  );
}
