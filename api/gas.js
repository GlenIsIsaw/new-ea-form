import { handleSubmit } from "./_submit.js";

export const config = { maxDuration: 60 }; // Apps Script can hold a submission up to 30 s; check your Vercel plan's maximum

const GAS = process.env.APPS_SCRIPT_URL;
const KEY = process.env.PROXY_KEY;

let lastStatus = null;

export default async function handler(req, res) {
  const action = String(req.query.action || "");

  // clock check: tiny, never cached, never touches Apps Script
  if (req.method === "GET" && action === "time") {
    res.setHeader("Cache-Control", "no-store");
    return res.status(200).json({ serverNow: Date.now() });
  }

  if (!GAS || !KEY) return res.status(500).json({ error: "Not configured" });

  // status: cached at Vercel's CDN for 10 s, so all students share one Apps Script call
  if (req.method === "GET" && action === "status") {
    try {
      const r = await fetch(
        `${GAS}?action=status&key=${encodeURIComponent(KEY)}`,
      );
      const data = await r.json();
      if (!data || typeof data.state !== "string")
        throw new Error("bad upstream");
      delete data.serverNow;
      lastStatus = data;
      res.setHeader("Cache-Control", "public, max-age=0, s-maxage=30, stale-while-revalidate=60, stale-if-error=600");
      return res.status(200).json(data);
    } catch {
      if (lastStatus) {
        res.setHeader("Cache-Control", "public, max-age=0, s-maxage=15");
        return res.status(200).json(lastStatus);
      }
      res.setHeader("Cache-Control", "no-store");
      return res.status(502).json({ error: "Upstream error" });
    }
  }

  if (req.method === "POST") {
    const allowed = [
      "https://new-ea-form.vercel.app",
      "http://localhost:3000",
      "https://2dcn-educational-assistance.vercel.app",
    ];
    if (!allowed.includes(String(req.headers.origin || ""))) {
      return res.status(403).json({ success: false, error: "Not allowed." });
    }
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
        if (isSubmit && process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_KEY) {
      res.setHeader("Cache-Control", "no-store");
      try {
        return res.status(200).json(await handleSubmit(b, GAS, KEY));
      } catch (e) {
        console.error(e);
        return res.status(200).json({ success: false, error: "The system is busy. Please wait a minute, then press Submit again." });
      }
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
      return res.status(502).json({
        success: false,
        error: "Unable to reach the server. Please try again.",
      });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
