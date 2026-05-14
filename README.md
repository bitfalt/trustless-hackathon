# OpenLab — Trustless Hackathon Backend

OpenLab funds citizen-science and public-interest experiments through Trustless Work milestone escrow.

**Tagline:** Fund science. Verify evidence. Unlock impact.

This repo currently contains the backend/domain foundation for the MVP. The React frontend can be built on top of these APIs.

## MVP demo

The seeded demo experiment is **WaterWatch Costa Rica**: a school/community measures local water contamination, submits methodology/data/report evidence, and receives milestone payments only after verifier approval.

Funding target: **1,000 USDC**

Milestones:

1. **Methodology approved** — 20% / 200 USDC
2. **Field data collected** — 40% / 400 USDC
3. **Open report published** — 40% / 400 USDC

## Backend architecture

```txt
src/
  app/
    api/
      experiments/route.ts
      experiments/[slug]/route.ts
      escrow/create/route.ts
      escrow/fund/route.ts
      escrow/send-transaction/route.ts
      milestones/[id]/submit-evidence/route.ts
      milestones/[id]/complete/route.ts
      milestones/[id]/approve/route.ts
      milestones/[id]/release/route.ts
  lib/
    api.ts
    experiments.ts
    types.ts
    trustless-work/
      client.ts
      openlab-mapper.ts
      types.ts
```

The backend keeps OpenLab's domain model separate from Trustless Work API calls:

- `src/lib/experiments.ts` owns seeded experiments, evidence, and local milestone state.
- `src/lib/trustless-work/openlab-mapper.ts` maps OpenLab experiments to Trustless Work multi-release escrow payloads.
- `src/lib/trustless-work/client.ts` centralizes all Trustless Work API calls and keeps the API key server-side.
- API route handlers validate request payloads with `zod` and return frontend-friendly JSON.

## Trustless Work lifecycle

The app follows the Trustless Work transaction pattern:

1. Backend builds a payload and calls Trustless Work.
2. Trustless Work returns an unsigned transaction/XDR.
3. Frontend wallet signs the XDR.
4. Frontend posts the signed XDR to `/api/escrow/send-transaction`.
5. Backend submits the signed transaction to Trustless Work.
6. Backend stores normalized local state such as contract ID, transaction hash, milestone status, and viewer URL.

No private keys are stored or used by the backend.

## Trustless Work endpoints used

From `trustless-work-dev-skill` and `escrow-lab`:

- `POST /deployer/multi-release`
- `POST /escrow/multi-release/fund-escrow`
- `POST /escrow/multi-release/complete-milestone`
- `POST /escrow/multi-release/approve-milestone`
- `POST /escrow/multi-release/release-milestone`
- `POST /helper/send-transaction`

Current multi-release docs specify the `x-api-key` header.

## Environment setup

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

Required for real Trustless Work calls:

```txt
TRUSTLESS_WORK_API_BASE_URL=https://api.trustlesswork.com
TRUSTLESS_WORK_API_KEY=replace_with_trustless_work_api_key
TRUSTLESS_WORK_NETWORK=testnet
OPENLAB_PLATFORM_ADDRESS=replace_with_stellar_wallet
OPENLAB_RELEASE_SIGNER_ADDRESS=replace_with_stellar_wallet
OPENLAB_DISPUTE_RESOLVER_ADDRESS=replace_with_stellar_wallet
OPENLAB_USDC_TRUSTLINE_ADDRESS=CBIELTK6YBZJU5UP2WWQEUCYKLPU6AUNZ2BQ4WWFEIE3USCIHMXQDAMA
NEXT_PUBLIC_ESCROW_VIEWER_BASE_URL=https://viewer.trustlesswork.com
```

For local frontend development without a Trustless Work key, set:

```txt
OPENLAB_ESCROW_MODE=demo
```

Demo mode returns deterministic fake unsigned XDR strings and is clearly labeled in the response. Leave it unset for real Trustless Work calls.

## API routes

### `GET /api/experiments`

Returns seeded OpenLab experiments.

### `GET /api/experiments/:slug`

Returns one experiment with milestones, evidence, escrow metadata, and result links.

Example:

```bash
curl http://localhost:3000/api/experiments/waterwatch-costa-rica
```

### `POST /api/escrow/create`

Builds a Trustless Work multi-release escrow payload and returns unsigned XDR for wallet signing.

Request:

```json
{
  "experimentSlug": "waterwatch-costa-rica",
  "signer": "G...FUNDER_OR_DEPLOYER",
  "serviceProvider": "G...TEAM",
  "approver": "G...VERIFIER",
  "platformAddress": "G...OPENLAB",
  "releaseSigner": "G...RELEASE_SIGNER",
  "disputeResolver": "G...RESOLVER",
  "trustline": {
    "address": "CBIELTK6YBZJU5UP2WWQEUCYKLPU6AUNZ2BQ4WWFEIE3USCIHMXQDAMA",
    "symbol": "USDC"
  }
}
```

