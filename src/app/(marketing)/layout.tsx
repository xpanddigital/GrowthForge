import { MLNav } from "@/components/marketing/ml-nav";
import { MLFooter } from "@/components/marketing/ml-footer";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="ml">
      <MLNav />
      <main className="pt-16">{children}</main>
      <MLFooter />
    </div>
  );
}
