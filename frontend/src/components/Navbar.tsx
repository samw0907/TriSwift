import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../index.css'
import '../styles/navbar.css'

const Navbar = () => {
  const token = localStorage.getItem('token');
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="nav-left">
      <Link to="/">Home</Link>
      </div>
      <div className="nav-links">
      <Link to="/dashboard">Dashboard</Link> |  
      <Link to="/records">Personal Records</Link> |  
      <Link to="/paceCalculator">Pace Calculator</Link>
      </div>
      <div className="nav-auth">
      {!token ? (
        <>
          <Link to="/login">Login</Link> |  
          <Link to="/signup">Signup</Link>
        </>
      ) : (
        <button onClick={handleLogout} style={{ marginLeft: '10px' }}>Logout</button>
      )}
      </div>
    </nav>
  );
};

export default Navbar;
