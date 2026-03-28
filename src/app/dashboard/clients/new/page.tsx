import { ClientForm } from "@/components/clients/client-form";

export const metadata = { title: "New Client — MentionLayer" };

export default function NewClientPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold">Add Client</h2>
        <p className="text-sm text-muted-foreground">
          Create a new client brand profile. The brand brief is critical — it
          controls the quality of all AI-generated responses.
        </p>
      </div>
      <ClientForm mode="create" />
    </div>
  );
}
