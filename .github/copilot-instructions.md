
# Project Instructions

## Project overview
Build a standalone Developer Toolbox web application using React and TypeScript.
The application provides useful frontend developer utilities:
- JSON Formatter & Validator
- JWT Decoder
- UUID Generator
- Base64 Encoder / Decoder

The application must work entirely in the browser without a backend.

## Technology stack
- React 19
- TypeScript (strict mode)
- Vite
- CSS Modules or well-organized global CSS
- Lucide React for icons
- Vitest for unit tests

## Architecture
- Use functional React components and hooks.
- Keep components small and focused.
- Separate business logic from UI components.
- Keep utility functions pure whenever possible.
- Use feature-based folder structure.
- Avoid unnecessary abstractions.
- Avoid introducing additional dependencies without a clear reason.

## TypeScript
- Enable strict mode.
- Avoid using `any`.
- Prefer explicit types and interfaces.
- Use discriminated unions where appropriate.
- Properly type component props and callbacks.
- Handle null and undefined explicitly.

## React
- Follow React best practices.
- Avoid unnecessary useEffect.
- Do not mutate state directly.
- Use useMemo and useCallback only when justified.
- Keep state as close as possible to the components that need it.
- Use semantic HTML.

## UI and UX
- Create a modern, professional developer-tool interface.
- Use a dark theme.
- Use a consistent spacing and typography system.
- Use monospace fonts for code and data.
- Make the application responsive.
- Provide clear loading, success, empty and error states.
- Add accessible labels and keyboard support.
- Use ARIA attributes where appropriate.
- Provide visual feedback after copying data.

## Security and data handling
- All processing must happen locally in the browser.
- Never send user input to external services.
- Do not store JWT tokens or other potentially sensitive data.
- Clearly state that JWT decoding does not verify signatures.
- Validate user input before processing it.
- Handle malformed input without crashing the application.

## Testing
- Write unit tests for utility functions.
- Cover valid and invalid inputs.
- Test edge cases.
- Prefer testing business logic independently from React components.

## Code quality
- Write readable, maintainable code.
- Use descriptive variable and function names.
- Avoid duplicated logic.
- Avoid premature optimization.
- Do not leave TODO comments for unfinished core functionality.
- Do not silently swallow errors.

## Working agreement
- Before implementing a feature, inspect the existing project structure.
- Work incrementally, one feature at a time.
- Explain the proposed implementation before making significant architectural changes.
- Do not rewrite unrelated files.
- After implementation, run relevant tests and TypeScript checks.
- Report changed files, implemented functionality and any known limitations.
- Do not claim that tests passed unless they were actually executed.