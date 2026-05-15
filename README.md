# EcoProof

EcoProof is a Trustless Work-powered platform for funding and verifying real-world science experiments. Project teams submit experiments, funders deposit USDC into milestone escrow, service providers submit evidence, verifiers approve milestones, and release signers release funds through Trustless Work on Stellar testnet.

The product goal is simple: **fund science with public proof and milestone-based escrow instead of trust.**

## What This App Includes

This repository is a single integrated Next.js app:

- public landing page and project explorer
- experiment submission flow at `/experiments/new`
- wallet-aware project detail page at `/work/:slug`
- server-side Trustless Work API client
- role-gated escrow and milestone API routes
- local JSON persistence for hackathon/demo state
- Stellar Wallets Kit connection modal with Freighter, Albedo, WalletConnect, xBull, Ledger, and LOBSTR

There is no fake Trustless Work mode. If `TRUSTLESS_WORK_API_KEY` is missing or invalid, Trustless Work calls fail loudly.

## Product Flow

1. A creator connects a Stellar testnet wallet.
2. The creator submits an experiment with funding goal, methodology, verifier wallet, release signer wallet, dispute resolver wallet, and milestones.
3. EcoProof immediately creates the Trustless Work multi-release escrow as part of project submission.
4. The selected Stellar wallet signs the unsigned XDR returned by Trustless Work.
5. The backend submits the signed XDR through Trustless Work and stores the real contract ID.
6. A funder wallet funds the escrow.
7. The service provider submits evidence and marks a milestone complete.
8. The approver wallet approves the milestone.
9. The release signer wallet releases funds.
10. The live escrow can be inspected in the Trustless Work Viewer.

## Required Environment

Create `.env.local` in the project root:

```env
TRUSTLESS_WORK_API_BASE_URL=https://dev.api.trustlesswork.com
TRUSTLESS_WORK_API_KEY=your_trustless_work_testnet_api_key
```

That is the complete required env surface. Role wallets are collected in the project submission UI.

## Local Setup

```bash
npm install
npm run dev
```

Open:

```txt
http://localhost:3000
```

If port `3000` is busy, Next will print the alternate local URL.

## Testnet Wallet Setup

For a real end-to-end demo, prepare Stellar testnet wallets in Freighter or another Stellar Wallets Kit-compatible wallet:

- creator / service provider
- funder
- approver / verifier
- release signer
- dispute resolver

For a quick demo, some roles can use the same wallet, but role gating is enforced by wallet address. The wallet connected in the browser must match the stored role for that action.

Each wallet that signs transactions needs testnet XLM. The funder also needs the correct testnet USDC trustline and testnet USDC balance. The app currently uses this testnet USDC trustline issuer by default:

```txt
GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5
```

## Demo Script

1. Start the app with `.env.local` configured.
2. Connect a Stellar testnet wallet from the wallet picker.
3. Click `Start` in the nav or hero.
4. Submit the Community Water Quality Study at `/experiments/new`.
5. Approve the wallet signing prompt to create the Trustless Work escrow immediately.
6. Land on the project detail page with the contract ID already attached.
7. Copy the contract ID from the project detail page.
8. Open the Trustless Work Viewer deep link, or use `https://viewer.trustlesswork.com/{contractId}`.
9. Connect any Stellar testnet wallet and fund a specific amount into the escrow.
10. Connect the service provider wallet, submit evidence, and complete milestone 1.
11. Connect the approver wallet and approve milestone 1.
12. Connect the release signer wallet and release milestone 1 funds.
13. Refresh the Trustless Work Viewer to show the live escrow state.

## Role Rules

The UI and backend both enforce roles:

- creator: submits the experiment and signs immediate escrow creation
- funder: any connected wallet can fund an existing escrow
- service provider: can submit evidence and complete milestones
- approver: can approve milestones
- release signer: can release milestone funds
- everyone else: read-only project inspection

The frontend hides or disables unavailable actions. The backend also rejects mismatched wallets, so role checks do not rely on UI state only.

## Important Limitations

This is hackathon-grade but real-testnet focused.

Known gaps:

- Evidence upload stores metadata and URL only; it does not upload files to IPFS/Supabase yet.
- Local experiment and pending transaction state are JSON-backed, not a production database.
- Non-transaction evidence submission checks wallet address, but does not yet require a signed auth message. Production should add wallet message signing for non-XDR actions.
- The project explorer reads local submitted projects; it does not yet auto-index all live Trustless Work escrows by organization wallet.
- Trustless Work Viewer accepts contract IDs at `https://viewer.trustlesswork.com/{contractId}`.

