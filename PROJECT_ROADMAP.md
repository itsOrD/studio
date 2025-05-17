
# OrangePad: Project Roadmap, TODOs, and Improvements (Post v0.5.1)

This document outlines potential future work, improvements, and milestones for the OrangePad application.

## Current Status (v0.5.1)
OrangePad is a functional local-first prompt management tool with AI-powered title and tag generation (with background processing, input validation, and basic prompt injection defenses). It features sorting, filtering, favorites (with an 🍊 icon), duplication, and a responsive UI with Light/Dark modes. It uses Next.js, ShadCN UI, Tailwind CSS, and Genkit. Data is persisted via `localStorage`. Basic test stubs for core logic and components have been created. Security considerations have been documented.

## Immediate TODOs & Bug Fixes (for v0.5.x)

*   **Full Test Suite Execution & Expansion**:
    *   User needs to set up the Jest + React Testing Library environment as per `README.md`.
    *   Execute all provided test stubs (`*.test.ts`, `*.test.tsx`).
    *   Expand test coverage for `HomePage.tsx` interactions (editing, tag management, duplication, all sort/filter combinations, drag & drop edge cases, input length limits).
    *   Test edge cases for AI flows (e.g., very long text if server-side limits are different, non-English text if applicable for title/tag generation).
    *   Manual QA across different browsers (Chrome, Firefox, Safari, Edge) for both light and dark modes.
*   **Accessibility (A11y) Review**:
    *   Perform a detailed accessibility audit (keyboard navigation, ARIA attributes, color contrast under various themes/modes).
    *   Ensure all interactive elements are fully keyboard accessible and have proper focus states.
    *   Add `aria-live` regions for toast messages if not already handled by ShadCN.
*   **Error Handling**:
    *   Review error handling for AI flows: more specific user-facing error messages or recovery paths for scenarios like API quota limits.
    *   Consider global error boundaries in React for unexpected client-side errors.
*   **UI Polish**:
    *   Review tooltip and popover placements on smaller screens or near viewport edges to ensure they are never cut off (ShadCN generally handles this well, but verify).
    *   Ensure consistent loading states across the app, especially for AI interactions.
    *   Minor style adjustments for pixel-perfect alignment if any issues are found.
*   **Code Cleanup**:
    *   Address any `TODO` comments left in the code.
    *   Refine any complex conditional rendering in `HomePage.tsx` if it impacts readability.

## Milestones

### Milestone 1: Polish & Core Enhancements (v0.6.0)

*   **Full Test Suite Implementation**: Achieve good test coverage (e.g., >70-80%) for components, utilities, and user flows. All existing tests passing.
*   **Advanced Accessibility**: Implement all findings from the A11y review. Ensure WCAG 2.1 AA compliance where feasible.
*   **Robust Error Management**: Implement comprehensive error boundaries and user feedback for API/AI failures (e.g., specific messages for input too long, API errors).
*   **View Prompt History (Basic)**:
    *   UI to view the `history` array stored in each prompt (read-only list of previous text versions and edit timestamps).
    *   No revert functionality yet, just viewing.
*   **Improved Drag & Drop UX**:
    *   More visual feedback during drag-over on the drop zone.
    *   Handle dropping multiple files or non-text content gracefully (e.g., toast message indicating only text is supported).
*   **Performance Check**: Profile application with a large number of prompts (e.g., 100+) and optimize if necessary (virtualization for prompt list, memoization).

### Milestone 2: Advanced Features (v0.7.0 - v0.8.0)

*   **Basic Prompt Version Revert**: Allow users to revert a prompt's text to a selected version from its history.
*   **Global Tag Management**:
    *   A dedicated settings area or modal to view all unique tags used across all prompts.
    *   Ability to rename a tag globally (updates it on all prompts using it).
    *   Ability to delete a tag globally (removes it from all prompts using it).
    *   Ability to merge tags.
*   **Search Functionality**:
    *   Implement a search bar to filter prompts by keywords in their title or text content.
    *   Consider client-side search for `localStorage` or server-side if data moves to a backend.
*   **Bulk Actions**:
    *   Select multiple prompts.
    *   Actions: Delete selected, Add tag to selected, Remove tag from selected, Favorite/Unfavorite selected.
*   **User Settings/Preferences**:
    *   Allow users to set default sort order.
    *   Option to configure AI generation (e.g., disable auto-title/tag on save, set preferred number of tags).
    *   Option to configure max prompt history length.

### Milestone 3: "Pro" Features & Potential Backend (v0.9.0 - v1.0.0+)

*   **Implement Robust Server-Side Rate Limiting for AI Flows**: If deploying to a public environment, this is critical.
*   **Implement User Authentication**: (e.g., Firebase Auth, NextAuth.js)
    *   This would enable cloud sync and other personalized features.
*   **Import/Export Prompts**:
    *   Export all prompts to JSON or CSV.
    *   Import prompts from a JSON or CSV file.
*   **Optional Cloud Sync & Backup (if auth is added)**:
    *   Integrate with a backend service (e.g., Firebase Firestore) for optional user authenticated data sync across devices.
    *   Ensure the app remains fully functional offline with `localStorage` as the primary/fallback.
*   **Prompt Sharing (if cloud sync is added)**:
    *   Ability to share individual prompts or sets of prompts with other users.
*   **Advanced AI Features**:
    *   AI to suggest improvements to existing prompts.
    *   AI to generate prompt variations.
    *   Use Genkit tools for more complex AI interactions if needed (e.g., AI browsing a URL to generate a prompt).
*   **Extensibility/Plugins (Long-term)**:
    *   Consider an architecture that might allow for community plugins or integrations.

## General Improvements (Ongoing)

*   **Code Refactoring**: Continuously refactor for clarity, performance, and maintainability as new features are added.
*   **Dependency Updates**: Keep dependencies up-to-date and address any security vulnerabilities using `npm audit` or similar tools.
*   **Documentation**: Keep `README.md`, `STYLE_GUIDE.md`, and `USER_QUICK_START_GUIDE.md` updated with new features and changes. Add inline code comments where complex logic needs explanation.
*   **Mobile Responsiveness**: Continuously test and refine the UI for various screen sizes.
*   **Internationalization (i18n)**: If targeting a broader audience, plan for localization.
*   **Advanced Input Sanitization Research**: Investigate more sophisticated client/server-side input sanitization techniques if prompt injection remains a concern with more advanced AI features.

---
This roadmap provides a structured approach to evolving OrangePad, focusing on iterative improvements and feature additions.
Priorities can be adjusted based on user feedback and development capacity.
