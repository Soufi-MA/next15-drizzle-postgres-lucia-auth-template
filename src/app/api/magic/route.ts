import { magicLinks, userTable } from "@/db/schema";
import { db } from "@/db/connection";
import { setSession } from "@/lib/session";
import { eq } from "drizzle-orm";
import { generateId } from "lucia";

export async function GET(request: Request): Promise<Response> {
  try {
    const url = new URL(request.url);
    const token = url.searchParams.get("token");

    if (!token) {
      return new Response(null, {
        status: 302,
        headers: {
          Location: "/",
        },
      });
    }

    const [magicLink] = await db
      .select()
      .from(magicLinks)
      .where(eq(magicLinks.token, token));

    if (!magicLink) {
      return new Response(null, {
        status: 302,
        headers: {
          Location: "/signin/error",
        },
      });
    }

    if (magicLink.expiresAt < new Date()) {
      await db.delete(magicLinks).where(eq(magicLinks.token, token));
      return new Response(null, {
        status: 302,
        headers: {
          Location: "/signin/error",
        },
      });
    }

    const [existingUser] = await db
      .select()
      .from(userTable)
      .where(eq(userTable.email, magicLink.email));

    let userId;
    if (!existingUser) {
      userId = generateId(15);
      await db.insert(userTable).values({
        id: userId,
        email: magicLink.email,
        name: magicLink.name,
        emailVerified: new Date(),
      });
    } else {
      userId = existingUser.id;
    }

    await setSession(userId);

    await db.delete(magicLinks).where(eq(magicLinks.token, token));

    return new Response(null, {
      status: 302,
      headers: {
        Location: "/",
      },
    });
  } catch (err) {
    console.log({ err });
    return new Response(null, {
      status: 302,
      headers: {
        Location: "/signin/error",
      },
    });
  }
}
