<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.

## What Lovable manages

Rules outside this block are the project's own. Change the pieces below in
Lovable, not by hand. With the [Lovable MCP](https://mcp.lovable.dev)
connected, `send_message` asks Lovable to do it; otherwise ask the user to
use the editor.

- **Database.** Do not add or edit `supabase/migrations/` or `drizzle/`.
  Ask Lovable to change the schema.
- **Generated files.** Do not edit a file whose header says it is automatically
  generated.
- **AI gateway.** Keep model calls on Lovable's gateway, and keep
  `LOVABLE_API_KEY` out of browser code.
- **Connectors.** Lovable provides native connectors. `list_connectors` shows
  which are enabled; `add_connector` only returns the dashboard link. When a
  connector is enabled, calls go through the connector gateway and need
  `LOVABLE_API_KEY`. When Lovable does not provide one, users can bring their
  own key and store it in Secrets.
- **Secrets.** Lovable manages them. Do not put secret values in the repo.
<!-- LOVABLE:END -->

## Night Desk architecture
- Keep pricing and hotel operational calculations in pure shared modules with concrete rule tests, so ingestion and UI quotes agree.
- Keep external inquiry intake in a signed public server route; never trust supplied monetary totals or demo flags.
- Only explicitly approved staff roles may access or change real guest records; public access is limited to fictional case rows.
- Staff profile fields and access roles must remain separate, preventing profile edits from escalating privileges.
- Seed fictional rows through migrations; use Query for desk reads and invalidate from one mounted Realtime subscription.
- Keep the fixed read-only presentation fixture separate from operational pricing and Cloud records; presentation quotes must never change intake calculations or guest data.
- Mount the presentation shell in the root around the four leaf views so shared KPIs, navigation and reporting period remain stationary during view changes; use TanStack links and Framer Motion instead of Next.js-only sidebar imports.
