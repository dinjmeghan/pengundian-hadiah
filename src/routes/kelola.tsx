import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, Gift, Pencil, Plus, Trash2, Users, X } from "lucide-react";
import { useUndianData } from "@/lib/store";

export const Route = createFileRoute("/kelola")({
  head: () => ({
    meta: [
      { title: "Kelola Data Peserta & Hadiah | Undian" },
      {
        name: "description",
        content:
          "Kelola data undian: tambah, ubah, dan hapus daftar nama peserta, alamat, nomor undian, serta daftar hadiah.",
      },
      { property: "og:title", content: "Kelola Data Peserta & Hadiah | Undian" },
      {
        property: "og:description",
        content: "CRUD data peserta (nama, alamat, nomor undian) dan daftar hadiah undian.",
      },
    ],
  }),
  component: Kelola,
});

type Form = { name: string; address: string; ticket: string };
const EMPTY: Form = { name: "", address: "", ticket: "" };

function Kelola() {
  const {
    participants,
    prizes,
    addParticipant,
    updateParticipant,
    deleteParticipant,
    addPrize,
    updatePrize,
    deletePrize,
  } = useUndianData();

  const [form, setForm] = useState<Form>(EMPTY);
  const [editId, setEditId] = useState<number | null>(null);
  const [query, setQuery] = useState("");

  const [prizeName, setPrizeName] = useState("");
  const [prizeEditId, setPrizeEditId] = useState<number | null>(null);

  const filtered = participants.filter((p) =>
    `${p.name} ${p.address} ${p.ticket}`.toLowerCase().includes(query.toLowerCase()),
  );

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const name = form.name.trim().toUpperCase().slice(0, 80);
    const address = form.address.trim().slice(0, 160);
    const ticket = form.ticket.trim().toUpperCase().slice(0, 40);
    if (!name || !address || !ticket) return;
    if (editId !== null) updateParticipant(editId, { name, address, ticket });
    else addParticipant({ name, address, ticket });
    setForm(EMPTY);
    setEditId(null);
  };

  const submitPrize = (e: React.FormEvent) => {
    e.preventDefault();
    const name = prizeName.trim().slice(0, 80);
    if (!name) return;
    if (prizeEditId !== null) updatePrize(prizeEditId, name);
    else addPrize(name);
    setPrizeName("");
    setPrizeEditId(null);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto flex max-w-[1500px] flex-col gap-6 px-4 py-6 lg:px-8">
        <header className="panel-surface shine flex flex-col items-center gap-3 rounded-2xl px-6 py-5 text-center">
          <h1 className="font-display text-2xl font-bold tracking-[0.14em] uppercase sm:text-3xl">
            Kelola Data Undian
          </h1>
          <p className="font-prize text-xs tracking-[0.3em] text-muted-foreground uppercase">
            Nama · Alamat · Nomor Undian · Hadiah
          </p>
          <Link
            to="/"
            className="flex h-14 items-center gap-2 rounded-xl bg-panel-2 px-6 font-display text-sm font-bold tracking-[0.14em] uppercase transition-all hover:bg-accent"
          >
            <ArrowLeft className="size-5" /> Kembali ke Dashboard
          </Link>
        </header>

        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
          <main className="flex flex-col gap-6">
            <section className="panel-surface flex flex-col gap-5 rounded-3xl px-6 py-6">
              <h2 className="flex items-center gap-2 font-display text-xs font-bold tracking-[0.28em] text-muted-foreground uppercase">
                <Users className="size-4" />
                {editId !== null ? "Ubah Peserta" : "Tambah Peserta"}
              </h2>
              <form onSubmit={submit} className="grid gap-3 sm:grid-cols-3">
                <Field
                  label="Nama"
                  value={form.name}
                  maxLength={80}
                  onChange={(v) => setForm((f) => ({ ...f, name: v }))}
                />
                <Field
                  label="Alamat"
                  value={form.address}
                  maxLength={160}
                  onChange={(v) => setForm((f) => ({ ...f, address: v }))}
                />
                <Field
                  label="Nomor Undian"
                  value={form.ticket}
                  maxLength={40}
                  onChange={(v) => setForm((f) => ({ ...f, ticket: v }))}
                />
                <div className="flex flex-wrap gap-3 sm:col-span-3">
                  <button
                    type="submit"
                    className="flex h-14 items-center gap-2 rounded-xl bg-primary px-6 font-display text-sm font-bold tracking-[0.14em] text-primary-foreground uppercase transition-all hover:brightness-110"
                  >
                    <Plus className="size-5" /> {editId !== null ? "Simpan Perubahan" : "Tambah"}
                  </button>
                  {editId !== null && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditId(null);
                        setForm(EMPTY);
                      }}
                      className="flex h-14 items-center gap-2 rounded-xl bg-panel-2 px-6 font-display text-sm font-bold tracking-[0.14em] uppercase transition-all hover:bg-accent"
                    >
                      <X className="size-5" /> Batal
                    </button>
                  )}
                </div>
              </form>
            </section>

            <section className="panel-surface flex flex-col gap-4 rounded-3xl px-6 py-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="font-display text-xs font-bold tracking-[0.28em] text-muted-foreground uppercase">
                  Daftar Peserta ({filtered.length})
                </h2>
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value.slice(0, 60))}
                  placeholder="Cari nama / alamat / nomor"
                  className="h-11 w-full max-w-xs rounded-xl border border-input bg-panel-2 px-4 font-prize text-sm outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-ring sm:w-auto"
                />
              </div>

              <div className="max-h-[28rem] overflow-auto rounded-2xl border border-border">
                <table className="w-full border-collapse text-left font-prize text-sm">
                  <thead className="sticky top-0 bg-panel-2">
                    <tr className="text-[0.7rem] tracking-[0.2em] text-muted-foreground uppercase">
                      <th className="px-4 py-3">Nama</th>
                      <th className="px-4 py-3">Alamat</th>
                      <th className="px-4 py-3">Nomor Undian</th>
                      <th className="px-4 py-3 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.length === 0 && (
                      <tr>
                        <td colSpan={4} className="px-4 py-6 text-center text-muted-foreground">
                          Belum ada data peserta.
                        </td>
                      </tr>
                    )}
                    {filtered.map((p) => (
                      <tr key={p.id} className="border-t border-border">
                        <td className="px-4 py-3 font-semibold">{p.name}</td>
                        <td className="px-4 py-3 text-muted-foreground">{p.address}</td>
                        <td className="px-4 py-3">{p.ticket}</td>
                        <td className="px-4 py-3">
                          <div className="flex justify-end gap-2">
                            <IconButton
                              label={`Ubah ${p.name}`}
                              onClick={() => {
                                setEditId(p.id);
                                setForm({ name: p.name, address: p.address, ticket: p.ticket });
                              }}
                            >
                              <Pencil className="size-4" />
                            </IconButton>
                            <IconButton
                              label={`Hapus ${p.name}`}
                              danger
                              onClick={() => {
                                deleteParticipant(p.id);
                                if (editId === p.id) {
                                  setEditId(null);
                                  setForm(EMPTY);
                                }
                              }}
                            >
                              <Trash2 className="size-4" />
                            </IconButton>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </main>

          <aside className="flex flex-col gap-4">
            <section className="rounded-2xl border border-sidebar-border bg-sidebar px-5 py-4">
              <h2 className="mb-3 flex items-center gap-2 border-b border-border pb-2 font-display text-xs font-bold tracking-[0.28em] text-muted-foreground uppercase">
                <Gift className="size-4" /> Daftar Hadiah
              </h2>
              <form onSubmit={submitPrize} className="flex flex-col gap-3">
                <input
                  value={prizeName}
                  onChange={(e) => setPrizeName(e.target.value)}
                  maxLength={80}
                  placeholder="Nama hadiah"
                  className="h-11 rounded-xl border border-input bg-panel-2 px-4 font-prize text-sm outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-ring"
                />
                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="flex h-14 flex-1 items-center justify-center gap-2 rounded-xl bg-gold px-4 font-display text-xs font-bold tracking-[0.14em] text-gold-foreground uppercase transition-all hover:brightness-110"
                  >
                    <Plus className="size-4" /> {prizeEditId !== null ? "Simpan" : "Tambah"}
                  </button>
                  {prizeEditId !== null && (
                    <button
                      type="button"
                      onClick={() => {
                        setPrizeEditId(null);
                        setPrizeName("");
                      }}
                      className="flex h-14 items-center justify-center rounded-xl bg-panel-2 px-4 font-display text-xs font-bold uppercase hover:bg-accent"
                    >
                      <X className="size-4" />
                    </button>
                  )}
                </div>
              </form>

              <ul className="mt-4 flex max-h-72 flex-col gap-2 overflow-y-auto pr-1">
                {prizes.length === 0 && (
                  <li className="font-prize text-xs text-muted-foreground">Belum ada hadiah.</li>
                )}
                {prizes.map((h) => (
                  <li
                    key={h.id}
                    className="flex items-center justify-between gap-2 rounded-lg bg-panel-2/70 px-3 py-2 font-prize text-xs"
                  >
                    <span className="font-semibold">{h.name}</span>
                    <span className="flex gap-1">
                      <IconButton
                        label={`Ubah ${h.name}`}
                        onClick={() => {
                          setPrizeEditId(h.id);
                          setPrizeName(h.name);
                        }}
                      >
                        <Pencil className="size-3.5" />
                      </IconButton>
                      <IconButton
                        label={`Hapus ${h.name}`}
                        danger
                        onClick={() => {
                          deletePrize(h.id);
                          if (prizeEditId === h.id) {
                            setPrizeEditId(null);
                            setPrizeName("");
                          }
                        }}
                      >
                        <Trash2 className="size-3.5" />
                      </IconButton>
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          </aside>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  maxLength,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  maxLength: number;
}) {
  return (
    <label className="flex flex-col gap-2">
      <span className="font-prize text-[0.7rem] tracking-[0.28em] text-muted-foreground uppercase">
        {label}
      </span>
      <input
        value={value}
        maxLength={maxLength}
        onChange={(e) => onChange(e.target.value)}
        className="h-14 rounded-xl border border-input bg-panel-2 px-4 font-prize text-sm outline-none focus:ring-2 focus:ring-ring"
      />
    </label>
  );
}

function IconButton({
  children,
  onClick,
  danger,
  label,
}: {
  children: React.ReactNode;
  onClick: () => void;
  danger?: boolean;
  label: string;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className={`inline-flex size-9 items-center justify-center rounded-lg transition-colors ${
        danger
          ? "bg-destructive/15 text-destructive hover:bg-destructive/25"
          : "bg-primary/15 text-primary hover:bg-primary/25"
      }`}
    >
      {children}
    </button>
  );
}
