# Development Log

## Repository

- Repository: [developer-toolbox](https://github.com/MichalSwircz/developer-toolbox)
- Local root: `C:\Workspace\dev-toolkit`
- Current branch: `master`, tracking `origin/master`
- Working tree: clean before this documentation change
- Tracked files: 49
- Visible Git history contains one commit: `1c243cf` (`initial project setup`, 2026-11-18). That single commit does not record the feature-by-feature development sequence below.

## Evidence note

The repository metadata above comes from the current Git remote, status, and commit history. The development sections summarize the verified project changes and development-task sequence; they do not assign unsupported dates to individual milestones.

## Project setup and architecture

- Initialized a Vite React and TypeScript application and enabled strict TypeScript checks.
- Added Lucide React, Vitest with jsdom, and Testing Library.
- Chose Oxlint instead of ESLint after the TypeScript ESLint tooling encountered a peer-dependency conflict with TypeScript 7.
- Organized the app into a shared dashboard shell, reusable UI components, and feature-specific folders. Kept each utility's core processing in separate functions with unit tests.
- Kept processing in the browser and did not add a backend, network integration, or application-side persistence.

## Feature implementation

1. Built the responsive dashboard, navigation, dark theme, and shared Button, Card, TextArea, and CopyButton components.
2. Added JSON formatting, minification, validation, configurable indentation, example data, and parsing errors.
3. Added local JWT header/payload decoding, NumericDate claim display, expiration status, and an explicit notice that signatures are not verified.
4. Added UUID v4 generation through `crypto.randomUUID()`, quantity validation, and individual and bulk copy actions.
5. Added UTF-8 Base64 encoding and decoding, Unicode support, input/output swapping, example data, and malformed-input handling.
6. Used the Lucide `Binary` icon consistently for Base64 in the sidebar and tool content.

## Testing and refinement

- Added utility tests for JSON, JWT, UUID, and Base64 behavior, plus application integration tests and CopyButton clipboard tests.
- Configured Vitest to run in jsdom. The current suite has 64 passing tests.
- Ran TypeScript checks, Oxlint, and the production build successfully.
- Used browser smoke checks to verify tool interactions and mobile layout behavior; the tested mobile viewport had no horizontal overflow.

## Code review changes

- Added a shared 1 MiB UTF-8 input limit for JSON, JWT, and Base64 processing, with user-facing guidance and errors.
- Tightened Base64/Base64URL padding-bit validation and guarded JWT JSON formatting against deeply nested input.
- Adjusted secondary text contrast, made clipboard errors visible, enabled clearing whitespace-only JSON/JWT input, and exposed breadcrumbs as a labeled navigation landmark.
- Added regression tests for the new validation, size limits, clipboard outcomes, and clear behavior.

## Documentation

The README documents the app, features, stack, architecture, commands, limitations, and privacy/security behavior. This log records the development sequence supported by project changes and task history; only the repository commit date is asserted.
