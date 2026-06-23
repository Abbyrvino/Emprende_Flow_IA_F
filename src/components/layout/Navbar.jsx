import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useTheme } from '../../context/ThemeContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { totalItems } = useCart();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to="/home" className="navbar-logo">
          <span className="logo-icon">⚡</span>
          <span>EMPRENDE<span className="logo-accent">FLOW</span></span>
        </Link>
      </div>

      <div className="navbar-links">
        <Link to="/home" className="nav-link">Marketplace</Link>
        {user?.rol === 'emprendedor' && (
          <Link to="/dashboard/inventario" className="nav-link">Dashboard</Link>
        )}
        {user?.rol === 'cliente' && (
          <Link to="/setup-negocio" className="nav-link nav-link--highlight">
            Ser Emprendedor
          </Link>
        )}
      </div>

      <div className="navbar-actions">
        <Link to="/carrito" className="cart-btn" aria-label="Carrito">
          🛒
          {totalItems > 0 && <span className="cart-badge">{totalItems}</span>}
        </Link>

        <div className="user-menu">
          <span className="user-name">{user?.nombre?.split(' ')[0]}</span>
          <button
            className="btn btn--ghost btn--sm theme-toggle"
            onClick={toggleTheme}
            aria-label="Cambiar tema"
            title={isDark ? 'Modo día' : 'Modo noche'}
          >
            {isDark ? '☀️' : '🌙'}
          </button>
          <button className="btn btn--ghost btn--sm" onClick={handleLogout}>
            Salir
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

