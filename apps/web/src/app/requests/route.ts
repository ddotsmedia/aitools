export const runtime = "nodejs";

export async function POST(req: Request) {
  let body: Record<string, unknown> = {};
  try {
    body = await req.json();
  } catch {
    return Response.json({ ok: false, error: "invalid json" }, { status: 400 });
  }

  const type = String(body.type ?? "request");

  if (type === "subscribe") {
    const email = String(body.email ?? "").trim();
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      return Response.json({ ok: false, error: "invalid email" }, { status: 400 });
    }
    const key = process.env.RESEND_API_KEY;
    const audience = process.env.RESEND_AUDIENCE_ID;
    if (key && audience) {
      try {
        await fetch(`https://api.resend.com/audiences/${audience}/contacts`, {
          method: "POST",
          headers: { authorization: `Bearer ${key}`, "content-type": "application/json" },
          body: JSON.stringify({ email, unsubscribed: false }),
        });
      } catch {
        /* swallow — still confirm to user */
      }
    } else {
      console.log("[newsletter] subscribe", email);
    }
    return Response.json({ ok: true });
  }

  console.log("[tool-request]", {
    name: body.name,
    website: body.website,
    category: body.category,
    reason: String(body.reason ?? "").slice(0, 200),
  });
  return Response.json({ ok: true });
}
