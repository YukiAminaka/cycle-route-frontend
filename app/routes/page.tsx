import { MyRoutes } from "@/components/my-routes";
import { getServerSession } from "@ory/nextjs/app";

export default async function RoutesPage() {
  const session = await getServerSession();
  const userId = session?.identity?.id;
  return <MyRoutes userID={userId} />;
}
