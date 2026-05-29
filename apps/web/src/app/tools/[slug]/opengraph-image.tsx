import { ImageResponse } from "next/og";
import { api } from "@/lib/api";

export const runtime = "nodejs";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "AI tool on AI Tools Hub";

export default async function OG({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  let name = slug;
  let tagline = "Verified AI tool";
  let pricing = "";
  try {
    const t = await api.getTool(slug);
    name = t.name;
    tagline = t.tagline || tagline;
    pricing = t.freeTierReal ? "Verified free tier" : t.pricingModel;
  } catch {
    /* fall back to slug */
  }

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "linear-gradient(135deg, #0b1733 0%, #0e2247 100%)",
          padding: "70px",
          color: "#f1f5f9",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "16px", fontSize: 30, color: "#2a9aa4", fontWeight: 700 }}>
          <div style={{ display: "flex", gap: 6 }}>
            <div style={{ width: 16, height: 16, borderRadius: 8, background: "#2a9aa4" }} />
            <div style={{ width: 16, height: 16, borderRadius: 8, background: "#f5b21a" }} />
            <div style={{ width: 16, height: 16, borderRadius: 8, background: "#ef7e1a" }} />
            <div style={{ width: 16, height: 16, borderRadius: 8, background: "#3fae57" }} />
          </div>
          AI Tools Hub
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <div style={{ fontSize: 76, fontWeight: 800, lineHeight: 1.05 }}>{name}</div>
          <div style={{ fontSize: 34, color: "#94a3b8", maxWidth: 1000 }}>{tagline.slice(0, 120)}</div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "16px", fontSize: 26 }}>
          <div style={{ background: "#3fae5722", color: "#3fae57", padding: "8px 18px", borderRadius: 999 }}>
            {pricing || "Verified"}
          </div>
          <div style={{ color: "#64748b" }}>machine-verified · milestonm.ae</div>
        </div>
      </div>
    ),
    { ...size },
  );
}
