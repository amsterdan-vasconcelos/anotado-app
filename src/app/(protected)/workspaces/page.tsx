import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import type { CustomSession } from "@/types/auth";

const WorkspacePage = async () => {
  const session = (await auth()) as CustomSession;
  if (!session?.accessToken) redirect("/signin");

  return <h1>Workspace Page</h1>;
};

export default WorkspacePage;
