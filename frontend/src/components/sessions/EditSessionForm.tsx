import React, { useState } from "react";
import { useMutation } from "@apollo/client";
import { UPDATE_SESSION } from "../../graphql/mutations";
import { GET_SESSIONS } from "../../graphql/queries";
import "../../styles/sessionForm.css";

interface EditSessionFormProps {
  session: any;
  onClose: () => void;
  onUpdate: () => void;
}

const EditSessionForm: React.FC<EditSessionFormProps> = ({ session, onClose, onUpdate }) => {
  const [formData, setFormData] = useState({
    sessionType: session.sessionType,
    date: session.date.split("T")[0],
    weatherTemp: session.weatherTemp || "",
    weatherHumidity: session.weatherHumidity || "",
    weatherWindSpeed: session.weatherWindSpeed || "",
  });

  const [updateSession] = useMutation(UPDATE_SESSION, {
    refetchQueries: [{ query: GET_SESSIONS }],
    onCompleted: () => {
      onUpdate();
      onClose();
    },
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await updateSession({
        variables: {
          id: session.id,
          input: {
            sessionType: formData.sessionType,
            date: formData.date,
            weatherTemp: formData.weatherTemp ? parseFloat(formData.weatherTemp) : null,
            weatherHumidity: formData.weatherHumidity ? parseInt(formData.weatherHumidity) : null,
            weatherWindSpeed: formData.weatherWindSpeed ? parseFloat(formData.weatherWindSpeed) : null,
          },
        },
      });

      console.log("✅ Session updated successfully");
    } catch (error) {
      console.error("❌ Error updating session:", error);
      alert("Failed to update session. Please try again.");
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="session-form session-edit-form"
      data-testid="edit-session-form"
    >
      <h3>Edit Session</h3>

      <label htmlFor="sessionType">Session Type:</label>
      <select
        id="sessionType"
        name="sessionType"
        value={formData.sessionType}
        onChange={handleChange}
      >
        <option value="Swim">Swim</option>
        <option value="Bike">Bike</option>
        <option value="Run">Run</option>
        <option value="Multi-Sport">Multi-Sport</option>
      </select>

      <label htmlFor="date">Date:</label>
      <input
        id="date"
        type="date"
        name="date"
        value={formData.date}
        onChange={handleChange}
      />

      <label htmlFor="weatherTemp">Weather Temp (°C):</label>
      <input
        id="weatherTemp"
        type="number"
        name="weatherTemp"
        value={formData.weatherTemp}
        onChange={handleChange}
      />

      <label htmlFor="weatherHumidity">Weather Humidity (%):</label>
      <input
        id="weatherHumidity"
        type="number"
        name="weatherHumidity"
        value={formData.weatherHumidity}
        onChange={handleChange}
      />

      <label htmlFor="weatherWindSpeed">Wind Speed (m/s):</label>
      <input
        id="weatherWindSpeed"
        type="number"
        name="weatherWindSpeed"
        value={formData.weatherWindSpeed}
        onChange={handleChange}
      />

      <div className="form-buttons">
        <button type="submit" className="btn-primary">Save</button>
        <button type="button" className="btn-secondary" onClick={onClose}>
          Cancel
        </button>
      </div>
    </form>
  );
};

export default EditSessionForm;
