import { defineTool, ToolError } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser } from "../supabase";

export default defineTool({
  name: "create_participant",
  title: "Create participant",
  description: "Add a new lucky-draw participant with a name, address and ticket number.",
  inputSchema: {
    name: z.string().trim().min(1).describe("Participant full name."),
    address: z.string().trim().min(1).describe("Participant address."),
    ticket: z.string().trim().min(1).describe("Draw ticket number, e.g. JP-2026-000123."),
  },
  annotations: { readOnlyHint: false, destructiveHint: false, openWorldHint: false },
  handler: async ({ name, address, ticket }, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    }
    const supabase = supabaseForUser(ctx);
    const { data, error } = await supabase
      .from("participants")
      .insert({ name, address, ticket })
      .select("id, name, address, ticket");
    if (error) throw new ToolError(error.message);
    return {
      content: [{ type: "text", text: JSON.stringify(data?.[0] ?? null) }],
      structuredContent: { participant: data?.[0] ?? null },
    };
  },
});
