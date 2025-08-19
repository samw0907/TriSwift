import React, { useState, useRef } from "react";
import "../../styles/sessionForm.css";

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
  const dateRef = useRef<HTMLInputElement>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const openDatePicker = () => {
    const el = dateRef.current;
    if (!el) return;
    el.focus();
    if (el.showPicker) el.showPicker();
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(formData);
      }}
      className="session-form"
    >
      <h3 className="section-heading">Session</h3>
      <div className="form-row two-col">
        <div className="form-field">
          <label htmlFor="sessionType" className="field-label">Session Type</label>
          <select
            id="sessionType"
            name="sessionType"
            value={formData.sessionType}
            onChange={handleChange}
            required
            className="select-input"
          >
            <option value="">Select Type</option>
            <option value="Swim">Swim</option>
            <option value="Bike">Bike</option>
            <option value="Run">Run</option>
            <option value="Multi-Sport">Multi-Sport</option>
          </select>
        </div>
        <div className="form-field">
          <label htmlFor="date" className="field-label">Date</label>
          <input
            id="date"
            type="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            required
            max={today}
            className="date-input"
            ref={dateRef}
            onClick={openDatePicker}
          />
        </div>
      </div>

      <h3 className="section-heading">Weather</h3>

      <div className="form-row three-col">
        <div className="form-field">
          <label htmlFor="weatherTemp" className="field-label">Temp (°C)</label>
          <input
            id="weatherTemp"
            type="number"
            name="weatherTemp"
            value={formData.weatherTemp}
            onChange={handleChange}
          />
        </div>

        <div className="form-field">
          <label htmlFor="weatherHumidity" className="field-label">Humidity (%)</label>
          <input
            id="weatherHumidity"
            type="number"
            name="weatherHumidity"
            value={formData.weatherHumidity}
            onChange={handleChange}
          />
        </div>

        <div className="form-field">
          <label htmlFor="weatherWindSpeed" className="field-label">Wind (m/s)</label>
          <input
            id="weatherWindSpeed"
            type="number"
            name="weatherWindSpeed"
            value={formData.weatherWindSpeed}
            onChange={handleChange}
          />
        </div>
      </div>

      <div className="form-buttons">
        <button type="submit" className="btn-primary">
          Next
        </button>
        <button type="button" className="btn-secondary" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </form>
  );
};

export default SessionForm;
