import { getServerSession } from "next-auth/next";
import { authOptions } from "./auth-options";

export async function auth() {
  return getServerSession(authOptions);
}
