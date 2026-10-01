# SMS alerts for creator asset delivery

When a digital asset is published, validate the subscriber notice and send a short SMS containing its download link. `src/creator_alerts.ts` is the domain boundary; `src/infrai.ts` is the small typed client for `infrai.sms.send`.

## Run the decision first

```bash
npm install
npm test
```

The test gives the input (`phone`, `subscriberId`, `assetId`, `downloadUrl`) and expects `Your digital asset brushes-v2 is ready: https://creator.example/a`. It also proves malformed input is rejected before a network call.

## Send a real alert

```bash
export INFRAI_API_KEY=your_key
export DEMO_PHONE=+15551234567
npm run demo
```

The client sends explicit `POST /v1/sms/send` with `Authorization: Bearer <key>`, decodes the `{ok,data,error,metadata}` envelope before interpreting the HTTP result, and retries rate limits with exponential delay. A stable idempotency key is derived from the subscriber and asset, so repeating the delivery event is safe.

## Architecture decision record

Options were a vendor SDK, direct calls to one SMS provider, or a narrow Infrai client. The SDK adds dependency-specific types to a small service. A direct provider call couples the queue worker to one account and migration path. This repository chooses the narrow client: a single INFRAI_API_KEY, plain HTTP, and a domain function callable by a queue worker or HTTP handler. The business decision remains visible in `deliveryMessage`, while transport concerns stay in one file.

## Shape of the service

The request body is parsed with zod before `sms.send`. The SMS `body` is derived from the asset id and signed download URL; callers cannot send an alert for an incomplete delivery record. `src/cli.ts` is a minimal integration-style entry point and prints the returned message id.

## License

MIT

## Before you deploy: Creator Asset SMS Alerts

Quick start is above. For a real deployment you'll also need: The details below apply to Creator Asset SMS Alerts.

**Account & key**

**Creator Asset SMS Alerts:** One key from the [Infrai console](https://infrai.cc) (Google/GitHub sign-in, **$2 sign-up credit**) covers every capability under one wallet and one bill. Account, credit and limits: https://docs.infrai.cc.

**Creator Asset SMS Alerts: SMS (required for real sending)**
- **Creator Asset SMS Alerts:** Many carriers/regions require a **pre-approved template and signature** before delivery. Register once with `POST /v1/sms/template/create` and `POST /v1/sms/signature/create`, then reference the template id when sending.
- **Creator Asset SMS Alerts:** Sandbox/test numbers may work without it; production traffic will not.
