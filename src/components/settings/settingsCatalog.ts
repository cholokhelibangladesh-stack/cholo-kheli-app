import {
  Bookmark, Archive as ArchiveIcon, Activity, Bell, Clock,
  Lock, Users, Ban, EyeOff, CircleSlash, MessageSquare,
  AtSign, Share2, Type, UserPlus, Star, VolumeX, ListFilter, Heart,
  Smartphone, Download, Accessibility, Languages, Signal,
  BadgeCheck, Receipt, LifeBuoy, ShieldCheck, UserCircle2, Info,
  Bot, KeyRound, Fingerprint, MonitorSmartphone, AlertTriangle,
  Flag, Trophy, Video,
  LogOut,
  type LucideIcon,
} from "lucide-react";

export type CatalogItem = {
  id: string;
  label: string;
  to: string;
  icon: LucideIcon;
  group: string;
  tint?: "default" | "destructive" | "accent";
  keywords?: string;
  /** Which app roles the item is visible to. Default: all. */
  roles?: Array<"player" | "scout" | "admin">;
};

const G = {
  account: "Your account",
  usage: "How you use Cholo Kheli",
  visibility: "Who can see your profile",
  interactions: "How others can reach you",
  feed: "What you see in the feed",
  device: "Device and playback",
  creator: "Creator and verification",
  scout: "Scouting tools",
  admin: "Admin controls",
  billing: "Payments and receipts",
  support: "Help and safety",
  session: "Session",
} as const;

/**
 * Cholo Kheli settings catalog — trimmed to features the platform actually
 * offers, reworded so it doesn't read as a straight Instagram clone. Accounts
 * Center is removed; the rows it used to hide (password, sign-in devices,
 * personal details) are embedded here directly under "Your account".
 */
