<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Operator presets, Herts towns and bus models live in `src/lib/herts.ts`; day-simulation maths lives in pure `src/lib/sim.ts` (tested) so game rules stay separate from UI.
- All game data is per-user rows (companies/routes/buses/drivers) guarded by owner RLS; signed-in pages live under `src/routes/_authenticated/`.
- Expansion rules and repeatable stock/contracts live in `src/lib/management.ts`; authenticated management actions validate ownership and use transaction RPCs so spending and saved game results stay consistent.
- Network planning uses Google Maps JavaScript with local active NaPTAN snapshots under public/data; map windows are geographic bounds, not exact county borders, and connector credentials stay out of server-call browser code.
