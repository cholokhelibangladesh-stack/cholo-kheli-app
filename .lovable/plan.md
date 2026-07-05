# Instagram-style Settings for Cholo Kheli

Rebuild `/player/settings` as a full IG "Settings and activity" hub: searchable list, grouped sections, one detail route per row. Each row will do something real in Cholo Kheli — cosmetic-only rows are dropped, Meta-brand rows are renamed to Cholo Kheli equivalents.

Because this is ~30 screens + schema for ~10 new tables, I'll ship it in **three approval batches**. Each batch is a working milestone — nothing is left as a dead stub between batches.

---

## Batch 1 — Foundation + core account/privacy (this turn)

**Schema (one migration, all tables + RLS + GRANTs):**
- `privacy_settings` (1-per-user): `is_private`, `story_visibility`, `activity_status`, `read_receipts`, `allow_tags`, `allow_mentions`, `comment_control`, `sharing_allowed`, `hide_like_counts`, `hide_share_counts`, `language`, `data_saver`, `hd_uploads`, `daily_limit_minutes`, `break_reminder_minutes`
- `notification_preferences` (1-per-user): granular toggles for likes, comments, followers, messages, scout requests, email, push, plus `pause_all_until`
- `blocked_users`, `muted_users`, `restricted_users`, `close_friends`, `favorites` (user_id, target_id pairs)
- `hidden_words` (list) + column on `privacy_settings` for the master toggle
- `saved_videos` (user_id, video_id)
- Add `archived` boolean to `videos`
- Trigger to auto-create `privacy_settings` + `notification_preferences` rows on profile insert

**Hub page** — new `/player/settings` (replaces current):
- Search bar (filters rows client-side)
- "Your account" → Accounts Center (folds current username/security/sessions here)
- Sections & rows matching the video (renamed for Cholo Kheli):
  - How you use Cholo Kheli: Saved, Archive, Your activity, Notifications, Time management
  - Who can see your content: Account privacy, Close Friends, Blocked, Story & location, Activity in feed
  - How others can interact: Messages, Tags & mentions, Comments, Sharing, Restricted, Limit interactions, Hidden words, Follow & invite friends
  - What you see: Favorites, Muted accounts, Content preferences, Like & share counts
  - Your app and media: Device permissions, Downloads, Accessibility, Language, Data usage & media quality
  - Insights and tools: Account type, Stats
  - Orders and payments (uses existing `payments` table)
  - More info: Help, Privacy Center, Account Status, About
  - Login: Add account, Log out
- Login row uses destructive tint; Meta pill in header replaced with "Cholo Kheli" wordmark

**Fully functional this batch (real behavior, not stubs):**
1. Accounts Center → existing security/username/sessions UI
2. Account privacy (public/private toggle, writes `profiles.is_private` + `privacy_settings`)
3. Notifications (all toggles + pause-all with duration picker)
4. Blocked accounts (list, unblock, search-to-block)
5. Language (en / bn, persists, applies via i18n context)
6. Log out
7. Account Status (shows any moderation_alerts against the user)
8. About (version, links to Privacy Policy, FAQ, Safe Scouting, Mission)

Every other row navigates to its detail route and renders a real, non-placeholder scaffold (title, description, "No items yet" empty state wired to the correct table) so nothing is a dead link.

---

## Batch 2 — Content controls + safety (next turn)

Fully wire: Saved, Archive, Close Friends, Favorites, Muted, Restricted, Hidden Words (with default word list + custom words), Comments control, Sharing control, Tags & mentions, Messages replies, Story & location, Limit interactions (temporary 1-week / 2-week / 4-week restriction from non-followers).

---

## Batch 3 — Insights, activity, media, misc (final turn)

Fully wire: Your Activity (recent likes, comments, uploads from `video_events` + `video_likes` + `video_shares`), Time management (daily-limit reminder driven by `video_events` watch_ms), Stats/insights (profile views, video performance), Data usage & media quality (persists to `privacy_settings`, actually gates upload quality + autoplay), Device permissions (camera/mic/notifications browser prompts), Downloads (export user data as JSON via server fn), Accessibility (reduce motion, captions default), Orders & payments (list from `payments`), Help (searchable FAQ), Privacy Center (links).

Dropped as non-applicable to Cholo Kheli: Crossposting to other socials, Avatar interactions, Instagram-for-tablets, Family Center / Teen Supervision, Meta Verified, Meta AI, Threads, More from Meta, Add account (Supabase doesn't support multi-account switch here).

---

## Technical notes

- Detail routes live under `src/routes/player/settings.*.tsx` using TanStack flat routing (e.g. `settings.privacy.tsx`, `settings.blocked.tsx`, `settings.notifications.tsx`).
- All mutations go through `createServerFn` with `requireSupabaseAuth`. Reads use `useSuspenseQuery` + loader `ensureQueryData` under the existing `_authenticated`-equivalent gate.
- Row list is data-driven (single array of `{ group, label, icon, to, badge, tint }`) so search filtering, ordering, and Batch-2/3 wiring stay in one place.
- Visual style continues the existing glass-card aesthetic; icons from `lucide-react` mapped 1:1 to the IG icons in the video.
- No new external packages beyond what's already installed.

Batch 1 is a lot on its own (~15 files + one migration). I'll start there on approval, then check in before Batch 2.