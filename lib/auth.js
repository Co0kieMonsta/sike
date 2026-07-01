import Credentials from "next-auth/providers/credentials";

import bcrypt from "bcrypt";
import GoogleProvider from "next-auth/providers/google";
import GithubProvider from "next-auth/providers/github";

import avatar3 from "@/public/images/avatar/avatar-3.jpg";
import { supabase } from "@/lib/supabaseClient";

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
    }),
    GithubProvider({
      clientId: process.env.AUTH_GITHUB_ID,
      clientSecret: process.env.AUTH_GITHUB_SECRET,
    }),
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Missing credentials");
        }

        // Query user from Supabase
        const { data: foundUser, error } = await supabase
          .from("system_users")
          .select("*")
          .eq("email", credentials.email)
          .single();

        if (error || !foundUser) {
          throw new Error("User not found");
        }

        // Verify password
        const isValid = await bcrypt.compare(credentials.password, foundUser.password);

        if (!isValid) {
          throw new Error("Invalid password");
        }

        return {
           id: foundUser.id,
           name: foundUser.name,
           email: foundUser.email,
           image: foundUser.image,
           role: foundUser.role
        };
      },
    }),
  ],
  callbacks: {
    async signIn({ user }) {
      // Allow all authenticated users for now
      return true;
    },

    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.id = user.id; // Save ID to token
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.role = token.role;
        session.user.id = token.id || token.sub; // Pass ID to session
      }
      return session;
    },
  },
  secret: process.env.AUTH_SECRET,

  session: {
    strategy: "jwt",
  },
  debug: process.env.NODE_ENV !== "production",
};
