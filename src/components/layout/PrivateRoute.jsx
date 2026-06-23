import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

/**
 * Protege rutas que requieren autenticación.
 * Si requiereEmprendedor=true, también verifica el rol.
 */
const PrivateRoute = ({ children, requiereEmprendedor = false }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner" />
        <p>Cargando...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requiereEmprendedor && user.rol !== 'emprendedor') {
    return <Navigate to="/home" replace />;
  }

  return children;
};

export default PrivateRoute;
