import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { LogIn, ShieldCheck, UserPlus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useOperatorSession } from "@/lib/auth";

function safeNext(value: unknown): string {
  if (typeof value !== "string" || !value.startsWith("/") || value.startsWith("//")) return "/";
  return value;
}

export const Route = createFileRoute("/auth")({
  validateSearch: (s: Record<string, unknown>) => ({ next: safeNext(s['next']) }),
  head: () => ({
    meta: [
      { title: "Masuk Operator Undian | Undian Live" },
      {
        name: "description",
        content:
          "Halaman masuk operator undian berhadiah. Hanya operator terdaftar yang dapat mengelola data peserta dan menjalankan pengundian.",
      },
      { property: "og:title", content: "Masuk Operator Undian | Undian Live" },
      {
        property: "og:description",
        content: "Login operator untuk mengakses dashboard pengundian dan kelola data peserta.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const { next } = Route.useSearch();
  const { signedIn, ready } = useOperatorSession();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!ready || !signedIn) return;
    if (next !== "/") {
      window.location.href = next;
      return;
    }
    void navigate({ to: "/", replace: true });
  }, [ready, signedIn, navigate, next]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setMessage(null);

    const translate = (msg: string) => {
      const m = msg.toLowerCase();
      if (m.includes("invalid login credentials")) return "Email atau password salah.";
      if (m.includes("email not confirmed"))
        return "Email belum dikonfirmasi. Buka tautan konfirmasi di inbox Anda lalu masuk kembali.";
      if (m.includes("already registered") || m.includes("already been registered"))
        return "Email sudah terdaftar. Silakan masuk.";
      if (m.includes("pwned") || m.includes("weak"))
        return "Password terlalu lemah atau pernah kebocoran. Gunakan password lain.";
      if (m.includes("rate limit"))
        return "Terlalu banyak percobaan. Coba lagi beberapa menit lagi.";
      return msg;
    };

    try {
      if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) setMessage(translate(error.message));
      } else {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: `${window.location.origin}/auth` },
        });
        if (error) {
          setMessage(translate(error.message));
        } else if (!data.session) {
          setMessage(
            "Pendaftaran berhasil. Kami mengirim email konfirmasi ke " +
              email +
              ". Klik tautan di email tersebut, lalu masuk di halaman ini.",
          );
          setMode("login");
        }
      }
    } catch (err) {
      setMessage(
        err instanceof Error ? translate(err.message) : "Terjadi kesalahan. Coba lagi.",
      );
    } finally {
      setBusy(false);
    }
  };


  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-10">
      <section className="panel-surface shine flex w-full max-w-md flex-col gap-5 rounded-3xl px-8 py-10">
        <header className="flex flex-col items-center gap-2 text-center">
          <ShieldCheck className="size-8 text-gold" />
          <h1 className="font-display text-xl font-bold tracking-[0.14em] uppercase">
            {mode === "login" ? "Masuk Operator" : "Daftar Operator"}
          </h1>
          <p className="font-prize text-xs tracking-[0.24em] text-muted-foreground uppercase">
            Dashboard Pengundian Hadiah
          </p>
        </header>

        <form onSubmit={submit} className="flex flex-col gap-3">
          <label className="flex flex-col gap-2">
            <span className="font-prize text-[0.7rem] tracking-[0.28em] text-muted-foreground uppercase">
              Email
            </span>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-14 rounded-xl border border-input bg-panel-2 px-4 font-prize text-sm outline-none focus:ring-2 focus:ring-ring"
            />
          </label>
          <label className="flex flex-col gap-2">
            <span className="font-prize text-[0.7rem] tracking-[0.28em] text-muted-foreground uppercase">
              Password
            </span>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-14 rounded-xl border border-input bg-panel-2 px-4 font-prize text-sm outline-none focus:ring-2 focus:ring-ring"
            />
          </label>

          <button
            type="submit"
            disabled={busy}
            className="flex h-14 items-center justify-center gap-2 rounded-xl bg-primary px-6 font-display text-sm font-bold tracking-[0.14em] text-primary-foreground uppercase transition-all hover:brightness-110 disabled:opacity-50"
          >
            {mode === "login" ? <LogIn className="size-5" /> : <UserPlus className="size-5" />}
            {busy ? "Memproses..." : mode === "login" ? "Masuk" : "Daftar"}
          </button>
        </form>

        {message && (
          <p className="rounded-xl bg-panel-2/70 px-4 py-3 font-prize text-xs text-muted-foreground">
            {message}
          </p>
        )}

        <button
          type="button"
          onClick={() => {
            setMode(mode === "login" ? "signup" : "login");
            setMessage(null);
          }}
          className="font-prize text-xs tracking-[0.2em] text-primary uppercase"
        >
          {mode === "login" ? "Belum punya akun? Daftar" : "Sudah punya akun? Masuk"}
        </button>
      </section>
    </div>
  );
}
