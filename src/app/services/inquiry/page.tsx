import type { Metadata } from "next";
import InquiryForm from "./inquiry-form";
import { MLNav } from "@/components/marketing/ml-nav";
import { MLFooter } from "@/components/marketing/ml-footer";

export const metadata: Metadata = {
  title: "Service Inquiry — Done-for-You AI Visibility",
  description:
    "Tell us about your business and we'll build a tailored AI visibility proposal within 24 hours.",
  robots: { index: false, follow: true },
};

export default function InquiryPage() {
  return (
    <div className="ml">
      <MLNav />
      <div className="pt-20">
        <InquiryForm />
      </div>
      <MLFooter />
    </div>
  );
}
