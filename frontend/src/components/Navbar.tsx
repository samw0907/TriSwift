import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import '../styles/navbar.css';

const Navbar: React.FC = () => {
  const auth = useContext(AuthContext);
  const navigate = useNavigate();

  if (!auth) return null;

  const handleLogout = () => {
    auth.logoutUser();
    navigate("/");
  };

  return (
    <nav className="navbar-blue">
      <div className="navbar-left">
        <Link to="/home" className="nav-link">Home</Link>
        <Link to="/dashboard" className="nav-link">Dashboard</Link>
        <Link to="/records" className="nav-link">Personal Records</Link>
        <Link to="/paceCalculator" className="nav-link">Pace Calculator</Link>
      </div>
      <div className="navbar-right">
        {!auth.isAuthenticated ? (
          <>
            <Link to="/login" className="btn nav-btn login-btn">Login</Link>
            <Link to="/signup" className="btn nav-btn signup-btn">Signup</Link>
          </>
        ) : (
          <button onClick={handleLogout} className="btn nav-btn logout-btn">Logout</button>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
