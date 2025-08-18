import React, { useMemo, useState } from "react";
import { useMutation } from "@apollo/client";
import {
  UPDATE_SESSION,
  UPDATE_SESSION_ACTIVITY,
  ADD_SESSION_ACTIVITY,
  DELETE_ACTIVITY_MUTATION,
  UPDATE_TRANSITION_MUTATION,
  ADD_SESSION_TRANSITION,
  DELETE_TRANSITION_MUTATION,
} from "../../graphql/mutations";
import { GET_SESSIONS } from "../../graphql/queries";
import "../../styles/editWholeSession.css";

interface Activity {
  id?: string;
  sportType: string;
  duration: number;
  distance: number;
  heartRateMin?: number | null;
  heartRateMax?: number | null;
  heartRateAvg?: number | null;
  cadence?: number | null;
  power?: number | null;
}

interface Transition {
  id?: string;
  previousSport: string;
  nextSport: string;
  transitionTime: number;
  comments?: string | null;
}

interface Session {
  id: string;
  sessionType: string;
  date: string;
  weatherTemp?: number | null;
  weatherHumidity?: number | null;
  weatherWindSpeed?: number | null;
  activities: Activity[];
  transitions: Transition[];
}

interface EditWholeSessionProps {
  session: Session;
  onClose: () => void;
  onUpdate: () => void;
}

const toHMS = (totalSeconds: number) => {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  return { h: String(h), m: String(m), s: String(s) };
};

const toMS = (totalSeconds: number) => {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return { m: String(m), s: String(s) };
};

const fromHMS = (h: string, m: string, s: string) =>
  (h.trim() === "" ? 0 : parseInt(h, 10) * 3600) +
  (m.trim() === "" ? 0 : parseInt(m, 10) * 60) +
  (s.trim() === "" ? 0 : parseInt(s, 10));

const fromMS = (m: string, s: string) =>
  (m.trim() === "" ? 0 : parseInt(m, 10) * 60) + (s.trim() === "" ? 0 : parseInt(s, 10));

const parseMaybeNumber = (v: string) => {
  if (v.trim() === "") return null;
  const n = Number(v);
  return isNaN(n) ? null : n;
};

