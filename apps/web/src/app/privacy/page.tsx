import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy policy",
  description: "How AI Tools Hub handles your data.",
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-2xl px-6 py-14 prose-invert">
      <h1 className="text-3xl font-bold">Privacy policy</h1>
      <div className="mt-4 space-y-4 text-slate-300 text-sm leading-relaxed">
        <p>We keep this simple. AI Tools Hub collects the minimum needed to run the directory.</p>
        <p><strong className="text-slate-100">What we collect.</strong> Anonymous usage analytics (page views, searches) to improve the product. If you submit a tool or create an account, we store the details you provide.</p>
        <p><strong className="text-slate-100">What we don&apos;t do.</strong> We don&apos;t sell your data. We don&apos;t require a payment card to browse. We don&apos;t scrape behind logins.</p>
        <p><strong className="text-slate-100">Cookies.</strong> Essential cookies only, plus optional analytics.</p>
        <p><strong className="text-slate-100">Contact.</strong> Questions about your data: hello@ddotsmedia.com.</p>
        <p className="text-slate-500">This is a summary, not legal advice; a full policy will replace it at launch.</p>
      </div>
    </main>
  );
}
