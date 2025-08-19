// src/components/sessions/SessionDetails.tsx
import React, { useEffect, useRef } from "react";
import { formatDuration } from "../../utils/format";
import "../../styles/sessionDetails.css";

interface Activity {
  id: string;
  sportType: string;
  duration: number;
  distance: number;
  created_at: string;
  heartRateMin?: number | null;
  heartRateMax?: number | null;
  heartRateAvg?: number | null;
  cadence?: number | null;
  power?: number | null;
}

interface SessionTransition {
  id: string;
  previousSport: string;
  nextSport: string;
  transitionTime: number;
  created_at: string;
  comments?: string | null;
}

interface Session {
  id: string;
  sessionType: string;
  date?: string;
  weatherTemp?: number | null;
  weatherHumidity?: number | null;
  weatherWindSpeed?: number | null;
  activities: Activity[];
  transitions: SessionTransition[];
}

interface SessionDetailsProps {
  session: Session;
  onUpdate: () => void;
  onEditSession: () => void;
  onDeleteSession: () => void;
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

const hasStatsValues = (a?: Activity | null) => {
  if (!a) return false;
  const vals = [a.heartRateMin, a.heartRateMax, a.heartRateAvg, a.cadence, a.power];
  return vals.some((v) => v !== undefined && v !== null);
};

const SessionDetails: React.FC<SessionDetailsProps> = ({
  session,
  onUpdate,
  onEditSession,
  onDeleteSession,
}) => {
  const rootRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = rootRef.current;
    const parentCard = el?.closest(".session-card");
    parentCard?.classList.add("details-open");
    return () => {
      parentCard?.classList.remove("details-open");
    };
  }, []);

  const orderedItems: (Activity | SessionTransition)[] = [
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

          {hasStatsValues(firstActivity) && (
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

          <div className="multi-divider"></div>

          {orderedItems.map((item) => {
            const isActivity = "sportType" in item;
            if (isActivity) {
              const a = item as Activity;

              const leftCol: { label: string; value: string }[] = [];
              const rightCol: { label: string; value: string }[] = [];

              if (a.distance > 0) leftCol.push({ label: "Distance", value: `${a.distance.toFixed(2)} km` });
              if (a.duration > 0) leftCol.push({ label: "Duration", value: `${formatDuration(a.duration)}` });
              const pace = calculatePace(a);
              if (pace) leftCol.push({ label: "Pace", value: pace });

              if (a.heartRateMax !== null && a.heartRateMax !== undefined)
                rightCol.push({ label: "HR Max", value: `${a.heartRateMax} bpm` });
              if (a.heartRateMin !== null && a.heartRateMin !== undefined)
                rightCol.push({ label: "HR Min", value: `${a.heartRateMin} bpm` });
              if (a.heartRateAvg !== null && a.heartRateAvg !== undefined)
                rightCol.push({ label: "HR Average", value: `${a.heartRateAvg} bpm` });
              if (a.cadence !== null && a.cadence !== undefined)
                rightCol.push({ label: "Cadence", value: `${a.cadence} rpm` });
              if (a.power !== null && a.power !== undefined)
                rightCol.push({ label: "Power", value: `${a.power} watts` });

              const maxRows = Math.max(leftCol.length, rightCol.length);

              return (
                <div key={a.id} className="multi-row">
                  <div className="activity-head-grid">
                    <h3 className="col-head left">{a.sportType}</h3>
                    <h3 className="col-head right">Stats</h3>
                  </div>

                  <div className="activity-table">
                    {Array.from({ length: maxRows }).map((_, i) => {
                      const L = leftCol[i];
                      const R = rightCol[i];
                      return (
                        <div className="activity-row-grid" key={i}>
                          <span className="cell label">{L ? L.label : ""}</span>
                          <span className="cell value">{L ? L.value : ""}</span>
                          <span className="cell label">{R ? R.label : ""}</span>
                          <span className="cell value">{R ? R.value : ""}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            } else {
              const t = item as SessionTransition;
              return (
                <div key={t.id} className="multi-row">
                  <div className="details-columns">
                    <div className="left-column">
                      <h3 className="column-heading">
                        Transition: {t.previousSport} → {t.nextSport}
                      </h3>
                      <div className="metric-list">
                        <MetricRow label="Time" value={formatMMSS(t.transitionTime)} />
                        <MetricRow label="Notes" value={t.comments ?? undefined} />
                      </div>
                    </div>
                    <div className="right-column"></div>
                  </div>
                </div>
              );
            }
          })}
        </>
      )}

      <div className="details-actions session-actions" onClick={(e) => e.stopPropagation()}>
        <button className="icon-btn edit-btn" title="Edit Session" onClick={onEditSession}>
          ✏️
        </button>
        <button className="icon-btn delete-btn" title="Delete Session" onClick={onDeleteSession}>
          🗑
        </button>
      </div>
    </div>
  );
};

export default SessionDetails;
