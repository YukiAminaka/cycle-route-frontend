import RouteDetail from "@/features/routes/components/route-detail";
import { apiClient } from "@/lib/api-client";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";

export default async function RoutePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const cookieStore = await cookies();
  const { data, error } = await apiClient.GET("/routes/{route_id}", {
    params: {
      path: { route_id: id },
    },
    headers: {
      Cookie: cookieStore.toString(),
    },
  });

  if (error || !data?.route) {
    notFound();
  }

  return (
    <div className="relative h-full w-full flex">
      <div className="flex-1 relative">
        <RouteDetail route={data.route} />
      </div>
    </div>
  );
}
