import { getCurrentUser } from "@/lib/session";
import { redirect } from "next/navigation";

export default async function Home() {
  const user = await getCurrentUser();
  if (!user) {
    return redirect("/signin");
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100svh-4rem)]">
      <h1 className="text-4xl font-bold ">Hi, {user.name}!</h1>
      <p className="text-lg mt-4">Welcome back, we&apos;re glad to see you!</p>
    </div>
  );
}
