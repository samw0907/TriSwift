// src/components/sessions/SessionDetails.tsx
import React, { useEffect, useRef, useState } from "react";
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
  date?: string;
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

const pad2 = (n: number) => String(n).padStart(2, "0");

const formatDateShort = (input?: string): string | undefined => {
  if (!input) return undefined;
  if (input.includes("/")) return input;
  const d = new Date(input);
  if (isNaN(d.getTime())) return input;
  const dd = pad2(d.getDate());
  const mm = pad2(d.getMonth() + 1);
  const yy = String(d.getFullYear()).slice(-2);
  return `${dd}/${mm}/${yy}`;
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

const MetricRow: React.FC<{
  label: string;
  value?: number | string | null;
  unit?: string;
}> = ({ label, value, unit }) => {
  if (
    value === undefined ||
    value === null ||
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
  const rootRef = useRef<HTMLDivElement | null>(null);

  const [deleteActivity] = useMutation(DELETE_ACTIVITY_MUTATION);
  const [deleteTransition] = useMutation(DELETE_TRANSITION_MUTATION);

  useEffect(() => {
    const el = rootRef.current;
    const parentCard = el?.closest(".session-card");
    parentCard?.classList.add("details-open");
    return () => {
      parentCard?.classList.remove("details-open");
    };
  }, []);

  const handleDeleteActivity = async (activityId: string) => {
    if (!window.confirm("Are you sure you want to delete this activity?")) return;
    try {
      await deleteActivity({ variables: { id: activityId } });
      onUpdate();
    } catch {}
  };

  const handleDeleteTransition = async (transitionId: string) => {
    if (!window.confirm("Are you sure you want to delete this transition?")) return;
    try {
      await deleteTransition({ variables: { id: transitionId } });
      onUpdate();
    } catch {}
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

  const totalActivityDuration =
    session.activities?.reduce((sum, a) => sum + (a.duration || 0), 0) || 0;
  const totalTransitionTime =
    session.transitions?.reduce((sum, t) => sum + (t.transitionTime || 0), 0) || 0;
  const totalDuration = totalActivityDuration + totalTransitionTime;
  const totalDistance =
    session.activities?.reduce((sum, a) => sum + (a.distance || 0), 0) || 0;

  const hasWeather =
    session.weatherTemp !== null && session.weatherTemp !== undefined
      ? true
      : session.weatherHumidity !== null && session.weatherHumidity !== undefined
      ? true
      : session.weatherWindSpeed !== null && session.weatherWindSpeed !== undefined
      ? true
      : false;

  const hasStatsForActivity = (a?: Activity | null) => {
    if (!a) return false;
    return (
      a.heartRateMin !== undefined ||
      a.heartRateMax !== undefined ||
      a.heartRateAvg !== undefined ||
      a.cadence !== undefined ||
      a.power !== undefined
    );
  };

  return (
    <div className="session-details" ref={rootRef}>
      {isSingleActivitySession && firstActivity && (
        <>
          <div className="details-columns">
            <div className="left-column">
              <h3 className="column-heading">{firstActivity.sportType}</h3>
              <div className="metric-list">
                <MetricRow label="Date" value={formatDateShort(session.date)} />
                <MetricRow
                  label="Time"
                  value={totalDuration > 0 ? formatDuration(totalDuration) : undefined}
                />
                <MetricRow
                  label="Distance"
                  value={totalDistance > 0 ? totalDistance.toFixed(2) : undefined}
                  unit="km"
                />
                <MetricRow label="Pace" value={calculatePace(firstActivity) || undefined} />
              </div>
            </div>
            <div className="right-column">
              {hasWeather && (
                <>
                  <h3 className="column-heading">Weather</h3>
                  <div className="metric-list">
                    <MetricRow label="Temp" value={session.weatherTemp} unit="°C" />
                    <MetricRow label="Humidity" value={session.weatherHumidity} unit="%" />
                    <MetricRow label="Wind" value={session.weatherWindSpeed} unit="m/s" />
                  </div>
                </>
              )}
            </div>
          </div>

          {hasStatsForActivity(firstActivity) && (
            <div className="details-columns">
              <div className="left-column">
                <h3 className="column-heading">Stats</h3>
                <div className="metric-list">
                  <MetricRow label="HR Max" value={firstActivity.heartRateMax} unit="bpm" />
                  <MetricRow label="HR Min" value={firstActivity.heartRateMin} unit="bpm" />
                  <MetricRow label="HR Average" value={firstActivity.heartRateAvg} unit="bpm" />
                  <MetricRow label="Cadence" value={firstActivity.cadence} unit="rpm" />
                  <MetricRow label="Power" value={firstActivity.power} unit="watts" />
                </div>
              </div>
              <div className="right-column">
                {editingActivityId !== firstActivity.id && (
                  <div className="details-actions">
                    <button
                      className="icon-btn edit-btn"
                      title="Edit Activity"
                      onClick={() =>
                        setEditingActivityId(
                          editingActivityId === firstActivity.id ? null : firstActivity.id
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
          )}

          {editingActivityId === firstActivity.id && (
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

      {!isSingleActivitySession && (
        <>
          <div className="details-columns">
            <div className="left-column">
              <h3 className="column-heading">Multi-Sport</h3>
              <div className="metric-list">
                <MetricRow label="Date" value={formatDateShort(session.date)} />
                <MetricRow
                  label="Time"
                  value={totalDuration > 0 ? formatDuration(totalDuration) : undefined}
                />
                <MetricRow
                  label="Distance"
                  value={totalDistance > 0 ? totalDistance.toFixed(2) : undefined}
                  unit="km"
                />
              </div>
            </div>
            <div className="right-column">
              {hasWeather && (
                <>
                  <h3 className="column-heading">Weather</h3>
                  <div className="metric-list">
                    <MetricRow label="Temp" value={session.weatherTemp} unit="°C" />
                    <MetricRow label="Humidity" value={session.weatherHumidity} unit="%" />
                    <MetricRow label="Wind" value={session.weatherWindSpeed} unit="m/s" />
                  </div>
                </>
              )}
            </div>
          </div>

          {orderedItems.map((item) => {
            const isActivity = "sportType" in item;
            const isEditingThisActivity = isActivity && editingActivityId === item.id;
            const isEditingThisTransition = !isActivity && editingTransitionId === item.id;

            return (
              <div key={item.id} className="multi-row">
                <div className="details-columns">
                  <div className="left-column">
                    <h3 className="column-heading">
                      {isActivity
                        ? item.sportType
                        : `Transition: ${item.previousSport} → ${item.nextSport}`}
                    </h3>
                    {isActivity ? (
                      <div className="metric-list">
                        <MetricRow
                          label="Distance"
                          value={item.distance > 0 ? item.distance.toFixed(2) : undefined}
                          unit="km"
                        />
                        <MetricRow
                          label="Duration"
                          value={item.duration > 0 ? formatDuration(item.duration) : undefined}
                        />
                        <MetricRow label="Pace" value={calculatePace(item) || undefined} />
                        {(item.heartRateMax !== undefined ||
                          item.heartRateMin !== undefined ||
                          item.heartRateAvg !== undefined ||
                          item.cadence !== undefined ||
                          item.power !== undefined) && (
                          <>
                            <div className="metric-row section-spacer">
                              <span className="metric-label">Stats</span>
                              <span className="metric-value"></span>
                            </div>
                            <MetricRow label="HR Max" value={item.heartRateMax} unit="bpm" />
                            <MetricRow label="HR Min" value={item.heartRateMin} unit="bpm" />
                            <MetricRow label="HR Average" value={item.heartRateAvg} unit="bpm" />
                            <MetricRow label="Cadence" value={item.cadence} unit="rpm" />
                            <MetricRow label="Power" value={item.power} unit="watts" />
                          </>
                        )}
                      </div>
                    ) : (
                      <div className="metric-list">
                        <MetricRow label="Time" value={formatMMSS(item.transitionTime)} />
                        <MetricRow label="Notes" value={item.comments} />
                      </div>
                    )}
                  </div>
                  <div className="right-column">
                    {!isEditingThisActivity && !isEditingThisTransition && (
                      <div className="details-actions">
                        {isActivity ? (
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
        </>
      )}
    </div>
  );
};

export default SessionDetails;
