import { ClientSettingsLoader } from "@/components/clients/client-settings-loader";

export const dynamic = "force-dynamic";

export default function ClientSettingsPage({
  params,
}: {
  params: { clientId: string };
}) {
  return <ClientSettingsLoader clientId={params.clientId} />;
}
