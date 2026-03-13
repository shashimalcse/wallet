import NextAuth from "next-auth";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    {
      id: "asgardeo",
      name: "Asgardeo",
      type: "oidc",
      issuer: `${process.env.ASGARDEO_BASE_URL}/t/${process.env.ASGARDEO_ORG_NAME}/oauth2/token`,
      clientId: process.env.ASGARDEO_CLIENT_ID,
      authorization: {
        params: {
          scope: "openid profile email",
        },
      },
      checks: ["pkce", "state"],
      client: {
        token_endpoint_auth_method: "none",
      },
    },
  ],
  callbacks: {
    async jwt({ token, account }) {
      if (account) {
        token.accessToken = account.access_token;
        token.idToken = account.id_token;
        token.expiresAt = account.expires_at;
      }
      return token;
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken as string;
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
});

declare module "next-auth" {
  interface Session {
    accessToken?: string;
  }
}
