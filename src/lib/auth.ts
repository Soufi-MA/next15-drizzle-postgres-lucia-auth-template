import { Lucia, TimeSpan } from "lucia";
import { adapter } from "../db/connection";
import { GitHub, Google } from "arctic";
import { cookies } from "next/headers";
import { cache } from "react";
import type { Session, User } from "lucia";

export const github = new GitHub(
  process.env.AUTH_GITHUB_ID!,
  process.env.AUTH_GITHUB_SECRET!
);

export const google = new Google(
  process.env.AUTH_GOOGLE_ID!,
  process.env.AUTH_GOOGLE_SECRET!,
  `${process.env.NEXT_PUBLIC_SERVER_URL}/api/google/callback`
);

export const lucia = new Lucia(adapter, {
  sessionExpiresIn: new TimeSpan(30, "d"),
  sessionCookie: {
    name: "session",
    expires: false,
    attributes: {
      secure: process.env.NODE_ENV === "production",
    },
  },
  getUserAttributes: (attributes) => {
    return {
      id: attributes.id,
      name: attributes.name,
    };
  },
});

declare module "lucia" {
  interface Register {
    Lucia: typeof lucia;
    DatabaseUserAttributes: DatabaseUserAttributes;
  }
}

interface DatabaseUserAttributes {
  id: number;
  name: string;
}

export const validateRequest = cache(
  async (): Promise<
    { user: User; session: Session } | { user: null; session: null }
  > => {
    const sessionId = cookies().get(lucia.sessionCookieName)?.value ?? null;
    if (!sessionId) {
      return {
        user: null,
        session: null,
      };
    }

    const result = await lucia.validateSession(sessionId);
    try {
      if (result.session && result.session.fresh) {
        const sessionCookie = lucia.createSessionCookie(result.session.id);
        cookies().set(
          sessionCookie.name,
          sessionCookie.value,
          sessionCookie.attributes
        );
      }
      if (!result.session) {
        const sessionCookie = lucia.createBlankSessionCookie();
        cookies().set(
          sessionCookie.name,
          sessionCookie.value,
          sessionCookie.attributes
        );
      }
    } catch {}
    return result;
  }
);

export const postMessageScript = (
  success: boolean,
  status: number,
  message?: string
) => `
  <script>
    const decodedMessage = decodeURIComponent("${encodeURIComponent(
      message ?? ""
    )}");
    window.opener.postMessage(
      { success: ${success}, status: ${status}, message: decodedMessage },
      window.opener.location.origin
    );
    window.close();
  </script>
`;

export function clearAuthCookies() {
  cookies().delete("github_oauth_state");
  cookies().delete("google_oauth_state");
  cookies().delete("auth_intent");
}
