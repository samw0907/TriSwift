// src/components/sessions/SessionDetails.tsx
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
  sessionType: string;
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

const formatMMSS = (seconds: number): string => {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
};

const calculatePace = (activity: Activity): string | null => {
  if (activity.distance <= 0 || activity.duration <= 0) return null;
  if (activity.sportType === "Run") {
    const pacePerKm = activity.duration / activity.distance;
    const minutes = Math.floor(pacePerKm / 60);
    const seconds = Math.round(pacePerKm % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")} / km`;
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
    return `${minutes}:${seconds.toString().padStart(2, "0")} / 100m`;
  }
  return null;
};

/** Minimal helper to align label/value in two columns */
const MetricRow: React.FC<{
  label: string;
  value?: number | string;
  unit?: string;
}> = ({ label, value, unit }) => {
  if (
    value === undefined ||
    (typeof value === "string" && value.trim().length === 0)
  ) {
    return null;
  }
  return (
    <div className="metric-row">
      <span className="metric-label">{label}</span>
      <span className="metric-value">
        {value}
        {unit ? ` ${unit}` : ""}
      </span>
    </div>
  );
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
      onUpdate();
    } catch (error) {
      console.error("Error deleting activity:", error);
    }
  };

  const handleDeleteTransition = async (transitionId: string) => {
    if (!window.confirm("Are you sure you want to delete this transition?")) return;
    try {
      await deleteTransition({ variables: { id: transitionId } });
      onUpdate();
    } catch (error) {
      console.error("Error deleting transition:", error);
    }
  };

  const orderedItems: (Activity | Transition)[] = [
    ...(session.activities ?? []),
    ...(session.transitions ?? []),
  ].sort(
    (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  );

  const isSingleActivitySession =
    (session.sessionType === "Run" ||
      session.sessionType === "Bike" ||
      session.sessionType === "Swim") &&
    session.activities.length === 1;

  const firstActivity = session.activities[0];

  return (
    <div className="session-details">
      {isSingleActivitySession && (
        <>
          <div className="details-columns">
            <div className="left-column">
              <h3 className="column-heading">Stats</h3>
              {firstActivity && (
                <div className="metric-list">
                  <MetricRow
                    label="Pace"
                    value={calculatePace(firstActivity) || undefined}
                  />
                  <MetricRow label="HR Min" value={firstActivity.heartRateMin} unit="bpm" />
                  <MetricRow label="HR Max" value={firstActivity.heartRateMax} unit="bpm" />
                  <MetricRow label="Avg HR" value={firstActivity.heartRateAvg} unit="bpm" />
                  <MetricRow label="Cadence" value={firstActivity.cadence} unit="rpm" />
                  <MetricRow label="Power" value={firstActivity.power} unit="watts" />
                </div>
              )}
            </div>
            <div className="right-column">
              {(session.weatherTemp ||
                session.weatherHumidity ||
                session.weatherWindSpeed) && (
                <>
                  <h3 className="column-heading">Weather</h3>
                  <div className="metric-list">
                    {session.weatherTemp !== null &&
                      session.weatherTemp !== undefined && (
                        <MetricRow label="Temp" value={session.weatherTemp} unit="°C" />
                      )}
                    {session.weatherHumidity !== null &&
                      session.weatherHumidity !== undefined && (
                        <MetricRow label="Humidity" value={session.weatherHumidity} unit="%" />
                      )}
                    {session.weatherWindSpeed !== null &&
                      session.weatherWindSpeed !== undefined && (
                        <MetricRow label="Wind" value={session.weatherWindSpeed} unit="m/s" />
                      )}
                  </div>
                </>
              )}
              {firstActivity && editingActivityId !== firstActivity.id && (
                <div className="details-actions">
                  <button
                    className="icon-btn edit-btn"
                    title="Edit Activity"
                    onClick={() =>
                      setEditingActivityId(
                        editingActivityId === firstActivity.id
                          ? null
                          : firstActivity.id
                      )
                    }
                  >
                    ✏️
                  </button>
                  <button
                    className="icon-btn delete-btn"
                    title="Delete Activity"
                    onClick={() => handleDeleteActivity(firstActivity.id)}
                  >
                    🗑
                  </button>
                </div>
              )}
            </div>
          </div>
          {editingActivityId === firstActivity?.id && (
            <div className="edit-form-container">
              <EditActivityForm
                activity={firstActivity}
                onClose={() => setEditingActivityId(null)}
                onUpdate={onUpdate}
              />
            </div>
          )}
        </>
      )}

      {!isSingleActivitySession &&
        orderedItems.map((item, index) => {
          const isFirstActivity = "sportType" in item && index === 0;
          const isEditingThisActivity =
            "sportType" in item && editingActivityId === item.id;
          const isEditingThisTransition =
            !("sportType" in item) && editingTransitionId === item.id;

          return (
            <div key={item.id} className="multi-row">
              <div className="details-columns">
                <div className="left-column">
                  <h3 className="column-heading">
                    {"sportType" in item
                      ? item.sportType
                      : `Transition: ${item.previousSport} → ${item.nextSport}`}
                  </h3>
                  {"sportType" in item ? (
                    <div className="metric-list">
                      <MetricRow
                        label="Pace"
                        value={calculatePace(item) || undefined}
                      />
                      <MetricRow
                        label="HR Min"
                        value={item.heartRateMin}
                        unit="bpm"
                      />
                      <MetricRow
                        label="HR Max"
                        value={item.heartRateMax}
                        unit="bpm"
                      />
                      <MetricRow
                        label="Avg HR"
                        value={item.heartRateAvg}
                        unit="bpm"
                      />
                      <MetricRow
                        label="Cadence"
                        value={item.cadence}
                        unit="rpm"
                      />
                      <MetricRow
                        label="Power"
                        value={item.power}
                        unit="watts"
                      />
                    </div>
                  ) : (
                    <div className="metric-list">
                      <MetricRow
                        label="Time"
                        value={formatMMSS(item.transitionTime)}
                      />
                      <MetricRow
                        label="Notes"
                        value={item.comments}
                      />
                    </div>
                  )}
                </div>
                <div className="right-column">
                  {isFirstActivity &&
                    (session.weatherTemp ||
                      session.weatherHumidity ||
                      session.weatherWindSpeed) && (
                      <>
                        <h3 className="column-heading">Weather</h3>
                        <div className="metric-list">
                          {session.weatherTemp !== null &&
                            session.weatherTemp !== undefined && (
                              <MetricRow label="Temp" value={session.weatherTemp} unit="°C" />
                            )}
                          {session.weatherHumidity !== null &&
                            session.weatherHumidity !== undefined && (
                              <MetricRow label="Humidity" value={session.weatherHumidity} unit="%" />
                            )}
                          {session.weatherWindSpeed !== null &&
                            session.weatherWindSpeed !== undefined && (
                              <MetricRow label="Wind" value={session.weatherWindSpeed} unit="m/s" />
                            )}
                        </div>
                      </>
                    )}
                  {!isEditingThisActivity && !isEditingThisTransition && (
                    <div className="details-actions">
                      {"sportType" in item ? (
                        <>
                          <button
                            className="icon-btn edit-btn"
                            title="Edit Activity"
                            onClick={() =>
                              setEditingActivityId(
                                editingActivityId === item.id ? null : item.id
                              )
                            }
                          >
                            ✏️
                          </button>
                          <button
                            className="icon-btn delete-btn"
                            title="Delete Activity"
                            onClick={() => handleDeleteActivity(item.id)}
                          >
                            🗑
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            className="icon-btn edit-btn"
                            title="Edit Transition"
                            onClick={() =>
                              setEditingTransitionId(
                                editingTransitionId === item.id ? null : item.id
                              )
                            }
                          >
                            ✏️
                          </button>
                          <button
                            className="icon-btn delete-btn"
                            title="Delete Transition"
                            onClick={() => handleDeleteTransition(item.id)}
                          >
                            🗑
                          </button>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>
              {isEditingThisActivity && (
                <div className="edit-form-container">
                  <EditActivityForm
                    activity={item}
                    onClose={() => setEditingActivityId(null)}
                    onUpdate={onUpdate}
                  />
                </div>
              )}
              {isEditingThisTransition && (
                <div className="edit-form-container">
                  <EditTransitionForm
                    transition={item}
                    onClose={() => setEditingTransitionId(null)}
                    onUpdate={onUpdate}
                  />
                </div>
              )}
            </div>
          );
        })}
    </div>
  );
};

export default SessionDetails;
