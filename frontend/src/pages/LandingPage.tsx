import React from "react";
import { Link } from "react-router-dom";
import "../styles/landing.css";

const LandingPage: React.FC = () => {
  return (
    <div className="landing-hero">
      <h1 className="hero-title">TriSwift</h1>
      <p className="hero-subtitle">Train. Track. Triumph.</p>
      <p className="hero-description">
        Your all-in-one performance companion for triathlon training.
      </p>
      <div className="cta-buttons">
        <Link to="/login">
          <button className="btn btn-outline">Login</button>
        </Link>
        <Link to="/signup">
          <button className="btn btn-solid">Sign Up</button>
        </Link>
      </div>

      <section className="feature-grid">
        <div className="feature-card">
          <h3>Workout Logging</h3>
          <p>Capture detailed sessions across swim, bike, and run — all in one place.</p>
        </div>
        <div className="feature-card">
          <h3>Progress Graphs</h3>
          <p>Visualize weekly, monthly, and yearly distance trends across disciplines.</p>
        </div>
        <div className="feature-card">
          <h3>Personal Bests</h3>
          <p>Your fastest efforts are automatically tracked and updated in real-time.</p>
        </div>
        <div className="feature-card">
          <h3>Pacing Tools</h3>
          <p>Plan your race pace with precise calculators tailored for triathletes.</p>
        </div>
      </section>

      <p className="tagline">
        Whether you're chasing your first finish or next podium — TriSwift has your back.
      </p>
    </div>
  );
};

export default LandingPage;
