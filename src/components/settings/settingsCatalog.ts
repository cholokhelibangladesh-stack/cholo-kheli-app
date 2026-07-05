import {
  Bookmark, History, Activity, Bell, Clock, Tablet,
  Lock, Star, LayoutGrid, Ban, EyeOff, Users,
  MessageCircle, AtSign, MessageSquare, Share2, CircleSlash,
  AlertCircle, Type, UserPlus,
  Sparkles, VolumeX, ListFilter, Heart,
  Smartphone, Download, Accessibility, Languages, Signal, Globe,
  BarChart3, BadgeCheck,
  Receipt,
  LifeBuoy, ShieldCheck, UserCircle2, Info,
  Bot, MessagesSquare, Infinity as InfinityIcon,
  Plus, LogOut,
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
};

/**
 * Full catalog of settings rows shown in the hub, mirroring Instagram's
 * "Settings and activity" screen but renamed & scoped for Cholo Kheli.
 */
export const SETTINGS_CATALOG: CatalogItem[] = [
  // How you use Cholo Kheli
  { id: "saved", label: "Saved", to: "/player/settings/saved", icon: Bookmark, group: "How you use Cholo Kheli", keywords: "bookmarks collection" },
  { id: "archive", label: "Archive", to: "/player/settings/archive", icon: History, group: "How you use Cholo Kheli", keywords: "hidden uploads" },
  { id: "activity", label: "Your activity", to: "/player/settings/activity", icon: Activity, group: "How you use Cholo Kheli", keywords: "history likes comments" },
  { id: "notifications", label: "Notifications", to: "/player/settings/notifications", icon: Bell, group: "How you use Cholo Kheli", keywords: "push email alerts" },
  { id: "time", label: "Time management", to: "/player/settings/time", icon: Clock, group: "How you use Cholo Kheli", keywords: "daily limit break reminder" },
  { id: "tablets", label: "Cholo Kheli for tablets", to: "/player/settings/tablets", icon: Tablet, group: "How you use Cholo Kheli" },

  // Who can see your content
  { id: "privacy", label: "Account privacy", to: "/player/settings/privacy", icon: Lock, group: "Who can see your content", keywords: "private public" },
  { id: "close-friends", label: "Close Friends", to: "/player/settings/close-friends", icon: Star, group: "Who can see your content" },
  { id: "crossposting", label: "Crossposting", to: "/player/settings/crossposting", icon: LayoutGrid, group: "Who can see your content" },
  { id: "blocked", label: "Blocked", to: "/player/settings/blocked", icon: Ban, group: "Who can see your content", keywords: "block ignore" },
  { id: "story", label: "Story, live and location", to: "/player/settings/story", icon: EyeOff, group: "Who can see your content" },
  { id: "friends-feed", label: "Activity in Friends feed", to: "/player/settings/friends-feed", icon: Users, group: "Who can see your content" },

  // How others can interact with you
  { id: "messages", label: "Messages and story replies", to: "/player/settings/messages", icon: MessageCircle, group: "How others can interact with you" },
  { id: "tags", label: "Tags and mentions", to: "/player/settings/tags", icon: AtSign, group: "How others can interact with you" },
  { id: "comments", label: "Comments", to: "/player/settings/comments", icon: MessageSquare, group: "How others can interact with you" },
  { id: "sharing", label: "Sharing", to: "/player/settings/sharing", icon: Share2, group: "How others can interact with you" },
  { id: "restricted", label: "Restricted", to: "/player/settings/restricted", icon: CircleSlash, group: "How others can interact with you" },
  { id: "limit", label: "Limit interactions", to: "/player/settings/limit", icon: AlertCircle, group: "How others can interact with you" },
  { id: "hidden-words", label: "Hidden Words", to: "/player/settings/hidden-words", icon: Type, group: "How others can interact with you" },
  { id: "invite", label: "Follow and invite friends", to: "/player/settings/invite", icon: UserPlus, group: "How others can interact with you" },

  // What you see
  { id: "favorites", label: "Favorites", to: "/player/settings/favorites", icon: Star, group: "What you see" },
  { id: "muted", label: "Muted accounts", to: "/player/settings/muted", icon: VolumeX, group: "What you see" },
  { id: "content-prefs", label: "Content preferences", to: "/player/settings/content-preferences", icon: ListFilter, group: "What you see" },
  { id: "counts", label: "Like and share counts", to: "/player/settings/counts", icon: Heart, group: "What you see" },

  // Your app and media
  { id: "devices", label: "Device permissions", to: "/player/settings/devices", icon: Smartphone, group: "Your app and media" },
  { id: "downloads", label: "Archiving and downloading", to: "/player/settings/downloads", icon: Download, group: "Your app and media" },
  { id: "accessibility", label: "Accessibility", to: "/player/settings/accessibility", icon: Accessibility, group: "Your app and media" },
  { id: "language", label: "Language and translations", to: "/player/settings/language", icon: Languages, group: "Your app and media" },
  { id: "data-usage", label: "Data usage and media quality", to: "/player/settings/data-usage", icon: Signal, group: "Your app and media" },
  { id: "app-web", label: "App website permissions", to: "/player/settings/app-web", icon: Globe, group: "Your app and media" },

  // Your insights and tools
  { id: "account-type", label: "Account type and tools", to: "/player/settings/account-type", icon: BarChart3, group: "Your insights and tools" },
  { id: "verified", label: "Cholo Kheli Verified", to: "/player/settings/verified", icon: BadgeCheck, group: "Your insights and tools" },

  // Your orders and fundraisers
  { id: "orders", label: "Orders and payments", to: "/player/settings/orders", icon: Receipt, group: "Your orders and fundraisers" },

  // More info and support
  { id: "help", label: "Help", to: "/player/settings/help", icon: LifeBuoy, group: "More info and support" },
  { id: "privacy-center", label: "Privacy Center", to: "/player/settings/privacy-center", icon: ShieldCheck, group: "More info and support" },
  { id: "account-status", label: "Account Status", to: "/player/settings/account-status", icon: UserCircle2, group: "More info and support" },
  { id: "about", label: "About", to: "/player/settings/about", icon: Info, group: "More info and support" },

  // Also from Cholo Kheli
  { id: "ck-ai", label: "Cholo Kheli AI", to: "/player/settings/ai", icon: Bot, group: "Also from Cholo Kheli", keywords: "assistant" },
  { id: "threads", label: "Threads", to: "/player/settings/threads", icon: MessagesSquare, group: "Also from Cholo Kheli" },
  { id: "more", label: "More from Cholo Kheli", to: "/player/settings/more", icon: InfinityIcon, group: "Also from Cholo Kheli" },

  // Login
  { id: "add-account", label: "Add account", to: "/player/settings/add-account", icon: Plus, group: "Login", tint: "accent" },
  { id: "logout", label: "Log out", to: "/player/settings/logout", icon: LogOut, group: "Login", tint: "destructive" },
];

export const SETTINGS_GROUP_ORDER = [
  "How you use Cholo Kheli",
  "Who can see your content",
  "How others can interact with you",
  "What you see",
  "Your app and media",
  "Your insights and tools",
  "Your orders and fundraisers",
  "More info and support",
  "Also from Cholo Kheli",
  "Login",
];
