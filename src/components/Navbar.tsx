import Link from "next/link";
import { Button } from "@/components/ui/button";
import { LogOutIcon, MountainIcon } from "lucide-react";
import { ModeToggle } from "./theme-toggle";
import { getCurrentUser, logout } from "@/lib/session";

export default async function Navbar() {
  const user = await getCurrentUser();

  return (
    <header className="flex h-16 w-full items-center justify-between bg-background max-w-[1600px] mx-auto px-4 md:px-6">
      <Link href="/" className="flex items-center gap-2" prefetch={false}>
        <MountainIcon className="h-6 w-6" />
        <span className="text-lg font-semibold">Acme</span>
      </Link>
      <nav className="flex items-center gap-4">
        <ModeToggle />
        {!user ? (
          <div className="flex items-center gap-2">
            <Link
              href="/signin"
              className="inline-flex h-9 items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:pointer-events-none disabled:opacity-50"
              prefetch={false}
            >
              Sign In
            </Link>
            <Link
              href="/signup"
              className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus:outline-none focus:ring-1 focus:ring-ring disabled:pointer-events-none disabled:opacity-50"
              prefetch={false}
            >
              Sign Up
            </Link>
          </div>
        ) : (
          <form action={logout} className="flex items-center gap-2">
            <Button type="submit">
              <LogOutIcon className="h-4 w-4" />
              <span>Logout</span>
            </Button>
          </form>
        )}
      </nav>
    </header>
  );
}
