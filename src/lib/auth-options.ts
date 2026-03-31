import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

/** Demo credentials — override with NEXTAUTH_DEMO_USER / NEXTAUTH_DEMO_PASSWORD in production. */
const demoUser = process.env.NEXTAUTH_DEMO_USER ?? "admin";
const demoPass = process.env.NEXTAUTH_DEMO_PASSWORD ?? "admin123";

const secret =
  process.env.NEXTAUTH_SECRET ||
  (process.env.NODE_ENV === "development"
    ? "dev-only-nextauth-secret-min-32-chars-long!"
    : undefined);

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      id: "credentials",
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) return null;
        if (
          credentials.username === demoUser &&
          credentials.password === demoPass
        ) {
          return {
            id: "1",
            name: credentials.username,
            email: `${credentials.username}@user.local`,
          };
        }
        return null;
      },
    }),
  ],
  session: { strategy: "jwt", maxAge: 30 * 24 * 60 * 60 },
  secret,
};
