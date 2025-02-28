import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  const token = localStorage.getItem('token');

  return (
    <div style={{ textAlign: 'center' }}>
      <h1>Welcome to TriSwift</h1>
      <p>Track your fitness progress with ease.</p>
      {!token ? (
        <Link to="/login">
          <button>Login</button>
        </Link>
      ) : (
        <Link to="/dashboard">
          <button>Go to Dashboard</button>
        </Link>
      )}
    </div>
  );
};

export default Home;
