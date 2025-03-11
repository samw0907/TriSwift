import React, { useState } from "react";
import { useMutation } from "@apollo/client";
import { UPDATE_SESSION_ACTIVITY } from "../../graphql/mutations";

interface EditActivityFormProps {
  activity: any;
  onClose: () => void;
  onUpdate: () => void;
}

const EditActivityForm: React.FC<EditActivityFormProps> = ({ activity, onClose, onUpdate }) => {
  const [formData, setFormData] = useState({
    sportType: activity.sportType,
    duration: activity.duration,
    distance: activity.distance,
    heartRateMin: activity.heartRateMin || "",
    heartRateMax: activity.heartRateMax || "",
    heartRateAvg: activity.heartRateAvg || "",
    cadence: activity.cadence || "",
    power: activity.power || "",
  });

  const [updateActivity] = useMutation(UPDATE_SESSION_ACTIVITY, {
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
    await updateActivity({
      variables: { id: activity.id, input: { ...formData, duration: Number(formData.duration), distance: Number(formData.distance) } },
    });
  };

  return (
    <form className="edit-activity-form" onSubmit={handleSubmit}>
      <label>Sport Type:</label>
      <select name="sportType" value={formData.sportType} onChange={handleChange}>
        <option value="Swim">Swim</option>
        <option value="Bike">Bike</option>
        <option value="Run">Run</option>
      </select>

      <label>Duration (seconds):</label>
      <input type="number" name="duration" value={formData.duration} onChange={handleChange} />

      <label>Distance (km or m for Swim):</label>
      <input type="number" name="distance" value={formData.distance} onChange={handleChange} />

      <button type="submit">Save</button>
      <button type="button" onClick={onClose}>Cancel</button>
    </form>
  );
};

export default EditActivityForm;
