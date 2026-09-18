import { notifySubscriber } from "./creator_alerts.js";
const phone = process.env.DEMO_PHONE;
if (!phone) throw new Error("DEMO_PHONE is required");
const result = await notifySubscriber({ phone, subscriberId: "subscriber-demo", assetId: "preset-pack-01", downloadUrl: "https://creator.example/download/preset-pack-01" });
console.log(`delivery alert sent: ${result.message_id}`);
