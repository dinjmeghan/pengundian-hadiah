import { useCallback, useEffect, useState } from "react";
import { PARTICIPANTS, PRIZES, type Participant } from "@/data/participants";

export type PrizeItem = { id: number; name: string };

const P_KEY = "undian.participants.v1";
const H_KEY = "undian.prizes.v1";

const seedParticipants = (): Participant[] => PARTICIPANTS.slice(0, 50);
const seedPrizes = (): PrizeItem[] => PRIZES.map((name, i) => ({ id: i + 1, name }));

function read<T>(key: string, fallback: () => T): T {
  if (typeof window === "undefined") return fallback();
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback();
    const parsed = JSON.parse(raw) as T;
    return Array.isArray(parsed) && parsed.length >= 0 ? parsed : fallback();
  } catch {
    return fallback();
  }
}

const listeners = new Set<() => void>();
const notify = () => listeners.forEach((l) => l());

export function useUndianData() {
  const [participants, setParticipants] = useState<Participant[]>(seedParticipants);
  const [prizes, setPrizes] = useState<PrizeItem[]>(seedPrizes);
  const [hydrated, setHydrated] = useState(false);

  const load = useCallback(() => {
    setParticipants(read(P_KEY, seedParticipants));
    setPrizes(read(H_KEY, seedPrizes));
  }, []);

  useEffect(() => {
    load();
    setHydrated(true);
    listeners.add(load);
    return () => {
      listeners.delete(load);
    };
  }, [load]);

  const persistParticipants = useCallback((next: Participant[]) => {
    window.localStorage.setItem(P_KEY, JSON.stringify(next));
    notify();
  }, []);

  const persistPrizes = useCallback((next: PrizeItem[]) => {
    window.localStorage.setItem(H_KEY, JSON.stringify(next));
    notify();
  }, []);

  const nextId = (rows: { id: number }[]) => rows.reduce((m, r) => Math.max(m, r.id), 0) + 1;

  const addParticipant = (data: Omit<Participant, "id">) =>
    persistParticipants([...participants, { ...data, id: nextId(participants) }]);

  const updateParticipant = (id: number, data: Omit<Participant, "id">) =>
    persistParticipants(participants.map((p) => (p.id === id ? { ...p, ...data } : p)));

  const deleteParticipant = (id: number) =>
    persistParticipants(participants.filter((p) => p.id !== id));

  const addPrize = (name: string) => persistPrizes([...prizes, { id: nextId(prizes), name }]);

  const updatePrize = (id: number, name: string) =>
    persistPrizes(prizes.map((p) => (p.id === id ? { ...p, name } : p)));

  const deletePrize = (id: number) => persistPrizes(prizes.filter((p) => p.id !== id));

  return {
    hydrated,
    participants,
    prizes,
    addParticipant,
    updateParticipant,
    deleteParticipant,
    addPrize,
    updatePrize,
    deletePrize,
  };
}
