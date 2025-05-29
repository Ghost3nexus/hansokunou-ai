import NextAuth from "next-auth";
import { authOptions } from "../../../lib/auth-options";

export const dynamic = "error";

export function generateStaticParams() {
  return [
    { nextauth: ["signin"] },
    { nextauth: ["signout"] },
    { nextauth: ["callback"] },
    { nextauth: ["session"] },
    { nextauth: ["csrf"] },
    { nextauth: ["providers"] },
    { nextauth: ["callback", "google"] },
    { nextauth: ["signin", "google"] },
  ];
}

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
