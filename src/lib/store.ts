import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { type Participant } from "@/data/participants";

export type PrizeItem = { id: string; name: string; quantity: number };

const listeners = new Set<() => void>();
const notify = () => listeners.forEach((l) => l());

export function useUndianData() {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [prizes, setPrizes] = useState<PrizeItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  const load = useCallback(async () => {
    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData.session) {
      setParticipants([]);
      setPrizes([]);
      setHydrated(true);
      return;
    }
    const rows: Participant[] = [];
    const PAGE = 1000;
    for (let from = 0; ; from += PAGE) {
      const { data } = await supabase
        .from("participants")
        .select("id, name, address, phone")
        .order("created_at", { ascending: true })
        .range(from, from + PAGE - 1);
      const chunk = (data ?? []) as Participant[];
      rows.push(...chunk);
      if (chunk.length < PAGE) break;
    }
    const { data: h } = await supabase
      .from("prizes")
      .select("id, name, quantity")
      .order("position", { ascending: true });
    setParticipants(rows);
    setPrizes((h ?? []) as PrizeItem[]);
    setHydrated(true);
  }, []);


  useEffect(() => {
    void load();
    listeners.add(load);
    return () => {
      listeners.delete(load);
    };
  }, [load]);

  const addParticipant = async (data: Omit<Participant, "id">) => {
    await supabase.from("participants").insert(data);
    notify();
  };

  const updateParticipant = async (id: string, data: Omit<Participant, "id">) => {
    await supabase.from("participants").update(data).eq("id", id);
    notify();
  };

  const deleteParticipant = async (id: string) => {
    await supabase.from("participants").delete().eq("id", id);
    notify();
  };

  const addPrize = async (name: string) => {
    await supabase.from("prizes").insert({ name, position: prizes.length + 1, quantity: 1 });
    notify();
  };

  const updatePrize = async (id: string, name: string) => {
    await supabase.from("prizes").update({ name }).eq("id", id);
    notify();
  };

  const updatePrizeQuantity = async (id: string, quantity: number) => {
    await supabase.from("prizes").update({ quantity: Math.max(1, quantity) }).eq("id", id);
    notify();
  };

  const deletePrize = async (id: string) => {
    await supabase.from("prizes").delete().eq("id", id);
    notify();
  };

  return {
    hydrated,
    participants,
    prizes,
    addParticipant,
    updateParticipant,
    deleteParticipant,
    addPrize,
    updatePrize,
    updatePrizeQuantity,
    deletePrize,
  };
}
