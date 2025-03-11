import React, { useState } from "react";

interface SessionFormProps {
  onSubmit: (formData: any) => void;
  onCancel: () => void;
}

const SessionForm: React.FC<SessionFormProps> = ({ onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    sessionType: "",
    date: "",
    weatherTemp: "",
    weatherHumidity: "",
    weatherWindSpeed: "",
  });

  const today = new Date().toISOString().split("T")[0];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(formData); }} className="session-form">
      <label>Session Type:</label>
      <select name="sessionType" value={formData.sessionType} onChange={handleChange} required>
        <option value="">Select Type</option>
        <option value="Swim">Swim</option>
        <option value="Bike">Bike</option>
        <option value="Run">Run</option>
        <option value="Multi-Sport">Multi-Sport</option>
      </select>

      <label>Date:</label>
      <input type="date" name="date" value={formData.date} onChange={handleChange} required max={today}/>

      <label>Weather Temp (°C):</label>
      <input type="number" name="weatherTemp" value={formData.weatherTemp} onChange={handleChange} />

      <label>Weather Humidity (%):</label>
      <input type="number" name="weatherHumidity" value={formData.weatherHumidity} onChange={handleChange} />

      <label>Wind Speed (m/s):</label>
      <input type="number" name="weatherWindSpeed" value={formData.weatherWindSpeed} onChange={handleChange} />

      <button type="submit">Next</button>
      <button type="button" onClick={onCancel}>Cancel</button>
    </form>
  );
};

export default SessionForm;
