import React from "react";
import { Link } from "react-router-dom";
import "../styles/landing.css";
import "../styles/home.css";

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

      <section className="home-features">
      <div className="feature">
        <h3>Session Logging</h3>
        <p>Easily log your workouts across all three sports. Record distances, durations, heart rate, cadence, power, and more. Multi-sport sessions like triathlons are fully supported, complete with transition times.</p>
      </div>

      <div className="feature">
        <h3>Progress Tracking</h3>
        <p>Monitor your weekly, monthly, and year-to-date totals for swim, bike, and run. Visualize your training trends and identify consistency—or when it's time to ramp things up.</p>
      </div>

      <div className="feature">
        <h3>Personal Bests</h3>
        <p>Automatically track your fastest times and longest distances for each discipline. No need to manually input records—they update as you improve.</p>
      </div>

      <div className="feature">
        <h3>Pacing Calculator</h3>
        <p>Calculate the exact paces required to hit your target race times. Know what it takes and plan your training accordingly.</p>
      </div>
    </section>
    <p className="home-summary">Whether you're training for your next triathlon, aiming for a new PR, or just staying active, TriSwift keeps your performance on track—and your motivation high.</p>
    </div>
  );
};

export default LandingPage;
