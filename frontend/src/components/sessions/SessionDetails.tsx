import React, { useState } from "react";
import { useMutation } from "@apollo/client";
import { formatDuration } from "../../utils/format";
import EditActivityForm from "./EditActivityForm";
import EditTransitionForm from "./EditTransitionForm";
import {
  DELETE_ACTIVITY_MUTATION,
  DELETE_TRANSITION_MUTATION,
} from "../../graphql/mutations";
import "../../styles/sessionDetails.css";

interface Activity {
  id: string;
  sportType: string;
  duration: number;
  distance: number;
  created_at: string;
  heartRateMin?: number;
  heartRateMax?: number;
  heartRateAvg?: number;
  cadence?: number;
  power?: number;
}

interface Transition {
  id: string;
  previousSport: string;
  nextSport: string;
  transitionTime: number;
  created_at: string;
  comments?: string;
}

interface Session {
  id: string;
  weatherTemp?: number | null;
  weatherHumidity?: number | null;
  weatherWindSpeed?: number | null;
  activities: Activity[];
  transitions: Transition[];
}

interface SessionDetailsProps {
  session: Session;
  onUpdate: () => void;
}

const calculatePace = (activity: Activity): string | null => {
  if (activity.distance <= 0 || activity.duration <= 0) return null;

  if (activity.sportType === "Run") {
    const pacePerKm = activity.duration / activity.distance;
    const minutes = Math.floor(pacePerKm / 60);
    const seconds = Math.round(pacePerKm % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")} min/km`;
  }

  if (activity.sportType === "Bike") {
    const speedKmH = (activity.distance / activity.duration) * 3600;
    return `${speedKmH.toFixed(1)} km/h`;
  }

  if (activity.sportType === "Swim") {
    const distanceMeters = activity.distance * 1000;
    const pacePer100m = activity.duration / (distanceMeters / 100);
    const minutes = Math.floor(pacePer100m / 60);
    const seconds = Math.round(pacePer100m % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")} min/100m`;
  }

  return null;
};

const SessionDetails: React.FC<SessionDetailsProps> = ({ session, onUpdate }) => {
  const [editingActivityId, setEditingActivityId] = useState<string | null>(null);
  const [editingTransitionId, setEditingTransitionId] = useState<string | null>(null);

  const [deleteActivity] = useMutation(DELETE_ACTIVITY_MUTATION);
  const [deleteTransition] = useMutation(DELETE_TRANSITION_MUTATION);

  const handleDeleteActivity = async (activityId: string) => {
    if (!window.confirm("Are you sure you want to delete this activity?")) return;
    try {
      await deleteActivity({ variables: { id: activityId } });
      console.log("✅ Activity deleted successfully!");
      onUpdate();
    } catch (error) {
      console.error("❌ Error deleting activity:", error);
    }
  };

  const handleDeleteTransition = async (transitionId: string) => {
    if (!window.confirm("Are you sure you want to delete this transition?")) return;
    try {
      await deleteTransition({ variables: { id: transitionId } });
      console.log("✅ Transition deleted successfully!");
      onUpdate();
    } catch (error) {
      console.error("❌ Error deleting transition:", error);
    }
  };

  const orderedItems: (Activity | Transition)[] = [
    ...(session.activities ?? []),
    ...(session.transitions ?? []),
  ].sort(
    (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  );

  return (
    <div className="session-details">
      {session.weatherTemp !== null && session.weatherTemp !== undefined && (
        <p className="weather-info">Temp: {session.weatherTemp}°C</p>
      )}
      {session.weatherHumidity !== null && session.weatherHumidity !== undefined && (
        <p className="weather-info">Humidity: {session.weatherHumidity}%</p>
      )}
      {session.weatherWindSpeed !== null && session.weatherWindSpeed !== undefined && (
        <p className="weather-info">Wind Speed: {session.weatherWindSpeed} m/s</p>
      )}

      <h3>Activity & Transition Details</h3>
      <ul className="details-list">
        {orderedItems.map((item) => {
          if ("sportType" in item) {
            return (
              <li key={item.id} className="activity-item">
                <p className="activity-type">
                  <strong>{item.sportType}</strong>
                </p>
                <p>
                  Distance:{" "}
                  {item.sportType === "Swim"
                    ? `${(item.distance * 1000).toFixed(0)} m`
                    : `${item.distance.toFixed(2)} km`}
                </p>
                <p>Duration: {formatDuration(item.duration)}</p>
                {calculatePace(item) && <p>Pace: {calculatePace(item)}</p>}
                {item.heartRateMin !== undefined && <p>HR Min: {item.heartRateMin} bpm</p>}
                {item.heartRateMax !== undefined && <p>HR Max: {item.heartRateMax} bpm</p>}
                {item.heartRateAvg !== undefined && <p>Avg HR: {item.heartRateAvg} bpm</p>}
                {item.cadence !== undefined && <p>Cadence: {item.cadence} rpm</p>}
                {item.power !== undefined && <p>Power: {item.power} watts</p>}

                <div className="details-actions">
                  <button
                    className="btn-primary"
                    onClick={() =>
                      setEditingActivityId(editingActivityId === item.id ? null : item.id)
                    }
                  >
                    {editingActivityId === item.id ? "Cancel" : "Edit Activity"}
                  </button>
                  <button
                    className="btn-danger"
                    onClick={() => handleDeleteActivity(item.id)}
                  >
                    Delete Activity
                  </button>
                </div>

                {editingActivityId === item.id && (
                  <EditActivityForm
                    activity={item}
                    onClose={() => setEditingActivityId(null)}
                    onUpdate={onUpdate}
                  />
                )}
              </li>
            );
          } else {
            return (
              <li key={item.id} className="transition-item">
                <p>
                  <strong>Transition: {item.previousSport} → {item.nextSport}</strong>
                </p>
                <p>Transition Time: {formatDuration(item.transitionTime)}</p>
                {item.comments && <p>Notes: {item.comments}</p>}

                <div className="details-actions">
                  <button
                    className="btn-primary"
                    onClick={() =>
                      setEditingTransitionId(editingTransitionId === item.id ? null : item.id)
                    }
                  >
                    {editingTransitionId === item.id ? "Cancel" : "Edit Transition"}
                  </button>
                  <button
                    className="btn-danger"
                    onClick={() => handleDeleteTransition(item.id)}
                  >
                    Delete Transition
                  </button>
                </div>

                {editingTransitionId === item.id && (
                  <EditTransitionForm
                    transition={item}
                    onClose={() => setEditingTransitionId(null)}
                    onUpdate={onUpdate}
                  />
                )}
              </li>
            );
          }
        })}
      </ul>
    </div>
  );
};

export default SessionDetails;
