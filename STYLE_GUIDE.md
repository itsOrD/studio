
# OrangePad: Style Guide (v0.5.0)

## 1. Overview
This guide outlines the visual and interaction design principles for OrangePad, ensuring a consistent and delightful user experience. OrangePad aims to be friendly, efficient, and visually appealing with a distinct "orange" theme that evokes creativity and warmth.

## 2. Color Palette (OrangePad Theme)
The color palette is defined in `src/app/globals.css` using HSL CSS variables, supporting both light and dark modes.

### Light Mode:
*   **Background (`--background`):** `30 100% 97%` (Very Light Peach) - Main app background.
*   **Foreground (`--foreground`):** `25 50% 25%` (Dark Brown) - Primary text color.
*   **Card Background (`--card`):** `30 80% 99%` (Slightly off-white peach) - Background for prompt cards and dialogs.
*   **Primary (`--primary`):** `24 100% 55%` (Deep Pumpkin Orange) - Used for main interactive elements (buttons, active states, key titles, filled favorite icon).
*   **Primary Foreground (`--primary-foreground`):** `20 100% 97%` (Light warm color) - Text on primary-colored backgrounds.
*   **Accent (`--accent`):** `39 100% 60%` (Gold/Yellow-Orange) - Used for hover states, secondary highlights, borders on hover.
*   **Accent Foreground (`--accent-foreground`):** `25 70% 15%` (Dark brown) - Text on accent-colored backgrounds.
*   **Muted (`--muted`):** `30 50% 92%` (Muted Peach) - For less prominent UI elements, placeholder text.
*   **Muted Foreground (`--muted-foreground`):** `25 30% 45%` (Medium Brown) - Text for muted elements.
*   **Border (`--border`):** `30 50% 88%` (Peach-tinted Border).
*   **Input (`--input`):** `30 60% 94%` (Slightly off-background peach for inputs).
*   **Ring (`--ring`):** `24 100% 65%` (Brighter Orange for focus rings).
*   **Important Action (`--important-action`):** Same as `var(--primary)`. Used by `btn-important-action` class.
*   **Destructive (`--destructive`):** `0 84% 60%` (Red) - For delete actions.

*(Refer to `globals.css` for the full list, including chart colors and dark mode equivalents.)*

## 3. Typography
*   **Primary Font:** Geist Sans (variable `--font-geist-sans`) - Used for all body text, UI elements, and titles. Sourced from `next/font/google`.
*   **Monospace Font:** Geist Mono (variable `--font-geist-mono`) - Available if needed for code or fixed-width text (currently not extensively used).
*   **Sizing & Weights:** Follow ShadCN UI defaults, adjusted via Tailwind CSS utility classes. Titles are generally bolder and larger than body text.

## 4. Iconography
*   **Library:** `lucide-react` is the primary source for icons.
*   **Consistency:** Icons should be consistently sized, typically `w-4 h-4` or `w-5 h-5` within buttons or action areas.
*   **Color:** Icons generally inherit text color or use specific theme colors (e.g., `text-primary`, `text-destructive`).
*   **Favorite Icon:** A custom SVG icon resembling an orange fruit. It is filled with `hsl(var(--primary))` when a prompt is favorited.
*   **Clarity:** Icons should clearly communicate their action (e.g., <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"></rect><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"></path></svg> for copy, <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4Z"></path></svg> for edit).

## 5. Components
*   **Base:** Utilize components from ShadCN UI (`src/components/ui/`) whenever possible.
*   **Custom:** Custom components (e.g., `PromptItem.tsx`, `EditPromptDialog.tsx` in `src/components/`) should align with ShadCN's styling principles and Tailwind CSS usage.
*   **Buttons:**
    *   Use variants (`default`, `destructive`, `outline`, `ghost`) from the `Button` component.
    *   The main "Save Prompt" button uses the `btn-important-action` class for distinct styling with `hsl(var(--important-action))`.
    *   Icon buttons are frequently used for actions on prompt cards.
*   **Cards (`PromptItem.tsx`):**
    *   `rounded-lg`, `border`, `bg-card`, `shadow-md`.
    *   Enhanced hover effects: `hover:shadow-xl hover:scale-[1.02] hover:border-accent/50`.
*   **Badges:**
    *   Used for displaying tags on prompts. `variant="secondary"` is typical.
    *   Clickable to open a popover for tag management.
*   **Dialogs & Alerts (`EditPromptDialog`, `AlertDialog`):**
    *   Standard ShadCN styling. Used for editing prompts and confirming deletions/renames.
*   **Tooltips & Popovers:**
    *   Provide contextual information (e.g., last copied date on copy button tooltips).
    *   Popovers are used for tag management (rename/remove actions).
*   **Input Fields (`Textarea`, `Input`, `Select`):**
    *   Styled with `border-input`, `bg-input` (or `bg-background`), and focus rings (`focus:ring-primary` or `focus-visible:ring-ring`).
*   **Tabs:** Used for filtering prompts by tags.

## 6. Layout & Spacing
*   **Responsiveness:** The application should be responsive across common screen sizes. The prompt list uses a grid that adjusts from 1 to 3 columns.
*   **Spacing:** Use Tailwind CSS margin (`m-`, `mx-`, `my-`) and padding (`p-`, `px-`, `py-`) utility classes. Maintain consistent spacing (e.g., `space-y-8` for main sections, `gap-4` for grid items).
*   **Scrollability:** `ScrollArea` is used for the list of prompts to manage overflow.
*   **Overall Structure:** `AppHeader` at the top, main content area with prompt creation and prompt list, and a footer.

## 7. Tone & Language
*   **Friendly & Engaging:** The app's personality is approachable and slightly playful (e.g., "zesty twist," "OrangePad," "Oranged" prompts).
*   **Clear & Concise:** UI text, labels, and instructions should be easy to understand and action-oriented.
*   **Feedback:** Toasts provide clear feedback for user actions (save, delete, copy, errors). Loading indicators (`Loader2` icon) are used for AI background tasks.

## 8. Interactivity & Feedback
*   **Hover States:** Most interactive elements should have clear hover states (e.g., background color changes, opacity changes, icon highlights). Refer to individual component styles.
*   **Active States:** Buttons have an `active:scale-95` transform for press feedback.
*   **Focus States:** Standard ShadCN focus rings (`ring-ring`) should be visible for keyboard navigation.
*   **Disabled States:** Elements should appear disabled (`opacity-50`, `pointer-events-none`) when not applicable.

## 9. Accessibility (A11y)
*   **ARIA Attributes:** Use ARIA attributes where appropriate to enhance accessibility for screen readers (e.g., `aria-label`).
*   **Color Contrast:** The theme aims for good contrast, but this should be periodically checked.
*   **Keyboard Navigation:** Ensure all interactive elements are reachable and operable via keyboard. ShadCN components generally provide good keyboard support.
*   **Semantic HTML:** Use appropriate HTML tags for structure and meaning.

---

This style guide should help maintain a cohesive and polished look and feel for OrangePad as it evolves.
    