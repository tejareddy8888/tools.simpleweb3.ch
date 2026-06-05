# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Simplified Web3 Tools — a React-based web application providing blockchain interaction tools with a retro pixel-art aesthetic. Features include multi-chain EVM transaction sending, a Solana validator rewards query tool (backed by Google BigQuery), and a hex/decimal calculator.

## Commands

```bash
npm run dev          # Vite dev server (localhost:5173)
npm run server       # Express backend API (localhost:3001)
npm run dev:full     # Run both frontend + backend concurrently
npm run build        # Production build to dist/
npm run lint         # ESLint across all files
npm run preview      # Preview production build (localhost:4173)
```

No test framework is configured. Use `npm run lint` for code quality checks.

## Environment Setup

Copy `.env.example` to `.env`. Required variables:
- `TOOLS_PROJECT_ID` — WalletConnect project ID (note the `TOOLS_` prefix; Vite exposes env vars with this prefix per `vite.config.js`)
- `GOOGLE_CREDENTIALS_FILE` — Base64-encoded Google Cloud credentials (for BigQuery/Solana validator)
- `GOOGLE_PROJECT_ID` — Google Cloud project ID

## Architecture

### Frontend (Vite + React 19)

- **Router** (`src/router.jsx`): Four routes — `/` (landing), `/transaction`, `/solana-validator`, `/about`
- **Pages** (`src/pages/`): Each route maps to a page component
- **Web3 stack**: Wagmi + Viem for wallet/chain interaction, RainbowKit for wallet connection UI. Chain configs in `src/web3/` (supports Ethereum, Polygon, Optimism, Arbitrum, Base, Sepolia, Hoodi)
- **State**: Redux Toolkit for gas estimation (`src/reducer/gasEstimation.js`), React Context for transaction data (`src/context/`), TanStack React Query for async/server state
- **Styling**: Tailwind CSS 4 with custom color palette defined in `tailwind.config.js`, pixel-retroui components for retro aesthetic, MUI for modals/alerts, Framer Motion + GSAP for animations

### Backend (Express, root-level)

- `server.js` — Express server with a single POST endpoint `/api/solana-validator` and a health check at `/api/health`
- `bigQuery.js` — Google BigQuery client that queries `bigquery-public-data.crypto_solana_mainnet_us.Block Rewards` and returns CSV
- CORS configured for `localhost:5173` and `localhost:3000`
- Duplicate copies exist at `src/backend/` (the root-level files are the ones used by `npm run server`)

### Deployment

- GitHub Actions (`.github/workflows/deploy.yaml`) deploys to a Raspberry Pi via SSH on push to `main`
- Dockerfile uses multi-stage build with Node 20, serves on port 4173

## Key Conventions

- ES modules throughout (`"type": "module"` in package.json)
- Frontend env vars must be prefixed with `TOOLS_` to be exposed by Vite
- Components organized by role: `buttons/`, `modals/`, `widgets/`, `custom/`, `crucial/` (layout)
- Custom Tailwind colors: `customCyan`, `customPurple`, `customTangerine`, `customOlive`, `customMarine`
