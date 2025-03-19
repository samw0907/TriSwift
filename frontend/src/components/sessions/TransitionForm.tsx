import React, { useState } from "react";

interface TransitionFormProps {
  sessionId: string;
  onSubmit: (transitionData: any) => void,
  onCancel: () => void;
  onNext: () => void;
}

const TransitionForm: React.FC<TransitionFormProps> = ({ sessionId, onSubmit, onCancel, onNext }) => {
  const [transition, setTransition] = useState({
    previousSport: "",
    nextSport: "",
    minutes: "",
    seconds: "",
    comments: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setTransition({ ...transition, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const totalSeconds =
      (parseInt(transition.minutes, 10) || 0) * 60 +
      (parseInt(transition.seconds, 10) || 0);

    onSubmit({
      previousSport: transition.previousSport,
      nextSport: transition.nextSport,
      transitionTime: totalSeconds,
      comments: transition.comments.trim(),
    });

    setTransition({
      previousSport: "",
      nextSport: "",
      minutes: "",
      seconds: "",
      comments: "",
    });

      onNext();
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

      <label htmlFor="transitionTime">Transition Time:</label>
      <div style={{ display: "flex", gap: "10px" }}>
        <input type="number" id="transitionMinutes" name="minutes" value={transition.minutes} onChange={handleChange} placeholder="Minutes" />
        <input type="number" id="transitionSeconds" name="seconds" value={transition.seconds} onChange={handleChange} placeholder="Seconds" />
      </div>

      <label htmlFor="comments">Comments:</label>
      <textarea id="comments" name="comments" value={transition.comments} onChange={handleChange} />

      <button type="submit">Add Transition</button>
      <button type="button" onClick={onCancel}>Cancel</button>
      <button type="button" onClick={onNext}>Next</button>

    </form>
  );
};

export default TransitionForm;
