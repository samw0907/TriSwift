import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="home">
      <h1>Welcome to TriSwift</h1>
      <p>Your all-in-one fitness tracking app for triathletes.</p>
      <Link to="/dashboard" className="btn">Go to Dashboard</Link>
    </div>
  );
};

export default Home;
