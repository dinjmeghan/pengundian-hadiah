import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { type Participant } from "@/data/participants";

export type PrizeItem = { id: string; name: string };

const listeners = new Set<() => void>();
const notify = () => listeners.forEach((l) => l());

export function useUndianData() {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [prizes, setPrizes] = useState<PrizeItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  const load = useCallback(async () => {
    const [p, h] = await Promise.all([
      supabase
        .from("participants")
        .select("id, name, address, ticket")
        .order("created_at", { ascending: true }),
      supabase.from("prizes").select("id, name").order("position", { ascending: true }),
    ]);
    setParticipants((p.data ?? []) as Participant[]);
    setPrizes((h.data ?? []) as PrizeItem[]);
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
    await supabase.from("prizes").insert({ name, position: prizes.length + 1 });
    notify();
  };

  const updatePrize = async (id: string, name: string) => {
    await supabase.from("prizes").update({ name }).eq("id", id);
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
    deletePrize,
  };
}
