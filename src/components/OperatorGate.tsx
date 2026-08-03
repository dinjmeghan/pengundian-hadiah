import { Link } from "@tanstack/react-router";
import { LogIn, Lock, LogOut } from "lucide-react";
import { signOutOperator, useOperatorSession } from "@/lib/auth";

export function OperatorGate({ children }: { children: React.ReactNode }) {
  const { ready, signedIn } = useOperatorSession();

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="font-prize text-sm tracking-[0.3em] text-muted-foreground uppercase">
          Memuat...
        </p>
      </div>
    );
  }

  if (!signedIn) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <section className="panel-surface shine flex w-full max-w-md flex-col items-center gap-4 rounded-3xl px-8 py-10 text-center">
          <Lock className="size-8 text-gold" />
          <h1 className="font-display text-xl font-bold tracking-[0.14em] uppercase">
            Akses Operator
          </h1>
          <p className="font-prize text-sm text-muted-foreground">
            Data peserta bersifat rahasia. Masuk sebagai operator untuk membuka dashboard undian.
          </p>
          <Link
            to="/auth"
            className="flex h-14 items-center gap-2 rounded-xl bg-primary px-6 font-display text-sm font-bold tracking-[0.14em] text-primary-foreground uppercase transition-all hover:brightness-110"
          >
            <LogIn className="size-5" /> Masuk Operator
          </Link>
        </section>
      </div>
    );
  }

  return <>{children}</>;
}

export function SignOutButton() {
  return (
    <button
      type="button"
      onClick={() => void signOutOperator()}
      className="flex h-14 items-center gap-2 rounded-xl bg-panel-2 px-6 font-display text-sm font-bold tracking-[0.14em] uppercase transition-all hover:bg-accent"
    >
      <LogOut className="size-5" /> Keluar
    </button>
  );
}
