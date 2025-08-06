import React from "react";
import { Link } from "react-router-dom";
import "../styles/landing.css";

const LandingPage: React.FC = () => {
  return (
    <div className="landing-dark">
      <h1 className="hero-title">
        <span className="tri-text">Tri</span>
        <span className="swift-text">Swift</span>
      </h1>

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

      <section className="feature-flex">
        <div className="feature-card">
          <h3>Activity Logging</h3>
          <p>One place for all your swim, bike, and run training sessions.</p>
        </div>
        <div className="feature-card">
          <h3>Visualizations</h3>
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
        Train smarter, track your progress, and chase your next big finish with TriSwift.
      </p>
    </div>
  );
};

export default LandingPage;
