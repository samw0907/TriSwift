import React, { useState } from "react";
import '../styles/paceCalculator.css';
import '../index.css';

const sportDistances = {
  Swim: ["100m", "200m", "400m", "800m", "1000m", "1500m", "2000m"],
  Run: ["0.1km", "0.2km", "0.4km", "1km", "5km", "10km", "21.1km", "42.2km"],
  Bike: ["10km", "20km", "40km", "50km", "80km", "100km", "150km", "200km"],
};

const PaceCalculator: React.FC = () => {
  const [sport, setSport] = useState<"Swim" | "Run" | "Bike">("Run");
  const [distance, setDistance] = useState<string>("");
  const [customDistance, setCustomDistance] = useState<string>("");
  const [time, setTime] = useState({ hours: "", minutes: "", seconds: "" });
  const [pace, setPace] = useState<string | null>(null);

  const handleSportChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSport(e.target.value as "Swim" | "Run" | "Bike");
    setDistance("");
    setCustomDistance("");
    setPace(null);
  };

  const handleDistanceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setDistance(e.target.value);
    setCustomDistance("");
    setPace(null);
  };

  const handleCustomDistanceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomDistance(e.target.value);
    setDistance("");
    setPace(null);
  };

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTime({ ...time, [e.target.name]: e.target.value });
    setPace(null);
  };

  const calculatePace = () => {
    const totalSeconds =
      (parseInt(time.hours) || 0) * 3600 +
      (parseInt(time.minutes) || 0) * 60 +
      (parseInt(time.seconds) || 0);

    let dist = customDistance
      ? parseFloat(customDistance)
      : parseFloat(distance.replace("m", "").replace("km", ""));

    if (!dist || totalSeconds === 0) {
      setPace("Invalid input");
      return;
    }

    if (sport === "Swim") {
      const distInMeters = customDistance ? dist : dist * 1;
      const pacePer100m = totalSeconds / (distInMeters / 100);
      const minutes = Math.floor(pacePer100m / 60);
      const seconds = Math.round(pacePer100m % 60);
      setPace(`${minutes}:${seconds.toString().padStart(2, "0")} min/100m`);
    } else if (sport === "Run") {
      const pacePerKm = totalSeconds / dist;
      const minutes = Math.floor(pacePerKm / 60);
      const seconds = Math.round(pacePerKm % 60);
      setPace(`${minutes}:${seconds.toString().padStart(2, "0")} min/km`);
    } else if (sport === "Bike") {
      const speedKmH = (dist / totalSeconds) * 3600;
      setPace(`${speedKmH.toFixed(1)} km/h`);
    }
  };

  return (
    <div className="pace-calculator-container">
      <h2>Pace Calculator</h2>

      <div className="pace-form">
        <label htmlFor="sport-select">Sport: </label>
        <select id="sport-select" value={sport} onChange={handleSportChange}>
          <option value="Swim">Swim</option>
          <option value="Run">Run</option>
          <option value="Bike">Bike</option>
        </select>

        <label htmlFor="distance-select">Distance: </label>
        <div className="pace-distance-wrapper">
          <select id="distance-select" value={distance} onChange={handleDistanceChange}>
            <option value="">Select Distance</option>
            {sportDistances[sport].map((d) => (
              <option key={d} value={d.replace("m", "").replace("km", "")}>
                {d}
              </option>
            ))}
          </select>
          <span> OR </span>
          <input
            id="custom-distance"
            type="number"
            placeholder="Custom"
            value={customDistance}
            onChange={handleCustomDistanceChange}
          />
          <span> {sport === "Swim" ? "m" : "km"}</span>
        </div>

        <label htmlFor="hours-input">Target Time: </label>
        <div className="pace-time-inputs">
          <input
            id="hours-input"
            type="number"
            name="hours"
            placeholder="HH"
            value={time.hours}
            onChange={handleTimeChange}
          />
          :
          <input
            id="minutes-input"
            type="number"
            name="minutes"
            placeholder="MM"
            value={time.minutes}
            onChange={handleTimeChange}
          />
          :
          <input
            id="seconds-input"
            type="number"
            name="seconds"
            placeholder="SS"
            value={time.seconds}
            onChange={handleTimeChange}
          />
        </div>

        <div className="pace-buttons">
          <button data-testid="calculate-pace-button" onClick={calculatePace}>
            Calculate Pace
          </button>
        </div>

        {pace && <h3 className="pace-result">Target Pace: {pace}</h3>}
      </div>
    </div>
  );
};

export default PaceCalculator;
