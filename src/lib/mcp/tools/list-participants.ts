import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser } from "../supabase";

export default defineTool({
  name: "list_participants",
  title: "List participants",
  description:
    "List lucky-draw participants (name, address, phone number). Supports an optional name/ticket search and a result limit.",
  inputSchema: {
    search: z.string().trim().optional().describe("Optional text to match against name or phone number."),
    limit: z.number().int().optional().describe("Max rows to return (default 50, max 500)."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ search, limit }, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    }
    const take = Math.min(Math.max(limit ?? 50, 1), 500);
    const supabase = supabaseForUser(ctx);
    let query = supabase
      .from("participants")
      .select("id, name, address, phone")
      .order("created_at", { ascending: true })
      .limit(take);
    if (search) query = query.or(`name.ilike.%${search}%,phone.ilike.%${search}%`);

    const { data, error } = await query;
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    return {
      content: [{ type: "text", text: JSON.stringify(data ?? []) }],
      structuredContent: { participants: data ?? [], count: data?.length ?? 0 },
    };
  },
});
