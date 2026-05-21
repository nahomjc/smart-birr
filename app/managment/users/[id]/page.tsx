import { notFound, redirect } from "next/navigation";
import { UserDetailView } from "@/components/management/user-detail-view";
import { isSessionUserAdmin } from "@/lib/auth/admin";
import { getAdminUserDetail } from "@/lib/data/admin-user-detail";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function ManagementUserDetailPage({ params }: Props) {
  if (!(await isSessionUserAdmin())) {
    redirect("/dashboard");
  }

  const { id } = await params;
  let data: Awaited<ReturnType<typeof getAdminUserDetail>> = null;

  try {
    data = await getAdminUserDetail(id);
  } catch {
    /* DB error */
  }

  if (!data) {
    notFound();
  }

  return <UserDetailView data={data} />;
}
