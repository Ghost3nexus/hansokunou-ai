import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { NextAuthOptions } from "next-auth";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async session({ session, token }) {
      if (session?.user?.email) {
        try {
          const { getUserByEmail } = await import('@/utils/supabase');
          const userData = await getUserByEmail(session.user.email);
          
          if (userData) {
            session.user.id = userData.id || token.sub || '';
            session.user.subscription = {
              status: userData.plan || 'lite',
              priceId: userData.stripe_subscription_id || '',
              currentPeriodEnd: userData.current_period_end || '',
            };
          } else {
            session.user.subscription = {
              status: 'lite',
              priceId: '',
              currentPeriodEnd: '',
            };
          }
        } catch (error) {
          console.error('Error getting user subscription:', error);
          session.user.subscription = {
            status: 'lite',
            priceId: '',
            currentPeriodEnd: '',
          };
        }
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
