"use server";

import { magicLinks, userTable } from "@/db/schema";
import {
  ExistingUserMagicLink,
  NewUserMagicLink,
} from "@/emails/MagicLinkEmail";
import { db } from "@/db/connection";
import { randomizedReturnDelay } from "@/lib/utils";
import { render } from "@react-email/components";
import { randomBytes } from "crypto";
import { eq } from "drizzle-orm";
import { generateIdFromEntropySize } from "lucia";
import { z } from "zod";
import { Resend } from "resend";
import { headers } from "next/headers";
import { rateLimit } from "@/lib/rateLimit";

const resend = new Resend(process.env.RESEND_API_KEY);

const authSchema = z.object({
  name: z.string().nullish(),
  email: z.string().email(),
  authIntent: z.enum(["signin", "signup"]),
});

export async function auth(
  prevState: {
    message: string;
  },
  formData: FormData
) {
  const startTime = Date.now();

  const validatedFields = authSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    authIntent: formData.get("authIntent"),
  });

  if (!validatedFields.success) {
    return {
      message: "Invalid input",
      email: "",
      errors: {
        name: validatedFields.error.flatten().fieldErrors.name,
        email: validatedFields.error.flatten().fieldErrors.email,
        authIntent: validatedFields.error.flatten().fieldErrors.authIntent,
        limited: "",
      },
    };
  }

  const { name, email, authIntent } = validatedFields.data;

  if (authIntent === "signup" && !name) {
    return {
      message: "Invalid request",
      errors: {
        name: "name is required",
        email: [],
        authIntent: [],
        limited: "",
      },
    };
  }

  const ip = headers().get("x-forwarded-for") ?? "unknown";
  const isRateLimited = rateLimit(ip + authIntent);

  if (isRateLimited)
    return {
      message: "Invalid request",
      errors: {
        limited: "Too many attempts. Please try again later.",
      },
    };

  const [existingUser] = await db
    .select()
    .from(userTable)
    .where(eq(userTable.email, email));

  if (
    (!existingUser && authIntent === "signin") ||
    (existingUser && authIntent === "signup")
  ) {
    const processTime = Date.now() - startTime;

    return await randomizedReturnDelay(2000, 4000, processTime, {
      message: "check email",
      email,
      errors: {
        name: [],
        email: [],
        authIntent: [],
        limited: "",
      },
    });
  }

  const bytes = randomBytes(15);
  const token = bytes
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");

  const expiresAt = new Date(Date.now() + 1000 * 60 * 5);

  const id = generateIdFromEntropySize(10);

  try {
    if (authIntent === "signup") {
      const { data, error } = await resend.emails.send({
        from: process.env.EMAIL_FROM!,
        to: email,
        subject: "Welcome Aboard! Activate Your Account Now",
        html: await render(
          NewUserMagicLink({
            magicLink: `${process.env.NEXT_PUBLIC_SERVER_URL}/api/magic?token=${token}`,
            name: name!,
          })
        ),
      });

      if (error) {
        const processTime = Date.now() - startTime;
        return await randomizedReturnDelay(2000, 4000, processTime, {
          message: "",
          email,
          errors: {
            name: [],
            email: "There was an issue on our end. Please try again later.",
            authIntent: [],
            limited: "",
          },
        });
      }

      const [magicLink] = await db
        .select()
        .from(magicLinks)
        .where(eq(magicLinks.email, email));

      if (!magicLink || magicLink.expiresAt < new Date()) {
        await db
          .insert(magicLinks)
          .values({
            id,
            name: name!,
            email,
            token,
            expiresAt,
          })
          .onConflictDoUpdate({
            target: magicLinks.email,
            set: {
              token,
              expiresAt,
            },
          });
      }
    } else {
      const { data, error } = await resend.emails.send({
        from: process.env.EMAIL_FROM!,
        to: email,
        subject: "Welcome Back! Sign In Using Your Magic Link",
        html: await render(
          ExistingUserMagicLink({
            magicLink: `${process.env.NEXT_PUBLIC_SERVER_URL}/api/magic?token=${token}`,
            name: existingUser.name,
          })
        ),
      });

      if (error) {
        const processTime = Date.now() - startTime;
        return await randomizedReturnDelay(2000, 4000, processTime, {
          message: "",
          email,
          errors: {
            name: [],
            email: "There was an issue on our end. Please try again later.",
            authIntent: [],
            limited: "",
          },
        });
      }

      const [magicLink] = await db
        .select()
        .from(magicLinks)
        .where(eq(magicLinks.email, email));

      if (!magicLink || magicLink.expiresAt < new Date()) {
        await db
          .insert(magicLinks)
          .values({
            id,
            name: existingUser.name,
            email,
            token,
            expiresAt,
          })
          .onConflictDoUpdate({
            target: magicLinks.email,
            set: {
              token,
              expiresAt,
            },
          });
      }
    }
  } catch (e) {
    console.error(e);
  }
  const processTime = Date.now() - startTime;
  return await randomizedReturnDelay(2000, 4000, processTime, {
    message: "check email",
    email,
    errors: {
      name: [],
      email: [],
      authIntent: [],
      limited: "",
    },
  });
}
