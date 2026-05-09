import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/store/auth';
import type { UserRole } from '@/types';

interface Props {
  /** Required role(s). If omitted, any authenticated user passes. */
  roles?: UserRole[];
}

export function ProtectedRoute({ roles }: Props) {
  const user = useAuth(s => s.user);
  const location = useLocation();

  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/home" replace />;
  return <Outlet />;
}
