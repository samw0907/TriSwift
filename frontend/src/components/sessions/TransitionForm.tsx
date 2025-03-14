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
  
    onSubmit({
      ...transition,
      transitionTime: parseInt(transition.transitionTime, 10),
    });
  };
  

  return (
    <form className="transition-form" onSubmit={handleSubmit}>
      <label htmlFor="previousSport">Previous Sport:</label>
      <select id="previousSport" name="previousSport" value={transition.previousSport} onChange={handleChange} required>
        <option value="">Select Sport</option>
        <option value="Swim">Swim</option>
        <option value="Bike">Bike</option>
        <option value="Run">Run</option>
      </select>

      <label htmlFor="nextSport">Next Sport:</label>
      <select id="nextSport" name="nextSport" value={transition.nextSport} onChange={handleChange} required>
        <option value="">Select Sport</option>
        <option value="Swim">Swim</option>
        <option value="Bike">Bike</option>
        <option value="Run">Run</option>
      </select>

      <label  htmlFor="transitionTime">Transition Time (seconds):</label>
      <input id="transitionTime" type="number" name="transitionTime" value={transition.transitionTime} onChange={handleChange} required />

      <label htmlFor="comments">Comments:</label>
      <textarea id="comments" name="comments" value={transition.comments} onChange={handleChange} />

      <button type="submit">Add Transition</button>
      <button type="button" onClick={onCancel}>Cancel</button>
    </form>
  );
};

export default TransitionForm;