Response includes:

- `operation: "create_escrow"`
- `payload`
- `unsignedTransaction`
- `raw`

### `POST /api/escrow/fund`

Returns unsigned XDR to fund a deployed multi-release escrow.

Request:

```json
{
  "experimentSlug": "waterwatch-costa-rica",
  "contractId": "C...",
  "signer": "G...FUNDER",
  "amount": 1000
}
```

### `POST /api/escrow/send-transaction`

Submits signed XDR through Trustless Work and optionally updates local OpenLab state.

Request after create escrow:

```json
{
  "signedXdr": "AAAA...SIGNED",
  "experimentSlug": "waterwatch-costa-rica",
  "operation": "create_escrow",
  "expectedContractId": "C...IF_PROVIDER_DOES_NOT_RETURN_ONE"
}
```

Request after funding:

```json
{
  "signedXdr": "AAAA...SIGNED",
  "experimentSlug": "waterwatch-costa-rica",
  "operation": "fund_escrow",
  "amount": 1000
}
```

Request after milestone approval/release:

```json
{
  "signedXdr": "AAAA...SIGNED",
  "experimentSlug": "waterwatch-costa-rica",
  "operation": "approve_milestone",
  "milestoneId": "waterwatch-methodology"
}
```

Supported operations:

- `create_escrow`
- `fund_escrow`
- `complete_milestone`
- `approve_milestone`
- `release_milestone`

### `POST /api/milestones/:id/submit-evidence`

Stores evidence locally and marks the milestone `ready_for_review`. This does **not** release funds.

Request:

```json
{
  "experimentSlug": "waterwatch-costa-rica",
  "evidence": [
    {
      "id": "evidence-methodology-plan",
      "type": "methodology",
      "title": "Sampling Plan PDF",
      "url": "https://example.com/sampling-plan.pdf"
    }
  ],
  "notes": "Initial methodology package for verifier review."
}
```

### `POST /api/milestones/:id/complete`

Calls Trustless Work `complete-milestone` and returns unsigned XDR for the service provider/team wallet.

Request:

```json
{
  "experimentSlug": "waterwatch-costa-rica",
  "contractId": "C...",
  "signer": "G...TEAM",
  "milestoneIndex": 0
}
```

### `POST /api/milestones/:id/approve`

Calls Trustless Work `approve-milestone` and returns unsigned XDR for the verifier wallet. Trustless Work docs say multi-release funds are released immediately on approval.

Request:

```json
{
  "experimentSlug": "waterwatch-costa-rica",
  "contractId": "C...",
  "approver": "G...VERIFIER",
  "milestoneIndex": 0
}
```

### `POST /api/milestones/:id/release`

Optional explicit release route. Trustless Work docs say approval auto-releases in multi-release escrows, but the endpoint exists as `POST /escrow/multi-release/release-milestone`.

Request:

```json
{
  "experimentSlug": "waterwatch-costa-rica",
  "contractId": "C...",
  "releaseSigner": "G...RELEASE_SIGNER",
  "milestoneIndex": 0
}
```

## Frontend integration notes

A React frontend should:

1. Fetch experiments from `/api/experiments`.
2. Render WaterWatch from `/api/experiments/waterwatch-costa-rica`.
3. Call `/api/escrow/create` to get unsigned XDR.
4. Sign unsigned XDR with the user's Stellar wallet.
5. Send signed XDR to `/api/escrow/send-transaction` with the matching operation.
6. Use `/api/milestones/:id/submit-evidence` for team submissions.
7. Use `/api/milestones/:id/complete` and `/api/milestones/:id/approve` for milestone lifecycle.
8. Refresh the experiment after each signed transaction.

## Local development

```bash
npm install
npm run dev
```

Validation:

```bash
npm test
npm run typecheck
npm run build
```

## Real vs demo

Real mode:

- default when `OPENLAB_ESCROW_MODE` is unset
- requires `TRUSTLESS_WORK_API_KEY`
- calls the real Trustless Work API
- returns real unsigned XDR
- submits signed XDR through `/helper/send-transaction`

Demo mode:

- enabled only with `OPENLAB_ESCROW_MODE=demo`
- does not call Trustless Work
- returns fake unsigned XDR for UI development
- should be labeled as demo in any presentation if used

## Docs inspected

Implementation was based on:

- `Trustless-Work/trustless-work-dev-skill`
  - `skills/api/core-concepts.md`
  - `skills/api/multi-release-escrow.md`
  - `skills/api/types.md`
  - `skills/api/trustlines.md`
- `Trustless-Work/escrow-lab`
  - references for hooks and current operation names

## Security notes

- `TRUSTLESS_WORK_API_KEY` is only read by server-side route handlers.
- No private keys are stored.
- Wallet signing belongs in the browser/frontend.
- `.env.local` is ignored and must not be committed.
