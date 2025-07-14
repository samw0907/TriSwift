import React from "react";
import { Link } from "react-router-dom";
import "../styles/landing.css";

const LandingPage: React.FC = () => {
  return (
    <div className="landing-hero">
      <div className="hero-content">
        <h1 className="hero-title">TriSwift</h1>
        <p className="hero-tagline">
          Track your training. Crush your goals. Conquer your next race.
        </p>
        <div className="hero-buttons">
          <Link to="/login">
            <button className="btn login-btn">Log In</button>
          </Link>
          <Link to="/signup">
            <button className="btn signup-btn">Sign Up</button>
          </Link>
        </div>
      </div>

      <section className="features-section">
        <h2 className="features-heading">Why TriSwift?</h2>
        <div className="features-grid">
          <div className="feature-card">
            <h3>Session Logging</h3>
            <p>
              Log swims, rides, and runs with distance, time, pace, and metrics.
            </p>
          </div>
          <div className="feature-card">
            <h3>Progress Tracking</h3>
            <p>
              Monitor your totals weekly, monthly, or yearly through dynamic
              graphs.
            </p>
          </div>
          <div className="feature-card">
            <h3>Personal Records</h3>
            <p>
              Your fastest 5K, 10K, or long ride — automatically tracked and
              ranked.
            </p>
          </div>
          <div className="feature-card">
            <h3>Pacing Calculator</h3>
            <p>
              Dial in your target race times with pace and speed estimates.
            </p>
          </div>
        </div>
      </section>

      <footer className="landing-footer">
        Whether you're chasing your first triathlon or your next PR — TriSwift
        has you covered.
      </footer>
    </div>
  );
};

export default LandingPage;
