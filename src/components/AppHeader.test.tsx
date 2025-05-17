
import { render, screen } from '@testing-library/react';
import { AppHeader } from './AppHeader';

describe('AppHeader', () => {
  it('renders the app title "OrangePad"', () => {
    render(<AppHeader />);
    expect(screen.getByText('OrangePad')).toBeInTheDocument();
  });

  it('renders the tagline', () => {
    render(<AppHeader />);
    expect(screen.getByText('Craft, store, and manage your prompts with a zesty twist!')).toBeInTheDocument();
  });

  it('renders the NotebookPen icon', () => {
    render(<AppHeader />);
    // Check for the presence of an SVG, assuming lucide-react icons render as SVGs.
    // A more specific test might involve checking for a class or title if the icon component provides one.
    const icon = screen.getByRole('img', { hidden: true }); // Lucide icons might not have an explicit role, adjust if needed or check for svg presence
    expect(icon).toBeInTheDocument();
  });
});

    