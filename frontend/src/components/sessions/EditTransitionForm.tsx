import React, { useState } from "react";
import { useMutation } from "@apollo/client";
import { UPDATE_TRANSITION_MUTATION } from "../../graphql/mutations";

interface Transition {
  id: string;
  previousSport: string;
  nextSport: string;
  transitionTime: number;
  comments?: string;
}

interface EditTransitionFormProps {
  transition: Transition;
  onClose: () => void;
  onUpdate: () => void;
}

const EditTransitionForm: React.FC<EditTransitionFormProps> = ({ transition, onClose, onUpdate }) => {

  const initialMinutes = Math.floor(transition.transitionTime / 60);
  const initialSeconds = transition.transitionTime % 60;

  const [formData, setFormData] = useState({
    previousSport: transition.previousSport,
    nextSport: transition.nextSport,
    minutes: initialMinutes.toString(),
    seconds: initialSeconds.toString(),
    comments: transition.comments || "",
  });

  const [updateTransition] = useMutation(UPDATE_TRANSITION_MUTATION, {
    onCompleted: () => {
      onUpdate();
      onClose();
    },
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const totalSeconds =
      (parseInt(formData.minutes, 10) || 0) * 60 +
      (parseInt(formData.seconds, 10) || 0);

    await updateTransition({
      variables: {
        id: transition.id,
        input: {
          previousSport: formData.previousSport,
          nextSport: formData.nextSport,
          transitionTime: totalSeconds,
          comments: formData.comments.trim(),
        },
      },
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <label>Previous Sport:</label>
      <select name="previousSport" value={formData.previousSport} onChange={handleChange}>
        <option value="Swim">Swim</option>
        <option value="Bike">Bike</option>
        <option value="Run">Run</option>
      </select>

      <label>Next Sport:</label>
      <select name="nextSport" value={formData.nextSport} onChange={handleChange}>
        <option value="Swim">Swim</option>
        <option value="Bike">Bike</option>
        <option value="Run">Run</option>
      </select>

      <label htmlFor="transitionTime">Transition Time:</label>
      <div style={{ display: "flex", gap: "10px" }}>
        <input type="number" id="transitionMinutes" name="minutes" value={formData.minutes} onChange={handleChange} placeholder="Minutes" />
        <input type="number" id="transitionSeconds" name="seconds" value={formData.seconds} onChange={handleChange} placeholder="Seconds" />
      </div>

      <label>Comments:</label>
      <textarea name="comments" value={formData.comments} onChange={handleChange} />

      <button type="submit">Save</button>
      <button type="button" onClick={onClose}>Cancel</button>
    </form>
  );
};

export default EditTransitionForm;
