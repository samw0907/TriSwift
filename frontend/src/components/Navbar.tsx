import React, { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import '../styles/navbar.css';

const Navbar: React.FC = () => {
  const auth = useContext(AuthContext);
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  if (!auth) return null;

  const handleLogout = () => {
    auth.logoutUser();
    navigate('/');
    setMenuOpen(false);
  };

  const toggleMenu = () => setMenuOpen(!menuOpen);

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <span className="navbar-brand">
          <span className="tri-text">Tri</span>
          <span className="swift-text">Swift</span>
        </span>

        <button
          className={`hamburger ${menuOpen ? 'active' : ''}`}
          onClick={toggleMenu}
        >
          ☰
        </button>

        <div className={`nav-menu ${menuOpen ? 'open' : ''}`}>
          <Link to="/home" onClick={() => setMenuOpen(false)}>Home</Link>
          <Link to="/dashboard" onClick={() => setMenuOpen(false)}>Dashboard</Link>
          <Link to="/records" onClick={() => setMenuOpen(false)}>Personal Records</Link>
          <Link to="/paceCalculator" onClick={() => setMenuOpen(false)}>Pace Calculator</Link>

          {!auth.isAuthenticated ? (
            <>
              <Link to="/login" className="nav-btn" onClick={() => setMenuOpen(false)}>Login</Link>
              <Link to="/signup" className="nav-btn" onClick={() => setMenuOpen(false)}>Signup</Link>
            </>
          ) : (
            <button onClick={handleLogout} className="logout-btn">Logout</button>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