export const SETTINGS_CATALOG: CatalogItem[] = [
  // Your account (former Accounts Center rows, inlined)
  { id: "personal-details", label: "Personal details", to: "/player/settings/personal-details", icon: UserCircle2, group: G.account, keywords: "name email phone dob first last" },
  { id: "password", label: "Password and passkeys", to: "/player/settings/password", icon: KeyRound, group: G.account, keywords: "change password reset" },
  { id: "sign-in-devices", label: "Sign-in devices", to: "/player/settings/sessions", icon: MonitorSmartphone, group: G.account, keywords: "sessions logout everywhere where signed in" },
  { id: "two-factor", label: "Two-step verification", to: "/player/settings/two-factor", icon: Fingerprint, group: G.account, keywords: "2fa otp security" },

  // How you use Cholo Kheli
  { id: "saved", label: "Saved plays", to: "/player/settings/saved", icon: Bookmark, group: G.usage, keywords: "bookmarks collection" },
  { id: "archive", label: "Archived uploads", to: "/player/settings/archive", icon: ArchiveIcon, group: G.usage, keywords: "hidden videos" },
  { id: "activity", label: "Your activity", to: "/player/settings/activity", icon: Activity, group: G.usage, keywords: "history likes comments" },
  { id: "notifications", label: "Notifications", to: "/player/settings/notifications", icon: Bell, group: G.usage, keywords: "push email alerts" },
  { id: "time", label: "Screen time", to: "/player/settings/time", icon: Clock, group: G.usage, keywords: "daily limit break reminder" },

  // Who can see your profile
  { id: "privacy", label: "Profile visibility", to: "/player/settings/privacy", icon: Lock, group: G.visibility, keywords: "private public" },
  
  { id: "blocked", label: "Blocked accounts", to: "/player/settings/blocked", icon: Ban, group: G.visibility, keywords: "block ignore" },
  { id: "story", label: "Live and location", to: "/player/settings/story", icon: EyeOff, group: G.visibility },

  // How others can reach you
  { id: "messages", label: "Direct messages", to: "/player/settings/messages", icon: MessageSquare, group: G.interactions },
  { id: "tags", label: "Tags and mentions", to: "/player/settings/tags", icon: AtSign, group: G.interactions },
  { id: "sharing", label: "Sharing and reposts", to: "/player/settings/sharing", icon: Share2, group: G.interactions },
  { id: "restricted", label: "Restricted accounts", to: "/player/settings/restricted", icon: CircleSlash, group: G.interactions },
  { id: "hidden-words", label: "Muted words", to: "/player/settings/hidden-words", icon: Type, group: G.interactions },
  { id: "invite", label: "Invite teammates", to: "/player/settings/invite", icon: UserPlus, group: G.interactions },

  // What you see in the feed
  { id: "favorites", label: "Favourite creators", to: "/player/settings/favorites", icon: Star, group: G.feed },
  { id: "muted", label: "Muted accounts", to: "/player/settings/muted", icon: VolumeX, group: G.feed },
  { id: "content-prefs", label: "Feed preferences", to: "/player/settings/content-preferences", icon: ListFilter, group: G.feed, keywords: "sport position" },
  { id: "counts", label: "Like and share counts", to: "/player/settings/counts", icon: Heart, group: G.feed },

  // Device and playback
  { id: "device-perms", label: "App permissions", to: "/player/settings/devices", icon: Smartphone, group: G.device, keywords: "camera microphone" },
  { id: "downloads", label: "Downloads and offline", to: "/player/settings/downloads", icon: Download, group: G.device },
  { id: "accessibility", label: "Accessibility", to: "/player/settings/accessibility", icon: Accessibility, group: G.device },
  { id: "language", label: "Language", to: "/player/settings/language", icon: Languages, group: G.device, keywords: "english bangla" },
  { id: "data-usage", label: "Data and video quality", to: "/player/settings/data-usage", icon: Signal, group: G.device },

  // Creator and verification (players only)
  { id: "verified", label: "Cholo Kheli Verified", to: "/player/settings/verified", icon: BadgeCheck, group: G.creator, roles: ["player"] },
  { id: "ck-ai", label: "Cholo Kheli AI assistant", to: "/player/settings/ai", icon: Bot, group: G.creator, roles: ["player"] },

  // Scouting tools (scouts only)
  { id: "scout-prefs", label: "Scouting preferences", to: "/scout/settings/preferences", icon: ListFilter, group: G.scout, roles: ["scout"], keywords: "sport position filter" },
  { id: "scout-selections", label: "Your selections", to: "/scout/selections", icon: Trophy, group: G.scout, roles: ["scout"] },
  { id: "scout-verification", label: "Scout verification", to: "/scout/settings/verification", icon: ShieldCheck, group: G.scout, roles: ["scout"] },

  // Admin controls (admin only)
  { id: "admin-users", label: "User management", to: "/admin/users", icon: Users, group: G.admin, roles: ["admin"] },
  { id: "admin-moderation", label: "Moderation queue", to: "/admin/moderation", icon: AlertTriangle, group: G.admin, roles: ["admin"] },
  { id: "admin-videos", label: "Video oversight", to: "/admin/videos", icon: Video, group: G.admin, roles: ["admin"] },
  { id: "admin-reports", label: "Reports and appeals", to: "/admin/reports", icon: Flag, group: G.admin, roles: ["admin"] },

  // Payments (players)
  { id: "orders", label: "Payments and receipts", to: "/player/settings/orders", icon: Receipt, group: G.billing, roles: ["player"] },

  // Help and safety
  { id: "help", label: "Help centre", to: "/player/settings/help", icon: LifeBuoy, group: G.support },
  { id: "privacy-center", label: "Privacy centre", to: "/player/settings/privacy-center", icon: ShieldCheck, group: G.support },
  { id: "about", label: "About Cholo Kheli", to: "/player/settings/about", icon: Info, group: G.support },

  // Session
  { id: "logout", label: "Log out", to: "/player/settings/logout", icon: LogOut, group: G.session, tint: "destructive" },
];

export const SETTINGS_GROUP_ORDER = [
  G.account,
  G.usage,
  G.visibility,
  G.interactions,
  G.feed,
  G.device,
  G.creator,
  G.scout,
  G.admin,
  G.billing,
  G.support,
  G.session,
];

export function filterCatalogForRole(role: "player" | "scout" | "admin" | null | undefined): CatalogItem[] {
  const r = role ?? "player";
  return SETTINGS_CATALOG.filter((i) => !i.roles || i.roles.includes(r));
}
