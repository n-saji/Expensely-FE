import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import GithubProvider from "next-auth/providers/github";
import DiscordProvider from "next-auth/providers/discord";

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.NEXT_PUBLIC_CLIENT_ID || process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.NEXT_PUBLIC_CLIENT_SECRET || process.env.GOOGLE_CLIENT_SECRET || "",
    }),
    GithubProvider({
      clientId: process.env.GITHUB_CLIENT_ID || process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID || "",
      clientSecret: process.env.GITHUB_CLIENT_SECRET || "",
    }),
    DiscordProvider({
      clientId: process.env.DISCORD_CLIENT_ID || process.env.NEXT_PUBLIC_DISCORD_CLIENT_ID || "",
      clientSecret: process.env.DISCORD_CLIENT_SECRET || "",
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async jwt({ token, user, account }) {
      if (account) {
        token.provider = account.provider;
        token.providerAccountId = account.providerAccountId;
        token.email = user?.email || token.email || "";
        token.name = user?.name || token.name || "";
        token.accessToken =
          typeof account.access_token === "string"
            ? account.access_token
            : typeof account.accessToken === "string"
            ? account.accessToken
            : "";
        token.idToken = account.id_token;
      }
      if (user) {
        token.email = user.email || token.email || "";
        token.name = user.name || token.name || "";
      }

      return token;
    },
    async redirect({ url, baseUrl }) {
      if (url.includes("/settings") || url.includes("tab=security")) return url;
      if (url.startsWith(baseUrl)) return url;
      return `${baseUrl}/auth-handler`;
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken as string;
      session.idToken = token.idToken as string;
      session.provider = token.provider as string;
      session.providerAccountId = token.providerAccountId as string;

      return session;
    },
  },
});

export { handler as GET, handler as POST };
