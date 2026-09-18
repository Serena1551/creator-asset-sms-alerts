import assert from "node:assert/strict";
import { deliveryMessage, DeliveryNotice } from "../src/creator_alerts.js";
const notice = DeliveryNotice.parse({ phone: "+15551234567", subscriberId: "sub-7", assetId: "brushes-v2", downloadUrl: "https://creator.example/a" });
assert.equal(deliveryMessage(notice), "Your digital asset brushes-v2 is ready: https://creator.example/a");
assert.throws(() => DeliveryNotice.parse({ phone: "", subscriberId: "sub-7", assetId: "x", downloadUrl: "bad" }));
console.log("creator alert boundary: ok");
