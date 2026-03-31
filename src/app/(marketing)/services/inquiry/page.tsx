import type { Metadata } from "next";
import InquiryForm from "./inquiry-form";

export const metadata: Metadata = {
  title: "Service Inquiry — Done-for-You AI Visibility",
  description:
    "Tell us about your business and we'll build a tailored AI visibility proposal. Citation seeding, press, entity optimization, and monitoring.",
  openGraph: {
    title: "Service Inquiry | MentionLayer",
    description:
      "Get a tailored AI visibility proposal. Fill out the form and we'll respond within 24 hours.",
    images: ["/api/og?title=Service+Inquiry"],
  },
  robots: { index: false, follow: true },
};

export default function InquiryPage() {
  return <InquiryForm />;
}
