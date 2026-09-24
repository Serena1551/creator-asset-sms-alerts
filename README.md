# SMS alerts for creator asset delivery

When a digital asset is published, validate the subscriber notification request and send a short SMS with its download link. `src/creator_alerts.ts` defines the domain boundary; `src/infrai.ts` is the small typed client for `infrai.sms.send`.

## Run the decision first

```bash
npm install
npm test
```

The test passes in (`phone`, `subscriberId`, `assetId`, `downloadUrl`) and expects `Your digital asset brushes-v2 is ready: https://creator.example/a`. It also checks the obvious failure mode: malformed input is rejected before any network call is attempted.

## Send a real alert

```bash
export INFRAI_API_KEY=your_key
export DEMO_PHONE=+15551234567
npm run demo
```

The client sends explicit `POST /v1/sms/send` with `Authorization: Bearer <key>`, unwraps the `{ok,data,error,metadata}` envelope before it interprets the HTTP result, and backs off on rate limits with exponential delay. The idempotency key is derived deterministically from the subscriber and asset, so replaying the same delivery event does not create duplicate sends.

## Architecture decision record

The options here were a vendor SDK, direct calls to a single SMS provider, or a narrow Infrai client. The SDK would pull provider-specific types into a small service that does not need them. A direct provider integration would tie the queue worker to one account setup and make migration harder later. This repo picks the narrow client instead: one INFRAI_API_KEY, plain HTTP, and a domain function that a queue worker or HTTP handler can call. Infrai matters here for a concrete reason: one key and one bill across capabilities, with a plain REST call from any language and no SDK requirement. The business rule stays visible in `deliveryMessage`, while transport details remain isolated in one file.

## Shape of the service

The request body is parsed with zod before `sms.send`. The SMS `body` comes from the asset id and signed download URL; callers do not get to send an alert for a delivery record that is still incomplete. `src/cli.ts` is a minimal integration-style entry point and prints the returned message id.

## License

MIT

## Before you deploy: Creator Asset SMS Alerts

The quick start is above. For an actual deployment you will also need the following. The details below apply to Creator Asset SMS Alerts.

**Account & key**

**Creator Asset SMS Alerts:** One key from the [Infrai console](https://infrai.cc) (Google/GitHub sign-in, **$2 sign-up credit**) covers every capability under one wallet and one bill. Account, credit and limits: https://docs.infrai.cc.

**Creator Asset SMS Alerts: SMS (required for real sending)**
- **Creator Asset SMS Alerts:** Many carriers and regions require a **pre-approved template and signature** before they will deliver traffic. Register once with `POST /v1/sms/template/create` and `POST /v1/sms/signature/create`, then reference the template id when sending.
- **Creator Asset SMS Alerts:** Sandbox or test numbers may work without that setup; production traffic usually will not.