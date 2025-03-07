import React, { useState } from "react";

interface TransitionFormProps {
  sessionId: string;
  onSubmit: (transitionData: any) => void,
  onCancel: () => void;
}

const TransitionForm: React.FC<TransitionFormProps> = ({ sessionId, onSubmit, onCancel }) => {
  const [transition, setTransition] = useState({
    previousSport: "",
    nextSport: "",
    transitionTime: "",
    comments: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setTransition({ ...transition, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(transition);
  };

  return (
    <form className="transition-form" onSubmit={handleSubmit}>
      <label>Previous Sport:</label>
      <select name="previousSport" value={transition.previousSport} onChange={handleChange} required>
        <option value="">Select Sport</option>
        <option value="Swim">Swim</option>
        <option value="Bike">Bike</option>
        <option value="Run">Run</option>
      </select>

      <label>Next Sport:</label>
      <select name="nextSport" value={transition.nextSport} onChange={handleChange} required>
        <option value="">Select Sport</option>
        <option value="Swim">Swim</option>
        <option value="Bike">Bike</option>
        <option value="Run">Run</option>
      </select>

      <label>Transition Time (seconds):</label>
      <input type="number" name="transitionTime" value={transition.transitionTime} onChange={handleChange} required />

      <label>Comments:</label>
      <textarea name="comments" value={transition.comments} onChange={handleChange} />

      <button type="submit">Add Transition</button>
      <button type="button" onClick={onCancel}>Cancel</button>
    </form>
  );
};

export default TransitionForm;
