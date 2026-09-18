import { z } from "zod";
import { infrai } from "./infrai.js";
export const DeliveryNotice = z.object({ phone: z.string().min(8), subscriberId: z.string().min(1), assetId: z.string().min(1), downloadUrl: z.string().url() });
export type DeliveryNotice = z.infer<typeof DeliveryNotice>;
export function deliveryMessage(input: DeliveryNotice): string { return `Your digital asset ${input.assetId} is ready: ${input.downloadUrl}`; }
export async function notifySubscriber(raw: unknown) { const input = DeliveryNotice.parse(raw); return infrai.sms.send({ to: input.phone, body: deliveryMessage(input) }, `asset-delivery:${input.subscriberId}:${input.assetId}`); }
