import { github, google } from "@/lib/auth";
import { generateCodeVerifier, generateState } from "arctic";
import { cookies } from "next/headers";

export async function GET(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const authIntent = url.searchParams.get("auth_intent");
  const name = url.searchParams.get("name");
  const provider = url.searchParams.get("provider");

  if (!provider || (provider !== "google" && provider !== "github")) {
    return new Response("Invalid provider", { status: 400 });
  }

  if (!authIntent || (authIntent !== "signin" && authIntent !== "signup")) {
    return new Response("Invalid auth intent", { status: 400 });
  }

  if (authIntent === "signup" && !name) {
    return new Response("name is required for sign up", { status: 400 });
  }

  const state = generateState();

  cookies().set(`${provider}_oauth_state`, state, {
    path: "/",
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    maxAge: 60 * 10,
    sameSite: "lax",
  });

  cookies().set("auth_intent", authIntent, {
    path: "/",
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    maxAge: 60 * 10,
    sameSite: "lax",
  });

  if (authIntent === "signup") {
    cookies().set("name", name!, {
      path: "/",
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      maxAge: 60 * 10,
      sameSite: "lax",
    });
  }

  let authUrl;
  if (provider === "github") {
    authUrl = await github.createAuthorizationURL(state);
  } else {
    const codeVerifier = generateCodeVerifier();
    cookies().set("code_verifier", codeVerifier, {
      secure: process.env.NODE_ENV === "production",
      path: "/",
      httpOnly: true,
      maxAge: 60 * 10,
      sameSite: "lax",
    });
    authUrl = await google.createAuthorizationURL(state, codeVerifier);
  }
  return Response.redirect(authUrl);
}
