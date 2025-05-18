import NextAuth from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name: string;
      email: string;
      image?: string;
      subscription?: {
        status: "lite" | "standard" | "premium";
        priceId?: string;
        currentPeriodEnd?: string;
      };
    }
  }
}
