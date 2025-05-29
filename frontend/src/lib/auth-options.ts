import { NextAuthOptions } from "next-auth";
import EmailProvider from "next-auth/providers/email";
import { JWT } from 'next-auth/jwt';
import { getUserByEmail, createOrUpdateUser } from '../utils/supabase';

export const authOptions: NextAuthOptions = {
  providers: [
    EmailProvider({
      server: {
        host: process.env.SMTP_HOST || '',
        port: Number(process.env.SMTP_PORT) || 587,
        auth: {
          user: process.env.SMTP_USER || '',
          pass: process.env.SMTP_PASS || '',
        },
      },
      from: process.env.SMTP_FROM || 'noreply@hansokunou-ai.com',
    }),
  ],
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  callbacks: {
    async jwt({ token, user }: { token: JWT; user?: any }) {
      if (user) {
        token.userId = user.id;
      }
      
      if (token.email) {
        const userData = await getUserByEmail(token.email as string);
        
        if (userData) {
          token.subscription = {
            plan: userData.plan,
            status: userData.subscription_status,
            trialEnd: userData.trial_end,
            currentPeriodEnd: userData.current_period_end,
          };
        } else {
          const newUser = await createOrUpdateUser({
            email: token.email as string,
            plan: 'lite',
            subscription_status: 'active',
          });
          
          if (newUser) {
            token.subscription = {
              plan: newUser.plan,
              status: newUser.subscription_status,
              trialEnd: newUser.trial_end,
              currentPeriodEnd: newUser.current_period_end,
            };
          }
        }
      }
      
      return token;
    },
    async session({ session, token }: { session: any; token: JWT }) {
      if (token.subscription) {
        session.user.subscription = token.subscription;
      }
      
      if (token.userId) {
        session.user.id = token.userId;
      }
      
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};
