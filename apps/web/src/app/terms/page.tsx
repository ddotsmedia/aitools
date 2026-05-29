import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of use",
  description: "Terms for using AI Tools Hub.",
  alternates: { canonical: "/terms" },
};

export default function TermsPage() {
  return (
    <main className="mx-auto max-w-2xl px-6 py-14">
      <h1 className="text-3xl font-bold">Terms of use</h1>
      <div className="mt-4 space-y-4 text-slate-300 text-sm leading-relaxed">
        <p>By using AI Tools Hub you agree to these terms.</p>
        <p><strong className="text-slate-100">The directory.</strong> Listings are provided “as is”. We verify status, pricing, and free-tier claims on a best-effort basis, but tools change — always confirm on the vendor&apos;s own site before relying on details.</p>
        <p><strong className="text-slate-100">Third-party tools.</strong> Linked tools are owned by their respective companies. We&apos;re not responsible for their content, pricing, or availability.</p>
        <p><strong className="text-slate-100">Submissions.</strong> By submitting a tool you confirm you have the right to do so; we may edit or decline any listing.</p>
        <p><strong className="text-slate-100">Contact.</strong> hello@ddotsmedia.com.</p>
        <p className="text-slate-500">A full agreement will replace this summary at launch.</p>
      </div>
    </main>
  );
}
