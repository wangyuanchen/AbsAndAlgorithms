import { z } from "zod";
import type { NextAuthConfig } from "next-auth";
import { JWT } from "next-auth/jwt";
import Credentials from "next-auth/providers/credentials";
import { createClient } from "@/lib/supabase/server";

const CredentialsSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

declare module "next-auth/jwt" {
  interface JWT {
    id: string | undefined;
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    id: string | undefined;
  }
}

export default {
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const validatedFields = CredentialsSchema.safeParse(credentials);

        if (!validatedFields.success) {
          return null;
        }

        const { email, password } = validatedFields.data;

        // Use Supabase instead of Drizzle
        const supabase = await createClient();
        
        const { data: user, error } = await supabase
          .from('user')
          .select('*')
          .eq('email', email)
          .single();

        if (error || !user || !user.password) {
          return null;
        }

        const bcrypt = await import("bcryptjs");
        const passwordsMatch = await bcrypt.default.compare(
          password,
          user.password,
        );

        if (!passwordsMatch) {
          return null;
        }

        return user;
      },
    }),
  ],
  pages: {
    signIn: "/sign-in",
    error: "/sign-in"
  },
  session: {
    strategy: "jwt",
  },
  callbacks: {
    session({ session, token }) {
      if (token.id) {
        session.user.id = token.id;
      }

      return session;
    },
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;  
      }

      return token;
    }
  },
} satisfies NextAuthConfig
