
"use client";
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { LogIn, LogOut, RefreshCw } from 'lucide-react';

// Placeholder Google Icon SVG
const GoogleIcon = () => (
  <svg className="w-4 h-4 mr-2 shrink-0" viewBox="0 0 24 24" fill="currentColor">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
  </svg>
);

export function AuthSection() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true); // Ensures this runs only on client after mount
  }, []);

  const handleSignIn = () => {
    setIsLoggedIn(true);
    // NOTE: This is a UI placeholder. Actual Google Sign-In would require Google API client setup.
    alert("Placeholder: Google Sign-In initiated. This is a UI placeholder and not functional. No data will be synced.");
  };

  const handleSignOut = () => {
    setIsLoggedIn(false);
    // NOTE: This is a UI placeholder.
    alert("Placeholder: Sign Out initiated. This is a UI placeholder and not functional.");
  };

  const handleSyncToDrive = () => {
    // NOTE: This is a UI placeholder. Actual Google Drive sync is complex.
    alert("Placeholder: Sync to Google Drive initiated. This is a UI placeholder and not functional. No data will be synced.");
  };

  if (!hydrated) {
    return <div className="h-10"></div>; // Placeholder for SSR to avoid layout shift
  }

  return (
    <div className="flex flex-col sm:flex-row items-center justify-start gap-2 py-3 my-4 border-t border-b">
      {isLoggedIn ? (
        <>
          <Button variant="outline" onClick={handleSignOut} size="sm" className="w-full sm:w-auto">
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out (Placeholder)
          </Button>
          <Button onClick={handleSyncToDrive} size="sm" className="w-full sm:w-auto">
            <RefreshCw className="mr-2 h-4 w-4" />
            Sync to Drive (Placeholder)
          </Button>
          <span className="text-xs text-muted-foreground mt-2 sm:mt-0 sm:ml-2">
            Simulating signed-in state. No actual Google Drive connection.
          </span>
        </>
      ) : (
        <>
          <Button variant="outline" onClick={handleSignIn} size="sm" className="w-full sm:w-auto">
            <GoogleIcon />
            Sign in with Google (Placeholder)
          </Button>
           <span className="text-xs text-muted-foreground mt-2 sm:mt-0 sm:ml-2">
            Optional: Connect Google Drive (UI Placeholder).
          </span>
        </>
      )}
    </div>
  );
}
