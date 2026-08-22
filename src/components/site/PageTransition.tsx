import { useRouterState } from "@tanstack/react-router";
import type { ReactNode } from "react";

/**
 * Screen-to-screen transition. Re-keying on pathname restarts the CSS
 * animation, giving each navigation the short fade-and-rise a native app uses
 * instead of an instant swap. Motion is disabled for reduce-motion users by
 * the stylesheet.
 */
export function PageTransition({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (
    <div key={pathname} className={`app-page-transition ${className ?? ""}`}>
      {children}
    </div>
  );
}
