import { getCurrentUser } from "@/lib/session";
import SignupForm from "./SignupForm";
import { redirect } from "next/navigation";
const page = async () => {
  const user = await getCurrentUser();
  if (user) {
    redirect("/");
  }
  return <SignupForm />;
};

export default page;
