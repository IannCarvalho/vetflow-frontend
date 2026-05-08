import { Navigate } from 'react-router-dom';

import { useAuth } from 'src/contexts/auth-context';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/sign-in" replace />;
  }

  return children;
}
