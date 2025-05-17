# OrangePad: Prompt Management App (v0.5.0)

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

## Key Features (v0.5.0)
*   **Prompt Management:** Create, read, update, and delete prompts.
*   **AI-Powered Enhancements:**
    *   Automatic title generation for new/edited prompts.
    *   Automatic tag generation for new/edited prompts.
    *   AI tasks run in the background, allowing immediate UI updates with placeholders.
*   **Persistence:** Prompts are saved to the browser's local storage using the `useLocalStorage` hook.
*   **Organization & Discovery:**
    *   Sortable prompt list: by creation date, title, use count (`Most Used`), or last copied date (`Recently Used`).
    *   Filterable prompt list by tags, including a dedicated "🍊 Favorites" filter.
*   **User Experience Features:**
    *   Favorite ("Oranging") prompts with 🍊 emoji, with favorited items prioritized in display.
    *   Duplicate existing prompts.
    *   Drag & drop text to create new prompts.
    *   Click prompt title to edit.
    *   Individual tag renaming and removal per prompt via a popover interface.
    *   Responsive tile view for displaying prompts.
    *   Toasts for user feedback on actions.
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
    Create a `.env` file in the root directory. While no specific variables are strictly required for basic local functionality with Genkit emulators, you might need to add API keys if connecting to live Google AI services:
    ```env
    # Example for Google AI Studio API Key (if not using emulators)
    # GOOGLE_API_KEY=YOUR_GOOGLE_API_KEY
    ```
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

## AI Flow Development
*   Genkit flows are defined in files within `src/ai/flows/`.
*   Input and output Zod schemas for these flows are located in `src/ai/schemas/`. This separation ensures that server-only Zod objects are not imported into client components, avoiding Next.js build errors.
*   Flows are registered with Genkit by importing them for their side effects in `src/ai/dev.ts`.
*   The global Genkit instance `ai` is configured in `src/ai/genkit.ts`.

## Styling
*   The application uses Tailwind CSS for utility-first styling.
*   ShadCN UI components provide a base set of styled components.
*   The overall theme ("OrangePad Theme") is defined with CSS HSL variables in `src/app/globals.css`. This includes light and dark mode support. Refer to `STYLE_GUIDE.md` for details.
*   The `cn` utility from `src/lib/utils.ts` is used for conditionally applying Tailwind classes.

## Testing
This project includes foundational unit and integration test files located alongside their respective components/modules (e.g., `*.test.ts`, `*.test.tsx`).
*   Unit tests focus on individual functions and components (e.g., `src/lib/sortPromptsUtility.test.ts`, `src/hooks/useLocalStorage.test.ts`).
*   Integration tests cover interactions between components and core user flows (e.g., `src/app/page.integration.test.tsx`).

**To run tests:**
1.  **Install testing dependencies:**
    ```bash
    npm install --save-dev jest @types/jest @testing-library/react @testing-library/jest-dom ts-jest jest-environment-jsdom @testing-library/user-event
    ```
2.  **Configure Jest:** Create a `jest.config.js` file in the project root:
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
    // You can add other global setup here
    ```
3.  **Add test script to `package.json`:**
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
    # or
    npm run test:watch
    ```
The provided test files mock Genkit AI flows and `localStorage` for predictable testing.

## Code Quality
*   **TypeScript:** Used throughout the project for type safety.
*   **ESLint & Prettier:** (Assumed standard setup for Next.js projects). Ensure these are configured and run to maintain code consistency.
    ```bash
    npm run lint
    # npm run format (if a format script is added to package.json)
    ```

---

This README reflects the current state (v0.5.0) of OrangePad, including its features, structure, and how to get started with development and testing.