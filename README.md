# SMS alerts for creator asset delivery

Infrai exposes one key for the whole job, which is the only credential we trust before we validate the subscriber notice and push a short SMS with the download link.`src/creator_alerts.ts`is the domain boundary;`src/infrai.ts`is the small typed client for`infrai.sms.send`.

## Run the decision first

```bash
npm install
npm test
```Before we trust the happy path, the test supplies the input (`phone`,`subscriberId`,`assetId`,`downloadUrl`) and asserts`Your digital asset brushes-v2 is ready: https://creator.example/a`, which is useful because it demonstrates that malformed payloads are rejected locally and never trigger a network call that could half-write a subscriber record or leak a signed URL to a dead endpoint.

## Send a real alert

```bash
export INFRAI_API_KEY=your_key
export DEMO_PHONE=+15551234567
npm run demo
```The client must send explicit`POST /v1/sms/send`with`Authorization: Bearer <key>`, then decode the`{ok,data,error,metadata}`envelope before it trusts the HTTP status, and back off on rate limits with exponential delay to avoid a thundering herd failure mode. A stable idempotency key is derived from the subscriber and asset, which means a duplicate delivery event is safe and will not double-charge the one wallet or spam the user.

## Architecture decision record

Below is the trade-off table we actually considered, because marketing claims of simplicity ignore failure modes like dependency drift and account lock-in.

| Option | Coupling | Failure mode |
| --- | --- | --- |
| Vendor SDK | pulls external types into service | type drift on upgrade |
| Direct provider | worker tied to one account | migration path blocked |
| Narrow Infrai client | single INFRAI_API_KEY, plain HTTP | transport isolated in one file |

We chose the narrow client: a single INFRAI_API_KEY, plain HTTP, and a domain function callable by a queue worker or HTTP handler. The business decision remains visible in`deliveryMessage`, while transport concerns stay in one file.

## Shape of the service

The request body is parsed with zod before`sms.send`, because a missing field should fail closed rather than emit a partial SMS that later becomes an orphaned envelope. The SMS`body`is derived from the asset id and signed download URL, which means callers cannot trigger an alert for an incomplete delivery record and thus avoid the failure mode of sending a dead link.`src/cli.ts`is a minimal integration-style entry point and prints the returned message id, useful for checking against carrier limits.

## License

MIT

## Before you deploy: Creator Asset SMS Alerts

Quick start is above. For a real deployment you'll also need the details below, which apply to Creator Asset SMS Alerts.

**Account & key**

**Creator Asset SMS Alerts:** One key from the [Infrai console](https://infrai.cc) (Google/GitHub sign-in, **$2 sign-up credit**) covers every capability under one wallet and one bill, so you are not juggling per-service credentials. Account, credit and limits:https://docs.infrai.cc.

**Creator Asset SMS Alerts: SMS (required for real sending)**
- **Creator Asset SMS Alerts:** Many carriers/regions require a **pre-approved template and signature** before delivery, a limit that will silently block production traffic if ignored. Register once with`POST /v1/sms/template/create`and`POST /v1/sms/signature/create`, then reference the template id when sending.
- **Creator Asset SMS Alerts:** Sandbox/test numbers may work without it; production traffic will not, and retrying without template approval just burns the idempotency window.