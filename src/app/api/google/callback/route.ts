import { github, google } from "@/lib/auth";
import { cookies } from "next/headers";
import { OAuth2RequestError } from "arctic";
import { generateId } from "lucia";
import { db } from "@/db/connection";
import { accountTable, userTable } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { setSession } from "@/lib/session";
import { clearAuthCookies, postMessageScript } from "@/lib/auth";
import { googleErrorMessages } from "@/lib/utils";

export async function GET(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const error = url.searchParams.get("error");
  const storedState = cookies().get("google_oauth_state")?.value ?? null;
  const storedCodeVerifier = cookies().get("code_verifier")?.value ?? null;
  const authIntent = cookies().get("auth_intent")?.value ?? null;
  const name = cookies().get("name")?.value ?? null;

  if (error) {
    const errorResponse = googleErrorMessages[error];
    if (errorResponse) {
      return new Response(
        postMessageScript(false, errorResponse.status, errorResponse.message),
        {
          headers: { "Content-Type": "text/html" },
        }
      );
    } else {
      return new Response(
        postMessageScript(
          false,
          400,
          "There was an issue on our end. Please try again later."
        ),
        {
          headers: { "Content-Type": "text/html" },
        }
      );
    }
  }

  if (
    !code ||
    !state ||
    !storedState ||
    !storedCodeVerifier ||
    state !== storedState ||
    !authIntent ||
    (authIntent !== "signup" && authIntent !== "signin") ||
    (authIntent === "signup" && !name)
  ) {
    clearAuthCookies();
    return new Response(null, {
      status: 400,
    });
  }

  try {
    const tokens = await google.validateAuthorizationCode(
      code,
      storedCodeVerifier
    );

    const googleUserResponse = await fetch(
      "https://openidconnect.googleapis.com/v1/userinfo",
      {
        headers: {
          Authorization: `Bearer ${tokens.accessToken}`,
        },
      }
    );

    if (!googleUserResponse.ok) {
      return new Response(postMessageScript(false, 500), {
        headers: { "Content-Type": "text/html" },
      });
    }

    const googleUser: GoogleUser = await googleUserResponse.json();

    const [existingUser] = await db
      .select()
      .from(accountTable)
      .where(
        and(
          eq(accountTable.providerId, "google"),
          eq(accountTable.providerUserId, googleUser.sub)
        )
      );

    if (existingUser && authIntent === "signup") {
      clearAuthCookies();
      return new Response(postMessageScript(false, 409), {
        headers: { "Content-Type": "text/html" },
      });
    }

    if (!existingUser && authIntent === "signin") {
      clearAuthCookies();
      return new Response(postMessageScript(false, 404), {
        headers: { "Content-Type": "text/html" },
      });
    }

    if (!existingUser) {
      const userId = generateId(15);
      await db.transaction(async (tx) => {
        await tx.insert(userTable).values({
          id: userId,
          name: name!,
          emailVerified: new Date(),
        });
        await tx.insert(accountTable).values({
          providerId: "google",
          providerUserId: googleUser.sub,
          userId: userId,
        });
      });
      await setSession(userId);
    } else {
      await setSession(existingUser.userId);
    }

    clearAuthCookies();
    return new Response(postMessageScript(true, 200), {
      headers: { "Content-Type": "text/html" },
    });
  } catch (e) {
    if (e instanceof OAuth2RequestError) {
      return new Response(
        postMessageScript(
          false,
          400,
          e.description ??
            "There was an issue on our end. Please try again later."
        ),
        {
          headers: { "Content-Type": "text/html" },
        }
      );
    }
    return new Response(
      postMessageScript(
        false,
        400,
        "There was an issue on our end. Please try again later."
      ),
      {
        headers: { "Content-Type": "text/html" },
      }
    );
  }
}

interface GoogleUser {
  sub: string;
  picture: string;
}
