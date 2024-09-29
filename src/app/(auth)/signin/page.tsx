import { getCurrentUser } from "@/lib/session";
import SigninForm from "./SigninForm";
import { redirect } from "next/navigation";
const page = async () => {
  const user = await getCurrentUser();
  if (user) {
    redirect("/");
  }
  return <SigninForm />;
};

export default page;
