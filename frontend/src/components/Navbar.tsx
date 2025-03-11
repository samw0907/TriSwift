import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Navbar = () => {
  const token = localStorage.getItem('token');
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <nav style={{ padding: '10px', borderBottom: '1px solid #ccc' }}>
      <Link to="/">Home</Link> |  
      <Link to="/dashboard">Dashboard</Link> |  
      <Link to="/records">Personal Records</Link> |  
      <Link to="/paceCalculator">Pace Calculator</Link> |  
      {!token ? (
        <>
          <Link to="/login">Login</Link> |  
          <Link to="/signup">Signup</Link>
        </>
      ) : (
        <button onClick={handleLogout} style={{ marginLeft: '10px' }}>Logout</button>
      )}
    </nav>
  );
};

export default Navbar;
