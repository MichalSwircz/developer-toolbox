# Developer Toolbox

A standalone, browser-based collection of utilities for frontend developers. The application has no backend; processing happens locally in the browser.

## Features

- **JSON Formatter & Validator** - Pretty-print with configurable indentation, minify, validate, and copy JSON.
- **JWT Decoder** - Decode the header and payload, inspect `exp`, `iat`, and `nbf` claims, and copy decoded sections.
- **UUID Generator** - Generate 1-100 UUID v4 identifiers per batch using the Web Crypto API.
- **Base64 Encoder / Decoder** - Encode text and decode Base64 as UTF-8, including Unicode; swap, clear, and copy results.

## Technology stack

- React 19 and TypeScript 7 with strict type checking
- Vite 8
- CSS Modules
- Lucide React
- Vitest with jsdom and Testing Library
- Oxlint for linting
- Browser APIs: Web Crypto, `TextEncoder`, `TextDecoder`, Base64 helpers, and Clipboard API

## Architecture

The app shell in `src/app` provides tool navigation and the shared dashboard layout. Each utility lives in its own feature folder, with UI, styles, pure processing helpers, and unit tests kept together. Reusable controls are in `src/components`; the shared input-size policy is in `src/shared`.

All utility processing is client-side. There are no API calls or application-side persistence.

## Folder structure

```text
.
  index.html
  package.json         Dependencies and commands
  vite.config.ts
  tsconfig*.json       TypeScript configuration
  .oxlintrc.json
  src/
    app/               Dashboard, tool navigation, app tests
    components/        Button, Card, TextArea, CopyButton
    features/
      base64/          Base64 UI, UTF-8 helpers, tests
      json/            JSON UI, formatting/validation helpers, tests
      jwt/             JWT UI, decoder helpers, tests
      uuid/            UUID UI, generation helpers, tests
    shared/            Shared input limits
    index.css          Global theme and base styles
    main.tsx           Application entry point
```

## Installation

Install a current Node.js version compatible with Vite 8, then from the project directory run:

```sh
npm install
```

## Development

```sh
npm run dev
```

Vite prints the local development URL after starting.

## Testing and checks

```sh
npm test              # Run the Vitest suite once
npm run typecheck     # Run TypeScript project checks
npm run lint          # Run Oxlint
```

The project is configured for Oxlint, not ESLint.

## Production build

```sh
npm run build
npm run preview       # Preview the generated production build
```

The build runs TypeScript project checks and creates the static site in `dist/`. Deploy that directory to a static host.

## Technical limitations

- JSON, JWT, and Base64 inputs are limited to **1 MiB of UTF-8 text**. Processing is synchronous on the main thread.
- JWT decoding does not verify signatures or establish token authenticity. Treat decoded claims as untrusted.
- Base64 decoding is for UTF-8 text, not arbitrary binary data; invalid UTF-8 is reported as an error.
- UUID batches are limited to 1-100 values and require browser support for `crypto.randomUUID()` in a secure context.
- Copy actions depend on browser clipboard permissions and may be unavailable in some contexts.

## Security and privacy

The app does not send input to a backend or persist it in application storage. JWTs are only decoded locally; they are not authenticated or verified. Copying a result writes it to the system clipboard, which may be managed or synchronized by the operating system.
