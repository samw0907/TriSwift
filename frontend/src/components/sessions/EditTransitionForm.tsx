import React, { useState } from "react";
import { useMutation } from "@apollo/client";
import { UPDATE_TRANSITION_MUTATION } from "../../graphql/mutations";
import "../../styles/transitionForm.css";

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

const EditTransitionForm: React.FC<EditTransitionFormProps> = ({
  transition,
  onClose,
  onUpdate,
}) => {
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

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
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
    <form
      onSubmit={handleSubmit}
      className="transition-form edit-transition-form"
    >
      <h3>Edit Transition</h3>

      <label htmlFor="previousSport">Previous Sport:</label>
      <select
        id="previousSport"
        name="previousSport"
        value={formData.previousSport}
        onChange={handleChange}
      >
        <option value="Swim">Swim</option>
        <option value="Bike">Bike</option>
        <option value="Run">Run</option>
      </select>

      <label htmlFor="nextSport">Next Sport:</label>
      <select
        id="nextSport"
        name="nextSport"
        value={formData.nextSport}
        onChange={handleChange}
      >
        <option value="Swim">Swim</option>
        <option value="Bike">Bike</option>
        <option value="Run">Run</option>
      </select>

      <label htmlFor="transitionMinutes">Transition Time:</label>
      <div className="transition-time-inputs">
        <input
          type="number"
          id="transitionMinutes"
          name="minutes"
          value={formData.minutes}
          onChange={handleChange}
          placeholder="Minutes"
        />
        <input
          type="number"
          id="transitionSeconds"
          name="seconds"
          value={formData.seconds}
          onChange={handleChange}
          placeholder="Seconds"
        />
      </div>

      <label htmlFor="comments">Comments:</label>
      <textarea
        id="comments"
        name="comments"
        value={formData.comments}
        onChange={handleChange}
      />

      <div className="form-buttons">
        <button type="submit" className="btn-primary">
          Save
        </button>
        <button type="button" className="btn-secondary" onClick={onClose}>
          Cancel
        </button>
      </div>
    </form>
  );
};

export default EditTransitionForm;
