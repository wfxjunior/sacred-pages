// TODO: Implement real notifications (channel: in-app, email, push).
// Mock only — used to render the notifications dropdown and center page.

import type { LucideIcon } from "lucide-react";
import { BookOpen, Users, Award, Library, Mail, Sparkles } from "lucide-react";

export type NotificationKind =
  | "daily"
  | "companion"
  | "milestone"
  | "collection"
  | "invitation"
  | "premium";

export type Notification = {
  id: string;
  kind: NotificationKind;
  title: string;
  body: string;
  time: string;
  read: boolean;
  icon: LucideIcon;
  accent: string;
};

export const NOTIFICATIONS: Notification[] = [
  {
    id: "n1",
    kind: "daily",
    title: "Today's journey is ready",
    body: "Gratitude That Transforms — Philippians 4:6–7.",
    time: "8:00 AM",
    read: false,
    icon: BookOpen,
    accent: "#B88A3B",
  },
  {
    id: "n2",
    kind: "companion",
    title: "Sarah completed your shared journey",
    body: "She left a private reflection — you'll see completion, not the text.",
    time: "1h ago",
    read: false,
    icon: Users,
    accent: "#78866B",
  },
  {
    id: "n3",
    kind: "milestone",
    title: "You reached 7 days in the Word",
    body: "A small, meaningful milestone. Keep going gently.",
    time: "Yesterday",
    read: false,
    icon: Award,
    accent: "#B88A3B",
  },
  {
    id: "n4",
    kind: "collection",
    title: "A new Psalms collection is available",
    body: "Psalms of Peace — 8 short journeys curated for quiet mornings.",
    time: "2 days ago",
    read: true,
    icon: Library,
    accent: "#5E7FA3",
  },
  {
    id: "n5",
    kind: "invitation",
    title: "Your invitation was accepted",
    body: "Lucas joined your shared journey.",
    time: "3 days ago",
    read: true,
    icon: Mail,
    accent: "#78866B",
  },
  {
    id: "n6",
    kind: "premium",
    title: "Your Premium trial ends soon",
    body: "You'll keep everything in Free. Upgrade to continue unlimited collections.",
    time: "5 days ago",
    read: true,
    icon: Sparkles,
    accent: "#B88A3B",
  },
];