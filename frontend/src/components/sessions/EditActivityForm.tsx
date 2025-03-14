import React, { useState } from "react";
import { useMutation } from "@apollo/client";
import { UPDATE_SESSION_ACTIVITY } from "../../graphql/mutations";
import { GET_PERSONAL_RECORDS } from "../../graphql/queries";

interface EditActivityFormProps {
  activity: any;
  onClose: () => void;
  onUpdate: () => void;
}

const EditActivityForm: React.FC<EditActivityFormProps> = ({ activity, onClose, onUpdate }) => {
  const [formData, setFormData] = useState({
    sportType: activity.sportType,
    hours: Math.floor(activity.duration / 3600).toString(),
    minutes: Math.floor((activity.duration % 3600) / 60).toString(),
    seconds: (activity.duration % 60).toString(),
    distance: activity.distance.toString(),
    heartRateMin: activity.heartRateMin ? activity.heartRateMin.toString() : "",
    heartRateMax: activity.heartRateMax ? activity.heartRateMax.toString() : "",
    heartRateAvg: activity.heartRateAvg ? activity.heartRateAvg.toString() : "",
    cadence: activity.cadence ? activity.cadence.toString() : "",
    power: activity.power ? activity.power.toString() : "",
  });

  const [updateActivity] = useMutation(UPDATE_SESSION_ACTIVITY, {
    refetchQueries: [{ 
        query: GET_PERSONAL_RECORDS,
        variables: { sportType: activity.sportType }
    }],
    onCompleted: () => {
      onUpdate();
      onClose();
    },
  });
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  
  const sanitizeInput = (value: string) => {
    return value.trim() === "" || isNaN(Number(value)) ? null : parseInt(value, 10);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const totalSeconds = 
      (formData.hours.trim() === "" ? 0 : parseInt(formData.hours, 10) * 3600) +
      (formData.minutes.trim() === "" ? 0 : parseInt(formData.minutes, 10) * 60) +
      (formData.seconds.trim() === "" ? 0 : parseInt(formData.seconds, 10));
      
    try {
      await updateActivity({
        variables: {
          id: activity.id,
          input: {
            sportType: formData.sportType,
            duration: totalSeconds,
            distance: parseFloat(formData.distance) || 0,
            heartRateMin: sanitizeInput(formData.heartRateMin),
            heartRateMax: sanitizeInput(formData.heartRateMax),
            heartRateAvg: sanitizeInput(formData.heartRateAvg),
            cadence: sanitizeInput(formData.cadence),
            power: sanitizeInput(formData.power),
          },
        },
      });
    } catch (error) {
      console.error("❌ Error updating activity:", error);
      alert("Failed to update activity. Please try again.");
    }
  };

  return (
    <form className="edit-activity-form" role="form" onSubmit={handleSubmit}>
      <label  htmlFor="sportType">Sport Type:</label>
      <select id="sportType" name="sportType" value={formData.sportType} onChange={handleChange}>
        <option value="Swim">Swim</option>
        <option value="Bike">Bike</option>
        <option value="Run">Run</option>
      </select>

      <label htmlFor="duration">Duration:</label>
      <div className="duration-inputs">
        
        <label htmlFor="hours">Hours</label>
        <input  id="hours" type="number" name="hours" value={formData.hours} onChange={handleChange} placeholder="Hrs" min="0" />

        <label htmlFor="minutes">Minutes</label>
        <input  id="minutes" type="number" name="minutes" value={formData.minutes} onChange={handleChange} placeholder="Mins" min="0" />

        <label htmlFor="seconds">Seconds</label>
        <input  id="seconds" type="number" name="seconds" value={formData.seconds} onChange={handleChange} placeholder="Secs" min="0" />
      </div>

      <label htmlFor="distance">Distance (km or m for Swim):</label>
      <input id="distance" type="number" name="distance" value={formData.distance} onChange={handleChange} />

      <label  htmlFor="heartRateMin">Heart Rate Min:</label>
      <input id="heartRateMin" type="number" name="heartRateMin" value={formData.heartRateMin} onChange={handleChange} />

      <label htmlFor="heartRateMax">Heart Rate Max:</label>
      <input id="heartRateMax" type="number" name="heartRateMax" value={formData.heartRateMax} onChange={handleChange} />

      <label htmlFor="heartRateAvg">Heart Rate Avg:</label>
      <input id="heartRateAvg" type="number" name="heartRateAvg" value={formData.heartRateAvg} onChange={handleChange} />

      <label htmlFor="cadence">Cadence:</label>
      <input id="cadence" type="number" name="cadence" value={formData.cadence} onChange={handleChange} />

      <label htmlFor="power">Power:</label>
      <input id="power" type="number" name="power" value={formData.power} onChange={handleChange} />

      <button type="submit">Save</button>
      <button type="button" onClick={onClose}>Cancel</button>
    </form>
  );
};

export default EditActivityForm;
