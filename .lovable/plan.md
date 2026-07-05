# Mobile-app redesign plan

Goal: make every authenticated screen feel like a modern Instagram/TikTok mobile app while keeping the existing Cholo Kheli brand colors, tabs, routes, roles (player/scout/admin), auth flow, and features intact. No new features, no backend changes.

## Design language (locked)

- Chrome = Instagram: white/near-black surfaces (already themed light/dark), 1px hairlines instead of heavy borders, thin 1.5px lucide icons, generous vertical rhythm, no rounded cards on full-bleed media.
- Feed = Instagram post feed: avatar + username row → full-bleed media (video/image, aspect-ratio boxed) → action row (like, comment, share, save) → like count → username + caption → timestamp.
- Immersive video viewer (opened from feed tap or Players tab) = TikTok: full-screen swipeable vertical player with right-rail actions and overlaid meta.
- Typography: keep existing Manrope/Inter Tight; tighten to IG-like sizes (username 13–14 semibold, caption 14 regular, meta 11 uppercase muted).
- Brand accent (teal-deep) reserved for: active tab icon, primary CTA, verified/scout badges, like state.

## Screens to rebuild

1. AppTabBar — IG-style: 5 slots, thin outline icons that fill when active, no colored pill indicator, no labels (or micro-label under active only). Center Upload slot gets a subtle emphasized "+" for players.
2. AppHeader — IG-style top bar: brand wordmark left, small icon actions right (notifications, settings). Back arrow only on nested routes. No language chip (moves to Settings).
3. Home (PlayerDashboard / ScoutDashboard) — IG post feed of latest player videos with the action row spec above. Stories-style horizontal rail on top showing "featured players" (reuse existing data, no new endpoint).
4. Players / Explore (PlayerExplore, ScoutExplore) — IG Explore grid: 3-column square thumbnails, no gap, tap → immersive TikTok viewer.
5. Upload (PlayerUpload) — IG-style single-screen composer: media preview on top, caption + sport/tags below, sticky "Share" button.
6. Profile (PlayerProfile, ScoutProfile) — IG profile: avatar + stats row (videos / views / picks), name + bio, edit-profile button, tab strip (Grid / Tagged), 3-col grid.
7. Settings (AccountSettings) — IG-style grouped list rows with chevrons; language, theme, sign out, danger zone.
8. Admin (AdminDashboard) — same chrome refresh, keep tables/panels; only restyle headers and cards.
9. Auth + intro — leave the current bottom-sheet sign-up and 2D silver intro as they are (recently landed); only adjust typography to match the new scale.

## Shared components to add

- `src/components/app/FeedPostCard.tsx` — IG post card (header, media slot, actions, caption).
- `src/components/app/StoriesRail.tsx` — horizontal avatar rail.
- `src/components/app/ExploreGrid.tsx` — 3-col square grid wrapper.
- `src/components/app/ImmersivePlayer.tsx` — TikTok-style full-screen swipeable video (wraps existing video data; opened as a route overlay from `/player/watch/$id` or as a modal on Explore tap — modal to avoid new routes).
- `src/components/app/ProfileHeader.tsx` — avatar + stat trio + bio.
- `src/components/app/ListRow.tsx` — settings-style row with icon + label + chevron.

Existing components (`PlayerVideosTab`, `ProfileTab`, `NotificationBell`, etc.) get restyled in place — no data/logic changes.

## Technical notes

- Pure presentational refactor. No route changes, no schema changes, no new server functions, no changes to `useAuth`, RLS, or Supabase queries.
- Brand tokens stay untouched in `src/index.css`; new surface tokens (`--surface-hairline`, `--surface-elevated`) added only if a value is reused ≥3 places.
- Icons: lucide, `strokeWidth={1.75}` default, `2.25` on active tab.
- Motion: framer-motion only where already in use (tab indicator, sheets); no new heavy animation.
- Keep `AppFrame` max-width 430px shell; media inside feed goes edge-to-edge of that shell.
- Mobile viewport only; desktop shows the same phone-shaped shell (already the case).

## Rollout order (single pass, in this order so the app stays runnable after each step)

1. Restyle `AppTabBar` + `AppHeader`.
2. Add shared components (`FeedPostCard`, `StoriesRail`, `ExploreGrid`, `ListRow`, `ProfileHeader`, `ImmersivePlayer`).
3. Rebuild Home for player + scout.
4. Rebuild Explore (players + scouts) with grid + immersive viewer.
5. Rebuild Upload composer.
6. Rebuild Profile (player + scout) + Settings list.
7. Pass over Admin chrome + Notifications sheet for consistency.
8. Visual QA via Playwright at 390×844 for each tab & role.

## Out of scope

- Auth pages, intro loader, marketing site (untouched).
- Any new feature, copy rewrite beyond microcopy needed for new UI (e.g. tab labels).
- Dark/light theme changes beyond what falls out of using existing tokens.
