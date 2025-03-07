import React, { useState } from "react";

interface ActivityFormProps {
  sessionId: string;
  sessionType: string;
  onSubmit: (activityData: any) => void;
  onCancel: () => void;
}

const ActivityForm: React.FC<ActivityFormProps> = ({ sessionId, sessionType, onSubmit, onCancel }) => {
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
  };

  return (
    <form className="activity-form" onSubmit={handleSubmit}>
      {sessionType === "Multi-Sport" && (
        <>
          <label>Activity Type:</label>
          <select name="sportType" value={activity.sportType} onChange={handleChange} required>
            <option value="">Select Activity</option>
            <option value="Swim">Swim</option>
            <option value="Bike">Bike</option>
            <option value="Run">Run</option>
          </select>
        </>
      )}

      <label>Duration:</label>
      <div className="duration-inputs">
        <input type="number" name="hours" value={activity.hours} onChange={handleChange} placeholder="Hrs" min="0" />
        <input type="number" name="minutes" value={activity.minutes} onChange={handleChange} placeholder="Mins" min="0" />
        <input type="number" name="seconds" value={activity.seconds} onChange={handleChange} placeholder="Secs" min="0" />
      </div>

      <label>Distance {activity.sportType === "Swim" ? "(m):" : "(km):"}</label>
      <input
        type="number"
        name="distance"
        value={activity.distance}
        onChange={handleChange}
        required
      />

      <label>Heart Rate Min:</label>
      <input type="number" name="heartRateMin" value={activity.heartRateMin} onChange={handleChange} />

      <label>Heart Rate Max:</label>
      <input type="number" name="heartRateMax" value={activity.heartRateMax} onChange={handleChange} />

      <label>Heart Rate Avg:</label>
      <input type="number" name="heartRateAvg" value={activity.heartRateAvg} onChange={handleChange} />

      <label>Cadence:</label>
      <input type="number" name="cadence" value={activity.cadence} onChange={handleChange} />

      <label>Power:</label>
      <input type="number" name="power" value={activity.power} onChange={handleChange} />

      <button type="submit">Add Activity</button>
      <button type="button" onClick={onCancel}>Cancel</button>
      <button type="button" onClick={onCancel} style={{ marginLeft: "10px" }}>Next</button>
    </form>
  );
};

export default ActivityForm;
