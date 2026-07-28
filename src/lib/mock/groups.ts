// TODO: Implement small-group logic when backend is ready.

export type SmallGroup = {
  id: string;
  name: string;
  journey: string;
  members: number;
  progress: number;
  privacy: "Private" | "Invite-only";
  leader: string;
};

export const GROUPS: SmallGroup[] = [
  { id: "g1", name: "Tuesday Morning Group", journey: "Sermon on the Mount", members: 8, progress: 62, privacy: "Private", leader: "Samuel R." },
  { id: "g2", name: "Family Bible Study", journey: "The Life of Jesus", members: 5, progress: 30, privacy: "Invite-only", leader: "Sarah R." },
];