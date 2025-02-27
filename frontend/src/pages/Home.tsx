import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div style={{ textAlign: 'center' }}>
      <h1>Welcome to TriSwift</h1>
      <p>Track your fitness progress with ease.</p>
      <Link to="/login">
        <button>Login</button>
      </Link>
    </div>
  );
};

export default Home;
