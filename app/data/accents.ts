export const accentStorageKey = "aman-portfolio-accent";

export const accents = [
  { id: "orange", name: "Orange", color: "#fb8b4e" },
  { id: "blue", name: "Ocean", color: "#80aaff" },
  { id: "violet", name: "Violet", color: "#b59aff" },
  { id: "teal", name: "Mint", color: "#5ddac4" },
  { id: "rose", name: "Rose", color: "#fb8fa8" },
  { id: "gold", name: "Gold", color: "#f3c46b" },
] as const;

export type Accent = (typeof accents)[number]["id"];
export const defaultAccent: Accent = "violet";

export function isAccent(value: string | null | undefined): value is Accent {
  return accents.some((accent) => accent.id === value);
}
