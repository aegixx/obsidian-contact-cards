# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build & Development Commands

| Command           | Description                                      |
| ----------------- | ------------------------------------------------ |
| `npm run dev`     | Build in watch mode (esbuild)                    |
| `npm run build`   | Type-check (`tsc`) + production build (minified) |
| `npm run version` | Bump version in manifest.json and versions.json  |
| `npm run lint`    | Lint all files via Trunk (`trunk check --all`)   |
| `npm run fmt`     | Format all files via Trunk (`trunk fmt --all`)   |

No test suite exists. Validation is done through `tsc -noEmit` (part of `npm run build`) and Trunk linting.

## Architecture

This is an Obsidian plugin that renders YAML code blocks (fenced as `contact-card`) into styled contact cards. All plugin logic lives in a single file: **`main.ts`**.

### Core Components (all in main.ts)

- **`ContactCardsPlugin`** (extends `Plugin`) — Registers a markdown code block processor for `contact-card` blocks. The `renderContactCard()` method parses YAML, extracts contact fields, calls external APIs for enrichment, and builds the card DOM.
- **`ContactCardsSettingTab`** (extends `PluginSettingTab`) — Settings UI for default country code.
- **`sha256()`** — Helper using Web Crypto API for Gravatar email hashing.

### External API Integrations

| Service     | Purpose        | Trigger                                        |
| ----------- | -------------- | ---------------------------------------------- |
| Gravatar    | Avatar image   | When `email` present and no `photo_url`        |
| Logo.dev    | Company logo   | When domain available (from email or `domain`) |
| LinkedIn    | Profile search | Always (search by name)                        |
| Google Maps | Location link  | When `location` field present                  |

### Contact Card Fields

Standard fields with special handling: `name`, `email`, `phone`, `company`, `title`, `location`, `domain`, `photo_url`, `logo_url`. Any additional YAML keys render as generic key-value rows.

Phone formatting uses `google-libphonenumber` with the configured default country code.

### Rendering Approach

All HTML is built using DOM APIs (`createEl`, `createDiv`, etc.) — no innerHTML or template strings. Cards use CSS animations and integrate with Obsidian's theme variables.

## Code Style

- **Indentation**: Tabs (4-space width) per `.editorconfig`
- **TypeScript**: Strict null checks, no implicit any
- **Linting**: ESLint + Prettier via Trunk
- **Target**: ES6, bundled to CommonJS via esbuild
