import React from "react";
import { Link } from "react-router-dom";
import "../styles/landing.css";

const LandingPage: React.FC = () => {
  return (
    <div className="landing-container">
      <h1>Welcome to TriSwift</h1>
      <p>The ultimate fitness tracking app for triathletes.</p>
      <p>Log your workouts, track your progress, and optimize your training.</p>
      
      <div className="landing-buttons">
        <Link to="/login">
          <button className="landing-button">Login</button>
        </Link>
        <Link to="/signup">
          <button className="landing-button signup-button">Sign Up</button>
        </Link>
      </div>
    </div>
  );
};

export default LandingPage;
