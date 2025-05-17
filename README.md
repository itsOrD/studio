
# OrangePad: Prompt Management App (v0.5.1)

## Overview
OrangePad is a Next.js web application designed for users to create, store, organize, and retrieve text-based prompts. It features AI-powered title and tag generation, local storage persistence, and a user-friendly interface built with ShadCN UI and Tailwind CSS. The application is themed with an orange-centric palette, providing a "zesty" user experience.

## Tech Stack
*   **Framework:** Next.js 15 (App Router, Server Components)
*   **Language:** TypeScript
*   **UI Library:** ShadCN UI (Radix UI + Tailwind CSS)
*   **Styling:** Tailwind CSS (with CSS variables for theming in `src/app/globals.css`)
*   **AI Integration:** Genkit (using `googleai/gemini-2.0-flash` model via `src/ai/genkit.ts`)
*   **State Management:** React Hooks (`useState`, `useEffect`, `useCallback`, `useMemo`), `useLocalStorage` custom hook.
*   **Icons:** `lucide-react`, 🍊 emoji for favorites.
*   **Fonts:** Geist Sans, Geist Mono

## Project Structure
*   `src/app/`: Main application pages (e.g., `page.tsx`, `layout.tsx`, `globals.css`).
*   `src/components/`: Reusable React components (e.g., `AppHeader.tsx`, `PromptItem.tsx`, `EditPromptDialog.tsx`).
    *   `src/components/ui/`: Standard ShadCN UI components.
*   `src/ai/`: Genkit related files.
    *   `src/ai/genkit.ts`: Genkit initialization and configuration.
    *   `src/ai/flows/`: Genkit flows for AI tasks (e.g., `generatePromptTitleFlow.ts`, `generatePromptTagsFlow.ts`).
    *   `src/ai/schemas/`: Zod schemas defining the input/output types for AI flows.
*   `src/hooks/`: Custom React hooks (e.g., `useLocalStorage.ts`, `useToast.ts`, `use-mobile.ts`).
*   `src/lib/`: Utility functions (e.g., `utils.ts` for `cn`, `sortPromptsUtility.ts` for sorting logic).
*   `src/types/`: TypeScript type definitions (e.g., `index.ts` for `Prompt` type).
*   `tests/`: Contains unit and integration test files (e.g., `*.test.ts`, `*.test.tsx`). *(This is a common convention, though current stubs are co-located)*

## Key Features (v0.5.1)
*   **Prompt Management:** Create, read, update, and delete prompts.
*   **AI-Powered Enhancements:**
    *   Automatic title generation for new/edited prompts (background processed).
    *   Automatic tag generation for new/edited prompts (background processed).
    *   Defensive prompt engineering in AI flows to mitigate prompt injection.
    *   Input length validation for AI flows to prevent abuse.
*   **Persistence:** Prompts are saved to the browser's local storage using the `useLocalStorage` hook.
*   **Organization & Discovery:**
    *   Sortable prompt list: by creation date, title, use count (`Most Used`), or last copied date (`Recently Used`).
    *   Filterable prompt list by tags, including a dedicated "🍊 Favorites" filter.
*   **User Experience Features:**
    *   Favorite ("Oranging") prompts with 🍊 emoji, with favorited items prioritized in display.
    *   Duplicate existing prompts.
    *   Drag & drop text to create new prompts (with length validation).
    *   Click prompt title to edit.
    *   Individual tag renaming and removal per prompt via a popover interface.
    *   Responsive tile view for displaying prompts.
    *   Toasts for user feedback on actions.
    *   Light/Dark/System theme toggle.
*   **Usage Tracking:**
    *   `useCount`: Tracks how many times a prompt is copied.
    *   `lastCopiedAt`: Timestamp of the last copy action, displayed in copy button tooltips.

## Getting Started

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd <repository-name>
    ```
2.  **Install dependencies:**
    ```bash
    npm install
    ```
3.  **Environment Variables:**
    Create a `.env` file in the root directory. For Genkit AI features to work with live Google AI services, you'll need an API key:
    ```env
    # Example for Google AI Studio API Key
    GOOGLE_API_KEY=YOUR_GOOGLE_API_KEY
    ```
    **Security Note:** Never commit your `.env` file or API keys to version control.

4.  **Run the Next.js development server:**
    ```bash
    npm run dev
    ```
    The application will typically be available at `http://localhost:9002`.

5.  **Run the Genkit development server:**
    Open a new terminal window/tab and run:
    ```bash
    npm run genkit:dev
    ```
    Alternatively, for automatic reloading of Genkit flows on change:
    ```bash
    npm run genkit:watch
    ```
    This server makes the AI flows (title/tag generation) available to the Next.js application.

## Security Considerations (v0.5.1)

*   **API Key Management:**
    *   The `GOOGLE_API_KEY` used for Genkit (Gemini) should be treated as a secret.
    *   Store it in the `.env` file locally and use environment variables in any production deployment environment.
    *   **Never commit your API key to your Git repository.** Ensure `.env` is listed in your `.gitignore` file.
