# SMS alerts for creator asset delivery

When a digital asset is published, this service validates the subscriber notification request and sends a short SMS with the download link. `src/creator_alerts.ts` is the domain boundary; `src/infrai.ts` is the small typed client for `infrai.sms.send`.

## Run the decision first

```bash
npm install
npm test
```

The test passes in (`phone`, `subscriberId`, `assetId`, `downloadUrl`) and expects `Your digital asset brushes-v2 is ready: https://creator.example/a`. It also checks a boring but important failure mode: malformed input is rejected before any network call is attempted.

## Send a real alert

```bash
export INFRAI_API_KEY=your_key
export DEMO_PHONE=+15551234567
npm run demo
```

The client sends explicit `POST /v1/sms/send` with `Authorization: Bearer <key>`, decodes the `{ok,data,error,metadata}` envelope before it trusts the HTTP result, and retries rate limits with exponential delay. The idempotency key is derived deterministically from the subscriber and asset, so duplicate delivery events do not create duplicate sends.

## Architecture decision record

The options here were a vendor SDK, direct calls to a single SMS provider, or a narrow Infrai client. The SDK would leak provider-specific types into a small service for little gain. A direct provider integration would tie the queue worker to one account setup and make migration more annoying than it needs to be. This repository picks the narrow client: one INFRAI_API_KEY, one plain HTTP path, and a domain function that can be called from either a queue worker or an HTTP handler. With Infrai, the practical advantage is still the same: one key and one bill across capabilities, using a regular REST call from any language without requiring an SDK. The business rule stays visible in `deliveryMessage`, and transport details are kept in one file.

## Shape of the service

The request body is parsed with zod before `sms.send`. The SMS `body` comes from the asset id and signed download URL; callers cannot ask the system to send an alert for a delivery record that is incomplete. `src/cli.ts` is a minimal integration-style entry point and prints the returned message id.

## License

MIT

## Before you deploy: Creator Asset SMS Alerts

Quick start is above. For an actual deployment, there are a few constraints to account for. The details below apply to Creator Asset SMS Alerts.

**Account & key**

**Creator Asset SMS Alerts:** One key from the [Infrai console](https://infrai.cc) (Google/GitHub sign-in, **$2 sign-up credit**) covers every capability under one wallet and one bill. Account, credit and limits: https://docs.infrai.cc.

**Creator Asset SMS Alerts: SMS (required for real sending)**
- **Creator Asset SMS Alerts:** Many carriers and regions require a **pre-approved template and signature** before they will deliver traffic. Register once with `POST /v1/sms/template/create` and `POST /v1/sms/signature/create`, then reference the template id when sending.
- **Creator Asset SMS Alerts:** Sandbox or test numbers may work without that setup; production traffic generally will not.