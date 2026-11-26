// Shared progress store for the Occultum tracker.
// GET  /api/progress            -> { chars: { charli: {...}, woven: {...}, mimi: {...} }, serverTime }
// POST /api/progress  { char, kind, id, value }   -> updates one field, returns that character
// POST /api/progress  { char, action: "reset" }   -> clears a character
import { getStore } from "@netlify/blobs";

const CHARS = ["charli", "woven", "mimi"];
const KINDS = ["duty", "enemy", "fate", "final"];
const ID_RE = /^[a-z0-9-]{1,48}$/;

const json = (body, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json", "cache-control": "no-store" },
  });

const blank = () => ({ duty: {}, enemy: {}, fate: {}, final: {}, updatedAt: 0 });

export default async (req) => {
  const store = getStore({ name: "occultum-progress", consistency: "strong" });

  if (req.method === "GET") {
    const entries = await Promise.all(
      CHARS.map(async (c) => [c, (await store.get(`char-${c}`, { type: "json" })) || blank()])
    );
    return json({ chars: Object.fromEntries(entries), serverTime: Date.now() });
  }

  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  let body;
  try {
    body = await req.json();
  } catch {
    return json({ error: "Bad JSON" }, 400);
  }
  const { char, kind, id, value, action } = body || {};
  if (!CHARS.includes(char)) return json({ error: "Unknown character" }, 400);

  if (action !== "reset") {
    if (!KINDS.includes(kind) || !ID_RE.test(String(id))) return json({ error: "Bad field" }, 400);
    const ok =
      kind === "fate"
        ? Number.isInteger(value) && value >= 0 && value <= 5
        : typeof value === "boolean";
    if (!ok) return json({ error: "Bad value" }, 400);
  }

  const key = `char-${char}`;
  // Optimistic concurrency: retry if someone else wrote in between our read and write.
  for (let attempt = 0; attempt < 6; attempt++) {
    const current = await store.getWithMetadata(key, { type: "json" });
    const data = action === "reset" ? blank() : { ...blank(), ...(current?.data || {}) };
    if (action !== "reset") {
      data[kind] = { ...(data[kind] || {}) };
      if (value === false || value === 0) delete data[kind][id];
      else data[kind][id] = value;
    }
    data.updatedAt = Date.now();

    // Conditional write when we know the version; first write only if still new.
    // (If an existing entry came back without an ETag, fall back to a plain write.)
    const condition = current?.etag ? { onlyIfMatch: current.etag } : current ? {} : { onlyIfNew: true };
    const result = await store.setJSON(key, data, condition);
    if (result?.modified !== false) return json({ char, data });
    await new Promise((r) => setTimeout(r, 40 + Math.random() * 80));
  }
  return json({ error: "Busy, try again" }, 409);
};

export const config = { path: "/api/progress" };