*   **AI Flow Abuse Prevention:**
    *   **Current Measures:**
        *   **Input Length Validation:** The `generatePromptTitleFlow` and `generatePromptTagsFlow` implement maximum character limits for input text (5000 for titles, 10000 for tags) to prevent excessively long (and potentially costly or abusive) requests to the AI model.
        *   **Defensive Prompt Engineering:** The system prompts for AI flows include instructions to the LLM to focus on its specific task (title/tag generation) and disregard user input that attempts to override these instructions or change its role. This is a first line of defense against prompt injection.
    *   **Recommendations for Production:**
        *   **Server-Side Rate Limiting:** For any publicly accessible version of this app, implementing robust server-side rate limiting on the AI flow endpoints is crucial. This could be IP-based or user-based (if authentication is added). Tools like API gateways, reverse proxies (Nginx, Caddy), or custom middleware can help.
        *   **Web Application Firewall (WAF):** A WAF can help filter malicious requests before they reach the application or AI services.
*   **Prompt Injection:**
    *   While defensive prompt engineering and input length limits are in place, prompt injection is an evolving challenge.
    *   Avoid directly concatenating untrusted user input into sensitive parts of prompts if more complex AI interactions are built in the future.
    *   Continuously monitor and refine prompt instructions if vulnerabilities are discovered.
*   **Cross-Site Scripting (XSS):**
    *   OrangePad uses React, which inherently escapes JSX content, providing significant protection against XSS when rendering user-supplied data (like prompt text, titles, tags).
    *   ShadCN UI components are generally built with security in mind.
    *   **Avoid `dangerouslySetInnerHTML`:** Never use this React feature with un-sanitized user input.
    *   Content Security Policy (CSP): For enhanced protection in production, consider implementing a strong CSP header.
*   **Data Privacy & Local Storage:**
    *   All prompt data is currently stored in the user's browser `localStorage`. This data is client-side and not transmitted to any server *by OrangePad itself* (except when explicitly sent to AI flows for processing).
    *   If the site hosting OrangePad were compromised by XSS, an attacker could potentially access `localStorage` data.
*   **Dependency Management:**
    *   Regularly update dependencies to their latest stable versions to patch known vulnerabilities.
    *   Use tools like `npm audit` or integrate services like Snyk/Dependabot to scan for vulnerabilities in your project's dependencies.
    ```bash
    npm audit
    npm audit fix # To attempt automatic fixes
    ```

## AI Flow Development
*   Genkit flows are defined in files within `src/ai/flows/`.
*   Input and output Zod schemas for these flows are located in `src/ai/schemas/`. This separation ensures that server-only Zod objects are not imported into client components.
*   Flows are registered with Genkit by importing them for their side effects in `src/ai/dev.ts`.
*   The global Genkit instance `ai` is configured in `src/ai/genkit.ts`.

## Styling
*   The application uses Tailwind CSS for utility-first styling.
*   ShadCN UI components provide a base set of styled components.
*   The overall theme ("OrangePad Theme") is defined with CSS HSL variables in `src/app/globals.css`. This includes light and dark mode support. Refer to `STYLE_GUIDE.md` for details.
*   The `cn` utility from `src/lib/utils.ts` is used for conditionally applying Tailwind classes.

## Testing
This project includes foundational unit and integration test files.
*   Unit tests (e.g., `src/lib/sortPromptsUtility.test.ts`, `src/hooks/useLocalStorage.test.ts`, `src/ai/flows/*.test.ts`) focus on individual functions and components.
*   Integration tests (e.g., `src/app/page.integration.test.tsx`) cover interactions between components and core user flows.

**To run tests:**
1.  **Install testing dependencies (if not already installed):**
    It's recommended to have these in your `devDependencies` in `package.json`. If they were not included in the initial setup or you're setting up a fresh clone:
    ```bash
    npm install --save-dev jest @types/jest @testing-library/react @testing-library/jest-dom ts-jest jest-environment-jsdom @testing-library/user-event
    ```
2.  **Configure Jest:** Ensure you have a `jest.config.js` file in the project root:
    ```javascript
    // jest.config.js
    const nextJest = require('next/jest')

    const createJestConfig = nextJest({
      dir: './', // Path to your Next.js app
    })
    
    // Add any custom config to be passed to Jest
    const customJestConfig = {
      setupFilesAfterEnv: ['<rootDir>/jest.setup.js'], // if you have a setup file
      testEnvironment: 'jest-environment-jsdom',
      moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/src/$1',
      },
      // Add more Jest options here if needed
    }
    
    module.exports = createJestConfig(customJestConfig)
    ```
    And a `jest.setup.js` (if you created one in the config):
    ```javascript
    // jest.setup.js
    import '@testing-library/jest-dom' 
    // You can add other global setup here, e.g., mocking localStorage if not done per-test
    ```
3.  **Add/Ensure test script in `package.json`:**
    ```json
    "scripts": {
      // ... other scripts
      "test": "jest",
      "test:watch": "jest --watch"
    },
    ```
4.  **Run tests:**
    ```bash
    npm test
    # or for interactive mode
    npm run test:watch
    ```
The provided test files mock Genkit AI flows and `localStorage` (where necessary) for predictable testing. You are encouraged to expand the test suite to cover more edge cases and interactions.

## Code Quality
*   **TypeScript:** Used throughout the project for type safety.
*   **ESLint & Prettier:** (Assumed standard setup for Next.js projects). Ensure these are configured and run to maintain code consistency.
    ```bash
    npm run lint
    # npm run format (if a format script is added to package.json)
    ```

---

This README reflects the state of OrangePad v0.5.1, including its features, structure, security considerations, and how to get started with development and testing.
