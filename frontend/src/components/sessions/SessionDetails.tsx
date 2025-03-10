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

const calculatePace = (activity: Activity): string | null => {
  if (activity.distance <= 0 || activity.duration <= 0) {
    return null;
  }

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
    const pacePer100m = (activity.duration / (activity.distance / 100)) || 0;
    const minutes = Math.floor(pacePer100m / 60);
    const seconds = Math.round(pacePer100m % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")} min/100m`;
  }

  return null;
};

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
      {session.weatherTemp !== null && session.weatherTemp !== undefined && (
        <p>Temp - {session.weatherTemp}°C</p>
      )}
      {session.weatherHumidity !== null && session.weatherHumidity !== undefined && (
        <p>Humidity - {session.weatherHumidity}%</p>
      )}
      {session.weatherWindSpeed !== null && session.weatherWindSpeed !== undefined && (
        <p>Wind Speed - {session.weatherWindSpeed}m/s</p>
      )}
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

                {calculatePace(item) && <p>Pace: {calculatePace(item)}</p>}

                {item.heartRateMin !== undefined && item.heartRateMin !== null && (
                  <p>HR Min: {item.heartRateMin} bpm</p>
                )}
                {item.heartRateMax !== undefined && item.heartRateMax !== null && (
                  <p>HR Max: {item.heartRateMax} bpm</p>
                )}
                {item.heartRateAvg !== undefined && item.heartRateAvg !== null && (
                  <p>Avg HR: {item.heartRateAvg} bpm</p>
                )}
                {item.cadence !== undefined && item.cadence !== null && (
                  <p>Cadence: {item.cadence} rpm</p>
                )}
                {item.power !== undefined && item.power !== null && (
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
