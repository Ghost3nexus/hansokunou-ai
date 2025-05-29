import { useSession } from "next-auth/react";

export function useAuth() {
  const { data: session } = useSession();
  return { session };
}

export async function auth() {
  return null; // Static builds will redirect in the client component
}
