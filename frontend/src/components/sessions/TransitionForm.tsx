import React, { useEffect, useState } from "react";
import "../../styles/transitionForm.css";

interface TransitionFormProps {
  sessionId: string;
  onSubmit: (transitionData: {
    previousSport: "Swim" | "Bike" | "Run" | "";
    nextSport: "Swim" | "Bike" | "Run" | "";
    transitionTime: number;
    comments: string;
  }) => void;
  onClose: () => void;
  onSkipToNextActivity: () => void;
  previousSportDefault?: "Swim" | "Bike" | "Run" | "";
}

const TransitionForm: React.FC<TransitionFormProps> = ({
  sessionId,
  onSubmit,
  onClose,
  onSkipToNextActivity,
  previousSportDefault = "",
}) => {
  const [transition, setTransition] = useState({
    previousSport: "" as "" | "Swim" | "Bike" | "Run",
    nextSport: "" as "" | "Swim" | "Bike" | "Run",
    minutes: "",
    seconds: "",
    comments: "",
  });

  useEffect(() => {
    if (previousSportDefault) {
      setTransition((t) => ({ ...t, previousSport: previousSportDefault }));
    }
  }, [previousSportDefault]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setTransition({ ...transition, [e.target.name]: e.target.value });
  };

  const resetForm = () => {
    setTransition({
      previousSport: "",
      nextSport: "",
      minutes: "",
      seconds: "",
      comments: "",
    });
  };

  const buildPayload = () => {
    const totalSeconds =
      (parseInt(transition.minutes, 10) || 0) * 60 +
      (parseInt(transition.seconds, 10) || 0);

    return {
      previousSport: transition.previousSport,
      nextSport: transition.nextSport,
      transitionTime: totalSeconds,
      comments: transition.comments.trim(),
    };
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(buildPayload());
    resetForm();
  };

  const handleSaveAndClose = () => {
    onSubmit(buildPayload());
    resetForm();
    onClose();
  };

  const handleSkipTransition = () => {
    resetForm();
    onSkipToNextActivity();
  };

  return (
    <form className="transition-form" onSubmit={handleSubmit}>
      <label htmlFor="previousSport">Previous Sport:</label>
      <select
        id="previousSport"
        name="previousSport"
        value={transition.previousSport}
        onChange={handleChange}
        required
      >
        <option value="">Select Sport</option>
        <option value="Swim">Swim</option>
        <option value="Bike">Bike</option>
        <option value="Run">Run</option>
      </select>

      <label htmlFor="nextSport">Next Sport:</label>
      <select
        id="nextSport"
        name="nextSport"
        value={transition.nextSport}
        onChange={handleChange}
        required
      >
        <option value="">Select Sport</option>
        <option value="Swim">Swim</option>
        <option value="Bike">Bike</option>
        <option value="Run">Run</option>
      </select>

      <label htmlFor="transitionTime">Transition Time:</label>
      <div className="transition-time-inputs">
        <input
          type="number"
          id="transitionMinutes"
          name="minutes"
          value={transition.minutes}
          onChange={handleChange}
          placeholder="Minutes"
          min="0"
        />
        <input
          type="number"
          id="transitionSeconds"
          name="seconds"
          value={transition.seconds}
          onChange={handleChange}
          placeholder="Seconds"
          min="0"
        />
      </div>

      <label htmlFor="comments">Comments:</label>
      <textarea
        id="comments"
        name="comments"
        value={transition.comments}
        onChange={handleChange}
        placeholder="Optional comments..."
      />

      <div className="form-buttons">
        <button type="submit" className="btn-primary">
          Add & Next
        </button>

        <button
          type="button"
          className="btn-secondary"
          onClick={handleSkipTransition}
          title="Skip adding a transition and continue to the next activity"
        >
          Skip Transition
        </button>

        <button
          type="button"
          className="btn-tertiary"
          onClick={handleSaveAndClose}
        >
          Save & Close
        </button>
      </div>
    </form>
  );
};

export default TransitionForm;
