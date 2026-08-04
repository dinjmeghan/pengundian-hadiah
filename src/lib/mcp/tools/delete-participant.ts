import { defineTool, ToolError } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser } from "../supabase";

export default defineTool({
  name: "delete_participant",
  title: "Delete participant",
  description: "Remove a lucky-draw participant by id.",
  inputSchema: { id: z.string().trim().min(1).describe("Participant id (uuid).") },
  annotations: { readOnlyHint: false, destructiveHint: true, openWorldHint: false },
  handler: async ({ id }, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    }
    const supabase = supabaseForUser(ctx);
    const { data, error } = await supabase.from("participants").delete().eq("id", id).select("id");
    if (error) throw new ToolError(error.message);
    if (!data?.length) throw new ToolError(`No participant found with id ${id}`);
    return { content: [{ type: "text", text: `Deleted participant ${id}` }] };
  },
});
