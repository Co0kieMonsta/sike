import Credentials from "next-auth/providers/credentials";

import bcrypt from "bcrypt";
import GoogleProvider from "next-auth/providers/google";
import GithubProvider from "next-auth/providers/github";

import avatar3 from "@/public/images/avatar/avatar-3.jpg";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";

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

        // Query user from Firebase
        const usersRef = collection(db, "system_users");
        const q = query(usersRef, where("email", "==", credentials.email));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
          throw new Error("User not found");
        }

        const foundUser = querySnapshot.docs[0].data();
        foundUser.id = querySnapshot.docs[0].id;

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
