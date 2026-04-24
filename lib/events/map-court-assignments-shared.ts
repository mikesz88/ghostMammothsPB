import type { User } from "@/lib/types";

export function mapPlayer(row: {
  id: string;
  name: string;
  email: string;
  skill_level: string;
}): User {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    skillLevel: row.skill_level as User["skillLevel"],
    isAdmin: false,
    createdAt: new Date(),
  };
}
