import { auth, defineMcp } from "@lovable.dev/mcp-js";
import listParticipantsTool from "./tools/list-participants";
import createParticipantTool from "./tools/create-participant";
import deleteParticipantTool from "./tools/delete-participant";
import listPrizesTool from "./tools/list-prizes";
import createPrizeTool from "./tools/create-prize";

type McpTools = Parameters<typeof defineMcp>[0]["tools"];

// The OAuth issuer must be the direct Supabase host; the project ref is the only
// value that survives publish unchanged.
const projectRef = import.meta.env['VITE_SUPABASE_PROJECT_ID'] ?? "project-ref-unset";

export default defineMcp({
  name: "lucky-draw-dashboard",
  title: "Lucky Draw Dashboard",
  version: "0.1.0",
  instructions:
    "Tools for the Lucky Draw Dashboard (Dashboard Pengundian Hadiah). Read and manage draw participants (name, address, phone number) and the prize list. Callers must sign in as an operator/admin of the app; participant data is protected by row-level security.",
  auth: auth.oauth.issuer({
    issuer: `https://${projectRef}.supabase.co/auth/v1`,
    acceptedAudiences: "authenticated",
  }),
  tools: [
    listParticipantsTool,
    createParticipantTool,
    deleteParticipantTool,
    listPrizesTool,
    createPrizeTool,
  ] as unknown as McpTools,
});
