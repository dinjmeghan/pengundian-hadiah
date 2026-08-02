import { useEffect, useRef } from "react";

type Piece = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  rot: number;
  vr: number;
  color: string;
};

const COLORS = ["#2563EB", "#22C55E", "#FACC15", "#FFFFFF", "#60A5FA"];

/** Confetti + light burst canvas overlay shown when a winner is revealed. */
export function Celebration({ active }: { active: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!active) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let frame = 0;
    let raf = 0;
    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const pieces: Piece[] = Array.from({ length: 220 }, () => ({
      x: Math.random() * canvas.width,
      y: -Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 2.4,
      vy: 2 + Math.random() * 4,
      size: 5 + Math.random() * 8,
      rot: Math.random() * Math.PI,
      vr: (Math.random() - 0.5) * 0.25,
      color: COLORS[Math.floor(Math.random() * COLORS.length)]!,
    }));

    const tick = () => {
      frame += 1;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (const p of pieces) {
        p.x += p.vx;
        p.y += p.vy;
        p.rot += p.vr;
        if (p.y > canvas.height + 20) {
          p.y = -20;
          p.x = Math.random() * canvas.width;
        }
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = 0.9;
        ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
        ctx.restore();
      }
      if (frame < 60 * 20) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    };
  }, [active]);

  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 overflow-hidden rounded-[inherit]"
    >
      <canvas ref={canvasRef} className="h-full w-full" />
      {active && (
        <>
          {[
            { top: "12%", left: "14%", delay: "0s" },
            { top: "22%", left: "82%", delay: "0.35s" },
            { top: "62%", left: "24%", delay: "0.7s" },
            { top: "70%", left: "76%", delay: "1.05s" },
          ].map((pos) => (
            <span
              key={pos.delay}
              className="absolute size-40 animate-firework rounded-full opacity-0"
              style={{
                top: pos.top,
                left: pos.left,
                animationDelay: pos.delay,
                background:
                  "radial-gradient(circle, color-mix(in oklab, var(--gold) 70%, transparent) 0%, transparent 65%)",
              }}
            />
          ))}
        </>
      )}
    </div>
  );
}
