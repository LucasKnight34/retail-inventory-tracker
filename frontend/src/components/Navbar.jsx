import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../App';
import './Navbar.css';

function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="navbar-brand">Inventory Tracker</Link>
        <div className="navbar-links">
          {user && (
            <>
              <Link to="/">Dashboard</Link>
              <Link to="/products">Products</Link>
            </>
          )}
        </div>
        <div className="navbar-auth">
          {user ? (
            <>
              <span className="navbar-email">{user.email}</span>
              <button className="btn-logout" onClick={handleLogout}>Logout</button>
            </>
          ) : (
            <>
              <Link to="/login">Login</Link>
              <Link to="/register">Register</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