## Architecture

```txt
src/
  app/
    api/
      experiments/route.ts
      experiments/[slug]/route.ts
      escrow/create/route.ts
      escrow/fund/route.ts
      escrow/send-transaction/route.ts
      escrow/[contractId]/route.ts
      escrow/discover/route.ts
      milestones/[id]/submit-evidence/route.ts
      milestones/[id]/complete/route.ts
      milestones/[id]/approve/route.ts
      milestones/[id]/release/route.ts
      verifier/reviews/route.ts
    experiments/new/page.tsx
    work/[id]/page.tsx
  frontend/
    pages/NewExperiment.tsx
    pages/WorkDetail.tsx
    wallet.tsx
    openlab-projects.tsx
  lib/
    experiments.ts
    openlab-config.ts
    openlab-view-model.ts
    pending-transactions.ts
    trustless-work/client.ts
    trustless-work/openlab-mapper.ts
    types.ts
```

## Trustless Work API Usage

The server calls Trustless Work with `x-api-key` from `TRUSTLESS_WORK_API_KEY`.

Used endpoints:

- `POST /deployer/multi-release`
- `POST /escrow/multi-release/fund-escrow`
- `POST /escrow/multi-release/complete-milestone`
- `POST /escrow/multi-release/approve-milestone`
- `POST /escrow/multi-release/release-milestone-funds`
- `POST /helper/send-transaction`
- `POST /indexer/update-from-txHash`
- `GET /helper/get-escrow-by-contract-ids`
- `GET /helper/get-escrows-by-role`
- `GET /helper/get-escrows-by-signer`

## API Routes

### `GET /api/experiments`

Returns local experiments and frontend project cards.

### `POST /api/experiments`

Creates a new local experiment. The frontend immediately follows this with Trustless Work escrow creation and wallet signing. Milestone amounts must add up to `fundingGoal`.

### `GET /api/experiments/:slug`

Returns one experiment and its frontend project card.

### `POST /api/escrow/create`

Builds a Trustless Work multi-release escrow and returns unsigned XDR. Escrow creation is permissionless; the signer only has to match the connected wallet.

### `POST /api/escrow/fund`

Builds unsigned XDR for funding a specific amount into an existing escrow. The signer must match the connected wallet.

### `POST /api/escrow/send-transaction`

Submits signed XDR to Trustless Work and applies the corresponding pending operation locally. Pending transactions expire after 15 minutes and are stored server-side so the client cannot fake operation metadata.

### `GET /api/escrow/:contractId`

Fetches canonical escrow state from Trustless Work by contract ID.

### `GET /api/escrow/discover`

Discovers Trustless Work escrows by contract IDs, signer, or role/address.

### `POST /api/milestones/:id/submit-evidence`

Stores evidence metadata locally. Requires the connected wallet to be the service provider.

### `POST /api/milestones/:id/complete`

Builds unsigned XDR for milestone completion. Requires service provider wallet.

### `POST /api/milestones/:id/approve`

Builds unsigned XDR for milestone approval. Requires approver wallet.

### `POST /api/milestones/:id/release`

Builds unsigned XDR for milestone fund release. Requires release signer wallet.

### `GET /api/verifier/reviews`

Returns local milestones marked `ready_for_review`.

## Local Persistence

Local state is stored in ignored files:

```txt
.openlab-data.json
.openlab-pending-transactions.json
```

Delete them to start from a clean local state:

```bash
rm -f .openlab-data.json .openlab-pending-transactions.json
```

If you need seeded experiments for tests or local inspection, the test suite calls the seed reset directly. The running app does not depend on fake/demo escrow behavior.

## Validation Commands

```bash
npm test
npm run typecheck
npm run build
```

Current expected status:

- tests pass
- typecheck passes
- build passes
- build may warn that the Next.js ESLint plugin is not configured

## Security Notes

- The Trustless Work API key stays server-side.
- Private keys are never stored by the app.
- Real transaction signing happens in the browser wallet.
- `.env.local` and local state files are ignored and must not be committed.
- Production should replace local JSON persistence with a database and add signed wallet auth for non-transaction actions.
