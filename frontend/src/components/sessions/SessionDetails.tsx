import React from "react";
import { formatDuration } from "../../utils/format";
import { getNextActivity } from "../../utils/sessionHelpers";

interface Activity {
  id: string;
  sportType: string;
  duration: number;
  distance: number;
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
  comments?: string;
}

interface Session {
  weatherTemp?: number | null;
  weatherHumidity?: number | null;
  weatherWindSpeed?: number | null;
  activities: Activity[];
  transitions: Transition[];
}

interface SessionDetailsProps {
  session: Session;
}

const SessionDetails: React.FC<SessionDetailsProps> = ({ session }) => {
  let orderedItems: (Activity | Transition)[] = [];
  let remainingTransitions = [...session.transitions];

  let currentActivity: Activity | undefined =
    session.activities.length > 0 ? session.activities[0] : undefined;

  while (currentActivity) {
    orderedItems.push(currentActivity);

    const { transition, nextActivity } = getNextActivity(
      currentActivity,
      session,
      remainingTransitions
    );

    if (transition) {
      orderedItems.push(transition);
    }

    currentActivity = nextActivity;
  }

  return (
    <div className="session-details">
      <p>Temp - {session.weatherTemp ?? "N/A"}°C</p>
      <p>Humidity - {session.weatherHumidity ?? "N/A"}%</p>
      <p>Wind Speed - {session.weatherWindSpeed ?? "N/A"}m/s</p>

      <h3>Session Timeline</h3>
      <ul>
        {orderedItems.map((item) => {
          if ("sportType" in item) {
            return (
              <li key={item.id}>
                <p>
                  <strong>{item.sportType}</strong>
                </p>
                <p>
                  Distance:{" "}
                  {item.sportType === "Swim"
                    ? `${(item.distance * 1000).toFixed(0)} m`
                    : `${item.distance.toFixed(2)} km`}
                </p>
                <p>Duration: {formatDuration(item.duration)}</p>

                {item.heartRateMin !== undefined && (
                  <p>HR Min: {item.heartRateMin} bpm</p>
                )}
                {item.heartRateMax !== undefined && (
                  <p>HR Max: {item.heartRateMax} bpm</p>
                )}
                {item.heartRateAvg !== undefined && (
                  <p>Avg HR: {item.heartRateAvg} bpm</p>
                )}
                {item.cadence !== undefined && (
                  <p>Cadence: {item.cadence} rpm</p>
                )}
                {item.power !== undefined && (
                  <p>Power: {item.power} watts</p>
                )}
              </li>
            );
          } else {
            return (
              <li key={item.id} className="transition">
                <p>
                  <strong>
                    Transition: {item.previousSport} → {item.nextSport}
                  </strong>
                </p>
                <p>Transition Time: {formatDuration(item.transitionTime)}</p>
                {item.comments && <p>Notes: {item.comments}</p>}
              </li>
            );
          }
        })}
      </ul>
    </div>
  );
};

export default SessionDetails;
