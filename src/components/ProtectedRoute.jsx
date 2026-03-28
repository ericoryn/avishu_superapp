import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../stores/useAuthStore';
import { KNOWN_ROLE_SLUGS, normalizeUserRole } from '../constants';

const ProtectedRoute = ({ children, allowedRole }) => {
  const { user } = useAuthStore();

  if (!user) {
    return <Navigate to="/" replace />;
  }

  if (allowedRole && user.role !== allowedRole) {
    const target = normalizeUserRole(user.role);
    if (KNOWN_ROLE_SLUGS.includes(target)) {
      return <Navigate to={`/${target}`} replace />;
    }
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
