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
    distance:
      activity.sportType === "Swim"
        ? String(activity.distance * 1000)
        : String(activity.distance),
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
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const parseNumber = (val: string): number | null =>
    val.trim() === "" || isNaN(Number(val)) ? null : Number(val);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const duration =
      (parseInt(formData.hours) || 0) * 3600 +
      (parseInt(formData.minutes) || 0) * 60 +
      (parseInt(formData.seconds) || 0);

    const rawDistance = parseNumber(formData.distance) || 0;
    const distance = formData.sportType === "Swim" ? rawDistance / 1000 : rawDistance;
      
    try {
      await updateActivity({
        variables: {
          id: activity.id,
          input: {
            sportType: formData.sportType,
            duration,
            distance,
            heartRateMin: parseNumber(formData.heartRateMin),
            heartRateMax: parseNumber(formData.heartRateMax),
            heartRateAvg: parseNumber(formData.heartRateAvg),
            cadence: parseNumber(formData.cadence),
            power: parseNumber(formData.power),
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

      <label htmlFor="distance">Distance ({formData.sportType === "Swim" ? "m" : "km"}):</label>
      <input id="distance" type="number" name="distance" value={formData.distance} onChange={handleChange} step="any" />

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
