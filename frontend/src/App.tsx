import { useEffect } from "react";
import { useLocation } from "react-router-dom";

import { useAuth } from "./hooks/use-auth";
import AppRoutes from "./routes";
import { isAuthRoute } from "./routes/routes";
import Logo from "./components/logo";
import { Spinner } from "./components/ui/spinner";

/**
 * Root Application Component
 * 
 * Acts as the top-level boundary for the React application. It handles initial
 * session validation by checking the user's authentication status with the backend
 * before rendering the main application routes.
 * 
 * Displays a fullscreen loading splash screen while the initial session check is pending.
 */
function App() {
  const { pathname } = useLocation();
  const { user, isAuthStatus, isAuthStatusLoading } = useAuth();

  // Determine if the current URL belongs to public authentication flows (e.g., /login, /register)
  const isAuth = isAuthRoute(pathname);

  /**
   * Session Validation Effect
   * 
   * Triggers the global session check (`isAuthStatus`) when the app mounts, 
   * provided the user is not currently navigating an authentication route.
   */
  useEffect(() => {
    // Skip session validation API call if the user is explicitly on a public auth page
    if (isAuth) return;

    isAuthStatus();
  }, [isAuthStatus, isAuth]);

  /**
   * Splash Screen State
   * 
   * Prevents premature rendering of protected routes by showing a loading screen
   * while the backend validates the session cookie/token on initial app load.
   */
  if (isAuthStatusLoading && !user) {
    return (
      <div className="flex h-svh flex-col items-center justify-center gap-6 bg-background">
        <Logo imgClass="size-20" showText={false} />
        <Spinner className="size-6" />
      </div>
    );
  }

  // Render the application router tree once authentication state is resolved
  return <AppRoutes />;
}

export default App;