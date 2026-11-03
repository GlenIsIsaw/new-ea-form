export const config = { maxDuration: 60 }; // Apps Script can hold a submission up to 30 s; check your Vercel plan's maximum

const GAS = process.env.APPS_SCRIPT_URL;
const KEY = process.env.PROXY_KEY;

export default async function handler(req, res) {
  if (!GAS || !KEY) return res.status(500).json({ error: "Not configured" });
  const action = String(req.query.action || "");

  // clock check: tiny, never cached, never touches Apps Script
  if (req.method === "GET" && action === "time") {
    res.setHeader("Cache-Control", "no-store");
    return res.status(200).json({ serverNow: Date.now() });
  }

  // status: cached at Vercel's CDN for 10 s, so all students share one Apps Script call
  if (req.method === "GET" && action === "status") {
    try {
      const r = await fetch(
        `${GAS}?action=status&key=${encodeURIComponent(KEY)}`,
      );
      const data = await r.json();
      if (!data || typeof data.state !== "string")
        throw new Error("bad upstream");
      delete data.serverNow; // would be stale once cached; the page uses ?action=time instead
      res.setHeader(
        "Cache-Control",
        "public, max-age=0, s-maxage=10, stale-while-revalidate=5",
      );
      return res.status(200).json(data);
    } catch {
      res.setHeader("Cache-Control", "no-store"); // never cache a failure
      return res.status(502).json({ error: "Upstream error" });
    }
  }

  if (req.method === "POST") {
    const b = req.body && typeof req.body === "object" ? req.body : {};
    const isPing = b.action === "online";
    const isSubmit =
      typeof b.category === "string" &&
      typeof b.turnstileToken === "string" &&
      b.turnstileToken.length > 10;
    if (isPing && !/^[A-Za-z0-9-]{16,64}$/.test(String(b.vid || ""))) {
      return res.status(200).json({ ok: true }); // junk ping: ignore without waking Apps Script
    }
    if (!isPing && !isSubmit) {
      return res.status(400).json({ success: false, error: "Bad request." });
    }
    try {
      const body = new URLSearchParams();
      for (const [k, v] of Object.entries(b))
        if (k !== "key") body.set(k, String(v));
      body.set("key", KEY);
      const r = await fetch(GAS, { method: "POST", body });
      const text = await r.text();
      res.setHeader("Cache-Control", "no-store");
      res.setHeader("Content-Type", "application/json");
      return res.status(200).send(text);
    } catch {
      res.setHeader("Cache-Control", "no-store");
      return res
        .status(502)
        .json({
          success: false,
          error: "Unable to reach the server. Please try again.",
        });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
