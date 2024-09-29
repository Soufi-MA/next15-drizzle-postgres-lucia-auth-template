"use client";

import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { Button } from "./ui/button";
import { Loader2 } from "lucide-react";
import { GitHubLogoIcon } from "@radix-ui/react-icons";

export default function AuthWithGitHub({
  authIntent,
  name,
  setError,
}: {
  authIntent: "signin" | "signup";
  name?: string;
  setError: Dispatch<SetStateAction<string | null>>;
}) {
  const [loading, setLoading] = useState(false);

  const handleAuth = () => {
    setLoading(true);
    setError(null);
    const popupWidth = 500;
    const popupHeight = 600;
    const left = window.screen.width / 2 - popupWidth / 2;
    const top = window.screen.height / 2 - popupHeight / 2;

    const newWindow = window.open(
      `/api/oauth?auth_intent=${authIntent}&name=${name}&provider=github`,
      `GitHub ${authIntent === "signin" ? "Sign In" : "Sign Up"}`,
      `width=${popupWidth},height=${popupHeight},top=${top},left=${left}`
    );

    const timer = setInterval(() => {
      if (newWindow?.closed) {
        clearInterval(timer);
        setLoading(false);
      }
    }, 500);
  };

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;

      const { status, message } = event.data;

      if (status === 200) {
        setLoading(false);
        window.location.href = "/";
      } else if (status === 404) {
        setError("No account found for this email. Please sign up first.");
        setLoading(false);
      } else if (status === 409) {
        setError("This account already exists. Please sign in instead.");
        setLoading(false);
      } else if (status) {
        setError(message);
        setLoading(false);
      }
    };

    window.addEventListener("message", handleMessage);

    return () => {
      window.removeEventListener("message", handleMessage);
    };
  }, [setError]);

  return (
    <>
      <Button className="w-full" onClick={handleAuth} disabled={loading}>
        {loading ? (
          <Loader2 className="animate-spin mr-2 h-4 w-4" />
        ) : (
          <GitHubLogoIcon className="mr-2 h-4 w-4" />
        )}
        Continue with GitHub
      </Button>
    </>
  );
}
