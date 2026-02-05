const BROWSER_API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8000";
const SERVER_API_BASE = process.env.INTERNAL_API_BASE || "http://backend:8000";

function apiBase(): string {
  return typeof window === "undefined" ? SERVER_API_BASE : BROWSER_API_BASE;
}

export async function apiGet<T>(path: string): Promise<T> {
  const res = await fetch(`${apiBase()}${path}`, { cache: "no-store" });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function apiPost<T>(path: string, body: any): Promise<T> {
  const res = await fetch(`${apiBase()}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}
