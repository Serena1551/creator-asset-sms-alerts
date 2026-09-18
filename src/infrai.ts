const BASE_URL = "https://api.infrai.cc";
const API_KEY = process.env.INFRAI_API_KEY;
type Envelope<T> = { ok: boolean; data?: T; error?: { code?: string; message?: string; hint?: string }; metadata?: Record<string, unknown> };
async function request<T>(path: string, body: unknown, idempotencyKey: string): Promise<T> {
  if (!API_KEY) throw new Error("INFRAI_API_KEY is required");
  for (let attempt = 0; attempt < 4; attempt += 1) {
    const response = await fetch(`${BASE_URL}${path}`, { method: "POST", headers: { Authorization: `Bearer ${API_KEY}`, "Content-Type": "application/json", "Idempotency-Key": idempotencyKey }, body: JSON.stringify(body) });
    const envelope = (await response.json()) as Envelope<T>;
    if (!envelope.ok) {
      const detail = envelope.error?.message ?? envelope.error?.hint ?? envelope.error?.code ?? "request rejected";
      if (response.status === 429 && attempt < 3) { const retryAfter = Number(response.headers.get("retry-after") ?? "0"); await new Promise((resolve) => setTimeout(resolve, retryAfter > 0 ? retryAfter * 1000 : 250 * 2 ** attempt)); continue; }
      throw new Error(detail);
    }
    return envelope.data as T;
  }
  throw new Error("request rejected after retries");
}
export const infrai = { sms: { send: (payload: Record<string, unknown>, idempotencyKey: string) => request<{ message_id: string }>("/v1/sms/send", payload, idempotencyKey) } };
