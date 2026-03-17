import { createClient } from "@supabase/supabase-js";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

interface PageProps {
  params: Promise<{ slug: string }>;
}

async function getPressRelease(slug: string) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  const { data: release } = await supabase
    .from("press_releases")
    .select(
      "title, subtitle, body_html, word_count, created_at, press_campaigns!inner(headline, clients!inner(name, website_url))"
    )
    .eq("public_slug", slug)
    .eq("is_current", true)
    .eq("status", "approved")
    .single();

  return release;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const release = await getPressRelease(slug);
  if (!release) return { title: "Press Release Not Found" };

  return {
    title: release.title as string,
    description: release.subtitle as string,
  };
}

export default async function PublicPressReleasePage({ params }: PageProps) {
  const { slug } = await params;
  const release = await getPressRelease(slug);

  if (!release) {
    notFound();
  }

  const campaign = (release as Record<string, unknown>).press_campaigns as Record<string, unknown>;
  const clientData = campaign.clients as Record<string, unknown>;
  const clientName = clientData.name as string;
  const clientWebsite = clientData.website_url as string | null;
  const publishDate = new Date(release.created_at as string).toLocaleDateString("en-AU", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="min-h-screen bg-white">
      <article className="mx-auto max-w-3xl px-6 py-12">
        {/* Header */}
        <header className="mb-8 border-b border-gray-200 pb-8">
          <p className="mb-2 text-sm font-medium uppercase tracking-wider text-gray-500">
            Press Release
          </p>
          <h1 className="mb-3 text-3xl font-bold leading-tight text-gray-900 sm:text-4xl">
            {release.title as string}
          </h1>
          {release.subtitle && (
            <p className="mb-4 text-lg text-gray-600">{release.subtitle as string}</p>
          )}
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <span>{clientName}</span>
            <span>&middot;</span>
            <time dateTime={release.created_at as string}>{publishDate}</time>
          </div>
        </header>

        {/* Body */}
        <div
          className="prose prose-lg max-w-none prose-headings:font-semibold prose-p:text-gray-700 prose-a:text-blue-600"
          dangerouslySetInnerHTML={{ __html: release.body_html as string }}
        />

        {/* Footer */}
        <footer className="mt-12 border-t border-gray-200 pt-6">
          <p className="text-sm text-gray-500">
            For media enquiries, please contact{" "}
            <span className="font-medium">{clientName}</span>
            {clientWebsite && (
              <>
                {" "}
                &mdash;{" "}
                <a
                  href={clientWebsite}
                  className="text-blue-600 hover:underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {clientWebsite}
                </a>
              </>
            )}
          </p>
        </footer>
      </article>
    </div>
  );
}