const EditWholeSession: React.FC<EditWholeSessionProps> = ({ session, onClose, onUpdate }) => {
  const [sessionType, setSessionType] = useState(session.sessionType);
  const [date, setDate] = useState(session.date.split("T")[0] || session.date);
  const [weatherTemp, setWeatherTemp] = useState(
    session.weatherTemp === null || session.weatherTemp === undefined ? "" : String(session.weatherTemp)
  );
  const [weatherHumidity, setWeatherHumidity] = useState(
    session.weatherHumidity === null || session.weatherHumidity === undefined ? "" : String(session.weatherHumidity)
  );
  const [weatherWindSpeed, setWeatherWindSpeed] = useState(
    session.weatherWindSpeed === null || session.weatherWindSpeed === undefined ? "" : String(session.weatherWindSpeed)
  );

  const [activities, setActivities] = useState(
    session.activities.map((a) => {
      const { h, m, s } = toHMS(a.duration || 0);
      return {
        id: a.id,
        sportType: a.sportType,
        hours: h,
        minutes: m,
        seconds: s,
        distance: a.sportType === "Swim" ? String((a.distance || 0) * 1000) : String(a.distance || 0),
        heartRateMin: a.heartRateMin === null || a.heartRateMin === undefined ? "" : String(a.heartRateMin),
        heartRateMax: a.heartRateMax === null || a.heartRateMax === undefined ? "" : String(a.heartRateMax),
        heartRateAvg: a.heartRateAvg === null || a.heartRateAvg === undefined ? "" : String(a.heartRateAvg),
        cadence: a.cadence === null || a.cadence === undefined ? "" : String(a.cadence),
        power: a.power === null || a.power === undefined ? "" : String(a.power),
      };
    })
  );

  const [transitions, setTransitions] = useState(
    session.transitions.map((t) => {
      const { m, s } = toMS(t.transitionTime || 0);
      return {
        id: t.id,
        previousSport: t.previousSport,
        nextSport: t.nextSport,
        minutes: m,
        seconds: s,
        comments: t.comments || "",
      };
    })
  );

  const isMultiSport = sessionType === "Multi-Sport";

  const totalDuration = useMemo(() => {
    const act = activities.reduce((sum, a) => sum + fromHMS(a.hours, a.minutes, a.seconds), 0);
    const trans = transitions.reduce((sum, t) => sum + fromMS(t.minutes, t.seconds), 0);
    return act + (isMultiSport ? trans : 0);
  }, [activities, transitions, isMultiSport]);

  const totalDistance = useMemo(() => {
    return activities.reduce((sum, a) => {
      const d = Number(a.distance);
      if (isNaN(d)) return sum;
      if (a.sportType === "Swim") return sum + d / 1000;
      return sum + d;
    }, 0);
  }, [activities]);

  const [updateSession] = useMutation(UPDATE_SESSION, { refetchQueries: [{ query: GET_SESSIONS }] });
  const [updateActivity] = useMutation(UPDATE_SESSION_ACTIVITY);
  const [addActivity] = useMutation(ADD_SESSION_ACTIVITY);
  const [deleteActivity] = useMutation(DELETE_ACTIVITY_MUTATION);

  const [updateTransition] = useMutation(UPDATE_TRANSITION_MUTATION);
  const [addTransition] = useMutation(ADD_SESSION_TRANSITION);
  const [deleteTransition] = useMutation(DELETE_TRANSITION_MUTATION);

  const handleActivityChange = (idx: number, field: string, value: string) => {
    setActivities((prev) => {
      const copy = [...prev];
      if (field === "sportType") {
        const wasSwim = copy[idx].sportType === "Swim";
        const willBeSwim = value === "Swim";
        if (wasSwim !== willBeSwim) {
          const current = Number(copy[idx].distance);
          if (!isNaN(current)) {
            copy[idx].distance = wasSwim ? String(current / 1000) : String(current * 1000);
          }
        }
      }
      (copy[idx] as any)[field] = value;
      return copy;
    });
  };

  const addActivityRow = () => {
    if (!isMultiSport && activities.length >= 1) return;
    setActivities((prev) => [
      ...prev,
      {
        id: undefined,
        sportType: "Run",
        hours: "0",
        minutes: "0",
        seconds: "0",
        distance: "0",
        heartRateMin: "",
        heartRateMax: "",
        heartRateAvg: "",
        cadence: "",
        power: "",
      },
    ]);
  };

  const removeActivityRow = (idx: number) => {
    if (!isMultiSport && activities.length <= 1) return;
    setActivities((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleTransitionChange = (idx: number, field: string, value: string) => {
    setTransitions((prev) => {
      const copy = [...prev];
      (copy[idx] as any)[field] = value;
      return copy;
    });
  };

  const addTransitionRow = () => {
    if (!isMultiSport) return;
    setTransitions((prev) => [
      ...prev,
      { id: undefined, previousSport: "Swim", nextSport: "Bike", minutes: "0", seconds: "0", comments: "" },
    ]);
  };

  const removeTransitionRow = (idx: number) => {
    if (!isMultiSport) return;
    setTransitions((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSave = async () => {
    const sessionInput = {
      sessionType,
      date,
      totalDuration,
      totalDistance,
      weatherTemp: parseMaybeNumber(weatherTemp),
      weatherHumidity: weatherHumidity.trim() === "" ? null : parseInt(weatherHumidity, 10),
      weatherWindSpeed: parseMaybeNumber(weatherWindSpeed),
    };

    await updateSession({ variables: { id: session.id, input: sessionInput } });

    const originalActivityIds = new Set((session.activities || []).map((a) => a.id));
    const currentActivityIds = new Set(activities.map((a) => a.id).filter(Boolean) as string[]);
    const toDeleteActivities = Array.from(originalActivityIds).filter((id) => !currentActivityIds.has(id as string));

    const originalTransitionIds = new Set((session.transitions || []).map((t) => t.id));
    const currentTransitionIds = new Set(transitions.map((t) => t.id).filter(Boolean) as string[]);
    const toDeleteTransitions = Array.from(originalTransitionIds).filter((id) => !currentTransitionIds.has(id as string));

    const activityOps: Promise<any>[] = [];
    activities.forEach((a) => {
      const duration = fromHMS(a.hours, a.minutes, a.seconds);
      const distance =
        a.sportType === "Swim"
          ? (Number(a.distance) || 0) / 1000
          : Number(a.distance) || 0;
      const input = {
        sportType: a.sportType,
        duration,
        distance,
        heartRateMin: a.heartRateMin === "" ? null : parseInt(a.heartRateMin as any, 10),
        heartRateMax: a.heartRateMax === "" ? null : parseInt(a.heartRateMax as any, 10),
        heartRateAvg: a.heartRateAvg === "" ? null : parseInt(a.heartRateAvg as any, 10),
        cadence: a.cadence === "" ? null : parseInt(a.cadence as any, 10),
        power: a.power === "" ? null : parseInt(a.power as any, 10),
      };
      if (a.id) {
        activityOps.push(updateActivity({ variables: { id: a.id, input } }));
      } else {
        activityOps.push(addActivity({ variables: { sessionId: session.id, ...input } }));
      }
    });
    toDeleteActivities.forEach((id) => {
      activityOps.push(deleteActivity({ variables: { id } }));
    });

    const transitionOps: Promise<any>[] = [];
    if (isMultiSport) {
      transitions.forEach((t) => {
        const input = {
          previousSport: t.previousSport,
          nextSport: t.nextSport,
          transitionTime: fromMS(t.minutes, t.seconds),
          comments: (t.comments || "").trim(),
        };
        if (t.id) {
          transitionOps.push(updateTransition({ variables: { id: t.id, input } }));
        } else {
          transitionOps.push(addTransition({ variables: { sessionId: session.id, ...input } }));
        }
      });
      toDeleteTransitions.forEach((id) => {
        transitionOps.push(deleteTransition({ variables: { id } }));
      });
    } else {
      toDeleteTransitions.forEach((id) => {
        transitionOps.push(deleteTransition({ variables: { id } }));
      });
    }

    await Promise.all([...activityOps, ...transitionOps]);

    onUpdate();
    onClose();
  };

  return (
    <div className="edit-session-wrapper" onClick={(e) => e.stopPropagation()}>
      <div className="dw-grid">
        <div className="dw-col">
          <h3 className="section-title">Details</h3>
          <div className="field-row">
            <label>Session Type</label>
            <select
              className="control"
              value={sessionType}
              onChange={(e) => setSessionType(e.target.value)}
            >
              <option value="Swim">Swim</option>
              <option value="Bike">Bike</option>
              <option value="Run">Run</option>
              <option value="Multi-Sport">Multi-Sport</option>
            </select>
          </div>
          <div className="field-row">
            <label>Date</label>
            <input
              type="date"
              className="control"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
        </div>

        <div className="dw-col">
          <h3 className="section-title">Weather</h3>
          <div className="field-row">
            <label>Temp (°C)</label>
            <input
              type="number"
              className="control"
              value={weatherTemp}
              onChange={(e) => setWeatherTemp(e.target.value)}
            />
          </div>
          <div className="field-row">
            <label>Humidity (%)</label>
            <input
              type="number"
              className="control"
              value={weatherHumidity}
              onChange={(e) => setWeatherHumidity(e.target.value)}
            />
          </div>
          <div className="field-row">
            <label>Wind (m/s)</label>
            <input
              type="number"
              className="control"
              value={weatherWindSpeed}
              onChange={(e) => setWeatherWindSpeed(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="block">
        <h3 className="section-title">Activities</h3>
        {activities.map((a, idx) => (
          <div key={idx} className="activity-card">
            <div className="grid two">
              <div className="field-row left-col">
                <label>Sport</label>
                <select
                  className="control"
                  value={a.sportType}
                  onChange={(e) => handleActivityChange(idx, "sportType", e.target.value)}
                >
                  <option value="Swim">Swim</option>
                  <option value="Bike">Bike</option>
                  <option value="Run">Run</option>
                </select>
              </div>
              <div className="field-row">
                <label>Distance ({a.sportType === "Swim" ? "m" : "km"})</label>
                <input
                  type="number"
                  className="control"
                  value={a.distance}
                  onChange={(e) => handleActivityChange(idx, "distance", e.target.value)}
                />
              </div>
            </div>

            <div className="field-row">
              <label>Time</label>
              <div className="time-inputs">
                <div className="time-box">
                  <input
                    type="number"
                    className="control"
                    placeholder="hh"
                    value={a.hours}
                    onChange={(e) => handleActivityChange(idx, "hours", e.target.value)}
                  />
                  <span className="unit">Hrs</span>
                </div>
                <div className="time-box">
                  <input
                    type="number"
                    className="control"
                    placeholder="mm"
                    value={a.minutes}
                    onChange={(e) => handleActivityChange(idx, "minutes", e.target.value)}
                  />
                  <span className="unit">Min</span>
                </div>
                <div className="time-box">
                  <input
                    type="number"
                    className="control"
                    placeholder="ss"
                    value={a.seconds}
                    onChange={(e) => handleActivityChange(idx, "seconds", e.target.value)}
                  />
                  <span className="unit">Sec</span>
                </div>
              </div>
            </div>

            <div className="stats-pairs">
              <div className="pair">
                <div className="field-row left-col">
                  <label>HR Min</label>
                  <input
                    type="number"
                    className="control"
                    value={a.heartRateMin}
                    onChange={(e) => handleActivityChange(idx, "heartRateMin", e.target.value)}
                  />
                </div>
                <div className="field-row">
                  <label>Cadence</label>
                  <input
                    type="number"
                    className="control"
                    value={a.cadence}
                    onChange={(e) => handleActivityChange(idx, "cadence", e.target.value)}
                  />
                </div>
              </div>
              <div className="pair">
                <div className="field-row left-col">
                  <label>HR Avg</label>
                  <input
                    type="number"
                    className="control"
                    value={a.heartRateAvg}
                    onChange={(e) => handleActivityChange(idx, "heartRateAvg", e.target.value)}
                  />
                </div>
                <div className="field-row">
                  <label>Power</label>
                  <input
                    type="number"
                    className="control"
                    value={a.power}
                    onChange={(e) => handleActivityChange(idx, "power", e.target.value)}
                  />
                </div>
              </div>
              <div className="pair">
                <div className="field-row left-col">
                  <label>HR Max</label>
                  <input
                    type="number"
                    className="control"
                    value={a.heartRateMax}
                    onChange={(e) => handleActivityChange(idx, "heartRateMax", e.target.value)}
                  />
                </div>
                <div className="field-row empty-cell"></div>
              </div>
            </div>

            {isMultiSport && (
              <div className="row-actions">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => removeActivityRow(idx)}
                >
                  Remove Activity
                </button>
              </div>
            )}
          </div>
        ))}
        {isMultiSport && (
          <div className="block-actions">
            <button
              type="button"
              className="btn-primary"
              onClick={addActivityRow}
            >
              Add Activity
            </button>
          </div>
        )}
      </div>

      {isMultiSport && (
        <div className="block">
          <h3 className="section-title">Transitions</h3>
          {transitions.map((t, idx) => (
            <div key={idx} className="transition-card">
              <div className="grid two">
                <div className="field-row left-col">
                  <label>Previous Sport</label>
                  <select
                    className="control"
                    value={t.previousSport}
                    onChange={(e) => handleTransitionChange(idx, "previousSport", e.target.value)}
                  >
                    <option value="Swim">Swim</option>
                    <option value="Bike">Bike</option>
                    <option value="Run">Run</option>
                  </select>
                </div>
                <div className="field-row">
                  <label>Next Sport</label>
                  <select
                    className="control"
                    value={t.nextSport}
                    onChange={(e) => handleTransitionChange(idx, "nextSport", e.target.value)}
                  >
                    <option value="Swim">Swim</option>
                    <option value="Bike">Bike</option>
                    <option value="Run">Run</option>
                  </select>
                </div>
              </div>

              <div className="grid two">
                <div className="field-row left-col">
                  <label>Minutes</label>
                  <input
                    type="number"
                    className="control"
                    value={t.minutes}
                    onChange={(e) => handleTransitionChange(idx, "minutes", e.target.value)}
                  />
                </div>
                <div className="field-row">
                  <label>Seconds</label>
                  <input
                    type="number"
                    className="control"
                    value={t.seconds}
                    onChange={(e) => handleTransitionChange(idx, "seconds", e.target.value)}
                  />
                </div>
              </div>

              <div className="field-row">
                <label>Comments</label>
                <textarea
                  className="control"
                  value={t.comments}
                  onChange={(e) => handleTransitionChange(idx, "comments", e.target.value)}
                />
              </div>

              <div className="row-actions">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => removeTransitionRow(idx)}
                >
                  Remove Transition
                </button>
              </div>
            </div>
          ))}
          <div className="block-actions">
            <button type="button" className="btn-primary" onClick={addTransitionRow}>
              Add Transition
            </button>
          </div>
        </div>
      )}

      <div className="footer-actions">
        <button type="button" className="btn-primary" onClick={handleSave}>
          Save
        </button>
        <button type="button" className="btn-secondary" onClick={onClose}>
          Cancel
        </button>
      </div>
    </div>
  );
};

export default EditWholeSession;
