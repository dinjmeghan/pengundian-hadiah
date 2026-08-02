import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Gift, Play, RotateCcw, Save, Square, Ticket, Users } from "lucide-react";
import { PARTICIPANTS, PRIZES, type Participant } from "@/data/participants";
import { Celebration } from "@/components/Celebration";
import { playTick, playWin } from "@/lib/sound";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard Pengundian Hadiah | Undian Live" },
      {
        name: "description",
        content:
          "Dashboard pengundian hadiah live dengan animasi nama berputar, nomor undian, dan pengumuman pemenang beserta hadiah.",
      },
      { property: "og:title", content: "Dashboard Pengundian Hadiah | Undian Live" },
      {
        property: "og:description",
        content:
          "Undi pemenang secara live: nama berputar, berhenti, lalu hadiah dan confetti muncul otomatis.",
      },
    ],
  }),
  component: Index,
});

type Status = "READY" | "MENGUNDI" | "PEMENANG";

const EFFECTS = ["Rolling", "Blur", "Flip", "Slot Machine", "Glow"] as const;
type Effect = (typeof EFFECTS)[number];

function Index() {
  const [status, setStatus] = useState<Status>("READY");
  const [effect, setEffect] = useState<Effect>("Slot Machine");
  const [prizeIndex, setPrizeIndex] = useState(0);
  const [rolling, setRolling] = useState<Participant>(PARTICIPANTS[0]!);
  const [winner, setWinner] = useState<Participant | null>(null);
  const [drawnIds, setDrawnIds] = useState<number[]>([]);
  const [savedCount, setSavedCount] = useState(0);
  const intervalRef = useRef<number | null>(null);

  const remaining = useMemo(
    () => PARTICIPANTS.filter((p) => !drawnIds.includes(p.id)),
    [drawnIds],
  );
  const prize = PRIZES[prizeIndex % PRIZES.length]!;

  const clear = useCallback(() => {
    if (intervalRef.current !== null) {
      window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  useEffect(() => clear, [clear]);

  const start = () => {
    if (status === "MENGUNDI" || remaining.length === 0) return;
    setWinner(null);
    setStatus("MENGUNDI");
    clear();
    intervalRef.current = window.setInterval(() => {
      const next = remaining[Math.floor(Math.random() * remaining.length)]!;
      setRolling(next);
      playTick();
    }, 70);
  };

  const stop = () => {
    if (status !== "MENGUNDI") return;
    clear();
    const picked = remaining[Math.floor(Math.random() * remaining.length)]!;
    setRolling(picked);
    setWinner(picked);
    setStatus("PEMENANG");
    playWin();
  };

  const save = () => {
    if (!winner) return;
    setDrawnIds((ids) => (ids.includes(winner.id) ? ids : [...ids, winner.id]));
    setSavedCount((c) => c + 1);
  };

  const next = () => {
    save();
    setWinner(null);
    setStatus("READY");
    setPrizeIndex((i) => i + 1);
  };

  const reset = () => {
    clear();
    setWinner(null);
    setStatus("READY");
    setDrawnIds([]);
    setSavedCount(0);
    setPrizeIndex(0);
  };

  const displayed = winner ?? rolling;
  const spinning = status === "MENGUNDI";

  const nameEffectClass = spinning
    ? {
        Rolling: "animate-roll",
        Blur: "blur-[7px] opacity-80",
        Flip: "animate-flip-in",
        "Slot Machine": "animate-roll tracking-[0.04em]",
        Glow: "animate-glow blur-[2px]",
      }[effect]
    : winner
      ? "animate-pop animate-glow"
      : "";

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto flex max-w-[1500px] flex-col gap-6 px-4 py-6 lg:px-8">
        <header className="panel-surface shine flex flex-col items-center gap-1 rounded-2xl px-6 py-5 text-center">
          <h1 className="font-display text-2xl font-bold tracking-[0.14em] uppercase sm:text-3xl">
            Dashboard Pengundian Hadiah
          </h1>
          <p className="font-prize text-xs tracking-[0.3em] text-muted-foreground uppercase">
            Jackpot Undian Berhadiah 2026
          </p>
        </header>

        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
          <main className="flex flex-col gap-6">
            {/* Winner stage */}
            <section className="panel-surface relative overflow-hidden rounded-3xl px-6 py-10 sm:px-12 sm:py-14">
              <Celebration active={status === "PEMENANG"} />
              <div className="relative z-10 flex flex-col items-center gap-6">
                <span className="font-prize text-xs font-semibold tracking-[0.42em] text-muted-foreground uppercase">
                  {winner ? "Nama Pemenang" : "Nama Pemenang"}
                </span>
                <div className="w-full rule-line" />
                <div className="flex min-h-[7rem] w-full items-center justify-center overflow-hidden sm:min-h-[9rem]">
                  <p
                    key={displayed.id + (winner ? "-w" : "")}
                    className={`font-winner text-center text-[clamp(2.75rem,7vw,6rem)] leading-[1.02] font-extrabold tracking-tight break-words ${nameEffectClass}`}
                  >
                    {displayed.name}
                  </p>
                </div>
                <div className="w-full rule-line" />

                {spinning && (
                  <p className="font-prize text-sm font-semibold tracking-[0.32em] text-primary uppercase">
                    Sedang Mengundi
                    <span className="animate-pulse">...</span>
                  </p>
                )}

                {status === "PEMENANG" && winner && (
                  <div className="flex w-full animate-pop flex-col items-center gap-6">
                    <div className="flex flex-col items-center gap-2">
                      <span className="font-prize text-[0.7rem] tracking-[0.36em] text-muted-foreground uppercase">
                        Nomor Undian
                      </span>
                      <span className="font-display text-[clamp(1.9rem,3vw,2.5rem)] font-bold tracking-[0.12em]">
                        {winner.ticket}
                      </span>
                    </div>

                    <div className="flex w-full max-w-2xl flex-col items-center gap-3 rounded-2xl border border-gold/40 bg-panel-2/70 px-6 py-6">
                      <span className="flex items-center gap-2 font-prize text-xs font-semibold tracking-[0.34em] text-gold uppercase">
                        <Gift className="size-4" /> Hadiah
                      </span>
                      <span className="text-gold-gradient font-prize text-center text-[clamp(2rem,4vw,3.5rem)] leading-tight font-semibold uppercase">
                        {prize}
                      </span>
                    </div>

                    <p className="flex items-center gap-2 rounded-full bg-success/15 px-5 py-2 font-prize text-sm font-semibold tracking-widest text-success uppercase">
                      ✔ Selamat Anda Menang
                    </p>
                  </div>
                )}

                {status === "READY" && !winner && (
                  <p className="font-prize text-sm tracking-[0.3em] text-muted-foreground uppercase">
                    Tekan Mulai Undian
                  </p>
                )}
              </div>
            </section>

            {/* Controls */}
            <section className="panel-surface flex flex-col gap-5 rounded-3xl px-6 py-6">
              <div className="flex flex-wrap items-center justify-center gap-3">
                <ControlButton
                  tone="primary"
                  onClick={start}
                  disabled={spinning || remaining.length === 0}
                >
                  <Play className="size-5" /> Mulai Undian
                </ControlButton>
                <ControlButton tone="danger" onClick={stop} disabled={!spinning}>
                  <Square className="size-5" /> Stop
                </ControlButton>
                <ControlButton tone="success" onClick={save} disabled={!winner}>
                  <Save className="size-5" /> Simpan
                </ControlButton>
                <ControlButton tone="ghost" onClick={next} disabled={!winner}>
                  <Ticket className="size-5" /> Undian Berikutnya
                </ControlButton>
                <ControlButton tone="ghost" onClick={reset}>
                  <RotateCcw className="size-5" /> Reset
                </ControlButton>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-2 border-t border-border pt-4">
                <span className="font-prize text-[0.7rem] tracking-[0.28em] text-muted-foreground uppercase">
                  Efek Nama
                </span>
                {EFFECTS.map((e) => (
                  <button
                    key={e}
                    onClick={() => setEffect(e)}
                    className={`rounded-full px-4 py-2 font-prize text-xs font-semibold tracking-wider uppercase transition-colors ${
                      effect === e
                        ? "bg-primary text-primary-foreground"
                        : "bg-panel-2 text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {e}
                  </button>
                ))}
              </div>
            </section>
          </main>

          {/* Operator sidebar */}
          <aside className="flex flex-col gap-4">
            <SidebarCard title="Peserta" icon={<Users className="size-4" />}>
              <Stat label="Total Peserta" value={PARTICIPANTS.length.toLocaleString("id-ID")} />
              <Stat label="Sudah Terundi" value={savedCount.toLocaleString("id-ID")} />
              <Stat label="Sisa Peserta" value={remaining.length.toLocaleString("id-ID")} />
            </SidebarCard>

            <SidebarCard title="Hadiah Saat Ini" icon={<Gift className="size-4" />}>
              <p className="text-gold-gradient font-prize text-xl font-semibold uppercase">
                {prize}
              </p>
              <p className="font-prize text-xs tracking-widest text-muted-foreground uppercase">
                Sesi {prizeIndex + 1} dari {PRIZES.length}
              </p>
            </SidebarCard>

            <SidebarCard title="Status">
              <span
                className={`inline-flex items-center gap-2 rounded-full px-4 py-2 font-prize text-sm font-bold tracking-[0.2em] uppercase ${
                  status === "READY"
                    ? "bg-primary/20 text-primary"
                    : status === "MENGUNDI"
                      ? "bg-gold/20 text-gold"
                      : "bg-success/20 text-success"
                }`}
              >
                <span className="size-2 animate-pulse rounded-full bg-current" />
                {status}
              </span>
            </SidebarCard>

            <SidebarCard title="Riwayat Pemenang">
              {drawnIds.length === 0 ? (
                <p className="font-prize text-xs text-muted-foreground">Belum ada pemenang.</p>
              ) : (
                <ul className="flex max-h-56 flex-col gap-2 overflow-y-auto pr-1">
                  {drawnIds
                    .slice()
                    .reverse()
                    .map((id, idx) => {
                      const p = participants.find((x) => x.id === id);
                      if (!p) return null;
                      return (
                        <li
                          key={id}
                          className="rounded-lg bg-panel-2/70 px-3 py-2 font-prize text-xs"
                        >
                          <span className="block font-semibold">{p.name}</span>
                          <span className="text-muted-foreground">
                            {p.ticket} ·{" "}
                            {prizeNames.length
                              ? prizeNames[(drawnIds.length - 1 - idx) % prizeNames.length]
                              : "-"}
                          </span>
                        </li>
                      );
                    })}
                </ul>
              )}
            </SidebarCard>
          </aside>
        </div>
      </div>
    </div>
  );
}

function ControlButton({
  children,
  onClick,
  disabled,
  tone,
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  tone: "primary" | "danger" | "success" | "ghost";
}) {
  const tones = {
    primary: "bg-primary text-primary-foreground hover:brightness-110",
    danger: "bg-destructive text-destructive-foreground hover:brightness-110",
    success: "bg-success text-success-foreground hover:brightness-110",
    ghost: "bg-panel-2 text-foreground hover:bg-accent",
  };
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`flex h-14 items-center gap-2 rounded-xl px-6 font-display text-sm font-bold tracking-[0.14em] uppercase transition-all disabled:cursor-not-allowed disabled:opacity-40 ${tones[tone]}`}
    >
      {children}
    </button>
  );
}

function SidebarCard({
  title,
  icon,
  children,
}: {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-sidebar-border bg-sidebar px-5 py-4">
      <h2 className="mb-3 flex items-center gap-2 border-b border-border pb-2 font-display text-xs font-bold tracking-[0.28em] text-muted-foreground uppercase">
        {icon}
        {title}
      </h2>
      <div className="flex flex-col gap-2">{children}</div>
    </section>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <span className="font-prize text-xs tracking-wider text-muted-foreground">{label}</span>
      <span className="font-winner text-lg font-extrabold">{value}</span>
    </div>
  );
}
