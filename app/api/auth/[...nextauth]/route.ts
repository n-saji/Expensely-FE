import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.NEXT_PUBLIC_CLIENT_ID!,
      clientSecret: process.env.NEXT_PUBLIC_CLIENT_SECRET!,
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async jwt({ token, user, account }) {
      if (account) {
        token.email = user.email || "";
        token.name = user.name || "";
        token.accessToken =
          typeof account.accessToken === "string" ? account.accessToken : "";
        token.idToken = account.id_token;
      }
      if (user) {
        token.email = user.email || "";
        token.name = user.name || "";
      }

      return token;
    },
    async redirect({ url, baseUrl }) {
      if (url.startsWith(baseUrl)) return url;
      return `${baseUrl}/auth-handler`;
    },
    async session({ session, token }) {
      console.log("Session callback:", session, token);
      session.accessToken = token.accessToken as string;
      session.idToken = token.idToken as string;

      return session;
    },
  },
});

export { handler as GET, handler as POST };
