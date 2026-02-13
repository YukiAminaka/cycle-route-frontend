import RouteEditer from "@/features/routes/components/route-edit";
import { getRouteDetail } from "@/features/routes/fetcher/route-detail";
import { notFound } from "next/navigation";

export default async function RouteEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { data, error } = await getRouteDetail(id);

  if (error || !data?.route) {
    notFound();
  }

  return <RouteEditer route={data.route} />;
}
