import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { db } from "./lib/prisma"
import bcrypt from "bcryptjs"

import { authConfig } from "./auth.config"

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET || "f8c87b99c6d37651a02fb420ef1e92d6e3c091adab4d3eb97534b172a6b281bf",
  adapter: PrismaAdapter(db),
  session: { strategy: "jwt" },
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }
        
        const user = await db.user.findUnique({
          where: { email: credentials.email }
        })
        
        if (!user || !user.password) {
          return null
        }
        
        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        )
        
        if (!isPasswordValid) {
          return null
        }
        
        return user
      }
    })
  ],
  pages: {
    signIn: "/sign-in",
  },
  callbacks: {
    async session({ session, token }) {
      if (token.sub && session.user) {
        session.user.id = token.sub
      }
      return session
    },
    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id
      }
      return token
    }
  }
})
