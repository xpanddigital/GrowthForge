import { ClientDetailLoader } from "@/components/clients/client-detail-loader";

export const dynamic = "force-dynamic";

export default function ClientDetailPage({
  params,
}: {
  params: { clientId: string };
}) {
  return <ClientDetailLoader clientId={params.clientId} />;
}
