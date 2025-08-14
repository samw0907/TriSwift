import React, { useState } from "react";
import "../../styles/activityForm.css";

interface ActivityFormProps {
  sessionId: string;
  sessionType: string;
  onSubmit: (activityData: any) => void;
  onClose: () => void;
  onCancelAndDeleteSession: (sessionId: string) => void;
}

const ActivityForm: React.FC<ActivityFormProps> = ({
  sessionId,
  sessionType,
  onSubmit,
  onClose,
  onCancelAndDeleteSession,
}) => {
  const [activity, setActivity] = useState({
    sportType: sessionType !== "Multi-Sport" ? sessionType : "",
    hours: "",
    minutes: "",
    seconds: "",
    distance: "",
    heartRateMin: "",
    heartRateMax: "",
    heartRateAvg: "",
    cadence: "",
    power: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setActivity({ ...activity, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const totalSeconds =
      (parseInt(activity.hours) || 0) * 3600 +
      (parseInt(activity.minutes) || 0) * 60 +
      (parseInt(activity.seconds) || 0);

    if (totalSeconds <= 0) {
      alert("Duration must be greater than zero.");
      return;
    }

    onSubmit({
      sportType: activity.sportType,
      duration: totalSeconds,
      distance: parseFloat(activity.distance) || 0,
      heartRateMin: activity.heartRateMin ? parseInt(activity.heartRateMin) : null,
      heartRateMax: activity.heartRateMax ? parseInt(activity.heartRateMax) : null,
      heartRateAvg: activity.heartRateAvg ? parseInt(activity.heartRateAvg) : null,
      cadence: activity.cadence ? parseInt(activity.cadence) : null,
      power: activity.power ? parseInt(activity.power) : null,
    });

    if (sessionType !== "Multi-Sport") {
      setActivity({
        sportType: sessionType !== "Multi-Sport" ? sessionType : "",
        hours: "",
        minutes: "",
        seconds: "",
        distance: "",
        heartRateMin: "",
        heartRateMax: "",
        heartRateAvg: "",
        cadence: "",
        power: "",
      });
      onClose();
    }
  };

  return (
    <form className="activity-form" onSubmit={handleSubmit}>
      {sessionType === "Multi-Sport" && (
        <div className="field activity-type">
          <label htmlFor="sportType" className="activity-type-label">Activity Type</label>
          <select
            id="sportType"
            name="sportType"
            value={activity.sportType}
            onChange={handleChange}
            required
            className="activity-type-select"
          >
            <option value="">Select Activity</option>
            <option value="Swim">Swim</option>
            <option value="Bike">Bike</option>
            <option value="Run">Run</option>
          </select>
        </div>
      )}

      <div className="row duration-distance">
        <div className="duration-section">
          <label>Duration</label>
          <div className="duration-inputs">
            <input
              id="hours"
              type="number"
              name="hours"
              value={activity.hours}
              onChange={handleChange}
              placeholder="Hrs"
              min="0"
            />
            <input
              id="minutes"
              type="number"
              name="minutes"
              value={activity.minutes}
              onChange={handleChange}
              placeholder="Mins"
              min="0"
            />
            <input
              id="seconds"
              type="number"
              name="seconds"
              value={activity.seconds}
              onChange={handleChange}
              placeholder="Secs"
              min="0"
            />
          </div>
        </div>
        <div className="distance-input">
          <label htmlFor="distance">
            Distance {activity.sportType === "Swim" ? "(m)" : "(km)"}
          </label>
          <input
            id="distance"
            type="number"
            name="distance"
            value={activity.distance}
            onChange={handleChange}
            required
          />
        </div>
      </div>

      <div className="row">
        <div className="group">
          <label htmlFor="heartRateMax">HR Max</label>
          <input
            id="heartRateMax"
            type="number"
            name="heartRateMax"
            value={activity.heartRateMax}
            onChange={handleChange}
          />
        </div>
        <div className="group">
          <label htmlFor="heartRateMin">HR Min</label>
          <input
            id="heartRateMin"
            type="number"
            name="heartRateMin"
            value={activity.heartRateMin}
            onChange={handleChange}
          />
        </div>
        <div className="group">
          <label htmlFor="heartRateAvg">HR Avg</label>
          <input
            id="heartRateAvg"
            type="number"
            name="heartRateAvg"
            value={activity.heartRateAvg}
            onChange={handleChange}
          />
        </div>
      </div>

      <div className="row cadence-power">
        <div className="group">
          <label htmlFor="cadence">Cadence</label>
          <input
            id="cadence"
            type="number"
            name="cadence"
            value={activity.cadence}
            onChange={handleChange}
          />
        </div>
        <div className="group">
          <label htmlFor="power">Power</label>
          <input
            id="power"
            type="number"
            name="power"
            value={activity.power}
            onChange={handleChange}
          />
        </div>
      </div>

      <div className="form-buttons">
        <button type="submit" className="btn-primary">Submit Activity</button>
        <button
          type="button"
          className="btn-secondary"
          onClick={() => onCancelAndDeleteSession(sessionId)}
        >
          Cancel
        </button>
      </div>
    </form>
  );
};

export default ActivityForm;
