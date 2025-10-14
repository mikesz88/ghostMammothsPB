import { User } from "@supabase/supabase-js";
import { Database } from "./supa-schema";

export type UserData = Database["public"]["Tables"]["users"]["Row"];
// export type user = User[""]
