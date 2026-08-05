import { defineTool, ToolError } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser } from "../supabase";

export default defineTool({
  name: "create_prize",
  title: "Create prize",
  description: "Add a prize to the lucky-draw prize list.",
  inputSchema: {
    name: z.string().trim().min(1).describe("Prize name, e.g. SMART TV 55 INCH."),
    position: z.number().int().optional().describe("Optional draw order position."),
    quantity: z.number().int().min(1).optional().describe("How many units of this prize (default 1)."),
  },
  annotations: { readOnlyHint: false, destructiveHint: false, openWorldHint: false },
  handler: async ({ name, position, quantity }, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    }
    const supabase = supabaseForUser(ctx);
    let nextPosition = position;
    if (nextPosition == null) {
      const { data: last } = await supabase
        .from("prizes")
        .select("position")
        .order("position", { ascending: false })
        .limit(1);
      nextPosition = (last?.[0]?.position ?? 0) + 1;
    }
    const { data, error } = await supabase
      .from("prizes")
      .insert({ name, position: nextPosition, quantity: quantity ?? 1 })
      .select("id, name, position, quantity");
    if (error) throw new ToolError(error.message);
    return {
      content: [{ type: "text", text: JSON.stringify(data?.[0] ?? null) }],
      structuredContent: { prize: data?.[0] ?? null },
    };
  },
});
