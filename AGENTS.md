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
- Recruitment uses pure varied applicant generation and authenticated advert/review functions with owner-scoped transactional RPCs; accepted offers create staff once, while profiles and fictional portrait indexes remain saved with the application.
- Rail mode uses separate revisioned owner-scoped saved state and pure rail rules; authenticated actions commit through a service-only compare-and-save RPC so train finances cannot mix with bus games.
- Upgrade installation and upkeep use shared pure price helpers; purchases and retrofits commit spending and specifications together through a service-only authenticated action.
- London stop datasets filter ONS borough polygons for Barnet, Enfield and Haringey, with Borehamwood/Elstree NaPTAN localities added; London presets attribute TfL routes to actual operating companies.
- Passenger review analysis reads owner-scoped route evidence on the server and uses streamed structured Lovable AI output; both modes share review selection, and denied AI access is persisted to prevent automatic replays.
- Bus frequency uses a shared 60-minute game-cycle rule; undersupplied allocated routes block operating-day settlement in pure rules and the report validation trigger, while zero-bus routes remain planned.
- Daily demand and running-cost variation uses shared pure, day-keyed operating conditions saved with reports; retries reproduce results while wages, rents, contracts and feature upkeep remain fixed.
- Bus companies are grouped into area menus (Herts, North London, Beds, Bucks, Essex) derived from preset key or HQ town in `src/lib/areas.ts`, avoiding a schema change; north London routes come from a generated TfL stop-match snapshot, and uploaded passenger reviews live in `src/lib/review-bank.json`.
- Starting-capital suggestions use shared pure rules; saved-network funding is an owner-scoped atomic RPC with a per-company one-time marker, so reopening the company list cannot duplicate grants.
- Staff/applicant lists load through paged fetchAll (1,000-row API limit); depot-manager limits (one per depot, total ≤ depots) live in a drivers DB trigger so every hiring path obeys them.
- Staff perks (route inspectors/senior drivers, depot cleaners/engineers/managers, company-wide controllers/trainers, rail roles) live in pure capped rules in `src/lib/staff-perks.ts`; DB triggers decide which roles may hold routes and count as crew.
